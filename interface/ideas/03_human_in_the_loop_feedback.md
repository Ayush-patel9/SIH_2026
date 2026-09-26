# Feature 03 — Human-in-the-Loop Feedback & Review Queue
## Flag Recommendation · Expert Moderation · Trust Score Lifecycle

---

## WHY THIS EXISTS

No AI system is correct 100% of the time. A domain expert — a BIS Technical Committee member, a senior procurement officer, a NABL lab head — may see a recommendation and know it is wrong. This feature provides the **correction mechanism** so the system improves over time and bad recommendations don't persist. It also signals to evaluators that the system is not arrogant — it accepts human authority.

---

## DESIGN (SIH Color System)

- `--superposition-violet: #6E5AD6` → Feedback pending / under review
- `--collapse-cobalt: #1B4FE0` → Verified correct
- `--signal-amber: #E0982B` → Requires attention
- `--error-line: #C23B3B` → Verified incorrect
- Font: `JetBrains Mono` for IS numbers, status codes, IDs
- Font: `Literata` for officer notes and correction text

---

## COMPONENT 1 — `FlagButton` (Inline on every recommendation card)

### What It Is
A small flag icon button that appears below every standard recommendation card. Clicking it opens the FeedbackModal.

### Render Condition
```js
// Always show — no pipeline data needed to render this button
// It does NOT need to receive any prop from the pipeline
// The query_id and recommendation_id come from the response object
const FlagButton = ({ queryId, recommendationId, isNumber }) => (
  <button
    className="btn-secondary flag-btn"
    onClick={() => openFeedbackModal({ queryId, recommendationId, isNumber })}
  >
    ⚑ Flag this recommendation
  </button>
);
```

---

## COMPONENT 2 — `FeedbackModal` (Correction Form)

### What It Is
A slide-in panel (not a blocking modal) from the right side. Contains a structured form that builds the `FeedbackRequest` payload.

### Form Fields (mapped exactly to `FeedbackRequest` schema)
```
1. Feedback Type         [Dropdown]
   Options: WRONG_STANDARD | OUTDATED_STANDARD | MISSING_ALLIED_STANDARD |
            WRONG_CERTIFICATION | FALSE_OUTDATED_FLAG | OTHER

2. Flagged IS Number     [Read-only, auto-filled from the card that was flagged]
   e.g., "IS 269:2015"

3. What should it be?    [Text input — free-form OR search from catalog]
   e.g., "IS 1489 (Part 1):2015"

4. Your Notes            [Textarea, max 500 chars]
   e.g., "For fly-ash based concrete, PPC is more appropriate than OPC"

5. Your Role             [Dropdown]
   Options: PROCUREMENT_OFFICER | AUDITOR | BIS_EXPERT
```

### Payload Construction
```js
function buildFeedbackPayload(formValues, originalQueryId, originalRecId, submitterInfo) {
  return {
    $schema: "SIH2026.FeedbackRequest.v1",
    feedback_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    original_query_id: originalQueryId,
    original_recommendation_id: originalRecId,
    submitter: {
      user_id: submitterInfo.userId || 'anonymous',
      role: formValues.role,
      ministry_code: submitterInfo.ministryCode || 'GENERAL',
    },
    feedback_type: formValues.feedbackType,
    flagged_is_number: formValues.flaggedIsNumber,
    correct_is_number: formValues.correctIsNumber || null,
    officer_notes: formValues.notes,
    verified: false,
    verification_status: 'PENDING',
  };
}
```

### On Submit
```js
// 1. Save to local FeedbackStore
FeedbackStore.save(payload);

// 2. Show optimistic UI update: "Correction pending expert review"
// The flagged card gets a violet badge: "⚑ Correction Submitted"

// 3. When pipeline is live → POST to /api/feedback
// Until then → store locally, dump JSON when "Export Feedback" is clicked
```

---

## COMPONENT 3 — `ReviewQueue` (Admin / Expert Panel)

### What It Is
A table view listing all pending feedback items. Each row shows the flagged standard, the correction proposed, the officer's notes, and action buttons.

### Data Source
```js
// Pure client-side — reads from FeedbackStore.getAll()
// No pipeline dependency at all
const pendingItems = FeedbackStore.getAll()
  .filter(f => f.verification_status === 'PENDING');
```

### Row Actions
```
[Approve Correction] → sets verification_status: 'VERIFIED_CORRECT'
                        shows cobalt checkmark, updates trust score display

[Reject]             → sets verification_status: 'VERIFIED_INCORRECT'
                        shows red X

[Escalate to BIS]    → sets verification_status: 'ESCALATED'
                        shows amber escalation badge
```

### Trust Score Display
```js
// Show a simple percentage next to each IS number recommendation
// based on how many feedback items it has received vs how many were verified correct
function computeTrustScore(isNumber, feedbackStore) {
  const relevant = feedbackStore.filter(f => f.flagged_is_number === isNumber);
  if (relevant.length === 0) return null; // no feedback = no trust score displayed
  const verified = relevant.filter(f => f.verification_status === 'VERIFIED_CORRECT').length;
  const incorrect = relevant.filter(f => f.verification_status === 'VERIFIED_INCORRECT').length;
  const total = relevant.length;
  return {
    score: Math.round(((total - incorrect) / total) * 100),
    feedbackCount: total,
  };
}
```

---

## COMPONENT 4 — `FeedbackStore` (Local State Manager)

```js
const STORE_KEY = 'manakAI:feedbackQueue';

const FeedbackStore = {
  save(payload) {
    const existing = this.getAll();
    existing.unshift(payload);
    localStorage.setItem(STORE_KEY, JSON.stringify(existing));
  },

  getAll() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch { return []; }
  },

  updateStatus(feedbackId, newStatus) {
    const all = this.getAll();
    const idx = all.findIndex(f => f.feedback_id === feedbackId);
    if (idx >= 0) {
      all[idx].verification_status = newStatus;
      all[idx].verified = ['VERIFIED_CORRECT', 'VERIFIED_INCORRECT'].includes(newStatus);
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
    }
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.getAll(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ManakAI_Feedback_Export.json'; a.click();
  }
};
```

---

## FILE STRUCTURE

```
application/frontend/src/
└── features/
    └── feedback/
        ├── feedbackStore.js       ← FeedbackStore
        ├── feedbackBuilder.js     ← buildFeedbackPayload()
        ├── trustScoreCalc.js      ← computeTrustScore()
        ├── FlagButton.jsx         ← Component 1
        ├── FeedbackModal.jsx      ← Component 2
        └── ReviewQueue.jsx        ← Component 3
```

---

## KEY-AND-LOCK WIRING

```js
// Placed inside the recommendation card component
<FlagButton
  queryId={response.audit_record.query_id}
  recommendationId={response.audit_record.recommendation_id}
  isNumber={response.primary_recommendation.is_number}
/>

// Placed in admin / expert view
<ReviewQueue items={FeedbackStore.getAll()} onStatusChange={FeedbackStore.updateStatus} />
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not build a backend API endpoint (out of scope for parallel development)
- ❌ Do not import anything from `pipeline/`
- ❌ Do not automate retraining of any vector model
