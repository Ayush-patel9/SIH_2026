# PHASE 3 — Full Implementation Plan & Technical Blueprint
## SIH 2026 — BIS Standards Intelligence Platform (ManakAI)
### Goal: System Polish, Response Performance, End-to-End Wiring, and Hackathon Grand Finale Demo Prep

---

> [!IMPORTANT]
> **Phase 3 is a COMPLETENESS & RELIABILITY sprint, NOT an experimental feature sprint.**
> All 4 core API schemas (`QueryRequest`, `StandardsResponse`, `FeedbackRequest`, `AlertPayload`) and directory structures are frozen.
> Every task below ensures the platform is blazingly fast, legally defensible, fault-tolerant, and ready for an irresistible 8-minute jury demonstration.

---

## 🏛️ Phase 3 Workstream Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 3 EXECUTION ARCHITECTURE                            │
├─────────────────────────────────────────┬───────────────────────────────────────────────┤
│ PERSON A (Pipeline, Backend, Perf & MCP)│ PERSON B (Frontend, PDF Viewer & Integrations)│
├─────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • P3-A1: MCP Real Pipeline Wiring       │ • P3-B1: PDF Annotation & Highlight Viewer    │
│ • P3-A2: Sub-500ms Pipeline Caching     │ • P3-B2: GeM / CPPP Integration Demo Sandbox  │
│ • P3-A3: Offline PWA & OKF Bundle Gen   │ • P3-B3: Mobile Responsive UI & PWA Shell     │
│ • P3-A4: Bhashini Full Translation      │ • P3-B4: End-to-End Live API Validation       │
│ • P3-A5: Fail-Safe Pipeline Robustness  │ • P3-B5: UI Polish, Skeletons & Print Styles  │
├─────────────────────────────────────────┴───────────────────────────────────────────────┤
│ JOINT COLLABORATION (Person A + Person B):                                              │
│ • P3-C1: Comprehensive Test Suite (30+ Tests across Backend & Frontend)                 │
│ • P3-C2: 8-Minute Grand Finale Demo Script & Rehearsal Protocol                         │
│ • P3-C3: Single-Command Docker & Docker Compose Deployment Stack                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Detailed Task Specifications — PERSON A (Pipeline & Backend)

---

### Task P3-A1: Wire MCP Server Tools to Live GraphRAG Pipeline
* **Owner:** Person A
* **Target Files:**
  - [`application/mcp_server/server.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/mcp_server/server.py)
  - [`application/mcp_server/tools/recommendation.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/mcp_server/tools/recommendation.py)
  - [`application/mcp_server/tools/status_checker.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/mcp_server/tools/status_checker.py)
  - [`application/mcp_server/tools/alerts.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/mcp_server/tools/alerts.py)
  - [`application/mcp_server/tools/nit_generator.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/mcp_server/tools/nit_generator.py)
  - [`application/mcp_server/tools/testing_labs.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/mcp_server/tools/testing_labs.py)

#### Detailed Technical Actions:
1. **`recommendation.py`:**
   - Import `graph_rag_pipeline` from `pipeline.rag_engine.pipeline_core`.
   - Dispatch `process_query()` with standard `QueryRequest` parameters.
   - Return dictionary complying strictly with `contract_schema.json`.
2. **`status_checker.py`:**
   - Execute exact lookup against loaded `unified_standards.json` and trace supersession edges via `normative_reference_graph.json`.
   - Return status, latest amendment, superseding standard, and QCO order status.
3. **`alerts.py`:**
   - Connect to `StalenessMonitor` (`pipeline/rag_engine/staleness_monitor.py`) to yield real-time `AlertPayload` items.
4. **`nit_generator.py`:**
   - Hook into `llm_reasoner` to generate tailored GeM NIT procurement clauses incorporating mandatory test certificate conditions (e.g. 7-day/28-day testing as per IS 4031).
