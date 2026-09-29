import React from 'react';
import type { DecomposeResponse, Stage2MapResponse, Stage3FinalizeResponse } from './types';
import { ShieldCheck, AlertTriangle, Layers, FileCheck2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface OverviewTabProps {
  metadata: DecomposeResponse['tender_metadata'] | null;
  stage1Data: DecomposeResponse | null;
  stage2Data: Stage2MapResponse | null;
  stage3Data: Stage3FinalizeResponse | null;
  onNavigateToTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metadata,
  stage1Data,
  stage2Data,
  stage3Data,
  onNavigateToTab,
}) => {
  const totalProducts = stage1Data?.products?.length || 0;
  const mappedCount = stage2Data?.mapped_products?.length || 0;
  const outdatedCount = stage2Data?.high_risk_outdated_count || 0;
  const qcoCount = stage2Data?.mandatory_qco_count || 0;
  const finalizedDiffsCount = stage3Data?.clause_diffs?.length || 0;

  // Calculate compliance score
  let complianceScore = 100;
  if (mappedCount > 0) {
    const penaltyPerOutdated = 25;
    const penaltyPerMissingQCO = 15;
    complianceScore = Math.max(20, 100 - (outdatedCount * penaltyPerOutdated + qcoCount * penaltyPerMissingQCO));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Executive KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        {/* KPI 1: Compliance Score */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px 20px',
            borderRadius: '10px',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-card)',
            borderLeft: `4px solid ${complianceScore >= 80 ? 'var(--emerald-pass)' : complianceScore >= 50 ? 'var(--amber-warn)' : 'var(--error-red)'}`,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tender Statutory Health
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: complianceScore >= 80 ? 'var(--emerald-pass)' : complianceScore >= 50 ? 'var(--amber-warn)' : 'var(--error-red)', fontFamily: 'var(--font-data, monospace)', margin: '4px 0 2px' }}>
            {complianceScore}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {outdatedCount > 0 ? (
              <>
                <AlertTriangle size={13} color="var(--amber-warn)" />
                <span>{outdatedCount} Withdrawn standards detected</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} color="var(--emerald-text)" />
                <span>All verified against active gazette</span>
              </>
            )}
          </div>
        </div>

        {/* KPI 2: Line Items Decomposed */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px 20px',
            borderRadius: '10px',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--collapse-cobalt)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Procurement Line Items
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--collapse-cobalt)', fontFamily: 'var(--font-data, monospace)', margin: '4px 0 2px' }}>
            {totalProducts}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
            Clause-by-clause decomposition
          </div>
        </div>

        {/* KPI 3: Outdated / Withdrawn Standards */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px 20px',
            borderRadius: '10px',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--error-red)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Superseded Standards
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: outdatedCount > 0 ? 'var(--error-red)' : 'var(--emerald-pass)', fontFamily: 'var(--font-data, monospace)', margin: '4px 0 2px' }}>
            {outdatedCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
            {outdatedCount > 0 ? 'Exposes tender to audit disallowance' : 'Zero legacy codes cited'}
          </div>
        </div>

        {/* KPI 4: Mandatory QCOs */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            padding: '18px 20px',
            borderRadius: '10px',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-card)',
            borderLeft: '4px solid var(--amber-warn)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mandatory QCO Enforcements
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--amber-warn)', fontFamily: 'var(--font-data, monospace)', margin: '4px 0 2px' }}>
            {qcoCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
            Statutory BIS licensing mandates
          </div>
        </div>
      </div>

      {/* 3-Stage Pipeline Progression Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '24px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
          Autonomous 3-Stage Intelligence Pipeline & HITL Gateway
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Stage 1 Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: stage1Data ? 'var(--emerald-bg)' : 'var(--surface-secondary)',
              border: `1px solid ${stage1Data ? 'var(--emerald-border)' : 'var(--hairline)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: stage1Data ? 'var(--emerald-pass)' : 'var(--ink-muted)' }}>
                STAGE 1 · DECOMPOSE
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: stage1Data ? 'var(--emerald-pass)' : 'var(--ink-muted)' }}>
                {stage1Data ? '✓ Done' : '⏳ Ready'}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              Line Item & Query Extraction
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              Extracted {totalProducts} procurement items and verbatim clause quotes.
            </div>
          </div>

          {/* Stage 2 Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: stage2Data ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-secondary)',
              border: `1px solid ${stage2Data ? 'rgba(59, 130, 246, 0.3)' : 'var(--hairline)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: stage2Data ? 'var(--collapse-cobalt)' : 'var(--ink-muted)' }}>
                STAGE 2 · MAPPING
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: stage2Data ? 'var(--collapse-cobalt)' : 'var(--ink-muted)' }}>
                {stage2Data ? '✓ Done' : '⏳ Pending'}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              Tri-Retrieval & Confidence
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              Mapped products to 22,011 standards and formulated engineering questions.
            </div>
          </div>

          {/* Stage 2B / HITL Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber-warn)' }}>
                STAGE 2B · HITL DECISION
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--amber-warn)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span className="status-dot active" style={{ width: '6px', height: '6px' }} />
                <span>ACTIVE</span>
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              Engineering Clarifications
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              Officer answers questions on application/environment to boost confidence.
            </div>
          </div>

          {/* Stage 3 Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: stage3Data ? 'var(--olive-tint)' : 'var(--surface-secondary)',
              border: `1px solid ${stage3Data ? 'var(--hairline)' : 'var(--hairline)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: stage3Data ? 'var(--olive-primary)' : 'var(--ink-muted)' }}>
                STAGE 3 · FINALIZE
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: stage3Data ? 'var(--olive-primary)' : 'var(--ink-muted)' }}>
                {stage3Data ? '✓ Ready' : '⏳ Pending'}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
              Clause Diffs & NIT Export
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
              {finalizedDiffsCount} redline diffs and exportable statutory NIT schedule.
            </div>
          </div>
        </div>
      </div>

      {/* Tender Metadata Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '24px',
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Document Context & Issuing Authority
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('inventory')}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--olive-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Proceed to Product ↔ IS Inventory</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600 }}>TENDER TITLE</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
              {metadata?.title || 'Public Works Procurement Document'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600 }}>DEPARTMENT / AUTHORITY</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
              {metadata?.department || 'Government Procurement Agency'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600 }}>TENDER TYPE</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
              {metadata?.tender_type || 'Open Competitive Bidding'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 600 }}>ESTIMATED PROCUREMENT VALUE</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
              {metadata?.estimated_value || 'Item Rate / Schedule Based'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
