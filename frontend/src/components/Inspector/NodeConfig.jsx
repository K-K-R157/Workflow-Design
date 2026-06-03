import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Trash2, Settings, Sparkles, Key, AlertTriangle } from 'lucide-react';
import {
  selectSelectedNode,
  setSelectedNode,
  updateNodeConfig,
  removeNode,
  duplicateNode,
} from '../../stores/workflowSlice';
import { getCategoryColor, getToolById, apiKeyProviders } from '../../data/mcpTools';
import { selectApiKeys } from '../../stores/apiKeysSlice';
import { openSettings } from '../../stores/apiKeysSlice';
import ConfigField from './ConfigField';

export default function NodeConfig() {
  const dispatch = useDispatch();
  const selectedNode = useSelector(selectSelectedNode);
  const apiKeys = useSelector(selectApiKeys);

  // Look up tool data from the static registry
  const toolData = useMemo(
    () => selectedNode ? getToolById(selectedNode.data?.toolId) : null,
    [selectedNode]
  );

  const handleClose = () => dispatch(setSelectedNode(null));

  const handleConfigChange = useCallback((key, value) => {
    if (selectedNode) {
      dispatch(updateNodeConfig({ nodeId: selectedNode.id, config: { [key]: value } }));
    }
  }, [selectedNode, dispatch]);

  const handleDelete = () => {
    if (selectedNode) {
      dispatch(removeNode(selectedNode.id));
    }
  };

  const handleDuplicate = () => {
    if (selectedNode) {
      dispatch(duplicateNode(selectedNode.id));
    }
  };

  const config = selectedNode?.data?.config || {};
  const categoryColor = toolData ? getCategoryColor(toolData.category) : '#6b7280';
  const Icon = toolData?.icon;

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-full shrink-0 flex flex-col overflow-hidden"
          style={{
            background: 'rgba(15, 15, 26, 0.85)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid var(--color-border-default)',
          }}
        >
          {/* ─── Header ─── */}
          <div className="px-4 pt-4 pb-3 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Node Config
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/5 cursor-pointer"
              >
                <X size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Node identity */}
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${categoryColor}20`,
                    border: `1px solid ${categoryColor}30`,
                  }}
                >
                  <Icon size={20} style={{ color: categoryColor }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-white truncate">
                  {selectedNode.data.label}
                </h3>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: categoryColor }}
                >
                  {toolData?.category}
                </span>
              </div>
            </div>
          </div>

          {/* ─── IO Summary ─── */}
          <div className="px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div className="grid grid-cols-2 gap-3">
              {/* Inputs */}
              <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Inputs
                </span>
                {toolData?.inputs?.map(inp => (
                  <div key={inp.id} className="flex items-center gap-1.5 text-[11px] py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />
                    <span className="text-gray-400 truncate">{inp.name}</span>
                    {inp.required && <span className="text-red-400 text-[9px]">*</span>}
                  </div>
                ))}
              </div>
              {/* Outputs */}
              <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Outputs
                </span>
                {toolData?.outputs?.map(out => (
                  <div key={out.id} className="flex items-center gap-1.5 text-[11px] py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />
                    <span className="text-gray-400 truncate">{out.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── API Key Warning (for premium tools) ─── */}
          {toolData?.premium && toolData?.requiredApiKeys && (() => {
            const missingKeys = toolData.requiredApiKeys.filter(k => !apiKeys[k]?.key);
            if (missingKeys.length === 0) return null;
            const providerNames = missingKeys
              .map(k => apiKeyProviders.find(p => p.id === k)?.name || k)
              .join(', ');
            return (
              <div className="px-4 py-2 shrink-0">
                <div className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.12)',
                  }}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold" style={{ color: '#f59e0b' }}>
                      API key required
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      Configure {providerNames} key{missingKeys.length > 1 ? 's' : ''} to use this tool.
                    </p>
                    <button
                      onClick={() => dispatch(openSettings())}
                      className="flex items-center gap-1 mt-2 text-[10px] font-semibold cursor-pointer"
                      style={{ color: '#f59e0b' }}>
                      <Key size={10} /> Configure API Keys
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── Configuration Fields ─── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider block"
              style={{ color: 'var(--color-text-muted)' }}>
              Configuration
            </span>
            {toolData?.configFields?.map(field => (
              <ConfigField
                key={field.key}
                field={field}
                value={config[field.key]}
                onChange={handleConfigChange}
              />
            ))}
            {(!toolData?.configFields || toolData.configFields.length === 0) && (
              <p className="text-[12px] py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                No configuration options
              </p>
            )}
          </div>

          {/* ─── Footer Actions ─── */}
          <div className="px-4 py-3 shrink-0 flex gap-2"
            style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <button
              onClick={handleDuplicate}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <Copy size={13} />
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
