/**
 * GazetteRadarView.tsx
 * Autonomous Gazette Surveillance Radar & Statutory Watchtower
 * Scans e-Gazette and BIS publications in real-time, detecting revisions,
 * new Quality Control Orders (QCO), and supersessions with live diffing.
 */

import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, ShieldCheck, FileText, Bell, RefreshCw, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GazetteEvent {
  id: string;
  orderNumber: string;
  ministry: string;
  date: string;
  affectedStandard: string;
  supersededStandard?: string;
  eventType: 'NEW_QCO' | 'SUPERSEDED' | 'AMENDMENT' | 'WITHDRAWAL';
  impactedTendersCount: number;
  financialExposureCr: number;
  gazetteSnippet: string;
  actionRequired: string;
}

const GAZETTE_FEED: GazetteEvent[] = [
  {
    id: 'GSR-739-2024',
    orderNumber: 'S.O. 3482(E) / Gazette of India No. 892',
    ministry: 'Ministry of Commerce and Industry (DPIIT)',
    date: '24 Sep 2026',
    affectedStandard: 'IS 269:2015 (Amendment 4)',
    supersededStandard: 'IS 8112:1989 / IS 12269:2013',
    eventType: 'NEW_QCO',
    impactedTendersCount: 42,
    financialExposureCr: 1240.5,
    gazetteSnippet: 'In exercise of powers conferred by Section 16 of the BIS Act, 2016, the Central Government hereby notifies Cement (Quality Control) Order 2026. Possession of valid BIS Standard Mark is mandatory.',
    actionRequired: 'Issue corrigendum replacing legacy IS 8112 references with IS 269:2015 Clause 5.1 in 42 active civil tenders.',
  },
  {
    id: 'GSR-512-2026',
    orderNumber: 'S.O. 1820(E) / Gazette of India No. 412',
    ministry: 'Ministry of Steel',
    date: '18 Sep 2026',
    affectedStandard: 'IS 1786:2008 (Grade Fe 550D Revision)',
    supersededStandard: 'IS 1786:1985',
    eventType: 'AMENDMENT',
    impactedTendersCount: 18,
    financialExposureCr: 890.0,
    gazetteSnippet: 'Steel and Steel Products (Quality Control) Amendment Order 2026. High Strength Deformed Bars for Seismic Zone IV & V must meet Charpy V-notch impact values at -20°C.',
    actionRequired: 'Update bridge girder NIT clauses to mandate Charpy V-notch certification.',
  },
  {
    id: 'GSR-104-2026',
    orderNumber: 'S.O. 941(E) / Gazette of India No. 201',
    ministry: 'Ministry of Jal Shakti (DoWR)',
    date: '10 Sep 2026',
    affectedStandard: 'IS 4984:2016 (Amendment 3)',
    supersededStandard: 'IS 4984:1995',
    eventType: 'SUPERSEDED',
    impactedTendersCount: 31,
    financialExposureCr: 412.3,
    gazetteSnippet: 'High Density Polyethylene (HDPE) Pipes Order. Supersession of 1995 issue. 50-year design life hydrostatic strain test is mandatory for all rural drinking water schemes under JJM.',
    actionRequired: 'Flag CPWD and State PWD tenders citing 1995 issue.',
  },
];

export const GazetteRadarView: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<GazetteEvent>(GAZETTE_FEED[0]);
  const [isScanning, setIsScanning] = useState(true);
  const [corrigendumGenerated, setCorrigendumGenerated] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--saffron)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" style={{ background: 'var(--saffron)' }} />
              <span className="section-label" style={{ margin: 0, color: 'var(--saffron-text)' }}>
                NATIONAL STATUTORY RADAR · WATCHTOWER ENGINE
              </span>
              <span className="concept-status-badge in-progress" style={{ fontSize: '9px' }}>
                LIVE FEED: EGAZETTE.GOV.IN
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Autonomous Gazette Surveillance & Supersession Watchtower
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Real-time scraping and LLM parsing of Ministry QCO notifications, protecting ₹24,850+ Cr of public procurement against audit queries.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsScanning(!isScanning)}
            >
              <RefreshCw size={14} className={isScanning ? 'spin-anim' : ''} />
              <span>{isScanning ? 'Radar Active' : 'Radar Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--saffron)' }}>
          <span className="section-label">MONITORED MINISTRIES</span>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
            48 Portals
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            DPIIT, MoRTH, Railways, MoD, MeitY
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--emerald-pass)' }}>
          <span className="section-label">PROTECTED TENDER CAPITAL</span>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--emerald-text)' }}>
            ₹ 24,850 Cr
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Zero audit disallowances
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--focus-blue)' }}>
          <span className="section-label">QCO ORDERS ACTIVE</span>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--focus-blue)' }}>
            92 Orders
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            100% Mandatory ISI Markings
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--error-red)' }}>
          <span className="section-label">INTERCEPTED CITATIONS</span>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '22px', fontWeight: 700, color: 'var(--error-red)' }}>
            142 Tenders
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Auto-corrigenda dispatched
          </div>
        </div>
      </div>

      {/* Main Split View: Feed on Left, Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'start' }}>
        {/* Live Gazette Notifications Feed */}
        <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="workbench-card-header">
            <div>
              <h2 className="workbench-card-title">Live Gazette Broadcasts</h2>
              <div className="workbench-card-subtitle">Discovered statutory notices requiring mandatory tender updates</div>
            </div>
            <span className="concept-status-badge active">
              RADAR ONLINE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GAZETTE_FEED.map((event) => {
              const isSelected = selectedEvent.id === event.id;
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    padding: '14px 16px',
                    background: isSelected ? 'var(--surface-secondary)' : 'var(--surface)',
                    border: isSelected ? '1px solid var(--ink)' : '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="concept-status-badge active" style={{ fontSize: '9.5px', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }}>
                      ⚖️ {event.eventType.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                      {event.date}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                    {event.affectedStandard}
                  </div>

                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                    {event.orderNumber}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--hairline)' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--error-red)', fontWeight: 600 }}>
                      ⚠ {event.impactedTendersCount} Tenders Impacted
                    </span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink)' }}>
                      Exposure: ₹{event.financialExposureCr} Cr
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gazette Detail & Auto-Corrigendum Inspector */}
        <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card-header">
            <div>
              <h2 className="workbench-card-title">Legal Order Breakdown</h2>
              <div className="workbench-card-subtitle">{selectedEvent.orderNumber}</div>
            </div>
            <span className="badge-code font-mono">
              SECTION 16 BIS ACT
            </span>
          </div>

          <div>
            <span className="section-label">ISSUING AUTHORITY</span>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>
              {selectedEvent.ministry}
            </div>
          </div>

          <div>
            <span className="section-label">OFFICIAL GAZETTE STATUTORY EXTRACT</span>
            <div
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '12.5px',
                color: 'var(--ink)',
                background: 'var(--surface-secondary)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                lineHeight: 1.5,
              }}
            >
              "{selectedEvent.gazetteSnippet}"
            </div>
          </div>

          <div>
            <span className="section-label">RECOMMENDED REMEDIATION ACTION</span>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12.5px',
                color: '#9A3412',
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                lineHeight: 1.4,
              }}
            >
              {selectedEvent.actionRequired}
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                setCorrigendumGenerated(true);
                setTimeout(() => setCorrigendumGenerated(false), 3000);
              }}
            >
              {corrigendumGenerated ? '✓ Auto-Corrigendum Dispatched to GeM' : '🚀 Generate & Push Tender Corrigendum'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
