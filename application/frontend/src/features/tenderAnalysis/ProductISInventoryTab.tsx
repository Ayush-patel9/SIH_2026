import React, { useState } from 'react';
import type { MappedProductItem } from './types';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface ProductISInventoryTabProps {
  products: MappedProductItem[];
  onOpenStandardDetail: (isNumber: string) => void;
  onPageClick: (page: number, highlightText?: string) => void;
  onClarifyProduct: (
    productId: string,
    questionId: string,
    selectedOption: string,
    currentMapping: MappedProductItem
  ) => Promise<void>;
  onOverrideProductIS: (productId: string, customIsNumber: string) => void;
  onAcceptProduct: (productId: string) => void;
  clarifyingProductId: string | null;
}

export const ProductISInventoryTab: React.FC<ProductISInventoryTabProps> = ({
  products,
  onOpenStandardDetail,
  onPageClick,
  onClarifyProduct,
  onOverrideProductIS,
  onAcceptProduct,
  clarifyingProductId,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'NEEDS_CLARIFICATION' | 'OUTDATED' | 'RESOLVED'>('ALL');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});

  const handleSelectOption = (productId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [productId]: optionId }));
  };

  const handleToggleOverride = (productId: string) => {
    setExpandedOverrides((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'NEEDS_CLARIFICATION') return p.clarification_needed || p.confidence_score < 0.85;
    if (filter === 'OUTDATED') return Boolean(p.detected_outdated_is);
    if (filter === 'RESOLVED') return p.status === 'RESOLVED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar & Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFEFB',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid #E5E0D4',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: filter === 'ALL' ? '#2D6A4F' : '#F6F3EB',
              color: filter === 'ALL' ? '#FFFFFF' : '#44503E',
              transition: 'all 0.15s ease',
            }}
          >
            All Products ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('NEEDS_CLARIFICATION')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: filter === 'NEEDS_CLARIFICATION' ? '#D97706' : '#F6F3EB',
              color: filter === 'NEEDS_CLARIFICATION' ? '#FFFFFF' : '#44503E',
              transition: 'all 0.15s ease',
            }}
          >
            ⚡ Needs Clarification ({products.filter((p) => p.clarification_needed || p.confidence_score < 0.85).length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('OUTDATED')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: filter === 'OUTDATED' ? '#DC2626' : '#F6F3EB',
              color: filter === 'OUTDATED' ? '#FFFFFF' : '#44503E',
              transition: 'all 0.15s ease',
            }}
          >
            ⚠️ Superseded Codes ({products.filter((p) => p.detected_outdated_is).length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('RESOLVED')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: filter === 'RESOLVED' ? '#1D4ED8' : '#F6F3EB',
              color: filter === 'RESOLVED' ? '#FFFFFF' : '#44503E',
              transition: 'all 0.15s ease',
            }}
          >
            ✓ Resolved ({products.filter((p) => p.status === 'RESOLVED').length})
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#6E7A68' }}>
          Showing <strong>{filteredProducts.length}</strong> of {products.length} line items
        </div>
      </div>

      {/* Product Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredProducts.map((item) => {
          const isClarifying = clarifyingProductId === item.product_id;
          const confidencePct = Math.round(item.confidence_score * 100);
          const needsClarification = item.clarification_needed && item.clarification_question;

          return (
            <div
              key={item.product_id}
              style={{
                backgroundColor: '#FFFEFB',
                borderRadius: '10px',
                border: '1px solid #E5E0D4',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(54, 69, 47, 0.04)',
                borderLeft: `5px solid ${
                  item.detected_outdated_is
                    ? '#DC2626'
                    : item.confidence_score >= 0.85
                    ? '#2D6A4F'
                    : '#D97706'
                }`,
              }}
            >
              {/* Product Header Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#F6F3EB',
                        color: '#6E7A68',
                        fontFamily: 'var(--font-data, monospace)',
                      }}
                    >
                      {item.clause_number}
                    </span>

                    {/* Clickable Page Pill to jump Document Reader */}
                    <button
                      type="button"
                      onClick={() => onPageClick(item.page_number, item.verbatim_quote)}
                      style={{
                        border: '1px solid #BFDBFE',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title={`Jump to Page ${item.page_number} and highlight quote`}
                    >
                      <span>📍 Page {item.page_number}</span>
                      <ExternalLink size={10} />
                    </button>

                    {item.detected_outdated_is && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#FDF2F0',
                          color: '#BA3A2A',
                          border: '1px solid #F7CDC6',
                        }}
                      >
                        ⚠️ Cites Superseded Code
                      </span>
                    )}

                    {item.qco_mandate?.mandatory && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(217, 119, 6, 0.1)',
                          color: '#B45309',
                          border: '1px solid rgba(217, 119, 6, 0.3)',
                        }}
                      >
                        ⚡ Mandatory QCO
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1C2419', margin: '0 0 4px 0' }}>
                    {item.product_name}
                  </h3>
                </div>

                {/* Confidence Pill & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      backgroundColor:
                        item.confidence_score >= 0.85
                          ? 'rgba(45, 106, 79, 0.1)'
                          : item.confidence_score >= 0.5
                          ? 'rgba(217, 119, 6, 0.1)'
                          : 'rgba(220, 38, 38, 0.1)',
                      border: `1px solid ${
                        item.confidence_score >= 0.85
                          ? 'rgba(45, 106, 79, 0.3)'
                          : item.confidence_score >= 0.5
                          ? 'rgba(217, 119, 6, 0.3)'
                          : 'rgba(220, 38, 38, 0.3)'
                      }`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color:
                          item.confidence_score >= 0.85
                            ? '#2D6A4F'
                            : item.confidence_score >= 0.5
                            ? '#B45309'
                            : '#DC2626',
                        fontFamily: 'var(--font-data, monospace)',
                      }}
                    >
                      {confidencePct}% Confidence
                    </span>
                  </div>

                  {item.status === 'RESOLVED' && (
                    <span style={{ fontSize: '12px', color: '#15803D', fontWeight: 700 }}>✓ Verified</span>
                  )}
                  {item.status === 'OVERRIDDEN' && (
                    <span style={{ fontSize: '12px', color: '#7E22CE', fontWeight: 700 }}>✎ Overridden</span>
                  )}
                </div>
              </div>

              {/* Verbatim Tender Quote Card */}
              <div
                style={{
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #E5E0D4',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '12.5px',
                  color: '#44503E',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#8A9485', textTransform: 'uppercase', marginBottom: '2px' }}>
                  VERBATIM TENDER CLAUSE QUOTE:
                </div>
                "{item.verbatim_quote}"
              </div>

              {/* Recommended Standard vs Outdated Standard Comparison */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                {/* Outdated Box (if detected) */}
                {item.detected_outdated_is && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#FDF2F0',
                      border: '1px solid #F7CDC6',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#BA3A2A', textTransform: 'uppercase', marginBottom: '4px' }}>
                      CITED OUTDATED / WITHDRAWN CODE
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#BA3A2A', textDecoration: 'line-through' }}>
                      {item.detected_outdated_is}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#991B1B', marginTop: '2px' }}>
                      Withdrawn by BIS. Must be eliminated from NIT specification.
                    </div>
                  </div>
                )}

                {/* Recommended Standard Box */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#EDF7F1',
                    border: '1px solid #B7E4C7',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1B4332', textTransform: 'uppercase' }}>
                      AUTHORITATIVE INDIAN STANDARD
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenStandardDetail(item.recommended_is)}
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#2D6A4F',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="Inspect full standard, scope and test methods"
                    >
                      <span>Inspect Details</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1B4332', fontFamily: 'var(--font-data, monospace)' }}>
                    {item.recommended_is}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#2D6A4F', marginTop: '2px', fontWeight: 600 }}>
                    {item.recommended_is_title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#44503E', marginTop: '4px' }}>
                    {item.engineering_rationale}
                  </div>
                </div>
              </div>

              {/* Other Candidate Standards Chips */}
              {item.all_candidates && item.all_candidates.length > 1 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6E7A68', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Alternative Standards Considered:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {item.all_candidates
                      .filter((c) => c.is_number !== item.recommended_is)
                      .slice(0, 4)
                      .map((cand, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onOpenStandardDetail(cand.is_number)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#F6F3EB',
                            border: '1px solid #E5E0D4',
                            fontSize: '11.5px',
                            color: '#44503E',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{cand.is_number}</span>
                          <span style={{ opacity: 0.7 }}>({Math.round(cand.confidence * 100)}%)</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* HUMAN-IN-THE-LOOP PRACTICAL ENGINEERING CLARIFICATION CARD */}
              {/* ============================================================ */}
              {needsClarification && (
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                    <HelpCircle size={16} />
                    <span>TECHNICAL CLARIFICATION NEEDED TO MAXIMIZE CONFIDENCE</span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 600, margin: '0 0 12px 0' }}>
                    {item.clarification_question!.question_text}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {item.clarification_question!.options.map((opt) => {
                      const isSelected = selectedAnswers[item.product_id] === opt.option_id;

                      return (
                        <label
                          key={opt.option_id}
                          onClick={() => handleSelectOption(item.product_id, opt.option_id)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#FEF3C7' : '#FFFFFF',
                            border: `1px solid ${isSelected ? '#D97706' : '#FDE68A'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name={`clarify-${item.product_id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(item.product_id, opt.option_id)}
                            style={{ marginTop: '2px', accentColor: '#D97706' }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C2419' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#78350F', marginTop: '2px' }}>
                              {opt.technical_implication}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={!selectedAnswers[item.product_id] || isClarifying}
                      onClick={() =>
                        onClarifyProduct(
                          item.product_id,
                          item.clarification_question!.question_id,
                          selectedAnswers[item.product_id],
                          item
                        )
                      }
                      style={{
                        backgroundColor: selectedAnswers[item.product_id] && !isClarifying ? '#D97706' : '#E5E0D4',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: selectedAnswers[item.product_id] && !isClarifying ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{isClarifying ? 'Re-evaluating...' : 'Submit Clarification & Boost Confidence ➔'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons: Accept Recommendation & Custom Override */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  paddingTop: '12px',
                  borderTop: '1px solid #E5E0D4',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleOverride(item.product_id)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6E7A68',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Edit3 size={13} />
                  <span>Custom Standard Code Override</span>
                  {expandedOverrides[item.product_id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onAcceptProduct(item.product_id)}
                    style={{
                      backgroundColor: item.status === 'RESOLVED' ? '#2D6A4F' : '#FAF8F3',
                      color: item.status === 'RESOLVED' ? '#FFFFFF' : '#1C2419',
                      border: '1px solid #B7E4C7',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <CheckCircle2 size={14} color={item.status === 'RESOLVED' ? '#FFFFFF' : '#2D6A4F'} />
                    <span>{item.status === 'RESOLVED' ? 'Verified & Approved' : 'Accept Recommendation'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded Manual Override Accordion */}
              {expandedOverrides[item.product_id] && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#FAF8F3',
                    border: '1px solid #E5E0D4',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    value={overrideInputs[item.product_id] || ''}
                    onChange={(e) =>
                      setOverrideInputs((prev) => ({ ...prev, [item.product_id]: e.target.value }))
                    }
                    placeholder="e.g. IS 10262:2019 or IS 456:2000"
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '4px',
                      border: '1px solid #DCD6C8',
                      fontSize: '12.5px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = (overrideInputs[item.product_id] || '').trim();
                      if (val) {
                        onOverrideProductIS(item.product_id, val);
                        setExpandedOverrides((prev) => ({ ...prev, [item.product_id]: false }));
                      }
                    }}
                    style={{
                      backgroundColor: '#36452F',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Override
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
