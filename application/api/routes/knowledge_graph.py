from fastapi import APIRouter, Query
from typing import Dict, Any, List, Optional
import logging
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from pipeline.rag_engine.tri_retrieval import normalize_is_key, CANONICAL_SUPERSESSION_MAP, TIER2_NORM_FALLBACKS
from pipeline.rag_engine.historical_lineage_service import HistoricalLineageService

logger = logging.getLogger("bis_platform_api.knowledge_graph")
router = APIRouter(prefix="/api/v1/knowledge-graph", tags=["Knowledge Graph & 3D Neural Mesh"])

# Colors mapped by domain/type
DOMAIN_COLORS = {
    "Civil": "#2563EB",
    "Metallurgy": "#EA580C",
    "Testing": "#10B981",
    "Chemicals": "#06B6D4",
    "Electronics": "#E11D48",
    "Superseded": "#EF4444",
    "General": "#7C3AED",
}

def resolve_domain_color(domain_str: str, status: str = "ACTIVE") -> str:
    if status in ("SUPERSEDED", "WITHDRAWN"):
        return DOMAIN_COLORS["Superseded"]
    d_lower = domain_str.lower()
    if "civil" in d_lower or "cement" in d_lower or "concrete" in d_lower or "ced" in d_lower:
        return DOMAIN_COLORS["Civil"]
    if "metal" in d_lower or "steel" in d_lower or "mtd" in d_lower:
        return DOMAIN_COLORS["Metallurgy"]
    if "test" in d_lower:
        return DOMAIN_COLORS["Testing"]
    if "chem" in d_lower or "plastic" in d_lower or "pipe" in d_lower or "chd" in d_lower:
        return DOMAIN_COLORS["Chemicals"]
    if "electr" in d_lower or "cctv" in d_lower or "it" in d_lower or "etd" in d_lower or "litd" in d_lower:
        return DOMAIN_COLORS["Electronics"]
    return DOMAIN_COLORS["General"]


