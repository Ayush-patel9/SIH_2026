from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.config.api_contract_models import AlertPayload, AffectedStandard, AffectedTender

router = APIRouter(prefix="/api/v1", tags=["Proactive Staleness & Alerts"])

# In-memory alerts store initialized with realistic active alerts
ALERTS_STORE: List[Dict[str, Any]] = [
    {
        "$schema": "SIH2026.AlertPayload.v1",
        "alert_id": "alt-3819-20ba",
        "timestamp": "2026-09-26T10:30:00Z",
        "alert_type": "STANDARD_SUPERSEDED",
        "severity": "CRITICAL",
        "affected_standard": {
            "is_number": "IS 8112:1989",
            "event": "Withdrawn and consolidated into IS 269:2015 (covers 33, 43, 53 grade OPC).",
            "replacement": "IS 269:2015"
        },
        "affected_tenders": [
            {
                "tender_id": "NIT-PWD-2026-001",
                "ministry": "MoHUA",
                "officer_user_id": "officer_4091",
                "cited_version": "IS 8112:1989"
            }
        ],
        "recommended_action": "Update tender technical specifications to cite IS 269:2015 to prevent CVC audit rejection.",
        "deadline": "2026-10-31T23:59:59Z"
    },
    {
        "$schema": "SIH2026.AlertPayload.v1",
        "alert_id": "alt-5021-99af",
        "timestamp": "2026-09-25T14:20:00Z",
        "alert_type": "STANDARD_AMENDED",
        "severity": "HIGH",
        "affected_standard": {
            "is_number": "IS 1786:2008",
            "event": "Amendment 3 gazetted adding mandatory high-corrosion resistant (CRS) Fe 550D rebar testing.",
            "replacement": None
        },
        "affected_tenders": [
            {
                "tender_id": "NHAI-HIGHWAY-2026-442",
                "ministry": "MoRTH",
                "officer_user_id": "officer_7721",
                "cited_version": "IS 1786:2008 (Amd 2)"
            }
        ],
        "recommended_action": "Incorporate Amendment 3 testing clauses in live bridge and marine piling tenders.",
        "deadline": "2026-11-15T23:59:59Z"
    }
]

@router.get("/alerts", response_model=List[Dict[str, Any]], summary="Get Proactive Staleness Alerts")
def get_alerts():
    """
    Returns active supersession, amendment, and QCO enforcement alerts.
    Enables procurement officers to prevent compliance liabilities before bid opening.
    """
    return ALERTS_STORE

@router.post("/alerts/simulate", response_model=Dict[str, Any], summary="Simulate Gazette / Revision Event")
def simulate_alert_event(
    is_number: str,
    event_type: str = "STANDARD_AMENDED",
    event_description: str = "New Gazette Amendment Published",
    affected_tender_id: Optional[str] = "NIT-2026-SIMULATED"
):
    """
    Simulates a live BIS publication / Gazette event triggering an instant proactive alert.
    """
    try:
        new_alert = {
            "$schema": "SIH2026.AlertPayload.v1",
            "alert_id": f"alt-{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "alert_type": event_type,
            "severity": "CRITICAL" if "SUPERSEDED" in event_type or "WITHDRAWN" in event_type else "HIGH",
            "affected_standard": {
                "is_number": is_number,
                "event": event_description,
                "replacement": "IS 269:2015" if "8112" in is_number else None
            },
            "affected_tenders": [
                {
                    "tender_id": affected_tender_id,
                    "ministry": "MoRTH / MoHUA",
                    "officer_user_id": "officer_simulated",
                    "cited_version": is_number
                }
            ],
            "recommended_action": f"Review active tenders citing {is_number} and update specifications.",
            "deadline": "2026-12-31T23:59:59Z"
        }
        ALERTS_STORE.insert(0, new_alert)
        return {
            "status": "SIMULATION_DISPATCHED",
            "alert": new_alert
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert simulation error: {str(e)}")
