# API Contract Schema Specification
## SIH 2026 — BIS Standards Intelligence Platform

---

## 📌 Document Overview & Purpose

This document defines the **canonical API contracts and JSON schemas** for the SIH 2026 BIS Standards Intelligence Platform. 

It serves as the **unbreakable contract** between:
1. **Pipeline & Graph Engineers**: Defines the exact data structures and types that the RAG retrieval, Knowledge Graph traversal, and LLM reasoning stages must produce.
2. **Frontend & UI Engineers**: Provides stable, mockable contracts to build search interfaces, recommendation cards, explainability graph viewers, compliance checklists, and audit panels.
3. **Adapter & Gateway Layer**: Defines minimum guaranteed fields, fallback defaults, and validation rules ensuring the API never breaks even during partial component timeouts.

> **Golden Rule**: *The API contract is the single source of truth. All pipeline modules and LLM tasks adapt their outputs to conform to this specification.*

---

## 🏛️ Schema Architecture (4 Distinct Contracts)

| # | Schema Name | Direction | Primary Purpose |
|---|-------------|-----------|-----------------|
| 1 | `QueryRequest` | Client → API | User query, tender text, language, role context, and query preferences |
| 2 | `StandardsResponse` | API → Client | Full intelligence payload (recommendation, allied standards, explainability trace, compliance checklist, audit record) |
| 3 | `FeedbackRequest` | Client → API | Human-in-the-loop expert corrections and audit feedback |
| 4 | `AlertPayload` | API → Client (Push) | Staleness, supersession, and QCO notification alerts |

---

## 1. Schema 1: `QueryRequest`

Sent by the frontend or external integration (e.g. GeM / CPPP portal).

```json
{
  "$schema": "SIH2026.QueryRequest.v1",
  "query_id": "uuid-v4-string",
  "session_id": "uuid-v4-string",
  "timestamp": "2026-09-26T10:00:00Z",
  "auth": {
    "role": "PROCUREMENT_OFFICER | AUDITOR | VENDOR | BIS_EXPERT",
    "user_id": "string",
    "ministry_code": "MoS | MoHUA | MeitY | MoRTH | MoD | GENERAL"
  },
  "input": {
    "text": "Procurement of 43 grade ordinary portland cement for highway construction.",
    "language": "en | hi | ta | te | gu | mr | bn",
    "source": "direct_query | tender_upload | gem_integration | cppp_integration",
    "mode": "recommend | audit | dry_run | vendor_check"
  },
  "context": {
    "product_category": "string — optional GeM/NIC category override",
    "known_standards": ["IS 269", "IS 4031"],
    "procurement_value_inr": 50000000,
    "project_type": "highway | building | electrical | IT | general"
  },
  "preferences": {
    "explain_mode": "VERBOSE | COMPACT | PLAIN_LANGUAGE",
    "include_graph_path": true,
    "include_allied_standards": true,
    "max_results": 5
  }
}
```

### Key Request Fields:
- `mode: "dry_run"`: Evaluates tender citations without committing entries to the permanent audit trail.
- `role`: Dictates server-side field redaction / tailored views (Auditor sees complete trace; Vendor sees compliance checklist).
- `known_standards`: Captures standards already referenced in a tender draft to verify supersession.
- `language`: Passed through Bhashini translation/transliteration pipeline before vector retrieval.

---

## 2. Schema 2: `StandardsResponse` (Core Intelligence Contract)

The primary response payload. Every top-level object directly backs a dedicated frontend UI module.

