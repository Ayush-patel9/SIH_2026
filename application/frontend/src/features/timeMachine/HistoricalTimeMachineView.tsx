/**
 * HistoricalTimeMachineView.tsx
 * Standards Historical Time-Machine & Phylogenetic Supersession Tree
 * Enables procurement officers and bidders to trace specifications across 75 years (1950 - 2026),
 * resolving why legacy numbers were withdrawn and dynamically mapping them to active standards.
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../api/standardsClient';
import {
  History,
  Search,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Layers,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  FlaskConical,
  Scale,
  RefreshCw,
} from 'lucide-react';

interface EvolutionEpoch {
  year: number;
  code: string;
  title: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'WITHDRAWN';
  changes: string;
}

interface StandardLineage {
  id: string;
  standard_code: string;
  query_code?: string;
  name: string;
  category: string;
  is_withdrawn: boolean;
  canonical_replacement: string;
  withdrawn_alert?: {
    code: string;
    replacement: string;
    reason: string;
    severity: string;
  } | null;
  evolution: EvolutionEpoch[];
  source?: string;
  total_epochs?: number;
  sample_test_cases?: Array<{ code: string; label: string; domain?: string }>;
}

// Offline fallback archive in case server is starting
const LOCAL_FALLBACK_CEMENT: StandardLineage = {
  id: 'cement-lineage',
  standard_code: 'IS 269',
  name: 'Ordinary Portland Cement (33, 43, 53 Grade)',
  category: 'Civil Engineering / Cement & Binders',
  is_withdrawn: false,
  canonical_replacement: 'IS 269:2015',
  evolution: [
    {
      year: 1951,
      code: 'IS 269:1951',
      title: 'Specification for Ordinary, Rapid-Hardening and Low Heat Portland Cement (First Issue)',
      status: 'SUPERSEDED',
      changes: 'Initial post-independence Indian Standard formulated by ISI based on British BS 12 standard.',
    },
    {
      year: 1976,
      code: 'IS 269:1976',
      title: 'Ordinary and Low Heat Portland Cement (Third Revision)',
      status: 'SUPERSEDED',
      changes: 'Separated 33-Grade OPC as the base construction grade across India.',
    },
    {
      year: 1989,
      code: 'IS 8112:1989 & IS 12269:1987',
      title: '43 Grade and 53 Grade Ordinary Portland Cement (Specialized Editions)',
      status: 'WITHDRAWN',
      changes: 'Formulated separate individual standards for high-strength 43 Grade and 53 Grade cement.',
    },
    {
      year: 2015,
      code: 'IS 269:2015',
      title: 'Ordinary Portland Cement — Specification (Sixth Revision)',
      status: 'ACTIVE',
      changes: 'CONSOLIDATION REVISION: Merged IS 8112 and IS 12269 into a single unified IS 269 standard.',
    },
    {
      year: 2024,
      code: 'IS 269:2015 + Amd 4 (2024)',
      title: 'Mandatory ISI Mark under Cement QCO 2024',
      status: 'ACTIVE',
      changes: 'DPIIT gazette order mandating digital batch certificates and BIS CM/L marking for public works.',
    },
  ],
};

export const HistoricalTimeMachineView: React.FC = () => {
  const [lineage, setLineage] = useState<StandardLineage>(LOCAL_FALLBACK_CEMENT);
  const [activeEpochIndex, setActiveEpochIndex] = useState<number>(LOCAL_FALLBACK_CEMENT.evolution.length - 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedClause, setCopiedClause] = useState(false);

  // Load standard lineage dynamically from backend API
  const fetchLineage = async (standardCode: string) => {
    let trimmed = standardCode.trim();
    if (!trimmed) return;

    // Auto-normalize if user enters only digits (e.g. '15683' -> 'IS 15683')
    if (/^\d+/.test(trimmed)) {
      trimmed = `IS ${trimmed}`;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/knowledge-graph/lineage?standard=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data: StandardLineage = await res.json();
        setLineage(data);
        setActiveEpochIndex(data.evolution.length - 1);
      } else {
        console.warn('Lineage API error, falling back locally');
      }
    } catch (err) {
      console.error('Failed to load standard lineage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLineage('IS 269');
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      fetchLineage(searchQuery);
    }
  };

  const currentStep = lineage.evolution[activeEpochIndex] || lineage.evolution[lineage.evolution.length - 1];

  const handleCopyLegalClause = () => {
    if (!currentStep) return;
    const clauseText = `Legal & Technical Conformity: Citing ${currentStep.code} (${currentStep.title}). Status: ${currentStep.status}. Statutory Replacement: ${lineage.canonical_replacement}. Rationale: ${currentStep.changes}.`;
    navigator.clipboard.writeText(clauseText);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Card */}
      <div
        className="workbench-card"
        style={{
          borderLeft: '4px solid var(--focus-blue, #2563EB)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          padding: '22px 26px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" />
              <span
                style={{
                  fontFamily: 'var(--font-data, monospace)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--ink-muted, #64748B)',
                }}
              >
                STANDARDS HISTORICAL TIME-MACHINE (1950 — 2026)
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-ui, sans-serif)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--ink, #0F172A)',
                margin: '2px 0 6px 0',
                letterSpacing: '-0.015em',
              }}
            >
              Standards Evolution & Supersession Lineage
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-prose, sans-serif)',
                fontSize: '13.5px',
                color: 'var(--ink-secondary, #475569)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Trace why older standards were superseded, check withdrawn risks, and find statutory replacements across 22,011 Indian Standards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#F1F5F9',
                color: '#334155',
                fontSize: '11.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-data, monospace)',
                border: '1px solid #CBD5E1',
              }}
            >
              <Layers size={13} /> {lineage.evolution.length} EPOCHS
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: lineage.is_withdrawn ? '#FEF2F2' : '#ECFDF5',
                color: lineage.is_withdrawn ? '#DC2626' : '#047857',
                fontSize: '11.5px',
                fontWeight: 700,
                fontFamily: 'var(--font-data, monospace)',
                border: `1px solid ${lineage.is_withdrawn ? '#FECACA' : '#A7F3D0'}`,
              }}
            >
              {lineage.is_withdrawn ? '⚠ WITHDRAWN SPEC' : '✓ ACTIVE STANDARD'}
            </span>
          </div>
        </div>

        {/* Dynamic Search Box */}
        <form onSubmit={handleSearchSubmit} style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--hairline, #E2E8F0)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Enter any standard code (e.g. IS 15683, IS 8112, IS 1786, IS 7098, IS 226, IS 10500)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="auth-input"
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  fontSize: '13.5px',
                  height: '40px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 18px',
                height: '40px',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLoading ? <RefreshCw size={14} className="spin" /> : <History size={15} />}
              <span>{isLoading ? 'Tracing...' : 'Trace'}</span>
            </button>
          </div>
        </form>

        {/* Simple & Friendly Demo Presets */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)', fontWeight: 600, marginRight: '2px' }}>
            Quick Demos:
          </span>
          {[
            { code: 'IS 15683', label: '🧯 Fire Extinguishers (Consolidated)' },
            { code: 'IS 8112', label: '⚠️ 43-Grade Cement (Withdrawn ➔ IS 269)' },
            { code: 'IS 1786', label: '🏗️ TMT Rebars (Fe 500D)' },
            { code: 'IS 7098', label: '⚡ XLPE Power Cables' },
            { code: 'IS 226', label: '⚠️ Structural Steel (Withdrawn ➔ IS 2062)' },
            { code: 'IS 2925', label: '🦺 Safety Helmets' },
          ].map((item) => {
            const isSelected = lineage.standard_code.includes(item.code) || (lineage.withdrawn_alert && lineage.withdrawn_alert.code.includes(item.code));
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setSearchQuery(item.code);
                  fetchLineage(item.code);
                }}
                style={{
                  background: isSelected ? '#EFF6FF' : 'var(--surface-secondary)',
                  border: isSelected ? '1.5px solid #2563EB' : '1px solid var(--hairline)',
                  color: isSelected ? '#1D4ED8' : 'var(--ink)',
                  borderRadius: '16px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Withdrawn Alert Banner if Current Standard is Obsolete */}
      {lineage.withdrawn_alert && (
        <div
          style={{
            padding: '18px 22px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderLeft: '4px solid #DC2626',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeSlideUp 0.18s ease-out',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="#DC2626" />
              <strong style={{ fontFamily: 'var(--font-ui, sans-serif)', fontSize: '14px', color: '#991B1B' }}>
                WITHDRAWN SPECIFICATION DETECTED: {lineage.withdrawn_alert.code}
              </strong>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#FFFFFF',
                background: '#DC2626',
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-data, monospace)',
              }}
            >
              {lineage.withdrawn_alert.severity || 'CRITICAL'} CVC AUDIT RISK
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#7F1D1D', margin: 0, lineHeight: 1.55 }}>
            {lineage.withdrawn_alert.reason}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '2px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>
              Statutory Active Successor:
            </span>
            <span
              className="code-monogram"
              style={{
                fontSize: '13px',
                background: '#DCFCE7',
                color: '#166534',
                border: '1px solid #BBF7D0',
                padding: '3px 10px',
              }}
            >
              {lineage.withdrawn_alert.replacement}
            </span>
            <span style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'var(--font-data, monospace)' }}>
              (Mandatory for all new public tender NITs)
            </span>
          </div>
        </div>
      )}

      {/* Main Epoch Timeline Card */}
      <div
        className="workbench-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          padding: '24px 28px',
          border: '1px solid var(--hairline, #E2E8F0)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="code-monogram" style={{ fontSize: '13px', padding: '3px 8px' }}>
                {lineage.standard_code}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted, #64748B)', fontFamily: 'var(--font-data, monospace)' }}>
                {lineage.category}
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-ui, sans-serif)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink, #0F172A)',
                margin: 0,
              }}
            >
              {lineage.name}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-data, monospace)',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#F8FAFC',
                color: '#475569',
                border: '1px solid #E2E8F0',
                fontWeight: 700,
              }}
            >
              {lineage.evolution.length} HISTORICAL {lineage.evolution.length === 1 ? 'EPOCH' : 'EPOCHS'}
            </span>
            {lineage.source && (
              <span
                style={{
                  fontFamily: 'var(--font-data, monospace)',
                  fontSize: '10.5px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                  fontWeight: 600,
                }}
              >
                {lineage.source.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Clean, Non-Truncated Timeline Progression Bar */}
        <div style={{ position: 'relative', margin: '24px 10px 14px' }}>
          {/* Connecting Track Line only if multiple epochs */}
          {lineage.evolution.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '40px',
                right: '40px',
                height: '3px',
                background: '#E2E8F0',
                zIndex: 1,
              }}
            />
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: lineage.evolution.length === 1 ? 'center' : 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {lineage.evolution.map((step, idx) => {
              const isCurrent = idx === activeEpochIndex;
              const isActive = step.status === 'ACTIVE';
              const isWithdrawn = step.status === 'WITHDRAWN';

              const bubbleBg = isCurrent
                ? '#0F172A'
                : isActive
                ? '#10B981'
                : isWithdrawn
                ? '#EF4444'
                : '#94A3B8';

              return (
                <div
                  key={idx}
                  onClick={() => setActiveEpochIndex(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flex: 1,
                    maxWidth: '160px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Step Bubble */}
                  <div
                    style={{
                      width: isCurrent ? '38px' : '30px',
                      height: isCurrent ? '38px' : '30px',
                      borderRadius: '50%',
                      background: bubbleBg,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isCurrent ? '12px' : '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-data, monospace)',
                      border: '3px solid #FFFFFF',
                      boxShadow: isCurrent
                        ? '0 0 0 3px #2563EB, 0 4px 10px rgba(37, 99, 235, 0.3)'
                        : '0 2px 5px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {step.year}
                  </div>

                  {/* Proper Non-Truncated Standard Label */}
                  <div
                    style={{
                      fontFamily: 'var(--font-data, monospace)',
                      fontSize: '11px',
                      fontWeight: isCurrent ? 700 : 600,
                      color: isCurrent ? '#0F172A' : '#475569',
                      marginTop: '10px',
                      textAlign: 'center',
                      lineHeight: 1.25,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isCurrent ? '#F1F5F9' : 'transparent',
                    }}
                  >
                    {step.code.length > 20 ? `${step.code.slice(0, 18)}..` : step.code}
                  </div>

                  {/* Status Indicator Tag */}
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-data, monospace)',
                      fontWeight: 700,
                      marginTop: '4px',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      background: isActive ? '#DCFCE7' : isWithdrawn ? '#FEE2E2' : '#F1F5F9',
                      color: isActive ? '#15803D' : isWithdrawn ? '#DC2626' : '#64748B',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {step.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Epoch Deep-Dive Inspector */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'fadeSlideUp 0.18s ease-out',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="code-monogram" style={{ fontSize: '15px', padding: '4px 12px' }}>
                {currentStep.code}
              </span>

              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-data, monospace)',
                  padding: '3px 10px',
                  borderRadius: '5px',
                  background:
                    currentStep.status === 'ACTIVE'
                      ? '#DCFCE7'
                      : currentStep.status === 'WITHDRAWN'
                      ? '#FEE2E2'
                      : '#F1F5F9',
                  color:
                    currentStep.status === 'ACTIVE'
                      ? '#15803D'
                      : currentStep.status === 'WITHDRAWN'
                      ? '#DC2626'
                      : '#475569',
                  border: `1px solid ${
                    currentStep.status === 'ACTIVE'
                      ? '#BBF7D0'
                      : currentStep.status === 'WITHDRAWN'
                      ? '#FECACA'
                      : '#E2E8F0'
                  }`,
                }}
              >
                {currentStep.status}
              </span>

              <span style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '12px', color: '#64748B' }}>
                Publication Epoch: <strong>{currentStep.year}</strong>
              </span>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleCopyLegalClause}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {copiedClause ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedClause ? 'Clause Copied!' : 'Copy Legal Defense Clause'}</span>
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-ui, sans-serif)', fontSize: '15.5px', fontWeight: 600, color: 'var(--ink, #0F172A)' }}>
            {currentStep.title}
          </div>

          <div
            style={{
              padding: '12px 16px',
              background: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              color: '#334155',
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: '#0F172A' }}>Historical Significance & Engineering Rationale: </strong>
            {currentStep.changes}
          </div>

          {/* Quick Legal Scrutiny Tip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', flexWrap: 'wrap', gap: '8px' }}>
            <span>
              CVC Compliance Status:{' '}
              <strong style={{ color: currentStep.status === 'ACTIVE' ? '#15803D' : '#DC2626' }}>
                {currentStep.status === 'ACTIVE'
                  ? 'Valid for Public Works Procurement'
                  : 'Prohibited in Active NIT Tenders — Cite Replacement'}
              </strong>
            </span>
            <span>
              Statutory Authority: <strong>Bureau of Indian Standards Act, 2016</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
