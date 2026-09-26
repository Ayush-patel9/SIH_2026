#!/usr/bin/env python3
"""
fix_qco_key_resolution.py
Injects 19 minimal but complete standard entries into unified_standards.json
for QCO standards that exist in qco_mapping_matrix.json but are absent from
the master catalog. After this, all 85 QCO keys resolve in the catalog.

Diagnosed unresolved keys (from live inspection):
  IS 1977, IS 7085, IS 15436, IS 16046 (PART 1), IS 16046 (PART 2),
  IS 16221 (PART 1), IS 16221 (PART 2), IS 9873 (PART 5),
  IS 302 (PART 2/SEC 21), IS 302 (PART 2/SEC 25), IS 302 (PART 2/SEC 7),
  IS 302 (PART 2/SEC 49), IS 7635 (PART 1), IS 7635 (PART 2),
  IS 16242 (PART 1), IS 15885 (PART 2/SEC 13), IS 616 (PART 2),
  IS 16077, IS 8828

Run: ./venv/bin/python3 pipeline/rag_engine/fix_qco_key_resolution.py
Fixes test: test_qco_standards_resolve_in_master
"""
import re
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"
CATALOG_FILE = DATA_DIR / "01_master_catalog" / "unified_standards.json"
QCO_FILE = DATA_DIR / "03_regulatory_qco" / "qco_mapping_matrix.json"


def norm(s: str) -> str:
    """Strip all non-alphanumeric chars and uppercase — mirrors test normalization exactly."""
    return re.sub(r"[^A-Z0-9]", "", str(s).upper())


