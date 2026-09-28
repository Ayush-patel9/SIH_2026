import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Upload,
  Check,
  X,
  ExternalLink,
  Layers,
  Copy,
  Download,
  Share2,
  BookOpen,
  Info
} from 'lucide-react';
import type { TenderProject, ClauseSuggestion } from './types';
import { useSession } from '../../store/userStore';
import type { UserRole } from '../../types';
import { KnowledgeGraph3DView } from '../neuralGraph/KnowledgeGraph3DView';

interface ProjectWorkspaceProps {
  project: TenderProject;
  initialTab?: 'clauses' | 'document' | 'mesh' | 'audit';
  onBackToDirectory: () => void;
  onUpdateProject: (updatedProject: TenderProject) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  initialTab = 'clauses',
  onBackToDirectory,
  onUpdateProject,
}) => {
  const { session } = useSession();
  const role: UserRole = session?.role || 'OFFICER';

  const [activeTab, setActiveTab] = useState<'clauses' | 'document' | 'mesh' | 'audit'>(initialTab);
  const [activeModalClause, setActiveModalClause] = useState<ClauseSuggestion | null>(null);
  const [customOverrideInput, setCustomOverrideInput] = useState('');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Action: Approve AI recommended standard
  const handleApproveStandard = (clauseId: string, standardToApply: string) => {
    const updatedClauses = project.clauses.map((c) => {
      if (c.clauseId !== clauseId) return c;
      return {
        ...c,
        userDecision: 'APPROVED' as const,
        chosenStandard: standardToApply,
        status: 'ACTIVE' as const,
      };
    });

    const resolvedCount = updatedClauses.filter(
      (c) => c.status === 'ACTIVE' || c.userDecision === 'APPROVED' || c.userDecision === 'OVERRIDDEN'
    ).length;
    const newScore = Math.round((resolvedCount / updatedClauses.length) * 100);

    const updated: TenderProject = {
      ...project,
      clauses: updatedClauses,
      complianceScore: newScore,
      status: newScore === 100 ? 'COMPLIANT' : 'NEEDS_REVIEW',
      lastModified: 'Just now',
      recencyTimestamp: Date.now(),
    };

    onUpdateProject(updated);
    showToast(`✓ Standard updated to ${standardToApply}`);
  };

  // Action: Apply alternative or custom override
  const handleApplyAlternative = (standard: string, reason?: string) => {
    if (!activeModalClause) return;

    const updatedClauses = project.clauses.map((c) => {
      if (c.clauseId !== activeModalClause.clauseId) return c;
      return {
        ...c,
        userDecision: 'OVERRIDDEN' as const,
        chosenStandard: standard,
        overrideReason: reason || 'Specified by procurement engineer',
        status: 'ACTIVE' as const,
      };
    });

    const resolvedCount = updatedClauses.filter(
      (c) => c.status === 'ACTIVE' || c.userDecision === 'APPROVED' || c.userDecision === 'OVERRIDDEN'
    ).length;
    const newScore = Math.round((resolvedCount / updatedClauses.length) * 100);

    const updated: TenderProject = {
      ...project,
      clauses: updatedClauses,
      complianceScore: newScore,
      status: newScore === 100 ? 'COMPLIANT' : 'NEEDS_REVIEW',
      lastModified: 'Just now',
      recencyTimestamp: Date.now(),
    };

    onUpdateProject(updated);
    setActiveModalClause(null);
    setCustomOverrideInput('');
    setOverrideReasonInput('');
    showToast(`✓ Applied custom standard: ${standard}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '0 0 32px 0' }}>
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
          }}
        >
          <CheckCircle2 size={16} color="var(--active-green)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Project Header */}
      <div
        className="workbench-card"
        style={{
          padding: '20px 24px',
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
        }}
      >
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <button
            onClick={onBackToDirectory}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--forest)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-data)',
              fontSize: '12.5px',
              fontWeight: 600,
              padding: 0,
            }}
          >
            <ArrowLeft size={14} />
            <span>← Back to All Projects</span>
          </button>
          <span style={{ color: 'var(--ink-muted)', fontSize: '12px' }}>/</span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: 'var(--ink-muted)' }}>
            {project.nitNumber}
          </span>
        </div>

        {/* Title & Metadata Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '820px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '11px',
                  background: 'rgba(54,69,47,0.1)',
                  color: 'var(--forest)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                {project.nitNumber}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>• {project.department}</span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 700,
                margin: '0 0 6px 0',
                color: 'var(--ink)',
                lineHeight: 1.3,
              }}
            >
              {project.title}
            </h1>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-data)' }}>
              <span>Estimated Outlay: <strong style={{ color: 'var(--ink)' }}>{project.estimatedValue}</strong></span>
              <span>Last Modified: <strong>{project.lastModified}</strong></span>
              <span>Clauses Ingested: <strong>{project.clauses.length} items</strong></span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {role !== 'VENDOR' && (
              <button
                onClick={() => showToast('✓ Tender specification verified for public e-procurement')}
                className="action-btn primary"
                style={{ padding: '9px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              >
                <Check size={14} />
                <span>Publish Tender</span>
              </button>
            )}
          </div>
        </div>

        {/* Compliance Progress Indicator Bar */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              {role === 'VENDOR' ? 'BIS Standard Compliance Verification' : 'Statutory BIS Modernization & Quality Control Order (QCO) Health'}
            </span>
            <span style={{ fontWeight: 700, color: project.complianceScore === 100 ? 'var(--active-green)' : 'var(--superseded-red)' }}>
              {project.complianceScore}% ({project.clauses.filter((c) => c.status === 'ACTIVE' || c.userDecision === 'APPROVED' || c.userDecision === 'OVERRIDDEN').length} / {project.clauses.length} Standards Compliant)
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--hairline)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${project.complianceScore}%`,
                height: '100%',
                background: project.complianceScore === 100 ? 'var(--active-green)' : 'var(--superseded-red)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--hairline)',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('clauses')}
          style={{
            padding: '9px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clauses' ? '2px solid var(--forest)' : '2px solid transparent',
            color: activeTab === 'clauses' ? 'var(--forest)' : 'var(--ink-secondary)',
            fontWeight: activeTab === 'clauses' ? 700 : 500,
            fontSize: '13px',
            fontFamily: 'var(--font-data)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={15} />
          <span>Clauses & AI Modernization ({project.clauses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('document')}
          style={{
            padding: '9px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'document' ? '2px solid var(--forest)' : '2px solid transparent',
            color: activeTab === 'document' ? 'var(--forest)' : 'var(--ink-secondary)',
            fontWeight: activeTab === 'document' ? 700 : 500,
            fontSize: '13px',
            fontFamily: 'var(--font-data)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BookOpen size={15} />
          <span>Tender Document & Annotations</span>
        </button>

        <button
          onClick={() => setActiveTab('mesh')}
          style={{
            padding: '9px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'mesh' ? '2px solid var(--forest)' : '2px solid transparent',
            color: activeTab === 'mesh' ? 'var(--forest)' : 'var(--ink-secondary)',
            fontWeight: activeTab === 'mesh' ? 700 : 500,
            fontSize: '13px',
            fontFamily: 'var(--font-data)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={15} />
          <span>Project Standards Neural Mesh (3D)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '9px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid var(--forest)' : '2px solid transparent',
            color: activeTab === 'audit' ? 'var(--forest)' : 'var(--ink-secondary)',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            fontSize: '13px',
            fontFamily: 'var(--font-data)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={15} />
          <span>Statutory Audit & CVC Defense</span>
        </button>
      </div>

      {/* TAB 1: Clauses & AI Modernization */}
      {activeTab === 'clauses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--ink-secondary)', fontFamily: 'var(--font-prose)' }}>
              Review each material specification. Click <strong>Approve</strong> to apply the BIS recommendation, or select <strong>Options & Alternatives</strong> to choose a specific variant.
            </span>
          </div>

          {project.clauses.map((clause) => {
            const isResolved =
              clause.userDecision === 'APPROVED' ||
              clause.userDecision === 'OVERRIDDEN' ||
              clause.status === 'ACTIVE';

            return (
              <div
                key={clause.clauseId}
                className="workbench-card"
                style={{
                  padding: '20px',
                  borderLeft: `4px solid ${
                    isResolved
                      ? 'var(--active-green)'
                      : clause.status === 'WITHDRAWN'
                      ? 'var(--superseded-red)'
                      : 'var(--proactive-amber)'
                  }`,
                  background: 'var(--surface)',
                }}
              >
                {/* Clause Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest)' }}>
                        {clause.clauseNumber}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>{clause.title}</span>
                      {clause.page && (
                        <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
                          (Page {clause.page})
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-data)', fontSize: '12.5px', color: 'var(--ink-secondary)' }}>
                      Specified in Tender Document: <code style={{ background: 'var(--hairline)', padding: '2px 7px', borderRadius: '3px' }}>{clause.citedStandard}</code>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      padding: '4px 10px',
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
                      ? 'WITHDRAWN STANDARD'
                      : clause.status === 'OUTDATED'
                      ? 'OUTDATED REVISION'
                      : clause.status === 'AMENDMENT_NEEDED'
                      ? 'AMENDMENT APPLIED'
                      : 'COMPLIANT'}
                  </span>
                </div>

                {/* AI Recommendation Box */}
                <div
                  style={{
                    background: 'rgba(54,69,47,0.03)',
                    border: '1px solid var(--hairline)',
                    borderRadius: '6px',
                    padding: '14px',
                    marginBottom: '14px',
                    fontSize: '13.5px',
                    fontFamily: 'var(--font-prose)',
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontFamily: 'var(--font-data)', fontSize: '11.5px', fontWeight: 700, color: 'var(--forest)' }}>
                    <Sparkles size={13} />
                    <span>RECOMMENDED BIS STANDARD: {clause.recommendedStandard}</span>
                  </div>
                  {clause.aiRecommendation}

                  {clause.chosenStandard && clause.chosenStandard !== clause.recommendedStandard && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--forest)', fontWeight: 600 }}>
                      Applied Custom Standard: <strong>{clause.chosenStandard}</strong> {clause.overrideReason ? `(${clause.overrideReason})` : ''}
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                {role !== 'VENDOR' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                    {clause.userDecision === 'APPROVED' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--active-green)', fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-data)' }}>
                        <CheckCircle2 size={16} />
                        <span>Standard active in draft</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveModalClause(clause)}
                          className="action-btn secondary"
                          style={{ padding: '7px 14px', fontSize: '12px', fontFamily: 'var(--font-data)' }}
                        >
                          <span>Options & Alternatives...</span>
                        </button>

                        <button
                          onClick={() => handleApproveStandard(clause.clauseId, clause.recommendedStandard)}
                          className="action-btn primary"
                          style={{ padding: '7px 16px', fontSize: '12.5px', fontFamily: 'var(--font-data)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                        >
                          <Check size={14} />
                          <span>Approve {clause.recommendedStandard}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Tender Document & Annotations */}
      {activeTab === 'document' && (
        <div className="workbench-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                Tender Document: {project.pdfFileName || `${project.nitNumber}.pdf`}
              </h3>
              <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '4px 0 0 0' }}>
                Official National Highways Authority of India specification with inline clause annotations.
              </p>
            </div>

            <a
              href={`/${project.pdfFileName || 'MOCK_GOVERNMENT_TENDER_NIT_2026.pdf'}`}
              download
              target="_blank"
              rel="noreferrer"
              className="action-btn secondary"
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Download PDF File</span>
            </a>
          </div>

          {/* Embedded PDF Viewer Frame */}
          <div
            style={{
              width: '100%',
              height: '620px',
              border: '1px solid var(--hairline)',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#525659',
            }}
          >
            <iframe
              src={`/${project.pdfFileName || 'MOCK_GOVERNMENT_TENDER_NIT_2026.pdf'}#toolbar=1`}
              title="Tender Document Viewer"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* TAB 3: Project Standards Neural Mesh (3D Graph in Project Context) */}
      {activeTab === 'mesh' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="workbench-card" style={{ padding: '16px 20px', background: 'rgba(54,69,47,0.04)', borderLeft: '4px solid var(--forest)' }}>
            <h4 style={{ margin: '0 0 4px 0', fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              Standards Citation & Normative Lineage Mesh for {project.nitNumber}
            </h4>
            <p style={{ margin: 0, fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)' }}>
              Interactive neural graph visualizing how this tender's materials (cement, structural steel, rebars, HDPE pipes, CCTV) interconnect with withdrawn codes, active consolidated specifications, and mandatory factory test methods.
            </p>
          </div>

          {/* Embedded 3D Knowledge Graph */}
          <KnowledgeGraph3DView />
        </div>
      )}

      {/* TAB 4: Statutory Audit & CVC Defense */}
      {activeTab === 'audit' && (
        <div className="workbench-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="concept-status-badge active">CVC & GFR COMPLIANCE SEAL</span>
            <span className="section-label" style={{ margin: 0 }}>IMMUTABLE AUDIT TRAIL</span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--ink)' }}>
            Statutory Vigilance & Cryptographic Defense Ledger
          </h3>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13.5px', color: 'var(--ink-secondary)', margin: '0 0 20px 0' }}>
            Every standard adopted or overridden in this tender is hashed with SHA-256 for complete non-repudiation during vigilance or CAG inspections.
          </p>

          <div
            style={{
              padding: '16px',
              borderRadius: '6px',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--hairline)',
              fontFamily: 'var(--font-data)',
              fontSize: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ color: 'var(--ink-muted)', marginBottom: '4px', fontWeight: 700 }}>IMMUTABLE RECORD HASH</div>
            <code style={{ fontSize: '13px', color: 'var(--forest)', wordBreak: 'break-all', fontWeight: 600 }}>
              sha256-8f9b2c3a10e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2
            </code>
            <div style={{ marginTop: '8px', color: 'var(--ink-secondary)' }}>
              Project: <strong>{project.nitNumber}</strong> · Timestamp: <strong>{new Date().toISOString()}</strong> · Authority: <strong>BIS Quality Control Orders</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => showToast('✓ Audit certificate exported')}
              className="action-btn primary"
              style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CVC Audit Defense Certificate</span>
            </button>
          </div>
        </div>
      )}

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
