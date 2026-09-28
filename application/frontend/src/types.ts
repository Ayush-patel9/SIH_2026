/**
 * Canonical TypeScript Interfaces for SIH 2026 — BIS Standards Intelligence Platform
 * Generated directly from API_CONTRACT_SCHEMA.md
 */

// ==========================================
// 1. Schema 1: QueryRequest (Client → API)
// ==========================================

export type UserRole = 'OFFICER' | 'VENDOR' | 'AUDITOR' | 'ADMIN';
export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'gu' | 'mr' | 'bn';
export type QuerySource = 'direct_query' | 'tender_upload' | 'gem_integration' | 'cppp_integration';
export type QueryMode = 'recommend' | 'audit' | 'dry_run' | 'vendor_check';
export type ExplainMode = 'VERBOSE' | 'COMPACT' | 'PLAIN_LANGUAGE';

export interface QueryAuth {
  role: UserRole;
  user_id?: string;
  ministry_code?: string;
}

export interface QueryInput {
  text: string;
  language?: SupportedLanguage;
  source?: QuerySource;
  mode?: QueryMode;
}

export interface QueryContext {
  product_category?: string;
  known_standards?: string[];
  procurement_value_inr?: number;
  project_type?: 'highway' | 'building' | 'electrical' | 'IT' | 'general' | string;
}

export interface QueryPreferences {
  explain_mode?: ExplainMode;
  include_graph_path?: boolean;
  include_allied_standards?: boolean;
  max_results?: number;
}

export interface QueryRequest {
  $schema?: string;
  query_id: string;
  session_id: string;
  timestamp: string;
  auth?: QueryAuth;
  input: QueryInput;
  context?: QueryContext;
  preferences?: QueryPreferences;
}

// ==========================================
// 2. Schema 2: StandardsResponse (API → Client)
// ==========================================

export interface ResponseMeta {
  query_id: string;
  session_id: string;
  timestamp: string;
  processing_time_ms: number;
  pipeline_version: string;
  model_version?: string;
  data_snapshot_date?: string;
  audit_reference_hash: string;
  mode: QueryMode;
}

export type EntityType = 'PRODUCT' | 'GRADE_SPECIFICATION' | 'APPLICATION_DOMAIN' | 'TEST_PARAMETER';
export type QueryIntent = 'STANDARD_LOOKUP' | 'COMPLIANCE_CHECK' | 'ALLIED_DISCOVERY' | 'OUTDATED_DETECTION';

export interface ExtractedEntity {
  entity: string;
  type: EntityType;
  confidence: number;
}

export interface AmbiguityOption {
  value: string;
  label: string;
  description?: string;
}

export interface AmbiguityFlag {
  dimension: string;
  message: string;
  options: AmbiguityOption[];
}

export interface QueryUnderstanding {
  detected_language: string;
  original_text: string;
  normalized_text: string;
  extracted_entities: ExtractedEntity[];
  query_intent: QueryIntent;
  product_name?: string;
  grade_specification?: string;
  domain?: string;
  subdomain?: string;
  product_codes?: string[];
  location_context?: string;
  confidence?: number;
  ambiguity_flags?: AmbiguityFlag[];
}

export type StandardStatus = 'ACTIVE' | 'WITHDRAWN' | 'SUPERSEDED' | 'UNDER_REVISION';
export type CertificationScheme = 'BIS_ISI_MARK' | 'BIS_CRS' | 'BIS_HALLMARK' | 'VOLUNTARY';

export interface ConfidenceBreakdown {
  semantic_vector_score?: number;
  keyword_exact_match?: number;
  graph_co_citation_boost?: number;
}

export interface CertificationDetails {
  scheme: CertificationScheme;
  mandatory: boolean;
  qco_order_name?: string | null;
  qco_gazette_ref?: string | null;
  notifying_ministry?: string | null;
  enforcement_date?: string | null;
}

export interface PrimaryRecommendation {
  is_number: string;
  standard_id?: string;
  title: string;
  full_title?: string;
  status: StandardStatus;
  year_published?: number | null;
  latest_amendment?: string | null;
  superseded_by?: string | null;
  supersedes?: string[];
  scope_snippet?: string;
  division_code?: string;
  ics_codes?: string[];
  confidence: number;
  confidence_breakdown?: ConfidenceBreakdown;
  certification: CertificationDetails;
}

export type AlliedRelationType =
  | 'TEST_METHOD'
  | 'NORMATIVE_REFERENCE'
  | 'RAW_MATERIAL_SPEC'
  | 'INSTALLATION_CODE'
  | 'SAFETY_STANDARD'
  | 'TERMINOLOGY_STANDARD'
  | 'RELATED_PRODUCT'
  | 'DIMENSIONAL_STANDARD'
  | 'CROSS_DISCIPLINARY';

