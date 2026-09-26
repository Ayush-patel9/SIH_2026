/**
 * trustScoreCalc.ts
 * Computes live trust scores and expert validation metrics for recommended standards.
 */

import type { FeedbackRequest } from '../../types';

export interface TrustScoreResult {
  score: number; // 0 to 100 percentage
  totalFeedback: number;
  verifiedCorrectCount: number;
  verifiedIncorrectCount: number;
  pendingCount: number;
  escalatedCount: number;
  badgeLevel: 'HIGH_TRUST' | 'MODERATE_TRUST' | 'FLAGGED_REVIEW' | 'UNREVIEWED';
}

export function computeTrustScore(
  isNumber: string,
  allFeedback: FeedbackRequest[]
): TrustScoreResult {
  const relevant = allFeedback.filter(
    (f) => f.flagged_is_number.trim().toLowerCase() === isNumber.trim().toLowerCase()
  );

  if (relevant.length === 0) {
    return {
      score: 98, // Default baseline for official Bureau standards
      totalFeedback: 0,
      verifiedCorrectCount: 0,
      verifiedIncorrectCount: 0,
      pendingCount: 0,
      escalatedCount: 0,
      badgeLevel: 'UNREVIEWED',
    };
  }

  const verifiedCorrect = relevant.filter((f) => f.verification_status === 'VERIFIED_CORRECT').length;
  const verifiedIncorrect = relevant.filter((f) => f.verification_status === 'VERIFIED_INCORRECT').length;
  const pending = relevant.filter((f) => f.verification_status === 'PENDING').length;
  const escalated = relevant.filter((f) => f.verification_status === 'ESCALATED').length;

  const total = relevant.length;
  // Penalty for verified incorrect items, bonus for verified correct
  const baseScore = 95;
  const penalty = verifiedIncorrect * 25;
  const boost = verifiedCorrect * 2;
  const computed = Math.max(10, Math.min(100, baseScore - penalty + boost));

  let badgeLevel: TrustScoreResult['badgeLevel'] = 'HIGH_TRUST';
  if (computed < 60 || verifiedIncorrect > 0) {
    badgeLevel = 'FLAGGED_REVIEW';
  } else if (computed < 85 || pending > 1) {
    badgeLevel = 'MODERATE_TRUST';
  }

  return {
    score: computed,
    totalFeedback: total,
    verifiedCorrectCount: verifiedCorrect,
    verifiedIncorrectCount: verifiedIncorrect,
    pendingCount: pending,
    escalatedCount: escalated,
    badgeLevel,
  };
}
