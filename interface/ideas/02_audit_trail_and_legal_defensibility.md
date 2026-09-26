# Feature 02 — Audit Trail & Legal Defensibility
## Cryptographic Logging · RTI / CVC Defense Certificate · Version Snapshot

---

## WHY THIS EXISTS

Every recommendation the system gives is a **government act**. If a CVC inquiry or an RTI request asks "why was IS 269:2015 specified instead of IS 1489?", the system must produce a timestamped, tamper-evident record of exactly what was returned, the version of the standard at that moment, and the officer's identity. Without this, the entire system is legally indefensible.

This feature builds a complete **audit vault** — capturing every query in a machine-signed record, allowing download as a verifiable PDF certificate, and providing a public hash-verification portal.

---

## DESIGN PRINCIPLE (SIH Color System)

- `--collapse-cobalt: #1B4FE0` → Logged / verified state indicators
- `--error-line: #C23B3B` → Hash mismatch / tampering detected
- `--signal-amber: #E0982B` → Dry-run records (not entered into official trail)
- `--ink: #161A22` → Certificate body text
- `--paper: #EEF0F4` → Certificate background
- `--void: #0D0F14` → Hash display block (monospace on dark)
- Font: `JetBrains Mono` for all hash values, timestamps, IDs
- Font: `Literata` for certificate body and officer declaration text

No glow effects on audit certificates. Pure government-document aesthetic.

---

## WHAT YOU BUILD (JSON-ONLY)

---

## COMPONENT 1 — `AuditLogEntry` (Session Record Card)

### What It Is
A compact card displayed in the "Session History" sidebar. Each card shows the query, timestamp, primary standard recommended, and audit hash — with a copy-to-clipboard button and a "View Certificate" button.

### Exact JSON Fields Consumed
```json
{
  "audit_record": {
    "recommendation_id": "rec-6d2f-48e2-b184",
    "query_id": "uuid-9f8a-4b2c-11e9",
    "timestamp": "2026-09-26T10:00:01Z",
    "standards_version_snapshot": {
      "IS 269:2015": {
        "status_at_query_time": "ACTIVE",
        "amendment_at_query_time": "Amendment 1 (2019)"
      }
    },
    "audit_hash": "e3b0c44298fc1c149afbf4c8996fb924",
    "logged": true,
    "dry_run": false,
    "rti_exportable": true
  },
  "meta": {
    "query_id": "uuid-9f8a-4b2c-11e9",
    "timestamp": "2026-09-26T10:00:01Z",
    "mode": "recommend"
  }
}
```

### Visual Spec
```
┌─────────────────────────────────────────────────────────────┐
│ ● LOGGED   [recommend]                  26 Sep 2026, 10:00  │  ← cobalt dot + timestamp
│ "Procurement of 43 grade OPC for highway..."                │
│                                                             │
│ Primary: IS 269:2015 (ACTIVE at query time)                 │
│                                                             │
│ AUDIT HASH                                                  │
│ ┌─ void box ──────────────────────────────────────────┐    │
│ │ e3b0c442...7852b855                 [Copy] [Verify] │    │
│ └──────────────────────────────────────────────────────┘    │
│                                          [View Certificate] │
└─────────────────────────────────────────────────────────────┘
```

