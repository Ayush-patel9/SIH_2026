import React, { useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, ShieldAlert, AlertTriangle, X, Zap, HelpCircle } from 'lucide-react';

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
          bg: 'var(--emerald-bg)',
          border: 'var(--emerald-border)',
          color: 'var(--emerald-pass)',
          icon: <CheckCircle2 size={12} />,
          label: 'ACTIVE / COMPLIANT',
        };
      case 'WITHDRAWN':
        return {
          bg: 'var(--error-bg)',
          border: 'var(--error-border)',
          color: 'var(--error-red)',
          icon: <X size={12} />,
          label: 'WITHDRAWN / OUTDATED',
        };
      case 'AMENDMENT_NEEDED':
        return {
          bg: 'var(--amber-bg)',
          border: 'var(--amber-border)',
          color: 'var(--amber-warn)',
          icon: <AlertTriangle size={12} />,
          label: 'AMENDMENT REQUIRED',
        };
      case 'MISSING_ALLIED':
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.3)',
          color: 'var(--collapse-cobalt)',
          icon: <ShieldAlert size={12} />,
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
            style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--error-red)' }}
          >
            {clauses.filter((c) => c.status === 'WITHDRAWN').length} Outdated
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeFilter === 'AMENDMENT' ? 'active' : ''}`}
            onClick={() => setActiveFilter('AMENDMENT')}
            style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--amber-warn)' }}
          >
            {clauses.filter((c) => c.status === 'AMENDMENT_NEEDED' || c.status === 'MISSING_ALLIED').length} Amend
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ACTIVE')}
            style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--emerald-pass)' }}
          >
            {clauses.filter((c) => c.status === 'ACTIVE').length} Valid
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
                background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'var(--surface)',
                border: `1.5px solid ${isSelected ? 'var(--collapse-cobalt)' : 'var(--hairline)'}`,
                borderLeft: `5px solid ${badge.border}`,
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {/* Top Row: Clause Header & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontWeight: 800, fontSize: '13px', color: 'var(--ink)' }}>
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
                        fontWeight: 700,
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
                        background: 'var(--emerald-bg)',
                        color: 'var(--emerald-pass)',
                        border: '1px solid var(--emerald-border)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircle2 size={10} />
                      <span>FIXED</span>
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
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                  }}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
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
                  background: 'var(--surface-secondary)',
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
                    background: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    fontSize: '11.5px',
                    fontFamily: 'var(--font-data)',
                  }}
                >
                  <div style={{ color: 'var(--error-red)', marginBottom: '3px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={12} />
                    <span><strong>Discard:</strong> {clause.discardStandard || clause.detectedStandard} (Outdated)</span>
                  </div>
                  <div style={{ color: 'var(--emerald-pass)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    <span><strong>Use Instead:</strong> {clause.useStandard || clause.replacement}</span>
                  </div>
                </div>
              )}

              {/* Bottom Row: Detected Standard and Action Hint */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-data)' }}>
                <div>
                  <span style={{ color: 'var(--ink-muted)' }}>Cited Standard: </span>
                  <strong style={{ color: 'var(--ink)', fontWeight: 800 }}>{clause.detectedStandard}</strong>
                  {clause.replacement && (
                    <span style={{ color: 'var(--emerald-pass)', marginLeft: '6px', fontWeight: 700 }}>
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
                      style={{ fontSize: '10.5px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Zap size={11} />
                      <span>Fix Clause</span>
                    </button>
                  )}
                  <span style={{ color: 'var(--collapse-cobalt)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{isSelected ? 'Viewing Legal Impact' : 'Click to Inspect'}</span>
                    <ArrowRight size={12} />
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
