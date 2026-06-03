import { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft, Key } from 'lucide-react';
import mcpTools, { toolCategories } from '../../data/mcpTools';
import { openSettings } from '../../stores/apiKeysSlice';
import ToolCard from './ToolCard';

export default function ToolPanel() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(
    toolCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const filteredTools = useMemo(() => {
    if (!search.trim()) return mcpTools;
    const q = search.toLowerCase();
    return mcpTools.filter(
      t => t.name.toLowerCase().includes(q) ||
           t.description.toLowerCase().includes(q) ||
           t.category.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedTools = useMemo(() => {
    const groups = {};
    toolCategories.forEach(cat => { groups[cat.id] = []; });
    filteredTools.forEach(tool => {
      if (groups[tool.category]) {
        groups[tool.category].push(tool);
      }
    });
    return groups;
  }, [filteredTools]);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  if (collapsed) {
    return (
      <div
        className="h-full flex flex-col items-center py-4 px-1"
        style={{
          width: 48,
          background: 'rgba(15, 15, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--color-border-default)',
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 cursor-pointer"
          title="Expand tool panel"
        >
          <PanelLeft size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        {/* Category dots */}
        <div className="mt-6 space-y-3">
          {toolCategories.map(cat => (
            <div
              key={cat.id}
              className="w-3 h-3 rounded-full cursor-pointer hover:scale-125 transition-transform"
              style={{ background: cat.color }}
              title={cat.name}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 288, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full flex flex-col shrink-0 overflow-hidden"
      style={{
        background: 'rgba(15, 15, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-border-default)',
      }}
    >
      {/* ─── Header ─── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-white">MCP Tools</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-white/5 cursor-pointer"
          title="Collapse panel"
        >
          <PanelLeftClose size={16} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* ─── Search ─── */}
      <div className="px-4 pb-3 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* ─── Tool Categories ─── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {toolCategories.map(category => {
          const tools = groupedTools[category.id] || [];
          if (tools.length === 0 && search) return null;

          const isExpanded = expandedCategories[category.id];

          return (
            <div key={category.id}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors hover:bg-white/3 cursor-pointer"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: category.color }}
                />
                <span className="text-[12px] font-semibold uppercase tracking-wider flex-1 text-left"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  {category.name}
                </span>
                <span className="text-[10px] mr-1"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {tools.length}
                </span>
                {isExpanded
                  ? <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                }
              </button>

              {/* Tools List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 py-1">
                      {tools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredTools.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No tools match "{search}"
            </p>
          </div>
        )}
      </div>

      {/* ─── Footer Stats ─── */}
      <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {mcpTools.length} tools available
        </p>
        <button
          onClick={() => dispatch(openSettings())}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer transition-colors hover:bg-white/5"
          style={{
            color: '#f59e0b',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.1)',
          }}
          title="Configure API keys for premium tools"
        >
          <Key size={12} />
          API Keys
        </button>
      </div>
    </motion.div>
  );
}
