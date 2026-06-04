import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Activity, ScrollText, AlertTriangle, GripHorizontal } from 'lucide-react';
import {
  selectExecutionStatus,
  selectExecutionOrder,
  selectNodeStatuses,
  selectNodeOutputs,
  selectExecutionLog,
  selectExecutionProgress,
} from '../../stores/executionSlice';
import { selectNodes } from '../../stores/workflowSlice';
import NodeState from './NodeState';

const TABS = [
  { id: 'state', label: 'State', icon: Activity },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'errors', label: 'Errors', icon: AlertTriangle },
];

export default function StateInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('state');
  const [height, setHeight] = useState(280);

  const executionStatus = useSelector(selectExecutionStatus);
  const executionOrder = useSelector(selectExecutionOrder);
  const nodeStatuses = useSelector(selectNodeStatuses);
  const nodeOutputs = useSelector(selectNodeOutputs);
  const executionLog = useSelector(selectExecutionLog);
  const progress = useSelector(selectExecutionProgress);
  const nodes = useSelector(selectNodes);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (e) => {
      const delta = startY - e.clientY;
      setHeight(Math.max(200, Math.min(500, startHeight + delta)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [height]);

  // Auto-open when execution starts
  const shouldShow = executionStatus !== 'idle';

  // Early return AFTER all hooks to satisfy React's rules of hooks
  if (!shouldShow && !isOpen) return null;

  const errorLogs = executionLog.filter(l => l.level === 'error');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="shrink-0 flex flex-col"
        style={{
          height: isOpen ? height : 44,
          background: 'rgba(15, 15, 26, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--color-border-default)',
          transition: 'height 0.2s ease',
        }}
      >
        {/* ─── Resize Handle ─── */}
        {isOpen && (
          <div
            className="flex items-center justify-center h-2 cursor-ns-resize shrink-0 hover:bg-white/5 transition-colors"
            onMouseDown={handleMouseDown}
          >
            <GripHorizontal size={14} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
          </div>
        )}

        {/* ─── Header / Tab Bar ─── */}
        <div
          className="flex items-center gap-1 px-4 shrink-0"
          style={{
            height: isOpen ? 36 : 44,
            borderBottom: isOpen ? '1px solid var(--color-border-subtle)' : 'none',
          }}
        >
          {/* Tabs */}
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'errors' ? errorLogs.length : tab.id === 'logs' ? executionLog.length : executionOrder.length;

            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                style={{
                  background: isActive && isOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                }}
              >
                <TabIcon size={13} />
                {tab.label}
                {count > 0 && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: tab.id === 'errors' && errorLogs.length > 0
                        ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                      color: tab.id === 'errors' && errorLogs.length > 0
                        ? '#ef4444' : 'var(--color-text-muted)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Progress */}
          <div className="flex-1" />
          {executionStatus !== 'idle' && (
            <div className="flex items-center gap-2 mr-2">
              <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.percentage}%`,
                    background: executionStatus === 'error' ? '#ef4444' :
                                executionStatus === 'complete' ? '#10b981' : '#3b82f6',
                  }}
                />
              </div>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {progress.current}/{progress.total}
              </span>
            </div>
          )}

          {/* Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isOpen
              ? <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
              : <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} />
            }
          </button>
        </div>

        {/* ─── Content ─── */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* State Tab */}
            {activeTab === 'state' && (
              <div className="space-y-2">
                {executionOrder.length === 0 ? (
                  <p className="text-[12px] text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                    No execution data. Run the workflow to see state.
                  </p>
                ) : (
                  executionOrder.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return (
                      <NodeState
                        key={nodeId}
                        nodeId={nodeId}
                        nodeName={node?.data?.label || nodeId}
                        status={nodeStatuses[nodeId] || 'idle'}
                        output={nodeOutputs[nodeId]}
                      />
                    );
                  })
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-1">
                {executionLog.length === 0 ? (
                  <p className="text-[12px] text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                    No log entries yet.
                  </p>
                ) : (
                  executionLog.map((entry, idx) => {
                    const node = entry.nodeId ? nodes.find(n => n.id === entry.nodeId) : null;
                    const levelColors = {
                      info: '#3b82f6',
                      success: '#10b981',
                      error: '#ef4444',
                      warning: '#f59e0b',
                    };
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-2 py-1.5 px-2 rounded-md text-[11px]"
                        style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                      >
                        <span className="shrink-0 text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: levelColors[entry.level] || '#6b7280' }}
                        />
                        {node && (
                          <span className="font-medium text-white shrink-0">{node.data.label}:</span>
                        )}
                        <span style={{ color: 'var(--color-text-secondary)' }}>{entry.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-2">
                {errorLogs.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2"
                      style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <AlertTriangle size={18} style={{ color: '#10b981' }} />
                    </div>
                    <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                      No errors — looking good!
                    </p>
                  </div>
                ) : (
                  errorLogs.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-lg"
                      style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                      <div>
                        <p className="text-[12px] font-medium" style={{ color: '#ef4444' }}>
                          {entry.message}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
