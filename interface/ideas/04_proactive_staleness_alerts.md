# Feature 04 — Proactive Staleness & Supersession Alerts
## Notification Center · Active Tender Impact Matrix · Push Simulation

---

## WHY THIS EXISTS

A tender for a ₹100 Crore flyover project issued in March citing `IS 1786:2008` becomes a legal compliance liability if Amendment 3 is gazetted in June. The procurement officer has no way to know unless someone manually tracks BIS publications. This feature creates a **live notification layer** that proactively flags exactly which active tenders are at risk and what action is needed.

---

## DESIGN (SIH Color System)

- `--error-line: #C23B3B` → CRITICAL severity alerts (standard WITHDRAWN)
- `--signal-amber: #E0982B` → HIGH severity alerts (standard AMENDED)
- `--superposition-violet: #6E5AD6` → MEDIUM (standard UNDER_REVISION)
- `--collapse-cobalt: #1B4FE0` → LOW / NEW_MANDATORY_STANDARD
- `--ink-muted: #8890A0` → "All clear, no alerts" state
- Font: `JetBrains Mono` for IS numbers, alert IDs, deadline countdowns

---

## WHAT YOU BUILD (JSON-ONLY)

---

## COMPONENT 1 — `NotificationBell` (Header Nav Indicator)

### What It Is
A bell icon in the top navigation bar with a live unread count badge. Clicking it opens the `AlertDrawer`.

### State Logic
```js
const [alerts, setAlerts] = useState([]);
const unreadCount = alerts.filter(a => !a._read).length;
const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a._read).length;

// Badge color:
// criticalCount > 0 → error-line red
// unreadCount > 0   → signal-amber
// else              → ink-muted
```

---

## COMPONENT 2 — `AlertDrawer` (Right-Side Panel)

### What It Is
A slide-in drawer from the right side showing all active alerts grouped by severity. Each alert card shows: affected standard, event description, affected tenders, recommended action, and deadline countdown.

### Exact JSON Fields Consumed
```json
{
  "$schema": "SIH2026.AlertPayload.v1",
  "alert_id": "alt-3819-20ba-4821",
  "timestamp": "2026-09-26T10:30:00Z",
  "alert_type": "STANDARD_AMENDED",
  "severity": "HIGH",
  "affected_standard": {
    "is_number": "IS 269:2015",
    "event": "Amendment 2 published on 2026-09-20",
    "replacement": null
  },
  "affected_tenders": [
    { "tender_id": "NIT-PWD-2026-001", "ministry": "MoHUA", "officer_user_id": "officer_4091", "cited_version": "IS 269:2015 (Amendment 1)" }
  ],
  "recommended_action": "Review active tenders and update citation to include Amendment 2.",
  "deadline": "2026-10-31T23:59:59Z"
}
```

### Alert Card Visual Spec
```
┌──────────────────────────────────────────────────────────┐
│ 🔴 CRITICAL   STANDARD_SUPERSEDED         2 days ago     │
│ IS 8112:1989 → Withdrawn. Replaced by IS 269:2015        │
│                                                          │
│ Affected Tenders: NIT-PWD-2026-001 (MoHUA)              │
│                   NIT-NHAI-2026-014 (MoRTH)              │
│                                                          │
│ Action: Update all tender clauses to IS 269:2015         │
│ Deadline: 31 Oct 2026 — ⏰ 35 days remaining            │
│                                                     [✓ Acknowledge]
└──────────────────────────────────────────────────────────┘
```

### Deadline Countdown
```js
function getDaysRemaining(deadlineISO) {
  if (!deadlineISO) return null;
  const now = new Date();
  const deadline = new Date(deadlineISO);
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return diff;
}

// Display:
const days = getDaysRemaining(alert.deadline);
const urgencyClass = days < 7 ? 'urgent' : days < 30 ? 'approaching' : 'normal';
```

---

## COMPONENT 3 — `TenderImpactMatrix` (Active Tender Risk Table)

### What It Is
A table showing all active tenders and which of their cited standards are now at risk. Each row is a tender; each column is a cited standard. Color-coded cells show the risk level.

### Data Assembly Logic (purely from multiple `AlertPayload` objects)
```js
function buildImpactMatrix(alerts, savedTenders) {
  // savedTenders = array of { tenderId, citedStandards: ['IS 269:2015', 'IS 1786:2008'] }
  // alerts = array of AlertPayload objects
  const affectedMap = {};
  alerts.forEach(alert => {
    alert.affected_tenders.forEach(t => {
      if (!affectedMap[t.tender_id]) affectedMap[t.tender_id] = [];
      affectedMap[t.tender_id].push({
        standard: alert.affected_standard.is_number,
        severity: alert.severity,
        action: alert.recommended_action,
        alertId: alert.alert_id,
      });
    });
  });
  return affectedMap;
}
```

### Visual Spec
```
┌─────────────────────┬────────────────┬────────────────┬────────────────┐
│ Tender ID           │ IS 269:2015    │ IS 1786:2008   │ IS 4031 Part 1 │
├─────────────────────┼────────────────┼────────────────┼────────────────┤
│ NIT-PWD-2026-001    │ ⚠️ AMENDED      │ ✓ OK           │ ✓ OK           │
│ NIT-NHAI-2026-014   │ 🔴 WITHDRAWN   │ ⚠️ AMENDED      │ ✓ OK           │
│ NIT-MoHUA-2026-007  │ ✓ OK           │ ✓ OK           │ ✓ OK           │
└─────────────────────┴────────────────┴────────────────┴────────────────┘
```

---

## COMPONENT 4 — `AlertStore` + Mock Alert Generator

