import React, { useState } from 'react';
import { synthesizePlainLanguage } from './reasoningParser';

interface PlainLanguageToggleProps {
  explanation?: {
    enabled?: boolean;
    text?: string;
  };
  recommendation?: {
    is_number?: string;
    year_published?: number | null;
    scope_snippet?: string;
    certification?: {
      mandatory?: boolean;
      scheme?: string;
      qco_order_name?: string | null;
    };
  };
}

export const PlainLanguageToggle: React.FC<PlainLanguageToggleProps> = ({
  explanation,
  recommendation,
}) => {
  const [mode, setMode] = useState<'technical' | 'plain'>('plain');

  const plainText =
    explanation?.text ||
    synthesizePlainLanguage({
      ...recommendation,
      year_published: recommendation?.year_published ?? undefined,
    });

  return (
    <div className="plain-language-card">
      <div className="plain-language-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📜</span>
          <span className="section-label" style={{ margin: 0, color: '#92400E' }}>
            PROCUREMENT EXECUTIVE SUMMARY
          </span>
        </div>

        <div className="mode-toggle-group">
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'technical' ? 'active' : ''}`}
            onClick={() => setMode('technical')}
          >
            Technical Spec
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'plain' ? 'active' : ''}`}
            onClick={() => setMode('plain')}
          >
            Plain Language
          </button>
        </div>
      </div>

      <div className="plain-language-text">
        {mode === 'plain' ? (
          plainText
        ) : (
          recommendation?.scope_snippet ||
          'This Indian Standard covers the manufacture, physical and chemical testing tolerances, mandatory certification marking, and quality control order conformity assessment requirements.'
        )}
      </div>
    </div>
  );
};
