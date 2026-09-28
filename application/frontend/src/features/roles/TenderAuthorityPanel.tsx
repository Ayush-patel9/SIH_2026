import React, { useState } from 'react';
import type { StandardsResponse } from '../../types';
import { PlainLanguageToggle } from '../explainability/PlainLanguageToggle';
import { ConfidenceBreakdownBar } from '../explainability/ConfidenceBreakdownBar';
import { KnowledgeGraphViewer } from '../explainability/KnowledgeGraphViewer';
import { ReasoningTimeline } from '../explainability/ReasoningTimeline';
import { FlagButton, FeedbackModal } from '../feedback';
import { StalenessRiskBanner } from '../alerts';

interface TenderAuthorityPanelProps {
  data: StandardsResponse;
  onOpenNITGenerator?: () => void;
  onOpenCertificate?: () => void;
}

export const TenderAuthorityPanel: React.FC<TenderAuthorityPanelProps> = ({
  data,
  onOpenNITGenerator,
  onOpenCertificate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'drafting' | 'audit_defense'>('drafting');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedClause, setCopiedClause] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const primary = data.primary_recommendation;
  const qco = primary?.certification;
  const audit = data.audit_record;
  const meta = data.meta;
  const hash = audit?.audit_hash || meta.audit_reference_hash;

  const quickClauseText = `The contractor/supplier shall ensure that all materials supplied under this schedule strictly conform to ${primary?.is_number} (${primary?.title}) including latest amendments in force. ${
    qco?.mandatory
      ? `Under the ${qco.qco_order_name || 'BIS Quality Control Order'}, possession of a valid BIS ${qco.scheme?.replace(/_/g, ' ') || 'ISI Mark'} License with Standard Mark is mandatory prior to dispatch.`
      : ''
  } Mandatory test certificates as per allied standards (${data.allied_standards?.map((s) => s.is_number).join(', ') || 'normative test standards'}) shall be submitted with each consignment.`;

  const handleCopyClause = async () => {
    await navigator.clipboard.writeText(quickClauseText);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 2000);
  };

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Role Header Banner */}
      <div
        className="workbench-card"
        style={{
          borderLeft: '4px solid var(--collapse-cobalt)',
          background: 'linear-gradient(180deg, var(--card-bg) 0%, rgba(27, 79, 224, 0.02) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="concept-status-badge active" style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}>
                🏛️ TENDER AUTHORITY & TECHNICAL OFFICER
              </span>
              <span className="concept-status-badge active">{primary?.status || 'ACTIVE'}</span>
              {qco?.mandatory && (
                <span
                  className="concept-status-badge"
                  style={{
                    background: 'rgba(217, 119, 6, 0.1)',
                    color: '#B45309',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  ⚡ MANDATORY QCO
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Unified Technical Drafting & Statutory Audit Defense Workbench
            </h2>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Draft legally compliant tender clauses, verify mandatory BIS Quality Control Orders, and preserve cryptographic SHA-256 evidence for CVC & statutory audit defense.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FlagButton
              queryId={meta.query_id}
              recommendationId={audit?.recommendation_id || 'rec-001'}
              isNumber={primary?.is_number || 'IS 269:2015'}
              onOpenModal={() => setIsModalOpen(true)}
            />
            {onOpenNITGenerator && (
              <button
                type="button"
                className="btn-primary"
                onClick={onOpenNITGenerator}
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                📝 Launch NIT Generator
              </button>
            )}
            {onOpenCertificate && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onOpenCertificate}
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                🛡️ CVC Audit Dossier
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs selector: Drafting vs Audit Defense */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid var(--border-neutral)', paddingBottom: '8px' }}>
          <button
            type="button"
            className={`mode-toggle-btn ${activeSubTab === 'drafting' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('drafting')}
          >
            📋 Technical Clause Drafting & QCO
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeSubTab === 'audit_defense' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('audit_defense')}
          >
            🔒 CVC Legal Defense & SHA-256 Ledger
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Technical Clause Drafting */}
      {activeSubTab === 'drafting' && (
        <>
          {/* Staleness Risk Alert if Superseded/Amended */}
          {data.staleness_risk && <StalenessRiskBanner risk={data.staleness_risk} />}

          {/* Quick-Draft Tender Clause Card */}
          <div className="workbench-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="section-label" style={{ margin: 0 }}>
                ONE-CLICK STATUTORY TENDER SPECIFICATION CLAUSE
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyClause}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {copiedClause ? '✓ Copied to Clipboard' : '📋 Copy Clause Text'}
              </button>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12.5px',
                lineHeight: 1.6,
                backgroundColor: 'var(--surface-sunken)',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-neutral)',
                color: 'var(--ink)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {quickClauseText}
            </div>

            {qco?.mandatory && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  fontSize: '12px',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span>
                <span>
                  <strong>Statutory QCO Requirement:</strong> Procurement officers who omit mandatory BIS certification clauses under {qco.qco_order_name || 'Gazette Quality Control Orders'} are held personally accountable under CVC guidelines.
                </span>
              </div>
            )}
          </div>

          {/* Plain Language Technical Breakdown */}
          {data.plain_language_explanation && (
            <PlainLanguageToggle explanation={data.plain_language_explanation} recommendation={primary} />
          )}

          {/* Confidence Score Decomposition */}
          <ConfidenceBreakdownBar
            breakdown={primary?.confidence_breakdown}
            confidence={primary?.confidence}
          />
        </>
      )}

      {/* Sub-Tab 2: CVC Legal Defense & Immutable Audit Ledger */}
      {activeSubTab === 'audit_defense' && (
        <>
          <div className="workbench-card" style={{ borderLeft: '4px solid var(--superposition-violet)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div className="section-label" style={{ margin: 0 }}>
                CRYPTOGRAPHIC AUDIT SEAL & GFR RULE 144(XI) DEFENSE
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyHash}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {copiedHash ? '✓ Hash Copied' : '📋 Copy SHA-256'}
              </button>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '12px',
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-sunken)',
                border: '1px solid var(--border-neutral)',
                color: 'var(--ink)',
                wordBreak: 'break-all',
                marginBottom: '16px',
              }}
            >
              SHA-256 SEAL: {hash}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--border-neutral)' }}>
                <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}>CVC INQUIRY PROTECTION</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803D', marginTop: '4px' }}>
                  ✓ Cryptographically Sealed
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  GFR 144(xi) & GFR 149 proof
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--border-neutral)' }}>
                <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}>RTI EXPORT COMPLIANCE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--collapse-cobalt)', marginTop: '4px' }}>
                  ✓ Export Ready (Sec 4 RTI)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Self-disclosing audit trail
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--surface-sunken)', border: '1px solid var(--border-neutral)' }}>
                <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}>SESSION / QUERY ID</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {meta.query_id}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Tri-Retrieval & Graph verified
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Timeline Audit Trail */}
          {data.reasoning_trace && data.reasoning_trace.length > 0 && (
            <div className="workbench-card">
              <div className="section-label">AUDIT REASONING TRAIL & RETRIEVAL STEPS</div>
              <ReasoningTimeline steps={data.reasoning_trace} />
            </div>
          )}
        </>
      )}

      {/* Normative Knowledge Graph Component */}
      <div className="workbench-card">
        <div className="section-label">NORMATIVE REFERENCE KNOWLEDGE GRAPH</div>
        <KnowledgeGraphViewer data={data} edges={data.graph_path} primaryStandard={primary?.is_number} />
      </div>

      {/* Officer Feedback Modal */}
      {primary && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          queryId={meta.query_id}
          recommendationId={audit?.recommendation_id || 'rec-001'}
          flaggedIsNumber={primary.is_number}
        />
      )}
    </div>
  );
};
