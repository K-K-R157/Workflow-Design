import { memo, useMemo } from 'react';
import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { selectNodeStatuses } from '../../stores/executionSlice';
import { selectNodes } from '../../stores/workflowSlice';
import { getCategoryColor, getToolById } from '../../data/mcpTools';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  selected,
  style = {},
  markerEnd,
}) {
  const nodeStatuses = useSelector(selectNodeStatuses);
  const nodes = useSelector(selectNodes);

  const sourceNode = nodes.find(n => n.id === source);
  const sourceTool = useMemo(() => getToolById(sourceNode?.data?.toolId), [sourceNode?.data?.toolId]);
  const categoryColor = getCategoryColor(sourceTool?.category);

  const sourceStatus = nodeStatuses[source];
  const targetStatus = nodeStatuses[target];

  // Determine edge color based on execution state
  let edgeColor = 'rgba(255,255,255,0.15)';
  let animated = false;
  let strokeWidth = 2;

  if (sourceStatus === 'success' && targetStatus === 'running') {
    edgeColor = '#3b82f6';
    animated = true;
    strokeWidth = 2.5;
  } else if (sourceStatus === 'success' && targetStatus === 'success') {
    edgeColor = '#10b981';
    strokeWidth = 2;
  } else if (sourceStatus === 'error' || targetStatus === 'error') {
    edgeColor = '#ef4444';
    strokeWidth = 2;
  } else if (sourceStatus === 'running') {
    edgeColor = categoryColor || '#8b5cf6';
    animated = true;
    strokeWidth = 2;
  } else if (selected) {
    edgeColor = categoryColor || '#8b5cf6';
    strokeWidth = 2.5;
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  return (
    <>
      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />

      {/* Glow effect */}
      {(animated || selected) && (
        <path
          d={edgePath}
          fill="none"
          stroke={edgeColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={0.15}
          style={{ filter: 'blur(6px)' }}
        />
      )}

      {/* Main edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={edgeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{
          ...style,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
          strokeDasharray: animated ? '8 4' : 'none',
          animation: animated ? 'flow-dash 1s linear infinite' : 'none',
        }}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />

      {/* Edge label on hover */}
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          {selected && (
            <button
              className="flex items-center justify-center w-5 h-5 rounded-full cursor-pointer hover:scale-125 transition-transform"
              style={{
                background: '#ef4444',
                border: '2px solid rgba(15, 15, 26, 0.9)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Edge removal handled by React Flow's onEdgesDelete
              }}
              title="Remove connection"
            >
              <X size={10} className="text-white" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
