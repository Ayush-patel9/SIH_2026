# SIH 2026 — Full Parallel Implementation Plan
## Person A = Your Friend (Pipeline & Data)  |  Person B = You (Features & UI)

---

## The Boundary Contract (DO NOT CROSS)

```
Person A writes to:              Person B reads from:
─────────────────────────────    ─────────────────────────────────────
pipeline/data/                   application/frontend/src/
pipeline/rag_engine/             application/api/routes/
pipeline/config/                 application/mcp_server/tools/
pipeline/tests/                  application/pdf_parser/
                                 tests/test_fastapi_server.py
```

**The handoff object** (never changes shape):
```typescript
StandardsResponse  ← API_CONTRACT_SCHEMA.md is immutable law
```

**If Person A needs to add a field** → add as optional (`Optional[str] = None`) in `api_contract_models.py`  
**Person B's code never breaks** because optional fields default gracefully.

---

## What Is Already Done (Both Can Rely On)

| Layer | File | Status |
|-------|------|--------|
| All 4 contract schemas (TS) | `frontend/src/types.ts` | ✅ DONE |
| FastAPI server + all routes | `application/api/main.py` | ✅ DONE |
| GraphRAG pipeline + LLM calls | `pipeline/rag_engine/pipeline_core.py` | ✅ DONE |
| Unified LLM Gateway | `pipeline/rag_engine/llm_gateway.py` | ✅ DONE |
| All 14 tests passing | `tests/` | ✅ DONE |
| Frontend App shell + routing | `frontend/src/App.tsx` | ✅ DONE |
| All 9 feature folder skeletons | `frontend/src/features/*/` | ✅ SKELETONS DONE |
| MCP server + tools skeleton | `application/mcp_server/` | ✅ SKELETON DONE |
| Data directories | `pipeline/data/01_master_catalog/` etc. | ✅ POPULATED |

---

# PHASE 1
## Goal: Both working independently, zero dependency on each other, zero merge conflicts

---

## PHASE 1 — Person A (Pipeline Completion & Data Enrichment)

### Overview
Person A's job in Phase 1: Make the pipeline return **richer, more realistic data** and ensure all 6 data directories are production-quality so that when Person B swaps the mock, everything just works.

---

### A1. Enrich Master Catalogue (`pipeline/data/01_master_catalog/`)

**Task:** Verify and enrich the master JSON catalogue with these mandatory fields per standard:
```json
{
  "is_number": "IS 269:2015",
  "title": "Ordinary Portland Cement — Specification",
  "full_title": "IS 269:2015 — OPC (Fifth Revision)",
  "status": "ACTIVE",
  "year_published": 2015,
  "latest_amendment": "Amendment No. 2 (2021)",
  "supersedes": ["IS 8112:1989", "IS 12269:1987"],
  "superseded_by": null,
  "scope_snippet": "Covers chemical and physical requirements of OPC...",
  "division_code": "CED",
  "ics_codes": ["91.100.10"],
  "certification": {
    "scheme": "BIS_ISI_MARK",
    "mandatory": true,
    "qco_order_name": "Cement (Quality Control) Order 2003",
    "qco_gazette_ref": "GSR 739(E)",
    "notifying_ministry": "Ministry of Commerce and Industry",
    "enforcement_date": "2003-10-01"
  }
}
```

**Checklist:**
- [ ] Every standard has all the above fields (no nulls on mandatory ones)
- [ ] `supersedes[]` list is correct (run `pipeline/rag_engine/07_enrich_and_audit_master_catalog.py`)
- [ ] `certification.mandatory` is accurate against real QCO gazette orders
- [ ] At least 200 standards fully enriched across: Steel, Cement, Electrical, IT/CRS, Pipes, Rubber, Textiles

---

### A2. Knowledge Graph (`pipeline/data/04_conformity_ecosystem/`)

