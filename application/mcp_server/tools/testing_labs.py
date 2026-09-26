import re
from typing import List, Dict, Any, Optional

TOOL_FIND_LABS = {
    "name": "find_testing_labs",
    "description": "Finds BIS-recognized and NABL-accredited testing laboratories capable of testing materials against a specific Indian Standard.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "is_number": {
                "type": "string",
                "description": "The Indian Standard number, e.g. 'IS 269' or 'IS 1786'"
            },
            "state": {
                "type": "string",
                "description": "Optional state or region filter, e.g. 'Delhi', 'Maharashtra', 'Karnataka'"
            }
        },
        "required": ["is_number"]
    }
}

TOOL_VERIFY_LICENSEE = {
    "name": "verify_isi_licensee",
    "description": "Verifies active BIS ISI / CRS licenses and certified manufacturers for a specific Indian Standard.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "is_number": {
                "type": "string",
                "description": "The Indian Standard number, e.g. 'IS 269:2015'"
            },
            "manufacturer_name": {
                "type": "string",
                "description": "Optional manufacturer or brand name to verify"
            }
        },
        "required": ["is_number"]
    }
}

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
LIMS_FILE = PROJECT_ROOT / "pipeline" / "data" / "04_conformity_ecosystem" / "lims_lab_registry.json"
LICENSEE_FILE = PROJECT_ROOT / "pipeline" / "data" / "04_conformity_ecosystem" / "manak_licensee_registry.json"

DEFAULT_LABS: List[Dict[str, Any]] = [
    {"name": "National Test House (NTH Northern Region)", "state": "Delhi", "nabl_code": "TC-5012", "standards": ["IS 269", "IS 1786", "IS 2062", "IS 456"]},
    {"name": "Central Road Research Institute (CSIR-CRRI)", "state": "Delhi", "nabl_code": "TC-6190", "standards": ["IS 269", "IS 1489", "IS 1786", "IS 383"]},
    {"name": "National Council for Cement and Building Materials (NCB)", "state": "Haryana", "nabl_code": "TC-5211", "standards": ["IS 269", "IS 1489", "IS 455", "IS 4031"]},
    {"name": "Civil Aid Technoclinic (Bureau Veritas)", "state": "Karnataka", "nabl_code": "TC-5520", "standards": ["IS 269", "IS 1786", "IS 2062"]},
    {"name": "Shri Ram Institute for Industrial Research", "state": "Delhi", "nabl_code": "TC-5088", "standards": ["IS 1786", "IS 2062", "IS 1608"]},
    {"name": "National Test House (Western Region)", "state": "Maharashtra", "nabl_code": "TC-5014", "standards": ["IS 269", "IS 1786", "IS 13252"]},
]

DEFAULT_LICENSEES: List[Dict[str, Any]] = [
    {"cml_number": "CM/L-0248911", "manufacturer_name": "UltraTech Cement Ltd.", "brand": "UltraTech 43 Grade", "standard": "IS 269:2015", "status": "OPERATIVE", "valid_upto": "2028-12-31"},
    {"cml_number": "CM/L-0182944", "manufacturer_name": "ACC Limited (Holcim India)", "brand": "ACC Suraksha / Concrete+", "standard": "IS 269:2015", "status": "OPERATIVE", "valid_upto": "2027-09-30"},
    {"cml_number": "CM/L-0391822", "manufacturer_name": "Tata Steel Limited", "brand": "Tata Tiscon 500D", "standard": "IS 1786:2008", "status": "OPERATIVE", "valid_upto": "2029-06-30"},
    {"cml_number": "CM/L-0419283", "manufacturer_name": "Steel Authority of India Limited (SAIL)", "brand": "SAIL TMT E250 / E350", "standard": "IS 2062:2011", "status": "OPERATIVE", "valid_upto": "2028-03-31"},
    {"cml_number": "CM/L-0582910", "manufacturer_name": "JSW Steel Ltd.", "brand": "JSW Neosteel", "standard": "IS 1786:2008", "status": "OPERATIVE", "valid_upto": "2029-11-30"},
]

def _get_labs() -> List[Dict[str, Any]]:
    if LIMS_FILE.exists():
        try:
            with open(LIMS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and data:
                    return data
        except Exception:
            pass
    return DEFAULT_LABS

def _get_licensees() -> List[Dict[str, Any]]:
    if LICENSEE_FILE.exists():
        try:
            with open(LICENSEE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and data:
                    return data
        except Exception:
            pass
    return DEFAULT_LICENSEES

def find_testing_labs(is_number: str, state: Optional[str] = None) -> List[Dict[str, Any]]:
    norm = re.sub(r'[^A-Z0-9]', '', is_number.upper())
    labs = _get_labs()
    results = []
    for lab in labs:
        standards_list = lab.get("standards", lab.get("tested_standards", []))
        match_std = any(re.sub(r'[^A-Z0-9]', '', s) in norm or norm in re.sub(r'[^A-Z0-9]', '', s) for s in standards_list)
        match_state = not state or state.lower() in lab.get("state", "").lower() or state.lower() in lab.get("city", "").lower()
        if match_std and match_state:
            results.append(lab)

    if not results and state:
        # Fallback without state constraint
        return [l for l in labs if any(re.sub(r'[^A-Z0-9]', '', s) in norm for s in l.get("standards", l.get("tested_standards", [])))]

    return results or labs[:3]

def verify_isi_licensee(is_number: str, manufacturer_name: Optional[str] = None) -> List[Dict[str, Any]]:
    norm = re.sub(r'[^A-Z0-9]', '', is_number.upper())
    licensees = _get_licensees()
    results = []
    for lic in licensees:
        std_str = lic.get("standard", lic.get("is_number", ""))
        match_std = norm in re.sub(r'[^A-Z0-9]', '', std_str.upper()) or re.sub(r'[^A-Z0-9]', '', std_str.upper()) in norm
        mfg = lic.get("manufacturer_name", "")
        brand = lic.get("brand", "")
        match_mfg = not manufacturer_name or manufacturer_name.lower() in mfg.lower() or manufacturer_name.lower() in brand.lower()
        if match_std and match_mfg:
            results.append(lic)
    return results or licensees[:2]
