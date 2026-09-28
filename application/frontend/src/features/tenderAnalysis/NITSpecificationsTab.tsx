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
          backgroundColor: '#FFFEFB',
          padding: '48px 24px',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
          textAlign: 'center',
          color: '#6E7A68',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1C2419', margin: '0 0 6px 0' }}>
          NIT Schedule Pending Finalization
        </h3>
        <p style={{ fontSize: '13.5px', maxWidth: '500px', margin: '0 auto 18px', lineHeight: 1.5 }}>
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
          backgroundColor: '#FFFEFB',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C2419', margin: '0 0 2px 0' }}>
            Statutory NIT Technical Specification Schedule
          </h3>
          <p style={{ fontSize: '12.5px', color: '#6E7A68', margin: 0 }}>
            {schedule.length} procurement schedules ready for GeM BOQ / CPPP tender publishing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleCopyTableCSV}
            style={{
              backgroundColor: '#FAF8F3',
              color: '#1C2419',
              border: '1px solid #DCD6C8',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {copiedTable ? <Check size={14} color="#2D6A4F" /> : <FileSpreadsheet size={14} />}
            <span>{copiedTable ? 'CSV Copied' : 'Copy CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyDraft}
            style={{
              backgroundColor: '#FAF8F3',
              color: '#1C2419',
              border: '1px solid #DCD6C8',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {copiedDraft ? <Check size={14} color="#2D6A4F" /> : <Copy size={14} />}
            <span>{copiedDraft ? 'NIT Copied' : 'Copy Full NIT Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDraft}
            style={{
              backgroundColor: '#2D6A4F',
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
          backgroundColor: '#FFFEFB',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(54, 69, 47, 0.04)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E0D4', backgroundColor: '#FAF8F3' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1C2419', margin: 0 }}>
            Schedule of Prescribed Indian Standards & Conformity Scheme
          </h4>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F6F3EB', borderBottom: '1px solid #E5E0D4', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: '#6E7A68', fontWeight: 700 }}>Item #</th>
                <th style={{ padding: '10px 14px', color: '#6E7A68', fontWeight: 700 }}>Item Description</th>
                <th style={{ padding: '10px 14px', color: '#6E7A68', fontWeight: 700 }}>Mandatory Indian Standard</th>
                <th style={{ padding: '10px 14px', color: '#6E7A68', fontWeight: 700 }}>Grade / Type</th>
                <th style={{ padding: '10px 14px', color: '#6E7A68', fontWeight: 700 }}>Conformity Scheme</th>
                <th style={{ padding: '10px 14px', color: '#6E7A68', fontWeight: 700 }}>Mandatory NABL Test Methods</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #EAE5D9',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FCFAF7',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1C2419' }}>{row.item_no}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1C2419' }}>{row.item_description}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#2D6A4F' }}>
                    {row.mandatory_indian_standard}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#44503E' }}>{row.grade_or_type}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        color: '#B45309',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: '1px solid rgba(217, 119, 6, 0.25)',
                      }}
                    >
                      {row.conformity_scheme}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '11.5px', color: '#1D4ED8' }}>
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
          backgroundColor: '#FFFEFB',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#6E7A68', textTransform: 'uppercase', margin: 0 }}>
            Full Exportable NIT Specifications Text
          </h4>
          <button
            type="button"
            onClick={handleCopyDraft}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#2D6A4F',
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
            backgroundColor: '#FAF8F3',
            border: '1px solid #E5E0D4',
            borderRadius: '6px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '12.5px',
            lineHeight: 1.6,
            color: '#1C2419',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};
