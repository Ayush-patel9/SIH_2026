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

function renderMarkdownText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--ink)', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
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
          <BookOpen size={16} color="var(--gold-text)" />
          <span className="section-label" style={{ margin: 0, color: 'var(--gold-text)' }}>
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

      <div className="plain-language-text" style={{ fontSize: '13.5px', lineHeight: 1.75, color: 'var(--ink)' }}>
        {mode === 'beginner' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px 14px', background: 'var(--gold-bg)', borderRadius: '6px', borderLeft: '3px solid var(--gold-antique)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>The Plain English Concept:</strong> {beginner.metaphor}
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--fail-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--fail)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>The Procurement Risk / CVC Trap:</strong> {beginner.trap}
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--pass-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--pass)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>What To Do Now:</strong> {beginner.action}
            </div>
          </div>
        ) : mode === 'plain' ? (
          renderMarkdownText(plainText)
        ) : (
          renderMarkdownText(
            recommendation?.scope_snippet ||
            'This Indian Standard covers the manufacture, physical and chemical testing tolerances, mandatory certification marking, and quality control order conformity assessment requirements.'
          )
        )}
      </div>
    </div>
  );
};
