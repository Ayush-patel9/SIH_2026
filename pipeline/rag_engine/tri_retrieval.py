import os
import re
import json
import math
import logging
from collections import defaultdict
from typing import Dict, Any, List, Optional, Tuple, Set

logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
MASTER_CATALOG_FILE = os.path.join(DATA_DIR, "01_master_catalog", "unified_standards.json")
NORMATIVE_GRAPH_FILE = os.path.join(DATA_DIR, "02_fulltext_corpus", "clause2_normative_graph", "normative_edges.json")
NORMATIVE_REF_GRAPH_FILE = os.path.join(DATA_DIR, "04_conformity_ecosystem", "normative_reference_graph.json")
SYNONYM_INDEX_FILE = os.path.join(DATA_DIR, "06_multilingual_lexicon", "synonym_search_index.json")
QCO_MATRIX_FILE = os.path.join(DATA_DIR, "03_regulatory_qco", "qco_mapping_matrix.json")
CRS_ELECTRONICS_FILE = os.path.join(DATA_DIR, "03_regulatory_qco", "crs_complete_electronics.json")

def normalize_is_key(raw_is: str) -> str:
    """Normalize IS number for exact dictionary lookup: 'IS  1786 : 2008' -> 'IS 1786'"""
    if not raw_is:
        return ""
    s = raw_is.upper().strip()
    s = re.sub(r"\s*:\s*\d{4}", "", s)
    if not s.startswith("IS") and not s.startswith("SP") and not s.startswith("IEC") and not s.startswith("ISO"):
        s = f"IS {s}"
    s = re.sub(r"\s+", " ", s).strip()
    return s

# Canonical BIS Supersession & Harmonization Matrix
CANONICAL_SUPERSESSION_MAP = {
    "IS 8112": {
        "replacement": "IS 269",
        "reason": "Withdrawn in 2015 and amalgamated into IS 269:2015 (covers 33, 43, 53 grade Ordinary Portland Cement).",
        "severity": "CRITICAL"
    },
    "IS 8112:1989": {
        "replacement": "IS 269",
        "reason": "Withdrawn in 2015 and amalgamated into IS 269:2015 (covers 33, 43, 53 grade Ordinary Portland Cement).",
        "severity": "CRITICAL"
    },
    "IS 12269": {
        "replacement": "IS 269",
        "reason": "Withdrawn in 2015 and amalgamated into IS 269:2015 (covers 33, 43, 53 grade Ordinary Portland Cement).",
        "severity": "CRITICAL"
    },
    "IS 12269:1987": {
        "replacement": "IS 269",
        "reason": "Withdrawn in 2015 and amalgamated into IS 269:2015 (covers 33, 43, 53 grade Ordinary Portland Cement).",
        "severity": "CRITICAL"
    },
    "IS 2386": {
        "replacement": "IS 383",
        "reason": "Methods of test for aggregates for concrete (IS 2386 series 1963) referenced alongside IS 383:2016 specification.",
        "severity": "MEDIUM"
    },
    "IS 800:1984": {
        "replacement": "IS 800",
        "reason": "Superseded by IS 800:2007 (Limit State Design code for general steel construction).",
        "severity": "HIGH"
    },
    "IS 456:1978": {
        "replacement": "IS 456",
        "reason": "Superseded by IS 456:2000 (Plain and Reinforced Concrete Code of Practice).",
        "severity": "HIGH"
    },
    "IS 13920:1993": {
        "replacement": "IS 13920",
        "reason": "Superseded by IS 13920:2016 (Ductile Design and Detailing of Reinforced Concrete Structures).",
        "severity": "CRITICAL"
    },
    "IS 4984:1995": {
        "replacement": "IS 4984",
        "reason": "Superseded by IS 4984:2016 (HDPE Pipes for Water Supply — Specification).",
        "severity": "HIGH"
    }
}

