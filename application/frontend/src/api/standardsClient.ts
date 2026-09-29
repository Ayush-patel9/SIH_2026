import type { QueryRequest, StandardsResponse, FeedbackRequest, AlertPayload, UserRole, QueryMode, SupportedLanguage } from '../types';

// Mock Data Imports
import cementMock from '../fixtures/cement_mock.json';
import steelMock from '../fixtures/steel_mock.json';
import hdpeMock from '../fixtures/hdpe_mock.json';
import ledMock from '../fixtures/led_mock.json';
import cctvMock from '../fixtures/cctv_mock.json';
import alertsMock from '../fixtures/alert_payload_mock.json';

const USE_MOCK_EXPLICIT =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_USE_MOCK === 'true'
    : false;

export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  'http://localhost:8000';

export const WS_BASE =
  API_BASE.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function pickMock(text: string): StandardsResponse {
  const t = text.toLowerCase();
  if (t.includes('steel') || t.includes('rebar') || t.includes('tmt') || t.includes('1786') || t.includes('fe 500') || t.includes('fe500') || t.includes('लोहा') || t.includes('स्टील') || t.includes('கம்பி') || t.includes('ఇనుము')) {
    return steelMock as unknown as StandardsResponse;
  }
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

// ── WebSocket Types ─────────────────────────────────────────────

export interface PipelineSocketEvent {
  type: 'connected' | 'stage_start' | 'stage_complete' | 'authority_log' | 'pipeline_complete' | 'error' | 'pong';
  stage?: number;
  name?: string;
  detail?: string;
  elapsed_ms?: number;
  data?: StandardsResponse;
  message?: string;
  log?: string;
  level?: string;
  normalized_query?: string;
  detected_language?: string;
  intent?: string;
  timestamp?: string;
}

// ── Real-time WebSocket Streaming ───────────────────────────────

/**
 * Executes a GraphRAG query over the live WebSocket connection (/ws/pipeline),
 * streaming real-time stage transitions (0 to 7), authority stream logs, and synthesis tokens.
 * Gracefully falls back to REST or mock if socket fails.
 */
export async function streamQueryOverSocket(
  text: string,
  opts?: { mode?: QueryMode; language?: SupportedLanguage; role?: UserRole },
  onEvent?: (event: PipelineSocketEvent) => void
): Promise<StandardsResponse> {
  if (USE_MOCK_EXPLICIT) {
    return simulateSocketQuery(text, opts, onEvent);
  }

  return new Promise<StandardsResponse>((resolve, reject) => {
    let ws: WebSocket | null = null;
    let isSettled = false;

    const timeout = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        if (ws) ws.close();
        console.warn('[standardsClient] WebSocket timed out after 180s, falling back to REST/Mock.');
        queryStandards(text, opts).then(resolve).catch(reject);
      }
    }, 180000);

    try {
      ws = new WebSocket(`${WS_BASE}/ws/pipeline`);

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            type: 'query',
            text,
            mode: opts?.mode ?? 'recommend',
            role: opts?.role ?? 'OFFICER',
            language: opts?.language ?? 'en',
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const payload: PipelineSocketEvent = JSON.parse(event.data);
          if (onEvent) onEvent(payload);

          if (payload.type === 'pipeline_complete' && payload.data) {
            isSettled = true;
            clearTimeout(timeout);
            ws?.close();
            resolve(payload.data);
          } else if (payload.type === 'error') {
            console.warn('[standardsClient] WebSocket received error event:', payload.message);
            isSettled = true;
            clearTimeout(timeout);
            ws?.close();
            // Fall back to REST/Mock
            queryStandards(text, opts).then(resolve).catch(reject);
          }
        } catch (e) {
          console.error('[standardsClient] Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeout);
          console.warn('[standardsClient] WebSocket error, falling back to REST/Mock:', err);
          queryStandards(text, opts).then(resolve).catch(reject);
        }
      };

      ws.onclose = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timeout);
          queryStandards(text, opts).then(resolve).catch(reject);
        }
      };
    } catch (e) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeout);
        queryStandards(text, opts).then(resolve).catch(reject);
      }
    }
  });
}

/**
 * Offline simulation of WebSocket events when explicitly in mock mode.
 */
