import { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '../types';
import { roleStore } from './roleStore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: UserRole;
  ministry?: string;
  auditOffice?: string;
  gstin?: string;
  createdAt: string;
}

export interface UserAccount extends UserProfile {
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organization: string;
  role: UserRole;
  ministry?: string;
  auditOffice?: string;
  gstin?: string;
}

const SESSION_KEY = 'manakai_user_session';
const REGISTERED_USERS_KEY = 'manakai_registered_users';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error('userStore listener error:', err);
    }
  });
}

export function getRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('userStore: Failed to load registered users', err);
    return [];
  }
}

function saveRegisteredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('userStore: Failed to save registered users', err);
  }
}

export function getSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('userStore: Failed to parse user session', err);
    return null;
  }
}

export function setSession(profile: UserProfile): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    roleStore.setRole(profile.role);
    notify();
  } catch (err) {
    console.error('userStore: Failed to persist session', err);
  }
}

export function register(payload: RegisterPayload): { success: boolean; error?: string; user?: UserProfile } {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!normalizedEmail || !payload.password || !payload.name.trim() || !payload.organization.trim()) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  if (payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const existingUsers = getRegisteredUsers();
  const existing = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const userId = `usr_${payload.role.toLowerCase().slice(0, 4)}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  
  const newAccount: UserAccount = {
    id: userId,
    name: payload.name.trim(),
    email: normalizedEmail,
    password: payload.password,
    organization: payload.organization.trim(),
    role: payload.role,
    ministry: payload.role === 'PROCUREMENT_OFFICER' ? (payload.ministry?.trim() || 'Government of India') : undefined,
    auditOffice: payload.role === 'AUDITOR' ? (payload.auditOffice?.trim() || 'Statutory Audit Directorate') : undefined,
    gstin: payload.role === 'VENDOR' ? (payload.gstin?.trim() || undefined) : undefined,
    createdAt: new Date().toISOString(),
  };

  existingUsers.push(newAccount);
  saveRegisteredUsers(existingUsers);

  // Extract public profile without password
  const { password: _, ...profile } = newAccount;
  setSession(profile);

  return { success: true, user: profile };
}

export function loginWithCredentials(email: string, password: string): { success: boolean; error?: string; user?: UserProfile } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter both your email address and password.' };
  }

  const existingUsers = getRegisteredUsers();
  const account = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!account) {
    return { success: false, error: 'No account found with this email. Please create an account first.' };
  }

  if (account.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const { password: _, ...profile } = account;
  setSession(profile);

  return { success: true, user: profile };
}

export function logout(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    notify();
  } catch (err) {
    console.error('userStore: Failed to clear session', err);
  }
}

export function subscribeUserSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useSession() {
  const [session, setSessionState] = useState<UserProfile | null>(() => getSession());

  useEffect(() => {
    return subscribeUserSession(() => {
      setSessionState(getSession());
    });
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session),
    logout: handleLogout,
  };
}
