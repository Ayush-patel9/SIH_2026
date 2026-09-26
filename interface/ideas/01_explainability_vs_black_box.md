# Feature 01 — Explainability vs. Black Box
## Reasoning Trail · Confidence Breakdown · Interactive Knowledge Graph

---

## WHY THIS EXISTS

A procurement officer who specifies the wrong IS number in a ₹50 Crore NIT is **personally liable**. If the CVC audits, the only defence is a paper trail that says: "the system told me X, because of A, B, C." An opaque AI recommendation that just says "use IS 269:2015" provides zero legal cover. This feature converts every recommendation into a **transparent, step-by-step court-defensible reasoning trail.**

---

## DESIGN PRINCIPLE (SIH Color System)

Use the existing SIH Egreen-Quanta palette. Do **NOT** deviate:
- `--collapse-cobalt: #1B4FE0` → Active standard nodes, confirmed results, passed checks
- `--superposition-violet: #6E5AD6` → Predicted / uncertain states, graph edges in-flight
- `--signal-amber: #E0982B` → Low-confidence steps (< 0.80), warnings
- `--error-line: #C23B3B` → WITHDRAWN or SUPERSEDED standard nodes
- `--paper: #EEF0F4` → Panel backgrounds
- `--void: #0D0F14` → Graph canvas background (dark, like the quantum circuit canvas)
- `--ink: #161A22` → Primary text
- Font: `JetBrains Mono` for all data labels, IS numbers, scores
- Font: `Literata` for explanatory text and step descriptions

No glassmorphism. No gradient blobs. Clean, data-dense, government-grade.

---

## WHAT YOU BUILD (JSON-ONLY, ZERO PIPELINE DEPENDENCY)

Everything below works by consuming the `StandardsResponse` fixture from `interface/fixtures/cement_mock.json`. When the pipeline is live, swap the fixture source with the real API endpoint. **No other code change needed.**

---

## COMPONENT 1 — `ReasoningTimeline`

### What It Is
A vertical 4-step stepper. Each step is a card showing the pipeline stage, its natural-language explanation, and a confidence meter. Steps are rendered in strict order from the `reasoning_trace` array. Steps below confidence `0.80` get an amber warning badge.

### Exact JSON Fields Consumed
```json
{
  "reasoning_trace": [
    { "step": "query_understanding",   "detail": "...", "confidence": 0.98 },
    { "step": "vector_retrieval",      "detail": "...", "confidence": 0.92 },
    { "step": "graph_traversal",       "detail": "...", "confidence": 1.00 },
    { "step": "qco_compliance_lookup", "detail": "...", "confidence": 0.99 }
  ]
}
```

### Step Label Map (hardcoded lookup, no pipeline needed)
```js
const STEP_LABELS = {
  query_understanding:   { icon: "🔍", title: "Query Entity Recognition", subtitle: "NLP + Named Entity Recognition" },
  vector_retrieval:      { icon: "📐", title: "Dense Vector Search",       subtitle: "Semantic similarity over 22K standards" },
  graph_traversal:       { icon: "🕸️",  title: "Knowledge Graph Expansion", subtitle: "Multi-hop normative reference traversal" },
  qco_compliance_lookup: { icon: "⚖️",  title: "QCO Regulatory Lookup",    subtitle: "Gazette notification verification" },
};
```

### Visual Spec
```
┌─────────────────────────────────────────────────────┐
│  [🔍] Query Entity Recognition        ● 98%  [DONE] │  ← cobalt border
│       "Ordinary Portland Cement, 43 Grade, Highway" │
│  ──────────────────────────────────────────────     │
│  [📐] Dense Vector Search             ● 92%  [DONE] │  ← cobalt border
│       "IS 269:2015 (score 0.92), IS 8112 (0.88)"   │
│  ──────────────────────────────────────────────     │
│  [🕸️]  Knowledge Graph Expansion      ● 100% [DONE] │  ← cobalt border
│       "IS 8112:1989 WITHDRAWN → consolidated IS 269"│
│  ──────────────────────────────────────────────     │
│  [⚖️]  QCO Regulatory Lookup          ● 99%  [DONE] │  ← cobalt border
│       "Cement QCO 2003 → BIS ISI Mark mandatory"   │
└─────────────────────────────────────────────────────┘
```

### Confidence Bar Rendering
```js
// render confidence bar fill-width proportional to confidence value
// color logic:
const barColor = (confidence) =>
  confidence >= 0.90 ? 'var(--collapse-cobalt)' :
  confidence >= 0.80 ? 'var(--superposition-violet)' :
  'var(--signal-amber)';
```

