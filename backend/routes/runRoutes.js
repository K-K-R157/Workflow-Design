import { Router } from 'express';
import {
  startRun,
  stepForward,
  pauseRun,
  resetRun,
  getRun,
  getRunHistory,
} from '../controllers/runController.js';
import auth from '../middleware/auth.js';

const router = Router();

// All run routes require authentication
router.use(auth);

// POST /api/runs/:workflowId/run   — Start a new execution
router.post('/:workflowId/run', startRun);

// POST /api/runs/:runId/step       — Step forward one node
router.post('/:runId/step', stepForward);

// POST /api/runs/:runId/pause      — Pause execution
router.post('/:runId/pause', pauseRun);

// POST /api/runs/:runId/reset      — Reset execution
router.post('/:runId/reset', resetRun);

// GET  /api/runs/:runId            — Get run status/details
router.get('/:runId', getRun);

// GET  /api/runs/workflow/:workflowId — Get run history for a workflow
router.get('/workflow/:workflowId', getRunHistory);

export default router;
