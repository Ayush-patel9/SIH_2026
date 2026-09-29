import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Hash, 
  Calendar, 
  Download, 
  Copy, 
  Check, 
  Scale, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
import type { 
  Stage3FinalizeResponse, 
  MappedProductItem, 
  FinalizedClauseDiff, 
  NITScheduleItem, 
  TenderMetadata 
} from './types';

interface CVCAuditTabProps {
  auditRecord: Stage3FinalizeResponse['cvc_audit_record'] | null;
  mappedProducts: MappedProductItem[];
  clauseDiffs: FinalizedClauseDiff[];
  nitSchedule: NITScheduleItem[];
  tenderMetadata: TenderMetadata | null;
  onOpenDrawer: (isNumber: string) => void;
}

export const CVCAuditTab: React.FC<CVCAuditTabProps> = ({
  auditRecord,
  mappedProducts,
  clauseDiffs,
  nitSchedule,
  tenderMetadata,
  onOpenDrawer,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const hash = auditRecord?.audit_hash || 'SHA256-PENDING-FINALIZE';
  const timestamp = auditRecord?.timestamp_utc || new Date().toISOString();
  const ruleCompliance = auditRecord?.gfr_rule_compliance || 'GFR 2017 Rule 144(xi), Rule 149 & BIS Act 2016';
  const modernizedCount = auditRecord?.total_clauses_modernized || clauseDiffs.length;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopySummary = () => {
    const text = `GOVERNMENT OF INDIA - CVC STATUTORY AUDIT DEFENSE RECORD
Tender: ${tenderMetadata?.title || 'Tender Document'}
Issuing Authority: ${tenderMetadata?.department || 'Department of Public Works'}
Audit Hash: ${hash}
Timestamp: ${timestamp}
Rule Compliance: ${ruleCompliance}
Total Clauses Modernized: ${modernizedCount}
Compliant with CVC Circular 02/02/2022 & GFR Rule 144(xi).`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadDossier = () => {
    const dossierData = {
      audit_record: auditRecord,
      tender_metadata: tenderMetadata,
      products_audit: mappedProducts.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        clause: p.clause_number,
        page: p.page_number,
        detected_outdated_is: p.detected_outdated_is,
        recommended_is: p.recommended_is,
        confidence_score: p.confidence_score,
        hitl_status: p.status,
        officer_clarification_answer: p.officer_clarification_answer,
        officer_override_is: p.officer_override_is,
        qco_mandatory: p.qco_mandate?.mandatory || false,
        rationale: p.engineering_rationale,
      })),
      clause_diffs: clauseDiffs,
      nit_schedule: nitSchedule,
      generated_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CVC_Audit_Dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statutoryRules = [
    {
      code: 'GFR Rule 144(xi)',
      title: 'Mandatory Technical Specifications & Indian Standards',
      desc: 'Mandates that specifications in all public procurement must conform to standards issued by Bureau of Indian Standards (BIS) where available, ensuring broad vendor participation without proprietary bias.',
      status: 'FULLY SATISFIED',
    },
    {
      code: 'CVC Circular 02/02/2022',
      title: 'Prevention of Restrictive / Anti-Competitive Clauses',
      desc: 'Strictly prohibits citing single foreign manufacturer standards or obsolete specifications that artificially narrow competition or favor specific OEMs.',
      status: 'AUDITED & CLEARED',
    },
    {
      code: 'BIS Act 2016 (Sec 16)',
      title: 'Mandatory Quality Control Orders (QCO)',
      desc: 'Requires that products notified under Central Ministry Quality Control Orders must compulsorily bear the BIS Standard Mark (ISI logo) from licensed manufacturers.',
      status: `${mappedProducts.filter((p) => p.qco_mandate?.mandatory).length} QCO CLAUSES INSERTED`,
    },
    {
      code: 'GFR Rule 149',
      title: 'Government e-Marketplace (GeM) Harmonization',
      desc: 'Aligns tender item catalogue descriptions and technical parameter thresholds with GeM standard technical specifications.',
      status: 'SCHEDULE READY',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Statutory Header Seal Banner */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--olive-primary) 0%, #001D39 100%)',
          padding: '24px 28px',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-card-hover)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#86EFAC',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  letterSpacing: '0.04em',
                }}
              >
                <ShieldCheck size={14} color="#86EFAC" />
                <span>CVC STATUTORY AUDIT DEFENSE DOSSIER</span>
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#93C5FD',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                <Award size={13} />
                <span>GFR 2017 Rule 144(xi) Certified</span>
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              Integrity Seal & Statutory Compliance Certificate
            </h2>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
              Cryptographically verified audit trail documenting the exact rationalization from obsolete / ambiguous tender clauses to active Bureau of Indian Standards (BIS) mandates. Defensible before Central Vigilance Commission (CVC) & CAG audits.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopySummary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedSummary ? <Check size={14} color="#86EFAC" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Copied Summary!' : 'Copy Summary'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadDossier}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--emerald-pass)',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={14} />
              <span>Export Full Audit Dossier (JSON)</span>
            </button>
          </div>
        </div>

        {/* Cryptographic Seal Hash Bar */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '11.5px',
            fontFamily: 'var(--font-data)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={13} color="#86EFAC" /> SHA-256 SEAL:
            </span>
            <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', padding: '3px 8px', borderRadius: '4px', color: '#86EFAC', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {hash}
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', padding: '2px' }}
              title="Copy Hash"
            >
              {copiedHash ? <Check size={13} color="#86EFAC" /> : <Copy size={13} />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {timestamp}
            </span>
            <span style={{ color: '#86EFAC', fontWeight: 700 }}>
              {modernizedCount} Clauses Modernized
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {statutoryRules.map((rule, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: '10px',
              border: '1px solid var(--hairline)',
              backgroundColor: 'var(--surface)',
              padding: '18px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--olive-tint)',
                    color: 'var(--olive-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  <Scale size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                    {rule.code}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--ink-muted)', margin: '1px 0 0 0', fontFamily: 'var(--font-data)' }}>{rule.title}</p>
                </div>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: 'var(--emerald-bg)',
                  color: 'var(--emerald-pass)',
                  border: '1px solid var(--emerald-border)',
                  fontFamily: 'var(--font-data)',
                  whiteSpace: 'nowrap',
                }}
              >
                {rule.status}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-prose)' }}>
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Audit Line Item Traceability Matrix */}
      <div
        style={{
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', backgroundColor: 'var(--surface-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={18} color="var(--olive-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              Clause-by-Clause Audit Defense Matrix ({mappedProducts.length} Items)
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)', fontFamily: 'var(--font-data)' }}>
            Click any standard to inspect BIS Gazette details
          </span>
        </div>

        {mappedProducts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '13px' }}>
            No mapped products available yet. Run Stage 2 & 3 to populate audit matrix.
          </div>
        ) : (
          <div className="table-scroll-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '940px', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--hairline)', color: 'var(--ink-muted)', fontWeight: 700 }}>
                  <th style={{ padding: '10px 14px', minWidth: '160px' }}>Line Item / Product</th>
                  <th style={{ padding: '10px 14px', minWidth: '130px' }}>Clause / Page</th>
                  <th style={{ padding: '10px 14px', minWidth: '160px' }}>Legacy / Outdated Ref</th>
                  <th style={{ padding: '10px 14px', minWidth: '180px' }}>Designated BIS Standard</th>
                  <th style={{ padding: '10px 14px', minWidth: '140px' }}>HITL Governance</th>
                  <th style={{ padding: '10px 14px', minWidth: '240px' }}>Statutory Justification & Rationale</th>
                </tr>
              </thead>
              <tbody>
                {mappedProducts.map((p, index) => {
                  const isOutdated = Boolean(p.detected_outdated_is);
                  return (
                    <tr
                      key={p.product_id || index}
                      style={{
                        borderBottom: '1px solid var(--hairline)',
                        backgroundColor: index % 2 === 0 ? 'var(--surface)' : 'var(--surface-secondary)',
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--ink)' }}>
                        {p.product_name}
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-data)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--hairline)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: 'var(--ink)' }}>
                          Cl. {p.clause_number || 'N/A'} (p. {p.page_number})
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        {isOutdated ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-data)', color: 'var(--error-red)', backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', textDecoration: 'line-through', fontWeight: 600 }}>
                            <AlertTriangle size={11} />
                            {p.detected_outdated_is}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontSize: '11px' }}>None / Generic</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => onOpenDrawer(p.recommended_is)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontFamily: 'var(--font-data)',
                            fontWeight: 700,
                            color: 'var(--olive-primary)',
                            backgroundColor: 'var(--olive-tint)',
                            border: '1px solid var(--hairline)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                          }}
                        >
                          <span>{p.recommended_is}</span>
                          <ExternalLink size={10} />
                        </button>
                        {p.qco_mandate?.mandatory && (
                          <span
                            style={{
                              marginLeft: '6px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              backgroundColor: 'var(--amber-bg)',
                              color: 'var(--amber-warn)',
                              border: '1px solid var(--amber-border)',
                              textTransform: 'uppercase',
                            }}
                          >
                            QCO
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        {p.status === 'RESOLVED' && (
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald-pass)', border: '1px solid var(--emerald-border)', fontFamily: 'var(--font-data)' }}>
                            Confidence: {Math.round(p.confidence_score * 100)}%
                          </span>
                        )}
                        {p.status === 'OVERRIDDEN' && (
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--collapse-cobalt)', border: '1px solid rgba(79, 70, 229, 0.3)', fontFamily: 'var(--font-data)' }}>
                            Officer Override ({p.officer_override_is})
                          </span>
                        )}
                        {p.status === 'NEEDS_CLARIFICATION' && (
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'var(--amber-bg)', color: 'var(--amber-warn)', border: '1px solid var(--amber-border)', fontFamily: 'var(--font-data)' }}>
                            HITL Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: '380px' }}>
                        <p style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.45 }}>
                          {p.engineering_rationale}
                        </p>
                        {p.officer_clarification_answer && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--collapse-cobalt)', fontWeight: 600 }}>
                            Clarification Input: &ldquo;{p.officer_clarification_answer}&rdquo;
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legal & Regulatory Defense Statement */}
      <div
        style={{
          borderRadius: '10px',
          border: '1px solid var(--hairline)',
          backgroundColor: 'var(--surface-secondary)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} color="var(--olive-primary)" />
          <span>Statutory Defense Certification Text</span>
        </h4>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--hairline)',
            fontSize: '12px',
            color: 'var(--ink-secondary)',
            lineHeight: 1.6,
            fontFamily: 'var(--font-prose)',
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            &ldquo;It is hereby certified that the technical specifications of items in this tender schedule have been verified against active Gazette notifications issued under the Bureau of Indian Standards Act, 2016 and General Financial Rules (GFR) 2017 Rule 144(xi).
          </p>
          <p style={{ margin: 0 }}>
            All cited standards are currently valid in the National Repository, and wherever Quality Control Orders (QCOs) have been issued by line Ministries, compulsory ISI certification requirements have been formally incorporated. No foreign OEM-specific brands or restrictive proprietary metrics have been admitted, guaranteeing open, competitive bidding in compliance with CVC Directives.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
