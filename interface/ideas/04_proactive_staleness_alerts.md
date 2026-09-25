# Feature 04: Proactive Staleness & Supersession Alerts (Push Notification Center)

## 1. Executive Summary & Value Proposition
Standards are living documents that undergo periodic revision, amendment, and withdrawal. A tender issued in January referencing `IS 1786:1985` becomes a legal and technical vulnerability if an amendment or new revision is published in June.
This feature provides a **Proactive Staleness & Supersession Notification Center** that monitors saved tender citations and alerts procurement officers whenever a standard in their active pipeline is amended or withdrawn.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Notification Drawer & Toast Alert System**: A real-time notification hub in the UI displaying high-priority alerts with severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Simulated WebSocket / Event Stream Consumer**: A reactive listener subscribing to `AlertPayload` events (mockable via mock event emitter or timer).
- **Tender Impact Matrix**: A component that maps an amended standard (e.g. `IS 269:2015 Amendment 2`) to an affected list of active NITs/Tenders (`NIT-PWD-2026-001`), highlighting the recommended corrective action.
- **Outdated Citation Diff Viewer**: Highlights the exact text changes between the cited edition and the new revision.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Live automated web scrapers polling BIS e-Gazette and Bureau of Indian Standards RSS portals 24/7.
- Production multi-tenant database of all historical tenders across all ministries.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`AlertPayload` & `StandardsResponse.staleness_risk` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "$schema": "SIH2026.AlertPayload.v1",
  "alert_id": "alt-3819-20ba-4821",
  "timestamp": "2026-09-26T10:30:00Z",
  "alert_type": "STANDARD_AMENDED",
  "severity": "HIGH",
  "affected_standard": {
    "is_number": "IS 269:2015",
    "event": "Amendment 2 published on 2026-09-20",
    "replacement": null
  },
  "affected_tenders": [
    {
      "tender_id": "NIT-PWD-2026-001",
      "ministry": "MoHUA",
      "officer_user_id": "officer_4091",
      "cited_version": "IS 269:2015 (Amendment 1)"
    }
  ],
  "recommended_action": "Review active tenders and update citation to include Amendment 2.",
  "deadline": "2026-10-31T23:59:59Z"
}
```

### The Lock (How Application Consumes It):
- Top navigation bar displays a bell icon with badge count of unread critical alerts.
- Clicking any alert opens the impact breakdown with 1-click "Generate Amendment Addendum" action.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/alerts/alertStore.ts`: State container managing alert history, read/unread states, and filtering by severity.
2. `src/modules/alerts/alertPayloadValidator.ts`: Type guards and schema checks for incoming alert events.
3. `src/modules/alerts/mockAlerts.ts`: Diverse alert scenarios (QCO enforcement dates, ISO harmonizations, standard withdrawals).

### Edge-Case Handling:
- No alerts active $\rightarrow$ Displays positive state: `"All standards in your portfolio are verified active"`.
- Critical alert deadline approaching ($< 7$ days) $\rightarrow$ Displays glowing amber countdown badge.
