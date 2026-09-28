import React from 'react';
import type { UserRole, QueryMode } from '../types';

interface RoleSwitcherProps {
  role: UserRole;
  mode: QueryMode;
  onRoleChange: (r: UserRole) => void;
  onModeChange: (m: QueryMode) => void;
}

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'OFFICER', label: 'Tender Authority', icon: '🏛️' },
  { value: 'VENDOR', label: 'Industrial Vendor', icon: '🏭' },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  role,
  onRoleChange,
}) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--surface-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline)' }}>
    {ROLES.map((r) => {
      const isActive = role === r.value;
      return (
        <button
          key={r.value}
          type="button"
          onClick={() => onRoleChange(r.value)}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11.5px',
            fontWeight: isActive ? 600 : 500,
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            border: 'none',
            background: isActive ? '#FFFFFF' : 'transparent',
            color: isActive ? 'var(--ink)' : 'var(--ink-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{r.icon}</span>
          <span>{r.label}</span>
        </button>
      );
    })}
  </div>
);
