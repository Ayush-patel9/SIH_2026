# Feature 08: Role-Based Views (Officer vs. Auditor vs. Vendor)

## 1. Executive Summary & Value Proposition
Different stakeholders in the procurement lifecycle have different operational goals:
1. **Procurement Officer**: Needs fast, accurate standard recommendations, model tender clauses, and GeM alignment.
2. **Government Auditor (CVC / CAG)**: Needs full explainability, reasoning traces, gazette S.O. citations, and cryptographically verified audit records.
3. **Bidding Vendor / Supplier**: Needs a clear, unambiguous compliance checklist, test method requirements, and licensee verification (CM/L & CRS R-numbers).
This feature provides a **Single-Click Persona Switcher** that filters and tailors the UI presentation without requiring backend changes.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Role Switcher UI Bar**: Header component with 3 distinct lenses:
  - 🏛️ **Procurement Officer Lens**: Highlights standard specifications, scope summaries, model clauses, and GeM parameters.
  - ⚖️ **Auditor / Vigilance Lens**: Promotes reasoning trace, confidence breakdown, graph traversal path, and audit certificate verification.
  - 🏭 **Vendor / Bidder Lens**: Promotes compliance checklist (Pass/Fail/Warning), required lab test reports (IS 4031), and BIS ISI Mark / CRS licensing requirements.
- **Conditional Layout Reducer**: Pure client-side component filtering logic that dynamically renders or collapses specific card sections based on active role state.
- **Role-Tailored Export Options**:
  - Officer $\rightarrow$ Download Model Tender Clause (`.docx`/`.txt`).
  - Auditor $\rightarrow$ Download Signed Vigilance Dossier (`.pdf`).
  - Vendor $\rightarrow$ Download Bid Compliance Checklist (`.csv`/`.pdf`).

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Enterprise Single Sign-On (SSO) integration with Government Parichay / Jan Parichay identity servers.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`QueryRequest.auth.role` + `StandardsResponse` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "auth": {
    "role": "PROCUREMENT_OFFICER | AUDITOR | VENDOR | BIS_EXPERT"
  }
}
```

### The Lock (How Application Consumes It):
- When `role === "VENDOR"`, `compliance_checklist` and `certification` are highlighted at the top, while internal reasoning traces are collapsed.
- When `role === "AUDITOR"`, `audit_record`, `reasoning_trace`, and `graph_path` are prominently rendered.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/roles/roleContext.tsx`: Manages active persona state (`OFFICER`, `AUDITOR`, `VENDOR`).
2. `src/modules/roles/roleFilterRules.ts`: Defines visibility matrices for each response block.
3. `src/modules/roles/vendorChecklistExporter.ts`: Formats compliance checklists into structured vendor verification sheets.

### Edge-Case Handling:
- Switching roles maintains active query context without triggering unnecessary network re-fetches.
