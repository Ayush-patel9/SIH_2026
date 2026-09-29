import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { StandardsResponse } from '../../types';
import { verifyHash, type HashVerificationResult } from './hashUtils';

interface AuditHashVerifierProps {
  cachedRecords: StandardsResponse[];
  initialHash?: string;
  onRecordFound?: (record: StandardsResponse) => void;
}

export const AuditHashVerifier: React.FC<AuditHashVerifierProps> = ({
  cachedRecords,
  initialHash = '',
  onRecordFound,
}) => {
  const [hashInput, setHashInput] = useState(initialHash);
  const [result, setResult] = useState<HashVerificationResult | null>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hashInput.trim()) return;

    const res = verifyHash(hashInput, cachedRecords);
    setResult(res);

    if (res.valid && res.record && onRecordFound) {
      onRecordFound(res.record);
    }
  };

  return (
    <div className="workbench-card">
      <div className="workbench-card-header">
        <div>
          <h2 className="workbench-card-title">Public Audit Hash Verification Portal</h2>
          <div className="workbench-card-subtitle">
            Paste any 64-character SHA-256 audit digest to verify cryptographic authenticity
          </div>
        </div>
        <span className="concept-status-badge in-progress">
          ONLINE VERIFIER
        </span>
      </div>

      <form onSubmit={handleVerify} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          type="text"
          value={hashInput}
          onChange={(e) => {
            setHashInput(e.target.value);
            if (result) setResult(null);
          }}
          placeholder="Paste SHA-256 hash (e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)..."
          className="auth-input font-mono"
          style={{ fontSize: '12px' }}
        />
        <button
          type="submit"
          disabled={!hashInput.trim()}
          className="btn-run"
          style={{ whiteSpace: 'nowrap' }}
        >
          Verify Hash
        </button>
      </form>

      {result && (
        <div
          className={`timeline-step-card ${result.valid ? 'high-confidence' : 'low-confidence'}`}
          style={{
            borderLeft: result.valid
              ? '3px solid var(--emerald-pass)'
              : '3px solid var(--error-line)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {result.valid ? (
                <CheckCircle2 size={18} style={{ color: 'var(--emerald-pass)' }} />
              ) : (
                <XCircle size={18} style={{ color: 'var(--error-line)' }} />
              )}
              <strong
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '13px',
                  color: result.valid ? 'var(--emerald-pass)' : 'var(--error-line)',
                }}
              >
                {result.valid ? 'CERTIFIED AUTHENTIC RECORD' : 'VERIFICATION FAILED'}
              </strong>
            </div>

            {result.valid && (
              <span className="concept-status-badge active">
                IMMUTABLE MATCH
              </span>
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink-secondary)', marginTop: '8px' }}>
            {result.message}
          </div>

          {result.valid && result.record && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="section-label" style={{ margin: 0 }}>ENFORCED STANDARD:</span>
                  <strong style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--collapse-cobalt)', marginLeft: '6px' }}>
                    {result.record.primary_recommendation.is_number}
                  </strong>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginLeft: '6px' }}>
                    ({result.record.primary_recommendation.title})
                  </span>
                </div>
                {onRecordFound && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => onRecordFound(result.record!)}
                  >
                    View Record
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
