import React, { useState } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { synthesizePlainLanguage, synthesizeExplainLikeImNewHere } from './reasoningParser';

interface PlainLanguageToggleProps {
  explanation?: {
    enabled?: boolean;
    text?: string;
  };
  recommendation?: {
    is_number?: string;
    year_published?: number | null;
    title?: string;
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
  const [mode, setMode] = useState<'technical' | 'plain' | 'beginner'>('plain');

  const plainText =
    explanation?.text ||
    synthesizePlainLanguage({
      ...recommendation,
      year_published: recommendation?.year_published ?? undefined,
    });

  const beginner = synthesizeExplainLikeImNewHere({
    ...recommendation,
    year_published: recommendation?.year_published ?? undefined,
  });

  return (
    <div className="plain-language-card">
      <div className="plain-language-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} color="#92400E" />
          <span className="section-label" style={{ margin: 0, color: '#92400E' }}>
            {mode === 'beginner' ? "NON-TECHNICAL PLAIN LANGUAGE TRANSLATION" : 'PROCUREMENT EXECUTIVE SUMMARY'}
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
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'beginner' ? 'active' : ''}`}
            onClick={() => setMode('beginner')}
            style={{
              fontWeight: 700,
              background: mode === 'beginner' ? 'var(--superposition-violet)' : undefined,
              color: mode === 'beginner' ? '#ffffff' : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <HelpCircle size={13} />
            <span>Plain Summary</span>
          </button>
        </div>
      </div>

      <div className="plain-language-text">
        {mode === 'beginner' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '4px', borderLeft: '3px solid #F59E0B' }}>
              <strong>The Plain English Concept:</strong> {beginner.metaphor}
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '4px', borderLeft: '3px solid #EF4444' }}>
              <strong>The Procurement Risk / CVC Trap:</strong> {beginner.trap}
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '4px', borderLeft: '3px solid #10B981' }}>
              <strong>What To Do Now:</strong> {beginner.action}
            </div>
          </div>
        ) : mode === 'plain' ? (
          plainText
        ) : (
          recommendation?.scope_snippet ||
          'This Indian Standard covers the manufacture, physical and chemical testing tolerances, mandatory certification marking, and quality control order conformity assessment requirements.'
        )}
      </div>
    </div>
  );
};
