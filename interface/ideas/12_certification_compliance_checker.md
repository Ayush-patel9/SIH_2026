# Feature 12 — Certification Compliance Checker
## BIS ISI / CRS Checker · QCO Order Validator · Multi-Product Batch Audit

---

## WHY THIS EXISTS

A ministry may receive 40 bids for a hardware tender. Each bid claims to have BIS certification. Manually cross-referencing 40 CM/L numbers or R-numbers against the BIS website is a full day's work. This feature provides a **batch compliance checker** — paste in a list of products, IS numbers, and claimed certification numbers, and get a traffic-light compliance audit in seconds — powered purely by the JSON contract data and the local `STANDARDS_CATALOG`.

---

## DESIGN (SIH Color System)

- `--collapse-cobalt: #1B4FE0` → COMPLIANT
- `--signal-amber: #E0982B` → CONDITIONALLY COMPLIANT (needs amendment update)
- `--error-line: #C23B3B` → NON-COMPLIANT / WITHDRAWN STANDARD / MISSING CERT
- `--ink-muted: #8890A0` → UNKNOWN (insufficient data)
- Font: `JetBrains Mono` for CM/L numbers, R-numbers, IS codes
- Clean table layout — each row is one product/bidder

---

## COMPONENT 1 — `BatchComplianceInput` (Paste or Upload)

### What It Is
A textarea where the user pastes a table of products (or imports a CSV). Each line is: `product_name | is_number | certification_number | bidder_name`.

```jsx
function BatchComplianceInput({ onParse }) {
  const [text, setText] = useState('');

  const EXAMPLE = [
    'OPC 43 Grade Cement     | IS 269:2015       | CM/L-1234567  | Ultratech Ltd.',
    'TMT Fe 500D Bars        | IS 1786:2008      | CM/L-8876543  | SAIL',
    'LED Lights 36W          | IS 10322 Pt 5     | R-41029834    | Crompton Greaves',
    'MS Steel Angles         | IS 2062:2011      |               | ABC Traders',  // Missing cert
    '43G OPC Cement          | IS 8112:1989      | CM/L-9991111  | XYZ Cement',   // Withdrawn IS
  ].join('\n');

  function parseBatch(rawText) {
    return rawText.trim().split('\n')
      .filter(line => line.trim())
      .map((line, i) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `bid-${i + 1}`,
          product_name: parts[0] || `Item ${i + 1}`,
          is_number:    parts[1] || '',
          cert_number:  parts[2] || '',
          bidder_name:  parts[3] || `Bidder ${i + 1}`,
        };
      });
  }

  return (
    <div className="batch-input-container">
      <div className="section-label">PASTE BID LIST (pipe-separated)</div>
      <textarea
        className="batch-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={EXAMPLE}
        rows={8}
      />
      <div className="batch-input-actions">
        <button className="btn-run" onClick={() => onParse(parseBatch(text))}>
          Run Compliance Check →
        </button>
        <button className="btn-secondary" onClick={() => setText(EXAMPLE)}>
          Load Example
        </button>
        <CSVImportButton onParsed={onParse} />
      </div>
    </div>
  );
}
```

---

## COMPONENT 2 — `ComplianceEngine` (Checker Logic)

