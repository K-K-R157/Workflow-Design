import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, RotateCcw, Save, Download,
  Zap, CheckCircle2, AlertTriangle, Loader2, Trash2, Settings, Home,
  X, XCircle, Info
} from 'lucide-react';
import {
  selectExecutionStatus,
  selectCurrentStepIndex,
  selectExecutionOrder,
} from '../../stores/executionSlice';
import {
  selectWorkflowName, selectIsDirty, selectNodes, selectEdges,
  selectValidationErrors, selectValidationWarnings,
  setWorkflowName, markClean, setWorkflowId,
} from '../../stores/workflowSlice';
import { openSettings } from '../../stores/apiKeysSlice';
import { useWorkflow } from '../../hooks/useWorkflow';
import { apiCreateWorkflow, apiUpdateWorkflow } from '../../services/api';

const statusConfig = {
  idle:     { label: 'Ready', color: '#6b7280', icon: Zap, bg: 'rgba(107,114,128,0.1)' },
  running:  { label: 'Running', color: '#3b82f6', icon: Loader2, bg: 'rgba(59,130,246,0.1)' },
  paused:   { label: 'Paused', color: '#f59e0b', icon: Pause, bg: 'rgba(245,158,11,0.1)' },
  complete: { label: 'Complete', color: '#10b981', icon: CheckCircle2, bg: 'rgba(16,185,129,0.1)' },
  error:    { label: 'Error', color: '#ef4444', icon: AlertTriangle, bg: 'rgba(239,68,68,0.1)' },
};

