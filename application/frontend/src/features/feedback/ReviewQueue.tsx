import React, { useState } from 'react';
import type { FeedbackRequest, VerificationStatus } from '../../types';

interface ReviewQueueProps {
  items: FeedbackRequest[];
  onStatusChange: (feedbackId: string, newStatus: VerificationStatus) => void;
  onExportJSON?: () => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  items,
  onStatusChange,
  onExportJSON,
}) => {
  const [filter, setFilter] = useState<'ALL' | VerificationStatus>('ALL');

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.verification_status === filter;
  });

  const pendingCount = items.filter((i) => i.verification_status === 'PENDING').length;
  const verifiedCount = items.filter((i) => i.verification_status === 'VERIFIED_CORRECT').length;

  return (
    <div className="workbench-card">
      <div className="workbench-card-header">
        <div>
          <h2 className="workbench-card-title">Expert Moderation & Feedback Review Queue</h2>
          <div className="workbench-card-subtitle">
            Authoritative human-in-the-loop review board for continuous accuracy alignment
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="concept-status-badge in-progress">
            {pendingCount} PENDING REVIEW
          </span>
          <span className="concept-status-badge active">
            {verifiedCount} VERIFIED
          </span>
          {onExportJSON && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onExportJSON}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              📥 Export JSON
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="auth-tab-row" style={{ marginBottom: '14px' }}>
        <button
          type="button"
          className={`auth-tab ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Feedback ({items.length})
        </button>
        <button
          type="button"
          className={`auth-tab ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          className={`auth-tab ${filter === 'VERIFIED_CORRECT' ? 'active' : ''}`}
          onClick={() => setFilter('VERIFIED_CORRECT')}
        >
          Approved ({verifiedCount})
        </button>
        <button
          type="button"
          className={`auth-tab ${filter === 'ESCALATED' ? 'active' : ''}`}
          onClick={() => setFilter('ESCALATED')}
        >
          Escalated ({items.filter((i) => i.verification_status === 'ESCALATED').length})
        </button>
      </div>

      {/* Review Queue Table */}
      <div className="table-wrapper">
        <table className="instructor-table">
          <thead>
            <tr>
              <th>FLAGGED STANDARD</th>
              <th>FEEDBACK TYPE</th>
              <th>PROPOSED FIX</th>
              <th>OFFICER NOTES</th>
              <th>SUBMITTER</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>MODERATION ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-muted)' }}>
                  No feedback tickets matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isPending = item.verification_status === 'PENDING';
                const isCorrect = item.verification_status === 'VERIFIED_CORRECT';
                const isIncorrect = item.verification_status === 'VERIFIED_INCORRECT';
                const isEscalated = item.verification_status === 'ESCALATED';

                return (
                  <tr key={item.feedback_id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-data)', color: 'var(--collapse-cobalt)' }}>
                        {item.flagged_is_number}
                      </strong>
                    </td>
                    <td>
                      <span className="concept-pill" style={{ fontSize: '10px' }}>
                        {item.feedback_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600 }}>
                        {item.correct_is_number || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', display: 'block', maxWidth: '240px' }}>
                        {item.officer_notes || 'No comments'}
                      </span>
                    </td>
                    <td>
                      <div className="student-ident">
                        <span className="student-name">{item.submitter?.user_id || 'anonymous'}</span>
                        <span className="student-email">{item.submitter?.role} ({item.submitter?.ministry_code || 'GEN'})</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="concept-status-badge"
                        style={{
                          background: isCorrect
                            ? 'rgba(16, 130, 80, 0.1)'
                            : isIncorrect
                            ? 'rgba(194, 59, 59, 0.1)'
                            : isEscalated
                            ? 'rgba(217, 119, 6, 0.1)'
                            : 'rgba(110, 90, 214, 0.1)',
                          color: isCorrect
                            ? 'var(--emerald-pass)'
                            : isIncorrect
                            ? 'var(--error-line)'
                            : isEscalated
                            ? '#B45309'
                            : 'var(--superposition-violet)',
                          border: '1px solid currentColor',
                          fontSize: '9.5px',
                        }}
                      >
                        {item.verification_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              className="concept-action-btn"
                              style={{ color: 'var(--emerald-pass)', borderColor: 'var(--emerald-pass)' }}
                              onClick={() => onStatusChange(item.feedback_id, 'VERIFIED_CORRECT')}
                              title="Approve officer correction and update training trust index"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              className="concept-action-btn"
                              style={{ color: 'var(--error-line)', borderColor: 'var(--error-line)' }}
                              onClick={() => onStatusChange(item.feedback_id, 'VERIFIED_INCORRECT')}
                              title="Reject flag as invalid"
                            >
                              ✕ Reject
                            </button>
                            <button
                              type="button"
                              className="concept-action-btn"
                              style={{ color: '#D97706', borderColor: '#D97706' }}
                              onClick={() => onStatusChange(item.feedback_id, 'ESCALATED')}
                              title="Escalate to Technical Committee"
                            >
                              ⬆ Escalate
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '10px' }}
                            onClick={() => onStatusChange(item.feedback_id, 'PENDING')}
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
