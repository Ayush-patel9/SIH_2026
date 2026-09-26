# Feature 08 — NIT Draft Generator
## Auto-Generated Procurement Clause · BIS Clause Templates · Ministry-Specific Export

---

## WHY THIS EXISTS

An engineer who receives the standard recommendation still has to translate it into a valid NIT (Notice Inviting Tender) clause. This translation is where most errors happen — wrong IS numbers are cited, outdated amendments are referenced, mandatory certification clauses are omitted. This feature auto-generates a complete, legally compliant NIT technical specification clause from the JSON response, ready to paste into GeM or NIC e-Procurement portals.

---

## DESIGN (SIH Color System)

- The output looks like a Government of India memorandum — plain, dense, two-column typography
- `--paper: #EEF0F4` → Document background
- `--void: #0D0F14` → Code/clause box background
- `--ink: #161A22` → Body text (Literata, serif)
- `--collapse-cobalt: #1B4FE0` → Section headers
- `--signal-amber: #E0982B` → Placeholder fields that must be filled by officer
- Font: `Literata` for all clause body text
- Font: `JetBrains Mono` for IS numbers within clause text

---

## COMPONENT 1 — `NITClauseGenerator` (Core Generator)

### What It Is
A card that accepts the standard response JSON and outputs a formatted NIT clause with all legal language pre-filled. Amber `[FILL: ...]` placeholders mark fields the officer must manually supply.

### Exact JSON Fields Consumed
```json
{
  "primary_recommendation": {
    "is_number": "IS 269:2015",
    "title": "Ordinary Portland Cement — Specification",
    "amendment": "Amendment 1 (2019)",
    "certification": {
      "mandatory": true,
      "scheme": "ISI_MARK",
      "qco_order_name": "Cement (Quality Control) Order 2003",
      "registration_number_format": "CM/L-XXXXXXX"
    },
    "test_methods": [
      { "is_number": "IS 4031 (Part 5)", "standard_title": "Soundness Test", "parameter": "soundness" },
      { "is_number": "IS 4031 (Part 6)", "standard_title": "Compressive Strength", "parameter": "strength" }
    ]
  },
  "query_understanding": {
    "product_name": "Ordinary Portland Cement",
    "grade_specification": "43 Grade"
  }
}
```

### Clause Template Engine
```js
function generateNITClause(response, templateType = 'standard_gem') {
  const rec = response.primary_recommendation;
  const query = response.query_understanding;
  const cert = rec.certification;

  const FILL = (text) => `[FILL: ${text}]`;   // amber placeholder marker

  const testMethodLines = (rec.test_methods || [])
    .map(t => `    (${rec.test_methods.indexOf(t) + 1}) ${t.is_number} — ${t.standard_title}`)
    .join('\n');

  const certClause = cert.mandatory
    ? `\nCERTIFICATION REQUIREMENT:\nThe ${query.product_name} shall bear the BIS Standard Mark (ISI Mark / CM/L number) as per the ${cert.qco_order_name}. Bidders shall furnish a valid BIS Licence in the format ${cert.registration_number_format || 'CM/L-XXXXXXX'}. Products without valid BIS licence shall be summarily rejected.\n`
    : `\nCERTIFICATION: Conformity to ${rec.is_number} is mandatory. Third-party test certificates from NABL-accredited laboratories acceptable in lieu of ISI mark.\n`;

  return `
TECHNICAL SPECIFICATION CLAUSE

Procurement Item: ${query.product_name} — ${query.grade_specification || ''}
NIT Number:       ${FILL('NIT Reference Number')}
Ministry/Dept:    ${FILL('Name of Ministry/Department')}
Project:          ${FILL('Project Name and Location')}

1. APPLICABLE STANDARD
   The material shall conform in all respects to:
   ${rec.is_number} — ${rec.title}
   Edition: ${rec.year_published}${rec.amendment ? `, incorporating ${rec.amendment}` : ''}

2. QUALITY REQUIREMENTS
   All physical, chemical, and mechanical properties shall meet the requirements
   specified in ${rec.is_number} as amended from time to time.

3. TESTING REQUIREMENTS
   The following tests shall be conducted by the contractor/supplier at an
   NABL-accredited or BIS-recognized laboratory:
${testMethodLines || `    As specified in ${rec.is_number}`}

   Test certificates shall be furnished for each consignment.

4. ${cert.mandatory ? 'MANDATORY ' : ''}CERTIFICATION REQUIREMENT${cert.mandatory ? '' : ' (VOLUNTARY)'}
${certClause}

5. INSPECTION
   Inspection shall be carried out by ${FILL('Inspecting Officer Name and Designation')}
   or authorized representative of ${FILL('Ministry/Department')} at the
   manufacturer's premises / site of delivery.

6. REJECTION CLAUSE
   Any consignment not conforming to ${rec.is_number} shall be rejected
   at the supplier's cost. Re-testing charges shall be borne by the supplier.

7. REFERENCE DOCUMENTS
   The following documents shall be read in conjunction with this specification:
   - ${rec.is_number} (Primary Standard)
${(rec.test_methods || []).map(t => `   - ${t.is_number} (${t.standard_title})`).join('\n')}

   Note: In case of any ambiguity between this specification and the IS standard,
   the IS standard shall take precedence.

