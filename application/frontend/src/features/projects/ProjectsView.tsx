import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Upload,
  ExternalLink,
  RotateCcw,
  Check,
  X,
  Layers,
  Building,
  DollarSign,
  Eye,
  Info
} from 'lucide-react';
import { useSession } from '../../store/userStore';
import type { UserRole } from '../../types';

export interface ClauseSuggestion {
  clauseId: string;
  clauseNumber: string;
  title: string;
  citedStandard: string;
  status: 'WITHDRAWN' | 'OUTDATED' | 'AMENDMENT_NEEDED' | 'MISSING_STANDARD' | 'ACTIVE';
  aiRecommendation: string;
  recommendedStandard: string;
  alternatives: Array<{
    standard: string;
    title: string;
    description: string;
    tag: string;
  }>;
  userDecision?: 'APPROVED' | 'OVERRIDDEN' | 'PENDING';
  chosenStandard?: string;
  overrideReason?: string;
  page?: number;
}

export interface TenderProject {
  id: string;
  nitNumber: string;
  title: string;
  department: string;
  estimatedValue: string;
  lastModified: string;
  recencyTimestamp: number;
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'COMPLIANT' | 'PUBLISHED';
  complianceScore: number;
  clauses: ClauseSuggestion[];
  hasPdfUploaded: boolean;
  pdfFileName?: string;
}

