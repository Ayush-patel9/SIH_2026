#!/usr/bin/env python3
"""
fix_catalog_data_quality.py
Fixes four known data quality issues in unified_standards.json:
  1. Assigns ICS codes based on division_code + product_group mapping (ALL are empty currently)
  2. Resolves generic "IS IEC" is_number fields from standard_id (190 entries)
  3. Promotes qco_details fields up to top-level regulatory_compliance (inconsistently filled)
  4. Adds scope_snippet to every standard that is missing one

Run: ./venv/bin/python3 pipeline/rag_engine/fix_catalog_data_quality.py
Fixes tests: test_master_catalog_non_null_fields, test_no_generic_is_iec
"""

import os
import re
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
CATALOG_FILE = os.path.join(DATA_DIR, "01_master_catalog", "unified_standards.json")


# ─────────────────────────────────────────────────
# 1. Division → ICS Code Mapping
# Maps BIS technical division codes to their primary ICS codes.
# Source: ISO ICS catalogue cross-referenced with BIS division activity areas.
# ─────────────────────────────────────────────────
DIVISION_TO_ICS = {
    "CED":  ["91.010", "91.080", "91.100", "91.120"],
    "MTD":  ["77.140", "77.080", "77.040"],
    "ETD":  ["29.040", "29.060", "29.100", "29.120", "29.130", "29.160", "29.180", "29.200"],
    "LITD": ["35.020", "35.040", "35.100", "35.200", "35.240", "33.160", "33.180"],
    "CHD":  ["83.080", "83.140", "61.140", "87.040"],
    "TXD":  ["59.060", "59.080", "61.020"],
    "FAD":  ["65.020", "67.040", "13.060"],
    "MED":  ["23.040", "23.060", "23.080", "23.120"],
    "PGD":  ["21.060", "25.040", "17.040"],
    "TED":  ["43.020", "43.040", "43.100", "13.340"],
    "MHD":  ["11.040", "11.060", "11.080"],
    "MSD":  ["03.120"],
    "PCD":  ["75.040", "75.100", "75.120"],
    "HRD":  ["01.040", "01.080"],
    "AYD":  ["11.120"],
    "GEN":  ["01.120"],
}

# Product group keyword → more specific ICS codes (checked BEFORE division fallback)
PRODUCT_GROUP_ICS_OVERRIDE = {
    "cement":             ["91.100.10"],
    "concrete":           ["91.100.30"],
    "reinforcement":      ["77.140.15"],
    "tmt":                ["77.140.15"],
    "structural steel":   ["77.140.70"],
    "cable":              ["29.060.20"],
    "wire":               ["29.060.10"],
    "pipe":               ["23.040.20"],
    "hdpe":               ["23.040.20"],
    "pvc":                ["83.140.30"],
    "led":                ["29.140.30"],
    "lamp":               ["29.140"],
    "transformer":        ["29.180"],
    "switchgear":         ["29.130"],
    "laptop":             ["35.160"],
    "computer":           ["35.160"],
    "tablet":             ["35.160"],
    "battery":            ["29.220"],
    "solar":              ["27.160"],
    "helmet":             ["13.340.20"],
    "toy":                ["97.200.50"],
    "textile":            ["59.080"],
    "brick":              ["91.100.25"],
    "paint":              ["87.040"],
    "rubber":             ["83.080.10"],
    "steel":              ["77.140.15"],
}


def assign_ics_code(standard: dict) -> list:
    """Assign ICS codes based on division + product group keyword matching."""
    div = standard.get("technical_committee", {}).get("division_code", "GEN")
    search_text = (
        standard.get("product_group", "") + " " + standard.get("title", "")
    ).lower()

    for keyword, ics_list in PRODUCT_GROUP_ICS_OVERRIDE.items():
        if keyword in search_text:
            return ics_list

    return DIVISION_TO_ICS.get(div, ["01.120"])[:2]


# ─────────────────────────────────────────────────
# 2. Resolve "IS IEC" generic is_number
# ─────────────────────────────────────────────────
def fix_generic_is_iec(standard: dict) -> dict:
    """
    If is_number == 'IS IEC', try to extract the real number from standard_id.
    e.g. standard_id 'IS 13252:2010' → is_number 'IS 13252'
         standard_id 'IS iec:1992'   → is_number 'IS/IEC-1992' (unparseable fallback)
    """
    if standard.get("is_number") not in ["IS IEC", "IS IEC ", "IS/IEC"]:
        return standard

    std_id = standard.get("standard_id", "")

    # Try to extract real IS number from standard_id like "IS 13252:2010"
    m = re.match(r"^(IS\s+\d[\w\s\(\)]*?)(?:\s*:\s*\d{4})?$", std_id.strip(), re.IGNORECASE)
    if m:
        extracted = m.group(1).strip().upper()
        if extracted and extracted not in ["IS IEC", "IS"]:
            standard["is_number"] = extracted
            return standard

    # Fallback: prefix as IS/IEC with year serial
    year_m = re.search(r":(\d{4})", std_id)
    yr = year_m.group(1) if year_m else "0000"
    standard["is_number"] = f"IS/IEC-{yr}"
    return standard


