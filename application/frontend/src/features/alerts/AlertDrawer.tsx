import React, { useState, useEffect } from 'react';
import { AlertStore } from './alertStore';
import type { AlertWithRead } from './alertStore';
import { formatDeadlineBadge } from './deadlineUtils';
import type { CitationSeverity } from '../../types';

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTender?: (tenderId: string) => void;
}

type FilterTab = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'UNREAD';

export const AlertDrawer: React.FC<AlertDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTender,
}) => {
  const [alerts, setAlerts] = useState<AlertWithRead[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  useEffect(() => {
    setAlerts(AlertStore.getAll());
    const unsubscribe = AlertStore.subscribe(() => {
      setAlerts(AlertStore.getAll());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleAcknowledge = (alertId: string) => {
    AlertStore.acknowledge(alertId);
  };

  const handleMarkAllRead = () => {
    AlertStore.markAllAsRead();
  };

  const handleSimulatePush = () => {
    AlertStore.simulateNewGazetteAlert();
  };

  // Filter logic
  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'UNREAD') return !alert._read;
    if (activeFilter === 'CRITICAL') return alert.severity === 'CRITICAL';
    if (activeFilter === 'HIGH') return alert.severity === 'HIGH';
    if (activeFilter === 'MEDIUM') return alert.severity === 'MEDIUM' || alert.severity === 'LOW';
    return true;
  });

  const unreadCount = alerts.filter((a) => !a._read).length;

  const getSeverityStyle = (severity: CitationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'var(--error-line)',
          bg: '#FEF2F2',
          badgeBg: '#FEE2E2',
          color: 'var(--error-line)',
          icon: '🔴',
        };
      case 'HIGH':
        return {
          border: 'var(--signal-amber)',
          bg: '#FFFBEB',
          badgeBg: '#FEF3C7',
          color: '#B45309',
          icon: '⚠️',
        };
      case 'MEDIUM':
        return {
          border: 'var(--superposition-violet)',
          bg: '#FAF5FF',
          badgeBg: '#F3E8FF',
          color: 'var(--superposition-violet)',
          icon: '🔔',
        };
      case 'LOW':
      default:
        return {
          border: 'var(--collapse-cobalt)',
          bg: '#EFF6FF',
          badgeBg: '#DBEAFE',
          color: 'var(--collapse-cobalt)',
          icon: '📋',
        };
    }
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(13, 15, 20, 0.65)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--surface)',
          height: '100%',
          boxShadow: '-6px 0 28px rgba(0, 0, 0, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
          animation: 'auth-card-in 0.22s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--hairline)',
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="section-label" style={{ margin: '0 0 2px 0' }}>
                BIS GAZETTE COMPLIANCE FEED
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-prose)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Proactive Staleness Alerts</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'var(--error-line)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} UNREAD
                  </span>
                )}
              </h2>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '13px' }}
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>

          {/* Quick Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="palette" style={{ margin: 0 }}>
              {(['ALL', 'UNREAD', 'CRITICAL', 'HIGH', 'MEDIUM'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`palette-btn ${activeFilter === tab ? 'selected' : ''}`}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => setActiveFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={handleSimulatePush}
                title="Simulate receiving a new gazette notice via backend pipeline"
              >
                + Push Demo
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={handleMarkAllRead}
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts List Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--paper)',
          }}
        >
          {filteredAlerts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--ink-muted)',
                background: 'var(--surface)',
                border: '1px dashed var(--hairline)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
              <strong style={{ fontFamily: 'var(--font-prose)', color: 'var(--ink)' }}>
                No active alerts in this category
              </strong>
              <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--ink-secondary)' }}>
                All cited procurement standards are current with the official Gazette of India repository.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const sev = getSeverityStyle(alert.severity);
              const deadlineBadge = formatDeadlineBadge(alert.deadline);

              return (
                <div
                  key={alert.alert_id}
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${alert._read ? 'var(--hairline)' : sev.border}`,
                    borderLeft: `4px solid ${sev.border}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: alert._read ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                    opacity: alert._read ? 0.85 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Alert Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: sev.badgeBg,
                          color: sev.color,
                          fontFamily: 'var(--font-data)',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        <span>{sev.icon}</span>
                        <span>{alert.severity}</span>
                      </span>

                      <span
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: '11px',
                          color: 'var(--ink-secondary)',
                        }}
                      >
                        {alert.alert_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: '11px',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {formatTimeAgo(alert.timestamp)}
                      </span>

                      {!alert._read && (
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: sev.color,
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Standard & Event Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge-code" style={{ fontSize: '13px', fontWeight: 700 }}>
                        {alert.affected_standard.is_number}
                      </span>
                      {alert.affected_standard.replacement && (
                        <span
                          style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: '11px',
                            color: 'var(--collapse-cobalt)',
                            fontWeight: 600,
                          }}
                        >
                          ➔ Superseded by {alert.affected_standard.replacement}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-prose)',
                        fontSize: '13px',
                        color: 'var(--ink)',
                        lineHeight: '1.45',
                        margin: 0,
                      }}
                    >
                      {alert.affected_standard.event}
                    </p>
                  </div>

                  {/* Affected Tenders Tag Chips */}
                  {alert.affected_tenders && alert.affected_tenders.length > 0 && (
                    <div style={{ background: 'var(--paper)', padding: '8px 10px', borderRadius: '4px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: '10px',
                          color: 'var(--ink-secondary)',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Active Procurement Tenders Impacted ({alert.affected_tenders.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {alert.affected_tenders.map((tender, tidx) => (
                          <button
                            key={tidx}
                            type="button"
                            onClick={() => onSelectTender && onSelectTender(tender.tender_id)}
                            className="badge-code"
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid var(--hairline)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px',
                              fontSize: '11px',
                            }}
                            title={`Click to inspect ${tender.tender_id} in matrix`}
                          >
                            <strong>{tender.tender_id}</strong>
                            <span style={{ color: 'var(--ink-muted)' }}>({tender.ministry})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Action Callout */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--ink-secondary)',
                      background: '#FFFFFF',
                      border: '1px solid var(--hairline)',
                      borderLeft: '3px solid var(--collapse-cobalt)',
                      padding: '8px 10px',
                      borderRadius: '2px',
                    }}
                  >
                    <strong style={{ color: 'var(--collapse-cobalt)', fontFamily: 'var(--font-data)', fontSize: '11px' }}>
                      ACTION MANDATE:{' '}
                    </strong>
                    {alert.recommended_action}
                  </div>

                  {/* Footer: Deadline Countdown & Acknowledge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--hairline)',
                      marginTop: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: deadlineBadge.color,
                      }}
                    >
                      {deadlineBadge.text}
                    </span>

                    <button
                      type="button"
                      disabled={alert._read}
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      className="btn-secondary"
                      style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-data)',
                        color: alert._read ? 'var(--ink-muted)' : 'var(--collapse-cobalt)',
                        borderColor: alert._read ? 'var(--hairline)' : 'var(--collapse-cobalt)',
                      }}
                    >
                      {alert._read ? '✓ Acknowledged' : '✓ Acknowledge'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
