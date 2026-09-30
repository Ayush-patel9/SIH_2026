import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  ArrowRight,
  Upload,
  Sparkles,
  FileText,
  Building,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { TenderProject } from './types';
import { useSession } from '../../store/userStore';
import type { UserRole } from '../../types';

interface ProjectsDirectoryProps {
  projects: TenderProject[];
  onOpenProject: (projectId: string, initialTab?: 'clauses' | 'document' | 'mesh' | 'audit') => void;
  onUploadNewTender: () => void;
}

export const ProjectsDirectory: React.FC<ProjectsDirectoryProps> = ({
  projects,
  onOpenProject,
  onUploadNewTender,
}) => {
  const { session } = useSession();
  const role: UserRole = session?.role || 'OFFICER';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'NEEDS_REVIEW' | 'COMPLIANT' | 'PUBLISHED'>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RECENCY' | 'VALUE' | 'SCORE'>('RECENCY');

  // Extract unique departments for dropdown
  const departments = ['ALL', ...Array.from(new Set(projects.map((p) => p.department)))];

  // Filter & Sort
  const filteredProjects = projects
    .filter((project) => {
      const q = searchQuery.toLowerCase().trim();
      const clauses = project.clauses || [];
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.nitNumber.toLowerCase().includes(q) ||
        project.department.toLowerCase().includes(q) ||
        clauses.some((c) =>
          c.title.toLowerCase().includes(q) ||
          c.citedStandard.toLowerCase().includes(q) ||
          c.recommendedStandard.toLowerCase().includes(q)
        );

      if (!matchesSearch) return false;
      if (filterStatus !== 'ALL' && project.status !== filterStatus) return false;
      if (selectedDepartment !== 'ALL' && project.department !== selectedDepartment) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'RECENCY') return b.recencyTimestamp - a.recencyTimestamp;
      if (sortBy === 'SCORE') return b.complianceScore - a.complianceScore;
      if (sortBy === 'VALUE') {
        const valA = parseFloat(a.estimatedValue.replace(/[^0-9.]/g, '')) || 0;
        const valB = parseFloat(b.estimatedValue.replace(/[^0-9.]/g, '')) || 0;
        return valB - valA;
      }
      return 0;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '4px 0 32px 0' }}>
      {/* Top Hero Banner */}
      <div
        className="workbench-card"
        style={{
          background: 'linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface) 100%)',
          border: '1px solid var(--hairline)',
          borderLeft: '4px solid var(--forest)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '24px 28px',
        }}
      >
        <div style={{ maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="concept-status-badge active">
              {role === 'VENDOR' ? 'VENDOR TENDER MARKETPLACE' : role === 'AUDITOR' ? 'STATUTORY VIGILANCE QUEUE' : 'PROCUREMENT WORKSPACE'}
            </span>
            <span className="section-label" style={{ margin: 0 }}>CENTRALIZED NIT DIRECTORY</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--ink)' }}>
            {role === 'VENDOR'
              ? 'Active Public Procurement Tenders & BIS Specifications'
              : 'Procurement Projects & Standards Modernization Ledger'}
          </h1>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5 }}>
            {role === 'VENDOR'
              ? 'Select any government tender to inspect required Indian Standards (IS Codes), mandatory factory test methods, and eligibility criteria.'
              : 'Select a project to access its dedicated workspace: inspect extracted clauses, review the interactive 3D standards mesh, and approve AI supersession recommendations.'}
          </p>
        </div>

        {/* Primary Action Button */}
        {role !== 'VENDOR' && (
          <button
            onClick={onUploadNewTender}
            className="action-btn primary"
            style={{
              padding: '12px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-data)',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            <Upload size={16} />
            <span>+ Ingest New Tender (PDF / Text)</span>
          </button>
        )}
      </div>

      {/* Search, Filter & Controls Toolbar */}
      <div
        className="workbench-card"
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Full-Width Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, NIT code, department, or material (e.g. 'Cement', 'Steel', 'IS 269', 'HDPE')..."
            style={{
              width: '100%',
              padding: '11px 14px 11px 40px',
              borderRadius: '6px',
              border: '1px solid var(--hairline)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '13px',
              fontFamily: 'var(--font-data)',
              outline: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '11px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-muted)',
                fontSize: '12px',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills, Department Selector, and Sorting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)', fontWeight: 600 }}>Status:</span>
            {(['ALL', 'NEEDS_REVIEW', 'COMPLIANT', 'PUBLISHED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: filterStatus === status ? 'var(--ink)' : 'var(--hairline)',
                  background: filterStatus === status ? 'var(--ink)' : 'transparent',
                  color: filterStatus === status ? 'var(--paper)' : 'var(--ink-secondary)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-data)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {status === 'ALL'
                  ? `All Projects (${projects.length})`
                  : status === 'NEEDS_REVIEW'
                  ? `Action Needed (${projects.filter((p) => p.status === 'NEEDS_REVIEW').length})`
                  : status === 'COMPLIANT'
                  ? `100% Compliant (${projects.filter((p) => p.status === 'COMPLIANT').length})`
                  : `Published (${projects.filter((p) => p.status === 'PUBLISHED').length})`}
              </button>
            ))}
          </div>

          {/* Department Filter & Sort Dropdown */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>Dept:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-data)',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Departments</option>
                {departments.filter((d) => d !== 'ALL').map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.split('(')[1]?.replace(')', '') || dept.slice(0, 15)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-data)',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              >
                <option value="RECENCY">Recently Modified</option>
                <option value="VALUE">Estimated Value (High to Low)</option>
                <option value="SCORE">Compliance Score</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div
          className="workbench-card"
          style={{
            padding: '48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={32} color="var(--ink-muted)" />
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>No matching projects found</h3>
          <p style={{ margin: 0, fontFamily: 'var(--font-prose)', color: 'var(--ink-secondary)', fontSize: '13px' }}>
            Try adjusting your search query or status filter to see active government procurement tenders.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('ALL');
              setSelectedDepartment('ALL');
            }}
            className="action-btn secondary"
            style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(560px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredProjects.map((project) => {
            const clauses = project.clauses || [];
            const needsReviewCount = clauses.filter((c) => c.status !== 'ACTIVE' && c.userDecision !== 'APPROVED' && c.userDecision !== 'OVERRIDDEN').length;

            return (
              <div
                key={project.id}
                className="workbench-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '22px',
                  border: '1px solid var(--hairline)',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)',
                  animation: 'cardEntrance 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--forest)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--hairline)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Card Top: Department & Recency */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--forest)',
                        background: 'var(--olive-leaf)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {project.department.split('(')[1]?.replace(')', '') || project.department.slice(0, 20)}
                    </span>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontFamily: 'var(--font-data)',
                        fontSize: '11.5px',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      <Clock size={12} />
                      {project.lastModified}
                    </span>
                  </div>

                  {/* Title & NIT Reference */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      margin: '0 0 4px 0',
                      lineHeight: 1.35,
                    }}
                  >
                    {project.title}
                  </h3>

                  <div
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: '11.5px',
                      color: 'var(--ink-muted)',
                      marginBottom: '10px',
                    }}
                  >
                    NIT Reference: <strong style={{ color: 'var(--ink)' }}>{project.nitNumber}</strong>
                  </div>

                  {/* Short Scope Description */}
                  {project.description && (
                    <p
                      style={{
                        fontFamily: 'var(--font-prose)',
                        fontSize: '13px',
                        color: 'var(--ink-secondary)',
                        margin: '0 0 14px 0',
                        lineHeight: 1.5,
                      }}
                    >
                      {project.description}
                    </p>
                  )}

                  {/* Materials & Key Standards Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {clauses.map((c) => (
                      <span
                        key={c.clauseId}
                        style={{
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-data)',
                          padding: '2px 7px',
                          borderRadius: '3px',
                          background:
                            c.status === 'WITHDRAWN'
                              ? 'rgba(239, 68, 68, 0.08)'
                              : c.status === 'ACTIVE'
                              ? 'rgba(34, 197, 94, 0.08)'
                              : 'rgba(245, 158, 11, 0.08)',
                          color:
                            c.status === 'WITHDRAWN'
                              ? 'var(--superseded-red)'
                              : c.status === 'ACTIVE'
                              ? 'var(--active-green)'
                              : 'var(--proactive-amber)',
                          border: '1px solid',
                          borderColor:
                            c.status === 'WITHDRAWN'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : c.status === 'ACTIVE'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                        }}
                      >
                        {c.recommendedStandard || c.citedStandard}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Value, Health Score, and Workspace Action */}
                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '14px' }}>
                  {/* Progress & Value Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>Estimated Value</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-data)', color: 'var(--ink)' }}>
                        {project.estimatedValue}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>BIS Compliance</div>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
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
                        {project.complianceScore}% HEALTH {needsReviewCount > 0 ? `(${needsReviewCount} flagged)` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Visual Health Bar */}
                  <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--hairline)', overflow: 'hidden', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: `${project.complianceScore}%`,
                        height: '100%',
                        background: project.complianceScore === 100 ? 'var(--active-green)' : 'var(--superseded-red)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onOpenProject(project.id, 'mesh')}
                      className="action-btn secondary"
                      style={{
                        padding: '7px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-data)',
                      }}
                      title="Inspect standards graph for this project"
                    >
                      <Sparkles size={13} />
                      <span>3D Mesh</span>
                    </button>

                    <button
                      onClick={() => onOpenProject(project.id, 'clauses')}
                      className="action-btn primary"
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-data)',
                        fontWeight: 600,
                      }}
                    >
                      <span>Open Project Workspace</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