### Fallback (when `reasoning_trace` is empty or missing)
```js
const FALLBACK_TRACE = [
  { step: "query_understanding", detail: "Query processed. Entities extracted.", confidence: 0.90 },
  { step: "vector_retrieval",    detail: "Top match retrieved from standards catalog.", confidence: 0.85 },
];
```

---

## COMPONENT 2 — `ConfidenceBreakdownBar`

### What It Is
Three horizontal segments in a single row, visually representing the proportional contribution of each scoring factor to the final confidence score.

### Exact JSON Fields Consumed
```json
{
  "primary_recommendation": {
    "confidence": 0.94,
    "confidence_breakdown": {
      "semantic_vector_score": 0.45,
      "keyword_exact_match": 0.30,
      "graph_co_citation_boost": 0.19
    }
  }
}
```

### Visual Spec
```
CONFIDENCE SCORE: 94%

Vector Semantic  [████████████████████████████░░░░░░░] 45%  #1B4FE0
Keyword Match    [█████████████████░░░░░░░░░░░░░░░░░░] 30%  #6E5AD6
Graph Citation   [██████████░░░░░░░░░░░░░░░░░░░░░░░░░] 19%  #E0982B
```

### Segment Computation
```js
// breakdown values might not sum to exactly confidence due to rounding/LLM weights
// normalize them against their own sum for display proportions
const total = semantic + keyword + graph;
const displaySemanticPct = Math.round((semantic / total) * confidence * 100);
// etc.
```

### Fallback (when `confidence_breakdown` is missing)
```js
// derive a synthetic distribution from the global confidence score only
const fallbackBreakdown = {
  semantic_vector_score:    confidence * 0.60,
  keyword_exact_match:      confidence * 0.30,
  graph_co_citation_boost:  confidence * 0.10,
};
```

---

## COMPONENT 3 — `KnowledgeGraphViewer`

### What It Is
An SVG-based interactive subgraph using the same `void` dark canvas as the existing SIH quantum circuit board. Nodes are standard identifiers or product entities. Edges are directed arrows labeled with the relationship type. Clicking a node shows the full standard title and status in a side popover.

### Exact JSON Fields Consumed
```json
{
  "graph_path": [
    { "from": "43 Grade Cement",  "to": "IS 8112:1989",    "edge_type": "HISTORICAL_SPEC",      "label": "Historically governed by" },
    { "from": "IS 8112:1989",     "to": "IS 269:2015",     "edge_type": "SUPERSEDED_BY",        "label": "Consolidated into" },
    { "from": "IS 269:2015",      "to": "IS 4031 (Part 1)","edge_type": "REQUIRES_TEST_METHOD", "label": "Mandates testing via" }
  ]
}
```

### Node Classification & Color Rules (deterministic, no pipeline needed)
```js
function classifyNode(nodeId, graphPath, primaryIsNumber) {
  if (nodeId === primaryIsNumber) return 'ACTIVE';          // cobalt
  const incomingEdge = graphPath.find(e => e.to === nodeId);
  if (incomingEdge?.edge_type === 'SUPERSEDED_BY') {
    if (graphPath.find(e => e.from === nodeId && e.edge_type === 'SUPERSEDED_BY'))
      return 'WITHDRAWN';                                    // error-line red
  }
  if (nodeId.includes('Part') || incomingEdge?.edge_type?.includes('TEST'))
    return 'TEST_METHOD';                                    // amber
  if (!nodeId.startsWith('IS'))
    return 'PRODUCT_ENTITY';                                 // paper / white
  return 'STANDARD';                                         // violet
}

const NODE_COLORS = {
  ACTIVE:         '#1B4FE0',  // cobalt
  WITHDRAWN:      '#C23B3B',  // error-line
  TEST_METHOD:    '#E0982B',  // amber
  PRODUCT_ENTITY: '#EEF0F4',  // paper
  STANDARD:       '#6E5AD6',  // violet
};
```

