import type { TenderProject } from './types';
import type { DecomposeResponse, Stage2MapResponse, Stage3FinalizeResponse } from '../tenderAnalysis/types';

export const NHAI_SAMPLE_TENDER = `GOVERNMENT OF INDIA · NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)
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

export const CPWD_SAMPLE_TENDER = `CENTRAL PUBLIC WORKS DEPARTMENT (CPWD) · AIIMS DELHI SURGICAL WING MODERNIZATION (NIT-CPWD-AIIMS-2026-042)

Clause 3.1.0 — Fire-Resistant Metal Doorsets:
All fire barrier corridor doors, operation theatre entryways, and ICU partitions shall be 2-hour fire rated metal doorsets manufactured and tested strictly in conformance with IS 3614:2021.

Clause 4.2.1 — Plain & Reinforced Concrete:
Structural concrete for building expansion joints and slab retrofits shall comply with IS 456:2000 Code of Practice for Plain and Reinforced Concrete.

Clause 5.2.4 — Electrical Cables for Healthcare Facility:
Power and lighting branch wiring shall utilize low smoke zero halogen (FRLS-H) copper cables conforming to IS 694:2010.

Clause 8.1.5 — High Yield Strength Rebar:
Reinforcement bars shall be thermo-mechanically treated high ductility steel conforming to IS 1786:2008 Grade Fe 500D.`;

export const DFCCIL_SAMPLE_TENDER = `MINISTRY OF RAILWAYS · DEDICATED FREIGHT CORRIDOR CORPORATION OF INDIA (DFCCIL)
TRACK LAYING & PRE-STRESSED CONCRETE SLEEPERS SPECIFICATION (NIT-MOR-DFCCIL-2026-119)

Clause 2.1.8 — Pre-Stressed Concrete Sleepers (Heavy Axle 25T):
Pre-stressed concrete monoblock sleepers for 25-tonne heavy axle freight operations shall be designed in conformance with IS 1343:1980 and RDSO Specification T-39.

Clause 3.4.2 — Track Ballast Hard Stone Aggregates:
Hard stone ballast aggregates for high-speed freight track bed shall conform to IS 383:2016 Grade II with water absorption <= 1.0%.

Clause 5.1.0 — Elastic Rail Fastening Clips:
Elastic rail clips and base plates shall be manufactured from hot rolled spring steel conforming to IS 2062:2011 Grade E250.

Clause 9.3.4 — Structural Steel Plate Girders:
Composite bridge plate girders and bracing members shall conform to IS 2062:2011 Grade E350 Quality BR with Charpy V-notch impact testing at -20 deg C.`;

export const JJM_SAMPLE_TENDER = `MINISTRY OF JAL SHAKTI · JAL JEEVAN MISSION (JJM)
DISTRICT WATER SUPPLY NETWORK & DISTRIBUTION GRID (NIT-JJM-RAJ-2026-019)

Clause 6.1.0 — High Density Polyethylene (HDPE) Pipes:
HDPE pipes for rural drinking water distribution network and pipeline extensions shall be manufactured as per IS 4984:1995 utilizing PE-80 raw material class with PN-6 pressure rating.

Clause 6.2.4 — Sluice Valves for Water Works:
Cast iron sluice valves for isolating pipeline segments shall conform to IS 14846:2000 with bronze trim and flanged ends.

