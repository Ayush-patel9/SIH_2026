import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  FileCheck2,
  FileDiff,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Lock,
} from 'lucide-react';

import type {
  DecomposeResponse,
  Stage2MapResponse,
  Stage3FinalizeResponse,
  MappedProductItem,
} from './types';
import { tenderAnalysisClient } from './tenderAnalysisClient';
import { Stage2ProductSelectionView } from './Stage2ProductSelectionView';
import { OverviewTab } from './OverviewTab';
import { ProductISInventoryTab } from './ProductISInventoryTab';
import { ClauseDiffTab } from './ClauseDiffTab';
import { NITSpecificationsTab } from './NITSpecificationsTab';
import { CVCAuditTab } from './CVCAuditTab';
import { PDFDocumentViewer } from './PDFDocumentViewer';
import { TenderChatbotPanel } from './TenderChatbotPanel';
import { ISDetailDrawer } from './ISDetailDrawer';
import { projectsClient } from '../projects/projectsClient';

export type PipelinePhase =
  | 'IDLE'
  | 'STAGE1_DECOMPOSING'
  | 'STAGE2_SELECTION'
  | 'STAGE3_FINALIZING'
  | 'DASHBOARD_COMPLETED';

interface TenderAnalysisDashboardProps {
  projectId?: string;
  initialDocumentText?: string;
  initialPdfUrl?: string | null;
  initialTitle?: string;
  isFrozen?: boolean;
  initialPhase?: PipelinePhase;
  initialStage1Data?: DecomposeResponse | null;
  initialStage2Data?: Stage2MapResponse | null;
  initialStage3Data?: Stage3FinalizeResponse | null;
  onBackToUpload?: () => void;
}

