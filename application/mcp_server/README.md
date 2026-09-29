# ManakAI Model Context Protocol (MCP) Server

**Statutory BIS Indian Standards Intelligence Context Server for Procurement AI Agents**

This module implements a production-grade **Model Context Protocol (MCP)** server conforming to the open Anthropic MCP specification (2024-11-05). It exposes 6 high-value, statutory Bureau of Indian Standards (BIS) tools to **Claude Desktop**, **Cursor**, **Claude Code**, and external procurement AI agents.

---

## 🚀 Key Architectural Highlights

1. **Native FastAPI & Render Deployment**:
   The MCP server is mounted directly onto the existing FastAPI application (`application/api/main.py`) under `/api/v1/mcp` and `/mcp`. When hosted on **Render Cloud**, the backend serves the MCP JSON-RPC 2.0 endpoints directly over HTTPS without needing secondary background processes or ports.

2. **Zero-Dependency Stdio Bridge for Claude Desktop**:
   Claude Desktop on Windows runs `application/mcp_server/claude_desktop_bridge.py`. It communicates over `stdio` (stdin/stdout) via JSON-RPC 2.0 and forwards calls to the backend via HTTP. If the backend is ever offline, the bridge automatically falls back to local Python execution so Claude Desktop never crashes.

3. **100% Reused Core Backend Intelligence**:
   Reuses existing, verified services:
   - `graph_rag_pipeline.process_query` (RAG semantic search across 22,011 standards)
   - `HistoricalLineageService.get_lineage` (Phylogenetic supersession & obsolescence tracking)
   - `get_knowledge_graph_subgraph` (Normative relational test method mesh)
   - `export_nit_clause` (CVC-compliant GeM/CPWD Notice Inviting Tender clauses)

---

## 🛠️ The 6 Registered MCP Tools

| Tool Name | Purpose | Example Input |
| :--- | :--- | :--- |
| `manakai_search_standards` | Semantic search across 22,011 Indian Standards | `{"query": "OPC cement 43 grade for bridges", "domain": "Civil"}` |
| `manakai_get_standard_details` | Retrieve full technical dossier (status, year, amendments, scope, QCO) | `{"is_number": "IS 269:2015"}` |
| `manakai_check_supersession_history` | Check obsolescence, phylogenetic evolution & replacement standard | `{"standard": "IS 8112"}` |
| `manakai_get_normative_relations` | Knowledge graph mesh: test methods, companion codes, material relations | `{"center": "IS 269", "limit": 15}` |
| `manakai_check_qco_compliance` | Mandatory statutory Quality Control Order (QCO) verification | `{"query_or_standard": "IS 2062"}` |
| `manakai_generate_nit_clause` | Citation-ready GeM / CPWD Notice Inviting Tender (NIT) clause | `{"standard_or_product": "IS 269:2015", "template": "standard_gem"}` |

---

## 🖥️ Claude Desktop Setup (Windows)

### Option A: Automatic 1-Click Install
Run the provided installer:
```powershell
.venv\Scripts\python.exe application\mcp_server\install_claude_desktop.py
```
*(Or double-click `application\mcp_server\install_to_claude_desktop.bat` in File Explorer).*

### Option B: Manual Configuration
Open your Claude Desktop config file:
`%APPDATA%\Claude\claude_desktop_config.json`

Add the `manakai-standards` entry under `mcpServers`:
```json
{
  "mcpServers": {
    "manakai-standards": {
      "command": "C:\\Users\\Aangir Doshi\\Downloads\\SIH_2026\\.venv\\Scripts\\python.exe",
      "args": [
        "C:\\Users\\Aangir Doshi\\Downloads\\SIH_2026\\application\\mcp_server\\claude_desktop_bridge.py"
      ],
      "env": {
        "MANAKAI_BASE_URL": "http://127.0.0.1:8000"
      }
    }
  }
}
```

---

## ☁️ Connecting Claude Desktop to Render Cloud

When you deploy this project to Render (e.g. `https://sih-2026-manakai.onrender.com`), you only need to change one line in your Claude Desktop config:

```json
"env": {
  "MANAKAI_BASE_URL": "https://sih-2026-manakai.onrender.com"
}
```

Now Claude Desktop will query your live Render cloud backend directly!

---

## 🧪 Testing & Verification

1. **Unit Testing the 6 Tools Locally**:
   ```bash
   .venv\Scripts\python.exe application\mcp_server\mcp_engine.py --test
   ```

2. **Testing the Claude Stdio Bridge**:
   ```bash
   .venv\Scripts\python.exe -c "import subprocess, json; p = subprocess.Popen(['.venv/Scripts/python.exe', 'application/mcp_server/claude_desktop_bridge.py'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True); print(p.communicate(json.dumps({'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'}) + '\n')[0])"
   ```

3. **HTTP REST Endpoints**:
   - Health: `GET /api/v1/mcp/health`
   - Tool List: `GET /api/v1/mcp/tools`
   - Tool Execution: `POST /api/v1/mcp/call`
   - Standard JSON-RPC: `POST /api/v1/mcp/rpc`
