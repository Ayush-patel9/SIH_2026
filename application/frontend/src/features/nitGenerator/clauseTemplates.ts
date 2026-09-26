import type { StandardsResponse } from '../../types';

export interface NITTemplateConfig {
  id: string;
  label: string;
  portal: string;
  badge: string;
  description: string;
}

export const NIT_TEMPLATES: Record<string, NITTemplateConfig> = {
  standard_gem: {
    id: 'standard_gem',
    label: 'GeM Portal (Standard)',
    portal: 'Government e-Marketplace (GeM)',
    badge: 'GeM v4.0',
    description: 'Standard two-envelope procurement clause compliant with GeM General Terms and Conditions (GTC).',
  },
  cpwd: {
    id: 'cpwd',
    label: 'CPWD Works Specification',
    portal: 'Central Public Works Department (CPWD)',
    badge: 'CPWD DSR 2023',
    description: 'Concise specification format conforming to CPWD Specifications 2019 and Works Manual.',
  },
  nic_eprocurement: {
    id: 'nic_eprocurement',
    label: 'NIC CPPP Portal (e-Procure)',
    portal: 'Central Public Procurement Portal (CPPP)',
    badge: 'NIC e-Procure',
    description: 'Comprehensive technical specification schedule with mandatory CVC vigilance compliance clauses.',
  },
  roads_highways: {
    id: 'roads_highways',
    label: 'MoRTH / NHAI Highways',
    portal: 'Ministry of Road Transport & Highways (MoRTH)',
    badge: 'MoRTH 5th Rev',
    description: 'Rigorous highway clause incorporating IRC guidelines, standard test frequencies, and mandatory QCO orders.',
  },
  railways: {
    id: 'railways',
    label: 'Indian Railways (IREPS / RDSO)',
    portal: 'Indian Railways E-Procurement System (IREPS)',
    badge: 'IREPS / RDSO',
    description: 'Railway infrastructure format requiring RDSO / RITES pre-dispatch inspection and material test certificates.',
  },
  defence: {
    id: 'defence',
    label: 'DRDO / MoD Defence Works',
    portal: 'Ministry of Defence / MES',
    badge: 'MES / DRDO',
    description: 'High-security procurement clause requiring DGQA / NABL accredited mill test certificates.',
  },
};

export interface NITCustomFields {
  nitNumber?: string;
  ministry?: string;
  department?: string;
  projectName?: string;
  location?: string;
  officerName?: string;
  officerDesignation?: string;
  estimatedCostInrCr?: string;
}

