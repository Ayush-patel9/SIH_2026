import type { StandardsResponse, QueryUnderstanding, QueryIntent } from '../../types';

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
  data: StandardsResponse;
}

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
    confidence: 0.98,
  };

  // Add clarification reasoning trace step
  const updatedTrace = [
    ...originalResponse.reasoning_trace,
    {
      step: 'user_intent_disambiguation',
      detail: `User clarified ambiguous dimension '${dimension}' to: '${resolvedLabel || resolvedValue}'. Tailoring exact Indian Standard clause.`,
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
 * Presets demonstrating ambiguous real-world queries for testing Intent Disambiguation
 */
export const SAMPLE_AMBIGUOUS_QUERIES: AmbiguousQueryPreset[] = [
  {
    id: 'amb-bridges-cement',
    queryText: 'I need cement standard for highway bridges in NCR region',
    domainLabel: 'Highway Bridge Cement (Ambiguous Subdomain)',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-amb-001',
        session_id: 'sess-amb-8120',
        timestamp: new Date().toISOString(),
        processing_time_ms: 310,
        pipeline_version: '1.0.0',
        model_version: 'gemini-2.5-pro',
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
              'Highway bridge construction involves distinct structural zones governed by different standards. Specify which element this procurement is for:',
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
          qco_order_name: 'Cement (Quality Control) Order 2003',
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
        text: 'The query specifies cement for bridges without specifying the bridge section. Please select whether this is for the bridge deck wearing course or structural piers to receive the exact Indian Standard.',
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
    domainLabel: 'Railway Bridge Steel (Grade Specification Ambiguity)',
    data: {
      $schema: 'SIH2026.StandardsResponse.v1',
      meta: {
        query_id: 'uuid-amb-002',
        session_id: 'sess-amb-8121',
        timestamp: new Date().toISOString(),
        processing_time_ms: 280,
        pipeline_version: '1.0.0',
        model_version: 'gemini-2.5-pro',
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
          qco_order_name: 'Steel and Steel Products QCO 2020',
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
];
