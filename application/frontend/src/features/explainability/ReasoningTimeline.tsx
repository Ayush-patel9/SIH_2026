import React from 'react';
import { STEP_LABELS, FALLBACK_TRACE, type ReasoningStep } from './reasoningParser';

interface ReasoningTimelineProps {
  steps?: ReasoningStep[];
}

export const ReasoningTimeline: React.FC<ReasoningTimelineProps> = ({ steps }) => {
  const activeSteps = steps && steps.length > 0 ? steps : FALLBACK_TRACE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' }}>
      <div className="reasoning-timeline">
        {activeSteps.map((stepItem, index) => {
          const meta = STEP_LABELS[stepItem.step] || {
            icon: '📋',
            title: stepItem.step.replace(/_/g, ' ').toUpperCase(),
            subtitle: 'Pipeline Inference Stage',
          };

          const confidence = stepItem.confidence ?? 1.0;
          const confidencePct = Math.round(confidence * 100);

          let cardModifier = 'high-confidence';
          let fillModifier = 'cobalt';
          if (confidence < 0.80) {
            cardModifier = 'low-confidence';
            fillModifier = 'amber';
          } else if (confidence < 0.90) {
            cardModifier = 'med-confidence';
            fillModifier = 'violet';
          }

          return (
            <div key={index} className={`timeline-step-card ${cardModifier}`} style={{ padding: '14px 16px' }}>
              <div className="timeline-step-header">
                <div className="timeline-step-title-group">
                  <span className="timeline-step-icon" style={{ width: '28px', height: '28px', fontSize: '15px' }}>
                    {meta.icon}
                  </span>
                  <div>
                    <div className="timeline-step-title" style={{ fontSize: '13px' }}>{meta.title}</div>
                    <div className="timeline-step-subtitle" style={{ fontSize: '10.5px' }}>{meta.subtitle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="concept-status-badge in-progress" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    STAGE {index + 1}/7
                  </span>
                  <span className="confidence-pct-badge font-mono" style={{ fontSize: '11px' }}>
                    {confidencePct}%
                  </span>
                </div>
              </div>

              <div className="timeline-step-detail" style={{ fontSize: '12.5px', color: 'var(--ink-secondary)' }}>
                {stepItem.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
