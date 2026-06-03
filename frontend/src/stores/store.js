import { configureStore } from '@reduxjs/toolkit';
import workflowReducer from './workflowSlice';
import executionReducer from './executionSlice';
import apiKeysReducer from './apiKeysSlice';

const store = configureStore({
  reducer: {
    workflow: workflowReducer,
    execution: executionReducer,
    apiKeys: apiKeysReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
