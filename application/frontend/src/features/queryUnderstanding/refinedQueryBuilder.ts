import type { StandardsResponse, QueryUnderstanding, QueryIntent, AmbiguityFlag, AmbiguityOption, AlliedRelationType } from '../../types';

export interface AmbiguityResolution {
  dimension: string;
  resolvedValue: string;
  resolvedLabel: string;
}

export interface ManualEntityCorrections {
  product_name?: string;
  grade_specification?: string;
  domain?: string;
  subdomain?: string;
  query_intent?: QueryIntent;
}

export interface AmbiguousQueryPreset {
  id: string;
  queryText: string;
  domainLabel: string;
  category: 'AMBIGUITY' | 'MULTILINGUAL' | 'COMPLEX_SPEC' | 'OUTDATED_AUDIT';
  language?: string;
  data: StandardsResponse;
}

/**
 * Resolution mapping dictionary for dynamic recommendation refinement.
 * Dynamically tailors the primary IS standard, title, status, QCO mandate, and allied standards
 * based on the user's specific disambiguation choice.
 */
const RESOLUTION_RECOMMENDATION_MAP: Record<
  string,
  {
    is_number: string;
    title: string;
    status: 'ACTIVE' | 'SUPERSEDED' | 'WITHDRAWN';
    year_published: number;
    latest_amendment?: string;
    confidence: number;
    scope_snippet: string;
    qco_order_name: string;
    allied: Array<{ is_number: string; title: string; relation_type: AlliedRelationType; why: string }>;
    explanation: string;
  }
