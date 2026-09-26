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
from pipeline.rag_engine.staleness_monitor import staleness_monitor

router = APIRouter(prefix="/api/v1", tags=["Proactive Staleness & Alerts"])

# In-memory alerts store initialized with dynamic active alerts from staleness_monitor
try:
    ALERTS_STORE: List[Dict[str, Any]] = staleness_monitor.get_active_alerts()
except Exception as _e:
    ALERTS_STORE = []

@router.get("/alerts", response_model=List[Dict[str, Any]], summary="Get Proactive Staleness Alerts")
def get_alerts():
    """
    Returns active supersession, amendment, and QCO enforcement alerts.
    Enables procurement officers to prevent compliance liabilities before bid opening.
    """
    if not ALERTS_STORE:
        try:
            return staleness_monitor.get_active_alerts()
        except Exception:
            return []
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
