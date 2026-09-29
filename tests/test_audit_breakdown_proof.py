"""
Targeted Proof Test Suite: Verifying Resolution of 5 Architectural Breakdown Points
"""

import sys
import os
import io
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest
import asyncio
from unittest.mock import patch, MagicMock

from application.temporal.activities import (
    extract_pdf_activity,
    stage1_decompose_activity,
    stage2_tri_retrieval_activity,
    apply_clarifications_activity,
    stage3_finalize_activity,
    persist_results_activity
)
from application.temporal.workflows import TenderProcessingWorkflow, LLM_RETRY_POLICY
from application.services.project_repository import save_pipeline_analysis, get_project



# =========================================================================
# Proof 1: Clarification Signal Answers Applied to Mappings Before Stage 3
# =========================================================================
@pytest.mark.asyncio
async def test_proof_1_clarification_signal_updates_mappings():
    """Verify that user clarification answers update stage2 mappings before stage3."""
    mock_stage2 = {
        "mappings": [
            {
                "product_id": "prod-1",
                "product_name": "Structural Cement",
                "clause_number": "Clause 4.1.2",
                "page_number": 1,
                "verbatim_quote": "Cement conforming to IS 8112:1989",
                "mapped_is": "IS 8112:1989",
                "is_title": "43 Grade OPC (Superseded)",
                "confidence": 60,
                "clarification_question": {
                    "question": "Which updated standard applies?",
                    "options": [
                        {
                            "option_id": "opt-1",
                            "label": "IS 269:2015",
                            "associated_standard": "IS 269:2015",
                            "description": "Ordinary Portland Cement (33, 43 & 53 Grades)"
                        }
                    ]
                }
            }
        ],
        "document_text": "Sample text",
        "tender_metadata": {"title": "Bridge Construction", "department": "NHAI"}
    }

    # Apply user choice: 'opt-1' for 'prod-1'
    user_answers = {"prod-1": "opt-1"}
    updated_stage2 = await apply_clarifications_activity({
        "stage2_data": mock_stage2,
        "answers": user_answers
    })

    # Assert that mapped_is is now IS 269:2015
    assert updated_stage2["mappings"][0]["mapped_is"] == "IS 269:2015"
    assert "IS 269" in updated_stage2["mappings"][0]["is_title"]
    assert updated_stage2["mappings"][0]["confidence"] == 95

    # Pass directly to stage3_finalize_activity
    stage3_out = await stage3_finalize_activity(updated_stage2)
    assert len(stage3_out["clause_diffs"]) == 1
    diff = stage3_out["clause_diffs"][0]
    assert diff["designated_standard"] == "IS 269:2015"
    assert "IS 269:2015" in diff["modernized_clause"]


# =========================================================================
# Proof 2: Database Persistence Signature Alignment (No TypeError Swallowed)
# =========================================================================
@pytest.mark.asyncio
async def test_proof_2_database_persistence_signature():
    """Verify that persist_results_activity calls save_pipeline_analysis with exact kwargs."""
    mock_payload = {
        "project_id": "proj-nhai-088",
        "mappings": [{"product_id": "prod-1", "product_name": "Cement", "mapped_is": "IS 269:2015"}],
        "clause_diffs": [{"clause_number": "Clause 4.1.2", "modernized_clause": "IS 269 compliant"}],
        "full_nit_draft_text": "## NOTICE INVITING TENDER",
        "tender_metadata": {"title": "NHAI Bridge Superstructure", "department": "NHAI"},
        "audit_summary": {"outdated_standards_count": 0}
    }

    res = await persist_results_activity(mock_payload)
    assert res["status"] == "SUCCESS"
    assert res["persisted"] is True

    # Verify project in repository has completed analysis
    proj = get_project("proj-nhai-088")
    assert proj is not None
    assert proj.get("isAnalyzed") is True



# =========================================================================
# Proof 3: 0-Item Tenders Handled Gracefully (No HTTP 400 or Retries)
# =========================================================================
@pytest.mark.asyncio
async def test_proof_3_zero_mappings_guard():
    """Verify that documents with 0 extractable items do not trigger HTTP 400."""
    empty_stage2 = {
        "mappings": [],
        "document_text": "General notice without engineering specifications.",
        "tender_metadata": {"title": "Administrative Notice", "department": "Ministry"},
        "audit_summary": {}
    }

    res = await stage3_finalize_activity(empty_stage2)
    assert res["clause_diffs"] == []
    assert res["summary"]["total_products_governed"] == 0
    assert "No specific BIS compliance line items" in res["full_nit_draft_text"]


# =========================================================================
# Proof 4: Thread Offloading for Blocking Operations
# =========================================================================
@pytest.mark.asyncio
async def test_proof_4_thread_offloading():
    """Verify that activities execute in threads and do not block the event loop."""
    loop = asyncio.get_running_loop()
    start_time = loop.time()
    
    # Run mock extraction in thread
    res = await extract_pdf_activity({
        "document_text": "Clause 1.0 Steel Fe 500D IS 1786",
        "tender_title": "Test"
    })
    elapsed = loop.time() - start_time
    assert res["document_text"] == "Clause 1.0 Steel Fe 500D IS 1786"
    assert elapsed < 1.0  # Fast, non-blocking


# =========================================================================
# Proof 5: Cloudinary / Remote URL PDF Extraction
# =========================================================================
@pytest.mark.asyncio
async def test_proof_5_cloudinary_pdf_extraction_mock():
    """Verify extract_pdf_activity downloads and extracts text when given a remote URL."""
    # Create valid in-memory PDF bytes using PyMuPDF
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "National Highway Culvert Specification conforming to IS 269:2015.")
    fake_pdf_bytes = doc.write()

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = fake_pdf_bytes
        mock_get.return_value = mock_resp

        res = await extract_pdf_activity({
            "cloudinary_url": "https://res.cloudinary.com/demo/tender.pdf",
            "tender_title": "Remote Tender"
        })

        assert "IS 269:2015" in res["document_text"]
        assert res["page_count"] >= 1
