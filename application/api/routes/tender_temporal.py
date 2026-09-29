"""
FastAPI Router for Temporal.io Durable Workflow Ingestion.
Endpoints:
- POST /api/v1/tender/temporal/start: Trigger async durable tender processing workflow
- POST /api/v1/tender/temporal/upload: Upload PDF file & trigger workflow directly (with size limits & Cloudinary backing)
- GET  /api/v1/tender/temporal/status/{workflow_id}: Query real-time workflow stage, progress & results
- POST /api/v1/tender/temporal/signal/{workflow_id}: Send Human-in-the-Loop clarification responses
- GET  /api/v1/tender/temporal/health: Health diagnostic of Temporal connection
"""

import os
import uuid
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from application.temporal.models import (
    TenderWorkflowInput,
    WorkflowProgressState,
    ClarificationSignalPayload
)
from application.temporal.client import (
    start_tender_workflow,
    query_workflow_progress,
    send_clarification_signal,
    check_temporal_health
)
from application.temporal.config import TEMPORAL_UI_URL
from application.services.cloudinary_service import upload_pdf_bytes, CLOUDINARY_CONFIGURED

logger = logging.getLogger("manakai.api.temporal")

router = APIRouter(prefix="/api/v1/tender/temporal", tags=["Temporal Durable Ingestion Engine"])

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB Cap to prevent OOM Denial of Service


@router.get("/health", summary="Temporal Engine Health Check")
async def temporal_health():
    """
    Checks if the Temporal Server and Client connection are operational.
    """
    health = await check_temporal_health()
    return {
        **health,
        "ui_url": TEMPORAL_UI_URL
    }


@router.post("/start", summary="Start Durable Ingestion Workflow (JSON)")
async def start_workflow_endpoint(input_data: TenderWorkflowInput):
    """
    Starts an asynchronous, fault-tolerant tender decomposition and IS mapping workflow.
    Returns immediately with workflow_id and Temporal UI link.
    """
    try:
        result = await start_tender_workflow(input_data.model_dump())
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Error starting Temporal workflow: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Could not start Temporal workflow: {str(e)}. Ensure Temporal Server is running."
        )


@router.post("/upload", summary="Upload PDF & Start Durable Ingestion Workflow")
async def upload_and_start_workflow(
    file: UploadFile = File(...),
    tender_title: Optional[str] = Form("Government Procurement Tender"),
    issuing_authority: Optional[str] = Form("Government / PSU"),
    project_id: Optional[str] = Form(None),
    auto_finalize: bool = Form(True)
):
    """
    Uploads a tender PDF document and immediately dispatches a durable Temporal workflow.
    Enforces file size cap and uploads to Cloudinary for distributed multi-node worker availability.
    """
    try:
        content = await file.read()
        
        # Security: Enforce 50MB file size limit
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File size ({len(content) / (1024*1024):.1f}MB) exceeds maximum permitted limit of 50MB."
            )

        # Save local copy in data/tenders
        tenders_dir = Path("data") / "tenders"
        tenders_dir.mkdir(parents=True, exist_ok=True)
        
        file_ext = Path(file.filename or "doc.pdf").suffix or ".pdf"
        safe_filename = f"tender_{uuid.uuid4().hex[:10]}{file_ext}"
        saved_path = tenders_dir / safe_filename

        with open(saved_path, "wb") as f:
            f.write(content)

        # Upload to Cloudinary if configured for distributed access
        cloudinary_url = None
        if CLOUDINARY_CONFIGURED:
            try:
                c_res = upload_pdf_bytes(content, filename=file.filename or safe_filename)
                cloudinary_url = c_res.get("secure_url") or c_res.get("url")
            except Exception as ce:
                logger.warning(f"Could not upload to Cloudinary: {ce}")

        input_data = TenderWorkflowInput(
            file_path=str(saved_path.resolve()),
            cloudinary_url=cloudinary_url,
            tender_title=tender_title,
            issuing_authority=issuing_authority,
            project_id=project_id,
            auto_finalize=auto_finalize
        )

        result = await start_tender_workflow(input_data.model_dump())
        return {
            **result,
            "filename": file.filename,
            "bytes_saved": len(content),
            "local_path": str(saved_path),
            "cloudinary_url": cloudinary_url
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process upload with Temporal: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload & workflow initiation failed: {str(e)}"
        )


@router.get("/status/{workflow_id}", summary="Query Real-Time Workflow Progress")
async def get_workflow_status_endpoint(workflow_id: str):
    """
    Queries real-time execution status, progress percentage, current stage,
    and partial or complete results for the specified workflow.
    """
    try:
        progress = await query_workflow_progress(workflow_id)
        return progress
    except Exception as e:
        logger.error(f"Error querying workflow {workflow_id}: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Workflow not found or could not query status: {str(e)}"
        )


@router.post("/signal/{workflow_id}", summary="Send Human-in-the-Loop Clarification Answers")
async def send_signal_endpoint(workflow_id: str, payload: ClarificationSignalPayload):
    """
    Resumes a paused workflow by sending user-selected clarification answers.
    """
    try:
        res = await send_clarification_signal(workflow_id, payload.selected_options)
        return res
    except Exception as e:
        logger.error(f"Error signaling workflow {workflow_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to signal workflow: {str(e)}"
        )
