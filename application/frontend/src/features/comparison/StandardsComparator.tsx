import React, { useState } from 'react';
import { Search, Plus, Loader2, Scale, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import type { PrimaryRecommendation, AlternativeRecommendation } from '../../types';
import {
  COMPARISON_ATTRIBUTES,
  getNestedValue,
  detectConflicts,
  CANONICAL_STANDARDS_DB,
} from './comparisonUtils';
import { queryStandards } from '../../api/standardsClient';

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
  const [customISInput, setCustomISInput] = useState<string>('');
  const [isQueryingCustom, setIsQueryingCustom] = useState<boolean>(false);
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

  const handleAddCustom = async (codeToQuery?: string) => {
    const raw = (codeToQuery || customISInput).trim();
    if (!raw) return;

    // Check if in canonical DB first
    const matchedCanonical = Object.values(CANONICAL_STANDARDS_DB).find(
      (c) => c.is_number.toLowerCase().includes(raw.toLowerCase()) || raw.toLowerCase().includes(c.is_number.toLowerCase())
    );
    if (matchedCanonical && onAddAlternative) {
      onAddAlternative(matchedCanonical);
      setCustomISInput('');
      return;
    }

    // Otherwise query live backend
    setIsQueryingCustom(true);
    try {
      const resp = await queryStandards(raw);
      if (resp && resp.primary_recommendation && onAddAlternative) {
        const prim = resp.primary_recommendation;
        const newAlt: AlternativeRecommendation = {
          is_number: prim.is_number,
          title: prim.title,
          full_title: prim.full_title || prim.title,
          status: prim.status,
          year_published: prim.year_published,
          latest_amendment: prim.latest_amendment,
          scope_snippet: prim.scope_snippet,
          confidence: prim.confidence || 0.85,
          why_not_primary: `Compared candidate standard queried via catalog for ${raw}.`,
          certification: prim.certification,
        };
        onAddAlternative(newAlt);
        setCustomISInput('');
      }
    } catch (err) {
      console.warn('Could not query custom standard:', err);
    } finally {
      setIsQueryingCustom(false);
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
          {alternatives.length > 0 && (
            <button
              type="button"
              className={`palette-btn ${showOnlyConflicts ? 'selected' : ''}`}
              onClick={() => setShowOnlyConflicts(!showOnlyConflicts)}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <AlertTriangle size={13} />
              <span>Show Divergences Only ({conflictCount})</span>
            </button>
          )}

          {/* Add Standard via Custom Search */}
          {onAddAlternative && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={13} color="#71717A" style={{ position: 'absolute', left: '8px' }} />
                <input
                  type="text"
                  placeholder="Enter IS code (e.g. IS 1489)..."
                  value={customISInput}
                  onChange={(e) => setCustomISInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustom();
                  }}
                  className="auth-input"
                  style={{ width: '190px', paddingLeft: '26px', paddingRight: '6px', fontSize: '12px', height: '30px' }}
                />
              </div>
              <button
                type="button"
                disabled={isQueryingCustom || !customISInput.trim()}
                onClick={() => handleAddCustom()}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {isQueryingCustom ? <Loader2 size={12} className="spinner" /> : <Plus size={12} />}
                <span>Add Standard</span>
              </button>
            </div>
          )}

          {/* Quick Select Dropdown */}
          {availableToAdd.length > 0 && onAddAlternative && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="auth-input auth-select"
                style={{ width: '170px', padding: '4px 8px', fontSize: '12px', height: '30px' }}
              >
                <option value="">+ From catalog...</option>
                {availableToAdd.map((std) => (
                  <option key={std.is_number} value={std.is_number}>
                    {std.is_number}
                  </option>
                ))}
              </select>
              {selectedToAdd && (
                <button
                  type="button"
                  onClick={handleAddSelected}
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '12px', height: '30px' }}
                >
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty State Callout if No Alternative Selected */}
      {alternatives.length === 0 ? (
        <div
          style={{
            padding: '32px 20px',
            textAlign: 'center',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--hairline)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <Scale size={28} style={{ color: 'var(--ink-muted)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            No Secondary Standard Selected for Comparison
          </h3>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', maxWidth: '520px', margin: 0 }}>
            Currently viewing primary standard <strong>{primary.is_number}</strong>. Use the search input or catalog dropdown above to add an alternative standard and generate an instant side-by-side specification diff.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>Quick comparisons with {primary.is_number}:</span>
            {['IS 1489 (Part 1):2015', 'IS 455:2015', 'IS 1786:2008', 'IS 2062:2011', 'IS 456:2000']
              .filter((s) => !primary.is_number.includes(s.split(' ')[1]))
              .slice(0, 3)
              .map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleAddCustom(code)}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  + Compare with {code.split(':')[0]}
                </button>
              ))}
          </div>
        </div>
      ) : (
        /* Comparison Table */
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
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 4px',
                              }}
                              title="Remove column"
                            >
                              <X size={12} />
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
                      {hasConflict && <AlertTriangle size={11} color="#B45309" />}
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
                      <span style={{ color: 'var(--collapse-cobalt)', fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        <span>PRIMARY SPECIFICATION SELECTED</span>
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
      )}
    </div>
  );
};
