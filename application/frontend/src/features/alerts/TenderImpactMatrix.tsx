import React, { useState, useMemo } from 'react';
import type { AlertPayload } from '../../types';
import { buildImpactMatrix, SAVED_TENDERS } from './impactMatrix';
import type { TenderRecord, TenderImpactRow, ImpactMatrixCell } from './impactMatrix';
import { formatDeadlineBadge } from './deadlineUtils';

interface TenderImpactMatrixProps {
  alerts: AlertPayload[];
  selectedTenderId?: string | null;
  onSelectTender?: (tenderId: string) => void;
}

export const TenderImpactMatrix: React.FC<TenderImpactMatrixProps> = ({
  alerts,
  selectedTenderId,
  onSelectTender,
}) => {
  const [ministryFilter, setMinistryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingTender, setInspectingTender] = useState<TenderImpactRow | null>(null);
  const [inspectingCell, setInspectingCell] = useState<{
    tender: TenderRecord;
    cell: ImpactMatrixCell;
  } | null>(null);
  const [corrigendumCopied, setCorrigendumCopied] = useState(false);

  // Compute matrix from active alerts and saved tenders
  const matrixResult = useMemo(() => {
    return buildImpactMatrix(alerts, SAVED_TENDERS);
  }, [alerts]);

  // List of ministries for filter
  const ministries = useMemo(() => {
    const set = new Set<string>();
    SAVED_TENDERS.forEach((t) => set.add(t.ministry));
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return matrixResult.tenders.filter((row) => {
      // Ministry filter
      if (ministryFilter !== 'ALL' && row.tender.ministry !== ministryFilter) {
        return false;
      }

      // Severity filter
      if (severityFilter === 'CRITICAL' && row.highestSeverity !== 'CRITICAL') return false;
      if (severityFilter === 'HIGH' && row.highestSeverity !== 'HIGH') return false;
      if (severityFilter === 'MEDIUM' && row.highestSeverity !== 'MEDIUM') return false;
      if (severityFilter === 'CLEAN' && row.highestSeverity !== 'NONE') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = row.tender.tender_id.toLowerCase().includes(q);
        const matchTitle = row.tender.title.toLowerCase().includes(q);
        const matchMinistry = row.tender.ministry.toLowerCase().includes(q);
        const matchStd = row.tender.cited_standards.some((s) => s.toLowerCase().includes(q));
        if (!matchId && !matchTitle && !matchMinistry && !matchStd) return false;
      }

      return true;
    });
  }, [matrixResult, ministryFilter, severityFilter, searchQuery]);

  const getCellBadge = (cell: ImpactMatrixCell) => {
    switch (cell.status) {
      case 'WITHDRAWN':
        return {
          icon: '🔴',
          text: 'WITHDRAWN',
          bg: '#FEE2E2',
          color: 'var(--error-line)',
          border: '#FECACA',
        };
      case 'AMENDED':
        return {
          icon: '⚠️',
          text: 'AMENDED',
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FDE68A',
        };
      case 'UNDER_REVISION':
        return {
          icon: '🔔',
          text: 'IN REVISION',
          bg: '#F3E8FF',
          color: 'var(--superposition-violet)',
          border: '#E9D5FF',
        };
      case 'QCO_MANDATORY':
        return {
          icon: '🚨',
          text: 'QCO MANDATE',
          bg: '#FEE2E2',
          color: 'var(--error-line)',
          border: '#FECACA',
        };
      case 'NEW_MANDATORY':
        return {
          icon: '📋',
          text: 'NEW QCO',
          bg: '#DBEAFE',
          color: 'var(--collapse-cobalt)',
          border: '#BFDBFE',
        };
      case 'OK':
      default:
        return {
          icon: '✓',
          text: 'CURRENT',
          bg: '#DCFCE7',
          color: 'var(--emerald-pass)',
          border: '#BBF7D0',
        };
    }
  };

  const generateCorrigendumText = (tender: TenderRecord, cell: ImpactMatrixCell) => {
    return `================================================================================
CORRIGENDUM / TECHNICAL ADDENDUM NOTICE
GOVERNMENT OF INDIA — PUBLIC PROCUREMENT PORTAL (GeM / CPPP)
================================================================================
Tender Reference : ${tender.tender_id}
Project Title    : ${tender.title}
Ministry / Dept  : ${tender.ministry} (${tender.department})
Issuing Officer  : ${tender.officer_user_id}
Gazette Alert Ref: ${cell.alertId || 'BIS-QCO-ALERT-2026'}
Timestamp        : ${new Date().toISOString()}

NOTICE TO ALL PROSPECTIVE BIDDERS:
Pursuant to statutory updates gazetted by the Bureau of Indian Standards (BIS),
the technical specifications for the subject tender are amended as follows:

1. AFFECTED CLAUSE SPECIFICATION:
   - Existing Cited Standard: ${cell.standard}
   - Gazette Event Status    : ${cell.status} (${cell.event || 'Statutory Revision'})
   ${cell.replacement ? `- Mandatory Replacement Standard: ${cell.replacement}` : ''}

2. COMPLIANCE MANDATE:
   ${cell.action || 'All bidding contractors and vendors must submit conformity certificates against the updated standard.'}

3. COMPLIANCE DEADLINE:
   All bid submissions, test certificates, and quality assurance plans must comply
   with the revised standard by: ${cell.deadline ? new Date(cell.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Bid Closing Date'}.

Approved by Technical Review Committee (ManakAI Automated Vigilance Audit)
================================================================================`;
  };

  const handleCopyCorrigendum = (tender: TenderRecord, cell: ImpactMatrixCell) => {
    const text = generateCorrigendumText(tender, cell);
    navigator.clipboard.writeText(text);
    setCorrigendumCopied(true);
    setTimeout(() => setCorrigendumCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Tender ID', 'Ministry', 'Project Title', 'Value (INR Cr)', 'Officer ID', 'Cited Standards', 'Highest Risk', 'Total At-Risk Standards'];
    const rows = matrixResult.tenders.map((r) => [
      `"${r.tender.tender_id}"`,
      `"${r.tender.ministry}"`,
      `"${r.tender.title.replace(/"/g, '""')}"`,
      r.tender.value_inr_cr,
      `"${r.tender.officer_user_id}"`,
      `"${r.tender.cited_standards.join('; ')}"`,
      `"${r.highestSeverity}"`,
      r.totalRisks,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tender_Impact_Matrix_BIS_Staleness_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="workbench-card" style={{ padding: '20px' }}>
      {/* Header & Metric Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-label" style={{ margin: '0 0 2px 0' }}>
            ACTIVE PROCUREMENT TENDER RISK MATRIX
          </div>
          <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>
            Proactive Staleness & Supersession Matrix
          </h2>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Cross-referencing live gazetted BIS amendments and QCO enforcement dates against active high-value procurement tenders.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
        >
          <span>📥</span>
          <span>Export Matrix CSV</span>
        </button>
      </div>

      {/* Metric Badges Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <div style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline)' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px' }}>MONITORED TENDERS</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
            {matrixResult.summary.totalTenders}
          </div>
        </div>

        <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #FECACA' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--error-line)' }}>CRITICAL (WITHDRAWN)</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--error-line)' }}>
            {matrixResult.summary.criticalTenders}
          </div>
        </div>

        <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: '#B45309' }}>HIGH (AMENDED)</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: '#B45309' }}>
            {matrixResult.summary.highTenders}
          </div>
        </div>

        <div style={{ background: '#FAF5FF', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #E9D5FF' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--superposition-violet)' }}>UNDER REVISION</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--superposition-violet)' }}>
            {matrixResult.summary.mediumTenders}
          </div>
        </div>

        <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--emerald-pass)' }}>ALL COMPLIANT</div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--emerald-pass)' }}>
            {matrixResult.summary.cleanTenders}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
          flexWrap: 'wrap',
          background: 'var(--paper)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
            MINISTRY:
          </span>
          <select
            value={ministryFilter}
            onChange={(e) => setMinistryFilter(e.target.value)}
            className="auth-input auth-select"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            {ministries.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600, marginLeft: '6px' }}>
            SEVERITY:
          </span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="auth-input auth-select"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical (Withdrawn / QCO Mandate)</option>
            <option value="HIGH">High (Amended / New Standard)</option>
            <option value="MEDIUM">Medium (Under Revision)</option>
            <option value="CLEAN">Clean / Compliant</option>
          </select>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by NIT, IS standard, or keyword..."
          className="auth-input"
          style={{ width: '260px', padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
        />
      </div>

      {/* Matrix Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm)' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '220px', position: 'sticky', left: 0, background: 'var(--paper)', zIndex: 2 }}>
                TENDER REF & MINISTRY
              </th>
              <th style={{ width: '140px' }}>VALUE / DEADLINE</th>
              <th style={{ minWidth: '320px' }}>CITED STANDARDS & LIVE STATUTORY STATUS</th>
              <th style={{ width: '120px', textAlign: 'center' }}>COMPLIANCE RISK</th>
              <th style={{ width: '100px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-muted)' }}>
                  No active procurement tenders match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isSelected = selectedTenderId === row.tender.tender_id;
                const tender = row.tender;

                return (
                  <tr
                    key={tender.tender_id}
                    style={{
                      background: isSelected ? 'rgba(27, 79, 224, 0.05)' : undefined,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Tender ID & Ministry */}
                    <td style={{ position: 'sticky', left: 0, background: '#FFFFFF', zIndex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="badge-code" style={{ fontSize: '12px', fontWeight: 700 }}>
                          {tender.tender_id}
                        </span>
                        <span style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink)', fontWeight: 600 }}>
                          {tender.title}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--collapse-cobalt)' }}>
                            {tender.ministry}
                          </span>
                          <span style={{ color: 'var(--hairline)' }}>•</span>
                          <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
                            {tender.officer_user_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Value & Bid Closing */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                          ₹{tender.value_inr_cr.toFixed(1)} Cr
                        </span>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-secondary)' }}>
                          Bids close: {tender.bid_closing_date}
                        </span>
                      </div>
                    </td>

                    {/* Cited Standards Grid Cells */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tender.cited_standards.map((std) => {
                          const cell = row.cells[std] || { standard: std, status: 'OK', severity: 'NONE' };
                          const badge = getCellBadge(cell);

                          return (
                            <button
                              key={std}
                              type="button"
                              onClick={() => setInspectingCell({ tender, cell })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: badge.bg,
                                border: `1px solid ${badge.border}`,
                                color: badge.color,
                                cursor: 'pointer',
                                transition: 'transform 0.1s ease',
                              }}
                              title={
                                cell.status === 'OK'
                                  ? `${std} is current and gazetted`
                                  : `${std}: ${cell.status} (${cell.event || 'Click for action notice'})`
                              }
                            >
                              <span style={{ fontSize: '11px' }}>{badge.icon}</span>
                              <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700 }}>
                                {std}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'var(--font-data)',
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  opacity: 0.85,
                                }}
                              >
                                {badge.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Highest Severity Status */}
                    <td style={{ textAlign: 'center' }}>
                      {row.highestSeverity === 'CRITICAL' ? (
                        <span className="badge-status withdrawn">
                          🔴 CRITICAL ({row.totalRisks})
                        </span>
                      ) : row.highestSeverity === 'HIGH' ? (
                        <span className="badge-status in-progress" style={{ background: '#FEF3C7', color: '#B45309' }}>
                          ⚠️ HIGH ({row.totalRisks})
                        </span>
                      ) : row.highestSeverity === 'MEDIUM' ? (
                        <span className="badge-status in-progress" style={{ background: '#F3E8FF', color: 'var(--superposition-violet)' }}>
                          🔔 REVISION
                        </span>
                      ) : (
                        <span className="badge-status active">
                          ✓ COMPLIANT
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => {
                          setInspectingTender(row);
                          if (onSelectTender) onSelectTender(tender.tender_id);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cell Detail / Corrigendum Generator Modal */}
      {inspectingCell && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(13, 15, 20, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setInspectingCell(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--hairline)',
              animation: 'auth-card-in 0.18s ease both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--hairline)',
                background: 'var(--paper)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div className="section-label" style={{ margin: 0 }}>
                  STATUTORY COMPLIANCE CORRIGENDUM AUDIT
                </div>
                <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '17px', color: 'var(--ink)', margin: '2px 0 0 0' }}>
                  Clause Audit: {inspectingCell.cell.standard}
                </h3>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setInspectingCell(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--paper)', padding: '10px 12px', borderRadius: '4px' }}>
                  <div className="section-label" style={{ margin: 0, fontSize: '10px' }}>AFFECTED TENDER</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700 }}>
                    {inspectingCell.tender.tender_id}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                    {inspectingCell.tender.ministry} • ₹{inspectingCell.tender.value_inr_cr} Cr
                  </div>
                </div>

                <div style={{ background: 'var(--paper)', padding: '10px 12px', borderRadius: '4px' }}>
                  <div className="section-label" style={{ margin: 0, fontSize: '10px' }}>COMPLIANCE DEADLINE</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700 }}>
                    {inspectingCell.cell.deadline ? (
                      formatDeadlineBadge(inspectingCell.cell.deadline).text
                    ) : (
                      'Routine Gazette Monitoring'
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                    Bid Closing: {inspectingCell.tender.bid_closing_date}
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '12px 14px',
                  background: inspectingCell.cell.status === 'OK' ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${inspectingCell.cell.status === 'OK' ? '#BBF7D0' : '#FECACA'}`,
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: inspectingCell.cell.status === 'OK' ? 'var(--emerald-pass)' : 'var(--error-line)' }}>
                    STATUS: {inspectingCell.cell.status}
                  </strong>
                  {inspectingCell.cell.replacement && (
                    <span className="badge-code" style={{ fontSize: '11px' }}>
                      Replacement: {inspectingCell.cell.replacement}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
                  {inspectingCell.cell.event || 'Standard is active and gazetted under the standard repository.'}
                </p>
              </div>

              {/* Generated Corrigendum Textarea */}
              {inspectingCell.cell.status !== 'OK' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="section-label" style={{ margin: 0 }}>
                      AUTOMATED TENDER CORRIGENDUM NOTICE (READY FOR GEM / CPPP)
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                      onClick={() => handleCopyCorrigendum(inspectingCell.tender, inspectingCell.cell)}
                    >
                      {corrigendumCopied ? '✓ Copied to Clipboard' : '📋 Copy Notice'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={8}
                    value={generateCorrigendumText(inspectingCell.tender, inspectingCell.cell)}
                    className="font-mono"
                    style={{
                      width: '100%',
                      fontSize: '11px',
                      background: 'var(--void)',
                      color: '#00FF66',
                      padding: '12px',
                      borderRadius: '4px',
                      lineHeight: '1.4',
                      border: '1px solid var(--hairline)',
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setInspectingCell(null)}
                >
                  Close
                </button>
                {inspectingCell.cell.status !== 'OK' && (
                  <button
                    type="button"
                    className="btn-run"
                    onClick={() => handleCopyCorrigendum(inspectingCell.tender, inspectingCell.cell)}
                  >
                    {corrigendumCopied ? '✓ Copied' : 'Copy Corrigendum Text'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tender Inspection Drawer */}
      {inspectingTender && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(13, 15, 20, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setInspectingTender(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--hairline)',
              animation: 'auth-card-in 0.18s ease both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--hairline)',
                background: 'var(--paper)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div className="section-label" style={{ margin: 0 }}>TENDER COMPLIANCE PROFILE</div>
                <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '17px', color: 'var(--ink)', margin: '2px 0 0 0' }}>
                  {inspectingTender.tender.tender_id}
                </h3>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setInspectingTender(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-prose)', fontSize: '15px', color: 'var(--ink)' }}>
                  {inspectingTender.tender.title}
                </h4>
                <div style={{ display: 'flex', gap: '10px', color: 'var(--ink-secondary)', fontSize: '12px', marginTop: '4px' }}>
                  <span>Ministry: <strong>{inspectingTender.tender.ministry}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong>{inspectingTender.tender.department}</strong></span>
                  <span>•</span>
                  <span>Val: <strong>₹{inspectingTender.tender.value_inr_cr} Cr</strong></span>
                </div>
              </div>

              <div className="section-label" style={{ margin: '8px 0 2px 0' }}>
                AUDIT OF CITED SPECIFICATIONS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inspectingTender.tender.cited_standards.map((std) => {
                  const cell = inspectingTender.cells[std] || { standard: std, status: 'OK', severity: 'NONE' };
                  const badge = getCellBadge(cell);

                  return (
                    <div
                      key={std}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--paper)',
                        border: '1px solid var(--hairline)',
                        borderLeft: `4px solid ${badge.color}`,
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge-code" style={{ fontSize: '12px', fontWeight: 700 }}>
                            {std}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-data)',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: badge.color,
                            }}
                          >
                            {badge.text}
                          </span>
                        </div>
                        {cell.event && (
                          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                            {cell.event}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => {
                          setInspectingTender(null);
                          setInspectingCell({ tender: inspectingTender.tender, cell });
                        }}
                      >
                        Inspect Clause
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setInspectingTender(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
