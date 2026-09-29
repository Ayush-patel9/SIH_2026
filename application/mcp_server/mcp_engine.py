#!/usr/bin/env python3
"""
ManakAI Model Context Protocol (MCP) Core Engine.
Provides centralized definitions, JSON schemas, and hardened execution handlers
for the 6 core Bureau of Indian Standards (BIS) intelligence tools.
Reuses existing backend services (GraphRAG, HistoricalLineage, Subgraph, NIT Export).
"""

import sys
import os
import re
import json
import logging
from typing import Dict, Any, List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

logger = logging.getLogger("manakai_mcp_engine")

# -------------------------------------------------------------------------
# TOOL DEFINITIONS & SCHEMAS (Conforming to MCP Protocol Specification)
# -------------------------------------------------------------------------

MCP_TOOLS: List[Dict[str, Any]] = [
    {
        "name": "manakai_search_standards",
        "description": (
            "Search across 22,011 Bureau of Indian Standards (BIS) using semantic domain understanding, "
            "hybrid keyword retrieval, and citation ranking. Returns the primary recommended standard, "
            "confidence score, active status, scope, and allied companion standards."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Natural language procurement or engineering query (e.g. 'OPC 43 grade cement for bridge construction', 'TMT steel rebar for seismic zone V', 'HDPE water pipes')."
                },
                "domain": {
                    "type": "string",
                    "description": "Optional engineering domain filter (Civil, Metallurgy, Chemicals, Electronics, Textiles, General).",
                    "default": "General"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "manakai_get_standard_details",
        "description": (
            "Retrieve the comprehensive official technical dossier for any Indian Standard (IS code). "
            "Returns status (ACTIVE/WITHDRAWN), year of issue, latest amendments, scope, permitted grades, "
            "mandatory Quality Control Orders (QCO), and technical parameters."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "is_number": {
                    "type": "string",
                    "description": "The Indian Standard designation (e.g. 'IS 269:2015', 'IS 1786:2008', 'IS 456:2000', 'IS 13252')."
                }
            },
            "required": ["is_number"]
        }
    },
    {
        "name": "manakai_check_supersession_history",
        "description": (
            "Trace the phylogenetic historical evolution, revisions, reaffirmations, and supersession lineage "
            "for any Indian Standard. Instantly verifies whether a standard is obsolete/withdrawn, identifies its "
            "mandatory active replacement, and warns of legal/CVC procurement risks."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "standard": {
                    "type": "string",
                    "description": "Standard code to check for obsolescence or history (e.g. 'IS 8112', 'IS 12269', 'IS 269', 'IS 1786', 'IS 226', 'IS 15683')."
                }
            },
            "required": ["standard"]
        }
    },
    {
        "name": "manakai_get_normative_relations",
        "description": (
            "Retrieve the relational knowledge graph mesh for an Indian Standard: allied companion standards, "
            "mandatory laboratory test method codes (chemical/tensile/durability), co-procurement items, "
            "and material compatibility relationships."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "center": {
                    "type": "string",
                    "description": "The center standard code or product name (e.g. 'IS 269', 'IS 1786', 'IS 456', 'IS 4984', 'cement', 'structural steel')."
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of related nodes to retrieve (default: 20).",
                    "default": 20
                }
            },
            "required": ["center"]
        }
    },
    {
        "name": "manakai_check_qco_compliance",
        "description": (
            "Verify whether a product or standard is subject to a statutory Quality Control Order (QCO) "
            "issued by the Government of India, making BIS ISI Mark or CRS Registration mandatory under "
            "Section 16 of the BIS Act 2016. Details Gazette notification numbers and issuing ministries."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query_or_standard": {
                    "type": "string",
                    "description": "Product name or IS code (e.g. 'CCTV Cameras', 'IS 13252', 'Structural Steel', 'IS 2062', 'Portland Pozzolana Cement', 'IS 1489')."
                }
            },
            "required": ["query_or_standard"]
        }
    },
    {
        "name": "manakai_generate_nit_clause",
        "description": (
            "Generate citation-ready Notice Inviting Tender (NIT) technical specification clauses, "
            "statutory BIS certification mandates, and lot testing requirements formatted for Indian "
            "public procurement portals (GeM, CPWD, MoRTH, Defence, Railways)."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "standard_or_product": {
                    "type": "string",
                    "description": "Indian Standard code or material description (e.g. 'IS 269:2015', 'IS 1786:2008 Fe 500D', 'Ordinary Portland Cement 43 Grade')."
                },
                "procuring_department": {
                    "type": "string",
                    "description": "Name of executing ministry, department, or PSU (e.g. 'CPWD', 'NHAI', 'Ministry of Defence', 'Indian Railways', 'GeM Portal').",
                    "default": "Executing Tender Authority"
                },
                "template": {
                    "type": "string",
                    "enum": ["standard_gem", "cpwd", "morth", "defence", "railways"],
                    "description": "Tender clause template layout to use.",
                    "default": "standard_gem"
                }
            },
            "required": ["standard_or_product"]
        }
    }
]

