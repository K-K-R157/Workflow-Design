import { useCallback, useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { DndContext, DragOverlay, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDispatch } from 'react-redux';
import { addNode, setSelectedNode, loadWorkflow, setWorkflowName } from '../stores/workflowSlice';
import { getToolById } from '../data/mcpTools';
import { apiGetWorkflow } from '../services/api';

import ExecutionBar from '../components/Execution/ExecutionBar';
import ToolPanel from '../components/Sidebar/ToolPanel';
import WorkflowCanvas from '../components/Canvas/WorkflowCanvas';
import NodeConfig from '../components/Inspector/NodeConfig';
import StateInspector from '../components/Inspector/StateInspector';
import ApiKeySettings from '../components/Settings/ApiKeySettings';

let dropNodeCounter = 0;

export default function EditorPage() {
  const { workflowId } = useParams();
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [workflowDbId, setWorkflowDbId] = useState(workflowId || null);

  // Load workflow from backend when navigating to /editor/:workflowId
  useEffect(() => {
    if (workflowId) {
      loadWorkflowFromBackend(workflowId);
    }
  }, [workflowId]);

  const loadWorkflowFromBackend = async (id) => {
    try {
      const data = await apiGetWorkflow(id);
      const wf = data.data;
      dispatch(loadWorkflow({
        nodes: wf.nodes || [],
        edges: wf.edges || [],
        name: wf.name || 'Untitled Workflow',
        id: wf._id,
      }));
      setWorkflowDbId(wf._id);
    } catch (err) {
      console.error('Failed to load workflow:', err);
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const sensors = useSensors(mouseSensor);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    const tool = active.data.current?.tool;
    if (!tool) return;

    const toolData = getToolById(tool.id);
    if (!toolData) return;

    dropNodeCounter++;
    const nodeId = `node-${Date.now()}-${dropNodeCounter}`;

    const canvasEl = canvasRef.current;
    let position = { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 };

    if (event.activatorEvent && canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const dropX = event.activatorEvent.clientX - rect.left + (event.delta?.x || 0);
      const dropY = event.activatorEvent.clientY - rect.top + (event.delta?.y || 0);
      position = { x: dropX - 100, y: dropY - 50 };
    }

    const newNode = {
      id: nodeId,
      type: 'custom',
      position,
      data: {
        label: toolData.name,
        toolId: toolData.id,
        config: toolData.configFields.reduce((acc, field) => {
          acc[field.key] = field.default;
          return acc;
        }, {}),
      },
    };

    dispatch(addNode(newNode));
    dispatch(setSelectedNode(nodeId));
  }, [dispatch]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <ReactFlowProvider>
        <div className="h-screen w-screen flex flex-col" style={{ background: 'var(--color-surface-0)' }}>
          {/* ─── Top: Execution Bar ─── */}
          <ExecutionBar workflowDbId={workflowDbId} setWorkflowDbId={setWorkflowDbId} />

          {/* ─── Middle: Sidebar + Canvas + Config ─── */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Tool Sidebar */}
            <ToolPanel />

            {/* Center: Canvas */}
            <div ref={canvasRef} className="flex-1 relative min-w-0">
              <WorkflowCanvas />
            </div>

            {/* Right: Node Config */}
            <NodeConfig />
          </div>

          {/* ─── Bottom: State Inspector ─── */}
          <StateInspector />
        </div>
      </ReactFlowProvider>

      {/* ─── Drag Overlay ─── */}
      <DragOverlay dropAnimation={null}>
        {null}
      </DragOverlay>

      {/* ─── API Key Settings Modal ─── */}
      <ApiKeySettings />
    </DndContext>
  );
}
