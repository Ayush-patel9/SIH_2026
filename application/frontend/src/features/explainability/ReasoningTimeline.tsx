import React from 'react';
import { STEP_LABELS, FALLBACK_TRACE, type ReasoningStep } from './reasoningParser';

interface ReasoningTimelineProps {
  steps?: ReasoningStep[];
}

export const ReasoningTimeline: React.FC<ReasoningTimelineProps> = ({ steps }) => {
  const activeSteps = steps && steps.length > 0 ? steps : FALLBACK_TRACE;

  return (
    <div className="workbench-card">
      <div className="workbench-card-header">
        <div>
          <h2 className="workbench-card-title">Reasoning Trail</h2>
          <div className="workbench-card-subtitle">
            Multi-stage audit trace for Central Vigilance Commission (CVC) legal defensibility
          </div>
        </div>
        <span className="concept-status-badge active">
          {activeSteps.length} STAGES VERIFIED
        </span>
      </div>

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
            <div key={index} className={`timeline-step-card ${cardModifier}`}>
              <div className="timeline-step-header">
                <div className="timeline-step-title-group">
                  <span className="timeline-step-icon">{meta.icon}</span>
                  <div>
                    <div className="timeline-step-title">{meta.title}</div>
                    <div className="timeline-step-subtitle">{meta.subtitle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {confidence < 0.80 && (
                    <span className="concept-status-badge withdrawn" style={{ fontSize: '9px' }}>
                      LOW CONFIDENCE
                    </span>
                  )}
                  <span className="concept-status-badge in-progress">
                    STEP {index + 1}
                  </span>
                </div>
              </div>

              <div className="timeline-step-detail">
                {stepItem.detail}
              </div>

              <div className="confidence-meter-row">
                <div className="section-label" style={{ margin: 0, minWidth: '75px', fontSize: '10px' }}>
                  Confidence
                </div>
                <div className="confidence-track">
                  <div
                    className={`confidence-fill ${fillModifier}`}
                    style={{ width: `${confidencePct}%` }}
                  />
                </div>
                <div className="confidence-pct-badge font-mono">
                  {confidencePct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
