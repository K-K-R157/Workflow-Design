import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load tools registry
const toolsPath = join(__dirname, '..', 'data', 'tools.json');
let toolsRegistry = [];

try {
  const raw = readFileSync(toolsPath, 'utf-8');
  toolsRegistry = JSON.parse(raw);
} catch (err) {
  console.error('⚠️  Failed to load tools.json:', err.message);
}

/**
 * GET /api/tools
 * Return the full MCP tool registry.
 */
export const getTools = async (req, res) => {
  const { category, premium } = req.query;

  let tools = [...toolsRegistry];

  // Filter by category
  if (category) {
    tools = tools.filter((t) => t.category === category);
  }

  // Filter by premium status
  if (premium !== undefined) {
    const isPremium = premium === 'true';
    tools = tools.filter((t) => t.premium === isPremium);
  }

  res.json({
    success: true,
    count: tools.length,
    data: tools,
  });
};

/**
 * GET /api/tools/:id
 * Get a single tool by ID.
 */
export const getToolById = async (req, res) => {
  const tool = toolsRegistry.find((t) => t.id === req.params.id);

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: `Tool with ID "${req.params.id}" not found.`,
    });
  }

  res.json({
    success: true,
    data: tool,
  });
};
