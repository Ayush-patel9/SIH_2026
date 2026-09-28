import React from 'react';
import { LanguageDropdown } from './LanguageDropdown';
import type { SupportedLanguage } from '../types';
import type { LanguageCode } from '../lib/googleTranslate';

interface LanguageSelectorProps {
  language: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onChange,
}) => {
  return (
    <LanguageDropdown
      onLanguageChange={(code: LanguageCode) => {
        onChange(code as SupportedLanguage);
      }}
    />
  );
};
