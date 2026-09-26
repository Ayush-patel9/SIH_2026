import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any

FIXTURE_PATH = Path(__file__).parent.parent.parent.parent / "interface" / "fixtures" / "cement_mock.json"

TOOL_GET_RECOMMENDATION = {
    "name": "get_standard_recommendation",
    "description": "Returns the applicable BIS Indian Standard for a given procurement product query. Returns IS number, title, status, certification requirements, confidence, and reasoning trace.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language procurement query, e.g. 'Which standard for 43 grade OPC cement for highway construction?'"
            },
            "domain": {
                "type": "string",
                "enum": ["construction", "metallurgy", "electronics", "textiles", "food", "chemicals", "general"],
                "default": "general",
                "description": "Optional domain filter to narrow results"
            },
            "mode": {
                "type": "string",
                "enum": ["recommend", "compare", "validate", "audit"],
                "default": "recommend"
            }
        },
        "required": ["query"]
    }
}

def get_standard_recommendation(query: str, domain: str = "general", mode: str = "recommend") -> Dict[str, Any]:
    """
    Returns a full StandardsResponse JSON.
    Loads from canonical fixture and dynamically personalizes query metadata.
    """
    if FIXTURE_PATH.exists():
        with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
            response = json.load(f)
    else:
        # Fallback inline response
        response = {
            "$schema": "SIH2026.StandardsResponse.v1",
            "meta": {
                "query_id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "mode": mode,
                "pipeline_version": "1.0.0",
                "audit_reference_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            },
            "query_understanding": {
                "original_text": query,
                "detected_language": "en",
                "query_intent": "STANDARD_LOOKUP",
                "extracted_entities": []
            },
            "primary_recommendation": {
                "is_number": "IS 269:2015",
                "title": "Ordinary Portland Cement — Specification",
                "status": "ACTIVE",
                "confidence": 0.94
            }
        }

    # Patch metadata for live tool request
    response["meta"]["query_id"] = str(uuid.uuid4())
    response["meta"]["timestamp"] = datetime.now(timezone.utc).isoformat()
    response["meta"]["mode"] = mode
    response["query_understanding"]["original_text"] = query
    if domain != "general":
        response["query_understanding"]["domain"] = domain

    return response