Clause 12.4.1 — Potable Drinking Water Testing Parameters:
Treated water delivered at household tap connections shall adhere strictly to Indian Standard Specification for Drinking Water IS 10500:2012 without deviation.`;

// Stage 1, 2, 3 data for NHAI Flyover
const NHAI_STAGE1: DecomposeResponse = {
  tender_metadata: {
    title: 'Construction of 6-Lane Flyover & Bridge Superstructure on NH-48',
    department: 'National Highways Authority of India (NHAI)',
    estimated_value: '₹148.50 Crores',
    tender_type: 'EPC Highway Infrastructure',
  },
  products: [
    {
      product_id: 'nhai-p1',
      product_name: 'Ordinary Portland Cement (43 Grade)',
      clause_number: 'Clause 4.1.2',
      page_number: 1,
      verbatim_quote: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989.',
      cited_standard_in_doc: 'IS 8112:1989',
      search_queries: ['IS 8112 Ordinary Portland Cement', 'IS 269 43 grade cement QCO'],
    },
    {
      product_id: 'nhai-p2',
      product_name: 'High Yield Strength Deformed (HYSD) Rebar',
      clause_number: 'Clause 5.2.1',
      page_number: 1,
      verbatim_quote: 'Reinforcement steel for structural columns shall be HYSD bars Grade Fe 415 conforming to IS 1786:1985.',
      cited_standard_in_doc: 'IS 1786:1985 Fe 415',
      search_queries: ['IS 1786 High Strength Rebar', 'IS 1786 2008 Fe 500D ductility'],
    },
    {
      product_id: 'nhai-p3',
      product_name: 'Coarse & Fine Aggregates for Concrete',
      clause_number: 'Clause 4.1.3',
      page_number: 1,
      verbatim_quote: 'Aggregates shall conform to IS 383:2016 and be tested for soundness and crushing value.',
      cited_standard_in_doc: 'IS 383:2016',
      search_queries: ['IS 383 Coarse Aggregates Concrete'],
    },
    {
      product_id: 'nhai-p4',
      product_name: 'High Strength Friction Grip Fasteners',
      clause_number: 'Clause 7.3.2',
      page_number: 2,
      verbatim_quote: 'High strength friction grip bolts for structural steel bracing shall conform to IS 3757:1985.',
      cited_standard_in_doc: 'IS 3757:1985',
      search_queries: ['IS 3757 High Strength Friction Grip Bolts'],
    },
    {
      product_id: 'nhai-p5',
      product_name: 'HDPE Water Drainage Pipes',
      clause_number: 'Clause 12.4.0',
      page_number: 2,
      verbatim_quote: 'HDPE pipes for subsurface bridge drainage shall be manufactured as per IS 4984:1995 with PE-80 raw material.',
      cited_standard_in_doc: 'IS 4984:1995 PE-80',
      search_queries: ['IS 4984 HDPE Pipes Water Supply', 'IS 4984 2016 PE 100 QCO'],
    },
  ],
};

const NHAI_STAGE2: Stage2MapResponse = {
  high_risk_outdated_count: 2,
  mandatory_qco_count: 3,
  mapped_products: [
    {
      product_id: 'nhai-p1',
      product_name: 'Ordinary Portland Cement (43 Grade)',
      clause_number: 'Clause 4.1.2',
      page_number: 1,
      verbatim_quote: 'All structural concrete elements shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989.',
      detected_outdated_is: 'IS 8112:1989 (Withdrawn)',
      recommended_is: 'IS 269:2015 Clause 5.1',
      recommended_is_title: 'Ordinary Portland Cement (33, 43 and 53 Grades Consolidated)',
      confidence_score: 98,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Standard IS 8112 was officially withdrawn by BIS in 2015 and consolidated into IS 269:2015. Under Cement Quality Control Order (GSR 739(E)), citing IS 8112 in 2026 tenders is an actionable audit flaw.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269',
      qco_mandate: {
        mandatory: true,
        order_name: 'Cement (Quality Control) Order, 2003 & 2024 Gazette Update',
        scheme: 'Scheme-I (ISI Mark Mandatory)',
      },
      all_candidates: [
        {
          is_number: 'IS 269:2015 Clause 5.1',
          title: 'Ordinary Portland Cement (43 Grade Consolidated)',
          confidence: 0.98,
          status: 'ACTIVE',
          qco_mandatory: true,
          match_reasons: ['Consolidated replacement for IS 8112', 'Active QCO mandate Scheme-I'],
        },
        {
          is_number: 'IS 1489 (Part 1):2015',
          title: 'Portland Pozzolana Cement (Fly Ash based)',
          confidence: 0.85,
          status: 'ACTIVE',
          match_reasons: ['Permitted low heat bridge alternative under IRC 112'],
        },
      ],
    },
    {
      product_id: 'nhai-p2',
      product_name: 'High Yield Strength Deformed (HYSD) Rebar',
      clause_number: 'Clause 5.2.1',
      page_number: 1,
      verbatim_quote: 'Reinforcement steel for structural columns shall be HYSD bars Grade Fe 415 conforming to IS 1786:1985.',
      detected_outdated_is: 'IS 1786:1985 Fe 415 (Outdated Edition)',
      recommended_is: 'IS 1786:2008 Grade Fe 500D',
      recommended_is_title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement',
      confidence_score: 96,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Fe 415 under the 1985 edition lacks the ductility elongation thresholds mandated by IS 13920:2016 for Seismic Zones IV & V. Upgrade to Fe 500D with uniform elongation >= 5%.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786',
      qco_mandate: {
        mandatory: true,
        order_name: 'Steel and Steel Products (Quality Control) Order, 2020',
        scheme: 'Scheme-I (ISI Mark Mandatory)',
      },
      all_candidates: [
        {
          is_number: 'IS 1786:2008 Grade Fe 500D',
          title: 'High Ductility TMT Rebar (Fe 500D)',
          confidence: 0.96,
          status: 'ACTIVE',
          qco_mandatory: true,
          match_reasons: ['Mandatory seismic ductile grade', 'Current active revision with Amd 3'],
        },
      ],
    },
    {
      product_id: 'nhai-p3',
      product_name: 'Coarse & Fine Aggregates for Concrete',
      clause_number: 'Clause 4.1.3',
      page_number: 1,
      verbatim_quote: 'Aggregates shall conform to IS 383:2016 and be tested for soundness and crushing value.',
      recommended_is: 'IS 383:2016',
      recommended_is_title: 'Coarse and Fine Aggregate for Concrete — Specification (Third Revision)',
      confidence_score: 99,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'IS 383:2016 is active and fully compliant. Includes recycled concrete aggregate (RCA) provisions for sustainable infrastructure.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+383',
      all_candidates: [
        {
          is_number: 'IS 383:2016',
          title: 'Coarse and Fine Aggregate for Concrete',
          confidence: 0.99,
          status: 'ACTIVE',
          match_reasons: ['Direct exact active standard match'],
        },
      ],
    },
    {
      product_id: 'nhai-p4',
      product_name: 'High Strength Friction Grip Fasteners',
      clause_number: 'Clause 7.3.2',
      page_number: 2,
      verbatim_quote: 'High strength friction grip bolts for structural steel bracing shall conform to IS 3757:1985.',
      recommended_is: 'IS 3757:1985 (Reaffirmed 2021)',
      recommended_is_title: 'Specification for High Strength Structural Bolts',
      confidence_score: 94,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Active standard with current reaffirmation. Allied tightening inspection code IS 4000:1992 applies.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+3757',
      all_candidates: [
        {
          is_number: 'IS 3757:1985 (Reaffirmed 2021)',
          title: 'High Strength Structural Bolts',
          confidence: 0.94,
          status: 'ACTIVE',
          match_reasons: ['Reaffirmed active specification'],
        },
      ],
    },
    {
      product_id: 'nhai-p5',
      product_name: 'HDPE Water Drainage Pipes',
      clause_number: 'Clause 12.4.0',
      page_number: 2,
      verbatim_quote: 'HDPE pipes for subsurface bridge drainage shall be manufactured as per IS 4984:1995 with PE-80 raw material.',
      detected_outdated_is: 'IS 4984:1995 PE-80 (Superseded)',
      recommended_is: 'IS 4984:2016 Amd 3 PE-100',
      recommended_is_title: 'High Density Polyethylene Pipes for Water Supply — Specification (Fifth Revision)',
      confidence_score: 95,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'IS 4984:1995 was superseded by IS 4984:2016. High-density resin PE-100 is required for hydrostatic durability under Ministry QCO 2021.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+4984',
      qco_mandate: {
        mandatory: true,
        order_name: 'Pipes and Fittings (Quality Control) Order, 2021',
        scheme: 'Scheme-I (ISI Mark Mandatory)',
      },
      all_candidates: [
        {
          is_number: 'IS 4984:2016 Amd 3 PE-100',
          title: 'HDPE Pipes for Water Supply (PE-100)',
          confidence: 0.95,
          status: 'ACTIVE',
          qco_mandatory: true,
          match_reasons: ['Active standard with Amd 3', 'Mandatory QCO certification'],
        },
      ],
    },
  ],
};

const NHAI_STAGE3: Stage3FinalizeResponse = {
  cvc_audit_record: {
    audit_hash: '7F9E8200B41ECA89F9A1D84B9E34091C5A87DE3F69558D41C6C26AA41D9902BC',
    gfr_rule_compliance: 'GFR 2017 Rule 144(i) & CVC Circular 02/02/2022',
    timestamp_utc: new Date().toISOString(),
    total_clauses_modernized: 3,
  },
  clause_diffs: [
    {
      product_id: 'nhai-p1',
      product_name: 'Ordinary Portland Cement (43 Grade)',
      clause_number: 'Clause 4.1.2',
      page_number: 1,
      original_clause: 'All structural concrete elements, including precast culvert barrels, deck slabs, and retaining walls, shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989 with minimum compressive strength of 43 MPa at 28 days.',
      modernized_clause: 'All structural concrete elements, including precast culvert barrels, deck slabs, and retaining walls, shall utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 269:2015 (Clause 5.1). The cement shall bear mandatory ISI Certification Marking under the Cement (Quality Control) Order, with 28-day compressive strength >= 43.0 MPa tested in accordance with IS 4031.',
      designated_standard: 'IS 269:2015 Clause 5.1',
      verbatim_quote: 'utilize 43 Grade Ordinary Portland Cement conforming strictly to IS 8112:1989',
      added_qco_clause: 'Mandatory ISI Certification Marking under Cement QCO (GSR 739(E)) enforced.',
      added_nabl_clause: 'Manufacturer Test Certificate (MTC) along with independent NABL laboratory test results shall be submitted for each batch.',
    },
    {
      product_id: 'nhai-p2',
      product_name: 'High Yield Strength Deformed (HYSD) Rebar',
      clause_number: 'Clause 5.2.1',
      page_number: 1,
      original_clause: 'Reinforcement steel for structural columns, piers, and shear walls shall be High Yield Strength Deformed (HYSD) bars Grade Fe 415 conforming to IS 1786:1985.',
      modernized_clause: 'Reinforcement steel for structural columns, piers, and shear walls shall be thermo-mechanically treated (TMT) high ductility steel bars Grade Fe 500D conforming to IS 1786:2008 (with Amendment 3). The steel shall comply with seismic ductility requirements of IS 13920:2016 with total elongation >= 16% and uniform elongation >= 5%.',
      designated_standard: 'IS 1786:2008 Grade Fe 500D',
      verbatim_quote: 'HYSD bars Grade Fe 415 conforming to IS 1786:1985',
      added_qco_clause: 'Steel & Steel Products (Quality Control) Order Scheme-I compliance mandatory.',
      added_nabl_clause: 'Bend, rebend, and chemical analysis (C, S, P max 0.040%) tested per IS 228.',
    },
    {
      product_id: 'nhai-p5',
      product_name: 'HDPE Water Drainage Pipes',
      clause_number: 'Clause 12.4.0',
      page_number: 2,
      original_clause: 'HDPE pipes for subsurface bridge drainage and culvert outfall channels shall be manufactured as per IS 4984:1995 with PE-80 raw material.',
      modernized_clause: 'HDPE pipes for subsurface bridge drainage and culvert outfall channels shall be manufactured from high-density virgin resin PE-100 conforming strictly to IS 4984:2016 (Incorporating Amendment No. 3) with hydrostatic pressure rating PN-10. Pipes shall bear valid BIS ISI marking.',
      designated_standard: 'IS 4984:2016 Amd 3 PE-100',
      verbatim_quote: 'manufactured as per IS 4984:1995 with PE-80 raw material',
      added_qco_clause: 'Pipes & Fittings QCO 2021 compliance mandatory.',
    },
  ],
  nit_specification_schedule: [
    {
      item_no: 1,
      item_description: 'Ordinary Portland Cement 43 Grade (Consolidated)',
      mandatory_indian_standard: 'IS 269:2015 (Clause 5.1)',
      grade_or_type: 'Grade 43 OPC (28-day >= 43.0 MPa)',
      conformity_scheme: 'Scheme-I (Mandatory ISI Mark)',
      mandatory_testing_standards: ['IS 4031 (Parts 1-15)', 'IS 3535', 'IS 4032 (Chemical)'],
    },
    {
      item_no: 2,
      item_description: 'High Ductility TMT Reinforcement Steel Rebar',
      mandatory_indian_standard: 'IS 1786:2008 (Amd 3)',
      grade_or_type: 'Grade Fe 500D (Ductile)',
      conformity_scheme: 'Scheme-I (Mandatory ISI Mark)',
      mandatory_testing_standards: ['IS 1608 (Tensile)', 'IS 1599 (Bend)', 'IS 228 (Chemical)'],
    },
    {
      item_no: 3,
      item_description: 'Coarse and Fine Concrete Aggregates',
      mandatory_indian_standard: 'IS 383:2016',
      grade_or_type: 'Graded Aggregate (20mm / 10mm / Zone II)',
      conformity_scheme: 'Self-Certification + NABL MTC',
      mandatory_testing_standards: ['IS 2386 (Parts 1-8 Soundness & Flakiness)'],
    },
    {
      item_no: 4,
      item_description: 'High Strength Structural Friction Grip Bolts',
      mandatory_indian_standard: 'IS 3757:1985 (Reaffirmed 2021)',
      grade_or_type: 'Class 8.8 / 10.9 HSFG',
      conformity_scheme: 'Scheme-I / MTC Verified',
      mandatory_testing_standards: ['IS 1367 (Mechanical Properties)', 'IS 4000'],
    },
    {
      item_no: 5,
      item_description: 'High Density Polyethylene (HDPE) Drainage Pipes',
      mandatory_indian_standard: 'IS 4984:2016 (Amd 3)',
      grade_or_type: 'PE-100 Resin, PN-10 Pressure Class',
      conformity_scheme: 'Scheme-I (Mandatory ISI Mark)',
      mandatory_testing_standards: ['IS 4984 Cl 8 (Hydrostatic Burst Test)'],
    },
  ],
  full_nit_draft_text: `SECTION 4: TECHNICAL SPECIFICATIONS FOR NATIONAL HIGHWAYS & BRIDGES