export function generateNITClause(
  response: StandardsResponse,
  templateType: string = 'standard_gem',
  customFields?: NITCustomFields
): string {
  const rec = response.primary_recommendation;
  const query = response.query_understanding;
  const cert = rec.certification;
  const audit = response.audit_record;

  const FILL = (placeholder: string, actual?: string) =>
    actual && actual.trim() ? actual.trim() : `[FILL: ${placeholder}]`;

  const productName = query.product_name || rec.title.split('—')[0].trim();
  const gradeSpec = query.grade_specification || 'Standard Grade per IS specification';
  const nitRef = FILL('NIT Reference / Tender Notice Number', customFields?.nitNumber);
  const ministry = FILL('Name of Ministry / Department', customFields?.ministry);
  const dept = FILL('Procuring Division / Project Cell', customFields?.department);
  const project = FILL('Project Name and Detailed Site Location', customFields?.projectName);
  const officer = FILL('Designated Executive Engineer / Procurement Officer', customFields?.officerName);
  const designation = FILL('Officer Designation', customFields?.officerDesignation);
  const estCost = customFields?.estimatedCostInrCr ? `₹${customFields.estimatedCostInrCr} Crore` : FILL('Estimated Procurement Value (INR)');

  // Gather test methods
  const testMethods = response.allied_standards?.filter((s) => s.relation_type === 'TEST_METHOD') || [];
  const testMethodLines =
    testMethods.length > 0
      ? testMethods
          .map((t, idx) => `   (${idx + 1}) ${t.is_number} — ${t.title}${t.why ? ` [${t.why}]` : ''}`)
          .join('\n')
      : `   (1) Mandatory routine physical and chemical testing as specified in ${rec.is_number}.`;

  // Certification Clause
  const certClause = cert?.mandatory
    ? `The supplied ${productName} SHALL MANDATORILY BEAR THE BIS STANDARD MARK (ISI Mark / CM/L License Number) pursuant to the ${cert.qco_order_name || 'Quality Control Order'} gazetted under Section 16 of the BIS Act, 2016.\n\n` +
      `   (a) All participating bidders must submit a valid, active BIS License Certificate (CM/L format) in the Technical Bid Envelope.\n` +
      `   (b) Bids quoting uncertified material or foreign consignments without valid BIS CRS/ISI registration SHALL BE SUMMARILY REJECTED at the Technical Evaluation stage without any further representation.`
    : `Conformity to Indian Standard ${rec.is_number} is mandatory. In the absence of a BIS license, the contractor/supplier must submit comprehensive manufacturer test certificates (MTC) alongside third-party NABL-accredited laboratory test reports for each dispatched lot.`;

  // Template variants
  if (templateType === 'cpwd') {
    return `================================================================================
CENTRAL PUBLIC WORKS DEPARTMENT (CPWD) — TECHNICAL SCHEDULE
================================================================================
NIT Reference  : ${nitRef}
Ministry/Dept  : ${ministry} — ${dept}
Project Scope  : ${project}
Estimated Cost : ${estCost}
Standard Ref   : ${rec.is_number} (Indian Standard)
================================================================================

1. ITEM SPECIFICATION:
   Supply and delivery of ${productName} (${gradeSpec}) strictly conforming
   in all respects to ${rec.is_number}${rec.year_published ? `:${rec.year_published}` : ''}${rec.latest_amendment ? ` incorporating ${rec.latest_amendment}` : ''}.

2. STATUTORY BIS CERTIFICATION:
   ${cert?.mandatory ? `MANDATORY BIS ISI MARKING as per ${cert.qco_order_name || 'statutory QCO'}. Bidders to furnish valid BIS CM/L license number.` : `Conformity to ${rec.is_number} mandatory.`}

3. APPROVED MANUFACTURERS & BRANDS:
   Material shall be sourced only from primary manufacturers possessing valid BIS
   licenses. Secondary rerollers / unbranded consignments are strictly prohibited.

4. MANDATORY TESTING & CONFORMANCE:
   The contractor shall arrange testing of samples from every batch per:
${testMethodLines}

5. INSPECTION & PASSING:
   Inspection shall be conducted by ${officer}, ${designation}, or third-party
   inspecting agency (RITES / National Test House) prior to incorporation into works.

6. REJECTION CLAUSE:
   Any consignment failing 7-day or 28-day strength/purity tests shall be rejected
   at contractor's risk and cost, and immediately removed from site within 48 hours.

Audit Reference Hash : ${audit?.audit_hash || response.meta.audit_reference_hash}
ManakAI Verified     : ${new Date().toISOString()} | Compliant with CVC Guidelines
================================================================================`.trim();
  }

  if (templateType === 'roads_highways') {
    return `================================================================================
MINISTRY OF ROAD TRANSPORT & HIGHWAYS (MoRTH) / NHAI — NIT SCHEDULE
================================================================================
Tender ID       : ${nitRef}
Executing Agency: ${ministry} (${dept})
Highway Package : ${project}
Issuing Officer : ${officer}, ${designation}
================================================================================

SECTION 1000: MATERIALS & STATUTORY INDIAN STANDARDS

1. SCOPE OF SUPPLY:
   This specification covers the technical requirements for procurement of
   ${productName} (${gradeSpec}) for national highway, bridge deck, and culvert works.

2. GOVERNING CODES OF PRACTICE:
   (a) Primary Specification : ${rec.is_number}${rec.year_published ? `:${rec.year_published}` : ''}
   (b) Latest Amendment      : ${rec.latest_amendment || 'Base Issue'}
   (c) IRC Special Pub.      : IRC:SP:49 / IRC:112 Specifications
   (d) Withdrawn Predecessors: Legacy standards ${rec.supersedes ? `(${rec.supersedes.join(', ')})` : '(e.g. IS 8112:1989)'} are WITHDRAWN and MUST NOT be cited.

3. QUALITY CONTROL ORDER (QCO) COMPLIANCE:
   ${certClause}

4. MANDATORY LOT TESTING PROTOCOLS:
   Sampling and testing shall be executed per batch frequency in accordance with:
${testMethodLines}

5. TRACEABILITY & SAMPLING:
   Each consignment shall be accompanied by manufacturer mill test certificates
   stating heat number, cast batch, and BIS license number. Field laboratory
   verification shall be conducted jointly by the Independent Engineer (IE) and Contractor.

6. JURISDICTION & REJECTION:
   Non-conforming lots shall be rejected with immediate encashment of Performance
   Security for willful submission of sub-standard lots as per MoRTH Circular 2024.

Digital Audit Reference: SHA-256 [${audit?.audit_hash || response.meta.audit_reference_hash}]
Generated by ManakAI Standards Intelligence Engine | National Informatics Centre (NIC)
================================================================================`.trim();
  }

  // Default Standard GeM / CPPP Format
  return `================================================================================
NOTICE INVITING TENDER (NIT) — TECHNICAL SPECIFICATION SCHEDULE
GOVERNMENT OF INDIA — PUBLIC PROCUREMENT PORTAL (GeM / CPPP)
================================================================================
Tender Reference No. : ${nitRef}
Ministry / Dept      : ${ministry}
Procuring Entity     : ${dept}
Project Name & Site  : ${project}
Estimated Value      : ${estCost}
Officer In-Charge    : ${officer} (${designation})
Date of Issue        : ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
================================================================================

1. APPLICABLE INDIAN STANDARD SPECIFICATION:
   The supplied material/equipment shall conform in all respects to the latest
   edition of the following Indian Standard:

   STANDARD DESIGNATION : ${rec.is_number}
   TITLE                : ${rec.title}
   EDITION / REVISION   : ${rec.year_published || 'Current'}${rec.latest_amendment ? `, incorporating ${rec.latest_amendment}` : ' (Latest Gazette Issue)'}
   DIVISION CODE        : ${rec.division_code || 'CED'} (Bureau of Indian Standards)

2. SCOPE & GENERAL TECHNICAL REQUIREMENTS:
   ${rec.scope_snippet || `The material shall meet all physical, chemical, and dimensional tolerances prescribed under ${rec.is_number}.`}

3. MANDATORY BIS QUALITY CONTROL ORDER (QCO) REQUIREMENT:
   ${certClause}

4. MANDATORY QUALITY ASSURANCE & LAB TESTING REQUIREMENTS:
   The supplier/bidder shall conduct routine, lot, and acceptance tests at a
   BIS-recognized or NABL-accredited laboratory per the following standards:
${testMethodLines}

   Certified test reports (CTR) for every dispatched consignment shall be furnished
   to the Procuring Entity prior to dispatch clearance.

5. INSPECTION & VERIFICATION:
   Inspection and sampling shall be conducted by ${officer}, ${designation}, or an
   authorized third-party inspection agency (e.g., RITES, DGS&D, or NTH) at the
   manufacturer's works / delivery location.

6. REJECTION & LIQUIDATED DAMAGES CLAUSE:
   Any supply lot failing to satisfy the requirements of ${rec.is_number} or
   lacking valid BIS certification shall be rejected summarily at the supplier's
   sole risk and expense.

7. STATUTORY PRECEDENCE RULE:
   In the event of any contradiction or ambiguity between this tender schedule
   and the gazetted Indian Standard, the provisions of ${rec.is_number} as
   amended by the Bureau of Indian Standards shall take statutory precedence.

================================================================================
ManakAI Verified Specification | CVC Vigilance Defense Certified
Audit Reference Hash : ${audit?.audit_hash || response.meta.audit_reference_hash}
Recommendation ID    : ${audit?.recommendation_id || 'rec-manakai-v1'}
Timestamp            : ${new Date().toISOString()}
================================================================================`.trim();
}
