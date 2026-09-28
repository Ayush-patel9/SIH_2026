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
          backgroundColor: '#FFFEFB',
          padding: '48px 24px',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
          textAlign: 'center',
          color: '#6E7A68',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1C2419', margin: '0 0 6px 0' }}>
          No Finalized Clauses Yet
        </h3>
        <p style={{ fontSize: '13.5px', maxWidth: '500px', margin: '0 auto 18px', lineHeight: 1.5 }}>
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
          backgroundColor: '#FFFEFB',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C2419', margin: '0 0 2px 0' }}>
            Clause-by-Clause Modernization & Redline Diffs
          </h3>
          <p style={{ fontSize: '12.5px', color: '#6E7A68', margin: 0 }}>
            {clauseDiffs.length} tender clauses reconstructed with mandatory Quality Control Orders and NABL test protocols.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          style={{
            backgroundColor: '#2D6A4F',
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
                backgroundColor: '#FFFEFB',
                borderRadius: '10px',
                border: '1px solid #E5E0D4',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(54, 69, 47, 0.04)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#F6F3EB',
                      color: '#44503E',
                      fontFamily: 'monospace',
                    }}
                  >
                    {clause.clause_number}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1C2419', margin: 0 }}>
                    {clause.product_name}
                  </h4>

                  <button
                    type="button"
                    onClick={() => onPageClick(clause.page_number, clause.verbatim_quote)}
                    style={{
                      border: '1px solid #BFDBFE',
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
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
                      backgroundColor: '#EDF7F1',
                      color: '#1B4332',
                      fontFamily: 'monospace',
                    }}
                  >
                    Designated: {clause.designated_standard}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyClause(clause)}
                    style={{
                      backgroundColor: isCopied ? '#2D6A4F' : '#FAF8F3',
                      color: isCopied ? '#FFFFFF' : '#1C2419',
                      border: '1px solid #DCD6C8',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
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
                    backgroundColor: '#FDF2F0',
                    border: '1px solid #F7CDC6',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#BA3A2A', textTransform: 'uppercase', marginBottom: '6px' }}>
                    ORIGINAL TENDER SPECIFICATION (AUDIT EXPOSURE)
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#7F1D1D', fontFamily: 'monospace' }}>
                    {clause.original_clause}
                  </div>
                </div>

                {/* Modernized Clause Box */}
                <div
                  style={{
                    backgroundColor: '#EDF7F1',
                    border: '1px solid #B7E4C7',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1B4332', textTransform: 'uppercase', marginBottom: '6px' }}>
                    MODERNIZED STATUTORY CLAUSE (GFR & CVC COMPLIANT)
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#14532D', fontFamily: 'monospace' }}>
                    {clause.modernized_clause}
                  </div>
                </div>
              </div>

              {/* Added Mandatory QCO Clause Block */}
              {clause.added_qco_clause && (
                <div
                  style={{
                    backgroundColor: 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid rgba(217, 119, 6, 0.25)',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ⚡ MANDATORY QUALITY CONTROL ORDER CLAUSE INSERTION:
                  </div>
                  <div style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.5, fontFamily: 'monospace' }}>
                    {clause.added_qco_clause}
                  </div>
                </div>
              )}

              {/* Added Mandatory NABL Testing Clause Block */}
              {clause.added_nabl_clause && (
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    🔬 MANDATORY NABL LABORATORY TEST CLAUSE INSERTION:
                  </div>
                  <div style={{ fontSize: '12px', color: '#1E3A8A', lineHeight: 1.5, fontFamily: 'monospace' }}>
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
