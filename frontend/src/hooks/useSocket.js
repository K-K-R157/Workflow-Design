import { useEffect, useCallback, useRef, useState } from 'react';
import socketClient from '../services/socketClient';

/**
 * Stubbed Socket.IO hook — provides standard interface for real-time communication.
 * Will be connected to a real server when backend architecture is implemented.
 */
export function useSocket(autoConnect = false) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(socketClient);

  useEffect(() => {
    const socket = socketRef.current;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    if (autoConnect) {
      socket.connect();
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [autoConnect]);

  const emit = useCallback((event, data) => {
    socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event, callback) => {
    socketRef.current.on(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    socketRef.current.off(event, callback);
  }, []);

  const connect = useCallback(() => {
    socketRef.current.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current.disconnect();
  }, []);

  return { isConnected, emit, on, off, connect, disconnect };
}
