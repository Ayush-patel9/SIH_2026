/**
 * KPICards.tsx
 * Institutional KPI metrics summary row with high tabular density,
 * crisp white cards, and formatted Indian numbering.
 */

import React from 'react';
import type { DashboardMetrics } from './metricsAggregator';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'TOTAL QUERIES SCREENED',
      value: metrics.totalQueries.toLocaleString('en-IN'),
      accentColor: 'var(--ink)',
      badgeBg: 'var(--surface-secondary)',
      badgeColor: 'var(--ink-secondary)',
      delta: '+18.4% MoM',
      subtext: 'Across 90-day surveillance window',
    },
    {
      label: 'OFFICIAL AUDIT RECORDS',
      value: metrics.officialRecommendations.toLocaleString('en-IN'),
      accentColor: 'var(--focus-blue)',
      badgeBg: 'rgba(37, 99, 235, 0.08)',
      badgeColor: 'var(--focus-blue)',
      delta: 'CVC Compliant',
      subtext: 'SHA-256 locked & verifiable',
    },
    {
      label: 'EXPERT TRUST SCORE',
      value: `${metrics.trustScorePercent}%`,
      accentColor: 'var(--emerald-pass)',
      badgeBg: 'var(--emerald-bg)',
      badgeColor: 'var(--emerald-text)',
      delta: `${metrics.verifiedCorrections} Verified`,
      subtext: 'Human-in-the-loop consensus',
    },
    {
      label: 'PENDING MODERATIONS',
      value: metrics.pendingFeedback.toLocaleString('en-IN'),
      accentColor: 'var(--saffron)',
      badgeBg: 'var(--saffron-bg)',
      badgeColor: 'var(--saffron-text)',
      delta: 'Action Required',
      subtext: 'Awaiting BIS expert review',
    },
    {
      label: 'STANDARDS MONITORED',
      value: metrics.standardsCovered.toLocaleString('en-IN'),
      accentColor: 'var(--superposition-violet)',
      badgeBg: 'var(--superposition-bg)',
      badgeColor: 'var(--superposition-violet)',
      delta: 'Active Gazette',
      subtext: '14 BIS Technical Divisions',
    },
    {
      label: 'OUTDATED INTERCEPTIONS',
      value: (108).toLocaleString('en-IN'),
      accentColor: 'var(--error-red)',
      badgeBg: 'var(--error-bg)',
      badgeColor: 'var(--error-red)',
      delta: '100% Diverted',
      subtext: 'Prevented non-compliant tenders',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '18px',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderTop: `3px solid ${card.accentColor}`,
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '9.5px',
                letterSpacing: '0.06em',
                color: 'var(--ink-muted)',
                fontWeight: 700,
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                fontWeight: 600,
                color: card.badgeColor,
                backgroundColor: card.badgeBg,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {card.delta}
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.1,
              marginBottom: '4px',
            }}
          >
            {card.value}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-prose)',
              fontSize: '11px',
              color: 'var(--ink-muted)',
              lineHeight: 1.3,
            }}
          >
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
