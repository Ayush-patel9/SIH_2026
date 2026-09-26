/**
 * DomainDonutChart.tsx
 * Interactive SVG Donut chart showing query distribution across technical domains.
 */

import React, { useState } from 'react';

interface DomainDonutChartProps {
  domainsQueried: Record<string, number>;
  onSelectDomain?: (domain: string) => void;
}

const DOMAIN_COLOR_PALETTE: Record<string, string> = {
  'Civil & Construction': '#1B4FE0',
  'Metallurgy & Structural Steel': '#6E5AD6',
  'Electrical & Electronics': '#E0982B',
  'Mechanical & Transport': '#108250',
  'Chemicals & Petrochemicals': '#4A5060',
  'Textiles & Safety Wear': '#C23B3B',
};

export const DomainDonutChart: React.FC<DomainDonutChartProps> = ({
  domainsQueried,
  onSelectDomain,
}) => {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const total = Object.values(domainsQueried).reduce((a, b) => a + b, 0) || 1;

  const segments = Object.entries(domainsQueried)
    .map(([domain, count]) => ({
      domain,
      count,
      pct: count / total,
      color: DOMAIN_COLOR_PALETTE[domain] || '#8890A0',
    }))
    .sort((a, b) => b.count - a.count);

  const RADIUS = 64;
  const STROKE_WIDTH = 22;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let cumulativeOffset = 0;
  const arcs = segments.map((seg) => {
    const dash = seg.pct * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const arc = {
      ...seg,
      strokeDasharray: `${dash} ${gap}`,
      strokeDashoffset: -cumulativeOffset,
    };
    cumulativeOffset += dash;
    return arc;
  });

  const activeSegment = hoveredDomain
    ? segments.find((s) => s.domain === hoveredDomain)
    : null;

  return (
    <div className="workbench-card" style={{ height: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <div>
          <div className="section-label" style={{ margin: 0 }}>
            DOMAIN DISTRIBUTION
          </div>
          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Technical classification split of screened procurements
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '170px', height: '170px' }}>
          <svg width="170" height="170" viewBox="0 0 170 170">
            {/* Background Track Circle */}
            <circle
              cx="85"
              cy="85"
              r={RADIUS}
              fill="none"
              stroke="var(--surface)"
              strokeWidth={STROKE_WIDTH}
            />

            {/* Arcs */}
            {arcs.map((arc) => {
              const isHovered = hoveredDomain === arc.domain;
              return (
                <circle
                  key={arc.domain}
                  cx="85"
                  cy="85"
                  r={RADIUS}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isHovered ? STROKE_WIDTH + 4 : STROKE_WIDTH}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  transform="rotate(-90 85 85)"
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredDomain && !isHovered ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setHoveredDomain(arc.domain)}
                  onMouseLeave={() => setHoveredDomain(null)}
                  onClick={() => onSelectDomain && onSelectDomain(arc.domain)}
                />
              );
            })}
          </svg>

          {/* Center Info Text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink-primary)',
                lineHeight: 1,
              }}
            >
              {activeSegment ? (activeSegment.pct * 100).toFixed(1) + '%' : total.toLocaleString('en-IN')}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '9px',
                color: 'var(--ink-muted)',
                marginTop: '3px',
                textTransform: 'uppercase',
                maxWidth: '70px',
                lineHeight: 1.1,
              }}
            >
              {activeSegment ? activeSegment.domain.split(' ')[0] : 'Queries'}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '180px' }}>
          {segments.map((s) => {
            const isHovered = hoveredDomain === s.domain;
            return (
              <div
                key={s.domain}
                onMouseEnter={() => setHoveredDomain(s.domain)}
                onMouseLeave={() => setHoveredDomain(null)}
                onClick={() => onSelectDomain && onSelectDomain(s.domain)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: isHovered ? 'var(--paper)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      backgroundColor: s.color,
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-prose)',
                      fontSize: '11px',
                      fontWeight: isHovered ? 600 : 400,
                      color: 'var(--ink-primary)',
                    }}
                  >
                    {s.domain}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
                    {s.count.toLocaleString('en-IN')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: s.color,
                      minWidth: '40px',
                      textAlign: 'right',
                    }}
                  >
                    {(s.pct * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