5. **`testing_labs.py`:**
   - Search across `bis_recognized_labs.json` and `lims_lab_registry.json`.
   - Cross-check manufacturer license validity against `manak_licensee_registry.json`.

#### Acceptance Criteria:
- [ ] `python application/mcp_server/server.py --test` runs all 6 tools against live datasets and prints zero errors.
- [ ] MCP FastMCP stdio mode (`python application/mcp_server/server.py --stdio`) works for Claude Desktop / Cursor connections.

---

### Task P3-A2: Sub-500ms Pipeline Performance Optimization
* **Owner:** Person A
* **Target Files:**
  - [`pipeline/rag_engine/tri_retrieval.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/rag_engine/tri_retrieval.py)
  - [`pipeline/rag_engine/reranker_fusion.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/rag_engine/reranker_fusion.py)
  - [`pipeline/rag_engine/pipeline_core.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/rag_engine/pipeline_core.py)

#### Detailed Technical Actions:
1. **In-Memory Singleton Inverted Index:**
   - Pre-index `unified_standards.json` (37MB) and `normative_reference_graph.json` at module load time so disk I/O is 0ms during queries.
   - Build hash map for exact IS number lookups (`O(1)` access).
2. **LRU In-Memory Cache:**
   - Apply `@lru_cache(maxsize=512)` to exact IS standard lookups, normative graph traversals, and QCO regulatory checks.
3. **Parallel Retrieval Execution:**
   - Concurrently execute dense vector semantic matching and exact keyword/CRS lexicon lookups using `asyncio` or `ThreadPoolExecutor`.
4. **Reasoning Synthesis Fast-Path:**
   - Pre-compile compliance checklists and plain-language templates for top 100 high-frequency procurement queries (cement, TMT steel, HDPE, LED, CCTV, cables).
   - If Gemini API call exceeds 2000ms timeout, immediately synthesize using cached high-precision domain rules.

#### Acceptance Criteria:
- [ ] Warm query response time is `< 250ms`.
- [ ] Cold query response time (with dense retrieval + LLM synthesis) is `< 1200ms`.
- [ ] `meta.processing_time_ms` accurately tracks wall-clock time in response.

---

### Task P3-A3: Offline-First PWA & OKF Bundle Generation
* **Owner:** Person A
* **Target Files:**
  - `scripts/generate_okf_bundle.py` (New script)
  - `application/frontend/public/okf_bundle.json` (Generated artifact)
  - `application/frontend/public/sw.js` (Service Worker)

#### Detailed Technical Actions:
1. **OKF (Offline Knowledge Fragment) Generator:**
   - Write a script to export the top 300 active standards, the complete QCO mandatory list, and the bidirectional normative reference graph into a single minified bundle (`< 3.5MB`).
2. **Service Worker Caching (`sw.js`):**
   - Cache application static assets (JS, CSS, fonts) and `okf_bundle.json` in browser CacheStorage.
3. **Offline Query Fallback Engine:**
   - Provide client-side fallback in `standardsClient.ts` that searches `okf_bundle.json` when `navigator.onLine === false` or API is unreachable.

#### Acceptance Criteria:
- [ ] Running `python scripts/generate_okf_bundle.py` outputs valid `okf_bundle.json` under `application/frontend/public/`.
- [ ] App functions when browser network is set to "Offline" in Chrome DevTools.

---

### Task P3-A4: Bhashini Full Translation & Indic NLP Integration
* **Owner:** Person A (Backend) + Person B (UI display)
* **Target Files:**
  - `pipeline/rag_engine/bhashini_client.py` (New client)
  - [`pipeline/rag_engine/nlp_extractor.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/rag_engine/nlp_extractor.py)
  - [`pipeline/rag_engine/pipeline_core.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/rag_engine/pipeline_core.py)

#### Detailed Technical Actions:
1. **Bhashini v2 Translation Client:**
   - Implement HTTP client for Bhashini Dhruva NMT / ULCA inference endpoint supporting Hindi, Tamil, Telugu, Marathi, Gujarati, and Bengali.
2. **Bidirectional Translation Pipeline:**
   - Input: Translate non-English procurement term -> English query for vector/KG search.
   - Output: Translate `plain_language_explanation` and `compliance_checklist` items back to user's selected language.
3. **Graceful Fallback:**
   - If `BHASHINI_API_KEY` is not set or times out, seamlessly use local regional lexicon files (`pipeline/data/06_multilingual_lexicon/`).

#### Acceptance Criteria:
- [ ] Inputting "सीमेंट 43 ग्रेड" correctly resolves to `IS 269:2015`.
- [ ] `StandardsResponse.multilingual.bhashini_used` correctly returns `true`.

---

### Task P3-A5: Fail-Safe Pipeline Robustness & Safe Defaults
* **Owner:** Person A
* **Target Files:**
  - [`pipeline/rag_engine/pipeline_core.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/rag_engine/pipeline_core.py)
  - [`pipeline/config/api_contract_models.py`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/config/api_contract_models.py)

