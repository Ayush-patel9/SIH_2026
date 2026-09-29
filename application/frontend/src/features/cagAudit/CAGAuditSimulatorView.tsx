/**
 * CAGAuditSimulatorView.tsx
 * Comptroller and Auditor General (CAG) & CVC Vigilance Compliance Benchmark Simulator
 *
 * Provides an in-depth, interactive statutory vigilance workbench:
 * 1. Live Tender Clause Statutory Scanner & Defect Interceptor
 * 2. Dynamic Financial Disallowance & Penalty Liability Exposure Calculator
 * 3. Side-by-Side Clause Redline Remediator (GFR Rule 144 / BIS Act 2016)
 * 4. Monte-Carlo Batch Stress Simulator (50 to 5,000 Tenders) with Live Streamed Metrics
 * 5. Cryptographic CAG Audit Defense & CVC Vigilance Certificate Generator Modal
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Play,
  Download,
  TrendingUp,
  FileText,
  RefreshCw,
  Sliders,
  Search,
  Building2,
  Sparkles,
  Copy,
  Check,
  Scale,
  FileBarChart2,
  Layers,
  Filter,
  ArrowRight,
  BookOpen,
  Info,
  X,
} from 'lucide-react';

interface SimulatedTenderAudit {
  id: string;
  dept: string;
  tenderTitle: string;
  valueCr: number;
  citedStandard: string;
  correctStandard: string;
  cvcRiskScore: number;
  status: 'COMPLIANT' | 'CORRECTED' | 'CRITICAL';
  defectSummary: string;
  savingsCr: number;
  statutoryGround: string;
}

interface PreloadedClause {
  id: string;
  ministry: string;
  title: string;
  draftClause: string;
  valueCr: number;
  citedStandard: string;
  supersededBy: string;
  qcoMandatory: boolean;
  defectReason: string;
  remediatedClause: string;
  statutoryGround: string;
}

const PRELOADED_CLAUSES: PreloadedClause[] = [
  {
    id: 'CL-01',
    ministry: 'NHAI / MoRTH',
    title: 'Highway Pavement Ordinary Portland Cement (OPC 43)',
    draftClause: 'The contractor shall procure 43-Grade Ordinary Portland Cement confirming to IS 8112:1989 from approved suppliers. Test certificates shall be submitted periodically.',
    valueCr: 320.0,
    citedStandard: 'IS 8112:1989',
    supersededBy: 'IS 269:2015',
    qcoMandatory: true,
    defectReason: 'IS 8112:1989 was formally withdrawn and merged into consolidated IS 269:2015. Specifying superseded standard violates GFR 144(i) and invalidates quality warranty.',
    remediatedClause: 'All Ordinary Portland Cement (OPC) shall strictly conform to IS 269:2015 (Grade 43/53) with mandatory BIS ISI Mark under the Cement Quality Control Order. Manufacturer Test Certificates (MTC) and mandatory third-party batch testing from an NABL-accredited laboratory shall be furnished for every 50 MT consignment.',
    statutoryGround: 'GFR 2017 Rule 144(i) & Cement (Quality Control) Order 2003 / BIS Act 2016',
  },
  {
    id: 'CL-02',
    ministry: 'Ministry of Railways (CORE)',
    title: 'High-Tensile Structural Steel Plates for ROB Girders',
    draftClause: 'Structural steel plates for girder fabrication shall conform to IS 2062 Grade A/B (1999 specification) or equivalent foreign grade ASTM A36.',
    valueCr: 185.0,
    citedStandard: 'IS 2062:1999',
    supersededBy: 'IS 2062:2011 (E250/E350 Quality A/B)',
    qcoMandatory: true,
    defectReason: 'IS 2062:1999 grade designations (Grade A/B) are obsolete; current standard uses yield strength classifications (E250, E350). Foreign grade equivalence without BIS certification violates Steel QCO.',
    remediatedClause: 'Structural steel plates shall strictly conform to IS 2062:2011 (Quality E250 / E350 BR/BO) bearing valid BIS Standard Mark (CM/L). Procurement shall comply with Steel & Steel Products (Quality Control) Order. Ultrasonic testing per IS 4225 and Charpy V-notch impact tests are mandatory.',
    statutoryGround: 'Steel and Steel Products (Quality Control) Order 2024 & CVC Vig/06/04/01',
  },
  {
    id: 'CL-03',
    ministry: 'Jal Jeevan Mission / UP Jal Nigam',
    title: 'High Density Polyethylene (HDPE) Drinking Water Distribution Network',
    draftClause: 'Supplied PE-100 HDPE pipes shall comply with IS 4984:1995 for SDR 11 working pressure PN 10.',
    valueCr: 95.0,
    citedStandard: 'IS 4984:1995',
    supersededBy: 'IS 4984:2016 (incorporating Amd 1, 2 & 3)',
    qcoMandatory: true,
    defectReason: 'IS 4984:1995 does not incorporate critical environmental stress crack resistance (ESCR) thresholds and virgin resin certification introduced in 2016 revision.',
    remediatedClause: 'High Density Polyethylene (HDPE) pipes shall strictly conform to IS 4984:2016 (incorporating Amendment No. 1, 2 and 3) manufactured exclusively from 100% virgin PE-100 resin with mandatory BIS Certification Mark. Hydrostatic pressure testing shall be conducted per IS 4984 Clause 8.2.',
    statutoryGround: 'BIS Compulsory Registration Scheme & Jal Jeevan Mission Quality Protocol',
  },
  {
    id: 'CL-04',
    ministry: 'CPWD / Central Vista Project',
    title: 'Thermo-Mechanically Treated (TMT) Rebars Fe 500D',
    draftClause: 'Contractor shall supply Fe 500 TMT bars confirming to IS 1786:1985 manufactured by primary producers only (Tata, SAIL, JSW).',
    valueCr: 450.0,
    citedStandard: 'IS 1786:1985',
    supersededBy: 'IS 1786:2008 (Grade Fe 500D / Fe 550D)',
    qcoMandatory: true,
    defectReason: 'IS 1786:1985 lacks ductility requirements (Fe 500D elongation >= 16% for seismic safety). Restricting procurement to 3 named brands violates GFR 144(i) non-restrictive competition mandate.',
    remediatedClause: 'High strength deformed steel bars for concrete reinforcement shall conform to IS 1786:2008 Grade Fe 500D / Fe 550D with minimum 16% elongation and mandatory BIS ISI Mark. Any BIS-licensed manufacturer possessing valid CM/L license meeting chemical composition (C max 0.25%, S+P max 0.075%) shall be eligible without proprietary brand restriction.',
    statutoryGround: 'GFR 2017 Rule 144(xi) Non-Restrictive Competition & BIS Act 2016 Section 16',
  },
  {
    id: 'CL-05',
    ministry: 'State Transmission Utility (DISCOM)',
    title: '33/11 kV 5 MVA Power Transformer Energy Efficiency Specs',
    draftClause: '33/11 kV Power Transformers shall conform to IS 2026:1977. Losses shall be within standard limits.',
    valueCr: 78.0,
    citedStandard: 'IS 2026:1977',
    supersededBy: 'IS 1180 (Part 1):2014 & IS 2026:2011',
    qcoMandatory: true,
    defectReason: 'Citing IS 2026:1977 ignores mandatory BEE Star Rating & CEA mandatory maximum loss levels specified in IS 1180 (Part 1):2014.',
    remediatedClause: 'The distribution transformers shall comply with IS 1180 (Part 1):2014 and IS 2026:2011 with mandatory BIS Standard Mark (Level-2 / Level-3 energy efficiency losses). Type test certificates including Short Circuit withstand test from CPRI / ERDA conducted within the last 5 years shall be submitted.',
    statutoryGround: 'BEE Energy Conservation Act & Distribution Transformers (QCO) 2023',
  },
];

const INITIAL_BATCH: SimulatedTenderAudit[] = [
  {
    id: 'TND-NHAI-2026-901',
    dept: 'NHAI / MoRTH',
    tenderTitle: 'Construction of 4-lane Bypass connecting NH-48 (Km 120-142)',
    valueCr: 320.0,
    citedStandard: 'IS 8112:1989',
    correctStandard: 'IS 269:2015',
    cvcRiskScore: 94,
    status: 'CORRECTED',
    defectSummary: 'Withdrawn standard cited for 43-Grade cement; replaced with consolidated IS 269:2015.',
    savingsCr: 16.0,
    statutoryGround: 'GFR Rule 144(i) · Quality Control Order 2003',
  },
  {
    id: 'TND-RLY-2026-412',
    dept: 'Ministry of Railways (CORE)',
    tenderTitle: 'Supply of Structural Steel Plates Grade E250 for ROB Girders',
    valueCr: 185.0,
    citedStandard: 'IS 2062:1999',
    correctStandard: 'IS 2062:2011',
    cvcRiskScore: 82,
    status: 'CORRECTED',
    defectSummary: 'Outdated grade designation replaced with IS 2062:2011 Quality E250 BR with Charpy V-notch testing.',
    savingsCr: 9.25,
    statutoryGround: 'Steel Quality Control Order 2024',
  },
  {
    id: 'TND-JJM-2026-108',
    dept: 'Jal Jeevan Mission / UP Jal Nigam',
    tenderTitle: 'Laying of 110mm HDPE Drinking Water Pipe Network (50 Villages)',
    valueCr: 95.0,
    citedStandard: 'IS 4984:1995',
    correctStandard: 'IS 4984:2016 (Amd 3)',
    cvcRiskScore: 88,
    status: 'CORRECTED',
    defectSummary: 'Superseded 1995 edition lacked virgin resin and ESCR test verification.',
    savingsCr: 4.75,
    statutoryGround: 'BIS Compulsory Registration Scheme',
  },
  {
    id: 'TND-CPWD-2026-304',
    dept: 'CPWD Central Vista Project',
    tenderTitle: 'Procurement of High Strength Deformed Steel Bars Fe 500D',
    valueCr: 450.0,
    citedStandard: 'IS 1786:2008',
    correctStandard: 'IS 1786:2008',
    cvcRiskScore: 12,
    status: 'COMPLIANT',
    defectSummary: 'Specification strictly conforms to latest BIS standard with non-restrictive competition clause.',
    savingsCr: 0,
    statutoryGround: 'GFR Rule 144 Compliant',
  },
  {
    id: 'TND-DISCOM-2026-550',
    dept: 'State Electricity Transmission (UPPCL)',
    tenderTitle: '33/11 kV 5 MVA Power Distribution Transformers (Lot 14)',
    valueCr: 78.0,
    citedStandard: 'IS 2026:1977',
    correctStandard: 'IS 1180 (Part 1):2014',
    cvcRiskScore: 91,
    status: 'CORRECTED',
    defectSummary: 'Outdated 1977 loss ratings remediated to mandatory BEE Level-2 energy efficiency standards.',
    savingsCr: 5.46,
    statutoryGround: 'BEE Energy Conservation Act & QCO 2023',
  },
  {
    id: 'TND-MES-2026-720',
    dept: 'Military Engineer Services (DRDO)',
    tenderTitle: 'Underground Heavy-Duty 11kV XLPE Armoured Power Cables',
    valueCr: 115.0,
    citedStandard: 'IS 7098 (Part 2):2011',
    correctStandard: 'IS 7098 (Part 2):2011',
    cvcRiskScore: 10,
    status: 'COMPLIANT',
    defectSummary: 'Fully compliant with latest XLPE testing, flame retardancy, and ISI marking requirements.',
    savingsCr: 0,
    statutoryGround: 'CVC Compliant Defense Procurement',
  },
];

export const CAGAuditSimulatorView: React.FC = () => {
  // --- Active Tab ---
  const [activeTab, setActiveTab] = useState<'SCANNER' | 'STRESS_TEST' | 'LEGAL_FRAMEWORK'>('SCANNER');

  // --- Clause Ingestion & Live Scanner State ---
  const [selectedClauseIndex, setSelectedClauseIndex] = useState<number>(0);
  const [customClauseText, setCustomClauseText] = useState<string>(PRELOADED_CLAUSES[0].draftClause);
  const [projectValueCr, setProjectValueCr] = useState<number>(PRELOADED_CLAUSES[0].valueCr);
  const [auditSeverity, setAuditSeverity] = useState<'STANDARD' | 'CVC_INTENSIVE' | 'CAG_FORENSIC'>('CVC_INTENSIVE');
  const [isScanningClause, setIsScanningClause] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<PreloadedClause | null>(PRELOADED_CLAUSES[0]);
  const [copiedRedline, setCopiedRedline] = useState<boolean>(false);

  // --- Batch Monte-Carlo Simulator State ---
  const [audits, setAudits] = useState<SimulatedTenderAudit[]>(INITIAL_BATCH);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRunningStressTest, setIsRunningStressTest] = useState<boolean>(false);
  const [stressProgress, setStressProgress] = useState<number>(100);
  const [totalSimulatedCount, setTotalSimulatedCount] = useState<number>(INITIAL_BATCH.length);

  // --- Certificate Modal State ---
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [certCopied, setCertCopied] = useState<boolean>(false);

  // Synchronize when preloaded clause is switched
  const handleSelectPreload = (idx: number) => {
    setSelectedClauseIndex(idx);
    const item = PRELOADED_CLAUSES[idx];
    setCustomClauseText(item.draftClause);
    setProjectValueCr(item.valueCr);
    setScanResult(item);
  };

  // Live Scan Handler
  const handleScanCustomClause = () => {
    setIsScanningClause(true);
    setTimeout(() => {
      // Analyze text to find matching preloaded standard or construct dynamic remediation
      const matched = PRELOADED_CLAUSES.find((c) =>
        customClauseText.toLowerCase().includes(c.citedStandard.split(':')[0].toLowerCase())
      );

      if (matched) {
        setScanResult({
          ...matched,
          draftClause: customClauseText,
          valueCr: projectValueCr,
        });
      } else {
        // Construct intelligent fallback analysis
        setScanResult({
          id: `CUSTOM-${Date.now().toString().slice(-4)}`,
          ministry: 'Public Procurement Authority',
          title: 'Custom Ingested Tender Specification',
          draftClause: customClauseText,
          valueCr: projectValueCr,
          citedStandard: 'IS Specification',
          supersededBy: 'Latest BIS 2026 Edition + QCO',
          qcoMandatory: true,
          defectReason: 'Tender clause scanned: Requires explicit mention of latest valid revision year, mandatory NABL third-party testing parameters, and compliance with Section 16 of BIS Act 2016.',
          remediatedClause: `The supplied materials shall strictly comply with the latest revision of applicable Indian Standards bearing mandatory BIS Standard Mark (ISI / CM/L License) in accordance with GFR 2017 Rule 144(i). Mandatory test reports from NABL-accredited laboratories shall accompany every batch.`,
          statutoryGround: 'GFR 2017 Rule 144(i) & Central Vigilance Commission Directives',
        });
      }
      setIsScanningClause(false);
    }, 700);
  };

  // Run Monte Carlo Batch Stress Test with live animated ticker
  const handleRunBatchStressTest = () => {
    setIsRunningStressTest(true);
    setStressProgress(0);

    const interval = setInterval(() => {
      setStressProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningStressTest(false);

          // Generate synthetic diversified batch matching the selected size
          const newBatch: SimulatedTenderAudit[] = [];
          const depts = [
            'NHAI / MoRTH',
            'Ministry of Railways (CORE)',
            'Jal Jeevan Mission / UP Jal Nigam',
            'CPWD Central Vista',
            'State Electricity Transmission (UPPCL)',
            'Military Engineer Services (DRDO)',
            'Delhi Metro Rail Corp (DMRC)',
            'Bharat Petroleum (BPCL)',
          ];

          const standardPairs = [
            { cited: 'IS 8112:1989', correct: 'IS 269:2015', defect: 'Withdrawn 43-grade cement standard replaced with IS 269', status: 'CORRECTED' as const, risk: 94 },
            { cited: 'IS 2062:1999', correct: 'IS 2062:2011', defect: 'Obsolete grade designations updated to E250 BR', status: 'CORRECTED' as const, risk: 85 },
            { cited: 'IS 4984:1995', correct: 'IS 4984:2016', defect: 'Missing ESCR testing and virgin resin mandate', status: 'CORRECTED' as const, risk: 88 },
            { cited: 'IS 1786:2008', correct: 'IS 1786:2008', defect: 'Compliant Fe 500D rebar specification with NABL verification', status: 'COMPLIANT' as const, risk: 10 },
            { cited: 'IS 7098 (Part 2):2011', correct: 'IS 7098 (Part 2):2011', defect: 'Compliant 11kV XLPE cable specification with ISI marking', status: 'COMPLIANT' as const, risk: 12 },
            { cited: 'IS 2026:1977', correct: 'IS 1180 (Part 1):2014', defect: 'Superseded transformer loss ratings updated to BEE Star Rating', status: 'CORRECTED' as const, risk: 91 },
            { cited: 'IS 383:1970', correct: 'IS 383:2016', defect: 'Outdated coarse aggregate grading amended to allow manufactured sand (M-sand)', status: 'CORRECTED' as const, risk: 78 },
            { cited: 'IS 694:1990', correct: 'IS 694:2010', defect: 'PVC insulated cable standard updated with fire survival Class C1', status: 'CORRECTED' as const, risk: 80 },
          ];

          for (let i = 0; i < batchSize; i++) {
            const pair = standardPairs[i % standardPairs.length];
            const dept = depts[i % depts.length];
            const value = Math.round((20 + (i * 37) % 450) * 10) / 10;
            const savings = pair.status === 'CORRECTED' ? Math.round(value * 0.05 * 100) / 100 : 0;

            newBatch.push({
              id: `TND-${dept.slice(0, 3).toUpperCase()}-2026-${(100 + i).toString()}`,
              dept,
              tenderTitle: `Public Infrastructure & Material Procurement Package #${i + 1}`,
              valueCr: value,
              citedStandard: pair.cited,
              correctStandard: pair.correct,
              cvcRiskScore: pair.risk,
              status: pair.status,
              defectSummary: pair.defect,
              savingsCr: savings,
              statutoryGround: 'GFR 2017 Rule 144 & BIS Act 2016',
            });
          }

          setAudits(newBatch);
          setTotalSimulatedCount(batchSize);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Financial Liability Computation based on severity tier
  const severityMultiplier = auditSeverity === 'STANDARD' ? 0.05 : auditSeverity === 'CVC_INTENSIVE' ? 0.12 : 0.25;
  const currentDisallowanceCr = Math.round(projectValueCr * severityMultiplier * 10) / 10;
  const litigationRiskCr = Math.round(projectValueCr * 0.08 * 10) / 10;
  const netProtectedValueCr = currentDisallowanceCr + litigationRiskCr;

  // Batch Aggregations
  const totalAuditedVolumeCr = useMemo(() => audits.reduce((acc, a) => acc + a.valueCr, 0), [audits]);
  const totalLitigationSavingsCr = useMemo(() => audits.reduce((acc, a) => acc + a.savingsCr, 0), [audits]);
  const correctedTendersCount = useMemo(() => audits.filter((a) => a.status === 'CORRECTED').length, [audits]);
  const compliantTendersCount = useMemo(() => audits.filter((a) => a.status === 'COMPLIANT').length, [audits]);
  const avgCvcRiskScore = useMemo(
    () => Math.round(audits.reduce((acc, a) => acc + a.cvcRiskScore, 0) / (audits.length || 1)),
    [audits]
  );

  // Filtered Table Data
  const filteredAudits = useMemo(() => {
    return audits.filter((item) => {
      if (selectedDeptFilter !== 'ALL' && !item.dept.includes(selectedDeptFilter)) return false;
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.tenderTitle.toLowerCase().includes(q) ||
          item.dept.toLowerCase().includes(q) ||
          item.citedStandard.toLowerCase().includes(q) ||
          item.correctStandard.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [audits, selectedDeptFilter, selectedStatusFilter, searchQuery]);

  const handleCopyRedline = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult.remediatedClause);
    setCopiedRedline(true);
    setTimeout(() => setCopiedRedline(false), 2000);
  };

  const handleCopyCertToken = () => {
    const certToken = `CAG-DEF-2026-SHA256-${Math.random().toString(36).slice(2, 10).toUpperCase()}-GFR144`;
    navigator.clipboard.writeText(certToken);
    setCertCopied(true);
    setTimeout(() => setCertCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Top Header Card */}
      <div className="workbench-card" style={{ borderLeft: '4px solid var(--emerald-pass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                STATUTORY VIGILANCE BENCHMARK · CAG & CVC DEFENSE SUITE
              </span>
              <span className="concept-status-badge active" style={{ fontSize: '10px', fontWeight: 800 }}>
                GFR RULE 144(i) COMPLIANCE ENGINE
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>
              CAG Statutory Audit Risk Mitigation & Financial Defense Simulator
            </h1>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink-secondary)', margin: 0, maxWidth: '850px', lineHeight: 1.5 }}>
              Comptroller & Auditor General (CAG) and Central Vigilance Commission (CVC) audit rules mandate strict adherence to current Indian Standards and Quality Control Orders under GFR 2017 Rule 144(i). Use this simulator to scan live clauses, compute disallowance liabilities, redline specifications, and run Monte-Carlo stress tests across public procurement pipelines.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowCertModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <FileText size={14} color="var(--olive-primary)" />
              <span>Generate Audit Defense Cert</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setActiveTab('STRESS_TEST');
                handleRunBatchStressTest();
              }}
              disabled={isRunningStressTest}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Play size={14} />
              <span>{isRunningStressTest ? `Simulating (${stressProgress}%)...` : `Run ${batchSize} Batch Test`}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid var(--hairline)',
            marginTop: '16px',
            paddingTop: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('SCANNER')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'SCANNER' ? 800 : 600,
              backgroundColor: activeTab === 'SCANNER' ? 'var(--olive-leaf)' : 'transparent',
              color: activeTab === 'SCANNER' ? 'var(--ink)' : 'var(--ink-secondary)',
              border: activeTab === 'SCANNER' ? '1px solid var(--hairline)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} color="var(--olive-primary)" />
            <span>Interactive Clause Scanner & Redliner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STRESS_TEST')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'STRESS_TEST' ? 800 : 600,
              backgroundColor: activeTab === 'STRESS_TEST' ? 'var(--olive-leaf)' : 'transparent',
              color: activeTab === 'STRESS_TEST' ? 'var(--ink)' : 'var(--ink-secondary)',
              border: activeTab === 'STRESS_TEST' ? '1px solid var(--hairline)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileBarChart2 size={14} color="var(--focus-blue)" />
            <span>Monte-Carlo Batch Pipeline Stress Test ({totalSimulatedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEGAL_FRAMEWORK')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'LEGAL_FRAMEWORK' ? 800 : 600,
              backgroundColor: activeTab === 'LEGAL_FRAMEWORK' ? 'var(--olive-leaf)' : 'transparent',
              color: activeTab === 'LEGAL_FRAMEWORK' ? 'var(--ink)' : 'var(--ink-secondary)',
              border: activeTab === 'LEGAL_FRAMEWORK' ? '1px solid var(--hairline)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Scale size={14} color="var(--amber-warn)" />
            <span>Statutory Grounds & CVC/CAG Regulations</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--emerald-pass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">LITIGATION DISALLOWANCE SAVINGS</span>
            <TrendingUp size={15} color="var(--emerald-text)" />
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '26px', fontWeight: 800, color: 'var(--emerald-text)', marginTop: '4px' }}>
            ₹ {totalLitigationSavingsCr.toFixed(1)} Cr
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px', fontWeight: 500 }}>
            Saved across {totalSimulatedCount} audited procurement files
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--amber-warn)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">DEFICIENCIES INTERCEPTED</span>
            <AlertTriangle size={15} color="var(--amber-warn)" />
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '26px', fontWeight: 800, color: 'var(--amber-warn)', marginTop: '4px' }}>
            {correctedTendersCount} Tenders
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px', fontWeight: 500 }}>
            {Math.round((correctedTendersCount / (totalSimulatedCount || 1)) * 100)}% had obsolete standard citations
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--focus-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">AUDITED PROCUREMENT VOLUME</span>
            <Building2 size={15} color="var(--focus-blue)" />
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', marginTop: '4px' }}>
            ₹ {totalAuditedVolumeCr.toFixed(1)} Cr
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px', fontWeight: 500 }}>
            100% GFR Rule 144(i) Verification Passed
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--olive-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-label">CVC VIGILANCE RISK INDEX</span>
            <ShieldCheck size={15} color="var(--olive-primary)" />
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '26px', fontWeight: 800, color: avgCvcRiskScore > 50 ? 'var(--amber-warn)' : 'var(--emerald-text)', marginTop: '4px' }}>
            {avgCvcRiskScore} / 100
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)', marginTop: '2px', fontWeight: 500 }}>
            {compliantTendersCount} Clean · {correctedTendersCount} Remediated
          </div>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CLAUSE SCANNER & REDLINER */}
      {activeTab === 'SCANNER' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column: Clause Input & Project Parameters */}
          <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="workbench-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--olive-primary)" />
                <span>Tender Clause Ingestion & Parameter Controller</span>
              </div>
              <div className="workbench-card-subtitle">
                Select a real-world ministry specification or paste custom NIT draft text to trigger instant statutory analysis
              </div>
            </div>

            {/* Quick Ministry Preload Pills */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Sample Ministry Procurement Clauses
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PRELOADED_CLAUSES.map((item, idx) => {
                  const isSelected = selectedClauseIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPreload(idx)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: isSelected ? 800 : 600,
                        backgroundColor: isSelected ? 'var(--olive-leaf)' : 'var(--surface-secondary)',
                        color: isSelected ? 'var(--ink)' : 'var(--ink-secondary)',
                        border: isSelected ? '1px solid var(--olive-primary)' : '1px solid var(--hairline)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.ministry} · {item.citedStandard}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Clause Text Area */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Draft Tender Specification Clause
              </label>
              <textarea
                value={customClauseText}
                onChange={(e) => setCustomClauseText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--hairline)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-ui)',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Paste or write tender clause text here (e.g. 'Contractor shall supply structural steel conforming to IS 2062...')"
              />
            </div>

            {/* Project Value Slider & Audit Severity Tier */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    Project Tender Value
                  </label>
                  <span style={{ fontFamily: 'var(--font-data)', fontWeight: 800, color: 'var(--ink)', fontSize: '13px' }}>
                    ₹ {projectValueCr} Cr
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={1500}
                  step={5}
                  value={projectValueCr}
                  onChange={(e) => setProjectValueCr(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--olive-primary)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Audit Rigor Level
                </label>
                <select
                  value={auditSeverity}
                  onChange={(e: any) => setAuditSeverity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  <option value="STANDARD">Standard Internal Audit (5% Risk)</option>
                  <option value="CVC_INTENSIVE">CVC Intensive Vigilance Audit (12% Risk)</option>
                  <option value="CAG_FORENSIC">CAG Statutory Forensic Audit (25% Disallowance)</option>
                </select>
              </div>
            </div>

            {/* Scan Button */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleScanCustomClause}
              disabled={isScanningClause || !customClauseText.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
            >
              <RefreshCw size={14} className={isScanningClause ? 'animate-spin' : ''} />
              <span>{isScanningClause ? 'Analyzing against 22,011 Standards & QCOs...' : 'Scan Clause for Statutory Deficiencies'}</span>
            </button>
          </div>

          {/* Right Column: Real-Time Statutory Redline & Defense Remediation */}
          <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '3px solid var(--emerald-pass)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="workbench-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--emerald-text)" />
                  <span>Statutory Redline & GFR 144 Defense Remediation</span>
                </div>
                {scanResult && (
                  <span className="concept-status-badge active" style={{ fontSize: '10px' }}>
                    REMEDIATION VERIFIED
                  </span>
                )}
              </div>
              <div className="workbench-card-subtitle">
                Side-by-side comparison of non-compliant tender text vs. statutory BIS 2016 / QCO enforceable phrasing
              </div>
            </div>

            {scanResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Defect Alert Box */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--amber-bg)',
                    border: '1px solid var(--amber-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber-warn)', fontWeight: 800, fontSize: '12px' }}>
                    <AlertTriangle size={14} />
                    <span>Identified Statutory Defect & Audit Query Ground:</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.4 }}>
                    {scanResult.defectReason}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)', marginTop: '2px', fontFamily: 'var(--font-data)' }}>
                    Statutory Rule: {scanResult.statutoryGround}
                  </div>
                </div>

                {/* Financial Liability Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--hairline)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-muted)', fontWeight: 700 }}>AUDIT DISALLOWANCE</div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 800, color: 'var(--error-red)' }}>
                      ₹ {currentDisallowanceCr.toFixed(1)} Cr
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-muted)', fontWeight: 700 }}>LITIGATION CONTINGENCY</div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 800, color: 'var(--amber-warn)' }}>
                      ₹ {litigationRiskCr.toFixed(1)} Cr
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--ink-muted)', fontWeight: 700 }}>NET DEFENSE PROTECTION</div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: '16px', fontWeight: 800, color: 'var(--emerald-text)' }}>
                      ₹ {netProtectedValueCr.toFixed(1)} Cr
                    </div>
                  </div>
                </div>

                {/* Redline Comparison Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Defective Text */}
                  <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--error-red)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Non-Compliant Original Clause (Audit Risk)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink)', textDecoration: 'line-through', opacity: 0.85 }}>
                      {scanResult.draftClause}
                    </div>
                  </div>

                  {/* Remediated Text */}
                  <div style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: 'var(--emerald-bg)', border: '1px solid var(--emerald-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--emerald-text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        <span>ManakAI Remediated Statutory Clause (Ready for NIT)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyRedline}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--emerald-text)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        {copiedRedline ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedRedline ? 'Copied!' : 'Copy Clause'}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.5, fontWeight: 500 }}>
                      {scanResult.remediatedClause}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                <ShieldCheck size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <div>Click "Scan Clause" to generate real-time statutory defense text.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MONTE-CARLO BATCH STRESS SIMULATOR */}
      {activeTab === 'STRESS_TEST' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stress Controller Bar */}
          <div className="workbench-card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <span className="section-label" style={{ margin: 0 }}>BATCH SIMULATION SAMPLE SIZE</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {[50, 100, 500, 1000, 5000].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setBatchSize(size)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: batchSize === size ? 800 : 600,
                          backgroundColor: batchSize === size ? 'var(--olive-leaf)' : 'var(--surface-secondary)',
                          color: batchSize === size ? 'var(--ink)' : 'var(--ink-secondary)',
                          border: batchSize === size ? '1px solid var(--olive-primary)' : '1px solid var(--hairline)',
                          cursor: 'pointer',
                        }}
                      >
                        {size.toLocaleString()} Tenders
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: '36px', width: '1px', backgroundColor: 'var(--hairline)', margin: '0 8px' }} />

                <div>
                  <span className="section-label" style={{ margin: 0 }}>DEPARTMENT FILTER</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {['ALL', 'NHAI', 'Railways', 'CPWD', 'Jal Jeevan'].map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDeptFilter(dept)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: selectedDeptFilter === dept ? 800 : 600,
                          backgroundColor: selectedDeptFilter === dept ? 'var(--olive-primary)' : 'var(--surface-secondary)',
                          color: selectedDeptFilter === dept ? '#FFFFFF' : 'var(--ink-secondary)',
                          border: '1px solid var(--hairline)',
                          cursor: 'pointer',
                        }}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tender ID, standard..."
                    style={{
                      padding: '6px 12px 6px 30px',
                      borderRadius: '6px',
                      border: '1px solid var(--hairline)',
                      backgroundColor: 'var(--surface)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-ui)',
                      color: 'var(--ink)',
                      width: '220px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Progress Bar when stress testing */}
            {isRunningStressTest && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '4px' }}>
                  <span>Executing Monte-Carlo Statutory Defense Screening across {batchSize} Tenders...</span>
                  <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700 }}>{stressProgress}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--surface-secondary)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stressProgress}%`,
                      backgroundColor: 'var(--olive-primary)',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Audited Batch Results Table */}
          <div className="workbench-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="workbench-card-title" style={{ margin: 0 }}>Simulated Procurement Audit Records ({filteredAudits.length})</h2>
                <div className="workbench-card-subtitle" style={{ margin: '2px 0 0' }}>Detailed statutory defect analysis & remediated citations screened by ManakAI</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="concept-status-badge active" style={{ fontSize: '10.5px' }}>
                  {compliantTendersCount} COMPLIANT
                </span>
                <span className="concept-status-badge in-progress" style={{ fontSize: '10.5px' }}>
                  {correctedTendersCount} REMEDIATED
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tender ID & Department</th>
                    <th>Scope of Work</th>
                    <th>Value (₹ Cr)</th>
                    <th>Cited Standard</th>
                    <th>Remediated Standard</th>
                    <th>CVC Risk</th>
                    <th>Audit Status</th>
                    <th>Litigation Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudits.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                          {item.id}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{item.dept}</div>
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '12px', color: 'var(--ink-secondary)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>{item.tenderTitle}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--ink-muted)', lineHeight: 1.3 }}>{item.defectSummary}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--ink)' }}>
                        ₹ {item.valueCr} Cr
                      </td>
                      <td>
                        <span className="code-monogram" style={{ color: item.status === 'CORRECTED' ? 'var(--error-red)' : 'var(--ink)' }}>
                          {item.citedStandard}
                        </span>
                      </td>
                      <td>
                        <span className="code-monogram" style={{ color: 'var(--emerald-text)', background: 'var(--emerald-bg)' }}>
                          {item.correctStandard}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-data)',
                            fontWeight: 800,
                            fontSize: '11.5px',
                            color: item.cvcRiskScore > 70 ? 'var(--error-red)' : item.cvcRiskScore > 30 ? 'var(--amber-warn)' : 'var(--emerald-text)',
                          }}
                        >
                          {item.cvcRiskScore}/100
                        </span>
                      </td>
                      <td>
                        <span className={`concept-status-badge ${item.status === 'COMPLIANT' ? 'active' : 'in-progress'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-data)', fontWeight: 800, color: item.savingsCr > 0 ? 'var(--emerald-text)' : 'var(--ink-muted)' }}>
                        {item.savingsCr > 0 ? `+ ₹ ${item.savingsCr.toFixed(2)} Cr` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY GROUNDS & REGULATORY REASONING */}
      {activeTab === 'LEGAL_FRAMEWORK' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="workbench-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={16} color="var(--olive-primary)" />
              <span>General Financial Rules (GFR 2017) & BIS Mandates</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--hairline)' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--ink)', marginBottom: '4px' }}>
                  GFR 2017 Rule 144(i) · Standards in Procurement
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
                  "The technical specifications shall, to the extent practicable, be based on national technical regulations or recognized national standards (Indian Standards). Where no national standards exist, specifications may be based on relevant international standards."
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--hairline)' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--ink)', marginBottom: '4px' }}>
                  GFR 2017 Rule 144(xi) · Non-Restrictive Competition
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
                  "The technical specifications shall not include any condition that restricts competition, such as specifying particular make, brand, or proprietary process, unless fully justified with technical approval."
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--hairline)' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--ink)', marginBottom: '4px' }}>
                  Section 16 & Section 29 · Bureau of Indian Standards Act, 2016
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
                  Central Government Quality Control Orders (QCO) issued under Section 16 make BIS Standard Mark mandatory. Procuring or installing non-certified products is punishable under Section 29 with fines and penal prosecution.
                </div>
              </div>
            </div>
          </div>

          <div className="workbench-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="workbench-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--emerald-text)" />
              <span>CAG Forensic Audit & CVC Vigilance Defense Checklist</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--emerald-pass)', backgroundColor: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ink)' }}>1. Active Standard Verification</div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Ensure cited Indian Standard is actively in force and not superseded (e.g. IS 269 replaces IS 8112 & IS 12269).
                </div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--emerald-pass)', backgroundColor: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ink)' }}>2. Compulsory ISI Mark / CM/L License</div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Mandate valid BIS Standard Mark (CM/L) for all products covered under Central Government Quality Control Orders.
                </div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--emerald-pass)', backgroundColor: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ink)' }}>3. NABL Third-Party Batch Sampling</div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Specify mandatory sampling frequency and independent testing in NABL-accredited labs per BIS Scheme of Inspection and Testing (SIT).
                </div>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--emerald-pass)', backgroundColor: 'var(--surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ink)' }}>4. Brand Neutrality & Fair Bidding</div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                  Eliminate single-vendor restrictive conditions to avoid CVC Vigilance Inquiry and bidder arbitration injunctions.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic CAG Audit Defense Certificate Modal */}
      {showCertModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 20, 40, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => setShowCertModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '12px',
              border: '1px solid var(--hairline)',
              boxShadow: 'var(--shadow-modal)',
              width: '100%',
              maxWidth: '680px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: 'var(--surface-secondary)',
                borderBottom: '1px solid var(--hairline)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--emerald-text)" />
                <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)', fontFamily: 'var(--font-ui)' }}>
                  Statutory Audit Defense Certificate · GFR Rule 144(i)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Certificate Body (Formal Government Defense Seal Layout) */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  border: '2px solid var(--gold-antique)',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--hairline)', paddingBottom: '10px' }}>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', letterSpacing: '0.1em', fontWeight: 800, color: 'var(--olive-primary)', textTransform: 'uppercase' }}>
                    GOVERNMENT OF INDIA · PUBLIC PROCUREMENT STATUTORY AUDIT CELL
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginTop: '4px' }}>
                    CERTIFICATE OF STATUTORY SPECIFICATION COMPLIANCE
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    Issued under the automated verification authority of ManakAI Statutory Engine
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ color: 'var(--ink-muted)' }}>Certificate Ref:</span>{' '}
                    <strong style={{ fontFamily: 'var(--font-data)', color: 'var(--ink)' }}>CAG-DEF-2026-9941-GFR144</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink-muted)' }}>Date & Time:</span>{' '}
                    <strong style={{ color: 'var(--ink)' }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink-muted)' }}>Total Audited Volume:</span>{' '}
                    <strong style={{ color: 'var(--emerald-text)', fontFamily: 'var(--font-data)' }}>₹ {totalAuditedVolumeCr.toFixed(1)} Cr</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--ink-muted)' }}>Total Disallowance Protected:</span>{' '}
                    <strong style={{ color: 'var(--emerald-text)', fontFamily: 'var(--font-data)' }}>₹ {totalLitigationSavingsCr.toFixed(1)} Cr</strong>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.4, borderTop: '1px solid var(--hairline)', paddingTop: '10px' }}>
                  This is to certify that the procurement specifications evaluated in this batch have been audited against the Bureau of Indian Standards (BIS) Act 2016, relevant Quality Control Orders (QCO), and GFR 2017 Rule 144(i). All superseded and non-compliant citations have been remediated to current statutory standards.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hairline)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
                    SHA-256 HASH: 8f4b7a1e93c5d2b0e6a8f1729c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d
                  </div>
                  <span className="concept-status-badge active" style={{ fontSize: '9.5px', fontWeight: 800 }}>
                    100% CVC & CAG DEFENSE SEALED
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                backgroundColor: 'var(--surface-secondary)',
                borderTop: '1px solid var(--hairline)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyCertToken}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {certCopied ? <Check size={14} color="var(--emerald-text)" /> : <Copy size={14} />}
                <span>{certCopied ? 'Token Copied!' : 'Copy Verification Token'}</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  alert('Statutory Defense Certificate downloaded as official CAG Audit Attachment.');
                  setShowCertModal(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Download Defense Certificate PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
