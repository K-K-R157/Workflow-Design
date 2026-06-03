import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the tool registry once at startup
const toolsPath = join(__dirname, '..', 'data', 'tools.json');
let toolsRegistry = [];

try {
  const raw = readFileSync(toolsPath, 'utf-8');
  toolsRegistry = JSON.parse(raw);
} catch (err) {
  console.error('⚠️  Failed to load tools.json:', err.message);
}

/**
 * ValidatorService — Validates workflow graphs.
 * - Edge type matching between source output and target input
 * - Cycle detection via DFS
 * - Orphan node detection
 * - Required input validation
 */
class ValidatorService {
  /**
   * Validate an entire workflow.
   * @param {Array} nodes - Workflow nodes
   * @param {Array} edges - Workflow edges
   * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
   */
  static validate(nodes, edges) {
    const errors = [];
    const warnings = [];

    if (!nodes || nodes.length === 0) {
      warnings.push('Workflow has no nodes.');
      return { valid: true, errors, warnings };
    }

    // 1. Check for cycles
    const cycleResult = ValidatorService.detectCycles(nodes, edges);
    if (cycleResult.hasCycle) {
      errors.push(`Cycle detected involving nodes: ${cycleResult.cycleNodes.join(', ')}`);
    }

    // 2. Check for orphan nodes (no connections)
    const connectedNodeIds = new Set();
    (edges || []).forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    nodes.forEach((node) => {
      if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
        warnings.push(`Node "${node.data?.label || node.id}" is not connected to any other node.`);
      }
    });

    // 3. Validate edge type compatibility
    (edges || []).forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) {
        errors.push(`Edge ${edge.id} references a missing node.`);
        return;
      }

      const validation = ValidatorService.validateEdge(
        sourceNode,
        targetNode,
        edge.sourceHandle,
        edge.targetHandle
      );

      if (!validation.valid) {
        warnings.push(...validation.warnings);
      }
    });

    // 4. Check required inputs are connected
    nodes.forEach((node) => {
      const tool = toolsRegistry.find((t) => t.id === node.data?.toolId);
      if (!tool) return;

      const incomingEdges = (edges || []).filter((e) => e.target === node.id);
      const connectedInputs = new Set(incomingEdges.map((e) => e.targetHandle).filter(Boolean));

      (tool.inputs || []).forEach((input) => {
        if (input.required && !connectedInputs.has(input.id)) {
          // Only warn if there are edges in the workflow (not for first/standalone nodes)
          if (edges && edges.length > 0) {
            warnings.push(
              `Node "${node.data?.label}": Required input "${input.name}" is not connected.`
            );
          }
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Detect cycles using DFS with coloring.
   * WHITE (0) = unvisited, GRAY (1) = in current DFS path, BLACK (2) = fully processed
   */
  static detectCycles(nodes, edges) {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = {};
    const cycleNodes = [];

    // Build adjacency list
    const adj = {};
    nodes.forEach((n) => {
      adj[n.id] = [];
      color[n.id] = WHITE;
    });
    (edges || []).forEach((e) => {
      if (adj[e.source]) {
        adj[e.source].push(e.target);
      }
    });

    let hasCycle = false;

    function dfs(nodeId, path) {
      color[nodeId] = GRAY;
      path.push(nodeId);

      for (const neighbor of adj[nodeId] || []) {
        if (color[neighbor] === GRAY) {
          // Found cycle — extract cycle from path
          hasCycle = true;
          const cycleStart = path.indexOf(neighbor);
          cycleNodes.push(...path.slice(cycleStart));
          return;
        }
        if (color[neighbor] === WHITE) {
          dfs(neighbor, path);
          if (hasCycle) return;
        }
      }

      path.pop();
      color[nodeId] = BLACK;
    }

    for (const node of nodes) {
      if (color[node.id] === WHITE) {
        dfs(node.id, []);
        if (hasCycle) break;
      }
    }

    return { hasCycle, cycleNodes };
  }

  /**
   * Validate a single edge's type compatibility.
   */
  static validateEdge(sourceNode, targetNode, sourceHandle, targetHandle) {
    const warnings = [];

    const sourceTool = toolsRegistry.find((t) => t.id === sourceNode.data?.toolId);
    const targetTool = toolsRegistry.find((t) => t.id === targetNode.data?.toolId);

    if (!sourceTool || !targetTool) {
      return { valid: true, warnings }; // Can't validate without tool data
    }

    const sourceOutput = (sourceTool.outputs || []).find((o) => o.id === sourceHandle);
    const targetInput = (targetTool.inputs || []).find((i) => i.id === targetHandle);

    if (sourceOutput && targetInput) {
      // Type compatibility check (loose — 'any' is always compatible)
      if (
        sourceOutput.type !== 'any' &&
        targetInput.type !== 'any' &&
        sourceOutput.type !== targetInput.type
      ) {
        warnings.push(
          `Type mismatch: "${sourceNode.data?.label}".${sourceOutput.name} (${sourceOutput.type}) → "${targetNode.data?.label}".${targetInput.name} (${targetInput.type})`
        );
      }
    }

    return { valid: true, warnings };
  }
}

export default ValidatorService;
