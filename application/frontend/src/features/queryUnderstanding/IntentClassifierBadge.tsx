import React from 'react';
import type { QueryMode } from '../../types';
import { MODE_BADGES } from './entityUtils';

interface IntentClassifierBadgeProps {
  mode?: QueryMode | 'compare' | 'validate' | 'search';
  className?: string;
}

export const IntentClassifierBadge: React.FC<IntentClassifierBadgeProps> = ({
  mode = 'recommend',
  className = '',
}) => {
  const badge = MODE_BADGES[mode] || MODE_BADGES.recommend;

  return (
    <span
      className={`concept-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        background: badge.bg,
        color: badge.color,
        border: `1px solid ${badge.border}`,
        fontFamily: 'var(--font-data)',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
};
