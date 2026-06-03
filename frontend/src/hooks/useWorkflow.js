import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addNode, removeNode, addEdge as addEdgeAction, setSelectedNode,
  updateNodeConfig, selectNodes, selectEdges, selectSelectedNode,
  duplicateNode, clearWorkflow, setValidation,
} from '../stores/workflowSlice';
import {
  startExecution, pauseExecution, resumeExecution,
  stepForward, resetExecution, selectExecutionStatus,
} from '../stores/executionSlice';
import { getToolById } from '../data/mcpTools';
import { validateConnection, validateWorkflow, getExecutionOrder } from '../services/validator';

let nodeIdCounter = 0;

export function useWorkflow() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const selectedNode = useSelector(selectSelectedNode);
  const executionStatus = useSelector(selectExecutionStatus);

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
   * Start or step through execution.
   */
  const handleRun = useCallback(() => {
    if (executionStatus === 'idle' || executionStatus === 'complete' || executionStatus === 'error') {
      const order = getExecutionOrder(nodes, edges);
      if (order.length > 0) {
        dispatch(startExecution({ executionOrder: order }));
      }
    } else if (executionStatus === 'paused') {
      dispatch(resumeExecution());
    }
  }, [executionStatus, nodes, edges, dispatch]);

  const handlePause = useCallback(() => {
    dispatch(pauseExecution());
  }, [dispatch]);

  const handleStep = useCallback(() => {
    if (executionStatus === 'idle' || executionStatus === 'complete' || executionStatus === 'error') {
      // Start execution in paused mode then step once
      const order = getExecutionOrder(nodes, edges);
      if (order.length > 0) {
        dispatch(startExecution({ executionOrder: order }));
      }
    } else {
      dispatch(stepForward());
    }
  }, [executionStatus, nodes, edges, dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetExecution());
  }, [dispatch]);

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
