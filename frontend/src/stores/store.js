import { configureStore } from '@reduxjs/toolkit';
import workflowReducer from './workflowSlice';
import executionReducer from './executionSlice';
import apiKeysReducer from './apiKeysSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
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
