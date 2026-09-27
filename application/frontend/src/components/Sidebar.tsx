import React from 'react';
import type { FeatureKey } from './MobileBottomNav';

interface SidebarProps {
  activeFeature: FeatureKey;
  onSelectFeature: (f: FeatureKey) => void;
  alertCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  key: FeatureKey;
  label: string;
  icon: string;
  badge?: string | number;
  description: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFeature,
  onSelectFeature,
  alertCount,
  collapsed,
  onToggleCollapse,
}) => {
  const sections: NavSection[] = [
    {
      title: 'STANDARDS & INTELLIGENCE',
      items: [
        {
          key: 'explainability',
          label: 'Standards Explorer',
          icon: '🔍',
          description: 'Search & Self-Correcting Graph Reasoning',
        },
        {
          key: 'graph3d',
          label: 'Normative Graph Mesh',
          icon: '🌐',
          badge: '3D LIVE',
          description: '22,011 Standards Interactive Knowledge Mesh',
        },
        {
          key: 'queryUnderstanding',
          label: 'Query Intent NLU',
          icon: '🧠',
          description: 'Gemini Technical Extraction & Normalization',
        },
        {
          key: 'comparison',
          label: 'Standards Comparison',
          icon: '⚖️',
          description: 'Diff & Allied Taxonomy Harmonization',
        },
        {
          key: 'timeMachine',
          label: 'Historical Time-Machine',
          icon: '⏳',
          description: '1950-2026 Standards Evolution Tree',
        },
      ],
    },
    {
      title: 'AUDIT & TENDER DEFENSE',
      items: [
        {
          key: 'audit',
          label: 'CVC Audit Defense',
          icon: '🛡️',
          badge: 'SHA-256',
          description: 'CVC Legal Defense & Sealed Audit Ledger',
        },
        {
          key: 'tenderUpload',
          label: 'Tender Clause Ingestion',
          icon: '📄',
          description: 'Auto-detect Outdated Citations & QCO Checks',
        },
        {
          key: 'nitGenerator',
          label: 'NIT Clause Generator',
          icon: '📝',
          description: 'Draft Statutory Specifications & Clauses',
        },
        {
          key: 'cagAudit',
          label: 'CAG Vigilance Simulator',
          icon: '📊',
          badge: '₹ SAVE',
          description: 'Financial Disallowance Stress-Tester',
        },
        {
          key: 'feedback',
          label: 'Human Feedback',
          icon: '👥',
          description: 'Officer Moderation & Approval Queue',
        },
      ],
    },
    {
      title: 'REGULATORY ECOSYSTEM',
      items: [
        {
          key: 'gazetteRadar',
          label: 'Gazette Radar Watchtower',
          icon: '📡',
          badge: 'LIVE',
          description: 'Autonomous E-Gazette QCO Scraper',
        },
        {
          key: 'dashboard',
          label: 'Ministry Compliance MIS',
          icon: '📈',
          description: 'National Standards Adherence Heatmap',
        },
        {
          key: 'alerts',
          label: 'Gazette Alerts',
          icon: '🚨',
          badge: alertCount > 0 ? alertCount : undefined,
          description: 'Supersession & Amendment Live Feed',
        },
        {
          key: 'voiceStudio',
          label: 'Bhashini Voice Station',
          icon: '🎙️',
          badge: '12 LANG',
          description: 'Indic Speech & Multilingual Audio TTS',
        },
        {
          key: 'integrations',
          label: 'GeM & CPPP Sandbox',
          icon: '🏛️',
          description: 'National E-Procurement Gateway API',
        },
        {
          key: 'mcp',
          label: 'MCP Tool Workbench',
          icon: '⚡',
          description: 'Model Context Protocol for External AI Agents',
        },
      ],
    },
  ];

  return (
    <aside
      className={`sidebar-nav ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '68px' : '264px',
        minWidth: collapsed ? '68px' : '264px',
        backgroundColor: '#F6F3EB',
        borderRight: '1px solid #E5E0D4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 50,
        height: '100vh',
        position: 'sticky',
        top: 0,
        userSelect: 'none',
      }}
    >
      {/* Top Header & Sovereign BIS Monogram */}
      <div>
        <div
          style={{
            padding: collapsed ? '16px 8px' : '18px 20px',
            borderBottom: '1px solid #EAE5D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #36452F 0%, #202F1A 100%)',
                color: '#FAF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-data)',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 2px 6px rgba(54, 69, 47, 0.25)',
                border: '1px solid #C29D53',
                flexShrink: 0,
              }}
              title="Bureau of Indian Standards — Government of India"
            >
              BIS
            </div>
            {!collapsed && (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#1C2419',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  Manak<span style={{ color: '#C29D53' }}>AI</span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '9.5px',
                    color: '#6E7A68',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    marginTop: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  Standards Portal · GoI
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              style={{
                background: '#FAF8F2',
                border: '1px solid #E5E0D4',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6E7A68',
                fontSize: '11px',
                transition: 'all 0.15s ease',
              }}
              title="Collapse sidebar"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#36452F';
                e.currentTarget.style.color = '#1C2419';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E0D4';
                e.currentTarget.style.color = '#6E7A68';
              }}
            >
              ◀
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div
          style={{
            padding: collapsed ? '12px 6px' : '14px 12px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 170px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {sections.map((sec, sIdx) => (
            <div key={sIdx}>
              {!collapsed && (
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#7E8B78',
                    letterSpacing: '0.08em',
                    padding: '0 8px 6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {sec.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {sec.items.map((item) => {
                  const isActive = activeFeature === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onSelectFeature(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        gap: '10px',
                        padding: collapsed ? '10px 0' : '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? '#E8EDE4' : 'transparent',
                        color: isActive ? '#1C2419' : '#44503E',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                        width: '100%',
                        textAlign: 'left',
                        position: 'relative',
                        boxShadow: isActive ? 'inset 0 0 0 1px rgba(54, 69, 47, 0.2)' : 'none',
                      }}
                      title={collapsed ? `${item.label} — ${item.description}` : item.description}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#EFE9DD';
                          e.currentTarget.style.color = '#1C2419';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#44503E';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                        {!collapsed && (
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!collapsed && item.badge !== undefined && (
                        <span
                          style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            background:
                              typeof item.badge === 'number'
                                ? '#FDF2F0'
                                : 'rgba(54, 69, 47, 0.12)',
                            color: typeof item.badge === 'number' ? '#BA3A2A' : '#36452F',
                            border:
                              typeof item.badge === 'number'
                                ? '1px solid #F7CDC6'
                                : '1px solid rgba(54, 69, 47, 0.25)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active Indicator Bar on left (Olive & Brass) */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '6px',
                            bottom: '6px',
                            width: '3.5px',
                            borderRadius: '0 4px 4px 0',
                            backgroundColor: '#36452F',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div
        style={{
          padding: collapsed ? '12px 6px' : '14px 16px',
          borderTop: '1px solid #EAE5D9',
          backgroundColor: '#F0EBE0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: '#FFFEFB',
              border: '1px solid #E5E0D4',
              borderRadius: '6px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6E7A68',
              fontSize: '11px',
            }}
            title="Expand sidebar"
          >
            ▶
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#2D6A4F',
                    boxShadow: '0 0 6px #2D6A4F',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    color: '#2E382A',
                    fontWeight: 600,
                  }}
                >
                  Gazette Stream
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '9.5px',
                  color: '#2D6A4F',
                  fontWeight: 700,
                  background: '#EDF7F1',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid #B7E4C7',
                }}
              >
                LIVE
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: '#6E7A68',
                lineHeight: 1.35,
              }}
            >
              22,011 Standards · v1.0.0
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