> = {
  // Bridge Cement Dimensions
  highway_wearing_course: {
    is_number: 'IS 269:2015 (53 Grade OPC)',
    title: 'Ordinary Portland Cement, 53 Grade — Specification',
    status: 'ACTIVE',
    year_published: 2015,
    latest_amendment: 'Amendment 2 (2022)',
    confidence: 0.99,
    scope_snippet: 'Mandatory for bridge deck wearing course, pre-stressed concrete girders (PSC), and rapid high-strength structural elements conforming to IRC SP-49 and MoRTH Clause 1500.',
    qco_order_name: 'Cement (Quality Control) Order 2024 · Mandatory ISI Mark',
    allied: [
      { is_number: 'IS 4031 (Part 1-15)', title: 'Methods of Physical Tests for Hydraulic Cement', relation_type: 'TEST_METHOD', why: 'Mandatory fineness & 28-day compressive strength testing.' },
      { is_number: 'IS 4032', title: 'Method of Chemical Analysis of Hydraulic Cement', relation_type: 'TEST_METHOD', why: 'Mandatory insoluble residue & magnesia limits.' },
      { is_number: 'IS 383:2016', title: 'Coarse and Fine Aggregate for Concrete', relation_type: 'RELATED_PRODUCT', why: 'Aggregates specification for high-strength bridge deck concrete.' }
    ],
    explanation: 'Selected Bridge Deck / Wearing Course. Standard refined to 53-Grade Ordinary Portland Cement under IS 269:2015 with mandatory BIS ISI Mark.'
  },
  structural_piers: {
    is_number: 'IS 1489 (Part 1):2015 / IS 269:2015 (43 Grade)',
    title: 'Portland Pozzolana Cement (Fly Ash Based) / OPC 43 Grade',
    status: 'ACTIVE',
    year_published: 2015,
    latest_amendment: 'Amendment 3 (2023)',
    confidence: 0.97,
    scope_snippet: 'Recommended for mass concrete substructure, bridge piers, well foundations, and abutments to control heat of hydration and resist sulphate attack per IRC 112.',
    qco_order_name: 'Cement (Quality Control) Order 2024 · Mandatory ISI Mark',
    allied: [
      { is_number: 'IS 3812 (Part 1)', title: 'Pulverized Fuel Ash for Use as Pozzolana', relation_type: 'RAW_MATERIAL_SPEC', why: 'Fly ash reactivity requirements for marine/substructure concrete.' },
      { is_number: 'IS 456:2000', title: 'Plain and Reinforced Concrete — Code of Practice', relation_type: 'INSTALLATION_CODE', why: 'Substructure durability & minimum cover requirements.' }
    ],
    explanation: 'Selected Substructure / Foundation Piers. Standard refined to Moderate-Heat Portland Pozzolana Cement (IS 1489) / OPC 43 Grade (IS 269) for mass concrete durability.'
  },
  expansion_joints: {
    is_number: 'IS 1834:1984 & IS 15462:2019',
    title: 'Hot Applied Sealing Compounds for Joints / Polymer Modified Bitumen',
    status: 'ACTIVE',
    year_published: 2019,
    latest_amendment: 'Amendment 1 (2023)',
    confidence: 0.96,
    scope_snippet: 'Specification for elastomeric polymer-modified sealing compounds and expansion joint systems in road bridges accommodating continuous thermal and dynamic deflections.',
    qco_order_name: 'Bitumen and Paving Materials Quality Protocol',
    allied: [
      { is_number: 'IS 1201 - IS 1220', title: 'Methods for Testing Tar and Bituminous Materials', relation_type: 'TEST_METHOD', why: 'Penetration, softening point, and ductility testing.' }
    ],
    explanation: 'Selected Bridge Expansion Joints. Standard refined to IS 1834 & IS 15462 elastomeric polymer modified sealants.'
  },

  // Railway Steel Dimensions
  grade_e250: {
    is_number: 'IS 2062:2011 Grade E250 Quality BR/BO',
    title: 'Hot Rolled Medium and High Tensile Structural Steel — Specification',
    status: 'ACTIVE',
    year_published: 2011,
    latest_amendment: 'Amendment 3 (2021)',
    confidence: 0.98,
    scope_snippet: 'Standard 250 MPa yield strength steel plates and sections for welded bridge girders with mandatory sub-zero Charpy V-notch impact testing at -20°C (Quality BO).',
    qco_order_name: 'Steel and Steel Products (Quality Control) Order 2024',
    allied: [
      { is_number: 'IS 1757 (Part 1):2020', title: 'Metallic Materials — Charpy Pendulum Impact Test', relation_type: 'TEST_METHOD', why: 'Mandatory sub-zero impact toughness test for bridge girders.' },
      { is_number: 'IS 4225', title: 'Recommended Practice for Straight Beam Ultrasonic Testing', relation_type: 'TEST_METHOD', why: 'Non-destructive ultrasonic testing for heavy steel plates.' }
    ],
    explanation: 'Selected Grade E250 Structural Steel. Standard refined to IS 2062:2011 Grade E250 Quality BR/BO with mandatory Charpy V-notch verification.'
  },
  grade_e350: {
    is_number: 'IS 2062:2011 Grade E350 Quality BR/BO',
    title: 'High Tensile Structural Steel — 350 MPa Yield Strength Specification',
    status: 'ACTIVE',
    year_published: 2011,
    latest_amendment: 'Amendment 3 (2021)',
    confidence: 0.99,
    scope_snippet: 'High tensile 350 MPa yield strength micro-alloyed steel plates for heavy axle freight corridors (25T / 32.5T axle load) and long-span railway bridge superstructures.',
    qco_order_name: 'Steel and Steel Products (Quality Control) Order 2024',
    allied: [
      { is_number: 'IS 1608 (Part 1)', title: 'Metallic Materials — Tensile Testing', relation_type: 'TEST_METHOD', why: 'Verification of 350 MPa yield & 490 MPa ultimate tensile strength.' },
      { is_number: 'IS 1757 (Part 1):2020', title: 'Charpy Pendulum Impact Test', relation_type: 'TEST_METHOD', why: 'Mandatory impact energy >= 27 Joules at -20°C.' }
    ],
    explanation: 'Selected Grade E350 High-Tensile Steel. Standard refined to IS 2062:2011 Grade E350 Quality BR/BO for heavy axle freight corridors.'
  },
  tmt_reinforcement: {
    is_number: 'IS 1786:2008 Grade Fe 500D / Fe 550D',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement',
    status: 'ACTIVE',
    year_published: 2008,
    latest_amendment: 'Amendment 4 (2023)',
    confidence: 0.99,
    scope_snippet: 'Thermo-mechanically treated (TMT) rebars with guaranteed high ductility (minimum 16% elongation and 1.10 TS/YS ratio) for earthquake-resistant bridge pier reinforcement.',
    qco_order_name: 'Steel and Steel Products (Quality Control) Order 2024',
    allied: [
      { is_number: 'IS 1599', title: 'Metallic Materials — Bend Test', relation_type: 'TEST_METHOD', why: 'Mandatory 180-degree bend and rebend testing.' },
      { is_number: 'IS 13920:2016', title: 'Ductile Design and Detailing of Reinforced Concrete Structures', relation_type: 'INSTALLATION_CODE', why: 'Seismic reinforcement detailing compliance.' }
    ],
    explanation: 'Selected RCC Reinforcement Rebars. Standard refined to IS 1786:2008 Grade Fe 500D with mandatory 16% elongation.'
  },

  // HDPE Pipes Dimensions
  potable_water_pn10: {
    is_number: 'IS 4984:2016 (incorporating Amd 1, 2 & 3)',
    title: 'High Density Polyethylene Pipes for Water Supply — Specification',
    status: 'ACTIVE',
    year_published: 2016,
    latest_amendment: 'Amendment 3 (2021)',
    confidence: 0.98,
    scope_snippet: 'Mandatory for municipal drinking water distribution networks using 100% virgin PE-100 grade resin with minimum required strength MRS 10.0 MPa and SDR 11 / PN 10 rating.',
    qco_order_name: 'Pipes and Fittings (Quality Control) Order · Mandatory ISI Mark',
    allied: [
      { is_number: 'IS 2530', title: 'Methods of Test for Polyethylene Moulding Materials', relation_type: 'TEST_METHOD', why: 'Melt flow rate (MFR) & carbon black dispersion testing.' },
      { is_number: 'IS 5382', title: 'Rubber Sealing Rings for Gas Mains, Water Mains and Sewers', relation_type: 'RELATED_PRODUCT', why: 'Push-fit joint elastomer seals.' }
    ],
    explanation: 'Selected Potable Drinking Water Network (PN 10). Standard refined to IS 4984:2016 PE-100 grade with mandatory BIS ISI Mark.'
  },
  sewerage_drainage: {
    is_number: 'IS 14333:1996 & IS 16098 (Part 2):2013',
    title: 'High Density Polyethylene Pipes for Sewerage / Structured Wall Piping',
    status: 'ACTIVE',
    year_published: 2013,
    latest_amendment: 'Amendment 2 (2020)',
    confidence: 0.95,
    scope_snippet: 'Structured-wall polyethylene corrugated pipes (DWC) for non-pressure underground sewerage and drainage networks with high ring stiffness SN 4 / SN 8.',
    qco_order_name: 'Sewerage and Drainage Polyethylene Quality Mandate',
    allied: [
      { is_number: 'IS 16098 (Part 1)', title: 'Structured Wall Plastics Piping Systems — General Requirements', relation_type: 'NORMATIVE_REFERENCE', why: 'Ring stiffness and flexibility verification.' }
    ],
    explanation: 'Selected Underground Sewerage & Drainage. Standard refined to IS 16098 (Part 2) Double Wall Corrugated HDPE pipes.'
  },

  // LED Floodlights Dimensions
  high_mast_ip66: {
    is_number: 'IS 10322 (Part 5/Sec 5):2013 & IS 16102 (Part 1/2)',
    title: 'Luminaires — Particular Requirements — Flood Lighting (IP66 Rated)',
    status: 'ACTIVE',
    year_published: 2013,
    latest_amendment: 'Amendment 2 (2022)',
    confidence: 0.98,
    scope_snippet: 'Heavy-duty outdoor LED floodlights with IP66 ingress protection, IK08 impact rating, 10kV surge protection, and mandatory BIS CRS registration under MeitY CRO.',
    qco_order_name: 'Electronics and IT Goods (Compulsory Registration Scheme - CRS)',
    allied: [
      { is_number: 'IS 16102 (Part 1/2)', title: 'Self-Ballasted LED Lamps for General Lighting Services', relation_type: 'SAFETY_STANDARD', why: 'Safety and performance requirements.' },
      { is_number: 'IS 16103 (Part 1)', title: 'LED Modules for General Lighting — Safety Specifications', relation_type: 'SAFETY_STANDARD', why: 'Module thermal and electrical safety.' }
    ],
    explanation: 'Selected High-Mast Apron / Outdoor Yard (IP66). Standard refined to IS 10322 (Part 5/Sec 5) & IS 16102 with mandatory BIS CRS registration.'
  },
  street_lighting_ip65: {
    is_number: 'IS 10322 (Part 5/Sec 3):2012',
    title: 'Luminaires — Particular Requirements — Luminaires for Road and Street Lighting',
    status: 'ACTIVE',
    year_published: 2012,
    latest_amendment: 'Amendment 3 (2021)',
    confidence: 0.97,
    scope_snippet: 'Public roadway and highway street luminaires featuring Type II/III beam distribution, CCT 4000K-5700K, and 120 lm/W system efficacy with central timer control.',
    qco_order_name: 'MeitY CRO Compulsory Registration Scheme',
    allied: [
      { is_number: 'IS 16107 (Part 2)', title: 'Luminaires Performance — LED Luminaires', relation_type: 'TEST_METHOD', why: 'Photometric test methods & lumen maintenance.' }
    ],
    explanation: 'Selected Highway / Street Lighting. Standard refined to IS 10322 (Part 5/Sec 3) Road & Street Luminaires.'
  }
};

