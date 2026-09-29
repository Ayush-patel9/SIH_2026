import React, { useState, useEffect, useRef } from "react";
import { Globe, Check } from "lucide-react";
import {
  LANGUAGES,
  type LanguageCode,
  changeLanguage,
  getInitialLanguage,
  loadGoogleTranslateScript,
  initGoogleTranslate,
} from "../lib/googleTranslate";

interface LanguageDropdownProps {
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  onLanguageChange,
}) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initLang = getInitialLanguage();
    setCurrentLang(initLang);
    loadGoogleTranslateScript()
      .then(() => initGoogleTranslate())
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    if (code === currentLang) {
      setIsOpen(false);
      return;
    }
    setCurrentLang(code);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
    changeLanguage(code);
  };

  const currentInfo = LANGUAGES[currentLang] || LANGUAGES.en;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select interface language"
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 11px',
            fontSize: '12px',
            fontFamily: 'var(--font-data)',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--hairline)',
            cursor: 'pointer',
          }}
        >
          <Globe size={13} style={{ color: 'var(--focus-blue)' }} />
          <span style={{ fontWeight: 600 }}>{currentInfo.nativeName}</span>
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '4px',
            width: '210px',
            maxHeight: '340px',
            overflowY: 'auto',
            background: 'var(--paper)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            padding: '4px 0',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: '10px',
              fontFamily: 'var(--font-data)',
              fontWeight: 700,
              color: 'var(--ink-muted)',
              borderBottom: '1px solid var(--hairline)',
              letterSpacing: '0.05em',
            }}
          >
            SELECT LANGUAGE / भाषा चुनें
          </div>

          {(
            Object.entries(LANGUAGES) as [
              LanguageCode,
              (typeof LANGUAGES)[LanguageCode]
            ][]
          ).map(([code, lang]) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                textAlign: 'left',
                border: 'none',
                background: currentLang === code ? 'rgba(27, 79, 224, 0.08)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-data)',
                fontSize: '12px',
                color: 'var(--ink)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  currentLang === code ? 'rgba(27, 79, 224, 0.08)' : 'transparent')
              }
            >
              <div>
                <div style={{ fontWeight: currentLang === code ? 700 : 500 }}>
                  {lang.nativeName}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>
                  {lang.name}
                </div>
              </div>
              {currentLang === code && (
                <Check size={14} style={{ color: 'var(--collapse-cobalt)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
