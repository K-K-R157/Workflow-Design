/**
 * SocketManager — Singleton for managing Socket.IO events.
 * Manages user rooms and emits execution lifecycle events.
 */
class SocketManager {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize with a Socket.IO server instance.
   * @param {import('socket.io').Server} io
   */
  init(io) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Join user-specific room on authentication
      socket.on('auth:join', (userId) => {
        if (userId) {
          socket.join(`user:${userId}`);
          console.log(`   → User ${userId} joined room`);
        }
      });

      // Join workflow-specific room for collaboration
      socket.on('workflow:join', (workflowId) => {
        if (workflowId) {
          socket.join(`workflow:${workflowId}`);
        }
      });

      socket.on('workflow:leave', (workflowId) => {
        if (workflowId) {
          socket.leave(`workflow:${workflowId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  // ─── Emit helpers ───

  /**
   * Emit event to a specific user.
   */
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  /**
   * Emit event to all users watching a workflow.
   */
  emitToWorkflow(workflowId, event, data) {
    if (this.io) {
      this.io.to(`workflow:${workflowId}`).emit(event, data);
    }
  }

  // ─── Execution Event Emitters ───

  emitRunStarted(userId, runData) {
    this.emitToUser(userId, 'run:started', runData);
  }

  emitNodeStart(userId, { runId, nodeId, stepIndex }) {
    this.emitToUser(userId, 'node:start', { runId, nodeId, stepIndex });
  }

  emitNodeDone(userId, { runId, nodeId, outputs, duration }) {
    this.emitToUser(userId, 'node:done', { runId, nodeId, outputs, duration });
  }

  emitNodeError(userId, { runId, nodeId, error }) {
    this.emitToUser(userId, 'node:error', { runId, nodeId, error });
  }

  emitRunPaused(userId, { runId }) {
    this.emitToUser(userId, 'run:paused', { runId });
  }

  emitRunComplete(userId, { runId, duration }) {
    this.emitToUser(userId, 'run:complete', { runId, duration });
  }

  emitRunError(userId, { runId, error }) {
    this.emitToUser(userId, 'run:error', { runId, error });
  }
}

// Export singleton instance
const socketManager = new SocketManager();
export default socketManager;