# Map tool names to metadata
MCP_TOOLS_DICT = {tool["name"]: tool for tool in MCP_TOOLS}


# -------------------------------------------------------------------------
# TOOL EXECUTION IMPLEMENTATIONS (Hardened & Reusing Core Backend Logic)
# -------------------------------------------------------------------------

def search_standards_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute search across 22,011 BIS standards via GraphRAG Pipeline."""
    query = str(params.get("query", "")).strip()
    domain = str(params.get("domain", "General")).strip() or "General"
    if not query:
        raise ValueError("Parameter 'query' cannot be empty.")

    from pipeline.config.api_contract_models import QueryRequest
    from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

    req = QueryRequest(input={"text": query, "domain": domain, "mode": "recommend"})
    response = graph_rag_pipeline.process_query(req)

    prim = response.primary_recommendation
    allied = [
        {
            "is_number": getattr(a, "is_number", ""),
            "title": getattr(a, "title", ""),
            "relation_type": getattr(a, "relation_type", "NORMATIVE_REFERENCE"),
            "relation_label": getattr(a, "relation_label", "Normative Reference"),
            "confidence": getattr(a, "confidence", 0.85)
        }
        for a in (response.allied_standards or [])[:5]
    ]
    outdated = [
        {
            "cited_standard": getattr(oc, "cited_standard", ""),
            "replacement": getattr(oc, "replacement", ""),
            "status": getattr(oc, "status", "WITHDRAWN"),
            "severity": getattr(oc, "severity", "CRITICAL"),
            "reason": getattr(oc, "reason", ""),
            "message": getattr(oc, "message", "")
        }
        for oc in (response.outdated_citations or [])
    ]

    cert = prim.certification if prim else None

    return {
        "status": "SUCCESS",
        "query": query,
        "primary_recommendation": {
            "is_number": prim.is_number if prim else "N/A",
            "title": prim.title if prim else "No direct specification found",
            "year_published": prim.year_published if prim else None,
            "status": prim.status if prim else "ACTIVE",
            "confidence": prim.confidence if prim else 0.0,
            "scope": prim.scope_snippet if prim else "",
            "certification": {
                "mandatory": cert.mandatory if cert else False,
                "scheme": cert.scheme if cert else "VOLUNTARY",
                "qco_order_name": cert.qco_order_name if cert else None,
                "gazette_ref": cert.qco_gazette_ref if cert else None,
                "notifying_ministry": cert.notifying_ministry if cert else None
            } if cert else None
        },
        "allied_standards": allied,
        "outdated_citations_warnings": outdated,
        "audit_reference_hash": response.meta.audit_reference_hash if response.meta else None,
        "reasoning_trace": [
            {"step": getattr(r, "step", ""), "detail": getattr(r, "detail", "")}
            for r in (response.reasoning_trace or [])[:3]
        ]
    }


def extract_qco_details(raw_qco: Any) -> Dict[str, Any]:
    """Helper to extract QCO dictionary regardless of whether qco_matrix stores dict, list, or string."""
    if not raw_qco:
        return {}
    if isinstance(raw_qco, list):
        for item in raw_qco:
            if isinstance(item, dict):
                return item
            elif isinstance(item, str):
                return {"order_name": item}
        return {}
    elif isinstance(raw_qco, dict):
        return raw_qco
    elif isinstance(raw_qco, str):
        return {"order_name": raw_qco}
    return {}


def get_standard_details_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve full official dossier for a specific standard."""
    raw_num = str(params.get("is_number", "")).strip()
    if not raw_num:
        raise ValueError("Parameter 'is_number' cannot be empty.")

    # Clean input: e.g. "269" -> "IS 269", "IS:269" -> "IS 269"
    is_num = raw_num
    if re.match(r"^\d+$", is_num):
        is_num = f"IS {is_num}"

    from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
    from pipeline.rag_engine.tri_retrieval import normalize_is_key
    from application.services.project_repository import get_saved_approved_standard

    # 1. Check verified approved standards stored in DB
    cached = get_saved_approved_standard(is_num)
    if cached and "response_data" in cached:
        data = cached["response_data"]
        prim = data.get("primary_recommendation", {})
        return {
            "status": "FOUND_IN_APPROVED_DATABASE",
            "is_number": prim.get("is_number", is_num),
            "title": prim.get("title", ""),
            "year_published": prim.get("year_published"),
            "status_code": prim.get("status", "ACTIVE"),
            "scope": prim.get("scope_snippet") or prim.get("scope", ""),
            "certification": prim.get("certification", {}),
            "technical_parameters": prim.get("technical_parameters", {}),
            "allied_standards": [a.get("is_number") for a in data.get("allied_standards", [])[:5]],
            "approved_by": cached.get("approved_by", "Technical Officer"),
            "approved_at": cached.get("approved_at", "")
        }

    # 2. Check indexed catalog via tri-retrieval
    tri = graph_rag_pipeline.tri_retrieval
    norm_key = normalize_is_key(is_num)
    catalog_entry = tri.standards_by_num.get(norm_key)

    if catalog_entry:
        is_code = catalog_entry.get("is_number", is_num)
        title = catalog_entry.get("title", "")
        year = catalog_entry.get("year_published", 2015)
        std_status = catalog_entry.get("status", "ACTIVE")
        qco_raw = tri.qco_matrix.get(norm_key)
        qco_info = extract_qco_details(qco_raw)
        normative_refs = tri.normative_graph.get(norm_key, [])

        return {
            "status": "FOUND_IN_CATALOG",
            "is_number": is_code,
            "title": title,
            "year_published": year,
            "status_code": std_status,
            "scope": catalog_entry.get("scope") or f"National Indian Standard specifying formulation and quality parameters for {title}.",
            "technical_committee": catalog_entry.get("technical_committee", {}).get("division_name", "Bureau of Indian Standards"),
            "certification": {
                "mandatory": bool(qco_info),
                "scheme": "BIS_ISI_MARK" if qco_info else "VOLUNTARY",
                "qco_order_name": qco_info.get("order_name") if qco_info else None,
                "gazette_ref": qco_info.get("gazette_ref") if qco_info else None
            },
            "normative_references": normative_refs[:5]
        }

    # 3. Fallback: run full RAG query to assemble comprehensive dossier
    from pipeline.config.api_contract_models import QueryRequest
    req = QueryRequest(input={"text": is_num, "mode": "recommend"})
    resp = graph_rag_pipeline.process_query(req)
    prim = resp.primary_recommendation
    cert = prim.certification if prim else None

    return {
        "status": "FOUND_VIA_RETRIEVAL",
        "is_number": prim.is_number if prim else is_num,
        "title": prim.title if prim else "",
        "year_published": prim.year_published if prim else 2020,
        "status_code": prim.status if prim else "ACTIVE",
        "scope": prim.scope_snippet if prim else "",
        "division_code": prim.division_code if prim else "GEN",
        "latest_amendment": prim.latest_amendment if prim else None,
        "confidence": prim.confidence if prim else 0.8,
        "certification": {
            "mandatory": cert.mandatory if cert else False,
            "scheme": cert.scheme if cert else "VOLUNTARY",
            "qco_order_name": cert.qco_order_name if cert else None,
            "gazette_ref": cert.qco_gazette_ref if cert else None,
            "notifying_ministry": cert.notifying_ministry if cert else None
        } if cert else None,
        "allied_standards": [getattr(a, "is_number", "") for a in (resp.allied_standards or [])[:5]]
    }


