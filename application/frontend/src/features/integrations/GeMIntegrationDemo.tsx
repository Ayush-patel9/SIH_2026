import React, { useState } from 'react';

interface GeMProduct {
  id: string;
  title: string;
  category: string;
  seller: string;
  pricePerUnit: string;
  unit: string;
  minOrder: string;
  claimedStandard: string;
  cmlNumber: string;
  licenseeValid: boolean;
  qcoCompliant: boolean;
  labTested: boolean;
}

const SAMPLE_GEM_PRODUCTS: GeMProduct[] = [
  {
    id: 'gem-prod-01',
    title: 'UltraTech 43 Grade Ordinary Portland Cement (OPC)',
    category: 'Cement & Construction Materials',
    seller: 'UltraTech Cement Ltd (GeM Verified Seller #GEM-V-4912)',
    pricePerUnit: '₹345 / bag',
    unit: '50kg Bag',
    minOrder: '500 Bags',
    claimedStandard: 'IS 269:2015',
    cmlNumber: 'CM/L-0123456',
    licenseeValid: true,
    qcoCompliant: true,
    labTested: true,
  },
  {
    id: 'gem-prod-02',
    title: 'Kamdhenu E250 Structural Steel Angles & Channels',
    category: 'Steel & Structural Components',
    seller: 'Kamdhenu Ispat Traders (#GEM-V-8821)',
    pricePerUnit: '₹54,000 / MT',
    unit: 'Metric Ton',
    minOrder: '10 MT',
    claimedStandard: 'IS 2062:2011',
    cmlNumber: 'CM/L-6543210',
    licenseeValid: true,
    qcoCompliant: true,
    labTested: true,
  },
  {
    id: 'gem-prod-03',
    title: 'Standard Grade 43 Cement (Legacy IS 8112 Batch)',
    category: 'Cement & Construction Materials',
    seller: 'Apex Builders Depot (#GEM-V-1109)',
    pricePerUnit: '₹310 / bag',
    unit: '50kg Bag',
    minOrder: '200 Bags',
    claimedStandard: 'IS 8112:1989',
    cmlNumber: 'EXPIRED-2022',
    licenseeValid: false,
    qcoCompliant: false,
    labTested: false,
  },
];

