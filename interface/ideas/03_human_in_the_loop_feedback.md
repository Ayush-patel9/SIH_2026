# Feature 03: Human-in-the-Loop Feedback & Knowledge Refinement

## 1. Executive Summary & Value Proposition
AI systems without continuous feedback degrade over time. Procurement officers and domain experts often possess granular, field-specific knowledge (e.g., "IS 4032 chemical test must be prioritized over general sampling for high-sulfate soils").
This feature provides a **Human-in-the-Loop Review & Feedback Queue** allowing officers to flag inaccuracies, propose correct standard replacements, and route corrections into an expert verification workflow.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Feedback Capture Modal & Form**: A rich form allowing officers to select `feedback_type` (`WRONG_STANDARD`, `OUTDATED_STANDARD`, `MISSING_ALLIED_STANDARD`, `WRONG_CERTIFICATION`, `FALSE_OUTDATED_FLAG`), input `correct_is_number`, and add free-text justification.
- **Client-Side Feedback Dispatcher & Schema Validator**: Validates outgoing payload against `FeedbackRequest` (`SIH2026.FeedbackRequest.v1`).
- **Expert Reviewer Moderation Queue**: A dedicated admin panel showing all pending feedback items with diff preview (Original vs. Proposed Standard) and action buttons (`Approve Correction`, `Reject`, `Escalate to BIS Technical Committee`).
- **Local Simulation Loop**: Demonstrates the lifecycle: `PENDING` $\rightarrow$ `VERIFIED_CORRECT` $\rightarrow$ dynamic update of trust score badges on simulated records.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Direct mutation of your friend's core vector database or Knowledge Graph triple store on approval.
- Automated retraining or dynamic fine-tuning of the retrieval embedding model.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`FeedbackRequest` schema from `API_CONTRACT_SCHEMA.md`):
```json
{
  "$schema": "SIH2026.FeedbackRequest.v1",
  "feedback_id": "fbk-9102-482a-bc91",
  "timestamp": "2026-09-26T10:15:00Z",
  "original_query_id": "uuid-9f8a-4b2c-11e9",
  "original_recommendation_id": "rec-6d2f-48e2-b184",
  "submitter": {
    "user_id": "officer_4091",
    "role": "PROCUREMENT_OFFICER",
    "ministry_code": "MoRTH"
  },
  "feedback_type": "WRONG_STANDARD",
  "flagged_is_number": "IS 269:2015",
  "correct_is_number": "IS 269:2015",
  "officer_notes": "Recommendation is accurate, but IS 4032 chemical test should have high priority flag.",
  "verified": false,
  "verification_status": "PENDING"
}
```

### The Lock (How Application Consumes It):
- Clicking "Flag Recommendation" on any standard card opens the feedback modal pre-filled with `query_id`, `recommendation_id`, and `is_number`.
- Submitting dispatches `FeedbackRequest` and adds an optimistic badge `"Correction Pending Review"` to the UI.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/feedback/feedbackService.ts`: Manages submission, schema validation, and mock API endpoints.
2. `src/modules/feedback/reviewQueueStore.ts`: State container for pending expert moderation items.
3. `src/modules/feedback/trustScoreCalculator.ts`: Simulates community verification weighting and confidence adjustments.

### Edge-Case Handling:
- Duplicate feedback suppression: Disallows multiple identical submissions for the same query session.
- Offline queuing: Stores feedback locally if network is offline, syncing when reconnected.
