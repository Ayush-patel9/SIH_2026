import type { QueryRequest, StandardsResponse, FeedbackRequest, AlertPayload, UserRole, QueryMode, SupportedLanguage } from '../types';

const USE_MOCK =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_USE_MOCK !== 'false'
    : true;
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  'http://localhost:8000';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Mock Data Imports ──────────────────────────────────────────
import cementMock from '../fixtures/cement_mock.json';
import hdpeMock from '../fixtures/hdpe_mock.json';
import ledMock from '../fixtures/led_mock.json';
import cctvMock from '../fixtures/cctv_mock.json';
import alertsMock from '../fixtures/alert_payload_mock.json';

function pickMock(text: string): StandardsResponse {
  const t = text.toLowerCase();
  if (t.includes('hdpe') || t.includes('pipe') || t.includes('4984') || t.includes('water')) {
    return hdpeMock as unknown as StandardsResponse;
  }
  if (t.includes('led') || t.includes('lamp') || t.includes('light') || t.includes('16102') || t.includes('luminaire')) {
    return ledMock as unknown as StandardsResponse;
  }
  if (t.includes('cctv') || t.includes('camera') || t.includes('surveillance') || t.includes('16165') || t.includes('सीसीटीवी') || t.includes('निगरानी')) {
    return cctvMock as unknown as StandardsResponse;
  }
  return cementMock as unknown as StandardsResponse;
}

// ── API Functions ──────────────────────────────────────────────

export async function queryStandards(
  text: string,
  opts?: { mode?: QueryMode; language?: SupportedLanguage; role?: UserRole }
): Promise<StandardsResponse> {
  if (USE_MOCK) {
    await delay(600);
    const mock = pickMock(text);
    // Clone and adapt with query params
    const result = JSON.parse(JSON.stringify(mock)) as StandardsResponse;
    if (opts?.mode) {
      result.meta.mode = opts.mode;
      if (opts.mode === 'dry_run') {
        result.audit_record.dry_run = true;
        result.audit_record.logged = false;
      }
    }
    if (opts?.language) {
      result.query_understanding.detected_language = opts.language;
    }
    return result;
  }
  try {
    const body: Partial<QueryRequest> = {
      input: {
        text,
        mode: opts?.mode ?? 'recommend',
        language: opts?.language ?? 'en',
      },
      auth: {
        role: opts?.role ?? 'PROCUREMENT_OFFICER',
      },
    };
    const res = await fetch(`${API_BASE}/api/v1/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Query failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[standardsClient] Live query failed, falling back to mock:', err);
    const mock = pickMock(text);
    const result = JSON.parse(JSON.stringify(mock)) as StandardsResponse;
    if (opts?.mode) result.meta.mode = opts.mode;
    if (opts?.language) result.query_understanding.detected_language = opts.language;
    return result;
  }
}

export async function uploadTenderText(
  documentText: string,
  role: UserRole = 'PROCUREMENT_OFFICER',
  mode: QueryMode = 'recommend'
): Promise<StandardsResponse[]> {
  if (USE_MOCK) {
    await delay(1200);
    return [
      cementMock as unknown as StandardsResponse,
      hdpeMock as unknown as StandardsResponse,
      ledMock as unknown as StandardsResponse,
    ];
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/tender-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_text: documentText, role, mode }),
    });
    if (!res.ok) throw new Error(`Tender upload failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[standardsClient] Live tender upload failed, falling back to mock:', err);
    return [
      cementMock as unknown as StandardsResponse,
      hdpeMock as unknown as StandardsResponse,
      ledMock as unknown as StandardsResponse,
    ];
  }
}

export interface PDFAnnotatedResponse {
  responses: StandardsResponse[];
  extracted_text: string;
  pages: string[];
  clause_annotations: any[];
}

export async function uploadPDF(file: File): Promise<StandardsResponse[]> {
  if (USE_MOCK) {
    await delay(1500);
    return [
      cementMock as unknown as StandardsResponse,
      hdpeMock as unknown as StandardsResponse,
    ];
  }
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/api/v1/upload-pdf`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`PDF upload failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[standardsClient] Live PDF upload failed, falling back to mock:', err);
    return [
      cementMock as unknown as StandardsResponse,
      hdpeMock as unknown as StandardsResponse,
    ];
  }
}

