import { createSlice, createSelector } from '@reduxjs/toolkit';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

const initialState = {
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: 'Untitled Workflow',
  selectedNodeId: null,
  isDirty: false,
  validationErrors: [],
  validationWarnings: [],
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    // ─── Node Operations ───
    addNode(state, action) {
      state.nodes.push(action.payload);
      state.isDirty = true;
    },
    updateNode(state, action) {
      const { id, data } = action.payload;
      const node = state.nodes.find(n => n.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
        state.isDirty = true;
      }
    },
    removeNode(state, action) {
      const nodeId = action.payload;
      state.nodes = state.nodes.filter(n => n.id !== nodeId);
      state.edges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
      }
      state.isDirty = true;
    },
    onNodesChange(state, action) {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
      state.isDirty = true;
    },
    updateNodeConfig(state, action) {
      const { nodeId, config } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.data.config = { ...node.data.config, ...config };
        state.isDirty = true;
      }
    },

    // ─── Edge Operations ───
    addEdge(state, action) {
      const newEdge = {
        ...action.payload,
        type: 'custom',
        animated: false,
      };
      state.edges.push(newEdge);
      state.isDirty = true;
    },
    removeEdge(state, action) {
      state.edges = state.edges.filter(e => e.id !== action.payload);
      state.isDirty = true;
    },
    onEdgesChange(state, action) {
      state.edges = applyEdgeChanges(action.payload, state.edges);
      state.isDirty = true;
    },

    // ─── Selection ───
    setSelectedNode(state, action) {
      state.selectedNodeId = action.payload;
    },

    // ─── Workflow Metadata ───
    setWorkflowName(state, action) {
      state.workflowName = action.payload;
      state.isDirty = true;
    },
    setWorkflowId(state, action) {
      state.workflowId = action.payload;
    },
    setValidation(state, action) {
      state.validationErrors = action.payload.errors || [];
      state.validationWarnings = action.payload.warnings || [];
    },
    markClean(state) {
      state.isDirty = false;
    },

    // ─── Bulk Operations ───
    loadWorkflow(state, action) {
      const { nodes, edges, name, id } = action.payload;
      state.nodes = nodes || [];
      state.edges = edges || [];
      state.workflowName = name || 'Untitled Workflow';
      state.workflowId = id || null;
      state.selectedNodeId = null;
      state.isDirty = false;
    },
    clearWorkflow(state) {
      state.nodes = [];
      state.edges = [];
      state.selectedNodeId = null;
      state.isDirty = false;
      state.validationErrors = [];
      state.validationWarnings = [];
    },
    duplicateNode(state, action) {
      const sourceNode = state.nodes.find(n => n.id === action.payload);
      if (sourceNode) {
        const newNode = {
          ...JSON.parse(JSON.stringify(sourceNode)),
          id: `node-${Date.now()}`,
          position: {
            x: sourceNode.position.x + 50,
            y: sourceNode.position.y + 50,
          },
        };
        state.nodes.push(newNode);
        state.isDirty = true;
      }
    },
  },
});

export const {
  addNode, updateNode, removeNode, onNodesChange, updateNodeConfig,
  addEdge, removeEdge, onEdgesChange,
  setSelectedNode,
  setWorkflowName, setWorkflowId, setValidation, markClean,
  loadWorkflow, clearWorkflow, duplicateNode,
} = workflowSlice.actions;

// ─── Selectors ───
export const selectNodes = (state) => state.workflow.nodes;
export const selectEdges = (state) => state.workflow.edges;
export const selectSelectedNodeId = (state) => state.workflow.selectedNodeId;
export const selectSelectedNode = createSelector(
  [selectSelectedNodeId, selectNodes],
  (id, nodes) => id ? nodes.find(n => n.id === id) : null
);
export const selectWorkflowName = (state) => state.workflow.workflowName;
export const selectIsDirty = (state) => state.workflow.isDirty;
export const selectValidationErrors = (state) => state.workflow.validationErrors;
export const selectValidationWarnings = (state) => state.workflow.validationWarnings;
export const selectValidation = createSelector(
  [selectValidationErrors, selectValidationWarnings],
  (errors, warnings) => ({ errors, warnings })
);

export default workflowSlice.reducer;