```json
{
  "$schema": "SIH2026.StandardsResponse.v1",

  "meta": {
    "query_id": "uuid-9f8a-4b2c-11e9",
    "session_id": "sess-4a81-98fc",
    "timestamp": "2026-09-26T10:00:01Z",
    "processing_time_ms": 423,
    "pipeline_version": "1.0.0",
    "model_version": "gemini-2.5-pro",
    "data_snapshot_date": "2026-09-26",
    "audit_reference_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "mode": "recommend"
  },

  "query_understanding": {
    "detected_language": "en",
    "original_text": "Procurement of 43 grade ordinary portland cement for highway construction.",
    "normalized_text": "ordinary portland cement 43 grade highway construction",
    "extracted_entities": [
      {
        "entity": "ordinary portland cement",
        "type": "PRODUCT",
        "confidence": 0.98
      },
      {
        "entity": "43 grade",
        "type": "GRADE_SPECIFICATION",
        "confidence": 0.96
      },
      {
        "entity": "highway construction",
        "type": "APPLICATION_DOMAIN",
        "confidence": 0.92
      }
    ],
    "query_intent": "STANDARD_LOOKUP"
  },

  "primary_recommendation": {
    "is_number": "IS 269:2015",
    "standard_id": "IS 269:2015",
    "title": "Ordinary Portland Cement — Specification",
    "full_title": "IS 269:2015 — Ordinary Portland Cement — Specification (Fifth Revision)",
    "status": "ACTIVE",
    "year_published": 2015,
    "latest_amendment": "Amendment 1 (2019)",
    "superseded_by": null,
    "supersedes": ["IS 8112:1989", "IS 12269:1987", "IS 269:1989"],
    "scope_snippet": "This standard covers the manufacture, physical and chemical requirements of 33, 43 and 53 grade ordinary Portland cement.",
    "division_code": "CED",
    "ics_codes": ["91.100.10"],
    "confidence": 0.94,
    "confidence_breakdown": {
      "semantic_vector_score": 0.45,
      "keyword_exact_match": 0.30,
      "graph_co_citation_boost": 0.19
    },
    "certification": {
      "scheme": "BIS_ISI_MARK",
      "mandatory": true,
      "qco_order_name": "Cement (Quality Control) Order, 2003",
      "qco_gazette_ref": "GSR 739(E)",
      "notifying_ministry": "Ministry of Commerce and Industry",
      "enforcement_date": "2003-11-28"
    }
  },

  "allied_standards": [
    {
      "is_number": "IS 4031 (Part 1)",
      "standard_id": "IS 4031 (Part 1):1996",
      "title": "Methods of Physical Tests for Hydraulic Cement — Determination of Fineness",
      "relation_type": "TEST_METHOD",
      "relation_label": "Mandatory Physical Test",
      "status": "ACTIVE",
      "confidence": 0.91,
      "why": "IS 269:2015 Clause 6.1 mandates fineness testing in accordance with IS 4031 (Part 1)."
    },
    {
      "is_number": "IS 4032",
      "standard_id": "IS 4032:1985",
      "title": "Method of Chemical Analysis of Hydraulic Cement",
      "relation_type": "TEST_METHOD",
      "relation_label": "Mandatory Chemical Test",
      "status": "ACTIVE",
      "confidence": 0.89,
      "why": "IS 269:2015 Clause 5.1 mandates chemical composition verification via IS 4032."
    },
    {
      "is_number": "IS 4990",
      "standard_id": "IS 4990:2011",
      "title": "Plywood for Concrete Shuttering Work — Specification",
      "relation_type": "CROSS_DISCIPLINARY",
      "relation_label": "Common Co-citation in Highway Projects",
      "status": "ACTIVE",
      "confidence": 0.76,
      "why": "Frequently co-procured for formwork in highway bridge and culvert construction."
    }
  ],

  "outdated_citations": [
    {
      "cited_standard": "IS 8112:1989",
      "severity": "CRITICAL",
      "status": "WITHDRAWN",
      "reason": "Withdrawn and consolidated into IS 269:2015 (Fifth Revision).",
      "replacement": "IS 269:2015",
      "message": "Draft mentions 43-grade cement using IS 8112:1989. This standard was withdrawn in 2015. Citing it in active tenders violates CVC procurement guidelines."
    }
  ],

  "graph_path": [
    {
      "from": "43 Grade Cement",
      "to": "IS 8112:1989",
      "edge_type": "HISTORICAL_SPEC",
      "label": "Historically governed by"
    },
    {
      "from": "IS 8112:1989",
      "to": "IS 269:2015",
      "edge_type": "SUPERSEDED_BY",
      "label": "Consolidated into"
    },
    {
      "from": "IS 269:2015",
      "to": "IS 4031 (Part 1)",
      "edge_type": "REQUIRES_TEST_METHOD",
      "label": "Mandates testing via"
    }
  ],

  "reasoning_trace": [
    {
      "step": "query_understanding",
      "detail": "Identified product 'Ordinary Portland Cement', grade '43', domain 'Highway'.",
      "confidence": 0.98
    },
    {
      "step": "vector_retrieval",
      "detail": "Dense vector search returned IS 269:2015 (score 0.92) and IS 8112:1989 (score 0.88).",
      "confidence": 0.92
    },
    {
      "step": "graph_traversal",
      "detail": "Knowledge graph verified IS 8112:1989 is WITHDRAWN and consolidated into IS 269:2015.",
      "confidence": 1.0
    },
    {
      "step": "qco_compliance_lookup",
      "detail": "Verified Cement (Quality Control) Order 2003 mandates BIS ISI certification for IS 269.",
      "confidence": 0.99
    }
  ],

  "plain_language_explanation": {
    "enabled": true,
    "text": "For 43 grade Ordinary Portland Cement, the applicable Indian Standard is **IS 269:2015**. Note that older references like IS 8112:1989 have been withdrawn and consolidated into IS 269. Under the Cement QCO (2003), BIS ISI certification is legally mandatory. Tender clauses must also specify fineness testing as per IS 4031 (Part 1)."
  },

  "compliance_checklist": [
    {
      "item": "Cite IS 269:2015 in tender specification (do not cite withdrawn IS 8112:1989)",
      "status": "PASS",
      "action_required": "Ensure technical bid references IS 269:2015."
    },
    {
      "item": "Mandatory BIS ISI Mark requirement clause",
      "status": "WARNING",
      "action_required": "Insert clause: 'Supplied cement must bear valid BIS Certification mark under Cement QCO.'"
    },
    {
      "item": "Include IS 4031 test certificate submission",
      "status": "PASS",
      "action_required": "Require vendor to provide 7-day and 28-day compressive strength test reports."
    }
  ],

  "audit_record": {
    "recommendation_id": "rec-6d2f-48e2-b184",
    "query_id": "uuid-9f8a-4b2c-11e9",
    "timestamp": "2026-09-26T10:00:01Z",
    "standards_version_snapshot": {
      "IS 269:2015": {
        "status_at_query_time": "ACTIVE",
        "amendment_at_query_time": "Amendment 1 (2019)"
      }
    },
    "audit_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "logged": true,
    "dry_run": false,
    "rti_exportable": true
  },

  "staleness_risk": {
    "risk_level": "NONE",
    "message": "All recommended standards are active and up to date.",
    "standards_under_revision": []
  },

  "multilingual": {
    "bhashini_used": false,
    "detected_input_language": "en",
    "response_language": "en",
    "available_translations": ["hi", "ta", "te", "mr", "gu", "bn"]
  }
}
```

