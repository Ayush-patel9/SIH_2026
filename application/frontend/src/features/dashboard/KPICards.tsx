import React, { useState, useEffect } from 'react';
import type { DashboardMetrics } from './metricsAggregator';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const duration = 600;
    const steps = 24;
    const stepTime = duration / steps;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.round(increment * step));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {current.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'TOTAL QUERIES SCREENED',
      numericValue: metrics.totalQueries,
      suffix: '',
      accentColor: 'var(--ink)',
      badgeBg: 'var(--surface-secondary)',
      badgeColor: 'var(--ink-secondary)',
      delta: '+18.4% MoM',
      subtext: 'Across 90-day surveillance window',
    },
    {
      label: 'OFFICIAL AUDIT RECORDS',
      numericValue: metrics.officialRecommendations,
      suffix: '',
      accentColor: 'var(--focus-blue)',
      badgeBg: 'rgba(37, 99, 235, 0.08)',
      badgeColor: 'var(--focus-blue)',
      delta: 'CVC Compliant',
      subtext: 'SHA-256 locked & verifiable',
    },
    {
      label: 'EXPERT TRUST SCORE',
      numericValue: metrics.trustScorePercent,
      suffix: '%',
      accentColor: 'var(--emerald-pass)',
      badgeBg: 'var(--emerald-bg)',
      badgeColor: 'var(--emerald-text)',
      delta: `${metrics.verifiedCorrections} Verified`,
      subtext: 'Human-in-the-loop consensus',
    },
    {
      label: 'PENDING MODERATIONS',
      numericValue: metrics.pendingFeedback,
      suffix: '',
      accentColor: 'var(--saffron)',
      badgeBg: 'var(--saffron-bg)',
      badgeColor: 'var(--saffron-text)',
      delta: 'Action Required',
      subtext: 'Awaiting BIS expert review',
    },
    {
      label: 'STANDARDS MONITORED',
      numericValue: metrics.standardsCovered,
      suffix: '',
      accentColor: 'var(--superposition-violet)',
      badgeBg: 'var(--superposition-bg)',
      badgeColor: 'var(--superposition-violet)',
      delta: 'Active Gazette',
      subtext: '14 BIS Technical Divisions',
    },
    {
      label: 'OUTDATED INTERCEPTIONS',
      numericValue: 108,
      suffix: '',
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
            <AnimatedNumber target={card.numericValue} suffix={card.suffix} />
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

