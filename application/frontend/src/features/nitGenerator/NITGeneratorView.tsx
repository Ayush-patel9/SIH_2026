import React, { useState, useEffect } from 'react';
import { FileText, Scale } from 'lucide-react';
import type { StandardsResponse } from '../../types';
import { generateNITClause } from './clauseTemplates';
import type { NITCustomFields } from './clauseTemplates';
import { useSession } from '../../store/userStore';
import { TemplateSelector } from './TemplateSelector';
import { ClauseEditor } from './ClauseEditor';
import { ClauseExportBar } from './ClauseExportBar';

interface NITGeneratorViewProps {
  currentData?: StandardsResponse | null;
}

export const NITGeneratorView: React.FC<NITGeneratorViewProps> = ({ currentData }) => {
  const { session } = useSession();

  if (!currentData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="workbench-card" style={{ padding: '40px', textAlign: 'center' }}>
          <FileText size={36} style={{ color: 'var(--ink-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
            No Active Standard Selected for NIT Clause Generation
          </h3>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '14px', color: 'var(--ink-secondary)', maxWidth: '520px', margin: '8px auto 0 auto' }}>
            Search for a material standard above or select a project from the Projects tab to automatically generate legally defensible GFR Rule 144 / GeM tender clauses.
          </p>
        </div>
      </div>
    );
  }
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard_gem');
  const [customFields, setCustomFields] = useState<NITCustomFields>(() => ({
    nitNumber: 'NIT-MoRTH-2026-088',
    ministry: session?.ministry || 'Ministry of Road Transport and Highways',
    department: session?.department || session?.organization || 'National Highways Authority of India (NHAI)',
    projectName: 'EPC Package 4: 6-Lane Expressway NH-44',
    location: 'NCR Corridor Km 24+000 to 48+000',
    officerName: session?.name || 'Authorized Officer',
    officerDesignation: session?.designation || (session?.role ? `${session.role} Workspace` : 'Executive Engineer / Procurement Officer'),
    estimatedCostInrCr: '145.5',
  }));

  const [clauseText, setClauseText] = useState<string>(() =>
    generateNITClause(currentData, selectedTemplate, customFields)
  );

  // Re-generate clause when currentData or selectedTemplate or customFields change
  useEffect(() => {
    setClauseText(generateNITClause(currentData, selectedTemplate, customFields));
  }, [currentData, selectedTemplate, customFields]);

  const handleUpdateCustomFields = (updated: Partial<NITCustomFields>) => {
    setCustomFields((prev) => ({ ...prev, ...updated }));
  };

  const primary = currentData.primary_recommendation;
  const audit = currentData.audit_record;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div
        className="workbench-card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface)',
          borderLeft: '4px solid var(--collapse-cobalt)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span className="section-label" style={{ margin: 0 }}>
                NOTICE INVITING TENDER CLAUSE GENERATOR (FEATURE 08)
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-prose)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', margin: '4px 0 2px 0' }}>
              NIT Technical Specification Clause Generator
            </h2>
            <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: 0 }}>
              Auto-generate legally defensible procurement tender clauses conforming to BIS quality control orders and CVC vigilance mandates.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span className="badge-code" style={{ fontSize: '12px', fontWeight: 700 }}>
              {primary.is_number}
            </span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: 'var(--ink-muted)' }}>
              SHA-256 SEALED
            </span>
          </div>
        </div>
      </div>

      {/* Component 2: Ministry Portal Template Selector */}
      <TemplateSelector
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
      />

      {/* Component 1 & 3: Interactive Clause Editor & Quick-Fill */}
      <ClauseEditor
        clauseText={clauseText}
        onChange={setClauseText}
        customFields={customFields}
        onUpdateCustomFields={handleUpdateCustomFields}
      />

      {/* Component 4: Export Toolbar */}
      <ClauseExportBar
        clauseText={clauseText}
        isNumber={primary.is_number}
        auditHash={audit?.audit_hash || currentData.meta.audit_reference_hash}
      />

      {/* Legal Defensibility Advisory */}
      <div
        style={{
          padding: '14px 18px',
          background: 'var(--paper)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <Scale size={20} style={{ color: 'var(--collapse-cobalt)', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <strong style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: 'var(--ink)', textTransform: 'uppercase' }}>
            GOVERNMENT PROCUREMENT VIGILANCE COMPLIANCE NOTE
          </strong>
          <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', margin: '4px 0 0 0', lineHeight: '1.45' }}>
            All generated clauses enforce the <strong>Statutory Precedence Rule</strong> under Section 16 of the Bureau of Indian Standards Act, 2016.
            Any legacy withdrawn numbers (such as IS 8112:1989 or IS 226:1975) are automatically replaced with active specifications to protect procurement officers against audit queries by the Comptroller and Auditor General (CAG) and Central Vigilance Commission (CVC).
          </p>
        </div>
      </div>
    </div>
  );
};
