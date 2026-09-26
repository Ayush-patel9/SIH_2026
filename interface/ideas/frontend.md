# Frontend Design System & UI Architecture — ManakAI BIS Standards Intelligence Platform

> **Source Reference:** Egreen-Quanta Design System extracted from [`interface/ideas/SIH/frontend/src/index.css`](file:///Users/ayushpatel/SIH2026/interface/ideas/SIH/frontend/src/index.css), [`interface/ideas/SIH/frontend/src/App.jsx`](file:///Users/ayushpatel/SIH2026/interface/ideas/SIH/frontend/src/App.jsx), and [`interface/ideas/SIH/docs/SIH_Quantum_Platform_UIUX.md`](file:///Users/ayushpatel/SIH2026/interface/ideas/SIH/docs/SIH_Quantum_Platform_UIUX.md).  
> **Target Application Root:** `application/frontend/`  
> **Compliance Standard:** Government Institutional Grade (BIS / NIC / GOI Standard Web Design Guidelines).  
> **Status:** 100% Complete & Self-Contained Specification (Safe to delete legacy reference folders).

---

## 1. Aesthetic Manifesto & Design Philosophy

### 1.1 The "Anti-AI-Gimmick" Rule
ManakAI is an official institutional platform designed for procurement officers, executive engineers, quality assurance inspectors, and BIS technical committees. A purchasing decision on a ₹50-crore public infrastructure tender or a cement compliance audit cannot look like a generic ChatGPT wrapper or a trendy SaaS startup.

| ❌ Banned Startup / AI Clichés | ✅ Required Institutional Government Standard |
|-------------------------------|-----------------------------------------------|
| Glowing purple blur orbs, rainbow gradients | Crisp `--paper` (`#EEF0F4`) canvas with 1px `--hairline` (`#D0D4DC`) dividers |
| Floating glassmorphism cards with translucent blur | Solid, opaque surfaces (`#FFFFFF` on `#EEF0F4`) with 4px radii |
| "Ask AI anything!" generic chatbots with robot icons | Grounded "Reasoning Trail" and "Legal Audit Log" with verified clause citations |
| Bouncy floating micro-interactions & 3D tilt effects | Surgical, instant transitions (100ms–150ms) and predictable tabular layouts |
| Centered floating input box like search engine | High-density 2-column workspace: Main Working Stage + Right Authority Stream |
| All-caps header screamers | Refined sentence-case typography with controlled monospace metadata tracking |
| Generic checkmark / red-X feedback | Exact numerical tolerance convergence (`Specified vs Observed`) |

---

### 1.2 Core Institutional UX Principles (from UIUX Spec §1)

1. **The Standard is the Interface, Not a Form:** Users directly manipulate interactive clause matrices, comparison bars, and standard tables — not endless dropdowns or nested forms.
2. **State, Not Status:** Never flatten complex technical standards into a simple binary "OK/FAIL". The UI shows the exact mathematical tolerances, physical parameters (e.g. `33.0 MPa vs 37.5 MPa`), test method references (e.g. `IS 4031-6`), and amendment history.
3. **Commitment & Defensibility (Lock-in UX):** In legal drafting and compliance checking, locking in parameters is a deliberate action (`.btn-lock`), generating an immutable SHA-256 hash stamp before producing CVC audit certificates.
4. **Authority Stream as Technical Secretary:** The right-hand panel is an active legal partner reading the exact same standard as the user, providing grounded clause cross-references, not detached conversation.
5. **Numbers and Units are Primary Content:** Monospace formatting (`JetBrains Mono`) ensures numeric parameters, percentages, tolerances, and dates align with accounting-grade tabular precision.

---

## 2. Master Design Tokens (CSS Custom Properties)

All styles MUST strictly use these CSS Custom Properties defined in the root stylesheet (`index.css`):

```css
/* ============================================================
   ManakAI / Egreen-Quanta Master Design Tokens
   ============================================================ */
:root {
  /* --- Primary Surfaces & Text --- */
  --paper:                #EEF0F4;  /* Base application background (cool light grey-blue) */
  --surface:              #FFFFFF;  /* Card / Panel solid background */
  --ink:                  #161A22;  /* Primary body text & high-contrast titles */
  --ink-secondary:        #4A5060;  /* Secondary labels, clause subtitles */
  --ink-muted:            #8890A0;  /* Muted text, timestamps, disabled controls */
  --hairline:             #D0D4DC;  /* 1px structural borders & dividers */

  /* --- Semantic State Colors --- */
  --collapse-cobalt:      #1B4FE0;  /* Official / Verified / Active Standard / Confirmed Result */
  --superposition-violet: #6E5AD6;  /* Reasoning Step / Draft Clause / Predicted / Disambiguation */
  --signal-amber:         #E0982B;  /* Warning / Amendment in Progress / Superseded Clause */
  --error-line:           #C23B3B;  /* Withdrawn Standard / Non-compliant Parameter / Broken Link */
  --emerald-pass:         #108250;  /* Passed Compliance / Valid CVC Certificate / Active */
  --teal-guide:           #0E7C6B;  /* Domain Preset Switcher / Lab Test Procedure */

  /* --- Visualization & Canvas --- */
  --void:                 #0D0F14;  /* Deep dark canvas for Knowledge Graphs & PDF Parsers ONLY */
  --canvas-wire:          #8890A0;  /* Connection edges & grid lines on void canvas */

  /* --- Typography Stacks --- */
  --font-prose:           'Literata', Georgia, serif;                 /* Legal text, definitions, explanations */
  --font-data:            'JetBrains Mono', 'Courier New', monospace; /* IS numbers, parameters, hashes, tables */

  /* --- Layout & Dimensions --- */
  --panel-gap:            1px;      /* Hairline gap between panels */
  --radius-sm:            4px;      /* Content panels, cards, inputs (subtle, formal) */
  --radius-none:          0px;      /* Table cells, code badges, diagram nodes (sharp) */
}
```

---

## 3. Typography Hierarchy

### Google Fonts Source
Every frontend page imports the dual serif-prose and monospace-data typography:

```css
@import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=JetBrains+Mono:wght@400;600&display=swap');
```

### Typographic Roles & Formatting Rules

```
+-----------------------------------------------------------------------------------------+
| ROLE               | FONT STACK      | SIZE | WEIGHT | LETTER-SPACING | USAGE           |
+-----------------------------------------------------------------------------------------+
| Platform Title     | JetBrains Mono  | 13px | 600    | +0.04em        | Header Wordmark |
| Section Label      | JetBrains Mono  | 11px | 600    | +0.06em        | Panel Headings  |
| Standard Code (IS) | JetBrains Mono  | 13px | 600    | Normal         | "IS 269:2015"   |
| Legal Clause Prose | Literata        | 15px | 400    | Normal         | Clause Text     |
| Clause Title / H2  | Literata        | 18px | 600    | -0.01em        | Section Headers |
| Table Headers      | JetBrains Mono  | 10px | 600    | +0.05em        | Uppercase Th    |
| Table Data Cell    | JetBrains Mono  | 12px | 400    | Normal         | Tolerances/Num  |
| Audit Timestamp    | JetBrains Mono  | 10px | 400    | Normal         | ISO Timestamps  |
+-----------------------------------------------------------------------------------------+
```

> [!IMPORTANT]
> **Spec §9 Rule: NO ALL-CAPS FOR TITLES.**  
> Never use `text-transform: uppercase` on main headings, alert messages, or full sentences. Uppercase is strictly reserved for 10px–11px monospace metadata badges (e.g. `MANDATORY`, `WITHDRAWN`, `ACTIVE`, `SHA-256`).

---

## 4. Master Transitions, Animations & Loading Effects Catalog

Every single motion effect in the platform is strictly cataloged below. No ad-hoc animations or unlisted transitions are permitted.

### 4.1 Master Transitions Matrix (All 21 Registered Transitions)

| Selector / Component | Property | Timing & Duration | Delay | Trigger / Event | UI Purpose |
|----------------------|----------|-------------------|-------|-----------------|------------|
| `.palette-btn` | `border-color, color` | `0.10s ease` | `0s` | `:hover`, `:active` | Crisp instant gate / domain selection |
| `.btn-run` | `opacity` | `0.15s ease` | `0s` | `:hover`, `:disabled` | Primary action button state shift |
| `.btn-secondary` | `border-color, color` | `0.10s ease` | `0s` | `:hover` | Secondary outline button hover |
| `.btn-lock` | `opacity` | `0.15s ease` | `0s` | `:hover`, `:disabled` | Lock state confirmation button |
| `.btn-ask` | `opacity` | `0.15s ease` | `0s` | `:hover`, `:disabled` | Authority Stream submit button |
| `.auth-submit` | `opacity 0.15s, transform 0.10s` | `ease` | `0s` | `:hover` (`-1px`), `:active` (`0px`) | Form submission press micro-interaction |
| `.auth-tab` | `background, color` | `0.15s ease` | `0s` | `:hover`, `.active` | Login / Signup tab toggle |
| `.auth-input` | `border-color` | `0.15s ease` | `0s` | `:focus` | Form input focus border transition |
| `.auth-logout-btn` | `border-color, color` | `0.15s ease` | `0s` | `:hover` (error-line) | Destructive action hover warning |
| `.pred-bar-fill` | `height` | `0.12s ease` | `0s` | Value drag / step click | Live probability / tolerance bar update |
| `.cmp-bar.predicted` | `height` | `0.45s cubic-bezier(0.4, 0, 0.2, 1)` | `0s` | Simulation / Evaluation Run | **Orchestrated Moment:** Violet draft bar growth |
| `.cmp-bar.actual` | `height` | `0.45s cubic-bezier(0.4, 0, 0.2, 1)` | `0.10s` | Simulation / Evaluation Run | **Orchestrated Moment:** Cobalt actual bar growth (staggered) |
| `.sv-value` | `opacity, color` | `0.18s ease` | `0s` | Scrubber step change | Statevector / numerical value crossfade |
| `.scrubber-btn` | `background, border-color, color` | `0.12s ease` | `0s` | `:hover`, `:active` | Step scrubber control hover |
| `.mode-toggle-btn` | `all` | `0.12s ease` | `0s` | `.active`, `:hover` | Domain preset switcher tab transition |
| `.concept-card` | `border-color, box-shadow` | `0.15s ease` | `0s` | `:hover` | Card elevation on hover |
| `.concept-mastery-bar-fill` | `width` | `0.40s cubic-bezier(0.4, 0, 0.2, 1)` | `0s` | Data load / Progress update | Progress bar fill sweep |
| `.concept-action-btn` | `all` | `0.12s ease` | `0s` | `:hover` | Card action button invert fill |
| `.instructor-refresh-btn` | `all` | `0.12s ease` | `0s` | `:hover` | Refresh button hover |
| `.btn-message-student` | `all` | `0.12s ease` | `0s` | `:hover` | Table row action button hover |
| `.superposition-result-badge` | `background, color` | `0.15s ease` | `0s` | Validation resolve | Result badge state change |

---

### 4.2 Master Keyframes & Loading Effects

#### 1. Grounding Pulse Indicator (`pulse-opacity`)
Used in `.tutor-loading::before` during LLM reasoning, retrieval, and pipeline inference.

```css
@keyframes pulse-opacity {
  0%, 100% { opacity: 1.0; }
  50%      { opacity: 0.35; }
}

.tutor-loading::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--collapse-cobalt);
  animation: pulse-opacity 1.2s ease-in-out infinite;
}
```

#### 2. Modal & Card Enter Transition (`auth-card-in`)
Used when mounting modals, cards, or switching view modes.

```css
@keyframes auth-card-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-card {
  animation: auth-card-in 0.25s ease both;
}
```

#### 3. Banner & Feedback Alert Pop-in (`banner-in`)
Used for toast alerts, error banners, and success notices.

```css
@keyframes banner-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-banner {
  animation: banner-in 0.20s ease both;
}
```

---

### 4.3 The "Orchestrated Moment" (Violet-to-Cobalt Collapse)

The core visual mechanism across the entire platform:
1. When a user creates a query, inputs a draft tender specification, or explores an unverified hypothesis, data bars and badges render in **Superposition Violet** (`--superposition-violet: #6E5AD6`).
2. When the user executes the pipeline / verification (`.btn-run`), the violet bar animates to its position in `0.45s`.
3. With a `0.10s` deliberate stagger delay, the **Collapse Cobalt** (`--collapse-cobalt: #1B4FE0`) verified standard bar animates alongside it.
4. If there is a discrepancy beyond specified tolerance, the amber or red delta highlight smoothly reveals.

```css
.cmp-bar.predicted {
  background: var(--superposition-violet);
  opacity: 0.65;
  transition: height 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.cmp-bar.actual {
  background: var(--collapse-cobalt);
  transition: height 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
}
```

---

### 4.4 Motion Accessibility Enforcement

For users with vestibular disorders or reduced-motion preferences, all animations and transitions are completely neutralized:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .cmp-bar.predicted,
  .cmp-bar.actual,
  .pred-bar-fill,
  .sv-value,
  .concept-mastery-bar-fill {
    transition: none !important;
  }
}
```

---

## 5. Workspace Grid & Page Architecture

The application adopts the rigid institutional 2-column layout:

```
+-----------------------------------------------------------------------------------------+
|  🏛️ MANAKAI BIS INTELLIGENCE PLATFORM  [IS 269 Cement Standard]     ● LIVE  [Engineer: AYUSH]  |
+--------------------------------------------------------------------+--------------------+
|                                                                    |                    |
|  MAIN WORKSPACE COLUMN (Flexible 1fr)                             |  AUTHORITY STREAM  |
|                                                                    |  (Fixed 320px)     |
|  ┌──────────────────────────────────────────────────────────────┐  |                    |
|  │  DOMAIN & SEARCH BAR (Preset Chips + Search)                 │  |  REASONING TRAIL   |
|  └──────────────────────────────────────────────────────────────┘  |  & AUDIT LOG       |
|                                                                    |                    |
|  ┌──────────────────────────────────────────────────────────────┐  |  [01:04:12] Found  |
|  │  FEATURE WORKBENCH (e.g. Clause Comparator / NIT Generator) │  |  IS 269 Cl 6.2     |
|  │                                                              │  |                    |
|  │  [Parameter]   [Specified Value]   [Observed Value] [Status] │  |  [01:04:15] Linked |
|  │  Compressive   ≥ 33.0 MPa          37.5 MPa         PASSED   │  |  to IS 4031-6   |
|  │  Fineness      ≥ 225 m²/kg         240 m²/kg        PASSED   │  |                    |
|  └──────────────────────────────────────────────────────────────┘  |  [Legal Stamp]     |
|                                                                    |  SHA-256: 8f4a...  |
|  ┌──────────────────────────────────────────────────────────────┐  |                    |
|  │  DATA VISUALIZATION / KNOWLEDGE GRAPH / PDF ANNOTATOR        │  |  [Ask Clause Ref]  |
|  └──────────────────────────────────────────────────────────────┘  |  [____________][↗] |
+--------------------------------------------------------------------+--------------------+
```

### CSS Workspace Definition:
```css
.workspace {
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  background-color: var(--paper);
}

