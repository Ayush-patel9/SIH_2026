#!/usr/bin/env python3
"""
FastAPI REST Server for SIH 2026 — BIS Standards Intelligence Platform.
Provides high-performance, contract-validated REST API endpoints for:
- Standards Intelligence & GraphRAG Querying
- Multi-Item Tender Document Decomposition
- Human-in-the-Loop Feedback Loop
- Proactive Staleness & Supersession Alerts
- NIT Spec Draft Exporting
"""

import sys
import os
import logging
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from application.api.routes.health import router as health_router
from application.api.routes.query import router as query_router
from application.api.routes.feedback import router as feedback_router
from application.api.routes.alerts import router as alerts_router
from application.api.routes.websocket import router as websocket_router
from application.api.routes.knowledge_graph import router as knowledge_graph_router
from application.api.routes.tender_pipeline import router as tender_pipeline_router
try:
    from application.api.routes.tender_temporal import router as tender_temporal_router
except ImportError:
    tender_temporal_router = None
from application.api.routes.projects import router as projects_router
from application.api.routes.gazette import router as gazette_router
from application.api.routes.mcp_router import router as mcp_router
from application.api.routes.heartbeat import router as heartbeat_router
from application.services.project_repository import init_db, seed_initial_projects_if_empty
from application.services.s2_heartbeat_service import s2_heartbeat_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("bis_platform_api")

app = FastAPI(
    title="BIS Standards Intelligence Platform API",
    description=(
        "Production-grade Knowledge-Graph Augmented RAG (GraphRAG) API for Indian Standards (BIS). "
        "Enforces 100% strict compliance with API_CONTRACT_SCHEMA.md (StandardsResponse v1)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Startup lifecycle: Initialize Neon PostgreSQL tables and seed if empty
@app.on_event("startup")
def on_startup():
    try:
        logger.info("Initializing Neon PostgreSQL connection and schema...")
        init_db()
        seed_initial_projects_if_empty()
        # Initialize S2 mutual keepalive
        s2_heartbeat_service.init_tables()
        s2_heartbeat_service.load_state_from_db()
        s2_heartbeat_service.start()
        logger.info("✓ Neon PostgreSQL startup verification & S2 heartbeat service complete.")
    except Exception as e:
        logger.warning(f"Could not connect to database on startup: {e}")

@app.on_event("shutdown")
def on_shutdown():
    try:
        logger.info("Stopping S2 heartbeat & scheduler service...")
        s2_heartbeat_service.stop()
    except Exception as e:
        logger.warning(f"Error shutting down S2 heartbeat service: {e}")

# Enable Full CORS for Next.js / Vite / React frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router)
app.include_router(query_router)
app.include_router(feedback_router)
app.include_router(alerts_router)
app.include_router(websocket_router)
app.include_router(knowledge_graph_router)
app.include_router(tender_pipeline_router)
if tender_temporal_router:
    app.include_router(tender_temporal_router)
app.include_router(projects_router)
app.include_router(gazette_router)
app.include_router(mcp_router, prefix="/api/v1/mcp")
app.include_router(mcp_router, prefix="/mcp")
app.include_router(heartbeat_router)

@app.get("/health", summary="Health Check")
@app.get("/api/health", summary="Health Check (API Prefix)")
def root_health():
    return {"status": "HEALTHY", "service": "BIS Standards Intelligence Platform API"}

@app.get("/", summary="Root Index")
def read_root():
    return {
        "service": "SIH 2026 — BIS Standards Intelligence Platform",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/v1/health",
            "query": "/api/v1/query (POST)",
            "tender_upload": "/api/v1/tender-upload (POST)",
            "export_nit": "/api/v1/export-nit (POST)",
            "feedback": "/api/v1/feedback (POST/GET)",
            "alerts": "/api/v1/alerts (GET)",
            "mcp_rpc": "/api/v1/mcp/rpc (JSON-RPC 2.0)",
            "mcp_tools": "/api/v1/mcp/tools (GET)",
            "mcp_call": "/api/v1/mcp/call (POST)"
        }
    }

def _cors_headers(request: Request, extra_headers: Optional[dict] = None) -> dict:
    origin = request.headers.get("origin", "*")
    h = {
        "Access-Control-Allow-Origin": origin if origin else "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    if extra_headers:
        h.update(extra_headers)
    return h

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "ERROR",
            "message": exc.detail,
            "path": request.url.path
        },
        headers=_cors_headers(request, exc.headers)
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "ERROR", "message": exc.detail, "path": request.url.path},
            headers=_cors_headers(request, exc.headers)
        )
    logger.error(f"Global unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "ERROR",
            "message": "Internal Server Error during pipeline execution.",
            "error_detail": str(exc),
            "path": request.url.path
        },
        headers=_cors_headers(request)
    )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting BIS Standards Intelligence Platform REST API on http://0.0.0.0:8000...")
    uvicorn.run("application.api.main:app", host="0.0.0.0", port=8000, reload=True)