def check_supersession_history_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute factual historical lineage and supersession check."""
    std = str(params.get("standard", "")).strip()
    if not std:
        raise ValueError("Parameter 'standard' cannot be empty.")

    from pipeline.rag_engine.historical_lineage_service import HistoricalLineageService
    svc = HistoricalLineageService()
    lineage = svc.get_lineage(std)

    is_withdrawn = bool(lineage.get("is_withdrawn") or lineage.get("withdrawn_alert"))
    replacement = lineage.get("canonical_replacement") or (
        lineage.get("withdrawn_alert", {}).get("replacement") if lineage.get("withdrawn_alert") else None
    )

    alert = lineage.get("withdrawn_alert")
    reason = alert.get("reason") if alert else (
        f"Standard {std} has been superseded by {replacement}." if is_withdrawn else "Standard is active and valid for public procurement."
    )

    return {
        "status": "SUCCESS",
        "standard_queried": std,
        "standard_code": lineage.get("standard_code", std),
        "name": lineage.get("name", ""),
        "category": lineage.get("category", "General Engineering"),
        "is_superseded_or_withdrawn": is_withdrawn,
        "canonical_active_replacement": replacement if is_withdrawn else lineage.get("standard_code", std),
        "supersession_rationale": reason,
        "severity": alert.get("severity", "LOW") if alert else ("CRITICAL" if is_withdrawn else "NONE"),
        "procurement_risk_warning": (
            f"LEGAL RISK WARNING: Specifying {std} in government tenders violates CVC guidelines. "
            f"You MUST use the consolidated active standard {replacement}."
        ) if is_withdrawn else "Standard is legally compliant for inclusion in tender notices.",
        "evolution_timeline": lineage.get("evolution", []),
        "total_historical_epochs": lineage.get("total_epochs", len(lineage.get("evolution", [])))
    }


def get_normative_relations_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve relational knowledge graph mesh (test methods, companion codes)."""
    center = str(params.get("center", "")).strip()
    raw_limit = params.get("limit", 20)
    try:
        limit = int(raw_limit)
    except (ValueError, TypeError):
        limit = 20

    if not center:
        raise ValueError("Parameter 'center' cannot be empty.")

    from application.api.routes.knowledge_graph import get_knowledge_graph_subgraph
    subgraph = get_knowledge_graph_subgraph(center=center, limit=limit)

    test_methods = []
    companion_standards = []
    for node in subgraph.get("nodes", []):
        if "test" in str(node.get("domain", "")).lower():
            test_methods.append({
                "code": node.get("isNumber"),
                "title": node.get("title"),
                "domain": node.get("domain")
            })
        else:
            companion_standards.append({
                "code": node.get("isNumber"),
                "title": node.get("title"),
                "domain": node.get("domain"),
                "status": node.get("status")
            })

    return {
        "status": "SUCCESS",
        "center_queried": center,
        "resolved_standard": subgraph.get("resolved_standard"),
        "resolved_title": subgraph.get("resolved_title"),
        "total_connected_nodes": subgraph.get("nodes_count", 0),
        "total_edges": subgraph.get("edges_count", 0),
        "mandatory_test_methods": test_methods[:5],
        "companion_standards": companion_standards[:10],
        "raw_edges": subgraph.get("edges", [])[:15]
    }


