#!/usr/bin/env python3
"""
FastAPI Router for Model Context Protocol (MCP) Server.
Enables Render cloud deployment and local FastAPI instances to serve standard
MCP endpoints over HTTP and JSON-RPC 2.0 for Claude Desktop, Cursor, and enterprise AI agents.
"""

import json
import logging
from typing import Dict, Any, Optional, Union, List
from fastapi import APIRouter, HTTPException, Request, Body
from pydantic import BaseModel, Field

from application.mcp_server.mcp_engine import (
    MCP_TOOLS,
    MCP_TOOLS_DICT,
    dispatch_tool
)

logger = logging.getLogger("bis_platform_api.mcp")

router = APIRouter(tags=["Model Context Protocol (MCP) Server"])


# -------------------------------------------------------------------------
# PYDANTIC SCHEMAS FOR REST AND JSON-RPC 2.0
# -------------------------------------------------------------------------

class ToolCallRequest(BaseModel):
    tool_name: str = Field(..., description="Name of the MCP tool to execute")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Tool input arguments")


class JsonRpcRequest(BaseModel):
    jsonrpc: str = Field("2.0", description="JSON-RPC version")
    id: Optional[Union[int, str]] = Field(None, description="Request ID")
    method: str = Field(..., description="MCP RPC method (initialize, tools/list, tools/call, ping)")
    params: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Method parameters")


# -------------------------------------------------------------------------
# REST ENDPOINTS (Fast & Simple HTTP invocation)
# -------------------------------------------------------------------------

@router.get("/health", summary="MCP Health Check")
def mcp_health():
    """Health check endpoint for Render and monitoring agents."""
    return {
        "status": "HEALTHY",
        "service": "ManakAI Model Context Protocol (MCP) Server",
        "protocol_version": "2024-11-05",
        "total_tools": len(MCP_TOOLS),
        "available_tools": [t["name"] for t in MCP_TOOLS]
    }


@router.get("/tools", summary="List All Registered MCP Tools")
def list_mcp_tools():
    """Returns the JSON schema directory of all 6 statutory BIS intelligence tools."""
    return {
        "status": "SUCCESS",
        "count": len(MCP_TOOLS),
        "tools": MCP_TOOLS
    }


@router.post("/call", summary="Execute MCP Tool via REST")
def execute_mcp_tool(req: ToolCallRequest):
    """
    Direct REST invocation endpoint for web clients and automation scripts.
    Accepts tool_name and parameters, executes the backend service, and returns structured JSON.
    """
    tool_name = req.tool_name.strip()
    if tool_name not in MCP_TOOLS_DICT:
        raise HTTPException(
            status_code=404,
            detail=f"Tool '{tool_name}' not found. Registered tools: {list(MCP_TOOLS_DICT.keys())}"
        )

    try:
        result = dispatch_tool(tool_name, req.parameters)
        return {
            "status": "SUCCESS",
            "tool": tool_name,
            "result": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Error executing MCP tool '{tool_name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")


# -------------------------------------------------------------------------
# STANDARD JSON-RPC 2.0 ENDPOINT (Claude Desktop / Cursor Standard Protocol)
# -------------------------------------------------------------------------

@router.post("/rpc", summary="JSON-RPC 2.0 MCP Protocol Gateway")
async def json_rpc_gateway(request: Request):
    """
    Standards-compliant JSON-RPC 2.0 endpoint for external AI hosts (Claude Desktop, Cursor, Claude Code).
    Handles:
    - initialize
    - notifications/initialized
    - tools/list
    - tools/call
    - ping
    """
    try:
        body_bytes = await request.body()
        if not body_bytes:
            return {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error: Empty request"}}
        
        payload = json.loads(body_bytes.decode("utf-8"))
    except Exception as e:
        return {"jsonrpc": "2.0", "error": {"code": -32700, "message": f"Parse error: {str(e)}"}}

    req_id = payload.get("id")
    method = payload.get("method", "")
    params = payload.get("params") or {}

    # 1. Handle initialize
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "ManakAI-BIS-Standards-MCP",
                    "version": "1.0.0",
                    "description": "Statutory Indian Standards (BIS) Intelligence Engine for AI Procurement"
                }
            }
        }

    # 2. Handle notifications/initialized (no response required)
    if method == "notifications/initialized":
        return {"jsonrpc": "2.0", "result": {}}

    # 3. Handle ping
    if method == "ping":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}

    # 4. Handle tools/list
    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": MCP_TOOLS
            }
        }

    # 5. Handle tools/call
    if method == "tools/call":
        tool_name = params.get("name", "")
        tool_args = params.get("arguments", {})
        
        if tool_name not in MCP_TOOLS_DICT:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Method not found: Tool '{tool_name}' is not registered."
                }
            }

        try:
            tool_output = dispatch_tool(tool_name, tool_args)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(tool_output, indent=2)
                        }
                    ],
                    "isError": False
                }
            }
        except Exception as err:
            logger.error(f"Error in tools/call for {tool_name}: {err}", exc_info=True)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Error executing {tool_name}: {str(err)}"
                        }
                    ],
                    "isError": True
                }
            }

    # Method not supported
    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {
            "code": -32601,
            "message": f"Method '{method}' not recognized by ManakAI MCP Server."
        }
    }
