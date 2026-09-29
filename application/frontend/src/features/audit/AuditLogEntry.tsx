import React, { useState } from 'react';
import { Lock, FileText, Check } from 'lucide-react';
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

      {/* Sleek Obsidian SHA-256 Hash Box */}
      <div
        style={{
          background: '#18181B',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          margin: '10px 0 12px',
          border: '1px solid #27272A',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-data)', fontSize: '9.5px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            <Lock size={11} /> IMMUTABLE SHA-256 AUDIT HASH
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#27272A',
                border: '1px solid #3F3F46',
                borderRadius: 'var(--radius-xs)',
                padding: '2px 8px',
                fontSize: '10px',
                color: '#FAFAFA',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
              }}
              onClick={handleCopyHash}
            >
              {copied ? (
                <>
                  <Check size={10} style={{ color: 'var(--emerald-pass)' }} /> Copied
                </>
              ) : (
                'Copy'
              )}
            </button>
            {onVerify && (
              <button
                type="button"
                style={{
                  background: 'rgba(37, 99, 235, 0.2)',
                  border: '1px solid rgba(37, 99, 235, 0.4)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2px 8px',
                  fontSize: '10px',
                  color: '#93C5FD',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                }}
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
            color: '#F4F4F5',
            wordBreak: 'break-all',
            letterSpacing: '0.02em',
            lineHeight: 1.4,
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
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '5px 14px' }}
          onClick={handleViewCertificate}
        >
          <FileText size={12} />
          <span>View Legal Certificate</span>
        </button>
      </div>
    </div>
  );
};
