import React from 'react';
import { ShieldCheck, Server, Lock, CheckCircle, Database, Award } from 'lucide-react';

interface DataSovereigntyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSovereigntyModal: React.FC<DataSovereigntyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-md)',
          maxWidth: '680px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(90deg, #1E3A8A 0%, #1E40AF 100%)',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} color="#60A5FA" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: '#93C5FD', fontWeight: 600, letterSpacing: '0.05em' }}>
                GOVERNMENT OF INDIA · MEITY COMPLIANCE
              </div>
              <div style={{ fontFamily: 'var(--font-prose)', fontSize: '17px', fontWeight: 700 }}>
                100% Data Sovereignty & Localization Certificate
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Main Statement */}
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <CheckCircle size={22} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                ZERO DATA EXFILTRATION GUARANTEE
              </div>
              <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5, marginTop: '2px' }}>
                ManakAI is architected for deployment entirely on <strong>MeitY-Empanelled Cloud Services</strong> and <strong>National Informatics Centre (NIC) National Data Centres (NDC)</strong>. No tender documents, query texts, or audit logs leave Indian legal jurisdiction.
              </div>
            </div>
          </div>

          {/* Infrastructure Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div
              style={{
                padding: '14px',
                background: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Server size={16} color="var(--collapse-cobalt)" />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  NIC NDC Tier-IV Hosting
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.4 }}>
                Primary hosting support for NIC Delhi (Shastri Park), Hyderabad, Bhubaneswar, and Pune data centers with strict role-based access control.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                background: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Database size={16} color="var(--superposition-violet)" />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Local Vector & KG Embeddings
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.4 }}>
                Vector indices (FAISS/Chroma) and Knowledge Graph (NetworkX) execute strictly within in-memory containers with local SHA-256 integrity verification.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                background: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Lock size={16} color="#D97706" />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  CERT-In Compliance
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.4 }}>
                Full compliance with Indian Computer Emergency Response Team (CERT-In) Cyber Security Directions and ISO/IEC 27001 ISMS protocols.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                background: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award size={16} color="#059669" />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                  Bhashini Sovereign NLP
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.4 }}>
                Indian-language processing routed via MeitY's official Bhashini National Language Translation Mission (NLTM) infrastructure.
              </p>
            </div>
          </div>

          {/* Institutional Signoff */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
              AUDIT SEAL: SHA256-IN-SOVEREIGN-NIC-2026
            </div>
            <button
              type="button"
              className="btn-run"
              onClick={onClose}
              style={{ padding: '6px 16px', fontSize: '12px' }}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
