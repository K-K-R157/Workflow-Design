import { memo } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

function ConfigField({ field, value, onChange }) {
  const { key, label, type, options, min, max, step } = field;

  const baseInputStyles = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--color-text-primary)',
    fontSize: '13px',
    borderRadius: '8px',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const focusHandler = (e) => {
    e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
    e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
  };

  const blurHandler = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider block"
        style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </label>

      {type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(key, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          style={baseInputStyles}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )}

      {type === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          step={step || 1}
          onChange={(e) => onChange(key, Number(e.target.value))}
          onFocus={focusHandler}
          onBlur={blurHandler}
          style={baseInputStyles}
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(key, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          rows={3}
          style={{
            ...baseInputStyles,
            resize: 'vertical',
            fontFamily: "'Inter', monospace",
          }}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )}

      {type === 'select' && (
        <select
          value={value || options?.[0] || ''}
          onChange={(e) => onChange(key, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          style={{
            ...baseInputStyles,
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239896a3' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '32px',
          }}
        >
          {options?.map(opt => (
            <option key={opt} value={opt} style={{ background: '#1e1e32', color: '#f0eef5' }}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {type === 'toggle' && (
        <button
          onClick={() => onChange(key, !value)}
          className="flex items-center gap-2 cursor-pointer group"
          type="button"
        >
          {value ? (
            <ToggleRight size={28} className="transition-colors" style={{ color: '#8b5cf6' }} />
          ) : (
            <ToggleLeft size={28} className="transition-colors" style={{ color: 'var(--color-text-muted)' }} />
          )}
          <span className="text-[12px]" style={{ color: value ? '#8b5cf6' : 'var(--color-text-muted)' }}>
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </button>
      )}
    </div>
  );
}

export default memo(ConfigField);
