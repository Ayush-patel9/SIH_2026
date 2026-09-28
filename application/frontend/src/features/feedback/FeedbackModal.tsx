import React, { useState } from 'react';
import type { FeedbackType, UserRole } from '../../types';
import { buildFeedbackPayload } from './feedbackBuilder';
import { FeedbackStore } from './feedbackStore';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryId: string;
  recommendationId: string;
  flaggedIsNumber: string;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  queryId,
  recommendationId,
  flaggedIsNumber,
  onSuccess,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('WRONG_STANDARD');
  const [correctIsNumber, setCorrectIsNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [ministryCode, setMinistryCode] = useState('MoRTH');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = buildFeedbackPayload(
      {
        feedbackType,
        flaggedIsNumber,
        correctIsNumber: correctIsNumber.trim() || undefined,
        officerNotes: notes.trim(),
        role,
        ministryCode,
        userId: 'officer_ayush',
      },
      queryId,
      recommendationId
    );

    FeedbackStore.save(payload);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(13, 15, 20, 0.65)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--surface)',
          height: '100%',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'auth-card-in 0.20s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--paper)',
          }}
        >
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>
              EXPERT CORRECTION & MODERATION
            </div>
            <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
              Flag Recommendation
            </h2>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '12px' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', flex: 1 }}>
          {submitted ? (
            <div className="auth-banner success" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
              <strong style={{ fontSize: '14px' }}>Correction Recorded in BIS Review Queue</strong>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', marginTop: '6px', color: '#065F46' }}>
                Your feedback will be audited by the Technical Committee and integrated into the continuous training store.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-label">
                Flagged Indian Standard (Read-Only)
                <input
                  type="text"
                  value={flaggedIsNumber}
                  disabled
                  className="auth-input font-mono"
                  style={{ background: 'var(--paper)', fontWeight: 600 }}
                />
              </label>

              <label className="auth-label">
                Feedback Classification Type
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                  className="auth-input auth-select"
                >
                  <option value="WRONG_STANDARD">Wrong Standard Recommended (Irrelevant Specification)</option>
                  <option value="OUTDATED_STANDARD">Outdated / Withdrawn Standard Missed</option>
                  <option value="MISSING_ALLIED_STANDARD">Missing Allied / Test Method Standard</option>
                  <option value="WRONG_CERTIFICATION">Incorrect Certification / QCO Order Scheme</option>
                  <option value="FALSE_OUTDATED_FLAG">False Positive Staleness Flag</option>
                  <option value="OTHER">Other Domain Specific Recommendation Issue</option>
                </select>
              </label>

              <label className="auth-label">
                Proposed Correct Standard Number (Optional)
                <input
                  type="text"
                  value={correctIsNumber}
                  onChange={(e) => setCorrectIsNumber(e.target.value)}
                  placeholder="e.g. IS 1489 (Part 1):2015"
                  className="auth-input font-mono"
                />
              </label>

              <label className="auth-label">
                Officer Notes & Technical Rationale
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why this specification is inappropriate for this procurement tender context..."
                  className="tutor-input"
                  style={{ width: '100%', fontSize: '13px' }}
                  required
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label className="auth-label">
                  Your Officer Role
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="auth-input auth-select"
                  >
                    <option value="OFFICER">🏛️ Tender Authority & Technical Officer</option>
                    <option value="VENDOR">🏭 Registered Vendor / Supplier</option>
                  </select>
                </label>

                <label className="auth-label">
                  Ministry / Entity Code
                  <input
                    type="text"
                    value={ministryCode}
                    onChange={(e) => setMinistryCode(e.target.value)}
                    className="auth-input font-mono"
                    required
                  />
                </label>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-run"
                >
                  Submit Correction
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