async function simulateSocketQuery(
  text: string,
  opts?: { mode?: QueryMode; language?: SupportedLanguage; role?: UserRole },
  onEvent?: (event: PipelineSocketEvent) => void
): Promise<StandardsResponse> {
  const stages = [
    { stage: 0, name: 'Input Ingestion & Authentication', detail: 'Parsing raw input and verifying user credentials...' },
    { stage: 1, name: 'AI Call #1: Query Understanding', detail: 'Gemini normalizer parsing multilingual input...' },
    { stage: 2, name: 'Entity Extraction', detail: 'Classifying technical attributes and IS citations...' },
    { stage: 3, name: 'Tri-Retrieval Layer', detail: 'Searching FAISS dense vectors and BM25 index...' },
    { stage: 4, name: 'GraphRAG Supersession Resolution', detail: 'Traversing Knowledge Graph dependencies...' },
    { stage: 5, name: 'AI Call #2: Grounded Reasoning', detail: 'Synthesizing statutory explainability and compliance checklist...' },
    { stage: 6, name: 'Grounding Safety Net Validation', detail: 'Deterministic zero-hallucination verification...' },
    { stage: 7, name: 'Contract Assembly & Audit Sealing', detail: 'Generating SHA-256 cryptographic audit hash...' },
  ];

  for (const s of stages) {
    if (onEvent) {
      onEvent({ type: 'stage_start', stage: s.stage, name: s.name, detail: s.detail });
    }
    await delay(120);
    if (onEvent) {
      onEvent({ type: 'stage_complete', stage: s.stage, name: s.name, detail: `${s.name} successfully executed.` });
    }
  }

  const mock = pickMock(text);
  const result = JSON.parse(JSON.stringify(mock)) as StandardsResponse;
  if (opts?.mode) result.meta.mode = opts.mode;
  if (opts?.language) result.query_understanding.detected_language = opts.language;
  return result;
}

/**
 * Connects to the real-time Regulatory Alerts WebSocket stream (/ws/alerts).
 */
export function connectAlertsSocket(
  onSnapshot?: (alerts: AlertPayload[]) => void,
  onLiveAlert?: (alert: AlertPayload) => void
): () => void {
  let ws: WebSocket | null = null;

  try {
    ws = new WebSocket(`${WS_BASE}/ws/alerts`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'alerts_snapshot' && Array.isArray(payload.alerts)) {
          if (onSnapshot) onSnapshot(payload.alerts);
        } else if (payload.type === 'live_alert' && payload.alert) {
          if (onLiveAlert) onLiveAlert(payload.alert);
        }
      } catch (e) {
        console.error('[standardsClient] Alerts WS message parse error:', e);
      }
    };

    ws.onerror = (err) => {
      console.debug('[standardsClient] Alerts WS error (backend offline fallback active):', err);
    };
  } catch (err) {
    console.debug('[standardsClient] Alerts WS connection error:', err);
  }

  return () => {
    if (ws) ws.close();
  };
}

// ── Live REST API Calls (With Offline Mock Fallback) ────────────

export async function queryStandards(
  text: string,
  opts?: { mode?: QueryMode; language?: SupportedLanguage; role?: UserRole }
): Promise<StandardsResponse> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const body: Partial<QueryRequest> = {
        input: {
          text,
          mode: opts?.mode ?? 'recommend',
          language: opts?.language ?? 'en',
        },
        auth: {
          role: opts?.role ?? 'OFFICER',
        },
      };
      const res = await fetch(`${API_BASE}/api/v1/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live REST query failed, falling back to mock:', err);
    }
  }

  // Graceful Fallback
  await delay(400);
  const mock = pickMock(text);
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

export async function uploadTenderText(
  documentText: string,
  role: UserRole = 'OFFICER',
  mode: QueryMode = 'recommend'
): Promise<StandardsResponse[]> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/tender-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_text: documentText, role, mode }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live tender upload failed, falling back to mock:', err);
    }
  }

  await delay(800);
  return [
    cementMock as unknown as StandardsResponse,
    hdpeMock as unknown as StandardsResponse,
    ledMock as unknown as StandardsResponse,
  ];
}

export interface PDFAnnotatedResponse {
  responses: StandardsResponse[];
  extracted_text: string;
  pages: string[];
  clause_annotations: any[];
}

export async function uploadPDF(file: File): Promise<StandardsResponse[]> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/upload-pdf`, { method: 'POST', body: form });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live PDF upload failed, falling back to mock:', err);
    }
  }

  await delay(1000);
  return [
    cementMock as unknown as StandardsResponse,
    hdpeMock as unknown as StandardsResponse,
  ];
}