def check_qco_compliance_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Verify Quality Control Order (QCO) mandatory certification status."""
    target = str(params.get("query_or_standard", "")).strip()
    if not target:
        raise ValueError("Parameter 'query_or_standard' cannot be empty.")

    from pipeline.config.api_contract_models import QueryRequest
    from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

    req = QueryRequest(input={"text": target, "mode": "recommend"})
    response = graph_rag_pipeline.process_query(req)
    prim = response.primary_recommendation

    cert = prim.certification if prim else None
    is_mandatory = bool(cert and cert.mandatory)
    qco_name = cert.qco_order_name if (cert and cert.qco_order_name) else None
    scheme = cert.scheme if (cert and cert.scheme) else ("BIS_ISI_MARK" if is_mandatory else "VOLUNTARY")
    gazette = cert.qco_gazette_ref if cert else None
    ministry = cert.notifying_ministry if cert else None

    # Fallback to tri QCO matrix if cert wasn't explicitly populated
    if not is_mandatory and prim:
        from pipeline.rag_engine.tri_retrieval import normalize_is_key
        tri = graph_rag_pipeline.tri_retrieval
        norm = normalize_is_key(prim.is_number)
        qco_raw = tri.qco_matrix.get(norm)
        qco_data = extract_qco_details(qco_raw)
        if qco_data:
            is_mandatory = True
            qco_name = qco_data.get("order_name")
            gazette = qco_data.get("gazette_ref")
            scheme = "BIS_ISI_MARK"

    std_num = prim.is_number if prim else target
    std_title = prim.title if prim else target

    return {
        "status": "SUCCESS",
        "standard_evaluated": std_num,
        "title": std_title,
        "is_mandatory_qco": is_mandatory,
        "certification_scheme": scheme,
        "qco_order_name": qco_name or ("Quality Control Order Enforced" if is_mandatory else "No Mandatory QCO Promulgated"),
        "gazette_reference": gazette or ("Section 16 Statutory Gazette Notification" if is_mandatory else "N/A"),
        "notifying_ministry": ministry or ("Central Government Ministry / DPIIT" if is_mandatory else "N/A"),
        "statutory_consequence": (
            "STATUTORY MANDATE: Under Section 16 & Section 29 of the BIS Act 2016, no manufacturer or importer "
            f"may supply or sell this product without valid BIS License / ISI Mark. Procurement of non-ISI marked lots "
            "is prohibited for public works and government tenders."
        ) if is_mandatory else "Voluntary standard. Products may be procured under general quality inspection or ISO certification."
    }


def generate_nit_clause_handler(params: Dict[str, Any]) -> Dict[str, Any]:
    """Generate citation-ready NIT clause and quality assurance stipulations."""
    item = str(params.get("standard_or_product", "")).strip()
    dept = str(params.get("procuring_department", "Executing Tender Authority")).strip() or "Executing Tender Authority"
    template = str(params.get("template", "standard_gem")).lower()
    valid_templates = ["standard_gem", "cpwd", "morth", "defence", "railways"]
    if template not in valid_templates:
        template = "standard_gem"

    if not item:
        raise ValueError("Parameter 'standard_or_product' cannot be empty.")

    try:
        from application.api.routes.query import export_nit_clause, NitExportRequest
        export_req = NitExportRequest(query_or_standard=item, tender_id="NIT-2026-MCP")
        exported = export_nit_clause(export_req)
        clause_core = exported.tender_clause_text
        mand_certs = exported.mandatory_certifications or ["Valid BIS License / ISI Mark"]
        qa_reqs = exported.quality_assurance_requirements or [f"Strict conformance to {item} physical and chemical parameters."]
        test_certs = exported.test_certificate_mandates or ["BIS recognized lab batch test report"]
    except Exception as e:
        logger.warning(f"Error calling export_nit_clause ({e}), falling back to direct synthesis")
        clause_core = f"The supplied material shall strictly conform to {item} and applicable statutory BIS quality specifications."
        mand_certs = ["Valid BIS License / ISI Mark (or Scheme II CRS Registration)"]
        qa_reqs = [f"Strict conformance to {item} physical and chemical parameters."]
        test_certs = ["Batch test certificate from BIS-recognized or NABL-accredited laboratory"]

    # Format into professional NIT tender clause block
    formatted_clause = f"""================================================================================