### Layout Algorithm (pure JS, no library needed)
```js
// Simple left-to-right topological layout
// Build adjacency list → find root nodes (no incoming edges) → BFS from roots
// Assign: column = BFS depth, row = sibling index within column
function computeLayout(edges) {
  const allNodes = [...new Set(edges.flatMap(e => [e.from, e.to]))];
  const inDegree = Object.fromEntries(allNodes.map(n => [n, 0]));
  edges.forEach(e => { inDegree[e.to] = (inDegree[e.to] || 0) + 1; });
  const roots = allNodes.filter(n => inDegree[n] === 0);
  // BFS assigns column depths
  const depths = {};
  const queue = roots.map(r => [r, 0]);
  while (queue.length) {
    const [node, depth] = queue.shift();
    if (depths[node] === undefined) {
      depths[node] = depth;
      edges.filter(e => e.from === node).forEach(e => queue.push([e.to, depth + 1]));
    }
  }
  // Group by depth → assign y-positions within column
  const columns = {};
  allNodes.forEach(n => {
    const d = depths[n] ?? 0;
    columns[d] = columns[d] ?? [];
    columns[d].push(n);
  });
  const positions = {};
  const COL_WIDTH = 160;
  const ROW_HEIGHT = 80;
  const PADDING = 40;
  Object.entries(columns).forEach(([col, nodes]) => {
    nodes.forEach((node, i) => {
      positions[node] = {
        x: PADDING + parseInt(col) * COL_WIDTH,
        y: PADDING + i * ROW_HEIGHT,
      };
    });
  });
  return positions;
}
```

### Fallback (when `graph_path` is empty)
```js
// Build a minimal 2-node graph from primary_recommendation alone
const fallbackGraph = [
  {
    from: response.query_understanding.original_text.slice(0, 30),
    to:   response.primary_recommendation.is_number,
    edge_type: 'DIRECT_MATCH',
    label: 'Best match for',
  }
];
```

### SVG Rendering Rules (match SIH void canvas style)
```css
/* Use the same void canvas background as quantum circuit board */
.kg-canvas {
  background: var(--void);
  border-radius: var(--radius-sm);
  width: 100%;
  min-height: 240px;
}

/* Node circles */
.kg-node text {
  font-family: var(--font-data);
  font-size: 11px;
  fill: var(--paper);
}

/* Edge arrows — same wire style as qubit wires */
.kg-edge-arrow {
  stroke: var(--canvas-wire);
  stroke-width: 1.5;
  fill: none;
  marker-end: url(#arrowhead);
}

/* Edge labels */
.kg-edge-label {
  font-family: var(--font-data);
  font-size: 10px;
  fill: var(--ink-muted);
}
```

---

## COMPONENT 4 — `PlainLanguageToggle`

### What It Is
A pill toggle (`Technical` / `Plain Language`) above any standard card. When set to Plain Language, replaces the technical spec text with `plain_language_explanation.text`.

### Exact JSON Fields Consumed
```json
{
  "plain_language_explanation": {
    "enabled": true,
    "text": "For 43 grade OPC, use IS 269:2015. The old IS 8112:1989 was withdrawn in 2015 — using it risks CVC scrutiny. BIS ISI certification is mandatory by law."
  }
}
```

### Fallback Generator (when field is absent)
```js
function synthesizePlainLanguage(rec) {
  return `For ${rec.scope_snippet || 'this product category'}, the current applicable standard is ${rec.is_number} (${rec.year_published}). ${rec.certification.mandatory ? `BIS ${rec.certification.scheme.replace(/_/g,' ')} certification is legally mandatory under ${rec.certification.qco_order_name}.` : 'Voluntary certification applies.'}`;
}
```

---

## FILE STRUCTURE TO CREATE

```
application/frontend/src/
└── features/
    └── explainability/
        ├── graphParser.js            ← classifyNode() + computeLayout()
        ├── reasoningParser.js        ← parse reasoning_trace[], fallback generation
        ├── mockGraphData.js          ← 4 product fixtures (Cement, Steel, Electronics, Textile)
        ├── ReasoningTimeline.jsx     ← Component 1
        ├── ConfidenceBreakdownBar.jsx← Component 2
        ├── KnowledgeGraphViewer.jsx  ← Component 3 (SVG, void canvas)
        └── PlainLanguageToggle.jsx   ← Component 4
```

---

## KEY-AND-LOCK WIRING

```js
// This is the ENTIRE integration point
// When pipeline is live, replace cementMock with: const response = await fetch('/api/query', {...})
import cementMock from '../../../../interface/fixtures/cement_mock.json';

const response = cementMock; // ← SWAP THIS ONE LINE when pipeline is ready

<ReasoningTimeline      steps={response.reasoning_trace} />
<ConfidenceBreakdownBar breakdown={response.primary_recommendation.confidence_breakdown}
                        confidence={response.primary_recommendation.confidence} />
<KnowledgeGraphViewer   edges={response.graph_path}
                        primaryStandard={response.primary_recommendation.is_number} />
<PlainLanguageToggle    explanation={response.plain_language_explanation} />
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not call any pipeline API directly from these components
- ❌ Do not import anything from `pipeline/`
- ❌ Do not build a graph database or real NLP engine
- ❌ Do not add WebSocket subscriptions here (that is Feature 04's domain)
