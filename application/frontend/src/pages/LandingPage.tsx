import React, { useState } from 'react';
import type { UserRole } from '../types';
import type { UserProfile } from '../store/userStore';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { QuickDemoSection } from '../components/QuickDemoSection';
import { Building2, Factory, ArrowRight, CheckCircle2, Award, Zap } from 'lucide-react';

interface LandingPageProps {
  onLogin: (preselectedRole?: UserRole, mode?: 'signin' | 'signup', email?: string, password?: string) => void;
  onEnterApp?: () => void;
  onQuickDemoLogin?: (demoUser: UserProfile) => void;
  isLoggedIn?: boolean;
  loggedInUser?: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onEnterApp,
  onQuickDemoLogin,
  isLoggedIn,
  loggedInUser,
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--canvas)',
        color: 'var(--ink)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Sovereign / Zoom Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'var(--canvas)',
          borderBottom: '1px solid var(--hairline)',
          padding: '12px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & National Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'var(--olive-primary)',
                border: '1px solid var(--olive-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>M</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'var(--ink)',
                  }}
                >
                  Manak<span style={{ color: 'var(--gold-antique)' }}>AI</span>
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--gold-bg)',
                    color: 'var(--gold-text)',
                    border: '1px solid var(--gold-border)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  SIH 2026
                </span>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--ink-muted)',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                }}
              >
                Bureau of Indian Standards · Sovereign Normative Intelligence
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-secondary)',
            }}
          >
            <a
              href="#quick-demo"
              style={{
                color: 'var(--gold-text)',
                backgroundColor: 'var(--gold-bg)',
                border: '1px solid var(--gold-border)',
                padding: '4px 10px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--gold-antique)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gold-bg)';
                e.currentTarget.style.borderColor = 'var(--gold-border)';
              }}
            >
              <Zap size={13} color="var(--gold-antique)" />
              <span>Quick Demo</span>
            </a>
            <a
              href="#roles"
              style={{ color: 'var(--ink-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-secondary)')}
            >
              Role Workspaces
            </a>
            <a
              href="#features"
              style={{ color: 'var(--ink-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-secondary)')}
            >
              QCO Verification
            </a>
            <a
              href="#metrics"
              style={{ color: 'var(--ink-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-secondary)')}
            >
              CVC Defensibility
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeSwitcher />

            {isLoggedIn && loggedInUser ? (
              <button
                type="button"
                onClick={onEnterApp}
                style={{
                  backgroundColor: 'var(--olive-primary)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                  <span>Enter Workspace ({loggedInUser.name.split(' ')[0]})</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onLogin(undefined, 'signin')}
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      color: 'var(--ink)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--olive-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--hairline)';
                      e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => onLogin(undefined, 'signup')}
                    style={{
                      backgroundColor: 'var(--olive-primary)',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--olive-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--olive-primary)')}
                  >
                    <span>Create Account</span>
                    <ArrowRight size={13} />
                  </button>
                </>
              )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* HERO SECTION */}
        <section style={{ textAlign: 'center', paddingTop: '56px', paddingBottom: '48px' }}>
          {/* Sovereign Tag */}
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
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            <Award size={14} color="var(--gold-text)" />
            <span>Government of India · Bureau of Indian Standards (BIS)</span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--gold-antique)' }} />
            <span style={{ color: 'var(--ink-secondary)', fontWeight: 600 }}>BIS Act 2016 Compliant</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              maxWidth: '920px',
              margin: '0 auto 18px',
              color: 'var(--ink)',
            }}
          >
            Zero-Defect Public Procurement Through Normative Intelligence
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16.5px',
              color: 'var(--ink-secondary)',
              lineHeight: 1.6,
              maxWidth: '760px',
              margin: '0 auto 32px',
              fontWeight: 500,
            }}
          >
            Eliminate tender cancellations, outdated IS citations, and audit disallowances.
            Instantly map engineering specifications across <strong style={{ color: 'var(--ink)', fontWeight: 800 }}>22,011+ Indian Standards</strong>,{' '}
            <strong style={{ color: 'var(--ink)', fontWeight: 800 }}>92 mandatory Quality Control Orders</strong>, and generate cryptographic CVC defense seals.
          </p>

          {/* Role Gateway Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '44px',
            }}
          >
            <button
              type="button"
              onClick={() => onLogin('OFFICER', 'signup')}
              style={{
                backgroundColor: 'var(--emerald-bg)',
                border: '1px solid var(--emerald-border)',
                color: 'var(--emerald-pass)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Building2 size={18} />
              <span>Tender Authority & Officer Gateway</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => onLogin('VENDOR', 'signup')}
              style={{
                backgroundColor: 'var(--gold-bg)',
                border: '1px solid var(--gold-border)',
                color: 'var(--gold-text)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Factory size={18} />
              <span>Industrial Vendor & MSME Gateway</span>
              <ArrowRight size={14} />
            </button>

            {/* Quick Demo Judge Fast-Track Link */}
            <div style={{ width: '100%', marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
              <a
                href="#quick-demo"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 18px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--gold-bg)',
                  border: '1px solid var(--gold-border)',
                  color: 'var(--gold-text)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                  e.currentTarget.style.borderColor = 'var(--gold-antique)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gold-bg)';
                  e.currentTarget.style.borderColor = 'var(--gold-border)';
                }}
              >
                <Zap size={14} color="var(--gold-antique)" />
                <span>Team Nexus (IIITB) · Inspect Quick Demo Credentials Below ↓</span>
              </a>
            </div>
          </div>

          {/* STATS TICKER */}
          <div
            id="metrics"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              padding: '22px 24px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--olive-primary)', fontFamily: 'var(--font-data)' }}>
                22,011
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: 600, marginTop: '3px' }}>
                Active Indian Standards (IS)
              </div>
            </div>
            <div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--gold-antique)', fontFamily: 'var(--font-data)' }}>
                92 Orders
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: 600, marginTop: '3px' }}>
                Mandatory QCO Enactments
              </div>
            </div>
            <div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--emerald-pass)', fontFamily: 'var(--font-data)' }}>
                ₹1,840 Cr+
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: 600, marginTop: '3px' }}>
                Audit Disallowances Prevented
              </div>
            </div>
            <div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-data)' }}>
                100% SHA-256
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: 600, marginTop: '3px' }}>
                Cryptographic CVC Defensibility
              </div>
            </div>
          </div>
        </section>

        {/* QUICK DEMO SECTION · SIH 2026 JUDGE FAST-TRACK */}
        <QuickDemoSection
          id="quick-demo"
          onQuickDemoLogin={onQuickDemoLogin}
          onEnterApp={onEnterApp}
          onFillLogin={(role, email, password) => onLogin(role, 'signin', email, password)}
        />

        {/* 3 ROLE WORKSPACES SHOWCASE */}
        <section id="roles" style={{ padding: '32px 0 54px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              Role-Engineered Sovereign Workspaces
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--ink-muted)', maxWidth: '620px', margin: '6px auto 0' }}>
              Create an account with your official organization. Every user role unlocks dedicated statutory toolchains, isolated audit ledgers, and tailored workflows.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '20px',
            }}
          >
            {/* UNIFIED ROLE CARD 1: TENDER AUTHORITY & TECHNICAL OFFICER */}
            <div
              onMouseEnter={() => setHoveredCard('officer')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: 'var(--surface)',
                border: `1px solid ${hoveredCard === 'officer' ? 'var(--olive-primary)' : 'var(--hairline)'}`,
                borderRadius: '12px',
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                transform: hoveredCard === 'officer' ? 'translateY(-3px)' : 'none',
                boxShadow:
                  hoveredCard === 'officer'
                    ? 'var(--shadow-card-hover)'
                    : 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--olive-tint)',
                      border: '1px solid var(--hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--olive-primary)',
                    }}
                  >
                    <Building2 size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--olive-primary)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-data)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    CPWD · NHAI · RAILWAYS · CAG · CVC
                  </span>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  Tender Authority & Technical Officer
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Draft legally compliant tender documents, verify mandatory Quality Control Orders, resolve AI engineering clarifications, and secure cryptographic SHA-256 evidence for CVC & CAG statutory audit defense.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={15} color="var(--emerald-pass)" />
                    <span>3-Stage AI Tender Document Decomposition & Clause Redlines</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={15} color="var(--emerald-pass)" />
                    <span>Human-in-the-Loop engineering clarifications with confidence boost</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={15} color="var(--emerald-pass)" />
                    <span>Cryptographic SHA-256 seal & GFR Rule 144(xi) / 149 audit defensibility</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={15} color="var(--emerald-pass)" />
                    <span>One-click statutory NIT specifications & CVC compliance dossier export</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onLogin('OFFICER', 'signup')}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--olive-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'opacity 0.15s',
                  }}
                >
                  <span>Create Authority Account</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onLogin('OFFICER', 'signin')}
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    color: 'var(--ink)',
                    padding: '11px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Sign in to existing officer account"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* ROLE CARD 3: VENDOR */}
            <div
              onMouseEnter={() => setHoveredCard('vendor')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: 'var(--surface)',
                border: `1px solid ${hoveredCard === 'vendor' ? 'var(--amber-warn)' : 'var(--hairline)'}`,
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                transform: hoveredCard === 'vendor' ? 'translateY(-3px)' : 'none',
                boxShadow:
                  hoveredCard === 'vendor'
                    ? 'var(--shadow-card-hover)'
                    : 'var(--shadow-card)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--amber-bg)',
                      border: '1px solid var(--amber-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--amber-warn)',
                    }}
                  >
                    <Factory size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--amber-bg)',
                      color: 'var(--amber-warn)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-data)',
                      border: '1px solid var(--amber-border)',
                    }}
                  >
                    EPC · BIDDERS · MSME
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  Industrial Vendor & Bidder
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                  Verify your products against mandatory BIS Scheme-I (ISI Mark) and Scheme-II (CRS), check NABL laboratory testing codes, and pre-screen bids.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={14} color="var(--amber-warn)" />
                    <span>BIS ISI Mark & CRS Portal direct license verification</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--amber-warn)' }}>
                    <CheckCircle2 size={14} color="var(--amber-warn)" />
                    <span>Mandatory NABL laboratory test protocols & sampling</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={14} color="var(--amber-warn)" />
                    <span>Tender non-compliance pre-screening before bidding</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink)' }}>
                    <CheckCircle2 size={14} color="var(--amber-warn)" />
                    <span>Bhashini Voice Station for 12 Indian regional languages</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onLogin('VENDOR', 'signup')}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--amber-warn)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'opacity 0.15s',
                  }}
                >
                  <span>Create Vendor Account</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onLogin('VENDOR', 'signin')}
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    color: 'var(--ink)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Sign in to existing vendor account"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STATUTORY HARMONIZATION BANNER */}
        <section
          id="features"
          style={{
            margin: '16px 0 54px',
            padding: '28px 32px',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber-warn)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              CRITICAL STATUTORY COMPLIANCE
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: 0, marginBottom: '6px' }}>
              Automatic Detection of Withdrawn & Superseded Standards
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.55 }}>
              Tendering under superseded codes like <code style={{ color: 'var(--error-red)', fontWeight: 700, backgroundColor: 'var(--error-bg)', padding: '1px 5px', borderRadius: '4px' }}>IS 8112:1989</code> or citing un-amended rebar tolerances exposes procurement heads to vigilance audits. ManakAI automatically routes to the latest authoritative standard (<code style={{ color: 'var(--emerald-pass)', fontWeight: 700, backgroundColor: 'var(--emerald-bg)', padding: '1px 5px', borderRadius: '4px' }}>IS 269:2015</code>) and records self-reflective reasoning trails.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onLogin('OFFICER', 'signup')}
            style={{
              backgroundColor: 'var(--olive-primary)',
              color: '#FFFFFF',
              padding: '11px 22px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.15s',
            }}
          >
            <span>Create Your Account</span>
            <ArrowRight size={14} />
          </button>
        </section>

        {/* NATIONAL BODIES FOOTER */}
        <footer
          style={{
            padding: '32px 0 44px',
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="var(--olive-primary)" />
              <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                Smart India Hackathon 2026 · Bureau of Indian Standards (BIS) Problem Statement
              </span>
            </div>

            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
              <span>IS 269:2015</span>
              <span>•</span>
              <span>IS 1786:2008</span>
              <span>•</span>
              <span>IS 4984:2016</span>
              <span>•</span>
              <span>GFR 2017 Rule 144(xi)</span>
            </div>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            Disclaimer: ManakAI is built to provide normative standards intelligence, CVC legal defense records, and statutory Quality Control Order (QCO) compliance verification for government procurement officers, CAG auditors, and industrial bidders. All cryptographic audit logs are sealed using SHA-256 for RTI and vigilance compliance.
          </div>
        </footer>
      </main>
    </div>
  );
};
