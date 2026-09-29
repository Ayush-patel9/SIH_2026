import React from 'react';
import { useTheme } from '../store/themeStore';

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  compact = false,
  className = '',
  style = {},
}) => {
  const { theme, toggleTheme, isZoom, meta } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-switcher-btn ${className}`}
      title={`Current Theme: ${meta.name} (Click to switch to ${isZoom ? 'Sovereign Editorial' : 'Zoom Enterprise'})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: compact ? '4px 8px' : '5px 12px',
        fontSize: '12px',
        fontWeight: 600,
        height: '32px',
        borderRadius: '8px',
        border: '1px solid var(--hairline)',
        background: 'var(--surface-secondary)',
        color: 'var(--ink)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--olive-primary)';
        e.currentTarget.style.background = 'var(--surface-hover)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--hairline)';
        e.currentTarget.style.background = 'var(--surface-secondary)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Dynamic Palette Dots Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: meta.palette.primary,
            border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: '0 0 4px rgba(0,0,0,0.15)',
          }}
        />
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: meta.palette.highlight,
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        />
      </div>

      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
        {meta.shortName}
      </span>

      <span
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '9px',
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: '4px',
          background: isZoom ? 'rgba(10, 65, 116, 0.12)' : 'rgba(54, 69, 47, 0.12)',
          color: isZoom ? '#0A4174' : '#36452F',
          letterSpacing: '0.04em',
        }}
      >
        {isZoom ? 'ZOOM' : 'CLASSIC'}
      </span>
    </button>
  );
};
