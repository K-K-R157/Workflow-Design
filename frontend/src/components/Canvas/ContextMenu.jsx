import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, Settings, Unplug, Eye } from 'lucide-react';

export default memo(function ContextMenu({ x, y, nodeId, onClose, onDelete, onDuplicate, onConfigure, onDisconnect }) {
  const menuRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const items = [
    { icon: Settings, label: 'Configure', shortcut: 'Enter', onClick: () => { onConfigure?.(nodeId); onClose(); }, color: '#c4b5fd' },
    { icon: Copy, label: 'Duplicate', shortcut: 'Ctrl+D', onClick: () => { onDuplicate?.(nodeId); onClose(); }, color: '#93c5fd' },
    { icon: Unplug, label: 'Disconnect All', shortcut: null, onClick: () => { onDisconnect?.(nodeId); onClose(); }, color: '#f59e0b' },
    { type: 'divider' },
    { icon: Trash2, label: 'Delete', shortcut: 'Del', onClick: () => { onDelete?.(nodeId); onClose(); }, color: '#ef4444', danger: true },
  ];

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 250);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -4 }}
        transition={{ duration: 0.12 }}
        className="fixed z-50 py-1.5 rounded-xl overflow-hidden"
        style={{
          left: adjustedX,
          top: adjustedY,
          minWidth: 180,
          background: 'rgba(20, 20, 36, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}
      >
        {items.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div key={idx} className="my-1 mx-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            );
          }
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer"
              style={{ color: item.danger ? '#ef4444' : 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Icon size={14} style={{ color: item.color }} />
              <span className="flex-1 text-[12px] font-medium">{item.label}</span>
              {item.shortcut && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-muted)' }}>
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
});
