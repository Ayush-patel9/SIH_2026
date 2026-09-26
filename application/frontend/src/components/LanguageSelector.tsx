import React from 'react';
import { LanguageDropdown } from './LanguageDropdown';
import type { SupportedLanguage } from '../types';
import type { LanguageCode } from '../lib/googleTranslate';

interface LanguageSelectorProps {
  language: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  bhashiniUsed?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onChange,
  bhashiniUsed,
}) => {
  return (
    <LanguageDropdown
      onLanguageChange={(code: LanguageCode) => {
        onChange(code as SupportedLanguage);
      }}
      bhashiniUsed={bhashiniUsed}
    />
  );
};
