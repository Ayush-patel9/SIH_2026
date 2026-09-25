import cementFixture from '../fixtures/cement_mock.json';
import { IndianStandardsRecommendationResponse } from '../types';

export const CEMENT_MOCK: IndianStandardsRecommendationResponse = cementFixture as IndianStandardsRecommendationResponse;

export const STEEL_MOCK: IndianStandardsRecommendationResponse = {
  query_metadata: {
    input_text: "High strength deformed steel bars and wires for concrete reinforcement Fe 500D for seismic earthquake zones",
    detected_domain: "Metallurgy & Civil Engineering (MTD/CED)",
    detected_language: "English (multilingual: सरिया, टीएमटी बार, எஃகு கம்பிகள், સ્ટીલ સળિયા)",
    extracted_keywords: ["Deformed steel bars", "Fe 500D", "Concrete reinforcement", "Seismic zone", "TMT bars", "Elongation"],
    confidence_score: 0.992,
    processed_at: "2026-09-26T01:48:00Z"
  },
  primary_recommendations: [
    {
      is_number: "IS 1786",
      standard_id: "IS 1786:2008",
      title: "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification (Fourth Revision)",
      year_published: 2008,
      status: "ACTIVE",
      aspect: "Product Specification",
      division_code: "MTD",
      ics_codes: ["77.140.15", "91.080.40"],
      relevance_score: 0.995,
      match_reason: "Primary standard for thermo-mechanically treated (TMT) and cold-twisted deformed (CTD) reinforcement bars including Fe 500D seismic grade.",
      scope_summary: "Covers requirements of deformed steel bars and wires for use as reinforcement in concrete in sizes from 4 mm to 50 mm.",
      key_specifications: {
        grades: ["Fe 415", "Fe 415D", "Fe 500", "Fe 500D", "Fe 550", "Fe 550D", "Fe 600"],
        physical_requirements: [
          "0.2% Proof Stress / Yield Stress: Min 500.0 N/mm² (Fe 500D)",
          "Tensile Strength: Min 565.0 N/mm² (TS/YS ratio >= 1.10)",
          "Elongation at gauge length: Min 16.0% (High ductility for seismic dissipation)",
          "Total Elongation at Maximum Force (Agst): Min 5.0%"
        ],
        chemical_requirements: [
          "Carbon (C): Max 0.25%",
          "Sulfur (S): Max 0.040%",
          "Phosphorus (P): Max 0.040%",
          "S + P combined: Max 0.075%",
          "Carbon Equivalent (CE): Max 0.42%"
        ],
        marking_requirements: [
          "Manufacturer mark/brand name stamped at every meter",
          "Strength grade designation (e.g. '500D')",
          "Nominal size in mm",
          "Mandatory BIS Standard Mark (ISI Mark CM/L-xxxxxxx)"
        ]
      }
    }
  ],
  allied_standards: {
    normative_references: [
      {
        is_number: "IS 1608 (Part 1)",
        title: "Metallic Materials — Tensile Testing: Part 1 Method of Test at Room Temperature",
        relation_type: "NORMATIVE_TEST_METHOD",
        clause_reference: "Clause 9.1"
      },
      {
        is_number: "IS 1599",
        title: "Metallic Materials — Bend Test",
        relation_type: "NORMATIVE_TEST_METHOD",
        clause_reference: "Clause 9.3 - Bend and Rebend Testing"
      },
      {
        is_number: "IS 228",
        title: "Methods for Chemical Analysis of Steels",
        relation_type: "NORMATIVE_CHEMICAL_METHOD",
        clause_reference: "Clause 8.1"
      }
    ],
    test_methods: [
      {
        is_number: "IS 1608 (Part 1)",
        test_parameter: "Tensile & Proof Stress (0.2%)",
        standard_title: "Metallic Materials — Tensile Testing at Ambient Temperature",
        sample_size: "1m test piece"
      },
      {
        is_number: "IS 1599",
        test_parameter: "Bend & Rebend Test (135° bend followed by 15.5° reverse bend in 100°C water)",
        standard_title: "Metallic Materials — Bend Test",
        sample_size: "2 test pieces per lot"
      }
    ],
    safety_standards: [
      {
        is_number: "IS 13920",
        title: "Ductile Design and Detailing of Reinforced Concrete Structures Subjected to Seismic Forces - Code of Practice",
        focus_area: "Mandates Fe 415D or Fe 500D bars with high elongation for earthquake resistance"
      }
    ],
    installation_codes: [
      {
        is_number: "IS 456",
        title: "Plain and Reinforced Concrete - Code of Practice"
      },
      {
        is_number: "SP 34",
        title: "Handbook on Concrete Reinforcement and Detailing"
      }
    ]
  },
  mandatory_certifications: {
    is_qco_mandatory: true,
    schemes_applicable: ["SCHEME_I_ISI_MARK", "STEEL_QUALITY_CONTROL_ORDER"],
    qco_details: {
      order_name: "Steel and Steel Products (Quality Control) Order, 2020 / 2024",
      notifying_ministry: "Ministry of Steel, Government of India",
      gazette_so_number: "S.O. 167(E) & S.O. 2240(E)",
      enforcement_date: "2020-05-12",
      exemptions: "No exemptions for structural reinforcement steel in civil works"
    },
    crs_registration_required: false,
    hallmarking_required: false
  },
  version_amendment_status: {
    latest_version: "IS 1786:2008 (Fourth Revision, incorporating Amendment Nos. 1, 2, and 3)",
    cited_version: "IS 1786:1985 (Outdated)",
    is_latest_cited: false,
    outdated_warning: "Tender cites IS 1786:1985 which lacked Fe 500D/Fe 550D earthquake-resistant ductility definitions. Specify IS 1786:2008 (Rev 4) Fe 500D to ensure seismic safety compliance.",
    active_amendments: [
      {
        amendment_number: 1,
        year: 2012,
        summary: "Introduced Fe 600 grade and tightens phosphorus/sulfur combined impurities to max 0.075%."
      },
      {
        amendment_number: 2,
        year: 2018,
        summary: "Mandatory rolling mark indentation depth and spacing tolerances for rib geometries."
      },
      {
        amendment_number: 3,
        year: 2022,
        summary: "Mandates bar-level batch identification and heat-number verification tag."
      }
    ],
    supersedes: "IS 1786:1985 (Third Revision), IS 1139:1966",
    superseded_by: null
  },
  conformity_ecosystem: {
    nabl_recognized_labs: [
      {
        lab_id: "LAB-NTH-ER",
        lab_name: "National Test House (ER), Kolkata",
        location: "11/1 Judges Court Road, Alipore, Kolkata",
        state: "West Bengal",
        nabl_acc_no: "TC-5011",
        scope: "Full mechanical tensile, yield, bend/rebend, chemical spectroscopy (OES)"
      },
      {
        lab_id: "LAB-TUV-SUD",
        lab_name: "TÜV SÜD South Asia Laboratory",
        location: "Bengaluru, Karnataka",
        state: "Karnataka",
        nabl_acc_no: "TC-6190",
        scope: "Metallographic microstructure verification (martensitic rim & pearlitic core)"
      }
    ],
    certified_manufacturers: [
      {
        cml_no: "CM/L-8400019283",
        manufacturer_name: "Tata Steel Limited (Tata Tiscon)",
        brand_name: "Tata Tiscon 550D / 500D",
        state: "Jharkhand",
        validity_date: "2029-03-31",
        status: "OPERATIVE"
      },
      {
        cml_no: "CM/L-7200048192",
        manufacturer_name: "JSW Steel Limited",
        brand_name: "JSW Neosteel Fe 500D",
        state: "Karnataka",
        validity_date: "2028-11-30",
        status: "OPERATIVE"
      },
      {
        cml_no: "CM/L-6100091823",
        manufacturer_name: "Steel Authority of India Ltd (SAIL)",
        brand_name: "SAIL TMT EQR",
        state: "Chhattisgarh",
        validity_date: "2028-06-30",
        status: "OPERATIVE"
      }
    ]
  },
  gem_procurement_alignment: {
    category_id: "GEM-CAT-STEEL-01",
    category_name: "High Strength Deformed TMT Steel Bars",
    golden_parameters: {
      "Standard": "IS 1786:2008 (Rev 4)",
      "Grade": "Fe 500D (Seismic / High Ductility)",
      "Manufacturing Process": "Primary Steel Maker (BF-BOF / DRI-EAF route)",
      "Marking": "BIS ISI Mark with active License Number embossed every meter",
      "Test Certificate": "Manufacturer Mill Test Certificate with Heat Number & NABL Independent Test Report"
    },
    model_tender_clause: "All reinforcing steel shall be thermo-mechanically treated (TMT) high strength deformed bars conforming strictly to IS 1786:2008 (Grade Fe 500D). Only primary producers possessing valid BIS ISI licenses (Scheme-I) complying with the Steel (Quality Control) Order shall supply the material. Physical tensile tests and bend/rebend tests shall be conducted at a NABL accredited lab for every 50 MT consignment."
  }
};

