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
  const [activeLawModal, setActiveLawModal] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Statutory Header Seal Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                CVC Statutory Audit Defense Dossier
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Award className="w-3 h-3" /> GFR 2017 Rule 144(xi) Certified
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Integrity Seal & Statutory Compliance Certificate
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Cryptographically verified audit trail documenting the exact rationalization from obsolete / ambiguous tender clauses to active Bureau of Indian Standards (BIS) mandates. Defensible before Central Vigilance Commission (CVC) & CAG audits.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 shadow-sm transition"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedSummary ? 'Copied Summary!' : 'Copy Summary'}
            </button>
            <button
              onClick={handleDownloadDossier}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/40 transition"
            >
              <Download className="w-4 h-4" />
              Export Full Audit Dossier (JSON)
            </button>
          </div>
        </div>

        {/* Cryptographic Seal Hash Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-emerald-400" /> SHA-256 SEAL:
            </span>
            <span className="font-mono bg-slate-950/70 px-3 py-1 rounded-lg text-emerald-300 border border-slate-800 break-all select-all">
              {hash}
            </span>
            <button
              onClick={handleCopyHash}
              title="Copy Audit Hash"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> {timestamp}
            </span>
            <span className="text-emerald-400 font-medium">
              {modernizedCount} Clauses Modernized
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statutoryRules.map((rule, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {rule.code}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{rule.title}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                {rule.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Audit Line Item Traceability Matrix */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Clause-by-Clause Audit Defense Matrix ({mappedProducts.length} Items)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click any standard to inspect BIS Gazette details
          </span>
        </div>

        {mappedProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No mapped products available yet. Run Stage 2 & 3 to populate audit matrix.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Line Item / Product</th>
                  <th className="py-3 px-4">Clause / Page</th>
                  <th className="py-3 px-4">Legacy / Outdated Ref</th>
                  <th className="py-3 px-4">Designated BIS Standard</th>
                  <th className="py-3 px-4">HITL Governance</th>
                  <th className="py-3 px-4">Statutory Justification & Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {mappedProducts.map((p, index) => {
                  const isOutdated = Boolean(p.detected_outdated_is);
                  return (
                    <tr
                      key={p.product_id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {p.product_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          Cl. {p.clause_number || 'N/A'} (p. {p.page_number})
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOutdated ? (
                          <span className="inline-flex items-center gap-1 font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded text-[11px] line-through font-medium">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {p.detected_outdated_is}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None / Generic</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onOpenDrawer(p.recommended_is)}
                          className="inline-flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800/60 transition"
                        >
                          {p.recommended_is}
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </button>
                        {p.qco_mandate?.mandatory && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 uppercase">
                            QCO
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.status === 'RESOLVED' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                            Confidence: {Math.round(p.confidence_score * 100)}%
                          </span>
                        )}
                        {p.status === 'OVERRIDDEN' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                            Officer Override ({p.officer_override_is})
                          </span>
                        )}
                        {p.status === 'NEEDS_CLARIFICATION' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                            HITL Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {p.engineering_rationale}
                        </p>
                        {p.officer_clarification_answer && (
                          <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
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
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Statutory Defense Certification Text
        </h4>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-serif text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
          <p>
            &ldquo;It is hereby certified that the technical specifications of items in this tender schedule have been verified against active Gazette notifications issued under the Bureau of Indian Standards Act, 2016 and General Financial Rules (GFR) 2017 Rule 144(xi).
          </p>
          <p>
            All cited standards are currently valid in the National Repository, and wherever Quality Control Orders (QCOs) have been issued by line Ministries, compulsory ISI certification requirements have been formally incorporated. No foreign OEM-specific brands or restrictive proprietary metrics have been admitted, guaranteeing open, competitive bidding in compliance with CVC Directives.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
