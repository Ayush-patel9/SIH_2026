import React from 'react';
import { Pencil, Search } from 'lucide-react';
import type { QueryUnderstanding, QueryIntent } from '../../types';
import { buildEntityChips, INTENT_LABELS } from './entityUtils';

interface QueryEntityDisplayProps {
  understanding?: QueryUnderstanding | null;
  onOpenCorrection?: () => void;
  className?: string;
  compact?: boolean;
}

export const QueryEntityDisplay: React.FC<QueryEntityDisplayProps> = ({
  understanding,
  onOpenCorrection,
  className = '',
  compact = false,
}) => {
  if (!understanding) return null;

  const chips = buildEntityChips(understanding);
  const confidence = understanding.confidence ?? 0.95;
  const confidencePct = Math.round(confidence * 100);

  const intent = understanding.query_intent || 'STANDARD_LOOKUP';
  const intentInfo = INTENT_LABELS[intent as QueryIntent] || {
    label: String(intent),
    IconComponent: Search,
  };
  const IntentIcon = intentInfo.IconComponent;

  return (
    <div
      className={`query-entity-display ${className}`}
      style={{
        padding: compact ? '10px 14px' : '14px 18px',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header Info Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--ink-secondary)',
            }}
          >
            Parsed Entities
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'var(--paper)',
              border: '1px solid var(--hairline)',
              fontFamily: 'var(--font-data)',
              fontSize: '10.5px',
              fontWeight: 600,
              color: 'var(--collapse-cobalt)',
            }}
          >
            <IntentIcon size={12} />
            <span>{intentInfo.label}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {understanding.detected_language && (
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                color: 'var(--ink-muted)',
              }}
            >
              Lang: <strong style={{ color: 'var(--ink)' }}>{understanding.detected_language.toUpperCase()}</strong>
            </span>
          )}

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              color: confidence >= 0.85 ? 'var(--emerald-pass)' : '#B45309',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '3px',
              background: confidence >= 0.85 ? 'rgba(46, 107, 65, 0.08)' : 'rgba(217, 119, 6, 0.08)',
            }}
            title={`NLU Extraction Confidence: ${confidencePct}%`}
          >
            <span>●</span> {confidencePct}% Confidence
          </span>

          {onOpenCorrection && (
            <button
              type="button"
              onClick={onOpenCorrection}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                height: '24px',
                borderRadius: '4px',
              }}
            >
              <Pencil size={11} />
              <span>Override</span>
            </button>
          )}
        </div>
      </div>

      {/* Entity Chips Container */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {chips.length === 0 ? (
          <span style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-muted)' }}>
            No structured entities extracted yet. Enter a specification query above.
          </span>
        ) : (
          chips.map((chip, idx) => {
            const ChipIcon = chip.IconComponent;
            return (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  background: chip.bg,
                  border: `1px solid ${chip.border}`,
                  color: chip.color,
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                }}
              >
                {ChipIcon && <ChipIcon size={12} style={{ color: chip.color }} />}
                <span style={{ fontSize: '9.5px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>
                  {chip.typeLabel}:
                </span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{chip.text}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Normalized Text Reference */}
      {!compact && understanding.normalized_text && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '11px', color: 'var(--ink-muted)' }}>
          <span style={{ fontFamily: 'var(--font-data)', textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '10px' }}>
            Normalized Tokens:
          </span>
          <code
            style={{
              fontSize: '11px',
              color: 'var(--ink-secondary)',
              background: 'var(--paper)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid var(--hairline)',
              fontFamily: 'var(--font-data)',
            }}
          >
            {understanding.normalized_text}
          </code>
        </div>
      )}
    </div>
  );
};

