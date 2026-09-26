import json
from pathlib import Path
from typing import List, Dict, Any

FIXTURE_ALERT_PATH = Path(__file__).parent.parent.parent.parent / "interface" / "fixtures" / "alert_payload_mock.json"

TOOL_LIST_ALERTS = {
    "name": "list_active_alerts",
    "description": "Returns currently active Gazette amendment, supersession, and withdrawal alerts for BIS standards affecting public procurement tenders.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "severity": {
                "type": "string",
                "enum": ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"],
                "default": "ALL",
                "description": "Filter alerts by statutory severity level"
            },
            "limit": {
                "type": "integer",
                "default": 10,
                "description": "Maximum number of alerts to return"
            }
        }
    }
}

DEFAULT_ALERTS: List[Dict[str, Any]] = [
    {
        "alert_id": "alt-001",
        "alert_type": "STANDARD_WITHDRAWN",
        "severity": "CRITICAL",
        "affected_standard": {
            "is_number": "IS 8112:1989",
            "event": "43 Grade Ordinary Portland Cement specification WITHDRAWN — consolidated into IS 269:2015",
            "replacement": "IS 269:2015"
        },
        "affected_tenders": [
            {"tender_id": "NIT-PWD-2026-001", "ministry": "MoHUA", "cited_version": "IS 8112:1989"}
        ],
        "recommended_action": "Issue corrigendum immediately replacing IS 8112:1989 with IS 269:2015."
    },
    {
        "alert_id": "alt-002",
        "alert_type": "STANDARD_AMENDED",
        "severity": "HIGH",
        "affected_standard": {
            "is_number": "IS 1786:2008",
            "event": "Amendment 3 published — mandatory rib geometry marking and nominal mass tolerances for Fe 500D rebars",
            "replacement": None
        },
        "affected_tenders": [
            {"tender_id": "NIT-NHAI-2026-014", "ministry": "MoRTH", "cited_version": "IS 1786:2008"}
        ],
        "recommended_action": "Update tender technical specifications to explicitly cite IS 1786:2008 incorporating Amendment 3."
    },
    {
        "alert_id": "alt-003",
        "alert_type": "QCO_ENFORCEMENT_DATE",
        "severity": "CRITICAL",
        "affected_standard": {
            "is_number": "IS 13252 (Part 1):2010",
            "event": "Compulsory Registration Scheme (CRS) mandatory enforcement under MeitY Electronics QCO",
            "replacement": None
        },
        "affected_tenders": [
            {"tender_id": "NIT-SMART-2026-003", "ministry": "MeitY", "cited_version": "IS 13252 (Part 1):2010"}
        ],
        "recommended_action": "Disqualify bidders lacking valid BIS CRS R-number registration before financial bid opening."
    },
    {
        "alert_id": "alt-004",
        "alert_type": "STANDARD_UNDER_REVISION",
        "severity": "MEDIUM",
        "affected_standard": {
            "is_number": "IS 456:2000",
            "event": "Technical Committee CED-2 reviewing IS 456 for comprehensive 2026 revision",
            "replacement": None
        },
        "affected_tenders": [],
        "recommended_action": "Monitor Gazette publications. No action required until new edition is formally gazetted."
    },
    {
        "alert_id": "alt-005",
        "alert_type": "NEW_MANDATORY_STANDARD",
        "severity": "HIGH",
        "affected_standard": {
            "is_number": "IS 17800:2022",
            "event": "New mandatory standard for Solar PV modules gazetted under Ministry of New & Renewable Energy QCO",
            "replacement": None
        },
        "affected_tenders": [
            {"tender_id": "NIT-CPWD-2026-019", "ministry": "CPWD", "cited_version": "IS 17800:2022"}
        ],
        "recommended_action": "All government rooftop solar tenders must mandate BIS Scheme-I certification under IS 17800:2022."
    }
]

def list_active_alerts(severity: str = "ALL", limit: int = 10) -> List[Dict[str, Any]]:
    """
    Returns active alerts filtered by severity from live staleness monitor with fallback.
    """
    try:
        from pipeline.rag_engine.staleness_monitor import staleness_monitor
        live_alerts = staleness_monitor.get_active_alerts()
        alerts = live_alerts if live_alerts else DEFAULT_ALERTS
    except Exception:
        alerts = DEFAULT_ALERTS

    if severity != "ALL":
        alerts = [a for a in alerts if a.get("severity", "").upper() == severity.upper()]
    return alerts[:limit]
