import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, FileText, ChevronRight } from 'lucide-react';
import type { TenderClauseAnnotation } from './TenderClauseHighlighter';

interface UseDiscardSuggestionsCardProps {
  clauses: TenderClauseAnnotation[];
  onSelectClause: (clause: TenderClauseAnnotation) => void;
  onApplyFix: (clauseId: string) => void;
  onOpenWorkbench?: (standard: string) => void;
  onJumpToPage?: (page: number, quote?: string) => void;
}

export const UseDiscardSuggestionsCard: React.FC<UseDiscardSuggestionsCardProps> = ({
  clauses,
  onSelectClause,
  onApplyFix,
  onOpenWorkbench,
  onJumpToPage,
}) => {
  const [filter, setFilter] = React.useState<'ALL' | 'ACTION_NEEDED' | 'WITHDRAWN' | 'AMENDMENT'>('ACTION_NEEDED');

  const outdatedClauses = clauses.filter((c) => c.status === 'WITHDRAWN');
  const amendmentClauses = clauses.filter((c) => c.status === 'AMENDMENT_NEEDED');
  const missingAlliedClauses = clauses.filter((c) => c.status === 'MISSING_ALLIED');
  const activeClauses = clauses.filter((c) => c.status === 'ACTIVE');

  const filteredList = clauses.filter((c) => {
    if (filter === 'ACTION_NEEDED') return c.status !== 'ACTIVE';
    if (filter === 'WITHDRAWN') return c.status === 'WITHDRAWN';
    if (filter === 'AMENDMENT') return c.status === 'AMENDMENT_NEEDED' || c.status === 'MISSING_ALLIED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner Overview */}
      <div
        className="workbench-card"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
          border: '1px solid var(--hairline)',
          borderLeft: '4px solid var(--collapse-cobalt)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge active">RAG STANDARDS RETRIEVAL & AUDIT</span>
              <span className="section-label" style={{ margin: 0 }}>SPECIFICATION MODERNIZATION</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              "Use These vs Discard These" Standards Intelligence
            </h3>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '4px 0 0 0' }}>
              AI-driven supersession diff: Discard legacy, withdrawn, or non-QCO compliant citations and seamlessly adopt current Bureau of Indian Standards (BIS) revisions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
                {outdatedClauses.length}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#991b1b', fontWeight: 600 }}>
                DISCARD (WITHDRAWN)
              </div>
            </div>

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 800, color: '#ca8a04' }}>
                {amendmentClauses.length + missingAlliedClauses.length}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#854d0e', fontWeight: 600 }}>
                AMEND / ADD ALLIED
              </div>
            </div>

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>
                {activeClauses.length}
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#15803d', fontWeight: 600 }}>
                VERIFIED ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`mode-toggle-btn ${filter === 'ACTION_NEEDED' ? 'active' : ''}`}
            onClick={() => setFilter('ACTION_NEEDED')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            ⚠ Action Needed ({outdatedClauses.length + amendmentClauses.length + missingAlliedClauses.length})
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${filter === 'WITHDRAWN' ? 'active' : ''}`}
            onClick={() => setFilter('WITHDRAWN')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🔴 Discard These ({outdatedClauses.length})
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${filter === 'AMENDMENT' ? 'active' : ''}`}
            onClick={() => setFilter('AMENDMENT')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🟡 Amendments & Allied ({amendmentClauses.length + missingAlliedClauses.length})
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            All Clauses ({clauses.length})
          </button>
        </div>
      </div>

      {/* Suggestion Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredList.map((clause) => {
          const isWithdrawn = clause.status === 'WITHDRAWN';
          const isAmendment = clause.status === 'AMENDMENT_NEEDED';
          const isAllied = clause.status === 'MISSING_ALLIED';
          const isActive = clause.status === 'ACTIVE';

          const discardTitle = clause.discardStandard || clause.detectedStandard || 'Legacy Specification';
          const useTitle = clause.useStandard || clause.replacement || 'Latest BIS Standard Specification';

          return (
            <div
              key={clause.id}
              className="workbench-card"
              style={{
                borderLeft: `5px solid ${
                  isWithdrawn ? '#dc2626' : isAmendment ? '#ca8a04' : isAllied ? '#2563eb' : '#16a34a'
                }`,
                background: clause.fixed ? 'rgba(34, 197, 94, 0.03)' : 'var(--paper)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                      {clause.clauseNumber}: {clause.clauseTitle}
                    </span>
                    {clause.pageNumber && (
                      <span
                        onClick={() => onJumpToPage && onJumpToPage(clause.pageNumber!, clause.verbatimQuote || clause.rawText)}
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-data)',
                          color: 'var(--collapse-cobalt)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <FileText size={11} /> Page {clause.pageNumber}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                    Current Document Wording: <em>"{clause.rawText}"</em>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {clause.fixed ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-data)',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#15803d',
                        border: '1px solid #16a34a',
                      }}
                    >
                      ✓ MODIFIED & FIXED
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-data)',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isWithdrawn
                          ? 'rgba(239, 68, 68, 0.12)'
                          : isAmendment
                          ? 'rgba(234, 179, 8, 0.15)'
                          : isAllied
                          ? 'rgba(59, 130, 246, 0.12)'
                          : 'rgba(34, 197, 94, 0.12)',
                        color: isWithdrawn
                          ? '#b91c1c'
                          : isAmendment
                          ? '#854d0e'
                          : isAllied
                          ? '#1d4ed8'
                          : '#15803d',
                        border: `1px solid ${
                          isWithdrawn ? '#dc2626' : isAmendment ? '#ca8a04' : isAllied ? '#2563eb' : '#16a34a'
                        }`,
                      }}
                    >
                      {isWithdrawn
                        ? '🔴 WITHDRAWN / OUTDATED'
                        : isAmendment
                        ? '🟡 AMENDMENT NEEDED'
                        : isAllied
                        ? '🔵 MISSING ALLIED SPEC'
                        : '🟢 ACTIVE & COMPLIANT'}
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Column Suggestion Box: DISCARD THESE vs USE THESE */}
              {!isActive && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  {/* Left Column: DISCARD THESE */}
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.04)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px' }}>❌</span>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.05em' }}>
                        DISCARD THESE (OUTDATED / INVALID)
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>
                      {discardTitle}
                    </div>

                    <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: '#7f1d1d', margin: 0, lineHeight: 1.45 }}>
                      {clause.whyDiscard ||
                        'Standard has been officially superseded or withdrawn by BIS. Continuing to cite legacy revisions in public NIT tenders introduces statutory audit vulnerability.'}
                    </p>
                  </div>

                  {/* Right Column: USE THESE */}
                  <div
                    style={{
                      background: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 800, color: '#15803d', letterSpacing: '0.05em' }}>
                        USE THESE (ACTIVE / COMPLIANT)
                      </span>
                    </div>

                    <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700, color: '#14532d', marginBottom: '4px' }}>
                      {useTitle}
                    </div>

                    <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: '#166534', margin: 0, lineHeight: 1.45 }}>
                      {clause.suggestedClauseText ||
                        'Adopt the latest unified Indian Standard specification with compulsory BIS Certification and current test amendments.'}
                    </p>

                    {clause.qcoMandate && (
                      <div
                        style={{
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-data)',
                          fontWeight: 700,
                          color: '#854d0e',
                          background: 'rgba(234, 179, 8, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        ⚖️ QCO Mandate: {clause.qcoMandate}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legal & CVC Risk Insight */}
              {clause.cvcRiskNote && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <ShieldAlert size={14} color={isWithdrawn ? '#dc2626' : '#2563eb'} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--ink)' }}>CVC & Statutory Audit Mandate: </strong>
                    {clause.cvcRiskNote}
                  </div>
                </div>
              )}

              {/* Allied Standards Tags */}
              {clause.alliedStandards && clause.alliedStandards.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                    Mandatory Allied Test Standards:
                  </span>
                  {clause.alliedStandards.map((std, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '10.5px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        color: 'var(--ink)',
                      }}
                    >
                      🔗 {std}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--hairline)', paddingTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onSelectClause(clause)}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  Inspect in PDF Viewer →
                </button>

                {onOpenWorkbench && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onOpenWorkbench(clause.detectedStandard)}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Graph Workbench ➔
                  </button>
                )}

                {!isActive && (
                  <button
                    type="button"
                    className="btn-run"
                    onClick={() => onApplyFix(clause.id)}
                    disabled={clause.fixed}
                    style={{ fontSize: '11px', padding: '4px 12px' }}
                  >
                    {clause.fixed ? '✓ Suggestion Applied' : '⚡ Discard & Use Modern Standard'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
