# Feature 11 — Dashboard Analytics & Usage Heatmap
## Ministry-Level Usage Metrics · Most-Queried Standards · Domain Heatmap

---

## WHY THIS EXISTS

BIS and the Ministry of Commerce need to know: which standards are most queried? Which ministries have the highest procurement activity? Which standards domains are the most error-prone (highest feedback/correction rate)? This dashboard provides these insights from purely client-side aggregated data — no backend analytics server required.

---

## DESIGN (SIH Color System)

- Heatmap cells: gradient from `--paper` (zero activity) → `--collapse-cobalt` (high activity)
- Bar charts: `--collapse-cobalt` for primary standard frequency bars
- Error/feedback rate: `--signal-amber` → `--error-line` gradient
- `--void: #0D0F14` → Dark stat cards (large KPI numbers)
- Font: `JetBrains Mono` for all numbers, IS numbers, counts
- Font: `Literata` for labels and descriptions

---

## DATA SOURCE (Purely Client-Side Aggregation)

All data comes from the `AuditStore` (Feature 02) and `FeedbackStore` (Feature 03). No backend needed.

```js
function computeDashboardMetrics(auditLogs, feedbackLogs) {
  const metrics = {
    totalQueries: auditLogs.length,
    officialRecommendations: auditLogs.filter(l => !l.auditRecord?.dry_run).length,
    draftSessions: auditLogs.filter(l => l.auditRecord?.dry_run).length,
    pendingFeedback: feedbackLogs.filter(f => f.verification_status === 'PENDING').length,
    verifiedCorrections: feedbackLogs.filter(f => f.verification_status === 'VERIFIED_CORRECT').length,
    standardsQueried: {},   // is_number → count
    domainsQueried: {},     // domain → count
    ministriesQueried: {},  // ministry → count
    feedbackByStandard: {}, // is_number → { corrections, verified }
    queriesByDate: {},      // YYYY-MM-DD → count
    queryModes: { recommend: 0, compare: 0, validate: 0 },
  };

  auditLogs.forEach(entry => {
    const { auditRecord, queryInput } = entry;
    if (!auditRecord) return;

    // Count standards
    const std = Object.keys(auditRecord.standards_version_snapshot || {})[0];
    if (std) metrics.standardsQueried[std] = (metrics.standardsQueried[std] || 0) + 1;

    // Count by date
    const date = auditRecord.timestamp?.slice(0, 10);
    if (date) metrics.queriesByDate[date] = (metrics.queriesByDate[date] || 0) + 1;

    // Count mode
    const mode = queryInput?.mode || 'recommend';
    metrics.queryModes[mode] = (metrics.queryModes[mode] || 0) + 1;
  });

  feedbackLogs.forEach(fb => {
    const std = fb.flagged_is_number;
    if (!metrics.feedbackByStandard[std]) metrics.feedbackByStandard[std] = { corrections: 0, verified: 0 };
    metrics.feedbackByStandard[std].corrections++;
    if (fb.verification_status === 'VERIFIED_CORRECT') metrics.feedbackByStandard[std].verified++;
  });

  return metrics;
}
```

---

## COMPONENT 1 — `KPICards` (Top-Level Stats Row)

### What It Is
A row of 4 dark KPI cards showing the most important headline numbers.

### Visual Spec
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  TOTAL QUERIES   │  │ OFFICIAL RECS.   │  │ PENDING FEEDBACK │  │ STANDARDS COVERED│
│                  │  │                  │  │                  │  │                  │
│      1,248       │  │        891       │  │        23        │  │        47        │
│  (void bg, mono) │  │  (void bg, mono) │  │  (amber, mono)   │  │  (cobalt, mono)  │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

