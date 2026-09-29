import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  hint: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  hint,
  actionText,
  onAction,
  className = '',
}) => (
  <div
    className={`empty-state-card ${className}`}
    style={{
      textAlign: 'center',
      padding: '40px 20px',
      background: 'var(--surface)',
      border: '1px dashed var(--hairline)',
      borderRadius: 'var(--radius-sm)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
      {icon || <FileText size={36} color="var(--ink-muted)" />}
    </div>
    <div style={{ fontFamily: 'var(--font-prose)', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
      {title}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-prose)',
        fontSize: '13px',
        color: 'var(--ink-muted)',
        marginTop: '6px',
        maxWidth: '480px',
        marginInline: 'auto',
      }}
    >
      {hint}
    </div>
    {actionText && onAction && (
      <button
        type="button"
        className="btn-secondary"
        onClick={onAction}
        style={{ marginTop: '16px', fontSize: '12px' }}
      >
        {actionText}
      </button>
    )}
  </div>
);