### Store
```js
const ALERT_STORE_KEY = 'manakAI:alerts';

const AlertStore = {
  save(alerts) {
    localStorage.setItem(ALERT_STORE_KEY, JSON.stringify(alerts));
  },
  getAll() {
    try { return JSON.parse(localStorage.getItem(ALERT_STORE_KEY)) || []; }
    catch { return MOCK_ALERTS; }
  },
  acknowledge(alertId) {
    const all = this.getAll();
    const idx = all.findIndex(a => a.alert_id === alertId);
    if (idx >= 0) { all[idx]._read = true; this.save(all); }
  },
};
```

### Mock Alert Data (5 realistic scenarios for demo)
```js
export const MOCK_ALERTS = [
  {
    alert_id: "alt-001",
    timestamp: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
    alert_type: "STANDARD_WITHDRAWN",
    severity: "CRITICAL",
    affected_standard: { is_number: "IS 8112:1989", event: "Withdrawn, consolidated into IS 269:2015", replacement: "IS 269:2015" },
    affected_tenders: [{ tender_id: "NIT-PWD-2026-001", ministry: "MoHUA", officer_user_id: "officer_4091", cited_version: "IS 8112:1989" }],
    recommended_action: "Replace IS 8112:1989 with IS 269:2015 in all tender clauses.",
    deadline: new Date(Date.now() + 35*24*60*60*1000).toISOString(),
    _read: false,
  },
  {
    alert_id: "alt-002",
    timestamp: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
    alert_type: "STANDARD_AMENDED",
    severity: "HIGH",
    affected_standard: { is_number: "IS 1786:2008", event: "Amendment 3 published — new rib geometry marking requirements", replacement: null },
    affected_tenders: [
      { tender_id: "NIT-NHAI-2026-014", ministry: "MoRTH", officer_user_id: "officer_5892", cited_version: "IS 1786:2008 (Amd 2)" },
    ],
    recommended_action: "Update tender clause to reference IS 1786:2008 incorporating Amendment 3.",
    deadline: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
    _read: false,
  },
  {
    alert_id: "alt-003",
    timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
    alert_type: "QCO_ENFORCEMENT_DATE",
    severity: "CRITICAL",
    affected_standard: { is_number: "IS 13252 (Part 1):2010", event: "CRS registration mandatory from 01 Nov 2026", replacement: null },
    affected_tenders: [
      { tender_id: "NIT-SMART-2026-003", ministry: "MeitY", officer_user_id: "officer_7712", cited_version: "IS 13252 (Part 1):2010" },
    ],
    recommended_action: "Ensure all CCTV surveillance camera bidders hold valid CRS R-number.",
    deadline: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
    _read: false,
  },
  {
    alert_id: "alt-004",
    timestamp: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
    alert_type: "STANDARD_UNDER_REVISION",
    severity: "MEDIUM",
    affected_standard: { is_number: "IS 456:2000", event: "BIS Technical Committee CED-2 reviewing IS 456 for 2026 revision", replacement: null },
    affected_tenders: [],
    recommended_action: "Monitor BIS publications. No action required until new edition is gazetted.",
    deadline: null,
    _read: true,
  },
  {
    alert_id: "alt-005",
    timestamp: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    alert_type: "NEW_MANDATORY_STANDARD",
    severity: "HIGH",
    affected_standard: { is_number: "IS 17800:2022", event: "New mandatory standard for Solar PV modules under MoNRE QCO 2024", replacement: null },
    affected_tenders: [],
    recommended_action: "All solar procurement tenders after 01 Jan 2026 must cite IS 17800:2022.",
    deadline: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
    _read: false,
  },
];
```

---

## ALSO BUILD — `staleness_risk` inline banner (inside recommendation cards)

### Exact JSON Fields Consumed
```json
{
  "staleness_risk": {
    "risk_level": "NONE",
    "message": "All recommended standards are active and up to date.",
    "standards_under_revision": []
  }
}
```

### Render Logic
```js
const RISK_STYLES = {
  NONE:     { color: 'var(--ink-muted)',           icon: '✓', text: 'All standards current' },
  LOW:      { color: 'var(--collapse-cobalt)',     icon: '📋', text: 'Minor revision possible' },
  MEDIUM:   { color: 'var(--superposition-violet)',icon: '🔔', text: 'Standard under revision' },
  HIGH:     { color: 'var(--signal-amber)',         icon: '⚠️', text: 'Amendment published — review required' },
  CRITICAL: { color: 'var(--error-line)',           icon: '🔴', text: 'Standard WITHDRAWN — immediate action required' },
};
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── alerts/
        ├── alertStore.js          ← AlertStore + MOCK_ALERTS
        ├── deadlineUtils.js       ← getDaysRemaining(), urgencyClass()
        ├── impactMatrix.js        ← buildImpactMatrix()
        ├── NotificationBell.jsx   ← Component 1
        ├── AlertDrawer.jsx        ← Component 2
        ├── TenderImpactMatrix.jsx ← Component 3
        └── StalenessRiskBanner.jsx← Inline banner for recommendation cards
```

---

## KEY-AND-LOCK WIRING

```js
// The staleness_risk field comes from the StandardsResponse:
<StalenessRiskBanner risk={response.staleness_risk} />

// The alert drawer uses AlertStore (populated by mock alerts or real API push):
<NotificationBell alerts={AlertStore.getAll()} />
<AlertDrawer alerts={AlertStore.getAll()} onAcknowledge={AlertStore.acknowledge} />
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not implement a real WebSocket server
- ❌ Do not scrape BIS gazette pages directly
- ❌ Do not import anything from `pipeline/`
