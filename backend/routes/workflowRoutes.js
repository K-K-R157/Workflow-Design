import { Router } from 'express';
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '../controllers/workflowController.js';
import auth from '../middleware/auth.js';

const router = Router();

// All workflow routes require authentication
router.use(auth);

// GET    /api/workflows       — List all user workflows
router.get('/', getWorkflows);

// GET    /api/workflows/:id   — Get single workflow with full data
router.get('/:id', getWorkflow);

// POST   /api/workflows       — Create a new workflow
router.post('/', createWorkflow);

// PUT    /api/workflows/:id   — Update an existing workflow
router.put('/:id', updateWorkflow);

// DELETE /api/workflows/:id   — Delete a workflow
router.delete('/:id', deleteWorkflow);

export default router;