/**
 * Builds a refined StandardsResponse payload when a user resolves an ambiguity flag.
 */
export function buildRefinedQuery(
  originalResponse: StandardsResponse,
  dimension: string,
  resolvedValue: string,
  resolvedLabel?: string
): StandardsResponse {
  const currentQu = originalResponse.query_understanding;

  const remainingFlags = (currentQu.ambiguity_flags || []).filter(
    (f) => f.dimension !== dimension
  );

  const updatedUnderstanding: QueryUnderstanding = {
    ...currentQu,
    [dimension]: resolvedValue,
    ambiguity_flags: remainingFlags,
    confidence: 0.99,
  };

  // Check if we have dynamic recommendation data for this resolution
  const mapped = RESOLUTION_RECOMMENDATION_MAP[resolvedValue];

  let primaryRec = originalResponse.primary_recommendation;
  let alliedStds = originalResponse.allied_standards;
  let plainExpl = originalResponse.plain_language_explanation;

  if (mapped) {
    primaryRec = {
      is_number: mapped.is_number,
      title: mapped.title,
      status: mapped.status,
      year_published: mapped.year_published,
      latest_amendment: mapped.latest_amendment || null,
      confidence: mapped.confidence,
      scope_snippet: mapped.scope_snippet,
      certification: {
        scheme: 'BIS_ISI_MARK',
        mandatory: true,
        qco_order_name: mapped.qco_order_name,
      },
    };

    alliedStds = mapped.allied.map((a) => ({
      is_number: a.is_number,
      title: a.title,
      relation_type: a.relation_type as AlliedRelationType,
      status: 'ACTIVE',
      confidence: 0.95,
      why: a.why,
    }));

    plainExpl = {
      enabled: true,
      text: mapped.explanation,
    };
  }

  // Add clarification reasoning trace step
  const updatedTrace = [
    ...originalResponse.reasoning_trace,
    {
      step: 'user_intent_disambiguation',
      detail: `Officer clarified ambiguous dimension '${dimension}' to: '${resolvedLabel || resolvedValue}'. Exact standard refined to ${primaryRec.is_number} (${primaryRec.title}).`,
      confidence: 1.0,
    },
  ];

  return {
    ...originalResponse,
    query_understanding: updatedUnderstanding,
    primary_recommendation: primaryRec,
    allied_standards: alliedStds,
    plain_language_explanation: plainExpl,
    reasoning_trace: updatedTrace,
  };
}

/**
 * Applies manual officer overrides to the query understanding object.
 */
