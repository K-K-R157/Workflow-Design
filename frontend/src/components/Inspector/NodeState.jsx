import { useState, memo } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const statusIcons = {
  success: { icon: CheckCircle2, color: '#10b981' },
  error: { icon: XCircle, color: '#ef4444' },
  running: { icon: Loader2, color: '#3b82f6' },
};

function NodeState({ nodeId, nodeName, status, output }) {
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = statusIcons[status]?.icon;
  const statusColor = statusIcons[status]?.color || '#6b7280';

  const duration = output?.duration;
  const outputData = output?.outputs;
  const inputData = output?.inputs;

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-white/3 transition-colors"
      >
        {expanded
          ? <ChevronDown size={13} style={{ color: 'var(--color-text-muted)' }} />
          : <ChevronRight size={13} style={{ color: 'var(--color-text-muted)' }} />
        }

        {/* Status icon */}
        {StatusIcon && (
          <StatusIcon
            size={14}
            style={{
              color: statusColor,
              animation: status === 'running' ? 'spin 1s linear infinite' : 'none',
            }}
          />
        )}

        <span className="text-[12px] font-medium text-white flex-1 text-left truncate">
          {nodeName}
        </span>

        {/* Duration */}
        {duration && (
          <div className="flex items-center gap-1">
            <Clock size={10} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`}
            </span>
          </div>
        )}

        {/* Status badge */}
        <span
          className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md"
          style={{
            color: statusColor,
            background: `${statusColor}15`,
          }}
        >
          {status}
        </span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Input Data */}
          {inputData && Object.keys(inputData).length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
                style={{ color: 'var(--color-text-muted)' }}>
                Input
              </span>
              <pre
                className="text-[11px] p-2 rounded-md overflow-x-auto"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#06b6d4',
                  fontFamily: "'Inter', monospace",
                }}
              >
                {JSON.stringify(inputData, null, 2)}
              </pre>
            </div>
          )}

          {/* Output Data */}
          {outputData && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
                style={{ color: 'var(--color-text-muted)' }}>
                Output
              </span>
              <pre
                className="text-[11px] p-2 rounded-md overflow-x-auto"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#10b981',
                  fontFamily: "'Inter', monospace",
                }}
              >
                {JSON.stringify(outputData, null, 2)}
              </pre>
            </div>
          )}

          {!outputData && !inputData && (
            <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
              No data available yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(NodeState);
