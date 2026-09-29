import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import type { NITCustomFields } from './clauseTemplates';

interface ClauseEditorProps {
  clauseText: string;
  onChange: (newText: string) => void;
  customFields: NITCustomFields;
  onUpdateCustomFields: (fields: Partial<NITCustomFields>) => void;
  className?: string;
}

export const ClauseEditor: React.FC<ClauseEditorProps> = ({
  clauseText,
  onChange,
  customFields,
  onUpdateCustomFields,
  className = '',
}) => {
  const [showQuickFill, setShowQuickFill] = useState<boolean>(true);

  // Count remaining unfilled placeholders
  const placeholderMatches = clauseText.match(/\[FILL: [^\]]+\]/g) || [];
  const placeholderCount = placeholderMatches.length;

  return (
    <div className={`clause-editor-wrapper ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Quick Fill Parameters Bar */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-label" style={{ margin: 0 }}>
              TENDER METADATA & QUICK-FILL PARAMETERS
            </span>
            {placeholderCount > 0 ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-data)',
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: '#FEF3C7',
                  color: '#B45309',
                  border: '1px solid #FDE68A',
                  fontWeight: 700,
                }}
              >
                <AlertTriangle size={11} /> {placeholderCount} Placeholder{placeholderCount === 1 ? '' : 's'} Remaining
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-data)',
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: '#DCFCE7',
                  color: 'var(--emerald-pass)',
                  border: '1px solid #BBF7D0',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={11} /> All Metadata Complete
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '11px' }}
            onClick={() => setShowQuickFill(!showQuickFill)}
          >
            {showQuickFill ? (
              <>
                <ChevronUp size={12} /> Hide Form
              </>
            ) : (
              <>
                <ChevronDown size={12} /> Expand Form
              </>
            )}
          </button>
        </div>

        {showQuickFill && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <label className="auth-label" style={{ margin: 0 }}>
              NIT / Tender Ref No.
              <input
                type="text"
                value={customFields.nitNumber || ''}
                onChange={(e) => onUpdateCustomFields({ nitNumber: e.target.value })}
                placeholder="e.g. NIT-MoRTH-2026-088"
                className="auth-input font-mono"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              />
            </label>

            <label className="auth-label" style={{ margin: 0 }}>
              Ministry / Department
              <input
                type="text"
                value={customFields.ministry || ''}
                onChange={(e) => onUpdateCustomFields({ ministry: e.target.value })}
                placeholder="e.g. MoHUA / CPWD"
                className="auth-input"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              />
            </label>

            <label className="auth-label" style={{ margin: 0 }}>
              Project & Location
              <input
                type="text"
                value={customFields.projectName || ''}
                onChange={(e) => onUpdateCustomFields({ projectName: e.target.value })}
                placeholder="e.g. NH-44 Elevated Flyover"
                className="auth-input"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              />
            </label>

            <label className="auth-label" style={{ margin: 0 }}>
              Officer In-Charge
              <input
                type="text"
                value={customFields.officerName || ''}
                onChange={(e) => onUpdateCustomFields({ officerName: e.target.value })}
                placeholder="e.g. Executive Engineer"
                className="auth-input"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              />
            </label>

            <label className="auth-label" style={{ margin: 0 }}>
              Est. Value (INR Cr)
              <input
                type="text"
                value={customFields.estimatedCostInrCr || ''}
                onChange={(e) => onUpdateCustomFields({ estimatedCostInrCr: e.target.value })}
                placeholder="e.g. 45.0"
                className="auth-input font-mono"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Text Editor Container */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--paper)',
            padding: '6px 12px',
            border: '1px solid var(--hairline)',
            borderBottom: 'none',
            borderTopLeftRadius: 'var(--radius-sm)',
            borderTopRightRadius: 'var(--radius-sm)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
            EDITABLE LEGAL CLAUSE DRAFT
          </span>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
            <span>{clauseText.split('\n').length} lines</span>
            <span>•</span>
            <span>{clauseText.length} chars</span>
          </div>
        </div>

        <textarea
          rows={18}
          value={clauseText}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
          style={{
            width: '100%',
            fontSize: '12px',
            lineHeight: '1.5',
            background: '#FFFFFF',
            color: 'var(--ink)',
            border: '1px solid var(--hairline)',
            borderBottomLeftRadius: 'var(--radius-sm)',
            borderBottomRightRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};