@router.get("/subgraph", summary="Fetch Dynamic Knowledge Graph Subgraph")
def get_knowledge_graph_subgraph(
    center: Optional[str] = Query(None, description="Standard code or keyword to center around (e.g. IS 1786, IS 7098, IS 2925, IS 4984)"),
    domain: Optional[str] = Query("ALL", description="Engineering Domain (Civil, Metallurgy, Testing, Electronics, Chemicals, ALL)"),
    limit: int = Query(30, description="Maximum nodes in subgraph")
) -> Dict[str, Any]:
    """
    Dynamically generates a relational Knowledge Graph subgraph for ANY Indian Standard
    based on the 22,011 indexed Indian Standards, 2-Tier Knowledge Graph traversal,
    and canonical supersession lineages.
    """
    tri = graph_rag_pipeline.tri_retrieval
    limit_val: int = limit if isinstance(limit, int) else (int(limit) if isinstance(limit, str) and limit.isdigit() else 30)

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    seen_nodes = set()
    seen_edges = set()

    def add_node(node_id: str, is_number: str, title: str, dom: str, year: int, status: str, citations: int, color: Optional[str] = None):
        clean_id = node_id.replace(" ", "-").replace(":", "-").replace("/", "-")
        if clean_id in seen_nodes:
            return clean_id
        seen_nodes.add(clean_id)
        node_color = color or resolve_domain_color(dom, status)
        nodes.append({
            "id": clean_id,
            "isNumber": is_number,
            "title": title,
            "domain": dom,
            "year": year,
            "status": status,
            "citations": citations,
            "color": node_color,
            "radius": 24 if citations > 60 else (20 if citations > 30 else 16)
        })
        return clean_id

    def add_edge(src: str, tgt: str, edge_type: str, label: str):
        key = (src, tgt, edge_type)
        if key in seen_edges or src == tgt:
            return
        seen_edges.add(key)
        edges.append({
            "source": src,
            "target": tgt,
            "type": edge_type,
            "label": label
        })

    # Case A: Center standard or product search requested (e.g. "cement", "tmt steel", "IS 269")
    if center and center.strip() and center.strip().upper() != "ALL":
        target_term = center.strip()
        norm_key = normalize_is_key(target_term)

        # 1. Direct standard code lookup in 22,011 indexed standards
        center_std = tri.standards_by_num.get(norm_key)
        pipeline_resp = None

        # 2. If not a direct standard code, use the full Standards Explorer (GraphRAG pipeline)
        # to extract product semantics, resolve supersessions, and identify canonical standard
        if not center_std:
            try:
                from pipeline.config.api_contract_models import QueryRequest
                query_req = QueryRequest(input={
                    "text": target_term,
                    "source": "knowledge_graph_explorer",
                    "mode": "recommend"
                })
                pipeline_resp = graph_rag_pipeline.process_query(query_req)
                if pipeline_resp and pipeline_resp.primary_recommendation:
                    prim_num = pipeline_resp.primary_recommendation.is_number
                    resolved_norm_key = normalize_is_key(prim_num)
                    center_std = tri.standards_by_num.get(resolved_norm_key)
                    if not center_std:
                        center_std = {
                            "is_number": prim_num,
                            "title": pipeline_resp.primary_recommendation.title,
                            "technical_committee": {"division_name": "Standards Explorer Match"},
                            "year_published": pipeline_resp.primary_recommendation.year_published or 2021,
                            "status": pipeline_resp.primary_recommendation.status or "ACTIVE",
                        }
            except Exception as pe:
                logger.warning(f"Standards Explorer pipeline lookup for '{target_term}' fallback: {pe}")

        # 3. Fast fallbacks: lexicon lookup & BM25 / vector candidate search
        if not center_std:
            matches = tri.exact_and_lexicon_lookup(target_term)
            if matches:
                center_std = matches[0][0]
            else:
                candidates = tri.retrieve_vector_candidates(target_term, top_k=3)
                if candidates:
                    center_std = candidates[0][0]

        # Canonicalize center standard properties
        center_is_num = center_std.get("is_number", target_term) if center_std else target_term
        norm_key = normalize_is_key(center_is_num)

        center_title = center_std.get("title", f"Indian Standard {center_is_num}") if center_std else f"Indian Standard {center_is_num}"
        center_dom = center_std.get("technical_committee", {}).get("division_name", "General Engineering") if center_std else "General Engineering"
        center_year = center_std.get("year_published", 2020) if center_std else 2020
        center_status = center_std.get("status", "ACTIVE") if center_std else "ACTIVE"

        center_id = add_node(
            f"IS-{norm_key}",
            center_is_num,
            center_title,
            center_dom,
            center_year,
            center_status,
            citations=92,
            color=resolve_domain_color(center_dom, center_status)
        )

        # 4. Integrate Graph Path & Allied Standards from Standards Explorer pipeline
        if pipeline_resp:
            if pipeline_resp.allied_standards:
                for allied in pipeline_resp.allied_standards:
                    if len(nodes) >= limit_val:
                        break
                    a_is = allied.is_number
                    a_std = tri.standards_by_num.get(normalize_is_key(a_is))
                    a_dom = a_std.get("technical_committee", {}).get("division_name", "Testing & Conformity") if a_std else "Testing & Conformity"
                    a_year = a_std.get("year_published", 2021) if a_std else 2021
                    a_id = add_node(
                        f"ALLIED-{a_is}",
                        a_is,
                        allied.title or (a_std.get("title", a_is) if a_std else a_is),
                        a_dom,
                        a_year,
                        a_std.get("status", "ACTIVE") if a_std else "ACTIVE",
                        citations=int((allied.confidence or 0.85) * 50)
                    )
                    rel_type = (allied.relation_type or "NORMATIVE").upper()
                    add_edge(center_id, a_id, rel_type, rel_type.replace("_", " "))

            if pipeline_resp.graph_path:
                for gp in pipeline_resp.graph_path:
                    if len(nodes) >= limit_val:
                        break
                    s_code = getattr(gp, 'from_node', getattr(gp, 'source', ''))
                    t_code = getattr(gp, 'to_node', getattr(gp, 'target', ''))
                    if not s_code or not t_code:
                        continue
                    s_norm = normalize_is_key(s_code)
                    t_norm = normalize_is_key(t_code)
                    s_std = tri.standards_by_num.get(s_norm)
                    t_std = tri.standards_by_num.get(t_norm)
                    s_id = add_node(
                        f"GP-{s_code}",
                        s_code,
                        s_std.get("title", s_code) if s_std else s_code,
                        s_std.get("technical_committee", {}).get("division_name", "Engineering") if s_std else "Engineering",
                        s_std.get("year_published", 2020) if s_std else 2020,
                        s_std.get("status", "ACTIVE") if s_std else "ACTIVE",
                        citations=45
                    )
                    t_id = add_node(
                        f"GP-{t_code}",
                        t_code,
                        t_std.get("title", t_code) if t_std else t_code,
                        t_std.get("technical_committee", {}).get("division_name", "Testing & Conformity") if t_std else "Testing & Conformity",
                        t_std.get("year_published", 2021) if t_std else 2021,
                        t_std.get("status", "ACTIVE") if t_std else "ACTIVE",
                        citations=40
                    )
                    e_type = getattr(gp, 'edge_type', getattr(gp, 'relationship', 'NORMATIVE')) or 'NORMATIVE'
                    e_label = getattr(gp, 'label', getattr(gp, 'description', e_type)) or e_type
                    add_edge(s_id, t_id, e_type.upper(), e_label)

            if pipeline_resp.outdated_citations:
                for outdated in pipeline_resp.outdated_citations:
                    if len(nodes) >= limit_val:
                        break
                    out_code = outdated.cited_standard
                    out_id = add_node(
                        f"OLD-{out_code}",
                        out_code,
                        f"Outdated: {outdated.message or outdated.reason or 'Superseded'}"[:45],
                        "Superseded / Legacy",
                        1989,
                        "SUPERSEDED",
                        14,
                        DOMAIN_COLORS["Superseded"]
                    )
                    add_edge(out_id, center_id, "SUPERSEDES", "Superseded / Consolidated")

        # 5. Dynamic 2-Tier Knowledge Graph Traversal for this standard
        kg_data = tri.traverse_knowledge_graph(center_is_num)
        for allied in kg_data.get("allied_standards", []):
            if len(nodes) >= limit_val:
                break
            a_is = allied.get("is_number", "")
            a_std = tri.standards_by_num.get(normalize_is_key(a_is))
            a_dom = a_std.get("technical_committee", {}).get("division_name", "Testing & Conformity") if a_std else "Testing & Conformity"
            a_year = a_std.get("year_published", 2021) if a_std else 2021
            a_id = add_node(
                f"ALLIED-{a_is}",
                a_is,
                allied.get("title", a_std.get("title", a_is) if a_std else a_is),
                a_dom,
                a_year,
                allied.get("status", "ACTIVE"),
                citations=int(allied.get("confidence", 0.9) * 50)
            )
            rel_type = allied.get("relation_type", "NORMATIVE")
            add_edge(center_id, a_id, rel_type, allied.get("relation_label", "Normative Citation"))

        # 6. Dynamic supersession lineage for this standard
        for old_std, s_info in tri.supersession_map.items():
            if len(nodes) >= limit_val:
                break
            rep = s_info.get("replacement", "")
            if normalize_is_key(rep) == norm_key or normalize_is_key(old_std) == norm_key:
                old_id = add_node(
                    f"OLD-{old_std}",
                    old_std,
                    f"Withdrawn Standard ({s_info.get('reason', '')[:35]}...)",
                    "Superseded / Legacy",
                    1989,
                    "SUPERSEDED",
                    12,
                    DOMAIN_COLORS["Superseded"]
                )
                target_id = center_id if normalize_is_key(rep) == norm_key else add_node(
                    f"REP-{rep}",
                    rep,
                    f"Active Consolidated Standard {rep}",
                    center_dom,
                    2015,
                    "ACTIVE",
                    65
                )
                add_edge(old_id, target_id, "SUPERSEDES", "Superseded / Consolidated")

        # 7. Check parsed normative edges from fulltext corpus
        for e in tri.normative_graph.get(norm_key, []):
            if len(nodes) >= limit_val:
                break
            tgt_is = e.get("target", "")
            tgt_std = tri.standards_by_num.get(normalize_is_key(tgt_is))
            tgt_id = add_node(
                f"EDGE-{tgt_is}",
                tgt_is,
                tgt_std.get("title", tgt_is) if tgt_std else tgt_is,
                tgt_std.get("technical_committee", {}).get("division_name", "Allied Engineering") if tgt_std else "Allied Engineering",
                tgt_std.get("year_published", 2020) if tgt_std else 2020,
                tgt_std.get("status", "ACTIVE") if tgt_std else "ACTIVE",
                citations=30
            )
            add_edge(center_id, tgt_id, "NORMATIVE", e.get("label", "Clause Reference"))

    # Case B: General Hub Overview across engineering domains
    else:
        # Hub Standards
        core_standards = [
            {"id": "IS-269", "num": "IS 269:2015", "title": "Ordinary Portland Cement (33, 43, 53)", "dom": "Civil / Cement", "year": 2015, "status": "MANDATORY_QCO", "citations": 88, "color": DOMAIN_COLORS["Civil"]},
            {"id": "IS-456", "num": "IS 456:2000", "title": "Plain & Reinforced Concrete Code of Practice", "dom": "Civil / Structural", "year": 2000, "status": "ACTIVE", "citations": 142, "color": "#7C3AED"},
            {"id": "IS-1786", "num": "IS 1786:2008", "title": "High Strength Deformed Steel Bars (Fe 500D)", "dom": "Metallurgy / Steel", "year": 2008, "status": "MANDATORY_QCO", "citations": 94, "color": DOMAIN_COLORS["Metallurgy"]},
            {"id": "IS-2062", "num": "IS 2062:2011", "title": "Hot Rolled Medium & High Tensile Structural Steel", "dom": "Metallurgy / Steel", "year": 2011, "status": "MANDATORY_QCO", "citations": 106, "color": DOMAIN_COLORS["Metallurgy"]},
            {"id": "IS-4984", "num": "IS 4984:2016", "title": "High Density Polyethylene (HDPE) Pipes for Water Supply", "dom": "Chemicals / Plastics", "year": 2016, "status": "MANDATORY_QCO", "citations": 52, "color": DOMAIN_COLORS["Chemicals"]},
            {"id": "IS-13252", "num": "IS 13252:2010", "title": "Information Technology Equipment — Safety (Part 1)", "dom": "Electronics / IT", "year": 2010, "status": "MANDATORY_QCO", "citations": 76, "color": DOMAIN_COLORS["Electronics"]},
            {"id": "IS-16842", "num": "IS 16842:2020", "title": "CCTV Surveillance Systems for Security Applications", "dom": "Electronics / Surveillance", "year": 2020, "status": "ACTIVE", "citations": 34, "color": DOMAIN_COLORS["Electronics"]},
        ]

        for std in core_standards:
            if domain != "ALL" and domain.lower() not in std["dom"].lower():
                continue
            add_node(std["id"], std["num"], std["title"], std["dom"], std["year"], std["status"], std["citations"], std["color"])

        # Add canonical supersessions
        for old_std, info in CANONICAL_SUPERSESSION_MAP.items():
            if len(nodes) >= limit_val:
                break
            replacement = info.get("replacement", "")
            old_id = add_node(
                f"OLD-{old_std}",
                old_std,
                f"Withdrawn Standard ({info.get('reason', '')[:40]}...)",
                "Superseded / Legacy",
                1989,
                "SUPERSEDED",
                14,
                DOMAIN_COLORS["Superseded"]
            )
            target_id = None
            for n in nodes:
                if replacement in n["isNumber"]:
                    target_id = n["id"]
                    break
            if not target_id:
                target_id = add_node(
                    f"TARGET-{replacement}",
                    f"{replacement}:2015",
                    f"Consolidated Active Standard {replacement}",
                    "Civil / Structural",
                    2015,
                    "ACTIVE",
                    45,
                    DOMAIN_COLORS["Civil"]
                )
            add_edge(old_id, target_id, "SUPERSEDES", "Consolidated / Superseded")

        # Add Normative Test Methods
        test_mappings = [
            {"src": "IS-269", "test": "IS 4031 (Part 1-15)", "label": "Mandatory Physical Testing"},
            {"src": "IS-269", "test": "IS 4032:1985", "label": "Chemical Conformity Analysis"},
            {"src": "IS-1786", "test": "IS 1608:2022", "label": "Tensile & Yield Protocol"},
            {"src": "IS-1786", "test": "IS 1599:2019", "label": "Mandatory Bend & Rebend Test"},
            {"src": "IS-2062", "test": "IS 1757:2020", "label": "Charpy V-Notch Impact Test"},
            {"src": "IS-4984", "test": "IS 2530:1963", "label": "Hydrostatic & Density Test"},
        ]
        for tm in test_mappings:
            if len(nodes) >= limit_val:
                break
            test_id = add_node(
                f"TEST-{tm['test']}",
                tm["test"],
                f"Mandatory Laboratory Test Protocol for {tm['test']}",
                "Testing Methods",
                2021,
                "ACTIVE",
                38,
                DOMAIN_COLORS["Testing"]
            )
            add_edge(tm["src"], test_id, "TEST_METHOD", tm["label"])

        add_edge("IS-456", "IS-269", "NORMATIVE", "Permitted Cement Binder")
        add_edge("IS-456", "IS-1786", "NORMATIVE", "Mandatory Reinforcement Rebar")
        add_edge("IS-13252", "IS-16842", "CO_PROCUREMENT", "Mandatory CRS Safety Gate")

    # Filter edges so only existing nodes are connected
    valid_node_ids = {n["id"] for n in nodes}
    valid_edges = [e for e in edges if e["source"] in valid_node_ids and e["target"] in valid_node_ids]

    return {
        "center": (center.strip() if (center and center.strip().upper().startswith("IS ")) else center_is_num) if (center and center.strip().upper() != "ALL") else "IS 269:2015",
        "resolved_standard": center_is_num if (center and center.strip().upper() != "ALL") else "IS 269:2015",
        "resolved_title": center_title if (center and center.strip().upper() != "ALL") else "Ordinary Portland Cement (33, 43, 53)",
        "product_query": center if (center and center.strip().upper() != "ALL") else None,
        "total_indexed": len(tri.master_standards) if tri.master_standards else 22011,
        "nodes_count": len(nodes),
        "edges_count": len(valid_edges),
        "nodes": nodes,
        "edges": valid_edges,
        "knowledge_graph_hubs": len(tri.normative_graph),
        "qco_mappings": len(tri.qco_matrix),
    }


@router.get("/lineage", summary="Fetch Historical Evolution & Supersession Lineage for Any Standard")
def get_standard_historical_lineage(
    standard: str = Query(..., description="Standard code to trace lineage (e.g. IS 15683, IS 8112, IS 12269, IS 269, IS 1786, IS 2062, IS 7098, IS 2925, IS 10500, etc.)")
) -> Dict[str, Any]:
    """
    Dynamically traces the phylogenetic historical evolution, supersessions, revisions,
    reaffirmations, amendments, and statutory quality gates for ANY standard from the 22,011
    Bureau of Indian Standards catalog using factual deterministic catalog indexing (< 5ms, zero LLM calls).
    """
    svc = HistoricalLineageService()
    return svc.get_lineage(standard)



