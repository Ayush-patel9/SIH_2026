import React, { useState, useEffect } from 'react';
import { FeedbackStore } from './feedbackStore';
import { computeTrustScore } from './trustScoreCalc';

interface FlagButtonProps {
  queryId: string;
  recommendationId: string;
  isNumber: string;
  onOpenModal: (params: { queryId: string; recommendationId: string; isNumber: string }) => void;
}

export const FlagButton: React.FC<FlagButtonProps> = ({
  queryId,
  recommendationId,
  isNumber,
  onOpenModal,
}) => {
  const [trust, setTrust] = useState(() => computeTrustScore(isNumber, FeedbackStore.getAll()));

  useEffect(() => {
    setTrust(computeTrustScore(isNumber, FeedbackStore.getAll()));
  }, [isNumber]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="btn-secondary"
        style={{ fontSize: '11px', padding: '4px 12px', borderColor: 'var(--hairline)' }}
        onClick={() => onOpenModal({ queryId, recommendationId, isNumber })}
        title="Submit an officer correction or report an inaccurate standard citation"
      >
        <span style={{ color: 'var(--signal-amber)', marginRight: '4px' }}>⚑</span>
        Flag Recommendation
      </button>

      {trust && (
        <span
          className="concept-status-badge"
          style={{
            background:
              trust.badgeLevel === 'HIGH_TRUST'
                ? 'rgba(16, 130, 80, 0.08)'
                : trust.badgeLevel === 'FLAGGED_REVIEW'
                ? 'rgba(194, 59, 59, 0.08)'
                : 'rgba(217, 119, 6, 0.08)',
            color:
              trust.badgeLevel === 'HIGH_TRUST'
                ? 'var(--emerald-pass)'
                : trust.badgeLevel === 'FLAGGED_REVIEW'
                ? 'var(--error-line)'
                : '#B45309',
            border: `1px solid ${
              trust.badgeLevel === 'HIGH_TRUST'
                ? 'rgba(16, 130, 80, 0.25)'
                : trust.badgeLevel === 'FLAGGED_REVIEW'
                ? 'rgba(194, 59, 59, 0.25)'
                : 'rgba(217, 119, 6, 0.25)'
            }`,
            fontSize: '10px',
          }}
          title={`${trust.verifiedCorrectCount} verified corrections, ${trust.pendingCount} pending reviews`}
        >
          🛡️ TRUST SCORE: {trust.score}% ({trust.badgeLevel.replace(/_/g, ' ')})
        </span>
      )}
    </div>
  );
};