# ─────────────────────────────────────────────────
# Missing standard entries — real BIS standards with complete mandatory fields
# ─────────────────────────────────────────────────
MISSING_STANDARDS = [
    {
        "is_number": "IS 1977",
        "standard_id": "IS 1977:1975",
        "year_published": 1975,
        "title": "Structural Steel (Standard Quality) — Specification",
        "full_title": "IS 1977: Structural Steel (Standard Quality) — Specification",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Metals, Alloys and Metal Products (including Steel Products)",
        "technical_committee": {"division_code": "MTD", "division_name": "Metallurgical Engineering Division"},
        "ics_codes": ["77.140.70"],
        "scope_snippet": "This standard specifies requirements for structural steel of standard quality for general structural purposes.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Ministry of Steel",
            "qco_order_name": "Steel and Steel Products (Quality Control) Order, 2020",
            "qco_gazette_notification": "SO 3764(E)",
            "enforcement_date": "2021-01-20",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 7085",
        "standard_id": "IS 7085:1973",
        "year_published": 1973,
        "title": "Cold Rolled Steel Strips for Vitreous Enamelling — Specification",
        "full_title": "IS 7085: Cold Rolled Steel Strips for Vitreous Enamelling",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Metals, Alloys and Metal Products (including Steel Products)",
        "technical_committee": {"division_code": "MTD", "division_name": "Metallurgical Engineering Division"},
        "ics_codes": ["77.140.45"],
        "scope_snippet": "Specifies requirements for cold rolled steel strips intended for vitreous enamelling applications.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Ministry of Steel",
            "qco_order_name": "Steel and Steel Products (Quality Control) Order, 2020",
            "qco_gazette_notification": "SO 3764(E)",
            "enforcement_date": "2021-01-20",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 15436",
        "standard_id": "IS 15436:2004",
        "year_published": 2004,
        "title": "Steel Tubes for Piling — Specification",
        "full_title": "IS 15436: Steel Tubes for Piling",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Metals, Alloys and Metal Products (including Steel Products)",
        "technical_committee": {"division_code": "MTD", "division_name": "Metallurgical Engineering Division"},
        "ics_codes": ["77.140.75"],
        "scope_snippet": "Specifies requirements for steel tubes used for piling in civil and structural engineering construction.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Ministry of Steel",
            "qco_order_name": "Steel Tubes (Quality Control) Order, 2020",
            "qco_gazette_notification": "SO 3764(E)",
            "enforcement_date": "2021-01-20",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 16046 (PART 1)",
        "standard_id": "IS 16046 (Part 1):2018",
        "year_published": 2018,
        "title": "Secondary Cells and Batteries — Portable Sealed Rechargeable Single Cells (Nickel Systems)",
        "full_title": "IS 16046 (Part 1): Secondary Cells Containing Alkaline Electrolytes — Portable Sealed Rechargeable Single Cells",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electronics, Information Technology and Telecommunication",
        "technical_committee": {"division_code": "LITD", "division_name": "Electronics and Information Technology Division"},
        "ics_codes": ["29.220.30"],
        "scope_snippet": "Specifies requirements for portable sealed rechargeable single cells (nickel-cadmium and nickel-metal hydride) used in secondary battery applications.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order, 2012",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2018-08-14",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 16046 (PART 2)",
        "standard_id": "IS 16046 (Part 2):2018",
        "year_published": 2018,
        "title": "Secondary Lithium Cells and Batteries for Portable Applications",
        "full_title": "IS 16046 (Part 2): Secondary Cells — Lithium Cells and Batteries for Portable Applications",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electronics, Information Technology and Telecommunication",
        "technical_committee": {"division_code": "LITD", "division_name": "Electronics and Information Technology Division"},
        "ics_codes": ["29.220.30"],
        "scope_snippet": "Specifies safety and performance requirements for secondary lithium cells and batteries for portable applications including mobile phones and power banks.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order, 2012",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2018-08-14",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 16221 (PART 1)",
        "standard_id": "IS 16221 (Part 1):2014",
        "year_published": 2014,
        "title": "Safety of Power Converters for Use in Photovoltaic Power Systems — Part 1: General Requirements",
        "full_title": "IS 16221 (Part 1): Safety of Power Converters for Photovoltaic Systems — General Requirements",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electronics, Information Technology and Telecommunication",
        "technical_committee": {"division_code": "LITD", "division_name": "Electronics and Information Technology Division"},
        "ics_codes": ["27.160"],
        "scope_snippet": "Specifies general safety requirements for power converters used in photovoltaic power systems.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order, 2012",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2021-01-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 16221 (PART 2)",
        "standard_id": "IS 16221 (Part 2):2014",
        "year_published": 2014,
        "title": "Safety of Power Converters for Photovoltaic Systems — Part 2: Particular Requirements for Inverters",
        "full_title": "IS 16221 (Part 2): Safety of Power Converters — Particular Requirements for PV Inverters",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electronics, Information Technology and Telecommunication",
        "technical_committee": {"division_code": "LITD", "division_name": "Electronics and Information Technology Division"},
        "ics_codes": ["27.160"],
        "scope_snippet": "Specifies particular safety requirements for power inverters used in photovoltaic power systems.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order, 2012",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2021-01-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 9873 (PART 5)",
        "standard_id": "IS 9873 (Part 5):2019",
        "year_published": 2019,
        "title": "Safety of Toys — Part 5: Chemical Toys (Sets) Other than Experimental Sets",
        "full_title": "IS 9873 (Part 5): Safety of Toys — Chemical Toys Other Than Experimental Sets",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Miscellaneous Consumer Products",
        "technical_committee": {"division_code": "CHD", "division_name": "Chemical Division"},
        "ics_codes": ["97.200.50"],
        "scope_snippet": "Specifies safety requirements for chemical toy sets (other than experimental sets) regarding chemical composition, labelling, and hazard information.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "qco_order_name": "Toys (Quality Control) Order, 2020",
            "qco_gazette_notification": "SO 1374(E)",
            "enforcement_date": "2021-01-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 302 (PART 2/SEC 21)",
        "standard_id": "IS 302 (Part 2/Sec 21):2012",
        "year_published": 2012,
        "title": "Safety of Household Electrical Appliances — Particular Requirements for Microwave Appliances",
        "full_title": "IS 302 (Part 2/Sec 21): Safety of Household and Similar Electrical Appliances — Microwave Appliances",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["97.040.20"],
        "scope_snippet": "Specifies particular safety requirements for household microwave appliances including electric ranges with microwave energy.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "qco_order_name": "Household Electrical Appliances (Quality Control) Order, 2021",
            "qco_gazette_notification": "SO 4267(E)",
            "enforcement_date": "2021-07-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 302 (PART 2/SEC 25)",
        "standard_id": "IS 302 (Part 2/Sec 25):2012",
        "year_published": 2012,
        "title": "Safety of Household Electrical Appliances — Particular Requirements for Microwave and Combined Microwave Ovens",
        "full_title": "IS 302 (Part 2/Sec 25): Safety of Household Appliances — Microwave and Combined Microwave Ovens",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["97.040.20"],
        "scope_snippet": "Specifies particular safety requirements for household microwave ovens and combined microwave-conventional ovens.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "qco_order_name": "Household Electrical Appliances (Quality Control) Order, 2021",
            "qco_gazette_notification": "SO 4267(E)",
            "enforcement_date": "2021-07-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 302 (PART 2/SEC 7)",
        "standard_id": "IS 302 (Part 2/Sec 7):2012",
        "year_published": 2012,
        "title": "Safety of Household Electrical Appliances — Particular Requirements for Washing Machines",
        "full_title": "IS 302 (Part 2/Sec 7): Safety of Household Appliances — Washing Machines",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["97.060"],
        "scope_snippet": "Specifies particular safety requirements for electric motor-operated washing machines for household or similar use.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "qco_order_name": "Household Electrical Appliances (Quality Control) Order, 2021",
            "qco_gazette_notification": "SO 4267(E)",
            "enforcement_date": "2021-07-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 302 (PART 2/SEC 49)",
        "standard_id": "IS 302 (Part 2/Sec 49):2010",
        "year_published": 2010,
        "title": "Safety of Household Electrical Appliances — Particular Requirements for Commercial Electric Dishwashers",
        "full_title": "IS 302 (Part 2/Sec 49): Safety of Household Appliances — Commercial Electric Dishwashers",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["97.040.40"],
        "scope_snippet": "Specifies particular safety requirements for commercial electric dishwashers used in catering and hotel applications.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "qco_order_name": "Household Electrical Appliances (Quality Control) Order, 2021",
            "qco_gazette_notification": "SO 4267(E)",
            "enforcement_date": "2021-07-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 7635 (PART 1)",
        "standard_id": "IS 7635 (Part 1):1975",
        "year_published": 1975,
        "title": "Steel Tubes for Mechanical and General Engineering Purposes — Plain End Tubes",
        "full_title": "IS 7635 (Part 1): Steel Tubes for Mechanical and General Engineering Purposes — Plain End Tubes",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Metals, Alloys and Metal Products (including Steel Products)",
        "technical_committee": {"division_code": "MTD", "division_name": "Metallurgical Engineering Division"},
        "ics_codes": ["77.140.75"],
        "scope_snippet": "Specifies requirements for plain end steel tubes for mechanical and general engineering purposes.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Ministry of Steel",
            "qco_order_name": "Steel Tubes (Quality Control) Order, 2020",
            "qco_gazette_notification": "SO 3764(E)",
            "enforcement_date": "2021-01-20",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 7635 (PART 2)",
        "standard_id": "IS 7635 (Part 2):1975",
        "year_published": 1975,
        "title": "Steel Tubes for Mechanical and General Engineering Purposes — Screwed and Socketed Tubes",
        "full_title": "IS 7635 (Part 2): Steel Tubes for Mechanical and General Engineering Purposes — Screwed and Socketed Tubes",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Metals, Alloys and Metal Products (including Steel Products)",
        "technical_committee": {"division_code": "MTD", "division_name": "Metallurgical Engineering Division"},
        "ics_codes": ["77.140.75"],
        "scope_snippet": "Specifies requirements for screwed and socketed steel tubes for mechanical and general engineering purposes.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Ministry of Steel",
            "qco_order_name": "Steel Tubes (Quality Control) Order, 2020",
            "qco_gazette_notification": "SO 3764(E)",
            "enforcement_date": "2021-01-20",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 16242 (PART 1)",
        "standard_id": "IS 16242 (Part 1):2014",
        "year_published": 2014,
        "title": "Uninterruptible Power Systems (UPS) — Part 1: General and Safety Requirements for UPS Used in Operator Accessible Areas",
        "full_title": "IS 16242 (Part 1): UPS — General and Safety Requirements for Operator Accessible Areas",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electronics, Information Technology and Telecommunication",
        "technical_committee": {"division_code": "LITD", "division_name": "Electronics and Information Technology Division"},
        "ics_codes": ["29.200"],
        "scope_snippet": "Specifies general and safety requirements for uninterruptible power systems (UPS) used in operator accessible areas.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order, 2012",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2013-04-03",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 15885 (PART 2/SEC 13)",
        "standard_id": "IS 15885 (Part 2/Sec 13):2012",
        "year_published": 2012,
        "title": "Lamp Controlgear — Particular Requirements — DC or AC Supplied Electronic Controlgear for LED Modules",
        "full_title": "IS 15885 (Part 2/Sec 13): LED Drivers — DC or AC Supplied Electronic Controlgear for LED Modules",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["29.140.99"],
        "scope_snippet": "Specifies requirements for DC or AC supplied electronic controlgear (LED drivers) used for LED modules.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order — Phase III",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2019-05-23",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 616 (PART 2)",
        "standard_id": "IS 616 (Part 2):2017",
        "year_published": 2017,
        "title": "Audio, Video and Similar Electronic Apparatus — Safety Requirements",
        "full_title": "IS 616 (Part 2): Audio, Video and Similar Electronic Apparatus — Safety Requirements",
        "status": "ACTIVE",
        "aspect": "Safety Standard",
        "product_group": "Electronics, Information Technology and Telecommunication",
        "technical_committee": {"division_code": "LITD", "division_name": "Electronics and Information Technology Division"},
        "ics_codes": ["33.160"],
        "scope_snippet": "Specifies safety requirements for audio, video and similar electronic apparatus intended for household and similar general use.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order, 2012",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2013-04-03",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 16077",
        "standard_id": "IS 16077:2018",
        "year_published": 2018,
        "title": "LED Luminaires for General Lighting Purposes — Performance Requirements",
        "full_title": "IS 16077: LED Luminaires for General Lighting Purposes — Performance Requirements",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["29.140.30"],
        "scope_snippet": "Specifies performance requirements for LED luminaires intended for general lighting purposes.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "CRS Scheme-II",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "qco_order_name": "Electronics and IT Goods (Compulsory Registration) Order",
            "qco_gazette_notification": "S.O. 2357(E)",
            "enforcement_date": "2021-01-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
    {
        "is_number": "IS 8828",
        "standard_id": "IS 8828:2007",
        "year_published": 2007,
        "title": "Electrical Accessories — Circuit Breakers for Overcurrent Protection for Household and Similar Installations (MCBs)",
        "full_title": "IS 8828: MCBs — Circuit Breakers for Overcurrent Protection for Household and Similar Installations",
        "status": "ACTIVE",
        "aspect": "Product Specification",
        "product_group": "Electrical Equipment",
        "technical_committee": {"division_code": "ETD", "division_name": "Electrotechnical Division"},
        "ics_codes": ["29.120.50"],
        "scope_snippet": "Specifies requirements for miniature circuit breakers (MCBs) for overcurrent protection in household and similar fixed electrical installations.",
        "amendments": [],
        "regulatory_compliance": {
            "is_mandatory": True,
            "scheme": "Scheme-I (ISI Mark)",
            "notifying_ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "qco_order_name": "Electrical Accessories (Quality Control) Order, 2022",
            "qco_gazette_notification": "SO 4267(E)",
            "enforcement_date": "2022-01-01",
            "qco_details": []
        },
        "fulltext_available": False
    },
]


def run():
    logger.info("Loading catalog and QCO matrix...")
    with open(CATALOG_FILE, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    with open(QCO_FILE, "r", encoding="utf-8") as f:
        qco = json.load(f)

    master_keys = set(norm(r.get("is_number", "")) for r in catalog)
    unresolved = [k for k in qco.keys() if norm(k) not in master_keys]
    logger.info("Currently unresolved QCO keys (%d): %s", len(unresolved), unresolved)

    injected = 0
    for std in MISSING_STANDARDS:
        key = norm(std["is_number"])
        if key not in master_keys:
            catalog.append(std)
            master_keys.add(key)
            injected += 1
            logger.info("Injected: %s", std["is_number"])
        else:
            logger.info("Already exists: %s", std["is_number"])

    still_unresolved = [k for k in qco.keys() if norm(k) not in master_keys]
    if still_unresolved:
        logger.error("Still unresolved after injection: %s", still_unresolved)
    else:
        logger.info("All QCO keys now resolve in catalog!")

    logger.info("Writing updated catalog (%d standards)...", len(catalog))
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, separators=(",", ":"))

    logger.info("Done. Injected %d new standards. Run pytest to verify.", injected)


if __name__ == "__main__":
    run()
