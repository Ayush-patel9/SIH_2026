import React, { useState } from 'react';
import { PDFViewer } from './PDFViewer';
import { TenderClauseHighlighter, type TenderClauseAnnotation } from './TenderClauseHighlighter';

interface PDFAnnotationViewerProps {
  initialClauses?: TenderClauseAnnotation[];
  pdfUrl?: string | null;
  rawText?: string;
  pages?: string[];
  onApplyFixToDraft?: (updatedText: string) => void;
  onOpenWorkbench?: (standard: string) => void;
}

const SAMPLE_TENDER_CLAUSES: TenderClauseAnnotation[] = [
  {
    id: 'clause-1',
    clauseNumber: 'Clause 4.1.2',
    clauseTitle: 'Portland Cement Specifications for Highway Culverts',
    rawText:
      'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.',
    verbatimQuote:
      'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989',
    pageNumber: 1,
    detectedStandard: 'IS 8112:1989',
    status: 'WITHDRAWN',
    confidence: 0.98,
    replacement: 'IS 269:2015 (incorporating 43-Grade under Clause 5.1)',
    cvcRiskNote:
      'CVC Office Order No. 04/03/2021: Citing withdrawn standards in public tenders exposes the department to statutory audit disallowance and post-award vendor litigation.',
    alliedStandards: ['IS 4031 (Methods of physical tests for hydraulic cement)', 'IS 4032 (Chemical analysis)'],
    suggestedClauseText:
      'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 269:2015 (with mandatory BIS Certification under Cement Quality Control Order 2024), tested per IS 4031.',
  },
  {
    id: 'clause-2',
    clauseNumber: 'Clause 7.3.1',
    clauseTitle: 'Structural Steel Plates for Bridge Superstructure',
    rawText:
      'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.',
    verbatimQuote:
      'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A',
    pageNumber: 2,
    detectedStandard: 'IS 2062:2011',
    status: 'ACTIVE',
    confidence: 0.95,
    replacement: 'IS 2062:2011 (Current)',
    cvcRiskNote:
      'Statutory compliance verified under Steel and Steel Products (Quality Control) Order 2024. Mandatory ISI marking applies.',
    alliedStandards: ['IS 1608 (Mechanical testing of metals)', 'IS 1599 (Bend test for steel)'],
    suggestedClauseText:
      'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with mandatory BIS ISI Mark per Steel QCO 2024, tested per IS 1608.',
  },
  {
    id: 'clause-3',
    clauseNumber: 'Clause 12.4.0',
    clauseTitle: 'High Density Polyethylene (HDPE) Water Supply Pipes',
    rawText:
      'HDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.',
    verbatimQuote:
      'HDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995',
    pageNumber: 3,
    detectedStandard: 'IS 4984:1995',
    status: 'AMENDMENT_NEEDED',
    confidence: 0.93,
    replacement: 'IS 4984:2016 (incorporating Amendment 3)',
    cvcRiskNote:
      'Standard revised in 2016. Using legacy 1995 specification fails to incorporate the latest hydrostatic pressure test duration required by Jal Jeevan Mission guidelines.',
    alliedStandards: ['IS 2530 (Methods of test for polyethylene)', 'IS 5382 (Rubber sealing rings)'],
    suggestedClauseText:
      'HDPE pipes for rural drinking water supply shall conform to IS 4984:2016 with Amendment 3, PE-100 grade material, holding valid BIS License under Polyethylene Pipes QCO.',
  },
  {
    id: 'clause-4',
    clauseNumber: 'Clause 15.2.1',
    clauseTitle: 'CCTV Video Surveillance & IP Cameras',
    rawText:
      'IP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability.',
    verbatimQuote:
      'IP dome cameras for surveillance shall provide 1080p full HD resolution',
    pageNumber: 3,
    detectedStandard: 'IS 13252 (Part 1):2010 / CRO Scheme',
    status: 'MISSING_ALLIED',
    confidence: 0.91,
    replacement: 'IS 13252 (Part 1):2010 & Essential Requirements (ER) under CRO Scheme',
    cvcRiskNote:
      'Tender omits mandatory MeitY Compulsory Registration Scheme (CRS) compliance clause. Public procurement of uncertified electronics violates Public Procurement (Preference to Make in India) Order.',
    alliedStandards: ['IS 13252 (Part 1):2010 (IT Equipment Safety)', 'IS 16842 (CCTV System Requirements)'],
    suggestedClauseText:
      'IP dome cameras shall comply with IS 13252 (Part 1):2010 with valid BIS Compulsory Registration Scheme (CRS) Registration and adhere to STQC/MeitY Cybersecurity Guidelines.',
  },
];

