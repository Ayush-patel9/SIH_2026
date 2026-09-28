import { useState, useCallback, useEffect } from 'react';
import type { UserRole, QueryMode } from '../types';

function getInitialRole(): UserRole {
  try {
    const raw = localStorage.getItem('manakai_user_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === 'OFFICER' || parsed?.role === 'VENDOR') return parsed.role;
      if (parsed?.role === 'PROCUREMENT_OFFICER' || parsed?.role === 'AUDITOR') return 'OFFICER';
    }
  } catch {}
  return 'OFFICER';
}

let _role: UserRole = getInitialRole();
let _mode: QueryMode = 'recommend';
const _listeners = new Set<() => void>();

export const roleStore = {
  getRole: () => _role,
  getMode: () => _mode,
  setRole: (r: UserRole) => {
    _role = r;
    _listeners.forEach((fn) => fn());
  },
  setMode: (m: QueryMode) => {
    _mode = m;
    _listeners.forEach((fn) => fn());
  },
  subscribe: (fn: () => void) => {
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  },
};

export function useRole() {
  const [role, setRoleState] = useState<UserRole>(_role);
  const [mode, setModeState] = useState<QueryMode>(_mode);

  useEffect(() => {
    return roleStore.subscribe(() => {
      setRoleState(roleStore.getRole());
      setModeState(roleStore.getMode());
    });
  }, []);

  const setRole = useCallback((r: UserRole) => {
    roleStore.setRole(r);
  }, []);

  const setMode = useCallback((m: QueryMode) => {
    roleStore.setMode(m);
  }, []);

  return { role, mode, setRole, setMode };
}
