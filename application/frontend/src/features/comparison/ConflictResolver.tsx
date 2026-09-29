import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, Award, X } from 'lucide-react';
import type { ConflictResolution } from '../../types';

interface ConflictResolverProps {
  conflict?: ConflictResolution | null;
  className?: string;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({ conflict, className = '' }) => {
  if (!conflict) return null;

  const gapPercent = (conflict.confidence_gap * 100).toFixed(1);
  const isStrong = conflict.confidence_gap >= 0.15;

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
        gap: '10px',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={18} color="#B45309" />
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
            STATUTORY CONFLICT RESOLUTION & PRECEDENCE RULE
          </span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: isStrong ? '#DCFCE7' : '#FEF3C7',
            color: isStrong ? 'var(--emerald-pass)' : '#B45309',
            border: `1px solid ${isStrong ? '#BBF7D0' : '#FDE68A'}`,
            fontFamily: 'var(--font-data)',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {isStrong ? (
            <>
              <CheckCircle2 size={12} />
              <span>HIGH CERTAINTY PRECEDENCE</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} />
              <span>MARGINAL PREFERENCE</span>
            </>
          )}
        </span>
      </div>

      {/* Precedence Matchup Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid var(--collapse-cobalt)',
            padding: '4px 10px',
            borderRadius: '4px',
          }}
        >
          <Award size={13} color="var(--collapse-cobalt)" />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
            APPLICABLE: {conflict.winner}
          </span>
        </div>

        <span style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700, color: 'var(--ink-secondary)' }}>
          OVER
        </span>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FFFFFF',
            border: '1px solid var(--hairline)',
            padding: '4px 10px',
            borderRadius: '4px',
            opacity: 0.85,
          }}
        >
          <X size={12} color="var(--ink-muted)" />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink-secondary)' }}>
            NON-PRIMARY: {conflict.loser}
          </span>
        </div>
      </div>

      {/* Governing Rule Text */}
      <div
        style={{
          fontFamily: 'var(--font-prose)',
          fontSize: '14px',
          color: 'var(--ink)',
          lineHeight: '1.5',
          background: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: '4px',
          border: '1px solid #FDE68A',
        }}
      >
        <strong style={{ color: '#B45309', fontFamily: 'var(--font-data)', fontSize: '11px', textTransform: 'uppercase', marginRight: '6px' }}>
          LEGAL JUSTIFICATION:
        </strong>
        {conflict.rule}
      </div>

      {/* Confidence Gap interpretation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
            Confidence Delta:
          </span>
          <span className="badge-code" style={{ background: '#FFFFFF', fontWeight: 700, fontSize: '11px' }}>
            +{gapPercent}%
          </span>
          <span style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)' }}>
            {isStrong
              ? 'Clear technical standard match based on ministry codes and IRC guidelines.'
              : 'Close technical alternatives — verify detailed project structural annexures.'}
          </span>
        </div>

        <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
          SEC. 16 BIS ACT COMPLIANCE
        </span>
      </div>
    </div>
  );
};
