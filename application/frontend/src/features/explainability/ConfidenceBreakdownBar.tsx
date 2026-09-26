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
    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="section-label" style={{ margin: 0 }}>CONFIDENCE FACTOR BREAKDOWN</span>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Weighted contribution of vector semantic search, exact keyword matching, and citation graph topology
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--focus-blue)' }}>
            {result.globalConfidencePct}%
          </span>
        </div>
      </div>

      <div className="breakdown-bar-container">
        <div className="breakdown-multi-bar" style={{ height: '8px', borderRadius: '4px' }}>
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

        <div className="breakdown-legend" style={{ gap: '18px', paddingTop: '4px' }}>
          <div className="breakdown-legend-item">
            <div className="breakdown-swatch" style={{ background: 'var(--focus-blue)' }} />
            <span>Vector Semantic (<strong>{result.semanticPct}%</strong>)</span>
          </div>
          <div className="breakdown-legend-item">
            <div className="breakdown-swatch" style={{ background: 'var(--superposition-violet)' }} />
            <span>Keyword Match (<strong>{result.keywordPct}%</strong>)</span>
          </div>
          <div className="breakdown-legend-item">
            <div className="breakdown-swatch" style={{ background: 'var(--saffron)' }} />
            <span>Graph Boost (<strong>{result.graphPct}%</strong>)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
