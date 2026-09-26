# Feature 05 — Multi-Lingual & Domain-Switched Output
## Hinglish Mode · Domain Presets · Custom Query Rewriter

---

## WHY THIS EXISTS

A junior engineer at a UP State PWD office does not write his NIT in English. He queries in Hinglish: "cement ke liye konsa BIS standard use karna chahiye highway mein?" The system must understand and respond. Equally, a BIS Technical Committee member queries in highly technical English with specific product codes. These two users need different output formats from the same JSON response.

---

## DESIGN (SIH Color System)

- `--paper: #EEF0F4` + `--ink: #161A22` → Default output
- `--superposition-violet: #6E5AD6` → Active language mode pill
- Font: `Literata` for all output text (works equally for English and Devanagari glyphs)
- No special icons needed — the language toggle is a clean pill selector

---

## COMPONENT 1 — `LanguageModeSelector` (Header Toggle)

### What It Is
A compact row of pills showing available output modes. Selecting one re-renders the main result area using the selected mode's output strategy.

### Available Modes
```js
const LANGUAGE_MODES = [
  { id: 'formal_english',  label: 'English (Formal)',   flag: '🇬🇧' },
  { id: 'hinglish',        label: 'Hinglish',           flag: '🇮🇳' },
  { id: 'hindi_devanagari',label: 'हिन्दी',              flag: '🇮🇳' },
  { id: 'technical_code',  label: 'Technical (Codes)',  flag: '📋' },
];
```

### Exact JSON Fields Consumed
```json
{
  "multi_lingual_support": {
    "detected_language": "hinglish",
    "output_language": "hinglish",
    "translated_explanation": "IS 269:2015 43-grade cement ke liye sahi standard hai. Purana IS 8112:1989 2015 mein band ho gaya. BIS ISI mark lena kanoon ke anusaar zaruri hai.",
    "formal_english_explanation": "IS 269:2015 is the applicable standard for 43 grade Ordinary Portland Cement. IS 8112:1989 was withdrawn in 2015. BIS ISI certification is mandatory under the Cement QCO 2003."
  }
}
```

### Mode Selection + Display Logic
```js
function getDisplayText(response, selectedMode) {
  const multi = response.multi_lingual_support;
  switch(selectedMode) {
    case 'hinglish':
      return multi?.translated_explanation || synthesizeHinglish(response);
    case 'formal_english':
      return multi?.formal_english_explanation || synthesizeEnglish(response);
    case 'hindi_devanagari':
      return multi?.translated_explanation || '[Hindi translation pending pipeline]';
    case 'technical_code':
      return synthesizeTechnicalCode(response);
    default:
      return multi?.formal_english_explanation;
  }
}
```

---

## COMPONENT 2 — Fallback Synthesizers (JSON-only, no translation API needed)

### `synthesizeEnglish(response)` — Always buildable from schema
```js
function synthesizeEnglish(response) {
  const rec = response.primary_recommendation;
  const cert = rec.certification;
  const query = response.query_understanding;

  const lines = [
    `For ${query.product_name} (${query.grade_specification || 'standard grade'}) in the domain of ${query.domain || 'general use'}:`,
    ``,
    `The applicable standard is **${rec.is_number}** — ${rec.title}.`,
    `Status: ${rec.status} | Year: ${rec.year_published}${rec.amendment ? ` | ${rec.amendment}` : ''}.`,
    ``,
    cert.mandatory
      ? `⚖️ BIS ${cert.scheme.replace(/_/g, ' ')} certification is MANDATORY under ${cert.qco_order_name}.`
      : `Certification under this standard is voluntary.`,
    ``,
    `Scope: ${rec.scope_snippet}`,
    ``,
    rec.test_methods?.length
      ? `Required test methods: ${rec.test_methods.map(t => t.is_number).join(', ')}`
      : '',
  ].filter(Boolean);

  return lines.join('\n');
}
```

### `synthesizeHinglish(response)` — Templated Hinglish
```js
function synthesizeHinglish(response) {
  const rec = response.primary_recommendation;
  const cert = rec.certification;
  const query = response.query_understanding;

  return [
    `${query.product_name} ke liye sahi BIS standard **${rec.is_number}** hai — "${rec.title}".`,
    ``,
    `Is standard ki status: ${rec.status === 'ACTIVE' ? 'ACTIVE (current mein valid hai)' : rec.status}.`,
    ``,
    cert.mandatory
      ? `⚖️ ${cert.qco_order_name} ke anusaar BIS ISI/CRS mark lena kanoon ke anusaar zaruri hai.`
      : `Is standard ke liye certification voluntary hai.`,
    ``,
    `Scope: ${rec.scope_snippet}`,
  ].join('\n');
}
```

