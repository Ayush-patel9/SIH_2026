import React from 'react';
import type { FeatureKey } from './MobileBottomNav';
import { useSession } from '../store/userStore';
import type { UserRole } from '../types';
import {
  FolderKanban,
  Search,
  Share2,
  BrainCircuit,
  History,
  FileBarChart2,
  UserCheck,
  Radio,
  Terminal,
  Building2,
  Factory,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  badge?: string | number;
  description: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function isItemAllowedForRole(key: FeatureKey, role: UserRole): boolean {
  if (role === 'VENDOR') {
    const disallowed: FeatureKey[] = ['cagAudit', 'feedback', 'mcp'];
    return !disallowed.includes(key);
  }
  // OFFICER (Tender Authority & Technical Officer) has full access
  return true;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFeature,
  onSelectFeature,
  alertCount,
  collapsed,
  onToggleCollapse,
}) => {
  const { session } = useSession();
  const role: UserRole = session?.role || 'OFFICER';
  const sections: NavSection[] = [
    {
      title: 'TENDERS & PROJECTS',
      items: [
        {
          key: 'projects',
          label: role === 'VENDOR' ? 'Tender Marketplace' : 'Projects & Tenders',
          icon: FolderKanban,
          description: role === 'VENDOR' ? 'Explore active tenders & verify standards' : 'Procurement projects, tender ingestion & 3-stage intelligence',
        },
      ],
    },
    {
      title: 'STANDARDS & INTELLIGENCE',
      items: [
        {
          key: 'explainability',
          label: 'Standards Explorer',
          icon: Search,
          description: 'Search, Reasoning, Comparison, Audit & NIT Gen',
        },
        {
          key: 'graph3d',
          label: 'Normative Graph Mesh',
          icon: Share2,
          description: '22,011 Standards Interactive Knowledge Mesh',
        },
        {
          key: 'queryUnderstanding',
          label: 'Query Intent NLU',
          icon: BrainCircuit,
          description: 'Gemini Technical Extraction & Normalization',
        },
        {
          key: 'timeMachine',
          label: 'Historical Time-Machine',
          icon: History,
          description: '1950-2026 Standards Evolution Tree',
        },
      ],
    },
    {
      title: 'AUDIT & TENDER DEFENSE',
      items: [
        {
          key: 'cagAudit',
          label: 'CAG Vigilance Simulator',
          icon: FileBarChart2,
          description: 'Financial Disallowance Stress-Tester',
        },
        {
          key: 'feedback',
          label: 'Human Feedback',
          icon: UserCheck,
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
          icon: Radio,
          description: 'Autonomous E-Gazette QCO Scraper',
        },
        {
          key: 'mcp',
          label: 'MCP Tool Workbench',
          icon: Terminal,
          description: 'Model Context Protocol for External AI Agents',
        },
      ],
    },
  ];

  return (
    <aside
      className={`sidebar-nav ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '64px' : '248px',
        minWidth: collapsed ? '64px' : '248px',
        maxWidth: collapsed ? '64px' : '248px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--canvas-secondary)',
        borderRight: '1px solid var(--hairline)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
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
            padding: collapsed ? '14px 6px' : '15px 16px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, var(--olive-primary) 0%, var(--olive-dark) 100%)',
                color: '#FAF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-data)',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '0.04em',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.16)',
                border: '1px solid var(--gold-antique)',
                flexShrink: 0,
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title="Bureau of Indian Standards — Government of India"
            >
              BIS
            </div>
            {!collapsed && (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15.5px',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  Manak<span style={{ color: 'var(--gold-antique)' }}>AI</span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '9.5px',
                    color: 'var(--ink-muted)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
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
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: '6px',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink-muted)',
                fontSize: '11px',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
              title="Collapse sidebar"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--olive-primary)';
                e.currentTarget.style.color = 'var(--ink)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)';
                e.currentTarget.style.color = 'var(--ink-muted)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Workspace Identity Badge */}
        {!collapsed && session && (
          <div
            style={{
              margin: '12px 14px 6px 14px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderLeft: `3.5px solid ${role === 'VENDOR' ? 'var(--amber-warn)' : 'var(--olive-primary)'}`,
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: role === 'VENDOR' ? 'var(--amber-bg)' : 'var(--olive-leaf)',
                border: `1px solid ${role === 'VENDOR' ? 'var(--amber-border)' : 'var(--hairline)'}`,
                color: role === 'VENDOR' ? 'var(--amber-warn)' : 'var(--olive-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-data)',
                fontWeight: 800,
                fontSize: '11px',
                flexShrink: 0,
              }}
            >
              {session.name ? session.name.slice(0, 2).toUpperCase() : (role === 'VENDOR' ? 'VN' : 'AP')}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="live-beacon active" style={{ width: '5px', height: '5px' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: role === 'VENDOR' ? 'var(--amber-warn)' : 'var(--olive-primary)',
                  }}
                >
                  {role === 'VENDOR' ? 'Vendor Portal' : 'Tender Authority'}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {session.name || 'Officer Session'}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            padding: collapsed ? '12px 6px' : '8px 12px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 210px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {sections
            .map((sec) => ({
              ...sec,
              items: sec.items.filter((item) => isItemAllowedForRole(item.key, role)),
            }))
            .filter((sec) => sec.items.length > 0)
            .map((sec, sIdx) => (
            <div key={sIdx}>
              {sIdx > 0 && !collapsed && (
                <div
                  style={{
                    height: '1px',
                    margin: '10px 4px 14px 4px',
                    background: 'linear-gradient(90deg, transparent 0%, var(--hairline) 20%, var(--hairline) 80%, transparent 100%)',
                  }}
                />
              )}
              {!collapsed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 8px 6px',
                  }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--olive-sage)',
                      opacity: 0.65,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: 'var(--ink-muted)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {sec.title}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {sec.items.map((item) => {
                  const isActive = activeFeature === item.key;
                  const Icon = item.icon;
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
                        border: isActive ? '1px solid var(--hairline)' : '1px solid transparent',
                        background: isActive ? 'var(--surface)' : 'transparent',
                        color: isActive ? 'var(--ink)' : 'var(--ink-secondary)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                        width: '100%',
                        textAlign: 'left',
                        position: 'relative',
                        boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                      }}
                      title={collapsed ? `${item.label} — ${item.description}` : item.description}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          e.currentTarget.style.color = 'var(--ink)';
                          e.currentTarget.style.transform = 'translateX(3px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--ink-secondary)';
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} style={{ color: isActive ? 'var(--olive-primary)' : 'var(--ink-muted)', transition: 'color 0.15s ease' }} />
                        </span>
                        {!collapsed && (
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {item.badge !== undefined && (
                            <span
                              style={{
                                fontFamily: 'var(--font-data)',
                                fontSize: '9.5px',
                                fontWeight: 800,
                                padding: '2px 7px',
                                borderRadius: '9999px',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                letterSpacing: '0.04em',
                                background:
                                  typeof item.badge === 'number'
                                    ? 'var(--error-bg)'
                                    : 'var(--olive-tint, var(--olive-leaf))',
                                color: typeof item.badge === 'number' ? 'var(--error-red)' : 'var(--olive-primary)',
                                border:
                                  typeof item.badge === 'number'
                                    ? '1px solid var(--error-border)'
                                    : '1px solid var(--hairline)',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}

                          {isActive && (
                            <span style={{ fontSize: '13px', color: 'var(--olive-primary)', fontWeight: 800, lineHeight: 1, opacity: 0.85 }}>
                              ›
                            </span>
                          )}
                        </div>
                      )}

                      {/* Active Indicator Bar on left with subtle glow */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '6px',
                            bottom: '6px',
                            width: '3.5px',
                            borderRadius: '0 4px 4px 0',
                            backgroundColor: 'var(--olive-primary)',
                            boxShadow: '0 0 8px var(--olive-primary)',
                            animation: 'fadeIn 0.2s ease',
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
          padding: collapsed ? '12px 6px' : '12px 14px',
          borderTop: '1px solid var(--hairline)',
          backgroundColor: 'var(--canvas-secondary)',
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
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: '6px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink-muted)',
              fontSize: '11px',
              transition: 'all 0.15s ease',
            }}
            title="Expand sidebar"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--olive-primary)';
              e.currentTarget.style.color = 'var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--hairline)';
              e.currentTarget.style.color = 'var(--ink-muted)';
            }}
          >
            <ChevronRight size={14} />
          </button>
        ) : (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: '8px',
              padding: '10px 12px',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span className="live-beacon active" />
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    color: 'var(--ink)',
                    fontWeight: 700,
                  }}
                >
                  Gazette Stream
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '9px',
                  color: 'var(--emerald-text)',
                  background: 'var(--emerald-bg)',
                  border: '1px solid var(--emerald-border)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 800,
                }}
              >
                LIVE
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-data)',
                fontSize: '10px',
                color: 'var(--ink-muted)',
                borderTop: '1px solid var(--hairline)',
                paddingTop: '6px',
                marginTop: '2px',
              }}
            >
              <span>22,011 Standards</span>
              <span>v1.0.0</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