export const GeMIntegrationDemo: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>('gem-prod-01');
  const [procurementQty, setProcurementQty] = useState<number>(500);
  const [simulatedCheckout, setSimulatedCheckout] = useState(false);

  const product = SAMPLE_GEM_PRODUCTS.find((p) => p.id === selectedProductId) || SAMPLE_GEM_PRODUCTS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* GeM Portal Mock Header */}
      <div
        style={{
          background: '#0B3B60',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#FF9933',
              color: '#ffffff',
              fontWeight: 900,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '14px',
              letterSpacing: '1px',
            }}
          >
            GeM
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>
              Government e Marketplace
            </div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>
              Procurement Portal of Government of India · Integrated with ManakAI Statutory Gateway
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-data)',
            }}
          >
            🛡️ ManakAI Live Gatekeeper Active
          </span>
        </div>
      </div>

      {/* Product Selection Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {SAMPLE_GEM_PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`mode-toggle-btn ${selectedProductId === p.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedProductId(p.id);
              setSimulatedCheckout(false);
            }}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            {p.qcoCompliant ? '🟢' : '🔴'} {p.title.split('(')[0]}
          </button>
        ))}
      </div>

      {/* GeM Marketplace Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: '16px' }}>
        {/* Left Pane: GeM Marketplace Item View */}
        <div className="workbench-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span className="section-label" style={{ margin: '0 0 4px 0' }}>{product.category}</span>
              <h3 style={{ fontFamily: 'var(--font-data)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                {product.title}
              </h3>
              <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                Seller: <strong>{product.seller}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: 'var(--surface)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--hairline)',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>UNIT PRICE (INR)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-data)' }}>
                {product.pricePerUnit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>MINIMUM ORDER QTY</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-data)' }}>
                {product.minOrder}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>SELLER CITED STANDARD</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-data)' }}>
                {product.claimedStandard}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>BIS CM/L LICENSE NO.</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-data)' }}>
                {product.cmlNumber}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontFamily: 'var(--font-data)', color: 'var(--ink)' }}>
              Procurement Quantity:
            </label>
            <input
              type="number"
              value={procurementQty}
              onChange={(e) => setProcurementQty(Number(e.target.value))}
              className="auth-input"
              style={{ width: '100px', padding: '6px', fontSize: '12px' }}
            />
            <button
              type="button"
              className="btn-run"
              onClick={() => setSimulatedCheckout(true)}
              style={{
                background: product.qcoCompliant ? 'var(--collapse-cobalt)' : 'var(--error-line)',
                fontSize: '12px',
                padding: '8px 16px',
              }}
            >
              {product.qcoCompliant ? '🛒 Place GeM Direct Purchase Order' : '⛔ Blocked by ManakAI'}
            </button>
          </div>

          {simulatedCheckout && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: product.qcoCompliant ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                border: `1px solid ${product.qcoCompliant ? '#16a34a' : '#dc2626'}`,
                fontSize: '12px',
                fontFamily: 'var(--font-data)',
                color: product.qcoCompliant ? '#15803d' : '#991b1b',
              }}
            >
              {product.qcoCompliant ? (
                <>
                  ✓ <strong>GeM Sanction Order #GEM-SO-2026-8812 Issued!</strong> GFR Rule 144(xi) statutory clearance verified. BIS ISI Mark authenticated via ManakOnline gateway.
                </>
              ) : (
                <>
                  ⛔ <strong>TRANSACTION BLOCKED BY MANAKAI STATUTORY GATEWAY:</strong> This product cites superseded standard ({product.claimedStandard}) and invalid BIS CM/L license. GeM procurement cannot proceed without triggering a CVC Vigilance inquiry.
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Pane: ManakAI Statutory Compliance Widget (Overlay) */}
        <div
          className="workbench-card"
          style={{
            padding: '20px',
            borderLeft: `4px solid ${product.qcoCompliant ? 'var(--emerald-pass)' : 'var(--error-line)'}`,
            background: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'var(--collapse-cobalt)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              MANAKAI
            </span>
            <span className="section-label" style={{ margin: 0 }}>
              STATUTORY COMPLIANCE CLEARANCE WIDGET
            </span>
          </div>

          <h4 style={{ fontFamily: 'var(--font-data)', fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
            {product.qcoCompliant ? '🟢 Statutory Clearance Granted' : '🔴 Statutory Non-Compliance Detected'}
          </h4>

          {/* Verification Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
              <span>{product.qcoCompliant ? '✅' : '❌'}</span>
              <div>
                <strong>Active BIS Standard Check:</strong>{' '}
                {product.qcoCompliant ? `${product.claimedStandard} is ACTIVE` : `${product.claimedStandard} is WITHDRAWN`}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
              <span>{product.licenseeValid ? '✅' : '❌'}</span>
              <div>
                <strong>ManakOnline Manufacturer CM/L License:</strong>{' '}
                {product.licenseeValid ? 'VALID & ACTIVE in LIMS Registry' : 'EXPIRED or INVALID LICENSE'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
              <span>{product.labTested ? '✅' : '❌'}</span>
              <div>
                <strong>BIS NABL Accredited Lab Test Report:</strong>{' '}
                {product.labTested ? 'Passed 28-day compressive test per IS 4031' : 'No valid test certificate on file'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
              <span>{product.qcoCompliant ? '✅' : '❌'}</span>
              <div>
                <strong>Gazette QCO Enforcement Status:</strong>{' '}
                {product.qcoCompliant ? 'Mandatory ISI Marking Order 2024 ENFORCED' : 'Violates Quality Control Order'}
              </div>
            </div>
          </div>

          {/* Legal Defensibility Note */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              fontSize: '11px',
              fontFamily: 'var(--font-prose)',
              color: 'var(--ink-secondary)',
              lineHeight: 1.5,
            }}
          >
            <strong>GFR Rule 144(xi) Audit Guarantee:</strong> All purchases verified through the ManakAI GeM Gatekeeper are cryptographically sealed and immune to retrospective audit disallowances.
          </div>
        </div>
      </div>
    </div>
  );
};
