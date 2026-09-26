/**
 * HistoricalTimeMachineView.tsx
 * Standards Historical Time-Machine & Phylogenetic Supersession Tree
 * Enables procurement officers to trace specifications across decades (1950 - 2026),
 * revealing why legacy numbers were withdrawn and mapping them to active standards.
 */

import React, { useState } from 'react';
import { History, Search, ArrowRight, Clock, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';

interface StandardLineage {
  id: string;
  name: string;
  category: string;
  evolution: {
    year: number;
    code: string;
    title: string;
    status: 'ACTIVE' | 'SUPERSEDED' | 'WITHDRAWN';
    changes: string;
  }[];
}

const LINEAGE_DATABASE: StandardLineage[] = [
  {
    id: 'cement-lineage',
    name: 'Ordinary Portland Cement (OPC)',
    category: 'Civil Engineering / Binding Materials',
    evolution: [
      {
        year: 1951,
        code: 'IS 269:1951',
        title: 'Specification for Ordinary, Rapid-Hardening and Low Heat Portland Cement (First Issue)',
        status: 'SUPERSEDED',
        changes: 'Initial post-independence Indian Standard based on British BS 12 standards.',
      },
      {
        year: 1976,
        code: 'IS 269:1976',
        title: 'Ordinary and Low Heat Portland Cement (Third Revision)',
        status: 'SUPERSEDED',
        changes: 'Separated 33-Grade OPC as the base construction standard in India.',
      },
      {
        year: 1989,
        code: 'IS 8112:1989 & IS 12269:1987',
        title: '43 Grade and 53 Grade Ordinary Portland Cement',
        status: 'WITHDRAWN',
        changes: 'Introduced dedicated separate standards for high-strength 43 Grade and 53 Grade cement.',
      },
      {
        year: 2015,
        code: 'IS 269:2015',
        title: 'Ordinary Portland Cement — Specification (Sixth Revision)',
        status: 'ACTIVE',
        changes: 'CONSOLIDATION REVISION: Merged IS 8112 and IS 12269 into single master IS 269 standard.',
      },
      {
        year: 2024,
        code: 'IS 269:2015 + Amd 4 (2024)',
        title: 'Mandatory ISI Mark under Cement QCO 2024',
        status: 'ACTIVE',
        changes: 'Gazette order mandating digital batch certificates and BIS CM/L marking for public tenders.',
      },
    ],
  },
  {
    id: 'steel-lineage',
    name: 'Structural Steel Plates & Sections',
    category: 'Metallurgy / Structural Steel',
    evolution: [
      {
        year: 1950,
        code: 'IS 226:1950',
        title: 'Structural Steel (Standard Quality) — First Indian Issue',
        status: 'SUPERSEDED',
        changes: 'Foundational specification for structural steel adopted for early industrial projects.',
      },
      {
        year: 1962,
        code: 'IS 2062:1962',
        title: 'Structural Steel (Fusion Welding Quality)',
        status: 'SUPERSEDED',
        changes: 'Formulated specifically for welded structures in bridges and power plants.',
      },
      {
        year: 2006,
        code: 'IS 2062:2006',
        title: 'Hot Rolled Low, Medium and High Tensile Structural Steel',
        status: 'SUPERSEDED',
        changes: 'Superseded IS 226:1975 completely. Replaced UTS grading with yield strength designations (E250, E350).',
      },
      {
        year: 2011,
        code: 'IS 2062:2011',
        title: 'Hot Rolled Medium and High Tensile Structural Steel (Seventh Revision)',
        status: 'ACTIVE',
        changes: 'Current sovereign standard governing all structural steel fabrication in India with mandatory impact testing.',
      },
    ],
  },
];

export const HistoricalTimeMachineView: React.FC = () => {
  const [selectedLineage, setSelectedLineage] = useState<StandardLineage>(LINEAGE_DATABASE[0]);
  const [activeYearIndex, setActiveYearIndex] = useState<number>(3);
  const [withdrawnSearch, setWithdrawnSearch] = useState('');

  const currentStep = selectedLineage.evolution[activeYearIndex] || selectedLineage.evolution[selectedLineage.evolution.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--focus-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                STANDARDS HISTORICAL TIME-MACHINE (1950 - 2026)
              </span>
              <span className="concept-status-badge active" style={{ fontSize: '9px' }}>
                PHYLOGENETIC LINEAGE ENGINE
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Standards Historical Evolution & Supersession Lineage
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Trace standard revisions through 75 years of Indian industrial development to legally defend why historic clauses were superseded.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {LINEAGE_DATABASE.map((lin) => (
              <button
                key={lin.id}
                type="button"
                className={`category-pill ${selectedLineage.id === lin.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedLineage(lin);
                  setActiveYearIndex(lin.evolution.length - 1);
                }}
              >
                {lin.name.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Timeline Card */}
      <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="workbench-card-title">{selectedLineage.name}</h2>
            <div className="workbench-card-subtitle">{selectedLineage.category}</div>
          </div>
          <span className="badge-code font-mono">
            {selectedLineage.evolution.length} HISTORICAL REVISIONS
          </span>
        </div>

        {/* Interactive Year Slider Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '20px 20px 10px' }}>
          {/* Connector Line */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: 0,
              right: 0,
              height: '3px',
              background: 'var(--hairline)',
              zIndex: 1,
            }}
          />
          {selectedLineage.evolution.map((step, idx) => {
            const isCurrent = idx === activeYearIndex;
            const isPassed = idx <= activeYearIndex;
            return (
              <div
                key={idx}
                onClick={() => setActiveYearIndex(idx)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: isCurrent ? '34px' : '26px',
                    height: isCurrent ? '34px' : '26px',
                    borderRadius: '50%',
                    background: isCurrent
                      ? 'var(--ink)'
                      : step.status === 'ACTIVE'
                      ? 'var(--emerald-pass)'
                      : '#E4E4E7',
                    color: isCurrent || step.status === 'ACTIVE' ? '#FFFFFF' : '#71717A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-data)',
                    border: '3px solid #FFFFFF',
                    boxShadow: isCurrent ? '0 0 0 2px var(--ink)' : 'var(--shadow-xs)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {step.year}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--ink)' : 'var(--ink-muted)',
                    marginTop: '8px',
                  }}
                >
                  {step.code.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Snapshot Inspector of Selected Epoch */}
        <div
          style={{
            padding: '18px 22px',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeSlideUp 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="code-monogram" style={{ fontSize: '15px', padding: '4px 10px' }}>
                {currentStep.code}
              </span>
              <span className={`concept-status-badge ${currentStep.status === 'ACTIVE' ? 'active' : 'withdrawn'}`}>
                {currentStep.status}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink-muted)' }}>
              Publication Year: {currentStep.year}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
            {currentStep.title}
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            <strong>Historical Significance: </strong>{currentStep.changes}
          </div>
        </div>
      </div>
    </div>
  );
};
