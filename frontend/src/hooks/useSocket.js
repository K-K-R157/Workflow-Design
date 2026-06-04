import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../stores/authSlice';
import { connectSocket, disconnectSocket, getSocket, subscribeToExecution } from '../services/socketClient';
import {
  setNodeStatus, setNodeOutput, setExecutionError,
  startExecution, pauseExecution, resetExecution,
  stepForward, addLogEntry,
} from '../stores/executionSlice';

/**
 * useSocket — Connects to Socket.IO server and handles execution events.
 * Automatically connects when user is authenticated and subscribes
 * to all run/node lifecycle events, dispatching to Redux.
 */
export function useSocket() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const socket = connectSocket(user.id);

    // Subscribe to execution events and dispatch to Redux
    unsubRef.current = subscribeToExecution({
      'run:started': (data) => {
        dispatch(startExecution({
          executionOrder: data.executionOrder,
          runId: data.runId,
        }));
        dispatch(addLogEntry({
          nodeId: null,
          message: `Run started: ${data.runId}`,
          level: 'info',
        }));
      },
      'node:start': (data) => {
        dispatch(setNodeStatus({ nodeId: data.nodeId, status: 'running' }));
        dispatch(addLogEntry({
          nodeId: data.nodeId,
          message: 'Node execution started.',
          level: 'info',
        }));
      },
      'node:done': (data) => {
        dispatch(setNodeStatus({ nodeId: data.nodeId, status: 'success' }));
        dispatch(setNodeOutput({
          nodeId: data.nodeId,
          outputs: data.outputs,
          duration: data.duration,
        }));
        dispatch(stepForward());
      },
      'node:error': (data) => {
        dispatch(setNodeStatus({ nodeId: data.nodeId, status: 'error' }));
        dispatch(addLogEntry({
          nodeId: data.nodeId,
          message: `Error: ${data.error}`,
          level: 'error',
        }));
      },
      'run:paused': (data) => {
        dispatch(pauseExecution());
      },
      'run:complete': (data) => {
        dispatch(addLogEntry({
          nodeId: null,
          message: `Run completed in ${(data.duration / 1000).toFixed(1)}s`,
          level: 'success',
        }));
      },
      'run:error': (data) => {
        dispatch(setExecutionError({
          nodeId: null,
          error: data.error,
        }));
      },
      'run:reset': () => {
        dispatch(resetExecution());
      },
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
      disconnectSocket();
    };
  }, [user?.id, dispatch]);

  const emit = useCallback((event, data) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  return { emit };
}
