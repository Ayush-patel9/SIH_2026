import React, { useState } from 'react';
import type { StandardsResponse, AmbiguityOption } from '../../types';
import { QueryEntityDisplay } from './QueryEntityDisplay';
import { AmbiguityCard } from './AmbiguityCard';
import { IntentClassifierBadge } from './IntentClassifierBadge';
import { QueryCorrectionForm } from './QueryCorrectionForm';
import {
  buildRefinedQuery,
  applyQueryCorrection,
  SAMPLE_AMBIGUOUS_QUERIES,
} from './refinedQueryBuilder';
import type { ManualEntityCorrections } from './refinedQueryBuilder';

interface QueryUnderstandingViewProps {
  currentData: StandardsResponse;
  onUpdateData?: (updated: StandardsResponse) => void;
}

export const QueryUnderstandingView: React.FC<QueryUnderstandingViewProps> = ({
  currentData,
  onUpdateData,
}) => {
  const [activeData, setActiveData] = useState<StandardsResponse>(currentData);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  // Sync when parent currentData changes
  React.useEffect(() => {
    setActiveData(currentData);
  }, [currentData]);

  const handleResolveAmbiguity = (
    dimension: string,
    resolvedValue: string,
    resolvedOption: AmbiguityOption
  ) => {
    const refined = buildRefinedQuery(
      activeData,
      dimension,
      resolvedValue,
      resolvedOption.label
    );
    setActiveData(refined);
    if (onUpdateData) onUpdateData(refined);

    setResolutionNotice(
      `Disambiguation Applied: '${dimension}' resolved to '${resolvedOption.label}'. Recommendation refined.`
    );
    setTimeout(() => setResolutionNotice(null), 5000);
  };

  const handleApplyCorrection = (corrections: ManualEntityCorrections) => {
    const corrected = applyQueryCorrection(activeData, corrections);
    setActiveData(corrected);
    if (onUpdateData) onUpdateData(corrected);
    setIsCorrectionOpen(false);

    setResolutionNotice(
      'Officer Manual Override Applied: Entity understanding verified at 100% confidence.'
    );
    setTimeout(() => setResolutionNotice(null), 5000);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_AMBIGUOUS_QUERIES.find((p) => p.id === presetId);
    if (preset) {
      setActiveData(preset.data);
      if (onUpdateData) onUpdateData(preset.data);
    }
  };

  const qu = activeData.query_understanding;
  const ambiguityFlags = qu?.ambiguity_flags || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderLeft: '4px solid var(--collapse-cobalt)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                NATURAL LANGUAGE UNDERSTANDING & INTENT ENGINE (FEATURE 07)
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', margin: '4px 0 2px 0' }}>
              Query Understanding & Intent Disambiguation
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Visual inspection of extracted technical entities, ambiguity resolution prompts, and officer override controls.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IntentClassifierBadge mode={activeData.meta.mode} />
          </div>
        </div>

        {/* Ambiguous Demo Scenario Switcher */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--hairline)' }}>
          <div className="section-label" style={{ margin: '0 0 6px 0', fontSize: '10px' }}>
            SIMULATE AMBIGUOUS TENDER QUERIES (CLICK TO TEST DISAMBIGUATION FLOW):
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SAMPLE_AMBIGUOUS_QUERIES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`palette-btn ${activeData.meta.query_id === preset.data.meta.query_id ? 'selected' : ''}`}
                onClick={() => handleSelectPreset(preset.id)}
                style={{ fontSize: '11px' }}
              >
                ⚠️ {preset.domainLabel}
              </button>
            ))}

            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => {
                setActiveData(currentData);
                if (onUpdateData) onUpdateData(currentData);
              }}
            >
              Reset to Active Workbench Data
            </button>
          </div>
        </div>

        {/* Resolution Toast Notice */}
        {resolutionNotice && (
          <div
            className="auth-banner success"
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              animation: 'auth-card-in 0.2s ease both',
            }}
          >
            <strong>✓ {resolutionNotice}</strong>
          </div>
        )}
      </div>

      {/* Component 1: Extracted Entity Visualization */}
      <QueryEntityDisplay
        understanding={qu}
        onOpenCorrection={() => setIsCorrectionOpen(!isCorrectionOpen)}
      />

      {/* Component 2: Active Ambiguity Cards if Present */}
      {ambiguityFlags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ambiguityFlags.map((flag, idx) => (
            <AmbiguityCard
              key={idx}
              flag={flag}
              onResolve={handleResolveAmbiguity}
            />
          ))}
        </div>
      )}

      {/* Component 4: Collapsible Manual Officer Override Form */}
      {isCorrectionOpen && (
        <QueryCorrectionForm
          understanding={qu}
          onCorrect={handleApplyCorrection}
          onClose={() => setIsCorrectionOpen(false)}
        />
      )}

      {/* NLU Pipeline Audit & Reasoning Trace */}
      <div className="workbench-card" style={{ padding: '20px' }}>
        <div className="section-label" style={{ margin: '0 0 4px 0' }}>
          UNDERSTANDING PIPELINE AUDIT TRACE
        </div>
        <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
          Query Entity Extraction & Intent Classification Trace
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeData.reasoning_trace.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: '4px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--collapse-cobalt)',
                  minWidth: '24px',
                }}
              >
                0{idx + 1}.
              </span>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink)', textTransform: 'uppercase' }}>
                    {step.step.replace(/_/g, ' ')}
                  </strong>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--emerald-pass)' }}>
                    {(step.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
