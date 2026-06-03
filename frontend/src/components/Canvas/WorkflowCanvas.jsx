import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSelector, useDispatch } from 'react-redux';
import { useDroppable } from '@dnd-kit/core';

import CustomNode from '../Nodes/CustomNode';
import CustomEdge from '../Edges/CustomEdge';
import ContextMenu from './ContextMenu';
import {
  selectNodes,
  selectEdges,
  onNodesChange,
  onEdgesChange,
  setSelectedNode,
  removeNode,
  duplicateNode,
} from '../../stores/workflowSlice';
import { useWorkflow } from '../../hooks/useWorkflow';
import { getToolById } from '../../data/mcpTools';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const defaultEdgeOptions = {
  type: 'custom',
  animated: false,
};

const proOptions = {
  hideAttribution: true,
};

export default function WorkflowCanvas() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const { handleConnect } = useWorkflow();
  const reactFlowWrapper = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);

  const { setNodeRef } = useDroppable({
    id: 'workflow-canvas',
  });

  const handleNodesChange = useCallback(
    (changes) => dispatch(onNodesChange(changes)),
    [dispatch]
  );

  const handleEdgesChange = useCallback(
    (changes) => dispatch(onEdgesChange(changes)),
    [dispatch]
  );

  const onConnect = useCallback(
    (connection) => {
      handleConnect(connection);
    },
    [handleConnect]
  );

  const onPaneClick = useCallback(() => {
    dispatch(setSelectedNode(null));
    setContextMenu(null);
  }, [dispatch]);

  // ─── Right-click context menu ───
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  const handleContextDelete = useCallback((nodeId) => {
    dispatch(removeNode(nodeId));
  }, [dispatch]);

  const handleContextDuplicate = useCallback((nodeId) => {
    dispatch(duplicateNode(nodeId));
  }, [dispatch]);

  const handleContextConfigure = useCallback((nodeId) => {
    dispatch(setSelectedNode(nodeId));
  }, [dispatch]);

  const handleContextDisconnect = useCallback((nodeId) => {
    // Remove all edges connected to this node
    const connectedEdges = edges.filter(e => e.source === nodeId || e.target === nodeId);
    connectedEdges.forEach(e => {
      dispatch(onEdgesChange([{ id: e.id, type: 'remove' }]));
    });
  }, [edges, dispatch]);

  // ─── Keyboard shortcuts ───
  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // React Flow handles this via deleteKeyCode, but we also handle selected node
    }
  }, []);

  const minimapNodeColor = useCallback((node) => {
    const toolData = getToolById(node.data?.toolId);
    const category = toolData?.category;
    const colors = {
      agent: '#8b5cf6',
      data: '#06b6d4',
      transform: '#f59e0b',
      output: '#10b981',
      control: '#ec4899',
    };
    return colors[category] || '#6b7280';
  }, []);

  return (
    <div
      ref={(el) => {
        reactFlowWrapper.current = el;
        setNodeRef(el);
      }}
      className="w-full h-full relative"
      style={{ background: 'var(--color-surface-0)' }}
      onKeyDown={onKeyDown}
    >
      {/* ─── Ambient Gradient Overlay ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6, 182, 212, 0.03) 0%, transparent 60%)',
        }}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        className="relative z-10"
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="rgba(255,255,255,0.04)"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          style={{ marginBottom: 20, marginLeft: 16 }}
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={0}
          nodeBorderRadius={6}
          maskColor="rgba(10, 10, 18, 0.85)"
          position="bottom-right"
          style={{
            width: 180,
            height: 120,
            marginBottom: 20,
            marginRight: 16,
          }}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* ─── Context Menu ─── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
          onDelete={handleContextDelete}
          onDuplicate={handleContextDuplicate}
          onConfigure={handleContextConfigure}
          onDisconnect={handleContextDisconnect}
        />
      )}

      {/* ─── Empty State ─── */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed rgba(139, 92, 246, 0.3)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Drag tools from the sidebar to start building
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
              Right-click nodes for more options • Press Del to remove
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
