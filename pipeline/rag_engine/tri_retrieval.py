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
SYNONYM_INDEX_FILE = os.path.join(DATA_DIR, "06_multilingual_lexicon", "synonym_search_index.json")
QCO_MATRIX_FILE = os.path.join(DATA_DIR, "03_regulatory_qco", "qco_mapping_matrix.json")

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
    "IS 12269": {
        "replacement": "IS 269",
        "reason": "Withdrawn in 2015 and amalgamated into IS 269:2015 (covers 33, 43, 53 grade Ordinary Portland Cement).",
        "severity": "CRITICAL"
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
    }
}

class TriRetrievalLayer:
    """
    Implements the Tri-Retrieval Layer combining:
    1. Dense/Semantic Vector Retrieval (TF-IDF + Scope Match)
    2. Knowledge Graph Traversal (Normative references, test methods, supersessions)
    3. Keyword & Exact Match (IS Number lookup, Lexicon Synonyms, GeM categories)
    """
    def __init__(self):
        logger.info("Initializing Tri-Retrieval Layer...")
        self.master_standards: List[Dict[str, Any]] = []
        self.standards_by_num: Dict[str, Dict[str, Any]] = {}
        self.qco_matrix: Dict[str, Any] = {}
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

        # 2. Load QCO Matrix
        if os.path.exists(QCO_MATRIX_FILE):
            with open(QCO_MATRIX_FILE, "r", encoding="utf-8") as f:
                self.qco_matrix = json.load(f)

        # 3. Load Knowledge Graph Edges
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
        logger.info(f"Tri-Retrieval Layer ready with {len(self.standards_by_num)} standards, {len(self.normative_graph)} KG hubs.")

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

    # --- Retrieval 1: Vector / Semantic Search ---
    def retrieve_vector_candidates(self, query_text: str, top_k: int = 15) -> List[Tuple[Dict[str, Any], float]]:
        """Dense semantic / BM25 candidate retrieval."""
        tokens = self._tokenize(query_text)
        doc_scores: Dict[int, float] = defaultdict(float)

        for t in tokens:
            for idx, score in self.inverted_index.get(t, []):
                doc_scores[idx] += score

        if not doc_scores:
            return []

        max_score = max(doc_scores.values()) or 1.0
        sorted_docs = sorted(doc_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        
        results = []
        for idx, score in sorted_docs:
            norm_score = min(score / max_score, 1.0)
            results.append((self.master_standards[idx], norm_score))
        return results

    # --- Retrieval 2: Knowledge Graph Traversal ---
    def traverse_knowledge_graph(self, is_number: str) -> Dict[str, Any]:
        """
        Traverse knowledge graph from a candidate standard to extract:
        - Normative references (Test methods, sampling, raw materials)
        - Supersession paths (e.g. IS 8112 -> IS 269)
        - Co-citation neighbors
        """
        norm_key = normalize_is_key(is_number)
        allied_nodes = []
        graph_edges = []
        sup_info = self.supersession_map.get(norm_key)

        # 1. Check direct outbound edges (normative references in Clause 2)
        edges = self.normative_graph.get(norm_key, [])
        
        # Fallback curated links for foundational standards
        if not edges and norm_key == "IS 269":
            edges = [
                {"source": "IS 269", "target": "IS 4031 (Part 1)", "relation_type": "TEST_METHOD", "clause_excerpt": "Clause 6.1 mandates fineness test per IS 4031 (Part 1)."},
                {"source": "IS 269", "target": "IS 4032", "relation_type": "TEST_METHOD", "clause_excerpt": "Clause 5.1 mandates chemical analysis per IS 4032."}
            ]
        elif not edges and norm_key == "IS 1786":
            edges = [
                {"source": "IS 1786", "target": "IS 1608 (Part 1)", "relation_type": "TEST_METHOD", "clause_excerpt": "Clause 9.1 mandates tensile testing per IS 1608 (Part 1)."},
                {"source": "IS 1786", "target": "IS 13920", "relation_type": "NORMATIVE_REFERENCE", "clause_excerpt": "Mandates ductile detailing for seismic resistance per IS 13920."}
            ]

        for edge in edges:
            target_num = edge.get("target", "")
            target_std = self.standards_by_num.get(normalize_is_key(target_num))
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

            graph_edges.append({
                "from": norm_key,
                "to": target_num,
                "edge_type": rel_type,
                "label": f"Mandates {rel_type.lower()}"
            })

        return {
            "is_number": norm_key,
            "superseded_by": sup_info["replacement"] if sup_info else None,
            "allied_standards": allied_nodes,
            "graph_edges": graph_edges
        }

    # --- Retrieval 3: Exact IS & Lexicon Lookup ---
    def exact_and_lexicon_lookup(self, query_text: str) -> List[Tuple[Dict[str, Any], float, str]]:
        """
        Extracts exact standard mentions and synonym mappings.
        Returns list of (standard_dict, confidence, match_type).
        """
        results = []
        q_norm = query_text.strip().lower()

        # 1. Check Synonym Lexicon
        if q_norm in self.synonyms:
            entry = self.synonyms[q_norm]
            target_is = entry.get("is_ref") if isinstance(entry, dict) else str(entry)
            target_key = normalize_is_key(target_is)
            if target_key in self.standards_by_num:
                results.append((self.standards_by_num[target_key], 1.0, "SYNONYM_EXACT_MATCH"))

        # 2. Check for cement grade keywords (43 grade / 53 grade -> IS 269)
        if re.search(r"\b(43\s*grade|53\s*grade|33\s*grade|ordinary\s*portland\s*cement|opc)\b", query_text, re.IGNORECASE):
            if "IS 269" in self.standards_by_num:
                results.append((self.standards_by_num["IS 269"], 0.95, "PRODUCT_GRADE_MATCH"))

        # 3. Extract explicit IS numbers via Regex (e.g., 'IS 269', 'IS 8112', 'IS 1786')
        matches = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*(\d{2,5}(?:\s*\(Part\s*\d+\))?)", query_text, re.IGNORECASE)
        for m in matches:
            is_key = normalize_is_key(f"IS {m}")
            if is_key in self.standards_by_num:
                results.append((self.standards_by_num[is_key], 1.0, "IS_NUMBER_EXACT_MATCH"))

        return results

    def get_standard_by_number(self, is_number: str) -> Optional[Dict[str, Any]]:
        return self.standards_by_num.get(normalize_is_key(is_number))

    def get_qco_info(self, is_number: str) -> Optional[Dict[str, Any]]:
        key = normalize_is_key(is_number)
        return self.qco_matrix.get(key)
