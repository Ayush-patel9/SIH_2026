import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Upload,
  Plus,
  Lock,
  Building,
  DollarSign,
  FileCheck2,
  FolderKanban,
  FileCode,
  X,
  Layers,
  Check,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useSession } from '../../store/userStore';
import type { UserRole } from '../../types';
import { TenderAnalysisDashboard } from '../tenderAnalysis';
import { uploadTenderDocument } from '../tenderAnalysis/tenderAnalysisClient';
import { projectsClient } from './projectsClient';

export interface TenderProject {
  id: string;
  nitNumber: string;
  title: string;
  department: string;
  estimatedValue: string;
  lastModified: string;
  recencyTimestamp: number;
  status: 'DRAFT' | 'NEEDS_REVIEW' | 'COMPLIANT' | 'PUBLISHED' | 'INGESTED' | 'ANALYZING' | 'COMPLETED';
  complianceScore: number;
  hasDocument: boolean;
  documentText?: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
  isFrozen?: boolean;
  isAnalyzed?: boolean;
  analysisPhase?: string;
  stage1Data?: any;
  stage2Data?: any;
  stage3Data?: any;
}

const NHAI_SAMPLE_TENDER = `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)
TECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ) FOR HIGHWAY CULVERTS & BRIDGES (NIT-NHAI-NCR-2026-088)

Clause 4.1.2 — Cement Specifications for Structural Culvert Works:
All structural concrete elements, including precast culvert barrels, deck slabs, and retaining walls, shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.

Clause 4.1.3 — Coarse & Fine Aggregates for Concrete:
Aggregates shall conform to IS 383:2016 and be tested for soundness, crushing value, and alkali-aggregate reactivity.

Clause 5.2.1 — Reinforcement Steel Bars:
Reinforcement steel for structural columns, piers, and shear walls shall be High Yield Strength Deformed (HYSD) bars Grade Fe 415 conforming to IS 1786:1985.

Clause 7.3.2 — Fasteners & Structural Bolts:
High strength friction grip bolts for structural steel bracing shall conform to IS 3757:1985 with torque tightening inspection as per IRC 24.

Clause 12.4.0 — HDPE Water Drainage Pipes:
HDPE pipes for subsurface bridge drainage and culvert outfall channels shall be manufactured as per IS 4984:1995 with PE-80 raw material.`;

const CPWD_SAMPLE_TENDER = `CENTRAL PUBLIC WORKS DEPARTMENT (CPWD) · AIIMS DELHI SURGICAL WING MODERNIZATION (NIT-CPWD-AIIMS-2026-042)

Clause 3.1.0 — Fire-Resistant Metal Doorsets:
All fire barrier corridor doors, operation theatre entryways, and ICU partitions shall be 2-hour fire rated metal doorsets manufactured and tested strictly in conformance with IS 3614:2021.

Clause 4.2.1 — Plain & Reinforced Concrete:
Structural concrete for building expansion joints and slab retrofits shall comply with IS 456:2000 Code of Practice for Plain and Reinforced Concrete.

Clause 5.2.4 — Electrical Cables for Healthcare Facility:
Power and lighting branch wiring shall utilize low smoke zero halogen (FRLS-H) copper cables conforming to IS 694:2010.

Clause 8.1.5 — High Yield Strength Rebar:
Reinforcement bars shall be thermo-mechanically treated high ductility steel conforming to IS 1786:2008 Grade Fe 500D.`;

const JJM_SAMPLE_TENDER = `MINISTRY OF JAL SHAKTI · JAL JEEVAN MISSION (JJM)
DISTRICT WATER SUPPLY NETWORK & DISTRIBUTION GRID (NIT-JJM-RAJ-2026-019)

Clause 6.1.0 — High Density Polyethylene (HDPE) Pipes:
HDPE pipes for rural drinking water distribution network and pipeline extensions shall be manufactured as per IS 4984:1995 utilizing PE-80 raw material class with PN-6 pressure rating.

Clause 6.2.4 — Sluice Valves for Water Works:
Cast iron sluice valves for isolating pipeline segments shall conform to IS 14846:2000 with bronze trim and flanged ends.

Clause 12.4.1 — Potable Drinking Water Testing Parameters:
Treated water delivered at household tap connections shall adhere strictly to Indian Standard Specification for Drinking Water IS 10500:2012 without deviation.`;

