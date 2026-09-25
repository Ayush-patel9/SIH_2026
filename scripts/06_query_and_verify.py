import os
import sys
import json
import re
from typing import Dict, Any, List, Optional

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
MASTER_CATALOG_FILE = os.path.join(DATA_DIR, "01_master_catalog", "unified_standards.json")
QCO_MATRIX_FILE = os.path.join(DATA_DIR, "03_regulatory_qco", "qco_mapping_matrix.json")
NORMATIVE_GRAPH_FILE = os.path.join(DATA_DIR, "02_fulltext_corpus", "clause2_normative_graph", "normative_edges.json")
SYNONYM_INDEX_FILE = os.path.join(DATA_DIR, "06_multilingual_lexicon", "synonym_search_index.json")
PARSED_CLAUSES_DIR = os.path.join(DATA_DIR, "02_fulltext_corpus", "parsed_clauses")
GOLDEN_DIFF_FILE = os.path.join(DATA_DIR, "05_procurement_gold_corpus", "test_benchmark_diff", "golden_diff_evaluation_set.json")

class StandardsEngine:
    def __init__(self):
        print(" Loading Unified Standards Catalog...")
        with open(MASTER_CATALOG_FILE, "r", encoding="utf-8") as f:
            self.master_catalog: List[Dict[str, Any]] = json.load(f)
            
        with open(QCO_MATRIX_FILE, "r", encoding="utf-8") as f:
            self.qco_matrix: Dict[str, Dict[str, Any]] = json.load(f)
            
        self.normative_edges: List[Dict[str, Any]] = []
        if os.path.exists(NORMATIVE_GRAPH_FILE):
            with open(NORMATIVE_GRAPH_FILE, "r", encoding="utf-8") as f:
                self.normative_edges = json.load(f)
                
        self.synonyms: Dict[str, str] = {}
        if os.path.exists(SYNONYM_INDEX_FILE):
            with open(SYNONYM_INDEX_FILE, "r", encoding="utf-8") as f:
                self.synonyms = json.load(f)
                
        # Index master by normalized IS number
        self.by_is_number: Dict[str, Dict[str, Any]] = {}
        for r in self.master_catalog:
            key = r["is_number"].strip().upper()
            self.by_is_number[key] = r
            
        print(f" Loaded {len(self.master_catalog)} Standards, {len(self.qco_matrix)} QCO mappings, {len(self.normative_edges)} Graph Edges.\n")

    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search by IS number, English keyword, or Hindi vernacular query"""
        q_norm = query.strip().lower()
        
        # Check direct vernacular mapping
        if q_norm in self.synonyms:
            syn_entry = self.synonyms[q_norm]
            target_is = syn_entry.get("is_ref") if isinstance(syn_entry, dict) else syn_entry
            print(f" [Multilingual Match] '{query}' -> mapped to {target_is} ({syn_entry})")
            if target_is:
                std = self.get_standard(target_is)
                if std:
                    return [std]
            
        # Search IS number pattern e.g. "IS 1786" or "1786"
        is_match = re.search(r"(?:IS\s*)?(\d{2,5}(?:\s*\(Part\s*\d+\))?)", query, re.IGNORECASE)
        if is_match:
            is_key = f"IS {is_match.group(1)}".upper()
            if is_key in self.by_is_number:
                return [self.by_is_number[is_key]]
                
        # Keyword ranking
        tokens = [t for t in re.split(r"\W+", q_norm) if len(t) > 2]
        scored_results = []
        
        for r in self.master_catalog:
            title = r.get("title", "").lower()
            full_title = r.get("full_title", "").lower()
            score = 0
            for t in tokens:
                if t in title:
                    score += 5
                elif t in full_title:
                    score += 2
                    
            if score > 0:
                # Boost if standard is QCO mandatory
                if r.get("regulatory_compliance", {}).get("is_mandatory"):
                    score += 3
                scored_results.append((score, r))
                
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_results[:limit]]

    def get_standard(self, is_number: str) -> Optional[Dict[str, Any]]:
        key = is_number.strip().upper()
        return self.by_is_number.get(key)

    def get_allied_standards(self, is_number: str) -> List[Dict[str, Any]]:
        """Get all normative references and test methods connected in Knowledge Graph"""
        key = is_number.strip().upper()
        connected = []
        for e in self.normative_edges:
            if e["source"].upper() == key:
                connected.append({
                    "allied_is_number": e["target"],
                    "relation_type": e.get("relation_type", "GENERAL"),
                    "title": e.get("target_title")
                })
        return connected

    def analyze_draft_tender(self, tender_text: str) -> Dict[str, Any]:
        """Audit a tender document: detect citations, flag outdated versions, check QCO triggers, recommend missing allied standards"""
        found_citations = re.findall(r"\bIS\s*[:\.\-]?\s*(\d+(?:\s*\(Part\s*\d+\))?(?:\s*:\s*\d{4})?)", tender_text, re.IGNORECASE)
        
        analysis = {
            "detected_citations": [],
            "outdated_warnings": [],
            "mandatory_qco_alerts": [],
            "recommended_allied_standards": []
        }
        
        seen_allied = set()
        
        for cit in found_citations:
            clean_cit = f"IS {cit.strip()}"
            analysis["detected_citations"].append(clean_cit)
            
            # Check if year is present
            year_match = re.search(r":\s*(\d{4})", clean_cit)
            base_is = re.sub(r"\s*:\s*\d{4}", "", clean_cit).strip().upper()
            
            # Lookup master record
            std = self.get_standard(base_is)
            if std:
                latest_year = std.get("year_published")
                if year_match and latest_year:
                    cited_year = int(year_match.group(1))
                    if cited_year < latest_year:
                        analysis["outdated_warnings"].append({
                            "cited_citation": clean_cit,
                            "latest_published_standard": f"{base_is}:{latest_year}",
                            "amendments_count": len(std.get("amendments", [])),
                            "action_required": f"Replace {clean_cit} with latest edition {base_is}:{latest_year}"
                        })
                        
                # Check QCO status
                if std.get("regulatory_compliance", {}).get("is_mandatory"):
                    reg = std["regulatory_compliance"]
                    analysis["mandatory_qco_alerts"].append({
                        "standard": base_is,
                        "scheme": reg.get("scheme"),
                        "line_ministry": reg.get("notifying_ministry"),
                        "qco_order": reg.get("qco_order_name"),
                        "compliance_status": "MANDATORY_UNDER_INDIAN_LAW",
                        "mandate_clause": f"Mandatory compliance under {reg.get('qco_order_name')}. Tender must specify valid BIS License / Standard Mark."
                    })
                    
                # Fetch allied graph references
                allied = self.get_allied_standards(base_is)
                for a in allied:
                    ais = a["allied_is_number"]
                    if ais not in seen_allied and ais != base_is:
                        seen_allied.add(ais)
                        analysis["recommended_allied_standards"].append(a)
                        
        return analysis

if __name__ == "__main__":
    engine = StandardsEngine()
    
    print("=" * 70)
    print(" TEST 1: Semantic & Multilingual Retrieval")
    print("=" * 70)
    for q in ["सरिया", "office ergonomic chair", "LED street lights", "IS 1786"]:
        res = engine.search(q, limit=1)
        if res:
            r = res[0]
            print(f" Query: '{q}' -> [{r['is_number']}] {r['title']}")
            if r.get("regulatory_compliance", {}).get("is_mandatory"):
                print(f"   ⚠️ Mandatory: {r['regulatory_compliance']['scheme']} ({r['regulatory_compliance']['notifying_ministry']})")
        print("-" * 50)
        
    print("\n" + "=" * 70)
    print(" TEST 2: Knowledge Graph Traversal (IS 1786 TMT Bars -> Normative Allied Standards)")
    print("=" * 70)
    allied_tmt = engine.get_allied_standards("IS 1786")
    for a in allied_tmt:
        print(f" -> [{a['relation_type']}] {a['allied_is_number']} : {a['title']}")
        
    print("\n" + "=" * 70)
    print(" TEST 3: Real Tender Audit & Specification Diff Analysis")
    print("=" * 70)
    sample_tender = "Item 4.1: Providing and laying reinforced cement concrete in columns using High Yield Strength Deformed Tor Steel bars conforming to IS 1786 : 1985 of Grade Fe 415. Tensile testing shall follow IS 1608:1995. Concrete mix adhering to IS 456:1978."
    diff_report = engine.analyze_draft_tender(sample_tender)
    print(json.dumps(diff_report, indent=2, ensure_ascii=False))