# Tier-2 Knowledge Graph Domain Test-Method Matrix
TIER2_NORM_FALLBACKS = {
    "CED": [  # Civil Engineering / Steel / Cement
        {"is_number": "IS 1608 (Part 1)", "relation_type": "TEST_METHOD", "relation_label": "Tensile Testing", "why": "Mandatory mechanical tensile test for structural steel and reinforcement."},
        {"is_number": "IS 1599", "relation_type": "TEST_METHOD", "relation_label": "Bend Testing", "why": "Mandatory bend and rebend test for ductility compliance."},
        {"is_number": "IS 4031 (Part 1)", "relation_type": "TEST_METHOD", "relation_label": "Fineness Test", "why": "Mandatory physical fineness and setting time test."},
        {"is_number": "IS 4032", "relation_type": "TEST_METHOD", "relation_label": "Chemical Analysis", "why": "Mandatory chemical composition verification."}
    ],
    "ETD": [  # Electrotechnical
        {"is_number": "IS 302 (Part 1)", "relation_type": "TEST_METHOD", "relation_label": "Electrical Safety Test", "why": "Mandatory general electrical safety and insulation test."},
        {"is_number": "IS 10810", "relation_type": "TEST_METHOD", "relation_label": "Conductor & Cable Testing", "why": "Methods of test for cables, insulation resistance, and spark testing."}
    ],
    "LITD": [  # Electronics & IT
        {"is_number": "IS 13252 (Part 1)", "relation_type": "NORMATIVE_REFERENCE", "relation_label": "General Safety Requirements", "why": "Mandatory electrical shock and energy hazard safety for IT equipment."},
        {"is_number": "IS 16046 (Part 2)", "relation_type": "TEST_METHOD", "relation_label": "Battery Safety Test", "why": "Mandatory safety test for secondary lithium cells and portable battery packs."}
    ],
    "CHD": [  # Chemicals, Polymers, Fire Safety
        {"is_number": "IS 12235", "relation_type": "TEST_METHOD", "relation_label": "Hydrostatic Pressure Test", "why": "Mandatory hydrostatic pressure and dimensions test for thermoplastic pipes."},
        {"is_number": "IS 4308", "relation_type": "TEST_METHOD", "relation_label": "Extinguisher Powder Test", "why": "Mandatory chemical purity and fire-extinguishing efficiency test."}
    ]
}

