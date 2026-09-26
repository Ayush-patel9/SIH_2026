# Feature 06 — Standards Comparison & Allied Standards Table
## Side-by-Side Comparator · Allied Standards Matrix · Conflict Resolver

---

## WHY THIS EXISTS

A procurement engineer evaluating bids for a flyover receives competing samples certified to `IS 269:2015` and `IS 1489 (Part 1):2015`. These are two *different* standards for two different types of cement (OPC vs. PPC). Without a side-by-side comparison, the engineer cannot decide which applies to highway construction. This feature provides a structured comparison panel and the complete "allied standards ecosystem" table for any primary recommendation.

---

## DESIGN (SIH Color System)

- Primary recommendation column: `--collapse-cobalt: #1B4FE0` border/accent
- Alternative recommendation columns: `--superposition-violet: #6E5AD6` border/accent
- Withdrawn standard column: `--error-line: #C23B3B` border
- Conflict row: `--signal-amber: #E0982B` row background
- Font: `JetBrains Mono` for IS numbers, test method codes
- Font: `Literata` for scope text

---

## COMPONENT 1 — `StandardsComparator` (Side-By-Side Table)

### What It Is
A table where each column is one standard (primary or alternative) and each row is a comparable attribute. Rows with conflicting values are highlighted amber.

### Exact JSON Fields Consumed
```json
{
  "primary_recommendation": {
    "is_number": "IS 269:2015",
    "title": "Ordinary Portland Cement — Specification",
    "status": "ACTIVE",
    "year_published": 2015,
    "amendment": "Amendment 1 (2019)",
    "certification": { "mandatory": true, "scheme": "ISI_MARK", "qco_order_name": "Cement (Quality Control) Order 2003" },
    "scope_snippet": "Specifies requirements for OPC in grades 33, 43 and 53.",
    "confidence": 0.94
  },
  "alternative_recommendations": [
    {
      "is_number": "IS 1489 (Part 1):2015",
      "title": "Portland Pozzolana Cement — Fly Ash Based",
      "status": "ACTIVE",
      "year_published": 2015,
      "amendment": null,
      "certification": { "mandatory": true, "scheme": "ISI_MARK", "qco_order_name": "Cement (Quality Control) Order 2003" },
      "scope_snippet": "Covers fly-ash based PPC for general construction. Not recommended for highway wearing courses.",
      "confidence": 0.71,
      "why_not_primary": "Query specifies highway construction where OPC 43/53 is preferred per IRC SP-49."
    }
  ]
}
```

### Comparison Attributes Matrix (hardcoded attribute list, no pipeline needed)
```js
const COMPARISON_ATTRIBUTES = [
  { key: 'status',       label: 'Current Status' },
  { key: 'year_published', label: 'Edition Year' },
  { key: 'amendment',   label: 'Latest Amendment' },
  { key: 'certification.mandatory', label: 'BIS Certification Mandatory?' },
  { key: 'certification.scheme',    label: 'Certification Scheme' },
  { key: 'scope_snippet', label: 'Scope Summary' },
  { key: 'confidence',  label: 'AI Confidence Score', formatter: v => `${(v*100).toFixed(1)}%` },
  { key: 'why_not_primary', label: 'Why Not Primary?' }, // only for alternatives
];

// Deep-key accessor
function getNestedValue(obj, key) {
  return key.split('.').reduce((o, k) => o?.[k], obj);
}
```

### Conflict Detection
```js
function detectConflicts(primary, alternatives, attribute) {
  const primaryVal = getNestedValue(primary, attribute.key);
  return alternatives.some(alt => {
    const altVal = getNestedValue(alt, attribute.key);
    return altVal !== primaryVal && altVal !== undefined && altVal !== null;
  });
}
// Conflict rows get: className="comparison-row conflict" → signal-amber background
```

### Visual Spec
```
┌─────────────────────┬───────────────────────┬───────────────────────────┐
│ Attribute           │ IS 269:2015 [PRIMARY] │ IS 1489 Pt1:2015 [ALT]   │
│                     │ ● Cobalt border       │ ● Violet border           │
├─────────────────────┼───────────────────────┼───────────────────────────┤
│ Status              │ ACTIVE                │ ACTIVE                    │
│ Edition Year        │ 2015                  │ 2015                      │
│ Amendment           │ Amendment 1 (2019)    │ None                      │  ← amber conflict row
│ BIS Mandatory?      │ YES                   │ YES                       │
│ Certification Scheme│ ISI Mark              │ ISI Mark                  │
│ AI Confidence       │ 94.0%                 │ 71.0%                     │  ← amber conflict row
│ Why Not Primary?    │ —                     │ "Highway → OPC preferred" │
└─────────────────────┴───────────────────────┴───────────────────────────┘
```