**Task:** Build a proper normative reference graph. Format:
```json
{
  "IS 269:2015": {
    "test_methods": ["IS 4031:1988", "IS 4032:1985", "IS 1514:1990"],
    "raw_material_specs": ["IS 650:1991"],
    "installation_codes": [],
    "allied_normative": ["IS 455:2015", "IS 1489:2015"]
  },
  "IS 1786:2008": {
    "test_methods": ["IS 1608:2018", "IS 1599:2019", "IS 228"],
    "raw_material_specs": [],
    "installation_codes": ["IS 13920:2016"],
    "allied_normative": ["IS 2062:2011"]
  }
}
```

**Checklist:**
- [ ] Minimum 50 standards have their full normative graph built
- [ ] Graph is bidirectional (if A references B, B knows A references it)
- [ ] Covers all domains used in demo: Cement, Steel, Electrical, HDPE, CCTV, LED, AAC

---

### A3. QCO / CRS Data (`pipeline/data/03_regulatory_qco/`)

**Task:** Enrich CRS electronics catalogue and QCO mandatory list.

```json
{
  "crs_registered": [
    {
      "is_number": "IS 13252:2010",
      "product_category": "IT Equipment",
      "products": ["Laptops", "Tablets", "Desktop computers", "Monitors"],
      "scheme": "BIS_CRS",
      "mandatory": true,
      "registration_type": "Scheme-II",
      "gazette_ref": "Electronics and IT Goods (Requirement for Compulsory Registration) Order 2012"
    }
  ]
}
```

**Checklist:**
- [ ] All IT products under CRS Scheme-II are listed
- [ ] QCO mandatory list covers: Cement, Steel Rebars, LPG cylinders, LED bulbs, HDPE pipes, Helmets, Toys
- [ ] Each QCO entry has `enforcement_date` and `gazette_ref`

---

### A4. Multilingual Lexicon (`pipeline/data/06_multilingual_lexicon/`)

**Task:** Build term-to-IS-number mapping for Hindi and other Indic languages.

```json
{
  "hindi": {
    "सीमेंट": ["IS 269:2015", "IS 455:2015"],
    "स्टील": ["IS 1786:2008", "IS 2062:2011"],
    "पाइप": ["IS 4984:2016", "IS 458:2003"],
    "ईंट": ["IS 1077:2015", "IS 3102:2007"]
  },
  "tamil": {
    "சிமெண்ட்": ["IS 269:2015"],
    "எஃகு": ["IS 1786:2008"]
  }
}
```

**Checklist:**
- [ ] Hindi lexicon for top 50 construction/procurement terms
- [ ] Tamil and Telugu for top 20 terms
- [ ] Connected to `NLPExtractor` via `pipeline/data/06_multilingual_lexicon/`

---

### A5. Make `pipeline_core.py` return ALL fields (no missing keys)

**Task:** Ensure `process_query()` NEVER returns a `StandardsResponse` with missing or null required fields. Run:
```bash
python -c "
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
r = graph_rag_pipeline.process_query('43 grade OPC cement')
import json
print(json.dumps(r.model_dump(), indent=2))
"
```

**Checklist:**
- [ ] `allied_standards` always returns at least 2 items (from KG matrix)
- [ ] `graph_path` always has at least 3 edges
- [ ] `reasoning_trace` always has at least 4 steps
- [ ] `compliance_checklist` always has 3 items
- [ ] `spec_draft_export` is never null
- [ ] `primary_recommendation.scope_snippet` is never empty string
- [ ] `outdated_citations` correctly catches: IS 8112:1989, IS 2386, IS 12269:1987

---

### A6. Staleness Alert Generator

**Task:** Create `pipeline/rag_engine/staleness_monitor.py` that generates `AlertPayload[]` from the master catalogue by detecting:
- Standards with `status == "WITHDRAWN"` or `"SUPERSEDED"`  
- Standards with `latest_amendment` dated after 2024  
- Standards cited in any active tender that got revised

```python
# pipeline/rag_engine/staleness_monitor.py
class StalenessMonitor:
    def get_active_alerts(self) -> List[Dict]:
        """Returns list of AlertPayload dicts from catalogue scan"""
        
    def get_alerts_for_standard(self, is_number: str) -> List[Dict]:
        """Returns alerts specific to one IS number"""
```