const INITIAL_PROJECTS: TenderProject[] = [
  {
    id: 'proj-nhai-088',
    nitNumber: 'NIT-NHAI-NCR-2026-088',
    title: 'Construction of 6-Lane Flyover & Bridge Superstructure on NH-48',
    department: 'National Highways Authority of India (NHAI)',
    estimatedValue: '₹148.50 Crores',
    lastModified: 'Just now',
    recencyTimestamp: Date.now() - 1000 * 60 * 5, // 5 min ago
    status: 'NEEDS_REVIEW',
    complianceScore: 78,
    hasPdfUploaded: true,
    pdfFileName: 'MOCK_GOVERNMENT_TENDER_NIT_2026.pdf',
    clauses: [
      {
        clauseId: 'cl-1',
        clauseNumber: 'Clause 4.1.2',
        title: 'Ordinary Portland Cement (OPC) 43 Grade',
        citedStandard: 'IS 8112:1989',
        status: 'WITHDRAWN',
        recommendedStandard: 'IS 269:2015',
        aiRecommendation: 'Standard IS 8112 was officially withdrawn in 2015 and consolidated into IS 269:2015 Clause 5.1 under the Cement Quality Control Order (GSR 739(E)).',
        userDecision: 'PENDING',
        alternatives: [
          { standard: 'IS 269:2015', title: 'Ordinary Portland Cement (33, 43, 53)', description: 'Recommended active consolidated standard covering 43 Grade OPC.', tag: 'Primary / Recommended' },
          { standard: 'IS 1489 (Part 1):2015', title: 'Portland Pozzolana Cement (Fly Ash)', description: 'Permitted low-heat, high-durability option under IRC 112 bridge code.', tag: 'Eco Alternative' },
          { standard: 'IS 455:2015', title: 'Portland Slag Cement', description: 'Permitted option for high sulphate or marine environments.', tag: 'Alternative' },
        ],
      },
      {
        clauseId: 'cl-2',
        clauseNumber: 'Clause 4.2.5',
        title: 'High Yield Strength Deformed (HYSD) Rebar',
        citedStandard: 'IS 1786:1985 Fe 415',
        status: 'OUTDATED',
        recommendedStandard: 'IS 1786:2008 Grade Fe 500D',
        aiRecommendation: 'Fe 415 under the 1985 edition lacks ductility thresholds mandated by IS 13920:2016 for Seismic Zones IV & V. Upgrade to Fe 500D with uniform elongation ≥ 5%.',
        userDecision: 'PENDING',
        alternatives: [
          { standard: 'IS 1786:2008 Fe 500D', title: 'High Ductility TMT Rebar (Fe 500D)', description: 'Mandatory standard for high-seismic bridge superstructures.', tag: 'Primary / Recommended' },
          { standard: 'IS 1786:2008 Fe 550D', title: 'High Strength Rebar (Fe 550D)', description: 'Higher yield strength for heavy-span girder reinforcement.', tag: 'Heavy Duty' },
        ],
      },
      {
        clauseId: 'cl-3',
        clauseNumber: 'Clause 6.3.1',
        title: 'HDPE Utility Drainage & Rainwater Pipes',
        citedStandard: 'IS 4984:1995 PE-80',
        status: 'AMENDMENT_NEEDED',
        recommendedStandard: 'IS 4984:2016 Amd 3 PE-100',
        aiRecommendation: 'IS 4984:1995 was superseded by IS 4984:2016. High-density resin PE-100 is required for hydrostatic durability under Ministry QCO 2021.',
        userDecision: 'PENDING',
        alternatives: [
          { standard: 'IS 4984:2016 Amd 3', title: 'HDPE Pipes for Water Supply (PE-100)', description: 'Current active revision with latest hydrostatic burst test limits.', tag: 'Primary / Recommended' },
        ],
      },
      {
        clauseId: 'cl-4',
        clauseNumber: 'Clause 7.1.4',
        title: 'Structural Steel Plates for Composite Girders',
        citedStandard: 'IS 2062:2011 Grade E250 Quality A',
        status: 'ACTIVE',
        recommendedStandard: 'IS 2062:2011 Grade E250',
        aiRecommendation: 'Active and compliant Indian Standard under Steel QCO. Verify allied Charpy V-notch impact testing to IS 1757.',
        userDecision: 'APPROVED',
        chosenStandard: 'IS 2062:2011 Grade E250',
        alternatives: [
          { standard: 'IS 2062:2011 Grade E250', title: 'Hot Rolled Structural Steel E250', description: 'Standard compliant structural grade.', tag: 'Active' },
        ],
      },
      {
        clauseId: 'cl-5',
        clauseNumber: 'Clause 9.2.0',
        title: 'Highway Traffic Surveillance IP CCTV Cameras',
        citedStandard: 'Uncertified Specifications',
        status: 'MISSING_STANDARD',
        recommendedStandard: 'IS 13252 (Part 1) & IS 16842:2020',
        aiRecommendation: 'Surveillance equipment must possess mandatory MeitY Compulsory Registration Scheme (CRS) certification under IS 13252 (Part 1) and video stream standard IS 16842.',
        userDecision: 'PENDING',
        alternatives: [
          { standard: 'IS 13252 (Part 1) / IS 16842', title: 'BIS CRS Electronics Safety & CCTV Spec', description: 'Mandatory statutory CRS registration under Electronics Order.', tag: 'Statutory Mandate' },
        ],
      },
    ],
  },
  {
    id: 'proj-cpwd-042',
    nitNumber: 'NIT-CPWD-AIIMS-2026-042',
    title: 'Modernization & Electrification of Surgical Wing, AIIMS Delhi',
    department: 'Central Public Works Department (CPWD)',
    estimatedValue: '₹42.80 Crores',
    lastModified: '4 hours ago',
    recencyTimestamp: Date.now() - 1000 * 60 * 60 * 4,
    status: 'COMPLIANT',
    complianceScore: 100,
    hasPdfUploaded: false,
    clauses: [
      {
        clauseId: 'cl-cpwd-1',
        clauseNumber: 'Clause 3.1.0',
        title: 'Fire Rated Metal Doorsets (2 Hours)',
        citedStandard: 'IS 3614:2021',
        status: 'ACTIVE',
        recommendedStandard: 'IS 3614:2021',
        aiRecommendation: 'Fully compliant with National Building Code (NBC 2016 Part 4) and active standard IS 3614:2021.',
        userDecision: 'APPROVED',
        chosenStandard: 'IS 3614:2021',
        alternatives: [],
      },
      {
        clauseId: 'cl-cpwd-2',
        clauseNumber: 'Clause 5.2.4',
        title: 'Low Smoke Zero Halogen (FRLS-H) Copper Cables',
        citedStandard: 'IS 694:2010',
        status: 'ACTIVE',
        recommendedStandard: 'IS 694:2010',
        aiRecommendation: 'Meets mandatory safety parameters for healthcare facilities. Allied testing: IS 10810 (Oxygen index ≥ 29%).',
        userDecision: 'APPROVED',
        chosenStandard: 'IS 694:2010',
        alternatives: [],
      },
    ],
  },
  {
    id: 'proj-dfccil-119',
    nitNumber: 'NIT-MOR-DFCCIL-2026-119',
    title: 'Dedicated Freight Corridor Track Laying & Pre-Stressed Concrete Sleepers',
    department: 'Ministry of Railways (DFCCIL)',
    estimatedValue: '₹310.00 Crores',
    lastModified: 'Yesterday',
    recencyTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'NEEDS_REVIEW',
    complianceScore: 84,
    hasPdfUploaded: false,
    clauses: [
      {
        clauseId: 'cl-dfc-1',
        clauseNumber: 'Clause 2.1.8',
        title: 'Pre-Stressed Concrete Sleepers (Heavy Axle 25T)',
        citedStandard: 'IS 1343:1980',
        status: 'OUTDATED',
        recommendedStandard: 'IS 1343:2012',
        aiRecommendation: 'IS 1343:1980 superseded by IS 1343:2012 (Code of Practice for Pre-stressed Concrete). Required for 25T axle loading fatigue limits.',
        userDecision: 'PENDING',
        alternatives: [
          { standard: 'IS 1343:2012', title: 'Pre-Stressed Concrete Code of Practice', description: 'Updated limit state design code.', tag: 'Primary / Recommended' },
        ],
      },
    ],
  },
  {
    id: 'proj-dmrc-071',
    nitNumber: 'NIT-DMRC-PHASE4-071',
    title: 'Underground Metro Tunnel Jet Ventilation Fans & Emergency Dampers',
    department: 'Delhi Metro Rail Corporation (DMRC)',
    estimatedValue: '₹88.20 Crores',
    lastModified: '3 days ago',
    recencyTimestamp: Date.now() - 1000 * 60 * 60 * 72,
    status: 'PUBLISHED',
    complianceScore: 96,
    hasPdfUploaded: false,
    clauses: [
      {
        clauseId: 'cl-dmrc-1',
        clauseNumber: 'Clause 8.4.1',
        title: 'High Temperature Jet Fans (400°C for 2 Hours)',
        citedStandard: 'IS/ISO 5801:2017 & EN 12101-3',
        status: 'ACTIVE',
        recommendedStandard: 'IS/ISO 5801:2017',
        aiRecommendation: 'Standard verified for subterranean fire smoke extraction.',
        userDecision: 'APPROVED',
        chosenStandard: 'IS/ISO 5801:2017',
        alternatives: [],
      },
    ],
  },
];