const INITIAL_PROJECTS: TenderProject[] = [
  {
    id: 'proj-nhai-088',
    nitNumber: 'NIT-NHAI-NCR-2026-088',
    title: 'Construction of 6-Lane Flyover & Bridge Superstructure on NH-48',
    department: 'National Highways Authority of India (NHAI)',
    estimatedValue: '₹148.50 Crores',
    lastModified: 'Just now',
    recencyTimestamp: Date.now() - 1000 * 60 * 5,
    status: 'NEEDS_REVIEW',
    complianceScore: 78,
    hasDocument: true,
    documentText: NHAI_SAMPLE_TENDER,
    pdfFileName: 'MOCK_GOVERNMENT_TENDER_NIT_2026.pdf',
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
    hasDocument: true,
    documentText: CPWD_SAMPLE_TENDER,
    pdfFileName: 'CPWD_SURGICAL_SPEC_2026.pdf',
  },
  {
    id: 'proj-jjm-019',
    nitNumber: 'NIT-JJM-RAJ-2026-019',
    title: 'Rural Potable Water Grid Infrastructure & Treatment Facility Phase-II',
    department: 'Ministry of Jal Shakti (JJM)',
    estimatedValue: '₹95.20 Crores',
    lastModified: '1 day ago',
    recencyTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'DRAFT',
    complianceScore: 0,
    hasDocument: false,
  },
  {
    id: 'proj-dfccil-119',
    nitNumber: 'NIT-MOR-DFCCIL-2026-119',
    title: 'Dedicated Freight Corridor Track Laying & Pre-Stressed Concrete Sleepers',
    department: 'Ministry of Railways (DFCCIL)',
    estimatedValue: '₹310.00 Crores',
    lastModified: '2 days ago',
    recencyTimestamp: Date.now() - 1000 * 60 * 60 * 48,
    status: 'NEEDS_REVIEW',
    complianceScore: 84,
    hasDocument: true,
    documentText: NHAI_SAMPLE_TENDER,
    pdfFileName: 'DFCCIL_TRACK_SPEC_2026.pdf',
  },
];