Wire this to `GET /api/v1/alerts` in `application/api/routes/alerts.py`.

**Checklist:**
- [ ] Returns at least 10 real alert payloads from real catalogue data
- [ ] Alerts are properly typed: `STANDARD_SUPERSEDED / STANDARD_AMENDED / QCO_ENFORCEMENT_DATE`
- [ ] `affected_tenders[]` is populated with mock tender IDs for demo
- [ ] Wire complete: `GET /api/v1/alerts` returns real data

---

### A7. PDF Text Extractor (Backend)

**Task:** Complete `application/pdf_parser/pdf_tender_parser.py` to extract clean text from uploaded PDFs and send to `process_tender_document()`.

```python
# application/pdf_parser/pdf_tender_parser.py
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text preserving clause structure"""
    # Use pdfplumber or pypdf2
    
def extract_and_analyse(pdf_bytes: bytes) -> List[StandardsResponse]:
    """Full pipeline: PDF bytes → StandardsResponse[] for every item"""
    text = extract_text_from_pdf(pdf_bytes)
    return graph_rag_pipeline.process_tender_document(text)
```

Add a `POST /api/v1/upload-pdf` route that accepts `multipart/form-data`.

**Checklist:**
- [ ] `pdfplumber` installed and working
- [ ] Handles scanned PDFs gracefully (returns error with message)
- [ ] `POST /api/v1/upload-pdf` endpoint accepts file upload
- [ ] Returns `StandardsResponse[]` array

---

### Person A — Phase 1 Delivery Checklist

Before Phase 2 begins, Person A must produce:

```
✅ pipeline/data/01_master_catalog/  — 200+ enriched standards
✅ pipeline/data/04_conformity_ecosystem/ — 50+ KG entries
✅ pipeline/data/03_regulatory_qco/ — full QCO + CRS list
✅ pipeline/data/06_multilingual_lexicon/ — Hindi + 2 other languages
✅ GET /api/v1/alerts returns real AlertPayload[] (10+ alerts)
✅ POST /api/v1/upload-pdf works
✅ process_query() returns ALL required fields, never null
✅ All 14 existing tests still pass
```

**Git Branch:** `feature/person-a-phase1-data-enrichment`

---

---

## PHASE 1 — Person B (Features: Build All With Mock Data)

### Overview
Person B's job: Build every feature UI/logic using mock data. One env var flip → uses real API. No pipeline dependency at all.

---

### B0. Foundation (Do This First — Unlocks Everything Else)

**Create `frontend/src/api/standardsClient.ts`**

```typescript
// frontend/src/api/standardsClient.ts
import type { QueryRequest, StandardsResponse, FeedbackRequest, AlertPayload } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Import all mock fixtures
import cementMock from '../data/mock_cement.json';
import steelMock from '../data/mock_steel.json';
import hdpeMock from '../data/mock_hdpe.json';
import alertsMock from '../fixtures/alert_payload_mock.json';

export async function queryStandards(
  req: Partial<QueryRequest> & { input: { text: string } }
): Promise<StandardsResponse> {
  if (USE_MOCK) {
    await delay(600); // simulate network
    const t = req.input.text.toLowerCase();
    if (t.includes('steel') || t.includes('tmt')) return steelMock as StandardsResponse;
    if (t.includes('hdpe') || t.includes('pipe')) return hdpeMock as StandardsResponse;
    return cementMock as StandardsResponse;
  }
  const res = await fetch(`${API_BASE}/api/v1/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function uploadTender(text: string): Promise<StandardsResponse[]> {
  if (USE_MOCK) {
    await delay(1200);
    return [cementMock, steelMock, hdpeMock] as StandardsResponse[];
  }
  const res = await fetch(`${API_BASE}/api/v1/tender-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_text: text }),
  });
  return res.json();
}

export async function uploadPDF(file: File): Promise<StandardsResponse[]> {
  if (USE_MOCK) {
    await delay(2000);
    return [cementMock, steelMock] as StandardsResponse[];
  }
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/upload-pdf`, { method: 'POST', body: form });
  return res.json();
}

