import React, { useState } from 'react';
import type { StandardsResponse } from '../../types';
import { ReasoningTimeline } from './ReasoningTimeline';
import { ConfidenceBreakdownBar } from './ConfidenceBreakdownBar';
import { KnowledgeGraphViewer } from './KnowledgeGraphViewer';
import { PlainLanguageToggle } from './PlainLanguageToggle';
import { FlagButton, FeedbackModal } from '../feedback';
import { StalenessRiskBanner } from '../alerts';

interface ExplainabilityViewProps {
  data: StandardsResponse;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const primary = data.primary_recommendation;
  const qco = primary?.certification;
  const audit = data.audit_record;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Active Standard Recommendation Header Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="concept-status-badge active">
                {primary?.status || 'ACTIVE'}
              </span>
              {qco?.mandatory && (
                <span className="concept-status-badge" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#B45309', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
                  ⚖️ {qco.scheme.replace(/_/g, ' ')} MANDATORY
                </span>
              )}
              <span className="section-label" style={{ margin: 0 }}>
                DIV: {primary?.division_code || 'CED'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
              {primary?.is_number}
            </h1>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              {primary?.title}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div className="section-label" style={{ margin: 0 }}>
              PUBLISHED / AMENDMENT
            </div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 600 }}>
              {primary?.year_published} · {primary?.latest_amendment || 'Base Issue'}
            </div>
          </div>
        </div>

        {/* Superseded Standard Notice Banner if exists */}
        {primary?.supersedes && primary.supersedes.length > 0 && (
          <div className="debug-banner" style={{ marginTop: '14px', marginBottom: 0 }}>
            <div className="debug-badge">SUPERSEDED STANDARDS ALERT</div>
            <div className="debug-prompt-text" style={{ fontSize: '13px' }}>
              This standard consolidates and replaces: <strong>{primary.supersedes.join(', ')}</strong>. Do not cite legacy numbers in active NIT tenders.
            </div>
          </div>
        )}

        {/* Feature 04: Staleness Risk Banner */}
        {data.staleness_risk && (
          <div style={{ marginTop: '14px' }}>
            <StalenessRiskBanner risk={data.staleness_risk} />
          </div>
        )}

        {/* Feature 03: Integrated Flag Button on Card */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FlagButton
            queryId={data.meta.query_id}
            recommendationId={audit?.recommendation_id || 'rec-001'}
            isNumber={primary?.is_number || 'IS 269:2015'}
            onOpenModal={() => setIsModalOpen(true)}
          />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
            HUMAN-IN-THE-LOOP ACTIVE
          </span>
        </div>
      </div>

      {/* Component 4: Plain Language Executive Summary */}
      <PlainLanguageToggle
        explanation={data.plain_language_explanation}
        recommendation={primary}
      />

      {/* Component 2: Multi-Factor Confidence Breakdown */}
      <ConfidenceBreakdownBar
        breakdown={primary?.confidence_breakdown}
        confidence={primary?.confidence}
      />

      {/* Component 3: Knowledge Subgraph Viewer */}
      <KnowledgeGraphViewer
        data={data}
        edges={data.graph_path}
        primaryStandard={primary?.is_number}
      />

      {/* Component 1: Step-by-Step Reasoning Timeline */}
      <ReasoningTimeline
        steps={data.reasoning_trace}
      />

      {/* Feedback Modal for In-Place Flagging */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        queryId={data.meta.query_id}
        recommendationId={audit?.recommendation_id || 'rec-001'}
        flaggedIsNumber={primary?.is_number || 'IS 269:2015'}
      />
    </div>
  );
};
