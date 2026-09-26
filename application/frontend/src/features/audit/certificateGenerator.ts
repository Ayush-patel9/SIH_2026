/**
 * certificateGenerator.ts
 * Generates an official Government of India vigilance record memorandum for CVC audit compliance.
 */

import type { AuditRecord, PrimaryRecommendation, QueryUnderstanding, ResponseMeta } from '../../types';

export function generateCertificateHTML(
  auditRecord: AuditRecord,
  meta: ResponseMeta,
  queryUnderstanding: QueryUnderstanding,
  primaryRec: PrimaryRecommendation,
  officerName = 'Ayush Patel (Executive Engineer / Procurement Officer)'
): string {
  const timestamp = new Date(auditRecord.timestamp || meta.timestamp);
  const istTime = timestamp.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const snapshotEntries = Object.entries(auditRecord.standards_version_snapshot || {});

  return `
    <div class="certificate-document" style="font-family: 'Literata', 'Times New Roman', serif; max-width: 760px; margin: 0 auto; padding: 36px 40px; color: #161A22; background: #FFFFFF; border: 2px solid #161A22;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #161A22; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="font-size: 24px; margin-bottom: 4px;">🏛️</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #4A5060;">
          GOVERNMENT OF INDIA · MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
        </div>
        <div style="font-family: 'Literata', serif; font-size: 20px; font-weight: 700; margin-top: 4px; color: #161A22;">
          BUREAU OF INDIAN STANDARDS · MANAKAI INTELLIGENCE PLATFORM
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #1B4FE0; margin-top: 6px; letter-spacing: 0.05em;">
          OFFICIAL VIGILANCE AUDIT & COMPLIANCE DEFENSE CERTIFICATE
        </div>
      </div>

      <!-- Reference Metadata Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; font-family: 'JetBrains Mono', monospace;">
        <tr>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; background: #EEF0F4; width: 35%; font-weight: 600;">RECOMMENDATION REF ID</td>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; font-weight: 600; color: #1B4FE0;">${auditRecord.recommendation_id}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; background: #EEF0F4; font-weight: 600;">QUERY TRANSACTION ID</td>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px;">${auditRecord.query_id}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; background: #EEF0F4; font-weight: 600;">TIMESTAMP (IST)</td>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px;">${istTime}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; background: #EEF0F4; font-weight: 600;">AUTHORIZED OFFICER</td>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px;">${officerName}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; background: #EEF0F4; font-weight: 600;">PROCUREMENT MODE</td>
          <td style="border: 1px solid #D0D4DC; padding: 6px 10px; color: ${auditRecord.dry_run ? '#D97706' : '#108250'}; font-weight: 700;">
            ${auditRecord.dry_run ? 'DRY-RUN SIMULATION (NON-OFFICIAL)' : 'OFFICIAL TENDER SPECIFICATION DETERMINATION'}
          </td>
        </tr>
      </table>

      <!-- Section: Input Specification -->
      <div style="margin-bottom: 20px;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #4A5060; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">
          1. PROCUREMENT INPUT SPECIFICATION (TENDER / NIT CLAUSE)
        </div>
        <blockquote style="margin: 0; padding: 10px 14px; background: #EEF0F4; border-left: 3px solid #1B4FE0; font-family: 'Literata', serif; font-size: 14px; line-height: 1.5;">
          "${queryUnderstanding.original_text}"
        </blockquote>
      </div>

      <!-- Section: Enforced Standard -->
      <div style="margin-bottom: 20px;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #4A5060; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">
          2. LEGALLY APPLICABLE INDIAN STANDARD DETERMINATION
        </div>
        <div style="padding: 12px 14px; border: 1px solid #D0D4DC; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: #1B4FE0;">
              ${primaryRec.is_number}
            </span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #108250; font-weight: 600;">
              STATUS: ${primaryRec.status} (EDITION: ${primaryRec.year_published})
            </span>
          </div>
          <div style="font-family: 'Literata', serif; font-size: 14px; color: #161A22; margin-top: 4px;">
            ${primaryRec.title}
          </div>
          ${
            primaryRec.certification?.mandatory
              ? `<div style="margin-top: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #B45309; background: #FEF3C7; padding: 4px 8px; border: 1px solid #FCD34D;">
                  ⚖️ MANDATORY QCO ORDER: ${primaryRec.certification.qco_order_name} (${primaryRec.certification.qco_gazette_ref})
                </div>`
              : ''
          }
        </div>
      </div>

      <!-- Section: Standard Version Snapshot Table -->
      <div style="margin-bottom: 20px;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #4A5060; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">
          3. STANDARDS CATALOG VERSION SNAPSHOT AT QUERY INSTANT
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'JetBrains Mono', monospace;">
          <thead>
            <tr style="background: #EEF0F4; text-align: left;">
              <th style="border: 1px solid #D0D4DC; padding: 6px 10px;">STANDARD NO.</th>
              <th style="border: 1px solid #D0D4DC; padding: 6px 10px;">GAZETTE STATUS</th>
              <th style="border: 1px solid #D0D4DC; padding: 6px 10px;">ACTIVE AMENDMENT</th>
            </tr>
          </thead>
          <tbody>
            ${
              snapshotEntries.length > 0
                ? snapshotEntries
                    .map(
                      ([std, snap]) => `
                <tr>
                  <td style="border: 1px solid #D0D4DC; padding: 6px 10px; font-weight: 600;">${std}</td>
                  <td style="border: 1px solid #D0D4DC; padding: 6px 10px; color: ${snap.status_at_query_time === 'ACTIVE' ? '#108250' : '#C23B3B'};">${snap.status_at_query_time}</td>
                  <td style="border: 1px solid #D0D4DC; padding: 6px 10px;">${snap.amendment_at_query_time || 'Base Revision'}</td>
                </tr>`
                    )
                    .join('')
                : `<tr><td style="border: 1px solid #D0D4DC; padding: 6px 10px;" colspan="3">${primaryRec.is_number} · ACTIVE</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <!-- Section: Cryptographic Hash Block -->
      <div style="margin-bottom: 24px;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #4A5060; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">
          4. CRYPTOGRAPHIC INTEGRITY PROOF (SHA-256 DIGEST)
        </div>
        <div style="background: #0D0F14; padding: 10px 14px; border-radius: 2px;">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #EEF0F4; word-break: break-all; letter-spacing: 0.05em;">
            ${auditRecord.audit_hash}
          </div>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8890A0; margin-top: 4px;">
          Computed over: [QueryID + Timestamp + PrimaryIS + StandardSnapshot]. Any tampering invalidates this hash.
        </div>
      </div>

      <!-- Declaration & CVC Legal Cover -->
      <div style="border-top: 1px dashed #D0D4DC; padding-top: 14px; font-size: 12px; line-height: 1.5; color: #4A5060;">
        <p style="margin: 0 0 6px 0;">
          <strong>CVC VIGILANCE DECLARATION:</strong> This record was generated automatically by the ManakAI National Standards Intelligence Engine. It establishes that the procurement officer relied upon active, verified Bureau of Indian Standards specifications in accordance with Central Vigilance Commission procurement guidelines and General Financial Rules (GFR 2017 Rule 144).
        </p>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px;">
          <div>
            <div>RTI ACT 2005 EXPORTABLE: <strong>${auditRecord.rti_exportable ? 'YES (SECTION 4 COMPLIANT)' : 'RESTRICTED'}</strong></div>
            <div>VERIFICATION URL: <strong>https://manakai.bis.gov.in/verify</strong></div>
          </div>
          <div style="text-align: center; border-top: 1px solid #161A22; width: 180px; padding-top: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            OFFICIAL STAMP / SEAL
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Open print window for saving as PDF or printing directly.
 */
export function downloadCertificate(htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    alert('Please allow popups to download and print the legal defense certificate.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Government of India — Vigilance Audit Certificate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 15mm; }
          body { margin: 0; padding: 20px; background: #EEF0F4; }
          @media print {
            body { background: #FFFFFF; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