export async function submitFeedback(req: FeedbackRequest): Promise<void> {
  if (USE_MOCK) { await delay(400); return; }
  await fetch(`${API_BASE}/api/v1/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}

export async function getAlerts(): Promise<AlertPayload[]> {
  if (USE_MOCK) {
    await delay(300);
    return Array.isArray(alertsMock) ? alertsMock : [alertsMock] as AlertPayload[];
  }
  const res = await fetch(`${API_BASE}/api/v1/alerts`);
  return res.json();
}

export async function exportNIT(queryOrStandard: string): Promise<any> {
  if (USE_MOCK) { await delay(500); return {}; }
  const res = await fetch(`${API_BASE}/api/v1/export-nit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_or_standard: queryOrStandard }),
  });
  return res.json();
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
```

**Create `frontend/src/data/mock_steel.json`** and **`mock_hdpe.json`** with realistic `StandardsResponse` payloads (same shape as CEMENT_MOCK_DATA already in `mockGraphData.ts` but for IS 1786 and IS 4984).

**`.env.development`:**
```
VITE_USE_MOCK=true
VITE_API_BASE=http://localhost:8000
```

**`.env.production`:**
```
VITE_USE_MOCK=false
VITE_API_BASE=http://localhost:8000
```

---

### B1. Feature: Explainability vs Black Box (Already 80% Done)

**Files:** `features/explainability/` — skeleton already exists  
**Status check:** `ExplainabilityView.tsx`, `KnowledgeGraphViewer.tsx`, `ReasoningTimeline.tsx`, `ConfidenceBreakdownBar.tsx`, `PlainLanguageToggle.tsx` all exist.

**What to complete / fix:**

**B1.1 — Wire to `standardsClient.ts` (not mock import)**
In `App.tsx`, replace hardcoded `CEMENT_MOCK_DATA` with live state from `queryStandards()`:
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAnalyze = async () => {
  setIsLoading(true);
  try {
    const result = await queryStandards({ input: { text: searchQuery, mode: currentMode } });
    setActiveData(result);
  } finally {
    setIsLoading(false);
  }
};
```

**B1.2 — "Analyze" button must actually call the API**
The current Analyze button just adds a message. Wire it to `handleAnalyze()`.

**B1.3 — Loading state**
Add a shimmer/skeleton loading card while `isLoading = true`.

**B1.4 — Verify `ReasoningTimeline.tsx` renders all 4+ trace steps**
Each step must show: step name, detail text, confidence badge (color-coded: >0.95 green, >0.8 yellow, else red).

**B1.5 — `KnowledgeGraphViewer.tsx` must render `graph_path[]` edges**
If `graph_path` is empty → show "Enable graph path in preferences" message.
If populated → render as a node-edge diagram (SVG or CSS flex arrows).

**B1.6 — `PlainLanguageToggle.tsx` must toggle between**:
- Technical trace view (ReasoningTimeline + confidence breakdown)
- Plain language text (`plain_language_explanation.text`)

**Deliverable:** Click "Analyze" → real (or mock) data loads → reasoning trail visible → graph shows.

---

### B2. Feature: Audit Trail & Legal Defensibility (Already 80% Done)

**Files:** `features/audit/` — 8 files already exist  
**Status check:** All files created.

**What to complete / fix:**

**B2.1 — `AuditTrailView.tsx`: Wire to session history**
The audit view should show a list of all past queries this session, not just the current one.
Use `auditStore.ts` to persist records. Each record = one `StandardsResponse` with its `audit_record`.

**B2.2 — `AuditHashVerifier.tsx`: Make it actually verify**
Input a 64-char SHA-256 hash → the component recomputes `SHA256(query_id:rec_id:is_number:timestamp)` client-side using `hashUtils.ts` → shows MATCH or MISMATCH with green/red indicator.
```typescript
// hashUtils.ts — add this function
export async function verifyAuditHash(
  queryId: string, recId: string, isNumber: string, timestamp: string, expectedHash: string
): Promise<boolean> {
  const payload = `${queryId}:${recId}:${isNumber}:${timestamp}`;
  const computed = await sha256(payload);
  return computed === expectedHash;
}
```

