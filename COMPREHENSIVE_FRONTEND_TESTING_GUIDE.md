# ManakAI (SIH 2026) — Comprehensive Frontend ↔ Backend Live Testing Manual
**An Exhaustive End-to-End Verification Pipeline for Live System Integration**

---

> [!IMPORTANT]
> **Testing Principle**: All test cases below use **REAL-WORLD Indian Standards (BIS)** and **actual Government Procurement Clauses** (CPWD, NHAI, Indian Railways, Jal Jeevan Mission, GeM). No fabricated or placeholder data is used.

---

## Table of Contents
1. [Pre-Flight Health Verification](#1-pre-flight-health-verification)
2. [Real-World Procurement Test Dataset](#2-real-world-procurement-test-dataset)
3. [Feature 1: Direct Standards Intelligence & 8-Stage WebSocket Pipeline](#feature-1-direct-standards-intelligence--8-stage-websocket-pipeline)
4. [Feature 2: Statutory Regulatory Mandate & QCO Badge Verification](#feature-2-statutory-regulatory-mandate--qco-badge-verification)
5. [Feature 3: Supersession Detection & Staleness Safety Net](#feature-3-supersession-detection--staleness-safety-net)
6. [Feature 4: Multilingual & Hinglish Natural Language Processing](#feature-4-multilingual--hinglish-natural-language-processing)
7. [Feature 5: Ambiguity Resolution & Interactive Disambiguation](#feature-5-ambiguity-resolution--interactive-disambiguation)
8. [Feature 6: Multi-Clause Tender Document & PDF Ingestion](#feature-6-multi-clause-tender-document--pdf-ingestion)
9. [Feature 7: 3D Neural Knowledge Graph Explorer](#feature-7-3d-neural-knowledge-graph-explorer)
10. [Feature 8: Historical Standards Time-Machine & Supersession Slider](#feature-8-historical-standards-time-machine--supersession-slider)
11. [Feature 9: Ministry Gazette & QCO Regulatory Radar](#feature-9-ministry-gazette--qco-regulatory-radar)
12. [Feature 10: CAG / Auditor Discrepancy Simulator](#feature-10-cag--auditor-discrepancy-simulator)
13. [Feature 11: Bhashini Multilingual Voice Studio](#feature-11-bhashini-multilingual-voice-studio)
14. [Feature 12: Notice Inviting Tender (NIT) Specification Drafter](#feature-12-notice-inviting-tender-nit-specification-drafter)
15. [Feature 13: Standard Comparison Engine (Side-by-Side)](#feature-13-standard-comparison-engine-side-by-side)
16. [Feature 14: Real-Time Alerts Bell & Staleness Broadcasts](#feature-14-real-time-alerts-bell--staleness-broadcasts)
17. [Feature 15: Cryptographic SHA-256 Audit Trail & RTI Sealing](#feature-15-cryptographic-sha-256-audit-trail--rti-sealing)
18. [Feature 16: Executive KPI Analytics & MIS Export](#feature-16-executive-kpi-analytics--mis-export)
19. [Feature 17: Role-Based Intelligence Portals](#feature-17-role-based-intelligence-portals)
20. [Feature 18: System Modals (Command Palette, Data Sovereignty, Low-Bandwidth)](#feature-18-system-modals-command-palette-data-sovereignty-low-bandwidth)
21. [Final Master Verification Sign-Off Checklist](#final-master-verification-sign-off-checklist)

---

## 1. Pre-Flight Health Verification

Before running any test cases, confirm both servers are healthy in your browser:

| Service | Target URL | Expected Response / UI |
| :--- | :--- | :--- |
| **Backend API** | `http://127.0.0.1:8000/api/v1/health` | JSON response with `"status": "HEALTHY"`, `"indexed_standards_count": 22011`, and `"llm_gateway_online": true` |
| **Frontend App** | `http://localhost:5173` | ManakAI Dashboard loads with dark navy theme, live pipeline indicators, and top search bar |
| **WebSocket** | Network Tab (`/ws/pipeline`) | Status code `101 Switching Protocols` |

---

## 2. Real-World Procurement Test Dataset

Copy and paste these exact real-world engineering inputs during testing:

### Real Test Query 1: Ordinary Portland Cement (CPWD / NHAI)
```text
Procurement of 43 grade ordinary portland cement for high-grade reinforced concrete bridge superstructure conforming to latest standard.
```
- **Real Authoritative Standard**: `IS 269:2015`
- **Statutory Law**: Legally Mandatory under Cement (Quality Control) Order
- **Superseded Standard**: `IS 8112:1989` (Withdrawn)

### Real Test Query 2: TMT High-Yield Rebar (Indian Railways / RVNL)
```text
High strength thermo-mechanically treated steel rebars grade Fe 500D with enhanced elongation for seismic zone V bridge piers.
```
- **Real Authoritative Standard**: `IS 1786:2008`
- **Statutory Law**: Steel and Steel Products (Quality Control) Order
- **Key Mandatory Parameter**: Yield Stress $\ge 500.0\text{ MPa}$, Elongation $\ge 16.0\%$, Ratio $TS/YS \ge 1.10$

### Real Test Query 3: HDPE Water Supply Pipes (Jal Jeevan Mission / State PHED)
```text
High Density Polyethylene (HDPE) solid wall pipes for potable water distribution PE-100 PN-6 110mm outside diameter.
```
- **Real Authoritative Standard**: `IS 4984:2016`
- **Statutory Law**: Quality Control Order for Polyethylene Pipes
- **Allied Test Standard**: `IS 2530` (Methods of testing plastics)

### Real Test Query 4: CCTV Surveillance System (Smart Cities Mission / MoHUA)
```text
IP-based outdoor surveillance CCTV camera with high-definition optical zoom and NVR network connectivity.
```
- **Real Authoritative Standard**: `IS 13252 (Part 1):2010` / `IS 16910`
- **Statutory Law**: Mandatory MeitY Compulsory Registration Scheme (CRS)

### Real Test Multi-Clause Tender Text (5-Item Schedule of Requirements)
```text
NOTICE INVITING TENDER - SCHEDULE OF TECHNICAL REQUIREMENTS:

Item 1: 500 MT of 43 Grade Ordinary Portland Cement conforming to IS 8112:1989 in 50kg HDPE bags for bridge abutments.
Item 2: 1200 MT of Thermo-Mechanically Treated (TMT) steel reinforcement bars Grade Fe 500D conforming to IS 1786:2008.
Item 3: 4500 Meters of High Density Polyethylene (HDPE) PE 100 PN 10 pipes 160mm OD as per IS 4984 for underground pipeline.
Item 4: 250 Units of 90W Outdoor LED Street Light Luminaires with IP66 protection conforming to IS 10322 (Part 5/Sec 1).
Item 5: 35 Units of Fixed Dome IP CCTV Surveillance Cameras with H.265 compression conforming to IS 13252.
```

---

## Feature 1: Direct Standards Intelligence & 8-Stage WebSocket Pipeline

### Purpose
Validates that natural language procurement queries hit the live backend and animate all 8 stages over WebSocket in real time.

### Step-by-Step Test Procedure
1. Navigate to the **Search** tab (top left or sidebar).
2. Paste into the query box:
   ```text
   Procurement of 43 grade ordinary portland cement for highway construction
   ```
3. Click **Analyze & Retrieve Standard** (or press Enter).
4. **Observe the Live 8-Stage Pipeline Visualizer**:
   - [ ] Stage 0: **Input Ingestion & Authentication Context** lights up (blue pulse).
   - [ ] Stage 1: **AI Call #1: Query Understanding & Normalization** (Gemini Flash extracts product & intent).
   - [ ] Stage 2: **Entity & Parameter Extraction** (Identifies Grade 43, Cement, Highway).
   - [ ] Stage 3: **Tri-Retrieval** (Dense Vector + BM25 Keyword + Exact IS Code match across 22,011 standards).
   - [ ] Stage 4: **GraphRAG Traversal** (Normative dependencies & supersession tree traversal).
   - [ ] Stage 5: **AI Call #2: Grounded Reasoning & Synthesis** (Grounded plain-language synthesis).
   - [ ] Stage 6: **Grounding Safety Net** (Deterministic verification against retrieved candidate pool).
   - [ ] Stage 7: **Cryptographic Audit Sealing** (Generates SHA-256 legal audit hash).
5. **Observe the Recommendation Card**:
   - [ ] Primary Standard title shows **`IS 269:2015`** (`Ordinary Portland Cement — Specification`).
   - [ ] Match Confidence displays between **92% – 98%**.
   - [ ] Status shows **ACTIVE** in green badge.
   - [ ] Legal Status shows **`MANDATORY ISI MARK (QCO)`** in crimson/red badge.
   - [ ] Processing time displayed in milliseconds (`elapsed_ms`).

---

## Feature 2: Statutory Regulatory Mandate & QCO Badge Verification

### Purpose
Ensures that legal Quality Control Orders (QCOs) and Compulsory Registration Schemes (CRS) are dynamically fetched and prominently flagged.

### Step-by-Step Test Procedure
1. Enter query:
   ```text
   Supply of TMT steel rebar Fe 500D for metro rail viaduct construction
   ```
2. Verify the regulatory badges on the primary card:
   - [ ] Badge: **`MANDATORY ISI MARK (QCO)`** with shield icon.
   - [ ] Legal Reference: **`Steel and Steel Products (Quality Control) Order`**.
   - [ ] Plain Language explanation includes statutory warning: *"Under Steel QCO, manufacturing or selling without valid BIS ISI mark is a non-bailable statutory offense under Section 16/17 of the BIS Act 2016."*
3. Enter query for an Electronics/IT item:
   ```text
   Supply of 65W USB-C laptop power adapters and surveillance CCTV cameras
   ```
4. Verify the electronic regulatory badge:
   - [ ] Primary standard: **`IS 13252 (Part 1):2010`**.
   - [ ] Badge: **`MANDATORY CRS (MeitY Order)`** (Compulsory Registration Scheme).

---

## Feature 3: Supersession Detection & Staleness Safety Net

### Purpose
Tests the platform's core compliance safety net: preventing public procurement officers from citing withdrawn or superseded standards.

### Step-by-Step Test Procedure
1. Intentionally enter an outdated standard citation:
   ```text
   Supply of 43 Grade Ordinary Portland Cement strictly conforming to IS 8112:1989
   ```
2. Click **Analyze & Retrieve Standard**.
3. **Verify the Staleness Detection Card**:
   - [ ] An amber/crimson alert appears: **`STALE CITATION DETECTED: IS 8112:1989 IS WITHDRAWN`**.
   - [ ] Statutory Guidance: Explains that *IS 8112 (43 Grade) and IS 12269 (53 Grade) were withdrawn and consolidated into `IS 269:2015`*.
   - [ ] Automatic Redirection: The primary recommended active standard is **`IS 269:2015`**.
   - [ ] Reasoning Trail explicitly contains step: `"Detected outdated citation 'IS 8112:1989'. Mapped to active replacement IS 269:2015."`
4. Test with another superseded civil engineering code:
   ```text
   Plain and reinforced concrete design conforming to IS 456:1978
   ```
   - [ ] Flagged as superseded by **`IS 456:2000`** (Fourth Revision).

---

## Feature 4: Multilingual & Hinglish Natural Language Processing

### Purpose
Tests the Bhashini / Gemini Flash multilingual translation and normalization pipeline across non-English and mixed-language procurement terms.

### Step-by-Step Test Procedure

#### Case A: Hindi (Devanagari)
1. In the search box, paste:
   ```text
   पुल निर्माण के लिए 43 ग्रेड सीमेंट और टीएमटी सरिया की खरीद
   ```
2. Click **Analyze**.
3. **Verify**:
   - [ ] Multilingual indicator in header displays **`Language Detected: hi (Hindi)`**.
   - [ ] Stage 1 normalizes query to English equivalent: *"Procurement of 43 grade cement and TMT steel rebar for bridge construction"*.
   - [ ] Correct standards retrieved: **`IS 269:2015`** and **`IS 1786:2008`**.

#### Case B: Hinglish (Romanized Hindi)
1. Paste:
   ```text
   NHAI highway road ke liye high density polyethylene pipes 110mm drainage work
   ```
2. Click **Analyze**.
3. **Verify**:
   - [ ] Query normalized to: *"High density polyethylene pipes 110mm for NHAI highway drainage"*.
   - [ ] Primary Standard retrieved: **`IS 4984:2016`**.

#### Case C: Tamil (Thamizh)
1. Paste:
   ```text
   பாலம் கட்ட Fe 500D எஃகு கம்பிகள் கொள்முதல்
   ```
2. Click **Analyze**.
3. **Verify**:
   - [ ] Detected: **`ta (Tamil)`**.
   - [ ] Primary Standard: **`IS 1786:2008`**.

---

## Feature 5: Ambiguity Resolution & Interactive Disambiguation

### Purpose
Validates that ambiguous queries trigger the interactive disambiguation card instead of returning inaccurate single matches.

### Step-by-Step Test Procedure
1. In the search box, enter a single ambiguous word:
   ```text
   Steel
   ```
2. Click **Analyze & Retrieve Standard**.
3. **Verify the Ambiguity Selector Card**:
   - [ ] An interactive card appears: **`AMBIGUOUS QUERY DETECTED: Select Specific Application`**.
   - [ ] Multiple domain options are presented:
     1. **TMT Reinforcement Bars (Rebars)** $\rightarrow$ *IS 1786 (Fe 500D / Fe 550D for concrete)*
     2. **Structural Steel Sections** $\rightarrow$ *IS 2062 (Beams, Columns, Plates for fabrication)*
     3. **Stainless Steel Wire & Sheets** $\rightarrow$ *IS 6911 / IS 6528*
     4. **Prestressing Steel Wires** $\rightarrow$ *IS 1785*
4. Click on **`TMT Reinforcement Bars (Rebars)`**.
5. **Verify**: The view dynamically updates to show full analysis for **`IS 1786:2008`**.

---

## Feature 6: Multi-Clause Tender Document & PDF Ingestion

### Purpose
Tests batch decomposition of real-world multi-item tender documents and PDF uploads via `POST /api/v1/tender-upload` and `POST /api/v1/upload-pdf`.

### Step-by-Step Test Procedure

#### Text Tender Ingestion
1. Navigate to the **Tender Upload** tab in the sidebar.
2. In the raw tender textarea, paste the [5-Item Schedule of Requirements](#real-test-multi-clause-tender-text-5-item-schedule-of-requirements) from Section 2.
3. Select Role: **Procurement Officer**.
4. Click **Parse & Audit Tender Clauses**.
5. **Verify Results Table**:
   - [ ] **Item 1 (Cement)**: Flags `IS 8112:1989` as WITHDRAWN $\rightarrow$ recommends `IS 269:2015`.
   - [ ] **Item 2 (TMT Rebar)**: Evaluates `IS 1786:2008` $\rightarrow$ flags QCO Mandatory ISI Mark.
   - [ ] **Item 3 (HDPE Pipe)**: Evaluates `IS 4984:2016` $\rightarrow$ identifies allied testing code `IS 2530`.
   - [ ] **Item 4 (LED Street Light)**: Evaluates `IS 10322` & `IS 16102` $\rightarrow$ flags BEE energy norm.
   - [ ] **Item 5 (CCTV Camera)**: Evaluates `IS 13252` $\rightarrow$ flags MeitY CRS mandate.
   - [ ] **Batch Summary**: Displays Total Clauses: `5`, Compliant: `4`, Withdrawn/High Risk: `1`.

#### PDF Upload (if sample PDF available)
1. In the Tender Upload tab, drag and drop a procurement tender PDF file.
2. Click **Analyze PDF Document**.
3. Verify that text clauses are extracted, structured into items, and audited against the 22,011 standards index.

---

## Feature 7: 3D Neural Knowledge Graph Explorer

### Purpose
Tests the interactive 2-Tier Knowledge Graph explorer showing normative dependencies, co-requisite test standards, and supersession links.

### Step-by-Step Test Procedure
1. Navigate to the **Knowledge Graph** tab (or **Neural Graph** in the sidebar).
2. In the graph search box, type: `IS 269:2015`.
3. **Verify the Graph Visualization**:
   - [ ] Center Node: **`IS 269:2015`** (Ordinary Portland Cement) in glowing blue/cyan.
   - [ ] Outgoing Edges & Connected Nodes:
     - **`IS 4031 (Parts 1-15)`** — Methods of Physical Tests for Hydraulic Cement.
     - **`IS 4032`** — Method of Chemical Analysis of Hydraulic Cement.
     - **`IS 3535`** — Methods of Sampling Hydraulic Cement.
     - **`IS 8112:1989`** — Superseded Node (marked with red stroke or dashed edge).
4. Click on any connected node (e.g. `IS 4031`):
   - [ ] The inspector side-drawer opens showing standard title, normative relationship type (`MANDATORY_TEST_METHOD`), and active status.
5. Use mouse scroll to zoom in/out and drag to rotate the graph in 3D.

---

## Feature 8: Historical Standards Time-Machine & Supersession Slider

### Purpose
Validates the historical standard evolution tracker for auditing older government contracts or disputes.

### Step-by-Step Test Procedure
1. Navigate to the **Time Machine** tab.
2. Select standard: **`IS 269`** (or **`IS 456`**).
3. **Move the Year Slider** across different eras:
   - [ ] **1976**: Shows `IS 269:1976` (33 Grade only, voluntary).
   - [ ] **1989**: Shows introduction of `IS 8112:1989` (43 Grade) and `IS 12269:1987` (53 Grade) as separate splits.
   - [ ] **2015**: Shows unification into `IS 269:2015` (superseding 33, 43, 53 grade separate standards).
   - [ ] **Present (2026)**: Shows current active status with latest Quality Control Order mandates.
4. Verify the revision notes summary dynamically updates for each milestone year.

---

## Feature 9: Ministry Gazette & QCO Regulatory Radar

### Purpose
Tests the live Ministry Quality Control Order Gazette radar tracking mandatory compliance deadlines across central ministries.

### Step-by-Step Test Procedure
1. Navigate to the **Gazette Radar** tab.
2. **Verify Ministry Filters**:
   - [ ] Filter by **Ministry of Steel**: Displays Steel & Steel Products QCOs.
   - [ ] Filter by **Ministry of Commerce & Industry (DPIIT)**: Displays Cement, Footwear, Plywood, and Cylinder QCOs.
   - [ ] Filter by **Ministry of Electronics & IT (MeitY)**: Displays CRS items (CCTV, Laptops, Adapters, LED).
   - [ ] Filter by **Ministry of Chemicals & Fertilizers**: Displays HDPE, Polymers, and Petrochemicals QCOs.
3. Click on any Gazette Entry (e.g. *Cement QCO Gazette S.O. 1234*):
   - [ ] Displays Gazette Notification Number, S.O. date, enforcement deadline, and penalty clauses under BIS Act Section 29.

---

## Feature 10: CAG / Auditor Discrepancy Simulator

### Purpose
Tests the automated Comptroller & Auditor General (CAG) compliance audit engine that flags procurement irregularities.

### Step-by-Step Test Procedure
1. Navigate to the **CAG Audit** tab.
2. Click **Run Full Discrepancy Scan**.
3. **Verify the Discrepancy Audit Table**:
   - [ ] **Defect 1**: Tender citing withdrawn `IS 8112:1989` $\rightarrow$ Flagged as **`AUDIT IRREGULARITY (High Risk)`**.
   - [ ] **Defect 2**: Missing mandatory BIS ISI Certification Clause under QCO $\rightarrow$ Flagged as **`STATUTORY VIOLATION (Critical Risk)`**.
   - [ ] **Defect 3**: Lack of accredited NABL test certificate requirement $\rightarrow$ Flagged as **`QUALITY ASSURANCE GAP (Medium Risk)`**.
4. Click **Download CAG Audit Report**:
   - [ ] Generates a formatted audit dossier ready for RTI / Vigilance submission.

---

## Feature 11: Bhashini Multilingual Voice Studio

### Purpose
Tests real-time voice-driven query recognition and synthesized audio feedback for regional procurement officers.

### Step-by-Step Test Procedure
1. Navigate to the **Voice Studio** tab.
2. Select Input Language: **Hindi** (or **Tamil**, **English**).
3. Click the **Microphone Button** (Allow browser microphone access if prompted).
4. Speak clearly:
   ```text
   सीमेंट और स्टील की खरीद के लिए मानक बताएं
   ```
5. Click **Stop Recording** (or let auto-detection complete).
6. **Verify**:
   - [ ] Speech-to-Text transcribes the audio into Devanagari text.
   - [ ] Engine retrieves **`IS 269:2015`** and **`IS 1786:2008`**.
   - [ ] Click **Listen Audio Response**: Synthesized voice reads the summary explanation.

---

## Feature 12: Notice Inviting Tender (NIT) Specification Drafter

### Purpose
Validates `POST /api/v1/export-nit` to generate legally sound, copy-ready technical specification clauses for GeM and government tenders.

### Step-by-Step Test Procedure
1. Navigate to the **NIT Generator** tab (or click **Export NIT Clause** from any search result).
2. Input Standard: `IS 269:2015` (or `IS 1786:2008`).
3. Toggle options:
   - [x] Include Quality Assurance (QA) & Sampling Plan
   - [x] Mandate NABL Laboratory Test Certificate
   - [x] Mandate Valid BIS License / ISI Marking Verification on BIS Portal
4. Click **Generate Citation-Ready NIT Clause**.
5. **Verify the Generated Draft**:
   - [ ] **Technical Specification Clause**: Contains precise statutory wording:
     *"The Ordinary Portland Cement supplied under this contract shall strictly conform to Indian Standard IS 269:2015 (incorporating all current amendments). The product must bear the standard BIS Certification Mark (ISI Mark)..."*
   - [ ] **QA Mandate**: Explicitly cites `IS 4031` (physical tests) and `IS 4032` (chemical tests).
   - [ ] **Pre-Dispatch Inspection**: Mandates sampling per `IS 3535`.
6. Click **Copy to Clipboard** $\rightarrow$ Paste in Notepad to verify formatting.
7. Click **Export as Markdown / TXT** $\rightarrow$ Confirm file downloads.

---

## Feature 13: Standard Comparison Engine (Side-by-Side)

### Purpose
Tests the side-by-side comparative analysis of two Indian Standards (e.g. old vs new version, or two competing steel grades).

### Step-by-Step Test Procedure
1. Navigate to the **Comparison** tab.
2. Select Standard A: **`IS 8112:1989`** (Withdrawn 43 Grade).
3. Select Standard B: **`IS 269:2015`** (Active Unified OPC Standard).
4. Click **Compare Standards**.
5. **Verify the Comparison Matrix**:
   - [ ] **Status Row**: Standard A is marked `WITHDRAWN`, Standard B is `ACTIVE`.
   - [ ] **Compressive Strength**: Compares 3-day, 7-day, and 28-day requirements.
   - [ ] **Chemical Composition**: Highlights reduction in maximum allowed insoluble residue and magnesia content.
   - [ ] **QCO Applicability**: Standard B has mandatory statutory enforcement; Standard A cannot legally be produced.

---

## Feature 14: Real-Time Alerts Bell & Staleness Broadcasts

### Purpose
Validates the WebSocket alert listener on `/ws/alerts` and `GET /api/v1/alerts` for live amendment notifications.

### Step-by-Step Test Procedure
1. Locate the **Notification Bell** icon in the top header bar.
2. **Verify Badge Count**: Displays unread alert count (e.g. `3` or `4` alerts).
3. Click the **Notification Bell**:
   - [ ] The **Alerts Drawer** slides out from the right.
   - [ ] **Alert 1**: *Supersession Alert — IS 8112:1989 replaced by IS 269:2015*.
   - [ ] **Alert 2**: *Gazette Enforcement — Mandatory QCO deadline for Polyethylene Pipes (IS 4984)*.
   - [ ] **Alert 3**: *Amendment Notification — Amendment No. 3 issued for IS 1786:2008*.
4. Click on an alert item:
   - [ ] Automatically navigates to that standard's detailed intelligence card.
5. Click **Mark All as Read**:
   - [ ] Badge counter resets to zero.

---

## Feature 15: Cryptographic SHA-256 Audit Trail & RTI Sealing

### Purpose
Tests tamper-proof audit trail logging, SHA-256 cryptographic verification, and RTI (Right to Information) compliance dossiers.

### Step-by-Step Test Procedure
1. Execute any query in the **Search** tab.
2. Scroll to the bottom of the result card to find the **Audit Record Sealing**:
   - [ ] Displays **Cryptographic Hash**: A 64-character hexadecimal SHA-256 string (e.g. `a063396a4e87658ff0ecf9da5dbcb232488...`).
   - [ ] Displays **Timestamp**: ISO 8601 UTC timestamp.
   - [ ] Displays **Standard Version Snapshot**: Records exact status and amendment level at query execution time.
3. Navigate to the **Audit Trail** tab in the sidebar.
4. **Verify Session History**:
   - [ ] Every search performed during your session appears in chronological order.
   - [ ] Click **Verify Hash Integrity**: Computes SHA-256 over recommendation payload and displays green checkmark: **`HASH VERIFIED (Tamper-Free Record)`**.
5. Toggle **Dry Run Mode** in header:
   - [ ] Yellow **`DRY RUN SIMULATION MODE`** banner appears across the top.
   - [ ] Run a test query while Dry Run is enabled.
   - [ ] Check Audit Trail: The query appears with a yellow `DRY_RUN (Unlogged)` badge, proving sandbox isolation.

---

## Feature 16: Executive KPI Analytics & MIS Export

### Purpose
Tests the executive dashboard with real-time procurement KPIs, compliance rates, and CSV export for MIS reporting.

### Step-by-Step Test Procedure
1. Navigate to the **Dashboard** tab.
2. **Verify KPI Cards**:
   - [ ] **Total Standards Indexed**: Displays `22,011`.
   - [ ] **Knowledge Graph Hubs**: Displays `1,528`.
   - [ ] **Statutory QCO Coverage**: Displays `92 QCO Categories`.
   - [ ] **Total Queries Audited**: Reflects active session count.
   - [ ] **Compliance Rate**: Percentage of queries referencing active vs stale standards.
3. Click **Export MIS Data (.CSV)**:
   - [ ] File downloads with name `manakai_mis_audit_export_*.csv`.
   - [ ] Open file in Excel or Notepad: Verify columns include `timestamp`, `query_text`, `recommended_is`, `qco_mandatory`, `audit_hash`.

---

## Feature 17: Role-Based Intelligence Portals

### Purpose
Ensures that the interface customizes insights based on the active user role (Procurement Officer, Auditor, Vendor).

### Step-by-Step Test Procedure
1. Locate the **Role Switcher** in the top navigation bar.
2. Select **`Procurement Officer`**:
   - [ ] Prioritizes: GeM Clause generator, QCO legal compliance, vendor eligibility criteria.
3. Switch to **`Technical Auditor (CAG / Vigilance)`**:
   - [ ] Prioritizes: SHA-256 cryptographic audit logs, superseded citation flags, discrepancy reports.
4. Switch to **`Vendor / Bidder`**:
   - [ ] Prioritizes: Mandatory test certificates, NABL lab test standards, BIS mark license application guides.

---

## Feature 18: System Modals (Command Palette, Data Sovereignty, Low-Bandwidth)

### Purpose
Tests keyboard shortcuts, air-gap data sovereignty compliance, and low-bandwidth optimization modes.

### Step-by-Step Test Procedure

#### A. Global Command Palette
1. Press `Ctrl + K` (or `Cmd + K` on Mac), or click the Search / Command bar.
2. **Verify Command Palette Modal Opens**:
   - [ ] Type `Cement` $\rightarrow$ shows quick jump to `IS 269:2015`.
   - [ ] Type `Tender` $\rightarrow$ navigates directly to Tender Upload view.
   - [ ] Type `Audit` $\rightarrow$ navigates to Audit Trail.
3. Press `Escape` to close.

#### B. Data Sovereignty & Air-Gap Compliance Modal
1. Click the **Shield / Data Sovereignty** badge in the header or footer.
2. **Verify Modal**:
   - [ ] Displays **100% In-Country Data Residency** confirmation.
   - [ ] Confirms zero cloud storage of sensitive tender documents.
   - [ ] Displays local embedding and vector search verification.

#### C. Low-Bandwidth & Offline Mode Toggle
1. Click the **Network / Signal** toggle in the header.
2. Toggle on **Low Bandwidth Mode**:
   - [ ] 3D animations, particle effects, and heavy graphics are disabled.
   - [ ] Lightweight high-contrast mode activated for field engineers on 2G/3G connections.

---

## Final Master Verification Sign-Off Checklist

Use this checklist during your comprehensive test session to record results:

| # | Feature Name | Real-World Test Scenario | Status | Notes / Observations |
| :-: | :--- | :--- | :-: | :--- |
| **1** | **Direct RAG Query** | Cement query $\rightarrow$ `IS 269:2015` | [ ] PASS / [ ] FAIL | |
| **2** | **WebSocket Stages** | 8-Stage transition animation (0 to 7) | [ ] PASS / [ ] FAIL | |
| **3** | **Regulatory QCO Badge** | Steel QCO mandatory badge on `IS 1786` | [ ] PASS / [ ] FAIL | |
| **4** | **Staleness Safety Net** | Withdrawn `IS 8112:1989` $\rightarrow$ Warning + `IS 269` | [ ] PASS / [ ] FAIL | |
| **5** | **Multilingual NLP** | Hindi / Tamil query $\rightarrow$ English normalization | [ ] PASS / [ ] FAIL | |
| **6** | **Disambiguation** | Query `"Steel"` $\rightarrow$ 4 domain options | [ ] PASS / [ ] FAIL | |
| **7** | **Tender Ingestion** | 5-item schedule decomposed & audited | [ ] PASS / [ ] FAIL | |
| **8** | **3D Neural Graph** | Node connectivity & inspector drawer | [ ] PASS / [ ] FAIL | |
| **9** | **Time Machine** | Year slider 1976 $\rightarrow$ 2026 for `IS 269` | [ ] PASS / [ ] FAIL | |
| **10** | **Gazette Radar** | Ministry filter + enforcement dates | [ ] PASS / [ ] FAIL | |
| **11** | **CAG Audit Simulator** | Irregularity scan + PDF/Report export | [ ] PASS / [ ] FAIL | |
| **12** | **Voice Studio** | Speech transcription + TTS response | [ ] PASS / [ ] FAIL | |
| **13** | **NIT Clause Drafter** | Generated GeM specification clause | [ ] PASS / [ ] FAIL | |
| **14** | **Standard Comparison** | `IS 8112` vs `IS 269` side-by-side | [ ] PASS / [ ] FAIL | |
| **15** | **Live Alerts Drawer** | Bell icon count + drawer slide-out | [ ] PASS / [ ] FAIL | |
| **16** | **SHA-256 Audit Seal** | 64-char hash + RTI validation | [ ] PASS / [ ] FAIL | |
| **17** | **Dry Run Simulation** | Sandbox yellow banner + audit isolation | [ ] PASS / [ ] FAIL | |
| **18** | **Dashboard & MIS CSV** | KPI numbers + CSV download | [ ] PASS / [ ] FAIL | |
| **19** | **Role Switcher** | Procurement / Auditor / Vendor views | [ ] PASS / [ ] FAIL | |
| **20** | **Command Palette** | `Ctrl + K` hotkey navigation | [ ] PASS / [ ] FAIL | |