---

## 3. Schema 3: `FeedbackRequest` (Human-in-the-Loop Audit)

Triggered when an expert or procurement officer reviews or flags a recommendation.

```json
{
  "$schema": "SIH2026.FeedbackRequest.v1",
  "feedback_id": "fbk-9102-482a-bc91",
  "timestamp": "2026-09-26T10:15:00Z",
  "original_query_id": "uuid-9f8a-4b2c-11e9",
  "original_recommendation_id": "rec-6d2f-48e2-b184",
  "submitter": {
    "user_id": "officer_4091",
    "role": "PROCUREMENT_OFFICER | AUDITOR | BIS_EXPERT",
    "ministry_code": "MoRTH"
  },
  "feedback_type": "WRONG_STANDARD | OUTDATED_STANDARD | MISSING_ALLIED_STANDARD | WRONG_CERTIFICATION | FALSE_OUTDATED_FLAG | OTHER",
  "flagged_is_number": "IS 269:2015",
  "correct_is_number": "IS 269:2015",
  "officer_notes": "Recommendation is accurate, but IS 4032 chemical test should have high priority flag.",
  "verified": false,
  "verification_status": "PENDING | VERIFIED_CORRECT | VERIFIED_INCORRECT | ESCALATED"
}
```

---

## 4. Schema 4: `AlertPayload` (Staleness & Supersession Alerts)

Delivered via Server-Sent Events (SSE), WebSockets, or email notifications when a standard referenced in a past tender is revised or withdrawn.

```json
{
  "$schema": "SIH2026.AlertPayload.v1",
  "alert_id": "alt-3819-20ba-4821",
  "timestamp": "2026-09-26T10:30:00Z",
  "alert_type": "STANDARD_SUPERSEDED | STANDARD_AMENDED | STANDARD_WITHDRAWN | QCO_ENFORCEMENT_DATE | NEW_MANDATORY_STANDARD",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
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

---

## 🛡️ Minimum Guaranteed Field Guarantees (Adapter Layer)

Even in the event of an internal timeout or pipeline error, the API adapter **must never fail schema validation**. If partial data is missing, the following defaults are enforced:

| Field Path | Type | Nullable | Safe Default Fallback |
|---|---|---|---|
| `meta.query_id` | string | No | `uuid4()` |
| `meta.timestamp` | ISO-8601 | No | `datetime.now(timezone.utc).isoformat()` |
| `meta.audit_reference_hash` | string | No | SHA256 of `query_id + timestamp` |
| `primary_recommendation.is_number` | string | No | `"UNKNOWN"` |
| `primary_recommendation.status` | enum | No | `"ACTIVE"` |
| `primary_recommendation.confidence` | float | No | `0.0` |
| `primary_recommendation.certification` | object | No | `{"scheme": "VOLUNTARY", "mandatory": false}` |
| `allied_standards` | array | No | `[]` |
| `outdated_citations` | array | No | `[]` |
| `graph_path` | array | No | `[]` |
| `reasoning_trace` | array | No | `[]` |
| `compliance_checklist` | array | No | `[]` |
| `audit_record.logged` | boolean | No | `true` |
| `audit_record.dry_run` | boolean | No | `false` |
| `staleness_risk.risk_level` | enum | No | `"NONE"` |

---

## 🗺️ Feature-to-Schema Mapping

| Platform Feature | Backing Schema Fields |
|---|---|
| **Explainable AI (XAI)** | `reasoning_trace`, `confidence_breakdown`, `plain_language_explanation` |
| **Audit Defense & CVC Compliance** | `audit_record` (`audit_hash`, snapshot, `rti_exportable`) |
| **Human-in-the-Loop Feedback** | `FeedbackRequest` schema with `verification_status` lifecycle |
| **Proactive Staleness Engine** | `staleness_risk`, `outdated_citations`, `AlertPayload` |
| **Bhashini Multilingual** | `QueryRequest.input.language`, `StandardsResponse.multilingual` |
| **GeM / CPPP Procurement Sandbox** | `QueryRequest.input.source`, `mode: "dry_run"`, `mode: "vendor_check"` |
| **Role-Based Views** | `QueryRequest.auth.role` filters visibility of `reasoning_trace` & `audit_record` |
| **Knowledge Graph Interactive UI** | `graph_path` nodes & edges array |