.workspace-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--hairline);
  background: var(--paper);
}

.workspace-header h1 {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink);
  text-transform: none;
}

.workspace-main {
  grid-column: 1;
  grid-row: 2;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid var(--hairline);
  overflow-y: auto;
}

.tutor-panel {
  grid-column: 2;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--hairline);
  background: var(--paper);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }
  .workspace-main {
    border-right: none;
    border-bottom: 1px solid var(--hairline);
  }
  .tutor-panel {
    border-left: none;
    border-top: 1px solid var(--hairline);
    min-height: 380px;
  }
}
```

---

## 6. Content & Voice Guidance (Spec §8)

* **Institutional Voice:** Technical, objective, dry, precise. Never "Great question!" or "I'd be happy to help!" A technical legal secretary opens with factual grounding: e.g. *"IS 269:2015 Clause 6.2 Table 2 mandates 28-day Compressive Strength ≥ 33.0 MPa. The uploaded test certificate indicates 29.4 MPa (Non-compliant)."*
* **Button Nomenclature:** Buttons state the exact legal/procedural action:
  * `Run Compliance Audit` → Executes test parameter verification against contract schema.
  * `Lock Specification` → Computes SHA-256 and seals NIT clause drafting parameters.
  * `Export CVC Certificate` → Generates defensible audit PDF.
  * Never use generic `Submit` or `Continue`.
* **Empty States as Instructions:** Never apologize or show sad emojis.
  * ✅ *"Select an Indian Standard from the palette or enter an IS code to inspect clauses."*
  * ❌ *"No standards loaded yet 😔"*
* **Error Messages are Diagnostic:** Every error cites the specific clause, parameter, or broken schema constraint.

---

## 7. Keyboard Navigation & Accessibility (Spec §10)

* **Visible Focus Rings:** Every interactive button, input, tab, and slider has a distinct focus indicator:
  ```css
  *:focus-visible {
    outline: 2px solid var(--collapse-cobalt);
    outline-offset: 1px;
  }
  ```
* **Full Keyboard Operability:** All tables, tabs, scrubber controls, and entity palette buttons are navigable via `Tab`, `Enter`, and Arrow keys.
* **Dual Encoding:** Color is never the sole differentiator. Every status bar, alert, and compliance tag includes explicit monospace text labels (`PASSED`, `WITHDRAWN`, `SUPERSEDED`, `MANDATORY`).

---

## 8. React State & Pattern Architecture (from `App.jsx`)

When implementing React components in `application/frontend/src/`, follow these established architectural patterns:

### 8.1 Strict In-Memory JWT Authentication Pattern
Tokens are NEVER stored in `localStorage` or `sessionStorage` (preventing XSS leakage of institutional credentials). A `useRef` mirrors the in-memory React state so async callbacks never close over stale tokens:

```javascript
const [authToken, setAuthToken] = useState(null);
const [authUser, setAuthUser] = useState(null); // { id, email, role: 'engineer' | 'committee', display_name }
const authTokenRef = useRef(null);

