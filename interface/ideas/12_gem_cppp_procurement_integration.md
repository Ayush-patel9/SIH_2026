# Feature 12: GeM & CPPP Procurement Sandbox Integration

## 1. Executive Summary & Value Proposition
In actual government operations, officers do not use standalone lookup tools; they spend 90% of their workday inside the **Government e-Marketplace (GeM)** and the **Central Public Procurement Portal (CPPP)**.
Demonstrating explicit API stubs, a simulated **"Recommend Indian Standards" browser plugin / GeM iframe widget**, and generating copy-paste ready **Model Tender Clauses** proves the solution integrates natively into the existing government procurement workflow.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Simulated GeM / CPPP Procurement Portal View**: A realistic mock interface resembling the GeM tender creation page with product category selector, estimated tender value, and a prominent button: `[✨ Auto-Populate Indian Standards & Golden Parameters via ManakAI]`.
- **Golden Parameters Specification Table**: Generates structured technical parameter tables matching GeM catalog requirements:
  - Standard Specification (`IS 269:2015`)
  - Mandatory Marking (`BIS ISI Mark with active CM/L number`)
  - Grade (`53 Grade / Fe 500D`)
  - Packaging & Lab Report Submission requirements
- **1-Click Model Tender Clause Generator**: Formats a legally compliant, CVC-proof technical specification clause ready to copy into GeM Special Terms & Conditions (STC).
- **CPPP e-Publishing Tender XML / JSON Exporter**: Generates tender specification metadata in standardized format compatible with e-procurement portals.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Direct authenticated API write access into the production Government of India GeM portal.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`QueryRequest.input.source: "gem_integration"` + `StandardsResponse` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "compliance_checklist": [
    {
      "item": "Cite IS 269:2015 in tender specification",
      "status": "PASS",
      "action_required": "Ensure technical bid references IS 269:2015."
    },
    {
      "item": "Mandatory BIS ISI Mark requirement clause",
      "status": "WARNING",
      "action_required": "Insert clause: 'Supplied cement must bear valid BIS Certification mark under Cement QCO.'"
    }
  ],
  "primary_recommendation": {
    "certification": {
      "scheme": "BIS_ISI_MARK",
      "mandatory": true,
      "qco_order_name": "Cement (Quality Control) Order, 2003"
    }
  }
}
```

### The Lock (How Application Consumes It):
- Clicking "Copy Model Clause" puts the standardized legal tender clause onto the user's clipboard.
- "Export GeM Spec Sheet" downloads structured `.xlsx`/`.json` containing Golden Parameters.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/gem/gemParameterMapper.ts`: Maps standard fields into GeM Golden Parameter key-value pairs.
2. `src/modules/gem/modelClauseBuilder.ts`: Combines primary standard, allied test methods, and QCO legal mandates into an official tender clause.
3. `src/modules/gem/gemMockPortal.tsx`: An interactive GeM-style tender creation simulation view.

### Edge-Case Handling:
- Missing specific grade parameters $\rightarrow$ Inserts general BIS certification requirements and prompts user to select specific grade.
