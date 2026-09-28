/**
 * HistoricalTimeMachineView.tsx
 * Standards Historical Time-Machine & Phylogenetic Supersession Tree
 * Enables procurement officers and bidders to trace specifications across decades (1950 - 2026),
 * resolving why legacy numbers were withdrawn and mapping them to active standards.
 */

import React, { useState } from 'react';
import { History, Search, ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface StandardLineage {
  id: string;
  name: string;
  category: string;
  canonicalReplacement?: string;
  evolution: {
    year: number;
    code: string;
    title: string;
    status: 'ACTIVE' | 'SUPERSEDED' | 'WITHDRAWN';
    changes: string;
  }[];
}

const CANONICAL_SUPERSESSIONS: Record<string, { replacement: string; reason: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'; lineageId: string }> = {
  'IS 8112': {
    replacement: 'IS 269:2015',
    reason: 'Withdrawn in 2015 and amalgamated into IS 269:2015 (covers 33, 43, 53 grade Ordinary Portland Cement). Citing IS 8112 in active tenders violates CVC guidelines.',
    severity: 'CRITICAL',
    lineageId: 'cement-lineage',
  },
  'IS 12269': {
    replacement: 'IS 269:2015',
    reason: 'Withdrawn in 2015 and amalgamated into unified IS 269:2015 specification. 53-grade OPC is now covered under IS 269 Clause 5.',
    severity: 'CRITICAL',
    lineageId: 'cement-lineage',
  },
  'IS 226': {
    replacement: 'IS 2062:2011',
    reason: 'Superseded completely by IS 2062. Replaced archaic UTS grading with modern yield strength designations (Grade E250, E350).',
    severity: 'CRITICAL',
    lineageId: 'structural-steel-lineage',
  },
  'IS 800:1984': {
    replacement: 'IS 800:2007',
    reason: 'Superseded by IS 800:2007 (Limit State Design code for general steel construction). Working Stress Method from 1984 is obsolete.',
    severity: 'HIGH',
    lineageId: 'steel-design-lineage',
  },
  'IS 456:1978': {
    replacement: 'IS 456:2000',
    reason: 'Superseded by IS 456:2000 (Plain and Reinforced Concrete Code of Practice) with updated durability limits and mix proportions.',
    severity: 'HIGH',
    lineageId: 'concrete-code-lineage',
  },
  'IS 13920:1993': {
    replacement: 'IS 13920:2016',
    reason: 'Superseded by IS 13920:2016 (Ductile Design and Detailing of Reinforced Concrete Structures for Seismic Zones IV & V).',
    severity: 'CRITICAL',
    lineageId: 'seismic-detailing-lineage',
  },
  'IS 4984:1995': {
    replacement: 'IS 4984:2016',
    reason: 'Superseded by IS 4984:2016 (HDPE Pipes for Water Supply — Specification). Phased out older PE63/PE80 grades for high-strength PE100 resins.',
    severity: 'HIGH',
    lineageId: 'hdpe-pipe-lineage',
  },
};

const LINEAGE_DATABASE: StandardLineage[] = [
  {
    id: 'cement-lineage',
    name: 'Ordinary Portland Cement (OPC)',
    category: 'Civil Engineering / Cement & Binders',
    canonicalReplacement: 'IS 269:2015',
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
  },
  {
    id: 'steel-rebar-lineage',
    name: 'High Strength Deformed Steel Rebars (TMT)',
    category: 'Metallurgical Engineering / Concrete Reinforcement',
    canonicalReplacement: 'IS 1786:2008',
    evolution: [
      {
        year: 1966,
        code: 'IS 432:1966',
        title: 'Mild Steel and Medium Tensile Steel Bars and Hard-Drawn Steel Wire for Concrete Reinforcement',
        status: 'SUPERSEDED',
        changes: 'Standard plain mild steel rounds used before modern rib-deformed rebars were introduced.',
      },
      {
        year: 1979,
        code: 'IS 1786:1979',
        title: 'Cold-Worked Steel High Strength Deformed Bars for Concrete Reinforcement',
        status: 'SUPERSEDED',
        changes: 'Introduced twisted Torsteel (Fe 415) to replace plain round bars with better bond strength.',
      },
      {
        year: 1985,
        code: 'IS 1786:1985',
        title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (Third Revision)',
        status: 'SUPERSEDED',
        changes: 'Recognized Thermo-Mechanically Treated (TMT) quenching processes and added Fe 500 grade.',
      },
      {
        year: 2008,
        code: 'IS 1786:2008',
        title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (Fourth Revision)',
        status: 'ACTIVE',
        changes: 'Introduced seismic high-ductility grades (Fe 500D, Fe 550D) with mandatory TS/YS ratio ≥ 1.10.',
      },
      {
        year: 2021,
        code: 'IS 1786:2008 + Amd 3',
        title: 'Steel Quality Control Order Mandatory Enforcement',
        status: 'ACTIVE',
        changes: 'Mandatory BIS certification for all rebar producers; banned non-certified secondary billets.',
      },
    ],
  },
  {
    id: 'structural-steel-lineage',
    name: 'Structural Steel Plates & Sections',
    category: 'Metallurgy / Structural Steel',
    canonicalReplacement: 'IS 2062:2011',
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
  {
    id: 'concrete-code-lineage',
    name: 'Plain and Reinforced Concrete Code',
    category: 'Civil Engineering / Structural Design Codes',
    canonicalReplacement: 'IS 456:2000',
    evolution: [
      {
        year: 1953,
        code: 'IS 456:1953',
        title: 'Code of Practice for Plain and Reinforced Concrete for General Building Construction',
        status: 'SUPERSEDED',
        changes: 'First unified concrete code of practice formulated by the Indian Standards Institution.',
      },
      {
        year: 1964,
        code: 'IS 456:1964',
        title: 'Code of Practice for Plain and Reinforced Concrete (Second Revision)',
        status: 'SUPERSEDED',
        changes: 'Standardized Ultimate Load Method alongside classical Working Stress Design.',
      },
      {
        year: 1978,
        code: 'IS 456:1978',
        title: 'Code of Practice for Plain and Reinforced Concrete (Third Revision)',
        status: 'SUPERSEDED',
        changes: 'Adopted Limit State Design as the primary engineering methodology for Indian structural engineering.',
      },
      {
        year: 2000,
        code: 'IS 456:2000',
        title: 'Plain and Reinforced Concrete — Code of Practice (Fourth Revision)',
        status: 'ACTIVE',
        changes: 'Modern baseline code with strict durability clauses, maximum w/c ratio by environmental exposure, and high-strength concrete design.',
      },
    ],
  },
  {
    id: 'seismic-detailing-lineage',
    name: 'Ductile Detailing for Earthquake Resistance',
    category: 'Structural Engineering / Earthquake Engineering',
    canonicalReplacement: 'IS 13920:2016',
    evolution: [
      {
        year: 1976,
        code: 'IS 4326:1976',
        title: 'Code of Practice for Earthquake Resistant Design and Construction of Buildings',
        status: 'SUPERSEDED',
        changes: 'Early Indian seismic detailing guidelines based on simple reinforcement strapping.',
      },
      {
        year: 1993,
        code: 'IS 13920:1993',
        title: 'Ductile Detailing of Reinforced Concrete Structures Subjected to Seismic Forces',
        status: 'WITHDRAWN',
        changes: 'Formulated after the 1993 Killari earthquake; mandated closed stirrups with 135° seismic hooks.',
      },
      {
        year: 2016,
        code: 'IS 13920:2016',
        title: 'Ductile Design and Detailing of Reinforced Concrete Structures (First Revision)',
        status: 'ACTIVE',
        changes: 'Mandatory standard for all RCC structures in Seismic Zones III, IV, and V. Strictly forbids lap splices in critical beam-column plastic hinge zones.',
      },
    ],
  },
  {
    id: 'hdpe-pipe-lineage',
    name: 'High Density Polyethylene (HDPE) Pipes',
    category: 'Chemicals & Plastics / Water Infrastructure',
    canonicalReplacement: 'IS 4984:2016',
    evolution: [
      {
        year: 1972,
        code: 'IS 4984:1972',
        title: 'Specification for High Density Polyethylene Pipes for Potable Water Supplies',
        status: 'SUPERSEDED',
        changes: 'Introduced early PE pipe specifications using low-density/medium-density compound blends.',
      },
      {
        year: 1995,
        code: 'IS 4984:1995',
        title: 'High Density Polyethylene Pipes for Water Supply — Specification (Fourth Revision)',
        status: 'SUPERSEDED',
        changes: 'Classified pipes by PE63 and PE80 compound grades with nominal pressure ratings PN 2.5 to PN 16.',
      },
      {
        year: 2016,
        code: 'IS 4984:2016',
        title: 'High Density Polyethylene Pipes for Water Supply — Specification (Fifth Revision)',
        status: 'ACTIVE',
        changes: 'Mandated PE100 virgin compound resins with 50-year design life; covered under statutory Quality Control Order (QCO).',
      },
    ],
  },
];

export const HistoricalTimeMachineView: React.FC = () => {
  const [selectedLineage, setSelectedLineage] = useState<StandardLineage>(LINEAGE_DATABASE[0]);
  const [activeYearIndex, setActiveYearIndex] = useState<number>(LINEAGE_DATABASE[0].evolution.length - 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedWithdrawn, setDetectedWithdrawn] = useState<{
    code: string;
    replacement: string;
    reason: string;
    severity: string;
    lineageId: string;
  } | null>(null);

  const handleSearch = (term?: string) => {
    const raw = (term || searchQuery).trim().toUpperCase();
    if (!raw) {
      setDetectedWithdrawn(null);
      return;
    }

    // 1. Check if it's a known withdrawn standard
    const matchedWithdrawnKey = Object.keys(CANONICAL_SUPERSESSIONS).find((k) =>
      raw.includes(k) || k.includes(raw)
    );

    if (matchedWithdrawnKey) {
      const info = CANONICAL_SUPERSESSIONS[matchedWithdrawnKey];
      setDetectedWithdrawn({
        code: matchedWithdrawnKey,
        ...info,
      });

      // Also switch to the corresponding lineage if available
      const foundLin = LINEAGE_DATABASE.find((l) => l.id === info.lineageId);
      if (foundLin) {
        setSelectedLineage(foundLin);
        // Find withdrawn step index in evolution
        const stepIdx = foundLin.evolution.findIndex((e) =>
          e.code.toUpperCase().includes(matchedWithdrawnKey) || e.status === 'WITHDRAWN'
        );
        setActiveYearIndex(stepIdx >= 0 ? stepIdx : foundLin.evolution.length - 1);
      }
      return;
    }

    setDetectedWithdrawn(null);

    // 2. Check if it matches any lineage title or evolution code
    const foundLin = LINEAGE_DATABASE.find(
      (l) =>
        l.name.toUpperCase().includes(raw) ||
        l.evolution.some((e) => e.code.toUpperCase().includes(raw) || e.title.toUpperCase().includes(raw))
    );

    if (foundLin) {
      setSelectedLineage(foundLin);
      const stepIdx = foundLin.evolution.findIndex(
        (e) => e.code.toUpperCase().includes(raw) || e.title.toUpperCase().includes(raw)
      );
      setActiveYearIndex(stepIdx >= 0 ? stepIdx : foundLin.evolution.length - 1);
    }
  };

  const currentStep =
    selectedLineage.evolution[activeYearIndex] ||
    selectedLineage.evolution[selectedLineage.evolution.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--focus-blue, #2563EB)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                STANDARDS HISTORICAL TIME-MACHINE (1950 - 2026)
              </span>
              <span className="concept-status-badge active" style={{ fontSize: '9px' }}>
                SUPERSEDED LINEAGE ENGINE
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Standards Historical Evolution & Supersession Lineage
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Trace standard revisions through 75 years of Indian industrial development to legally defend why historic clauses were superseded.
            </p>
          </div>
        </div>

        {/* Live Search Bar for Withdrawn and Active Standards */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--hairline)' }}>
          <div className="section-label" style={{ margin: '0 0 8px 0' }}>
            LOOKUP ANY STANDARD REVISION OR WITHDRAWN SPECIFICATION:
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#71717A" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Enter any standard code (e.g., IS 8112, IS 12269, IS 226, IS 456, IS 1786, IS 13920, IS 4984)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="auth-input"
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  fontSize: '13px',
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={!searchQuery.trim()}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                whiteSpace: 'nowrap',
              }}
            >
              <History size={15} />
              <span>Trace Lineage</span>
            </button>
          </div>

          {/* Quick Lineage Selector Pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>Core Lineages:</span>
            {LINEAGE_DATABASE.map((lin) => (
              <button
                key={lin.id}
                type="button"
                className={`category-pill ${selectedLineage.id === lin.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedLineage(lin);
                  setActiveYearIndex(lin.evolution.length - 1);
                  setDetectedWithdrawn(null);
                }}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {lin.name.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Withdrawn Standard Detection Banner if Searched */}
      {detectedWithdrawn && (
        <div
          style={{
            padding: '16px 20px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderLeft: '4px solid #EF4444',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeSlideUp 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#EF4444" />
              <strong style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: '#991B1B' }}>
                WITHDRAWN SPECIFICATION DETECTED: {detectedWithdrawn.code}
              </strong>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#991B1B',
                background: '#FEE2E2',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {detectedWithdrawn.severity} TENDER RISK
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#7F1D1D', margin: 0, lineHeight: 1.5 }}>
            {detectedWithdrawn.reason}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }}>
              Statutory Active Successor:
            </span>
            <span
              className="code-monogram"
              style={{ fontSize: '13px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}
            >
              {detectedWithdrawn.replacement}
            </span>
          </div>
        </div>
      )}

      {/* Main Timeline Card */}
      <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 className="workbench-card-title">{selectedLineage.name}</h2>
            <div className="workbench-card-subtitle">{selectedLineage.category}</div>
          </div>
          <span className="badge-code font-mono">
            {selectedLineage.evolution.length} HISTORICAL EPOCHS
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
                      ? 'var(--emerald-pass, #10B981)'
                      : step.status === 'WITHDRAWN'
                      ? '#EF4444'
                      : '#E4E4E7',
                    color: isCurrent || step.status === 'ACTIVE' || step.status === 'WITHDRAWN' ? '#FFFFFF' : '#71717A',
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
                    textAlign: 'center',
                    maxWidth: '80px',
                  }}
                >
                  {step.code.split(' ')[0]} {step.code.split(' ')[1] ? step.code.split(' ')[1].slice(0, 5) : ''}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="code-monogram" style={{ fontSize: '15px', padding: '4px 10px' }}>
                {currentStep.code}
              </span>
              <span
                className="concept-status-badge"
                style={{
                  fontSize: '11px',
                  background: currentStep.status === 'ACTIVE' ? '#DCFCE7' : currentStep.status === 'WITHDRAWN' ? '#FEE2E2' : '#F3F4F6',
                  color: currentStep.status === 'ACTIVE' ? '#166534' : currentStep.status === 'WITHDRAWN' ? '#991B1B' : '#4B5563',
                  border: `1px solid ${currentStep.status === 'ACTIVE' ? '#BBF7D0' : currentStep.status === 'WITHDRAWN' ? '#FECACA' : '#E5E7EB'}`,
                }}
              >
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
            <strong>Historical Significance & Engineering Rationale: </strong>
            {currentStep.changes}
          </div>
        </div>
      </div>
    </div>
  );
};
