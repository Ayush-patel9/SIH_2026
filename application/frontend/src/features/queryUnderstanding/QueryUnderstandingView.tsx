import React, { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import type { StandardsResponse, AmbiguityOption } from '../../types';
import { QueryEntityDisplay } from './QueryEntityDisplay';
import { AmbiguityCard } from './AmbiguityCard';
import { IntentClassifierBadge } from './IntentClassifierBadge';
import { QueryCorrectionForm } from './QueryCorrectionForm';
import {
  buildRefinedQuery,
  applyQueryCorrection,
} from './refinedQueryBuilder';
import type { ManualEntityCorrections } from './refinedQueryBuilder';
import { queryStandards } from '../../api/standardsClient';

interface QueryUnderstandingViewProps {
  currentData: StandardsResponse;
  onUpdateData?: (updated: StandardsResponse) => void;
}

export const QueryUnderstandingView: React.FC<QueryUnderstandingViewProps> = ({
  currentData,
  onUpdateData,
}) => {
  const [activeData, setActiveData] = useState<StandardsResponse>(currentData);
  const [queryInput, setQueryInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  // Sync when parent currentData changes
  React.useEffect(() => {
    setActiveData(currentData);
  }, [currentData]);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const query = textToAnalyze || queryInput;
    if (!query.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await queryStandards(query);
      setActiveData(result);
      if (onUpdateData) onUpdateData(result);
    } catch (err) {
      console.error('NLU query failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

        {/* Live Query Input Bar */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--hairline)' }}>
          <div className="section-label" style={{ margin: '0 0 8px 0' }}>
            ENTER TENDER SPECIFICATION OR AMBIGUOUS QUERY:
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#71717A" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Enter tender clause or raw specification (e.g., Fe 500 TMT bars for coastal foundation, 53 grade cement for precast, HDPE pipes 110mm PN6)..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze();
                }}
                className="auth-input"
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  fontSize: '13px',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || !queryInput.trim()}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                whiteSpace: 'nowrap',
                opacity: isAnalyzing || !queryInput.trim() ? 0.7 : 1,
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={15} className="spinner" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Analyze Intent</span>
                </>
              )}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', fontSize: '11.5px', color: 'var(--ink-muted)', flexWrap: 'wrap' }}>
            <span>Quick tests:</span>
            {['Fe 500D TMT bars for coastal RCC', '53 Grade Ordinary Portland Cement', 'HDPE water supply pipes PN 10'].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setQueryInput(ex);
                  handleAnalyze(ex);
                }}
                style={{
                  background: 'none',
                  border: '1px dashed var(--hairline)',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  color: 'var(--ink-secondary)',
                  cursor: 'pointer',
                }}
              >
                "{ex}"
              </button>
            ))}
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