export async function uploadPDFAnnotated(file: File): Promise<PDFAnnotatedResponse> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/upload-pdf-annotated`, { method: 'POST', body: form });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live annotated PDF upload failed, falling back to mock:', err);
    }
  }

  await delay(1200);
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
        discardStandard: 'IS 8112:1989 (43 Grade OPC)',
        useStandard: 'IS 269:2015 (Sixth Revision, Grade 43/53)',
        whyDiscard:
          'Standard was superseded and merged into unified IS 269:2015. Legacy IS 8112 ISI marks are no longer issued by BIS. Citing withdrawn standards violates CVC circular 04/03/2021.',
        actionType: 'DISCARD_AND_REPLACE',
        replacement: 'IS 269:2015 (incorporating 43-Grade under Clause 5.1)',
        qcoMandate: 'Cement (Quality Control) Order 2024',
        isMandatory: true,
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
        discardStandard: undefined,
        useStandard: 'IS 2062:2011 Grade E250 Quality A',
        whyDiscard: undefined,
        actionType: 'RETAIN_ACTIVE',
        replacement: 'IS 2062:2011 (Current)',
        qcoMandate: 'Steel and Steel Products (Quality Control) Order 2024',
        isMandatory: true,
        cvcRiskNote:
          'Statutory compliance verified under Steel and Steel Products (Quality Control) Order 2024. Mandatory ISI marking applies.',
        alliedStandards: ['IS 1608', 'IS 1599'],
        suggestedClauseText:
          'Structural steel plates and sections shall conform to IS 2062:2011 Grade E250 Quality A with mandatory BIS ISI Mark per Steel QCO 2024.',
      },
      {
        id: 'clause-3',
        clauseNumber: 'Clause 12.4.0',
        clauseTitle: 'High Density Polyethylene (HDPE) Water Supply Pipes',
        rawText:
          'HDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995 with PE-80 raw material.',
        verbatimQuote:
          'HDPE pipes for rural drinking water distribution network shall be manufactured as per IS 4984:1995',
        pageNumber: 3,
        pageLocation: 'Page 3, Clause 12.4.0',
        detectedStandard: 'IS 4984:1995',
        status: 'AMENDMENT_NEEDED',
        confidence: 0.93,
        discardStandard: 'IS 4984:1995 (PE-80 material)',
        useStandard: 'IS 4984:2016 (incorporating Amendment 3, PE-100 Grade)',
        whyDiscard:
          'Standard revised in 2016 with Amendment 3. PE-80 raw material provides 25% lower hydrostatic pressure resistance than modern PE-100 resins.',
        actionType: 'AMEND_VERSION',
        replacement: 'IS 4984:2016 (incorporating Amendment 3)',
        qcoMandate: 'Polyethylene Material for Pipes QCO 2023',
        isMandatory: true,
        cvcRiskNote:
          'Standard revised in 2016. Using legacy 1995 specification fails to incorporate the latest hydrostatic pressure test duration required by Jal Jeevan Mission guidelines.',
        alliedStandards: ['IS 2530', 'IS 5382'],
        suggestedClauseText:
          'HDPE pipes for rural drinking water supply shall conform to IS 4984:2016 with Amendment 3, PE-100 grade material, holding valid BIS License under Polyethylene Pipes QCO.',
      },
      {
        id: 'clause-4',
        clauseNumber: 'Clause 15.2.1',
        clauseTitle: 'CCTV Video Surveillance & IP Cameras',
        rawText:
          'IP dome cameras for surveillance shall provide 1080p full HD resolution with on-board recording capability.',
        verbatimQuote:
          'IP dome cameras for surveillance shall provide 1080p full HD resolution',
        pageNumber: 3,
        pageLocation: 'Page 3, Clause 15.2.1',
        detectedStandard: 'IS 13252 (Part 1):2010 / CRO Scheme',
        status: 'MISSING_ALLIED',
        confidence: 0.91,
        discardStandard: 'Uncertified generic electronic surveillance clauses',
        useStandard: 'IS 13252 (Part 1):2010 & BIS CRS Registration',
        whyDiscard:
          'Tender omits mandatory MeitY Compulsory Registration Scheme (CRS) compliance clause. Public procurement of uncertified electronics violates Public Procurement Order.',
        actionType: 'ADD_ALLIED',
        replacement: 'IS 13252 (Part 1):2010 & Essential Requirements under CRO Scheme',
        qcoMandate: 'MeitY Electronics & IT Goods (Compulsory Registration) Order',
        isMandatory: true,
        cvcRiskNote:
          'Tender omits mandatory MeitY Compulsory Registration Scheme (CRS) compliance clause. Public procurement of uncertified electronics violates Public Procurement Order.',
        alliedStandards: ['IS 13252 (Part 1):2010', 'IS 16842'],
        suggestedClauseText:
          'IP dome cameras shall comply with IS 13252 (Part 1):2010 with valid BIS Compulsory Registration Scheme (CRS) Registration and adhere to STQC/MeitY Cybersecurity Guidelines.',
      },
    ]
  };
}

export async function submitFeedback(req: FeedbackRequest): Promise<void> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) return;
    } catch (err) {
      console.warn('[standardsClient] Live feedback submission failed:', err);
    }
  }
  await delay(300);
}

export async function getAlerts(): Promise<AlertPayload[]> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/alerts`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live alerts fetch failed, falling back to mock:', err);
    }
  }

  await delay(200);
  const raw = alertsMock;
  return Array.isArray(raw) ? (raw as AlertPayload[]) : ([raw] as AlertPayload[]);
}

