import React from 'react';
import type { StalenessRisk, StalenessRiskLevel } from '../../types';

interface StalenessRiskBannerProps {
  risk?: StalenessRisk | null;
  className?: string;
}

const RISK_CONFIG: Record<
  StalenessRiskLevel,
  {
    bg: string;
    border: string;
    color: string;
    badgeBg: string;
    icon: string;
    defaultLabel: string;
  }
> = {
  NONE: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    color: 'var(--emerald-pass)',
    badgeBg: '#DCFCE7',
    icon: '✓',
    defaultLabel: 'All Recommended Standards Are Active and Gazetted',
  },
  LOW: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    color: 'var(--collapse-cobalt)',
    badgeBg: '#DBEAFE',
    icon: '📋',
    defaultLabel: 'Standard Active — Routine Gazette Surveillance',
  },
  MEDIUM: {
    bg: '#FAF5FF',
    border: '#E9D5FF',
    color: 'var(--superposition-violet)',
    badgeBg: '#F3E8FF',
    icon: '🔔',
    defaultLabel: 'Standard Under Technical Committee Revision',
  },
  HIGH: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    color: '#B45309',
    badgeBg: '#FEF3C7',
    icon: '⚠️',
    defaultLabel: 'Gazette Amendment Published — Revision Required',
  },
  CRITICAL: {
    bg: '#FEF2F2',
    border: '#FECACA',
    color: 'var(--error-line)',
    badgeBg: '#FEE2E2',
    icon: '🔴',
    defaultLabel: 'Standard WITHDRAWN or Superseded — Immediate Corrigendum Required',
  },
};

export const StalenessRiskBanner: React.FC<StalenessRiskBannerProps> = ({ risk, className = '' }) => {
  if (!risk) return null;

  const level = (risk.risk_level || 'NONE').toUpperCase() as StalenessRiskLevel;
  const config = RISK_CONFIG[level] || RISK_CONFIG.NONE;

  return (
    <div
      className={className}
      style={{
        padding: '12px 16px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: config.badgeBg,
              color: config.color,
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {config.icon}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: config.color,
            }}
          >
            PROACTIVE STALENESS RISK: {level}
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '11px',
            color: 'var(--ink-secondary)',
          }}
        >
          BIS GAZETTE MONITORING ACTIVE
        </span>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-prose)',
          fontSize: '13px',
          color: 'var(--ink)',
          lineHeight: '1.45',
        }}
      >
        {risk.message || config.defaultLabel}
      </div>

      {risk.standards_under_revision && risk.standards_under_revision.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
            Standards under revision:
          </span>
          {risk.standards_under_revision.map((std, idx) => (
            <span
              key={idx}
              className="badge-code"
              style={{
                background: config.badgeBg,
                color: config.color,
                border: `1px solid ${config.border}`,
                padding: '2px 6px',
                fontSize: '11px',
              }}
            >
              {std}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
