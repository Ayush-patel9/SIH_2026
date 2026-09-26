import React, { useState, useEffect } from 'react';
import { AlertStore } from './alertStore';
import type { AlertWithRead } from './alertStore';
import type { AlertPayload } from '../../types';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
  alerts?: AlertPayload[];
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, className = '', alerts: propAlerts }) => {
  const [alerts, setAlerts] = useState<AlertWithRead[]>(() => (propAlerts as AlertWithRead[]) || AlertStore.getAll());

  useEffect(() => {
    if (propAlerts && propAlerts.length > 0) {
      setAlerts(propAlerts as AlertWithRead[]);
    } else {
      setAlerts(AlertStore.getAll());
    }

    // Subscribe to updates
    const unsubscribe = AlertStore.subscribe(() => {
      setAlerts(AlertStore.getAll());
    });

    return unsubscribe;
  }, [propAlerts]);

  const unreadCount = alerts.filter((a) => !a._read).length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a._read).length;

  let badgeColor = 'var(--ink-muted)';
  let badgeBg = '#EDF0F5';
  let badgeBorder = 'var(--hairline)';

  if (criticalCount > 0) {
    badgeColor = '#FFFFFF';
    badgeBg = 'var(--error-line)';
    badgeBorder = 'var(--error-line)';
  } else if (unreadCount > 0) {
    badgeColor = '#FFFFFF';
    badgeBg = 'var(--signal-amber)';
    badgeBorder = '#B45309';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`notification-bell-btn ${className}`}
      title={`${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}${criticalCount > 0 ? ` (${criticalCount} CRITICAL)` : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-sm)',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        color: 'var(--ink)',
        transition: 'all 0.15s ease',
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: unreadCount > 0 ? (criticalCount > 0 ? 'var(--error-red)' : 'var(--amber-warn)') : 'var(--ink-secondary)' }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '16px',
            height: '16px',
            padding: '0 3px',
            borderRadius: '8px',
            background: criticalCount > 0 ? 'var(--error-red)' : 'var(--amber-warn)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-data)',
            fontSize: '9px',
            fontWeight: 700,
            lineHeight: 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
};
