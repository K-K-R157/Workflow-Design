import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Key, Eye, EyeOff, Check, AlertTriangle,
  Shield, Trash2, ExternalLink, Sparkles
} from 'lucide-react';
import {
  selectApiKeys, selectIsSettingsOpen,
  setApiKey, removeApiKey, markKeyValid, closeSettings,
} from '../../stores/apiKeysSlice';
import { apiKeyProviders } from '../../data/mcpTools';

function ApiKeyRow({ provider, keyData, onSave, onRemove, onTest }) {
  const [value, setValue] = useState(keyData?.key || '');
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(!keyData?.key);

  const handleSave = () => {
    if (value.trim()) {
      onSave(provider.id, value.trim());
      setIsEditing(false);
    }
  };

  const handleTest = () => {
    onTest(provider.id);
  };

  const maskedValue = value ? value.slice(0, 6) + '•'.repeat(Math.max(0, value.length - 10)) + value.slice(-4) : '';

  return (
    <div
      className="p-4 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <Key size={14} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-white">{provider.name}</h4>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {provider.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {keyData?.key && (
            <>
              {keyData.isValid ? (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  <Check size={10} /> Valid
                </span>
              ) : keyData.lastTested ? (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  <AlertTriangle size={10} /> Invalid
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  Untested
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2 mt-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={provider.placeholder || 'Enter API key...'}
              className="flex-1 bg-transparent border-none outline-none text-[12px] text-white placeholder:text-gray-600 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={() => setShowKey(!showKey)} className="cursor-pointer shrink-0">
              {showKey
                ? <EyeOff size={13} style={{ color: 'var(--color-text-muted)' }} />
                : <Eye size={13} style={{ color: 'var(--color-text-muted)' }} />
              }
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!value.trim()}
            className="px-4 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors disabled:opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
            }}
          >
            Save
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 px-3 py-2 rounded-lg text-[12px] font-mono truncate"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'var(--color-text-muted)',
            }}>
            {showKey ? value : maskedValue}
          </div>
          <button onClick={() => setShowKey(!showKey)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5"
            style={{ color: 'var(--color-text-muted)' }}>
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button onClick={() => setIsEditing(true)}
            className="px-3 py-2 rounded-lg text-[11px] font-medium cursor-pointer hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Edit
          </button>
          <button onClick={() => onRemove(provider.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-500/10"
            style={{ color: '#ef4444' }}>
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApiKeySettings() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsSettingsOpen);
  const keys = useSelector(selectApiKeys);

  const handleSave = useCallback((providerId, key) => {
    dispatch(setApiKey({ providerId, key }));
  }, [dispatch]);

  const handleRemove = useCallback((providerId) => {
    dispatch(removeApiKey(providerId));
  }, [dispatch]);

  const handleTest = useCallback((providerId) => {
    // Stub: simulate validation — will call real endpoint when backend arrives
    const keyData = keys[providerId];
    if (keyData?.key) {
      setTimeout(() => {
        dispatch(markKeyValid({ providerId, isValid: keyData.key.length > 8 }));
      }, 800);
    }
  }, [keys, dispatch]);

  const handleClose = () => dispatch(closeSettings());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed z-50 top-1/2 left-1/2 w-[560px] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              transform: 'translate(-50%, -50%)',
              background: 'rgba(15, 15, 26, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}>
                  <Shield size={18} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white">API Key Settings</h2>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Configure API keys for premium tools
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Info Banner */}
            <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-start gap-3"
              style={{
                background: 'rgba(139,92,246,0.05)',
                border: '1px solid rgba(139,92,246,0.1)',
              }}>
              <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
              <div>
                <p className="text-[12px] font-medium" style={{ color: '#c4b5fd' }}>
                  Premium tools require API keys
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Keys are stored locally in your browser and never sent to our servers.
                  They are only used when executing workflows.
                </p>
              </div>
            </div>

            {/* Key List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {apiKeyProviders.map(provider => (
                <ApiKeyRow
                  key={provider.id}
                  provider={provider}
                  keyData={keys[provider.id]}
                  onSave={handleSave}
                  onRemove={handleRemove}
                  onTest={handleTest}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 shrink-0 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--color-border-default)' }}>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {Object.keys(keys).filter(k => keys[k]?.key).length} of {apiKeyProviders.length} keys configured
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-[12px] font-semibold cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  color: 'white',
                }}
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
