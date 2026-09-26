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
from fastapi import FastAPI, Request
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
            "alerts": "/api/v1/alerts (GET)"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "ERROR",
            "message": "Internal Server Error during pipeline execution.",
            "error_detail": str(exc),
            "path": request.url.path
        }
    )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting BIS Standards Intelligence Platform REST API on http://0.0.0.0:8000...")
    uvicorn.run("application.api.main:app", host="0.0.0.0", port=8000, reload=True)
