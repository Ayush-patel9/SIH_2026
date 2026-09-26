/**
 * feedbackBuilder.ts
 * Helper to construct valid FeedbackRequest objects matching contract_schema.json
 */

import type { FeedbackRequest, FeedbackType, UserRole } from '../../types';

export interface FeedbackFormData {
  feedbackType: FeedbackType;
  flaggedIsNumber: string;
  correctIsNumber?: string;
  officerNotes?: string;
  role: UserRole;
  ministryCode?: string;
  userId?: string;
}

export function buildFeedbackPayload(
  formData: FeedbackFormData,
  originalQueryId: string,
  originalRecId: string
): FeedbackRequest {
  return {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: `fbk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    original_query_id: originalQueryId,
    original_recommendation_id: originalRecId,
    submitter: {
      user_id: formData.userId || 'officer_ayush',
      role: formData.role,
      ministry_code: formData.ministryCode || 'MoRTH',
    },
    feedback_type: formData.feedbackType,
    flagged_is_number: formData.flaggedIsNumber,
    correct_is_number: formData.correctIsNumber || undefined,
    officer_notes: formData.officerNotes || '',
    verified: false,
    verification_status: 'PENDING',
  };
}