Prepared by AI System: ManakAI (BIS Standards Intelligence Platform)
Recommendation ID: ${response.audit_record?.recommendation_id || 'N/A'}
Timestamp: ${new Date().toISOString()}
This clause must be reviewed by the competent authority before inclusion in any tender.
`.trim();
}
```

---

## COMPONENT 2 — `TemplateSelector` (Ministry-Specific Templates)

### What It Is
A dropdown to select the target procurement portal/ministry, which adjusts the clause format.

### Template Variants
```js
const NIT_TEMPLATES = {
  standard_gem:    { label: 'GeM Portal (Standard)',         format: 'formal_memo' },
  cpwd:            { label: 'CPWD Specification',            format: 'cpwd_format' },
  nic_eprocurement:{ label: 'NIC eProcurement Portal',       format: 'nic_format' },
  roads_highways:  { label: 'MoRTH / NHAI Roads',           format: 'morth_format' },
  defence:         { label: 'DRDO / MoD Procurement',        format: 'defence_format' },
  railways:        { label: 'Indian Railways (IREPS)',        format: 'ireps_format' },
};
```

### CPWD Format Variant Generator
```js
function generateCPWDClause(response) {
  const rec = response.primary_recommendation;
  return `
ITEM: ${response.query_understanding.product_name}
SPECIFICATION: The material shall conform to ${rec.is_number} (${rec.year_published}) and its amendments.
BRAND: ISI Marked only / As approved by Engineer-in-Charge
BIS CERTIFICATION: Mandatory — CM/L Number to be provided
TESTING: As per ${(rec.test_methods || []).map(t => t.is_number).join(', ') || rec.is_number}
INSPECTION: Third party inspection by RITES/BIS as applicable
`.trim();
}
```

---

## COMPONENT 3 — `ClauseEditor` (In-Place Editing of Generated Clause)

### What It Is
A `contenteditable` div (or a `<textarea>`) that displays the generated clause and allows the officer to manually edit it before downloading. Amber placeholder text is highlighted automatically.

```jsx
function ClauseEditor({ clauseText, onChange }) {
  const highlighted = clauseText.replace(
    /\[FILL: ([^\]]+)\]/g,
    '<mark class="fill-placeholder">[$1]</mark>'
  );

  return (
    <div
      className="clause-editor"
      contentEditable
      dangerouslySetInnerHTML={{ __html: highlighted }}
      onInput={(e) => onChange(e.currentTarget.innerText)}
    />
  );
}
```

---

## COMPONENT 4 — `ClauseExport` (Download Options)

### Download as Plain Text
```js
function downloadTXT(clauseText, isNumber) {
  const blob = new Blob([clauseText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NIT_Clause_${isNumber.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
  a.click();
}
```

### Download as Print-Ready HTML (mimics GOI document format)
```js
function downloadPrintableHTML(clauseText, isNumber, auditRecord) {
  const html = `
<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>NIT Clause — ${isNumber}</title>
<style>
  body { font-family: 'Times New Roman', serif; max-width: 720px; margin: 40px auto; font-size: 13pt; line-height: 1.8; }
  h2 { text-align: center; font-size: 14pt; border-bottom: 2px solid black; padding-bottom: 6px; }
  mark.fill-placeholder { background: #FFF3CD; border: 1px dashed #E0982B; padding: 0 2px; font-style: italic; }
  .footer { margin-top: 40px; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
</style>
</head><body>
<h2>Technical Specification Clause</h2>
<pre style="font-family: inherit; white-space: pre-wrap;">${clauseText}</pre>
<div class="footer">
  Generated by ManakAI | Recommendation ID: ${auditRecord?.recommendation_id || 'N/A'} | ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
</div>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NIT_Clause_${isNumber.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  a.click();
}
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── nitGenerator/
        ├── clauseTemplates.js       ← generateNITClause(), generateCPWDClause(), NIT_TEMPLATES
        ├── clauseExport.js          ← downloadTXT(), downloadPrintableHTML()
        ├── NITClauseGenerator.jsx   ← Component 1 (main generator)
        ├── TemplateSelector.jsx     ← Component 2
        ├── ClauseEditor.jsx         ← Component 3
        └── ClauseExport.jsx         ← Component 4
```

---

## KEY-AND-LOCK WIRING

```js
import cementMock from '../../../../interface/fixtures/cement_mock.json';
const response = cementMock;

const [template, setTemplate] = useState('standard_gem');
const [clauseText, setClauseText] = useState(() => generateNITClause(response, template));

<TemplateSelector templates={NIT_TEMPLATES} selected={template}
  onChange={(t) => { setTemplate(t); setClauseText(generateNITClause(response, t)); }} />
<ClauseEditor clauseText={clauseText} onChange={setClauseText} />
<ClauseExport
  onTXT={() => downloadTXT(clauseText, response.primary_recommendation.is_number)}
  onHTML={() => downloadPrintableHTML(clauseText, response.primary_recommendation.is_number, response.audit_record)}
/>
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not use any PDF library (pdfmake, jsPDF) — print-to-PDF from browser is sufficient
- ❌ Do not call any document generation API
- ❌ Do not import anything from `pipeline/`