export function applyQueryCorrection(
  originalResponse: StandardsResponse,
  corrections: ManualEntityCorrections
): StandardsResponse {
  const currentQu = originalResponse.query_understanding;

  const newEntities = [...(currentQu.extracted_entities || [])];

  if (corrections.product_name) {
    const pIdx = newEntities.findIndex((e) => e.type === 'PRODUCT');
    if (pIdx >= 0) newEntities[pIdx] = { entity: corrections.product_name, type: 'PRODUCT', confidence: 1.0 };
    else newEntities.unshift({ entity: corrections.product_name, type: 'PRODUCT', confidence: 1.0 });
  }

  if (corrections.grade_specification) {
    const gIdx = newEntities.findIndex((e) => e.type === 'GRADE_SPECIFICATION');
    if (gIdx >= 0) newEntities[gIdx] = { entity: corrections.grade_specification, type: 'GRADE_SPECIFICATION', confidence: 1.0 };
    else newEntities.push({ entity: corrections.grade_specification, type: 'GRADE_SPECIFICATION', confidence: 1.0 });
  }

  if (corrections.domain) {
    const dIdx = newEntities.findIndex((e) => e.type === 'APPLICATION_DOMAIN');
    if (dIdx >= 0) newEntities[dIdx] = { entity: corrections.domain, type: 'APPLICATION_DOMAIN', confidence: 1.0 };
    else newEntities.push({ entity: corrections.domain, type: 'APPLICATION_DOMAIN', confidence: 1.0 });
  }

  const updatedUnderstanding: QueryUnderstanding = {
    ...currentQu,
    ...corrections,
    extracted_entities: newEntities,
    ambiguity_flags: [], // Cleared because officer manually specified
    confidence: 1.0,     // 100% officer verified
  };

  const updatedTrace = [
    ...originalResponse.reasoning_trace,
    {
      step: 'manual_officer_override',
      detail: 'Officer manually corrected entity extraction. Resetting AI ambiguity flags and applying 100% verified entity definitions.',
      confidence: 1.0,
    },
  ];

  return {
    ...originalResponse,
    query_understanding: updatedUnderstanding,
    reasoning_trace: updatedTrace,
  };
}

/**
 * Presets demonstrating ambiguous real-world queries for testing Intent Disambiguation,
 * Multilingual Indic Translation, Complex Specifications, and Supersession Audits.
 */
