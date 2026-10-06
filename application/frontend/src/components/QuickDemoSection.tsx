import React, { useState } from 'react';
import type { UserRole } from '../types';
import type { UserProfile } from '../store/userStore';
import { DEMO_ACCOUNTS, type DemoAccount } from '../data/demoAccounts';
import { loginAsDemo } from '../store/userStore';
import {
  Building2,
  Factory,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Lock,
  Mail,
  User,
  ExternalLink,
  Award,
} from 'lucide-react';

export interface QuickDemoSectionProps {
  onQuickDemoLogin?: (demoUser: UserProfile) => void;
  onEnterApp?: () => void;
  onFillLogin?: (role: UserRole, email: string, password: string) => void;
  id?: string;
}

export const QuickDemoSection: React.FC<QuickDemoSectionProps> = ({
  onQuickDemoLogin,
  onEnterApp,
  onFillLogin,
  id = 'quick-demo',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const handleLaunch = (demo: DemoAccount) => {
    setLaunchingId(demo.id);
    const result = loginAsDemo(demo.id);
    if (result.success && result.user) {
      setTimeout(() => {
        if (onQuickDemoLogin) {
          onQuickDemoLogin(result.user!);
        } else if (onEnterApp) {
          onEnterApp();
        }
      }, 250);
    }
  };

  const getPersonaIcon = (type: DemoAccount['badgeType']) => {
    switch (type) {
      case 'judge':
        return <Building2 size={22} />;
      case 'vendor':
        return <Factory size={22} />;
      case 'auditor':
        return <ShieldCheck size={22} />;
      default:
        return <User size={22} />;
    }
  };

  const getThemeColors = (type: DemoAccount['badgeType']) => {
    switch (type) {
      case 'judge':
        return {
          primary: 'var(--emerald-pass)',
          bg: 'var(--emerald-bg)',
          border: 'var(--emerald-border)',
          text: 'var(--emerald-text)',
          tint: '#E8F5E9',
          accent: '#1B4332',
        };
      case 'vendor':
        return {
          primary: 'var(--gold-text)',
          bg: 'var(--gold-bg)',
          border: 'var(--gold-border)',
          text: 'var(--gold-text)',
          tint: '#FFF9E6',
          accent: '#8A6922',
        };
      case 'auditor':
        return {
          primary: 'var(--superposition-violet)',
          bg: 'var(--superposition-bg)',
          border: 'var(--superposition-border)',
          text: 'var(--superposition-violet)',
          tint: '#F3E8FF',
          accent: '#4C1D95',
        };
    }
  };

  return (
    <section
      id={id}
      style={{
        padding: '52px 0 64px',
        position: 'relative',
      }}
    >
      {/* Background Accent Banner Glow */}
      <div
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-secondary) 100%)',
          border: '1px solid var(--hairline)',
          padding: '40px 32px 48px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Decorative Gold Accent Strip at Top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--emerald-pass) 0%, var(--gold-antique) 50%, var(--olive-primary) 100%)',
          }}
        />

        {/* Section Heading & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'var(--gold-bg)',
              border: '1px solid var(--gold-border)',
              color: 'var(--gold-text)',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}
          >
            <Zap size={14} color="var(--gold-antique)" />
            <span>SIH 2026 · TEAM NEXUS · IIIT BANGALORE (IIITB) · QUICK DEMO</span>
          </div>

          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '0 0 12px',
              letterSpacing: '-0.025em',
              lineHeight: 1.22,
            }}
          >
            Quick Demo Credentials & 1-Click Judge Access
          </h2>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--ink-secondary)',
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 500,
            }}
          >
            Presented by <strong>Team Nexus (IIITB)</strong> for Smart India Hackathon evaluation. Click either credential below to launch immediately into that sovereign workspace—with pre-loaded tender documents, mandatory QCO rules, and cryptographic audit ledgers ready to inspect.
          </p>
        </div>

        {/* Persona Cards Grid (Balanced 2-Column Layout) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            maxWidth: '960px',
            margin: '0 auto',
            alignItems: 'stretch',
          }}
        >
          {DEMO_ACCOUNTS.map((demo) => {
            const theme = getThemeColors(demo.badgeType);
            const isHovered = hoveredCard === demo.id;
            const isLaunching = launchingId === demo.id;

            return (
              <div
                key={demo.id}
                onMouseEnter={() => setHoveredCard(demo.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px',
                  border: demo.recommendedForJudge
                    ? '2px solid var(--emerald-pass)'
                    : isHovered
                    ? `1px solid ${theme.primary}`
                    : '1px solid var(--hairline)',
                  padding: '26px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: demo.recommendedForJudge
                    ? isHovered
                      ? '0 12px 32px rgba(45, 106, 79, 0.16)'
                      : '0 4px 20px rgba(45, 106, 79, 0.10)'
                    : isHovered
                    ? 'var(--shadow-card-hover)'
                    : 'var(--shadow-xs)',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top Badge (Recommended for Judge or Role Type) */}
                {demo.recommendedForJudge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: 'var(--emerald-pass)',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderBottomLeftRadius: '10px',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Award size={12} />
                    <span>RECOMMENDED FOR JUDGES</span>
                  </div>
                )}

                <div>
                  {/* Persona Header: Icon & Role Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      marginTop: demo.recommendedForJudge ? '6px' : '0',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.primary,
                        flexShrink: 0,
                      }}
                    >
                      {getPersonaIcon(demo.badgeType)}
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: theme.primary,
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        {demo.badge}
                      </span>
                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: 800,
                          color: 'var(--ink)',
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {demo.name}
                      </h3>
                    </div>
                  </div>

                  {/* Organization & Designation */}
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--ink-secondary)',
                      lineHeight: 1.45,
                      marginBottom: '16px',
                      paddingBottom: '14px',
                      borderBottom: '1px solid var(--hairline)',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{demo.designation}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                      {demo.organization}
                    </div>
                  </div>

                  {/* Credentials Box */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--ink-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Demo Credentials</span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: theme.primary,
                          fontWeight: 700,
                          backgroundColor: theme.bg,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        Role: {demo.role}
                      </span>
                    </div>

                    {/* Email row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '6px',
                        border: '1px solid var(--hairline)',
                        marginBottom: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <Mail size={13} color="var(--ink-muted)" />
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-data)',
                            color: 'var(--ink)',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {demo.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(demo.email, `${demo.id}-email`, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedKey === `${demo.id}-email` ? 'var(--emerald-pass)' : 'var(--ink-muted)',
                          cursor: 'pointer',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'color 0.15s ease',
                        }}
                        title="Copy email to clipboard"
                      >
                        {copiedKey === `${demo.id}-email` ? (
                          <>
                            <Check size={12} color="var(--emerald-pass)" />
                            <span style={{ color: 'var(--emerald-pass)' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Password row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '6px',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={13} color="var(--ink-muted)" />
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-data)',
                            color: 'var(--ink)',
                            fontWeight: 600,
                          }}
                        >
                          {demo.password}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(demo.password, `${demo.id}-pass`, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedKey === `${demo.id}-pass` ? 'var(--emerald-pass)' : 'var(--ink-muted)',
                          cursor: 'pointer',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'color 0.15s ease',
                        }}
                        title="Copy password to clipboard"
                      >
                        {copiedKey === `${demo.id}-pass` ? (
                          <>
                            <Check size={12} color="var(--emerald-pass)" />
                            <span style={{ color: 'var(--emerald-pass)' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Highlights Bullet Points */}
                  <div style={{ marginBottom: '22px' }}>
                    <div
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        marginBottom: '8px',
                      }}
                    >
                      Key Features to Inspect:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {demo.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '7px',
                            fontSize: '12px',
                            color: 'var(--ink-secondary)',
                            lineHeight: 1.4,
                          }}
                        >
                          <CheckCircle2
                            size={14}
                            color={theme.primary}
                            style={{ flexShrink: 0, marginTop: '2px' }}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {/* Primary 1-Click Launch Button */}
                  <button
                    type="button"
                    onClick={() => handleLaunch(demo)}
                    disabled={isLaunching}
                    style={{
                      width: '100%',
                      backgroundColor: demo.recommendedForJudge
                        ? 'var(--emerald-pass)'
                        : demo.badgeType === 'vendor'
                        ? 'var(--gold-text)'
                        : 'var(--olive-primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: isLaunching ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.15s ease',
                      opacity: isLaunching ? 0.8 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLaunching) e.currentTarget.style.filter = 'brightness(0.92)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLaunching) e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <Zap size={15} />
                    <span>
                      {isLaunching
                        ? 'Launching Workspace...'
                        : demo.recommendedForJudge
                        ? '1-Click Launch as Authority Judge'
                        : demo.badgeType === 'vendor'
                        ? '1-Click Launch as Industrial Vendor'
                        : '1-Click Launch as CVC Auditor'}
                    </span>
                    <ArrowRight size={14} />
                  </button>

                  {/* Secondary "Auto-Fill in Sign In Form" button */}
                  {onFillLogin && (
                    <button
                      type="button"
                      onClick={() => onFillLogin(demo.role, demo.email, demo.password)}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--hairline)',
                        color: 'var(--ink-secondary)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                        e.currentTarget.style.borderColor = 'var(--hairline-hover)';
                        e.currentTarget.style.color = 'var(--ink)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--hairline)';
                        e.currentTarget.style.color = 'var(--ink-secondary)';
                      }}
                      title="Prefill email and password on the standard login page"
                    >
                      <ExternalLink size={12} />
                      <span>Inspect via Standard Sign In Page</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Safety Footnote */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: 'var(--ink-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--emerald-pass)" />
            <span>
              <strong>Team Nexus (IIIT Bangalore):</strong> Pre-configured sandbox credentials for Smart India Hackathon 2026 judging and inspection.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-data)', fontSize: '11px' }}>
            <span>Single-Click Auth</span>
            <span>·</span>
            <span>No Signup Required</span>
            <span>·</span>
            <span>Instant Judge Mode</span>
          </div>
        </div>
      </div>
    </section>
  );
};