Tender Reference: NIT-NHAI-NCR-2026-088

1. CEMENTITIOUS MATERIALS
All structural concrete shall incorporate 43 Grade Ordinary Portland Cement strictly adhering to IS 269:2015. Withdrawn standard IS 8112:1989 is strictly disallowed under Ministry Cement QCO (GSR 739(E)).

2. REINFORCING STEEL
All structural reinforcement shall comprise Grade Fe 500D TMT bars adhering to IS 1786:2008 with mandatory uniform elongation >= 5% for seismic resistance per IS 13920:2016.

3. DRAINAGE & SUBSURFACE CONDUITS
Subsurface drainage conduits shall be manufactured from PE-100 virgin grade HDPE resin conforming to IS 4984:2016 (Amd 3).

CRYPTOGRAPHIC AUDIT TRAIL:
SHA-256: 7F9E8200B41ECA89F9A1D84B9E34091C5A87DE3F69558D41C6C26AA41D9902BC
Legal Defensibility: Fully compliant with GFR 2017 Rule 144(i) & CVC Guidelines.`,
};

// Stage 1, 2, 3 data for CPWD AIIMS
const CPWD_STAGE1: DecomposeResponse = {
  tender_metadata: {
    title: 'Modernization & Electrification of Surgical Wing, AIIMS Delhi',
    department: 'Central Public Works Department (CPWD)',
    estimated_value: '₹42.80 Crores',
    tender_type: 'Healthcare Public Works',
  },
  products: [
    {
      product_id: 'cpwd-p1',
      product_name: 'Fire-Resistant Metal Doorsets (2 Hours)',
      clause_number: 'Clause 3.1.0',
      page_number: 1,
      verbatim_quote: 'All fire barrier corridor doors shall be 2-hour fire rated metal doorsets conforming strictly to IS 3614:2021.',
      cited_standard_in_doc: 'IS 3614:2021',
      search_queries: ['IS 3614 Fire Doorsets 2 Hours NBC 2016'],
    },
    {
      product_id: 'cpwd-p2',
      product_name: 'Plain & Reinforced Concrete Code',
      clause_number: 'Clause 4.2.1',
      page_number: 1,
      verbatim_quote: 'Structural concrete for building expansion joints shall comply with IS 456:2000.',
      cited_standard_in_doc: 'IS 456:2000',
      search_queries: ['IS 456 Plain and Reinforced Concrete Code'],
    },
    {
      product_id: 'cpwd-p3',
      product_name: 'Low Smoke Zero Halogen (FRLS-H) Copper Cables',
      clause_number: 'Clause 5.2.4',
      page_number: 1,
      verbatim_quote: 'Power and lighting branch wiring shall utilize low smoke zero halogen (FRLS-H) copper cables conforming to IS 694:2010.',
      cited_standard_in_doc: 'IS 694:2010',
      search_queries: ['IS 694 PVC Insulated Cables FRLS-H'],
    },
    {
      product_id: 'cpwd-p4',
      product_name: 'High Ductility TMT Reinforcement Steel',
      clause_number: 'Clause 8.1.5',
      page_number: 2,
      verbatim_quote: 'Reinforcement bars shall be thermo-mechanically treated high ductility steel conforming to IS 1786:2008 Grade Fe 500D.',
      cited_standard_in_doc: 'IS 1786:2008 Grade Fe 500D',
      search_queries: ['IS 1786 Fe 500D TMT Steel'],
    },
  ],
};

const CPWD_STAGE2: Stage2MapResponse = {
  high_risk_outdated_count: 0,
  mandatory_qco_count: 2,
  mapped_products: [
    {
      product_id: 'cpwd-p1',
      product_name: 'Fire-Resistant Metal Doorsets (2 Hours)',
      clause_number: 'Clause 3.1.0',
      page_number: 1,
      verbatim_quote: 'All fire barrier corridor doors shall be 2-hour fire rated metal doorsets conforming strictly to IS 3614:2021.',
      recommended_is: 'IS 3614:2021',
      recommended_is_title: 'Fire Doorsets — Specification (First Revision)',
      confidence_score: 99,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Fully compliant with NBC 2016 Part 4 Life Safety norms. Mandatory 120-minute stability, integrity, and insulation testing per IS/ISO 3008-1.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+3614',
      qco_mandate: {
        mandatory: true,
        order_name: 'Fire Resisting Doors (Quality Control) Order, 2024',
        scheme: 'Scheme-I (Mandatory ISI Mark)',
      },
      all_candidates: [
        {
          is_number: 'IS 3614:2021',
          title: 'Fire Doorsets Specification',
          confidence: 0.99,
          status: 'ACTIVE',
          qco_mandatory: true,
          match_reasons: ['Active standard matched perfectly'],
        },
      ],
    },
    {
      product_id: 'cpwd-p2',
      product_name: 'Plain & Reinforced Concrete Code',
      clause_number: 'Clause 4.2.1',
      page_number: 1,
      verbatim_quote: 'Structural concrete for building expansion joints shall comply with IS 456:2000.',
      recommended_is: 'IS 456:2000 (Reaffirmed 2021)',
      recommended_is_title: 'Plain and Reinforced Concrete — Code of Practice (Fourth Revision)',
      confidence_score: 99,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Active national structural design code with current reaffirmation.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+456',
      all_candidates: [
        {
          is_number: 'IS 456:2000',
          title: 'Plain and Reinforced Concrete Code',
          confidence: 0.99,
          status: 'ACTIVE',
          match_reasons: ['National Code of Practice'],
        },
      ],
    },
    {
      product_id: 'cpwd-p3',
      product_name: 'Low Smoke Zero Halogen (FRLS-H) Copper Cables',
      clause_number: 'Clause 5.2.4',
      page_number: 1,
      verbatim_quote: 'Power and lighting branch wiring shall utilize low smoke zero halogen (FRLS-H) copper cables conforming to IS 694:2010.',
      recommended_is: 'IS 694:2010',
      recommended_is_title: 'Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables/Cords with Rigid and Flexible Conductors',
      confidence_score: 97,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Active standard with FRLS-H halogen acid gas emission <= 2% and smoke density rating >= 60% per IS 10810 (Part 58 & 61).',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+694',
      qco_mandate: {
        mandatory: true,
        order_name: 'Electrical Wires and Cables (Quality Control) Order, 2023',
        scheme: 'Scheme-I (Mandatory ISI Mark)',
      },
      all_candidates: [
        {
          is_number: 'IS 694:2010',
          title: 'PVC Insulated Cables for Working Voltages up to 1100V',
          confidence: 0.97,
          status: 'ACTIVE',
          qco_mandatory: true,
          match_reasons: ['Active standard with FRLS-H provisions'],
        },
      ],
    },
    {
      product_id: 'cpwd-p4',
      product_name: 'High Ductility TMT Reinforcement Steel',
      clause_number: 'Clause 8.1.5',
      page_number: 2,
      verbatim_quote: 'Reinforcement bars shall be thermo-mechanically treated high ductility steel conforming to IS 1786:2008 Grade Fe 500D.',
      recommended_is: 'IS 1786:2008 Grade Fe 500D',
      recommended_is_title: 'High Strength Deformed Steel Bars for Concrete Reinforcement',
      confidence_score: 99,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'Active standard and 100% compliant with CPWD Specifications 2021.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786',
      all_candidates: [
        {
          is_number: 'IS 1786:2008 Fe 500D',
          title: 'High Strength Deformed Steel Bars (Fe 500D)',
          confidence: 0.99,
          status: 'ACTIVE',
          match_reasons: ['Direct exact active standard match'],
        },
      ],
    },
  ],
};

const CPWD_STAGE3: Stage3FinalizeResponse = {
  cvc_audit_record: {
    audit_hash: '3A1B99C44D87E019BCFE827104928374A92B48EF1903829104A7B8C9D0E1F234',
    gfr_rule_compliance: 'GFR 2017 Rule 144(i) & CPWD Manual 2024',
    timestamp_utc: new Date().toISOString(),
    total_clauses_modernized: 4,
  },
  clause_diffs: [
    {
      product_id: 'cpwd-p1',
      product_name: 'Fire-Resistant Metal Doorsets (2 Hours)',
      clause_number: 'Clause 3.1.0',
      page_number: 1,
      original_clause: 'All fire barrier corridor doors, operation theatre entryways, and ICU partitions shall be 2-hour fire rated metal doorsets manufactured and tested strictly in conformance with IS 3614:2021.',
      modernized_clause: 'All fire barrier corridor doors, operation theatre entryways, and ICU partitions shall be 2-hour fire rated metal doorsets manufactured and tested strictly in conformance with IS 3614:2021. Doorsets shall carry mandatory ISI Certification Marking and acoustic smoke sealing gaskets conforming to NBC 2016 Part 4.',
      designated_standard: 'IS 3614:2021',
      verbatim_quote: 'conformance with IS 3614:2021',
      added_qco_clause: 'Mandatory Fire Resisting Doors QCO 2024 compliance enforced.',
    },
  ],
  nit_specification_schedule: [
    {
      item_no: 1,
      item_description: '2-Hour Fire Rated Insulated Metal Doorsets',
      mandatory_indian_standard: 'IS 3614:2021',
      grade_or_type: 'Class 120 (Integrity & Insulation)',
      conformity_scheme: 'Scheme-I (Mandatory ISI Mark)',
      mandatory_testing_standards: ['IS/ISO 3008-1 (Fire Resistance Test)'],
    },
    {
      item_no: 2,
      item_description: 'Plain & Reinforced Concrete Construction Code',
      mandatory_indian_standard: 'IS 456:2000',
      grade_or_type: 'Design Code (M25 / M30 Grade Concrete)',
      conformity_scheme: 'CPWD Works Manual Specification',
      mandatory_testing_standards: ['IS 516 (Compressive Strength)', 'IS 1199'],
    },
    {
      item_no: 3,
      item_description: 'FRLS-H Copper Electrical Building Wires',
      mandatory_indian_standard: 'IS 694:2010',
      grade_or_type: '1100V Grade Flexible Copper Conductors',
      conformity_scheme: 'Scheme-I (Mandatory ISI Mark)',
      mandatory_testing_standards: ['IS 10810 (Oxygen Index >= 29%, Acid Gas <= 2%)'],
    },
    {
      item_no: 4,
      item_description: 'TMT Reinforcement Steel Rebar',
      mandatory_indian_standard: 'IS 1786:2008',
      grade_or_type: 'Grade Fe 500D (High Ductility)',
      conformity_scheme: 'Scheme-I (Mandatory ISI Mark)',
      mandatory_testing_standards: ['IS 1608', 'IS 1599'],
    },
  ],
  full_nit_draft_text: `SECTION 3: CPWD SURGICAL WING HOSPITAL SPECIFICATIONS (NIT-CPWD-AIIMS-2026-042)