export const SAMPLE_AMBIGUOUS_QUERIES: AmbiguousQueryPreset[] = [
  {
    id: 'amb-bridges-cement',
    queryText: 'I need cement standard for highway bridges in NCR region',
    domainLabel: 'Highway Bridge Cement (Bridge Deck vs Piers vs Joints)',
    category: 'AMBIGUITY',
    language: 'English',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-amb-001',
        session_id: 'sess-amb-8120',
        timestamp: new Date().toISOString(),
        processing_time_ms: 310,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: 'c839f2148fa918bca4891bca72891bb204918290ab918230192830111234abcd',
        mode: 'recommend',
      },
      query_understanding: {
        detected_language: 'en',
        original_text: 'I need cement standard for highway bridges in NCR region',
        normalized_text: 'cement standard highway bridges NCR region',
        query_intent: 'STANDARD_LOOKUP',
        product_name: 'Cement',
        domain: 'Highway Infrastructure',
        location_context: 'NCR Region',
        confidence: 0.68,
        extracted_entities: [
          { entity: 'Cement', type: 'PRODUCT', confidence: 0.95 },
          { entity: 'Highway Bridges', type: 'APPLICATION_DOMAIN', confidence: 0.82 },
          { entity: 'NCR Region', type: 'APPLICATION_DOMAIN', confidence: 0.70 },
        ],
        ambiguity_flags: [
          {
            dimension: 'subdomain',
            message:
              'Highway bridge engineering involves distinct structural zones governed by different standards. Specify which element this procurement is for:',
            options: [
              {
                value: 'highway_wearing_course',
                label: 'Bridge Deck / Wearing Course (OPC 53 Grade — IS 269)',
                description: 'Requires rapid strength gain & high abrasion resistance per IRC SP-49.',
              },
              {
                value: 'structural_piers',
                label: 'Substructure / Foundation Piers (OPC 43 Grade / PPC — IS 269 / IS 1489)',
                description: 'Mass concrete with moderate heat of hydration.',
              },
              {
                value: 'expansion_joints',
                label: 'Bridge Expansion Joint Sealants (Bitumen / Polymer — IS 1834 / IS 15462)',
                description: 'Waterproofing elastomeric expansion joints.',
              },
            ],
          },
        ],
      },
      primary_recommendation: {
        is_number: 'IS 269:2015',
        title: 'Ordinary Portland Cement — Specification',
        status: 'ACTIVE',
        year_published: 2015,
        latest_amendment: 'Amendment 1 (2019)',
        confidence: 0.68,
        scope_snippet: 'Covers physical and chemical requirements of 33, 43 and 53 grade OPC.',
        certification: {
          scheme: 'BIS_ISI_MARK',
          mandatory: true,
          qco_order_name: 'Cement (Quality Control) Order 2024',
        },
      },
      allied_standards: [
        {
          is_number: 'IS 4031 (Part 1)',
          title: 'Determination of Fineness of Cement',
          relation_type: 'TEST_METHOD',
          status: 'ACTIVE',
          confidence: 0.90,
          why: 'Mandatory test method for IS 269 compliance.',
        },
      ],
      outdated_citations: [],
      graph_path: [],
      reasoning_trace: [
        {
          step: 'query_understanding',
          detail: 'Detected general query for bridge cement. Ambiguity identified regarding bridge deck wearing course vs substructure pier.',
          confidence: 0.68,
        },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'The query specifies cement for bridges without specifying the structural element. Please select whether this is for the bridge deck wearing course or structural piers to receive the exact Indian Standard.',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-amb-001',
        query_id: 'uuid-amb-001',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: 'c839f2148fa918bca4891bca72891bb204918290ab918230192830111234abcd',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: {
        risk_level: 'NONE',
        message: null,
        standards_under_revision: [],
      },
      multilingual: {
        bhashini_used: false,
        detected_input_language: 'en',
        response_language: 'en',
        available_translations: ['hi'],
      },
    },
  },
  {
    id: 'amb-steel-railways',
    queryText: 'Structural steel for railway bridge fabrication',
    domainLabel: 'Railway Bridge Steel (Grade E250 vs E350 vs Rebars)',
    category: 'AMBIGUITY',
    language: 'English',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-amb-002',
        session_id: 'sess-amb-8121',
        timestamp: new Date().toISOString(),
        processing_time_ms: 280,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: 'd9284fa918bca4891bca72891bb204918290ab918230192830111234abcdef0',
        mode: 'recommend',
      },
      query_understanding: {
        detected_language: 'en',
        original_text: 'Structural steel for railway bridge fabrication',
        normalized_text: 'structural steel railway bridge fabrication',
        query_intent: 'STANDARD_LOOKUP',
        product_name: 'Structural Steel',
        domain: 'Railway Bridges',
        confidence: 0.72,
        extracted_entities: [
          { entity: 'Structural Steel', type: 'PRODUCT', confidence: 0.98 },
          { entity: 'Railway Bridge', type: 'APPLICATION_DOMAIN', confidence: 0.91 },
        ],
        ambiguity_flags: [
          {
            dimension: 'grade_specification',
            message:
              'Railway bridge engineering mandates different structural steel tensile grades depending on girder span and climatic impact toughness:',
            options: [
              {
                value: 'grade_e250',
                label: 'Grade E250 Quality B0 / C (Standard Welded Girders — IS 2062)',
                description: 'Standard 250 MPa yield strength for normal ambient spans.',
              },
              {
                value: 'grade_e350',
                label: 'Grade E350 Quality BR / BO (High-Tensile Heavy Axle Girders — IS 2062)',
                description: 'High tensile 350 MPa yield strength for Dedicated Freight Corridors.',
              },
              {
                value: 'tmt_reinforcement',
                label: 'RCC Pier Reinforcement Rebars (Fe 500D — IS 1786)',
                description: 'For concrete substructure rather than structural steel superstructure.',
              },
            ],
          },
        ],
      },
      primary_recommendation: {
        is_number: 'IS 2062:2011',
        title: 'Hot Rolled Medium and High Tensile Structural Steel — Specification',
        status: 'ACTIVE',
        year_published: 2011,
        latest_amendment: 'Amendment 3 (2021)',
        confidence: 0.72,
        scope_snippet: 'Covers requirements of steel plates, sections and bars for use in structural work.',
        certification: {
          scheme: 'BIS_ISI_MARK',
          mandatory: true,
          qco_order_name: 'Steel and Steel Products (Quality Control) Order 2024',
        },
      },
      allied_standards: [],
      outdated_citations: [],
      graph_path: [],
      reasoning_trace: [
        {
          step: 'query_understanding',
          detail: 'Structural steel identified; clarification needed between standard E250 plate girders and high-tensile E350 DFC girders.',
          confidence: 0.72,
        },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'Specify whether your railway bridge girder requires standard E250 steel or high-tensile E350 steel under IS 2062.',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-amb-002',
        query_id: 'uuid-amb-002',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: 'd9284fa918bca4891bca72891bb204918290ab918230192830111234abcdef0',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: {
        risk_level: 'NONE',
        message: null,
        standards_under_revision: [],
      },
      multilingual: {
        bhashini_used: false,
        detected_input_language: 'en',
        response_language: 'en',
        available_translations: ['hi'],
      },
    },
  },
  {
    id: 'amb-hdpe-pipes',
    queryText: 'HDPE pipes for rural drinking water distribution network',
    domainLabel: 'HDPE Pipes (Drinking Water PN10 vs Sewerage vs Irrigation)',
    category: 'AMBIGUITY',
    language: 'English',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-amb-003',
        session_id: 'sess-amb-8122',
        timestamp: new Date().toISOString(),
        processing_time_ms: 290,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: 'a1294fa918bca4891bca72891bb204918290ab9182301928301112341234567',
        mode: 'recommend',
      },
      query_understanding: {
        detected_language: 'en',
        original_text: 'HDPE pipes for rural drinking water distribution network',
        normalized_text: 'hdpe pipes rural drinking water distribution network',
        query_intent: 'STANDARD_LOOKUP',
        product_name: 'High Density Polyethylene Pipes',
        domain: 'Potable Water Distribution',
        confidence: 0.75,
        extracted_entities: [
          { entity: 'HDPE Pipes', type: 'PRODUCT', confidence: 0.99 },
          { entity: 'Drinking Water Supply', type: 'APPLICATION_DOMAIN', confidence: 0.94 },
          { entity: 'Rural Network', type: 'APPLICATION_DOMAIN', confidence: 0.80 },
        ],
        ambiguity_flags: [
          {
            dimension: 'application_type',
            message:
              'Polyethylene piping standards differ strictly between pressurized drinking water and gravity drainage networks:',
            options: [
              {
                value: 'potable_water_pn10',
                label: 'Pressurized Potable Water Network (IS 4984:2016 — PE-100 PN 10)',
                description: 'Mandatory for Jal Jeevan Mission drinking water with virgin resin certification.',
              },
              {
                value: 'sewerage_drainage',
                label: 'Non-Pressure Underground Drainage & Sewerage (IS 16098 Part 2 — DWC Pipes)',
                description: 'Double-wall corrugated structured pipes for sewage transit.',
              },
            ],
          },
        ],
      },
      primary_recommendation: {
        is_number: 'IS 4984:2016',
        title: 'High Density Polyethylene Pipes for Water Supply — Specification',
        status: 'ACTIVE',
        year_published: 2016,
        latest_amendment: 'Amendment 3 (2021)',
        confidence: 0.75,
        scope_snippet: 'Covers requirements for high density polyethylene pipes for water supply intended for human consumption.',
        certification: {
          scheme: 'BIS_ISI_MARK',
          mandatory: true,
          qco_order_name: 'Polyethylene Material for Pipes (Quality Control) Order 2023',
        },
      },
      allied_standards: [],
      outdated_citations: [],
      graph_path: [],
      reasoning_trace: [
        {
          step: 'query_understanding',
          detail: 'HDPE pipe identified. Ambiguity prompt generated between potable water and sewerage standards.',
          confidence: 0.75,
        },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'Select whether the HDPE pipes are for pressurized drinking water or gravity sewerage network.',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-amb-003',
        query_id: 'uuid-amb-003',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: 'a1294fa918bca4891bca72891bb204918290ab9182301928301112341234567',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: { risk_level: 'NONE', message: null, standards_under_revision: [] },
      multilingual: { bhashini_used: false, detected_input_language: 'en', response_language: 'en', available_translations: ['hi'] },
    },
  },
  {
    id: 'amb-led-floodlights',
    queryText: 'LED Floodlights for outdoor industrial yard and high mast',
    domainLabel: 'LED Floodlights (High-Mast IP66 vs Street Luminaire IP65)',
    category: 'AMBIGUITY',
    language: 'English',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-amb-004',
        session_id: 'sess-amb-8123',
        timestamp: new Date().toISOString(),
        processing_time_ms: 275,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: 'b3394fa918bca4891bca72891bb204918290ab918230192830111234998877',
        mode: 'recommend',
      },
      query_understanding: {
        detected_language: 'en',
        original_text: 'LED Floodlights for outdoor industrial yard and high mast',
        normalized_text: 'led floodlights outdoor industrial yard high mast',
        query_intent: 'STANDARD_LOOKUP',
        product_name: 'LED Floodlights',
        domain: 'Industrial Lighting',
        confidence: 0.70,
        extracted_entities: [
          { entity: 'LED Floodlights', type: 'PRODUCT', confidence: 0.98 },
          { entity: 'Outdoor Industrial Yard', type: 'APPLICATION_DOMAIN', confidence: 0.88 },
          { entity: 'High Mast', type: 'APPLICATION_DOMAIN', confidence: 0.85 },
        ],
        ambiguity_flags: [
          {
            dimension: 'luminaire_application',
            message:
              'Outdoor industrial luminaires have distinct BIS standards based on mounting elevation and ingress protection:',
            options: [
              {
                value: 'high_mast_ip66',
                label: 'High-Mast Yard Floodlight (IS 10322 Part 5 Sec 5 — IP66 / 10kV Surge)',
                description: 'For 15m-30m high masts in rail yards, ports, and industrial complexes.',
              },
              {
                value: 'street_lighting_ip65',
                label: 'Road & Street Luminaire (IS 10322 Part 5 Sec 3 — Type II/III Optics)',
                description: 'For perimeter roads and internal plant roadways.',
              },
            ],
          },
        ],
      },
      primary_recommendation: {
        is_number: 'IS 10322 (Part 5/Sec 5):2013',
        title: 'Luminaires — Particular Requirements — Flood Lighting',
        status: 'ACTIVE',
        year_published: 2013,
        latest_amendment: 'Amendment 2 (2022)',
        confidence: 0.70,
        scope_snippet: 'Specifies safety and constructional requirements for floodlighting luminaires on supply voltages up to 1000V.',
        certification: {
          scheme: 'BIS_CRS',
          mandatory: true,
          qco_order_name: 'Electronics and IT Goods (Compulsory Registration) Order',
        },
      },
      allied_standards: [],
      outdated_citations: [],
      graph_path: [],
      reasoning_trace: [
        { step: 'query_understanding', detail: 'Outdoor LED lighting detected. Generated ambiguity options for High-Mast vs Street lighting.', confidence: 0.70 },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'Select whether the LED floodlight is for high-mast yard lighting or perimeter roadway lighting.',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-amb-004',
        query_id: 'uuid-amb-004',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: 'b3394fa918bca4891bca72891bb204918290ab918230192830111234998877',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: { risk_level: 'NONE', message: null, standards_under_revision: [] },
      multilingual: { bhashini_used: false, detected_input_language: 'en', response_language: 'en', available_translations: ['hi'] },
    },
  },

  // MULTILINGUAL INDIC PRESETS
  {
    id: 'indic-hindi-cement',
    queryText: 'हाईवे पुलों और सुपरस्ट्रक्चर के लिए 53 ग्रेड ओपीसी सीमेंट',
    domainLabel: 'Hindi: 53 ग्रेड ओपीसी सीमेंट (Highway Bridge Cement)',
    category: 'MULTILINGUAL',
    language: 'Hindi (हिंदी)',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-indic-001',
        session_id: 'sess-indic-8124',
        timestamp: new Date().toISOString(),
        processing_time_ms: 340,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: 'f9284fa918bca4891bca72891bb204918290ab918230192830111234111222',
        mode: 'recommend',
      },
      query_understanding: {
        detected_language: 'hi',
        original_text: 'हाईवे पुलों और सुपरस्ट्रक्चर के लिए 53 ग्रेड ओपीसी सीमेंट',
        normalized_text: '53 Grade Ordinary Portland Cement for highway bridges and superstructure',
        query_intent: 'STANDARD_LOOKUP',
        product_name: '53 Grade Ordinary Portland Cement',
        grade_specification: '53 Grade',
        domain: 'Highway Infrastructure',
        confidence: 0.98,
        extracted_entities: [
          { entity: 'ओपीसी सीमेंट (OPC Cement)', type: 'PRODUCT', confidence: 0.99 },
          { entity: '53 ग्रेड (53 Grade)', type: 'GRADE_SPECIFICATION', confidence: 0.99 },
          { entity: 'हाईवे पुल (Highway Bridges)', type: 'APPLICATION_DOMAIN', confidence: 0.96 },
        ],
        ambiguity_flags: [],
      },
      primary_recommendation: {
        is_number: 'IS 269:2015 (53 Grade)',
        title: 'Ordinary Portland Cement, 53 Grade — Specification',
        status: 'ACTIVE',
        year_published: 2015,
        latest_amendment: 'Amendment 2 (2022)',
        confidence: 0.99,
        scope_snippet: 'Covers requirements for 53 Grade Ordinary Portland Cement for structural concrete and bridge decks.',
        certification: {
          scheme: 'BIS_ISI_MARK',
          mandatory: true,
          qco_order_name: 'Cement (Quality Control) Order 2024',
        },
      },
      allied_standards: [
        { is_number: 'IS 4031 (Part 1)', title: 'Determination of Fineness of Cement', relation_type: 'TEST_METHOD', status: 'ACTIVE', confidence: 0.96, why: 'Mandatory physical test method.' },
      ],
      outdated_citations: [],
      graph_path: [],
      reasoning_trace: [
        { step: 'multilingual_normalization', detail: 'Detected Hindi input (Bhashini/Gemini model). Normalized to canonical technical query.', confidence: 0.99 },
        { step: 'entity_extraction', detail: 'Mapped हिंदी terms to IS 269:2015 53 Grade OPC.', confidence: 0.99 },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'हाईवे पुलों और सुपरस्ट्रक्चर के लिए 53 ग्रेड ऑर्डिनरी पोर्टलैंड सीमेंट का भारतीय मानक IS 269:2015 है। इस पर अनिवार्य बीआईएस आईएसआई मार्क (BIS ISI Mark) लागू है।',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-indic-001',
        query_id: 'uuid-indic-001',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: 'f9284fa918bca4891bca72891bb204918290ab918230192830111234111222',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: { risk_level: 'NONE', message: null, standards_under_revision: [] },
      multilingual: { bhashini_used: true, detected_input_language: 'hi', response_language: 'hi', available_translations: ['en', 'hi'] },
    },
  },
  {
    id: 'indic-tamil-steel',
    queryText: 'நெடுஞ்சாலை பாலங்களுக்கான உயர் இழுவிசை எஃகு Fe 500D',
    domainLabel: 'Tamil: Fe 500D எஃகு (High-Tensile Steel Rebars)',
    category: 'MULTILINGUAL',
    language: 'Tamil (தமிழ்)',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-indic-002',
        session_id: 'sess-indic-8125',
        timestamp: new Date().toISOString(),
        processing_time_ms: 320,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: 'e8284fa918bca4891bca72891bb204918290ab918230192830111234777888',
        mode: 'recommend',
      },
      query_understanding: {
        detected_language: 'ta',
        original_text: 'நெடுஞ்சாலை பாலங்களுக்கான உயர் இழுவிசை எஃகு Fe 500D',
        normalized_text: 'High strength deformed steel bars Fe 500D for highway bridges',
        query_intent: 'STANDARD_LOOKUP',
        product_name: 'High Strength Deformed Steel Bars',
        grade_specification: 'Fe 500D',
        domain: 'Highway Bridges',
        confidence: 0.98,
        extracted_entities: [
          { entity: 'எஃகு (Steel Rebars)', type: 'PRODUCT', confidence: 0.99 },
          { entity: 'Fe 500D', type: 'GRADE_SPECIFICATION', confidence: 0.99 },
          { entity: 'நெடுஞ்சாலை பாலம் (Highway Bridges)', type: 'APPLICATION_DOMAIN', confidence: 0.95 },
        ],
        ambiguity_flags: [],
      },
      primary_recommendation: {
        is_number: 'IS 1786:2008 Grade Fe 500D',
        title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement',
        status: 'ACTIVE',
        year_published: 2008,
        latest_amendment: 'Amendment 4 (2023)',
        confidence: 0.99,
        scope_snippet: 'Covers requirements for high strength deformed steel bars with minimum 16% elongation for seismic structural resilience.',
        certification: {
          scheme: 'BIS_ISI_MARK',
          mandatory: true,
          qco_order_name: 'Steel and Steel Products (Quality Control) Order 2024',
        },
      },
      allied_standards: [
        { is_number: 'IS 1599', title: 'Metallic Materials — Bend Test', relation_type: 'TEST_METHOD', status: 'ACTIVE', confidence: 0.96, why: 'Mandatory 180° bend test.' },
      ],
      outdated_citations: [],
      graph_path: [],
      reasoning_trace: [
        { step: 'multilingual_normalization', detail: 'Detected Tamil input. Normalized to canonical English technical specification.', confidence: 0.99 },
        { step: 'entity_extraction', detail: 'Mapped தமிழ் keywords to IS 1786:2008 Grade Fe 500D.', confidence: 0.99 },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'நெடுஞ்சாலை பாலங்களுக்கான கான்கிரீட் வலுவூட்டல் எஃகு கம்பிகளுக்கான இந்திய தரநிலை IS 1786:2008 Grade Fe 500D ஆகும். கட்டாய BIS ISI முத்திரை தேவைப்படுகிறது.',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-indic-002',
        query_id: 'uuid-indic-002',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: 'e8284fa918bca4891bca72891bb204918290ab918230192830111234777888',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: { risk_level: 'NONE', message: null, standards_under_revision: [] },
      multilingual: { bhashini_used: true, detected_input_language: 'ta', response_language: 'ta', available_translations: ['en', 'ta'] },
    },
  },

  // SUPERSEDED AUDIT PRESET
  {
    id: 'outdated-is8112-cement',
    queryText: '43 Grade Ordinary Portland Cement conforming to IS 8112:1989',
    domainLabel: 'Outdated Citation: IS 8112:1989 (Withdrawn → Replaced by IS 269:2015)',
    category: 'OUTDATED_AUDIT',
    language: 'English',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-outdated-001',
        session_id: 'sess-outdated-8126',
        timestamp: new Date().toISOString(),
        processing_time_ms: 260,
        pipeline_version: '1.0.0',
        model_version: 'gemini-3.8-flash',
        data_snapshot_date: '2026-09-26',
        audit_reference_hash: '39284fa918bca4891bca72891bb204918290ab918230192830111234555444',
        mode: 'audit',
      },
      query_understanding: {
        detected_language: 'en',
        original_text: '43 Grade Ordinary Portland Cement conforming to IS 8112:1989',
        normalized_text: '43 Grade Ordinary Portland Cement IS 8112:1989',
        query_intent: 'OUTDATED_DETECTION',
        product_name: 'Ordinary Portland Cement',
        grade_specification: '43 Grade',
        confidence: 0.99,
        extracted_entities: [
          { entity: 'Ordinary Portland Cement', type: 'PRODUCT', confidence: 0.99 },
          { entity: '43 Grade', type: 'GRADE_SPECIFICATION', confidence: 0.99 },
          { entity: 'IS 8112:1989', type: 'GRADE_SPECIFICATION', confidence: 0.99 },
        ],
        ambiguity_flags: [],
      },
      primary_recommendation: {
        is_number: 'IS 269:2015 (incorporating 43 Grade)',
        title: 'Ordinary Portland Cement — Specification (Sixth Revision)',
        status: 'ACTIVE',
        year_published: 2015,
        latest_amendment: 'Amendment 2 (2022)',
        confidence: 0.99,
        scope_snippet: 'IS 8112:1989 was formally withdrawn and unified into consolidated IS 269:2015. BIS licenses under IS 8112 are invalid.',
        certification: {
          scheme: 'BIS_ISI_MARK',
          mandatory: true,
          qco_order_name: 'Cement (Quality Control) Order 2024',
        },
      },
      allied_standards: [
        { is_number: 'IS 4031 (Part 1)', title: 'Determination of Fineness of Cement', relation_type: 'TEST_METHOD', status: 'ACTIVE', confidence: 0.98, why: 'Mandatory test method.' },
      ],
      outdated_citations: [
        {
          cited_standard: 'IS 8112:1989',
          status: 'WITHDRAWN',
          severity: 'CRITICAL',
          reason: 'Legacy standard withdrawn. Citing IS 8112 violates GFR 2017 Rule 144(i) and triggers CAG audit disallowance.',
          replacement: 'IS 269:2015 (Clause 5.1)',
          message: 'IS 8112:1989 is withdrawn and superseded by IS 269:2015.',
        },
      ],
      graph_path: [],
      reasoning_trace: [
        { step: 'outdated_detection', detail: 'Identified withdrawn standard IS 8112:1989. Executed GraphRAG supersession traversal to IS 269:2015.', confidence: 0.99 },
        { step: 'statutory_validation', detail: 'Applied CVC circular Vig/04/03/2021 compliance guardrail.', confidence: 0.99 },
      ],
      plain_language_explanation: {
        enabled: true,
        text: 'Citing IS 8112:1989 is invalid because BIS withdrew this standard and merged 33, 43, and 53 grades into unified IS 269:2015. Update your tender specification to IS 269:2015 to prevent statutory audit rejection.',
      },
      compliance_checklist: [],
      audit_record: {
        recommendation_id: 'rec-outdated-001',
        query_id: 'uuid-outdated-001',
        timestamp: new Date().toISOString(),
        standards_version_snapshot: {},
        audit_hash: '39284fa918bca4891bca72891bb204918290ab918230192830111234555444',
        logged: true,
        dry_run: false,
        rti_exportable: true,
      },
      staleness_risk: { risk_level: 'CRITICAL', message: 'Citing withdrawn standard IS 8112:1989 exposes tender to statutory disqualification.', standards_under_revision: [] },
      multilingual: { bhashini_used: false, detected_input_language: 'en', response_language: 'en', available_translations: ['hi'] },
    },
  },
];
