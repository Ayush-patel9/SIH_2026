import React, { useState } from 'react';
import { GeMIntegrationDemo } from './GeMIntegrationDemo';
import { CPPPTenderChecker } from './CPPPTenderChecker';
import { ShoppingCart, Building2, Network } from 'lucide-react';

export const IntegrationSandboxView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gem' | 'cppp' | 'architecture'>('gem');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="concept-status-badge active">NATIONAL E-PROCUREMENT INTEGRATION</span>
          <span className="section-label" style={{ margin: 0 }}>API GATEWAY SANDBOX</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px' }}>
          GeM & CPPP E-Procurement Gateway Sandbox
        </h2>
        <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
          Experience how ManakAI embeds directly into Government e-Marketplace (GeM) and the Central Public Procurement Portal (CPPP) as an automated statutory gatekeeper, blocking non-compliant bids and outdated standards in real-time.
        </p>

        {/* Sub-tab switcher */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`mode-toggle-btn ${activeTab === 'gem' ? 'active' : ''}`}
            onClick={() => setActiveTab('gem')}
            style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ShoppingCart size={13} />
            <span>GeM Marketplace Buyer Widget</span>
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeTab === 'cppp' ? 'active' : ''}`}
            onClick={() => setActiveTab('cppp')}
            style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Building2 size={13} />
            <span>CPPP Pre-Tender Validator</span>
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
            style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Network size={13} />
            <span>National Gateway Architecture</span>
          </button>
        </div>
      </div>

      {/* Tab 1: GeM Marketplace Demo */}
      {activeTab === 'gem' && <GeMIntegrationDemo />}

      {/* Tab 2: CPPP Tender Checker */}
      {activeTab === 'cppp' && <CPPPTenderChecker />}

      {/* Tab 3: Interactive Architecture Diagram */}
      {activeTab === 'architecture' && (
        <div className="workbench-card" style={{ padding: '24px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>
            NATIONAL E-PROCUREMENT STANDARDS GATEWAY ARCHITECTURE
          </div>

          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <svg
              viewBox="0 0 900 360"
              style={{ width: '100%', maxWidth: '850px', height: 'auto', margin: '0 auto', display: 'block' }}
            >
              {/* E-Procurement Systems */}
              <rect x="40" y="30" width="220" height="90" rx="8" fill="#1A365D" stroke="#3182CE" strokeWidth="2" />
              <text x="150" y="65" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="14" fontFamily="sans-serif">
                GeM Marketplace
              </text>
              <text x="150" y="85" textAnchor="middle" fill="#CBD5E0" fontSize="11" fontFamily="sans-serif">
                Direct Purchase & Bidding API
              </text>
              <text x="150" y="102" textAnchor="middle" fill="#90CDF4" fontSize="10" fontFamily="sans-serif">
                POST /api/v1/gem/verify-bid
              </text>

              <rect x="40" y="160" width="220" height="90" rx="8" fill="#2D3748" stroke="#4A5568" strokeWidth="2" />
              <text x="150" y="195" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="14" fontFamily="sans-serif">
                CPPP eProcure (NIC)
              </text>
              <text x="150" y="215" textAnchor="middle" fill="#CBD5E0" fontSize="11" fontFamily="sans-serif">
                NIT Pre-Publication Stream
              </text>
              <text x="150" y="232" textAnchor="middle" fill="#A0AEC0" fontSize="10" fontFamily="sans-serif">
                POST /api/v1/cppp/precheck
              </text>

              {/* Arrow Connectors Left to Middle */}
              <path d="M 260 75 L 340 140" stroke="#3182CE" strokeWidth="2" strokeDasharray="4 4" fill="none" />
              <path d="M 260 205 L 340 160" stroke="#4A5568" strokeWidth="2" strokeDasharray="4 4" fill="none" />

              {/* Central ManakAI Engine */}
              <rect x="340" y="80" width="240" height="140" rx="10" fill="#0F172A" stroke="#3B82F6" strokeWidth="3" />
              <text x="460" y="115" textAnchor="middle" fill="#60A5FA" fontWeight="900" fontSize="16" fontFamily="sans-serif">
                ManakAI Gateway
              </text>
              <text x="460" y="135" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontFamily="sans-serif">
                GraphRAG + Staleness Engine
              </text>
              <text x="460" y="155" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                • 14 Guaranteed Fields
              </text>
              <text x="460" y="175" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
                • SHA-256 Audit Sealed
              </text>
              <text x="460" y="195" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="sans-serif">
                &lt; 250ms Response Latency
              </text>

              {/* Arrow Connectors Middle to Right */}
              <path d="M 580 130 L 660 75" stroke="#10B981" strokeWidth="2" fill="none" />
              <path d="M 580 160 L 660 175" stroke="#F59E0B" strokeWidth="2" fill="none" />
              <path d="M 580 180 L 660 275" stroke="#8B5CF6" strokeWidth="2" fill="none" />

              {/* Right Authorities */}
              <rect x="660" y="30" width="200" height="70" rx="8" fill="#064E3B" stroke="#059669" strokeWidth="2" />
              <text x="760" y="60" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="13" fontFamily="sans-serif">
                BIS ManakOnline
              </text>
              <text x="760" y="80" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontFamily="sans-serif">
                Live Licensee & CM/L Registry
              </text>

              <rect x="660" y="130" width="200" height="70" rx="8" fill="#78350F" stroke="#D97706" strokeWidth="2" />
              <text x="760" y="160" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="13" fontFamily="sans-serif">
                LIMS Lab Network
              </text>
              <text x="760" y="180" textAnchor="middle" fill="#FDE68A" fontSize="10" fontFamily="sans-serif">
                NABL Accredited Test Reports
              </text>

              <rect x="660" y="230" width="200" height="70" rx="8" fill="#4C1D95" stroke="#7C3AED" strokeWidth="2" />
              <text x="760" y="260" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="13" fontFamily="sans-serif">
                CVC Audit Ledger
              </text>
              <text x="760" y="280" textAnchor="middle" fill="#DDD6FE" fontSize="10" fontFamily="sans-serif">
                Immutable Statutory Trail
              </text>
            </svg>
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              fontFamily: 'var(--font-prose)',
              fontSize: '12px',
              color: 'var(--ink-secondary)',
            }}
          >
            <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
              <strong style={{ color: 'var(--ink)' }}>1. Pre-Tender Interception:</strong> Blocks obsolete standards at CPPP NIT draft time before public publication.
            </div>
            <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
              <strong style={{ color: 'var(--ink)' }}>2. Real-Time GeM Gatekeeping:</strong> Automatically cross-references seller CM/L licenses against BIS ManakOnline registry.
            </div>
            <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
              <strong style={{ color: 'var(--ink)' }}>3. Cryptographic CVC Defense:</strong> Every tender decision is backed by a verifiable SHA-256 hash snapshot.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
