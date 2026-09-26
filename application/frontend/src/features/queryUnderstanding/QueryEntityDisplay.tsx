import React from 'react';
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
    icon: '🎯',
  };

  const getDots = (score: number) => {
    const filled = Math.round(score * 5);
    return '●'.repeat(filled) + '○'.repeat(5 - filled);
  };

  return (
    <div
      className={`query-entity-display ${className}`}
      style={{
        padding: compact ? '8px 12px' : '12px 16px',
        background: 'var(--paper)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header Info Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--ink-secondary)',
            }}
          >
            PARSED QUERY ENTITIES (NLU PIPELINE)
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              borderRadius: '3px',
              background: '#FFFFFF',
              border: '1px solid var(--hairline)',
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              color: 'var(--collapse-cobalt)',
            }}
          >
            <span>{intentInfo.icon}</span>
            <span>{intentInfo.label}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {understanding.detected_language && (
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: 'var(--ink-muted)',
              }}
            >
              Lang: <strong>{understanding.detected_language.toUpperCase()}</strong>
            </span>
          )}

          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              color: confidence >= 0.85 ? 'var(--emerald-pass)' : '#B45309',
              fontWeight: 600,
            }}
            title={`NLU Extraction Confidence: ${confidencePct}%`}
          >
            {getDots(confidence)} {confidencePct}%
          </span>

          {onOpenCorrection && (
            <button
              type="button"
              onClick={onOpenCorrection}
              className="btn-secondary"
              style={{ padding: '2px 8px', fontSize: '11px', fontFamily: 'var(--font-data)' }}
            >
              ✏️ Override
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
          chips.map((chip, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: chip.bg,
                border: `1px solid ${chip.border}`,
                color: chip.color,
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
              }}
            >
              <span style={{ fontSize: '10px' }}>{chip.icon}</span>
              <strong style={{ fontSize: '9px', opacity: 0.85, textTransform: 'uppercase' }}>
                {chip.typeLabel}:
              </strong>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{chip.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Normalized Text Reference */}
      {!compact && understanding.normalized_text && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
            NORMALIZED TOKENS:
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '11px',
              color: 'var(--ink-secondary)',
              background: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: '2px',
              border: '1px solid var(--hairline)',
            }}
          >
            {understanding.normalized_text}
          </span>
        </div>
      )}
    </div>
  );
};
