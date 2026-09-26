import React from 'react';

interface LoadingShimmerProps {
  lines?: number;
  height?: string;
  className?: string;
}

export const LoadingShimmer: React.FC<LoadingShimmerProps> = ({
  lines = 3,
  height = '14px',
  className = '',
}) => (
  <div className={`loading-shimmer-container ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        style={{
          height,
          background: 'linear-gradient(90deg, var(--paper) 25%, var(--hairline) 50%, var(--paper) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease infinite',
          borderRadius: 'var(--radius-sm)',
          width: i === lines - 1 ? '65%' : '100%',
        }}
      />
    ))}
  </div>
);
