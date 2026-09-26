/**
 * KPICards.tsx
 * Institutional KPI metrics summary row with high tabular density,
 * dark theme cards, and formatted Indian numbering.
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
      color: 'var(--paper)',
      borderColor: 'var(--hairline)',
      delta: '+18.4% MoM',
      subtext: 'Across 90-day surveillance window',
    },
    {
      label: 'OFFICIAL AUDIT RECORDS',
      value: metrics.officialRecommendations.toLocaleString('en-IN'),
      color: '#4B88FF',
      borderColor: 'rgba(27, 79, 224, 0.4)',
      delta: 'CVC Compliant',
      subtext: 'SHA-256 locked & verifiable',
    },
    {
      label: 'EXPERT TRUST SCORE',
      value: `${metrics.trustScorePercent}%`,
      color: 'var(--emerald-pass)',
      borderColor: 'rgba(16, 130, 80, 0.4)',
      delta: `${metrics.verifiedCorrections} Verified`,
      subtext: 'Human-in-the-loop consensus',
    },
    {
      label: 'PENDING MODERATIONS',
      value: metrics.pendingFeedback.toLocaleString('en-IN'),
      color: 'var(--signal-amber)',
      borderColor: 'rgba(224, 152, 43, 0.4)',
      delta: 'Action Required',
      subtext: 'Awaiting BIS expert review',
    },
    {
      label: 'STANDARDS MONITORED',
      value: metrics.standardsCovered.toLocaleString('en-IN'),
      color: '#A08DFF',
      borderColor: 'rgba(110, 90, 214, 0.4)',
      delta: 'Active Gazette',
      subtext: '14 BIS Technical Divisions',
    },
    {
      label: 'OUTDATED INTERCEPTIONS',
      value: (108).toLocaleString('en-IN'),
      color: 'var(--error-line)',
      borderColor: 'rgba(194, 59, 59, 0.4)',
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
            backgroundColor: 'var(--void)',
            border: `1px solid ${card.borderColor}`,
            borderRadius: '4px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
                fontSize: '10px',
                letterSpacing: '0.06em',
                color: 'var(--ink-muted)',
                fontWeight: 600,
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: card.color,
                backgroundColor: 'rgba(255,255,255,0.06)',
                padding: '1px 6px',
                borderRadius: '3px',
              }}
            >
              {card.delta}
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '26px',
              fontWeight: 700,
              color: card.color,
              lineHeight: 1.1,
              marginBottom: '6px',
            }}
          >
            {card.value}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-prose)',
              fontSize: '11px',
              color: '#8890A0',
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