interface ProjectsViewProps {
  onNavigateToTenderUpload?: () => void;
  onNavigateToNeuralMesh?: (standard?: string) => void;
  onNavigateToAudit?: (tenderId?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onNavigateToNeuralMesh,
}) => {
  const { session } = useSession();
  const role: UserRole = session?.role || 'OFFICER';

  // Projects State
  const [projects, setProjects] = useState<TenderProject[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoadingNeon, setIsLoadingNeon] = useState(false);

  const loadProjects = async () => {
    try {
      setIsLoadingNeon(true);
      const data = await projectsClient.getProjects();
      if (data && data.length > 0) {
        setProjects(data as any);
      }
    } catch (err) {
      console.warn('Could not load projects from Neon, fallback to defaults:', err);
    } finally {
      setIsLoadingNeon(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // When selectedProjectId changes, refresh its complete dossier and analysis from Neon DB
  useEffect(() => {
    if (!selectedProjectId) return;
    let isCurrent = true;
    projectsClient.getProject(selectedProjectId).then((fullProj) => {
      if (isCurrent && fullProj) {
        setProjects((prev) => prev.map((p) => (p.id === fullProj.id ? { ...p, ...fullProj } : p)));
      }
    }).catch((err) => {
      console.warn(`Could not refresh project ${selectedProjectId}:`, err);
    });
    return () => {
      isCurrent = false;
    };
  }, [selectedProjectId]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ANALYZED' | 'DRAFT' | 'ACTION_NEEDED'>('ALL');

  // Create Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNitNumber, setNewNitNumber] = useState('');
  const [newDepartment, setNewDepartment] = useState('National Highways Authority of India (NHAI)');
  const [newEstimatedValue, setNewEstimatedValue] = useState('');

  // Inside Project Ingestion State (for projects with hasDocument = false)
  const [ingestTab, setIngestTab] = useState<'preset' | 'paste' | 'upload'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<'nhai' | 'cpwd' | 'jjm'>('nhai');
  const [pasteContent, setPasteContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected Project Object
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Filtered Projects for directory view
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === 'ANALYZED') return p.hasDocument;
    if (filterTab === 'DRAFT') return !p.hasDocument;
    if (filterTab === 'ACTION_NEEDED') return p.status === 'NEEDS_REVIEW';
    return true;
  });

  // Action: Create New Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newNitNumber.trim()) return;

    try {
      const created = await projectsClient.createProject({
        title: newTitle.trim(),
        nitNumber: newNitNumber.trim().toUpperCase(),
        department: newDepartment.trim(),
        estimatedValue: newEstimatedValue.trim() || 'TBD',
      });

      const newProject: TenderProject = {
        id: created.id,
        title: created.title,
        nitNumber: created.nitNumber,
        department: created.department,
        estimatedValue: created.estimatedValue || 'TBD',
        lastModified: 'Just now',
        recencyTimestamp: Date.now(),
        status: 'DRAFT',
        complianceScore: 0,
        hasDocument: false,
        isAnalyzed: false,
      };

      setProjects([newProject, ...projects]);
      setSelectedProjectId(newProject.id);
      setIsCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewNitNumber('');
      setNewEstimatedValue('');
      showToast(`✓ Project "${newProject.title.slice(0, 30)}..." committed to Neon PostgreSQL.`);
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    }
  };

  // Action: Ingest Document into Selected Project
  const handleIngestDocument = async () => {
    if (!selectedProject) return;

    let docTextToSave = '';
    let fileNameToSave = uploadedFileName || 'INGESTED_TENDER_SPEC.pdf';

    if (ingestTab === 'preset') {
      if (selectedPreset === 'nhai') docTextToSave = NHAI_SAMPLE_TENDER;
      else if (selectedPreset === 'cpwd') docTextToSave = CPWD_SAMPLE_TENDER;
      else docTextToSave = JJM_SAMPLE_TENDER;
      fileNameToSave = `${selectedPreset.toUpperCase()}_OFFICIAL_SPECIFICATION.pdf`;
    } else if (ingestTab === 'paste') {
      if (!pasteContent.trim()) {
        alert('Please paste tender clauses or specification text.');
        return;
      }
      docTextToSave = pasteContent;
      fileNameToSave = 'PASTED_TENDER_CLAUSES.txt';
    } else {
      if (!pasteContent.trim()) {
        alert('Please upload a valid document file.');
        return;
      }
      docTextToSave = pasteContent;
    }

    try {
      await projectsClient.ingestDocument(selectedProject.id, {
        documentText: docTextToSave,
        filename: fileNameToSave,
        cloudinaryUrl: uploadedPdfUrl,
      });

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== selectedProject.id) return p;
          return {
            ...p,
            hasDocument: true,
            documentText: docTextToSave,
            pdfUrl: uploadedPdfUrl,
            pdfFileName: fileNameToSave,
            lastModified: 'Just now',
            recencyTimestamp: Date.now(),
            status: 'NEEDS_REVIEW',
            complianceScore: 75,
            isAnalyzed: false,
          };
        })
      );

      showToast(`✓ Tender document frozen & committed to Neon PostgreSQL.`);
    } catch (err: any) {
      alert(`Failed to save document to Neon DB: ${err.message}`);
    }
  };

  // Action: Handle File Upload with Cloudinary (Mirroring AiForBharat)
  const handleFileUpload = async (file: File) => {
    setUploadedFileName(file.name);
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (isPdf) {
      setIsExtractingPdf(true);
      try {
        const localBlobUrl = URL.createObjectURL(file);
        setUploadedPdfUrl(localBlobUrl);

        // Upload to Cloudinary storage directly (instant, non-blocking)
        const uploadRes = await uploadTenderDocument(file);
        if (uploadRes && uploadRes.cloudinary_url) {
          setUploadedPdfUrl(uploadRes.cloudinary_url);
          setPasteContent(`[Uploaded Tender PDF Specification: ${file.name}]\nCloudinary URL: ${uploadRes.cloudinary_url}\nSize: ${Math.round(uploadRes.bytes / 1024)} KB`);
          showToast(`✓ "${file.name}" uploaded to Cloudinary! Click "Ingest & Save" to proceed.`);
        } else {
          setPasteContent(`[Tender PDF Specification: ${file.name}]`);
          showToast(`✓ "${file.name}" registered for ingestion.`);
        }
      } catch (err: any) {
        console.warn('Cloudinary upload notice:', err);
        setPasteContent(`[Tender PDF Specification: ${file.name}]`);
        showToast(`✓ "${file.name}" loaded for ingestion.`);
      } finally {
        setIsExtractingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        setPasteContent(text);
      };
      reader.readAsText(file);
    }
  };

  // ==========================================
  // LEVEL 2: INSIDE A SELECTED PROJECT VIEW
  // ==========================================
  if (selectedProject) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '85vh' }}>
        {/* Toast */}
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

        {/* Project Header Navigation Bar */}
        <div
          className="workbench-card"
          style={{
            padding: '14px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderLeft: '4px solid var(--forest)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setSelectedProjectId(null);
                loadProjects();
              }}
              className="action-btn secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-data)',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'var(--forest)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <ArrowLeft size={16} />
              <span>← Back to All Projects</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'var(--hairline)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: 'var(--ink)',
                  }}
                >
                  {selectedProject.nitNumber}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                  {selectedProject.department}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>•</span>
                <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                  Est. {selectedProject.estimatedValue}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '3px 0 0 0',
                  color: 'var(--ink)',
                  lineHeight: '1.3',
                }}
              >
                {selectedProject.title}
              </h2>
            </div>
          </div>

          {/* Frozen / Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedProject.hasDocument ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(54, 69, 47, 0.08)',
                  border: '1px solid rgba(54, 69, 47, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-data)',
                  fontSize: '12px',
                  color: 'var(--forest)',
                  fontWeight: 700,
                }}
                title="Tender document is frozen for this project. Single-upload pipeline locked."
              >
                <Lock size={14} />
                <span>DOCUMENT FROZEN · SINGLE PIPELINE</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-data)',
                  fontSize: '12px',
                  color: '#B45309',
                  fontWeight: 700,
                }}
              >
                <AlertTriangle size={14} />
                <span>DOCUMENT PENDING INGESTION</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Content Area */}
        {selectedProject.hasDocument ? (
          /* Case 1: Tender document is already uploaded and frozen -> Show 3-Stage Pipeline Dashboard */
          <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <TenderAnalysisDashboard
              projectId={selectedProject.id}
              initialDocumentText={selectedProject.documentText || undefined}
              initialPdfUrl={selectedProject.pdfUrl}
              initialTitle={selectedProject.title}
              isFrozen={true}
              initialPhase={
                selectedProject.stage3Data || selectedProject.analysisPhase === 'DASHBOARD_COMPLETED'
                  ? 'DASHBOARD_COMPLETED'
                  : selectedProject.stage2Data || selectedProject.analysisPhase === 'STAGE2_SELECTION'
                  ? 'STAGE2_SELECTION'
                  : selectedProject.stage1Data || selectedProject.analysisPhase === 'STAGE1_DECOMPOSING'
                  ? 'STAGE2_SELECTION'
                  : 'IDLE'
              }
              initialStage1Data={selectedProject.stage1Data}
              initialStage2Data={selectedProject.stage2Data}
              initialStage3Data={selectedProject.stage3Data}
            />
          </div>
        ) : (
          /* Case 2: Document is NOT uploaded yet -> Show Document Ingestion Studio */
          <div className="workbench-card" style={{ padding: '32px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(54, 69, 47, 0.1)',
                  color: 'var(--forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Upload size={26} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--ink)' }}>
                Ingest Tender Document into Project
              </h3>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Load your technical tender specification or BOQ. Once ingested, the document is <strong>permanently frozen</strong> for 3-stage BIS standards analysis.
              </p>
            </div>

            {/* Ingestion Method Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: '8px',
                padding: '4px',
                marginBottom: '20px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setIngestTab('preset')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: ingestTab === 'preset' ? 'var(--forest)' : 'transparent',
                  color: ingestTab === 'preset' ? 'var(--paper)' : 'var(--ink-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'var(--font-data)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                <span>1-Click Verified Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setIngestTab('upload')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: ingestTab === 'upload' ? 'var(--forest)' : 'transparent',
                  color: ingestTab === 'upload' ? 'var(--paper)' : 'var(--ink-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'var(--font-data)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Upload size={14} />
                <span>Upload PDF / File</span>
              </button>

              <button
                type="button"
                onClick={() => setIngestTab('paste')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: ingestTab === 'paste' ? 'var(--forest)' : 'transparent',
                  color: ingestTab === 'paste' ? 'var(--paper)' : 'var(--ink-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  fontFamily: 'var(--font-data)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={14} />
                <span>Paste Tender Clauses</span>
              </button>
            </div>

            {/* Ingest Tab 1: Presets */}
            {ingestTab === 'preset' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <label style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)' }}>
                  SELECT AN AUTHENTIC GOVERNMENT PROCUREMENT PRESET:
                </label>

                {[
                  {
                    key: 'nhai',
                    title: 'NHAI 6-Lane Flyover & Bridge Superstructure',
                    desc: 'Contains cement IS 8112:1989 (withdrawn), rebar IS 1786 Fe 415 (outdated), aggregates IS 383, and HDPE IS 4984.',
                    badge: 'NHAI / MoRTH Spec',
                  },
                  {
                    key: 'cpwd',
                    title: 'CPWD Healthcare Surgical Wing Modernization',
                    desc: 'Contains fire-rated doorsets IS 3614:2021, FRLS-H copper cables IS 694, and concrete code IS 456.',
                    badge: 'CPWD / AIIMS Spec',
                  },
                  {
                    key: 'jjm',
                    title: 'Jal Jeevan Mission Rural Drinking Water Network',
                    desc: 'Contains HDPE pipes IS 4984:1995 PE-80 (needs amendment), sluice valves IS 14846, and water spec IS 10500.',
                    badge: 'JJM / MoJS Spec',
                  },
                ].map((preset) => {
                  const isSelected = selectedPreset === preset.key;
                  return (
                    <div
                      key={preset.key}
                      onClick={() => setSelectedPreset(preset.key as any)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--forest)' : 'var(--hairline)',
                        background: isSelected ? 'rgba(54, 69, 47, 0.05)' : 'var(--surface)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{preset.title}</span>
                          <span
                            style={{
                              fontFamily: 'var(--font-data)',
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(54,69,47,0.1)',
                              color: 'var(--forest)',
                              fontWeight: 600,
                            }}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-prose)' }}>
                          {preset.desc}
                        </p>
                      </div>

                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSelected ? 'var(--forest)' : 'var(--hairline)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--forest)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ingest Tab 2: File Upload */}
            {ingestTab === 'upload' && (
              <div style={{ marginBottom: '24px' }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  style={{
                    border: '2px dashed',
                    borderColor: isDragOver ? 'var(--forest)' : 'var(--hairline)',
                    background: isDragOver ? 'rgba(54, 69, 47, 0.05)' : 'var(--surface)',
                    borderRadius: '8px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  {isExtractingPdf ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={32} color="var(--forest)" className="animate-spin" />
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                        Parsing clauses from PDF using PyPDF Engine...
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                        Extracting technical specification text and line items cleanly...
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} color="var(--forest)" style={{ margin: '0 auto 10px auto' }} />
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)', marginBottom: '4px' }}>
                        {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Drop Tender PDF or Specification Document here'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
                        Supports PDF, DOCX, or plain text clauses up to 50MB
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Ingest Tab 3: Paste Text */}
            {ingestTab === 'paste' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
                  PASTE TECHNICAL CLAUSES & SPECIFICATIONS:
                </label>
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste tender clauses, e.g. Clause 4.1.2 Ordinary Portland Cement shall conform to IS 8112:1989..."
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    lineHeight: '1.5',
                  }}
                />
              </div>
            )}

            {/* Ingestion Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--hairline)', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="action-btn secondary"
                style={{ padding: '10px 18px', fontSize: '13px', fontFamily: 'var(--font-data)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIngestDocument}
                className="action-btn primary"
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-data)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(54,69,47,0.25)',
                }}
              >
                <Lock size={15} />
                <span>Ingest & Lock into Project</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // LEVEL 1: ALL PROJECTS & TENDERS DIRECTORY
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '85vh' }}>
      {/* Toast */}
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

      {/* Hero Banner */}
      <div
        className="workbench-card"
        style={{
          background: 'linear-gradient(135deg, rgba(54, 69, 47, 0.07) 0%, rgba(200, 185, 154, 0.14) 100%)',
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
              {role === 'VENDOR' ? 'TENDER MARKETPLACE' : 'TENDER AUTHORITY & AUDIT WORKSPACE'}
            </span>
            <span className="section-label" style={{ margin: 0 }}>UNIFIED PROCUREMENT DIRECTORY</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {role === 'VENDOR' ? 'Public Procurement Tenders & Standards' : 'Procurement Projects & Tender Analysis'}
          </h2>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', margin: '4px 0 0 0', maxWidth: '850px' }}>
            {role === 'VENDOR'
              ? 'Browse open government tenders, verify mandatory Indian Standards (IS Codes), and access bidding compliance checklists.'
              : 'Manage procurement projects, ingest tender documents, and execute the 3-stage BIS standards intelligence pipeline.'}
          </p>
        </div>

        {/* Primary Action Button: Create New Project */}
        {role !== 'VENDOR' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="action-btn primary"
            style={{
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-data)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(54,69,47,0.22)',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Directory Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="workbench-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(54,69,47,0.1)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Total Projects</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>{projects.length}</div>
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', color: 'var(--active-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Ingested & Frozen</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              {projects.filter((p) => p.hasDocument).length}
            </div>
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: 'var(--proactive-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Pending Document</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              {projects.filter((p) => !p.hasDocument).length}
            </div>
          </div>
        </div>

        <div className="workbench-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(37,99,235,0.1)', color: 'var(--collapse-cobalt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Standards Repository</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>22,011 IS</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="workbench-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, NITs, departments..."
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
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {(['ALL', 'ANALYZED', 'ACTION_NEEDED', 'DRAFT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterTab === tab ? 'var(--ink)' : 'var(--hairline)',
                background: filterTab === tab ? 'var(--ink)' : 'transparent',
                color: filterTab === tab ? 'var(--paper)' : 'var(--ink-secondary)',
                fontSize: '11.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-data)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'ALL'
                ? `All (${projects.length})`
                : tab === 'ANALYZED'
                ? `Frozen & Analyzed (${projects.filter((p) => p.hasDocument).length})`
                : tab === 'ACTION_NEEDED'
                ? `Action Needed (${projects.filter((p) => p.status === 'NEEDS_REVIEW').length})`
                : `Draft / Pending (${projects.filter((p) => !p.hasDocument).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid or Clean Empty State */}
      {filteredProjects.length === 0 ? (
        <div
          className="workbench-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            border: '1px dashed var(--hairline)',
            background: 'var(--surface)',
          }}
        >
          <div style={{ fontSize: '36px' }}>📂</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            No Tenders Match the Current Filter
          </h3>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', maxWidth: '440px', margin: 0 }}>
            {searchQuery
              ? `No projects matching "${searchQuery}" in this view.`
              : 'There are currently no projects matching this category.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterTab('ALL');
              setSearchQuery('');
            }}
            className="action-btn secondary"
            style={{
              marginTop: '8px',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-data)',
            }}
          >
            Reset Filters & View All
          </button>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredProjects.map((project) => {
          return (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className="workbench-card"
              style={{
                cursor: 'pointer',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--hairline)',
                background: 'var(--surface)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.18s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--forest)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(54,69,47,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--hairline)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            >
              <div>
                {/* Top Row: Department & Last Modified */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '11px',
                      color: 'var(--forest)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {project.department.split('(')[1]?.replace(')', '') || project.department.slice(0, 18)}
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

                {/* Project Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: '1.4',
                    margin: '0 0 6px 0',
                  }}
                >
                  {project.title}
                </h3>

                {/* NIT Reference */}
                <div style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '16px' }}>
                  {project.nitNumber}
                </div>
              </div>

              {/* Bottom Details & Action Button */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--hairline)',
                    paddingTop: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>ESTIMATED VALUE</span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--ink)', fontWeight: 700 }}>
                      {project.estimatedValue}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-data)',
                      background: !project.hasDocument
                        ? 'rgba(245, 158, 11, 0.12)'
                        : project.analysisPhase === 'DASHBOARD_COMPLETED' || project.status === 'COMPLIANT'
                        ? 'rgba(34, 197, 94, 0.12)'
                        : project.analysisPhase === 'STAGE2_SELECTION'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(239, 68, 68, 0.12)',
                      color: !project.hasDocument
                        ? '#B45309'
                        : project.analysisPhase === 'DASHBOARD_COMPLETED' || project.status === 'COMPLIANT'
                        ? 'var(--active-green)'
                        : project.analysisPhase === 'STAGE2_SELECTION'
                        ? '#B45309'
                        : 'var(--superseded-red)',
                    }}
                  >
                    {!project.hasDocument
                      ? '⚠️ DOCUMENT PENDING'
                      : project.analysisPhase === 'DASHBOARD_COMPLETED' || project.status === 'COMPLIANT'
                      ? '✓ 100% COMPLIANT'
                      : project.analysisPhase === 'STAGE2_SELECTION'
                      ? '⚖️ STAGE 2 REVIEW'
                      : `${project.complianceScore || 75}% HEALTH`}
                  </span>
                </div>

                {/* Card Action Link */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: project.hasDocument ? 'rgba(54, 69, 47, 0.05)' : 'rgba(245, 158, 11, 0.06)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: project.hasDocument ? 'var(--forest)' : '#B45309',
                    fontFamily: 'var(--font-data)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  <span>
                    {!project.hasDocument
                      ? 'Upload Tender Document'
                      : project.analysisPhase === 'DASHBOARD_COMPLETED' || project.stage3Data
                      ? 'Open Completed Dashboard'
                      : project.analysisPhase === 'STAGE2_SELECTION' || project.stage2Data
                      ? 'Resume Stage 2 Review'
                      : 'Open 3-Stage Pipeline'}
                  </span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal: Create New Project */}
      {isCreateModalOpen && (
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
              maxWidth: '540px',
              background: 'var(--paper)',
              padding: '28px',
              borderRadius: '10px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--hairline)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="section-label" style={{ margin: 0 }}>NEW PROCUREMENT PROJECT</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--ink)' }}>
                  Create Project Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '0 0 20px 0' }}>
              Define the project details and NIT reference. Once created, you will upload the tender document to execute the 3-stage intelligence pipeline.
            </p>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-data)', color: 'var(--ink)', marginBottom: '5px' }}>
                  PROJECT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Construction of Elevated Metro Corridor & Stations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface)',
                    fontSize: '13px',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-data)', color: 'var(--ink)', marginBottom: '5px' }}>
                  NIT / TENDER REFERENCE NUMBER *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT-DMRC-2026-088"
                  value={newNitNumber}
                  onChange={(e) => setNewNitNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface)',
                    fontSize: '13px',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-data)', color: 'var(--ink)', marginBottom: '5px' }}>
                  DEPARTMENT / PROCURING ENTITY
                </label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface)',
                    fontSize: '13px',
                    color: 'var(--ink)',
                  }}
                >
                  <option value="National Highways Authority of India (NHAI)">National Highways Authority of India (NHAI)</option>
                  <option value="Central Public Works Department (CPWD)">Central Public Works Department (CPWD)</option>
                  <option value="Ministry of Railways (DFCCIL / IR)">Ministry of Railways (DFCCIL / IR)</option>
                  <option value="Ministry of Jal Shakti (Jal Jeevan Mission)">Ministry of Jal Shakti (Jal Jeevan Mission)</option>
                  <option value="Delhi Metro Rail Corporation (DMRC)">Delhi Metro Rail Corporation (DMRC)</option>
                  <option value="Military Engineer Services (MES / MoD)">Military Engineer Services (MES / MoD)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-data)', color: 'var(--ink)', marginBottom: '5px' }}>
                  ESTIMATED TENDER VALUE
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹185.00 Crores"
                  value={newEstimatedValue}
                  onChange={(e) => setNewEstimatedValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface)',
                    fontSize: '13px',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="action-btn secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newNitNumber.trim()}
                  className="action-btn primary"
                  style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
                >
                  Create & Ingest Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
