import React, { useState } from 'react';
import { uploadTenderText, uploadPDFAnnotated } from '../../api/standardsClient';
import { PDFAnnotationViewer } from './PDFAnnotationViewer';
import type { TenderClauseAnnotation } from './TenderClauseHighlighter';
import type { StandardsResponse } from '../../types';
import { FileUp, FileText, Sparkles, CheckCircle2, AlertTriangle, Upload, Eye } from 'lucide-react';

interface TenderUploadViewProps {
  onSelectItem?: (item: StandardsResponse) => void;
  onLaunchPipeline?: (text: string, title?: string, pdfUrl?: string | null) => void;
}

const PRESET_TENDERS = {
  nhai: {
    label: 'NHAI Culverts',
    desc: 'Highway Culvert & Bridges Specification (Cites Outdated IS 8112:1989)',
    text: `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)\nTECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ)\n\nClause 4.1.2 — Cement Specifications for Culvert Works:\nAll structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.\n\nClause 4.1.3 — Coarse & Fine Aggregates:\nAggregates shall conform to IS 383:2016 and be tested for soundness and alkali-aggregate reactivity.`,
    clauses: [
      {
        id: 'c-nhai-1',
        clauseNumber: 'Clause 4.1.2',
        clauseTitle: 'Cement Specifications for Culvert Works',
        rawText: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.',
        verbatimQuote: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 4.1.2',
        detectedStandard: 'IS 8112:1989',
        status: 'WITHDRAWN' as const,
        confidence: 0.98,
        discardStandard: 'IS 8112:1989',
        useStandard: 'IS 269:2015 (incorporating 43 & 53 Grade OPC)',
        whyDiscard: 'Standard was superseded and merged into unified IS 269:2015. Legacy IS 8112 marks are withdrawn by BIS.',
        actionType: 'DISCARD_AND_REPLACE',
        replacement: 'IS 269:2015',
        qcoMandate: 'Cement (Quality Control) Order 2024',
        isMandatory: true,
        cvcRiskNote: 'CVC Office Order No. 04/03/2021: Citing withdrawn standards in public tenders exposes the department to statutory audit disallowance.',
        alliedStandards: ['IS 4031', 'IS 4032'],
        suggestedClauseText: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 269:2015 with mandatory BIS Certification under Cement QCO 2024.',
      },
      {
        id: 'c-nhai-2',
        clauseNumber: 'Clause 4.1.3',
        clauseTitle: 'Coarse & Fine Aggregates',
        rawText: 'Aggregates shall conform to IS 383:2016 and be tested for soundness and alkali-aggregate reactivity.',
        verbatimQuote: 'Aggregates shall conform to IS 383:2016',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 4.1.3',
        detectedStandard: 'IS 383:2016',
        status: 'ACTIVE' as const,
        confidence: 0.96,
        discardStandard: undefined,
        useStandard: 'IS 383:2016 (Third Revision)',
        whyDiscard: undefined,
        actionType: 'RETAIN_ACTIVE',
        replacement: 'IS 383:2016 (Current)',
        qcoMandate: undefined,
        isMandatory: false,
        cvcRiskNote: 'Compliance verified with active 2016 revision including recycled aggregates and AAR threshold.',
        alliedStandards: ['IS 2386'],
        suggestedClauseText: 'Aggregates shall conform to IS 383:2016 and be tested for soundness and alkali-aggregate reactivity per IS 2386.',
      },
    ],
  },
  cpwd: {
    label: 'CPWD Seismic Steel',
    desc: 'High-Rise Structural Concrete & TMT Steel (Cites Outdated IS 1786:1985 / Fe 415)',
    text: `CENTRAL PUBLIC WORKS DEPARTMENT (CPWD) · SEISMIC ZONE IV WORKS\n\nClause 5.2.1 — Reinforcement Steel Bars:\nReinforcement steel for structural columns and shear walls shall be High Yield Strength Deformed (HYSD) bars Grade Fe 415 conforming to IS 1786:1985.\n\nClause 5.2.2 — Plain and Reinforced Concrete:\nConcrete design mix shall conform strictly to IS 456:2000 (Plain and Reinforced Concrete Code of Practice).`,
    clauses: [
      {
        id: 'c-cpwd-1',
        clauseNumber: 'Clause 5.2.1',
        clauseTitle: 'Reinforcement Steel Bars',
        rawText: 'Reinforcement steel for structural columns and shear walls shall be High Yield Strength Deformed (HYSD) bars Grade Fe 415 conforming to IS 1786:1985.',
        verbatimQuote: 'HYSD bars Grade Fe 415 conforming to IS 1786:1985',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 5.2.1',
        detectedStandard: 'IS 1786:1985 / Fe 415',
        status: 'WITHDRAWN' as const,
        confidence: 0.97,
        discardStandard: 'IS 1786:1985 Grade Fe 415',
        useStandard: 'IS 1786:2008 Grade Fe 500D (High Ductility)',
        whyDiscard: 'Legacy 1985 revision omits mandatory Fe 500D earthquake ductility thresholds required for seismic zones under NBC 2016 and BIS Mandate.',
        actionType: 'DISCARD_AND_REPLACE',
        replacement: 'IS 1786:2008 Grade Fe 500D',
        qcoMandate: 'Steel and Steel Products (Quality Control) Order 2024',
        isMandatory: true,
        cvcRiskNote: 'Non-ductile rebar in seismic zones violates IS 13920 and National Building Code statutory safety regulations.',
        alliedStandards: ['IS 1608', 'IS 1599'],
        suggestedClauseText: 'High strength deformed steel bars shall conform to IS 1786:2008 Grade Fe 500D with mandatory BIS ISI Mark per Steel QCO 2024.',
      },
      {
        id: 'c-cpwd-2',
        clauseNumber: 'Clause 5.2.2',
        clauseTitle: 'Plain and Reinforced Concrete',
        rawText: 'Concrete design mix shall conform strictly to IS 456:2000 (Plain and Reinforced Concrete Code of Practice).',
        verbatimQuote: 'IS 456:2000',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 5.2.2',
        detectedStandard: 'IS 456:2000',
        status: 'ACTIVE' as const,
        confidence: 0.99,
        discardStandard: undefined,
        useStandard: 'IS 456:2000 (Fourth Revision, with Amendments 1-5)',
        whyDiscard: undefined,
        actionType: 'RETAIN_ACTIVE',
        replacement: 'IS 456:2000',
        qcoMandate: undefined,
        isMandatory: true,
        cvcRiskNote: 'Primary structural code in force.',
        alliedStandards: ['IS 516', 'IS 1199'],
        suggestedClauseText: 'Concrete design mix shall conform strictly to IS 456:2000 with mandatory slump and compressive strength tests per IS 516.',
      },
    ],
  },
  jjm: {
    label: 'Jal Jeevan Pipes',
    desc: 'Drinking Water Pipeline Network (Cites Outdated IS 4984:1995 / PE-80)',
    text: `MINISTRY OF JAL SHAKTI · JAL JEEVAN MISSION (JJM)\n\nClause 12.4.0 — HDPE Water Supply Pipes:\nHDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.\n\nClause 12.4.1 — Water Quality Parameters:\nDrinking water supplied shall adhere to potable water specification IS 10500:2012.`,
    clauses: [
      {
        id: 'c-jjm-1',
        clauseNumber: 'Clause 12.4.0',
        clauseTitle: 'HDPE Water Supply Pipes',
        rawText: 'HDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.',
        verbatimQuote: 'IS 4984:1995 with PE-80 raw material',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 12.4.0',
        detectedStandard: 'IS 4984:1995',
        status: 'AMENDMENT_NEEDED' as const,
        confidence: 0.94,
        discardStandard: 'IS 4984:1995 (PE-80 material)',
        useStandard: 'IS 4984:2016 (incorporating Amendment 3, PE-100 Grade)',
        whyDiscard: 'Specification revised in 2016 with Amd 3. PE-80 resin provides 25% lower hydrostatic pressure resistance than modern PE-100 virgin resins.',
        actionType: 'AMEND_VERSION',
        replacement: 'IS 4984:2016 with Amendment 3',
        qcoMandate: 'Polyethylene Material for Pipes QCO 2023',
        isMandatory: true,
        cvcRiskNote: 'Using obsolete resin grades causes premature pipe bursting and fails Jal Jeevan Mission 30-year operational life audit.',
        alliedStandards: ['IS 2530', 'IS 5382'],
        suggestedClauseText: 'HDPE pipes for rural drinking water supply shall conform to IS 4984:2016 with Amendment 3, PE-100 grade material, holding valid BIS License under Polyethylene Pipes QCO.',
      },
      {
        id: 'c-jjm-2',
        clauseNumber: 'Clause 12.4.1',
        clauseTitle: 'Water Quality Parameters',
        rawText: 'Drinking water supplied shall adhere to potable water specification IS 10500:2012.',
        verbatimQuote: 'IS 10500:2012',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 12.4.1',
        detectedStandard: 'IS 10500:2012',
        status: 'ACTIVE' as const,
        confidence: 0.98,
        discardStandard: undefined,
        useStandard: 'IS 10500:2012 (Second Revision)',
        whyDiscard: undefined,
        actionType: 'RETAIN_ACTIVE',
        replacement: 'IS 10500:2012',
        qcoMandate: 'Drinking Water QCO 2023',
        isMandatory: true,
        cvcRiskNote: 'Statutory compliance verified.',
        alliedStandards: ['IS 3025'],
        suggestedClauseText: 'Treated water shall conform to IS 10500:2012 acceptable limits, tested per IS 3025.',
      },
    ],
  },
  railways: {
    label: 'Railways Steel & ROB',
    desc: 'Railway Overbridge Structural Steel & Fasteners',
    text: `MINISTRY OF RAILWAYS · RESEARCH DESIGNS AND STANDARDS ORGANISATION (RDSO)\n\nClause 7.3.1 — Structural Steel Plates for Bridge Superstructure:\nStructural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.\n\nClause 7.3.2 — Fasteners & Structural Bolts:\nHigh strength friction grip bolts shall conform to IS 3757:1985 and tightening inspection as per IRC 24.`,
    clauses: [
      {
        id: 'c-rw-1',
        clauseNumber: 'Clause 7.3.1',
        clauseTitle: 'Structural Steel Plates for Bridge Superstructure',
        rawText: 'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.',
        verbatimQuote: 'conforming to IS 2062:2011 Grade E250 Quality A',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 7.3.1',
        detectedStandard: 'IS 2062:2011',
        status: 'ACTIVE' as const,
        confidence: 0.95,
        discardStandard: undefined,
        useStandard: 'IS 2062:2011 Grade E250 Quality A',
        whyDiscard: undefined,
        actionType: 'RETAIN_ACTIVE',
        replacement: 'IS 2062:2011 (Current)',
        qcoMandate: 'Steel QCO 2024',
        isMandatory: true,
        cvcRiskNote: 'Statutory compliance verified under Steel Quality Control Order.',
        alliedStandards: ['IS 1608', 'IS 1599'],
        suggestedClauseText: 'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with mandatory BIS ISI Mark per Steel QCO 2024.',
      },
      {
        id: 'c-rw-2',
        clauseNumber: 'Clause 7.3.2',
        clauseTitle: 'Fasteners & Structural Bolts',
        rawText: 'High strength friction grip bolts shall conform to IS 3757:1985 and tightening inspection as per IRC 24.',
        verbatimQuote: 'conforming to IS 3757:1985',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 7.3.2',
        detectedStandard: 'IS 3757:1985',
        status: 'AMENDMENT_NEEDED' as const,
        confidence: 0.93,
        discardStandard: 'IS 3757:1985',
        useStandard: 'IS 3757:2008 (High Strength Structural Bolts)',
        whyDiscard: 'Standard revised to incorporate Property Class 8.8S / 10.9S high-tensile torque calibration.',
        actionType: 'AMEND_VERSION',
        replacement: 'IS 3757:2008',
        qcoMandate: 'Fasteners QCO 2023',
        isMandatory: true,
        cvcRiskNote: 'Using legacy fastener specs in railway overbridges violates RDSO bridge manual tolerances.',
        alliedStandards: ['IS 6649', 'IS 6623'],
        suggestedClauseText: 'High strength structural friction grip bolts shall conform to IS 3757:2008 (Class 8.8S/10.9S) with nuts conforming to IS 6623.',
      },
    ],
  },
  cctv: {
    label: 'Smart Cities CCTV',
    desc: 'Electronics Surveillance & Video Systems (Missing MeitY CRS Registration)',
    text: `SMART CITIES MISSION · INTEGRATED COMMAND AND CONTROL CENTRE (ICCC)\n\nClause 15.2.1 — CCTV Video Surveillance & IP Cameras:\nIP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability and POE+ power interface.\n\nClause 15.2.2 — Network Video Recorders:\nNVR appliances shall support H.265 video compression with 64-channel decoding capability.`,
    clauses: [
      {
        id: 'c-cctv-1',
        clauseNumber: 'Clause 15.2.1',
        clauseTitle: 'CCTV Video Surveillance & IP Cameras',
        rawText: 'IP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability and POE+ power interface.',
        verbatimQuote: 'IP dome cameras for surveillance shall provide 1080p full HD resolution',
        pageNumber: 1,
        pageLocation: 'Page 1, Clause 15.2.1',
        detectedStandard: 'IS 13252 (Part 1):2010 / CRO Scheme',
        status: 'MISSING_ALLIED' as const,
        confidence: 0.91,
        discardStandard: 'Generic Uncertified IP CCTV Specifications',
        useStandard: 'IS 13252 (Part 1):2010 & BIS CRS Registration',
        whyDiscard: 'Procurement of electronic surveillance equipment without mandatory BIS CRS registration violates MeitY CRO order and Public Procurement (Make in India) guidelines.',
        actionType: 'ADD_ALLIED',
        replacement: 'IS 13252 (Part 1):2010 & CRS Scheme Registration',
        qcoMandate: 'MeitY Electronics & IT Goods (Compulsory Registration) Order',
        isMandatory: true,
        cvcRiskNote: 'Public procurement of uncertified electronics violates Public Procurement Order and exposes tender to CVC vigilance cancellation.',
        alliedStandards: ['IS 13252 (Part 1):2010', 'IS 16842'],
        suggestedClauseText: 'IP dome cameras shall comply with IS 13252 (Part 1):2010 with valid BIS Compulsory Registration Scheme (CRS) Registration and adhere to STQC/MeitY Cybersecurity Guidelines.',
      },
    ],
  },
};

