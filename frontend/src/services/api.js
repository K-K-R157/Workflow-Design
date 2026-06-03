/**
 * Stubbed API service — will be wired to real backend endpoints later.
 */

const MOCK_DELAY = 300;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockWorkflows = [
  {
    id: 'wf-1',
    name: 'Research & Summarize',
    description: 'Search the web, parse results, and generate a summary using LLM.',
    createdAt: '2026-05-28T10:00:00Z',
    updatedAt: '2026-06-01T14:30:00Z',
    nodeCount: 4,
    status: 'draft',
  },
  {
    id: 'wf-2',
    name: 'Data Pipeline',
    description: 'Fetch data from API, transform, filter, and write to database.',
    createdAt: '2026-05-25T08:00:00Z',
    updatedAt: '2026-05-30T16:45:00Z',
    nodeCount: 6,
    status: 'published',
  },
  {
    id: 'wf-3',
    name: 'Email Digest',
    description: 'Aggregate daily data, format as newsletter, and send via email.',
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-02T09:15:00Z',
    nodeCount: 5,
    status: 'draft',
  },
];

export async function getWorkflows() {
  await delay(MOCK_DELAY);
  return { data: mockWorkflows };
}

export async function saveWorkflow(workflowData) {
  await delay(MOCK_DELAY);
  console.log('[API Stub] Saving workflow:', workflowData);
  return { data: { ...workflowData, updatedAt: new Date().toISOString() } };
}

export async function loadWorkflow(workflowId) {
  await delay(MOCK_DELAY);
  console.log('[API Stub] Loading workflow:', workflowId);
  return { data: { id: workflowId, nodes: [], edges: [], name: 'Loaded Workflow' } };
}

export async function getTools() {
  await delay(MOCK_DELAY);
  // In production, this would fetch from the MCP server
  const { default: mcpTools } = await import('../data/mcpTools.js');
  return { data: mcpTools };
}

export async function executeWorkflow(workflowId, options = {}) {
  await delay(MOCK_DELAY);
  console.log('[API Stub] Executing workflow:', workflowId, options);
  return { data: { executionId: `exec-${Date.now()}`, status: 'started' } };
}
