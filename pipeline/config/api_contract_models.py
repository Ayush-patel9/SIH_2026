from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import uuid

# --- Schema 1: QueryRequest ---

class AuthContext(BaseModel):
    role: str = "PROCUREMENT_OFFICER"  # PROCUREMENT_OFFICER | AUDITOR | VENDOR | BIS_EXPERT
    user_id: Optional[str] = "officer_default"
    ministry_code: Optional[str] = "GENERAL"

class QueryInput(BaseModel):
    text: str
    language: str = "en"
    source: str = "direct_query"  # direct_query | tender_upload | gem_integration | cppp_integration
    mode: str = "recommend"       # recommend | audit | dry_run | vendor_check

class QueryContext(BaseModel):
    product_category: Optional[str] = None
    known_standards: List[str] = Field(default_factory=list)
    procurement_value_inr: Optional[float] = None
    project_type: Optional[str] = "general"

class QueryPreferences(BaseModel):
    explain_mode: str = "VERBOSE"  # VERBOSE | COMPACT | PLAIN_LANGUAGE
    include_graph_path: bool = True
    include_allied_standards: bool = True
    max_results: int = 5

class QueryRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    schema_version: str = Field(default="SIH2026.QueryRequest.v1", alias="$schema")
    query_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: f"sess-{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    auth: AuthContext = Field(default_factory=AuthContext)
    input: QueryInput
    context: QueryContext = Field(default_factory=QueryContext)
    preferences: QueryPreferences = Field(default_factory=QueryPreferences)


# --- Schema 2: StandardsResponse Sub-models ---

class MetaInfo(BaseModel):
    query_id: str
    session_id: str
    timestamp: str
    processing_time_ms: int = 0
    pipeline_version: str = "1.0.0"
    model_version: str = "gemini-3.8-flash"
    data_snapshot_date: str = "2026-09-26"
    audit_reference_hash: str = ""
    mode: str = "recommend"
    critic_verified: bool = True
    verification_loops: int = 1
    critic_critique: Optional[str] = None
    rejected_candidates: List[str] = Field(default_factory=list)


class ExtractedEntity(BaseModel):
    entity: str
    type: str  # PRODUCT | GRADE_SPECIFICATION | APPLICATION_DOMAIN | TEST_PARAMETER | DIMENSION
    confidence: float = 0.95

class QueryUnderstanding(BaseModel):
    detected_language: str = "en"
    original_text: str
    normalized_text: str
    extracted_entities: List[ExtractedEntity] = Field(default_factory=list)
    query_intent: str = "STANDARD_LOOKUP"

class ConfidenceBreakdown(BaseModel):
    semantic_vector_score: float = 0.0
    keyword_exact_match: float = 0.0
    graph_co_citation_boost: float = 0.0

class CertificationInfo(BaseModel):
    scheme: str = "VOLUNTARY"  # BIS_ISI_MARK | BIS_CRS | BIS_HALLMARK | VOLUNTARY
    mandatory: bool = False
    qco_order_name: Optional[str] = None
    qco_gazette_ref: Optional[str] = None
    notifying_ministry: Optional[str] = None
    enforcement_date: Optional[str] = None

class PrimaryRecommendation(BaseModel):
    is_number: str
    standard_id: str
    title: str
    full_title: str
    status: str = "ACTIVE"  # ACTIVE | WITHDRAWN | SUPERSEDED | UNDER_REVISION
    year_published: Optional[int] = 2020
    latest_amendment: Optional[str] = None
    superseded_by: Optional[str] = None
    supersedes: List[str] = Field(default_factory=list)
    scope_snippet: str = ""
    division_code: str = "GEN"
    ics_codes: List[str] = Field(default_factory=list)
    confidence: float = 0.0
    confidence_breakdown: ConfidenceBreakdown = Field(default_factory=ConfidenceBreakdown)
    certification: CertificationInfo = Field(default_factory=CertificationInfo)

class AlliedStandard(BaseModel):
    is_number: str
    standard_id: str
    title: str
    relation_type: str = "NORMATIVE_REFERENCE"  # TEST_METHOD | NORMATIVE_REFERENCE | RAW_MATERIAL_SPEC | INSTALLATION_CODE | SAFETY_STANDARD | TERMINOLOGY_STANDARD | RELATED_PRODUCT | CROSS_DISCIPLINARY
    relation_label: str = "Normative Reference"
    status: str = "ACTIVE"
    confidence: float = 0.85
    why: str = ""

class OutdatedCitation(BaseModel):
    cited_standard: str
    severity: str = "CRITICAL"  # CRITICAL | HIGH | MEDIUM | LOW
    status: str = "WITHDRAWN"   # WITHDRAWN | SUPERSEDED | REVISED
    reason: str
    replacement: Optional[str] = None
    message: str