export async function uploadPDFAnnotated(file: File): Promise<PDFAnnotatedResponse> {
  if (USE_MOCK) {
    await delay(1500);
    return {
      responses: [
        cementMock as unknown as StandardsResponse,
        hdpeMock as unknown as StandardsResponse,
      ],
      extracted_text: "Item 1: Supply of 43 Grade Ordinary Portland Cement...\nItem 2: Structural steel plates...",
      pages: [
        `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)\nTECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ)\n\nClause 4.1.2 — Cement Specifications for Culvert Works:\nAll structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.\n\nClause 4.1.3 — Coarse & Fine Aggregates:\nAggregates shall conform to IS 383:2016 and be tested for soundness and alkali-aggregate reactivity.`,
        `Clause 7.3.1 — Structural Steel Plates for Bridge Superstructure:\nStructural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.\n\nClause 7.3.2 — Fasteners & Structural Bolts:\nHigh strength friction grip bolts shall conform to IS 3757:1985 and tightening inspection as per IRC 24.`,
        `Clause 12.4.0 — High Density Polyethylene (HDPE) Water Supply Pipes:\nHDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.\n\nClause 15.2.1 — CCTV Video Surveillance & IP Cameras:\nIP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability.`,
      ],
      clause_annotations: [
        {
          id: 'clause-1',
          clauseNumber: 'Clause 4.1.2',
          clauseTitle: 'Portland Cement Specifications for Highway Culverts',
          rawText:
            'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.',
          verbatimQuote:
            'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989',
          pageNumber: 1,
          pageLocation: 'Page 1, Clause 4.1.2',
          detectedStandard: 'IS 8112:1989',
          status: 'WITHDRAWN',
          confidence: 0.98,
          replacement: 'IS 269:2015 (incorporating 43-Grade under Clause 5.1)',
          cvcRiskNote:
            'CVC Office Order No. 04/03/2021: Citing withdrawn standards in public tenders exposes the department to statutory audit disallowance and post-award vendor litigation.',
          alliedStandards: ['IS 4031', 'IS 4032'],
          suggestedClauseText:
            'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 269:2015 with mandatory BIS Certification under Cement QCO 2024.',
        },
        {
          id: 'clause-2',
          clauseNumber: 'Clause 7.3.1',
          clauseTitle: 'Structural Steel Plates for Bridge Superstructure',
          rawText:
            'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with ultrasonic testing per ASTM standards.',
          verbatimQuote:
            'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A',
          pageNumber: 2,
          pageLocation: 'Page 2, Clause 7.3.1',
          detectedStandard: 'IS 2062:2011',
          status: 'ACTIVE',
          confidence: 0.95,
          replacement: 'IS 2062:2011 (Current)',
          cvcRiskNote:
            'Statutory compliance verified under Steel and Steel Products (Quality Control) Order 2024. Mandatory ISI marking applies.',
          alliedStandards: ['IS 1608', 'IS 1599'],
          suggestedClauseText:
            'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with mandatory BIS ISI Mark per Steel QCO 2024.',
        },
      ]
    };
  }
  try {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/api/v1/upload-pdf-annotated`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Annotated PDF upload failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[standardsClient] Live annotated PDF upload failed, falling back to mock:', err);
    return {
      responses: [
        cementMock as unknown as StandardsResponse,
        hdpeMock as unknown as StandardsResponse,
      ],
      extracted_text: "Item 1: Supply of 43 Grade Ordinary Portland Cement...",
      pages: [
        "Clause 4.1.2: All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989.",
        "Clause 7.3.1: Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A."
      ],
      clause_annotations: [
        {
          id: 'clause-1',
          clauseNumber: 'Clause 4.1.2',
          clauseTitle: 'Portland Cement Specifications for Highway Culverts',
          rawText: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989',
          verbatimQuote: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989',
          pageNumber: 1,
          pageLocation: 'Page 1, Clause 4.1.2',
          detectedStandard: 'IS 8112:1989',
          status: 'WITHDRAWN',
          confidence: 0.98,
          replacement: 'IS 269:2015',
          cvcRiskNote: 'CVC Office Order No. 04/03/2021: Withdrawn standard cited.',
          alliedStandards: ['IS 4031'],
          suggestedClauseText: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 269:2015.'
        }
      ]
    };
  }
}

export async function submitFeedback(req: FeedbackRequest): Promise<void> {
  if (USE_MOCK) {
    await delay(400);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Feedback submission failed: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.warn('[standardsClient] Live feedback submission failed:', err);
    throw err;
  }
}

export async function getAlerts(): Promise<AlertPayload[]> {
  if (USE_MOCK) {
    await delay(300);
    const raw = alertsMock;
    return Array.isArray(raw) ? (raw as AlertPayload[]) : ([raw] as AlertPayload[]);
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/alerts`);
    if (!res.ok) throw new Error(`Alerts fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[standardsClient] Live alerts fetch failed, falling back to mock:', err);
    const raw = alertsMock;
    return Array.isArray(raw) ? (raw as AlertPayload[]) : ([raw] as AlertPayload[]);
  }
}

export async function exportNITClause(queryOrStandard: string): Promise<{ tender_clause_text: string }> {
  if (USE_MOCK) {
    await delay(500);
    return {
      tender_clause_text: `The material/equipment supplied shall strictly conform to Indian Standard specification (${queryOrStandard}) and all current amendments and Quality Control Orders in force. The vendor must provide valid BIS Certification license documentation prior to supply.`,
    };
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/export-nit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_or_standard: queryOrStandard }),
    });
    if (!res.ok) throw new Error(`NIT export failed: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[standardsClient] Live NIT export failed, falling back to mock:', err);
    return {
      tender_clause_text: `The material/equipment supplied shall strictly conform to Indian Standard specification (${queryOrStandard}) and all current amendments and Quality Control Orders in force. The vendor must provide valid BIS Certification license documentation prior to supply.`,
    };
  }
}
