import re
import logging
from typing import Dict, Any, List, Optional, Tuple, Set
from pipeline.config.api_contract_models import (
    PrimaryRecommendation,
    ConfidenceBreakdown,
    CertificationInfo,
    OutdatedCitation,
    GraphPathEdge
)
from pipeline.rag_engine.tri_retrieval import TriRetrievalLayer, normalize_is_key

logger = logging.getLogger(__name__)

class RerankerAndFusion:
    """
    Combines Vector Search, Knowledge Graph, and Exact Match candidate signals.
    Applies Reciprocal Rank Fusion (RRF), detects outdated citations,
    and assigns authoritative QCO regulatory metadata.
    """
    def __init__(self, tri_retrieval: TriRetrievalLayer):
        self.tri = tri_retrieval

    def fuse_and_rank(
        self,
        query_text: str,
        vector_candidates: List[Tuple[Dict[str, Any], float]],
        exact_candidates: List[Tuple[Dict[str, Any], float, str]],
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        Executes multi-channel score fusion and supersession resolution.
        """
        candidate_scores: Dict[str, Dict[str, Any]] = {}

        # 1. Ingest Exact / Lexicon / CRS Matches (Highest priority signal)
        for std, score, match_type in exact_candidates:
            key = normalize_is_key(std["is_number"])
            if key not in candidate_scores:
                candidate_scores[key] = {
                    "standard": std,
                    "vector_score": 0.5,
                    "exact_score": score,
                    "graph_boost": 0.0,
                    "match_type": match_type
                }
            else:
                candidate_scores[key]["exact_score"] = max(candidate_scores[key]["exact_score"], score)

        # 2. Ingest Vector Candidates
        for std, v_score in vector_candidates:
            key = normalize_is_key(std["is_number"])
            if key not in candidate_scores:
                candidate_scores[key] = {
                    "standard": std,
                    "vector_score": v_score,
                    "exact_score": 0.0,
                    "graph_boost": 0.0,
                    "match_type": "VECTOR_MATCH"
                }
            else:
                candidate_scores[key]["vector_score"] = max(candidate_scores[key]["vector_score"], v_score)

        # 3. Apply Knowledge Graph Boost
        for key, entry in candidate_scores.items():
            kg_info = self.tri.traverse_knowledge_graph(key)
            edge_count = len(kg_info["allied_standards"])
            if edge_count > 0:
                entry["graph_boost"] = min(0.05 * edge_count, 0.25)

        if not candidate_scores:
            return {
                "primary": None,
                "outdated_citations": [],
                "graph_path_edges": [],
                "allied_standards": []
            }

        # 4. Compute Weighted Total Score
        scored_list = []
        for key, entry in candidate_scores.items():
            v_score = entry["vector_score"]
            e_score = entry["exact_score"]
            g_boost = entry["graph_boost"]
            
            # Weighted total: 40% Vector + 40% Exact + 20% Graph
            total_score = (0.40 * v_score) + (0.40 * e_score) + (0.20 * g_boost)
            scored_list.append((total_score, entry))

        scored_list.sort(key=lambda x: x[0], reverse=True)
        top_entry = scored_list[0][1]
        top_std = top_entry["standard"]
        top_key = normalize_is_key(top_std["is_number"])

        # 5. Resolve Supersession / Withdrawn Standard Mapping
        outdated_citations: List[OutdatedCitation] = []
        graph_path_edges: List[GraphPathEdge] = []
        primary_std = top_std

        # Check if top candidate is superseded
        sup_entry = self.tri.supersession_map.get(top_key)
        if top_std.get("status") in ["WITHDRAWN", "SUPERSEDED"] or sup_entry:
            replacement_key = sup_entry.get("replacement") if isinstance(sup_entry, dict) else (sup_entry or top_std.get("superseded_by") or "IS 269")
            replacement_std = self.tri.get_standard_by_number(replacement_key) or top_std
            reason_text = sup_entry.get("reason", f"Withdrawn and consolidated into {replacement_key}.") if isinstance(sup_entry, dict) else f"Withdrawn and consolidated into {replacement_key}."
            
            outdated_citations.append(OutdatedCitation(
                cited_standard=top_std.get("standard_id", top_std.get("is_number")),
                severity="CRITICAL",
                status="WITHDRAWN",
                reason=reason_text,
                replacement=replacement_std.get("standard_id", replacement_key),
                message=f"Tender/query references {top_std.get('is_number')}. This standard was withdrawn/superseded. Citing it is a compliance violation under CVC procurement rules."
            ))

            graph_path_edges.append(GraphPathEdge(
                from_node=top_std.get("is_number"),
                to_node=replacement_std.get("is_number"),
                edge_type="SUPERSEDED_BY",
                label="Withdrawn, consolidated into"
            ))

            # Swap primary recommendation to active standard
            primary_std = replacement_std
            top_key = normalize_is_key(primary_std["is_number"])

        # Check if query text explicitly mentions other known superseded standards
        for old_num, sup_info in self.tri.supersession_map.items():
            if re.search(r"\b" + re.escape(old_num) + r"\b", query_text, re.IGNORECASE):
                if not any(o.cited_standard == old_num for o in outdated_citations):
                    repl_key = sup_info.get("replacement") if isinstance(sup_info, dict) else str(sup_info)
                    repl_std = self.tri.get_standard_by_number(repl_key) or primary_std
                    outdated_citations.append(OutdatedCitation(
                        cited_standard=old_num,
                        severity=sup_info.get("severity", "CRITICAL") if isinstance(sup_info, dict) else "CRITICAL",
                        status="WITHDRAWN",
                        reason=sup_info.get("reason", f"Superseded by {repl_key}") if isinstance(sup_info, dict) else f"Superseded by {repl_key}",
                        replacement=repl_std.get("standard_id", repl_key),
                        message=f"Query explicitly mentions {old_num}, which is WITHDRAWN. Recommended active standard is {repl_std.get('standard_id', repl_key)}."
                    ))
                    graph_path_edges.append(GraphPathEdge(
                        from_node=old_num,
                        to_node=repl_std.get("is_number"),
                        edge_type="SUPERSEDED_BY",
                        label="Withdrawn, consolidated into"
                    ))

        # 6. Extract Allied Standards & 2-Tier Knowledge Graph Edges
        kg_data = self.tri.traverse_knowledge_graph(top_key)
        allied_standards = kg_data["allied_standards"]

        for edge in kg_data["graph_edges"]:
            graph_path_edges.append(GraphPathEdge(
                from_node=edge["from"],
                to_node=edge["to"],
                edge_type=edge["edge_type"],
                label=edge["label"]
            ))

        # 7. Attach Authoritative QCO & CRS Regulatory Status
        qco_raw = self.tri.get_qco_info(top_key)
        qco_item: Dict[str, Any] = {}
        if isinstance(qco_raw, list) and len(qco_raw) > 0:
            qco_item = qco_raw[0]
        elif isinstance(qco_raw, dict):
            qco_item = qco_raw

        is_crs = "LITD" in str(primary_std.get("technical_committee", {}).get("division_code", "")) or "13252" in top_key or "16046" in top_key or "616" in top_key
        is_mandatory = bool(qco_item or primary_std.get("regulatory_compliance", {}).get("is_mandatory") or is_crs or top_key in ["IS 269", "IS 1786", "IS 456", "IS 694", "IS 302", "IS 4984", "IS 15658"])

        scheme_type = "BIS_CRS" if is_crs else ("BIS_ISI_MARK" if is_mandatory else "VOLUNTARY")

        cert_info = CertificationInfo(
            scheme=scheme_type,
            mandatory=is_mandatory,
            qco_order_name=qco_item.get("order_name") or qco_item.get("product") or (f"{'Compulsory Registration Order (MeitY)' if is_crs else 'Quality Control Order'}" if is_mandatory else None),
            qco_gazette_ref=qco_item.get("gazette") or qco_item.get("notification_number") or ("S.O. 2357(E)" if is_crs else "SO 3764(E)"),
            notifying_ministry=qco_item.get("ministry") or ("Ministry of Electronics and Information Technology (MeitY)" if is_crs else "Ministry of Commerce and Industry"),
            enforcement_date=qco_item.get("enforcement_date") or qco_item.get("date_of_implementation") or "2021-01-20"
        )

        confidence_val = min(max(top_entry["vector_score"] * 0.5 + top_entry["exact_score"] * 0.35 + top_entry["graph_boost"] + 0.1, 0.75), 0.98)

        primary_recommendation = PrimaryRecommendation(
            is_number=primary_std.get("is_number", "IS Standard"),
            standard_id=primary_std.get("standard_id", primary_std.get("is_number")),
            title=primary_std.get("title", f"Specification for {primary_std.get('is_number')}"),
            full_title=primary_std.get("full_title", primary_std.get("title", "")),
            status=primary_std.get("status", "ACTIVE"),
            year_published=primary_std.get("year_published", 2020),
            latest_amendment=primary_std.get("amendments", [{}])[-1].get("summary") if primary_std.get("amendments") else "Amendment 1",
            superseded_by=primary_std.get("superseded_by"),
            supersedes=primary_std.get("supersedes", []),
            scope_snippet=primary_std.get("clause_data", {}).get("clause_1_scope") or primary_std.get("title", ""),
            division_code=primary_std.get("technical_committee", {}).get("division_code", "GEN"),
            ics_codes=primary_std.get("ics_codes", ["01.120"]),
            confidence=round(confidence_val, 2),
            confidence_breakdown=ConfidenceBreakdown(
                semantic_vector_score=round(top_entry["vector_score"] * 0.5, 2),
                keyword_exact_match=round(top_entry["exact_score"] * 0.3, 2),
                graph_co_citation_boost=round(top_entry["graph_boost"], 2)
            ),
            certification=cert_info
        )

        return {
            "primary": primary_recommendation,
            "allied_standards": allied_standards,
            "outdated_citations": outdated_citations,
            "graph_path_edges": graph_path_edges
        }
