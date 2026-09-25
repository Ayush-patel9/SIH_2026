/**
 * TypeScript Interfaces for AI-Powered Indian Standards Recommendation Engine (SIH 2026)
 * Auto-aligned with interface/contract_schema.json
 */

export interface QueryMetadata {
  input_text: string;
  detected_domain: string;
  detected_language: string;
  extracted_keywords?: string[];
  confidence_score: number;
  processed_at?: string;
}

export interface KeySpecifications {
  grades?: string[];
  physical_requirements?: string[];
  chemical_requirements?: string[];
  marking_requirements?: string[];
}

export interface PrimaryRecommendation {
  is_number: string;
  standard_id?: string;
  title: string;
  year_published?: number;
  status: 'ACTIVE' | 'WITHDRAWN' | 'UNDER_REVISION' | 'SUPERSEDED';
  aspect: string;
  division_code: string;
  ics_codes?: string[];
  relevance_score: number;
  match_reason?: string;
  scope_summary?: string;
  key_specifications?: KeySpecifications;
}

export interface NormativeReference {
  is_number: string;
  title: string;
  relation_type: string;
  clause_reference?: string;
}

export interface TestMethodStandard {
  is_number: string;
  test_parameter: string;
  standard_title: string;
  sample_size?: string;
}

export interface SafetyStandard {
  is_number: string;
  title: string;
  focus_area?: string;
}

export interface InstallationCode {
  is_number: string;
  title: string;
}

export interface AlliedStandards {
  normative_references?: NormativeReference[];
  test_methods?: TestMethodStandard[];
  safety_standards?: SafetyStandard[];
  installation_codes?: InstallationCode[];
}

export interface QCODetails {
  order_name?: string;
  notifying_ministry?: string;
  gazette_so_number?: string;
  enforcement_date?: string;
  exemptions?: string;
}

export interface MandatoryCertifications {
  is_qco_mandatory: boolean;
  schemes_applicable: string[];
  qco_details?: QCODetails;
  crs_registration_required?: boolean;
  hallmarking_required?: boolean;
}

export interface ActiveAmendment {
  amendment_number?: number;
  year?: number;
  summary?: string;
}

export interface VersionAmendmentStatus {
  latest_version: string;
  cited_version?: string;
  is_latest_cited: boolean;
  outdated_warning?: string;
  active_amendments?: ActiveAmendment[];
  supersedes?: string;
  superseded_by?: string;
}

export interface NABLLaboratory {
  lab_id?: string;
  lab_name: string;
  location: string;
  state?: string;
  nabl_acc_no: string;
  scope?: string;
}

export interface CertifiedManufacturer {
  cml_no?: string;
  manufacturer_name?: string;
  brand_name?: string;
  state?: string;
  validity_date?: string;
  status?: string;
}

export interface ConformityEcosystem {
  nabl_recognized_labs?: NABLLaboratory[];
  certified_manufacturers?: CertifiedManufacturer[];
}

export interface GeMProcurementAlignment {
  category_id?: string;
  category_name?: string;
  golden_parameters?: Record<string, any>;
  model_tender_clause?: string;
}

export interface IndianStandardsRecommendationResponse {
  query_metadata: QueryMetadata;
  primary_recommendations: PrimaryRecommendation[];
  allied_standards: AlliedStandards;
  mandatory_certifications: MandatoryCertifications;
  version_amendment_status: VersionAmendmentStatus;
  conformity_ecosystem: ConformityEcosystem;
  gem_procurement_alignment?: GeMProcurementAlignment;
}
