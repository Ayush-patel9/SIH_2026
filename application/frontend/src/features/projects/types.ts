export interface ClauseAlternative {
  standard: string;
  title: string;
  description: string;
  tag: string;
}

export interface ClauseSuggestion {
  clauseId: string;
  clauseNumber: string;
  title: string;
  citedStandard: string;
  status: 'WITHDRAWN' | 'OUTDATED' | 'AMENDMENT_NEEDED' | 'MISSING_STANDARD' | 'ACTIVE';
  aiRecommendation: string;
  recommendedStandard: string;
  alternatives: ClauseAlternative[];
  userDecision?: 'APPROVED' | 'OVERRIDDEN' | 'PENDING';
  chosenStandard?: string;
  overrideReason?: string;
  page?: number;
}

export interface TenderProject {
  id: string;
  nitNumber: string;
  title: string;
  department: string;
  estimatedValue: string;
  lastModified: string;
  recencyTimestamp: number;
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'COMPLIANT' | 'PUBLISHED' | 'INGESTED' | 'ANALYZING' | 'COMPLETED';
  complianceScore: number;
  hasDocument: boolean;
  hasPdfUploaded?: boolean;
  documentText?: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
  description?: string;
  clauses?: ClauseSuggestion[];
  isFrozen?: boolean;
  isAnalyzed?: boolean;
  analysisPhase?: 'IDLE' | 'STAGE1_DECOMPOSING' | 'STAGE2_SELECTION' | 'STAGE3_FINALIZING' | 'DASHBOARD_COMPLETED';
  stage1Data?: any;
  stage2Data?: any;
  stage3Data?: any;
}
