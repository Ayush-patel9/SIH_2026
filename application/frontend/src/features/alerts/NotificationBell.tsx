import React, { useState, useEffect } from 'react';
import { AlertStore } from './alertStore';
import type { AlertWithRead } from './alertStore';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick, className = '' }) => {
  const [alerts, setAlerts] = useState<AlertWithRead[]>([]);

  useEffect(() => {
    // Initial fetch
    setAlerts(AlertStore.getAll());

    // Subscribe to updates
    const unsubscribe = AlertStore.subscribe(() => {
      setAlerts(AlertStore.getAll());
    });

    return unsubscribe;
  }, []);

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
        padding: '6px 10px',
        cursor: 'pointer',
        gap: '6px',
        color: 'var(--ink)',
        transition: 'all 0.15s ease',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: unreadCount > 0 ? (criticalCount > 0 ? 'var(--error-line)' : 'var(--signal-amber)') : 'var(--ink-secondary)' }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <span
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--ink-secondary)',
        }}
      >
        Alerts
      </span>

      {unreadCount > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '9px',
            background: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeBorder}`,
            fontFamily: 'var(--font-data)',
            fontSize: '10px',
            fontWeight: 700,
            lineHeight: 1,
            animation: criticalCount > 0 ? 'pulse-opacity 1.5s infinite' : 'none',
          }}
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
};
