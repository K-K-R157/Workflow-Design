import { io } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize or return the Socket.IO client instance.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }
  return socket;
}

/**
 * Connect to Socket.IO server and join user room.
 * @param {string} userId — User ID to join room
 */
export function connectSocket(userId) {
  const s = getSocket();

  if (!s.connected) {
    s.connect();

    s.on('connect', () => {
      console.log('🔌 Socket connected:', s.id);
      if (userId) {
        s.emit('auth:join', userId);
      }
    });

    s.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    s.on('connect_error', (err) => {
      console.warn('⚠️  Socket connection error:', err.message);
    });
  } else if (userId) {
    s.emit('auth:join', userId);
  }

  return s;
}

/**
 * Disconnect the socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to execution events.
 * Returns an unsubscribe function.
 */
export function subscribeToExecution(handlers = {}) {
  const s = getSocket();
  const events = [
    'run:started', 'run:paused', 'run:complete', 'run:error', 'run:reset',
    'node:start', 'node:done', 'node:error',
  ];

  events.forEach((event) => {
    if (handlers[event]) {
      s.on(event, handlers[event]);
    }
  });

  // Return unsubscribe function
  return () => {
    events.forEach((event) => {
      if (handlers[event]) {
        s.off(event, handlers[event]);
      }
    });
  };
}

export default getSocket;