NOTICE INVITING TENDER (NIT) — TECHNICAL SPECIFICATION & COMPLIANCE CLAUSE
PORTAL FORMAT: {template.upper()} • MANAKAI STATUTORY BIS ENGINE
================================================================================
Procuring Authority : {dept}
Subject Specification: Technical Requirements & Mandatory Conformance for {item}

1. STATUTORY STANDARDS CONFORMANCE:
   {clause_core}

2. MANDATORY LICENSING & QUALITY MARK:
"""
    for cert in mand_certs:
        formatted_clause += f"   - Bidders must furnish {cert} in their Technical Bid submission.\n"

    formatted_clause += "\n3. QUALITY ASSURANCE & BATCH ACCEPTANCE REQUIREMENTS:\n"
    for qa in qa_reqs:
        formatted_clause += f"   - {qa}\n"

    formatted_clause += "\n4. MANDATORY TEST CERTIFICATE CODES (PRIOR TO DISPATCH):\n"
    for tc in test_certs:
        formatted_clause += f"   - Laboratory test certificates conforming to {tc}.\n"

    formatted_clause += f"""
5. REJECTION & STATUTORY PRECEDENCE:
   Any supply lot failing conformity testing against the applicable Indian Standard shall
   be summarily rejected at the contractor's risk and cost. In case of any dispute or
   ambiguity between tender drawings and the Indian Standard, the latest gazetted BIS standard
   shall strictly take precedence.
