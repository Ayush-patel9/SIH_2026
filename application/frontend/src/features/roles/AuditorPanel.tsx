import React, { useState } from 'react';
import type { StandardsResponse } from '../../types';
import { ReasoningTimeline } from '../explainability/ReasoningTimeline';
import { KnowledgeGraphViewer } from '../explainability/KnowledgeGraphViewer';

interface AuditorPanelProps {
  data: StandardsResponse;
  onOpenCertificate?: () => void;
}

export const AuditorPanel: React.FC<AuditorPanelProps> = ({ data, onOpenCertificate }) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const primary = data.primary_recommendation;
  const audit = data.audit_record;
  const meta = data.meta;
  const hash = audit?.audit_hash || meta.audit_reference_hash;

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card: Immutable Audit Record & Hash Sealed */}
      <div
        className="workbench-card"
        style={{
          borderLeft: '4px solid var(--superposition-violet)',
          background: 'linear-gradient(180deg, var(--card-bg) 0%, rgba(109, 40, 217, 0.03) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="concept-status-badge active" style={{ background: 'rgba(109, 40, 217, 0.1)', color: 'var(--superposition-violet)' }}>
                🔍 CVC AUDITOR / VIGILANCE AUDIT LEDGER
              </span>
              <span className="concept-status-badge active">
                {audit?.dry_run ? '🧪 SANDBOX RUN' : '🔒 PERMANENT SEAL'}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Legal Defensibility & Provenance Record
            </h2>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Cryptographically timestamped record for Central Vigilance Commission (CVC) inquiries, CAG audits, and RTI compliance.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopyHash}
              style={{ fontSize: '11px', padding: '5px 10px' }}
            >
              {copiedHash ? '✓ Hash Copied' : '📋 Copy SHA-256'}
            </button>
            {onOpenCertificate && (
              <button
                type="button"
                className="btn-run"
                onClick={onOpenCertificate}
                style={{ fontSize: '11px', padding: '5px 12px' }}
              >
                View Full Audit Certificate →
              </button>
            )}
          </div>
        </div>

        {/* Provenance Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '16px',
            padding: '12px',
            background: 'var(--paper)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--hairline)',
          }}
        >
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>RECOMMENDATION ID</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700 }}>
              {audit?.recommendation_id || 'rec-default-001'}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>SESSION / QUERY ID</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700 }}>
              {meta.query_id}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>TIMESTAMP (UTC)</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink)' }}>
              {meta.timestamp}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>PIPELINE & MODEL</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink)' }}>
              v{meta.pipeline_version} · {meta.model_version || 'gemini-2.5-pro'}
            </div>
          </div>
        </div>

        {/* SHA-256 Box */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(109, 40, 217, 0.05)',
            border: '1px solid rgba(109, 40, 217, 0.2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div className="section-label" style={{ margin: '0 0 4px 0', color: 'var(--superposition-violet)' }}>
            SHA-256 PROVENANCE HASH
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink)', wordBreak: 'break-all' }}>
            {hash}
          </div>
        </div>
      </div>

      {/* Standards Version Snapshot at Query Time */}
      <div className="workbench-card">
        <div className="section-label" style={{ marginBottom: '8px' }}>
          STANDARDS VERSION SNAPSHOT (STATE AT TIME OF PROCUREMENT QUERY)
        </div>
        <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginBottom: '12px' }}>
          Freezes the legal status and active amendment so that subsequent BIS revisions cannot retroactively invalidate the tender decision.
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-data)', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--hairline)', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Standard Code</th>
                <th style={{ padding: '8px 10px' }}>Status at Query Time</th>
                <th style={{ padding: '8px 10px' }}>Active Amendment</th>
                <th style={{ padding: '8px 10px' }}>Legal Gazette Ref</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>{primary.is_number}</td>
                <td style={{ padding: '10px' }}>
                  <span className="concept-status-badge active">{primary.status}</span>
                </td>
                <td style={{ padding: '10px' }}>{primary.latest_amendment || 'Base Issue'}</td>
                <td style={{ padding: '10px', color: 'var(--ink-secondary)' }}>
                  {primary.certification?.qco_gazette_ref || 'Standard BIS Gazette'}
                </td>
              </tr>
              {Object.entries(audit?.standards_version_snapshot || {}).map(([key, val]) => (
                key !== primary.is_number && (
                  <tr key={key} style={{ borderBottom: '1px solid var(--hairline)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{key}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="concept-status-badge active">{val.status_at_query_time}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{val.amendment_at_query_time || '—'}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-secondary)' }}>BIS Manak Archive</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reasoning Trace Timeline */}
      <ReasoningTimeline steps={data.reasoning_trace} />

      {/* Knowledge Graph Path */}
      <KnowledgeGraphViewer edges={data.graph_path} primaryStandard={primary?.is_number} />

      {/* Auditor Checklist */}
      <div className="workbench-card">
        <div className="section-label" style={{ marginBottom: '10px' }}>
          LEGAL & VIGILANCE AUDIT DEFICIENCY CHECKLIST
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
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', fontWeight: 600 }}>
                  {item.item}
                </div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Auditor check: {item.action_required}
                </div>
              </div>
              <span className={`concept-status-badge ${item.status === 'PASS' ? 'active' : ''}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
