import React, { useState } from 'react';
import type { MappedProductItem } from './types';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit3,
  ExternalLink,
  Layers,
  FileText,
  Lock,
  ChevronRight,
  RefreshCw,
  Check
} from 'lucide-react';

interface Stage2ProductSelectionViewProps {
  products: MappedProductItem[];
  tenderTitle: string;
  onClarifyProduct: (
    productId: string,
    questionId: string,
    selectedOption: string,
    currentMapping: MappedProductItem
  ) => Promise<void>;
  onOverrideProductIS: (productId: string, customIsNumber: string) => void;
  onAcceptProduct: (productId: string) => void;
  onConfirmAllAndProceed: () => void;
  onOpenStandardDetail: (isNumber: string) => void;
  onPageClick?: (page: number, highlightText?: string) => void;
  isProcessing?: boolean;
}

export const Stage2ProductSelectionView: React.FC<Stage2ProductSelectionViewProps> = ({
  products,
  tenderTitle,
  onClarifyProduct,
  onOverrideProductIS,
  onAcceptProduct,
  onConfirmAllAndProceed,
  onOpenStandardDetail,
  onPageClick,
  isProcessing = false,
}) => {
  const [clarifyingId, setClarifyingId] = useState<string | null>(null);
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});
  const [expandedOverrideId, setExpandedOverrideId] = useState<string | null>(null);
  const [confirmedProducts, setConfirmedProducts] = useState<Record<string, boolean>>(() => {
    // By default, products with confidence >= 0.85 and no clarification needed can be pre-confirmed
    const initial: Record<string, boolean> = {};
    products.forEach((p) => {
      if (p.confidence_score >= 0.85 && !p.clarification_needed) {
        initial[p.product_id] = true;
      }
    });
    return initial;
  });

  const handleSelectOption = async (product: MappedProductItem, option: string) => {
    if (!product.clarification_question) return;
    setClarifyingId(product.product_id);
    try {
      await onClarifyProduct(
        product.product_id,
        product.clarification_question.question_id,
        option,
        product
      );
      // Mark as confirmed once clarified
      setConfirmedProducts((prev) => ({ ...prev, [product.product_id]: true }));
    } finally {
      setClarifyingId(null);
    }
  };

  const handleToggleConfirm = (productId: string) => {
    setConfirmedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
    onAcceptProduct(productId);
  };

  const handleApplyOverride = (productId: string) => {
    const val = overrideInputs[productId]?.trim();
    if (!val) return;
    onOverrideProductIS(productId, val);
    setConfirmedProducts((prev) => ({ ...prev, [productId]: true }));
    setExpandedOverrideId(null);
  };

  const totalCount = products.length;
  const confirmedCount = Object.values(confirmedProducts).filter(Boolean).length;
  const pendingClarifications = products.filter(
    (p) => (p.clarification_needed || p.confidence_score < 0.85) && !confirmedProducts[p.product_id]
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '10px 0 60px 0' }}>
      {/* Intermediate Stage Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(54, 69, 47, 0.08) 0%, rgba(194, 157, 83, 0.12) 100%)',
          border: '1px solid #E5E0D4',
          borderLeft: '5px solid #36452F',
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: '0 2px 10px rgba(54, 69, 47, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '20px',
              background: '#36452F',
              color: '#FFFEFB',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-data, monospace)',
              letterSpacing: '0.05em',
            }}
          >
            STAGE 2 OF 3 · INTERMEDIATE SELECTION
          </span>
          <span style={{ fontSize: '12px', color: '#6E7A68', fontFamily: 'var(--font-data, monospace)' }}>
            HUMAN-IN-THE-LOOP STANDARDS VERIFICATION
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-ui, sans-serif)', fontSize: '22px', fontWeight: 800, color: '#1C2419', margin: '0 0 6px 0' }}>
          Technical Product Selection & Indian Standards Mapping
        </h2>
        <p style={{ fontFamily: 'var(--font-prose, sans-serif)', fontSize: '14px', color: '#44503E', margin: 0, lineHeight: 1.5, maxWidth: '850px' }}>
          ManakAI has decomposed <strong>{tenderTitle}</strong> and mapped each extracted product to active Indian Standards. 
          Please review the matched standards below, answer any technical clarification prompts, and confirm all items to generate the official clause redlines and CVC audit seal.
        </p>

        {/* Metric Badges */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
          <div style={{ background: '#FFFEFB', border: '1px solid #E5E0D4', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#36452F" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-data, monospace)', color: '#1C2419', fontWeight: 600 }}>
              {totalCount} Total Products Extracted
            </span>
          </div>

          <div style={{ background: '#FFFEFB', border: '1px solid #E5E0D4', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#2D6A4F" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-data, monospace)', color: '#2D6A4F', fontWeight: 700 }}>
              {confirmedCount} / {totalCount} Items Confirmed
            </span>
          </div>

          {pendingClarifications > 0 && (
            <div style={{ background: '#FFF9EB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="#C47F17" />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-data, monospace)', color: '#92400E', fontWeight: 700 }}>
                {pendingClarifications} Technical Clarifications Pending
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {products.map((product, idx) => {
          const isConfirmed = Boolean(confirmedProducts[product.product_id]);
          const hasClarification = Boolean(product.clarification_question && !product.officer_clarification_answer);
          const isOutdated = Boolean(product.detected_outdated_is);
          const isClarifyingThis = clarifyingId === product.product_id;

          return (
            <div
              key={product.product_id || idx}
              style={{
                backgroundColor: '#FFFEFB',
                border: '1px solid',
                borderColor: isConfirmed ? '#B7E4C7' : hasClarification ? '#FDE68A' : '#E5E0D4',
                borderLeft: `5px solid ${isConfirmed ? '#2D6A4F' : hasClarification ? '#C47F17' : isOutdated ? '#BA3A2A' : '#36452F'}`,
                borderRadius: '10px',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Top Row: Clause Number, Product Name, and Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: '#F5F0E6',
                        fontFamily: 'var(--font-data, monospace)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#36452F',
                      }}
                    >
                      {product.clause_number || `Item ${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#1C2419' }}>
                      {product.product_name}
                    </span>
                    {product.page_number && onPageClick && (
                      <button
                        type="button"
                        onClick={() => onPageClick(product.page_number, product.verbatim_quote)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E7A68',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          textDecoration: 'underline',
                        }}
                      >
                        Page {product.page_number}
                      </button>
                    )}
                  </div>
                  {product.verbatim_quote && (
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: '#6E7A68',
                        fontFamily: 'var(--font-prose, sans-serif)',
                        fontStyle: 'italic',
                        background: 'rgba(0,0,0,0.02)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        borderLeft: '2px solid #E5E0D4',
                        maxWidth: '800px',
                      }}
                    >
                      "{product.verbatim_quote}"
                    </div>
                  )}
                </div>

                {/* Confidence & Confirmation Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontFamily: 'var(--font-data, monospace)',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: product.confidence_score >= 0.85 ? '#EDF7F1' : '#FFF9EB',
                      color: product.confidence_score >= 0.85 ? '#1B4332' : '#92400E',
                      border: `1px solid ${product.confidence_score >= 0.85 ? '#B7E4C7' : '#FDE68A'}`,
                    }}
                  >
                    Match: {(product.confidence_score * 100).toFixed(0)}%
                  </span>

                  {isConfirmed ? (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: '#EDF7F1',
                        color: '#1B4332',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #B7E4C7',
                      }}
                    >
                      <Check size={13} />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleConfirm(product.product_id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #36452F',
                        background: 'transparent',
                        color: '#36452F',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-data, monospace)',
                      }}
                    >
                      Confirm Item
                    </button>
                  )}
                </div>
              </div>

              {/* Superseded / Outdated Standard Warning */}
              {isOutdated && (
                <div
                  style={{
                    backgroundColor: '#FDF2F0',
                    border: '1px solid #F7CDC6',
                    borderLeft: '4px solid #BA3A2A',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                    color: '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} color="#BA3A2A" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>WITHDRAWN / OUTDATED STANDARD CITED:</strong>{' '}
                    <code>{product.detected_outdated_is}</code> is officially withdrawn. Superseded by active standard{' '}
                    <strong>{product.recommended_is}</strong>.
                  </div>
                </div>
              )}

              {/* Recommended Standard Banner */}
              <div
                style={{
                  backgroundColor: '#F5F0E6',
                  border: '1px solid #E5E0D4',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#6E7A68', fontFamily: 'var(--font-data, monospace)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                    RECOMMENDED ACTIVE INDIAN STANDARD
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C2419', fontFamily: 'var(--font-data, monospace)' }}>
                      {product.recommended_is}
                    </span>
                    <span style={{ fontSize: '13px', color: '#44503E', fontWeight: 500 }}>
                      — {product.recommended_is_title}
                    </span>
                  </div>
                  {product.qco_mandate?.mandatory && (
                    <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#8A6922', fontWeight: 600 }}>
                      ⚖️ Mandatory ISI Mark under {product.qco_mandate.order_name || 'BIS Quality Control Order'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onOpenStandardDetail(product.recommended_is)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D5CFBF',
                      background: '#FFFEFB',
                      color: '#36452F',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Inspect BIS Specs</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedOverrideId(expandedOverrideId === product.product_id ? null : product.product_id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D5CFBF',
                      background: '#FFFEFB',
                      color: '#44503E',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Override</span>
                  </button>
                </div>
              </div>

              {/* Inline Override Input */}
              {expandedOverrideId === product.product_id && (
                <div style={{ backgroundColor: '#FBF9F5', padding: '12px', borderRadius: '8px', border: '1px dashed #C29D53', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter custom IS standard, e.g. IS 1489:2015 (Part 1)"
                    value={overrideInputs[product.product_id] || ''}
                    onChange={(e) => setOverrideInputs({ ...overrideInputs, [product.product_id]: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #D5CFBF',
                      fontSize: '12px',
                      fontFamily: 'var(--font-data, monospace)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyOverride(product.product_id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      background: '#36452F',
                      color: '#FFFEFB',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Apply Override
                  </button>
                </div>
              )}

              {/* HITL Clarification Multiple Choice Prompt (The Intermediate Interactive Step) */}
              {product.clarification_question && (
                <div
                  style={{
                    backgroundColor: product.officer_clarification_answer ? '#F0F4ED' : '#FFFBEB',
                    border: `1px solid ${product.officer_clarification_answer ? '#B7E4C7' : '#FDE68A'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HelpCircle size={16} color={product.officer_clarification_answer ? '#2D6A4F' : '#D97706'} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C2419' }}>
                      Technical Clarification Required: {product.clarification_question.question_text}
                    </span>
                  </div>

                  {product.officer_clarification_answer ? (
                    <div style={{ fontSize: '12.5px', color: '#1B4332', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <CheckCircle2 size={14} color="#2D6A4F" />
                      <span>
                        Officer selected: <strong>{product.officer_clarification_answer}</strong>. Revised confidence to{' '}
                        <strong>{(product.confidence_score * 100).toFixed(0)}%</strong>.
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {product.clarification_question.options.map((opt) => (
                        <label
                          key={opt.option_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: '1px solid #E5E0D4',
                            background: '#FFFEFB',
                            cursor: isClarifyingThis ? 'wait' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name={`clarify-${product.product_id}`}
                            value={opt.label}
                            disabled={isClarifyingThis}
                            onChange={() => handleSelectOption(product, opt.label)}
                            style={{ cursor: 'pointer' }}
                          />
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C2419' }}>
                              {opt.label}
                            </span>
                            {opt.technical_implication && (
                              <span style={{ marginLeft: '6px', fontSize: '12px', color: '#6E7A68' }}>
                                — {opt.technical_implication}
                              </span>
                            )}
                            {opt.maps_to_candidate && (
                              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#36452F', fontFamily: 'var(--font-data, monospace)', fontWeight: 700 }}>
                                → Designates {opt.maps_to_candidate}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {product.engineering_rationale && (
                    <div style={{ fontSize: '12px', color: '#44503E', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.4 }}>
                      Engineering Note: {product.engineering_rationale}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Confirmation & Proceed Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: '20px',
          backgroundColor: '#FFFEFB',
          border: '1px solid #E5E0D4',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          zIndex: 50,
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C2419' }}>
            Ready to generate final NIT schedule?
          </div>
          <div style={{ fontSize: '12px', color: '#6E7A68' }}>
            {confirmedCount} of {totalCount} products confirmed. Stage 3 will draft grounded redline diffs and seal the CVC audit hash.
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirmAllAndProceed}
          disabled={isProcessing}
          style={{
            padding: '12px 28px',
            borderRadius: '8px',
            backgroundColor: '#36452F',
            color: '#FFFEFB',
            border: 'none',
            fontSize: '13.5px',
            fontFamily: 'var(--font-data, monospace)',
            fontWeight: 700,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(54, 69, 47, 0.25)',
            opacity: isProcessing ? 0.7 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          {isProcessing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Finalizing Stage 3 & Sealing Audit...</span>
            </>
          ) : (
            <>
              <Lock size={15} />
              <span>Confirm All & Generate Final Diffs & CVC Audit</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
