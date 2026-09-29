import json
import base64
import hashlib
import secrets
import webbrowser
import urllib.request
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

PLUGIN_DIR = Path(__file__).parent.resolve()
TOKEN_FILE = PLUGIN_DIR / "token.json"
CLIENT_CACHE_FILE = PLUGIN_DIR / ".client_cache.json"

AUTH_SERVER = "https://mcp.emergent.sh"
REGISTER_ENDPOINT = f"{AUTH_SERVER}/oauth/register"
AUTHORIZE_ENDPOINT = f"{AUTH_SERVER}/oauth/authorize"
TOKEN_ENDPOINT = f"{AUTH_SERVER}/oauth/token"
PORT = 8089
REDIRECT_URI = f"http://localhost:{PORT}/callback"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityBridge/1.0"

def get_or_register_client():
    if CLIENT_CACHE_FILE.exists():
        try:
            with open(CLIENT_CACHE_FILE, "r") as f:
                data = json.load(f)
                if "client_id" in data:
                    return data["client_id"]
        except Exception:
            pass

    req_data = json.dumps({
        "client_name": "Antigravity Emergent Bridge",
        "redirect_uris": [REDIRECT_URI],
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": "none"
    }).encode("utf-8")

    req = urllib.request.Request(
        REGISTER_ENDPOINT,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT
        }
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        with open(CLIENT_CACHE_FILE, "w") as f:
            json.dump(res, f, indent=2)
        return res["client_id"]

def generate_pkce():
    verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode("utf-8").rstrip("=")
    digest = hashlib.sha256(verifier.encode("utf-8")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
    return verifier, challenge

def exchange_code_for_token(client_id, code, verifier):
    payload = json.dumps({
        "grant_type": "authorization_code",
        "client_id": client_id,
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "code_verifier": verifier
    }).encode("utf-8")

    req = urllib.request.Request(
        TOKEN_ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=" * 60)
    print(" Emergent MCP OAuth Login for Antigravity")
    print("=" * 60)
    
    client_id = get_or_register_client()
    verifier, challenge = generate_pkce()

    auth_params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "scope": "gateway.mcp",
        "code_challenge": challenge,
        "code_challenge_method": "S256"
    }
    auth_url = f"{AUTHORIZE_ENDPOINT}?{urllib.parse.urlencode(auth_params)}"

    auth_code = None
    server_error = None

    class CallbackHandler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # suppress HTTP logging

        def do_GET(self):
            nonlocal auth_code, server_error
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/callback":
                query = urllib.parse.parse_qs(parsed.query)
                if "code" in query:
                    auth_code = query["code"][0]
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    html = """
                    <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0D0F14; color: #EEF0F4;">
                        <h2 style="color: #108250;">Authorization Successful!</h2>
                        <p>Emergent MCP has been authorized for Antigravity.</p>
                        <p style="color: #8890A0;">You can close this tab and return to Antigravity.</p>
                    </body>
                    </html>
                    """
                    self.wfile.write(html.encode("utf-8"))
                elif "error" in query:
                    server_error = query.get("error_description", ["Authorization denied"])[0]
                    self.send_response(400)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(f"<h3>Authorization Failed: {server_error}</h3>".encode("utf-8"))

    server = HTTPServer(("localhost", PORT), CallbackHandler)
    server.timeout = 120

    print(f"\nOpening browser for Emergent login...\nIf it does not open automatically, visit:\n\n{auth_url}\n")
    webbrowser.open(auth_url)

    while auth_code is None and server_error is None:
        server.handle_request()

    if server_error:
        print(f"\n[ERROR] Authorization error: {server_error}")
        return

    if auth_code:
        print("\nAuthorization code received! Exchanging for access token...")
        try:
            tokens = exchange_code_for_token(client_id, auth_code, verifier)
            with open(TOKEN_FILE, "w") as f:
                json.dump(tokens, f, indent=2)
            print(f"[SUCCESS] Emergent credentials saved to:\n  {TOKEN_FILE}")
            print("\nAntigravity is now ready to use Emergent tools!")
        except Exception as e:
            print(f"\n[ERROR] Failed to exchange token: {e}")

if __name__ == "__main__":
    main()