### Dry-Run State Variant
```
┌─────────────────────────────────────────────────────────────┐
│ ◌ DRAFT / NOT LOGGED   [dry_run]        26 Sep 2026, 10:15  │  ← amber hollow dot
│ "Draft highway bridge cement spec..."                        │
│  ⚠ This session was NOT recorded in the official audit trail │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPONENT 2 — `AuditCertificatePDF` (Printable Defense Document)

### What It Is
An HTML template that renders as a print-ready Government of India style memorandum with:
- Ministry / Department letterhead placeholder
- Unique Recommendation Reference ID
- Timestamp (ISO + IST formatted)
- Officer ID and role
- Standard version snapshot table
- SHA-256 audit hash (human-readable + QR code)
- Declaration paragraph

### Generation Logic (pure client-side, no server needed)
```js
function generateCertificateHTML(auditRecord, queryInput, primaryRec) {
  const timestamp = new Date(auditRecord.timestamp);
  const istTime = timestamp.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return `
    <div class="certificate">
      <div class="cert-header">
        <div class="emblem">🇮🇳</div>
        <h2>Government of India</h2>
        <h3>AI Standards Recommendation — Vigilance Record</h3>
      </div>

      <table class="cert-meta">
        <tr><th>Recommendation ID</th><td>${auditRecord.recommendation_id}</td></tr>
        <tr><th>Query ID</th>         <td>${auditRecord.query_id}</td></tr>
        <tr><th>Timestamp (IST)</th>  <td>${istTime}</td></tr>
        <tr><th>Mode</th>             <td>${auditRecord.dry_run ? 'DRY-RUN (Not Logged)' : 'OFFICIAL RECOMMENDATION'}</td></tr>
      </table>

      <h4>Query Input</h4>
      <blockquote>${queryInput.text}</blockquote>

      <h4>Primary Standard Recommended</h4>
      <p><strong>${primaryRec.is_number}</strong> — ${primaryRec.title}</p>

      <h4>Standards Version Snapshot (at time of query)</h4>
      <table>
        ${Object.entries(auditRecord.standards_version_snapshot).map(([std, snap]) =>
          `<tr><td>${std}</td><td>${snap.status_at_query_time}</td><td>${snap.amendment_at_query_time || '—'}</td></tr>`
        ).join('')}
      </table>

      <h4>Integrity Hash (SHA-256)</h4>
      <code class="hash-block">${auditRecord.audit_hash}</code>

      <div class="cert-footer">
        <p>This record is RTI exportable: ${auditRecord.rti_exportable ? 'YES' : 'NO'}</p>
        <p>Verify this record at: ManakAI Verification Portal → Enter hash above</p>
      </div>
    </div>
  `;
}
```

### Print Trigger
```js
function downloadCertificate(html) {
  const win = window.open('', '_blank');
  win.document.write(`<html><head><style>
    body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; }
    .cert-header { text-align: center; border-bottom: 2px solid #161A22; padding-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #D0D4DC; padding: 8px; text-align: left; }
    .hash-block { font-family: 'Courier New'; background: #0D0F14; color: #EEF0F4; padding: 8px; display: block; word-break: break-all; }
  </style></head><body>${html}</body></html>`);
  win.print();
}
```

---

## COMPONENT 3 — `AuditHashVerifier` (Public Integrity Check Widget)

### What It Is
A text input + "Verify" button. The user pastes an audit hash they received previously. The system checks it against locally cached records and reports if it matches.

### Logic
```js
function verifyHash(inputHash, cachedAuditLogs) {
  const match = cachedAuditLogs.find(log => log.audit_record.audit_hash === inputHash);
  if (match) {
    return { valid: true, record: match };
  }
  return { valid: false, reason: 'No matching record found in local audit store.' };
}
```

### Client-Side Hash Computation (to verify the hash is internally consistent)
```js
async function computeAuditHash(queryId, timestamp) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${queryId}:${timestamp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// No external library needed — Web Crypto API is built into all browsers
```

---

## COMPONENT 4 — `AuditSessionStore` (Local Persistent Log)

### What It Is
A client-side store (using `localStorage` or `IndexedDB`) that persists all `audit_record` objects from every query session. Enables searching historical sessions by date, ministry, or standard.

### Store API
```js
const AuditStore = {
  save(auditRecord, queryInput) {
    const key = `audit:${auditRecord.query_id}`;
    const entry = { auditRecord, queryInput, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  },

  getAll() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith('audit:'))
      .map(k => JSON.parse(localStorage.getItem(k)))
      .sort((a, b) => b.savedAt - a.savedAt);
  },

  findByHash(hash) {
    return this.getAll().find(e => e.auditRecord.audit_hash === hash);
  },

  exportCSV() {
    const records = this.getAll();
    const headers = ['query_id','timestamp','is_number','audit_hash','dry_run','rti_exportable'];
    const rows = records.map(r => [
      r.auditRecord.query_id,
      r.auditRecord.timestamp,
      Object.keys(r.auditRecord.standards_version_snapshot)[0] || '—',
      r.auditRecord.audit_hash,
      r.auditRecord.dry_run,
      r.auditRecord.rti_exportable,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ManakAI_Audit_Log.csv'; a.click();
  }
};
```

---

## FILE STRUCTURE TO CREATE

```
application/frontend/src/
└── features/
    └── audit/
        ├── auditStore.js           ← AuditSessionStore
        ├── hashUtils.js            ← computeAuditHash(), verifyHash()
        ├── certificateGenerator.js ← generateCertificateHTML(), downloadCertificate()
        ├── AuditLogEntry.jsx       ← Component 1 (session card)
        ├── AuditCertificate.jsx    ← Component 2 (print view)
        └── AuditHashVerifier.jsx   ← Component 3 (verification portal)
```

---

## KEY-AND-LOCK WIRING

```js
import cementMock from '../../../../interface/fixtures/cement_mock.json';

const response = cementMock; // ← SWAP THIS when pipeline is live

// On every query completion:
AuditStore.save(response.audit_record, response.query_understanding);

// Render session history:
<AuditLogEntry record={response.audit_record}
               queryText={response.query_understanding.original_text}
               primaryStandard={response.primary_recommendation.is_number} />

// On "View Certificate" click:
const html = generateCertificateHTML(response.audit_record, response.meta, response.primary_recommendation);
downloadCertificate(html);
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not build a server-side database — localStorage is sufficient for the demo
- ❌ Do not import anything from `pipeline/`
- ❌ Do not implement OAuth or government SSO (stub with `auth.user_id` from `QueryRequest`)
