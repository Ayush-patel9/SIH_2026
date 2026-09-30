import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { StandardDetailResponse } from './types';
import { getStandardDetail } from './tenderAnalysisClient';
import { X, ExternalLink, ShieldCheck, AlertTriangle, FileText, CheckCircle2, Clock, Scale, BookOpen } from 'lucide-react';

interface ISDetailDrawerProps {
  isNumber: string | null;
  onClose: () => void;
  onSelectStandard?: (isNumber: string) => void;
}

export const ISDetailDrawer: React.FC<ISDetailDrawerProps> = ({
  isNumber,
  onClose,
  onSelectStandard,
}) => {
  const [detail, setDetail] = useState<StandardDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNumber) {
      setDetail(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getStandardDetail(isNumber)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isNumber]);

  const drawerBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNumber && drawerBodyRef.current) {
      drawerBodyRef.current.scrollTop = 0;
    }
  }, [isNumber]);

  if (!isNumber) return null;

  return createPortal(
    <>
      {/* Dimmed Blurred Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 20, 40, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9990,
          animation: 'fadeIn 0.18s ease-out',
        }}
      />

      {/* Slide-out Inspector Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '500px',
          maxWidth: '92vw',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--hairline)',
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--olive-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                fontFamily: 'var(--font-data, monospace)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              IS
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', fontWeight: 800 }}>
                BIS Standard Inspector
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-data, monospace)' }}>
                {isNumber}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Close inspector drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div ref={drawerBodyRef} style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              <Clock size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--olive-primary)' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Retrieving standard metadata from BIS repository...</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '4px' }}>Verifying Gazette validity, QCO mandates, and normative test methods.</div>
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-red)', fontSize: '13px' }}>
              <strong>Inspection Error:</strong> {error}
            </div>
          )}

          {detail && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Status & Publication Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor:
                      detail.status === 'ACTIVE'
                        ? 'var(--emerald-bg)'
                        : detail.status === 'WITHDRAWN' || detail.status === 'SUPERSEDED'
                        ? 'var(--error-bg)'
                        : 'var(--amber-bg)',
                    color:
                      detail.status === 'ACTIVE'
                        ? 'var(--emerald-text)'
                        : detail.status === 'WITHDRAWN' || detail.status === 'SUPERSEDED'
                        ? 'var(--error-red)'
                        : 'var(--amber-warn)',
                    border: `1px solid ${
                      detail.status === 'ACTIVE'
                        ? 'var(--emerald-border)'
                        : detail.status === 'WITHDRAWN' || detail.status === 'SUPERSEDED'
                        ? 'var(--error-border)'
                        : 'var(--amber-border)'
                    }`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {detail.status === 'ACTIVE' ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>CURRENT ACTIVE STANDARD</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      <span>{detail.status}</span>
                    </>
                  )}
                </span>

                <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data, monospace)' }}>
                  Published: <strong>{detail.publication_year}</strong> ({detail.edition})
                </span>
              </div>

              {/* Standard Title */}
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', fontWeight: 800, marginBottom: '4px' }}>
                  Full Standard Title
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.35, margin: 0 }}>
                  {detail.title}
                </h3>
              </div>

              {/* Superseded Warning Banner if Withdrawn */}
              {detail.superseded_by && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--error-bg)',
                    border: '1px solid var(--error-border)',
                    color: 'var(--error-red)',
                    fontSize: '12.5px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                    <AlertTriangle size={16} />
                    <span>WITHDRAWN BY BUREAU OF INDIAN STANDARDS</span>
                  </div>
                  <div>
                    This standard has been superseded and replaced by{' '}
                    <strong
                      style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 800 }}
                      onClick={() => onSelectStandard?.(detail.superseded_by!)}
                    >
                      {detail.superseded_by}
                    </strong>
                    . Citing this legacy code in public tenders exposes the tender authority to statutory audit disallowance.
                  </div>
                </div>
              )}

              {/* Quality Control Order Card */}
              {detail.mandatory_qco?.mandatory && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--amber-bg)',
                    border: '1px solid var(--amber-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber-warn)', fontWeight: 800, fontSize: '13px' }}>
                    <ShieldCheck size={18} />
                    <span>MANDATORY QUALITY CONTROL ORDER (QCO)</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.45, fontWeight: 500 }}>
                    Under <strong>{detail.mandatory_qco.order_name}</strong>, no manufacturer or supplier may produce, import, or stock this product without a valid BIS {detail.mandatory_qco.scheme || 'ISI Mark'} License.
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--amber-warn)', fontFamily: 'var(--font-data, monospace)', marginTop: '2px', fontWeight: 700 }}>
                    Gazette Notification Date: {detail.mandatory_qco.gazette_date || 'In force'}
                  </div>
                </div>
              )}

              {/* Direct Official Link Banner */}
              {(detail.is_link || detail.source_ia_url || detail.portal_link) && (
                <a
                  href={detail.is_link || detail.source_ia_url || detail.portal_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    color: 'var(--olive-primary)',
                    textDecoration: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} />
                    <span>Open Official BIS Standard Document</span>
                  </div>
                  <ExternalLink size={14} />
                </a>
              )}

              {/* Statutory Authority & Gazette Citation */}
              {(detail.where_stated || detail.mandatory_qco?.gazette_date || detail.gazette_notification) && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    fontSize: '12px',
                    color: 'var(--ink-secondary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <ShieldCheck size={16} color="var(--olive-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>Statutory Authority & Gazette Citation:</strong>
                    <div style={{ marginTop: '2px', lineHeight: 1.45 }}>
                      {detail.where_stated || `Enacted under Gazette Notification ${detail.gazette_notification || detail.mandatory_qco?.gazette_date || 'under BIS Act 2016'}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Scope Snippet */}
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', fontWeight: 800, marginBottom: '6px' }}>
                  Technical Scope & Application
                </div>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--hairline)',
                    fontSize: '12.5px',
                    lineHeight: 1.55,
                    color: 'var(--ink)',
                  }}
                >
                  {detail.scope_snippet || 'Covers physical and chemical requirements, manufacture, testing and delivery criteria.'}
                </div>
              </div>

              {/* Normative Allied Test Methods */}
              {detail.normative_test_standards && detail.normative_test_standards.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', fontWeight: 800, marginBottom: '6px' }}>
                    Normative Test Methods (Mandatory for NABL Labs)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {detail.normative_test_standards.map((std, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectStandard?.(std)}
                        style={{
                          padding: '6px 11px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-secondary)',
                          border: '1px solid var(--hairline)',
                          color: 'var(--olive-primary)',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-data, monospace)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        title={`Inspect ${std}`}
                      >
                        <span>{std}</span>
                        <ExternalLink size={11} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amendments in Force */}
              {detail.amendments && detail.amendments.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', fontWeight: 800, marginBottom: '6px' }}>
                    Amendments in Force
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {detail.amendments.map((amend, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '12px',
                          color: 'var(--ink-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 500,
                        }}
                      >
                        <CheckCircle2 size={13} color="var(--emerald-pass)" />
                        <span>{amend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid var(--hairline)',
            backgroundColor: 'var(--surface-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontWeight: 600 }}>
            BIS e-Sale & Manakonline Repository
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--olive-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