**B2.3 — `AuditCertificate.tsx`: Print-ready RTI export**
"Download Certificate" button → generates a styled HTML printout:
```
┌─────────────────────────────────────────────────────┐
│  BUREAU OF INDIAN STANDARDS                         │
│  STANDARDS INTELLIGENCE PLATFORM                    │
│  AUDIT CERTIFICATE                                  │
│                                                     │
│  Query ID: uuid-xxxx                                │
│  Standard Cited: IS 269:2015                        │
│  Status at Query Time: ACTIVE                       │
│  Amendment at Query Time: Amendment No. 2 (2021)    │
│  Timestamp: 2026-09-26T10:15:00Z                    │
│  SHA-256 Hash: abcd1234...                          │
│  RTI Exportable: YES                                │
│                                                     │
│  This record is cryptographically sealed.           │
└─────────────────────────────────────────────────────┘
```
Use `certificateGenerator.ts` (already exists) — wire the button to call it then `window.print()`.

**B2.4 — Dry-Run mode banner**
When `audit_record.dry_run === true`:
- Yellow top banner: "⚠️ SANDBOX MODE — This query is not logged to the permanent audit trail"
- `AuditLogEntry.tsx` shows the entry greyed out with a "DRY RUN" badge

**Deliverable:** Audit log shows all session queries → hash verification works → certificate printable.

---

### B3. Feature: Human-in-the-Loop + Ambiguity Resolution (Already 80% Done)

**Files:** `features/feedback/` + `features/queryUnderstanding/` — all files exist

**What to complete / fix:**

**B3.1 — Wire `FeedbackModal.tsx` to `submitFeedback()` from standardsClient**
Currently feedback is stored locally. Add the API call:
```typescript
const handleSubmit = async () => {
  const req: FeedbackRequest = {
    feedback_id: `fbk-${Date.now()}`,
    timestamp: new Date().toISOString(),
    original_query_id: currentData.meta.query_id,
    original_recommendation_id: currentData.audit_record.recommendation_id,
    submitter: { user_id: 'officer_demo', role: currentRole },
    feedback_type: selectedType,
    flagged_is_number: currentData.primary_recommendation.is_number,
    correct_is_number: correctionInput || undefined,
    officer_notes: notesInput,
    verified: false,
    verification_status: 'PENDING',
  };
  await submitFeedback(req); // calls POST /api/v1/feedback or mock
  feedbackStore.add(req);    // local store for ReviewQueue
};
```

**B3.2 — `AmbiguityCard.tsx`: Show when `ambiguity_flags[]` is non-empty**
```typescript
if (understanding.ambiguity_flags && understanding.ambiguity_flags.length > 0) {
  // Show disambiguation card
  // "Did you mean: [Fe 500D] or [Fe 500]?"
  // Officer clicks → re-queries with refined term
}
```
If `ambiguity_flags` is not yet in the mock response, add it to the mock JSON:
```json
"ambiguity_flags": [
  {
    "dimension": "grade",
    "message": "Multiple steel grades matched. Please select:",
    "options": [
      { "value": "Fe 500D", "label": "Fe 500D — Ductile grade for seismic zones" },
      { "value": "Fe 500", "label": "Fe 500 — Standard grade" }
    ]
  }
]
```

**B3.3 — `ReviewQueue.tsx`: Admin can approve/reject feedbacks**
Pull from `feedbackStore.ts`. Each row: IS number flagged, officer notes, type, action buttons (Approve / Reject / Escalate).
On Approve → change `verification_status` to `VERIFIED_CORRECT` and `verified = true`.

**B3.4 — `QueryCorrectionForm.tsx`: Inline correction**
Below `QueryEntityDisplay`, show a small "Correct this?" link → expands to a form where officer can fix extracted entities (product name, grade, domain) → resubmits query with corrected text.

**Deliverable:** Flag button works → modal submits → review queue shows pending feedbacks → ambiguity card shown when needed.

---

