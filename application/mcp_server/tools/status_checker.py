import re
from typing import Dict, Any

TOOL_CHECK_STATUS = {
    "name": "check_standard_status",
    "description": "Returns the current status (ACTIVE, WITHDRAWN, UNDER_REVISION) of a specific Indian Standard (IS) number, including latest amendment, year, and mandatory BIS certification / QCO requirements.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "is_number": {
                "type": "string",
                "description": "The IS standard number, e.g. 'IS 269:2015' or 'IS 1786:2008' or 'IS 8112:1989'"
            }
        },
        "required": ["is_number"]
    }
}

STANDARDS_CATALOG: Dict[str, Dict[str, Any]] = {
    "IS 269:2015": {
        "is_number": "IS 269:2015",
        "title": "Ordinary Portland Cement — Specification",
        "status": "ACTIVE",
        "year_published": 2015,
        "amendment": "Amendment 1 (2019)",
        "certification": {
            "mandatory": True,
            "scheme": "BIS_ISI_MARK",
            "qco_order_name": "Cement (Quality Control) Order 2003",
            "gazette_ref": "GSR 739(E)",
            "notifying_ministry": "Ministry of Commerce and Industry"
        },
        "replacement_for": ["IS 8112:1989", "IS 12269:1987", "IS 269:1989"],
        "scope": "Specifies requirements for OPC in grades 33, 43 and 53 for structural concrete works."
    },
    "IS 8112:1989": {
        "is_number": "IS 8112:1989",
        "title": "43 Grade Ordinary Portland Cement — Specification (WITHDRAWN)",
        "status": "WITHDRAWN",
        "year_published": 1989,
        "amendment": "Withdrawn in 2015",
        "certification": {"mandatory": False, "scheme": None, "qco_order_name": None},
        "replaced_by": "IS 269:2015",
        "scope": "Legacy 43 grade OPC standard. Consolidated into unified IS 269:2015."
    },
    "IS 1489 (PART 1):2015": {
        "is_number": "IS 1489 (Part 1):2015",
        "title": "Portland Pozzolana Cement — Specification (Part 1: Fly Ash Based)",
        "status": "ACTIVE",
        "year_published": 2015,
        "amendment": "Amendment 2 (2020)",
        "certification": {
            "mandatory": True,
            "scheme": "BIS_ISI_MARK",
            "qco_order_name": "Cement (Quality Control) Order 2003"
        },
        "replacement_for": [],
        "scope": "Covers fly-ash based PPC for mass concrete, plastering, and general construction."
    },
    "IS 1786:2008": {
        "is_number": "IS 1786:2008",
        "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
        "status": "ACTIVE",
        "year_published": 2008,
        "amendment": "Amendment 3 (2021)",
        "certification": {
            "mandatory": True,
            "scheme": "BIS_ISI_MARK",
            "qco_order_name": "Steel and Steel Products (Quality Control) Order 2020",
            "gazette_ref": "S.O. 1678(E)",
            "notifying_ministry": "Ministry of Steel"
        },
        "replacement_for": [],
        "scope": "Covers physical and mechanical requirements of TMT steel rebar (Fe 415, Fe 500, Fe 550, Fe 600)."
    },
    "IS 2062:2011": {
        "is_number": "IS 2062:2011",
        "title": "Hot Rolled Medium and High Tensile Structural Steel — Specification",
        "status": "ACTIVE",
        "year_published": 2011,
        "amendment": "Amendment 3 (2021)",
        "certification": {
            "mandatory": True,
            "scheme": "BIS_ISI_MARK",
            "qco_order_name": "Steel and Steel Products (Quality Control) Order 2020"
        },
        "replacement_for": ["IS 226:1975", "IS 2062:2006"],
        "scope": "Structural steel plates, sections and bars for welded bridges and heavy engineering structures."
    },
    "IS 226:1975": {
        "is_number": "IS 226:1975",
        "title": "Structural Steel (Standard Quality) — Specification (WITHDRAWN)",
        "status": "WITHDRAWN",
        "year_published": 1975,
        "amendment": "Withdrawn in 2006",
        "certification": {"mandatory": False, "scheme": None, "qco_order_name": None},
        "replaced_by": "IS 2062:2011",
        "scope": "Legacy mild steel specification. Merged into IS 2062."
    },
    "IS 456:2000": {
        "is_number": "IS 456:2000",
        "title": "Plain and Reinforced Concrete — Code of Practice",
        "status": "ACTIVE",
        "year_published": 2000,
        "amendment": "Amendment 4 (2019)",
        "certification": {"mandatory": False, "scheme": "VOLUNTARY", "qco_order_name": None},
        "replacement_for": [],
        "scope": "National code of practice for design and execution of plain and reinforced concrete structures."
    },
    "IS 800:2007": {
        "is_number": "IS 800:2007",
        "title": "General Construction in Steel — Code of Practice",
        "status": "ACTIVE",
        "year_published": 2007,
        "amendment": "Amendment 1 (2012)",
        "certification": {"mandatory": False, "scheme": "VOLUNTARY", "qco_order_name": None},
        "replacement_for": ["IS 800:1984"],
        "scope": "National code for general construction in steel using Limit State Design method."
    },
    "IS 13252 (PART 1):2010": {
        "is_number": "IS 13252 (Part 1):2010",
        "title": "Information Technology Equipment — Safety — General Requirements",
        "status": "ACTIVE",
        "year_published": 2010,
        "amendment": "Amendment 2 (2016)",
        "certification": {
            "mandatory": True,
            "scheme": "BIS_CRS",
            "qco_order_name": "Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order",
            "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)"
        },
        "replacement_for": [],
        "scope": "Safety requirements for IT hardware, CCTV surveillance, and computing peripherals."
    },
    "IS 17800:2022": {
        "is_number": "IS 17800:2022",
        "title": "Terrestrial Photovoltaic (PV) Modules — Design Qualification and Type Approval",
        "status": "ACTIVE",
        "year_published": 2022,
        "amendment": "Base Issue",
        "certification": {
            "mandatory": True,
            "scheme": "BIS_ISI_MARK",
            "qco_order_name": "Solar Photovoltaics, Systems, Devices and Components Goods (Requirements for Compulsory Registration) Order 2024",
            "notifying_ministry": "Ministry of New and Renewable Energy (MoNRE)"
        },
        "replacement_for": [],
        "scope": "Mandatory design qualification and safety approval for solar PV power plant modules."
    },
}

def check_standard_status(is_number: str) -> Dict[str, Any]:
    """
    Looks up a standard in the canonical catalog and returns its current legal and statutory status.
    """
    raw = is_number.strip().upper()
    norm = re.sub(r'[^A-Z0-9]', '', raw)

    # Exact match
    if raw in STANDARDS_CATALOG:
        return STANDARDS_CATALOG[raw]

    # Normalized match
    for key, val in STANDARDS_CATALOG.items():
        if re.sub(r'[^A-Z0-9]', '', key) == norm:
            return val

    # Prefix match
    for key, val in STANDARDS_CATALOG.items():
        if norm in re.sub(r'[^A-Z0-9]', '', key) or re.sub(r'[^A-Z0-9]', '', key) in norm:
            return val

    return {
        "is_number": is_number,
        "status": "UNKNOWN",
        "message": f"Standard '{is_number}' is not cataloged in the local high-priority repository. Verify directly on BIS Manakonline."
    }
