import React from 'react';

export type FeatureKey =
  | 'projects'
  | 'tenderAnalysis'
  | 'explainability'
  | 'audit'
  | 'feedback'
  | 'alerts'
  | 'comparison'
  | 'queryUnderstanding'
  | 'nitGenerator'
  | 'mcp'
  | 'dashboard'
  | 'tenderUpload'
  | 'integrations'
  | 'graph3d'
  | 'gazetteRadar'
  | 'timeMachine'
  | 'cagAudit'
  | 'voiceStudio';

interface MobileBottomNavProps {
  activeFeature: FeatureKey;
  onSelectFeature: (feature: FeatureKey) => void;
  alertCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeFeature,
  onSelectFeature,
  alertCount = 0,
}) => {
  const navItems: { key: FeatureKey; label: string; icon: string; badge?: number }[] = [
    { key: 'explainability', label: 'Search', icon: '🔍' },
    { key: 'projects', label: 'Projects', icon: '📁' },
    { key: 'alerts', label: 'Alerts', icon: '🔔', badge: alertCount },
    { key: 'nitGenerator', label: 'NIT Gen', icon: '📋' },
    { key: 'integrations', label: 'GeM/CPPP', icon: '🛒' },
    { key: 'audit', label: 'Audit', icon: '📜' },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--hairline)',
        display: 'none', // Controlled by CSS media query in index.css
        gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
        alignItems: 'center',
        zIndex: 999,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {navItems.map((item) => {
        const isActive = activeFeature === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectFeature(item.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              height: '100%',
              minHeight: '44px',
              padding: '4px 0',
              position: 'relative',
              color: isActive ? 'var(--collapse-cobalt)' : 'var(--ink-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                marginTop: '2px',
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '24px',
                  height: '2px',
                  background: 'var(--collapse-cobalt)',
                  borderRadius: '1px',
                }}
              />
            )}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: 'calc(50% - 16px)',
                  background: 'var(--error-line)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 4px',
                  lineHeight: 1,
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
