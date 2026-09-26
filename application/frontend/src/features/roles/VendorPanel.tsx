import React from 'react';
import type { StandardsResponse } from '../../types';

const BIS_PORTAL_LINKS: Record<string, { url: string; label: string }> = {
  BIS_ISI_MARK: {
    url: 'https://bis.gov.in/product-certification/scheme-i/',
    label: 'BIS Scheme-I (ISI Mark) Portal',
  },
  BIS_CRS: {
    url: 'https://www.crsbis.in/BIS/index.do',
    label: 'BIS Compulsory Registration Portal (CRS)',
  },
  BIS_HALLMARK: {
    url: 'https://bis.gov.in/hallmarking/hallmark-licence/',
    label: 'BIS Hallmarking Registration Portal',
  },
  VOLUNTARY: {
    url: 'https://bis.gov.in/product-certification/',
    label: 'BIS Product Certification Portal',
  },
};

interface VendorPanelProps {
  data: StandardsResponse;
}

export const VendorPanel: React.FC<VendorPanelProps> = ({ data }) => {
  const primary = data.primary_recommendation;
  const cert = primary?.certification;
  const schemeKey = cert?.scheme || 'VOLUNTARY';
  const portalInfo = BIS_PORTAL_LINKS[schemeKey] || BIS_PORTAL_LINKS.VOLUNTARY;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header: Vendor Certification Gateway */}
      <div
        className="workbench-card"
        style={{
          borderLeft: `4px solid ${cert?.mandatory ? 'var(--signal-amber)' : 'var(--emerald-pass)'}`,
          background: 'linear-gradient(180deg, var(--card-bg) 0%, rgba(224, 152, 43, 0.02) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="concept-status-badge active" style={{ background: 'rgba(224, 152, 43, 0.1)', color: '#92400E' }}>
                🏭 VENDOR & BIDDER COMPLIANCE GATEWAY
              </span>
              <span
                className="concept-status-badge"
                style={{
                  background: cert?.mandatory ? 'rgba(194, 59, 59, 0.1)' : 'rgba(26, 127, 55, 0.1)',
                  color: cert?.mandatory ? '#991B1B' : '#1A7F37',
                  border: `1px solid ${cert?.mandatory ? 'rgba(194, 59, 59, 0.3)' : 'rgba(26, 127, 55, 0.3)'}`,
                }}
              >
                {cert?.mandatory ? '⚖️ MANDATORY QCO ENFORCEMENT' : 'VOLUNTARY STANDARD'}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
              {primary?.is_number}
            </h2>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '15px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              {primary?.title}
            </div>
          </div>

          <div>
            <a
              href={portalInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-run"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                padding: '6px 14px',
              }}
            >
              Apply on {portalInfo.label} ↗
            </a>
          </div>
        </div>

        {/* Scheme & QCO Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '16px',
            padding: '14px',
            background: 'var(--paper)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--hairline)',
          }}
        >
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>CERTIFICATION SCHEME</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              {cert?.scheme.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>QCO ORDER NAME</div>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink)' }}>
              {cert?.qco_order_name || 'General Product Certification Scheme'}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>NOTIFYING MINISTRY</div>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink)' }}>
              {cert?.notifying_ministry || 'Bureau of Indian Standards'}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ margin: '0 0 2px 0' }}>GAZETTE NOTIFICATION REF</div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink)' }}>
              {cert?.qco_gazette_ref || 'Official Gazette of India'}
            </div>
          </div>
        </div>
      </div>

      {/* GeM Portal Bid Eligibility Advisory */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--collapse-cobalt)' }}>
        <div className="section-label" style={{ margin: '0 0 6px 0' }}>
          GOVERNMENT E-MARKETPLACE (GeM) & CPPP BID ELIGIBILITY
        </div>
        <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
          Under Ministry of Finance Public Procurement (Preference to Make in India) and BIS Act Section 16,
          bidders listing products under <strong>{primary.is_number}</strong> must upload their valid BIS CM/L License
          or CRS Registration certificate on GeM. Bids submitted without an active BIS license will face automatic technical rejection.
        </div>
      </div>

      {/* Test Certificates Vendor Must Submit */}
      <div className="workbench-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div className="section-label" style={{ margin: 0 }}>
              REQUIRED NABL LAB TEST CERTIFICATES & ALLIED STANDARDS
            </div>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Vendors must obtain NABL-accredited test reports for each of the following test methods before bidding.
            </div>
          </div>
          <span className="concept-status-badge active">{data.allied_standards.length} Test Protocols</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-data)', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--hairline)', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Test Code / IS</th>
                <th style={{ padding: '8px 10px' }}>Test Method Description</th>
                <th style={{ padding: '8px 10px' }}>Classification</th>
                <th style={{ padding: '8px 10px' }}>Vendor Action</th>
              </tr>
            </thead>
            <tbody>
              {data.allied_standards.map((std, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{std.is_number}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-prose)', color: 'var(--ink-secondary)' }}>{std.title}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--paper)', borderRadius: '2px' }}>
                      {std.relation_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-prose)', color: 'var(--ink)', fontSize: '12px' }}>
                    Attach valid NABL test certificate with batch test values.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Self-Checklist */}
      <div className="workbench-card">
        <div className="section-label" style={{ marginBottom: '10px' }}>
          VENDOR BID PREPARATION COMPLIANCE CHECKLIST
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.compliance_checklist.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--paper)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${item.status === 'PASS' ? 'var(--emerald-pass)' : 'var(--signal-amber)'}`,
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', fontWeight: 600 }}>
                  {item.item}
                </div>
                <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Requirement: {item.action_required}
                </div>
              </div>
              <span className={`concept-status-badge ${item.status === 'PASS' ? 'active' : ''}`}>
                {item.status === 'PASS' ? 'MANDATORY DOCUMENT' : 'CONDITIONAL'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
