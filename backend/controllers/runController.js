import Run from '../models/Run.js';
import Workflow from '../models/Workflow.js';
import ExecutionEngine from '../services/ExecutionEngine.js';

/**
 * POST /api/runs/:workflowId/run
 * Start a new execution run for a workflow.
 */
export const startRun = async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.workflowId,
      user: req.user.id,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.',
      });
    }

    if (workflow.nodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot run a workflow with no nodes.',
      });
    }

    // Create a new Run document
    const run = new Run({
      workflow: workflow._id,
      user: req.user.id,
    });

    // Start execution via engine
    await ExecutionEngine.start(run, workflow, req.user.id);

    res.status(201).json({
      success: true,
      data: {
        runId: run._id,
        status: run.status,
        executionOrder: run.executionOrder,
        currentStepIndex: run.currentStepIndex,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/runs/:runId/step
 * Execute the next step in a run.
 */
export const stepForward = async (req, res, next) => {
  try {
    const run = await Run.findOne({
      _id: req.params.runId,
      user: req.user.id,
    });

    if (!run) {
      return res.status(404).json({
        success: false,
        message: 'Run not found.',
      });
    }

    const workflow = await Workflow.findById(run.workflow);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Associated workflow not found.',
      });
    }

    // If paused, resume first
    if (run.status === 'paused') {
      run.status = 'running';
    }

    const updatedRun = await ExecutionEngine.step(run, workflow, req.user.id);

    res.json({
      success: true,
      data: {
        runId: updatedRun._id,
        status: updatedRun.status,
        currentStepIndex: updatedRun.currentStepIndex,
        nodeStatuses: Object.fromEntries(updatedRun.nodeStatuses),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/runs/:runId/pause
 * Pause a running execution.
 */
export const pauseRun = async (req, res, next) => {
  try {
    const run = await Run.findOne({
      _id: req.params.runId,
      user: req.user.id,
    });

    if (!run) {
      return res.status(404).json({
        success: false,
        message: 'Run not found.',
      });
    }

    const updatedRun = await ExecutionEngine.pause(run, req.user.id);

    res.json({
      success: true,
      data: {
        runId: updatedRun._id,
        status: updatedRun.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/runs/:runId/reset
 * Reset a run to initial state.
 */
export const resetRun = async (req, res, next) => {
  try {
    const run = await Run.findOne({
      _id: req.params.runId,
      user: req.user.id,
    });

    if (!run) {
      return res.status(404).json({
        success: false,
        message: 'Run not found.',
      });
    }

    const updatedRun = await ExecutionEngine.reset(run, req.user.id);

    res.json({
      success: true,
      data: {
        runId: updatedRun._id,
        status: updatedRun.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/runs/:runId
 * Get full run status and details.
 */
export const getRun = async (req, res, next) => {
  try {
    const run = await Run.findOne({
      _id: req.params.runId,
      user: req.user.id,
    });

    if (!run) {
      return res.status(404).json({
        success: false,
        message: 'Run not found.',
      });
    }

    res.json({
      success: true,
      data: run,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/runs/workflow/:workflowId
 * Get run history for a workflow.
 */
export const getRunHistory = async (req, res, next) => {
  try {
    const runs = await Run.find({
      workflow: req.params.workflowId,
      user: req.user.id,
    })
      .select('status currentStepIndex executionOrder startedAt completedAt error createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: runs.length,
      data: runs.map((r) => ({
        id: r._id,
        status: r.status,
        steps: `${r.currentStepIndex}/${r.executionOrder.length}`,
        startedAt: r.startedAt,
        completedAt: r.completedAt,
        error: r.error,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};