All materials comply 100% with Bureau of Indian Standards and National Building Code 2016.
Audit Hash: 3A1B99C44D87E019BCFE827104928374A92B48EF1903829104A7B8C9D0E1F234`,
};

// Stage 1, 2, 3 data for DFCCIL
const DFCCIL_STAGE1: DecomposeResponse = {
  tender_metadata: {
    title: 'Dedicated Freight Corridor Track Laying & Pre-Stressed Sleepers',
    department: 'Ministry of Railways (DFCCIL)',
    estimated_value: '₹310.00 Crores',
    tender_type: 'Heavy Haul Rail Infrastructure',
  },
  products: [
    {
      product_id: 'dfc-p1',
      product_name: 'Pre-Stressed Concrete Sleepers (Heavy Axle 25T)',
      clause_number: 'Clause 2.1.8',
      page_number: 1,
      verbatim_quote: 'Pre-stressed concrete monoblock sleepers for 25-tonne heavy axle freight operations shall be designed in conformance with IS 1343:1980.',
      cited_standard_in_doc: 'IS 1343:1980',
      search_queries: ['IS 1343 Pre-stressed Concrete Code', 'IS 1343 2012 25T axle'],
    },
    {
      product_id: 'dfc-p2',
      product_name: 'Track Ballast Hard Stone Aggregates',
      clause_number: 'Clause 3.4.2',
      page_number: 1,
      verbatim_quote: 'Hard stone ballast aggregates for high-speed freight track bed shall conform to IS 383:2016 Grade II.',
      cited_standard_in_doc: 'IS 383:2016 Grade II',
      search_queries: ['IS 383 Ballast Hard Stone Aggregates'],
    },
    {
      product_id: 'dfc-p3',
      product_name: 'Elastic Rail Fastening Clips',
      clause_number: 'Clause 5.1.0',
      page_number: 2,
      verbatim_quote: 'Elastic rail clips and base plates shall be manufactured from hot rolled spring steel conforming to IS 2062:2011 Grade E250.',
      cited_standard_in_doc: 'IS 2062:2011 Grade E250',
      search_queries: ['IS 2062 Structural Steel E250'],
    },
  ],
};

const DFCCIL_STAGE2: Stage2MapResponse = {
  high_risk_outdated_count: 1,
  mandatory_qco_count: 2,
  mapped_products: [
    {
      product_id: 'dfc-p1',
      product_name: 'Pre-Stressed Concrete Sleepers (Heavy Axle 25T)',
      clause_number: 'Clause 2.1.8',
      page_number: 1,
      verbatim_quote: 'Pre-stressed concrete monoblock sleepers for 25-tonne heavy axle freight operations shall be designed in conformance with IS 1343:1980.',
      detected_outdated_is: 'IS 1343:1980 (Superseded)',
      recommended_is: 'IS 1343:2012',
      recommended_is_title: 'Prestressed Concrete — Code of Practice (Second Revision)',
      confidence_score: 97,
      clarification_needed: false,
      status: 'RESOLVED',
      engineering_rationale: 'IS 1343:1980 was superseded by IS 1343:2012 limit state design principles required for 25T heavy axle load dynamics.',
      official_is_link: 'https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1343',
      all_candidates: [
        {
          is_number: 'IS 1343:2012',
          title: 'Prestressed Concrete Code of Practice',
          confidence: 0.97,
          status: 'ACTIVE',
          match_reasons: ['Limit state design replacement for IS 1343:1980'],
        },
      ],
    },
  ],
};

const DFCCIL_STAGE3: Stage3FinalizeResponse = {
  cvc_audit_record: {
    audit_hash: '89AB12CD34EF56017890ABCD1234567890ABCDEF1234567890ABCDEF12345678',
    gfr_rule_compliance: 'GFR 2017 Rule 144(i) & RDSO Specification 2024',
    timestamp_utc: new Date().toISOString(),
    total_clauses_modernized: 2,
  },
  clause_diffs: [
    {
      product_id: 'dfc-p1',
      product_name: 'Pre-Stressed Concrete Sleepers (Heavy Axle 25T)',
      clause_number: 'Clause 2.1.8',
      page_number: 1,
      original_clause: 'Pre-stressed concrete monoblock sleepers for 25-tonne heavy axle freight operations shall be designed in conformance with IS 1343:1980 and RDSO Specification T-39.',
      modernized_clause: 'Pre-stressed concrete monoblock sleepers for 25-tonne heavy axle freight operations shall be designed in conformance with IS 1343:2012 (Limit State Design) and RDSO Specification T-39 (Rev 5). High tensile steel strand shall conform to IS 14268:2022 Class II low relaxation.',
      designated_standard: 'IS 1343:2012',
      verbatim_quote: 'designed in conformance with IS 1343:1980',
      added_qco_clause: 'HTS Strands under Steel QCO 2020 Scheme-I mandatory.',
    },
  ],
  nit_specification_schedule: [
    {
      item_no: 1,
      item_description: 'Pre-Stressed Concrete Monoblock Sleepers (25T Axle)',
      mandatory_indian_standard: 'IS 1343:2012',
      grade_or_type: 'M60 Concrete, Pre-tensioned',
      conformity_scheme: 'RDSO / BIS Scheme-I',
      mandatory_testing_standards: ['IS 1343', 'IS 14268 (HTS Strand Relax Test)'],
    },
  ],
  full_nit_draft_text: `SECTION 2: DEDICATED FREIGHT CORRIDOR TRACK SPECIFICATIONS
