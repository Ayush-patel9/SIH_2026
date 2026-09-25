# Feature 11: "Explain Like I'm New Here" (Plain-Language Explainer)

## 1. Executive Summary & Value Proposition
Procurement officers, financial advisors, and administrative personnel often lack deep civil, metallurgical, or electrical engineering backgrounds. Deciphering standards titles like *"Method of Determination of Soundness by Le-Chatelier Autoclave Expansion"* is difficult.
This feature provides an **"Explain Like I'm New Here" (ELINH)** toggle that translates dense technical standards specifications and legal gazette mandates into concise, plain English and Hindi summaries.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **ELINH Toggle Pill Component**: An intuitive toggle button located above standard recommendation cards allowing instant switching between *"Technical Specification"* and *"Plain-Language Summary"*.
- **Rule-Based Plain Language Formatter**: A client-side templating engine that takes any standard number, title, QCO status, and key tests to automatically synthesize plain-language summaries even without LLM generation.
- **Key Takeaways & "Why It Matters" Callout Cards**: Highlights 3 immediate practical takeaways:
  1. 📌 *What is this product?* (e.g. Standard structural concrete cement).
  2. ⚠️ *What goes wrong if ignored?* (e.g. Expansion cracking, contractor legal rejection).
  3. 📋 *What must the officer demand?* (e.g. BIS ISI mark + 28-day test certificate).

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Dynamic multi-sentence reasoning generated on-the-fly by large cloud LLM inference engines.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`StandardsResponse.plain_language_explanation` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "plain_language_explanation": {
    "enabled": true,
    "text": "For 43 grade Ordinary Portland Cement, the applicable Indian Standard is **IS 269:2015**. Note that older references like IS 8112:1989 have been withdrawn and consolidated into IS 269. Under the Cement QCO (2003), BIS ISI certification is legally mandatory. Tender clauses must also specify fineness testing as per IS 4031 (Part 1)."
  }
}
```

### The Lock (How Application Consumes It):
- When ELINH mode is enabled, `plain_language_explanation.text` is displayed prominently with markdown formatting, simplified glossary tooltips, and highlighted callouts.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/plainlanguage/plainLanguageSynthesizer.ts`: Fallback templating function that formats standard data into plain-language summaries.
2. `src/modules/plainlanguage/jargonGlossary.ts`: Tooltip dictionary explaining common technical terms (`Soundness`, `Fineness`, `LSF`, `Proof Stress`, `CRS`).
3. `src/modules/plainlanguage/plainLanguageCard.tsx`: UI component with audio pronunciation / speech synthesis hook.

### Edge-Case Handling:
- If `plain_language_explanation` is missing $\rightarrow$ Automatically synthesize using `plainLanguageSynthesizer.ts`.
