#!/usr/bin/env python3
"""
Claude Desktop Stdio MCP Bridge for ManakAI.
Communicates with Claude Desktop over stdin/stdout using standard JSON-RPC 2.0,
and forwards requests to the ManakAI FastAPI Backend (hosted locally or on Render Cloud).

Features:
- 100% zero third-party dependencies (pure Python standard library).
- 180-second generous timeout for deep GraphRAG AI queries.
- Remote Render Cloud proxying via MANAKAI_BASE_URL environment variable.
- Instant local fallback to direct Python execution if backend is offline.
- Safe logging to sys.stderr so stdio JSON-RPC stream remains uncorrupted.
- Robust UTF-8 stream re-configuration for Windows consoles.
"""

import sys
import os
import json
import urllib.request
import urllib.error

# Ensure UTF-8 stream handling on Windows
if hasattr(sys.stdin, "reconfigure"):
    try:
        sys.stdin.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure project root is in sys.path for local fallback
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

DEFAULT_LOCAL_URL = "http://127.0.0.1:8000"
MANAKAI_BASE_URL = os.environ.get("MANAKAI_BASE_URL", DEFAULT_LOCAL_URL).rstrip("/")
RPC_ENDPOINT = f"{MANAKAI_BASE_URL}/api/v1/mcp/rpc"
HTTP_TIMEOUT_SECONDS = 180


def log_debug(msg: str):
    """Logs debug information strictly to stderr to prevent breaking stdio protocol."""
    try:
        sys.stderr.write(f"[ManakAI MCP Bridge] {msg}\n")
        sys.stderr.flush()
    except Exception:
        pass


def forward_to_remote_backend(payload: dict) -> dict:
    """Sends JSON-RPC payload to FastAPI backend over HTTP."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        RPC_ENDPOINT,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "ManakAI-Claude-Desktop-Bridge/1.0"
        }
    )
    with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT_SECONDS) as resp:
        res_bytes = resp.read()
        return json.loads(res_bytes.decode("utf-8"))


def local_fallback_handler(payload: dict) -> dict:
    """Executes tool directly via local Python engine if HTTP backend is unavailable."""
    from application.mcp_server.mcp_engine import MCP_TOOLS, MCP_TOOLS_DICT, dispatch_tool

    req_id = payload.get("id")
    method = payload.get("method", "")
    params = payload.get("params") or {}

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {
                    "name": "ManakAI-BIS-Standards-MCP (Local Engine)",
                    "version": "1.0.0",
                    "description": "Statutory Indian Standards (BIS) Intelligence Engine"
                }
            }
        }

    if method in ("notifications/initialized", "ping"):
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}

    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"tools": MCP_TOOLS}
        }

    if method == "tools/call":
        tool_name = params.get("name", "")
        tool_args = params.get("arguments", {})
        if tool_name not in MCP_TOOLS_DICT:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Tool '{tool_name}' not found."}
            }

        try:
            output = dispatch_tool(tool_name, tool_args)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": json.dumps(output, indent=2, ensure_ascii=False)}],
                    "isError": False
                }
            }
        except Exception as err:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": f"Error executing {tool_name}: {str(err)}"}],
                    "isError": True
                }
            }

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {"code": -32601, "message": f"Method '{method}' not recognized."}
    }


def main():
    log_debug(f"Bridge active. Target URL: {RPC_ENDPOINT} (timeout: {HTTP_TIMEOUT_SECONDS}s)")

    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue

        try:
            payload = json.loads(line)
        except Exception as e:
            err_resp = {"jsonrpc": "2.0", "error": {"code": -32700, "message": f"Invalid JSON: {str(e)}"}}
            sys.stdout.write(json.dumps(err_resp, ensure_ascii=False) + "\n")
            sys.stdout.flush()
            continue

        method = payload.get("method", "")
        req_id = payload.get("id")

        # Notifications don't expect a response
        is_notification = (req_id is None and method.startswith("notifications/"))

        response_dict = None

        # Attempt 1: Forward to Render / Local FastAPI Backend
        try:
            response_dict = forward_to_remote_backend(payload)
        except Exception as http_err:
            log_debug(f"HTTP call to {RPC_ENDPOINT} failed ({http_err}). Using local fallback...")
            try:
                response_dict = local_fallback_handler(payload)
            except Exception as local_err:
                log_debug(f"Local fallback error: {local_err}")
                response_dict = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32000,
                        "message": f"ManakAI service error: {str(local_err)}"
                    }
                }

        # Write response back to Claude Desktop via stdout
        if not is_notification and response_dict is not None:
            sys.stdout.write(json.dumps(response_dict, ensure_ascii=False) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
