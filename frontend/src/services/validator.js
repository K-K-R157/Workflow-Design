import { getToolById } from '../data/mcpTools';

/**
 * Validates whether a connection between two nodes is type-compatible.
 */
export function validateConnection(sourceNode, targetNode, sourceHandleId, targetHandleId, existingEdges) {
  const errors = [];

  // Prevent self-connections
  if (sourceNode.id === targetNode.id) {
    errors.push('Cannot connect a node to itself.');
    return { valid: false, errors };
  }

  // Check for duplicate connections
  const duplicate = existingEdges.some(
    e => e.source === sourceNode.id &&
         e.target === targetNode.id &&
         e.sourceHandle === sourceHandleId &&
         e.targetHandle === targetHandleId
  );
  if (duplicate) {
    errors.push('This connection already exists.');
    return { valid: false, errors };
  }

  // Get the source output type and target input type
  const toolData = getToolById(sourceNode.data?.toolId);
  const targetToolData = getToolById(targetNode.data?.toolId);

  if (!toolData || !targetToolData) {
    return { valid: true, errors: [] }; // Can't validate without tool data
  }

  const sourceOutput = toolData.outputs?.find(o => o.id === sourceHandleId);
  const targetInput = targetToolData.inputs?.find(i => i.id === targetHandleId);

  if (sourceOutput && targetInput) {
    // 'any' type is compatible with everything
    if (sourceOutput.type !== 'any' && targetInput.type !== 'any') {
      if (sourceOutput.type !== targetInput.type) {
        // Allow some implicit conversions
        const compatibleTypes = {
          'string': ['any'],
          'number': ['string', 'any'],
          'boolean': ['string', 'any'],
          'object': ['string', 'any'],
          'array': ['object', 'string', 'any'],
        };

        const compatible = compatibleTypes[sourceOutput.type]?.includes(targetInput.type);
        if (!compatible) {
          errors.push(
            `Type mismatch: "${sourceOutput.name}" outputs ${sourceOutput.type}, ` +
            `but "${targetInput.name}" expects ${targetInput.type}.`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates the entire workflow graph.
 */
export function validateWorkflow(nodes, edges) {
  const errors = [];
  const warnings = [];

  if (nodes.length === 0) {
    errors.push('Workflow has no nodes.');
    return { valid: false, errors, warnings };
  }

  // Check for disconnected nodes (no incoming or outgoing edges)
  const connectedNodes = new Set();
  edges.forEach(e => {
    connectedNodes.add(e.source);
    connectedNodes.add(e.target);
  });

  nodes.forEach(node => {
    if (!connectedNodes.has(node.id) && nodes.length > 1) {
      warnings.push(`Node "${node.data?.label || node.id}" is disconnected.`);
    }
  });

  // Check for required inputs that are not connected
  nodes.forEach(node => {
    const toolData = getToolById(node.data?.toolId);
    if (!toolData) return;

    const requiredInputs = toolData.inputs?.filter(i => i.required) || [];
    requiredInputs.forEach(input => {
      const hasConnection = edges.some(
        e => e.target === node.id && e.targetHandle === input.id
      );
      if (!hasConnection) {
        warnings.push(
          `Node "${node.data?.label}": required input "${input.name}" is not connected.`
        );
      }
    });
  });

  // Check for cycles using DFS
  const hasCycle = detectCycle(nodes, edges);
  if (hasCycle) {
    errors.push('Workflow contains a cycle. Remove circular connections.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Detects cycles in the workflow graph.
 */
function detectCycle(nodes, edges) {
  const adjacency = {};
  nodes.forEach(n => { adjacency[n.id] = []; });
  edges.forEach(e => {
    if (adjacency[e.source]) {
      adjacency[e.source].push(e.target);
    }
  });

  const visited = new Set();
  const recursionStack = new Set();

  function dfs(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    for (const neighbor of (adjacency[nodeId] || [])) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Computes topological execution order (Kahn's algorithm).
 */
export function getExecutionOrder(nodes, edges) {
  const inDegree = {};
  const adjacency = {};

  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adjacency[n.id] = [];
  });

  edges.forEach(e => {
    if (adjacency[e.source]) {
      adjacency[e.source].push(e.target);
    }
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target]++;
    }
  });

  const queue = [];
  Object.entries(inDegree).forEach(([id, deg]) => {
    if (deg === 0) queue.push(id);
  });

  const order = [];
  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);

    for (const neighbor of (adjacency[current] || [])) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return order;
}
