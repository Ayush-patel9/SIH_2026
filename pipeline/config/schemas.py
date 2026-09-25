from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AmendmentRecord(BaseModel):
    amendment_no: int
    gazette_date: Optional[str] = None
    summary: Optional[str] = None
    url: Optional[str] = None

class NormativeReference(BaseModel):
    is_number: str
    title: Optional[str] = None
    relation_type: Optional[str] = "GENERAL"  # TEST_METHOD, SAMPLING, TERMINOLOGY, RAW_MATERIAL, SAFETY

class TechnicalCommittee(BaseModel):
    division_code: Optional[str] = None      # CED, ETD, MED, TXD, FAD, CHAD, etc.
    division_name: Optional[str] = None
    committee_code: Optional[str] = None     # CED 54, ETD 14, etc.
    committee_name: Optional[str] = None

class RegulatoryInfo(BaseModel):
    is_mandatory: bool = False
    scheme: Optional[str] = None             # Scheme-I (ISI), Scheme-II (CRS), Scheme-IV (Hallmarking), Scheme-X
    notifying_ministry: Optional[str] = None
    qco_order_name: Optional[str] = None
    qco_gazette_notification: Optional[str] = None
    enforcement_date: Optional[str] = None
    exemption_clauses: Optional[str] = None

class ClauseData(BaseModel):
    clause_1_scope: Optional[str] = None
    clause_2_normative_references: List[NormativeReference] = Field(default_factory=list)
    clause_3_terminology: List[str] = Field(default_factory=list)
    key_requirements_summary: Optional[str] = None

class ProcurementContext(BaseModel):
    gem_categories: List[str] = Field(default_factory=list)
    common_mis_citations: List[str] = Field(default_factory=list)
    mandatory_allied_standards: List[str] = Field(default_factory=list)

class UnifiedStandardRecord(BaseModel):
    is_number: str
    standard_id: Optional[str] = None        # e.g., "IS 1786:2008"
    year_published: Optional[int] = None
    reaffirmation_year: Optional[int] = None
    edition: Optional[str] = None
    title: str
    status: str = "ACTIVE"                   # ACTIVE, WITHDRAWN, SUPERSEDED, UNDER_REVISION
    superseded_by: Optional[str] = None
    supersedes: List[str] = Field(default_factory=list)
    technical_committee: Optional[TechnicalCommittee] = None
    ics_codes: List[str] = Field(default_factory=list)
    equivalent_international_standards: List[Dict[str, str]] = Field(default_factory=list)
    amendments: List[AmendmentRecord] = Field(default_factory=list)
    clause_data: Optional[ClauseData] = None
    regulatory_compliance: RegulatoryInfo = Field(default_factory=RegulatoryInfo)
    procurement_context: Optional[ProcurementContext] = None
    fulltext_available: bool = False
    source_document_path: Optional[str] = None
    raw_metadata: Dict[str, Any] = Field(default_factory=dict)

class QCORecord(BaseModel):
    product_category: str
    is_numbers: List[str]
    title_of_standard: Optional[str] = None
    scheme_type: str                         # Scheme-I (ISI), Scheme-II (CRS), etc.
    ministry: str
    order_name: str
    notification_number: Optional[str] = None
    date_of_notification: Optional[str] = None
    date_of_implementation: Optional[str] = None
    exemptions: Optional[str] = None
    source_url: Optional[str] = None

class CRSProductRecord(BaseModel):
    product_category: str
    is_number: str
    standard_title: str
    notifying_ministry: str = "Ministry of Electronics and Information Technology (MeitY) / MNRE"
    scheme: str = "Scheme-II (CRS)"
    phase: Optional[str] = None
    implementation_date: Optional[str] = None
    scope_notes: Optional[str] = None