interface ProjectsViewProps {
  onNavigateToTenderUpload: () => void;
  onNavigateToNeuralMesh: (standard?: string) => void;
  onNavigateToAudit?: (tenderId?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onNavigateToTenderUpload,
  onNavigateToNeuralMesh,
  onNavigateToAudit,
}) => {
  const { session } = useSession();
  const role: UserRole = session?.role || 'PROCUREMENT_OFFICER';

  const [projects, setProjects] = useState<TenderProject[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-nhai-088');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'NEEDS_REVIEW' | 'COMPLIANT' | 'PUBLISHED'>('ALL');
  const [activeModalClause, setActiveModalClause] = useState<ClauseSuggestion | null>(null);
  const [customOverrideInput, setCustomOverrideInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter projects list
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'ALL') return true;
    return p.status === filterTab;
  });

  // Action: Approve AI recommended standard
  const handleApproveStandard = (projectId: string, clauseId: string, standardToApply: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedClauses = proj.clauses.map((c) => {
          if (c.clauseId !== clauseId) return c;
          return {
            ...c,
            userDecision: 'APPROVED' as const,
            chosenStandard: standardToApply,
            status: 'ACTIVE' as const,
          };
        });

        // Recalculate compliance score
        const resolvedCount = updatedClauses.filter((c) => c.status === 'ACTIVE' || c.userDecision === 'APPROVED' || c.userDecision === 'OVERRIDDEN').length;
        const newScore = Math.round((resolvedCount / updatedClauses.length) * 100);
        const newStatus = newScore === 100 ? 'COMPLIANT' : 'NEEDS_REVIEW';

        return {
          ...proj,
          clauses: updatedClauses,
          complianceScore: newScore,
          status: newStatus,
          lastModified: 'Just now',
          recencyTimestamp: Date.now(),
        };
      })
    );
    showToast(`✓ Standard updated to ${standardToApply} for ${clauseId}`);
  };

  // Action: Apply alternative or custom override
  const handleApplyAlternative = (standard: string, reason?: string) => {
    if (!activeModalClause) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== selectedProjectId) return proj;
        const updatedClauses = proj.clauses.map((c) => {
          if (c.clauseId !== activeModalClause.clauseId) return c;
          return {
            ...c,
            userDecision: 'OVERRIDDEN' as const,
            chosenStandard: standard,
            overrideReason: reason || 'Specified by procurement engineer',
            status: 'ACTIVE' as const,
          };
        });

        const resolvedCount = updatedClauses.filter((c) => c.status === 'ACTIVE' || c.userDecision === 'APPROVED' || c.userDecision === 'OVERRIDDEN').length;
        const newScore = Math.round((resolvedCount / updatedClauses.length) * 100);

        return {
          ...proj,
          clauses: updatedClauses,
          complianceScore: newScore,
          status: newScore === 100 ? 'COMPLIANT' : 'NEEDS_REVIEW',
          lastModified: 'Just now',
          recencyTimestamp: Date.now(),
        };
      })
    );
    setActiveModalClause(null);
    setCustomOverrideInput('');
    setOverrideReasonInput('');
    showToast(`✓ Custom selection saved: ${standard}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '85vh' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-data)',
            fontSize: '13px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={16} color="var(--active-green)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="workbench-card"
        style={{
          background: 'linear-gradient(135deg, rgba(54, 69, 47, 0.06) 0%, rgba(200, 185, 154, 0.12) 100%)',
          border: '1px solid var(--hairline)',
          borderLeft: '4px solid var(--forest)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="concept-status-badge active">
              {role === 'VENDOR' ? 'VENDOR TENDER MARKETPLACE' : role === 'AUDITOR' ? 'CAG & CVC VIGILANCE QUEUE' : 'PROCUREMENT WORKSPACE'}
            </span>
            <span className="section-label" style={{ margin: 0 }}>RECENCY-SORTED NIT DATABASE</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {role === 'VENDOR'
              ? 'Public Procurement Tenders & BIS Technical Specifications'
              : 'Procurement Projects & Standards Modernization Ledger'}
          </h2>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', margin: '4px 0 0 0', maxWidth: '850px' }}>
            {role === 'VENDOR'
              ? 'Explore open government tenders, verify mandatory Indian Standards (IS Codes) and testing protocols for bidding eligibility.'
              : 'Review recent tender drafts, inspect AI-extracted clauses, approve BIS supersession suggestions or customize alternative standards with audit justification.'}
          </p>
        </div>

        {/* Primary Action Button */}
        {role !== 'VENDOR' && (
          <button
            onClick={onNavigateToTenderUpload}
            className="action-btn primary"
            style={{
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-data)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(54,69,47,0.2)',
              cursor: 'pointer',
            }}
          >
            <Upload size={16} />
            <span>Upload New Tender (PDF / Text)</span>
          </button>
        )}
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Recency-Based Projects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search & Filter Bar */}
          <div className="workbench-card" style={{ padding: '14px' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--ink-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenders, NITs, departments..."
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  borderRadius: '6px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-data)',
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(['ALL', 'NEEDS_REVIEW', 'COMPLIANT', 'PUBLISHED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: filterTab === tab ? 'var(--forest)' : 'var(--hairline)',
                    background: filterTab === tab ? 'var(--forest)' : 'transparent',
                    color: filterTab === tab ? 'var(--paper)' : 'var(--ink-secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-data)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab === 'ALL' ? 'All (4)' : tab === 'NEEDS_REVIEW' ? 'Action Needed' : tab === 'COMPLIANT' ? 'Compliant' : 'Published'}
                </button>
              ))}
            </div>
          </div>

          {/* List of Projects sorted by recency */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredProjects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className="workbench-card"
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--forest)' : 'var(--hairline)',
                    background: isSelected ? 'rgba(54, 69, 47, 0.04)' : 'var(--surface)',
                    boxShadow: isSelected ? '0 4px 12px rgba(54,69,47,0.12)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Row: Department & Recency */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '10px',
                        color: 'var(--forest)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {project.department.split('(')[1]?.replace(')', '') || project.department.slice(0, 15)}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'var(--font-data)',
                        fontSize: '11px',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      <Clock size={11} />
                      {project.lastModified}
                    </span>
                  </div>

                  {/* Title & NIT */}
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', lineHeight: '1.4', marginBottom: '4px' }}>
                    {project.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '10px' }}>
                    {project.nitNumber}
                  </div>

                  {/* Bottom Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hairline)', paddingTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                      {project.estimatedValue}
                    </span>

                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-data)',
                        background:
                          project.status === 'COMPLIANT'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : project.status === 'PUBLISHED'
                            ? 'rgba(37, 99, 235, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color:
                          project.status === 'COMPLIANT'
                            ? 'var(--active-green)'
                            : project.status === 'PUBLISHED'
                            ? 'var(--collapse-cobalt)'
                            : 'var(--superseded-red)',
                      }}
                    >
                      {project.status === 'COMPLIANT'
                        ? '100% COMPLIANT'
                        : project.status === 'PUBLISHED'
                        ? 'PUBLISHED'
                        : `${project.complianceScore}% HEALTH`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Project Detail & Interactive Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Project Summary Header */}
          <div className="workbench-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '11px',
                      background: 'var(--hairline)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    {selectedProject.nitNumber}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>• {selectedProject.department}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--ink)' }}>
                  {selectedProject.title}
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-data)' }}>
                  <span>Estimated Value: <strong style={{ color: 'var(--ink)' }}>{selectedProject.estimatedValue}</strong></span>
                  <span>Last Modified: <strong>{selectedProject.lastModified}</strong></span>
                </div>
              </div>

              {/* Action Buttons for this Project */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => onNavigateToNeuralMesh(selectedProject.clauses[0]?.recommendedStandard || 'IS 269:2015')}
                  className="action-btn secondary"
                  style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={14} />
                  <span>Inspect in 3D Mesh</span>
                </button>

                {role !== 'VENDOR' && (
                  <button
                    onClick={onNavigateToTenderUpload}
                    className="action-btn primary"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={14} />
                    <span>Open in Split-Screen Annotator</span>
                  </button>
                )}
              </div>
            </div>

            {/* Compliance Health Progress Bar */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {role === 'VENDOR' ? 'BIS Specification Verification Rate' : 'BIS Modernization & QCO Compliance Health'}
                </span>
                <span style={{ fontWeight: 700, color: selectedProject.complianceScore === 100 ? 'var(--active-green)' : 'var(--superseded-red)' }}>
                  {selectedProject.complianceScore}% ({selectedProject.clauses.filter((c) => c.status === 'ACTIVE' || c.userDecision === 'APPROVED' || c.userDecision === 'OVERRIDDEN').length} / {selectedProject.clauses.length} Standards Compliant)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--hairline)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${selectedProject.complianceScore}%`,
                    height: '100%',
                    background: selectedProject.complianceScore === 100 ? 'var(--active-green)' : 'var(--superseded-red)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clauses & Suggestions Table / Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontFamily: 'var(--font-data)', fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {role === 'VENDOR' ? 'Tender Material Specifications & Mandatory Indian Standards' : 'Extracted Clauses & AI Suggested Indian Standards'}
              </h4>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                {selectedProject.clauses.length} Material Clauses Analyzed
              </span>
            </div>

            {selectedProject.clauses.map((clause, idx) => {
              const isResolved = clause.userDecision === 'APPROVED' || clause.userDecision === 'OVERRIDDEN' || clause.status === 'ACTIVE';

              return (
                <div
                  key={clause.clauseId}
                  className="workbench-card"
                  style={{
                    padding: '16px',
                    borderLeft: `4px solid ${
                      isResolved ? 'var(--active-green)' : clause.status === 'WITHDRAWN' ? 'var(--superseded-red)' : 'var(--proactive-amber)'
                    }`,
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--forest)' }}>
                          {clause.clauseNumber}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{clause.title}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink-secondary)' }}>
                        Specified in Tender: <code style={{ background: 'var(--hairline)', padding: '2px 6px', borderRadius: '3px' }}>{clause.citedStandard}</code>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-data)',
                        background:
                          isResolved
                            ? 'rgba(34, 197, 94, 0.12)'
                            : clause.status === 'WITHDRAWN'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(245, 158, 11, 0.12)',
                        color:
                          isResolved
                            ? 'var(--active-green)'
                            : clause.status === 'WITHDRAWN'
                            ? 'var(--superseded-red)'
                            : 'var(--proactive-amber)',
                      }}
                    >
                      {clause.userDecision === 'APPROVED'
                        ? '✓ APPROVED'
                        : clause.userDecision === 'OVERRIDDEN'
                        ? '⚡ CUSTOM OVERRIDE'
                        : clause.status === 'WITHDRAWN'
                        ? 'WITHDRAWN (ACTION REQUIRED)'
                        : clause.status === 'OUTDATED'
                        ? 'OUTDATED REVISION'
                        : clause.status === 'AMENDMENT_NEEDED'
                        ? 'AMENDMENT APPLIED'
                        : 'COMPLIANT'}
                    </span>
                  </div>

                  {/* Recommendation Box */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '12px',
                      fontSize: '13px',
                      fontFamily: 'var(--font-prose)',
                      color: 'var(--ink)',
                      lineHeight: '1.5',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: 'var(--forest)' }}>
                      <Sparkles size={12} />
                      <span>RECOMMENDED BIS STANDARD: {clause.recommendedStandard}</span>
                    </div>
                    {clause.aiRecommendation}

                    {clause.chosenStandard && clause.chosenStandard !== clause.recommendedStandard && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--forest)', fontWeight: 600 }}>
                        Applied User Standard: {clause.chosenStandard} {clause.overrideReason ? `(${clause.overrideReason})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Interactive Action Bar (Approve vs Alternatives) */}
                  {role !== 'VENDOR' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                      {clause.userDecision === 'APPROVED' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--active-green)', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-data)' }}>
                          <CheckCircle2 size={16} />
                          <span>Standard applied to tender</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveModalClause(clause)}
                            className="action-btn secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontFamily: 'var(--font-data)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>Options & Alternatives...</span>
                          </button>

                          <button
                            onClick={() => handleApproveStandard(selectedProject.id, clause.clauseId, clause.recommendedStandard)}
                            className="action-btn primary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontFamily: 'var(--font-data)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Check size={14} />
                            <span>Approve {clause.recommendedStandard}</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Vendor Specific view: Mandatory Bidding Testing Checklist */}
                  {role === 'VENDOR' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hairline)', paddingTop: '8px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
                      <span style={{ color: 'var(--ink-secondary)' }}>
                        Mandatory BIS Testing Code: <strong>{clause.clauseId === 'cl-1' ? 'IS 4031 / IS 4032' : clause.clauseId === 'cl-2' ? 'IS 1608 (Tensile) & IS 1599 (Bend)' : 'IS 2530'}</strong>
                      </span>
                      <button
                        onClick={() => onNavigateToNeuralMesh(clause.recommendedStandard)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--forest)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>Verify Test Protocol</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alternative Standards & Custom Override Modal */}
      {activeModalClause && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            className="workbench-card"
            style={{
              width: '100%',
              maxWidth: '580px',
              background: 'var(--paper)',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--hairline)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="section-label" style={{ margin: 0 }}>STANDARDS HARMONIZATION</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--ink)' }}>
                  Choose Standard for {activeModalClause.clauseNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalClause(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '0 0 16px 0' }}>
              Select an officially recognized Indian Standard alternative, or input a custom standard with mandatory audit justification.
            </p>

            {/* List of predefined alternatives */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {activeModalClause.alternatives.map((alt) => (
                <div
                  key={alt.standard}
                  onClick={() => handleApplyAlternative(alt.standard, alt.description)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--ink)' }}>{alt.standard}</strong>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-data)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: 'rgba(54,69,47,0.1)',
                        color: 'var(--forest)',
                        fontWeight: 600,
                      }}
                    >
                      {alt.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginBottom: '2px' }}>{alt.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{alt.description}</div>
                </div>
              ))}
            </div>

            {/* Custom Override Option */}
            <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', marginBottom: '8px' }}>
                Or Input Custom / Ministry Specific Standard
              </div>
              <input
                type="text"
                placeholder="e.g. IS 1489:2015 Part 2 or Special MoRTH Specification"
                value={customOverrideInput}
                onChange={(e) => setCustomOverrideInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-data)',
                  marginBottom: '8px',
                }}
              />
              <textarea
                placeholder="Mandatory CVC/Statutory justification for overriding the AI recommendation..."
                value={overrideReasonInput}
                onChange={(e) => setOverrideReasonInput(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-prose)',
                  marginBottom: '12px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => setActiveModalClause(null)}
                  className="action-btn secondary"
                  style={{ padding: '8px 14px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  disabled={!customOverrideInput.trim()}
                  onClick={() => handleApplyAlternative(customOverrideInput, overrideReasonInput)}
                  className="action-btn primary"
                  style={{ padding: '8px 16px', fontSize: '12px', opacity: customOverrideInput.trim() ? 1 : 0.5 }}
                >
                  Apply Custom Standard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
