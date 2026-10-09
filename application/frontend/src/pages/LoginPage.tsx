import React, { useState } from 'react';
import type { UserRole } from '../types';
import { register, loginWithCredentials, loginAsDemo, DEMO_ACCOUNTS, type UserProfile } from '../store/userStore';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { Building2, Factory, ArrowRight, ShieldCheck, ArrowLeft, Lock, Mail, User, Briefcase, FileText, Zap } from 'lucide-react';

interface LoginPageProps {
  initialRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  initialEmail?: string;
  initialPassword?: string;
  onBack: () => void;
  onSuccess: (profile: UserProfile) => void;
  onQuickDemo?: (profile: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'OFFICER',
  initialMode = 'signin',
  initialEmail = '',
  initialPassword = '',
  onBack,
  onSuccess,
  onQuickDemo,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const normalizedInitialRole: UserRole =
    (initialRole as any) === 'PROCUREMENT_OFFICER' || (initialRole as any) === 'AUDITOR' ? 'OFFICER' : initialRole;
  const [selectedRole, setSelectedRole] = useState<UserRole>(normalizedInitialRole);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [organization, setOrganization] = useState('');
  const [roleDetail, setRoleDetail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleToggleMode = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setError(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = loginWithCredentials(email, password);
    if (!result.success || !result.user) {
      setError(result.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    onSuccess(result.user);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = register({
      name,
      email,
      password,
      organization,
      role: selectedRole,
      ministry: selectedRole === 'OFFICER' ? roleDetail : undefined,
      department: selectedRole === 'OFFICER' ? roleDetail : undefined,
      gstin: selectedRole === 'VENDOR' ? roleDetail : undefined,
    });

    if (!result.success || !result.user) {
      setError(result.error || 'Failed to create account. Please check your inputs.');
      return;
    }

    onSuccess(result.user);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--canvas)',
        backgroundImage: 'radial-gradient(circle at 50% 10%, var(--olive-tint) 0%, var(--canvas) 65%)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-ui)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 16px 36px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Controls Bar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--hairline)',
            color: 'var(--ink)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.borderColor = 'var(--olive-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
            e.currentTarget.style.borderColor = 'var(--hairline)';
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Portal Overview</span>
        </button>

        <ThemeSwitcher />
      </header>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Header Monogram & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'var(--olive-primary)',
              color: '#FFFFFF',
              marginBottom: '12px',
              boxShadow: '0 4px 14px var(--focus-blue-glow)',
              transition: 'background-color 0.2s ease',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>M</span>
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            {authMode === 'signin' ? 'Sign In to ManakAI' : 'Create Your ManakAI Account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>
            {authMode === 'signin'
              ? 'Enter your registered credentials to access your sovereign workspace.'
              : 'Register to unlock your role-specific standards intelligence workspace.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--surface-secondary)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--hairline)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => handleToggleMode('signin')}
            style={{
              backgroundColor: authMode === 'signin' ? 'var(--surface)' : 'transparent',
              color: authMode === 'signin' ? 'var(--ink)' : 'var(--ink-muted)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: authMode === 'signin' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: authMode === 'signin' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('signup')}
            style={{
              backgroundColor: authMode === 'signup' ? 'var(--surface)' : 'transparent',
              color: authMode === 'signup' ? 'var(--ink)' : 'var(--ink-muted)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: authMode === 'signup' ? 700 : 600,
              cursor: 'pointer',
              boxShadow: authMode === 'signup' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--error-red)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* FORM 1: SIGN IN */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Demo Fast-Track Toolbar */}
            <div
              style={{
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--hairline)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="var(--gold-antique)" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Quick Demo Credentials
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: 'var(--gold-bg)',
                    color: 'var(--gold-text)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: '1px solid var(--gold-border)',
                  }}
                >
                  Team Nexus · IIITB
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {DEMO_ACCOUNTS.map((demo) => (
                  <div
                    key={demo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--surface)',
                      border: demo.recommendedForJudge ? '1px solid var(--emerald-border)' : '1px solid var(--hairline)',
                      padding: '7px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink)' }}>
                          {demo.name.split(' (')[0]}
                        </span>
                        {demo.recommendedForJudge && (
                          <span
                            style={{
                              fontSize: '9px',
                              backgroundColor: 'var(--emerald-bg)',
                              color: 'var(--emerald-text)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              fontWeight: 700,
                            }}
                          >
                            Judge
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {demo.email}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(demo.email);
                          setPassword(demo.password);
                          setSelectedRole(demo.role);
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid var(--hairline)',
                          borderRadius: '4px',
                          color: 'var(--ink-secondary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 7px',
                          cursor: 'pointer',
                        }}
                        title="Auto-fill email and password in the inputs below"
                      >
                        Fill
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const res = loginAsDemo(demo.id);
                          if (res.success && res.user) {
                            if (onQuickDemo) {
                              onQuickDemo(res.user);
                            } else {
                              onSuccess(res.user);
                            }
                          }
                        }}
                        style={{
                          backgroundColor: demo.recommendedForJudge ? 'var(--emerald-pass)' : 'var(--olive-primary)',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title="Sign in immediately with this demo persona"
                      >
                        <Zap size={10} />
                        <span>Sign In</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer@nhai.gov.in"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '10px 12px 10px 36px',
                    color: 'var(--ink)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '10px 12px 10px 36px',
                    color: 'var(--ink)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: 'var(--olive-primary)',
                border: 'none',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--olive-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--olive-primary)')}
            >
              <span>Sign In to Platform</span>
              <ArrowRight size={15} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => handleToggleMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--olive-primary)',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Create an account
              </button>
            </div>
          </form>
        ) : (
          /* FORM 2: CREATE ACCOUNT (SIGN UP) */
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Role Selector Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                Select Your Role & Desired Workspace
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  backgroundColor: 'var(--surface-secondary)',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid var(--hairline)',
                  gap: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole('OFFICER')}
                  style={{
                    backgroundColor: selectedRole === 'OFFICER' ? 'var(--olive-primary)' : 'transparent',
                    color: selectedRole === 'OFFICER' ? '#FFFFFF' : 'var(--ink-secondary)',
                    border: 'none',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Building2 size={18} />
                  <span>Tender Authority</span>
                  <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 500 }}>Technical Officer & Auditor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('VENDOR')}
                  style={{
                    backgroundColor: selectedRole === 'VENDOR' ? 'var(--gold-text)' : 'transparent',
                    color: selectedRole === 'VENDOR' ? '#FFFFFF' : 'var(--ink-secondary)',
                    border: 'none',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Factory size={18} />
                  <span>Industrial Vendor</span>
                  <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 500 }}>Bidders & MSMEs</span>
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '9px 12px 9px 36px',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Official Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@nhai.gov.in"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '9px 12px 9px 36px',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Password (minimum 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '9px 12px 9px 36px',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Organization / Department
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={
                    selectedRole === 'OFFICER'
                      ? 'e.g. CPWD / National Highways Authority of India'
                      : 'e.g. Tata Projects / L&T Construction / Infra Tech'
                  }
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '9px 12px 9px 36px',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            {/* Dynamic Role Detail Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                {selectedRole === 'OFFICER' ? 'Ministry / Division / Audit Directorate' : 'GSTIN or Udyam Registration'}
              </label>
              <div style={{ position: 'relative' }}>
                <FileText
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={roleDetail}
                  onChange={(e) => setRoleDetail(e.target.value)}
                  placeholder={
                    selectedRole === 'OFFICER'
                      ? 'e.g. Ministry of Road Transport & Highways / Vigilance Division'
                      : 'e.g. 07AAACT2727Q1ZW'
                  }
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '8px',
                    padding: '9px 12px 9px 36px',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--olive-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--focus-blue-glow)';
                    e.target.style.backgroundColor = 'var(--surface)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--hairline)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor:
                  selectedRole === 'OFFICER'
                    ? 'var(--olive-primary)'
                    : 'var(--gold-text)',
                border: 'none',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.92)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            >
              <span>Create Account & Launch {selectedRole === 'OFFICER' ? 'Authority Workspace' : 'Vendor Portal'}</span>
              <ArrowRight size={15} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>Already registered? </span>
              <button
                type="button"
                onClick={() => handleToggleMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--olive-primary)',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Sign in to your account
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security & Cryptographic Trust Footnote */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: 'var(--ink-muted)',
          fontSize: '11.5px',
          marginTop: '20px',
          fontFamily: 'var(--font-data)',
          zIndex: 10,
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--emerald-pass)' }} />
        <span>SHA-256 Cryptographic Audit Ledger · BIS Act 2016 & GFR Defensible</span>
      </div>
    </div>
  );
};