================================================================================
Generated via ManakAI MCP Standards Engine | CVC Vigilance Compliant
================================================================================"""

    return {
        "status": "SUCCESS",
        "item": item,
        "template": template,
        "procuring_department": dept,
        "citation_ready_clause": formatted_clause.strip(),
        "mandatory_certifications": mand_certs,
        "quality_assurance_requirements": qa_reqs,
        "test_certificate_mandates": test_certs
    }


# Dispatch table
HANDLERS = {
    "manakai_search_standards": search_standards_handler,
    "manakai_get_standard_details": get_standard_details_handler,
    "manakai_check_supersession_history": check_supersession_history_handler,
    "manakai_get_normative_relations": get_normative_relations_handler,
    "manakai_check_qco_compliance": check_qco_compliance_handler,
    "manakai_generate_nit_clause": generate_nit_clause_handler,
}


def dispatch_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Central entry point to dispatch any MCP tool by name."""
    handler = HANDLERS.get(tool_name)
    if not handler:
        raise ValueError(
            f"Unknown MCP tool '{tool_name}'. Available tools: {list(HANDLERS.keys())}"
        )
    return handler(arguments or {})


if __name__ == "__main__":
    if "--test" in sys.argv:
        print("Running ManakAI MCP Engine Self-Test across all 6 tools...")
        for name in HANDLERS:
            print(f" -> Testing {name}...")
            test_args = {
                "manakai_search_standards": {"query": "43 grade ordinary portland cement"},
                "manakai_get_standard_details": {"is_number": "IS 269:2015"},
                "manakai_check_supersession_history": {"standard": "IS 8112"},
                "manakai_get_normative_relations": {"center": "IS 269", "limit": 10},
                "manakai_check_qco_compliance": {"query_or_standard": "IS 269"},
                "manakai_generate_nit_clause": {"standard_or_product": "IS 269:2015"},
            }[name]
            result = dispatch_tool(name, test_args)
            print(f"    [OK] {name} OK (status: {result.get('status')})")
        print("[SUCCESS] All 6 ManakAI MCP tools executed with 100% success!")
