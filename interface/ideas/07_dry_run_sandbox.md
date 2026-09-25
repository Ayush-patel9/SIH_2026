# Feature 07: Dry-Run / Pre-Submission Procurement Sandbox

## 1. Executive Summary & Value Proposition
Procurement officers frequently draft Notice Inviting Tenders (NITs) and Bill of Quantities (BoQ) items iteratively. They need a **safe "Sandbox / Dry-Run" environment** where they can paste draft clauses to test for outdated standards, missing mandatory QCO certifications, and missing test methods **WITHOUT** writing an entry to the permanent legal audit trail.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Sandbox Toggle Switch**: An explicit UI toggle `"Dry Run Mode (No Audit Log)"` that injects `"mode": "dry_run"` into `QueryRequest.input.mode`.
- **Live Draft Specification Analyzer**: A multi-line text editor with real-time keystroke debouncing that highlights outdated standard mentions directly in the editor buffer.
- **Pre-Submission Compliance Warning Strip**: An amber/red visual banner at the top of the editor displaying:
  - ⚠️ *"Clause 4 cites IS 8112:1989 (Withdrawn in 2015). Click to auto-replace with IS 269:2015."*
  - ⚠️ *"Missing mandatory BIS ISI certification clause under Cement QCO 2003."*
- **1-Click Clause Auto-Fixer**: Replaces outdated citations in the draft text with the current revision and inserts model QCO warranty clauses directly into the textarea.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Full RAG semantic embedding of 50-page complex PDF tender documents in real-time in the sandbox.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`QueryRequest.input.mode: "dry_run"` + `StandardsResponse.audit_record`):
```json
{
  "meta": {
    "mode": "dry_run"
  },
  "audit_record": {
    "logged": false,
    "dry_run": true,
    "rti_exportable": false
  },
  "outdated_citations": [
    {
      "cited_standard": "IS 8112:1989",
      "severity": "CRITICAL",
      "status": "WITHDRAWN",
      "replacement": "IS 269:2015"
    }
  ]
}
```

### The Lock (How Application Consumes It):
- Visual indicator displays `"SANDBOX MODE: No audit records will be generated or stored"`.
- Action button `"Apply Recommended Fixes"` automatically rewrites the draft clause in the editor.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/sandbox/sandboxStore.ts`: Manages editor state, undo/redo history, and auto-fix replacements.
2. `src/modules/sandbox/clauseReplacer.ts`: String replacement algorithm that cleanly swaps cited standard names with their replacements while preserving surrounding sentence grammar.
3. `src/modules/sandbox/sandboxDraftTemplates.ts`: Pre-built realistic draft tender snippets (Bridges, Server Room, Fire Safety, Water Pipelines) for quick demo testing.

### Edge-Case Handling:
- User toggles off Dry-Run mode $\rightarrow$ Shows explicit confirmation prompt: `"Switching to Official Mode will log all queries to the permanent legal audit trail."`
