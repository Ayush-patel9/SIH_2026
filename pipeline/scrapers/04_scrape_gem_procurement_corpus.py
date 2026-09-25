import os
import sys
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
PROCUREMENT_DIR = os.path.join(DATA_DIR, "05_procurement_gold_corpus")
SPEC_SHEETS_DIR = os.path.join(PROCUREMENT_DIR, "gem_spec_sheets")
BENCHMARK_DIFF_DIR = os.path.join(PROCUREMENT_DIR, "test_benchmark_diff")

os.makedirs(SPEC_SHEETS_DIR, exist_ok=True)
os.makedirs(BENCHMARK_DIFF_DIR, exist_ok=True)

# Master GeM Category Specifications & Golden Parameters
GEM_PRODUCT_CATEGORIES = [
    {
        "category_id": "GEM_CAT_TMT_BARS",
        "category_name": "High Strength Deformed Steel Bars (TMT Bars)",
        "governing_is_standards": ["IS 1786"],
        "latest_edition": "IS 1786:2008 (Reaffirmed 2022)",
        "allied_normative_standards": ["IS 1608 (Part 1)", "IS 1599", "IS 228", "IS 2770 (Part 1)"],
        "mandatory_certification": "Scheme-I (ISI Mark) under Steel QCO 2024",
        "golden_parameters": {
            "grades_allowed": ["Fe 415D", "Fe 500", "Fe 500D", "Fe 550D", "Fe 600"],
            "nominal_sizes_mm": [8, 10, 12, 16, 20, 25, 28, 32, 36, 40],
            "min_yield_stress_fe500d_mpa": 500.0,
            "min_tensile_strength_fe500d_mpa": 565.0,
            "min_elongation_fe500d_percent": 16.0,
            "max_carbon_fe500d_percent": 0.25,
            "max_sulphur_phosphorus_fe500d_percent": 0.075,
            "bend_mandrel_diameter": "3d for nominal dia <= 20mm"
        },
        "critical_procurement_clauses": [
            "Manufacturer must possess valid BIS License as per IS 1786:2008.",
            "Each bundle/bar must bear standard ISI mark with manufacturer's trademark and grade designation.",
            "Test certificate conforming to IS 1608 (tensile) and IS 1599 (bend) must accompany every consignment."
        ]
    },
    {
        "category_id": "GEM_CAT_CEMENT_PPC",
        "category_name": "Portland Pozzolana Cement (Fly Ash Based)",
        "governing_is_standards": ["IS 1489 (Part 1)"],
        "latest_edition": "IS 1489 (Part 1):2015 (Reaffirmed 2020)",
        "allied_normative_standards": ["IS 4031 (Part 1 to 15)", "IS 4032", "IS 3535"],
        "mandatory_certification": "Scheme-I (ISI Mark) under Cement QCO 2023",
        "golden_parameters": {
            "fly_ash_content_percent": "15 to 35%",
            "min_fineness_m2_per_kg": 300,
            "min_initial_setting_time_min": 30,
            "max_final_setting_time_min": 600,
            "min_compressive_strength_3days_mpa": 16.0,
            "min_compressive_strength_7days_mpa": 22.0,
            "min_compressive_strength_28days_mpa": 33.0,
            "soundness_le_chatelier_expansion_mm": "<= 10.0"
        },
        "critical_procurement_clauses": [
            "Cement must bear BIS Standard Mark (ISI mark) conforming to IS 1489 (Part 1).",
            "Bags must clearly mention week and year of manufacture."
        ]
    },
    {
        "category_id": "GEM_CAT_DISTRIBUTION_TRANSFORMER",
        "category_name": "Outdoor Type Oil Immersed Distribution Transformers up to 2500 kVA",
        "governing_is_standards": ["IS 1180 (Part 1)"],
        "latest_edition": "IS 1180 (Part 1):2014",
        "allied_normative_standards": ["IS 2026 (Part 1 to 5)", "IS 335", "IS 2099", "IS 7421"],
        "mandatory_certification": "Scheme-I (ISI Mark) + BEE Star Rating Mandatory",
        "golden_parameters": {
            "standard_ratings_kva": [16, 25, 63, 100, 160, 200, 250, 315, 400, 500, 630, 1000, 1600, 2000, 2500],
            "voltage_class_kv": 11,
            "cooling_type": "ONAN",
            "winding_material": "Electrolytic Copper or High Grade Aluminium",
            "max_total_losses_at_50_percent_load_watts": "< prescribed Table 3 limits",
            "max_total_losses_at_100_percent_load_watts": "< prescribed Table 3 limits",
            "insulating_oil_standard": "IS 335"
        },
        "critical_procurement_clauses": [
            "Transformer must carry valid BIS ISI Mark as per IS 1180 (Part 1):2014 and BEE star labeling.",
            "Type test report from CPRI / ERDA including short circuit test must be submitted."
        ]
    },
    {
        "category_id": "GEM_CAT_LED_LUMINAIRE_STREET",
        "category_name": "LED Luminaires for Road and Street Lighting",
        "governing_is_standards": ["IS 10322 (Part 5/Sec 3)", "IS 16107 (Part 2/Sec 1)"],
        "latest_edition": "IS 10322 (Part 5/Sec 3):2012 / IS 16107:2016",
        "allied_normative_standards": ["IS 16102 (Part 1)", "IS 15885 (Part 2/Sec 13)", "IS 16103 (Part 1)"],
        "mandatory_certification": "Scheme-II (CRS - Compulsory Registration Scheme) under MeitY",
        "golden_parameters": {
            "system_efficacy_lm_per_watt": ">= 120 lm/W",
            "correlated_color_temperature_k": "4000K to 5700K",
            "color_rendering_index_cri": ">= 70",
            "power_factor": ">= 0.95",
            "total_harmonic_distortion_thd": "<= 10%",
            "surge_protection_kv": ">= 10 kV (internal/external SPD)",
            "ingress_protection_rating": "IP 66",
            "driver_standard": "IS 15885 (Part 2/Sec 13)"
        },
        "critical_procurement_clauses": [
            "Product and LED Driver must have valid BIS CRS Registration under Scheme-II.",
            "LM-79 test report from NABL accredited lab for optical performance and LM-80 report for LED chip life."
        ]
    },
    {
        "category_id": "GEM_CAT_WORK_CHAIRS",
        "category_name": "Office Work Chairs (Ergonomic Revolving Chairs)",
        "governing_is_standards": ["IS 17631"],
        "latest_edition": "IS 17631:2022",
        "allied_normative_standards": ["IS 17637", "IS 9873"],
        "mandatory_certification": "Scheme-I (ISI Mark) under DPIIT Furniture QCO 2024",
        "golden_parameters": {
            "chair_type": "Type 1 (Adjustable back height & angle) / Type 2",
            "seat_height_adjustment_range_mm": "400 to 520 mm",
            "swivel_test_cycles": "120,000 revolutions minimum",
            "seat_durability_load_cycles": "100,000 cycles with 1000 N load",
            "castor_durability_cycles": "50,000 cycles with 110 kg payload",
            "gas_lift_class": "Class 3 or Class 4 (BIFMA X5.1 / DIN 4550)"
        },
        "critical_procurement_clauses": [
            "Chairs must bear BIS Standard Mark (ISI mark) as per IS 17631:2022 in compliance with Furniture QCO 2024.",
            "Gas spring lift cylinder must be certified for 100,000+ cycles."
        ]
    },
    {
        "category_id": "GEM_CAT_PORTABLE_FIRE_EXTINGUISHERS",
        "category_name": "Portable Fire Extinguishers (ABC Dry Powder & CO2)",
        "governing_is_standards": ["IS 15683"],
        "latest_edition": "IS 15683:2018",
        "allied_normative_standards": ["IS 4308", "IS 4862", "IS 2878", "IS 2171"],
        "mandatory_certification": "Scheme-I (ISI Mark) under Fire Fighting Equipment QCO",
        "golden_parameters": {
            "extinguishing_media": "Mono Ammonium Phosphate (MAP 50% or MAP 90%) conforming to IS 4308",
            "capacities_kg": [2, 4, 6, 9],
            "fire_rating_6kg": "3A and 21B minimum",
            "discharge_time_seconds": ">= 13 seconds for 6kg",
            "hydrostatic_test_pressure_bar": "35 bar",
            "burst_pressure_bar": ">= 55 bar",
            "corrosion_resistance": "480 hours salt spray test as per IS 9844"
        },
        "critical_procurement_clauses": [
            "Extinguisher cylinder and extinguishing powder must be BIS ISI marked conforming to IS 15683:2018 and IS 4308.",
            "Internal lining must be thermoplastic polymer / epoxy powder coated."
        ]
    },
    {
        "category_id": "GEM_CAT_IT_LAPTOPS",
        "category_name": "Commercial Laptops / Notebooks",
        "governing_is_standards": ["IS 13252 (Part 1)"],
        "latest_edition": "IS 13252 (Part 1):2010 (IEC 60950-1:2005)",
        "allied_normative_standards": ["IS 16046 (Part 2)", "IS/IEC 60065", "IS 16333 (Part 3)"],
        "mandatory_certification": "Scheme-II (CRS) under MeitY Compulsory Registration Scheme",
        "golden_parameters": {
            "safety_standard": "IS 13252 (Part 1):2010",
            "battery_safety_standard": "IS 16046 (Part 2):2018 / IEC 62133-2",
            "adapter_safety_standard": "IS 13252 (Part 1)",
            "indian_language_support": "IS 16333 (Part 3) keyboard layout",
            "energy_star_rating": "ENERGY STAR 8.0 compliant"
        },
        "critical_procurement_clauses": [
            "Device, Battery, and Power Adapter must have valid BIS CRS Registration numbers printed on product and box.",
            "OEM must be registered with BIS under MeitY electronics order."
        ]
    }
]