class GraphPathEdge(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_node: str = Field(..., alias="from")
    to_node: str = Field(..., alias="to")
    edge_type: str
    label: str

class ReasoningStep(BaseModel):
    step: str
    detail: str
    confidence: float = 0.95

class PlainLanguageExplanation(BaseModel):
    enabled: bool = True
    text: str = ""

class ComplianceChecklistItem(BaseModel):
    item: str
    status: str = "PASS"  # PASS | FAIL | WARNING | NOT_CHECKED
    action_required: str

class AuditRecord(BaseModel):
    recommendation_id: str
    query_id: str
    timestamp: str
    standards_version_snapshot: Dict[str, Any] = Field(default_factory=dict)
    audit_hash: str = ""
    logged: bool = True
    dry_run: bool = False
    rti_exportable: bool = True

class StalenessRisk(BaseModel):
    risk_level: str = "NONE"  # NONE | LOW | MEDIUM | HIGH | CRITICAL
    message: Optional[str] = "All recommended standards are active and up to date."
    standards_under_revision: List[str] = Field(default_factory=list)

class MultilingualInfo(BaseModel):
    bhashini_used: bool = False
    detected_input_language: str = "en"
    response_language: str = "en"
    available_translations: List[str] = Field(default_factory=lambda: ["hi", "ta", "te", "mr", "gu", "bn"])

class SpecDraftExport(BaseModel):
    tender_clause_text: str = ""
    mandatory_certifications: List[str] = Field(default_factory=list)
    quality_assurance_requirements: List[str] = Field(default_factory=list)
    test_certificate_mandates: List[str] = Field(default_factory=list)

# --- Schema 2: StandardsResponse Master ---

class StandardsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    schema_version: str = Field(default="SIH2026.StandardsResponse.v1", alias="$schema")
    meta: MetaInfo
    query_understanding: QueryUnderstanding
    primary_recommendation: PrimaryRecommendation
    allied_standards: List[AlliedStandard] = Field(default_factory=list)
    outdated_citations: List[OutdatedCitation] = Field(default_factory=list)
    graph_path: List[GraphPathEdge] = Field(default_factory=list)
    reasoning_trace: List[ReasoningStep] = Field(default_factory=list)
    plain_language_explanation: PlainLanguageExplanation = Field(default_factory=PlainLanguageExplanation)
    compliance_checklist: List[ComplianceChecklistItem] = Field(default_factory=list)
    audit_record: AuditRecord
    staleness_risk: StalenessRisk = Field(default_factory=StalenessRisk)
    multilingual: MultilingualInfo = Field(default_factory=MultilingualInfo)
    spec_draft_export: Optional[SpecDraftExport] = None


# --- Schema 3: FeedbackRequest ---

class FeedbackSubmitter(BaseModel):
    user_id: str
    role: str = "PROCUREMENT_OFFICER"
    ministry_code: Optional[str] = "GENERAL"

class FeedbackRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    schema_version: str = Field(default="SIH2026.FeedbackRequest.v1", alias="$schema")
    feedback_id: str = Field(default_factory=lambda: f"fbk-{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    original_query_id: str
    original_recommendation_id: str
    submitter: FeedbackSubmitter
    feedback_type: str  # WRONG_STANDARD | OUTDATED_STANDARD | MISSING_ALLIED_STANDARD | WRONG_CERTIFICATION | FALSE_OUTDATED_FLAG | OTHER
    flagged_is_number: str
    correct_is_number: Optional[str] = None
    officer_notes: str
    verified: bool = False
    verification_status: str = "PENDING"  # PENDING | VERIFIED_CORRECT | VERIFIED_INCORRECT | ESCALATED


# --- Schema 4: AlertPayload ---

class AffectedTender(BaseModel):
    tender_id: str
    ministry: str
    officer_user_id: Optional[str] = None
    cited_version: str

class AffectedStandard(BaseModel):
    is_number: str
    event: str
    replacement: Optional[str] = None

class AlertPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    schema_version: str = Field(default="SIH2026.AlertPayload.v1", alias="$schema")
    alert_id: str = Field(default_factory=lambda: f"alt-{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    alert_type: str  # STANDARD_SUPERSEDED | STANDARD_AMENDED | STANDARD_WITHDRAWN | QCO_ENFORCEMENT_DATE | NEW_MANDATORY_STANDARD
    severity: str = "CRITICAL"  # CRITICAL | HIGH | MEDIUM | LOW
    affected_standard: AffectedStandard
    affected_tenders: List[AffectedTender] = Field(default_factory=list)
    recommended_action: str
    deadline: Optional[str] = None
