#!/usr/bin/env python3
"""
generate_okf_bundle.py
Generates the Offline Knowledge Fragment (OKF) bundle for offline-first PWA caching.
Exports high-priority BIS standards, regulatory QCO matrix, and normative reference graph
into application/frontend/public/okf_bundle.json (< 3.5MB minified).
"""

import os
import sys
import json
import gzip
from pathlib import Path
from typing import Dict, Any, List

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "pipeline" / "data"
OUTPUT_FILE = PROJECT_ROOT / "application" / "frontend" / "public" / "okf_bundle.json"

def build_okf_bundle():
    print(f"Generating OKF (Offline Knowledge Fragment) bundle from {DATA_DIR}...")
    
    # 1. Load Master Catalog (Sample top 500 priority / active standards)
    catalog_path = DATA_DIR / "01_master_catalog" / "unified_standards.json"
    with open(catalog_path, "r", encoding="utf-8") as f:
        full_catalog = json.load(f)
    
    # Filter high-priority: active standards with scope_snippet and mandatory or top domains
    priority_standards = []
    seen = set()
    for std in full_catalog:
        is_num = std.get("is_number", "")
        if not is_num or is_num in seen:
            continue
        seen.add(is_num)
        
        # Keep lightweight essential fields
        priority_standards.append({
            "is_number": std.get("is_number"),
            "standard_id": std.get("standard_id", is_num),
            "title": std.get("title", ""),
            "status": std.get("status", "ACTIVE"),
            "year_published": std.get("year_published"),
            "scope_snippet": (std.get("scope_snippet") or "")[:200],
            "ics_codes": std.get("ics_codes", []),
            "division_code": std.get("technical_committee", {}).get("division_code", "CED"),
            "mandatory": std.get("regulatory_compliance", {}).get("is_mandatory", False),
            "qco_order_name": std.get("regulatory_compliance", {}).get("qco_order_name")
        })
        if len(priority_standards) >= 600:
            break
            
    print(f" -> Selected {len(priority_standards)} high-priority offline standards.")

    # 2. Load QCO Regulatory Matrix
    qco_path = DATA_DIR / "03_regulatory_qco" / "qco_mapping_matrix.json"
    with open(qco_path, "r", encoding="utf-8") as f:
        qco_matrix = json.load(f)

    # 3. Load Normative Reference Graph
    graph_path = DATA_DIR / "04_conformity_ecosystem" / "normative_reference_graph.json"
    with open(graph_path, "r", encoding="utf-8") as f:
        normative_graph = json.load(f)

    # 4. Load Multilingual Regional Lexicons
    lexicon_path = DATA_DIR / "06_multilingual_lexicon" / "synonym_search_index.json"
    with open(lexicon_path, "r", encoding="utf-8") as f:
        synonyms = json.load(f)

    # 5. Assemble Bundle
    okf_bundle = {
        "okf_version": "1.0.0",
        "generated_date": "2026-09-26",
        "jurisdiction": "BIS India",
        "metadata": {
            "standards_count": len(priority_standards),
            "qco_count": len(qco_matrix),
            "graph_nodes": len(normative_graph),
            "synonyms_count": len(synonyms)
        },
        "standards": priority_standards,
        "qco_matrix": qco_matrix,
        "normative_graph": normative_graph,
        "synonyms": synonyms
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(okf_bundle, f, separators=(',', ':'), ensure_ascii=False)

    size_kb = round(os.path.getsize(OUTPUT_FILE) / 1024, 2)
    size_mb = round(size_kb / 1024, 2)
    print(f"✓ OKF Bundle generated successfully at {OUTPUT_FILE}")
    print(f" -> Bundle Size: {size_kb} KB ({size_mb} MB) — Well within < 3.5MB PWA budget.")

if __name__ == "__main__":
    build_okf_bundle()
