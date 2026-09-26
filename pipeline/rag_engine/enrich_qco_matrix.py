#!/usr/bin/env python3
"""
enrich_qco_matrix.py
Enriches qco_mapping_matrix.json with key mandatory standards including:
- HDPE Pipes (IS 4984, IS 14333)
- Industrial Safety Helmets (IS 2925)
- LPG Cylinders (IS 3196 Part 1 & Part 2)
- Precast Paver Blocks (IS 15658)
- Geotextiles (IS 16391, IS 16392)
"""

import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"
QCO_FILE = DATA_DIR / "03_regulatory_qco" / "qco_mapping_matrix.json"
CATALOG_FILE = DATA_DIR / "01_master_catalog" / "unified_standards.json"

ADDITIONAL_QCO_ENTRIES = {
    "IS 4984": [
        {
            "product": "High Density Polyethylene (HDPE) Pipes for Water Supply",
            "ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 4635(E)",
            "gazette_date": "2023-10-23",
            "enforcement_date": "2024-04-23",
            "is_mandatory": True,
            "qco_order_name": "Pipes and Fittings (Quality Control) Order, 2023"
        }
    ],
    "IS 14333": [
        {
            "product": "High Density Polyethylene (HDPE) Pipes for Sewerage",
            "ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 4635(E)",
            "gazette_date": "2023-10-23",
            "enforcement_date": "2024-04-23",
            "is_mandatory": True,
            "qco_order_name": "Pipes and Fittings (Quality Control) Order, 2023"
        }
    ],
    "IS 2925": [
        {
            "product": "Industrial Safety Helmets",
            "ministry": "Ministry of Heavy Industries",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 4341(E)",
            "gazette_date": "2021-10-18",
            "enforcement_date": "2022-04-18",
            "is_mandatory": True,
            "qco_order_name": "Personal Protective Equipment (Quality Control) Order, 2021"
        }
    ],
    "IS 3196 (PART 1)": [
        {
            "product": "Welded Low Carbon Steel Cylinders Exceeding 5 Litre Water Capacity for Low Pressure Liquefiable Gases: Part 1 Cylinders for Liquefied Petroleum Gas (LPG)",
            "ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 3125(E)",
            "gazette_date": "2020-09-08",
            "enforcement_date": "2021-03-08",
            "is_mandatory": True,
            "qco_order_name": "Gas Cylinders (Quality Control) Order, 2020"
        }
    ],
    "IS 3196 (PART 2)": [
        {
            "product": "Welded Low Carbon Steel Cylinders for LPG - Part 2 Cylinders for Other Liquefiable Gases",
            "ministry": "Department for Promotion of Industry and Internal Trade (DPIIT)",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 3125(E)",
            "gazette_date": "2020-09-08",
            "enforcement_date": "2021-03-08",
            "is_mandatory": True,
            "qco_order_name": "Gas Cylinders (Quality Control) Order, 2020"
        }
    ],
    "IS 15658": [
        {
            "product": "Precast Concrete Blocks for Paving (Paver Blocks)",
            "ministry": "Ministry of Housing and Urban Affairs (MoHUA)",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 1290(E)",
            "gazette_date": "2024-03-15",
            "enforcement_date": "2024-09-15",
            "is_mandatory": True,
            "qco_order_name": "Precast Concrete Products (Quality Control) Order, 2024"
        }
    ],
    "IS 16391": [
        {
            "product": "Geosynthetics — Polymeric Geotextiles for Subgrade Stabilization in Pavements",
            "ministry": "Ministry of Textiles",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 1658(E)",
            "gazette_date": "2023-04-10",
            "enforcement_date": "2023-10-10",
            "is_mandatory": True,
            "qco_order_name": "Geotextiles (Quality Control) Order, 2023"
        }
    ],
    "IS 16392": [
        {
            "product": "Geosynthetics — Geotextiles for Subsurface Drainage and Filtration",
            "ministry": "Ministry of Textiles",
            "scheme": "SCHEME_I",
            "gazette": "S.O. 1658(E)",
            "gazette_date": "2023-04-10",
            "enforcement_date": "2023-10-10",
            "is_mandatory": True,
            "qco_order_name": "Geotextiles (Quality Control) Order, 2023"
        }
    ]
}


def run():
    logger.info("Loading QCO mapping matrix...")
    with open(QCO_FILE, "r", encoding="utf-8") as f:
        qco = json.load(f)

    for k, v in ADDITIONAL_QCO_ENTRIES.items():
        qco[k] = v

    logger.info("Saving updated QCO matrix with %d keys -> %s", len(qco), QCO_FILE)
    with open(QCO_FILE, "w", encoding="utf-8") as f:
        json.dump(qco, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    run()
