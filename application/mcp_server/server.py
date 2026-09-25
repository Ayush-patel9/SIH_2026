#!/usr/bin/env python3
"""
Feature #9: Standalone FastMCP Server for Indian Standards Procurement AI Agent
Exposes standardized Model Context Protocol (MCP) tools for LLM agent integration:
- recommend_standards(product_query)
- check_qco_mandate(is_number)
- get_allied_standards(is_number)
- find_testing_labs(is_number, state)
- verify_isi_licensee(is_number, manufacturer_name)
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional

# Base data directory lookup
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "pipeline" / "data" if (BASE_DIR / "pipeline" / "data").exists() else BASE_DIR / "data"

CATALOG_PATH = DATA_DIR / "01_master_catalog" / "unified_standards.json"
QCO_PATH = DATA_DIR / "03_regulatory_qco" / "qco_mapping_matrix.json"
LABS_PATH = DATA_DIR / "04_conformity_ecosystem" / "lims_lab_registry.json"
LICENSEE_PATH = DATA_DIR / "04_conformity_ecosystem" / "manak_licensee_registry.json"
GRAPH_PATH = DATA_DIR / "02_fulltext_corpus" / "clause2_normative_graph" / "normative_edges.json"

def _load_json(path: Path) -> Any:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def _norm_key(s: str) -> str:
    return re.sub(r'[^A-Z0-9]', '', str(s).upper())

# Try importing FastMCP, or provide fallback handler
try:
    from mcp.server.fastmcp import FastMCP
    mcp = FastMCP("ManakAI-Indian-Standards-Engine")
except ImportError:
    mcp = None

class StandardsEngineTools:
    def __init__(self):
        self.catalog = _load_json(CATALOG_PATH)
        self.qco_matrix = _load_json(QCO_PATH)
        self.labs_registry = _load_json(LABS_PATH)
        self.licensees = _load_json(LICENSEE_PATH)
        self.graph_edges = _load_json(GRAPH_PATH)

    def recommend_standards(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Recommends the most relevant Indian Standards based on semantic query / product description.
        """
        query_words = set(re.findall(r'\w+', query.lower()))
        results = []

        for std in self.catalog:
            title = std.get("title", "").lower()
            is_num = std.get("is_number", "").lower()
            aspect = std.get("aspect", "").lower()
            
            score = 0
            # Keyword overlap
            for w in query_words:
                if len(w) > 2:
                    if w in is_num: score += 5.0
                    if w in title: score += 2.0
                    if w in aspect: score += 0.5
            
            # Boost mandatory standards
            if std.get("regulatory_compliance", {}).get("is_mandatory"):
                score += 0.5

            if score > 0:
                results.append((score, std))

        results.sort(key=lambda x: x[0], reverse=True)
        top = results[:top_k]

        return [
            {
                "is_number": s.get("is_number"),
                "standard_id": s.get("standard_id"),
                "title": s.get("title"),
                "status": s.get("status"),
                "is_mandatory": s.get("regulatory_compliance", {}).get("is_mandatory", False),
                "qco_order": s.get("regulatory_compliance", {}).get("qco_order_name"),
                "ics_codes": s.get("ics_codes", []),
                "relevance_score": round(score / 10.0, 3)
            }
            for score, s in top
        ]

    def check_qco_mandate(self, is_number: str) -> Dict[str, Any]:
        """
        Checks if an Indian Standard is covered under a mandatory Quality Control Order (QCO).
        """
        norm = _norm_key(is_number)
        for key, qco_list in self.qco_matrix.items():
            if _norm_key(key) == norm:
                item = qco_list[0] if isinstance(qco_list, list) else qco_list
                return {
                    "is_number": key,
                    "is_mandatory": True,
                    "product_name": item.get("product"),
                    "notifying_ministry": item.get("ministry"),
                    "scheme": item.get("scheme", "SCHEME_I_ISI_MARK"),
                    "gazette_notification": item.get("gazette"),
                    "legal_requirement": "100% compulsory BIS certification mark before commercial sale or procurement."
                }

        # Check in catalog
        for std in self.catalog:
            if _norm_key(std.get("is_number", "")) == norm:
                reg = std.get("regulatory_compliance", {})
                if reg.get("is_mandatory"):
                    return {
                        "is_number": std.get("is_number"),
                        "is_mandatory": True,
                        "product_name": std.get("title"),
                        "notifying_ministry": reg.get("notifying_ministry"),
                        "scheme": reg.get("scheme"),
                        "gazette_notification": reg.get("qco_gazette_notification"),
                        "legal_requirement": "Compulsory BIS certification under relevant ministry QCO."
                    }

        return {
            "is_number": is_number,
            "is_mandatory": False,
            "message": "Standard is currently voluntary unless specified in the tender document."
        }

    def get_allied_standards(self, is_number: str) -> List[Dict[str, Any]]:
        """
        Retrieves normative references, test methods, and allied codes for a given standard.
        """
        norm = _norm_key(is_number)
        allied = []
        for edge in self.graph_edges:
            if _norm_key(edge.get("source", "")) == norm:
                allied.append({
                    "target_standard": edge.get("target"),
                    "target_title": edge.get("target_title"),
                    "relation_type": edge.get("relation_type")
                })
        return allied[:15]

    def find_testing_labs(self, is_number: str, state: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Finds BIS-recognized and NABL-accredited testing laboratories capable of testing against standard.
        """
        norm = _norm_key(is_number)
        idx = self.labs_registry.get("is_to_lab_index", {})
        matched_labs = []
        
        for k, labs in idx.items():
            if _norm_key(k) == norm:
                for lab in labs:
                    if not state or state.lower() in lab.get("state", "").lower():
                        matched_labs.append(lab)

        if not matched_labs:
            # Fallback to general NABL labs
            all_labs = self.labs_registry.get("labs", [])
            for lab in all_labs:
                if not state or state.lower() in lab.get("state", "").lower():
                    matched_labs.append({
                        "name": lab.get("name"),
                        "state": lab.get("state"),
                        "nabl_code": lab.get("nabl_code"),
                        "scope": lab.get("scope")
                    })

        return matched_labs[:10]

    def verify_isi_licensee(self, is_number: str, manufacturer_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Verifies whether a manufacturer holds an operative BIS ISI / CRS license for a given standard.
        """
        norm = _norm_key(is_number)
        licensee_map = self.licensees.get("licensees_by_standard", {})
        matched = []

        for std_key, lic_list in licensee_map.items():
            if _norm_key(std_key) == norm:
                for lic in lic_list:
                    if not manufacturer_name or manufacturer_name.lower() in lic.get("manufacturer_name", "").lower():
                        matched.append(lic)

        return matched

tools = StandardsEngineTools()

if mcp:
    @mcp.tool()
    def recommend_standards(query: str, top_k: int = 5) -> str:
        """Recommend Indian Standards for product descriptions or technical tender specifications."""
        return json.dumps(tools.recommend_standards(query, top_k), indent=2)

    @mcp.tool()
    def check_qco_mandate(is_number: str) -> str:
        """Check mandatory Quality Control Order (QCO) certification requirements for an Indian Standard."""
        return json.dumps(tools.check_qco_mandate(is_number), indent=2)

    @mcp.tool()
    def get_allied_standards(is_number: str) -> str:
        """Get allied standards, normative references, and test methods for an Indian Standard."""
        return json.dumps(tools.get_allied_standards(is_number), indent=2)

    @mcp.tool()
    def find_testing_labs(is_number: str, state: Optional[str] = None) -> str:
        """Find BIS recognized and NABL accredited testing laboratories for an Indian Standard."""
        return json.dumps(tools.find_testing_labs(is_number, state), indent=2)

    @mcp.tool()
    def verify_isi_licensee(is_number: str, manufacturer_name: Optional[str] = None) -> str:
        """Verify certified manufacturers and active BIS licenses for an Indian Standard."""
        return json.dumps(tools.verify_isi_licensee(is_number, manufacturer_name), indent=2)


def main():
    print("ManakAI Standalone FastMCP Server initialized.")
    print("Available tools: recommend_standards, check_qco_mandate, get_allied_standards, find_testing_labs, verify_isi_licensee")
    
    # Test tool execution
    sample_recs = tools.recommend_standards("TMT steel bars for reinforcement", top_k=2)
    print("\nSample Recommendation test:")
    print(json.dumps(sample_recs, indent=2))
    
    qco_res = tools.check_qco_mandate("IS 1786")
    print("\nSample QCO test:")
    print(json.dumps(qco_res, indent=2))

    if mcp and "--run" in sys.argv:
        mcp.run()

if __name__ == "__main__":
    main()