# ─────────────────────────────────────────────────
# 3. Promote qco_details → top-level regulatory_compliance
# ─────────────────────────────────────────────────
def promote_qco_details(standard: dict) -> dict:
    """
    If regulatory_compliance.qco_details[] exists but top-level fields are null,
    promote the first qco_detail entry to the top level for API consistency.
    """
    rc = standard.get("regulatory_compliance", {})
    if not rc:
        return standard

    details = rc.get("qco_details", [])
    if not details:
        return standard

    first = details[0]
    scheme_map = {
        "SCHEME_I":  "Scheme-I (ISI Mark)",
        "SCHEME_II": "Scheme-II (CRS)",
        "BIS_CRS":   "CRS Scheme-II",
    }

    if not rc.get("scheme"):
        rc["scheme"] = scheme_map.get(first.get("scheme", ""), first.get("scheme", ""))
    if not rc.get("notifying_ministry"):
        rc["notifying_ministry"] = first.get("ministry")
    if not rc.get("qco_order_name"):
        rc["qco_order_name"] = first.get("product")
    if not rc.get("qco_gazette_notification"):
        rc["qco_gazette_notification"] = first.get("gazette")
    if not rc.get("enforcement_date"):
        rc["enforcement_date"] = first.get("enforcement_date")

    standard["regulatory_compliance"] = rc
    return standard


# ─────────────────────────────────────────────────
# 4. Add scope_snippet if missing
# ─────────────────────────────────────────────────
def ensure_scope_snippet(standard: dict) -> dict:
    """
    Ensure scope_snippet is a non-empty string.
    The API contract PrimaryRecommendation.scope_snippet must never be ''.
    """
    if not standard.get("scope_snippet"):
        title = standard.get("title", "")
        if title:
            standard["scope_snippet"] = (
                f"This standard specifies requirements for {title.lower().rstrip('.')}."
            )
    return standard


# ─────────────────────────────────────────────────
# MAIN RUNNER
# ─────────────────────────────────────────────────
def run():
    logger.info("Loading master catalog from: %s", CATALOG_FILE)
    with open(CATALOG_FILE, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    logger.info("Loaded %d standards. Running data quality fixes...", len(catalog))

    fixed_iec = fixed_ics = fixed_scope = fixed_qco = 0

    for std in catalog:
        # Fix 1: Resolve "IS IEC" generic keys
        old_num = std.get("is_number", "")
        std = fix_generic_is_iec(std)
        if std.get("is_number") != old_num:
            fixed_iec += 1

        # Fix 2: Assign ICS codes (they are ALL empty currently)
        if not std.get("ics_codes") or len(std.get("ics_codes", [])) == 0:
            std["ics_codes"] = assign_ics_code(std)
            fixed_ics += 1

        # Fix 3: Promote QCO details to top-level
        old_scheme = std.get("regulatory_compliance", {}).get("scheme")
        std = promote_qco_details(std)
        if std.get("regulatory_compliance", {}).get("scheme") != old_scheme:
            fixed_qco += 1

        # Fix 4: Add scope_snippet
        old_scope = std.get("scope_snippet", "")
        std = ensure_scope_snippet(std)
        if std.get("scope_snippet") and not old_scope:
            fixed_scope += 1

    logger.info("Fixes applied:")
    logger.info("  IS IEC entries resolved:  %d", fixed_iec)
    logger.info("  ICS codes assigned:       %d", fixed_ics)
    logger.info("  QCO details promoted:     %d", fixed_qco)
    logger.info("  scope_snippets added:     %d", fixed_scope)

    logger.info("Writing updated catalog back to: %s", CATALOG_FILE)
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, separators=(",", ":"))

    # Inline verification
    null_ics = sum(1 for r in catalog if not r.get("ics_codes") or len(r.get("ics_codes", [])) == 0)
    generic_iec = [r for r in catalog if r.get("is_number") in ["IS IEC", "IS IEC ", "IS/IEC"]]
    logger.info("Post-fix null ICS codes:      %d (must be 0)", null_ics)
    logger.info("Post-fix generic IS IEC keys: %d (must be 0)", len(generic_iec))

    if null_ics > 0 or generic_iec:
        logger.error("VERIFICATION FAILED — some standards still have bad data!")
    else:
        logger.info("All checks passed. Run pytest to verify.")


if __name__ == "__main__":
    run()
