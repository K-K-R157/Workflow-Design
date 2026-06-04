import { Router } from 'express';
import { getTools, getToolById } from '../controllers/toolController.js';

const router = Router();

// GET /api/tools       — List all MCP tools (public)
router.get('/', getTools);

// GET /api/tools/:id   — Get single tool by ID (public)
router.get('/:id', getToolById);

export default router;
