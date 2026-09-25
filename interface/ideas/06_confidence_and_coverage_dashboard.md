# Feature 06: Confidence & Coverage MIS Dashboard (Executive / HOD View)

## 1. Executive Summary & Value Proposition
Department Heads, Joint Secretaries, and Chief Procurement Officers require high-level analytics over operational details: How many tenders were audited? What percentage cited outdated standards? Which ministries have the highest compliance risk? Which divisions (Civil, Electronics, Metallurgy) dominate procurement?
This feature provides an **Executive Management Information System (MIS) Dashboard** with interactive charts, risk reduction metrics, and division coverage statistics.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Executive KPI Cards**: Summary metric widgets displaying:
  - 📊 Total Tenders Processed (e.g., `1,248`)
  - 🛡️ Outdated Citations Pre-empted (e.g., `342 Disputes Avoided`)
  - ⚡ QCO Mandatory Compliance Rate (e.g., `98.4%`)
  - ⏱️ Average Pipeline Retrieval Latency (e.g., `412 ms`)
- **Interactive Chart Suite** (Pure CSS / Lightweight SVG / Recharts / Chart.js):
  - Division-wise Standard Distribution (CED vs. LITD vs. MTD vs. ETD).
  - Confidence Score Histogram (distribution of high vs. medium confidence queries).
  - Monthly Compliance & Dispute Prevention Trend.
- **Mock Data Aggregator**: A statistical utility generating realistic aggregate distributions across 1,000+ simulated procurement sessions.
- **Export MIS Report**: One-click export of executive summary as PDF / CSV for ministry review meetings.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Live cross-ministry data lake aggregation across thousands of live government procurement portals.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`StandardsResponse.meta` + `QueryRequest.context` array):
```json
{
  "total_queries": 1248,
  "avg_confidence": 0.942,
  "qco_enforced_percentage": 78.4,
  "outdated_intercepted_count": 312,
  "top_divisions": [
    { "code": "CED", "name": "Civil Engineering", "count": 480 },
    { "code": "LITD", "name": "Electronics & IT", "count": 310 },
    { "code": "MTD", "name": "Metallurgy", "count": 220 }
  ]
}
```

### The Lock (How Application Consumes It):
- Top navigation has a dedicated "Executive MIS Dashboard" tab.
- Renders responsive grid of KPI cards, division donut charts, and tender risk timelines.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/dashboard/kpiAggregator.ts`: Pure statistical reducer function taking `StandardsResponse[]` logs and computing KPIs.
2. `src/modules/dashboard/chartComponents.tsx`: SVG-based Donut chart, Bar chart, and Latency sparklines with zero external bloat.
3. `src/modules/dashboard/misReportExporter.ts`: Exports monthly audit summary in executive memo format.

### Edge-Case Handling:
- Zero data state $\rightarrow$ Gracefully displays onboarding instructions with sample load action.