### `synthesizeTechnicalCode(response)` — Machine-Readable Summary
```js
function synthesizeTechnicalCode(response) {
  const rec = response.primary_recommendation;
  return [
    `STD:    ${rec.is_number}`,
    `TITLE:  ${rec.title}`,
    `STATUS: ${rec.status}`,
    `YEAR:   ${rec.year_published}`,
    `AMD:    ${rec.amendment || 'None'}`,
    `CERT:   ${rec.certification.mandatory ? rec.certification.scheme : 'VOLUNTARY'}`,
    `QCO:    ${rec.certification.qco_order_name || 'N/A'}`,
    `CONF:   ${(rec.confidence * 100).toFixed(1)}%`,
  ].join('\n');
}
```

---

## COMPONENT 3 — `DomainPresetBar` (Quick Query Prefiller)

### What It Is
A row of domain preset buttons. Clicking one pre-fills the query input with a domain-specific example query and sets the domain filter automatically.

### Exact JSON Fields Consumed
```json
{
  "query_understanding": {
    "domain": "construction",
    "subdomain": "cement",
    "product_name": "Ordinary Portland Cement",
    "grade_specification": "43 Grade"
  }
}
```

### Preset Definitions
```js
const DOMAIN_PRESETS = [
  {
    id: 'cement',
    label: 'Cement & Concrete',
    icon: '🏗️',
    query: 'Which BIS standard applies to 43 grade OPC for highway construction?',
    domain: 'construction',
    subdomain: 'cement',
  },
  {
    id: 'steel',
    label: 'Steel / TMT',
    icon: '⚙️',
    query: 'TMT bars Fe 500D grade for RCC bridge — applicable IS standard?',
    domain: 'construction',
    subdomain: 'steel',
  },
  {
    id: 'electronics',
    label: 'Electronics / CRS',
    icon: '📺',
    query: 'LED lights for government office — which BIS CRS standard applies?',
    domain: 'electronics',
    subdomain: 'lighting',
  },
  {
    id: 'textiles',
    label: 'Textiles',
    icon: '🧵',
    query: 'Cotton drill fabric for uniforms — applicable BIS standard?',
    domain: 'textiles',
    subdomain: 'fabric',
  },
  {
    id: 'food',
    label: 'Food Safety',
    icon: '🥛',
    query: 'Packaged drinking water for government canteen — IS standard?',
    domain: 'food',
    subdomain: 'beverages',
  },
];
```

---

## COMPONENT 4 — `DetectedLanguageBanner` (Auto-Detection Indicator)

### What It Is
A small banner above the query input that appears when the pipeline detects a non-English query, showing the detected language and offering to switch the output mode automatically.

### Exact JSON Fields Consumed
```json
{
  "multi_lingual_support": {
    "detected_language": "hinglish"
  }
}
```

### Logic
```js
function DetectedLanguageBanner({ detectedLanguage, onAccept }) {
  if (!detectedLanguage || detectedLanguage === 'formal_english') return null;

  const LANG_LABELS = {
    hinglish: 'Hinglish',
    hindi_devanagari: 'Hindi (Devanagari)',
  };

  return (
    <div className="detected-language-banner">
      <span className="dli-icon">🌐</span>
      <span>Query detected as <strong>{LANG_LABELS[detectedLanguage]}</strong>.</span>
      <button onClick={onAccept}>Show output in {LANG_LABELS[detectedLanguage]}</button>
      <button onClick={() => onAccept('formal_english')}>Keep English</button>
    </div>
  );
}
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── multilingual/
        ├── textSynthesizers.js         ← synthesizeEnglish(), synthesizeHinglish(), synthesizeTechnicalCode()
        ├── languageModes.js            ← LANGUAGE_MODES constant, getDisplayText()
        ├── domainPresets.js            ← DOMAIN_PRESETS constant
        ├── LanguageModeSelector.jsx    ← Component 1
        ├── DomainPresetBar.jsx         ← Component 3
        └── DetectedLanguageBanner.jsx  ← Component 4
```

---

## KEY-AND-LOCK WIRING

```js
import cementMock from '../../../../interface/fixtures/cement_mock.json';
const response = cementMock;

const [selectedMode, setSelectedMode] = useState(
  response.multi_lingual_support?.detected_language || 'formal_english'
);
const displayText = getDisplayText(response, selectedMode);

<DetectedLanguageBanner
  detectedLanguage={response.multi_lingual_support?.detected_language}
  onAccept={setSelectedMode}
/>
<LanguageModeSelector modes={LANGUAGE_MODES} selected={selectedMode} onChange={setSelectedMode} />
<DomainPresetBar presets={DOMAIN_PRESETS} onSelect={(preset) => { setQuery(preset.query); }} />
<pre className="output-text">{displayText}</pre>
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not integrate a real translation API (Google Translate, DeepL, etc.)
- ❌ Do not build Devanagari font loading — Literata already handles it
- ❌ Do not import anything from `pipeline/`
