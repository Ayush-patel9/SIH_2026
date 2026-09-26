import React from 'react';
import type { StandardsResponse } from '../types';

interface SandboxBannerProps {
  data: StandardsResponse;
  mode: string;
}

export const SandboxBanner: React.FC<SandboxBannerProps> = ({ data, mode }) => {
  const isDryRun = mode === 'dry_run' || data.audit_record?.dry_run;
  const hasOutdated = (data.outdated_citations?.length ?? 0) > 0;

  if (!isDryRun && !hasOutdated) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
      {isDryRun && (
        <div
          style={{
            background: 'rgba(224, 152, 43, 0.08)',
            border: '1px solid rgba(224, 152, 43, 0.35)',
            borderLeft: '4px solid var(--signal-amber)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '18px' }}>🧪</span>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#92400E',
                textTransform: 'uppercase',
              }}
            >
              Sandbox Mode Active
            </div>
            <div
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '12px',
                color: '#78350F',
                marginTop: '2px',
              }}
            >
              This query is NOT logged to the permanent audit trail. Use this mode to test draft
              specifications before finalizing your NIT tender.
            </div>
          </div>
        </div>
      )}
      {hasOutdated &&
        data.outdated_citations.map((oc, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(194, 59, 59, 0.06)',
              border: '1px solid rgba(194, 59, 59, 0.3)',
              borderLeft: '4px solid var(--error-line)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '18px', marginTop: '1px' }}>🔴</span>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#991B1B',
                  textTransform: 'uppercase',
                }}
              >
                {oc.severity} — Outdated Citation Detected
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-prose)',
                  fontSize: '12px',
                  color: '#7F1D1D',
                  marginTop: '2px',
                }}
              >
                <strong>"{oc.cited_standard}"</strong> is {oc.status}. {oc.reason}
                {oc.replacement && (
                  <>
                    {' '}
                    → Replace with: <strong>{oc.replacement}</strong>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