### B4. Feature: Proactive Staleness Alerts (Already 90% Done)

**Files:** `features/alerts/` — 9 files already exist

**What to complete / fix:**

**B4.1 — Wire `alertStore.ts` to `getAlerts()` API call**
Currently alert store has mock data hardcoded. Change to:
```typescript
// alertStore.ts
export async function loadAlerts(): Promise<void> {
  const alerts = await getAlerts(); // from standardsClient.ts
  alertList.set(alerts);
}
```
Call `loadAlerts()` on app startup in `App.tsx` (inside `useEffect([], [])`).

**B4.2 — `NotificationBell.tsx`: Show count from real alert store**
Badge number = `alertStore.alerts.filter(a => !a.read).length`.

**B4.3 — `TenderImpactMatrix.tsx`: Cross-reference active session tenders**
For each `StandardsResponse` in `auditStore` session history:
- Check if `primary_recommendation.is_number` appears in any alert's `affected_standard.is_number`
- If yes → flag that tender row as AT RISK in the matrix

**B4.4 — Alert severity color coding**
- CRITICAL → red background
- HIGH → orange
- MEDIUM → yellow
- LOW → blue-grey

**Deliverable:** Bell shows count → drawer slides out → matrix shows which session tenders are at risk.

---

### B5. Feature: Multilingual + Bhashini (Needs B0 Done First)

**New files to create:**

**B5.1 — `frontend/src/features/multilingual/LanguageSelector.tsx`**
```typescript
// Dropdown with 7 languages
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
];

// When language changes → sets QueryInput.language in next query
// Shows "BHASHINI NLP ACTIVE" badge when multilingual.bhashini_used === true
```

**B5.2 — `BhashiniStatusBadge.tsx`**
Reads `standardsResponse.multilingual`:
- `bhashini_used: true` → green badge "BHASHINI NLP ✓"
- Shows `detected_input_language` and `response_language`
- Lists `available_translations[]`

**B5.3 — Add to header in `App.tsx`**
Language selector sits next to NotificationBell.

**Deliverable:** Language selector in header → sets language on query → Bhashini badge appears in response.

---

### B6. Feature: Confidence + Coverage Dashboard (Already 80% Done)

**Files:** `features/dashboard/` — 9 files already exist

**What to complete / fix:**

**B6.1 — Wire `metricsAggregator.ts` to real session history**
`auditStore.ts` holds all `StandardsResponse[]` from this session.
`metricsAggregator.ts` must read from it:
```typescript
export function computeMetrics(sessions: StandardsResponse[]): DashboardMetrics {
  return {
    totalQueries: sessions.length,
    uniqueStandards: new Set(sessions.map(s => s.primary_recommendation.is_number)).size,
    outdatedCaught: sessions.filter(s => s.outdated_citations.length > 0).length,
    mandatoryQCO: sessions.filter(s => s.primary_recommendation.certification.mandatory).length,
    topStandards: computeTopStandards(sessions),
    domainBreakdown: computeDomainBreakdown(sessions),
    ministryBreakdown: computeMinistryBreakdown(sessions),
  };
}
```

**B6.2 — `KPICards.tsx`: 4 animated cards**
- Total queries processed
- Unique IS standards cited  
- Outdated citations caught
- Mandatory QCO standards served

**B6.3 — `TopStandardsBar.tsx`: Horizontal bar chart**
Top 10 IS numbers by cite frequency. Pure CSS or lightweight chart lib (no heavy deps).

**B6.4 — `ExportReport.tsx`: Download MIS report**
Button → generates a text/CSV summary of dashboard metrics → `window.saveAs()`.

**Deliverable:** Dashboard shows real session metrics → KPI cards animate on load → export works.

---

### B7. Feature: Dry-Run Sandbox Mode (Tied to B2)

**Already partially done via `audit_record.dry_run`. Complete the UI:**

**B7.1 — Mode toggle in header**
Toggle between: `recommend` | `audit` | `dry_run` | `vendor_check`
Stored in React state → passed as `QueryInput.mode` in every query.

