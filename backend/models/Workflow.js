import mongoose from 'mongoose';

// ─── Sub-schemas ───
const positionSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

const nodeDataSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    toolId: { type: String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, default: 'custom' },
    position: { type: positionSchema, required: true },
    data: { type: nodeDataSchema, required: true },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String, default: null },
    targetHandle: { type: String, default: null },
    type: { type: String, default: 'custom' },
    animated: { type: Boolean, default: false },
  },
  { _id: false }
);

// ─── Main Workflow Schema ───
const workflowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: 'Untitled Workflow',
      trim: true,
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    edges: {
      type: [edgeSchema],
      default: [],
    },
    meta: {
      description: { type: String, default: '' },
      tags: { type: [String], default: [] },
      version: { type: Number, default: 1 },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for user + name search ───
workflowSchema.index({ user: 1, updatedAt: -1 });

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;
