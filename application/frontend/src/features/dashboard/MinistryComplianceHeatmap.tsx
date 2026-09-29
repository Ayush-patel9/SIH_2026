/**
 * MinistryComplianceHeatmap.tsx
 * Ministry-level public procurement compliance & statutory audit surveillance table.
 */

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { MinistryComplianceItem, ActivityFeedItem } from './metricsAggregator';

interface MinistryComplianceHeatmapProps {
  complianceList: MinistryComplianceItem[];
  activityFeed: ActivityFeedItem[];
  onSelectMinistry?: (ministryCode: string) => void;
}

export const MinistryComplianceHeatmap: React.FC<MinistryComplianceHeatmapProps> = ({
  complianceList,
  activityFeed,
  onSelectMinistry,
}) => {
  const [activeTab, setActiveTab] = useState<'ministries' | 'feed'>('ministries');

  const getStatusBadge = (status: MinistryComplianceItem['riskStatus']) => {
    switch (status) {
      case 'HIGH_COMPLIANCE':
        return (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '2px',
              backgroundColor: 'rgba(16, 130, 80, 0.1)',
              color: 'var(--emerald-pass)',
              border: '1px solid rgba(16, 130, 80, 0.3)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle2 size={11} />
            <span>HIGH COMPLIANCE</span>
          </span>
        );
      case 'WATCHLIST':
        return (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '2px',
              backgroundColor: 'rgba(224, 152, 43, 0.1)',
              color: 'var(--signal-amber)',
              border: '1px solid rgba(224, 152, 43, 0.3)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertTriangle size={11} />
            <span>WATCHLIST</span>
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '2px',
              backgroundColor: 'rgba(194, 59, 59, 0.1)',
              color: 'var(--error-line)',
              border: '1px solid rgba(194, 59, 59, 0.3)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertOctagon size={11} />
            <span>ELEVATED RISK</span>
          </span>
        );
    }
  };

  const getActivityBadge = (status: ActivityFeedItem['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <span style={{ color: 'var(--emerald-pass)', fontWeight: 600 }}>PASSED</span>;
      case 'ALERT':
        return <span style={{ color: 'var(--error-line)', fontWeight: 600 }}>INTERCEPTED</span>;
      case 'FLAGGED':
        return <span style={{ color: 'var(--signal-amber)', fontWeight: 600 }}>DISPUTED</span>;
    }
  };

  return (
    <div className="workbench-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <div>
          <div className="section-label" style={{ margin: 0 }}>
            MINISTRY-LEVEL COMPLIANCE SURVEILLANCE & VIGILANCE AUDIT
          </div>
          <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Verification fidelity of public procurement tenders against Quality Control Orders (QCOs)
          </div>
        </div>

        {/* Tab switch */}
        <div className="mode-toggle-group">
          <button
            type="button"
            className={`mode-toggle-btn ${activeTab === 'ministries' ? 'active' : ''}`}
            onClick={() => setActiveTab('ministries')}
          >
            Ministry Surveillance Table
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            Live Activity Feed
          </button>
        </div>
      </div>

      {activeTab === 'ministries' ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="legal-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--paper)', borderBottom: '1px solid var(--hairline)' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>MINISTRY / AGENCY</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>DEPARTMENT / DIVISION</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>TENDERS SCREENED</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>COMPLIANT</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>OUTDATED CITATIONS</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>QCO COMPLIANCE</th>
                <th style={{ textAlign: 'center', padding: '8px 10px', fontSize: '11px', color: 'var(--ink-muted)' }}>VIGILANCE STATUS</th>
              </tr>
            </thead>
            <tbody>
              {complianceList.map((m) => (
                <tr
                  key={m.ministryCode}
                  onClick={() => onSelectMinistry && onSelectMinistry(m.ministryCode)}
                  style={{
                    borderBottom: '1px solid var(--hairline)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--paper)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{m.ministry}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: '10px',
                          color: 'var(--ink-muted)',
                          backgroundColor: 'var(--surface)',
                          padding: '1px 4px',
                          borderRadius: '2px',
                        }}
                      >
                        {m.ministryCode}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--ink-secondary)', fontSize: '12px' }}>{m.department}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: '12px' }}>
                    {m.totalTenders.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--emerald-pass)' }}>
                    {m.compliantTenders.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: '12px', color: m.outdatedIntercepted > 20 ? 'var(--error-line)' : 'var(--signal-amber)' }}>
                    {m.outdatedIntercepted}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700 }}>
                    {m.complianceRate.toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {getStatusBadge(m.riskStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activityFeed.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--hairline)',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--collapse-cobalt)',
                  }}
                >
                  {item.isNumber}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-primary)' }}>
                  {item.action}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                  ({item.ministry})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px' }}>
                  {getActivityBadge(item.status)}
                </span>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