**B7.2 — Sandbox warning UI**
When mode is `dry_run`:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  SANDBOX MODE ACTIVE                                    │
│  Results are NOT logged to the permanent audit trail.       │
│  Use this mode to test draft specifications before          │
│  finalizing your tender document.                           │
└─────────────────────────────────────────────────────────────┘
```

**B7.3 — Outdated citation warnings inline**
For each item in `outdated_citations[]`:
```
🔴 WARNING: "IS 8112:1989" cited in your draft is WITHDRAWN
   → Replace with: IS 269:2015
   → Risk: CRITICAL — CVC audit exposure
```

**Deliverable:** Toggle sandbox mode → banner shows → outdated citation warnings appear inline.

---

### B8. Feature: Role-Based Views (New Work)

**New files to create: `frontend/src/features/roles/`**

**B8.1 — `roleStore.ts`**
```typescript
export type UserRole = 'PROCUREMENT_OFFICER' | 'AUDITOR' | 'VENDOR';
export const roleStore = {
  current: 'PROCUREMENT_OFFICER' as UserRole,
  set: (r: UserRole) => { roleStore.current = r; }
};
```

**B8.2 — `RoleSwitcher.tsx`** (goes in header)
3 buttons: Officer | Auditor | Vendor
Each has a different icon and color.

**B8.3 — `ProcurementOfficerPanel.tsx`**
Shows: Primary recommendation + Allied Standards + Spec Draft Export + NIT clause generator

**B8.4 — `AuditorPanel.tsx`**
Shows: Reasoning Trace + Audit Hash + Compliance Checklist + Graph Path + RTI Certificate download

**B8.5 — `VendorPanel.tsx`**
Shows: Compliance checklist + Certification requirements (ISI/CRS/Hallmark) + Direct BIS portal links:
```typescript
const BIS_PORTAL_LINKS = {
  'BIS_ISI_MARK': 'https://bis.gov.in/product-certification/',
  'BIS_CRS': 'https://bis.gov.in/compulsory-registration/',
  'BIS_HALLMARK': 'https://bis.gov.in/hallmarking/',
};
```

**B8.6 — Wire into `App.tsx`**
```typescript
const renderMainContent = () => {
  if (activeFeature === 'explainability') {
    if (role === 'AUDITOR') return <AuditorPanel data={activeData} />;
    if (role === 'VENDOR') return <VendorPanel data={activeData} />;
    return <ProcurementOfficerPanel data={activeData} />;
  }
  // ... other features
};
```

**Deliverable:** Role switcher in header → same JSON, completely different information shown.

---

### B9. Feature: NIT Draft Generator (Already 80% Done)

**Files:** `features/nitGenerator/` — 7 files already exist

**What to complete / fix:**

**B9.1 — Wire `ClauseEditor.tsx` to `exportNIT()` from standardsClient**
When officer clicks "Generate NIT Clause":
```typescript
const clause = await exportNIT(activeData.primary_recommendation.is_number);
setGeneratedClause(clause);
```

**B9.2 — `ClauseExportBar.tsx`: Copy + Download buttons**
- Copy to clipboard → `navigator.clipboard.writeText(clauseText)`
- Download as `.docx` (use simple HTML→Blob approach or `docx` npm package)
- Download as `.pdf` (use `window.print()` with print-only CSS)

**B9.3 — Tender upload UI**
Large textarea → "Paste your tender document here" → "Analyze Full Tender" button  
Calls `uploadTender(text)` → shows `StandardsResponse[]` one per item  
Each item is collapsible with its own recommendation + audit record.

**Deliverable:** Paste tender text → analyze → get per-item recommendations → copy NIT clause.

---

### B10. Feature: MCP Server Workbench (Already 70% Done)

**Files:** `features/mcp/` — 5 files already exist  
**Note:** Full wiring needs Person A's pipeline. But the UI layer can be done now.

**B10.1 — `MCPToolRunner.tsx`: Make tool calls work in mock mode**
Each tool button (search_standards, check_certification, get_normative_refs) currently calls the MCP server. Add mock responses:
```typescript
const MOCK_TOOL_RESPONSES = {
  search_standards: (q: string) => ({ standards: [activeData.primary_recommendation] }),
  check_certification: (is: string) => ({ mandatory: true, scheme: 'BIS_ISI_MARK' }),
  get_normative_refs: (is: string) => ({ refs: activeData.allied_standards }),
};
```

**B10.2 — `MCPConfigSnippet.tsx`: Show real connection config**
```json
{
  "mcpServers": {
    "bis-standards-intelligence": {
      "command": "python",
      "args": ["application/mcp_server/server.py"],
      "env": { "GEMINI_API_KEYS": "your-key-here" }
    }
  }
}
```

**Deliverable:** MCP workbench shows tools + mock responses + copy-pasteable config snippet.

---

### Person B — Phase 1 Delivery Checklist

```
✅ frontend/src/api/standardsClient.ts created
✅ frontend/src/data/mock_steel.json + mock_hdpe.json created
✅ "Analyze" button actually calls API (mock or real)
✅ B1: Explainability — reasoning timeline + graph wired to live data
✅ B2: Audit — hash verifier works + certificate prints
✅ B3: HIL Feedback — flag → modal → review queue
✅ B4: Alerts — bell count + drawer + impact matrix
✅ B5: Multilingual — language selector in header
✅ B6: Dashboard — session-based metrics populate cards
✅ B7: Dry-Run — mode toggle + sandbox banner + warnings
✅ B8: Role-Based Views — 3 panels, role switcher in header
✅ B9: NIT Generator — tender upload UI + clause download
✅ B10: MCP Workbench — mock tool responses + config snippet
```

**Git Branches (one per feature, merge one at a time):**
```bash
feature/b0-api-client
feature/b1-explainability-wire
feature/b2-audit-complete
feature/b3-hil-feedback
feature/b4-alerts-wire
feature/b5-multilingual
feature/b6-dashboard-metrics
feature/b7-dryryn-mode
feature/b8-role-views
feature/b9-nit-generator
feature/b10-mcp-workbench
```

---

# PHASE 2
## Goal: Swap mocks for real data. Person A delivers. Person B wires.

| Person A delivers | Person B does |
|-------------------|---------------|
| `GET /api/v1/alerts` returns real `AlertPayload[]` | Wire `alertStore.loadAlerts()` → remove mock import |
| `process_query()` returns real `graph_path[]` | KnowledgeGraphViewer renders real edges |
| Bhashini API key obtained | Swap mock multilingual stub for real Bhashini v2 call |
| `POST /api/v1/upload-pdf` works | Wire PDF upload UI to real endpoint |
| 200+ enriched standards | Run full regression: all 14 tests must still pass |

**Person B wires each by changing 1 line** (setting `VITE_USE_MOCK=false` and fixing any schema mismatches).

---

# PHASE 3
## Goal: Polish, performance, demo prep. No new features, only completeness.

| Task | Owner |
|------|-------|
| MCP server tools wired to real pipeline data | Person A |
| PDF highlighter (red/yellow/green annotations on PDF) | Person B |
| Offline-first PWA cache of OKF bundle | Person A (service worker config) |
| Bhashini full wiring (not just detection) | Person A + Person B coordinate |
| GeM/CPPP integration stub demo | Person B (pure UI mockup) |
| Performance: pipeline response < 500ms | Person A |
| Mobile-responsive UI | Person B |
| Full demo rehearsal script | Both |

---

## Merge Conflict Rules (Enforced)

1. **Never edit the same file at the same time.** If you must, coordinate on Slack first.
2. **`API_CONTRACT_SCHEMA.md`** — immutable. Joint decision to change.
3. **`pipeline/config/api_contract_models.py`** — Person A only. Person B never touches this.
4. **`frontend/src/types.ts`** — Person B only. Person A never touches this.
5. **`App.tsx`** — Person B only in Phase 1. Discuss before editing in Phase 2.
6. **One branch per feature.** Merge to `main` only when that feature's checklist is complete.
7. **Pull before every work session:** `git pull origin main` before touching anything.
