import React, { useState, useMemo } from 'react';
import type { StandardsResponse, AlliedStandard } from '../../types';
import { buildGroupedAllied } from './comparisonUtils';
import type { GroupedAlliedStandards } from './comparisonUtils';

interface AlliedStandardsMatrixProps {
  data: StandardsResponse;
}

type AlliedFilterTab = 'ALL' | 'TEST_METHODS' | 'NORMATIVE' | 'COMPLEMENTARY' | 'SUPERSEDED' | 'CROSS_DISCIPLINARY';

export const AlliedStandardsMatrix: React.FC<AlliedStandardsMatrixProps> = ({ data }) => {
  const [activeFilter, setActiveFilter] = useState<AlliedFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const grouped = useMemo<GroupedAlliedStandards>(() => {
    return buildGroupedAllied(data);
  }, [data]);

  const sections: {
    key: keyof GroupedAlliedStandards;
    filterKey: AlliedFilterTab;
    label: string;
    icon: string;
    description: string;
    items: AlliedStandard[];
  }[] = [
    {
      key: 'test_methods',
      filterKey: 'TEST_METHODS',
      label: 'Mandatory Test Methods & Protocols',
      icon: '🧪',
      description: 'Required laboratory and field testing standards for conformity assessment and mill certificates.',
      items: grouped.test_methods,
    },
    {
      key: 'normative_references',
      filterKey: 'NORMATIVE',
      label: 'Normative References & Raw Materials',
      icon: '🔗',
      description: 'Standards cited as indispensable normative references within the primary specification.',
      items: grouped.normative_references,
    },
    {
      key: 'complementary',
      filterKey: 'COMPLEMENTARY',
      label: 'Complementary Structural Design Codes',
      icon: '📋',
      description: 'National codes of practice and engineering design guidelines governing structural execution.',
      items: grouped.complementary,
    },
    {
      key: 'superseded',
      filterKey: 'SUPERSEDED',
      label: 'Withdrawn & Superseded Predecessors',
      icon: '🚫',
      description: 'Legacy specifications that are withdrawn and must NOT be cited in active procurement tenders.',
      items: grouped.superseded,
    },
    {
      key: 'cross_disciplinary',
      filterKey: 'CROSS_DISCIPLINARY',
      label: 'Cross-Disciplinary Co-Procurement Items',
      icon: '🌐',
      description: 'Frequently co-procured allied materials and testing standards in government civil works.',
      items: grouped.cross_disciplinary,
    },
  ];

  const handleCopy = (isNum: string) => {
    navigator.clipboard.writeText(isNum);
    setCopiedCode(isNum);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const totalAlliedCount =
    grouped.test_methods.length +
    grouped.normative_references.length +
    grouped.complementary.length +
    grouped.superseded.length +
    grouped.cross_disciplinary.length;

  return (
    <div className="workbench-card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="section-label" style={{ margin: '0 0 2px 0' }}>
            ALLIED STANDARDS & ECOSYSTEM MATRIX
          </div>
          <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>
            Ecosystem Standards for {data.primary_recommendation.is_number}
          </h2>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Complete mapping of test methods, normative references, complementary design codes, and withdrawn predecessors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-code" style={{ fontSize: '12px', fontWeight: 700 }}>
            {totalAlliedCount} Allied Standards Mapped
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          background: 'var(--paper)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div className="palette" style={{ margin: 0 }}>
          <button
            type="button"
            className={`palette-btn ${activeFilter === 'ALL' ? 'selected' : ''}`}
            onClick={() => setActiveFilter('ALL')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            All Ecosystem ({totalAlliedCount})
          </button>
          <button
            type="button"
            className={`palette-btn ${activeFilter === 'TEST_METHODS' ? 'selected' : ''}`}
            onClick={() => setActiveFilter('TEST_METHODS')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            🧪 Test Methods ({grouped.test_methods.length})
          </button>
          <button
            type="button"
            className={`palette-btn ${activeFilter === 'NORMATIVE' ? 'selected' : ''}`}
            onClick={() => setActiveFilter('NORMATIVE')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            🔗 Normative ({grouped.normative_references.length})
          </button>
          <button
            type="button"
            className={`palette-btn ${activeFilter === 'COMPLEMENTARY' ? 'selected' : ''}`}
            onClick={() => setActiveFilter('COMPLEMENTARY')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            📋 Complementary ({grouped.complementary.length})
          </button>
          <button
            type="button"
            className={`palette-btn ${activeFilter === 'SUPERSEDED' ? 'selected' : ''}`}
            onClick={() => setActiveFilter('SUPERSEDED')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            🚫 Withdrawn ({grouped.superseded.length})
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter allied standards..."
          className="auth-input"
          style={{ width: '220px', padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
        />
      </div>

      {/* Grouped Tables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map((sec) => {
          if (activeFilter !== 'ALL' && activeFilter !== sec.filterKey) return null;

          const filteredItems = sec.items.filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              item.is_number.toLowerCase().includes(q) ||
              item.title.toLowerCase().includes(q) ||
              (item.why && item.why.toLowerCase().includes(q)) ||
              (item.relation_label && item.relation_label.toLowerCase().includes(q))
            );
          });

          if (filteredItems.length === 0 && activeFilter !== 'ALL') {
            return (
              <div key={sec.key} style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                No standards in {sec.label} match the search query.
              </div>
            );
          }

          if (filteredItems.length === 0) return null;

          const isSupersededSec = sec.key === 'superseded';

          return (
            <div
              key={sec.key}
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              {/* Section Subheader */}
              <div
                style={{
                  padding: '10px 16px',
                  background: isSupersededSec ? '#FEF2F2' : 'var(--paper)',
                  borderBottom: '1px solid var(--hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{sec.icon}</span>
                  <strong
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '12px',
                      color: isSupersededSec ? 'var(--error-line)' : 'var(--ink)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {sec.label} ({filteredItems.length})
                  </strong>
                </div>
                <span style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)' }}>
                  {sec.description}
                </span>
              </div>

              {/* Table */}
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>STANDARD NO.</th>
                    <th style={{ minWidth: '260px' }}>SPECIFICATION TITLE & PURPOSE</th>
                    <th style={{ width: '130px' }}>RELATION TYPE</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>STATUS</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => {
                    const isWithdrawn = item.status === 'WITHDRAWN';

                    return (
                      <tr
                        key={idx}
                        style={{
                          background: isWithdrawn ? 'rgba(194, 59, 59, 0.04)' : undefined,
                        }}
                      >
                        {/* Standard Number */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              className="badge-code font-mono"
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                textDecoration: isWithdrawn ? 'line-through' : 'none',
                                color: isWithdrawn ? 'var(--error-line)' : 'var(--ink)',
                              }}
                            >
                              {item.is_number}
                            </span>
                          </div>
                        </td>

                        {/* Title & Purpose */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                              {item.title}
                            </span>
                            {item.why && (
                              <span style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: '1.35' }}>
                                {item.why}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Relation Type */}
                        <td>
                          <span
                            style={{
                              fontFamily: 'var(--font-data)',
                              fontSize: '11px',
                              color: 'var(--ink-secondary)',
                              background: 'var(--paper)',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              display: 'inline-block',
                            }}
                          >
                            {item.relation_label || item.relation_type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`concept-status-badge ${isWithdrawn ? 'withdrawn' : 'active'}`}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: isWithdrawn ? '#FEE2E2' : undefined,
                              color: isWithdrawn ? 'var(--error-line)' : undefined,
                              border: isWithdrawn ? '1px solid #FECACA' : undefined,
                            }}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.is_number)}
                            className="btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            title="Copy standard citation string"
                          >
                            {copiedCode === item.is_number ? '✓ Copied' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
