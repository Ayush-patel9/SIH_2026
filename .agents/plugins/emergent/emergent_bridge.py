import sys
import json
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timezone

PLUGIN_DIR = Path(__file__).parent.resolve()
TOKEN_FILE = PLUGIN_DIR / "token.json"
CLIENT_CACHE_FILE = PLUGIN_DIR / ".client_cache.json"

AUTH_SERVER = "https://mcp.emergent.sh"
TOKEN_ENDPOINT = f"{AUTH_SERVER}/oauth/token"
MCP_ENDPOINT = "https://mcp.emergent.sh/"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityBridge/1.0"

session_id = None

def get_tokens():
    if not TOKEN_FILE.exists():
        return None
    try:
        with open(TOKEN_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return None

def refresh_tokens(tokens):
    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        return None

    client_id = None
    if CLIENT_CACHE_FILE.exists():
        try:
            with open(CLIENT_CACHE_FILE, "r") as f:
                client_id = json.load(f).get("client_id")
        except Exception:
            pass

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }
    if client_id:
        payload["client_id"] = client_id

    req = urllib.request.Request(
        TOKEN_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            new_tokens = json.loads(resp.read().decode("utf-8"))
            if "refresh_token" not in new_tokens and "refresh_token" in tokens:
                new_tokens["refresh_token"] = tokens["refresh_token"]
            with open(TOKEN_FILE, "w") as f:
                json.dump(new_tokens, f, indent=2)
            return new_tokens
    except Exception:
        return None

def forward_request(line, tokens):
    global session_id
    access_token = tokens.get("access_token") if tokens else ""

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": f"Bearer {access_token}",
        "User-Agent": USER_AGENT,
        "MCP-Protocol-Version": "2024-11-05"
    }
    if session_id:
        headers["Mcp-Session-Id"] = session_id

    req = urllib.request.Request(
        MCP_ENDPOINT,
        data=line.encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            new_sid = resp.headers.get("Mcp-Session-Id")
            if new_sid:
                session_id = new_sid
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        if e.code == 401 and tokens and "refresh_token" in tokens:
            refreshed = refresh_tokens(tokens)
            if refreshed:
                return forward_request(line, refreshed)
        return e.read().decode("utf-8")
    except Exception as e:
        return json.dumps({
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32603, "message": f"Bridge error: {str(e)}"}
        })

def main():
    tokens = get_tokens()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            req_json = json.loads(line)
        except Exception:
            continue

        # If not logged in, respond with friendly MCP error / notification
        if not tokens:
            tokens = get_tokens()

        if not tokens:
            req_id = req_json.get("id")
            method = req_json.get("method")
            if method == "initialize":
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {"name": "emergent-bridge", "version": "1.0.0"}
                    }
                }
            elif method == "tools/list":
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "tools": [
                            {
                                "name": "emergent_auth_required",
                                "description": "Authentication required. Please run: python .agents/plugins/emergent/login_emergent.py",
                                "inputSchema": {"type": "object", "properties": {}}
                            }
                        ]
                    }
                }
            else:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32000,
                        "message": "Not authenticated. Please run: python .agents/plugins/emergent/login_emergent.py"
                    }
                }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
            continue

        # Forward JSON-RPC request to Emergent
        raw_res = forward_request(line, tokens)
        if raw_res:
            # Check if raw_res contains SSE lines or raw json
            if raw_res.startswith("data:"):
                # Extract data: lines
                for sub in raw_res.split("\n"):
                    if sub.startswith("data:"):
                        payload = sub[5:].strip()
                        if payload:
                            sys.stdout.write(payload + "\n")
                            sys.stdout.flush()
            else:
                sys.stdout.write(raw_res.strip() + "\n")
                sys.stdout.flush()

if __name__ == "__main__":
    main()