export const ELECTRONICS_MOCK: IndianStandardsRecommendationResponse = {
  query_metadata: {
    input_text: "IP CCTV Surveillance Cameras and Secondary Lithium Battery Storage Systems for Smart City Command Centre",
    detected_domain: "Electronics & Information Technology (LITD)",
    detected_language: "English (multilingual: सीसीटीवी कैमरा, லித்தியம் பேட்டரி, સર્વેલન્સ કેમેરા)",
    extracted_keywords: ["IP CCTV Camera", "Surveillance", "Lithium Battery", "Smart City", "CRS Registration", "MeitY"],
    confidence_score: 0.978,
    processed_at: "2026-09-26T01:49:00Z"
  },
  primary_recommendations: [
    {
      is_number: "IS 13252 (Part 1)",
      standard_id: "IS 13252 (Part 1):2010",
      title: "Information Technology Equipment — Safety, Part 1: General Requirements (Second Revision)",
      year_published: 2010,
      status: "ACTIVE",
      aspect: "Product Safety Specification",
      division_code: "LITD",
      ics_codes: ["35.020", "33.160.40"],
      relevance_score: 0.98,
      match_reason: "Mandatory MeitY CRS safety standard for IP Surveillance Cameras, Network Video Recorders, and IT servers.",
      scope_summary: "Specifies requirements intended to reduce risks of fire, electric shock or injury for the operator and layman in contact with equipment.",
      key_specifications: {
        grades: ["Safety Class I & Class II Equipment"],
        physical_requirements: [
          "Electric Strength test: Insulation withstands 1500V AC without breakdown",
          "Clearance & Creepage Distances: Conforms to Table 2H & 2J for Overvoltage Category II",
          "Operating Temperature Range: -10°C to +55°C",
          "Ingress Protection: Min IP66 for outdoor camera enclosures"
        ],
        marking_requirements: [
          "BIS Compulsory Registration Scheme (CRS) Logo with Registration Number R-xxxxxxxx",
          "Rated voltage, frequency, and current consumption",
          "Country of origin and brand identity"
        ]
      }
    },
    {
      is_number: "IS 16046 (Part 2)",
      standard_id: "IS 16046 (Part 2):2018",
      title: "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements for Secondary Lithium Cells and Batteries (Part 2: Lithium Systems)",
      year_published: 2018,
      status: "ACTIVE",
      aspect: "Safety Specification",
      division_code: "LITD",
      ics_codes: ["29.220.30"],
      relevance_score: 0.95,
      match_reason: "Mandatory standard for lithium-ion battery packs and UPS backup systems powering CCTV nodes.",
      scope_summary: "Specifies requirements and tests for the safe operation of portable secondary lithium cells and batteries.",
      key_specifications: {
        physical_requirements: [
          "Continuous charging at constant voltage test",
          "External short-circuit test at 55°C (no explosion, no fire)",
          "Free fall drop test from 1.0m height",
          "Thermal abuse test at 130°C for 10 minutes"
        ],
        marking_requirements: [
          "BIS CRS Mark with 'Self Declaration - Conforming to IS 16046 (Part 2):2018'",
          "Polarity indication and nominal capacity in mAh/Wh"
        ]
      }
    }
  ],
  allied_standards: {
    normative_references: [
      {
        is_number: "IS/IEC 60950-1",
        title: "Information Technology Equipment - Safety",
        relation_type: "IDENTICAL_ADOPTION",
        clause_reference: "General Safety Rules"
      },
      {
        is_number: "IS 16102 (Part 1)",
        title: "Self-Ballasted LED Lamps for General Lighting Services - Safety Requirements",
        relation_type: "PERIPHERAL_LIGHTING",
        clause_reference: "IR Illuminator Compliance"
      }
    ],
    test_methods: [
      {
        is_number: "IS 13252 (Part 1)",
        test_parameter: "Leakage Current & Electric Insulation Strength",
        standard_title: "Electrical Safety Verification",
        sample_size: "2 production samples"
      },
      {
        is_number: "IS 16046 (Part 2)",
        test_parameter: "Overcharge, Forced Discharge & Vibration Safety",
        standard_title: "Lithium Safety Testing",
        sample_size: "5 cells / 3 battery packs"
      }
    ],
    safety_standards: [
      {
        is_number: "IS 616",
        title: "Audio, Video and Similar Electronic Apparatus - Safety Requirements",
        focus_area: "Power supply adapters and display console monitors"
      }
    ],
    installation_codes: [
      {
        is_number: "IS 732",
        title: "Code of Practice for Electrical Wiring Installations"
      }
    ]
  },
  mandatory_certifications: {
    is_qco_mandatory: true,
    schemes_applicable: ["SCHEME_II_CRS_REGISTRATION", "MEITY_ELECTRONICS_ORDER"],
    qco_details: {
      order_name: "Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order, 2021",
      notifying_ministry: "Ministry of Electronics and Information Technology (MeitY)",
      gazette_so_number: "S.O. 1230(E) dt 18.03.2021",
      enforcement_date: "2021-03-18",
      exemptions: "None for commercial sale or government e-Marketplace procurement"
    },
    crs_registration_required: true,
    hallmarking_required: false
  },
  version_amendment_status: {
    latest_version: "IS 13252 (Part 1):2010 (incorporating Amendment No. 1 and No. 2)",
    cited_version: "IS 13252:2003 (Outdated)",
    is_latest_cited: false,
    outdated_warning: "Cites superseded 2003 edition. Modern CCTV IP systems require IS 13252 (Part 1):2010 + MeitY CRS Registration R-number declaration.",
    active_amendments: [
      {
        amendment_number: 1,
        year: 2013,
        summary: "Harmonization with IEC 60950-1 amendment 1 (Touch current limits for tropical climate)."
      },
      {
        amendment_number: 2,
        year: 2017,
        summary: "Special requirements for equipment operating in ambient temperatures up to 50°C."
      }
    ],
    supersedes: "IS 13252:2003",
    superseded_by: null
  },
  conformity_ecosystem: {
    nabl_recognized_labs: [
      {
        lab_id: "LAB-ERTL-NORTH",
        lab_name: "Electronics Regional Test Laboratory (ERTL North), STQC MeitY",
        location: "Okhla Industrial Area Phase II, New Delhi",
        state: "Delhi",
        nabl_acc_no: "TC-5089",
        scope: "Safety testing for IT goods, CCTV surveillance, safety interlocks, battery systems"
      },
      {
        lab_id: "LAB-ETDC-HYD",
        lab_name: "Electronics Test and Development Centre (ETDC), Hyderabad",
        location: "ECIL Post, Cherlapally, Hyderabad",
        state: "Telangana",
        nabl_acc_no: "TC-5431",
        scope: "Environmental ingress IP66/IP67 testing, EMC/EMI compliance"
      }
    ],
    certified_manufacturers: [
      {
        cml_no: "R-41009823",
        manufacturer_name: "CP PLUS India Pvt Ltd",
        brand_name: "CP PLUS Guard+",
        state: "Andhra Pradesh",
        validity_date: "2027-09-30",
        status: "OPERATIVE"
      },
      {
        cml_no: "R-42001928",
        manufacturer_name: "Prama India Pvt Ltd",
        brand_name: "Prama Security IP",
        state: "Maharashtra",
        validity_date: "2028-02-28",
        status: "OPERATIVE"
      }
    ]
  },
  gem_procurement_alignment: {
    category_id: "GEM-CAT-SURV-09",
    category_name: "IP Surveillance Cameras and NVR Systems",
    golden_parameters: {
      "Safety Standard": "IS 13252 (Part 1):2010",
      "Battery Standard (if applicable)": "IS 16046 (Part 2):2018",
      "CRS Registration": "Valid MeitY R-Number mandatory on GeM catalog listing",
      "Ingress Protection": "IP66 or better for outdoor units",
      "Cybersecurity Compliance": "STQC / CERT-In security verification certificate"
    },
    model_tender_clause: "All CCTV surveillance cameras and power backup systems supplied shall strictly conform to IS 13252 (Part 1):2010 and IS 16046 (Part 2):2018. Bidders must submit valid BIS Compulsory Registration Scheme (CRS) certificates issued by MeitY containing active R-Numbers and test reports from BIS/STQC recognized test laboratories."
  }
};
