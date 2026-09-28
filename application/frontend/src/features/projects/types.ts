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
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'COMPLIANT' | 'PUBLISHED';
  complianceScore: number;
  clauses: ClauseSuggestion[];
  hasPdfUploaded: boolean;
  pdfFileName?: string;
  description?: string;
}