---

## COMPONENT 2 — `AlliedStandardsMatrix` (Ecosystem Table)

### What It Is
A grouped table showing all related standards: test methods, complementary standards, superseded ancestors, and normative references — organized in clearly labeled sections.

### Exact JSON Fields Consumed
```json
{
  "primary_recommendation": {
    "is_number": "IS 269:2015",
    "allied_standards": {
      "test_methods": [
        { "is_number": "IS 4031 (Part 1)", "title": "Fineness of Cement", "status": "ACTIVE", "purpose": "Required for IS 269 conformance testing" },
        { "is_number": "IS 4031 (Part 5)", "title": "Soundness", "status": "ACTIVE", "purpose": "Soundness testing" },
        { "is_number": "IS 4031 (Part 6)", "title": "Compressive Strength", "status": "ACTIVE", "purpose": "Strength grade verification" }
      ],
      "complementary": [
        { "is_number": "IS 456:2000", "title": "Plain and Reinforced Concrete", "status": "ACTIVE", "purpose": "Design standard that references IS 269" }
      ],
      "superseded": [
        { "is_number": "IS 8112:1989", "title": "43 Grade OPC (withdrawn)", "status": "WITHDRAWN", "purpose": "Historical reference — DO NOT cite in tenders" }
      ],
      "normative_references": [
        { "is_number": "IS 3812 (Part 1):2003", "title": "Fly Ash — cement grades", "status": "ACTIVE", "purpose": "Supplementary cementitious material spec" }
      ]
    }
  }
}
```

### Grouping & Rendering
```js
const ALLIED_GROUPS = [
  { key: 'test_methods',        label: 'Required Test Methods',     icon: '🧪' },
  { key: 'complementary',       label: 'Complementary Standards',   icon: '📋' },
  { key: 'superseded',          label: 'Withdrawn Predecessors',    icon: '🚫' },
  { key: 'normative_references',label: 'Normative References',      icon: '🔗' },
];

// Withdrawn rows get: background: var(--error-line) 10% opacity + strikethrough on IS number
```

### Fallback (when `allied_standards` is absent)
```js
// Build a synthetic allied list from test_methods[] if present
function buildFallbackAllied(primaryRec) {
  return {
    test_methods: primaryRec.test_methods?.map(t => ({
      is_number: t.is_number, title: t.standard_title,
      status: 'ACTIVE', purpose: `Required testing per ${primaryRec.is_number}`,
    })) || [],
    complementary: [], superseded: [], normative_references: [],
  };
}
```

---

## COMPONENT 3 — `ConflictResolver` (When Two Standards Apply)

### What It Is
A banner that appears when the `conflict_resolution` field is present. It explains which standard takes precedence and why, in plain language.

### Exact JSON Fields Consumed
```json
{
  "conflict_resolution": {
    "winner": "IS 269:2015",
    "loser": "IS 1489 (Part 1):2015",
    "rule": "IRC SP-49 prescribes OPC-43/53 for highway wearing courses. PPC is excluded from this use case.",
    "confidence_gap": 0.23
  }
}
```

### Render
```jsx
function ConflictResolver({ conflict }) {
  if (!conflict) return null;
  return (
    <div className="conflict-resolver-banner">
      <span className="cr-icon">⚖️</span>
      <div>
        <strong>{conflict.winner}</strong> takes precedence over {conflict.loser}.
        <p className="cr-rule">{conflict.rule}</p>
        <span className="cr-confidence-gap">
          Confidence gap: {(conflict.confidence_gap * 100).toFixed(1)}%
          — {conflict.confidence_gap > 0.20 ? 'Strong preference for winner.' : 'Marginal preference — expert review recommended.'}
        </span>
      </div>
    </div>
  );
}
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── comparison/
        ├── comparisonUtils.js          ← getNestedValue(), detectConflicts(), buildFallbackAllied()
        ├── StandardsComparator.jsx     ← Component 1
        ├── AlliedStandardsMatrix.jsx   ← Component 2
        └── ConflictResolver.jsx        ← Component 3
```

---

## KEY-AND-LOCK WIRING

```js
import cementMock from '../../../../interface/fixtures/cement_mock.json';
const response = cementMock;

<StandardsComparator
  primary={response.primary_recommendation}
  alternatives={response.alternative_recommendations}
/>
<AlliedStandardsMatrix
  allied={response.primary_recommendation.allied_standards
    || buildFallbackAllied(response.primary_recommendation)}
/>
<ConflictResolver conflict={response.conflict_resolution} />
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not build a full diff engine like GitHub
- ❌ Do not pull actual IS document text (no access)
- ❌ Do not import anything from `pipeline/`
