import React from 'react';

export interface TenderClauseAnnotation {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  rawText: string;
  detectedStandard: string;
  status: 'ACTIVE' | 'WITHDRAWN' | 'AMENDMENT_NEEDED' | 'MISSING_ALLIED';
  confidence: number;
  replacement?: string;
  cvcRiskNote?: string;
  alliedStandards?: string[];
  suggestedClauseText?: string;
  fixed?: boolean;
}

interface TenderClauseHighlighterProps {
  clauses: TenderClauseAnnotation[];
  selectedClauseId: string | null;
  onSelectClause: (clause: TenderClauseAnnotation) => void;
  onFixClause?: (clauseId: string) => void;
}

export const TenderClauseHighlighter: React.FC<TenderClauseHighlighterProps> = ({
  clauses,
  selectedClauseId,
  onSelectClause,
}) => {
  const getBadgeStyle = (status: TenderClauseAnnotation['status']) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'rgba(34, 197, 94, 0.12)',
          border: '#16a34a',
          color: '#15803d',
          icon: '🟢',
          label: 'ACTIVE / COMPLIANT',
        };
      case 'WITHDRAWN':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: '#dc2626',
          color: '#b91c1c',
          icon: '🔴',
          label: 'WITHDRAWN / INVALID',
        };
      case 'AMENDMENT_NEEDED':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: '#ca8a04',
          color: '#854d0e',
          icon: '🟡',
          label: 'AMENDMENT REQUIRED',
        };
      case 'MISSING_ALLIED':
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          border: '#2563eb',
          color: '#1d4ed8',
          icon: '🔵',
          label: 'MISSING ALLIED TEST',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-label" style={{ margin: 0 }}>
          CLAUSE-BY-CLAUSE ANNOTATION STREAM ({clauses.length} DETECTED)
        </span>
        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
          <span style={{ color: '#dc2626' }}>● {clauses.filter((c) => c.status === 'WITHDRAWN').length} Outdated</span>
          <span style={{ color: '#ca8a04' }}>● {clauses.filter((c) => c.status === 'AMENDMENT_NEEDED').length} Amend</span>
          <span style={{ color: '#16a34a' }}>● {clauses.filter((c) => c.status === 'ACTIVE').length} Valid</span>
          <span style={{ color: '#2563eb' }}>● {clauses.filter((c) => c.status === 'MISSING_ALLIED').length} Allied</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {clauses.map((clause) => {
          const badge = getBadgeStyle(clause.status);
          const isSelected = selectedClauseId === clause.id;

          return (
            <div
              key={clause.id}
              onClick={() => onSelectClause(clause)}
              style={{
                cursor: 'pointer',
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'var(--paper)',
                border: `1.5px solid ${isSelected ? 'var(--collapse-cobalt)' : 'var(--hairline)'}`,
                borderLeft: `5px solid ${badge.border}`,
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {/* Top Row: Clause Header & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>
                    {clause.clauseNumber}: {clause.clauseTitle}
                  </span>
                  {clause.fixed && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: 'rgba(22, 163, 74, 0.15)',
                        color: '#15803d',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 600,
                      }}
                    >
                      ✓ FIXED
                    </span>
                  )}
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-data)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                  }}
                >
                  {badge.icon} {badge.label}
                </span>
              </div>

              {/* Raw Text with Highlight */}
              <div
                style={{
                  fontFamily: 'var(--font-prose)',
                  fontSize: '13px',
                  color: 'var(--ink-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                  background: 'var(--surface)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  borderLeft: '2px solid var(--hairline)',
                }}
              >
                {clause.rawText}
              </div>

              {/* Bottom Row: Detected Standard and Action Hint */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
                <div>
                  <span style={{ color: 'var(--ink-muted)' }}>Cited Standard: </span>
                  <strong style={{ color: 'var(--ink)' }}>{clause.detectedStandard}</strong>
                  {clause.replacement && (
                    <span style={{ color: '#15803d', marginLeft: '6px' }}>
                      → Replace with <strong>{clause.replacement}</strong>
                    </span>
                  )}
                </div>

                <div style={{ color: 'var(--collapse-cobalt)', fontWeight: 600 }}>
                  {isSelected ? 'Viewing Legal Impact ➔' : 'Click to Inspect →'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
