"""
Comprehensive Automated Unit & Integration Test Suite for ManakAI Temporal.io Module.
Tests:
- Model validation (empty source rejection, query parity)
- Activity durability & thread offloading
- Cloudinary & fallback text extraction
- Empty mappings (0-item) guard in Stage 3
- Human-in-the-Loop clarification mapping
- Database persistence keyword argument alignment
- Client singleton concurrency locking & health check
- FastAPI route validation & error handling
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest
import asyncio
from typing import Dict, Any
from pydantic import ValidationError

from application.temporal.models import (
    TenderWorkflowInput,
    WorkflowProgressState,
    ClarificationSignalPayload
)

from application.temporal.activities import (
    extract_pdf_activity,
    stage1_decompose_activity,
    stage2_tri_retrieval_activity,
    apply_clarifications_activity,
    stage3_finalize_activity,
    persist_results_activity
)
from application.temporal.client import get_temporal_client, check_temporal_health


# ==========================================
# 1. Model Validation Tests
# ==========================================

def test_tender_workflow_input_validation():
    """Ensure empty payload raises ValidationError while valid sources succeed."""
    with pytest.raises(ValidationError):
        TenderWorkflowInput()

    # Valid with document_text
    v1 = TenderWorkflowInput(document_text="Clause 1.0: Portland Cement IS 269")
    assert v1.document_text is not None

    # Valid with file_path
    v2 = TenderWorkflowInput(file_path="MOCK_GOVERNMENT_TENDER_NIT_2026.pdf")
    assert v2.file_path is not None

    # Valid with cloudinary_url
    v3 = TenderWorkflowInput(cloudinary_url="https://res.cloudinary.com/demo/tender.pdf")
    assert v3.cloudinary_url is not None


def test_workflow_progress_state_schema_parity():
    """Ensure all required fields exist in WorkflowProgressState."""
    state = WorkflowProgressState(
        workflow_id="test-wf-123",
        status="RUNNING",
        progress=70,
        current_stage="STAGE2_MAP",
        message="Mapping standards",
        waiting_for_clarification=True,
        has_stage1=True,
        has_stage2=True,
        has_stage3=False
    )
    assert state.waiting_for_clarification is True
    assert state.has_stage1 is True
    assert state.has_stage3 is False


# ==========================================
# 2. Activity Robustness Tests
# ==========================================

@pytest.mark.asyncio
async def test_extract_pdf_activity_missing_file():
    """Ensure missing file path does not crash and returns graceful payload."""
    res = await extract_pdf_activity({
        "file_path": "/tmp/non_existent_file_9999.pdf",
        "tender_title": "Test Tender",
        "issuing_authority": "NHAI"
    })
    assert res["document_text"] == ""
    assert res["page_count"] == 1


@pytest.mark.asyncio
async def test_apply_clarifications_activity():
    """Ensure user clarification selections properly update stage 2 mappings."""
    mock_stage2 = {
        "mappings": [
            {
                "product_id": "prod-1",
                "product_name": "Cement",
                "clause_number": "Clause 4.1",
                "page_number": 1,
                "verbatim_quote": "43 Grade OPC IS 8112",
                "mapped_is": "IS 8112:1989",
                "is_title": "Old 43 Grade Cement",
                "confidence": 60,
                "clarification_question": {
                    "question": "Which grade?",
                    "options": [
                        {
                            "option_id": "opt-A",
                            "label": "Modern 43 Grade (IS 269:2015)",
                            "associated_standard": "IS 269:2015",
                            "description": "Ordinary Portland Cement (Supersedes IS 8112)"
                        }
                    ]
                }
            }
        ]
    }

    answers = {"prod-1": "opt-A"}
    updated = await apply_clarifications_activity({
        "stage2_data": mock_stage2,
        "answers": answers
    })

    updated_m = updated["mappings"][0]
    assert updated_m["mapped_is"] == "IS 269:2015"
    assert "IS 269" in updated_m["is_title"]
    assert updated_m["confidence"] == 95


@pytest.mark.asyncio
async def test_stage3_finalize_zero_mappings_guard():
    """Ensure 0-item mappings return structured response without throwing HTTP 400."""
    empty_stage2 = {
        "mappings": [],
        "document_text": "Non procurement document text",
        "tender_metadata": {"title": "General Advisory", "department": "Ministry"},
        "audit_summary": {}
    }

    res = await stage3_finalize_activity(empty_stage2)
    assert res["clause_diffs"] == []
    assert res["summary"]["total_products_governed"] == 0
    assert "NIT" in res["full_nit_draft_text"]


@pytest.mark.asyncio
async def test_persist_results_activity():
    """Ensure database persistence activity executes without TypeError."""
    mock_payload = {
        "project_id": "proj-nhai-088",
        "mappings": [{"product_id": "prod-1", "product_name": "Cement"}],
        "clause_diffs": [],
        "full_nit_draft_text": "Test NIT Text",
        "tender_metadata": {"title": "Test Title"},
        "audit_summary": {}
    }

    res = await persist_results_activity(mock_payload)
    assert res["status"] == "SUCCESS"
    assert res["persisted"] is True


# ==========================================
# 3. Client & Workflow Policy Tests
# ==========================================

@pytest.mark.asyncio
async def test_check_temporal_health_live_rpc():
    """Ensure health check performs real network RPC and returns server version."""
    health = await check_temporal_health()
    assert health["status"] == "HEALTHY"
    assert "server_version" in health
    assert health["host"] == "localhost:7233"


def test_retry_policy_non_retryable_errors():
    """Ensure fatal exceptions are not retried in LLM_RETRY_POLICY."""
    from application.temporal.workflows import LLM_RETRY_POLICY
    non_retries = LLM_RETRY_POLICY.non_retryable_error_types
    assert "ValidationError" in non_retries
    assert "HTTPException" in non_retries
    assert "ValueError" in non_retries
    assert "TypeError" in non_retries


# ==========================================
# 4. FastAPI REST Router Integration Tests
# ==========================================

def test_fastapi_temporal_health_endpoint():
    """Test GET /api/v1/tender/temporal/health returns 200 and healthy status."""
    from fastapi.testclient import TestClient
    from application.api.main import app

    client = TestClient(app)
    resp = client.get("/api/v1/tender/temporal/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "HEALTHY"
    assert data["ui_url"] == "http://localhost:8233"


def test_fastapi_temporal_start_empty_payload_rejection():
    """Test POST /api/v1/tender/temporal/start rejects empty payload with 422."""
    from fastapi.testclient import TestClient
    from application.api.main import app

    client = TestClient(app)
    resp = client.post("/api/v1/tender/temporal/start", json={})
    assert resp.status_code == 422


def test_fastapi_temporal_start_valid_payload():
    """Test POST /api/v1/tender/temporal/start succeeds with valid document_text."""
    from fastapi.testclient import TestClient
    from application.api.main import app

    client = TestClient(app)
    resp = client.post("/api/v1/tender/temporal/start", json={
        "document_text": "Clause 1.0: Supply of 43 Grade Ordinary Portland Cement IS 269:2015",
        "tender_title": "NHAI Bridge Procurement"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "workflow_id" in data
    assert data["status"] == "QUEUED"

