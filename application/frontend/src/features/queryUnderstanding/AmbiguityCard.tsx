import React, { useState } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
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

  const formattedDimension = flag.dimension.replace(/_/g, ' ');

  return (
    <div
      className={`workbench-card ${className}`}
      style={{
        padding: '16px 20px',
        background: 'var(--surface)',
        border: '1px solid rgba(194, 157, 83, 0.35)',
        borderLeft: '4px solid var(--brass-antique, #C29D53)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={17} style={{ color: 'var(--brass-antique, #C29D53)' }} />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--ink)',
            }}
          >
            Disambiguation Required · <span style={{ color: 'var(--brass-antique, #C29D53)' }}>{formattedDimension}</span>
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '10.5px',
            color: 'var(--ink-secondary)',
            background: 'var(--paper)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid var(--hairline)',
          }}
        >
          Interactive Clause Refinement
        </span>
      </div>

      {/* Message */}
      <p
        style={{
          fontFamily: 'var(--font-prose)',
          fontSize: '13.5px',
          color: 'var(--ink)',
          lineHeight: '1.5',
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
                gap: '12px',
                padding: '10px 14px',
                background: isSelected ? 'rgba(194, 157, 83, 0.08)' : 'var(--paper)',
                border: isSelected ? '1px solid var(--brass-antique, #C29D53)' : '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name={`ambiguity_${flag.dimension}`}
                value={opt.value}
                checked={isSelected}
                onChange={() => setSelectedOption(opt)}
                style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--olive-primary)' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
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
                      lineHeight: '1.4',
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
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            opacity: selectedOption ? 1 : 0.5,
            cursor: selectedOption ? 'pointer' : 'not-allowed',
          }}
        >
          <span>Refine Recommendation</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