#### Detailed Technical Actions:
1. **Unbreakable Response Guarantee:**
   - Wrap top-level `process_query()` in comprehensive fallback handler conforming to the 14 Minimum Guaranteed Defaults from `API_CONTRACT_SCHEMA.md`.
2. **Deterministic Cryptographic Audit Hash:**
   - Guarantee `SHA-256(query_id:recommendation_id:is_number:timestamp)` is computed on all returned payloads (including dry-run and error fallbacks).

#### Acceptance Criteria:
- [ ] Pipeline never raises unhandled 500 exceptions, even on empty strings, corrupted inputs, or API outages.
- [ ] All outputs validate against Pydantic schema without missing key errors.

---

## 🎨 Detailed Task Specifications — PERSON B (Frontend & UI)

---

### Task P3-B1: PDF Upload Viewer & Tender Annotation Highlighter
* **Owner:** Person B
* **Target Files:**
  - `application/frontend/src/features/tenderUpload/PDFAnnotationViewer.tsx` (New component)
  - `application/frontend/src/features/tenderUpload/TenderClauseHighlighter.tsx` (New component)
  - [`application/frontend/src/features/tenderUpload/TenderUploadView.tsx`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/frontend/src/features/tenderUpload)

#### Detailed Technical Actions:
1. **Multi-Color Visual Annotation System:**
   - 🟢 **Active Standard (Green):** Current standard cited correctly (e.g. `IS 269:2015`).
   - 🟡 **Amendment Needed (Yellow):** Active standard cited without mandatory latest amendment.
   - 🔴 **Critical Outdated / Withdrawn (Red):** Withdrawn standard cited (e.g. `IS 8112:1989`).
   - 🔵 **Missing Allied Requirement (Blue):** Mandatory test standard omitted from tender (e.g. `IS 4031` fineness test).
2. **Synchronized Split-Screen View:**
   - Left Pane: Rendered document text with inline color-coded citation badges.
   - Right Pane: Inspection card showing detected issue, legal consequence (CVC guidelines violation), and 1-click "Apply Fix to NIT Draft" button.
3. **Export Annotated Audit Report:**
   - Provide "Download Pre-Tender Audit Report" producing print-ready PDF/HTML summary with compliance grade (e.g., "Compliance Score: 78/100").

#### Acceptance Criteria:
- [ ] Uploading a sample tender PDF highlights outdated standards in red and valid ones in green.
- [ ] Clicking any highlighted badge opens the explainability card and replacement recommendation.

---

### Task P3-B2: GeM / CPPP E-Procurement Integration Demo Sandbox
* **Owner:** Person B
* **Target Files:**
  - `application/frontend/src/features/integrations/GeMIntegrationDemo.tsx` (New component)
  - `application/frontend/src/features/integrations/CPPPTenderChecker.tsx` (New component)
  - [`application/frontend/src/App.tsx`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/frontend/src/App.tsx)

