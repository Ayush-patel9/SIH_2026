import React, { useState } from 'react';
import type { NITScheduleItem } from './types';
import { Copy, Download, Check, FileSpreadsheet, FileText } from 'lucide-react';

interface NITSpecificationsTabProps {
  schedule: NITScheduleItem[];
  fullDraftText: string;
  tenderTitle: string;
}

export const NITSpecificationsTab: React.FC<NITSpecificationsTabProps> = ({
  schedule,
  fullDraftText,
  tenderTitle,
}) => {
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);

  const handleCopyDraft = async () => {
    await navigator.clipboard.writeText(fullDraftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleDownloadDraft = () => {
    const blob = new Blob([fullDraftText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NIT_Technical_Specifications_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTableCSV = async () => {
    const headers = ['Item No', 'Description', 'Mandatory IS', 'Grade/Type', 'Scheme', 'Test Standards'];
    const rows = schedule.map((item) => [
      item.item_no,
      `"${item.item_description.replace(/"/g, '""')}"`,
      item.mandatory_indian_standard,
      item.grade_or_type,
      item.conformity_scheme,
      `"${item.mandatory_testing_standards.join(', ')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    await navigator.clipboard.writeText(csvContent);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  if (!schedule || schedule.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '48px 24px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          textAlign: 'center',
          color: 'var(--ink-muted)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <FileText size={32} style={{ color: 'var(--ink-muted)' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px 0' }}>
          NIT Schedule Pending Finalization
        </h3>
        <p style={{ fontSize: '13.5px', maxWidth: '500px', margin: '0 auto 18px', lineHeight: 1.5, color: 'var(--ink-secondary)' }}>
          Finalize the tender decomposition in the Product ↔ IS Inventory tab to compile the statutory NIT specification schedule.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 2px 0' }}>
            Statutory NIT Technical Specification Schedule
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', margin: 0 }}>
            {schedule.length} procurement schedules ready for GeM BOQ / CPPP tender publishing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleCopyTableCSV}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--ink)',
              border: '1px solid var(--hairline)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
            }}
          >
            {copiedTable ? <Check size={14} color="var(--emerald-pass)" /> : <FileSpreadsheet size={14} />}
            <span>{copiedTable ? 'CSV Copied' : 'Copy CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyDraft}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--ink)',
              border: '1px solid var(--hairline)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
            }}
          >
            {copiedDraft ? <Check size={14} color="var(--emerald-pass)" /> : <Copy size={14} />}
            <span>{copiedDraft ? 'NIT Copied' : 'Copy Full NIT Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDraft}
            style={{
              backgroundColor: 'var(--olive-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} />
            <span>Download Markdown Spec</span>
          </button>
        </div>
      </div>

      {/* Structured NIT Schedule Table */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', backgroundColor: 'var(--surface-secondary)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Schedule of Prescribed Indian Standards & Conformity Scheme
          </h4>
        </div>

        <div className="table-scroll-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--hairline)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', minWidth: '70px', color: 'var(--ink-muted)', fontWeight: 700 }}>Item #</th>
                <th style={{ padding: '10px 14px', minWidth: '170px', color: 'var(--ink-muted)', fontWeight: 700 }}>Item Description</th>
                <th style={{ padding: '10px 14px', minWidth: '170px', color: 'var(--ink-muted)', fontWeight: 700 }}>Mandatory Indian Standard</th>
                <th style={{ padding: '10px 14px', minWidth: '130px', color: 'var(--ink-muted)', fontWeight: 700 }}>Grade / Type</th>
                <th style={{ padding: '10px 14px', minWidth: '140px', color: 'var(--ink-muted)', fontWeight: 700 }}>Conformity Scheme</th>
                <th style={{ padding: '10px 14px', minWidth: '230px', color: 'var(--ink-muted)', fontWeight: 700 }}>Mandatory NABL Test Methods</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--hairline)',
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-secondary)',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-data)' }}>{row.item_no}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--ink)' }}>{row.item_description}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-data, monospace)', fontWeight: 700, color: 'var(--emerald-pass)' }}>
                    {row.mandatory_indian_standard}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--ink-secondary)' }}>{row.grade_or_type}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--amber-bg)',
                        color: 'var(--amber-warn)',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: '1px solid var(--amber-border)',
                      }}
                    >
                      {row.conformity_scheme}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-data, monospace)', fontSize: '11.5px', color: 'var(--collapse-cobalt)' }}>
                    {row.mandatory_testing_standards.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Draft Text Area */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink-muted)', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-data)' }}>
            Full Exportable NIT Specifications Text
          </h4>
          <button
            type="button"
            onClick={handleCopyDraft}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--olive-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copiedDraft ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedDraft ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        <textarea
          readOnly
          value={fullDraftText}
          rows={14}
          style={{
            width: '100%',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--hairline)',
            borderRadius: '6px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '12.5px',
            lineHeight: 1.6,
            color: 'var(--ink)',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};