useEffect(() => {
  authTokenRef.current = authToken;
}, [authToken]);
```

### 8.2 Grounded Observation Stream Pattern
The Authority Stream starts with a factual, domain-grounded prompt rather than a generic chatbot greeting:

```javascript
const [tutorMessages, setTutorMessages] = useState([
  {
    id: 0,
    type: 'grounded-observation',
    text: 'Select an Indian Standard (e.g. IS 269:2015) or upload a test report — I will cross-reference clauses and verify compliance parameters against the official Gazette specifications.',
  },
]);
```

### 8.3 Debounced Search & Tolerance Slider Pattern
All real-time filters and tolerance sliders use a `useRef` debounce timer (300ms) to eliminate request hammering:

```javascript
const debounceTimer = useRef(null);

const handleToleranceChange = useCallback((newVal) => {
  setToleranceSliderVal(newVal);
  if (debounceTimer.current) clearTimeout(debounceTimer.current);
  debounceTimer.current = setTimeout(() => {
    setToleranceLevel(newVal);
  }, 300);
}, []);
```

### 8.4 Auto-Scroll Pattern for Authority Stream
The reasoning log always smoothly tracks incoming streaming tokens:

```javascript
const tutorBottomRef = useRef(null);

useEffect(() => {
  tutorBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [tutorMessages, tutorLoading]);
```

### 8.5 Floating-Point Mathematical Formatting Utilities
Formatting helpers for tolerances, complex numbers, and standard percentages:

```javascript
export function roundTo2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatTolerance(val, unit = 'MPa') {
  if (val === null || val === undefined) return 'N/A';
  return `${roundTo2(val)} ${unit}`;
}

export function validateProbabilitySum(dist) {
  const sum = Object.values(dist).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.001;
}
```

---

## 9. SVG Canvas Viewport Constants (Knowledge Graph & PDF Viewport)

For **Feature 01 (Knowledge Graph)** and **Feature 10 (PDF Parser Bounding Box Overlay)**, use the exact `--void` (`#0D0F14`) canvas coordinate conventions:

```javascript
export const CANVAS_CONSTANTS = {
  SVG_W: 800,
  SVG_H: 450,
  BG_COLOR: '#0D0F14',
  WIRE_COLOR: '#8890A0',
  NODE_RADIUS: 18,
  NODE_COBALT: '#1B4FE0',
  NODE_VIOLET: '#6E5AD6',
  NODE_AMBER: '#E0982B',
  NODE_RED: '#C23B3B',
  GRID_SIZE: 20,
};
```

---

## 10. Feature-by-Feature UI Implementation Map

How each of the 12 platform features utilizes this design system:

| # | Feature | Main UI Components Used | Key Color Semantics |
|---|---------|--------------------------|---------------------|
| **01** | **Explainability / Reasoning Trail** | `.tutor-messages`, `.tutor-message.response`, `.circuit-canvas-wrap` (Knowledge Graph on `--void`) | Cobalt for citations, Violet for inference |
| **02** | **Audit Trail & Legal Defensibility** | `.table-wrapper`, `.instructor-table`, `.metric-code-pill` (`<code>` SHA-256), `.btn-run` (Export CVC PDF) | Cobalt hash pills, Green CVC validation stamp |
| **03** | **Human-in-the-Loop Feedback** | `.metric-tag.alert`, `.concept-action-btn`, `.btn-message-student` (Review clause), `.auth-banner.success` | Amber review flags, Green approved resolutions |
| **04** | **Proactive Staleness Alerts** | `.debug-banner`, `.metric-tag.alert`, `.debug-status-badge.mismatch`, Strikethrough `.sv-value.zero` | Amber for amendments, Red for withdrawn standards |
| **05** | **Multi-Lingual Domain Switcher** | `.mode-toggle-group`, `.mode-toggle-btn.active`, `.superposition-banner` (Domain preset guidelines) | Teal for technical domain, Cobalt for public procurement |
| **06** | **Standards Comparison & Allied** | `.compare-bars`, `.cmp-bar.predicted` (Std A), `.cmp-bar.actual` (Std B), `.dual-histogram-grid` | Violet (Base Standard) vs Cobalt (Allied Standard) |
| **07** | **Query Disambiguation** | `.palette`, `.palette-btn.selected`, `.gates-banner`, `.debug-target-row` (Extracted entities) | Violet for unresolved intent, Cobalt for selected entity |
| **08** | **NIT Clause Draft Generator** | `.scrubber-panel`, `.scrubber-btn-group`, `.concept-card`, `.btn-run` (Copy GeM-ready clause) | Violet draft step → Cobalt final approved tender text |
| **09** | **MCP Server Management** | `.metric-card`, `.metric-code-pill`, `.status-dot.run`, `.debug-comparison-box` | Cobalt connected status, Hairline tool registry |
| **10** | **PDF Standards Parser** | `.circuit-canvas-wrap` (PDF layout on `--void`), `.scrubber-counter`, `.metric-detail-row` | Void canvas, Amber OCR confidence warning |
| **11** | **Dashboard Heatmap & Analytics** | `.concept-grid`, `.metric-card`, `.concept-mastery-bar-track`, `.instructor-summary-pill` | Green/Cobalt density tiles, Amber risk metrics |
| **12** | **Compliance Checker** | `.instructor-table`, `.mastery-mini-track`, `.mastery-mini-fill`, `.concept-status-badge` | Green (`≥ Min`), Red (`< Min` failure tolerance) |

---

## 11. Complete Verbatim CSS Stylesheet (`index.css`)

Copy this complete CSS directly into `application/frontend/src/index.css`:

```css
/* ============================================================
   ManakAI / Egreen-Quanta Design System (Complete Production CSS)
   Tokens sourced directly from SIH Egreen-Quanta Design System
   ============================================================ */

/* Google Fonts: Literata (prose) + JetBrains Mono (data/code) */
@import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=JetBrains+Mono:wght@400;600&display=swap');

/* --- Design Tokens --- */
:root {
  /* Color */
  --paper:                #EEF0F4;  /* base background */
  --surface:              #FFFFFF;  /* solid card background */
  --ink:                  #161A22;  /* primary text */
  --ink-secondary:        #4A5060;  /* secondary / labels */
  --ink-muted:            #8890A0;  /* muted / disabled */
  --superposition-violet: #6E5AD6;  /* predicted / uncertain / draft */
  --collapse-cobalt:      #1B4FE0;  /* measured / actual / confirmed */
  --signal-amber:         #E0982B;  /* discrepancy / debug / warning */
  --void:                 #0D0F14;  /* circuit/graph canvas ONLY */
  --error-line:           #C23B3B;  /* broken / failed / withdrawn */
  --hairline:             #D0D4DC;  /* 1px dividers */
  --canvas-wire:          #8890A0;  /* wire on void canvas */
  --emerald-pass:         #108250;  /* passed compliance / certified */
  --teal-guide:           #0E7C6B;  /* guided module / domain preset */

  /* Typography */
  --font-prose:    'Literata', Georgia, serif;
  --font-data:     'JetBrains Mono', 'Courier New', monospace;

  /* Spacing */
  --panel-gap:     1px;   /* hairline gap between panels */
  --radius-sm:     4px;   /* content panels – consistent, not decorative */
  --radius-none:   0px;   /* circuit gates / tables – sharp, diagram-accurate */
}

/* --- Reset & Base --- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
}

body {
  background-color: var(--paper);
  color: var(--ink);
  font-family: var(--font-prose);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

*:focus-visible {
  outline: 2px solid var(--collapse-cobalt);
  outline-offset: 1px;
}

/* --- Layout Shell --- */
.workspace {
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

.workspace-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--hairline);
  background: var(--paper);
}

.workspace-header h1 {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink);
  text-transform: none; /* NO ALL-CAPS per spec §9 */
}

.workspace-header .header-status {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--ink-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink-muted);
  display: inline-block;
}
.status-dot.locked {
  background: var(--superposition-violet);
}
.status-dot.run {
  background: var(--collapse-cobalt);
}

/* --- Main Left Column --- */
.workspace-main {
  grid-column: 1;
  grid-row: 2;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid var(--hairline);
  overflow-y: auto;
}

/* --- Section labels --- */
.section-label {
  font-family: var(--font-data);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  margin-bottom: 8px;
}

/* --- Gate Palette --- */
.palette {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.palette-btn {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  background: var(--paper);
  color: var(--ink);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-none); /* sharp – diagram-accurate */
  cursor: pointer;
  transition: border-color 0.10s, color 0.10s;
  user-select: none;
}

.palette-btn:hover {
  border-color: var(--ink-secondary);
}

.palette-btn.selected {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

.palette-hint {
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--ink-secondary);
  margin-left: 4px;
}

/* --- Canvas Container (void surface) --- */
.circuit-canvas-wrap {
  background: var(--void);
  border-radius: var(--radius-sm);
  padding: 0;
  overflow: hidden;
  line-height: 0;
}

/* --- Action Bar --- */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-run {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 22px;
  background: var(--collapse-cobalt);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-run:disabled {
  opacity: 0.40;
  cursor: not-allowed;
}

.btn-run:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-secondary {
  font-family: var(--font-data);
  font-size: 13px;
  padding: 8px 16px;
  background: transparent;
  color: var(--ink-secondary);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.10s, color 0.10s;
}
.btn-secondary:hover {
  border-color: var(--ink-secondary);
  color: var(--ink);
}

.action-hint {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--ink-muted);
}

/* --- Prediction Panel --- */
.prediction-panel {
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 16px;
  background: var(--paper);
}

.prediction-panel .section-label {
  margin-bottom: 12px;
}

.prediction-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 120px;
  margin-bottom: 12px;
}

.pred-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
  gap: 4px;
}

.pred-bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid var(--hairline);
  position: relative;
  cursor: ns-resize;
}

.pred-bar-fill {
  width: 100%;
  background: var(--superposition-violet);
  transition: height 0.12s ease;
  min-height: 2px;
}

.pred-bar-pct {
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--superposition-violet);
  font-weight: 600;
}

.pred-bar-label {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--ink);
  font-weight: 600;
}

/* Stepper controls beneath each bar */
.pred-steppers {
  display: flex;
  gap: 3px;
  margin-top: 2px;
}

.pred-step-btn {
  font-family: var(--font-data);
  font-size: 12px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-none);
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.pred-step-btn:hover {
  border-color: var(--superposition-violet);
  color: var(--superposition-violet);
}
.pred-step-btn:disabled {
  opacity: 0.30;
  cursor: not-allowed;
}

.prediction-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pred-sum-indicator {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--ink-secondary);
}
.pred-sum-indicator.valid {
  color: var(--collapse-cobalt);
}
.pred-sum-indicator.invalid {
  color: var(--error-line);
}

.btn-lock {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 20px;
  background: var(--superposition-violet);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-lock:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.btn-lock:hover:not(:disabled) {
  opacity: 0.87;
}

.prediction-locked-note {
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--superposition-violet);
  display: flex;
  align-items: center;
  gap: 5px;
}

.inline-error {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--error-line);
  margin-top: 6px;
}

/* --- Compare / Results Panel --- */
.results-panel {
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 16px;
  background: var(--paper);
}

.compare-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 140px;
  margin-bottom: 12px;
}

.compare-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  gap: 4px;
}

.compare-bars-pair {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  border-bottom: 1px solid var(--hairline);
}

.cmp-bar {
  flex: 1;
  min-height: 2px;
  position: relative;
}

.cmp-bar.predicted {
  background: var(--superposition-violet);
  opacity: 0.55;
  transition: height 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.cmp-bar.actual {
  background: var(--collapse-cobalt);
  transition: height 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.10s;
}

.cmp-pct-row {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.cmp-pct {
  font-family: var(--font-data);
  font-size: 10px;
}
.cmp-pct.predicted {
  color: var(--superposition-violet);
}
.cmp-pct.actual {
  color: var(--collapse-cobalt);
}

.compare-group-label {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}

.compare-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--ink-secondary);
}

.legend-swatch {
  width: 14px;
  height: 10px;
  border-radius: 1px;
}

/* --- Statevector --- */
.statevector-table {
  border-top: 1px solid var(--hairline);
  margin-top: 14px;
  padding-top: 10px;
}

.sv-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  border-bottom: 1px dashed var(--hairline);
  font-family: var(--font-data);
  font-size: 12px;
}

.sv-row:last-child {
  border-bottom: none;
}

.sv-label {
  color: var(--ink-secondary);
}

.sv-value {
  color: var(--ink);
  font-weight: 600;
  transition: opacity 0.18s ease, color 0.18s ease;
}
.sv-value.zero {
  color: var(--ink-muted);
  font-weight: 400;
}

/* --- Amplitude Evolution Scrubber --- */
.scrubber-panel {
  border: 1px solid var(--hairline);
  background: var(--paper);
  padding: 10px 14px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  outline: none;
}

.scrubber-panel:focus-visible {
  border-color: var(--collapse-cobalt);
}

.scrubber-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scrubber-step-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.scrubber-counter {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.scrubber-badge {
  display: inline-block;
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  background: var(--surface);
  border: 1px solid var(--hairline);
  color: var(--collapse-cobalt);
}

.scrubber-btn-group {
  display: flex;
  gap: 4px;
}

.scrubber-btn {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border: 1px solid var(--hairline);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
}

.scrubber-btn:hover:not(:disabled) {
  border-color: var(--collapse-cobalt);
  color: var(--collapse-cobalt);
}

.scrubber-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.scrubber-desc {
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--ink-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scrubber-hint {
  font-size: 10px;
  color: var(--ink-muted);
}

/* --- AI Authority / Tutor Panel --- */
.tutor-panel {
  grid-column: 2;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--hairline);
  background: var(--paper);
  overflow-y: auto;
}

.tutor-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--hairline);
}

.tutor-header .section-label {
  margin-bottom: 4px;
}

.tutor-context-line {
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--ink-secondary);
}

.tutor-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tutor-message {
  font-family: var(--font-prose);
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink);
  max-width: 100%;
}

.tutor-message.grounded-observation {
  color: var(--ink-secondary);
  font-style: italic;
  background: rgba(0, 0, 0, 0.02);
  padding: 8px 12px;
  border-left: 2px solid var(--ink-muted);
}

.tutor-message.response {
  border-left: 2px solid var(--collapse-cobalt);
  padding-left: 10px;
}

.tutor-loading {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--ink-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tutor-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--hairline);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tutor-scope-label {
  font-family: var(--font-data);
  font-size: 11px;
  color: var(--ink-muted);
}

.tutor-input-row {
  display: flex;
  gap: 6px;
}

.tutor-input {
  flex: 1;
  font-family: var(--font-prose);
  font-size: 13px;
  padding: 7px 10px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink);
  resize: none;
  line-height: 1.45;
}

.tutor-input:focus {
  outline: none;
  border-color: var(--collapse-cobalt);
}

.tutor-input::placeholder {
  color: var(--ink-muted);
}

.btn-ask {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  background: var(--ink);
  color: var(--paper);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  align-self: flex-end;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.btn-ask:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.btn-ask:hover:not(:disabled) {
  opacity: 0.80;
}

/* --- Debug Mode & Warning Banners --- */
.debug-banner {
  border-left: 3px solid var(--signal-amber);
  background: var(--surface);
  border-top: 1px solid var(--hairline);
  border-right: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 12px 16px;
  margin-bottom: 14px;
}

.debug-badge {
  display: inline-block;
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #B45309;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  padding: 2px 6px;
  margin-bottom: 6px;
}

.debug-prompt-text {
  font-family: var(--font-prose);
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.5;
}

.debug-target-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  font-family: var(--font-data);
  font-size: 11px;
}

.debug-target-pill {
  color: var(--ink-secondary);
}

.mode-toggle-group {
  display: flex;
  gap: 4px;
}

.mode-toggle-btn {
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border: 1px solid var(--hairline);
  background: var(--paper);
  color: var(--ink-secondary);
  cursor: pointer;
  transition: all 0.12s ease;
}

.mode-toggle-btn.active {
  background: var(--surface);
  border-color: var(--ink);
  color: var(--ink);
}

.mode-toggle-btn.debug.active {
  background: #FFFBEB;
  border-color: var(--signal-amber);
  color: #B45309;
}

.mode-toggle-btn.noise.active {
  background: #EFF6FF;
  border-color: var(--collapse-cobalt);
  color: var(--collapse-cobalt);
}

.mode-toggle-btn.progress.active {
  background: #F5F3FF;
  border-color: var(--superposition-violet);
  color: var(--superposition-violet);
}

/* Noise & Dual Histograms */
.noise-banner {
  border-left: 3px solid var(--collapse-cobalt);
  background: var(--surface);
  border-top: 1px solid var(--hairline);
  border-right: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 12px 16px;
  margin-bottom: 14px;
}

.noise-badge {
  display: inline-block;
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--collapse-cobalt);
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  padding: 2px 6px;
  margin-bottom: 6px;
}

.dual-histogram-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 14px;
}

.dual-hist-col {
  background: var(--surface);
  border: 1px solid var(--hairline);
  padding: 12px;
}

.dual-hist-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--hairline);
  padding-bottom: 6px;
}

.dual-hist-title {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.dual-hist-subtitle {
  font-family: var(--font-data);
  font-size: 10px;
  color: var(--ink-secondary);
}

.cmp-bar.ideal {
  background: var(--collapse-cobalt);
}

.cmp-bar.noisy {
  background: #D97706;
}

.cmp-pct.noisy {
  color: #D97706;
}

.debug-comparison-box {
  background: var(--paper);
  border: 1px solid var(--hairline);
  border-left: 3px solid var(--signal-amber);
  padding: 8px 12px;
  margin-top: 10px;
  margin-bottom: 12px;
  font-family: var(--font-data);
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-comparison-box.fixed {
  border-left-color: #10B981;
}

.debug-status-badge {
  font-weight: 600;
  font-size: 11px;
  padding: 2px 8px;
}
.debug-status-badge.mismatch {
  color: #B45309;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
}
.debug-status-badge.fixed {
  color: #065F46;
  background: #D1FAE5;
  border: 1px solid #6EE7B7;
}

/* --- Auth Screen --- */
.auth-screen {
  min-height: 100vh;
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--paper);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 40px 36px 32px;
  animation: auth-card-in 0.25s ease both;
}

.auth-brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.auth-brand-mark {
  font-family: var(--font-data);
  font-size: 20px;
  font-weight: 600;
  color: var(--collapse-cobalt);
  letter-spacing: -0.02em;
}

.auth-brand-name {
  font-family: var(--font-data);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.03em;
}

.auth-tagline {
  font-family: var(--font-prose);
  font-size: 13px;
  color: var(--ink-secondary);
  line-height: 1.5;
  margin-bottom: 28px;
}

.auth-tab-row {
  display: flex;
  gap: 0;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 20px;
}

.auth-tab {
  flex: 1;
  padding: 8px 0;
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: transparent;
  border: none;
  color: #8890A0;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.auth-tab:hover {
  background: var(--hairline);
  color: var(--ink);
}

.auth-tab.active {
  background: var(--collapse-cobalt);
  color: #fff;
}

.auth-banner {
  font-family: var(--font-data);
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 3px;
  margin-bottom: 16px;
  animation: banner-in 0.20s ease both;
}

.auth-banner.error {
  background: rgba(194, 59, 59, 0.08);
  border: 1px solid rgba(194, 59, 59, 0.30);
  color: var(--error-line);
}

.auth-banner.success {
  background: rgba(16, 130, 80, 0.08);
  border: 1px solid rgba(16, 130, 80, 0.30);
  color: #0a6644;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--ink-secondary);
  text-transform: uppercase;
}

.auth-input {
  padding: 9px 12px;
  background: #fff;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  font-family: var(--font-data);
  font-size: 13px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s ease;
  width: 100%;
}
.auth-input::placeholder {
  color: var(--ink-muted);
}
.auth-input:focus {
  border-color: var(--collapse-cobalt);
}
.auth-input:disabled {
  opacity: 0.50;
  cursor: not-allowed;
}

.auth-select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238890A0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
  cursor: pointer;
}
.auth-select option {
  background: var(--paper);
  color: var(--ink);
}

.auth-submit {
  margin-top: 6px;
  padding: 11px;
  background: var(--collapse-cobalt);
  border: none;
  border-radius: 3px;
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.10s ease;
  letter-spacing: 0.02em;
}
.auth-submit:hover:not(:disabled) {
  opacity: 0.88;
  transform: translateY(-1px);
}
.auth-submit:active:not(:disabled) {
  transform: translateY(0);
}
.auth-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* User Badge in Header */
.header-right-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auth-user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 12px;
  background: rgba(27, 79, 224, 0.08);
  border: 1px solid rgba(27, 79, 224, 0.20);
  border-radius: 100px;
}

.auth-user-name {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
}

.auth-user-role {
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--collapse-cobalt);
  background: rgba(27, 79, 224, 0.10);
  padding: 1px 6px;
  border-radius: 100px;
}

.auth-logout-btn {
  padding: 3px 8px;
  background: transparent;
  border: 1px solid var(--hairline);
  border-radius: 3px;
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.auth-logout-btn:hover {
  border-color: var(--error-line);
  color: var(--error-line);
}

/* --- Concept Grid & Metric Cards --- */
.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.concept-card {
  background: #FFFFFF;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.concept-card.mastered {
  border-left: 3px solid #108250;
}
.concept-card.in-progress {
  border-left: 3px solid var(--collapse-cobalt);
}
.concept-card.not-started {
  border-left: 3px solid var(--ink-muted);
}

.concept-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.concept-card-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.concept-name {
  font-family: var(--font-data);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  text-transform: capitalize;
}

.concept-status-badge {
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.concept-status-badge.mastered {
  background: rgba(16, 130, 80, 0.10);
  color: #108250;
  border: 1px solid rgba(16, 130, 80, 0.30);
}
.concept-status-badge.in-progress {
  background: rgba(27, 79, 224, 0.08);
  color: var(--collapse-cobalt);
  border: 1px solid rgba(27, 79, 224, 0.25);
}
.concept-status-badge.not-started {
  background: rgba(136, 144, 160, 0.10);
  color: var(--ink-muted);
  border: 1px solid var(--hairline);
}

.concept-mastery-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.concept-mastery-bar-track {
  flex-grow: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.concept-mastery-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.40s cubic-bezier(0.4, 0, 0.2, 1);
}
.concept-mastery-bar-fill.mastered {
  background: #108250;
}
.concept-mastery-bar-fill.in-progress {
  background: var(--collapse-cobalt);
}
.concept-mastery-bar-fill.not-started {
  background: var(--hairline);
}

.concept-action-btn {
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  background: transparent;
  color: var(--collapse-cobalt);
  border: 1px solid rgba(27, 79, 224, 0.30);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.12s ease;
}
.concept-action-btn:hover {
  background: var(--collapse-cobalt);
  color: #FFFFFF;
}

/* Metric Cards */
.instructor-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-tag {
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 100px;
}
.metric-tag.warning {
  background: rgba(224, 152, 43, 0.12);
  color: #B57410;
  border: 1px solid rgba(224, 152, 43, 0.30);
}
.metric-tag.alert {
  background: rgba(194, 59, 59, 0.10);
  color: var(--error-line);
  border: 1px solid rgba(194, 59, 59, 0.30);
}

.metric-code-pill code {
  font-family: var(--font-data);
  font-size: 11px;
  background: var(--paper);
  color: var(--ink-secondary);
  padding: 2px 6px;
  border-radius: 3px;
}

/* --- Tables --- */
.table-wrapper {
  background: #FFFFFF;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.instructor-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.instructor-table th {
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-muted);
  background: var(--paper);
  padding: 10px 14px;
  border-bottom: 1px solid var(--hairline);
}

.instructor-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  font-size: 13px;
  vertical-align: middle;
}

.instructor-table tr:last-child td {
  border-bottom: none;
}

.instructor-table tr:hover td {
  background: rgba(0, 0, 0, 0.015);
}

.data-num {
  font-family: var(--font-data);
  font-size: 12px;
  color: var(--ink);
}

.mastery-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 110px;
}

.mastery-mini-track {
  flex-grow: 1;
  height: 5px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.mastery-mini-fill {
  height: 100%;
  background: #C23B3B;
  border-radius: 3px;
}

.mastery-mini-pct {
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  color: #C23B3B;
  min-width: 28px;
  text-align: right;
}

/* --- Guided / Domain Banners (Teal & Violet Accents) --- */
.superposition-banner {
  border-left: 3px solid #0E7C6B;
  background: var(--surface);
  border-top: 1px solid var(--hairline);
  border-right: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 14px 16px;
  margin-bottom: 14px;
}

.superposition-badge {
  display: inline-block;
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #065F46;
  background: #D1FAE5;
  border: 1px solid #6EE7B7;
  padding: 2px 6px;
  margin-bottom: 8px;
}

.gates-banner {
  border-left: 3px solid #6E5AD6;
  background: var(--surface);
  border-top: 1px solid var(--hairline);
  border-right: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 14px 16px;
  margin-bottom: 14px;
}

.gates-badge {
  display: inline-block;
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #5B21B6;
  background: #EDE9FE;
  border: 1px solid #C4B5FD;
  padding: 2px 6px;
  margin-bottom: 8px;
}

/* ============================================================
   Keyframe Animations
   ============================================================ */
@keyframes pulse-opacity {
  0%, 100% { opacity: 1.0; }
  50%      { opacity: 0.35; }
}

@keyframes auth-card-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes banner-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* ============================================================
   Reduced Motion Accessibility Override
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .cmp-bar.predicted,
  .cmp-bar.actual,
  .pred-bar-fill,
  .sv-value,
  .concept-mastery-bar-fill {
    transition: none !important;
  }
}
```

---

## 12. Build & Deployment Configurations (Vite & Nginx)

When creating `application/frontend/`, use these exact build and deployment files:

### 12.1 `package.json`
```json
{
  "name": "manakai-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

### 12.2 `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
```

### 12.3 Production `nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 13. Institutional Icon Sprite Manifest (`public/icons.svg`)

Standard SVG symbols to include in `public/icons.svg` for crisp, vector-sharp institutional iconography without bloated icon packages:

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <!-- Documentation & Clause Link Icon -->
  <symbol id="icon-clause" viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" points="14 2 14 8 20 8"/>
    <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" x1="16" y1="13" x2="8" y2="13"/>
    <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" x1="16" y1="17" x2="8" y2="17"/>
  </symbol>

  <!-- Legal Stamp / SHA-256 Audit Seal -->
  <symbol id="icon-stamp" viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9 12 2 2 4-4"/>
  </symbol>

  <!-- External Reference / Gazette Link -->
  <symbol id="icon-external" viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" points="15 3 21 3 21 9"/>
    <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" x1="10" y1="14" x2="21" y2="3"/>
  </symbol>
</svg>
```

---

## 14. Developer Checklist for Implementation

- [ ] **CSS Setup:** Paste the complete CSS above into `application/frontend/src/index.css`.
- [ ] **Fonts Import:** Ensure `Literata` and `JetBrains Mono` load properly.
- [ ] **Grid Compliance:** The primary layout must use `.workspace` with a 320px right column for the Authority Stream.
- [ ] **No Hardcoded Hex Colors:** All components use `var(--paper)`, `var(--collapse-cobalt)`, etc.
- [ ] **Data Mock Connection:** All components read initial state from `interface/fixtures/cement_mock.json`.
- [ ] **Reduced Motion:** Verify zero layout jumps when `prefers-reduced-motion: reduce` is enabled.
- [ ] **Voice Adherence:** Error and status messages follow Spec §8 objective diagnostic phrasing.
