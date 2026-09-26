# Feature 07 — Query Understanding & Intent Disambiguation
## Entity Extraction Display · Disambiguation Prompts · Intent Classifier UI

---

## WHY THIS EXISTS

"I need cement standard for bridges" is a valid procurement query. But it is ambiguous — is this for bridge deck wearing course (highway, OPC 53), bridge piers (structural, M30 concrete), or bridge expansion joints (polymer-modified bitumen, completely different IS)? If the system makes a wrong assumption silently, the officer gets the wrong standard. This feature shows the user **exactly what the system understood** about their query and lets them correct it before the recommendation is finalized.

---

## DESIGN (SIH Color System)

- `--collapse-cobalt: #1B4FE0` → High-confidence entities (confidence ≥ 0.90)
- `--superposition-violet: #6E5AD6` → Medium-confidence entities (0.70–0.89)
- `--signal-amber: #E0982B` → Low-confidence entities (< 0.70), disambiguation needed
- `--error-line: #C23B3B` → Entity that was corrected by user
- Font: `JetBrains Mono` for entity tags, entity types, IS numbers
- Chip/pill style entity rendering (like database query visualization)

---

## COMPONENT 1 — `QueryEntityDisplay` (Parsed Query Visualization)

### What It Is
Below the query input, the system displays the extracted entities from the query as labeled chips. Each chip shows: entity text, entity type, and a confidence dot.

### Exact JSON Fields Consumed
```json
{
  "query_understanding": {
    "original_text": "43 grade OPC cement for highway construction in Rajasthan",
    "product_name": "Ordinary Portland Cement",
    "grade_specification": "43 Grade",
    "domain": "construction",
    "subdomain": "highway",
    "product_codes": ["OPC", "43G"],
    "location_context": "Rajasthan",
    "confidence": 0.95,
    "ambiguity_flags": []
  }
}
```

### Entity Type → Label + Color Map (hardcoded, no pipeline needed)
```js
const ENTITY_TYPE_STYLES = {
  product_name:       { label: 'PRODUCT',     color: 'var(--collapse-cobalt)' },
  grade_specification:{ label: 'GRADE',        color: 'var(--collapse-cobalt)' },
  domain:             { label: 'DOMAIN',       color: 'var(--superposition-violet)' },
  subdomain:          { label: 'SUBDOMAIN',    color: 'var(--superposition-violet)' },
  location_context:   { label: 'LOCATION',     color: 'var(--ink-muted)' },
  product_codes:      { label: 'CODE',         color: 'var(--collapse-cobalt)' },
  ambiguous:          { label: '? AMBIGUOUS',  color: 'var(--signal-amber)' },
};

function buildEntityChips(queryUnderstanding) {
  const chips = [];
  const fields = ['product_name','grade_specification','domain','subdomain','location_context'];
  fields.forEach(field => {
    if (queryUnderstanding[field]) {
      chips.push({
        text: queryUnderstanding[field],
        type: field,
        confidence: queryUnderstanding.confidence || 1.0,
        ...ENTITY_TYPE_STYLES[field],
      });
    }
  });
  (queryUnderstanding.product_codes || []).forEach(code => {
    chips.push({ text: code, type: 'product_codes', ...ENTITY_TYPE_STYLES.product_codes, confidence: 1.0 });
  });
  return chips;
}
```

### Visual Spec
```
SYSTEM UNDERSTOOD:
┌──────────────────────────────────────────────────────────────────┐
│ [PRODUCT: Ordinary Portland Cement] [GRADE: 43 Grade] [DOMAIN: construction] │
│ [SUBDOMAIN: highway] [LOCATION: Rajasthan] [CODE: OPC] [CODE: 43G]           │
└──────────────────────────────────────────────────────────────────┘
Overall Confidence: ●●●●○  95%
```

---

## COMPONENT 2 — `AmbiguityCard` (Disambiguation Request)

### What It Is
When `ambiguity_flags` contains items, a card appears above the recommendation requesting the user to clarify. The card presents the ambiguous dimension and offers 2-4 radio button options.

### Exact JSON Fields Consumed
```json
{
  "query_understanding": {
    "ambiguity_flags": [
      {
        "dimension": "subdomain",
        "message": "For bridges: is this for the deck wearing course, structural piers, or approach road?",
        "options": [
          { "value": "highway_wearing_course", "label": "Bridge Deck / Wearing Course" },
          { "value": "structural_pier",        "label": "Structural Piers / Columns" },
          { "value": "approach_road",          "label": "Approach Road" }
        ]
      }
    ]
  }
}
```

