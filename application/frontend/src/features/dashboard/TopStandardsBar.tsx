/**
 * TopStandardsBar.tsx
 * Horizontal standard frequency bar chart with error/correction overlay rates.
 */

import React, { useState } from 'react';

interface TopStandardsBarProps {
  standardsQueried: Record<string, number>;
  feedbackByStandard: Record<string, { corrections: number; verified: number; latestIssue?: string }>;
  onSelectStandard?: (isNumber: string) => void;
}

const STANDARD_TITLES: Record<string, { title: string; division: string }> = {
  'IS 269:2015': { title: 'Ordinary Portland Cement — Specification', division: 'CED 2' },
  'IS 2062:2011': { title: 'Hot Rolled Medium and High Tensile Structural Steel', division: 'MTD 4' },
  'IS 456:2000': { title: 'Plain and Reinforced Concrete — Code of Practice', division: 'CED 2' },
  'IS 1786:2008': { title: 'High Strength Deformed Steel Bars and Wires for Concrete', division: 'CED 54' },
  'IS 383:2016': { title: 'Coarse and Fine Aggregate for Concrete — Specification', division: 'CED 2' },
  'IS 800:2007': { title: 'General Construction in Steel — Code of Practice', division: 'CED 7' },
  'IS 694:2010': { title: 'PVC Insulated Cables for Working Voltages up to 1100 V', division: 'ETD 9' },
  'IS 1161:2014': { title: 'Steel Tubes for Structural Purposes — Specification', division: 'MTD 19' },
  'IS 10262:2019': { title: 'Concrete Mix Proportioning — Guidelines', division: 'CED 2' },
  'IS 8112:1989': { title: '43 Grade Ordinary Portland Cement (WITHDRAWN / SUPERSEDED)', division: 'CED 2' },
};

export const TopStandardsBar: React.FC<TopStandardsBarProps> = ({
  standardsQueried,
  feedbackByStandard,
  onSelectStandard,
}) => {
  const [hoveredStandard, setHoveredStandard] = useState<string | null>(null);

  const sorted = Object.entries(standardsQueried)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const maxCount = sorted[0]?.[1] || 1;

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
            MOST-QUERIED STANDARDS & DISPUTE RATES
          </div>
          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Frequency of procurement citations vs. flagged technical discrepancies
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--ink-secondary)' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--collapse-cobalt)', borderRadius: '2px' }} />
            Query Volume
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--ink-secondary)' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--signal-amber)', borderRadius: '2px' }} />
            Dispute / Correction
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.map(([isNum, count]) => {
          const info = STANDARD_TITLES[isNum] || { title: 'Indian Standard Specification', division: 'BIS' };
          const feedback = feedbackByStandard[isNum] || { corrections: 0, verified: 0 };
          const correctionRate = count > 0 ? (feedback.corrections / count) * 100 : 0;
          const isSuperseded = isNum.includes('8112');
          const isHovered = hoveredStandard === isNum;

          return (
            <div
              key={isNum}
              onMouseEnter={() => setHoveredStandard(isNum)}
              onMouseLeave={() => setHoveredStandard(null)}
              onClick={() => onSelectStandard && onSelectStandard(isNum)}
              style={{
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '4px',
                backgroundColor: isHovered ? 'var(--paper)' : 'transparent',
                transition: 'background-color 0.15s ease',
                border: isHovered ? '1px solid var(--hairline)' : '1px solid transparent',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isSuperseded ? 'var(--error-line)' : 'var(--collapse-cobalt)',
                    }}
                  >
                    {isNum}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '10px',
                      color: 'var(--ink-muted)',
                      backgroundColor: 'var(--surface)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    {info.division}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-prose)',
                      fontSize: '11px',
                      color: 'var(--ink-secondary)',
                      maxWidth: '300px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {info.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600 }}>
                    {count.toLocaleString('en-IN')} <span style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>queries</span>
                  </span>
                  {correctionRate > 5 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '10px',
                        color: correctionRate > 15 ? 'var(--error-line)' : 'var(--signal-amber)',
                        fontWeight: 600,
                      }}
                      title={`Correction rate: ${correctionRate.toFixed(1)}%`}
                    >
                      ⚠️ {correctionRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Bar Track */}
              <div
                style={{
                  position: 'relative',
                  height: '8px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--hairline)',
                }}
              >
                {/* Query volume bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${(count / maxCount) * 100}%`,
                    backgroundColor: isSuperseded ? 'var(--error-line)' : 'var(--collapse-cobalt)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />

                {/* Correction rate overlay bar */}
                {feedback.corrections > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${Math.min(100, (feedback.corrections / maxCount) * 100 * 2.5)}%`,
                      backgroundColor: 'var(--signal-amber)',
                      borderRadius: '4px',
                      opacity: 0.85,
                    }}
                  />
                )}
              </div>

              {/* Hover detail notes */}
              {isHovered && feedback.latestIssue && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-data)',
                    color: 'var(--ink-secondary)',
                    backgroundColor: 'var(--surface)',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    borderLeft: '2px solid var(--signal-amber)',
                  }}
                >
                  <strong>Latest Review Note:</strong> {feedback.latestIssue}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