#### Detailed Technical Actions:
1. **GeM Marketplace Buyer Overlay:**
   - Simulate a real Government e-Marketplace (GeM) product procurement page.
   - Embed the "ManakAI Statutory Compliance Widget" showing live QCO certification requirements and valid ISI licensee verification.
2. **CPPP Tender Pre-Submission Checker:**
   - Simulate Central Public Procurement Portal (CPPP) tender creation screen where an officer types tender specifications and receives real-time validation badges before publishing NIT.
3. **Interactive Visual Architecture Diagram:**
   - Render interactive SVG diagram explaining ManakAI API gateway integration with GeM, CPPP, and BIS ManakOnline.

#### Acceptance Criteria:
- [ ] New "Integrations Sandbox" tab accessible in navigation.
- [ ] Demo allows switching between GeM Marketplace view and CPPP Tender Pre-check view.

---

### Task P3-B3: Mobile-Responsive UI & PWA Shell
* **Owner:** Person B
* **Target Files:**
  - [`application/frontend/src/index.css`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/frontend/src/index.css)
  - `application/frontend/src/components/MobileBottomNav.tsx` (New component)
  - `application/frontend/public/manifest.json` (PWA Manifest)

#### Detailed Technical Actions:
1. **Responsive Viewport Breakpoints:**
   - 375px (Mobile Portrait), 768px (Tablet), 1024px (Laptop), 1440px+ (Large Display).
2. **Mobile Bottom Navigation Bar:**
   - On screens `< 768px`, collapse desktop sidebar into bottom navigation dock with 5 main actions (Search, Audit, Alerts, NIT, Integrations).
3. **Touch-Optimized Interaction:**
   - Ensure all buttons, toggles, and modal dismiss buttons have minimum 44px hit targets.
   - Enable pinch-to-zoom / pan on Knowledge Graph visualizer.

#### Acceptance Criteria:
- [ ] Zero horizontal overflow on iPhone SE / Android mobile viewports.
- [ ] Lighthouse Mobile score ≥ 90.

---

### Task P3-B4: End-to-End Live API Validation (Mock → Real Switch)
* **Owner:** Person B
* **Target Files:**
  - [`application/frontend/src/api/standardsClient.ts`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/frontend/src/api/standardsClient.ts)
  - `application/frontend/.env.production`
  - `application/frontend/.env.development`

#### Detailed Technical Actions:
1. **Switch `VITE_USE_MOCK=false`:**
   - Connect all frontend stores and feature views to FastAPI endpoints at `http://localhost:8000`.
2. **Defensive Schema Unwrapping:**
   - Verify every UI card handles optional fields gracefully with optional chaining (`?.`) and fallback default values.
3. **Network Failure & Timeout Banners:**
   - Display non-intrusive toast notifications when backend service is initializing or unreachable, offering 1-click fallback to local offline cache.

#### Acceptance Criteria:
- [ ] All 6 frontend features function seamlessly with live backend (`VITE_USE_MOCK=false`).
- [ ] Console has zero unhandled runtime exceptions.

---

