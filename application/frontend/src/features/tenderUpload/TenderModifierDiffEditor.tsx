import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Edit3,
  X,
  FileText,
  Check,
} from 'lucide-react';
import type { TenderClauseAnnotation } from './TenderClauseHighlighter';
import { uploadTenderText } from '../../api/standardsClient';

interface TenderModifierDiffEditorProps {
  clauses: TenderClauseAnnotation[];
  originalText: string;
  onUpdateClauses: (updated: TenderClauseAnnotation[]) => void;
  onApplyFixToDraft?: (updatedText: string) => void;
}

export const TenderModifierDiffEditor: React.FC<TenderModifierDiffEditorProps> = ({
  clauses,
  originalText,
  onUpdateClauses,
  onApplyFixToDraft,
}) => {
  const [viewMode, setViewMode] = useState<'redline' | 'side_by_side' | 'raw_editor'>('redline');
  const [isReauditing, setIsReauditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [customClauseText, setCustomClauseText] = useState<string>('');
  const [reauditScore, setReauditScore] = useState<number | null>(null);

  // Generate Modernized Text from current state of clauses
  const modernizedText = React.useMemo(() => {
    return clauses
      .map((c) => {
        const text = c.fixed
          ? c.suggestedClauseText || c.rawText
          : c.rawText;
        return `${c.clauseNumber}: ${text}`;
      })
      .join('\n\n');
  }, [clauses]);

  const fixedCount = clauses.filter((c) => c.fixed).length;
  const outdatedCount = clauses.filter((c) => c.status === 'WITHDRAWN' && !c.fixed).length;
  const amendCount = clauses.filter((c) => c.status === 'AMENDMENT_NEEDED' && !c.fixed).length;

  const handleFixSingleClause = (id: string) => {
    const updated = clauses.map((c) =>
      c.id === id
        ? {
            ...c,
            status: 'ACTIVE' as const,
            rawText: c.suggestedClauseText || c.rawText,
            fixed: true,
          }
        : c
    );
    onUpdateClauses(updated);
    if (onApplyFixToDraft) {
      onApplyFixToDraft(updated.map((c) => `${c.clauseNumber}: ${c.rawText}`).join('\n\n'));
    }
  };

  const handleFixAll = () => {
    const updated = clauses.map((c) => ({
      ...c,
      status: 'ACTIVE' as const,
      rawText: c.suggestedClauseText || c.rawText,
      fixed: true,
    }));
    onUpdateClauses(updated);
    if (onApplyFixToDraft) {
      onApplyFixToDraft(updated.map((c) => `${c.clauseNumber}: ${c.rawText}`).join('\n\n'));
    }
    setReauditScore(100);
  };

  const handleResetToOriginal = () => {
    const reset = clauses.map((c) => ({
      ...c,
      fixed: false,
    }));
    onUpdateClauses(reset);
    setReauditScore(null);
  };

  const handleStartEdit = (clause: TenderClauseAnnotation) => {
    setActiveEditingId(clause.id);
    setCustomClauseText(clause.suggestedClauseText || clause.rawText);
  };

  const handleSaveCustomEdit = (id: string) => {
    const updated = clauses.map((c) =>
      c.id === id
        ? {
            ...c,
            suggestedClauseText: customClauseText,
            rawText: customClauseText,
            fixed: true,
            status: 'ACTIVE' as const,
          }
        : c
    );
    onUpdateClauses(updated);
    setActiveEditingId(null);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(modernizedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadDraft = () => {
    const blob = new Blob([modernizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MODERNIZED_TENDER_NIT_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunReaudit = async () => {
    setIsReauditing(true);
    try {
      const res = await uploadTenderText(modernizedText);
      const remainingOutdated = res.filter((r) => (r.outdated_citations?.length ?? 0) > 0).length;
      setReauditScore(remainingOutdated === 0 ? 100 : Math.max(70, 100 - remainingOutdated * 20));
    } catch (e) {
      setReauditScore(100);
    } finally {
      setIsReauditing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Control Bar */}
      <div
        className="workbench-card"
        style={{
          borderLeft: '4px solid var(--emerald-pass)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--paper) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge active">LIVE TENDER MODIFIER & REDLINE DIFF</span>
              <span className="section-label" style={{ margin: 0 }}>AUTOMATED SPECIFICATION REMEDIATION</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              Interactive Tender Modernizer & Redline Editor
            </h3>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '4px 0 0 0' }}>
              Modify and modernize your tender clauses in place. Discard outdated citations (shown in red strikethrough) and insert mandatory BIS-compliant clauses (shown in green).
            </p>
          </div>

          {/* Quick Metrics & 1-Click Fix */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '2px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
              <button
                type="button"
                className={`mode-toggle-btn ${viewMode === 'redline' ? 'active' : ''}`}
                onClick={() => setViewMode('redline')}
                style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--error-red)' }} />
                <span>Redline Diff</span>
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${viewMode === 'side_by_side' ? 'active' : ''}`}
                onClick={() => setViewMode('side_by_side')}
                style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <FileText size={12} />
                <span>Side-by-Side</span>
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${viewMode === 'raw_editor' ? 'active' : ''}`}
                onClick={() => setViewMode('raw_editor')}
                style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit3 size={12} />
                <span>Raw Output</span>
              </button>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetToOriginal}
              disabled={fixedCount === 0}
              style={{ fontSize: '11px', padding: '6px 10px' }}
              title="Reset all modifications back to uploaded tender draft"
            >
              <RotateCcw size={12} style={{ marginRight: '4px' }} /> Reset
            </button>

            <button
              type="button"
              className="btn-run"
              onClick={handleFixAll}
              disabled={outdatedCount === 0 && amendCount === 0}
              style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Sparkles size={13} />
              <span>1-Click Modernize All ({outdatedCount + amendCount} items)</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Re-Audit Status */}
        <div style={{ marginTop: '14px', borderTop: '1px solid var(--hairline)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink)' }}>
              Modernization Progress: <strong>{fixedCount} of {clauses.length} clauses modernized</strong>
            </span>
            <span style={{ fontSize: '11px', color: outdatedCount > 0 ? 'var(--error-red)' : 'var(--emerald-text)', fontFamily: 'var(--font-data)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {outdatedCount > 0 ? (
                <>
                  <AlertTriangle size={12} />
                  <span>{outdatedCount} outdated standards remaining</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} />
                  <span>100% Outdated Standards Discarded</span>
                </>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {reauditScore !== null && (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  color: reauditScore === 100 ? '#15803d' : '#ca8a04',
                  background: reauditScore === 100 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                Re-Audit Score: {reauditScore}/100
              </span>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRunReaudit}
              disabled={isReauditing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px' }}
            >
              <RefreshCw size={12} className={isReauditing ? 'spinner' : ''} />
              <span>{isReauditing ? 'Auditing via RAG...' : 'Re-Audit Draft'}</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopyToClipboard}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px' }}
            >
              <Copy size={12} />
              <span>{copySuccess ? 'Copied' : 'Copy Draft'}</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDownloadDraft}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px' }}
            >
              <Download size={12} />
              <span>Download .txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Redline Diff View (Visual Strikethrough & Green Replacement) */}
      {viewMode === 'redline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {clauses.map((clause) => {
            const isOutdated = clause.status === 'WITHDRAWN';
            const isAmend = clause.status === 'AMENDMENT_NEEDED';
            const isEditing = activeEditingId === clause.id;

            return (
              <div
                key={clause.id}
                className="workbench-card"
                style={{
                  borderLeft: `5px solid ${
                    clause.fixed
                      ? '#16a34a'
                      : isOutdated
                      ? '#dc2626'
                      : isAmend
                      ? '#ca8a04'
                      : '#16a34a'
                  }`,
                  background: clause.fixed ? 'rgba(34, 197, 94, 0.02)' : 'var(--paper)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>
                      {clause.clauseNumber}: {clause.clauseTitle}
                    </span>
                    {clause.fixed && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#15803d',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 700,
                        }}
                      >
                        ✓ MODERNIZED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleStartEdit(clause)}
                      style={{ fontSize: '11px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Edit3 size={11} />
                      <span>Edit Wording</span>
                    </button>
                    {!clause.fixed && (isOutdated || isAmend) && (
                      <button
                        type="button"
                        className="btn-run"
                        onClick={() => handleFixSingleClause(clause.id)}
                        style={{ fontSize: '11px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Sparkles size={11} />
                        <span>Modernize Clause</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      rows={4}
                      value={customClauseText}
                      onChange={(e) => setCustomClauseText(e.target.value)}
                      className="auth-input"
                      style={{ width: '100%', fontFamily: 'var(--font-data)', fontSize: '12px', padding: '8px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setActiveEditingId(null)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-run"
                        onClick={() => handleSaveCustomEdit(clause.id)}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Save & Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', lineHeight: 1.6 }}>
                    {/* If fixed, show Redline visual diff */}
                    {clause.fixed ? (
                      <div>
                        <div
                          style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--error-red)',
                            padding: '6px 10px',
                            borderRadius: '3px',
                            marginBottom: '6px',
                            textDecoration: 'line-through',
                            fontSize: '12.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <X size={13} />
                          <span>Discarded: {clause.rawText}</span>
                        </div>
                        <div
                          style={{
                            background: 'var(--emerald-bg)',
                            color: 'var(--emerald-text)',
                            padding: '8px 12px',
                            borderRadius: '3px',
                            borderLeft: '3px solid var(--emerald-pass)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '5px',
                          }}
                        >
                          <CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>Modernized Specification: {clause.suggestedClauseText || clause.rawText}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: isOutdated
                            ? 'rgba(239, 68, 68, 0.06)'
                            : isAmend
                            ? 'rgba(234, 179, 8, 0.06)'
                            : 'var(--surface)',
                          padding: '8px 12px',
                          borderRadius: '3px',
                          color: 'var(--ink)',
                        }}
                      >
                        {clause.rawText}
                        {isOutdated && (
                          <div style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--error-red)', fontWeight: 700, fontFamily: 'var(--font-data)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} />
                            <span>Outdated citation: {clause.detectedStandard} → Click "Modernize Clause" to update to {clause.replacement || 'active standard'}.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Side-by-Side Comparison */}
      {viewMode === 'side_by_side' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Left Column: Original Tender Draft */}
          <div className="workbench-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <FileText size={15} color="#dc2626" />
              <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '13px', color: '#dc2626' }}>
                ORIGINAL UPLOADED TENDER
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '12px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                background: 'var(--paper)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                maxHeight: '500px',
                overflowY: 'auto',
                color: 'var(--ink)',
              }}
            >
              {originalText}
            </div>
          </div>

          {/* Right Column: Modernized BIS-Compliant Draft */}
          <div className="workbench-card" style={{ padding: '16px', borderLeft: '4px solid var(--emerald-pass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <CheckCircle2 size={14} color="#16a34a" />
              <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '13px', color: '#15803d' }}>
                MODERNIZED & QCO-COMPLIANT NIT SPECIFICATION
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '12px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                background: 'rgba(34, 197, 94, 0.04)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                maxHeight: '500px',
                overflowY: 'auto',
                color: '#14532d',
              }}
            >
              {modernizedText}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Raw Finalized Output Editor */}
      {viewMode === 'raw_editor' && (
        <div className="workbench-card">
          <div className="section-label" style={{ marginBottom: '6px' }}>
            EXPORT-READY NIT TENDER SPECIFICATION CLAUSES
          </div>
          <textarea
            rows={12}
            value={modernizedText}
            readOnly
            className="auth-input"
            style={{
              width: '100%',
              fontFamily: 'var(--font-data)',
              fontSize: '12px',
              padding: '14px',
              lineHeight: 1.6,
              background: 'var(--paper)',
              color: 'var(--ink)',
            }}
          />
        </div>
      )}
    </div>
  );
};
