# Feature 09 — MCP Server (Model Context Protocol Integration)
## Standards Context Server · Tool Definitions · JSON-Only Data Layer

---

## WHY THIS EXISTS

The MCP (Model Context Protocol) server allows any external AI assistant (Claude, Gemini, GPT-4, or a custom LLM deployed within a ministry) to query the BIS Standards Intelligence system as a **structured tool** rather than relying on the LLM's training data. This means an officer can ask their ministry's AI assistant "which standard for steel rebar?" and the MCP server provides the answer from the live JSON contract — not from potentially outdated LLM weights.

---

## WHAT THE MCP SERVER IS

It is a standalone Python FastAPI service in `application/mcp_server/` that:
1. Exposes tool definitions following the MCP specification
2. Accepts tool call requests from any MCP-compatible client
3. Responds with data constructed purely from the JSON contract
4. Does NOT call the pipeline directly — it reads mock JSON or the adapter output

---

## TOOLS TO IMPLEMENT

### Tool 1 — `get_standard_recommendation`
Given a natural-language query, returns the full `StandardsResponse` JSON.
This is the primary tool and wraps the adapter layer.

```python
# tool definition (MCP format)
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
                "enum": ["construction", "electronics", "textiles", "food", "chemicals", "general"],
                "description": "Optional domain filter to narrow results"
            },
            "mode": {
                "type": "string",
                "enum": ["recommend", "compare", "validate"],
                "default": "recommend"
            }
        },
        "required": ["query"]
    }
}
```

### Implementation
```python
# application/mcp_server/tools/recommendation.py

import json
import uuid
from pathlib import Path
from datetime import datetime, timezone

# Load mock fixture — swap with adapter.py call when pipeline is live
FIXTURE_PATH = Path(__file__).parent.parent.parent.parent / "interface" / "fixtures" / "cement_mock.json"

def get_standard_recommendation(query: str, domain: str = "general", mode: str = "recommend") -> dict:
    """
    Returns a StandardsResponse JSON.
    Currently returns the cement mock fixture for all queries.
    When pipeline is live: replace this body with adapter.transform_pipeline_output(pipeline.query(query))
    """
    with open(FIXTURE_PATH) as f:
        response = json.load(f)

    # Patch the meta fields to reflect this specific call
    response["meta"]["query_id"] = str(uuid.uuid4())
    response["meta"]["timestamp"] = datetime.now(timezone.utc).isoformat()
    response["meta"]["mode"] = mode
    response["query_understanding"]["original_text"] = query
    if domain != "general":
        response["query_understanding"]["domain"] = domain

    return response
```

---

### Tool 2 — `check_standard_status`
Given an IS number, returns its current status, amendment, and certification requirements.

```python
TOOL_CHECK_STATUS = {
    "name": "check_standard_status",
    "description": "Returns the current status (ACTIVE, WITHDRAWN, UNDER_REVISION) of a specific IS standard number, including latest amendment and BIS certification requirements.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "is_number": {
                "type": "string",
                "description": "The IS standard number, e.g. 'IS 269:2015' or 'IS 1786:2008'"
            }
        },
        "required": ["is_number"]
    }
}

# Known standards catalog (static, JSON-only, no pipeline needed)
STANDARDS_CATALOG = {
    "IS 269:2015": {
        "is_number": "IS 269:2015",
        "title": "Ordinary Portland Cement — Specification",
        "status": "ACTIVE",
        "year_published": 2015,
        "amendment": "Amendment 1 (2019)",
        "certification": {"mandatory": True, "scheme": "ISI_MARK", "qco_order_name": "Cement (Quality Control) Order 2003"},
        "replacement_for": ["IS 8112:1989", "IS 12269:1987"],
    },
    "IS 8112:1989": {
        "is_number": "IS 8112:1989",
        "title": "43 Grade Ordinary Portland Cement — Specification (Withdrawn)",
        "status": "WITHDRAWN",
        "year_published": 1989,
        "amendment": None,
        "certification": {"mandatory": False, "scheme": None, "qco_order_name": None},
        "replaced_by": "IS 269:2015",
    },
    "IS 1786:2008": {
        "is_number": "IS 1786:2008",
        "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
        "status": "ACTIVE",
        "year_published": 2008,
        "amendment": "Amendment 3 (2026)",
        "certification": {"mandatory": True, "scheme": "ISI_MARK", "qco_order_name": "Steel and Steel Products (Quality Control) Order 2012"},
        "replacement_for": [],
    },
    "IS 456:2000": {
        "is_number": "IS 456:2000",
        "title": "Plain and Reinforced Concrete — Code of Practice",
        "status": "ACTIVE",
        "year_published": 2000,
        "amendment": "Amendment 3 (2007)",
        "certification": {"mandatory": False, "scheme": None, "qco_order_name": None},
        "replacement_for": [],
    },
}

def check_standard_status(is_number: str) -> dict:
    normalized = is_number.strip().upper()
    if normalized in STANDARDS_CATALOG:
        return STANDARDS_CATALOG[normalized]
    # Fuzzy match by prefix
    for key, val in STANDARDS_CATALOG.items():
        if normalized in key or key in normalized:
            return val
    return {
        "is_number": is_number,
        "status": "UNKNOWN",
        "message": f"Standard '{is_number}' not found in local catalog. Query the BIS website directly."
    }
```

