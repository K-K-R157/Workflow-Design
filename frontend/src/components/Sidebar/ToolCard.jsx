import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getCategoryColor } from '../../data/mcpTools';

export default function ToolCard({ tool }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tool.id,
    data: { tool },
  });

  const categoryColor = getCategoryColor(tool.category);
  const Icon = tool.icon;

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-grab active:cursor-grabbing rounded-xl p-3 transition-all duration-200"
      title={tool.description}
    >
      {/* Background */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      />
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}08, transparent)`,
          border: `1px solid ${categoryColor}20`,
        }}
      />

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
          style={{
            background: `${categoryColor}15`,
            border: `1px solid ${categoryColor}20`,
          }}
        >
          {Icon && <Icon size={16} style={{ color: categoryColor }} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white truncate">
            {tool.name}
          </p>
          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
            {tool.description}
          </p>
        </div>
      </div>

      {/* IO badges + Premium */}
      <div className="relative flex items-center gap-2 mt-2 pl-12">
        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
          {tool.inputs?.length || 0} in
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
          {tool.outputs?.length || 0} out
        </span>
        {tool.premium && (
          <span className="ml-auto flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.12))',
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.15)',
            }}>
            <Sparkles size={8} />
            PRO
          </span>
        )}
      </div>
    </motion.div>
  );
}
