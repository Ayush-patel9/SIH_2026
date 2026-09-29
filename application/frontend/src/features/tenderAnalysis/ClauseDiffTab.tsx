import React, { useState } from 'react';
import type { FinalizedClauseDiff } from './types';
import { Copy, Check, ShieldAlert, FileText, ArrowRight, ExternalLink } from 'lucide-react';

interface ClauseDiffTabProps {
  clauseDiffs: FinalizedClauseDiff[];
  onPageClick: (page: number, highlightText?: string) => void;
}

export const ClauseDiffTab: React.FC<ClauseDiffTabProps> = ({
  clauseDiffs,
  onPageClick,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyClause = async (clause: FinalizedClauseDiff) => {
    const textToCopy = `${clause.clause_number}:\n${clause.modernized_clause}\n\n${clause.added_qco_clause || ''}\n\n${clause.added_nabl_clause || ''}`.trim();
    await navigator.clipboard.writeText(textToCopy);
    setCopiedId(clause.product_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = async () => {
    const fullText = clauseDiffs
      .map(
        (c) =>
          `### ${c.clause_number} — ${c.product_name}\n${c.modernized_clause}\n\n${c.added_qco_clause || ''}\n\n${c.added_nabl_clause || ''}`.trim()
      )
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (!clauseDiffs || clauseDiffs.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '48px 24px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          textAlign: 'center',
          color: 'var(--ink-muted)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px 0' }}>
          No Finalized Clauses Yet
        </h3>
        <p style={{ fontSize: '13.5px', maxWidth: '500px', margin: '0 auto 18px', lineHeight: 1.5, color: 'var(--ink-secondary)' }}>
          Review the Product ↔ IS Inventory tab and click "Finalize Tender & Modernize Clauses" to generate full redline diffs and statutory citations.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner with Copy All */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 2px 0' }}>
            Clause-by-Clause Modernization & Redline Diffs
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', margin: 0 }}>
            {clauseDiffs.length} tender clauses reconstructed with mandatory Quality Control Orders and NABL test protocols.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          style={{
            backgroundColor: 'var(--olive-primary)',
            color: '#FFFFFF',
            border: 'none',
            padding: '9px 16px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transition: 'all 0.15s ease',
          }}
        >
          {copiedAll ? <Check size={14} /> : <Copy size={14} />}
          <span>{copiedAll ? '✓ All Clauses Copied' : 'Copy All Modernized Clauses'}</span>
        </button>
      </div>

      {/* Diff Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {clauseDiffs.map((clause) => {
          const isCopied = copiedId === clause.product_id;

          return (
            <div
              key={clause.product_id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '10px',
                border: '1px solid var(--hairline)',
                padding: '22px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Clause Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--font-data, monospace)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    {clause.clause_number}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                    {clause.product_name}
                  </h4>

                  <button
                    type="button"
                    onClick={() => onPageClick(clause.page_number, clause.verbatim_quote)}
                    style={{
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--collapse-cobalt)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                    title={`Jump to Page ${clause.page_number}`}
                  >
                    <span>📍 Page {clause.page_number}</span>
                    <ExternalLink size={10} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--emerald-bg)',
                      color: 'var(--emerald-pass)',
                      fontFamily: 'var(--font-data, monospace)',
                      border: '1px solid var(--emerald-border)',
                    }}
                  >
                    Designated: {clause.designated_standard}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyClause(clause)}
                    style={{
                      backgroundColor: isCopied ? 'var(--emerald-pass)' : 'var(--surface-secondary)',
                      color: isCopied ? '#FFFFFF' : 'var(--ink)',
                      border: '1px solid var(--hairline)',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy Clause'}</span>
                  </button>
                </div>
              </div>

              {/* Side-by-side or stacked Before/After Redline comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                {/* Original Clause Box */}
                <div
                  style={{
                    backgroundColor: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--error-red)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-data)' }}>
                    ORIGINAL TENDER SPECIFICATION (AUDIT EXPOSURE)
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--error-red)', fontFamily: 'monospace' }}>
                    {clause.original_clause}
                  </div>
                </div>

                {/* Modernized Clause Box */}
                <div
                  style={{
                    backgroundColor: 'var(--emerald-bg)',
                    border: '1px solid var(--emerald-border)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--emerald-pass)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-data)' }}>
                    MODERNIZED STATUTORY CLAUSE (GFR & CVC COMPLIANT)
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--emerald-text)', fontFamily: 'monospace' }}>
                    {clause.modernized_clause}
                  </div>
                </div>
              </div>

              {/* Added Mandatory QCO Clause Block */}
              {clause.added_qco_clause && (
                <div
                  style={{
                    backgroundColor: 'var(--amber-bg)',
                    border: '1px solid var(--amber-border)',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber-warn)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-data)' }}>
                    ⚡ MANDATORY QUALITY CONTROL ORDER CLAUSE INSERTION:
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--amber-warn)', lineHeight: 1.5, fontFamily: 'monospace' }}>
                    {clause.added_qco_clause}
                  </div>
                </div>
              )}

              {/* Added Mandatory NABL Testing Clause Block */}
              {clause.added_nabl_clause && (
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--collapse-cobalt)', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-data)' }}>
                    🔬 MANDATORY NABL LABORATORY TEST CLAUSE INSERTION:
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--collapse-cobalt)', lineHeight: 1.5, fontFamily: 'monospace' }}>
                    {clause.added_nabl_clause}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