const DEFAULT_SAMPLE_TENDER = `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)
TECHNICAL SPECIFICATION & BILL OF QUANTITIES (BOQ) FOR HIGHWAY CULVERTS & BRIDGES

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

export const TenderAnalysisDashboard: React.FC<TenderAnalysisDashboardProps> = ({
  projectId,
  initialDocumentText,
  initialPdfUrl,
  initialTitle,
  isFrozen = true,
  initialPhase = 'IDLE',
  initialStage1Data = null,
  initialStage2Data = null,
  initialStage3Data = null,
  onBackToUpload,
}) => {
  // Document state
  const [docText, setDocText] = useState<string>(initialDocumentText || DEFAULT_SAMPLE_TENDER);
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl || null);
  const [tenderTitle, setTenderTitle] = useState<string>(
    initialTitle || 'Government Procurement Tender'
  );

  // Pipeline Lifecycle Phase - derived intelligently from initial data
  const deriveInitialPhase = (): PipelinePhase => {
    if (initialStage3Data || initialPhase === 'DASHBOARD_COMPLETED') return 'DASHBOARD_COMPLETED';
    if (initialStage2Data || initialPhase === 'STAGE2_SELECTION') return 'STAGE2_SELECTION';
    if (initialStage1Data || initialPhase === 'STAGE1_DECOMPOSING') return 'STAGE2_SELECTION';
    return initialPhase || 'IDLE';
  };

  const [pipelinePhase, setPipelinePhase] = useState<PipelinePhase>(deriveInitialPhase());

  // Active Horizontal Tab in Completed Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'diffs' | 'nit' | 'audit'>('overview');

  // Pipeline Data States
  const [stage1Data, setStage1Data] = useState<DecomposeResponse | null>(initialStage1Data);
  const [stage2Data, setStage2Data] = useState<Stage2MapResponse | null>(initialStage2Data);
  const [stage3Data, setStage3Data] = useState<Stage3FinalizeResponse | null>(initialStage3Data);

  // Progress and loading states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clarifyingProductId, setClarifyingProductId] = useState<string | null>(null);

  // Collapsible Tool Panels & Split-Screen (Mirrored exactly from AiForBharat)
  const [isPdfCollapsed, setIsPdfCollapsed] = useState<boolean>(true);
  const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(true);
  const [leftWidth, setLeftWidth] = useState<number>(55); // percentage width of left window
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Document Viewer highlighting & page jump
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [highlightQuote, setHighlightQuote] = useState<string>('');

  // IS Detail Drawer
  const [selectedISNumber, setSelectedISNumber] = useState<string | null>(null);

  // 1. Sync when initial props change
  useEffect(() => {
    if (initialDocumentText) {
      setDocText(initialDocumentText);
    }
    if (initialPdfUrl !== undefined) {
      setPdfUrl(initialPdfUrl);
    }
    if (initialTitle) {
      setTenderTitle(initialTitle);
    }
    if (initialStage3Data) {
      setStage3Data(initialStage3Data);
      setPipelinePhase('DASHBOARD_COMPLETED');
    } else if (initialStage2Data) {
      setStage2Data(initialStage2Data);
      setPipelinePhase('STAGE2_SELECTION');
    } else if (initialStage1Data) {
      setStage1Data(initialStage1Data);
      setPipelinePhase('STAGE2_SELECTION');
    } else if (initialPhase) {
      setPipelinePhase(initialPhase);
    }
  }, [initialDocumentText, initialPdfUrl, initialTitle, initialStage1Data, initialStage2Data, initialStage3Data, initialPhase]);

  // 2. Fetch fresh saved project state directly from Neon PostgreSQL when projectId is present
  useEffect(() => {
    if (!projectId) return;
    let isCurrent = true;

    projectsClient.getProject(projectId).then((proj) => {
      if (!isCurrent || !proj) return;
      if (proj.documentText) setDocText(proj.documentText);
      if (proj.pdfUrl) setPdfUrl(proj.pdfUrl);
      if (proj.title) setTenderTitle(proj.title);

      if (proj.stage3Data) {
        setStage3Data(proj.stage3Data);
        setPipelinePhase('DASHBOARD_COMPLETED');
      } else if (proj.stage2Data) {
        setStage2Data(proj.stage2Data);
        setPipelinePhase('STAGE2_SELECTION');
      } else if (proj.stage1Data) {
        setStage1Data(proj.stage1Data);
        setPipelinePhase('STAGE2_SELECTION');
      } else if (proj.analysisPhase && proj.analysisPhase !== 'IDLE') {
        setPipelinePhase(proj.analysisPhase as PipelinePhase);
      }

      if (proj.stage1Data) setStage1Data(proj.stage1Data);
      if (proj.stage2Data) setStage2Data(proj.stage2Data);
    }).catch((err) => {
      console.warn(`Could not load saved project analysis for ${projectId}:`, err);
    });

    return () => {
      isCurrent = false;
    };
  }, [projectId]);

  // Handle opening IS Drawer
  const handleOpenDrawer = (isNumber: string) => {
    setSelectedISNumber(isNumber);
  };

  // Handle navigating to page and highlighting quote (Auto-opens PDF and splits screen)
  const handleNavigateToPage = (pageNumber: number, verbatimQuote?: string) => {
    setActivePageNumber(pageNumber);
    if (verbatimQuote) {
      setHighlightQuote(verbatimQuote);
    }
    if (isPdfCollapsed) {
      setIsPdfCollapsed(false);
    }
  };

  // Draggable Divider Resize Listeners (Mirrored from AiForBharat DocumentDetail.tsx)
  const startResize = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const containerWidth = window.innerWidth - 48; // Account for 24px left/right padding
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      // Limit between 30% and 75%
      if (newLeftWidth >= 30 && newLeftWidth <= 75) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // ==========================================
  // Pipeline Step 1: Run Stage 1 Decompose
  // ==========================================
  const handleStartPipeline = async () => {
    setIsProcessing(true);
    setPipelinePhase('STAGE1_DECOMPOSING');
    setCurrentStepText('Stage 1: Decomposing document clauses & generating BIS search queries...');
    setErrorMessage(null);

    try {
      // 1. Stage 1 Call (Multimodal Gemini PDF reading if pdfUrl is present)
      const s1 = await tenderAnalysisClient.decomposeStage1(
        docText,
        tenderTitle,
        undefined,
        pdfUrl || undefined,
        projectId
      );
      setStage1Data(s1);

      // 2. Automatically advance to Stage 2 Mapping
      setCurrentStepText('Stage 2: Searching 22,011 BIS standards & mapping candidate specifications...');
      const s2 = await tenderAnalysisClient.mapStage2(docText, s1.products, projectId);
      setStage2Data(s2);

      // 3. Pause on Stage 2 Product Selection & Standards Confirmation
      setPipelinePhase('STAGE2_SELECTION');
    } catch (err: any) {
      setErrorMessage(err.message || 'Pipeline execution failed at Stage 1.');
      setPipelinePhase('IDLE');
    } finally {
      setIsProcessing(false);
      setCurrentStepText('');
    }
  };

  // ==========================================
  // Pipeline Step 2B: Clarify Ambiguous Item (HITL)
  // ==========================================
  const handleClarifyProduct = async (
    productId: string,
    questionId: string,
    selectedOption: string,
    currentMapping: MappedProductItem
  ) => {
    setClarifyingProductId(productId);
    try {
      const clarifyResp = await tenderAnalysisClient.clarifyStage2(
        productId,
        questionId,
        selectedOption,
        docText,
        currentMapping,
        projectId
      );

      if (stage2Data) {
        const updatedProducts = stage2Data.mapped_products.map((p) => {
          if (p.product_id === productId) {
            return {
              ...p,
              recommended_is: clarifyResp.resolved_is,
              recommended_is_title: clarifyResp.resolved_title,
              confidence_score: clarifyResp.revised_confidence,
              engineering_rationale: clarifyResp.engineering_rationale,
              officer_clarification_answer: selectedOption,
              status: clarifyResp.status,
              clarification_needed: false,
            };
          }
          return p;
        });

        setStage2Data({
          ...stage2Data,
          mapped_products: updatedProducts,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit clarification');
    } finally {
      setClarifyingProductId(null);
    }
  };

  // Handle Manual Officer Override of an IS code
  const handleOfficerOverride = (productId: string, overrideIS: string) => {
    if (!stage2Data) return;
    const updatedProducts = stage2Data.mapped_products.map((p) => {
      if (p.product_id === productId) {
        return {
          ...p,
          recommended_is: overrideIS,
          officer_override_is: overrideIS,
          status: 'OVERRIDDEN' as const,
          clarification_needed: false,
        };
      }
      return p;
    });

    setStage2Data({
      ...stage2Data,
      mapped_products: updatedProducts,
    });
  };

  // Handle Accept Recommended Product
  const handleAcceptProduct = (productId: string) => {
    if (!stage2Data) return;
    const updatedProducts = stage2Data.mapped_products.map((p) => {
      if (p.product_id === productId) {
        return {
          ...p,
          status: 'RESOLVED' as const,
          clarification_needed: false,
        };
      }
      return p;
    });

    setStage2Data({
      ...stage2Data,
      mapped_products: updatedProducts,
    });
  };

  // ==========================================
  // Pipeline Step 3: Finalize & Generate Dashboard
  // ==========================================
  const handleConfirmAndFinalizeStage3 = async () => {
    if (!stage2Data || stage2Data.mapped_products.length === 0) {
      setErrorMessage('No mapped products found to finalize.');
      return;
    }

    setIsProcessing(true);
    setPipelinePhase('STAGE3_FINALIZING');
    setCurrentStepText('Stage 3: Drafting grounded clause diffs & sealing cryptographic CVC audit record...');
    setErrorMessage(null);

    try {
      const tenderMeta = stage1Data?.tender_metadata || {
        title: tenderTitle,
        department: 'Government Procurement Entity',
      };

      const s3 = await tenderAnalysisClient.finalizeStage3(
        docText,
        stage2Data.mapped_products,
        tenderMeta,
        projectId
      );

      setStage3Data(s3);
      // Advance to the UNLOCKED COMPREHENSIVE DASHBOARD!
      setPipelinePhase('DASHBOARD_COMPLETED');
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Stage 3 Finalization failed.');
      setPipelinePhase('STAGE2_SELECTION');
    } finally {
      setIsProcessing(false);
      setCurrentStepText('');
    }
  };

  const mappedProducts = stage2Data?.mapped_products || [];
  const clauseDiffs = stage3Data?.clause_diffs || [];
  const nitSchedule = stage3Data?.nit_specification_schedule || [];
  const auditRecord = stage3Data?.cvc_audit_record || null;

  // Split-Screen Dimensions
  const isBothToolsOpen = !isPdfCollapsed && !isChatCollapsed;
  const isEitherToolOpen = !isPdfCollapsed || !isChatCollapsed;
  const leftPanelHeight = !isEitherToolOpen
    ? 'auto'
    : isBothToolsOpen
      ? 'calc(580px + 580px + 16px)'
      : '580px';

  const DASHBOARD_TABS = [
    { id: 'overview', label: 'Executive Overview', icon: BookOpen, count: null },
    { id: 'inventory', label: 'Product ↔ IS Inventory', icon: Layers, count: mappedProducts.length },
    { id: 'diffs', label: 'Clause Redlines & Diffs', icon: FileDiff, count: clauseDiffs.length },
    { id: 'nit', label: 'NIT Specifications Schedule', icon: FileCheck2, count: nitSchedule.length },
    { id: 'audit', label: 'CVC Statutory Audit Defense', icon: ShieldCheck, count: null, isSeal: true },
  ];

  const renderDashboardActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            metadata={stage1Data?.tender_metadata || null}
            stage1Data={stage1Data}
            stage2Data={stage2Data}
            stage3Data={stage3Data}
            onNavigateToTab={(tabId: string) => setActiveTab(tabId as any)}
          />
        );
      case 'inventory':
        return (
          <ProductISInventoryTab
            products={mappedProducts}
            onOpenStandardDetail={handleOpenDrawer}
            onPageClick={(p: number, text?: string) => handleNavigateToPage(p, text)}
            onClarifyProduct={handleClarifyProduct}
            onOverrideProductIS={handleOfficerOverride}
            onAcceptProduct={handleAcceptProduct}
            clarifyingProductId={clarifyingProductId}
          />
        );
      case 'diffs':
        return (
          <ClauseDiffTab
            clauseDiffs={clauseDiffs}
            onPageClick={(p: number, text?: string) => handleNavigateToPage(p, text)}
          />
        );
      case 'nit':
        return (
          <NITSpecificationsTab
            schedule={nitSchedule}
            fullDraftText={stage3Data?.full_nit_draft_text || ''}
            tenderTitle={tenderTitle}
          />
        );
      case 'audit':
        return (
          <CVCAuditTab
            auditRecord={auditRecord}
            mappedProducts={mappedProducts}
            clauseDiffs={clauseDiffs}
            nitSchedule={nitSchedule}
            tenderMetadata={stage1Data?.tender_metadata || null}
            onOpenDrawer={handleOpenDrawer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FBF9F5', color: '#1C2419', fontFamily: 'var(--font-ui, sans-serif)' }}>
      {/* Top Application Bar with Sovereign Design */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: '#FFFEFB',
          borderBottom: '1px solid #E5E0D4',
          padding: '12px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Title & Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#36452F',
                color: '#FFFEFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(54,69,47,0.25)',
              }}
            >
              <Sparkles size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#1C2419', margin: 0 }}>
                  {tenderTitle}
                </h1>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-data, monospace)',
                    background: '#F0F4ED',
                    color: '#36452F',
                    border: '1px solid #B7E4C7',
                  }}
                >
                  AI FOR BHARAT · BIS ENGINE
                </span>
                {isFrozen && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-data, monospace)',
                      background: '#FFF9EB',
                      color: '#92400E',
                      border: '1px solid #FDE68A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lock size={12} />
                    <span>FROZEN DOSSIER · SINGLE RUN</span>
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#6E7A68', marginTop: '2px', fontFamily: 'var(--font-data, monospace)' }}>
                <span>Repository: 22,011 BIS Standards</span>
                <span>•</span>
                <span>GFR 2017 Rule 144(xi) Guard</span>
              </div>
            </div>
          </div>

          {/* Stepper Progress & Dedicated Tool Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F5F0E6',
                border: '1px solid #E5E0D4',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontFamily: 'var(--font-data, monospace)',
                fontWeight: 600,
              }}
            >
              <span style={{ color: pipelinePhase !== 'IDLE' ? '#2D6A4F' : '#6E7A68' }}>
                1. Decomposition {pipelinePhase !== 'IDLE' ? '✓' : ''}
              </span>
              <span style={{ color: '#D5CFBF' }}>→</span>
              <span style={{ color: pipelinePhase === 'STAGE2_SELECTION' ? '#92400E' : pipelinePhase === 'STAGE3_FINALIZING' || pipelinePhase === 'DASHBOARD_COMPLETED' ? '#2D6A4F' : '#6E7A68' }}>
                2. Product Selection {pipelinePhase === 'DASHBOARD_COMPLETED' ? '✓' : ''}
              </span>
              <span style={{ color: '#D5CFBF' }}>→</span>
              <span style={{ color: pipelinePhase === 'DASHBOARD_COMPLETED' ? '#2D6A4F' : '#6E7A68' }}>
                3. NIT & Audit {pipelinePhase === 'DASHBOARD_COMPLETED' ? '✓' : ''}
              </span>
            </div>

            {/* SEPARATE BUTTON 1: PDF Document Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPdfCollapsed((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '6px',
                border: !isPdfCollapsed ? '1px solid #2D6A4F' : '1px solid #D5CFBF',
                background: !isPdfCollapsed ? '#EDF7F1' : '#FFFEFB',
                color: !isPdfCollapsed ? '#2D6A4F' : '#36452F',
                fontSize: '12px',
                fontFamily: 'var(--font-data, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: !isPdfCollapsed ? '0 1px 4px rgba(45,106,79,0.15)' : 'none',
              }}
              title={isPdfCollapsed ? 'Open Tender PDF Viewer' : 'Close Tender PDF Viewer'}
            >
              <FileText size={14} color={!isPdfCollapsed ? '#2D6A4F' : '#6E7A68'} />
              <span>PDF Document</span>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: !isPdfCollapsed ? '#2D6A4F' : '#D5CFBF',
                  transition: 'background-color 0.15s ease',
                }}
              />
            </button>

            {/* SEPARATE BUTTON 2: AI Chatbot Toggle Button */}
            <button
              type="button"
              onClick={() => setIsChatCollapsed((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '6px',
                border: !isChatCollapsed ? '1px solid #6366F1' : '1px solid #D5CFBF',
                background: !isChatCollapsed ? '#EEF2FF' : '#FFFEFB',
                color: !isChatCollapsed ? '#4338CA' : '#36452F',
                fontSize: '12px',
                fontFamily: 'var(--font-data, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: !isChatCollapsed ? '0 1px 4px rgba(99,102,241,0.15)' : 'none',
              }}
              title={isChatCollapsed ? 'Open Tender AI Assistant Chat' : 'Close Tender AI Assistant Chat'}
            >
              <MessageSquare size={14} color={!isChatCollapsed ? '#6366F1' : '#6E7A68'} />
              <span>AI Chatbot</span>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: !isChatCollapsed ? '#6366F1' : '#D5CFBF',
                  transition: 'background-color 0.15s ease',
                }}
              />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 16px',
              borderRadius: '6px',
              backgroundColor: '#FDF2F0',
              border: '1px solid #F7CDC6',
              borderLeft: '4px solid #BA3A2A',
              color: '#991B1B',
              fontSize: '12.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} color="#BA3A2A" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              style={{ background: 'none', border: 'none', color: '#BA3A2A', fontWeight: 700, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Main Content Workspace Container */}
      <div style={{ flex: 1 }}>
        {/* ========================================================
            PHASE 1: IDLE LAUNCHPAD (Before Pipeline Starts)
           ======================================================== */}
        {pipelinePhase === 'IDLE' && (
          <main style={{ padding: '24px' }}>
            <div
              style={{
                backgroundColor: '#FFFEFB',
                border: '1px solid #E5E0D4',
                borderRadius: '12px',
                padding: '40px 32px',
                maxWidth: '800px',
                margin: '30px auto',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#F5F0E6',
                  color: '#36452F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Sparkles size={28} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C2419', margin: '0 0 8px 0' }}>
                Initialize 3-Stage Standards Intelligence Pipeline
              </h2>
              <p style={{ fontSize: '14px', color: '#44503E', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                Tender dossier is loaded and frozen. The automated 3-stage pipeline will decompose technical clauses, map active Indian Standards, pause for any technical clarifications, and generate the final GFR/CVC-compliant schedule.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={handleStartPipeline}
                  disabled={isProcessing}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    backgroundColor: '#36452F',
                    color: '#FFFEFB',
                    border: 'none',
                    fontSize: '14px',
                    fontFamily: 'var(--font-data, monospace)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(54,69,47,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <RefreshCw size={16} className={isProcessing ? 'animate-spin' : ''} />
                  <span>Execute 3-Stage Analysis Pipeline</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            PHASE 2: STAGE 1 DECOMPOSING PROGRESS
           ======================================================== */}
        {pipelinePhase === 'STAGE1_DECOMPOSING' && (
          <main style={{ padding: '24px' }}>
            <div
              style={{
                backgroundColor: '#FFFEFB',
                border: '1px solid #E5E0D4',
                borderRadius: '12px',
                padding: '48px 32px',
                maxWidth: '700px',
                margin: '40px auto',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#F0F4ED',
                  color: '#36452F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto',
                }}
              >
                <RefreshCw size={26} className="animate-spin" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C2419', margin: '0 0 8px 0' }}>
                Stage 1: Decomposing Document Clauses...
              </h3>
              <p style={{ fontSize: '13.5px', color: '#6E7A68', margin: '0 0 24px 0' }}>
                {currentStepText || 'Extracting technical specifications and preparing BIS search queries...'}
              </p>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#E5E0D4', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#36452F', borderRadius: '4px' }} />
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            PHASE 3: STAGE 2 INTERMEDIATE PRODUCT SELECTION & HITL
           ======================================================== */}
        {pipelinePhase === 'STAGE2_SELECTION' && (
          <div
            style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: !isEitherToolOpen ? '1fr' : `${leftWidth}% 6px 1fr`,
              padding: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left Window: Stage 2 Product Selection View */}
            <div
              style={{
                height: leftPanelHeight,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                overflowY: isEitherToolOpen ? 'auto' : 'visible',
              }}
            >
              <Stage2ProductSelectionView
                products={mappedProducts}
                tenderTitle={tenderTitle}
                onClarifyProduct={handleClarifyProduct}
                onOverrideProductIS={handleOfficerOverride}
                onAcceptProduct={handleAcceptProduct}
                onConfirmAllAndProceed={handleConfirmAndFinalizeStage3}
                onOpenStandardDetail={handleOpenDrawer}
                onPageClick={(p: number, text?: string) => handleNavigateToPage(p, text)}
                isProcessing={isProcessing}
              />
            </div>

            {/* Draggable Resize Handle */}
            {isEitherToolOpen && (
              <div
                onMouseDown={startResize}
                style={{
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '6px',
                  height: leftPanelHeight,
                  backgroundColor: isResizing ? '#2D6A4F' : 'transparent',
                  borderRadius: '3px',
                  transition: 'background-color 0.15s ease',
                  userSelect: 'none',
                }}
                title="Drag to resize windows (30% - 75%)"
              >
                <div
                  style={{
                    width: '2px',
                    height: '48px',
                    backgroundColor: isResizing ? '#2D6A4F' : '#D5CFBF',
                    borderRadius: '2px',
                  }}
                />
              </div>
            )}

            {/* Right Window: Tool Panels */}
            {isEitherToolOpen && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minWidth: 0,
                }}
              >
                {!isPdfCollapsed && (
                  <div
                    id="tender-pdf-viewer-container"
                    style={{
                      height: '580px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E5E0D4',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      backgroundColor: '#0f172a',
                    }}
                  >
                    <PDFDocumentViewer
                      documentText={docText}
                      pdfUrl={pdfUrl}
                      targetPage={activePageNumber}
                      highlightText={highlightQuote}
                      onPageChange={(p) => setActivePageNumber(p)}
                      onClose={() => setIsPdfCollapsed(true)}
                    />
                  </div>
                )}

                {!isChatCollapsed && (
                  <div
                    id="tender-chat-container"
                    style={{
                      height: '580px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <TenderChatbotPanel
                      documentText={docText}
                      onPageClick={(p, text) => handleNavigateToPage(p, text)}
                      onClose={() => setIsChatCollapsed(true)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PHASE 4: STAGE 3 FINALIZING PROGRESS
           ======================================================== */}
        {pipelinePhase === 'STAGE3_FINALIZING' && (
          <main style={{ padding: '24px' }}>
            <div
              style={{
                backgroundColor: '#FFFEFB',
                border: '1px solid #E5E0D4',
                borderRadius: '12px',
                padding: '48px 32px',
                maxWidth: '700px',
                margin: '40px auto',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EDF7F1',
                  color: '#2D6A4F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto',
                }}
              >
                <FileCheck2 size={26} className="animate-spin" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C2419', margin: '0 0 8px 0' }}>
                Stage 3: Drafting Clause Diffs & Sealing CVC Audit...
              </h3>
              <p style={{ fontSize: '13.5px', color: '#6E7A68', margin: '0 0 24px 0' }}>
                Grounding before/after redline replacements and compiling the official NIT schedule...
              </p>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#E5E0D4', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: '#2D6A4F', borderRadius: '4px' }} />
              </div>
            </div>
          </main>
        )}

        {/* ========================================================
            PHASE 5: DASHBOARD COMPLETED (EXACT AIFORBHARAT DUAL-MODE LAYOUT)
           ======================================================== */}
        {pipelinePhase === 'DASHBOARD_COMPLETED' && (
          <div
            style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: !isEitherToolOpen ? '1fr' : `${leftWidth}% 6px 1fr`,
              padding: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left Window: Analysis Dashboard */}
            <div
              style={{
                height: leftPanelHeight,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: '#FFFEFB',
                  border: '1px solid #E5E0D4',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                {/* Horizontal Tabs Header Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 16px',
                    borderBottom: '1px solid #E5E0D4',
                    backgroundColor: '#FAF8F3',
                    overflowX: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 'max-content' }}>
                    {DASHBOARD_TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const Icon = tab.icon;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as any)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isActive ? '#36452F' : '#E5E0D4',
                            backgroundColor: isActive ? '#36452F' : '#FFFEFB',
                            color: isActive ? '#FFFEFB' : '#44503E',
                            fontSize: '12px',
                            fontWeight: isActive ? 700 : 600,
                            fontFamily: 'var(--font-data, monospace)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease',
                            boxShadow: isActive ? '0 2px 6px rgba(54,69,47,0.2)' : 'none',
                          }}
                        >
                          <Icon size={14} color={isActive ? '#FFFEFB' : tab.isSeal ? '#2D6A4F' : '#6E7A68'} />
                          <span>{tab.label}</span>
                          {tab.count !== null && (
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                background: isActive ? 'rgba(255,255,255,0.2)' : '#F5F0E6',
                                color: isActive ? '#FFFEFB' : '#36452F',
                                fontWeight: 700,
                              }}
                            >
                              {tab.count}
                            </span>
                          )}
                          {tab.isSeal && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#2D6A4F',
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPipelinePhase('STAGE2_SELECTION')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px dashed #D5CFBF',
                      background: 'transparent',
                      color: '#6E7A68',
                      fontSize: '11px',
                      fontFamily: 'var(--font-data, monospace)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Revisit Product Selection ↺
                  </button>
                </div>

                {/* Content Area - Scrollable when fixed height; natural flow when both tools closed */}
                <div
                  style={{
                    flex: 1,
                    overflowY: isEitherToolOpen ? 'auto' : 'visible',
                    padding: '24px',
                  }}
                >
                  {renderDashboardActiveTab()}
                </div>
              </div>
            </div>

            {/* Draggable Resize Handle */}
            {isEitherToolOpen && (
              <div
                onMouseDown={startResize}
                style={{
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '6px',
                  height: leftPanelHeight,
                  backgroundColor: isResizing ? '#2D6A4F' : 'transparent',
                  borderRadius: '3px',
                  transition: 'background-color 0.15s ease',
                  userSelect: 'none',
                }}
                title="Drag to resize windows (30% - 75%)"
              >
                <div
                  style={{
                    width: '2px',
                    height: '48px',
                    backgroundColor: isResizing ? '#2D6A4F' : '#D5CFBF',
                    borderRadius: '2px',
                  }}
                />
              </div>
            )}

            {/* Right Window: Tool Panels */}
            {isEitherToolOpen && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minWidth: 0,
                }}
              >
                {/* PDF Document Viewer */}
                {!isPdfCollapsed && (
                  <div
                    id="tender-pdf-viewer-container"
                    style={{
                      height: '580px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E5E0D4',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      backgroundColor: '#0f172a',
                    }}
                  >
                    <PDFDocumentViewer
                      documentText={docText}
                      pdfUrl={pdfUrl}
                      targetPage={activePageNumber}
                      highlightText={highlightQuote}
                      onPageChange={(p) => setActivePageNumber(p)}
                      onClose={() => setIsPdfCollapsed(true)}
                    />
                  </div>
                )}

                {/* AI Chatbot Panel */}
                {!isChatCollapsed && (
                  <div
                    id="tender-chat-container"
                    style={{
                      height: '580px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <TenderChatbotPanel
                      documentText={docText}
                      onPageClick={(p, text) => handleNavigateToPage(p, text)}
                      onClose={() => setIsChatCollapsed(true)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-out IS Detail Drawer */}
      <ISDetailDrawer
        isNumber={selectedISNumber}
        onClose={() => setSelectedISNumber(null)}
        onSelectStandard={(isNum: string) => setSelectedISNumber(isNum)}
      />
    </div>
  );
};