### Component
```jsx
function AmbiguityCard({ flag, onResolve }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="ambiguity-card">
      <div className="amb-header">
        <span className="amb-icon">⚠️</span>
        <span className="amb-label">DISAMBIGUATION REQUIRED</span>
      </div>
      <p className="amb-message">{flag.message}</p>
      <div className="amb-options">
        {flag.options.map(opt => (
          <label key={opt.value} className={`amb-radio-label ${selected === opt.value ? 'selected' : ''}`}>
            <input
              type="radio"
              name={flag.dimension}
              value={opt.value}
              onChange={() => setSelected(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <button
        className="btn-run"
        disabled={!selected}
        onClick={() => onResolve(flag.dimension, selected)}
      >
        Refine Recommendation →
      </button>
    </div>
  );
}
```

### Resolution Handler
```js
// When user resolves an ambiguity, build a refined QueryRequest
function buildRefinedQuery(originalQuery, dimension, resolvedValue) {
  return {
    ...originalQuery,
    query_understanding: {
      ...originalQuery.query_understanding,
      [dimension]: resolvedValue,
      ambiguity_flags: originalQuery.query_understanding.ambiguity_flags
        .filter(f => f.dimension !== dimension),
    }
  };
}
// In mock mode: re-run through the adapter with the new query
// When pipeline is live: re-POST to /api/query with the refined parameters
```

---

## COMPONENT 3 — `IntentClassifierBadge` (Mode Indicator)

### What It Is
A small badge in the top-right of the query input that shows what mode the system interpreted the query as.

### Exact JSON Fields Consumed
```json
{
  "meta": {
    "mode": "recommend"
  }
}
```

### Mode Map
```js
const MODE_BADGES = {
  recommend:    { label: 'RECOMMEND', color: 'var(--collapse-cobalt)', icon: '🎯' },
  compare:      { label: 'COMPARE',   color: 'var(--superposition-violet)', icon: '⚖️' },
  validate:     { label: 'VALIDATE',  color: 'var(--signal-amber)', icon: '✓' },
  search:       { label: 'SEARCH',    color: 'var(--ink-secondary)', icon: '🔍' },
};
```

---

## COMPONENT 4 — `QueryCorrectionForm` (Manual Override Panel)

### What It Is
A collapsible panel that allows the user to manually override any extracted entity. Useful when the pipeline misidentifies the product or grade.

### Override Fields
```
Product Name   [text input, default: query_understanding.product_name]
Grade          [text input, default: query_understanding.grade_specification]
Domain         [dropdown: construction | electronics | textiles | food | chemicals]
Subdomain      [text input]
```

### On Submit
```js
// Rebuilds the query_understanding object with manual overrides
// Re-runs the adapter with the corrected understanding
// Shows the updated reasoning_trace explaining that it used user-corrected entities
function applyQueryCorrection(response, corrections) {
  return {
    ...response,
    query_understanding: {
      ...response.query_understanding,
      ...corrections,
      ambiguity_flags: [], // cleared because user manually resolved
      confidence: 1.0,     // user-override is treated as 100% confident
    }
  };
}
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── queryUnderstanding/
        ├── entityUtils.js              ← buildEntityChips(), ENTITY_TYPE_STYLES
        ├── refinedQueryBuilder.js      ← buildRefinedQuery(), applyQueryCorrection()
        ├── QueryEntityDisplay.jsx      ← Component 1
        ├── AmbiguityCard.jsx           ← Component 2
        ├── IntentClassifierBadge.jsx   ← Component 3
        └── QueryCorrectionForm.jsx     ← Component 4
```

---

## KEY-AND-LOCK WIRING

```js
import cementMock from '../../../../interface/fixtures/cement_mock.json';
const response = cementMock;

const entities = buildEntityChips(response.query_understanding);

<IntentClassifierBadge mode={response.meta.mode} />
<QueryEntityDisplay chips={entities} confidence={response.query_understanding.confidence} />
{response.query_understanding.ambiguity_flags?.map(flag => (
  <AmbiguityCard key={flag.dimension} flag={flag} onResolve={handleAmbiguityResolution} />
))}
<QueryCorrectionForm understanding={response.query_understanding} onCorrect={handleCorrection} />
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not build a real NLP/NER pipeline
- ❌ Do not call any external NLP API
- ❌ Do not import anything from `pipeline/`
