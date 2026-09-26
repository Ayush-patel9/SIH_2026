# Feature Implementation Plans — ManakAI BIS Standards Intelligence Platform

## How to Read These Files

Each feature file (`01_*.md` through `12_*.md`) is a complete implementation blueprint. Every one of them:

1. **Explains WHY the feature exists** (legal context, user need)
2. **Lists every component to build** with exact function signatures and JSX
3. **Shows the exact JSON fields consumed** from `interface/contract_schema.json`
4. **Includes fallback logic** for when the pipeline hasn't returned that field yet
5. **Gives the Key-and-Lock wiring** — the exact one-line swap to connect to a live pipeline
6. **States what NOT to build** to prevent scope creep

---

## Feature List

| # | File | Short Name | Status |
|---|------|-----------|--------|
| 01 | [01_explainability_vs_black_box.md](./01_explainability_vs_black_box.md) | Reasoning Trail + Knowledge Graph | Planned |
| 02 | [02_audit_trail_and_legal_defensibility.md](./02_audit_trail_and_legal_defensibility.md) | Audit Trail + CVC Certificate | Planned |
| 03 | [03_human_in_the_loop_feedback.md](./03_human_in_the_loop_feedback.md) | Flag + Expert Review Queue | Planned |
| 04 | [04_proactive_staleness_alerts.md](./04_proactive_staleness_alerts.md) | Withdrawal/Amendment Alerts | Planned |
| 05 | [05_multi_lingual_domain_switched_output.md](./05_multi_lingual_domain_switched_output.md) | Hinglish Mode + Domain Presets | Planned |
| 06 | [06_standards_comparison_and_allied.md](./06_standards_comparison_and_allied.md) | Side-by-Side Comparator | Planned |
| 07 | [07_query_understanding_disambiguation.md](./07_query_understanding_disambiguation.md) | Entity Chips + Disambiguation | Planned |
| 08 | [08_nit_draft_generator.md](./08_nit_draft_generator.md) | NIT Clause Generator | Planned |
| 09 | [09_mcp_server.md](./09_mcp_server.md) | MCP Server (Python FastAPI) | Planned |
| 10 | [10_pdf_standards_parser.md](./10_pdf_standards_parser.md) | PDF Parser CLI (Python) | Planned |
| 11 | [11_dashboard_analytics_heatmap.md](./11_dashboard_analytics_heatmap.md) | Dashboard + Activity Heatmap | Planned |
| 12 | [12_certification_compliance_checker.md](./12_certification_compliance_checker.md) | Batch Compliance Checker | Planned |

---

## Design System & Frontend Architecture (DO NOT DEVIATE)

> 📖 **Full Specification:** See [frontend.md](./frontend.md) for the complete Institutional Design System, CSS tokens, animation orchestrations, component library, and government portal guidelines.

All frontend components use the **Egreen-Quanta Design System** from the SIH reference project:

```css
--paper:               #EEF0F4;   /* panel backgrounds */
--ink:                 #161A22;   /* primary text */
--ink-secondary:       #4A5060;   /* labels */
--ink-muted:           #8890A0;   /* muted */
--superposition-violet:#6E5AD6;   /* uncertain / violet state */
--collapse-cobalt:     #1B4FE0;   /* confirmed / active */
--signal-amber:        #E0982B;   /* warning */
--void:                #0D0F14;   /* dark canvas */
--error-line:          #C23B3B;   /* error / withdrawn */
--hairline:            #D0D4DC;   /* 1px dividers */
```

Fonts: `Literata` (prose) + `JetBrains Mono` (data/code/IS numbers)

---

## Iron Rule: Pipeline Isolation

```
✅ You touch: application/  interface/
❌ You never touch: pipeline/
```

Every feature reads from `interface/fixtures/cement_mock.json`. When the pipeline is live, the **only** change needed is swapping one import or one fetch URL. The feature logic never changes.

---

## Key-and-Lock Architecture Summary

```
pipeline/ → raw_output.json
              ↓
interface/adapter.py → transforms to contract_schema.json shape
              ↓
interface/fixtures/cement_mock.json → used by all 12 features during development
              ↓
application/frontend/src/features/*  → all 12 lock implementations
```