All sleepers, rails, and ballast conform to BIS 2026 standards.
Audit Hash: 89AB12CD34EF56017890ABCD1234567890ABCDEF1234567890ABCDEF12345678`,
};

export const INITIAL_PROJECTS: TenderProject[] = [
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
    description: 'EPC procurement for viaduct spans, pier caps, RCC deck slabs, and intelligent highway drainage for the Delhi-Gurgaon highway corridor.',
    isFrozen: true,
    isAnalyzed: true,
    analysisPhase: 'DASHBOARD_COMPLETED',
    stage1Data: NHAI_STAGE1,
    stage2Data: NHAI_STAGE2,
    stage3Data: NHAI_STAGE3,
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
    description: 'Comprehensive retrofitting of emergency trauma units, clean-room HVAC, fire doors, and hospital-grade electrical safety compliance.',
    isFrozen: true,
    isAnalyzed: true,
    analysisPhase: 'DASHBOARD_COMPLETED',
    stage1Data: CPWD_STAGE1,
    stage2Data: CPWD_STAGE2,
    stage3Data: CPWD_STAGE3,
  },
  {
    id: 'proj-dfccil-119',
    nitNumber: 'NIT-MOR-DFCCIL-2026-119',
    title: 'Dedicated Freight Corridor Track Laying & Pre-Stressed Sleepers',
    department: 'Ministry of Railways (DFCCIL)',
    estimatedValue: '₹310.00 Crores',
    lastModified: 'Yesterday',
    recencyTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'NEEDS_REVIEW',
    complianceScore: 84,
    hasDocument: true,
    documentText: DFCCIL_SAMPLE_TENDER,
    pdfFileName: 'DFCCIL_TRACK_SPEC_2026.pdf',
    description: 'Heavy haul freight corridor package from Rewari to Dadri including 25-tonne axle load ballastless track and PSC turnouts.',
    isFrozen: true,
    isAnalyzed: true,
    analysisPhase: 'DASHBOARD_COMPLETED',
    stage1Data: DFCCIL_STAGE1,
    stage2Data: DFCCIL_STAGE2,
    stage3Data: DFCCIL_STAGE3,
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
    complianceScore: 65,
    hasDocument: false,
    documentText: JJM_SAMPLE_TENDER,
    description: 'District rural drinking water pipeline extensions, overhead water reservoir tanks, and household meter connections across 140 villages.',
  },
];

