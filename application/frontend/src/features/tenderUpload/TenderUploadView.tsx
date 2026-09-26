import React, { useState } from 'react';
import { uploadTenderText, uploadPDF } from '../../api/standardsClient';
import { PDFAnnotationViewer } from './PDFAnnotationViewer';
import type { StandardsResponse } from '../../types';

interface TenderUploadViewProps {
  onSelectItem?: (item: StandardsResponse) => void;
}

export const TenderUploadView: React.FC<TenderUploadViewProps> = ({ onSelectItem }) => {
  const [tab, setTab] = useState<'annotator' | 'text' | 'pdf'>('annotator');
  const [docText, setDocText] = useState(
    `Item 1: Supply of 43 Grade Ordinary Portland Cement (OPC) for highway culvert construction conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa.\n\nItem 2: High tensile structural steel plates grade E250 for railway overbridge girders per IS 2062:2011.\n\nItem 3: HDPE pipes 110mm PN6 for rural drinking water distribution network under Jal Jeevan Mission per IS 4984:1995.`
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

  const handleLoadSample = (type: 'nhai' | 'railways' | 'jjm') => {
    if (type === 'nhai') {
      setDocText(
        `Item 1: Supply of 43 Grade Ordinary Portland Cement (OPC) conforming to IS 8112:1989 for pre-stressed concrete culverts.\nItem 2: Coarse and fine aggregates conforming to IS 383:2016.`
      );
    } else if (type === 'railways') {
      setDocText(
        `Item 1: Structural steel plates conforming to IS 2062:2011 Grade E250 Quality A for ROB girders.\nItem 2: High strength structural bolts conforming to IS 3757:1985.`
      );
    } else {
      setDocText(
        `Item 1: High Density Polyethylene (HDPE) pipes 110mm PN6 conforming to IS 4984:1995 with PE-80 resin for drinking water distribution.`
      );
    }
    setTab('text');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="concept-status-badge active">MULTI-ITEM TENDER INGESTION & AUDIT</span>
          <span className="section-label" style={{ margin: 0 }}>CLAUSE-BY-CLAUSE EXTRACTION</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
          Automated Tender Document Analyser & Split-Screen Highlighter
        </h2>
        <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
          Ingest multi-item procurement tenders, inspect live color-coded statutory citation badges (🟢 Active, 🟡 Amendment Needed, 🔴 Withdrawn/Superseded, 🔵 Missing Allied Requirement), and eliminate CVC audit vulnerability before NIT publication.
        </p>

        {/* Tab & Preset selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`mode-toggle-btn ${tab === 'annotator' ? 'active' : ''}`}
              onClick={() => setTab('annotator')}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              🔍 Split-Screen Clause Annotator
            </button>
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

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>Load Sample:</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('nhai')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              NHAI Culvert
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('railways')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Railway Steel
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('jjm')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Jal Jeevan Pipes
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Split-Screen Annotator & Highlighter */}
      {tab === 'annotator' && (
        <PDFAnnotationViewer
          onOpenWorkbench={(_std) => {
            if (results.length > 0 && onSelectItem) {
              onSelectItem(results[0]);
            }
          }}
        />
      )}

      {/* Mode 2: Text Input Tab */}
      {tab === 'text' && (
        <div className="workbench-card">
          <div className="section-label" style={{ marginBottom: '6px' }}>
            RAW TENDER / NIT DOCUMENT TEXT
          </div>
          <textarea
            rows={8}
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder={`Paste your full NIT tender document here...\nExample:\nItem 1: Supply of 43 Grade OPC Cement per IS 8112:1989.\nItem 2: Structural Steel Plates Grade E250 per IS 2062:2011.\nItem 3: HDPE Pipes 110mm PN6 per IS 4984:1995.`}
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

      {/* Mode 3: PDF Upload Tab */}
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

      {/* Discovered Results List */}
      {results.length > 0 && tab !== 'annotator' && (
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
              Allied Standards: {data.allied_standards?.map((s) => s.is_number).join(', ') || 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