### Core Check Function
```js
import { STANDARDS_CATALOG } from '../mcp_server/tools/status_checker'; // reuse the catalog

function CERT_FORMAT_VALIDATORS() {
  return {
    ISI_MARK: /^CM\/L-\d{7}$/i,
    CRS:      /^R-\d{8}$/i,
    ISI_OR_CRS: /^(CM\/L-\d{7}|R-\d{8})$/i,
  };
}

function checkBidCompliance(bid) {
  const result = {
    ...bid,
    status: 'UNKNOWN',
    reasons: [],
    severity: 'unknown',
  };

  // Step 1: Look up the IS number in our catalog
  const catalog = STANDARDS_CATALOG;
  const stdEntry = Object.values(catalog).find(s =>
    s.is_number === bid.is_number ||
    s.is_number.includes(bid.is_number) ||
    bid.is_number.includes(s.is_number.replace(/\s/g, ''))
  );

  if (!stdEntry) {
    result.status = 'UNKNOWN';
    result.reasons.push(`IS number '${bid.is_number}' not found in local catalog — verify manually at BIS website.`);
    result.severity = 'unknown';
    return result;
  }

  // Step 2: Check if standard is WITHDRAWN
  if (stdEntry.status === 'WITHDRAWN') {
    result.status = 'NON_COMPLIANT';
    result.severity = 'critical';
    result.reasons.push(`WITHDRAWN: ${bid.is_number} was withdrawn. ${stdEntry.replaced_by ? `Use ${stdEntry.replaced_by} instead.` : ''}`);
    return result;
  }

  // Step 3: Check if certification is mandatory
  const certRequired = stdEntry.certification?.mandatory;
  const expectedScheme = stdEntry.certification?.scheme;

  if (certRequired) {
    const validators = CERT_FORMAT_VALIDATORS();
    const validator = validators[expectedScheme];

    if (!bid.cert_number) {
      result.status = 'NON_COMPLIANT';
      result.severity = 'critical';
      result.reasons.push(`Missing BIS certification number. ${expectedScheme} is mandatory under ${stdEntry.certification.qco_order_name}.`);
      return result;
    }

    if (validator && !validator.test(bid.cert_number)) {
      result.status = 'NON_COMPLIANT';
      result.severity = 'high';
      result.reasons.push(`Invalid certification number format. Expected: ${expectedScheme} format. Got: ${bid.cert_number}`);
      return result;
    }
  }

  // Step 4: Check amendment currency (if amendment listed in catalog)
  if (stdEntry.amendment) {
    result.reasons.push(`Note: Latest amendment is ${stdEntry.amendment} — verify bidder product was tested against current amendment.`);
    result.status = 'CONDITIONALLY_COMPLIANT';
    result.severity = 'medium';
  } else {
    result.status = 'COMPLIANT';
    result.severity = 'ok';
  }

  result.matched_catalog_entry = stdEntry.is_number;
  return result;
}

export function runBatchCompliance(bids) {
  return bids.map(checkBidCompliance);
}
```

---

## COMPONENT 3 — `ComplianceResultTable` (Traffic Light Table)

### Visual Spec
```
┌────┬──────────────────────┬──────────────────┬─────────────────┬─────────┬──────────────────────────────┐
│ #  │ Bidder               │ IS Number        │ Cert Number     │ STATUS  │ Reasons                      │
├────┼──────────────────────┼──────────────────┼─────────────────┼─────────┼──────────────────────────────┤
│ 01 │ Ultratech Ltd.       │ IS 269:2015      │ CM/L-1234567    │ ✅ OK   │ Amendment 1 note             │
│ 02 │ SAIL                 │ IS 1786:2008     │ CM/L-8876543    │ ⚠️ COND │ Amendment 3 verify           │
│ 03 │ Crompton Greaves     │ IS 10322 Pt 5    │ R-41029834      │ ✅ OK   │ —                            │
│ 04 │ ABC Traders          │ IS 2062:2011     │ (missing)       │ 🔴 FAIL │ ISI Mark mandatory — missing │
│ 05 │ XYZ Cement           │ IS 8112:1989     │ CM/L-9991111    │ 🔴 FAIL │ WITHDRAWN — use IS 269:2015  │
└────┴──────────────────────┴──────────────────┴─────────────────┴─────────┴──────────────────────────────┘
```

```jsx
const STATUS_CONFIG = {
  COMPLIANT:              { icon: '✅', label: 'COMPLIANT',   color: 'var(--collapse-cobalt)',      className: 'status-ok' },
  CONDITIONALLY_COMPLIANT:{ icon: '⚠️', label: 'VERIFY',      color: 'var(--signal-amber)',          className: 'status-conditional' },
  NON_COMPLIANT:          { icon: '🔴', label: 'NON-COMPLIANT',color: 'var(--error-line)',           className: 'status-fail' },
  UNKNOWN:                { icon: '❓', label: 'UNKNOWN',     color: 'var(--ink-muted)',             className: 'status-unknown' },
};
```