export default function ExecutionBar({ workflowDbId, setWorkflowDbId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleRun, handlePause, handleStep, handleReset, handleClear, runValidation } = useWorkflow();

  const executionStatus = useSelector(selectExecutionStatus);
  const currentStepIndex = useSelector(selectCurrentStepIndex);
  const executionOrder = useSelector(selectExecutionOrder);
  const workflowName = useSelector(selectWorkflowName);
  const isDirty = useSelector(selectIsDirty);
  const nodes = useSelector(selectNodes);
  const edges = useSelector(selectEdges);
  const validationErrors = useSelector(selectValidationErrors);
  const validationWarnings = useSelector(selectValidationWarnings);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const validationRef = useRef(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(workflowName);
  const nameInputRef = useRef(null);
  const autoStepRef = useRef(null);

  useEffect(() => {
    setNameValue(workflowName);
  }, [workflowName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Auto-step when running
  useEffect(() => {
    if (executionStatus === 'running') {
      autoStepRef.current = setInterval(() => {
        handleStep();
      }, 1200);
    } else {
      clearInterval(autoStepRef.current);
    }
    return () => clearInterval(autoStepRef.current);
  }, [executionStatus, handleStep]);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (nameValue.trim() && nameValue !== workflowName) {
      dispatch(setWorkflowName(nameValue.trim()));
    }
  };

  // ─── Save workflow to backend ───
  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const workflowData = { name: workflowName, nodes, edges };
      if (workflowDbId) {
        await apiUpdateWorkflow(workflowDbId, workflowData);
      } else {
        const data = await apiCreateWorkflow(workflowData);
        const newId = data.data._id;
        setWorkflowDbId?.(newId);
        dispatch(setWorkflowId(newId));
        // Update URL without full navigation
        window.history.replaceState(null, '', `/editor/${newId}`);
      }
      dispatch(markClean());
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [workflowDbId, workflowName, nodes, edges, saving, dispatch, setWorkflowDbId]);

  // ─── Export workflow as JSON ───
  const handleExport = useCallback(() => {
    const data = JSON.stringify({ name: workflowName, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workflowName, nodes, edges]);

  const handleValidate = useCallback(() => {
    const result = runValidation();
    if (result.errors.length > 0 || result.warnings.length > 0) {
      setShowValidation(true);
      setValidationSuccess(false);
    } else {
      setShowValidation(false);
      setValidationSuccess(true);
      setTimeout(() => setValidationSuccess(false), 3000);
    }
  }, [runValidation]);

  // Close validation panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (validationRef.current && !validationRef.current.contains(e.target)) {
        setShowValidation(false);
      }
    };
    if (showValidation) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showValidation]);

  const status = statusConfig[executionStatus] || statusConfig.idle;
  const StatusIcon = status.icon;

  const isRunning = executionStatus === 'running';
  const isPaused = executionStatus === 'paused';
  const canRun = nodes.length > 0;

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 relative"
      style={{
        height: 56,
        background: 'rgba(15, 15, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border-default)',
        overflow: 'visible',
        zIndex: 50,
      }}
    >
      {/* ─── Logo / Home ─── */}
      <div className="flex items-center gap-2 mr-2">
        <button
          onClick={() => navigate('/home')}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
          }}
          title="Go to dashboard"
        >
          <Zap size={16} className="text-white" />
        </button>
      </div>

      {/* ─── Workflow Name ─── */}
      <div className="flex items-center gap-2 min-w-0">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            className="text-[14px] font-semibold text-white bg-transparent border-b-2 outline-none px-1 py-0.5"
            style={{ borderColor: '#8b5cf6' }}
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-[14px] font-semibold text-white truncate hover:text-purple-300 transition-colors cursor-pointer max-w-[200px]"
            title="Click to rename"
          >
            {workflowName}
          </button>
        )}
        {isDirty && (
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
        )}
      </div>

      {/* ─── Divider ─── */}
      <div className="w-px h-6 mx-1" style={{ background: 'var(--color-border-subtle)' }} />

      {/* ─── Execution Controls ─── */}
      <div className="flex items-center gap-1.5">
        {/* Run / Pause Button */}
        {isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
            }}
            title="Pause execution"
          >
            <Pause size={14} />
            Pause
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRun}
            disabled={!canRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c4b5fd',
            }}
            title={isPaused ? 'Resume execution' : 'Run workflow'}
          >
            <Play size={14} />
            {isPaused ? 'Resume' : 'Run'}
          </motion.button>
        )}

        {/* Step */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStep}
          disabled={!canRun || executionStatus === 'complete'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-secondary)',
          }}
          title="Step forward one node"
        >
          <SkipForward size={14} />
          Step
        </motion.button>

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          disabled={executionStatus === 'idle'}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-secondary)',
          }}
          title="Reset execution"
        >
          <RotateCcw size={14} />
        </motion.button>
      </div>

      {/* ─── Status Badge ─── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ background: status.bg }}
      >
        <StatusIcon
          size={13}
          style={{
            color: status.color,
            animation: executionStatus === 'running' ? 'spin 1s linear infinite' : 'none',
          }}
        />
        <span className="text-[11px] font-semibold" style={{ color: status.color }}>
          {status.label}
        </span>
        {executionStatus === 'running' && (
          <span className="text-[10px]" style={{ color: status.color }}>
            {currentStepIndex}/{executionOrder.length}
          </span>
        )}
      </div>

      {/* ─── Spacer ─── */}
      <div className="flex-1" />

      {/* ─── Validation Badges ─── */}
      {(validationErrors.length > 0 || validationWarnings.length > 0) && (
        <div
          className="flex items-center gap-2 mr-2 cursor-pointer"
          onClick={() => setShowValidation(!showValidation)}
          title="Click to see details"
        >
          {validationErrors.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
              <XCircle size={12} />
              {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
            </span>
          )}
          {validationWarnings.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
              <AlertTriangle size={12} />
              {validationWarnings.length} warning{validationWarnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ─── Validation Success Toast ─── */}
      <AnimatePresence>
        {validationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg mr-2"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <CheckCircle2 size={13} style={{ color: '#10b981' }} />
            <span className="text-[11px] font-semibold" style={{ color: '#10b981' }}>Valid — No issues found</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Right Actions ─── */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleValidate}
          disabled={nodes.length === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-secondary)',
          }}
          title="Validate workflow"
        >
          <CheckCircle2 size={13} />
          Validate
        </button>

        <button
          onClick={() => dispatch(openSettings())}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5"
          style={{ color: 'var(--color-text-muted)' }}
          title="Settings"
        >
          <Settings size={15} />
        </button>

        <button
          onClick={handleSave}
          disabled={saving || (!isDirty && workflowDbId)}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: saving ? '#8b5cf6' : 'var(--color-text-muted)' }}
          title={saving ? 'Saving...' : 'Save workflow'}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        </button>

        <button
          onClick={handleExport}
          disabled={nodes.length === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--color-text-muted)' }}
          title="Export workflow as JSON"
        >
          <Download size={15} />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border-subtle)' }} />

        <button
          onClick={handleClear}
          disabled={nodes.length === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--color-text-muted)' }}
          title="Clear canvas"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* ─── Validation Results Dropdown Panel ─── */}
      <AnimatePresence>
        {showValidation && (validationErrors.length > 0 || validationWarnings.length > 0) && (
          <motion.div
            ref={validationRef}
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 top-14 z-50 w-[380px] max-h-[320px] overflow-y-auto rounded-xl"
            style={{
              background: 'rgba(15, 15, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: validationErrors.length > 0 ? '#ef4444' : '#f59e0b' }} />
                <span className="text-[12px] font-semibold text-white">Validation Results</span>
              </div>
              <button
                onClick={() => setShowValidation(false)}
                className="w-5 h-5 rounded flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
              >
                <X size={12} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Errors */}
            {validationErrors.length > 0 && (
              <div className="px-4 py-3" style={{ borderBottom: validationWarnings.length > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: '#ef4444' }}>Errors</span>
                <div className="space-y-1.5">
                  {validationErrors.map((err, i) => (
                    <div key={`err-${i}`} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <XCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                      <span className="text-[11px] leading-relaxed" style={{ color: '#fca5a5' }}>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationWarnings.length > 0 && (
              <div className="px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ color: '#f59e0b' }}>Warnings</span>
                <div className="space-y-1.5">
                  {validationWarnings.map((warn, i) => (
                    <div key={`warn-${i}`} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)' }}>
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                      <span className="text-[11px] leading-relaxed" style={{ color: '#fde68a' }}>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
