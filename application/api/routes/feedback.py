from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timezone
import json
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.config.api_contract_models import FeedbackRequest

router = APIRouter(prefix="/api/v1", tags=["Human-in-the-Loop Feedback"])

# In-memory feedback store for session audit trail
FEEDBACK_STORE: List[Dict[str, Any]] = [
    {
        "$schema": "SIH2026.FeedbackRequest.v1",
        "feedback_id": "fbk-9102-482a",
        "timestamp": "2026-09-26T10:15:00Z",
        "original_query_id": "uuid-9f8a-4b2c-11e9",
        "original_recommendation_id": "rec-6d2f-48e2",
        "submitter": {
            "user_id": "officer_4091",
            "role": "PROCUREMENT_OFFICER",
            "ministry_code": "MoRTH"
        },
        "feedback_type": "MISSING_ALLIED_STANDARD",
        "flagged_is_number": "IS 269:2015",
        "correct_is_number": "IS 269:2015",
        "officer_notes": "Chemical test method IS 4032 should carry mandatory high-priority flag.",
        "verified": True,
        "verification_status": "VERIFIED_CORRECT"
    }
]

@router.post("/feedback", summary="Submit Human-in-the-Loop Feedback / Flag")
def submit_feedback(feedback: FeedbackRequest):
    """
    Submits an expert correction or procurement officer flag on a recommendation.
    Enables continuous learning and knowledge graph trust-score reinforcement.
    """
    try:
        feedback_dict = feedback.model_dump(by_alias=True)
        feedback_dict["verification_status"] = "PENDING"
        FEEDBACK_STORE.insert(0, feedback_dict)
        return {
            "status": "RECORDED",
            "feedback_id": feedback.feedback_id,
            "verification_status": "PENDING",
            "message": f"Expert feedback for {feedback.flagged_is_number} successfully recorded in audit queue."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback submission error: {str(e)}")

@router.get("/feedback", response_model=List[Dict[str, Any]], summary="List Feedback Queue")
def list_feedback():
    """Returns recent human-in-the-loop expert corrections and audit reviews."""
    return FEEDBACK_STORE
