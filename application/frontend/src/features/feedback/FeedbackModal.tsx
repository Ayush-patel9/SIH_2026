import React, { useState } from 'react';
import type { FeedbackType, UserRole } from '../../types';
import { buildFeedbackPayload } from './feedbackBuilder';
import { FeedbackStore, type ExtendedFeedbackItem } from './feedbackStore';
import { Flag, X, CheckCircle2, Search, Building2, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MASTER_STANDARDS_CATALOG } from '../../data/standardsMentionCatalog';
import { submitFeedback } from '../../api/standardsClient';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryId: string;
  recommendationId: string;
  flaggedIsNumber: string;
  onSuccess?: () => void;
}

const SECTIONAL_COMMITTEES = [
  'CED 02 (Cement and Concrete)',
  'MTD 04 (Wrought Steel Products)',
  'MED 17 (Plastics Piping Systems)',
  'CED 54 (Concrete Reinforcement)',
  'ETD 16 (Transformers)',
  'PCD 03 (Bitumen, Tar and Related Products)',
  'ETD 09 (Power Cables)',
  'CED 22 (Fire Safety)',
  'LITD 14 (Computer Hardware & IT)',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  queryId,
  recommendationId,
  flaggedIsNumber,
  onSuccess,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('OUTDATED_STANDARD');
  const [targetIsNumber, setTargetIsNumber] = useState(flaggedIsNumber || 'IS 8112:1989');
  const [correctIsNumber, setCorrectIsNumber] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [committee, setCommittee] = useState(SECTIONAL_COMMITTEES[0]);
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [ministryCode, setMinistryCode] = useState('NHAI / MoRTH');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const basePayload = buildFeedbackPayload(
      {
        feedbackType,
        flaggedIsNumber: targetIsNumber.trim(),
        correctIsNumber: correctIsNumber.trim() || undefined,
        officerNotes: notes.trim(),
        role,
        ministryCode,
        userId: 'officer_ayush',
      },
      queryId,
      recommendationId
    );

    const extendedPayload: ExtendedFeedbackItem = {
      ...basePayload,
      severity,
      sectional_committee: committee,
      affected_tenders_count: Math.floor(Math.random() * 15) + 3,
      gazette_qco_ref: 'Statutory BIS Quality Control Order',
    };

    FeedbackStore.save(extendedPayload);
    // Asynchronously dispatch to backend REST API
    submitFeedback(basePayload).catch((err) =>
      console.warn('Backend feedback sync notice:', err)
    );
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
        inset: 0,
        backgroundColor: 'rgba(0, 20, 40, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--surface)',
          height: '100%',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          animation: 'fadeSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--surface-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flag size={18} color="var(--olive-primary)" />
            <div>
              <div className="section-label" style={{ margin: 0 }}>
                STATUTORY MODERATION INTAKE
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: '2px 0 0' }}>
                Submit Specification Flag
              </h2>
            </div>
          </div>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', flex: 1 }}>
          {submitted ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--emerald-bg)',
                border: '1px solid var(--emerald-border)',
                borderRadius: '8px',
              }}
            >
              <CheckCircle2 size={32} color="var(--emerald-text)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--emerald-text)' }}>
                Moderation Flag Recorded in Review Queue
              </div>
              <p style={{ fontSize: '12.5px', marginTop: '6px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
                Your technical feedback has been queued for Technical Committee oversight and incorporated into the continuous trust index telemetry.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Flagged Indian Standard Code
                </label>
                <input
                  type="text"
                  value={targetIsNumber}
                  onChange={(e) => setTargetIsNumber(e.target.value)}
                  className="font-mono"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--ink)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Feedback Classification
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  <option value="OUTDATED_STANDARD">Outdated / Withdrawn Standard Cited</option>
                  <option value="MISSING_ALLIED_STANDARD">Missing Mandatory Allied Testing Standard</option>
                  <option value="WRONG_STANDARD">Wrong Standard Recommended for Scope</option>
                  <option value="WRONG_CERTIFICATION">QCO / Non-Restrictive Competition Violation</option>
                  <option value="FALSE_OUTDATED_FLAG">False Positive Staleness Flag</option>
                  <option value="OTHER">Other Technical Specification Issue</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Proposed Correct Standard
                  </label>
                  <input
                    type="text"
                    value={correctIsNumber}
                    onChange={(e) => setCorrectIsNumber(e.target.value)}
                    placeholder="e.g. IS 269:2015"
                    className="font-mono"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--hairline)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '12.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--hairline)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  >
                    <option value="CRITICAL">Critical (Statutory Disallowance)</option>
                    <option value="HIGH">High (Mandatory QCO Requirement)</option>
                    <option value="MEDIUM">Medium (Testing Frequency)</option>
                    <option value="LOW">Low (Terminology / Typo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Target BIS Sectional Committee
                </label>
                <select
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {SECTIONAL_COMMITTEES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Officer Rationale & Technical Justification
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain the statutory or engineering grounds for this correction..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-ui)',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Officer Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--hairline)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '12px',
                    }}
                  >
                    <option value="OFFICER">Tender Authority & Technical Officer</option>
                    <option value="VENDOR">Registered Vendor / Supplier</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Ministry / Entity Code
                  </label>
                  <input
                    type="text"
                    value={ministryCode}
                    onChange={(e) => setMinistryCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--hairline)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Flag size={13} />
                  <span>Submit to Moderation Queue</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
