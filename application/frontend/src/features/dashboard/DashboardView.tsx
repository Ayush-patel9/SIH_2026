/**
 * DashboardView.tsx
 * Master Dashboard View for Feature 11:
 * Institutional Analytics & Usage Heatmap across Ministries and BIS Standards.
 */

import React, { useState, useEffect } from 'react';
import { AuditStore } from '../audit/auditStore';
import { FeedbackStore } from '../feedback/feedbackStore';
import { computeDashboardMetrics, type DashboardMetrics } from './metricsAggregator';
import { KPICards } from './KPICards';
import { TopStandardsBar } from './TopStandardsBar';
import { ActivityHeatmap } from './ActivityHeatmap';
import { DomainDonutChart } from './DomainDonutChart';
import { MinistryComplianceHeatmap } from './MinistryComplianceHeatmap';
import { ExportReport } from './ExportReport';
import {
  CEMENT_MOCK_DATA,
  STEEL_MOCK_DATA,
  HDPE_MOCK_DATA,
  LED_MOCK_DATA,
  CCTV_MOCK_DATA,
} from '../explainability/mockGraphData';
import type { StandardsResponse } from '../../types';

interface DashboardViewProps {
  onSelectStandard?: (isNumber: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectStandard }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('90d');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => {
    return computeDashboardMetrics(AuditStore.getAll(), FeedbackStore.getAll());
  });

  const refreshMetrics = () => {
    setMetrics(computeDashboardMetrics(AuditStore.getAll(), FeedbackStore.getAll()));
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const seedDemoData = () => {
    const mocks = [
      CEMENT_MOCK_DATA,
      STEEL_MOCK_DATA,
      HDPE_MOCK_DATA,
      LED_MOCK_DATA,
      CCTV_MOCK_DATA,
    ];
    for (let i = 0; i < 20; i++) {
      const base = mocks[i % mocks.length];
      const timestamp = new Date(Date.now() - i * 3.5 * 86400000).toISOString();
      const mockClone = JSON.parse(JSON.stringify(base)) as StandardsResponse;
      mockClone.meta.query_id = `demo-query-${Date.now()}-${i}`;
      mockClone.meta.timestamp = timestamp;
      mockClone.audit_record.query_id = mockClone.meta.query_id;
      mockClone.audit_record.timestamp = timestamp;
      AuditStore.save(mockClone);
    }
    refreshMetrics();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Institutional Top Header Banner */}
      <div
        className="workbench-card"
        style={{
          background: 'linear-gradient(180deg, var(--paper) 0%, var(--surface) 100%)',
          borderLeft: '4px solid var(--collapse-cobalt)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'var(--collapse-cobalt)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  letterSpacing: '0.05em',
                }}
              >
                GOVERNMENT OF INDIA · BIS / CVC
              </span>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                SURVEILLANCE CYCLE: 2026-Q3
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-prose)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink-primary)',
                margin: '8px 0 4px 0',
              }}
            >
              National Standards Intelligence & Procurement Surveillance Dashboard
            </h2>
            <div style={{ fontFamily: 'var(--font-prose)', fontSize: '12px', color: 'var(--ink-secondary)', maxWidth: '780px' }}>
              Real-time client-side aggregation of procurement tender queries, Quality Control Order (QCO) compliance,
              withdrawn standard interceptions, and human-in-the-loop expert corrections.
            </div>
          </div>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
              SURVEILLANCE WINDOW:
            </span>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-toggle-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${timeRange === 'all' ? 'active' : ''}`}
                onClick={() => setTimeRange('all')}
              >
                All-Time
              </button>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={seedDemoData}
              style={{ fontSize: '11px', padding: '4px 10px', marginTop: '4px' }}
            >
              📊 Load Demo Dataset (20 Records)
            </button>
          </div>
        </div>
      </div>

      {/* 1. Top KPI Summary Cards */}
      <KPICards metrics={metrics} />

      {/* 2. Grid: Most-Queried Standards & Domain Donut Split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.35fr) minmax(280px, 1fr)',
          gap: '16px',
        }}
      >
        <TopStandardsBar
          standardsQueried={metrics.standardsQueried}
          feedbackByStandard={metrics.feedbackByStandard}
          onSelectStandard={(std) => onSelectStandard && onSelectStandard(std)}
        />
        <DomainDonutChart
          domainsQueried={metrics.domainsQueried}
          onSelectDomain={(domain) => setSelectedDomain(domain === selectedDomain ? 'all' : domain)}
        />
      </div>

      {/* 3. 90-Day Activity Heatmap */}
      <ActivityHeatmap queriesByDate={metrics.queriesByDate} />

      {/* 4. Ministry Compliance Surveillance Matrix */}
      <MinistryComplianceHeatmap
        complianceList={metrics.ministryCompliance}
        activityFeed={metrics.recentActivityFeed}
      />

      {/* 5. Institutional Export & Action Bar */}
      <ExportReport metrics={metrics} onRefresh={refreshMetrics} />
    </div>
  );
};
