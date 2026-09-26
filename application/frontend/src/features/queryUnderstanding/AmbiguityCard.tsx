import React, { useState } from 'react';
import type { AmbiguityFlag, AmbiguityOption } from '../../types';

interface AmbiguityCardProps {
  flag: AmbiguityFlag;
  onResolve: (dimension: string, resolvedValue: string, resolvedOption: AmbiguityOption) => void;
  className?: string;
}

export const AmbiguityCard: React.FC<AmbiguityCardProps> = ({
  flag,
  onResolve,
  className = '',
}) => {
  const [selectedOption, setSelectedOption] = useState<AmbiguityOption | null>(null);

  const handleRefine = () => {
    if (selectedOption) {
      onResolve(flag.dimension, selectedOption.value, selectedOption);
    }
  };

  return (
    <div
      className={`workbench-card ${className}`}
      style={{
        padding: '16px 20px',
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderLeft: '4px solid var(--signal-amber)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'auth-card-in 0.2s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#B45309',
            }}
          >
            QUERY INTENT DISAMBIGUATION REQUIRED ({flag.dimension.toUpperCase()})
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '10px',
            color: 'var(--ink-secondary)',
          }}
        >
          INTERACTIVE CLAUSE REFINEMENT
        </span>
      </div>

      {/* Message */}
      <p
        style={{
          fontFamily: 'var(--font-prose)',
          fontSize: '14px',
          color: 'var(--ink)',
          lineHeight: '1.45',
          margin: 0,
        }}
      >
        {flag.message}
      </p>

      {/* Selectable Options Radio Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {flag.options.map((opt) => {
          const isSelected = selectedOption?.value === opt.value;

          return (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                background: isSelected ? '#FEF3C7' : '#FFFFFF',
                border: `1px solid ${isSelected ? 'var(--signal-amber)' : 'var(--hairline)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <input
                type="radio"
                name={`ambiguity_${flag.dimension}`}
                value={opt.value}
                checked={isSelected}
                onChange={() => setSelectedOption(opt)}
                style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#B45309' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-prose)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  {opt.label}
                </span>

                {opt.description && (
                  <span
                    style={{
                      fontFamily: 'var(--font-prose)',
                      fontSize: '12px',
                      color: 'var(--ink-secondary)',
                      lineHeight: '1.35',
                    }}
                  >
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
        <button
          type="button"
          disabled={!selectedOption}
          onClick={handleRefine}
          className="btn-run"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            opacity: selectedOption ? 1 : 0.6,
            cursor: selectedOption ? 'pointer' : 'not-allowed',
          }}
        >
          <span>Refine Recommendation</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
