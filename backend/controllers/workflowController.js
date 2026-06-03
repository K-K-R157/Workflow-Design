import Workflow from '../models/Workflow.js';
import ValidatorService from '../services/ValidatorService.js';

/**
 * GET /api/workflows
 * List all workflows for the authenticated user.
 */
export const getWorkflows = async (req, res, next) => {
  try {
    const workflows = await Workflow.find({ user: req.user.id })
      .select('name meta.tags meta.version isPublic nodes edges createdAt updatedAt')
      .sort({ updatedAt: -1 });

    // Add node/edge counts without sending full data
    const result = workflows.map((w) => ({
      id: w._id,
      name: w.name,
      nodeCount: w.nodes.length,
      edgeCount: w.edges.length,
      tags: w.meta.tags,
      version: w.meta.version,
      isPublic: w.isPublic,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workflows/:id
 * Get a single workflow with full node/edge data.
 */
export const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.',
      });
    }

    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/workflows
 * Create a new workflow.
 */
export const createWorkflow = async (req, res, next) => {
  try {
    const { name, nodes, edges, meta, isPublic } = req.body;

    const workflow = await Workflow.create({
      user: req.user.id,
      name: name || 'Untitled Workflow',
      nodes: nodes || [],
      edges: edges || [],
      meta: meta || {},
      isPublic: isPublic || false,
    });

    // Run validation if nodes/edges provided
    let validation = null;
    if (nodes && nodes.length > 0) {
      validation = ValidatorService.validate(nodes, edges || []);
    }

    res.status(201).json({
      success: true,
      data: workflow,
      validation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/workflows/:id
 * Update an existing workflow.
 */
export const updateWorkflow = async (req, res, next) => {
  try {
    const { name, nodes, edges, meta, isPublic } = req.body;

    const workflow = await Workflow.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.',
      });
    }

    // Update fields
    if (name !== undefined) workflow.name = name;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    if (meta !== undefined) workflow.meta = { ...workflow.meta, ...meta };
    if (isPublic !== undefined) workflow.isPublic = isPublic;

    // Bump version
    workflow.meta.version = (workflow.meta.version || 1) + 1;

    await workflow.save();

    // Run validation
    let validation = null;
    if (workflow.nodes.length > 0) {
      validation = ValidatorService.validate(workflow.nodes, workflow.edges);
    }

    res.json({
      success: true,
      data: workflow,
      validation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/workflows/:id
 * Delete a workflow.
 */
export const deleteWorkflow = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.',
      });
    }

    res.json({
      success: true,
      message: 'Workflow deleted.',
    });
  } catch (error) {
    next(error);
  }
};
