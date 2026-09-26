import React, { useState } from 'react';
import type { PrimaryRecommendation, AlternativeRecommendation } from '../../types';
import {
  COMPARISON_ATTRIBUTES,
  getNestedValue,
  detectConflicts,
  CANONICAL_STANDARDS_DB,
} from './comparisonUtils';

interface StandardsComparatorProps {
  primary: PrimaryRecommendation;
  alternatives: AlternativeRecommendation[];
  onPromotePrimary?: (alternative: AlternativeRecommendation) => void;
  onRemoveAlternative?: (isNumber: string) => void;
  onAddAlternative?: (alternative: AlternativeRecommendation) => void;
}

export const StandardsComparator: React.FC<StandardsComparatorProps> = ({
  primary,
  alternatives,
  onPromotePrimary,
  onRemoveAlternative,
  onAddAlternative,
}) => {
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');
  const [showOnlyConflicts, setShowOnlyConflicts] = useState<boolean>(false);

  const availableToAdd = Object.values(CANONICAL_STANDARDS_DB).filter((std) => {
    if (std.is_number === primary?.is_number) return false;
    if (alternatives.some((a) => a.is_number === std.is_number)) return false;
    return true;
  });

  const handleAddSelected = () => {
    if (!selectedToAdd) return;
    const std = CANONICAL_STANDARDS_DB[selectedToAdd];
    if (std && onAddAlternative) {
      onAddAlternative(std);
      setSelectedToAdd('');
    }
  };

  // Filter attributes based on conflict toggle
  const displayedAttributes = COMPARISON_ATTRIBUTES.filter((attr) => {
    if (showOnlyConflicts) {
      return detectConflicts(primary, alternatives, attr);
    }
    return true;
  });

  const conflictCount = COMPARISON_ATTRIBUTES.filter((attr) =>
    detectConflicts(primary, alternatives, attr)
  ).length;

  return (
    <div className="workbench-card" style={{ padding: '20px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="section-label" style={{ margin: '0 0 2px 0' }}>
            SIDE-BY-SIDE SPECIFICATION COMPARATOR
          </div>
          <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>
            Standards Comparison Matrix
          </h2>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Comparing primary procurement recommendation against technical alternatives and legacy specifications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Conflict Highlight Filter */}
          <button
            type="button"
            className={`palette-btn ${showOnlyConflicts ? 'selected' : ''}`}
            onClick={() => setShowOnlyConflicts(!showOnlyConflicts)}
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>⚠️</span>
            <span>Show Divergences Only ({conflictCount})</span>
          </button>

          {/* Add Standard Selector */}
          {availableToAdd.length > 0 && onAddAlternative && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="auth-input auth-select"
                style={{ width: '180px', padding: '4px 8px', fontSize: '12px' }}
              >
                <option value="">+ Compare with standard...</option>
                {availableToAdd.map((std) => (
                  <option key={std.is_number} value={std.is_number}>
                    {std.is_number} ({std.title.slice(0, 30)}...)
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedToAdd}
                onClick={handleAddSelected}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Add Column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm)' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '220px' }} />
            <col style={{ width: '320px' }} />
            {alternatives.map((alt) => (
              <col key={alt.is_number} style={{ width: '300px' }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {/* Header: Attribute label */}
              <th style={{ background: 'var(--paper)', position: 'sticky', left: 0, zIndex: 2 }}>
                SPECIFICATION ATTRIBUTE
              </th>

              {/* Header: Primary Recommendation */}
              <th
                style={{
                  background: 'rgba(27, 79, 224, 0.06)',
                  borderTop: '3px solid var(--collapse-cobalt)',
                  borderLeft: '2px solid var(--collapse-cobalt)',
                  borderRight: '2px solid var(--collapse-cobalt)',
                  verticalAlign: 'top',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: 'var(--collapse-cobalt)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                      }}
                    >
                      PRIMARY RECOMMENDATION
                    </span>
                    <span className="concept-status-badge active" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {primary.status}
                    </span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                    {primary.is_number}
                  </div>
                  <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: '1.3' }}>
                    {primary.title}
                  </div>
                </div>
              </th>

              {/* Header: Alternatives */}
              {alternatives.map((alt) => {
                const isWithdrawn = alt.status === 'WITHDRAWN';
                const accentColor = isWithdrawn ? 'var(--error-line)' : 'var(--superposition-violet)';
                const bgTint = isWithdrawn ? 'rgba(194, 59, 59, 0.05)' : 'rgba(110, 90, 214, 0.05)';

                return (
                  <th
                    key={alt.is_number}
                    style={{
                      background: bgTint,
                      borderTop: `3px solid ${accentColor}`,
                      borderLeft: `1px solid ${accentColor}`,
                      borderRight: `1px solid ${accentColor}`,
                      verticalAlign: 'top',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: isWithdrawn ? '#FEE2E2' : '#F3E8FF',
                            color: accentColor,
                            fontWeight: 700,
                            border: `1px solid ${isWithdrawn ? '#FECACA' : '#E9D5FF'}`,
                          }}
                        >
                          {isWithdrawn ? 'WITHDRAWN PREDECESSOR' : 'ALTERNATIVE CANDIDATE'}
                        </span>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {onPromotePrimary && !isWithdrawn && (
                            <button
                              type="button"
                              onClick={() => onPromotePrimary(alt)}
                              className="btn-secondary"
                              style={{ padding: '1px 6px', fontSize: '10px' }}
                              title="Make this the primary recommendation in this session"
                            >
                              Make Primary
                            </button>
                          )}
                          {onRemoveAlternative && (
                            <button
                              type="button"
                              onClick={() => onRemoveAlternative(alt.is_number)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--ink-muted)',
                                fontSize: '13px',
                                padding: '0 4px',
                              }}
                              title="Remove column"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className="font-mono"
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: isWithdrawn ? 'var(--error-line)' : 'var(--ink)',
                          textDecoration: isWithdrawn ? 'line-through' : 'none',
                        }}
                      >
                        {alt.is_number}
                      </div>
                      <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: '1.3' }}>
                        {alt.title}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {displayedAttributes.map((attr) => {
              const hasConflict = detectConflicts(primary, alternatives, attr);
              const primaryRaw = getNestedValue(primary, attr.key);
              const primaryFormatted = attr.formatter ? attr.formatter(primaryRaw) : primaryRaw ?? '—';

              return (
                <tr
                  key={attr.key}
                  style={{
                    background: hasConflict ? '#FFFBEB' : undefined,
                    borderBottom: '1px solid var(--hairline)',
                    transition: 'background 0.1s ease',
                  }}
                >
                  {/* Attribute Label */}
                  <td
                    style={{
                      background: hasConflict ? '#FEF3C7' : 'var(--paper)',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasConflict && <span style={{ fontSize: '11px', color: '#B45309' }}>⚠️</span>}
                      <span>{attr.label}</span>
                    </div>
                  </td>

                  {/* Primary Value */}
                  <td
                    style={{
                      borderLeft: '2px solid var(--collapse-cobalt)',
                      borderRight: '2px solid var(--collapse-cobalt)',
                      background: hasConflict ? '#FFFBEB' : 'rgba(27, 79, 224, 0.02)',
                      fontSize: '13px',
                      fontFamily: attr.key.includes('confidence') || attr.key.includes('year') ? 'var(--font-data)' : 'var(--font-prose)',
                      lineHeight: '1.45',
                    }}
                  >
                    {attr.key === 'status' ? (
                      <span className="concept-status-badge active" style={{ fontSize: '11px' }}>
                        {primaryFormatted}
                      </span>
                    ) : attr.key === 'why_not_primary' ? (
                      <span style={{ color: 'var(--collapse-cobalt)', fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600 }}>
                        ✓ PRIMARY SPECIFICATION SELECTED
                      </span>
                    ) : (
                      primaryFormatted
                    )}
                  </td>

                  {/* Alternative Values */}
                  {alternatives.map((alt) => {
                    const altRaw = getNestedValue(alt, attr.key);
                    const altFormatted = attr.formatter ? attr.formatter(altRaw) : altRaw ?? '—';
                    const isDiff = altRaw !== undefined && altRaw !== null && String(altRaw) !== String(primaryRaw);
                    const isWithdrawn = alt.status === 'WITHDRAWN';

                    return (
                      <td
                        key={alt.is_number}
                        style={{
                          borderLeft: '1px solid var(--hairline)',
                          borderRight: '1px solid var(--hairline)',
                          background: hasConflict && isDiff ? '#FEF3C7' : undefined,
                          fontSize: '13px',
                          fontFamily: attr.key.includes('confidence') || attr.key.includes('year') ? 'var(--font-data)' : 'var(--font-prose)',
                          lineHeight: '1.45',
                        }}
                      >
                        {attr.key === 'status' ? (
                          <span
                            className="concept-status-badge"
                            style={{
                              fontSize: '11px',
                              background: isWithdrawn ? '#FEE2E2' : '#F3E8FF',
                              color: isWithdrawn ? 'var(--error-line)' : 'var(--superposition-violet)',
                              border: `1px solid ${isWithdrawn ? '#FECACA' : '#E9D5FF'}`,
                            }}
                          >
                            {altFormatted}
                          </span>
                        ) : attr.key === 'why_not_primary' ? (
                          <span style={{ color: '#B45309', fontSize: '12px' }}>
                            {altFormatted}
                          </span>
                        ) : (
                          altFormatted
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
