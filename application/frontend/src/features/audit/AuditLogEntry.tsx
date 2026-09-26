import React, { useState } from 'react';
import type { StandardsResponse } from '../../types';
import { generateCertificateHTML, downloadCertificate } from './certificateGenerator';

interface AuditLogEntryProps {
  data: StandardsResponse;
  onSelect?: (data: StandardsResponse) => void;
  onVerify?: (hash: string) => void;
}

export const AuditLogEntry: React.FC<AuditLogEntryProps> = ({
  data,
  onSelect,
  onVerify,
}) => {
  const [copied, setCopied] = useState(false);
  const audit = data.audit_record;
  const meta = data.meta;
  const primary = data.primary_recommendation;
  const query = data.query_understanding;

  const hash = audit?.audit_hash || meta?.audit_reference_hash || '';
  const isDryRun = audit?.dry_run || meta?.mode === 'dry_run';
  const isLogged = audit?.logged ?? true;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewCertificate = () => {
    const html = generateCertificateHTML(
      audit || {
        recommendation_id: `rec-${meta.query_id.slice(0, 8)}`,
        query_id: meta.query_id,
        timestamp: meta.timestamp,
        standards_version_snapshot: {
          [primary.is_number]: {
            status_at_query_time: primary.status,
            amendment_at_query_time: primary.latest_amendment || 'Base',
          },
        },
        audit_hash: hash,
        logged: true,
        dry_run: isDryRun,
        rti_exportable: true,
      },
      meta,
      query,
      primary
    );
    downloadCertificate(html);
  };

  const formattedDate = new Date(meta.timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="timeline-step-card"
      style={{
        borderLeft: isDryRun
          ? '3px solid var(--signal-amber)'
          : '3px solid var(--collapse-cobalt)',
        background: 'var(--surface)',
      }}
    >
      <div className="timeline-step-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="status-dot"
            style={{
              background: isDryRun
                ? 'var(--signal-amber)'
                : isLogged
                ? 'var(--emerald-pass)'
                : 'var(--ink-muted)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '11px',
              fontWeight: 700,
              color: isDryRun ? '#B45309' : 'var(--collapse-cobalt)',
              letterSpacing: '0.04em',
            }}
          >
            {isDryRun ? 'DRY-RUN (UNLOGGED)' : 'LOGGED RECORD'}
          </span>
          <span className="concept-status-badge in-progress" style={{ fontSize: '9px' }}>
            {meta.mode?.toUpperCase() || 'RECOMMEND'}
          </span>
        </div>

        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
          {formattedDate}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink)', margin: '6px 0 8px' }}>
        "{query?.original_text}"
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 10px' }}>
        <div>
          <span className="section-label" style={{ margin: '0 6px 0 0' }}>
            ENFORCED STANDARD:
          </span>
          <strong style={{ fontFamily: 'var(--font-data)', fontSize: '12.5px', color: 'var(--collapse-cobalt)' }}>
            {primary?.is_number}
          </strong>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginLeft: '6px' }}>
            ({primary?.status})
          </span>
        </div>
        {audit?.rti_exportable && (
          <span className="concept-status-badge active" style={{ fontSize: '9px' }}>
            RTI COMPLIANT
          </span>
        )}
      </div>

      {/* Void Canvas Hash Display Box */}
      <div style={{ background: 'var(--void)', padding: '8px 12px', borderRadius: '3px', margin: '8px 0 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#8890A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SHA-256 AUDIT HASH
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '2px 8px', fontSize: '10px', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={handleCopyHash}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            {onVerify && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '2px 8px', fontSize: '10px', color: '#60A5FA', borderColor: 'rgba(96,165,250,0.3)' }}
                onClick={() => onVerify(hash)}
              >
                Verify
              </button>
            )}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '11px',
            color: '#EEF0F4',
            wordBreak: 'break-all',
            marginTop: '4px',
            letterSpacing: '0.02em',
          }}
        >
          {hash}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {onSelect && (
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '5px 12px' }}
            onClick={() => onSelect(data)}
          >
            Load in Workbench
          </button>
        )}
        <button
          type="button"
          className="btn-run"
          style={{ fontSize: '11px', padding: '5px 14px' }}
          onClick={handleViewCertificate}
        >
          📄 View Legal Certificate
        </button>
      </div>
    </div>
  );
};
