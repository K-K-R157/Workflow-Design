import Run from '../models/Run.js';
import socketManager from './SocketManager.js';

// ─── Import Handlers ───
import webSearchHandler from '../handlers/webSearchHandler.js';
import summarizeHandler from '../handlers/summarizeHandler.js';
import codeRunHandler from '../handlers/codeRunHandler.js';
import emailHandler from '../handlers/emailHandler.js';

/**
 * Handler registry — maps tool IDs to their execution functions.
 * Each handler receives ({ inputs, config, nodeId }) and returns { outputs, duration }.
 */
const handlerRegistry = {
  'llm-call': summarizeHandler,
  'web-search': webSearchHandler,
  'code-executor': codeRunHandler,
  'email-sender': emailHandler,
  // Default handler for tools without specific implementations
};

/**
 * Default stub handler for tools without a specific handler implementation.
 */
async function defaultHandler({ inputs, config, nodeId }) {
  const startTime = Date.now();
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));
  return {
    outputs: {
      result: `Processed by node ${nodeId}`,
      input_received: inputs,
      config_used: config,
    },
    duration: Date.now() - startTime,
  };
}

/**
 * ExecutionEngine — Orchestrates workflow execution.
 * - Topological sort (Kahn's algorithm)
 * - Step-by-step node execution with handler dispatch
 * - Pause/resume/reset logic
 * - State persistence to MongoDB Run document
 * - Real-time events via SocketManager
 */
