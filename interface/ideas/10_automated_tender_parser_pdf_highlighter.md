# Feature 10: Automated Tender Parser & PDF / Text Highlighter

## 1. Executive Summary & Value Proposition
Government tenders are rarely drafted from scratch; officers typically copy-paste old NIT templates from 10–15 years ago, inadvertently carrying forward withdrawn, obsolete, and non-compliant Indian Standards.
This feature provides a **Split-Screen Tender Parser & Color-Coded Highlighter**:
- 🔴 **Red Highlight**: Withdrawn / Superseded Standards (e.g. `IS 8112:1989`).
- 🟡 **Yellow Highlight**: Outdated Year Citation (e.g. `IS 1786:1985` instead of `IS 1786:2008`).
- 🟢 **Green Highlight**: Active, Compliant Standard (e.g. `IS 456:2000`).

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **High-Precision Citation Extraction Engine**: Standalone Python script ([`application/pdf_parser/pdf_tender_parser.py`](file:///Users/ayushpatel/SIH2026/application/pdf_parser/pdf_tender_parser.py)) and TypeScript parser using regex patterns (`IS\s*\d+(\s*\(Part\s*\d+\))?(\s*:\s*\d{4})?`) to extract all cited standards and their character offsets.
- **Interactive Split-Screen Text / PDF Viewer**:
  - Left pane: Original raw tender text with interactive color-coded inline highlight chips.
  - Right pane: Structured Audit Report showing citation count, severity breakdown, and 1-click replacement recommendations.
- **Hover Inspection Popovers**: Hovering over any highlighted standard in the text reveals a popover explaining the exact supersession history and legal risk.
- **One-Click "Generate Clean Tender"**: Exports a corrected version of the tender text with all obsolete citations replaced by current standards.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- OCR processing of multi-hundred-page scanned PDF images containing handwritten text.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`StandardsResponse.outdated_citations` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "outdated_citations": [
    {
      "cited_standard": "IS 8112:1989",
      "severity": "CRITICAL",
      "status": "WITHDRAWN",
      "reason": "Withdrawn and consolidated into IS 269:2015 (Fifth Revision).",
      "replacement": "IS 269:2015",
      "message": "Draft mentions 43-grade cement using IS 8112:1989. This standard was withdrawn in 2015. Citing it in active tenders violates CVC procurement guidelines."
    },
    {
      "cited_standard": "IS 1786:1985",
      "severity": "HIGH",
      "status": "OUTDATED_YEAR",
      "reason": "Cites 1985 edition. Latest edition is IS 1786:2008.",
      "replacement": "IS 1786:2008",
      "message": "Cites older 1985 edition lacking seismic ductility Fe 500D grade definitions."
    }
  ]
}
```

### The Lock (How Application Consumes It):
- Pass text and `outdated_citations[]` to `TenderHighlighterComponent`.
- The highlighter maps offsets, inserts `<mark class="highlight-red">` or `<mark class="highlight-yellow">`, and hooks click events to the right-side inspector.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `application/pdf_parser/pdf_tender_parser.py`: Python standalone CLI tool for batch processing.
2. `src/modules/highlighter/textTokenizer.ts`: Client-side tokenization and span-marking engine.
3. `src/modules/highlighter/tenderSampleCorpus.ts`: Real government tender examples (Highway Flyover, High-Rise Hospital, Smart City Surveillance, Substation Transformer).

### Edge-Case Handling:
- No standards found in text $\rightarrow$ Shows guidance banner: `"No Indian Standards detected in pasted text. Ensure text includes 'IS [number]' citations."`
