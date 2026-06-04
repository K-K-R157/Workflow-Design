import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addNode, removeNode, addEdge as addEdgeAction, setSelectedNode,
  updateNodeConfig, selectNodes, selectEdges, selectSelectedNode,
  duplicateNode, clearWorkflow, setValidation,
} from '../stores/workflowSlice';
import {
  startExecution, pauseExecution, resumeExecution,
  stepForward, resetExecution, selectExecutionStatus,
  selectRunId, setRunId, addLogEntry,
} from '../stores/executionSlice';
import { getToolById } from '../data/mcpTools';
import { validateConnection, validateWorkflow, getExecutionOrder } from '../services/validator';
import {
  apiStartRun, apiStepRun, apiPauseRun, apiResetRun,
} from '../services/api';

let nodeIdCounter = 0;

export function useWorkflow() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const selectedNode = useSelector(selectSelectedNode);
  const executionStatus = useSelector(selectExecutionStatus);
  const runId = useSelector(selectRunId);
  const workflowId = useSelector((state) => state.workflow.workflowId);

  // Track if an API call is in flight to avoid double-clicks
  const apiInFlight = useRef(false);

  /**
   * Handle dropping a tool from the sidebar onto the canvas.
   */
  const handleDrop = useCallback((toolId, position) => {
    const toolData = getToolById(toolId);
    if (!toolData) return;

    nodeIdCounter++;
    const nodeId = `node-${Date.now()}-${nodeIdCounter}`;

    const newNode = {
      id: nodeId,
      type: 'custom',
      position,
      data: {
        label: toolData.name,
        toolId: toolData.id,
        config: toolData.configFields.reduce((acc, field) => {
          acc[field.key] = field.default;
          return acc;
        }, {}),
      },
    };

    dispatch(addNode(newNode));
    dispatch(setSelectedNode(nodeId));

    return nodeId;
  }, [dispatch]);

  /**
   * Handle creating a connection between two nodes with validation.
   */
  const handleConnect = useCallback((connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return { valid: false, errors: ['Node not found'] };

    const validation = validateConnection(
      sourceNode, targetNode,
      connection.sourceHandle, connection.targetHandle,
      edges
    );

    if (validation.valid) {
      const edgeId = `edge-${connection.source}-${connection.target}-${Date.now()}`;
      dispatch(addEdgeAction({
        id: edgeId,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      }));
    }

    return validation;
  }, [nodes, edges, dispatch]);

  /**
   * Delete the selected node.
   */
  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      dispatch(removeNode(selectedNode.id));
    }
  }, [selectedNode, dispatch]);

  /**
   * Duplicate the selected node.
   */
  const handleDuplicateSelected = useCallback(() => {
    if (selectedNode) {
      dispatch(duplicateNode(selectedNode.id));
    }
  }, [selectedNode, dispatch]);

  /**
   * Validate the entire workflow.
   */
  const runValidation = useCallback(() => {
    const result = validateWorkflow(nodes, edges);
    dispatch(setValidation({ errors: result.errors, warnings: result.warnings }));
    return result;
  }, [nodes, edges, dispatch]);

  /**
   * Start workflow execution via backend API.
   * Falls back to local execution if no workflowId is saved.
   */
  const handleRun = useCallback(async () => {
    if (apiInFlight.current) return;

    if (executionStatus === 'idle' || executionStatus === 'complete' || executionStatus === 'error') {
      const order = getExecutionOrder(nodes, edges);
      if (order.length === 0) return;

      // If workflow is saved to backend, use backend execution
      if (workflowId) {
        apiInFlight.current = true;
        try {
          const data = await apiStartRun(workflowId);
          dispatch(startExecution({
            executionOrder: data.data.executionOrder,
            runId: data.data.runId,
          }));
          dispatch(addLogEntry({
            nodeId: null,
            message: `Backend run started: ${data.data.runId}`,
            level: 'info',
          }));
        } catch (err) {
          console.error('Failed to start run:', err);
          dispatch(addLogEntry({
            nodeId: null,
            message: `Failed to start: ${err.message}`,
            level: 'error',
          }));
          // Fallback to local execution
          dispatch(startExecution({ executionOrder: order }));
        } finally {
          apiInFlight.current = false;
        }
      } else {
        // Local-only execution (workflow not saved)
        dispatch(startExecution({ executionOrder: order }));
      }
    } else if (executionStatus === 'paused') {
      dispatch(resumeExecution());
    }
  }, [executionStatus, nodes, edges, workflowId, dispatch]);

  /**
   * Pause execution via backend API.
   */
  const handlePause = useCallback(async () => {
    if (apiInFlight.current) return;

    if (runId) {
      apiInFlight.current = true;
      try {
        await apiPauseRun(runId);
      } catch (err) {
        console.error('Failed to pause run:', err);
      } finally {
        apiInFlight.current = false;
      }
    }
    dispatch(pauseExecution());
  }, [runId, dispatch]);

  /**
   * Step forward one node via backend API.
   */
  const handleStep = useCallback(async () => {
    if (apiInFlight.current) return;

    if (executionStatus === 'idle' || executionStatus === 'complete' || executionStatus === 'error') {
      const order = getExecutionOrder(nodes, edges);
      if (order.length === 0) return;

      if (workflowId) {
        apiInFlight.current = true;
        try {
          const data = await apiStartRun(workflowId);
          dispatch(startExecution({
            executionOrder: data.data.executionOrder,
            runId: data.data.runId,
          }));
        } catch (err) {
          console.error('Failed to start run for step:', err);
          dispatch(startExecution({ executionOrder: order }));
        } finally {
          apiInFlight.current = false;
        }
      } else {
        dispatch(startExecution({ executionOrder: order }));
      }
    } else if (runId) {
      apiInFlight.current = true;
      try {
        await apiStepRun(runId);
        // Socket events will update Redux via useSocket
      } catch (err) {
        console.error('Failed to step run:', err);
        // Fallback: local step
        dispatch(stepForward());
      } finally {
        apiInFlight.current = false;
      }
    } else {
      dispatch(stepForward());
    }
  }, [executionStatus, nodes, edges, workflowId, runId, dispatch]);

  /**
   * Reset execution via backend API.
   */
  const handleReset = useCallback(async () => {
    if (runId) {
      try {
        await apiResetRun(runId);
      } catch (err) {
        console.error('Failed to reset run:', err);
      }
    }
    dispatch(resetExecution());
  }, [runId, dispatch]);

  const handleClear = useCallback(() => {
    dispatch(clearWorkflow());
    dispatch(resetExecution());
  }, [dispatch]);

  return {
    handleDrop,
    handleConnect,
    handleDeleteSelected,
    handleDuplicateSelected,
    runValidation,
    handleRun,
    handlePause,
    handleStep,
    handleReset,
    handleClear,
  };
}
