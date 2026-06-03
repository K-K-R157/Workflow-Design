import mongoose from 'mongoose';

const logEntrySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    nodeId: { type: String, default: null },
    message: { type: String, required: true },
    level: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
  },
  { _id: false }
);

const snapshotSchema = new mongoose.Schema(
  {
    stepIndex: { type: Number, required: true },
    state: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const runSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'paused', 'completed', 'failed'],
      default: 'pending',
    },
    executionOrder: {
      type: [String], // Node IDs in topological order
      default: [],
    },
    currentStepIndex: {
      type: Number,
      default: 0,
    },
    nodeStatuses: {
      type: Map,
      of: {
        type: String,
        enum: ['idle', 'running', 'success', 'error', 'waiting', 'skipped'],
      },
      default: {},
    },
    nodeOutputs: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    executionLog: {
      type: [logEntrySchema],
      default: [],
    },
    snapshots: {
      type: [snapshotSchema],
      default: [],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for querying runs by workflow ───
runSchema.index({ workflow: 1, createdAt: -1 });
runSchema.index({ user: 1, createdAt: -1 });

const Run = mongoose.model('Run', runSchema);

export default Run;
