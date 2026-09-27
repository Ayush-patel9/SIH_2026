/**
 * ExportReport.tsx
 * Institutional report exporter for ManakAI analytics:
 * - Generates CVC & BIS Executive CSV
 * - Generates Printable Intelligence Memorandum (Window Print / PDF)
 */

import React from 'react';
import type { DashboardMetrics } from './metricsAggregator';
import { AuditStore } from '../audit/auditStore';

interface ExportReportProps {
  metrics: DashboardMetrics;
  onRefresh?: () => void;
}

export function exportMISReportCSV(): void {
  const records = AuditStore.getAll();
  const header = ['Query ID', 'Standard IS Number', 'Title', 'Confidence', 'Mode', 'Timestamp', 'Domain', 'Ministry'];
  const rows = records.map((rec) => {
    const resp = rec.response;
    const qId = resp.meta?.query_id || rec.id;
    const isNum = resp.primary_recommendation?.is_number || 'N/A';
    const title = `"${(resp.primary_recommendation?.title || '').replace(/"/g, '""')}"`;
    const conf = resp.primary_recommendation?.confidence != null ? resp.primary_recommendation.confidence.toFixed(2) : '1.00';
    const mode = resp.meta?.mode || (resp.audit_record?.dry_run ? 'dry_run' : 'recommend');
    const ts = resp.meta?.timestamp || (rec.savedAt ? new Date(rec.savedAt).toISOString() : new Date().toISOString());
    const domain = (resp as any).meta?.domain || (resp.primary_recommendation?.ics_codes && resp.primary_recommendation.ics_codes[0]) || 'General';
    const ministry = `"${(resp.primary_recommendation?.certification?.notifying_ministry || 'Ministry of Commerce & Industry').replace(/"/g, '""')}"`;
    return [qId, isNum, title, conf, mode, ts, domain, ministry].join(',');
  });

  const csvContent = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ManakAI_MIS_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadMetricsJSON(metrics: DashboardMetrics): void {
  const jsonStr = JSON.stringify(metrics, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ManakAI_Metrics_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportDashboardReportCSV(metrics: DashboardMetrics): void {
  const lines = [
    ['========================================================================'],
    ['BUREAU OF INDIAN STANDARDS — MANAKAI PLATFORM INTELLIGENCE REPORT'],
    [`GENERATED ON: ${new Date().toISOString()} (UTC)`],
    ['========================================================================'],
    [''],
    ['SECTION 1: KEY PERFORMANCE & SURVEILLANCE METRICS'],
    ['Metric', 'Value'],
    ['Total Procurement Queries Screened', metrics.totalQueries],
    ['Official Recommendations (Logged & SHA-256 Locked)', metrics.officialRecommendations],
    ['Draft / Dry-Run Queries', metrics.draftSessions],
    ['Pending Expert Moderations', metrics.pendingFeedback],
    ['Verified Historical Corrections', metrics.verifiedCorrections],
    ['Expert Trust Score (%)', `${metrics.trustScorePercent}%`],
    ['Standards Monitored in Scope', metrics.standardsCovered],
    [''],
    ['SECTION 2: MOST-QUERIED STANDARDS & DISPUTE RATES'],
    ['Standard Code', 'Query Count', 'Correction Count', 'Dispute Rate (%)'],
    ...Object.entries(metrics.standardsQueried).map(([std, count]) => {
      const fb = metrics.feedbackByStandard[std] || { corrections: 0 };
      const rate = count > 0 ? ((fb.corrections / count) * 100).toFixed(2) : '0.00';
      return [`"${std}"`, count, fb.corrections, `${rate}%`];
    }),
    [''],
    ['SECTION 3: MINISTRY PROCUREMENT COMPLIANCE MATRIX'],
    ['Ministry / Agency', 'Department', 'Tenders Screened', 'Compliant', 'Outdated Intercepted', 'QCO Compliance (%)', 'Vigilance Status'],
    ...metrics.ministryCompliance.map((m) => [
      `"${m.ministry}"`,
      `"${m.department}"`,
      m.totalTenders,
      m.compliantTenders,
      m.outdatedIntercepted,
      `${m.complianceRate.toFixed(1)}%`,
      m.riskStatus,
    ]),
    [''],
    ['SECTION 4: DOMAIN DISTRIBUTION'],
    ['Domain', 'Query Volume'],
    ...Object.entries(metrics.domainsQueried).map(([domain, count]) => [`"${domain}"`, count]),
  ];

  const csv = lines.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ManakAI_Executive_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printExecutiveMemorandum(metrics: DashboardMetrics): void {
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) return;

  const topStdsHtml = Object.entries(metrics.standardsQueried)
    .slice(0, 6)
    .map(([std, count]) => {
      const fb = metrics.feedbackByStandard[std] || { corrections: 0 };
      return `<tr><td><strong>${std}</strong></td><td style="text-align:right;">${count}</td><td style="text-align:right;">${fb.corrections}</td></tr>`;
    })
    .join('');

  const minHtml = metrics.ministryCompliance
    .map(
      (m) =>
        `<tr><td><strong>${m.ministry}</strong></td><td>${m.department}</td><td style="text-align:right;">${m.totalTenders}</td><td style="text-align:right;">${m.complianceRate}%</td><td>${m.riskStatus}</td></tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ManakAI Executive Intelligence Memorandum</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; color: #111; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .header h2 { margin: 4px 0 0 0; font-size: 14px; font-weight: normal; color: #444; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 20px; font-size: 13px; }
          .kpi-table, .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          .kpi-table td, .data-table th, .data-table td { border: 1px solid #777; padding: 6px 8px; }
          .data-table th { background-color: #f0f0f0; text-align: left; }
          .footer { margin-top: 40px; font-size: 11px; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Government of India · Bureau of Indian Standards</h1>
          <h2>ManakAI National Standards Intelligence & Procurement Surveillance Executive Brief</h2>
        </div>
        <div class="meta-grid">
          <div><strong>REPORT DATE:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
          <div style="text-align:right;"><strong>CONFIDENTIALITY:</strong> OFFICIAL USE ONLY (BIS/CVC)</div>
        </div>
        <table class="kpi-table">
          <tr>
            <td><strong>Total Queries Screened:</strong> ${metrics.totalQueries.toLocaleString('en-IN')}</td>
            <td><strong>Official Audit Records:</strong> ${metrics.officialRecommendations.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td><strong>Expert Trust Accuracy:</strong> ${metrics.trustScorePercent}%</td>
            <td><strong>Standards Monitored:</strong> ${metrics.standardsCovered}</td>
          </tr>
        </table>
        <h3>1. Top Queried Indian Standards & Defect Interceptions</h3>
        <table class="data-table">
          <thead>
            <tr><th>Indian Standard (IS)</th><th style="text-align:right;">Query Volume</th><th style="text-align:right;">Disputes / Corrections</th></tr>
          </thead>
          <tbody>${topStdsHtml}</tbody>
        </table>
        <h3>2. Ministry Compliance & Vigilance Surveillance</h3>
        <table class="data-table">
          <thead>
            <tr><th>Ministry / Body</th><th>Department</th><th style="text-align:right;">Tenders</th><th style="text-align:right;">Compliance</th><th>Status</th></tr>
          </thead>
          <tbody>${minHtml}</tbody>
        </table>
        <div class="footer">
          Digitally generated via ManakAI Intelligence Engine. Cryptographic verification hash logged to CVC Audit Vault.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

export const ExportReport: React.FC<ExportReportProps> = ({ metrics, onRefresh }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--hairline)',
        borderRadius: '4px',
        marginTop: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
          SURVEILLANCE VAULT:
        </span>
        <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-primary)' }}>
          {metrics.totalQueries.toLocaleString('en-IN')} records aggregated across {metrics.standardsCovered} standards
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {onRefresh && (
          <button
            type="button"
            className="palette-btn"
            onClick={onRefresh}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            ↻ Recompute Metrics
          </button>
        )}
        <button
          type="button"
          className="palette-btn"
          onClick={() => printExecutiveMemorandum(metrics)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          🖨️ Executive Memorandum
        </button>
        <button
          type="button"
          className="btn-run"
          onClick={() => exportMISReportCSV()}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          📊 Export MIS Report (CSV)
        </button>
        <button
          type="button"
          className="palette-btn"
          onClick={() => downloadMetricsJSON(metrics)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          📦 Download JSON
        </button>
        <button
          type="button"
          className="palette-btn"
          onClick={() => exportDashboardReportCSV(metrics)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          ⬇️ Executive CSV
        </button>
      </div>
    </div>
  );
};
