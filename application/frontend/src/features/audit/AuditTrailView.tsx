import React, { useState, useEffect } from 'react';
import type { StandardsResponse } from '../../types';
import { AuditLogEntry } from './AuditLogEntry';
import { AuditCertificate } from './AuditCertificate';
import { AuditHashVerifier } from './AuditHashVerifier';
import { AuditStore, type StoredAuditRecord } from './auditStore';

interface AuditTrailViewProps {
  currentData?: StandardsResponse | null;
  onSelectRecord?: (data: StandardsResponse) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  currentData,
  onSelectRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'certificate' | 'verify'>('vault');
  const [history, setHistory] = useState<StoredAuditRecord[]>([]);
  const [selectedHash, setSelectedHash] = useState<string>('');

  useEffect(() => {
    // Save current active query record to the local audit store if present
    if (currentData) {
      AuditStore.save(currentData);
    }
    setHistory(AuditStore.getAll());
  }, [currentData]);

  const allRecords = history.map((h) => h.response);
  const totalLogs = history.length;
  const officialLogs = history.filter((h) => !h.response.audit_record?.dry_run).length;

  const handleVerifyRequest = (hash: string) => {
    setSelectedHash(hash);
    setActiveTab('verify');
  };

  const hasDryRun = history.some((h) => h.response.audit_record?.dry_run) || currentData?.audit_record?.dry_run;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {hasDryRun && (
        <div
          style={{
            background: '#FEF3C7',
            border: '1px solid #F59E0B',
            padding: '12px 16px',
            borderRadius: '6px',
            color: '#92400E',
            fontSize: '13px',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span>
            <strong>SANDBOX MODE</strong> — Queries marked DRY RUN are not logged to the permanent government audit trail. Use this mode to test draft specifications before finalizing your NIT.
          </span>
        </div>
      )}

      {/* Top Audit Vault Stats & Action Bar */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge active">
                CVC COMPLIANT VAULT
              </span>
              <span className="concept-status-badge in-progress">
                IMMUTABLE SHA-256 LOGS
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Audit Vault & Legal Defensibility Center
            </h1>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Cryptographic logging of all standard specifications, RTI Section 4 exports, and official vigilance certificates
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                background: 'var(--paper)',
                padding: '6px 14px',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span className="section-label" style={{ margin: 0, fontSize: '9px' }}>
                OFFICIAL RECORDS
              </span>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
                {officialLogs} / {totalLogs}
              </span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => AuditStore.exportCSV()}
            >
              📊 Export Audit CSV
            </button>
          </div>
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="auth-tab-row" style={{ marginTop: '16px', marginBottom: 0 }}>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            📋 Session Audit Logs ({totalLogs})
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            📄 CVC Defense Certificate (Active)
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            🔍 Public Hash Verifier
          </button>
        </div>
      </div>

      {/* Tab 1: Session Log Cards */}
      {activeTab === 'vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label" style={{ margin: 0 }}>
              CRYPTOGRAPHIC SESSION LOGS
            </span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
              STORED IN LOCAL BROWSER VAULT
            </span>
          </div>

          {history.length > 0 ? (
            history.map((record) => (
              <AuditLogEntry
                key={record.id}
                data={record.response}
                onSelect={onSelectRecord}
                onVerify={handleVerifyRequest}
              />
            ))
          ) : currentData ? (
            <AuditLogEntry
              data={currentData}
              onSelect={onSelectRecord}
              onVerify={handleVerifyRequest}
            />
          ) : (
            <div className="workbench-card" style={{ padding: '36px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-prose)', color: 'var(--ink-secondary)', margin: 0 }}>
                No cryptographic audit logs recorded yet in this session. Run an IS query to generate a sealed audit record.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Printable CVC Defense Certificate */}
      {activeTab === 'certificate' && (
        <AuditCertificate data={currentData || history[0]?.response || null} />
      )}

      {/* Tab 3: Public Hash Verification Portal */}
      {activeTab === 'verify' && (
        <AuditHashVerifier
          cachedRecords={allRecords.length > 0 ? allRecords : currentData ? [currentData] : []}
          initialHash={selectedHash}
          onRecordFound={onSelectRecord}
        />
      )}
    </div>
  );
};
