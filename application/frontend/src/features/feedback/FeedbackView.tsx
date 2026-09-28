import React, { useState, useEffect } from 'react';
import type { StandardsResponse, VerificationStatus } from '../../types';
import { ReviewQueue } from './ReviewQueue';
import { FeedbackModal } from './FeedbackModal';
import { FeedbackStore } from './feedbackStore';
import { computeTrustScore } from './trustScoreCalc';

interface FeedbackViewProps {
  currentData?: StandardsResponse | null;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ currentData }) => {
  const [feedbackList, setFeedbackList] = useState(() => FeedbackStore.getAll());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshList = () => {
    setFeedbackList(FeedbackStore.getAll());
  };

  useEffect(() => {
    refreshList();
    const unsubscribe = FeedbackStore.subscribe(() => {
      refreshList();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusChange = (id: string, status: VerificationStatus) => {
    FeedbackStore.updateStatus(id, status);
    refreshList();
  };

  const primaryIs = currentData?.primary_recommendation?.is_number || 'IS 269:2015';
  const trust = computeTrustScore(primaryIs, feedbackList);

  const total = feedbackList.length;
  const pending = feedbackList.filter((f) => f.verification_status === 'PENDING').length;
  const verified = feedbackList.filter((f) => f.verification_status === 'VERIFIED_CORRECT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Moderation Board Header */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--superposition-violet)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge in-progress">
                HUMAN-IN-THE-LOOP GOVERNANCE
              </span>
              <span className="concept-status-badge active">
                BIS COMMITTEE REVIEW ACTIVE
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Human-in-the-Loop Feedback & Moderation Queue
            </h1>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Authoritative officer flag intake, expert review queue, and institutional trust score telemetry
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-run"
              onClick={() => setIsModalOpen(true)}
            >
              ⚑ Submit New Flag
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                FeedbackStore.resetDefaults();
                refreshList();
              }}
              title="Reset queue to demo seed feedback"
            >
              🔄 Reset Seeds
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div style={{ background: 'var(--paper)', padding: '10px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm)' }}>
            <div className="section-label" style={{ margin: 0, fontSize: '9px' }}>TOTAL TICKETS</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              {total}
            </div>
          </div>

          <div style={{ background: 'var(--paper)', padding: '10px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm)' }}>
            <div className="section-label" style={{ margin: 0, fontSize: '9px' }}>PENDING MODERATION</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--superposition-violet)' }}>
              {pending}
            </div>
          </div>

          <div style={{ background: 'var(--paper)', padding: '10px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm)' }}>
            <div className="section-label" style={{ margin: 0, fontSize: '9px' }}>VERIFIED ACCURATE</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--emerald-pass)' }}>
              {verified}
            </div>
          </div>

          <div style={{ background: 'var(--paper)', padding: '10px 14px', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm)' }}>
            <div className="section-label" style={{ margin: 0, fontSize: '9px' }}>ACTIVE STANDARD TRUST</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
              {trust.score}% ({trust.badgeLevel.replace(/_/g, ' ')})
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue Component */}
      <ReviewQueue
        items={feedbackList}
        onStatusChange={handleStatusChange}
        onExportJSON={() => FeedbackStore.exportJSON()}
      />

      {/* Feedback Intake Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        queryId={currentData?.meta?.query_id || 'manual-feedback-session'}
        recommendationId={currentData?.audit_record?.recommendation_id || 'rec-general'}
        flaggedIsNumber={primaryIs}
        onSuccess={refreshList}
      />
    </div>
  );
};