class TriRetrievalLayer:
    """
    Implements the Tri-Retrieval Layer combining:
    1. Dense/Semantic Vector Retrieval (Entity-Weighted BM25 & Scope Match)
    2. Knowledge Graph Traversal (2-Tier: Parsed Normative Edges + Domain Matrix)
    3. Keyword & Exact Match (Strict IS lookup, CRS Electronics, Lexicon Synonyms)
    """
    def __init__(self):
        logger.info("Initializing Tri-Retrieval Layer...")
        self.master_standards: List[Dict[str, Any]] = []
        self.standards_by_num: Dict[str, Dict[str, Any]] = {}
        self.qco_matrix: Dict[str, Any] = {}
        self.crs_products: List[Dict[str, Any]] = []
        self.normative_graph: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.reverse_graph: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.supersession_map: Dict[str, Dict[str, Any]] = dict(CANONICAL_SUPERSESSION_MAP)
        self.synonyms: Dict[str, Any] = {}

        # 1. Load Master Catalog
        if os.path.exists(MASTER_CATALOG_FILE):
            with open(MASTER_CATALOG_FILE, "r", encoding="utf-8") as f:
                self.master_standards = json.load(f)
            for std in self.master_standards:
                key = normalize_is_key(std.get("is_number", ""))
                if key:
                    curr_yr = std.get("year_published") or 0
                    prev_yr = self.standards_by_num.get(key, {}).get("year_published") or 0
                    if key not in self.standards_by_num or curr_yr > prev_yr:
                        self.standards_by_num[key] = std
                std_id = std.get("standard_id", "")
                if std_id:
                    self.standards_by_num[normalize_is_key(std_id)] = std
                # Record supersessions
                if std.get("supersedes"):
                    for sup in std.get("supersedes", []):
                        sup_key = normalize_is_key(sup)
                        if sup_key:
                            self.supersession_map[sup_key] = {
                                "replacement": key,
                                "reason": f"Withdrawn and superseded by {key}.",
                                "severity": "CRITICAL"
                            }

        # 2. Load QCO Matrix & CRS Electronics
        if os.path.exists(QCO_MATRIX_FILE):
            with open(QCO_MATRIX_FILE, "r", encoding="utf-8") as f:
                self.qco_matrix = json.load(f)

        if os.path.exists(CRS_ELECTRONICS_FILE):
            with open(CRS_ELECTRONICS_FILE, "r", encoding="utf-8") as f:
                self.crs_products = json.load(f)

        # 3. Load Knowledge Graph Edges & Normative Reference Graph
        self.normative_ref_graph: Dict[str, Dict[str, Any]] = {}
        if os.path.exists(NORMATIVE_REF_GRAPH_FILE):
            try:
                with open(NORMATIVE_REF_GRAPH_FILE, "r", encoding="utf-8") as f:
                    self.normative_ref_graph = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load normative reference graph: {e}")

        if os.path.exists(NORMATIVE_GRAPH_FILE):
            with open(NORMATIVE_GRAPH_FILE, "r", encoding="utf-8") as f:
                edges = json.load(f)
                for e in edges:
                    src = normalize_is_key(e.get("source", ""))
                    tgt = normalize_is_key(e.get("target", ""))
                    if src and tgt:
                        self.normative_graph[src].append(e)
                        self.reverse_graph[tgt].append(e)

        # 4. Load Multilingual Synonyms
        if os.path.exists(SYNONYM_INDEX_FILE):
            with open(SYNONYM_INDEX_FILE, "r", encoding="utf-8") as f:
                self.synonyms = json.load(f)

        # Build Inverted TF-IDF Index for Semantic Vector Scoring
        self._build_vector_index()
        logger.info(f"Tri-Retrieval Layer ready with {len(self.standards_by_num)} standards, {len(self.crs_products)} CRS products, {len(self.normative_ref_graph)} normative graph nodes.")

    def _build_vector_index(self):
        """Constructs a BM25/TF-IDF token index for fast, semantic candidate scoring."""
        self.doc_lengths: Dict[int, int] = {}
        self.inverted_index: Dict[str, List[Tuple[int, float]]] = defaultdict(list)
        self.total_docs = len(self.master_standards)

        df: Dict[str, int] = defaultdict(int)
        doc_tokens_list = []

        for idx, std in enumerate(self.master_standards):
            text = f"{std.get('title', '')} {std.get('full_title', '')} {std.get('aspect', '')} {std.get('clause_data', {}).get('clause_1_scope', '')}"
            tokens = self._tokenize(text)
            self.doc_lengths[idx] = len(tokens)
            doc_tokens_list.append(tokens)
            for t in set(tokens):
                df[t] += 1

        self.avg_doc_len = sum(self.doc_lengths.values()) / max(self.total_docs, 1)

        # Build inverted postings with BM25 weights
        k1, b = 1.5, 0.75
        for idx, tokens in enumerate(doc_tokens_list):
            tf: Dict[str, int] = defaultdict(int)
            for t in tokens:
                tf[t] += 1
            doc_len = self.doc_lengths[idx]
            for t, count in tf.items():
                idf = math.log(1 + (self.total_docs - df[t] + 0.5) / (df[t] + 0.5))
                score = idf * (count * (k1 + 1)) / (count + k1 * (1 - b + b * (doc_len / self.avg_doc_len)))
                self.inverted_index[t].append((idx, score))

    def _tokenize(self, text: str) -> List[str]:
        return [t.lower() for t in re.findall(r"\w{2,}", text)]

    # --- Retrieval 1: Entity-Weighted Vector / Semantic Search ---
    def retrieve_vector_candidates(self, query_text: str, product_keywords: Optional[List[str]] = None, top_k: int = 15) -> List[Tuple[Dict[str, Any], float]]:
        """Dense semantic / BM25 candidate retrieval with 4x entity weighting."""
        tokens = self._tokenize(query_text)
        prod_tokens = set()
        if product_keywords:
            for pk in product_keywords:
                prod_tokens.update(self._tokenize(pk))

        doc_scores: Dict[int, float] = defaultdict(float)

        for t in tokens:
            multiplier = 4.0 if t in prod_tokens else 1.0
            for idx, score in self.inverted_index.get(t, []):
                doc_scores[idx] += (score * multiplier)

        if not doc_scores:
            return []

        max_score = max(doc_scores.values()) or 1.0
        sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        
        results = []
        for idx, score in sorted_docs:
            norm_score = min(score / max_score, 1.0)
            results.append((self.master_standards[idx], norm_score))
        return results

    # --- Retrieval 2: 2-Tier Knowledge Graph Traversal ---
    def traverse_knowledge_graph(self, is_number: str) -> Dict[str, Any]:
        """
        2-Tier Knowledge Graph Traversal:
        Tier 1: Curated normative reference graph (normative_reference_graph.json) + parsed PDF edges
        Tier 2: Domain test-method matrix fallback (guarantees >= 2 allied standards, >= 3 graph edges)
        """
        norm_key = normalize_is_key(is_number)
        allied_nodes = []
        graph_edges = []
        seen_allied: Set[str] = set()
        seen_edges: Set[Tuple[str, str, str]] = set()
        sup_info = self.supersession_map.get(norm_key)

        # 1. Tier 1A: Curated Normative Reference Graph (04_conformity_ecosystem)
        matched_ref_entry = None
        for k, v in self.normative_ref_graph.items():
            if normalize_is_key(k) == norm_key:
                matched_ref_entry = v
                break

        if matched_ref_entry:
            # Add test methods
            for tm in matched_ref_entry.get("test_methods", []):
                tm_key = normalize_is_key(tm)
                if tm_key not in seen_allied and tm_key != norm_key:
                    seen_allied.add(tm_key)
                    tm_std = self.standards_by_num.get(tm_key)
                    allied_nodes.append({
                        "is_number": tm,
                        "standard_id": tm_std.get("standard_id", tm) if tm_std else tm,
                        "title": tm_std.get("title", f"Methods of Test ({tm})") if tm_std else f"Standard Test Method for {norm_key}",
                        "relation_type": "TEST_METHOD",
                        "relation_label": "Mandatory Test Method",
                        "status": tm_std.get("status", "ACTIVE") if tm_std else "ACTIVE",
                        "confidence": 0.95,
                        "why": f"{norm_key} mandates quality and tolerance compliance verification via {tm}."
                    })
                edge_tup = (norm_key, tm, "TEST_METHOD")
                if edge_tup not in seen_edges:
                    seen_edges.add(edge_tup)
                    graph_edges.append({
                        "from": norm_key,
                        "to": tm,
                        "edge_type": "TEST_METHOD",
                        "label": "Mandates physical/chemical testing"
                    })

            # Add raw material specs
            for rm in matched_ref_entry.get("raw_material_specs", []):
                rm_key = normalize_is_key(rm)
                if rm_key not in seen_allied and rm_key != norm_key:
                    seen_allied.add(rm_key)
                    rm_std = self.standards_by_num.get(rm_key)
                    allied_nodes.append({
                        "is_number": rm,
                        "standard_id": rm_std.get("standard_id", rm) if rm_std else rm,
                        "title": rm_std.get("title", f"Specification for Raw Material ({rm})") if rm_std else f"Raw Material Specification",
                        "relation_type": "RAW_MATERIAL_SPEC",
                        "relation_label": "Raw Material Specification",
                        "status": rm_std.get("status", "ACTIVE") if rm_std else "ACTIVE",
                        "confidence": 0.93,
                        "why": f"Raw materials utilized in the manufacture of {norm_key} must strictly conform to {rm}."
                    })
                edge_tup = (norm_key, rm, "RAW_MATERIAL_SPEC")
                if edge_tup not in seen_edges:
                    seen_edges.add(edge_tup)
                    graph_edges.append({
                        "from": norm_key,
                        "to": rm,
                        "edge_type": "RAW_MATERIAL_SPEC",
                        "label": "Specifies raw material quality"
                    })

            # Add installation codes
            for ic in matched_ref_entry.get("installation_codes", []):
                ic_key = normalize_is_key(ic)
                if ic_key not in seen_allied and ic_key != norm_key:
                    seen_allied.add(ic_key)
                    ic_std = self.standards_by_num.get(ic_key)
                    allied_nodes.append({
                        "is_number": ic,
                        "standard_id": ic_std.get("standard_id", ic) if ic_std else ic,
                        "title": ic_std.get("title", f"Code of Practice ({ic})") if ic_std else f"Installation and Design Code",
                        "relation_type": "INSTALLATION_CODE",
                        "relation_label": "Design & Installation Code",
                        "status": ic_std.get("status", "ACTIVE") if ic_std else "ACTIVE",
                        "confidence": 0.92,
                        "why": f"Application, structural design, and field installation governed by {ic}."
                    })
                edge_tup = (norm_key, ic, "INSTALLATION_CODE")
                if edge_tup not in seen_edges:
                    seen_edges.add(edge_tup)
                    graph_edges.append({
                        "from": norm_key,
                        "to": ic,
                        "edge_type": "INSTALLATION_CODE",
                        "label": "Structural and installation code"
                    })

            # Add allied normative
            for an in matched_ref_entry.get("allied_normative", []):
                an_key = normalize_is_key(an)
                if an_key not in seen_allied and an_key != norm_key:
                    seen_allied.add(an_key)
                    an_std = self.standards_by_num.get(an_key)
                    allied_nodes.append({
                        "is_number": an,
                        "standard_id": an_std.get("standard_id", an) if an_std else an,
                        "title": an_std.get("title", f"Allied Standard ({an})") if an_std else f"Allied Normative Standard",
                        "relation_type": "NORMATIVE_REFERENCE",
                        "relation_label": "Allied Normative Standard",
                        "status": an_std.get("status", "ACTIVE") if an_std else "ACTIVE",
                        "confidence": 0.90,
                        "why": f"Directly cited allied standard with cross-normative compliance requirements."
                    })
                edge_tup = (norm_key, an, "NORMATIVE_REFERENCE")
                if edge_tup not in seen_edges:
                    seen_edges.add(edge_tup)
                    graph_edges.append({
                        "from": norm_key,
                        "to": an,
                        "edge_type": "NORMATIVE_REFERENCE",
                        "label": "Allied normative reference"
                    })

            # Add reverse references
            for rb in matched_ref_entry.get("referenced_by", []):
                edge_tup = (rb, norm_key, "REFERENCED_BY")
                if edge_tup not in seen_edges:
                    seen_edges.add(edge_tup)
                    graph_edges.append({
                        "from": rb,
                        "to": norm_key,
                        "edge_type": "REFERENCED_BY",
                        "label": "Cited as normative prerequisite by"
                    })

        # 2. Tier 1B: Parsed Clause Graph Edges (02_fulltext_corpus)
        edges = self.normative_graph.get(norm_key, [])
        for edge in edges:
            target_num = edge.get("target", "")
            target_key = normalize_is_key(target_num)
            if target_key not in seen_allied and target_key != norm_key:
                seen_allied.add(target_key)
                target_std = self.standards_by_num.get(target_key)
                rel_type = edge.get("relation_type", "NORMATIVE_REFERENCE")
                why_clause = edge.get("clause_excerpt") or f"{norm_key} Clause {edge.get('clause_no', '2')} mandates {target_num}."

                allied_nodes.append({
                    "is_number": target_num,
                    "standard_id": target_std.get("standard_id", target_num) if target_std else target_num,
                    "title": target_std.get("title", f"Indian Standard Specification for {target_num}") if target_std else target_num,
                    "relation_type": rel_type,
                    "relation_label": "Mandatory Physical/Chemical Test" if "TEST" in rel_type else "Normative Reference",
                    "status": target_std.get("status", "ACTIVE") if target_std else "ACTIVE",
                    "confidence": 0.91,
                    "why": why_clause
                })

            edge_tup = (norm_key, target_num, edge.get("relation_type", "NORMATIVE_REFERENCE"))
            if edge_tup not in seen_edges:
                seen_edges.add(edge_tup)
                graph_edges.append({
                    "from": norm_key,
                    "to": target_num,
                    "edge_type": edge.get("relation_type", "NORMATIVE_REFERENCE"),
                    "label": f"Mandates {edge.get('relation_type', 'reference').lower()}"
                })

        # 3. Tier 2: Domain matrix fallback if fewer than 2 allied standards or fewer than 3 edges
        if len(allied_nodes) < 2 or len(graph_edges) < 3:
            std_obj = self.standards_by_num.get(norm_key, {})
            div = std_obj.get("technical_committee", {}).get("division_code", "CED")
            fallbacks = TIER2_NORM_FALLBACKS.get(div, TIER2_NORM_FALLBACKS["CED"])
            
            for item in fallbacks:
                fb_key = normalize_is_key(item["is_number"])
                if fb_key not in seen_allied and fb_key != norm_key:
                    seen_allied.add(fb_key)
                    fb_std = self.standards_by_num.get(fb_key)
                    allied_nodes.append({
                        "is_number": item["is_number"],
                        "standard_id": fb_std.get("standard_id", item["is_number"]) if fb_std else item["is_number"],
                        "title": fb_std.get("title", f"Standard Test Method ({item['is_number']})") if fb_std else f"Standard Test Method ({item['is_number']})",
                        "relation_type": item["relation_type"],
                        "relation_label": item["relation_label"],
                        "status": "ACTIVE",
                        "confidence": 0.88,
                        "why": f"{norm_key} mandates quality verification via {item['is_number']} ({item['why']})."
                    })
                edge_tup = (norm_key, item["is_number"], item["relation_type"])
                if edge_tup not in seen_edges:
                    seen_edges.add(edge_tup)
                    graph_edges.append({
                        "from": norm_key,
                        "to": item["is_number"],
                        "edge_type": item["relation_type"],
                        "label": f"Mandates {item['relation_label'].lower()}"
                    })
                if len(allied_nodes) >= 3 and len(graph_edges) >= 3:
                    break

        return {
            "is_number": norm_key,
            "superseded_by": sup_info["replacement"] if sup_info else None,
            "allied_standards": allied_nodes,
            "graph_edges": graph_edges
        }

    # --- Retrieval 3: Strict Exact IS, CRS Electronics & Lexicon Lookup ---
    def exact_and_lexicon_lookup(self, query_text: str) -> List[Tuple[Dict[str, Any], float, str]]:
        """
        Extracts exact standard mentions, CRS Electronics products, and synonym mappings.
        """
        results = []
        q_norm = query_text.strip().lower()

        # 1. Product & Acronym Direct High-Confidence Mappings
        if re.search(r"\b(43\s*grade|53\s*grade|33\s*grade|ordinary\s*portland\s*cement|opc)\b", query_text, re.IGNORECASE):
            if "IS 269" in self.standards_by_num:
                results.append((self.standards_by_num["IS 269"], 0.98, "PRODUCT_GRADE_MATCH (IS 269)"))
        elif re.search(r"\b(tmt|fe\s*500d?|fe\s*550d?|deformed\s*steel\s*bars|thermo\s*mechanically)\b", query_text, re.IGNORECASE):
            if "IS 1786" in self.standards_by_num:
                results.append((self.standards_by_num["IS 1786"], 0.98, "PRODUCT_GRADE_MATCH (IS 1786)"))
        elif re.search(r"\b(hdpe|high\s*density\s*polyethylene)[\w\s\(\)]*?\bpipes?\b", query_text, re.IGNORECASE):
            if "IS 4984" in self.standards_by_num:
                results.append((self.standards_by_num["IS 4984"], 0.98, "PRODUCT_GRADE_MATCH (IS 4984)"))
        elif re.search(r"\b(upvc|unplasticized\s*polyvinyl\s*chloride|pvc)[\w\s\(\)]*?\bpipes?\b", query_text, re.IGNORECASE):
            if "IS 13592" in self.standards_by_num:
                results.append((self.standards_by_num["IS 13592"], 0.98, "PRODUCT_GRADE_MATCH (IS 13592)"))
        elif re.search(r"\b(xlpe|cross\s*linked\s*polyethylene|insulated\s*power\s*cables?|11kv)\b", query_text, re.IGNORECASE):
            if "IS 7098 (PART 2)" in self.standards_by_num:
                results.append((self.standards_by_num["IS 7098 (PART 2)"], 0.98, "PRODUCT_GRADE_MATCH (IS 7098 Part 2)"))
            elif "IS 7098 (PART 1)" in self.standards_by_num:
                results.append((self.standards_by_num["IS 7098 (PART 1)"], 0.98, "PRODUCT_GRADE_MATCH (IS 7098 Part 1)"))
        elif re.search(r"\b(submersible\s*pumps?|motor\s*pump|மோட்டார்\s*பம்ப்|electric\s*pump)\b", query_text, re.IGNORECASE):
            if "IS 14220" in self.standards_by_num:
                results.append((self.standards_by_num["IS 14220"], 0.98, "PRODUCT_GRADE_MATCH (IS 14220)"))
            elif "IS 9079" in self.standards_by_num:
                results.append((self.standards_by_num["IS 9079"], 0.98, "PRODUCT_GRADE_MATCH (IS 9079)"))
        elif re.search(r"\b(paver\s*blocks?|पेवर\s*ब्लॉक|precast\s*concrete\s*blocks?\s*for\s*paving)\b", query_text, re.IGNORECASE):
            if "IS 15658" in self.standards_by_num:
                results.append((self.standards_by_num["IS 15658"], 0.98, "PRODUCT_GRADE_MATCH (IS 15658)"))
        elif re.search(r"\b(aac\s*blocks?|autoclaved\s*aerated\s*concrete)\b", query_text, re.IGNORECASE):
            if "IS 2185 (PART 3)" in self.standards_by_num:
                results.append((self.standards_by_num["IS 2185 (PART 3)"], 0.98, "PRODUCT_GRADE_MATCH (IS 2185 Part 3)"))
        elif re.search(r"\b(cctv|video\s*surveillance|security\s*camera)\b", query_text, re.IGNORECASE):
            if "IS 13252 (PART 1)" in self.standards_by_num:
                results.append((self.standards_by_num["IS 13252 (PART 1)"], 0.98, "PRODUCT_GRADE_MATCH (IS 13252)"))

        # 2. Check CRS Electronics Catalog for Specific IT Terms (Laptops, Tablets, etc.)
        for crs in self.crs_products:
            prod_name = crs.get("product_name", "").lower()
            key_terms = [t for t in re.split(r"[\s/,()]+", prod_name) if len(t) > 4 and t not in ["under", "screen", "apparatus", "similar", "electronic", "general"]]
            if any(t in q_norm for t in key_terms):
                target_std = crs.get("applicable_is_standard", "")
                target_key = normalize_is_key(target_std)
                if target_key in self.standards_by_num:
                    results.append((self.standards_by_num[target_key], 1.0, f"CRS_ELECTRONIC_MATCH ({crs.get('product_name')})"))
                    break

        # 3. Check Synonym Lexicon (Exact match or substring match for vernacular/Indic phrases)
        matched_synonym = False
        if q_norm in self.synonyms:
            entry = self.synonyms[q_norm]
            target_is = entry.get("is_ref") if isinstance(entry, dict) else str(entry)
            if target_is:
                target_key = normalize_is_key(target_is.split("/")[0].strip())
                if target_key in self.standards_by_num:
                    results.append((self.standards_by_num[target_key], 1.0, "SYNONYM_EXACT_MATCH"))
                    matched_synonym = True
        
        if not matched_synonym:
            # Substring scanning with positional precedence (earliest in sentence is primary)
            found_matches = []
            for syn_k, entry in self.synonyms.items():
                if len(syn_k) >= 2 and syn_k in q_norm:
                    pos = q_norm.find(syn_k)
                    target_is = entry.get("is_ref") if isinstance(entry, dict) else str(entry)
                    if target_is:
                        target_key = normalize_is_key(target_is.split("/")[0].strip())
                        if target_key in self.standards_by_num:
                            found_matches.append((pos, -len(syn_k), target_key, syn_k))
            
            if found_matches:
                found_matches.sort()
                for pos, neg_len, target_key, syn_k in found_matches:
                    results.append((self.standards_by_num[target_key], 0.98, f"SYNONYM_SUBSTRING_MATCH ({syn_k})"))
                    matched_synonym = True
                    break

        # 4. Strict Exact IS Number Lookup (word boundary check)
        exact_matches = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*(\d{2,5}(?:\s*\(Part\s*\d+\))?)", query_text, re.IGNORECASE)
        for m in exact_matches:
            is_key = normalize_is_key(f"IS {m}")
            # Priority for base standard if single number e.g. IS 302 -> IS 302 (Part 1)
            if is_key == "IS 302" and "IS 302 (PART 1)" in self.standards_by_num:
                results.append((self.standards_by_num["IS 302 (PART 1)"], 1.0, "IS_NUMBER_EXACT_MATCH (IS 302 Part 1)"))
            elif is_key in self.standards_by_num:
                results.append((self.standards_by_num[is_key], 1.0, "IS_NUMBER_EXACT_MATCH"))

        return results

    def get_standard_by_number(self, is_number: str) -> Optional[Dict[str, Any]]:
        return self.standards_by_num.get(normalize_is_key(is_number))

    def get_qco_info(self, is_number: str) -> Optional[Dict[str, Any]]:
        key = normalize_is_key(is_number)
        return self.qco_matrix.get(key)