---

### Tool 3 — `list_active_alerts`
Returns all currently active alerts from the alert store.

```python
TOOL_LIST_ALERTS = {
    "name": "list_active_alerts",
    "description": "Returns a list of currently active BIS standard amendment/withdrawal alerts that may affect active tenders.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "severity": {
                "type": "string",
                "enum": ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"],
                "default": "ALL"
            },
            "limit": {
                "type": "integer",
                "default": 10
            }
        }
    }
}
```

---

### Tool 4 — `generate_nit_clause`
Returns a pre-formatted NIT clause string for a given IS number.

```python
TOOL_GENERATE_NIT = {
    "name": "generate_nit_clause",
    "description": "Generates a legally-structured NIT technical specification clause for a given IS standard number and product name, ready for pasting into GeM or NIC eProcurement portals.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "is_number": {"type": "string"},
            "product_name": {"type": "string"},
            "template": {
                "type": "string",
                "enum": ["standard_gem", "cpwd", "morth", "defence"],
                "default": "standard_gem"
            }
        },
        "required": ["is_number", "product_name"]
    }
}
```

---

## FASTAPI SERVER STRUCTURE

```python
# application/mcp_server/server.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import json

app = FastAPI(title="ManakAI MCP Server", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health(): return {"status": "ok", "version": "1.0.0"}

@app.get("/tools")
def list_tools():
    return {
        "tools": [
            TOOL_GET_RECOMMENDATION,
            TOOL_CHECK_STATUS,
            TOOL_LIST_ALERTS,
            TOOL_GENERATE_NIT,
        ]
    }

class ToolCallRequest(BaseModel):
    tool_name: str
    parameters: dict

@app.post("/tools/call")
def call_tool(request: ToolCallRequest):
    if request.tool_name == "get_standard_recommendation":
        result = get_standard_recommendation(**request.parameters)
    elif request.tool_name == "check_standard_status":
        result = check_standard_status(**request.parameters)
    elif request.tool_name == "list_active_alerts":
        result = list_active_alerts(**request.parameters)
    elif request.tool_name == "generate_nit_clause":
        result = generate_nit_clause_tool(**request.parameters)
    else:
        return {"error": f"Unknown tool: {request.tool_name}"}

    return {"tool_name": request.tool_name, "result": result}
```

---

## FILE STRUCTURE

```
application/mcp_server/
├── server.py                    ← FastAPI app + tool dispatch
├── requirements.txt             ← fastapi, uvicorn, pydantic
├── tools/
│   ├── recommendation.py        ← Tool 1: get_standard_recommendation()
│   ├── status_checker.py        ← Tool 2: check_standard_status() + STANDARDS_CATALOG
│   ├── alerts.py                ← Tool 3: list_active_alerts()
│   └── nit_generator.py         ← Tool 4: generate_nit_clause_tool()
└── README.md                    ← How to run: uvicorn server:app --reload --port 8001
```

---

## HOW TO RUN

```bash
cd application/mcp_server
pip install fastapi uvicorn pydantic
uvicorn server:app --reload --port 8001
# MCP server is now at http://localhost:8001
# Tools list: GET http://localhost:8001/tools
# Tool call:  POST http://localhost:8001/tools/call
```

---

## KEY-AND-LOCK WIRING

The MCP server only reads from the fixture JSON and the `STANDARDS_CATALOG` dict. When the pipeline is live, the only change needed is:
```python
# In tools/recommendation.py, replace:
with open(FIXTURE_PATH) as f:
    response = json.load(f)
# With:
from interface.adapter import transform_pipeline_output
raw = pipeline.query(query)
response = transform_pipeline_output(raw)
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not implement authentication on the MCP server (add API key later)
- ❌ Do not import anything from `pipeline/`
- ❌ Do not connect to a real vector database
