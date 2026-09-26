import React, { useState } from 'react';
import type { StandardsResponse } from '../../types';
import { PlainLanguageToggle } from '../explainability/PlainLanguageToggle';
import { ConfidenceBreakdownBar } from '../explainability/ConfidenceBreakdownBar';
import { KnowledgeGraphViewer } from '../explainability/KnowledgeGraphViewer';
import { ReasoningTimeline } from '../explainability/ReasoningTimeline';
import { FlagButton, FeedbackModal } from '../feedback';
import { StalenessRiskBanner } from '../alerts';

interface ProcurementOfficerPanelProps {
  data: StandardsResponse;
  onOpenNITGenerator?: () => void;
}

export const ProcurementOfficerPanel: React.FC<ProcurementOfficerPanelProps> = ({
  data,
  onOpenNITGenerator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedClause, setCopiedClause] = useState(false);
  const primary = data.primary_recommendation;
  const qco = primary?.certification;
  const audit = data.audit_record;

  const quickClauseText = `The contractor/supplier shall ensure that all materials supplied under this schedule strictly conform to ${primary?.is_number} (${primary?.title}) including latest amendments in force. ${
    qco?.mandatory
      ? `Under the ${qco.qco_order_name || 'BIS Quality Control Order'}, possession of a valid BIS ${qco.scheme.replace(/_/g, ' ')} License with Standard Mark is mandatory prior to dispatch.`
      : ''
  } Mandatory test certificates as per allied standards (${data.allied_standards.map((s) => s.is_number).join(', ') || 'normative test standards'}) shall be submitted with each consignment.`;

  const handleCopyClause = async () => {
    await navigator.clipboard.writeText(quickClauseText);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 2000);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge active">
                👔 PROCUREMENT OFFICER PERSPECTIVE
              </span>
              <span className="concept-status-badge active">{primary?.status || 'ACTIVE'}</span>
              {qco?.mandatory && (
                <span
                  className="concept-status-badge"
                  style={{
                    background: 'rgba(217, 119, 6, 0.1)',
                    color: '#B45309',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                  }}
                >
                  ⚖️ {qco.scheme.replace(/_/g, ' ')} MANDATORY
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
              {primary?.is_number}
            </h1>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              {primary?.title}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div className="section-label" style={{ margin: 0 }}>
              PUBLISHED / AMENDMENT
            </div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 600 }}>
              {primary?.year_published} · {primary?.latest_amendment || 'Base Issue'}
            </div>
          </div>
        </div>

        {/* Scope Snippet */}
        {primary?.scope_snippet && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: 'var(--paper)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-prose)',
              fontSize: '13px',
              color: 'var(--ink-secondary)',
              fontStyle: 'italic',
              border: '1px solid var(--hairline)',
            }}
          >
            "{primary.scope_snippet}"
          </div>
        )}

        {/* Superseded Warning */}
        {primary?.supersedes && primary.supersedes.length > 0 && (
          <div className="debug-banner" style={{ marginTop: '14px', marginBottom: 0 }}>
            <div className="debug-badge">SUPERSEDED STANDARDS ALERT</div>
            <div className="debug-prompt-text" style={{ fontSize: '13px' }}>
              This standard consolidates and replaces: <strong>{primary.supersedes.join(', ')}</strong>.
              Ensure outdated numbers are deleted from your tender schedules.
            </div>
          </div>
        )}

        {data.staleness_risk && (
          <div style={{ marginTop: '14px' }}>
            <StalenessRiskBanner risk={data.staleness_risk} />
          </div>
        )}

        {/* Human-in-the-Loop Flag Button */}
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <FlagButton
            queryId={data.meta.query_id}
            recommendationId={audit?.recommendation_id || 'rec-001'}
            isNumber={primary?.is_number || 'IS 269:2015'}
            onOpenModal={() => setIsModalOpen(true)}
          />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
            OFFICER VERIFIED WORKFLOW
          </span>
        </div>
      </div>

      {/* Plain Language & Confidence */}
      <PlainLanguageToggle explanation={data.plain_language_explanation} recommendation={primary} />

      <ConfidenceBreakdownBar breakdown={primary?.confidence_breakdown} confidence={primary?.confidence} />

      {/* Allied Standards Matrix for Tender Specifications */}
      <div className="workbench-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div className="section-label" style={{ margin: 0 }}>
              ALLIED STANDARDS REQUIRED IN TENDER CLAUSES
            </div>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              These test methods, sampling rules, and installation codes must be cross-cited to prevent legal tender loopholes.
            </div>
          </div>
          <span className="concept-status-badge active">{data.allied_standards.length} Allied Standards</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-data)', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--hairline)', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', color: 'var(--ink-secondary)' }}>IS Number</th>
                <th style={{ padding: '8px 10px', color: 'var(--ink-secondary)' }}>Standard Title</th>
                <th style={{ padding: '8px 10px', color: 'var(--ink-secondary)' }}>Relation Type</th>
                <th style={{ padding: '8px 10px', color: 'var(--ink-secondary)' }}>Mandate / Why Required</th>
              </tr>
            </thead>
            <tbody>
              {data.allied_standards.map((std, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--ink)' }}>{std.is_number}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-prose)', color: 'var(--ink-secondary)' }}>
                    {std.title}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        background: 'rgba(27, 79, 224, 0.08)',
                        color: 'var(--collapse-cobalt)',
                        borderRadius: '2px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {std.relation_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-prose)', color: 'var(--ink)', fontSize: '12px' }}>
                    {std.why || std.relation_label || 'Mandated by primary standard normative references.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component 3: Knowledge Subgraph & Normative Network */}
      <KnowledgeGraphViewer
        edges={data.graph_path}
        primaryStandard={primary?.is_number}
      />

      {/* Component 1: Step-by-Step AI Reasoning Trail */}
      <ReasoningTimeline
        steps={data.reasoning_trace}
      />

      {/* Quick NIT Clause Generator Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--emerald-pass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="section-label" style={{ margin: 0 }}>
            TENDER CLAUSE SNIPPET (READY FOR NOTICE INVITING TENDER)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={handleCopyClause} style={{ fontSize: '11px', padding: '4px 10px' }}>
              {copiedClause ? '✓ Copied to Clipboard' : '📋 Copy Clause'}
            </button>
            {onOpenNITGenerator && (
              <button type="button" className="btn-run" onClick={onOpenNITGenerator} style={{ fontSize: '11px', padding: '4px 10px' }}>
                Open Full NIT Generator →
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            background: 'var(--paper)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-data)',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'var(--ink)',
            border: '1px solid var(--hairline)',
          }}
        >
          {quickClauseText}
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="workbench-card">
        <div className="section-label" style={{ marginBottom: '10px' }}>
          PROCUREMENT OFFICER PRE-TENDER COMPLIANCE CHECKLIST
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.compliance_checklist.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--paper)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${
                  item.status === 'PASS'
                    ? 'var(--emerald-pass)'
                    : item.status === 'WARNING'
                    ? 'var(--signal-amber)'
                    : 'var(--error-line)'
                }`,
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  {item.item}
                </div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  {item.action_required}
                </div>
              </div>
              <span
                className={`concept-status-badge ${
                  item.status === 'PASS' ? 'active' : item.status === 'WARNING' ? '' : 'withdrawn'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        queryId={data.meta.query_id}
        recommendationId={audit?.recommendation_id || 'rec-001'}
        flaggedIsNumber={primary?.is_number || 'IS 269:2015'}
      />
    </div>
  );
};