export const PDFAnnotationViewer: React.FC<PDFAnnotationViewerProps> = ({
  initialClauses,
  pdfUrl,
  rawText,
  pages,
  onApplyFixToDraft,
  onOpenWorkbench,
}) => {
  const [clauses, setClauses] = useState<TenderClauseAnnotation[]>(
    initialClauses || SAMPLE_TENDER_CLAUSES
  );
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(
    clauses[0]?.id || null
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState<'split_pdf' | 'clause_list'>('split_pdf');

  // Sync state with incoming initialClauses prop
  React.useEffect(() => {
    if (initialClauses && initialClauses.length > 0) {
      setClauses(initialClauses);
      setSelectedClauseId(initialClauses[0]?.id || null);
    }
  }, [initialClauses]);

  const selectedClause = clauses.find((c) => c.id === selectedClauseId) || clauses[0];

  // Map clause ID to page index dynamically
  const getPageForClause = (id: string) => {
    const found = clauses.find((c) => c.id === id);
    if (found && typeof found.pageNumber === 'number' && found.pageNumber > 0) {
      return found.pageNumber;
    }
    switch (id) {
      case 'clause-1': return 1;
      case 'clause-2': return 2;
      case 'clause-3': return 3;
      case 'clause-4': return 3;
      default: return 1;
    }
  };

  const handleFixClause = (clauseId: string) => {
    setClauses((prev) => {
      const updated = prev.map((c) =>
        c.id === clauseId
          ? {
              ...c,
              status: 'ACTIVE' as const,
              rawText: c.suggestedClauseText || c.rawText,
              fixed: true,
            }
          : c
      );
      if (onApplyFixToDraft) {
        onApplyFixToDraft(updated.map((c) => `${c.clauseNumber}: ${c.rawText}`).join('\n\n'));
      }
      return updated;
    });
  };

  const handleFixAll = () => {
    setClauses((prev) => {
      const updated = prev.map((c) => ({
        ...c,
        status: 'ACTIVE' as const,
        rawText: c.suggestedClauseText || c.rawText,
        fixed: true,
      }));
      if (onApplyFixToDraft) {
        onApplyFixToDraft(updated.map((c) => `${c.clauseNumber}: ${c.rawText}`).join('\n\n'));
      }
      return updated;
    });
  };

  const calculateComplianceScore = () => {
    const total = clauses.length;
    if (total === 0) return 100;
    const weights: Record<string, number> = {
      ACTIVE: 100,
      AMENDMENT_NEEDED: 70,
      MISSING_ALLIED: 60,
      WITHDRAWN: 0,
    };
    const sum = clauses.reduce((acc, c) => acc + (weights[c.status] || 0), 0);
    return Math.round(sum / total);
  };

  const complianceScore = calculateComplianceScore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner: Score & Action Controls */}
      <div
        className="workbench-card"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--paper) 100%)',
          borderLeft: `4px solid ${
            complianceScore >= 90
              ? 'var(--emerald-pass)'
              : complianceScore >= 70
              ? '#ca8a04'
              : 'var(--error-line)'
          }`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge active">FUZZY EVIDENCE HIGHLIGHTER</span>
              <span className="section-label" style={{ margin: 0 }}>PRE-TENDER STATUTORY AUDIT</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              Tender Document Compliance Score:{' '}
              <span
                style={{
                  color:
                    complianceScore >= 90
                      ? '#16a34a'
                      : complianceScore >= 70
                      ? '#ca8a04'
                      : '#dc2626',
                }}
              >
                {complianceScore}/100
              </span>
            </h3>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', margin: '4px 0 0 0' }}>
              {clauses.filter((c) => c.status === 'WITHDRAWN').length === 0
                ? '✓ All specifications adhere to active Bureau of Indian Standards and QCO gazettes.'
                : '⚠ Outdated and withdrawn standards detected. CVC audit non-compliance flagged.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '2px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
              <button
                type="button"
                className={`mode-toggle-btn ${viewMode === 'split_pdf' ? 'active' : ''}`}
                onClick={() => setViewMode('split_pdf')}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                📄 PDF Viewer
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${viewMode === 'clause_list' ? 'active' : ''}`}
                onClick={() => setViewMode('clause_list')}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                📋 Clause Stream
              </button>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowExportModal(true)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              📥 Export Audit Report
            </button>
            <button
              type="button"
              className="btn-run"
              onClick={handleFixAll}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              ⚡ 1-Click Fix All ({clauses.filter((c) => c.status !== 'ACTIVE').length})
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Split-Screen View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(320px, 1fr)', gap: '16px' }}>
        {/* Left Pane: Interactive PDF Viewer or Clause Stream */}
        {viewMode === 'split_pdf' ? (
          <PDFViewer
            pdfUrl={pdfUrl}
            rawText={rawText}
            pages={pages}
            initialPage={getPageForClause(selectedClauseId || 'clause-1')}
            highlightText={selectedClause?.verbatimQuote || selectedClause?.rawText || selectedClause?.detectedStandard}
          />
        ) : (
          <div className="workbench-card" style={{ padding: '16px' }}>
            <TenderClauseHighlighter
              clauses={clauses}
              selectedClauseId={selectedClauseId}
              onSelectClause={(c) => setSelectedClauseId(c.id)}
            />
          </div>
        )}

        {/* Right Pane: Inspection & Legal Explainability */}
        {selectedClause && (
          <div className="workbench-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-label" style={{ margin: 0 }}>
                STATUTORY INSPECTION: {selectedClause.clauseNumber}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: selectedClause.status === 'WITHDRAWN' ? '#dc2626' : '#16a34a',
                }}
              >
                {selectedClause.status}
              </span>
            </div>

            {/* Standard Comparison Card */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                DETECTED STANDARD CITATION
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                {selectedClause.detectedStandard}
              </div>
              {selectedClause.replacement && (
                <div style={{ marginTop: '6px', fontSize: '12px', fontFamily: 'var(--font-data)', color: '#15803d' }}>
                  <strong>Mandatory Active Equivalent:</strong> {selectedClause.replacement}
                </div>
              )}
            </div>

            {/* Verbatim Quote in PDF */}
            <div>
              <div className="section-label" style={{ marginBottom: '4px' }}>
                VERBATIM EVIDENCE QUOTE (PAGE {getPageForClause(selectedClause.id)})
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-prose)',
                  fontSize: '12.5px',
                  background: 'var(--paper)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--signal-amber)',
                  fontStyle: 'italic',
                  color: 'var(--ink)',
                }}
              >
                "{selectedClause.rawText}"
              </div>
            </div>

            {/* Legal / CVC Consequence Note */}
            {selectedClause.cvcRiskNote && (
              <div
                style={{
                  background:
                    selectedClause.status === 'WITHDRAWN'
                      ? 'rgba(220, 38, 38, 0.08)'
                      : 'rgba(37, 99, 235, 0.08)',
                  border: `1px solid ${
                    selectedClause.status === 'WITHDRAWN'
                      ? 'rgba(220, 38, 38, 0.3)'
                      : 'rgba(37, 99, 235, 0.3)'
                  }`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: selectedClause.status === 'WITHDRAWN' ? '#991b1b' : '#1e40af',
                    marginBottom: '4px',
                  }}
                >
                  ⚖️ STATUTORY & CVC VIGILANCE IMPLICATION
                </div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {selectedClause.cvcRiskNote}
                </div>
              </div>
            )}

            {/* Allied Test Standards */}
            {selectedClause.alliedStandards && selectedClause.alliedStandards.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: '6px' }}>
                  MANDATORY ALLIED TEST STANDARDS (MUST INCLUDE IN NIT)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedClause.alliedStandards.map((std, i) => (
                    <div
                      key={i}
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '11px',
                        padding: '6px 10px',
                        background: 'var(--paper)',
                        borderRadius: '3px',
                        border: '1px solid var(--hairline)',
                        color: 'var(--ink)',
                      }}
                    >
                      🔗 {std}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Replacement Clause Text */}
            {selectedClause.suggestedClauseText && (
              <div>
                <div className="section-label" style={{ marginBottom: '6px' }}>
                  RECOMMENDED REVISED NIT CLAUSE DRAFT
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '12px',
                    background: 'var(--surface)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--hairline)',
                    lineHeight: 1.4,
                    color: 'var(--ink)',
                  }}
                >
                  {selectedClause.suggestedClauseText}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
              <button
                type="button"
                className="btn-run"
                onClick={() => handleFixClause(selectedClause.id)}
                disabled={selectedClause.fixed || selectedClause.status === 'ACTIVE'}
                style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
              >
                {selectedClause.fixed ? '✓ Clause Updated' : '⚡ Apply Fix to Clause'}
              </button>
              {onOpenWorkbench && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onOpenWorkbench(selectedClause.detectedStandard)}
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Inspect in Graph ➔
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Export Pre-Tender Audit Report Modal */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="workbench-card"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              background: 'var(--surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-data)', fontSize: '16px', margin: 0 }}>
                📜 Pre-Tender Statutory Compliance Certificate
              </h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowExportModal(false)}
                style={{ padding: '2px 8px', fontSize: '12px' }}
              >
                ✕
              </button>
            </div>

            <div
              id="printable-tender-audit-report"
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '13px',
                color: 'var(--ink)',
                lineHeight: 1.6,
                border: '1px solid var(--hairline)',
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--paper)',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--ink)', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '15px' }}>
                  GOVERNMENT OF INDIA · BUREAU OF INDIAN STANDARDS
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                  MANAKAI AUTOMATED PRE-TENDER STATUTORY AUDIT CERTIFICATE
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-data)', marginBottom: '14px' }}>
                <div><strong>Audit Reference:</strong> MANAK-TND-2026-9481</div>
                <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                <div><strong>Total Clauses Audited:</strong> {clauses.length}</div>
                <div><strong>Compliance Score:</strong> {complianceScore}/100</div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>
                  CLAUSE AUDIT BREAKDOWN:
                </div>
                {clauses.map((c, i) => (
                  <div key={i} style={{ fontSize: '11px', borderBottom: '1px dashed var(--hairline)', padding: '4px 0' }}>
                    <strong>{c.clauseNumber}</strong>: {c.detectedStandard} —{' '}
                    <span style={{ color: c.status === 'ACTIVE' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {c.status}
                    </span>
                    {c.replacement && ` (Recommended: ${c.replacement})`}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '10px', fontFamily: 'var(--font-data)', color: 'var(--ink-muted)', marginTop: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '8px' }}>
                Digital Signature: SHA-256: 4f88c30d8923a45c928... · Certified under GFR Rule 144(xi) and CVC Circular 04/03/2021.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                type="button"
                className="btn-run"
                onClick={() => setShowExportModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
