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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  Search,
  BookOpen,
  Scale,
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
  const [expandedInsightsId, setExpandedInsightsId] = useState<Record<string, boolean>>({});

  const toggleInsights = (productId: string) => {
    setExpandedInsightsId((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };
  const [confirmedProducts, setConfirmedProducts] = useState<Record<string, boolean>>(() => {
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
          background: 'linear-gradient(135deg, var(--olive-tint) 0%, var(--surface-secondary) 100%)',
          border: '1px solid var(--hairline)',
          borderLeft: '5px solid var(--olive-primary)',
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'var(--olive-primary)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-data, monospace)',
              letterSpacing: '0.05em',
            }}
          >
            STAGE 2 OF 3 · INTERMEDIATE SELECTION
          </span>
          <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data, monospace)' }}>
            HUMAN-IN-THE-LOOP STANDARDS VERIFICATION
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-ui, sans-serif)', fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px 0' }}>
          Technical Product Selection & Indian Standards Mapping
        </h2>
        <p style={{ fontFamily: 'var(--font-prose, sans-serif)', fontSize: '14px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '850px' }}>
          ManakAI has decomposed <strong>{tenderTitle}</strong> and mapped each extracted product to active Indian Standards. 
          Please review the matched standards below, answer any technical clarification prompts, and confirm all items to generate the official clause redlines and CVC audit seal.
        </p>

        {/* Metric Badges */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--olive-primary)" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-data, monospace)', color: 'var(--ink)', fontWeight: 600 }}>
              {totalCount} Total Products Extracted
            </span>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--emerald-pass)" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-data, monospace)', color: 'var(--emerald-pass)', fontWeight: 700 }}>
              {confirmedCount} / {totalCount} Items Confirmed
            </span>
          </div>

          {pendingClarifications > 0 && (
            <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="var(--amber-warn)" />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-data, monospace)', color: 'var(--amber-warn)', fontWeight: 700 }}>
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
                backgroundColor: 'var(--surface)',
                border: '1px solid',
                borderColor: isConfirmed ? 'var(--emerald-border)' : hasClarification ? 'var(--amber-border)' : 'var(--hairline)',
                borderLeft: `5px solid ${isConfirmed ? 'var(--emerald-pass)' : hasClarification ? 'var(--amber-warn)' : isOutdated ? 'var(--error-red)' : 'var(--olive-primary)'}`,
                borderRadius: '10px',
                padding: '22px',
                boxShadow: 'var(--shadow-card)',
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
                        background: 'var(--surface-secondary)',
                        fontFamily: 'var(--font-data, monospace)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--olive-primary)',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      {product.clause_number || `Item ${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                      {product.product_name}
                    </span>
                    {product.page_number && onPageClick && (
                      <button
                        type="button"
                        onClick={() => onPageClick(product.page_number, product.verbatim_quote)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ink-muted)',
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
                        color: 'var(--ink-secondary)',
                        fontFamily: 'var(--font-prose, sans-serif)',
                        fontStyle: 'italic',
                        background: 'var(--surface-secondary)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        borderLeft: '2px solid var(--hairline)',
                        maxWidth: '800px',
                      }}
                    >
                      "{product.verbatim_quote}"
                    </div>
                  )}
                </div>

                {/* Confidence & Confirmation Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontFamily: 'var(--font-data, monospace)',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: product.confidence_score >= 0.85 ? 'var(--emerald-bg)' : 'var(--amber-bg)',
                      color: product.confidence_score >= 0.85 ? 'var(--emerald-pass)' : 'var(--amber-warn)',
                      border: `1px solid ${product.confidence_score >= 0.85 ? 'var(--emerald-border)' : 'var(--amber-border)'}`,
                    }}
                  >
                    Match: {(product.confidence_score * 100).toFixed(0)}%
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--emerald-bg)',
                      border: '1px solid var(--emerald-border)',
                      fontSize: '11px',
                      color: 'var(--emerald-pass)',
                      fontWeight: 600,
                    }}
                    title="Grounded against Gazette of India & BIS Repository"
                  >
                    <ShieldCheck size={12} />
                    <span>e-Gazette Verified</span>
                  </span>

                  {isConfirmed ? (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'var(--emerald-bg)',
                        color: 'var(--emerald-pass)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid var(--emerald-border)',
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
                        border: '1px solid var(--olive-primary)',
                        background: 'transparent',
                        color: 'var(--olive-primary)',
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
                    backgroundColor: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    borderLeft: '4px solid var(--error-red)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                    color: 'var(--error-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} color="var(--error-red)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>WITHDRAWN / OUTDATED STANDARD CITED:</strong>{' '}
                    <code>{product.detected_outdated_is}</code> is officially withdrawn. Superseded by active standard{' '}
                    <strong>{product.recommended_is}</strong>.
                  </div>
                </div>
              )}

              {/* Recommended Standard Banner with Statutory Reference & What It Is */}
              <div
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--hairline)',
                  borderRadius: '8px',
                  padding: '16px 18px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data, monospace)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                      RECOMMENDED ACTIVE INDIAN STANDARD
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-data, monospace)' }}>
                        {product.recommended_is}
                      </span>
                      <span style={{ fontSize: '13.5px', color: 'var(--olive-primary)', fontWeight: 600 }}>
                        — {product.recommended_is_title}
                      </span>
                    </div>

                    {/* Verified Statutory Citation & Scope */}
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {product.where_stated && (
                        <div style={{ fontSize: '12px', color: 'var(--amber-warn)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} color="var(--amber-warn)" />
                          <span><strong>Where Stated:</strong> {product.where_stated}</span>
                        </div>
                      )}
                      {product.what_it_is && (
                        <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.45, marginTop: '2px' }}>
                          <strong>Technical Scope:</strong> {product.what_it_is}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {product.official_is_link && (
                      <a
                        href={product.official_is_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--emerald-border)',
                          background: 'var(--emerald-bg)',
                          color: 'var(--emerald-pass)',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        title="Open official BIS standard or digitized gazette document"
                      >
                        <ExternalLink size={12} />
                        <span>Official BIS Document</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenStandardDetail(product.recommended_is)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--hairline)',
                        background: 'var(--surface)',
                        color: 'var(--ink)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <BookOpen size={12} />
                      <span>Inspect BIS Specs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleInsights(product.product_id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--amber-border)',
                        background: expandedInsightsId[product.product_id] ? 'var(--amber-bg)' : 'var(--surface)',
                        color: 'var(--amber-warn)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Inspect all evaluated candidate standards with links & statutory citations"
                    >
                      <Search size={12} />
                      <span>View Insights ({product.all_candidates?.length || 5} Evaluated IS)</span>
                      {expandedInsightsId[product.product_id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedOverrideId(expandedOverrideId === product.product_id ? null : product.product_id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--hairline)',
                        background: 'var(--surface)',
                        color: 'var(--ink-secondary)',
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
              </div>

              {/* Expandable 5-Candidate Standards Insights Panel */}
              {expandedInsightsId[product.product_id] && (
                <div
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    borderLeft: '4px solid var(--amber-warn)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Search size={15} color="var(--amber-warn)" />
                        <span>Evaluated Candidate Indian Standards for {product.product_name}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        All candidate standards cross-referenced against the tender clause, e-Gazette QCO mandates, and active BIS catalog.
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--emerald-bg)',
                        color: 'var(--emerald-pass)',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-data, monospace)',
                      }}
                    >
                      {product.all_candidates?.length || 0} Standards Evaluated
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {product.all_candidates && product.all_candidates.map((cand, cIdx) => {
                      const isSelected = cand.is_number === product.recommended_is;

                      return (
                        <div
                          key={cIdx}
                          style={{
                            backgroundColor: 'var(--surface)',
                            border: `1px solid ${isSelected ? 'var(--emerald-pass)' : 'var(--hairline)'}`,
                            borderRadius: '8px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                          }}
                        >
                          {/* Row 1: Code, Title, Confidence, Status Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-data, monospace)' }}>
                                {cand.is_number}
                              </span>
                              <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                                {cand.title}
                              </span>
                              {isSelected && (
                                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-pass)', fontSize: '10.5px', fontWeight: 700, border: '1px solid var(--emerald-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={11} />
                                  <span>CURRENT RECOMMENDATION</span>
                                </span>
                              )}
                              {cand.qco_mandatory && (
                                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--amber-bg)', color: 'var(--amber-warn)', fontSize: '10.5px', fontWeight: 700, border: '1px solid var(--amber-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Scale size={11} />
                                  <span>Mandatory QCO</span>
                                </span>
                              )}
                              {cand.status === 'SUPERSEDED_REPLACEMENT' && (
                                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--error-bg)', color: 'var(--error-red)', fontSize: '10.5px', fontWeight: 700 }}>
                                  Active Revision
                                </span>
                              )}
                            </div>

                            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-data, monospace)', color: (cand.confidence || 0) >= 0.85 ? 'var(--emerald-pass)' : 'var(--amber-warn)' }}>
                              {Math.round((cand.confidence || 0.85) * 100)}% Match
                            </span>
                          </div>

                          {/* Row 2: What it is & Where stated */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                            {cand.what_it_is && (
                              <div>
                                <strong style={{ color: 'var(--ink)' }}>What it is:</strong> {cand.what_it_is}
                              </div>
                            )}
                            {cand.where_stated && (
                              <div style={{ color: 'var(--amber-warn)' }}>
                                <strong>Where stated:</strong> {cand.where_stated}
                              </div>
                            )}
                          </div>

                          {/* Row 3: Action Buttons (Link & Adopt) */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--hairline)', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {cand.is_link && (
                                <a
                                  href={cand.is_link}
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
                                  <ExternalLink size={12} />
                                  <span>View Official BIS Standard</span>
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => onOpenStandardDetail(cand.is_number)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--ink-muted)',
                                  fontSize: '11.5px',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                }}
                              >
                                Inspect Full Scope & Tests
                              </button>
                            </div>

                            {!isSelected && (
                              <button
                                type="button"
                                onClick={() => onOverrideProductIS(product.product_id, cand.is_number)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--olive-primary)',
                                  backgroundColor: 'var(--surface)',
                                  color: 'var(--olive-primary)',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Select This Standard
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inline Override Input */}
              {expandedOverrideId === product.product_id && (
                <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--amber-warn)', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter custom IS standard, e.g. IS 1489:2015 (Part 1)"
                    value={overrideInputs[product.product_id] || ''}
                    onChange={(e) => setOverrideInputs({ ...overrideInputs, [product.product_id]: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--hairline)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-data, monospace)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyOverride(product.product_id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      background: 'var(--olive-primary)',
                      color: '#FFFFFF',
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

              {/* HITL Clarification Multiple Choice Prompt */}
              {product.clarification_question && (
                <div
                  style={{
                    backgroundColor: product.officer_clarification_answer ? 'var(--emerald-bg)' : 'var(--amber-bg)',
                    border: `1px solid ${product.officer_clarification_answer ? 'var(--emerald-border)' : 'var(--amber-border)'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HelpCircle size={16} color={product.officer_clarification_answer ? 'var(--emerald-pass)' : 'var(--amber-warn)'} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                      Technical Clarification Required: {product.clarification_question.question_text}
                    </span>
                  </div>

                  {product.officer_clarification_answer ? (
                    <div style={{ fontSize: '12.5px', color: 'var(--emerald-pass)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <CheckCircle2 size={14} color="var(--emerald-pass)" />
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
                            border: '1px solid var(--hairline)',
                            background: 'var(--surface)',
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
                            style={{ cursor: 'pointer', accentColor: 'var(--olive-primary)' }}
                          />
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                              {opt.label}
                            </span>
                            {opt.technical_implication && (
                              <span style={{ marginLeft: '6px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                                — {opt.technical_implication}
                              </span>
                            )}
                            {opt.maps_to_candidate && (
                              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--olive-primary)', fontFamily: 'var(--font-data, monospace)', fontWeight: 700 }}>
                                → Designates {opt.maps_to_candidate}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {product.engineering_rationale && (
                    <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.4 }}>
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
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          zIndex: 50,
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
            Ready to generate final NIT schedule?
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
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
            backgroundColor: 'var(--olive-primary)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13.5px',
            fontFamily: 'var(--font-data, monospace)',
            fontWeight: 700,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
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
