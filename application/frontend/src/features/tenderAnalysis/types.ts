/**
 * TypeScript Interfaces for 3-Stage Tender Intelligence Pipeline & Unified Dashboard
 */

export interface TenderMetadata {
  title: string;
  department: string;
  estimated_value?: string;
  tender_type?: string;
}

export interface ExtractedProductItem {
  product_id: string;
  product_name: string;
  clause_number: string;
  page_number: number;
  verbatim_quote: string;
  cited_standard_in_doc?: string;
  search_queries: string[];
}

export interface DecomposeResponse {
  tender_metadata: TenderMetadata;
  products: ExtractedProductItem[];
}

export interface ClarificationOption {
  option_id: string;
  label: string;
  technical_implication: string;
  maps_to_candidate?: string;
}

export interface ClarificationQuestion {
  question_id: string;
  question_text: string;
  engineering_context: string;
  options: ClarificationOption[];
}

export interface StandardCandidate {
  is_number: string;
  title: string;
  confidence: number;
  match_reasons: string[];
  status?: string;
  is_withdrawn?: boolean;
  superseded_by?: string;
  qco_mandatory?: boolean;
}

export interface MappedProductItem {
  product_id: string;
  product_name: string;
  clause_number: string;
  page_number: number;
  verbatim_quote: string;
  detected_outdated_is?: string;
  recommended_is: string;
  recommended_is_title: string;
  confidence_score: number;
  all_candidates: StandardCandidate[];
  engineering_rationale: string;
  qco_mandate?: {
    mandatory: boolean;
    order_name: string;
    scheme: string;
  };
  clarification_needed: boolean;
  clarification_question?: ClarificationQuestion;
  officer_clarification_answer?: string;
  officer_override_is?: string;
  status: 'RESOLVED' | 'NEEDS_CLARIFICATION' | 'OVERRIDDEN';
}

export interface Stage2MapResponse {
  mapped_products: MappedProductItem[];
  high_risk_outdated_count: number;
  mandatory_qco_count: number;
}

export interface ClarifyResponse {
  product_id: string;
  resolved_is: string;
  resolved_title: string;
  revised_confidence: number;
  engineering_rationale: string;
  status: 'RESOLVED' | 'OVERRIDDEN';
}

export interface FinalizedClauseDiff {
  product_id: string;
  product_name: string;
  clause_number: string;
  page_number: number;
  original_clause: string;
  modernized_clause: string;
  added_qco_clause?: string;
  added_nabl_clause?: string;
  verbatim_quote: string;
  designated_standard: string;
}

export interface NITScheduleItem {
  item_no: number;
  item_description: string;
  mandatory_indian_standard: string;
  grade_or_type: string;
  conformity_scheme: string;
  mandatory_testing_standards: string[];
}

export interface Stage3FinalizeResponse {
  clause_diffs: FinalizedClauseDiff[];
  nit_specification_schedule: NITScheduleItem[];
  full_nit_draft_text: string;
  cvc_audit_record: {
    audit_hash: string;
    gfr_rule_compliance: string;
    timestamp_utc: string;
    total_clauses_modernized: number;
  };
}

export interface StandardDetailResponse {
  is_number: string;
  title: string;
  publication_year: number;
  edition: string;
  status: 'ACTIVE' | 'WITHDRAWN' | 'SUPERSEDED' | 'AMENDED';
  superseded_by?: string;
  scope_snippet: string;
  mandatory_qco?: {
    mandatory: boolean;
    order_name: string;
    gazette_date: string;
    scheme: string;
  };
  normative_test_standards: string[];
  amendments: string[];
}

export interface TenderChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