```jsx
function KPICards({ metrics }) {
  const cards = [
    { label: 'Total Queries',        value: metrics.totalQueries,            color: 'var(--ink-secondary)' },
    { label: 'Official Records',     value: metrics.officialRecommendations, color: 'var(--collapse-cobalt)' },
    { label: 'Pending Corrections',  value: metrics.pendingFeedback,         color: 'var(--signal-amber)' },
    { label: 'Standards Covered',    value: Object.keys(metrics.standardsQueried).length, color: 'var(--superposition-violet)' },
  ];

  return (
    <div className="kpi-row">
      {cards.map(c => (
        <div key={c.label} className="kpi-card">
          <span className="kpi-label">{c.label}</span>
          <span className="kpi-value" style={{ color: c.color }}>{c.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## COMPONENT 2 — `TopStandardsBar` (Most Queried Standards)

### What It Is
A horizontal bar chart showing the top 10 most queried IS standards, with feedback/correction rate as a secondary bar in amber.

```js
function TopStandardsBar({ standardsQueried, feedbackByStandard }) {
  const sorted = Object.entries(standardsQueried)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 10);

  const maxCount = sorted[0]?.[1] || 1;

  return sorted.map(([isNum, count]) => {
    const feedback = feedbackByStandard[isNum] || { corrections: 0, verified: 0 };
    const correctionRate = count > 0 ? feedback.corrections / count : 0;

    return (
      <div key={isNum} className="std-bar-row">
        <span className="std-bar-label">{isNum}</span>
        <div className="std-bar-track">
          <div
            className="std-bar-fill"
            style={{ width: `${(count / maxCount) * 100}%`, background: 'var(--collapse-cobalt)' }}
          />
          {correctionRate > 0 && (
            <div
              className="std-bar-correction"
              style={{ width: `${correctionRate * 100}%`, background: 'var(--signal-amber)' }}
            />
          )}
        </div>
        <span className="std-bar-count">{count}</span>
        {correctionRate > 0.1 && <span className="std-bar-flag" title="High correction rate">⚠️</span>}
      </div>
    );
  });
}
```

---

## COMPONENT 3 — `ActivityHeatmap` (Queries by Day)

### What It Is
A GitHub-style calendar heatmap showing query activity per day for the last 90 days. Uses a blue intensity scale.

```js
function ActivityHeatmap({ queriesByDate }) {
  // Generate last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().slice(0, 10);
  });

  const maxCount = Math.max(1, ...Object.values(queriesByDate));

  function getCellColor(date) {
    const count = queriesByDate[date] || 0;
    if (count === 0) return 'var(--hairline)';
    const intensity = count / maxCount;
    // Interpolate from light cobalt to full cobalt
    const alpha = 0.15 + intensity * 0.85;
    return `rgba(27, 79, 224, ${alpha})`; // #1B4FE0 = collapse-cobalt
  }

  return (
    <div className="heatmap-container">
      {days.map(date => (
        <div
          key={date}
          className="heatmap-cell"
          style={{ backgroundColor: getCellColor(date) }}
          title={`${date}: ${queriesByDate[date] || 0} queries`}
        />
      ))}
    </div>
  );
}
```

---

## COMPONENT 4 — `DomainDonutChart` (Query Distribution by Domain)

### What It Is
A simple SVG donut chart showing the percentage split across domains (construction, electronics, textiles, etc.).

```js
function DomainDonutChart({ domainsQueried }) {
  const DOMAIN_COLORS = {
    construction: '#1B4FE0',
    electronics:  '#6E5AD6',
    textiles:     '#E0982B',
    food:         '#4A5060',
    chemicals:    '#8890A0',
    general:      '#D0D4DC',
  };

  const total = Object.values(domainsQueried).reduce((a, b) => a + b, 0) || 1;
  const segments = Object.entries(domainsQueried)
    .map(([domain, count]) => ({
      domain,
      count,
      pct: count / total,
      color: DOMAIN_COLORS[domain] || '#8890A0',
    }))
    .sort((a, b) => b.count - a.count);

  // SVG donut: each segment is a stroke-dasharray arc on a circle
  const RADIUS = 60;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = seg.pct * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const arc = { ...seg, strokeDasharray: `${dash} ${gap}`, strokeDashoffset: -offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="donut-chart-container">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--hairline)" strokeWidth="20" />
        {arcs.map(arc => (
          <circle
            key={arc.domain}
            cx="80" cy="80" r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth="20"
            strokeDasharray={arc.strokeDasharray}
            strokeDashoffset={arc.strokeDashoffset}
            transform="rotate(-90 80 80)"
          />
        ))}
        <text x="80" y="84" textAnchor="middle" className="donut-center-label">
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map(s => (
          <div key={s.domain} className="donut-legend-item">
            <span className="legend-dot" style={{ background: s.color }} />
            <span>{s.domain}</span>
            <span className="legend-pct">{(s.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## COMPONENT 5 — `ExportReport` (Download Analytics as CSV)

```js
function exportDashboardReport(metrics) {
  const lines = [
    ['Metric', 'Value'],
    ['Total Queries', metrics.totalQueries],
    ['Official Recommendations', metrics.officialRecommendations],
    ['Draft Sessions', metrics.draftSessions],
    ['Pending Feedback Items', metrics.pendingFeedback],
    ['Verified Corrections', metrics.verifiedCorrections],
    [''],
    ['Standard', 'Query Count', 'Correction Count', 'Correction Rate'],
    ...Object.entries(metrics.standardsQueried).map(([std, count]) => {
      const fb = metrics.feedbackByStandard[std] || { corrections: 0 };
      return [std, count, fb.corrections, (fb.corrections / count).toFixed(3)];
    }),
  ];
  const csv = lines.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'ManakAI_Analytics_Report.csv'; a.click();
}
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── dashboard/
        ├── metricsAggregator.js    ← computeDashboardMetrics()
        ├── KPICards.jsx            ← Component 1
        ├── TopStandardsBar.jsx     ← Component 2
        ├── ActivityHeatmap.jsx     ← Component 3
        ├── DomainDonutChart.jsx    ← Component 4
        └── ExportReport.jsx        ← Component 5
```

---

## KEY-AND-LOCK WIRING

```js
// Dashboard is fed entirely from client-side stores — no pipeline needed
import { AuditStore } from '../audit/auditStore';
import { FeedbackStore } from '../feedback/feedbackStore';

const metrics = computeDashboardMetrics(AuditStore.getAll(), FeedbackStore.getAll());

<KPICards metrics={metrics} />
<TopStandardsBar standardsQueried={metrics.standardsQueried} feedbackByStandard={metrics.feedbackByStandard} />
<ActivityHeatmap queriesByDate={metrics.queriesByDate} />
<DomainDonutChart domainsQueried={metrics.domainsQueried} />
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not use Recharts or Chart.js — SVG is sufficient and keeps the bundle small
- ❌ Do not build a backend analytics API
- ❌ Do not import anything from `pipeline/`
