import React from 'react';
import type { UserRole, QueryMode } from '../types';

interface RoleSwitcherProps {
  role: UserRole;
  mode: QueryMode;
  onRoleChange: (r: UserRole) => void;
  onModeChange: (m: QueryMode) => void;
}

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'PROCUREMENT_OFFICER', label: 'Officer', icon: '👔' },
  { value: 'AUDITOR', label: 'Auditor', icon: '🔍' },
  { value: 'VENDOR', label: 'Vendor', icon: '🏭' },
];

const MODES: { value: QueryMode; label: string; color: string }[] = [
  { value: 'recommend', label: 'Recommend', color: 'var(--collapse-cobalt)' },
  { value: 'audit', label: 'Audit', color: 'var(--superposition-violet)' },
  { value: 'dry_run', label: 'Sandbox', color: 'var(--signal-amber)' },
  { value: 'vendor_check', label: 'Compliance', color: 'var(--emerald-pass)' },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  role,
  mode,
  onRoleChange,
  onModeChange,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {/* Role row */}
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '9px',
          color: 'var(--ink-muted)',
          marginRight: '2px',
          fontWeight: 700,
        }}
      >
        ROLE:
      </span>
      {ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={`mode-toggle-btn ${role === r.value ? 'active' : ''}`}
          onClick={() => onRoleChange(r.value)}
          style={{ fontSize: '11px', padding: '3px 8px' }}
        >
          {r.icon} {r.label}
        </button>
      ))}
    </div>
    {/* Mode row */}
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '9px',
          color: 'var(--ink-muted)',
          marginRight: '2px',
          fontWeight: 700,
        }}
      >
        MODE:
      </span>
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          className={`mode-toggle-btn ${mode === m.value ? 'active' : ''}`}
          onClick={() => onModeChange(m.value)}
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            ...(mode === m.value
              ? { background: m.color, color: '#fff', borderColor: m.color }
              : {}),
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  </div>
);
