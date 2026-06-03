import { memo, useMemo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { selectSelectedNodeId, setSelectedNode, removeNode } from '../../stores/workflowSlice';
import { selectNodeStatuses } from '../../stores/executionSlice';
import { getCategoryColor, getToolById } from '../../data/mcpTools';

const statusConfig = {
  idle:    { ring: 'rgba(107, 114, 128, 0.4)', glow: 'none', label: '' },
  running: { ring: '#3b82f6', glow: '0 0 20px rgba(59, 130, 246, 0.5)', label: 'Running' },
  success: { ring: '#10b981', glow: '0 0 16px rgba(16, 185, 129, 0.4)', label: 'Done' },
  error:   { ring: '#ef4444', glow: '0 0 16px rgba(239, 68, 68, 0.4)', label: 'Error' },
  waiting: { ring: '#8b5cf6', glow: '0 0 16px rgba(139, 92, 246, 0.4)', label: 'Waiting' },
  skipped: { ring: '#6b7280', glow: 'none', label: 'Skipped' },
};

function CustomNode({ id, data }) {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const nodeStatuses = useSelector(selectNodeStatuses);

  const isSelected = selectedNodeId === id;
  const toolData = useMemo(() => getToolById(data.toolId), [data.toolId]);
  const categoryColor = getCategoryColor(toolData?.category);
  const Icon = toolData?.icon;
  const status = nodeStatuses[id] || 'idle';
  const statusInfo = statusConfig[status] || statusConfig.idle;

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(setSelectedNode(id));
  };

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    dispatch(removeNode(id));
  }, [dispatch, id]);

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleClick}
      className="relative group"
      style={{ minWidth: 220 }}
    >
      {/* ─── Delete Button (hover) ─── */}
      <button
        onClick={handleDelete}
        className="absolute -top-2.5 -right-2.5 z-20 w-6 h-6 rounded-full flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
        style={{
          background: '#ef4444',
          border: '2px solid rgba(15, 15, 26, 0.9)',
          boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
        }}
        title="Remove node"
      >
        <X size={11} className="text-white" />
      </button>

      {/* ─── Selection & Status Ring ─── */}
      <div
        className="absolute -inset-[3px] rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          border: isSelected
            ? `2px solid ${categoryColor}`
            : status !== 'idle'
              ? `2px solid ${statusInfo.ring}`
              : '2px solid transparent',
          boxShadow: isSelected
            ? `0 0 24px ${categoryColor}40, inset 0 0 24px ${categoryColor}10`
            : statusInfo.glow,
        }}
      />

      {/* ─── Node Card ─── */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'rgba(15, 15, 26, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* ─── Header Bar ─── */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}08)`,
            borderBottom: `1px solid ${categoryColor}30`,
          }}
        >
          {Icon && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${categoryColor}25` }}
            >
              <Icon size={15} style={{ color: categoryColor }} />
            </div>
          )}
          <span className="text-[13px] font-semibold text-white truncate flex-1">
            {data.label}
          </span>

          {/* Premium badge */}
          {toolData?.premium && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.15))',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
              <Sparkles size={8} />
              PRO
            </span>
          )}

          {/* Status indicator */}
          {status !== 'idle' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: statusInfo.ring,
                  animation: status === 'running' ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
                }}
              />
              <span className="text-[10px] font-medium" style={{ color: statusInfo.ring }}>
                {statusInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* ─── Body: Compact config preview ─── */}
        <div className="px-3.5 py-2.5 space-y-1">
          {toolData?.inputs?.slice(0, 2).map((input) => (
            <div key={input.id} className="flex items-center gap-1.5 text-[11px]">
              <span className="text-gray-500">●</span>
              <span className="text-gray-400 truncate">{input.name}</span>
              <span className="ml-auto text-gray-600 text-[10px]">{input.type}</span>
            </div>
          ))}
          {toolData?.inputs?.length > 2 && (
            <span className="text-[10px] text-gray-600">+{toolData.inputs.length - 2} more</span>
          )}
        </div>

        {/* ─── Footer: category tag ─── */}
        <div
          className="px-3.5 py-1.5 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: categoryColor,
              background: `${categoryColor}15`,
            }}
          >
            {toolData?.category}
          </span>
          {toolData?.outputs && (
            <span className="text-[10px] text-gray-600">
              {toolData.outputs.length} output{toolData.outputs.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ─── Input Handles ─── */}
      {toolData?.inputs?.map((input, index) => (
        <Handle
          key={`in-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            top: `${44 + index * 22}px`,
            background: categoryColor,
            border: `2px solid rgba(15, 15, 26, 0.9)`,
          }}
          title={`${input.name} (${input.type})`}
        />
      ))}

      {/* ─── Output Handles ─── */}
      {toolData?.outputs?.map((output, index) => (
        <Handle
          key={`out-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            top: `${44 + index * 22}px`,
            background: categoryColor,
            border: `2px solid rgba(15, 15, 26, 0.9)`,
          }}
          title={`${output.name} (${output.type})`}
        />
      ))}
    </motion.div>
  );
}

export default memo(CustomNode);