### Task P3-B5: UI Polish, Shimmer Skeletons & Print Styles
* **Owner:** Person B
* **Target Files:**
  - [`application/frontend/src/index.css`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/frontend/src/index.css)
  - [`application/frontend/src/features/audit/AuditCertificate.tsx`](file:///c:/Users/abhyudaya/sih108/SIH_2026/application/frontend/src/features/audit/AuditCertificate.tsx)

#### Detailed Technical Actions:
1. **Shimmer Skeletons:**
   - Implement animated loading skeletons for recommendation cards, reasoning timelines, graph visualizer, and dashboard KPI blocks.
2. **Official Government Print CSS (`@media print`):**
   - Clean, official layout with Bureau of Indian Standards emblem header, cryptographic hash footer, and RTI compliance metadata.
   - Hide all sidebar navigation, buttons, and dark mode backgrounds during print.

#### Acceptance Criteria:
- [ ] Printing an audit certificate produces an official, clean 1-page document with zero clipped elements.

---

## 🤝 Detailed Task Specifications — JOINT TASKS (Person A + Person B)

---

### Task P3-C1: Comprehensive Test Suite (30+ Tests)
* **Owners:** Both Person A and Person B
* **Target Directories:**
  - [`tests/`](file:///c:/Users/abhyudaya/sih108/SIH_2026/tests)
  - `application/frontend/src/tests/`

#### Target Test Matrix:

| Test ID | Test Category | Target Component | Description |
|---------|---------------|------------------|-------------|
| `test_perf_01` | Performance | `pipeline_core.py` | Cached query returns in < 500ms |
| `test_perf_02` | Performance | `tri_retrieval.py` | Vector + exact lookup returns in < 800ms |
| `test_schema_01` | Schema Contract | `api_contract_models.py` | Full response validates against `contract_schema.json` |
| `test_schema_02` | Schema Contract | `pipeline_core.py` | Fallback response preserves all guaranteed non-nullable fields |
| `test_kg_01` | Knowledge Graph | `normative_graph` | Traversing IS 269:2015 finds IS 4031 & IS 4032 |
| `test_kg_02` | Supersession | `reranker_fusion.py` | Searching IS 8112:1989 flags WITHDRAWN and points to IS 269 |
| `test_qco_01` | Regulatory QCO | `regulatory_qco` | Cement & TMT steel return `mandatory: true` with gazette ref |
| `test_mcp_01` | MCP Server | `server.py` | `get_standard_recommendation` returns valid payload |
| `test_mcp_02` | MCP Server | `server.py` | `check_standard_status` flags withdrawn standards |
| `test_mcp_03` | MCP Server | `server.py` | `list_active_alerts` filters by severity |
| `test_mcp_04` | MCP Server | `server.py` | `generate_nit_clause` returns formatted tender clause |
| `test_mcp_05` | MCP Server | `server.py` | `find_testing_labs` returns BIS accredited labs |
| `test_mcp_06` | MCP Server | `server.py` | `verify_isi_licensee` validates manufacturer license |
| `test_fe_01` | Frontend Unit | `hashUtils.ts` | SHA-256 client-side computation matches backend hash |
| `test_fe_02` | Frontend Unit | `metricsAggregator.ts` | Session metrics correctly tally QCO compliance rates |
| `test_fe_03` | Frontend Unit | `roleStore.ts` | Role switching correctly filters view permissions |
| `test_fe_04` | Frontend Unit | `standardsClient.ts` | Client handles network error with cached fallback |

#### Acceptance Criteria:
- [ ] `pytest tests/ -v` passes with 100% green output.
- [ ] `npm test` runs all frontend unit tests successfully.

---

### Task P3-C2: 8-Minute Grand Finale Demo Script & Rehearsal Flow
* **Owners:** Both Person A and Person B

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        8-MINUTE HACKATHON JURY DEMO PROTOCOL                           │
├────────┬─────────────────────────┬─────────────────────────────────────────────────────┤
│ TIME   │ SECTION                 │ KEY NARRATIVE & ON-SCREEN ACTION                    │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 00:00  │ 1. The Statutory Crisis │ Show real government tender citing WITHDRAWN        │
│        │    in Procurement       │ standard (IS 8112:1989). Explain CVC audit penalty. │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 01:15  │ 2. ManakAI Intelligent  │ Type query in natural language. Show instant        │
│        │    Search & XAI         │ retrieval of IS 269:2015 with 4-stage XAI trail.    │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 02:45  │ 3. Automated Tender PDF │ Upload multi-page tender PDF. Watch live color-     │
│        │    Audit & Highlighter  │ coded markup (Red = Withdrawn, Green = Active).     │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 04:00  │ 4. Proactive Staleness  │ Open Alert Drawer. Show Tender Impact Matrix with   │
│        │    & QCO Alerts Engine  │ active tenders flagged for upcoming amendments.     │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 05:00  │ 5. Cryptographic Audit  │ Inspect SHA-256 Audit Trail. Click "Verify Hash"    │
│        │    & Legal Defensibility│ (MATCH ✓). Print official RTI Audit Certificate.    │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 06:00  │ 6. Role-Based Views &   │ Toggle: Officer ↔ Auditor ↔ Vendor. Switch to Hindi │
│        │    Bhashini Multilingual│ ("सीमेंट 43 ग्रेड"). Show Bhashini badge.           │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 07:00  │ 7. MCP & External AI    │ Demonstrate Claude/Cursor querying ManakAI via MCP  │
│        │    Agent Integration    │ tools. Show GeM/CPPP marketplace overlay sandbox.   │
├────────┼─────────────────────────┼─────────────────────────────────────────────────────┤
│ 07:45  │ 8. Q&A & Architecture   │ Conclude with high-level architecture & impact.     │
└────────┴─────────────────────────┴─────────────────────────────────────────────────────┘
```

---

### Task P3-C3: Single-Command Docker Deployment & Environment Packaging
* **Owners:** Both Person A and Person B
* **Target Files:**
  - `Dockerfile`
  - `docker-compose.yml`
  - `.env.example`

#### Detailed Technical Actions:
1. **Unified Dockerfile:**
   - Multi-stage build: Stage 1 builds React/Vite frontend (`dist/`), Stage 2 runs Python 3.11 with FastAPI and serves both API and static frontend assets on port 8000.
2. **Docker Compose:**
   - Single command `docker-compose up --build` launches ManakAI API server (port 8000) and standalone MCP server (port 8001).
3. **Environment Sanity Check:**
   - Include automated startup validation verifying data files and API keys.

---

## ⏱️ Phase 3 Timeline & Milestones

```
DAY 1: Performance & Live Wiring
├── Person A: Sub-500ms pipeline caching & singleton inverted index
└── Person B: VITE_USE_MOCK=false end-to-end API wiring & error handling

DAY 2: High-Impact Features
├── Person A: MCP Server live pipeline tool wiring
└── Person B: PDF Annotation Viewer & split-screen highlighter

DAY 3: Integrations & Accessibility
├── Person A: Bhashini translation client & offline OKF generator
└── Person B: GeM/CPPP demo sandbox & mobile-responsive bottom nav

DAY 4: Testing & Hardening
├── Both: Expand test suite to 30+ tests across backend & frontend
└── Both: Docker & Docker Compose single-command packaging

DAY 5: Grand Finale Rehearsal
├── Both: 3x full dry-run rehearsals using the 8-minute demo protocol
└── Both: Video backup recording & jury presentation slide deck
```

---

## 🏆 Final Acceptance Sign-Off Checklist

```
Pipeline & Backend:
  [ ] process_query() completes in < 500ms for warm queries
  [ ] All 6 MCP tools execute with 100% success against live data
  [ ] Full response payload matches contract_schema.json with 0 null violations
  [ ] Bhashini translation works with fallback to local Indic lexicons
  [ ] OKF offline bundle generated and validated (< 3.5MB)

Frontend & UI:
  [ ] VITE_USE_MOCK=false is active with zero console errors
  [ ] PDF tender upload displays red/green/yellow annotation badges
  [ ] GeM / CPPP sandbox demo renders realistic marketplace views
  [ ] Mobile viewport is completely responsive at 375px+
  [ ] Audit Certificate print view renders clean 1-page official document

Quality & Operations:
  [ ] 30+ automated tests passing in CI/test runner
  [ ] docker-compose up --build starts entire stack cleanly
  [ ] 8-minute demo rehearsed and ready for presentation
```
