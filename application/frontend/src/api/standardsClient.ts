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
  if (!res.ok) throw new Error(`Query failed: ${res.status}`);
  return res.json();
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
  const res = await fetch(`${API_BASE}/api/v1/tender-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_text: documentText, role, mode }),
  });
  if (!res.ok) throw new Error(`Tender upload failed: ${res.status}`);
  return res.json();
}

export async function uploadPDF(file: File): Promise<StandardsResponse[]> {
  if (USE_MOCK) {
    await delay(1500);
    return [
      cementMock as unknown as StandardsResponse,
      hdpeMock as unknown as StandardsResponse,
    ];
  }
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/upload-pdf`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`PDF upload failed: ${res.status}`);
  return res.json();
}

export async function submitFeedback(req: FeedbackRequest): Promise<void> {
  if (USE_MOCK) {
    await delay(400);
    return;
  }
  const res = await fetch(`${API_BASE}/api/v1/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Feedback submission failed: ${res.status}`);
}

export async function getAlerts(): Promise<AlertPayload[]> {
  if (USE_MOCK) {
    await delay(300);
    const raw = alertsMock;
    return Array.isArray(raw) ? (raw as AlertPayload[]) : ([raw] as AlertPayload[]);
  }
  const res = await fetch(`${API_BASE}/api/v1/alerts`);
  if (!res.ok) throw new Error(`Alerts fetch failed: ${res.status}`);
  return res.json();
}

export async function exportNITClause(queryOrStandard: string): Promise<{ tender_clause_text: string }> {
  if (USE_MOCK) {
    await delay(500);
    return {
      tender_clause_text: `The material/equipment supplied shall strictly conform to Indian Standard specification (${queryOrStandard}) and all current amendments and Quality Control Orders in force. The vendor must provide valid BIS Certification license documentation prior to supply.`,
    };
  }
  const res = await fetch(`${API_BASE}/api/v1/export-nit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_or_standard: queryOrStandard }),
  });
  if (!res.ok) throw new Error(`NIT export failed: ${res.status}`);
  return res.json();
}
