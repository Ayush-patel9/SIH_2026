# Feature 09: Standards as a Model Context Protocol (MCP) Server

## 1. Executive Summary & Value Proposition
Instead of forcing every government portal, AI copilot, or ministry app to rebuild standards retrieval, shipping the entire engine as a **FastMCP Server** turns our project into the **foundational plumbing for the entire Indian Government AI ecosystem**.
Any LLM (Claude, Gemini, internal NIC Copilot, GeM Vendor Bot) can plug in and execute native tools: `recommend_standards`, `check_qco_mandate`, `get_allied_standards`, `find_testing_labs`, and `audit_tender_text`.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Standalone FastMCP Server**: A complete Python / TypeScript server (already scaffolded in [`application/mcp_server/server.py`](file:///Users/ayushpatel/SIH2026/application/mcp_server/server.py)) implementing standard MCP protocol tools over stdio and SSE.
- **In-Memory Contract Tools Engine**: Tools that execute queries directly against the local contract fixtures or catalog data.
- **MCP Inspector & Interactive Testing Playground**: A frontend / CLI developer panel that lets users test tool calls (`search_standards("fe 500d steel")`), inspect tool schemas, and copy SSE endpoint URLs.
- **Standardized Tool Definitions**:
  1. `recommend_standards(query: str, domain: str)`
  2. `check_qco_mandate(is_number: str)`
  3. `get_allied_standards(is_number: str)`
  4. `find_testing_labs(is_number: str, state: str)`
  5. `audit_tender_text(tender_text: str)`

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Live MCP cloud deployment hosting all 22,000 full-text embeddings simultaneously on remote servers.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (Tools return `StandardsResponse` objects conforming to `contract_schema.json`):
```python
@mcp.tool()
def recommend_standards(product_query: str) -> Dict[str, Any]:
    """Returns canonical StandardsResponse payload for any product query."""
    return adapter.transform_pipeline_output(raw_query=product_query)
```

### The Lock (How Application Consumes It):
- AI Copilots and frontend MCP testing console can invoke tools and display structured responses with zero code changes.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `application/mcp_server/server.py`: The FastMCP server exposing all 5 tools.
2. `src/modules/mcp/mcpToolClient.ts`: Client library enabling web UI to interact with local MCP server.
3. `src/modules/mcp/mcpSchemaDocs.ts`: Interactive markdown documentation and API playground for developers.

### Edge-Case Handling:
- Fallback mode: If FastMCP package is not installed, gracefully runs in mock stdio JSON-RPC mode.
