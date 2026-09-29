import React, { useState } from 'react';
import type { UserRole } from '../types';
import { register, loginWithCredentials, type UserProfile } from '../store/userStore';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

interface LoginPageProps {
  initialRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  onBack: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'OFFICER',
  initialMode = 'signin',
  onBack,
  onSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const normalizedInitialRole: UserRole =
    (initialRole as any) === 'PROCUREMENT_OFFICER' || (initialRole as any) === 'AUDITOR' ? 'OFFICER' : initialRole;
  const [selectedRole, setSelectedRole] = useState<UserRole>(normalizedInitialRole);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        color: 'var(--ink)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '24px',
          left: '28px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--hairline)',
          color: 'var(--ink)',
          padding: '8px 14px',
          borderRadius: '6px',
          fontSize: '12.5px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.15s ease',
          zIndex: 10,
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
        <span>←</span>
        <span>Back to Portal Overview</span>
      </button>

      {/* Theme Switcher on Top Right */}
      <div style={{ position: 'absolute', top: '24px', right: '28px', zIndex: 10 }}>
        <ThemeSwitcher />
      </div>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: '14px',
          padding: '32px 30px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Header Monogram & Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#36452F',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(54, 69, 47, 0.2)',
            }}
          >
            <span style={{ color: '#FFFEFB', fontWeight: 800, fontSize: '18px' }}>M</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C2419', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {authMode === 'signin' ? 'Sign In to ManakAI' : 'Create Your ManakAI Account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6E7A68', margin: 0 }}>
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
            backgroundColor: '#F5F0E6',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #E5E0D4',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => handleToggleMode('signin')}
            style={{
              backgroundColor: authMode === 'signin' ? '#FFFEFB' : 'transparent',
              color: authMode === 'signin' ? '#1C2419' : '#6E7A68',
              border: 'none',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: authMode === 'signin' ? '0 1px 3px rgba(54, 69, 47, 0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('signup')}
            style={{
              backgroundColor: authMode === 'signup' ? '#FFFEFB' : 'transparent',
              color: authMode === 'signup' ? '#1C2419' : '#6E7A68',
              border: 'none',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: authMode === 'signup' ? '0 1px 3px rgba(54, 69, 47, 0.06)' : 'none',
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
              backgroundColor: '#FDF2F0',
              border: '1px solid #F7CDC6',
              color: '#BA3A2A',
              padding: '9px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {/* FORM 1: SIGN IN */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '5px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. officer@nhai.gov.in"
                style={{
                  width: '100%',
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '5px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#36452F',
                border: 'none',
                color: '#FFFFFF',
                padding: '11px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: '0 2px 6px rgba(54, 69, 47, 0.15)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#24301F')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#36452F')}
            >
              Sign In to Platform ➔
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '12.5px', color: '#6E7A68' }}>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => handleToggleMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2D6A4F',
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C2419', marginBottom: '6px' }}>
                Select Your Role & Desired Workspace
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  backgroundColor: '#F5F0E6',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid #E5E0D4',
                  gap: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole('OFFICER')}
                  style={{
                    backgroundColor: selectedRole === 'OFFICER' ? '#2D6A4F' : 'transparent',
                    color: selectedRole === 'OFFICER' ? '#FFFFFF' : '#44503E',
                    border: 'none',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🏛️</span>
                  <span>Tender Authority</span>
                  <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 500 }}>Technical Officer & Auditor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('VENDOR')}
                  style={{
                    backgroundColor: selectedRole === 'VENDOR' ? '#8A6922' : 'transparent',
                    color: selectedRole === 'VENDOR' ? '#FFFFFF' : '#44503E',
                    border: 'none',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🏭</span>
                  <span>Industrial Vendor</span>
                  <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 500 }}>Bidders & MSMEs</span>
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                style={{
                  width: '100%',
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '4px' }}>
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@nhai.gov.in"
                style={{
                  width: '100%',
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '4px' }}>
                Password (minimum 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                style={{
                  width: '100%',
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '4px' }}>
                Organization / Department
              </label>
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
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            {/* Dynamic Role Detail Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C2419', marginBottom: '4px' }}>
                {selectedRole === 'OFFICER' ? 'Ministry / Division / Audit Directorate' : 'GSTIN or Udyam Registration'}
              </label>
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
                  backgroundColor: '#FAF8F2',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#1C2419',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#36452F')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E0D4')}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor:
                  selectedRole === 'OFFICER'
                    ? '#2D6A4F'
                    : '#8A6922',
                border: 'none',
                color: '#FFFFFF',
                padding: '11px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px',
                boxShadow: '0 2px 6px rgba(54, 69, 47, 0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account & Launch {selectedRole === 'OFFICER' ? 'Tender Authority Workspace' : 'Industrial Vendor Portal'} ➔
            </button>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '12.5px', color: '#6E7A68' }}>Already registered? </span>
              <button
                type="button"
                onClick={() => handleToggleMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2D6A4F',
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
    </div>
  );
};
