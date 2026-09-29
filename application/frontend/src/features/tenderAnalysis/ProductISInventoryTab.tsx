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
  BookOpen,
  MapPin,
  ArrowRight,
  Zap,
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
  const [expandedInspect, setExpandedInspect] = useState<Record<string, boolean>>({});

  const handleToggleInspect = (productId: string) => {
    setExpandedInspect((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

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
          backgroundColor: 'var(--surface)',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              padding: '7px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filter === 'ALL' ? 700 : 600,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              border: filter === 'ALL' ? '1px solid var(--olive-primary)' : '1px solid var(--hairline)',
              backgroundColor: filter === 'ALL' ? 'var(--olive-primary)' : 'var(--surface-secondary)',
              color: filter === 'ALL' ? '#FFFFFF' : 'var(--ink-secondary)',
              transition: 'all 0.15s ease',
              boxShadow: filter === 'ALL' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            All Products ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('NEEDS_CLARIFICATION')}
            style={{
              padding: '7px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filter === 'NEEDS_CLARIFICATION' ? 700 : 600,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              border: filter === 'NEEDS_CLARIFICATION' ? '1px solid var(--amber-warn)' : '1px solid var(--hairline)',
              backgroundColor: filter === 'NEEDS_CLARIFICATION' ? 'var(--amber-warn)' : 'var(--surface-secondary)',
              color: filter === 'NEEDS_CLARIFICATION' ? '#FFFFFF' : 'var(--ink-secondary)',
              transition: 'all 0.15s ease',
              boxShadow: filter === 'NEEDS_CLARIFICATION' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={13} />
            <span>Needs Clarification ({products.filter((p) => p.clarification_needed || p.confidence_score < 0.85).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('OUTDATED')}
            style={{
              padding: '7px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filter === 'OUTDATED' ? 700 : 600,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              border: filter === 'OUTDATED' ? '1px solid var(--error-red)' : '1px solid var(--hairline)',
              backgroundColor: filter === 'OUTDATED' ? 'var(--error-red)' : 'var(--surface-secondary)',
              color: filter === 'OUTDATED' ? '#FFFFFF' : 'var(--ink-secondary)',
              transition: 'all 0.15s ease',
              boxShadow: filter === 'OUTDATED' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={13} />
            <span>Superseded Codes ({products.filter((p) => p.detected_outdated_is).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('RESOLVED')}
            style={{
              padding: '7px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filter === 'RESOLVED' ? 700 : 600,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              border: filter === 'RESOLVED' ? '1px solid var(--emerald-pass)' : '1px solid var(--hairline)',
              backgroundColor: filter === 'RESOLVED' ? 'var(--emerald-pass)' : 'var(--surface-secondary)',
              color: filter === 'RESOLVED' ? '#FFFFFF' : 'var(--ink-secondary)',
              transition: 'all 0.15s ease',
              boxShadow: filter === 'RESOLVED' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={13} />
            <span>Resolved ({products.filter((p) => p.status === 'RESOLVED').length})</span>
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
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
                backgroundColor: 'var(--surface)',
                borderRadius: '10px',
                border: '1px solid var(--hairline)',
                padding: '22px',
                boxShadow: 'var(--shadow-card)',
                borderLeft: `5px solid ${
                  item.detected_outdated_is
                    ? 'var(--error-red)'
                    : item.confidence_score >= 0.85
                    ? 'var(--emerald-pass)'
                    : 'var(--amber-warn)'
                }`,
                transition: 'all 0.15s ease',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-data, monospace)',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      {item.clause_number}
                    </span>

                    {/* Clickable Page Pill to jump Document Reader */}
                    <button
                      type="button"
                      onClick={() => onPageClick(item.page_number, item.verbatim_quote)}
                      style={{
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--collapse-cobalt)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title={`Jump to Page ${item.page_number} and highlight quote`}
                    >
                      <MapPin size={11} />
                      <span>Page {item.page_number}</span>
                      <ExternalLink size={10} />
                    </button>

                    {item.detected_outdated_is && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--error-bg)',
                          color: 'var(--error-red)',
                          border: '1px solid var(--error-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertTriangle size={11} />
                        <span>Cites Superseded Code</span>
                      </span>
                    )}

                    {item.qco_mandate?.mandatory && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--amber-bg)',
                          color: 'var(--amber-warn)',
                          border: '1px solid var(--amber-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Zap size={11} />
                        <span>Mandatory QCO</span>
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 4px 0' }}>
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
                          ? 'var(--emerald-bg)'
                          : item.confidence_score >= 0.5
                          ? 'var(--amber-bg)'
                          : 'var(--error-bg)',
                      border: `1px solid ${
                        item.confidence_score >= 0.85
                          ? 'var(--emerald-border)'
                          : item.confidence_score >= 0.5
                          ? 'var(--amber-border)'
                          : 'var(--error-border)'
                      }`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color:
                          item.confidence_score >= 0.85
                            ? 'var(--emerald-pass)'
                            : item.confidence_score >= 0.5
                            ? 'var(--amber-warn)'
                            : 'var(--error-red)',
                        fontFamily: 'var(--font-data, monospace)',
                      }}
                    >
                      {confidencePct}% Confidence
                    </span>
                  </div>

                  {item.status === 'RESOLVED' && (
                    <span style={{ fontSize: '12px', color: 'var(--emerald-pass)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} />
                      <span>Verified</span>
                    </span>
                  )}
                  {item.status === 'OVERRIDDEN' && (
                    <span style={{ fontSize: '12px', color: 'var(--collapse-cobalt)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Edit3 size={13} />
                      <span>Overridden</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Verbatim Tender Quote Card */}
              <div
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--hairline)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '12.5px',
                  color: 'var(--ink-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '2px', fontFamily: 'var(--font-data)' }}>
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
                      backgroundColor: 'var(--error-bg)',
                      border: '1px solid var(--error-border)',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--error-red)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      CITED OUTDATED / WITHDRAWN CODE
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--error-red)', textDecoration: 'line-through', fontFamily: 'var(--font-data)' }}>
                      {item.detected_outdated_is}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--error-red)', marginTop: '2px' }}>
                      Withdrawn by BIS. Must be eliminated from NIT specification.
                    </div>
                  </div>
                )}

                {/* Recommended Standard Box */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--emerald-bg)',
                    border: '1px solid var(--emerald-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--emerald-pass)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AUTHORITATIVE INDIAN STANDARD
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleInspect(item.product_id)}
                        style={{
                          border: '1px solid var(--emerald-border)',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--emerald-pass)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        title="Toggle quick inline scope and technical testing methods"
                      >
                        <BookOpen size={11} />
                        <span>{expandedInspect[item.product_id] ? 'Hide Quick Scope' : 'Quick Scope'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenStandardDetail(item.recommended_is)}
                        style={{
                          border: 'none',
                          backgroundColor: 'var(--emerald-pass)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 9px',
                          borderRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'all 0.15s ease',
                        }}
                        title="Inspect full standard, gazette order and test methods in drawer"
                      >
                        <span>Inspect Standard</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--emerald-text)', fontFamily: 'var(--font-data, monospace)' }}>
                    {item.recommended_is}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink)', marginTop: '2px', fontWeight: 700 }}>
                    {item.recommended_is_title}
                  </div>
                  {item.where_stated && (
                    <div style={{ fontSize: '11.5px', color: 'var(--amber-warn)', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} color="var(--amber-warn)" />
                      <span>{item.where_stated}</span>
                    </div>
                  )}

                  {/* Inline Expanded Quick Scope & Technical Breakdown */}
                  {expandedInspect[item.product_id] && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--emerald-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--emerald-pass)', textTransform: 'uppercase' }}>
                        TECHNICAL SPECIFICATIONS & TESTING METHODS
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.5, fontWeight: 500 }}>
                        {item.what_it_is || 'Covers manufacturing tolerances, material chemistry, mechanical properties, and sampling criteria.'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', lineHeight: 1.45, fontStyle: 'italic', background: 'var(--surface-secondary)', padding: '6px 10px', borderRadius: '4px' }}>
                        <strong>Engineering Rationale:</strong> {item.engineering_rationale}
                      </div>
                    </div>
                  )}

                  {item.what_it_is && !expandedInspect[item.product_id] && (
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
                      {item.what_it_is}
                    </div>
                  )}
                  {item.official_is_link && (
                    <div style={{ marginTop: '6px' }}>
                      <a
                        href={item.official_is_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--emerald-pass)',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ExternalLink size={11} />
                        <span>View Official BIS Standard</span>
                      </a>
                    </div>
                  )}
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    {item.engineering_rationale}
                  </div>
                </div>
              </div>

              {/* Other Candidate Standards Chips */}
              {item.all_candidates && item.all_candidates.length > 1 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-data)' }}>
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
                            backgroundColor: 'var(--surface-secondary)',
                            border: '1px solid var(--hairline)',
                            fontSize: '11.5px',
                            color: 'var(--ink-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-data)' }}>{cand.is_number}</span>
                          <span style={{ opacity: 0.7 }}>({Math.round(cand.confidence * 100)}%)</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* HUMAN-IN-THE-LOOP PRACTICAL ENGINEERING CLARIFICATION CARD */}
              {needsClarification && (
                <div
                  style={{
                    backgroundColor: 'var(--amber-bg)',
                    border: '1px solid var(--amber-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber-warn)', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                    <HelpCircle size={16} />
                    <span>TECHNICAL CLARIFICATION NEEDED TO MAXIMIZE CONFIDENCE</span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--amber-warn)', fontWeight: 600, margin: '0 0 12px 0' }}>
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
                            backgroundColor: isSelected ? 'var(--surface)' : 'var(--surface-secondary)',
                            border: `1px solid ${isSelected ? 'var(--amber-warn)' : 'var(--hairline)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name={`clarify-${item.product_id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(item.product_id, opt.option_id)}
                            style={{ marginTop: '2px', accentColor: 'var(--amber-warn)' }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
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
                        backgroundColor: selectedAnswers[item.product_id] && !isClarifying ? 'var(--amber-warn)' : 'var(--hairline)',
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
                      <span>{isClarifying ? 'Re-evaluating...' : 'Submit Clarification & Boost Confidence'}</span>
                      {!isClarifying && <ArrowRight size={13} />}
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
                  borderTop: '1px solid var(--hairline)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleOverride(item.product_id)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--ink-muted)',
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
                      backgroundColor: item.status === 'RESOLVED' ? 'var(--emerald-pass)' : 'var(--surface-secondary)',
                      color: item.status === 'RESOLVED' ? '#FFFFFF' : 'var(--ink)',
                      border: '1px solid var(--emerald-border)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <CheckCircle2 size={14} color={item.status === 'RESOLVED' ? '#FFFFFF' : 'var(--emerald-pass)'} />
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
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
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
                      border: '1px solid var(--hairline)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
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
                      backgroundColor: 'var(--olive-primary)',
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