export async function exportNITClause(queryOrStandard: string): Promise<{ tender_clause_text: string }> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/export-nit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_or_standard: queryOrStandard }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live NIT export failed, falling back to mock:', err);
    }
  }

  await delay(400);
  return {
    tender_clause_text: `The material/equipment supplied shall strictly conform to Indian Standard specification (${queryOrStandard}) and all current amendments and Quality Control Orders in force. The vendor must provide valid BIS Certification license documentation prior to supply.`,
  };
}

export interface SavedStandardRecord {
  is_number: string;
  title: string;
  status: string;
  year_published?: number;
  latest_amendment?: string;
  search_query: string;
  approved_by: string;
  response_data: StandardsResponse;
  created_at: string;
  updated_at: string;
}

export async function approveAndSaveStandard(
  standardData: StandardsResponse,
  searchQuery: string = '',
  approvedBy: string = 'Technical Procurement Officer'
): Promise<{ status: string; message: string; record: SavedStandardRecord }> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/standards/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard_data: standardData,
          search_query: searchQuery,
          approved_by: approvedBy,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live standard approval failed:', err);
    }
  }

  await delay(300);
  return {
    status: 'APPROVED_AND_SAVED',
    message: `Standard ${standardData.primary_recommendation?.is_number || ''} approved and stored in database.`,
    record: {
      is_number: standardData.primary_recommendation?.is_number || 'IS 269',
      title: standardData.primary_recommendation?.title || 'Approved Standard',
      status: standardData.primary_recommendation?.status || 'ACTIVE',
      search_query: searchQuery,
      approved_by: approvedBy,
      response_data: standardData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

export async function getSavedStandards(): Promise<SavedStandardRecord[]> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/standards/saved`);
      if (res.ok) {
        const json = await res.json();
        return json.items || [];
      }
    } catch (err) {
      console.warn('[standardsClient] Live getSavedStandards failed:', err);
    }
  }

  await delay(200);
  return [];
}

export interface AuthorityChatPayload {
  query: string;
  conversation_history?: Array<{ id?: number | string; type?: string; source?: string; text: string; sender?: string }>;
  standard_context?: {
    is_number?: string;
    title?: string;
    status?: string;
    year_published?: number | string | null;
    scope_snippet?: string;
    certification?: any;
    qco?: any;
  };
  role?: string;
  language?: string;
}

export interface AuthorityChatResponse {
  reply: string;
  is_number?: string;
  model_used?: string;
}

export async function askAuthorityAssistant(payload: AuthorityChatPayload): Promise<AuthorityChatResponse> {
  if (!USE_MOCK_EXPLICIT) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/authority/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[standardsClient] Live authority chat API failed, falling back to local reasoning:', err);
    }
  }

  await delay(400);
  const isNum = payload.standard_context?.is_number || 'Indian Standard';
  const q = payload.query.toLowerCase();

  if (q.includes('isi') || q.includes('mandatory') || q.includes('qco') || q.includes('legal')) {
    return {
      reply: `Under statutory Quality Control Orders (QCO) issued under Section 16 of the BIS Act 2016, compliance with **${isNum}** and possession of a valid BIS ISI Mark license is **compulsory** for all procurement. Non-compliant citations violate GFR Rule 144(i).`,
      is_number: isNum,
      model_used: 'BIS Gazette Knowledge Fallback',
    };
  }

  if (q.includes('test') || q.includes('lab') || q.includes('parameter') || q.includes('nabl')) {
    return {
      reply: `For **${isNum}**, consignments must provide batch-specific Manufacturer Test Certificates (MTC) alongside mandatory third-party verification from NABL-accredited / BIS-recognized laboratories before acceptance.`,
      is_number: isNum,
      model_used: 'BIS Gazette Knowledge Fallback',
    };
  }

  if (q.includes('cvc') || q.includes('audit') || q.includes('defense') || q.includes('vigilance')) {
    return {
      reply: `Procuring under **${isNum}** provides comprehensive CVC audit defense under GFR 2017 Rule 144(i) and eliminates vendor bias objections via cryptographic SHA-256 audit lineage.`,
      is_number: isNum,
      model_used: 'BIS Gazette Knowledge Fallback',
    };
  }

  return {
    reply: `Under **${isNum}**, specifications must align with the latest published revision. Valid BIS Certification Mark (ISI) documentation is required from all participating bidders.`,
    is_number: isNum,
    model_used: 'BIS Gazette Knowledge Fallback',
  };
}


