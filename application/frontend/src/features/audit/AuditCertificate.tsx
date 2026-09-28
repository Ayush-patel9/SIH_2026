import React from 'react';
import type { StandardsResponse } from '../../types';
import { generateCertificateHTML, downloadCertificate } from './certificateGenerator';

interface AuditCertificateProps {
  data?: StandardsResponse | null;
}

export const AuditCertificate: React.FC<AuditCertificateProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="workbench-card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
          No Active Query for Certificate
        </h3>
        <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', maxWidth: '480px', margin: '8px auto 0 auto' }}>
          Execute a query from the search bar or select a past query from Cryptographic Session Logs to view and export its CVC Defense Certificate.
        </p>
      </div>
    );
  }

  const audit = data.audit_record;
  const meta = data.meta;
  const primary = data.primary_recommendation;
  const query = data.query_understanding;

  const htmlContent = generateCertificateHTML(
    audit || {
      recommendation_id: `rec-${meta.query_id.slice(0, 8)}`,
      query_id: meta.query_id,
      timestamp: meta.timestamp,
      standards_version_snapshot: {
        [primary.is_number]: {
          status_at_query_time: primary.status,
          amendment_at_query_time: primary.latest_amendment || 'Base Revision',
        },
      },
      audit_hash: meta.audit_reference_hash,
      logged: true,
      dry_run: false,
      rti_exportable: true,
    },
    meta,
    query,
    primary
  );

  const handlePrint = () => {
    downloadCertificate(htmlContent);
  };

  return (
    <div className="workbench-card">
      <div className="workbench-card-header">
        <div>
          <h2 className="workbench-card-title">CVC Defense & Vigilance Certificate</h2>
          <div className="workbench-card-subtitle">
            Court-defensible proof of standard determination pursuant to GFR Rule 144
          </div>
        </div>
        <button
          type="button"
          className="btn-run"
          onClick={handlePrint}
        >
          🖨️ Export Printable PDF
        </button>
      </div>

      {/* Embedded Live Preview of Government Document */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          background: '#FFFFFF',
          padding: '10px',
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ transformOrigin: 'top center', width: '100%' }}
        />
      </div>
    </div>
  );
};
