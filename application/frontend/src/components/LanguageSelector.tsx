import React from 'react';
import type { SupportedLanguage } from '../types';

const LANGUAGES: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

interface LanguageSelectorProps {
  language: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  bhashiniUsed?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onChange,
  bhashiniUsed,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <select
      value={language}
      onChange={(e) => onChange(e.target.value as SupportedLanguage)}
      className="auth-input auth-select"
      style={{
        fontSize: '12px',
        padding: '3px 8px',
        height: '28px',
        background: 'var(--surface)',
        color: 'var(--ink)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--hairline)',
        fontFamily: 'var(--font-data)',
        cursor: 'pointer',
      }}
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.native} ({l.label})
        </option>
      ))}
    </select>
    {bhashiniUsed && (
      <span
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '10px',
          fontWeight: 700,
          background: 'rgba(27, 79, 224, 0.1)',
          color: 'var(--collapse-cobalt)',
          border: '1px solid rgba(27, 79, 224, 0.3)',
          borderRadius: '2px',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>🌐</span> BHASHINI NLP ✓
      </span>
    )}
  </div>
);
