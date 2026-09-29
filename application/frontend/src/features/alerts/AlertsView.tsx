import React, { useState, useEffect } from 'react';
import { Zap, Bell, BarChart3, FileText, Check } from 'lucide-react';
import { AlertStore } from './alertStore';
import type { AlertWithRead } from './alertStore';
import { TenderImpactMatrix } from './TenderImpactMatrix';
import { StalenessRiskBanner } from './StalenessRiskBanner';
import { formatDeadlineBadge } from './deadlineUtils';
import type { StandardsResponse, StalenessRiskLevel } from '../../types';

interface AlertsViewProps {
  currentData?: StandardsResponse | null;
}

type ViewTab = 'matrix' | 'alerts_feed' | 'risk_banner_preview';

export const AlertsView: React.FC<AlertsViewProps> = ({ currentData }) => {
  const [alerts, setAlerts] = useState<AlertWithRead[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>('matrix');
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [simulatedNotice, setSimulatedNotice] = useState<AlertWithRead | null>(null);
  const [demoRiskLevel, setDemoRiskLevel] = useState<StalenessRiskLevel>('CRITICAL');

  useEffect(() => {
    setAlerts(AlertStore.getAll());
    const unsubscribe = AlertStore.subscribe(() => {
      setAlerts(AlertStore.getAll());
    });
    return unsubscribe;
  }, []);

  const handleSimulatePush = () => {
    const newAlert = AlertStore.simulateNewGazetteAlert();
    setSimulatedNotice(newAlert);
    setTimeout(() => setSimulatedNotice(null), 6000);
  };

  const handleResetStore = () => {
    AlertStore.resetToMock();
    setSimulatedNotice(null);
  };

  const handleAcknowledge = (alertId: string) => {
    AlertStore.acknowledge(alertId);
  };

  const unreadCount = alerts.filter((a) => !a._read).length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a._read).length;
  const totalTendersImpacted = new Set(
    alerts.flatMap((a) => (a.affected_tenders || []).map((t) => t.tender_id))
  ).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner with Push Simulator & Live Sync Status */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderLeft: '4px solid var(--collapse-cobalt)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                GAZETTE SURVEILLANCE ENGINE (FEATURE 04)
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', margin: '4px 0 2px 0' }}>
              Proactive Staleness & Supersession Engine
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Live statutory surveillance preventing outdated IS citations in high-value public procurement tenders.
            </p>
          </div>

          {/* Action Simulation Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-run"
              onClick={handleSimulatePush}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Zap size={14} />
              <span>Simulate Gazette Notification Push</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetStore}
              title="Reset alerts to default mock scenario"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Live Push Toast Banner */}
        {simulatedNotice && (
          <div
            className="auth-banner"
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'auth-card-in 0.2s ease both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={14} style={{ color: 'var(--collapse-cobalt)' }} />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--collapse-cobalt)' }}>
                LIVE GAZETTE EVENT RECEIVED:
              </span>
              <span style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink)' }}>
                {simulatedNotice.affected_standard.is_number} — {simulatedNotice.affected_standard.event}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
              Injected into AlertStore
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="workbench-card" style={{ padding: '14px 18px' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px' }}>TOTAL MONITORED ALERTS</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>
              {alerts.length}
            </span>
            {unreadCount > 0 && (
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--signal-amber)', fontWeight: 600 }}>
                ({unreadCount} unread)
              </span>
            )}
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--error-line)' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--error-line)' }}>
            CRITICAL SUPERSEDED / WITHDRAWN
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '24px', fontWeight: 700, color: 'var(--error-line)' }}>
              {alerts.filter((a) => a.severity === 'CRITICAL').length}
            </span>
            {criticalCount > 0 && (
              <span className="badge-status withdrawn" style={{ fontSize: '10px', padding: '1px 6px' }}>
                {criticalCount} ACTION REQ
              </span>
            )}
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--signal-amber)' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: '#B45309' }}>
            ACTIVE TENDERS AT RISK
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '24px', fontWeight: 700, color: '#B45309' }}>
              {totalTendersImpacted}
            </span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
              Across 5 Ministries
            </span>
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--emerald-pass)' }}>
          <div className="section-label" style={{ margin: 0, fontSize: '10px', color: 'var(--emerald-pass)' }}>
            SURVEILLANCE STATUS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 700, color: 'var(--emerald-pass)' }}>
              ACTIVE & SYNCED
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px' }}>
            Gazette Polling: Real-Time
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="palette" style={{ margin: 0 }}>
        <button
          type="button"
          className={`palette-btn ${activeTab === 'matrix' ? 'selected' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('matrix')}
        >
          <BarChart3 size={13} />
          <span>Active Tender Impact Matrix</span>
        </button>
        <button
          type="button"
          className={`palette-btn ${activeTab === 'alerts_feed' ? 'selected' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('alerts_feed')}
        >
          <Bell size={13} />
          <span>Gazette Alerts Feed ({alerts.length})</span>
        </button>
        <button
          type="button"
          className={`palette-btn ${activeTab === 'risk_banner_preview' ? 'selected' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('risk_banner_preview')}
        >
          <FileText size={13} />
          <span>Staleness Risk Banner Spec Preview</span>
        </button>
      </div>

      {/* Tab 1: Tender Impact Matrix */}
      {activeTab === 'matrix' && (
        <TenderImpactMatrix
          alerts={alerts}
          selectedTenderId={selectedTenderId}
          onSelectTender={(tId) => setSelectedTenderId(tId)}
        />
      )}

      {/* Tab 2: Gazette Alerts Feed */}
      {activeTab === 'alerts_feed' && (
        <div className="workbench-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div className="section-label" style={{ margin: 0 }}>
                STATUTORY NOTIFICATION FEED
              </div>
              <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                Gazette Notifications & Quality Control Orders
              </h3>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => AlertStore.markAllAsRead()}
            >
              Mark All as Read
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert) => {
              const deadlineInfo = formatDeadlineBadge(alert.deadline);
              const isCrit = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.alert_id}
                  style={{
                    padding: '16px',
                    background: alert._read ? 'var(--paper)' : '#FFFFFF',
                    border: `1px solid ${alert._read ? 'var(--hairline)' : isCrit ? 'var(--error-line)' : isHigh ? 'var(--signal-amber)' : 'var(--hairline)'}`,
                    borderLeft: `5px solid ${isCrit ? 'var(--error-line)' : isHigh ? 'var(--signal-amber)' : 'var(--collapse-cobalt)'}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="badge-code"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isCrit ? '#FEE2E2' : isHigh ? '#FEF3C7' : '#DBEAFE',
                          color: isCrit ? 'var(--error-line)' : isHigh ? '#B45309' : 'var(--collapse-cobalt)',
                        }}
                      >
                        {alert.severity} • {alert.alert_type}
                      </span>
                      <span className="badge-code font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>
                        {alert.affected_standard.is_number}
                      </span>
                      {alert.affected_standard.replacement && (
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--collapse-cobalt)' }}>
                          ➔ Replacement: {alert.affected_standard.replacement}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        disabled={alert._read}
                        onClick={() => handleAcknowledge(alert.alert_id)}
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '11px' }}
                      >
                        {alert._read ? (
                          <>
                            <Check size={11} style={{ color: 'var(--emerald-pass)' }} /> Acknowledged
                          </>
                        ) : (
                          'Acknowledge'
                        )}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink)', margin: 0 }}>
                    {alert.affected_standard.event}
                  </p>

                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      borderLeft: '3px solid var(--collapse-cobalt)',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: 'var(--ink-secondary)',
                    }}
                  >
                    <strong style={{ color: 'var(--collapse-cobalt)', fontFamily: 'var(--font-data)' }}>
                      RECOMMENDED ACTION:{' '}
                    </strong>
                    {alert.recommended_action}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)' }}>
                        Affected Tenders:
                      </span>
                      {alert.affected_tenders && alert.affected_tenders.length > 0 ? (
                        alert.affected_tenders.map((t, tidx) => (
                          <span key={tidx} className="badge-code" style={{ fontSize: '10px', background: 'var(--paper)' }}>
                            {t.tender_id} ({t.ministry})
                          </span>
                        ))
                      ) : (
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                          None directly cited in saved tenders
                        </span>
                      )}
                    </div>

                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 600, color: deadlineInfo.color }}>
                      {deadlineInfo.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Staleness Risk Banner Preview */}
      {activeTab === 'risk_banner_preview' && (
        <div className="workbench-card" style={{ padding: '20px' }}>
          <div className="section-label" style={{ margin: '0 0 4px 0' }}>
            STANDARDSRESPONSE.STALENESS_RISK SCHEMA COMPONENT
          </div>
          <h3 style={{ fontFamily: 'var(--font-prose)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
            Inline Staleness Risk Banner Previews
          </h3>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', marginBottom: '16px' }}>
            Demonstrating how the <code>staleness_risk</code> object returned by the backend pipeline renders inside recommendation cards for each risk tier.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as StalenessRiskLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`palette-btn ${demoRiskLevel === lvl ? 'selected' : ''}`}
                onClick={() => setDemoRiskLevel(lvl)}
              >
                Risk: {lvl}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="section-label" style={{ margin: '0 0 6px 0' }}>
                CURRENT ACTIVE STANDARD RENDER:
              </div>
              <StalenessRiskBanner
                risk={{
                  risk_level: demoRiskLevel,
                  message:
                    demoRiskLevel === 'CRITICAL'
                      ? 'IS 8112:1989 cited in tender specification has been WITHDRAWN. All requirements consolidated under IS 269:2015.'
                      : demoRiskLevel === 'HIGH'
                      ? 'Amendment 3 gazetted on 2026-09-20 introducing mandatory rib geometry specifications.'
                      : demoRiskLevel === 'MEDIUM'
                      ? 'Technical Committee CED-2 is reviewing IS 456 for the 2026 comprehensive edition.'
                      : demoRiskLevel === 'LOW'
                      ? 'Routine periodic standard surveillance in progress.'
                      : 'All recommended standards are active, gazetted, and compliant with current Quality Control Orders.',
                  standards_under_revision:
                    demoRiskLevel === 'MEDIUM' ? ['IS 456:2000', 'IS 1343:2012'] : [],
                }}
              />
            </div>

            {/* If currentData exists, show its live staleness_risk */}
            {currentData?.staleness_risk && (
              <div>
                <div className="section-label" style={{ margin: '14px 0 6px 0' }}>
                  PAYLOAD FROM ACTIVE DOMAIN FIXTURE ({currentData.primary_recommendation.is_number}):
                </div>
                <StalenessRiskBanner risk={currentData.staleness_risk} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