# Benchmark Golden Evaluation Pairs for Diff & Recommendation Engine
GOLDEN_TENDER_EVALUATION_PAIRS = [
    {
        "test_id": "TEST_TENDER_001_STEEL_PWD",
        "tender_title": "Construction of Multi-Storey Administrative Block at Sector 62 Noida (Structural Steel & RCC Work)",
        "sample_draft_tender_text": """
        Item 4.1: Providing and laying reinforced cement concrete in columns, beams and slabs using High Yield Strength Deformed (HYSD) Tor Steel bars conforming to IS 1786 : 1985 of Grade Fe 415. The tensile strength should be tested as per IS 1608:1995. Mild steel plain bars conforming to IS 432:1982 can be used for stirrups. All concrete work shall adhere to IS 456:1978.
        """,
        "ground_truth_issues_to_catch": [
            {
                "issue_type": "OUTDATED_STANDARD",
                "cited_citation": "IS 1786 : 1985",
                "latest_standard": "IS 1786:2008 (Reaffirmed 2022)",
                "criticality": "HIGH",
                "reason": "IS 1786:1985 was superseded by IS 1786:2008 with major amendments (Amd 1 to 4) specifying Fe 500D/550D and mandatory chemical tolerance."
            },
            {
                "issue_type": "OUTDATED_STANDARD",
                "cited_citation": "IS 456:1978",
                "latest_standard": "IS 456:2000 (Reaffirmed 2021)",
                "criticality": "HIGH",
                "reason": "IS 456:1978 (3rd revision) was replaced by IS 456:2000 (4th revision) introducing durability-based mix design and limit state method."
            },
            {
                "issue_type": "OUTDATED_TEST_METHOD",
                "cited_citation": "IS 1608:1995",
                "latest_standard": "IS 1608 (Part 1):2022 / ISO 6892-1:2019",
                "criticality": "MEDIUM",
                "reason": "Tensile testing standard was revised to align with ISO 6892-1 dual numbering."
            },
            {
                "issue_type": "MANDATORY_REGULATORY_TRIGGER",
                "standard": "IS 1786",
                "scheme": "Scheme-I (ISI Mark)",
                "ministry": "Ministry of Steel",
                "order_name": "Steel and Steel Products (Quality Control) Order, 2024",
                "criticality": "CRITICAL",
                "recommendation": "Tender specification must mandate BIS ISI Certification mark under Steel QCO 2024. Procurement of non-ISI marked reinforcement steel is illegal."
            },
            {
                "issue_type": "MISSING_ALLIED_STANDARDS",
                "missing_standards": [
                    { "is_number": "IS 13920", "title": "Ductile Design and Detailing of Reinforced Concrete Structures Subjected to Seismic Forces" },
                    { "is_number": "IS 1893 (Part 1)", "title": "Criteria for Earthquake Resistant Design of Structures" },
                    { "is_number": "IS 1599", "title": "Metallic Materials - Bend Test" }
                ]
            }
        ]
    },
    {
        "test_id": "TEST_TENDER_002_SOLAR_STREETLIGHTS",
        "tender_title": "Supply and Installation of 90W LED Solar Integrated Street Lighting for Smart City Municipal Area",
        "sample_draft_tender_text": """
        Technical Specification: Supply of outdoor 90W LED Streetlight luminaires. The LED luminaire should comply with IS 10322. LED driver must operate from 140V to 280V. Solar PV module should be 250W. Battery shall be Lithium Iron Phosphate (LiFePO4).
        """,
        "ground_truth_issues_to_catch": [
            {
                "issue_type": "INCOMPLETE_STANDARD_PART",
                "cited_citation": "IS 10322",
                "latest_standard": "IS 10322 (Part 5/Sec 3):2012 (Reaffirmed 2022)",
                "criticality": "HIGH",
                "reason": "IS 10322 is a multi-part specification. Road and street lighting requires specifically Section 3 of Part 5."
            },
            {
                "issue_type": "MANDATORY_REGULATORY_TRIGGER",
                "standard": "IS 10322 (Part 5/Sec 3)",
                "scheme": "Scheme-II (CRS)",
                "ministry": "MeitY",
                "order_name": "Electronics & IT Goods (Compulsory Registration Scheme) Order",
                "criticality": "CRITICAL",
                "recommendation": "LED streetlights are legally mandated to have BIS CRS Registration under Scheme-II."
            },
            {
                "issue_type": "MISSING_MANDATORY_STANDARDS",
                "missing_standards": [
                    { "is_number": "IS 16046 (Part 2)", "title": "Secondary Lithium Cells/Batteries for Portable Applications (CRS Mandatory)" },
                    { "is_number": "IS 14286 / IS/IEC 61730", "title": "Solar Photovoltaic Modules Design Qualification & Safety (MNRE Mandatory)" },
                    { "is_number": "IS 15885 (Part 2/Sec 13)", "title": "Safety of AC or DC Supplied Electronic Controlgear for LED Modules" },
                    { "is_number": "IS 16107 (Part 2/Sec 1)", "title": "LED Luminaire Performance Requirements" }
                ]
            }
        ]
    },
    {
        "test_id": "TEST_TENDER_003_OFFICE_FURNITURE",
        "tender_title": "Procurement of 500 Nos Executive Ergonomic Revolving Work Chairs for Directorate of Technical Education",
        "sample_draft_tender_text": """
        Supply of High Back Revolving Chairs with hydraulic gas lift, nylon mesh back, PU armrests, 5-prong nylon base. The vendor should provide test certificate from private testing lab as per BIFMA standard.
        """,
        "ground_truth_issues_to_catch": [
            {
                "issue_type": "MISSING_MANDATORY_INDIAN_STANDARD",
                "recommended_standard": "IS 17631:2022 (Work Chairs - Specification)",
                "criticality": "CRITICAL",
                "reason": "DPIIT notified Furniture (Quality Control) Order 2024 mandating IS 17631:2022 with BIS ISI Mark. Specifying only BIFMA without IS 17631 violates public procurement QCO guidelines."
            },
            {
                "issue_type": "MANDATORY_REGULATORY_TRIGGER",
                "standard": "IS 17631",
                "scheme": "Scheme-I (ISI Mark)",
                "ministry": "DPIIT",
                "order_name": "Furniture (Quality Control) Order, 2024",
                "criticality": "CRITICAL"
            }
        ]
    }
]

