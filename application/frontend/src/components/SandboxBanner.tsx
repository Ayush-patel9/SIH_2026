import React from 'react';
import type { StandardsResponse } from '../types';
import { FlaskConical, AlertOctagon } from 'lucide-react';

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
            background: 'var(--amber-bg)',
            border: '1px solid var(--amber-border)',
            borderLeft: '4px solid var(--signal-amber)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <FlaskConical size={18} color="var(--amber-warn)" />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--amber-warn)',
                textTransform: 'uppercase',
              }}
            >
              Sandbox Mode Active
            </div>
            <div
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '12px',
                color: 'var(--ink-secondary)',
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
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              borderLeft: '4px solid var(--error-line)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <AlertOctagon size={18} color="var(--error-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--error-red)',
                  textTransform: 'uppercase',
                }}
              >
                {oc.severity} — Outdated Citation Detected
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-prose)',
                  fontSize: '12px',
                  color: 'var(--ink-secondary)',
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
