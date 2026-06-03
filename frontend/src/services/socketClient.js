/**
 * Stubbed Socket.IO client — will be wired to real server when backend arrives.
 */

class SocketClient {
  constructor() {
    this.connected = false;
    this.listeners = new Map();
  }

  connect(url = 'ws://localhost:3001') {
    console.log(`[Socket Stub] Would connect to ${url}`);
    this.connected = true;
    // Simulate connection event
    this._emit('connect', { socketId: 'stub-socket-id' });
  }

  disconnect() {
    console.log('[Socket Stub] Disconnected');
    this.connected = false;
    this._emit('disconnect', {});
  }

  emit(event, data) {
    console.log(`[Socket Stub] Emit: ${event}`, data);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    if (callback) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    } else {
      this.listeners.delete(event);
    }
  }

  _emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

// Singleton
const socketClient = new SocketClient();
export default socketClient;
