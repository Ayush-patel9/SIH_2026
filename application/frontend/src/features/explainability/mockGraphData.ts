/**
 * mockGraphData.ts
 * Multi-domain presets for testing explainability and knowledge graphs across Indian procurement sectors.
 */

import cementMockRaw from '../../fixtures/cement_mock.json';
import type { StandardsResponse } from '../../types';

export const CEMENT_MOCK_DATA = cementMockRaw as unknown as StandardsResponse;

export const STEEL_MOCK_DATA: StandardsResponse = {
  $schema: "SIH2026.StandardsResponse.v1",
  meta: {
    query_id: "uuid-steel-4011",
    session_id: "sess-steel-9921",
    timestamp: "2026-09-26T10:15:00Z",
    processing_time_ms: 380,
    pipeline_version: "1.0.0",
    model_version: "gemini-2.5-pro",
    data_snapshot_date: "2026-09-26",
    audit_reference_hash: "a4f891b2c7e0921448fa918bca4891bca72891bb204918290ab9182301928301",
    mode: "recommend",
  },
  query_understanding: {
    detected_language: "en",
    original_text: "High tensile structural steel plates for railway bridge girders grade E250.",
    normalized_text: "high tensile structural steel plates railway bridge girders E250",
    extracted_entities: [
      { entity: "structural steel plates", type: "PRODUCT", confidence: 0.99 },
      { entity: "E250", type: "GRADE_SPECIFICATION", confidence: 0.97 },
      { entity: "railway bridge girders", type: "APPLICATION_DOMAIN", confidence: 0.94 },
    ],
    query_intent: "STANDARD_LOOKUP",
  },
  primary_recommendation: {
    is_number: "IS 2062:2011",
    standard_id: "IS 2062:2011",
    title: "Hot Rolled Medium and High Tensile Structural Steel — Specification",
    full_title: "IS 2062:2011 — Hot Rolled Medium and High Tensile Structural Steel — Specification (Seventh Revision)",
    status: "ACTIVE",
    year_published: 2011,
    latest_amendment: "Amendment 3 (2021)",
    superseded_by: null,
    supersedes: ["IS 226:1975", "IS 2062:2006"],
    scope_snippet: "Covers the requirements of steel plates, sections and bars for use in structural work, bridges and engineering structures.",
    division_code: "MTD",
    ics_codes: ["77.140.10"],
    confidence: 0.96,
    confidence_breakdown: {
      semantic_vector_score: 0.48,
      keyword_exact_match: 0.32,
      graph_co_citation_boost: 0.16,
    },
    certification: {
      scheme: "BIS_ISI_MARK",
      mandatory: true,
      qco_order_name: "Steel and Steel Products (Quality Control) Order, 2020",
      qco_gazette_ref: "S.O. 1678(E)",
      notifying_ministry: "Ministry of Steel",
      enforcement_date: "2020-05-27",
    },
  },
  allied_standards: [
    {
      is_number: "IS 1608 (Part 1)",
      standard_id: "IS 1608 (Part 1):2018",
      title: "Metallic Materials — Tensile Testing at Room Temperature",
      relation_type: "TEST_METHOD",
      relation_label: "Mandatory Mechanical Test",
      status: "ACTIVE",
      confidence: 0.93,
      why: "IS 2062 Clause 8.2 mandates tensile yield strength verification per IS 1608.",
    },
    {
      is_number: "IS 1757",
      standard_id: "IS 1757:1988",
      title: "Charpy V-Notch Impact Test on Metallic Materials",
      relation_type: "TEST_METHOD",
      relation_label: "Sub-Zero Impact Test",
      status: "ACTIVE",
      confidence: 0.88,
      why: "Required for E250 Quality C and D impact energy toughness verification.",
    },
  ],
  outdated_citations: [
    {
      cited_standard: "IS 226:1975",
      severity: "CRITICAL",
      status: "WITHDRAWN",
      reason: "Withdrawn in 2006 and merged into IS 2062.",
      replacement: "IS 2062:2011",
      message: "Citing legacy IS 226:1975 is prohibited for railway infrastructure tenders.",
    },
  ],
  compliance_checklist: [
    {
      item: "IS 2062:2011 Grade E250 Yield Strength (≥ 250.0 MPa)",
      status: "PASS",
      action_required: "Verify mill test certificate against IS 1608 (Part 1) test report",
    },
    {
      item: "Mandatory BIS ISI Mark on Structural Steel Plates",
      status: "PASS",
      action_required: "Ensure manufacturer CM/L license number is stamped on plate corners",
    },
  ],
  audit_record: {
    recommendation_id: "rec-steel-001",
    query_id: "uuid-steel-4011",
    timestamp: "2026-09-26T10:15:00Z",
    standards_version_snapshot: {
      "IS 2062:2011": {
        status_at_query_time: "ACTIVE",
        amendment_at_query_time: "Amendment 3 (2021)",
      },
    },
    audit_hash: "a4f891b2c7e0921448fa918bca4891bca72891bb204918290ab9182301928301",
    logged: true,
    dry_run: false,
    rti_exportable: true,
  },
  staleness_risk: {
    risk_level: "NONE",
    message: null,
    standards_under_revision: [],
  },
  multilingual: {
    bhashini_used: false,
    detected_input_language: "en",
    response_language: "en",
    available_translations: ["hi", "ta"],
  },
  graph_path: [
    {
      from: "Structural Steel E250",
      to: "IS 226:1975",
      edge_type: "HISTORICAL_SPEC",
      label: "Legacy Specification",
    },
    {
      from: "IS 226:1975",
      to: "IS 2062:2011",
      edge_type: "SUPERSEDED_BY",
      label: "Merged & Superseded by",
    },
    {
      from: "IS 2062:2011",
      to: "IS 1608 (Part 1)",
      edge_type: "REQUIRES_TEST_METHOD",
      label: "Mandates Tensile Test",
    },
    {
      from: "IS 2062:2011",
      to: "IS 1757",
      edge_type: "REQUIRES_TEST_METHOD",
      label: "Mandates Charpy Impact",
    },
  ],
  reasoning_trace: [
    {
      step: "query_understanding",
      detail: "Identified product 'Structural Steel Plates', grade 'E250', domain 'Railway Bridge'.",
      confidence: 0.99,
    },
    {
      step: "vector_retrieval",
      detail: "Dense vector search returned IS 2062:2011 (similarity 0.96) over 14 steel specifications.",
      confidence: 0.95,
    },
    {
      step: "graph_traversal",
      detail: "Verified legacy IS 226 is withdrawn; linked mandatory tensile test IS 1608 (Part 1).",
      confidence: 1.0,
    },
    {
      step: "qco_compliance_lookup",
      detail: "Steel Products QCO 2020 mandates BIS ISI certification under Section 16 of the BIS Act.",
      confidence: 0.99,
    },
  ],
  plain_language_explanation: {
    enabled: true,
    text: "For E250 structural steel bridge girders, specify IS 2062:2011. Do not cite IS 226 (withdrawn). Mandatory BIS ISI certification is strictly enforced by Ministry of Steel QCO 2020.",
  },
};

export const DOMAIN_PRESETS: Record<string, { label: string; isCode: string; data: StandardsResponse }> = {
  cement: {
    label: "Ordinary Portland Cement (IS 269)",
    isCode: "IS 269:2015",
    data: CEMENT_MOCK_DATA,
  },
  steel: {
    label: "Structural Steel (IS 2062)",
    isCode: "IS 2062:2011",
    data: STEEL_MOCK_DATA,
  },
};