export interface AlliedStandard {
  is_number: string;
  standard_id?: string;
  title: string;
  relation_type: AlliedRelationType;
  relation_label?: string;
  status: StandardStatus | string;
  confidence: number;
  why?: string;
}

export type CitationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface OutdatedCitation {
  cited_standard: string;
  severity: CitationSeverity;
  status: string;
  reason: string;
  replacement: string | null;
  message: string;
}

export interface GraphPathEdge {
  from: string;
  to: string;
  edge_type: string;
  label: string;
}

export interface ReasoningStep {
  step: string;
  detail: string;
  confidence: number;
}

export interface PlainLanguageExplanation {
  enabled: boolean;
  text: string;
}

export type ChecklistStatus = 'PASS' | 'FAIL' | 'WARNING' | 'NOT_CHECKED';

export interface ComplianceChecklistItem {
  item: string;
  status: ChecklistStatus;
  action_required: string;
}

export interface StandardVersionSnapshot {
  [is_number: string]: {
    status_at_query_time: string;
    amendment_at_query_time?: string;
  };
}

export interface AuditRecord {
  recommendation_id: string;
  query_id: string;
  timestamp: string;
  standards_version_snapshot: StandardVersionSnapshot;
  audit_hash: string;
  logged: boolean;
  dry_run: boolean;
  rti_exportable: boolean;
}

export type StalenessRiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StalenessRisk {
  risk_level: StalenessRiskLevel;
  message: string | null;
  standards_under_revision: string[];
}

export interface MultilingualInfo {
  bhashini_used?: boolean;
  detected_input_language: string;
  response_language: string;
  available_translations: string[];
}

export interface AlternativeRecommendation {
  is_number: string;
  standard_id?: string;
  title: string;
  full_title?: string;
  status: StandardStatus | string;
  year_published?: number | null;
  amendment?: string | null;
  latest_amendment?: string | null;
  certification?: CertificationDetails;
  scope_snippet?: string;
  confidence: number;
  why_not_primary?: string;
}

export interface ConflictResolution {
  winner: string;
  loser: string;
  rule: string;
  confidence_gap: number;
}

export interface StandardsResponse {
  $schema?: string;
  meta: ResponseMeta;
  query_understanding: QueryUnderstanding;
  primary_recommendation: PrimaryRecommendation;
  alternative_recommendations?: AlternativeRecommendation[];
  conflict_resolution?: ConflictResolution;
  allied_standards: AlliedStandard[];
  outdated_citations: OutdatedCitation[];
  graph_path: GraphPathEdge[];
  reasoning_trace: ReasoningStep[];
  plain_language_explanation: PlainLanguageExplanation;
  compliance_checklist: ComplianceChecklistItem[];
  audit_record: AuditRecord;
  staleness_risk: StalenessRisk;
  multilingual: MultilingualInfo;
}

// ==========================================
// 3. Schema 3: FeedbackRequest (Client → API)
// ==========================================

export type FeedbackType =
  | 'WRONG_STANDARD'
  | 'OUTDATED_STANDARD'
  | 'MISSING_ALLIED_STANDARD'
  | 'WRONG_CERTIFICATION'
  | 'FALSE_OUTDATED_FLAG'
  | 'OTHER';

export type VerificationStatus = 'PENDING' | 'VERIFIED_CORRECT' | 'VERIFIED_INCORRECT' | 'ESCALATED';

export interface FeedbackSubmitter {
  user_id: string;
  role: UserRole;
  ministry_code?: string;
}

export interface FeedbackRequest {
  $schema?: string;
  feedback_id: string;
  timestamp: string;
  original_query_id: string;
  original_recommendation_id: string;
  submitter: FeedbackSubmitter;
  feedback_type: FeedbackType;
  flagged_is_number: string;
  correct_is_number?: string;
  officer_notes?: string;
  verified?: boolean;
  verification_status: VerificationStatus;
}

// ==========================================
// 4. Schema 4: AlertPayload (API → Client Push)
// ==========================================

export type AlertType =
  | 'STANDARD_SUPERSEDED'
  | 'STANDARD_AMENDED'
  | 'STANDARD_WITHDRAWN'
  | 'STANDARD_UNDER_REVISION'
  | 'QCO_ENFORCEMENT_DATE'
  | 'NEW_MANDATORY_STANDARD';

export interface AffectedStandard {
  is_number: string;
  event: string;
  replacement?: string | null;
}

export interface AffectedTender {
  tender_id: string;
  ministry: string;
  officer_user_id: string;
  cited_version: string;
}

export interface AlertPayload {
  $schema?: string;
  alert_id: string;
  timestamp: string;
  alert_type: AlertType;
  severity: CitationSeverity;
  affected_standard: AffectedStandard;
  affected_tenders: AffectedTender[];
  recommended_action: string;
  deadline?: string | null;
}
