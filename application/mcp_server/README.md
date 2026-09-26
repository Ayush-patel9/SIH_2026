# ManakAI Model Context Protocol (MCP) Server

## Feature 09 — Standards Context Server & External AI Integration

The **ManakAI Model Context Protocol (MCP) Server** enables any external AI assistant (Claude Desktop, Gemini CLI, Cursor, or ministry internal LLMs) to query live Indian Standards intelligence as a structured, deterministic tool rather than relying on stale model training weights.

---

### Registered MCP Tools

| Tool Name | Description | Key Inputs | Output Contract |
|---|---|---|---|
| `get_standard_recommendation` | Returns full BIS recommendation payload for procurement query | `query`, `domain`, `mode` | `SIH2026.StandardsResponse.v1` |
| `check_standard_status` | Returns active/withdrawn status, amendment, and mandatory QCOs | `is_number` | Status JSON |
| `list_active_alerts` | Returns active Gazette amendments and supersessions | `severity`, `limit` | `AlertPayload[]` |
| `generate_nit_clause` | Generates legally-structured NIT tender specification clause | `is_number`, `product_name`, `template` | Clause Text JSON |
| `find_testing_labs` | Finds BIS-recognized and NABL-accredited test laboratories | `is_number`, `state` | Labs Registry JSON |
| `verify_isi_licensee` | Verifies operative BIS ISI / CRS licenses and manufacturers | `is_number`, `manufacturer_name` | Licensee Registry JSON |

---

### How to Run

#### 1. Self-Test Mode (Verification)
```bash
python3 application/mcp_server/server.py --test
```

#### 2. Start HTTP REST MCP Server (Port 8001)
```bash
python3 application/mcp_server/server.py
# or:
uvicorn server:app --reload --port 8001
```
- **Health Check**: `GET http://localhost:8001/health`
- **Tool Directory**: `GET http://localhost:8001/tools`
- **Execute Tool Call**: `POST http://localhost:8001/tools/call`

#### 3. Start Stdio / SSE FastMCP Runner
```bash
python3 application/mcp_server/server.py --stdio
```

---

### Connecting to Claude Desktop / Cursor / Antigravity

Add the following to your `claude_desktop_config.json` or `mcp_config.json`:

```json
{
  "mcpServers": {
    "manakai-standards": {
      "command": "python3",
      "args": [
        "/absolute/path/to/SIH2026/application/mcp_server/server.py",
        "--stdio"
      ],
      "env": {
        "PYTHONPATH": "/absolute/path/to/SIH2026/application/mcp_server"
      }
    }
  }
}
```