class ExecutionEngine {
  /**
   * Topological sort using Kahn's algorithm.
   * @param {Array} nodes
   * @param {Array} edges
   * @returns {string[]} Node IDs in execution order
   */
  static topologicalSort(nodes, edges) {
    const inDegree = {};
    const adj = {};

    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    (edges || []).forEach((e) => {
      if (adj[e.source] && inDegree[e.target] !== undefined) {
        adj[e.source].push(e.target);
        inDegree[e.target]++;
      }
    });

    // Start with nodes that have no incoming edges
    const queue = [];
    for (const nodeId of Object.keys(inDegree)) {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    }

    const order = [];
    while (queue.length > 0) {
      const current = queue.shift();
      order.push(current);

      for (const neighbor of adj[current] || []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    // If order doesn't include all nodes, there's a cycle
    if (order.length !== nodes.length) {
      console.warn('⚠️  Topological sort incomplete — possible cycle detected');
    }

    return order;
  }

  /**
   * Start a new execution run.
   * @param {Object} run - The Run mongoose document
   * @param {Object} workflow - The Workflow document
   * @param {string} userId - User ID for socket events
   */
  static async start(run, workflow, userId) {
    const executionOrder = ExecutionEngine.topologicalSort(
      workflow.nodes,
      workflow.edges
    );

    // Initialize run state
    run.executionOrder = executionOrder;
    run.currentStepIndex = 0;
    run.status = 'running';
    run.startedAt = new Date();
    run.error = null;
    run.executionLog = [];
    run.nodeStatuses = new Map();
    run.nodeOutputs = new Map();

    // Set all nodes to idle
    executionOrder.forEach((nodeId) => {
      run.nodeStatuses.set(nodeId, 'idle');
    });

    // Set first node to running
    if (executionOrder.length > 0) {
      run.nodeStatuses.set(executionOrder[0], 'running');
    }

    // Add log entry
    run.executionLog.push({
      timestamp: new Date(),
      nodeId: null,
      message: `Execution started with ${executionOrder.length} steps.`,
      level: 'info',
    });

    await run.save();

    // Emit socket event
    socketManager.emitRunStarted(userId, {
      runId: run._id,
      workflowId: workflow._id,
      executionOrder,
      status: 'running',
    });

    return run;
  }

  /**
   * Execute the current step and advance.
   * @param {Object} run - The Run document
   * @param {Object} workflow - The Workflow document
   * @param {string} userId - User ID for socket events
   */
  static async step(run, workflow, userId) {
    if (run.status === 'completed' || run.status === 'failed') {
      throw new Error('Run is already finished.');
    }

    const { executionOrder, currentStepIndex } = run;

    if (currentStepIndex >= executionOrder.length) {
      // Already completed
      run.status = 'completed';
      run.completedAt = new Date();
      await run.save();
      return run;
    }

    const currentNodeId = executionOrder[currentStepIndex];
    const node = workflow.nodes.find((n) => n.id === currentNodeId);

    if (!node) {
      throw new Error(`Node ${currentNodeId} not found in workflow.`);
    }

    // Mark node as running
    run.nodeStatuses.set(currentNodeId, 'running');
    await run.save();

    socketManager.emitNodeStart(userId, {
      runId: run._id,
      nodeId: currentNodeId,
      stepIndex: currentStepIndex,
    });

    try {
      // ─── Gather inputs from upstream nodes ───
      const inputs = {};
      const incomingEdges = (workflow.edges || []).filter(
        (e) => e.target === currentNodeId
      );

      for (const edge of incomingEdges) {
        const sourceOutputs = run.nodeOutputs.get(edge.source);
        if (sourceOutputs && edge.sourceHandle) {
          const targetHandle = edge.targetHandle || edge.sourceHandle;
          inputs[targetHandle] = sourceOutputs[edge.sourceHandle];
        }
      }

      // ─── Execute handler ───
      const handler = handlerRegistry[node.data.toolId] || defaultHandler;
      const startTime = Date.now();

      const result = await handler({
        inputs,
        config: node.data.config || {},
        nodeId: currentNodeId,
      });

      const duration = result.duration || Date.now() - startTime;

      // ─── Record success ───
      run.nodeStatuses.set(currentNodeId, 'success');
      run.nodeOutputs.set(currentNodeId, result.outputs || {});

      run.executionLog.push({
        timestamp: new Date(),
        nodeId: currentNodeId,
        message: `Node completed successfully in ${duration}ms.`,
        level: 'success',
      });

      // Save snapshot
      run.snapshots.push({
        stepIndex: currentStepIndex,
        state: {
          nodeStatuses: Object.fromEntries(run.nodeStatuses),
          nodeOutputs: Object.fromEntries(run.nodeOutputs),
        },
        timestamp: new Date(),
      });

      socketManager.emitNodeDone(userId, {
        runId: run._id,
        nodeId: currentNodeId,
        outputs: result.outputs,
        duration,
      });

      // ─── Advance to next step ───
      run.currentStepIndex++;

      if (run.currentStepIndex >= executionOrder.length) {
        // Execution complete
        run.status = 'completed';
        run.completedAt = new Date();
        run.executionLog.push({
          timestamp: new Date(),
          nodeId: null,
          message: `Execution completed.`,
          level: 'success',
        });

        socketManager.emitRunComplete(userId, {
          runId: run._id,
          duration: Date.now() - run.startedAt.getTime(),
        });
      } else {
        // Set next node to running
        const nextNodeId = executionOrder[run.currentStepIndex];
        run.nodeStatuses.set(nextNodeId, 'running');

        run.executionLog.push({
          timestamp: new Date(),
          nodeId: nextNodeId,
          message: 'Starting execution...',
          level: 'info',
        });
      }

      await run.save();
      return run;
    } catch (error) {
      // ─── Record failure ───
      run.nodeStatuses.set(currentNodeId, 'error');
      run.status = 'failed';
      run.error = error.message;
      run.completedAt = new Date();

      run.executionLog.push({
        timestamp: new Date(),
        nodeId: currentNodeId,
        message: `Error: ${error.message}`,
        level: 'error',
      });

      await run.save();

      socketManager.emitNodeError(userId, {
        runId: run._id,
        nodeId: currentNodeId,
        error: error.message,
      });

      socketManager.emitRunError(userId, {
        runId: run._id,
        error: error.message,
      });

      return run;
    }
  }

  /**
   * Pause a running execution.
   */
  static async pause(run, userId) {
    if (run.status !== 'running') {
      throw new Error('Run is not currently running.');
    }

    run.status = 'paused';
    run.executionLog.push({
      timestamp: new Date(),
      nodeId: null,
      message: 'Execution paused.',
      level: 'info',
    });

    await run.save();

    socketManager.emitRunPaused(userId, { runId: run._id });

    return run;
  }

  /**
   * Reset a run to initial state.
   */
  static async reset(run, userId) {
    run.status = 'pending';
    run.currentStepIndex = 0;
    run.nodeStatuses = new Map();
    run.nodeOutputs = new Map();
    run.executionLog = [];
    run.snapshots = [];
    run.startedAt = null;
    run.completedAt = null;
    run.error = null;

    await run.save();

    socketManager.emitToUser(userId, 'run:reset', { runId: run._id });

    return run;
  }
}

export default ExecutionEngine;
