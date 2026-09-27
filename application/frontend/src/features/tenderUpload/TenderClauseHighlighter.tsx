import React, { useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface TenderClauseAnnotation {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  rawText: string;
  verbatimQuote?: string;
  pageNumber?: number;
  pageLocation?: string;
  detectedStandard: string;
  status: 'ACTIVE' | 'WITHDRAWN' | 'AMENDMENT_NEEDED' | 'MISSING_ALLIED';
  confidence: number;
  discardStandard?: string;
  useStandard?: string;
  whyDiscard?: string;
  actionType?: string;
  replacement?: string;
  cvcRiskNote?: string;
  alliedStandards?: string[];
  suggestedClauseText?: string;
  qcoMandate?: string;
  isMandatory?: boolean;
  fixed?: boolean;
}

interface TenderClauseHighlighterProps {
  clauses: TenderClauseAnnotation[];
  selectedClauseId: string | null;
  onSelectClause: (clause: TenderClauseAnnotation) => void;
  onFixClause?: (clauseId: string) => void;
  onJumpToPage?: (page: number, quote?: string) => void;
}

export const TenderClauseHighlighter: React.FC<TenderClauseHighlighterProps> = ({
  clauses,
  selectedClauseId,
  onSelectClause,
  onFixClause,
  onJumpToPage,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WITHDRAWN' | 'AMENDMENT' | 'ACTIVE'>('ALL');

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
          label: 'WITHDRAWN / OUTDATED',
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

  const filteredClauses = clauses.filter((c) => {
    if (activeFilter === 'WITHDRAWN') return c.status === 'WITHDRAWN';
    if (activeFilter === 'AMENDMENT') return c.status === 'AMENDMENT_NEEDED' || c.status === 'MISSING_ALLIED';
    if (activeFilter === 'ACTIVE') return c.status === 'ACTIVE';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Header & Filter Chips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span className="section-label" style={{ margin: 0 }}>
          CLAUSE-BY-CLAUSE ANNOTATION STREAM ({clauses.length} DETECTED)
        </span>
        <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
          <button
            type="button"
            className={`mode-toggle-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
            style={{ fontSize: '10px', padding: '2px 6px' }}
          >
            All ({clauses.length})
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeFilter === 'WITHDRAWN' ? 'active' : ''}`}
            onClick={() => setActiveFilter('WITHDRAWN')}
            style={{ fontSize: '10px', padding: '2px 6px', color: '#dc2626' }}
          >
            ● {clauses.filter((c) => c.status === 'WITHDRAWN').length} Outdated
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeFilter === 'AMENDMENT' ? 'active' : ''}`}
            onClick={() => setActiveFilter('AMENDMENT')}
            style={{ fontSize: '10px', padding: '2px 6px', color: '#ca8a04' }}
          >
            ● {clauses.filter((c) => c.status === 'AMENDMENT_NEEDED' || c.status === 'MISSING_ALLIED').length} Amend
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ACTIVE')}
            style={{ fontSize: '10px', padding: '2px 6px', color: '#16a34a' }}
          >
            ● {clauses.filter((c) => c.status === 'ACTIVE').length} Valid
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredClauses.map((clause) => {
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
                  {clause.pageNumber && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onJumpToPage) {
                          onJumpToPage(clause.pageNumber!, clause.verbatimQuote || clause.rawText);
                        } else {
                          onSelectClause(clause);
                        }
                      }}
                      style={{
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-data)',
                        color: 'var(--collapse-cobalt)',
                        background: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                      title="Jump directly to this page in the PDF viewer"
                    >
                      <FileText size={10} /> Page {clause.pageNumber}
                    </button>
                  )}
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

              {/* Raw Text with Quote Highlight */}
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

              {/* Suggestions: Discard vs Use */}
              {clause.status !== 'ACTIVE' && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    fontSize: '11.5px',
                    fontFamily: 'var(--font-data)',
                  }}
                >
                  <div style={{ color: '#991b1b', marginBottom: '3px' }}>
                    ❌ <strong>Discard:</strong> {clause.discardStandard || clause.detectedStandard} (Outdated)
                  </div>
                  <div style={{ color: '#15803d', fontWeight: 600 }}>
                    ✅ <strong>Use Instead:</strong> {clause.useStandard || clause.replacement}
                  </div>
                </div>
              )}

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

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {onFixClause && !clause.fixed && clause.status !== 'ACTIVE' && (
                    <button
                      type="button"
                      className="btn-run"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFixClause(clause.id);
                      }}
                      style={{ fontSize: '10.5px', padding: '2px 8px' }}
                    >
                      ⚡ Fix Clause
                    </button>
                  )}
                  <span style={{ color: 'var(--collapse-cobalt)', fontWeight: 600 }}>
                    {isSelected ? 'Viewing Legal Impact ➔' : 'Click to Inspect →'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