def compile_procurement_corpus():
    """Compile GeM category specifications and benchmark evaluation golden test set"""
    logger.info("=== COMPILING GEM PROCUREMENT SPECIFICATIONS & EVALUATION CORPUS ===")
    
    # 1. Save GeM Category Specification Master
    gem_cat_file = os.path.join(PROCUREMENT_DIR, "gem_categories.json")
    with open(gem_cat_file, "w", encoding="utf-8") as f:
        json.dump(GEM_PRODUCT_CATEGORIES, f, indent=2, ensure_ascii=False)
        
    # 2. Save individual spec sheets
    for cat in GEM_PRODUCT_CATEGORIES:
        cid = cat["category_id"]
        out_f = os.path.join(SPEC_SHEETS_DIR, f"{cid}.json")
        with open(out_f, "w", encoding="utf-8") as f:
            json.dump(cat, f, indent=2, ensure_ascii=False)
            
    # 3. Save Golden Evaluation Pairs for Diff Engine Testing
    bench_file = os.path.join(BENCHMARK_DIFF_DIR, "golden_diff_evaluation_set.json")
    with open(bench_file, "w", encoding="utf-8") as f:
        json.dump(GOLDEN_TENDER_EVALUATION_PAIRS, f, indent=2, ensure_ascii=False)
        
    logger.info(f" Saved {len(GEM_PRODUCT_CATEGORIES)} GeM Category Specification sheets -> {SPEC_SHEETS_DIR}")
    logger.info(f" Compiled Golden Diff & Recommendation Benchmark Suite -> {bench_file}")

if __name__ == "__main__":
    compile_procurement_corpus()
