import React, { useState } from 'react';
import { uploadTenderText, uploadPDF } from '../../api/standardsClient';
import type { StandardsResponse } from '../../types';

interface TenderUploadViewProps {
  onSelectItem?: (item: StandardsResponse) => void;
}

export const TenderUploadView: React.FC<TenderUploadViewProps> = ({ onSelectItem }) => {
  const [tab, setTab] = useState<'text' | 'pdf'>('text');
  const [docText, setDocText] = useState(
    `Item 1: Supply of 43 Grade Ordinary Portland Cement (OPC) for highway culvert construction conforming to national standards.\n\nItem 2: High tensile structural steel plates grade E250 for railway overbridge girders.\n\nItem 3: HDPE pipes 110mm PN6 for rural drinking water distribution network under Jal Jeevan Mission.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<StandardsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleTextAnalyze = async () => {
    if (!docText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await uploadTenderText(docText);
      setResults(res);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze tender document');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await uploadPDF(pdfFile);
      setResults(res);
    } catch (e: any) {
      setError(e.message || 'Failed to process PDF tender file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="concept-status-badge active">MULTI-ITEM TENDER INGESTION</span>
          <span className="section-label" style={{ margin: 0 }}>CLAUSE-BY-CLAUSE EXTRACTION</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
          Automated Tender Document Analyser
        </h2>
        <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
          Paste a multi-item procurement tender or upload an official PDF NIT document. Each schedule line item is decomposed, matched to applicable BIS standards, and scanned for withdrawn specifications.
        </p>

        {/* Tab selector */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
          <button
            type="button"
            className={`mode-toggle-btn ${tab === 'text' ? 'active' : ''}`}
            onClick={() => setTab('text')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            📋 Paste Tender Text / Clauses
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${tab === 'pdf' ? 'active' : ''}`}
            onClick={() => setTab('pdf')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            📄 Upload PDF Document
          </button>
        </div>
      </div>

      {/* Text Input Tab */}
      {tab === 'text' && (
        <div className="workbench-card">
          <div className="section-label" style={{ marginBottom: '6px' }}>
            RAW TENDER / NIT DOCUMENT TEXT
          </div>
          <textarea
            rows={8}
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder={`Paste your full NIT tender document here...\nExample:\nItem 1: Supply of 43 Grade OPC Cement.\nItem 2: Structural Steel Plates Grade E250.\nItem 3: HDPE Pipes 110mm PN6.`}
            className="auth-input"
            style={{
              width: '100%',
              fontFamily: 'var(--font-data)',
              fontSize: '12px',
              resize: 'vertical',
              background: 'var(--paper)',
              padding: '12px',
              color: 'var(--ink)',
              lineHeight: 1.5,
            }}
          />
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDocText('')}
              disabled={isLoading}
            >
              Clear Text
            </button>
            <button
              type="button"
              className="btn-run"
              onClick={handleTextAnalyze}
              disabled={isLoading || !docText.trim()}
            >
              {isLoading ? 'Decomposing Clauses...' : '⚙ Extract & Analyse Tender Items'}
            </button>
          </div>
        </div>
      )}

      {/* PDF Upload Tab */}
      {tab === 'pdf' && (
        <div className="workbench-card">
          <div className="section-label" style={{ marginBottom: '6px' }}>
            PDF TENDER SPECIFICATION UPLOAD
          </div>
          <div
            style={{
              marginTop: '10px',
              border: '2px dashed var(--hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '32px',
              textAlign: 'center',
              background: 'var(--paper)',
            }}
          >
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload-input"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])}
            />
            <label htmlFor="pdf-upload-input" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                {pdfFile ? pdfFile.name : 'Click to select PDF tender document'}
              </div>
              <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Supports standard GeM, CPWD, NHAI, and State PWD PDF tender specifications
              </div>
            </label>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {pdfFile && (
              <button type="button" className="btn-secondary" onClick={() => setPdfFile(null)}>
                Remove
              </button>
            )}
            <button
              type="button"
              className="btn-run"
              onClick={handlePdfUpload}
              disabled={isLoading || !pdfFile}
            >
              {isLoading ? 'Extracting Text & Matching...' : '⚙ Extract & Analyse PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="workbench-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--collapse-cobalt)' }}>
            ◉ Decomposing tender clauses via LLM... Matching BIS standards... Building audit records...
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'rgba(194, 59, 59, 0.08)',
            border: '1px solid var(--error-line)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: 'var(--error-line)',
            fontFamily: 'var(--font-data)',
            fontSize: '12px',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label" style={{ margin: 0 }}>
              DISCOVERED ITEMS ({results.length} SCHEDULE SPECIFICATIONS RESOLVED)
            </span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
              {results.filter((r) => r.outdated_citations.length > 0).length} outdated citations caught
            </span>
          </div>

          {results.map((res, i) => (
            <TenderItemResultCard
              key={i}
              index={i + 1}
              data={res}
              onSelect={() => onSelectItem && onSelectItem(res)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TenderItemResultCardProps {
  index: number;
  data: StandardsResponse;
  onSelect?: () => void;
}

const TenderItemResultCard: React.FC<TenderItemResultCardProps> = ({ index, data, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const primary = data.primary_recommendation;
  const hasOutdated = (data.outdated_citations?.length ?? 0) > 0;

  return (
    <div
      className="workbench-card"
      style={{
        borderLeft: `4px solid ${hasOutdated ? 'var(--error-line)' : 'var(--emerald-pass)'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="section-label" style={{ margin: '0 8px 0 0' }}>
            ITEM #{index}
          </span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
            {primary.is_number}
          </span>
          <span style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginLeft: '8px' }}>
            {primary.title}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {hasOutdated && <span className="concept-status-badge withdrawn">⚠ OUTDATED CITED</span>}
          {primary.certification?.mandatory && (
            <span
              className="concept-status-badge"
              style={{
                background: 'rgba(224, 152, 43, 0.1)',
                color: '#92400E',
                border: '1px solid rgba(224, 152, 43, 0.3)',
              }}
            >
              QCO MANDATORY
            </span>
          )}
          <span className="concept-status-badge active">
            CONF: {(primary.confidence * 100).toFixed(0)}%
          </span>
          {onSelect && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onSelect}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Inspect in Workbench →
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setExpanded((v) => !v)}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {expanded ? '▲ Hide' : '▼ Details'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
          {primary.scope_snippet && (
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
              "{primary.scope_snippet}"
            </div>
          )}

          {data.outdated_citations?.map((oc, j) => (
            <div
              key={j}
              style={{
                background: 'rgba(194, 59, 59, 0.06)',
                border: '1px solid rgba(194, 59, 59, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                marginBottom: '6px',
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                color: '#7F1D1D',
              }}
            >
              🔴 Outdated: <strong>"{oc.cited_standard}"</strong> is {oc.status} → Replace with <strong>{oc.replacement}</strong>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
              AUDIT HASH: {data.audit_record?.audit_hash?.slice(0, 32)}...
            </div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
              Allied Standards: {data.allied_standards.map((s) => s.is_number).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
