import React, { useEffect, useState } from 'react';
import type { StandardDetailResponse } from './types';
import { getStandardDetail } from './tenderAnalysisClient';
import { X, ExternalLink, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

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

  if (!isNumber) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '460px',
        maxWidth: '92vw',
        backgroundColor: '#FFFFFF',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.16)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #E5E0D4',
        animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid #E5E0D4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FAF8F3',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              fontFamily: 'var(--font-data, monospace)',
            }}
          >
            IS
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6E7A68', fontWeight: 700 }}>
              BIS Standard Quick Inspector
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1C2419', fontFamily: 'var(--font-data, monospace)' }}>
              {isNumber}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6E7A68',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close drawer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6E7A68' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Retrieving standard metadata from BIS catalog...</div>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FDF2F0', border: '1px solid #F7CDC6', color: '#BA3A2A', fontSize: '13px' }}>
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
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor:
                    detail.status === 'ACTIVE'
                      ? 'rgba(45, 106, 79, 0.12)'
                      : detail.status === 'WITHDRAWN' || detail.status === 'SUPERSEDED'
                      ? 'rgba(186, 58, 42, 0.12)'
                      : 'rgba(217, 119, 6, 0.12)',
                  color:
                    detail.status === 'ACTIVE'
                      ? '#2D6A4F'
                      : detail.status === 'WITHDRAWN' || detail.status === 'SUPERSEDED'
                      ? '#BA3A2A'
                      : '#B45309',
                  border: `1px solid ${
                    detail.status === 'ACTIVE'
                      ? 'rgba(45, 106, 79, 0.3)'
                      : detail.status === 'WITHDRAWN' || detail.status === 'SUPERSEDED'
                      ? 'rgba(186, 58, 42, 0.3)'
                      : 'rgba(217, 119, 6, 0.3)'
                  }`,
                }}
              >
                {detail.status === 'ACTIVE' ? '🟢 CURRENT ACTIVE STANDARD' : detail.status}
              </span>

              <span style={{ fontSize: '12px', color: '#6E7A68', fontFamily: 'var(--font-data, monospace)' }}>
                Published: <strong>{detail.publication_year}</strong> ({detail.edition})
              </span>
            </div>

            {/* Standard Title */}
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6E7A68', fontWeight: 700, marginBottom: '4px' }}>
                Full Standard Title
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C2419', lineHeight: 1.4, margin: 0 }}>
                {detail.title}
              </h3>
            </div>

            {/* Superseded Warning Banner if Withdrawn */}
            {detail.superseded_by && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FDF2F0',
                  border: '1px solid #F7CDC6',
                  color: '#BA3A2A',
                  fontSize: '12.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <AlertTriangle size={16} />
                  <span>WITHDRAWN BY BUREAU OF INDIAN STANDARDS</span>
                </div>
                <div>
                  This standard has been superseded and replaced by{' '}
                  <strong
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
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
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: 700, fontSize: '13px' }}>
                  <ShieldCheck size={18} />
                  <span>MANDATORY QUALITY CONTROL ORDER (QCO)</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#78350F', lineHeight: 1.45 }}>
                  Under <strong>{detail.mandatory_qco.order_name}</strong>, no manufacturer or supplier may produce, import, or stock this product without a valid BIS {detail.mandatory_qco.scheme || 'ISI Mark'} License.
                </div>
                <div style={{ fontSize: '11.5px', color: '#92400E', fontFamily: 'var(--font-data, monospace)', marginTop: '2px' }}>
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
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={15} />
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
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  fontSize: '12px',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={16} color="#B45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#78350F' }}>Statutory Authority & Gazette Citation:</strong>
                  <div style={{ marginTop: '2px', lineHeight: 1.45 }}>
                    {detail.where_stated || `Enacted under Gazette Notification ${detail.gazette_notification || detail.mandatory_qco?.gazette_date || 'under BIS Act 2016'}`}
                  </div>
                </div>
              </div>
            )}

            {/* Scope Snippet */}
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6E7A68', fontWeight: 700, marginBottom: '6px' }}>
                Technical Scope & Application
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #E5E0D4',
                  fontSize: '12.5px',
                  lineHeight: 1.55,
                  color: '#2E382A',
                }}
              >
                {detail.scope_snippet || 'Covers physical and chemical requirements, manufacture, testing and delivery criteria.'}
              </div>
            </div>

            {/* Normative Allied Test Methods */}
            {detail.normative_test_standards && detail.normative_test_standards.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6E7A68', fontWeight: 700, marginBottom: '6px' }}>
                  Normative Test Methods (Mandatory for NABL Labs)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {detail.normative_test_standards.map((std, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectStandard?.(std)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1D4ED8',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-data, monospace)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
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
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6E7A68', fontWeight: 700, marginBottom: '6px' }}>
                  Amendments in Force
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {detail.amendments.map((amend, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '12px',
                        color: '#44503E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={13} color="#2D6A4F" />
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
          padding: '14px 20px',
          borderTop: '1px solid #E5E0D4',
          backgroundColor: '#FAF8F3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: '#6E7A68' }}>
          BIS e-Sale & Manakonline Repository
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: '#36452F',
            color: '#FFFFFF',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
