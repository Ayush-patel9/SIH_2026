import React from 'react';
import {
  calculateConfidenceBreakdown,
  type ConfidenceBreakdownData,
} from './reasoningParser';

interface ConfidenceBreakdownBarProps {
  breakdown?: ConfidenceBreakdownData;
  confidence?: number;
}

export const ConfidenceBreakdownBar: React.FC<ConfidenceBreakdownBarProps> = ({
  breakdown,
  confidence = 0.94,
}) => {
  const result = calculateConfidenceBreakdown(breakdown, confidence);

  return (
    <div className="workbench-card">
      <div className="workbench-card-header">
        <div>
          <h2 className="workbench-card-title">Confidence Factor Breakdown</h2>
          <div className="workbench-card-subtitle">
            Proportional contribution of vector semantics, exact keyword matching, and graph topology
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="section-label" style={{ margin: 0 }}>
            GLOBAL SCORE
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
            {result.globalConfidencePct}%
          </div>
        </div>
      </div>

      <div className="breakdown-bar-container">
        <div className="breakdown-multi-bar">
          <div
            className="breakdown-segment semantic"
            style={{ width: `${result.semanticPct}%` }}
            title={`Vector Semantic Search: ${result.semanticPct}%`}
          />
          <div
            className="breakdown-segment keyword"
            style={{ width: `${result.keywordPct}%` }}
            title={`Exact Keyword Match: ${result.keywordPct}%`}
          />
          <div
            className="breakdown-segment graph"
            style={{ width: `${result.graphPct}%` }}
            title={`Graph Co-Citation Boost: ${result.graphPct}%`}
          />
        </div>

        <div className="breakdown-legend">
          <div className="breakdown-legend-item">
            <div className="breakdown-swatch" style={{ background: 'var(--collapse-cobalt)' }} />
            <span>Vector Semantic Score (<strong>{result.semanticPct}%</strong>)</span>
          </div>
          <div className="breakdown-legend-item">
            <div className="breakdown-swatch" style={{ background: 'var(--superposition-violet)' }} />
            <span>Keyword Exact Match (<strong>{result.keywordPct}%</strong>)</span>
          </div>
          <div className="breakdown-legend-item">
            <div className="breakdown-swatch" style={{ background: 'var(--signal-amber)' }} />
            <span>Graph Citation Boost (<strong>{result.graphPct}%</strong>)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