---

## COMPONENT 4 — `ComplianceSummaryBanner` (Top Summary)

```jsx
function ComplianceSummaryBanner({ results }) {
  const counts = {
    ok:          results.filter(r => r.status === 'COMPLIANT').length,
    conditional: results.filter(r => r.status === 'CONDITIONALLY_COMPLIANT').length,
    fail:        results.filter(r => r.status === 'NON_COMPLIANT').length,
    unknown:     results.filter(r => r.status === 'UNKNOWN').length,
  };
  const total = results.length;
  const failRate = (counts.fail / total * 100).toFixed(1);

  return (
    <div className="compliance-summary-banner">
      <span className="cs-stat cs-ok">{counts.ok} Compliant</span>
      <span className="cs-stat cs-conditional">{counts.conditional} Needs Verification</span>
      <span className="cs-stat cs-fail">{counts.fail} Non-Compliant ({failRate}%)</span>
      <span className="cs-stat cs-unknown">{counts.unknown} Unknown</span>
      {counts.fail > 0 && (
        <span className="cs-action-needed">
          ⚠ {counts.fail} bid{counts.fail > 1 ? 's' : ''} must be rejected pending compliance.
        </span>
      )}
    </div>
  );
}
```

---

## COMPONENT 5 — `ComplianceExport` (Evaluation Sheet Download)

```js
function exportComplianceReport(results, tenderRef = '') {
  const lines = [
    [`ManakAI Compliance Audit Report — ${tenderRef}`, `Generated: ${new Date().toLocaleString('en-IN')}`],
    [],
    ['#', 'Bidder', 'IS Number', 'Cert Number', 'Status', 'Reasons'],
    ...results.map((r, i) => [
      i + 1,
      r.bidder_name,
      r.is_number,
      r.cert_number || '(missing)',
      r.status,
      r.reasons.join(' | '),
    ]),
    [],
    ['SUMMARY'],
    ['Compliant', results.filter(r => r.status === 'COMPLIANT').length],
    ['Needs Verification', results.filter(r => r.status === 'CONDITIONALLY_COMPLIANT').length],
    ['Non-Compliant', results.filter(r => r.status === 'NON_COMPLIANT').length],
  ];
  const csv = lines.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Compliance_Audit_${tenderRef || 'report'}.csv`;
  a.click();
}
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── complianceChecker/
        ├── complianceEngine.js         ← checkBidCompliance(), runBatchCompliance(), CERT_FORMAT_VALIDATORS
        ├── BatchComplianceInput.jsx    ← Component 1 (paste/upload input)
        ├── ComplianceResultTable.jsx   ← Component 3 (traffic light table)
        ├── ComplianceSummaryBanner.jsx ← Component 4 (summary stats)
        └── ComplianceExport.jsx        ← Component 5 (CSV download)
```

---

## KEY-AND-LOCK WIRING

```js
// This feature is entirely self-contained — it doesn't need a StandardsResponse
// It only needs: the STANDARDS_CATALOG (static, from MCP server module)
// and the user's paste/CSV input

const [bids, setBids] = useState([]);
const [results, setResults] = useState([]);

function handleCheck(parsedBids) {
  setBids(parsedBids);
  setResults(runBatchCompliance(parsedBids));
}

<BatchComplianceInput onParse={handleCheck} />
{results.length > 0 && (
  <>
    <ComplianceSummaryBanner results={results} />
    <ComplianceResultTable results={results} />
    <ComplianceExport results={results} />
  </>
)}
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not call the BIS CONNECT portal API (requires government login)
- ❌ Do not scrape the BIS certificate database
- ❌ Do not import anything from `pipeline/`
- ❌ Do not implement certificate image OCR
