from fastapi import APIRouter
from datetime import datetime, timezone
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from pipeline.rag_engine.llm_gateway import llm_gateway

router = APIRouter(prefix="/api/v1", tags=["Health & Diagnostics"])

@router.get("/health")
def get_health():
    """System health diagnostics, catalog counts, and gateway status."""
    return {
        "status": "HEALTHY",
        "service": "SIH 2026 — BIS Standards Intelligence Platform API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engine": {
            "indexed_standards_count": len(graph_rag_pipeline.tri_retrieval.standards_by_num),
            "knowledge_graph_hubs": len(graph_rag_pipeline.tri_retrieval.normative_graph),
            "qco_mappings_count": len(graph_rag_pipeline.tri_retrieval.qco_matrix),
            "crs_products_count": len(graph_rag_pipeline.tri_retrieval.crs_products),
            "llm_gateway_online": llm_gateway.is_available(),
            "llm_key_pool_size": len(llm_gateway.keys)
        }
    }
