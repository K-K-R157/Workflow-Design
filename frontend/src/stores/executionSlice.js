import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle', // idle | running | paused | complete | error
  currentStepIndex: -1,
  executionOrder: [],
  nodeStatuses: {},     // { [nodeId]: 'idle' | 'running' | 'success' | 'error' | 'waiting' | 'skipped' }
  nodeOutputs: {},      // { [nodeId]: { inputs: {}, outputs: {}, duration: 0 } }
  executionLog: [],     // { timestamp, nodeId, message, level }
  startTime: null,
  endTime: null,
  error: null,
};

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    startExecution(state, action) {
      const { executionOrder } = action.payload;
      state.status = 'running';
      state.executionOrder = executionOrder;
      state.currentStepIndex = 0;
      state.startTime = Date.now();
      state.endTime = null;
      state.error = null;
      state.executionLog = [];

      // Set all nodes to idle
      state.nodeStatuses = {};
      state.nodeOutputs = {};
      executionOrder.forEach(nodeId => {
        state.nodeStatuses[nodeId] = 'idle';
      });

      // Set the first node to running
      if (executionOrder.length > 0) {
        state.nodeStatuses[executionOrder[0]] = 'running';
      }

      state.executionLog.push({
        timestamp: Date.now(),
        nodeId: null,
        message: `Execution started with ${executionOrder.length} steps.`,
        level: 'info',
      });
    },

    pauseExecution(state) {
      if (state.status === 'running') {
        state.status = 'paused';
        state.executionLog.push({
          timestamp: Date.now(),
          nodeId: null,
          message: 'Execution paused.',
          level: 'info',
        });
      }
    },

    resumeExecution(state) {
      if (state.status === 'paused') {
        state.status = 'running';
        state.executionLog.push({
          timestamp: Date.now(),
          nodeId: null,
          message: 'Execution resumed.',
          level: 'info',
        });
      }
    },

    stepForward(state) {
      const currentNodeId = state.executionOrder[state.currentStepIndex];

      if (currentNodeId) {
        // Complete current node
        state.nodeStatuses[currentNodeId] = 'success';

        // Generate mock output for the completed node
        if (!state.nodeOutputs[currentNodeId]) {
          state.nodeOutputs[currentNodeId] = {};
        }
        state.nodeOutputs[currentNodeId] = {
          ...state.nodeOutputs[currentNodeId],
          outputs: { result: `Output from step ${state.currentStepIndex + 1}`, timestamp: Date.now() },
          duration: Math.floor(Math.random() * 2000) + 500,
          completedAt: Date.now(),
        };

        state.executionLog.push({
          timestamp: Date.now(),
          nodeId: currentNodeId,
          message: `Node completed successfully.`,
          level: 'success',
        });
      }

      // Move to next step
      state.currentStepIndex++;

      if (state.currentStepIndex >= state.executionOrder.length) {
        // Execution complete
        state.status = 'complete';
        state.endTime = Date.now();
        state.executionLog.push({
          timestamp: Date.now(),
          nodeId: null,
          message: `Execution completed in ${((Date.now() - state.startTime) / 1000).toFixed(1)}s.`,
          level: 'success',
        });
      } else {
        // Set next node to running
        const nextNodeId = state.executionOrder[state.currentStepIndex];
        state.nodeStatuses[nextNodeId] = 'running';

        state.executionLog.push({
          timestamp: Date.now(),
          nodeId: nextNodeId,
          message: `Starting execution...`,
          level: 'info',
        });
      }
    },

    setNodeStatus(state, action) {
      const { nodeId, status } = action.payload;
      state.nodeStatuses[nodeId] = status;
    },

    setNodeOutput(state, action) {
      const { nodeId, inputs, outputs, duration } = action.payload;
      state.nodeOutputs[nodeId] = { inputs, outputs, duration, completedAt: Date.now() };
    },

    setExecutionError(state, action) {
      const { nodeId, error } = action.payload;
      state.status = 'error';
      state.error = error;
      state.endTime = Date.now();
      if (nodeId) {
        state.nodeStatuses[nodeId] = 'error';
      }
      state.executionLog.push({
        timestamp: Date.now(),
        nodeId,
        message: `Error: ${error}`,
        level: 'error',
      });
    },

    resetExecution(state) {
      Object.assign(state, initialState);
    },

    addLogEntry(state, action) {
      state.executionLog.push({
        timestamp: Date.now(),
        ...action.payload,
      });
    },
  },
});

export const {
  startExecution, pauseExecution, resumeExecution, stepForward,
  setNodeStatus, setNodeOutput, setExecutionError,
  resetExecution, addLogEntry,
} = executionSlice.actions;

// ─── Selectors ───
export const selectExecutionStatus = (state) => state.execution.status;
export const selectCurrentStepIndex = (state) => state.execution.currentStepIndex;
export const selectExecutionOrder = (state) => state.execution.executionOrder;
export const selectNodeStatuses = (state) => state.execution.nodeStatuses;
export const selectNodeOutputs = (state) => state.execution.nodeOutputs;
export const selectExecutionLog = (state) => state.execution.executionLog;
export const selectCurrentNodeId = (state) => {
  const idx = state.execution.currentStepIndex;
  return state.execution.executionOrder[idx] || null;
};
export const selectExecutionProgressCurrent = (state) => state.execution.currentStepIndex;
export const selectExecutionProgressTotal = (state) => state.execution.executionOrder.length;
export const selectExecutionProgress = createSelector(
  [selectCurrentStepIndex, selectExecutionOrder],
  (current, order) => ({
    current,
    total: order.length,
    percentage: order.length > 0
      ? Math.round((current / order.length) * 100)
      : 0,
  })
);

export default executionSlice.reducer;
