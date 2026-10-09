import React, { useState, useEffect, useCallback } from 'react';
import type { UserRole } from './types';
import { useSession } from './store/userStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import App from './App';

export const Root: React.FC = () => {
  const { session, isAuthenticated, logout } = useSession();

  // Parse current URL path
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [currentSearch, setCurrentSearch] = useState<string>(() => window.location.search || '');

  // Synchronize on browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Browser navigation function with pushState
  const navigate = useCallback((to: string, replace = false) => {
    const [path, search] = to.split('?');
    const fullSearch = search ? `?${search}` : '';

    if (window.location.pathname !== path || window.location.search !== fullSearch) {
      if (replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
    }

    setCurrentPath(path || '/');
    setCurrentSearch(fullSearch);
  }, []);

  // Params from query string if available: e.g. /login?role=AUDITOR&mode=signup&email=...
  const searchParams = new URLSearchParams(currentSearch);
  const roleParam = searchParams.get('role') as UserRole | null;
  const modeParam = searchParams.get('mode') as 'signin' | 'signup' | null;
  const emailParam = searchParams.get('email') || undefined;
  const passwordParam = searchParams.get('password') || undefined;

  // Handle transitions
  const handleOpenLogin = (
    role?: UserRole,
    mode: 'signin' | 'signup' = 'signin',
    email?: string,
    password?: string
  ) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (mode) params.set('mode', mode);
    if (email) params.set('email', email);
    if (password) params.set('password', password);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigate(`/login${queryString}`);
  };

  const handleLoginSuccess = () => {
    navigate('/app');
  };

  const handleQuickDemoLogin = () => {
    navigate('/app');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine which page to render based on URL pathname
  const normalizedPath = currentPath.toLowerCase();

  // ROUTE 1: /login
  if (normalizedPath === '/login' || normalizedPath.startsWith('/login/')) {
    return (
      <LoginPage
        initialRole={roleParam || session?.role || 'OFFICER'}
        initialMode={modeParam || 'signin'}
        initialEmail={emailParam}
        initialPassword={passwordParam}
        onBack={() => navigate('/')}
        onSuccess={handleLoginSuccess}
        onQuickDemo={handleQuickDemoLogin}
      />
    );
  }

  // ROUTE 2: /app or any subpath
  if (normalizedPath === '/app' || normalizedPath.startsWith('/app/')) {
    return <App onLogout={handleLogout} />;
  }

  // ROUTE 3: / (Landing Page - default for root and all other paths)
  return (
    <LandingPage
      onLogin={handleOpenLogin}
      onEnterApp={() => navigate('/app')}
      onQuickDemoLogin={handleQuickDemoLogin}
      isLoggedIn={isAuthenticated}
      loggedInUser={session}
    />
  );
};

export default Root;
