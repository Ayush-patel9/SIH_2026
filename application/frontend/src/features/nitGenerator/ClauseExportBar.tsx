import React, { useState } from 'react';
import { downloadTXT, downloadPrintableHTML, printClause } from './clauseExport';

interface ClauseExportBarProps {
  clauseText: string;
  isNumber: string;
  auditHash?: string;
  className?: string;
}

export const ClauseExportBar: React.FC<ClauseExportBarProps> = ({
  clauseText,
  isNumber,
  auditHash,
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(clauseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`clause-export-bar ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 18px',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>📜</span>
        <div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>
            EXPORT TENDER TECHNICAL CLAUSE
          </div>
          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)' }}>
            Ready for GeM, CPWD, or NIC e-Procurement schedule insertion.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-run"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>{copied ? 'Copied to Clipboard' : 'Copy Full Clause'}</span>
        </button>

        <button
          type="button"
          onClick={() => printClause(clauseText, isNumber, auditHash)}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
        >
          <span>🖨️</span>
          <span>Print / PDF</span>
        </button>

        <button
          type="button"
          onClick={() => downloadTXT(clauseText, isNumber)}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
        >
          <span>📄</span>
          <span>Download .TXT</span>
        </button>

        <button
          type="button"
          onClick={() => downloadPrintableHTML(clauseText, isNumber, auditHash)}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
        >
          <span>🌐</span>
          <span>Download .HTML</span>
        </button>
      </div>
    </div>
  );
};