export const TenderUploadView: React.FC<TenderUploadViewProps> = ({ onSelectItem, onLaunchPipeline }) => {
  const [tab, setTab] = useState<'annotator' | 'text' | 'pdf'>('annotator');
  const [docText, setDocText] = useState(PRESET_TENDERS.nhai.text);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<StandardsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [clauseAnnotations, setClauseAnnotations] = useState<TenderClauseAnnotation[]>(
    PRESET_TENDERS.nhai.clauses
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTextAnalyze = async () => {
    if (!docText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await uploadTenderText(docText);
      setResults(res);
      setTab('annotator');
    } catch (e: any) {
      setError(e.message || 'Failed to analyze tender document');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUpload = async (fileToUpload?: File) => {
    const file = fileToUpload || pdfFile;
    if (!file || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const blobUrl = URL.createObjectURL(file);
      setPdfUrl(blobUrl);
      const res = await uploadPDFAnnotated(file);
      setResults(res.responses);
      if (res.pages && res.pages.length > 0) {
        setPdfPages(res.pages);
      }
      if (res.extracted_text) {
        setDocText(res.extracted_text);
      }
      if (res.clause_annotations && res.clause_annotations.length > 0) {
        setClauseAnnotations(res.clause_annotations as TenderClauseAnnotation[]);
      }
      // Instantly switch to interactive Split-Screen Annotator tab
      setTab('annotator');
    } catch (e: any) {
      setError(e.message || 'Failed to process PDF tender file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (key: keyof typeof PRESET_TENDERS) => {
    const sample = PRESET_TENDERS[key];
    setDocText(sample.text);
    setClauseAnnotations(sample.clauses);
    setPdfUrl(null);
    setPdfPages([sample.text]);
    setTab('annotator');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setPdfFile(file);
        handlePdfUpload(file);
      } else {
        setError('Please drop a valid PDF document (.pdf).');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="concept-status-badge active">MULTI-ITEM TENDER INGESTION & AUDIT</span>
          <span className="section-label" style={{ margin: 0 }}>CLAUSE-BY-CLAUSE EXTRACTION & HIGH-PRECISION HIGHLIGHTER</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
          Automated Tender Document Analyser & "Use vs Discard" Diff Engine
        </h2>
        <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
          Ingest multi-item procurement tenders, inspect live color-coded statutory citation badges (Active, Amendment Needed, Withdrawn/Superseded, Missing Allied Requirement), modify existing tender clauses with in-place redline diffs, and eliminate CVC audit vulnerability before NIT publication.
        </p>

        {/* Tab & Preset selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`mode-toggle-btn ${tab === 'annotator' ? 'active' : ''}`}
              onClick={() => setTab('annotator')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
            >
              <Eye size={13} />
              <span>Split-Screen Annotator & Highlighter</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${tab === 'pdf' ? 'active' : ''}`}
              onClick={() => setTab('pdf')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
            >
              <FileUp size={13} />
              <span>Upload PDF Document</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${tab === 'text' ? 'active' : ''}`}
              onClick={() => setTab('text')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
            >
              <FileText size={13} />
              <span>Paste Tender Text</span>
            </button>

            {onLaunchPipeline && (
              <button
                type="button"
                onClick={() => onLaunchPipeline(docText, 'Tender Document Analysis', pdfUrl)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}
              >
                <Sparkles size={14} />
                <span>Launch 3-Stage Pipeline</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                  AI + HITL
                </span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>Load Real Tender Presets:</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('nhai')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              title={PRESET_TENDERS.nhai.desc}
            >
              NHAI Culverts
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('cpwd')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              title={PRESET_TENDERS.cpwd.desc}
            >
              CPWD Steel
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('jjm')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              title={PRESET_TENDERS.jjm.desc}
            >
              Jal Jeevan Pipes
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('railways')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              title={PRESET_TENDERS.railways.desc}
            >
              Railways ROB
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleLoadSample('cctv')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              title={PRESET_TENDERS.cctv.desc}
            >
              Smart Cities CCTV
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Split-Screen Annotator & Highlighter */}
      {tab === 'annotator' && (
        <PDFAnnotationViewer
          initialClauses={clauseAnnotations.length > 0 ? clauseAnnotations : undefined}
          pdfUrl={pdfUrl}
          rawText={docText}
          pages={pdfPages.length > 0 ? pdfPages : undefined}
          onApplyFixToDraft={(updatedText) => setDocText(updatedText)}
          onOpenWorkbench={(_std) => {
            if (results.length > 0 && onSelectItem) {
              onSelectItem(results[0]);
            }
          }}
        />
      )}

      {/* Mode 2: PDF Upload Tab */}
      {tab === 'pdf' && (
        <div className="workbench-card">
          <div className="section-label" style={{ marginBottom: '6px' }}>
            PDF TENDER SPECIFICATION UPLOAD & EXTRACTION (AIFORBHARAT PARSER ENGINE)
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            style={{
              marginTop: '10px',
              border: `2px dashed ${isDragOver ? 'var(--collapse-cobalt)' : 'var(--hairline)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '36px',
              textAlign: 'center',
              background: isDragOver ? 'rgba(37, 99, 235, 0.04)' : 'var(--paper)',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload-input"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setPdfFile(file);
                  handlePdfUpload(file);
                }
              }}
            />
            <label htmlFor="pdf-upload-input" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <FileText size={42} style={{ color: 'var(--collapse-cobalt)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                {pdfFile ? pdfFile.name : 'Click to Browse or Drag & Drop PDF Tender Document'}
              </div>
              <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-muted)', marginTop: '6px' }}>
                Supports standard GeM, CPWD, NHAI, Railways, and State PWD PDF tender specifications
              </div>
              <div style={{ marginTop: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-data)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--collapse-cobalt)',
                    fontWeight: 600,
                  }}
                >
                  <Upload size={12} /> Select PDF File
                </span>
              </div>
            </label>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {pdfFile && (
              <button type="button" className="btn-secondary" onClick={() => setPdfFile(null)}>
                Clear Selected
              </button>
            )}
            <button
              type="button"
              className="btn-run"
              onClick={() => handlePdfUpload()}
              disabled={isLoading || !pdfFile}
            >
              {isLoading ? 'Extracting Text & Matching...' : 'Extract & Analyse PDF Document'}
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Text Input Tab */}
      {tab === 'text' && (
        <div className="workbench-card">
          <div className="section-label" style={{ marginBottom: '6px' }}>
            RAW TENDER / NIT DOCUMENT TEXT INPUT
          </div>
          <textarea
            rows={10}
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
              padding: '14px',
              color: 'var(--ink)',
              lineHeight: 1.6,
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
              {isLoading ? 'Decomposing Clauses...' : 'Extract & Analyse Tender Items'}
            </button>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="workbench-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--collapse-cobalt)' }}>
            Decomposing tender clauses via GraphRAG pipeline... Matching 22,000+ BIS standards... Evaluating QCOs...
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
