import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  History,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  Download,
  Filter,
  ArrowRight,
  Database,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import type { StandardsResponse } from '../../types';
import { AuditLogEntry } from './AuditLogEntry';
import { AuditCertificate } from './AuditCertificate';
import { AuditHashVerifier } from './AuditHashVerifier';
import { AuditStore, type StoredAuditRecord } from './auditStore';
import { getSavedStandards, type SavedStandardRecord } from '../../api/standardsClient';

export interface AuditTrailViewProps {
  mode?: 'current' | 'history' | 'all';
  currentData?: StandardsResponse | null;
  onSelectRecord?: (data: StandardsResponse) => void;
  onOpenPastAudits?: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  mode = 'all',
  currentData,
  onSelectRecord,
  onOpenPastAudits,
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'entry' | 'vault' | 'verify'>(() => {
    if (mode === 'current') return 'certificate';
    if (mode === 'history') return 'vault';
    return 'vault';
  });

  const [history, setHistory] = useState<StoredAuditRecord[]>([]);
  const [savedDbRecords, setSavedDbRecords] = useState<SavedStandardRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedHash, setSelectedHash] = useState<string>('');
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  useEffect(() => {
    // Save current active query record to the local audit store if present
    if (currentData) {
      AuditStore.save(currentData);
    }
    setHistory(AuditStore.getAll());

    // Fetch DB-approved standards
    setIsLoadingDb(true);
    getSavedStandards()
      .then((records) => {
        setSavedDbRecords(records || []);
      })
      .catch((e) => console.warn('Failed to load DB saved standards:', e))
      .finally(() => setIsLoadingDb(false));
  }, [currentData]);

  // If mode changes, synchronize activeTab
  useEffect(() => {
    if (mode === 'current') {
      setActiveTab('certificate');
    } else if (mode === 'history') {
      setActiveTab('vault');
    }
  }, [mode]);

  const allRecords = history.map((h) => h.response);
  const totalLogs = history.length;
  const officialLogs = history.filter((h) => !h.response.audit_record?.dry_run).length;
  const dbCount = savedDbRecords.length;

  const handleVerifyRequest = (hash: string) => {
    setSelectedHash(hash);
    setActiveTab('verify');
  };

  const hasDryRun =
    (mode === 'current' && (currentData?.audit_record?.dry_run || currentData?.meta?.mode === 'dry_run')) ||
    (mode !== 'current' && (history.some((h) => h.response.audit_record?.dry_run) || currentData?.audit_record?.dry_run));

  // Filtered past history
  const filteredHistory = history.filter((rec) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const isNum = (rec.response.primary_recommendation?.is_number || '').toLowerCase();
    const title = (rec.response.primary_recommendation?.title || '').toLowerCase();
    const query = (rec.response.query_understanding?.product_name || rec.response.query_understanding?.original_text || rec.response.meta?.query_id || '').toLowerCase();
    const hash = (rec.response.audit_record?.audit_hash || rec.response.meta?.audit_reference_hash || '').toLowerCase();
    return isNum.includes(term) || title.includes(term) || query.includes(term) || hash.includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {hasDryRun && (
        <div
          style={{
            background: '#FEF3C7',
            border: '1px solid #F59E0B',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#92400E',
            fontSize: '13px',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <span>
            <strong>SANDBOX / DRY RUN MODE</strong> — Queries marked DRY RUN are not locked to the permanent government audit trail. Use this mode to test draft specifications before finalizing your NIT.
          </span>
        </div>
      )}

      {/* ── MODE 1: CURRENT CVC AUDIT DEFENSE ONLY ─────────────────────────────── */}
      {mode === 'current' && (
        <>
          <div className="workbench-card" style={{ borderLeft: '4px solid var(--emerald-pass, #15803D)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="concept-status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', color: '#15803D', borderColor: '#A7F3D0' }}>
                    <ShieldCheck size={12} /> CVC AUDIT DEFENSE RECORD
                  </span>
                  <span className="concept-status-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}>
                    <Lock size={12} /> SHA-256 CRYPTOGRAPHICALLY SEALED
                  </span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                  Active CVC Audit Defense & Vigilance Certificate
                </h1>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Statutory defense dossier for <strong style={{ color: 'var(--ink)' }}>{currentData?.primary_recommendation?.is_number || 'Active Standard'}</strong> ({currentData?.primary_recommendation?.title || 'Selected Material'}) pursuant to GFR Rule 144
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {onOpenPastAudits && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onOpenPastAudits}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                  >
                    <History size={14} />
                    <span>View Past Audits Vault ({totalLogs})</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => AuditStore.exportCSV()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Current View Sub-Navigation Tabs */}
            <div className="auth-tab-row" style={{ marginTop: '16px', marginBottom: 0 }}>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'certificate' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('certificate')}
              >
                <FileText size={13} />
                <span>Official CVC Vigilance Certificate</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'entry' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('entry')}
              >
                <ShieldCheck size={13} />
                <span>Sealed Cryptographic Record</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'verify' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('verify')}
              >
                <Search size={13} />
                <span>Public Hash Verifier</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Printable CVC Defense Certificate */}
          {activeTab === 'certificate' && (
            <AuditCertificate data={currentData || null} />
          )}

          {/* Tab 2: Single Cryptographic Log Entry */}
          {activeTab === 'entry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentData ? (
                <AuditLogEntry
                  data={currentData}
                  onSelect={onSelectRecord}
                  onVerify={handleVerifyRequest}
                />
              ) : (
                <div className="workbench-card" style={{ padding: '36px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-prose)', color: 'var(--ink-secondary)', margin: 0 }}>
                    No active standard query loaded. Execute a search in Standards Explorer to generate a sealed CVC audit record.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Public Hash Verification Portal */}
          {activeTab === 'verify' && (
            <AuditHashVerifier
              cachedRecords={currentData ? [currentData] : []}
              initialHash={selectedHash}
              onRecordFound={onSelectRecord}
            />
          )}
        </>
      )}

      {/* ── MODE 2: PAST AUDITS VAULT ONLY ──────────────────────────────────────── */}
      {mode === 'history' && (
        <>
          <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt, #2563EB)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="concept-status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <History size={12} /> HISTORICAL AUDIT VAULT
                  </span>
                  <span className="concept-status-badge in-progress" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Database size={12} /> PERMANENT CVC ARCHIVE
                  </span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                  Past Audits Vault & Legal Defensibility Archive
                </h1>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Complete historical vault of all sealed standard audits, Bureau DB approved records, and cryptographic SHA-256 certificates
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    background: 'var(--paper, #FFFFFF)',
                    padding: '6px 14px',
                    border: '1px solid var(--hairline, #E5E0D4)',
                    borderRadius: 'var(--radius-sm, 6px)',
                  }}
                >
                  <span className="section-label" style={{ margin: 0, fontSize: '9px' }}>
                    SEALED AUDITS
                  </span>
                  <span style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '18px', fontWeight: 700, color: 'var(--collapse-cobalt, #2563EB)' }}>
                    {totalLogs} Records
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => AuditStore.exportCSV()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Feature Sub-Navigation Tabs */}
            <div className="auth-tab-row" style={{ marginTop: '16px', marginBottom: 0 }}>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'vault' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('vault')}
              >
                <FileText size={13} />
                <span>Past Sealed Audits ({totalLogs})</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'verify' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('verify')}
              >
                <Search size={13} />
                <span>Public Hash Verifier</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Past Audits List with Search Filter */}
          {activeTab === 'vault' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Search & Filter Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--surface-secondary, #F5F2EB)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--hairline, #E5E0D4)',
                }}
              >
                <Search size={16} style={{ color: 'var(--ink-muted)' }} />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter past audits by IS number (e.g. IS 269), material name, or SHA-256 hash..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-ui, sans-serif)',
                  }}
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Clear
                  </button>
                )}
                <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
                  Showing {filteredHistory.length} of {totalLogs}
                </span>
              </div>

              {/* DB Approved Standards Quick Badges (if available) */}
              {savedDbRecords.length > 0 && (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={15} style={{ color: '#15803D' }} />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#15803D', fontFamily: 'var(--font-data)' }}>
                      DATABASE-APPROVED ACTIVE STANDARDS ({savedDbRecords.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {savedDbRecords.map((saved) => (
                      <button
                        key={saved.is_number}
                        type="button"
                        onClick={() => {
                          if (saved.response_data && onSelectRecord) {
                            onSelectRecord(saved.response_data);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FFFFFF',
                          border: '1px solid #86EFAC',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          color: '#166534',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#15803D';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#86EFAC';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <CheckCircle2 size={13} style={{ color: '#15803D' }} />
                        <span>{saved.is_number}</span>
                        <span style={{ color: '#4B5563', fontWeight: 400, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          — {saved.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Audit Cards */}
              {filteredHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredHistory.map((record) => (
                    <AuditLogEntry
                      key={record.id}
                      data={record.response}
                      onSelect={onSelectRecord}
                      onVerify={handleVerifyRequest}
                    />
                  ))}
                </div>
              ) : (
                <div className="workbench-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <History size={36} style={{ color: 'var(--ink-muted)', marginBottom: '12px' }} />
                  <h3 style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                    {searchFilter ? 'No Matching Past Audits Found' : 'No Past Audits Recorded Yet'}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                    {searchFilter
                      ? 'Try adjusting your search query or clear the filter to see all sealed audits.'
                      : 'Execute standard searches in Standards Explorer to automatically generate and lock immutable CVC defense logs.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Public Hash Verification Portal */}
          {activeTab === 'verify' && (
            <AuditHashVerifier
              cachedRecords={allRecords.length > 0 ? allRecords : currentData ? [currentData] : []}
              initialHash={selectedHash}
              onRecordFound={onSelectRecord}
            />
          )}
        </>
      )}

      {/* ── MODE 3: ALL / STANDALONE VIEW (FALLBACK) ────────────────────────────── */}
      {mode === 'all' && (
        <>
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => AuditStore.exportCSV()}
                >
                  <Download size={13} />
                  <span>Export Audit CSV</span>
                </button>
              </div>
            </div>

            {/* Feature Sub-Navigation Tabs */}
            <div className="auth-tab-row" style={{ marginTop: '16px', marginBottom: 0 }}>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'vault' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('vault')}
              >
                <FileText size={13} />
                <span>Session Audit Logs ({totalLogs})</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'certificate' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('certificate')}
              >
                <FileText size={13} />
                <span>CVC Defense Certificate (Active)</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${activeTab === 'verify' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setActiveTab('verify')}
              >
                <Search size={13} />
                <span>Public Hash Verifier</span>
              </button>
            </div>
          </div>

          {activeTab === 'vault' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

          {activeTab === 'certificate' && (
            <AuditCertificate data={currentData || history[0]?.response || null} />
          )}

          {activeTab === 'verify' && (
            <AuditHashVerifier
              cachedRecords={allRecords.length > 0 ? allRecords : currentData ? [currentData] : []}
              initialHash={selectedHash}
              onRecordFound={onSelectRecord}
            />
          )}
        </>
      )}
    </div>
  );
};
