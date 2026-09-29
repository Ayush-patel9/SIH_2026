#!/usr/bin/env python3
"""
Comprehensive Automated Test Suite for ManakAI MCP Server.
Validates:
1. Tool execution robustness across standard and edge-case inputs.
2. FastAPI native router JSON-RPC 2.0 endpoints.
3. Claude Desktop stdio bridge communication and fallback.
"""

import os
import sys
import json
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from application.mcp_server.mcp_engine import MCP_TOOLS, dispatch_tool
from fastapi.testclient import TestClient
from application.api.main import app

def run_tests():
    print("=================================================================")
    print("      MANAKAI MCP SERVER END-TO-END VALIDATION SUITE            ")
    print("=================================================================")

    total_tests = 0
    passed_tests = 0

    def assert_test(name: str, condition: bool, extra: str = ""):
        nonlocal total_tests, passed_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  [PASS] {name} {extra}")
        else:
            print(f"  [FAIL] {name} {extra}")

    # -------------------------------------------------------------
    # 1. TOOL UNIT TESTS & EDGE CASES
    # -------------------------------------------------------------
    print("\n[PHASE 1] Testing Tool Handlers & Edge Cases...")

    # 1.1 search_standards
    res1 = dispatch_tool("manakai_search_standards", {"query": "Ordinary Portland Cement 43 Grade"})
    assert_test("Search: OPC 43 Grade", res1.get("status") == "SUCCESS", f"IS: {res1.get('primary_recommendation', {}).get('is_number')}")

    # 1.2 search_standards edge case
    res1_edge = dispatch_tool("manakai_search_standards", {"query": "fire resistant glass doors for hospital", "domain": "Civil"})
    assert_test("Search: Edge Domain Query", res1_edge.get("status") == "SUCCESS")

    # 1.3 get_standard_details exact
    res2 = dispatch_tool("manakai_get_standard_details", {"is_number": "IS 269:2015"})
    assert_test("Details: IS 269:2015", "is_number" in res2, f"Title: {res2.get('title')[:30]}...")

    # 1.4 get_standard_details numeric only (e.g. "1786")
    res2_num = dispatch_tool("manakai_get_standard_details", {"is_number": "1786"})
    assert_test("Details: Numeric '1786'", "is_number" in res2_num)

    # 1.5 check_supersession_history (Obsolete standard IS 8112)
    res3_obs = dispatch_tool("manakai_check_supersession_history", {"standard": "IS 8112"})
    assert_test("Supersession: IS 8112 Obsolete", res3_obs.get("is_superseded_or_withdrawn") is True, f"Replacement: {res3_obs.get('canonical_active_replacement')}")

    # 1.6 check_supersession_history (Active standard IS 269)
    res3_act = dispatch_tool("manakai_check_supersession_history", {"standard": "IS 269"})
    assert_test("Supersession: IS 269 Active", res3_act.get("is_superseded_or_withdrawn") is False)

    # 1.7 get_normative_relations
    res4 = dispatch_tool("manakai_get_normative_relations", {"center": "IS 269", "limit": 15})
    assert_test("Normative Relations: IS 269", res4.get("status") == "SUCCESS" and res4.get("total_connected_nodes", 0) > 0)

    # 1.8 check_qco_compliance
    res5 = dispatch_tool("manakai_check_qco_compliance", {"query_or_standard": "IS 1786"})
    assert_test("QCO Compliance: IS 1786", res5.get("status") == "SUCCESS", f"Mandatory: {res5.get('is_mandatory_qco')}")

    # 1.9 generate_nit_clause (GeM)
    res6_gem = dispatch_tool("manakai_generate_nit_clause", {"standard_or_product": "IS 269:2015", "template": "standard_gem"})
    assert_test("NIT Clause: GeM Format", len(res6_gem.get("citation_ready_clause", "")) > 100)

    # 1.10 generate_nit_clause (CPWD)
    res6_cpwd = dispatch_tool("manakai_generate_nit_clause", {"standard_or_product": "IS 1786:2008 Fe 500D", "template": "cpwd", "procuring_department": "CPWD Northern Region"})
    assert_test("NIT Clause: CPWD Custom Dept", "CPWD Northern Region" in res6_cpwd.get("citation_ready_clause", ""))

    # -------------------------------------------------------------
    # 2. FASTAPI ROUTER JSON-RPC 2.0 PROTOCOL TESTS
    # -------------------------------------------------------------
    print("\n[PHASE 2] Testing FastAPI Native Router JSON-RPC Endpoints...")
    client = TestClient(app)

    # 2.1 Health endpoint
    h_resp = client.get("/api/v1/mcp/health")
    assert_test("FastAPI: GET /api/v1/mcp/health", h_resp.status_code == 200 and h_resp.json().get("total_tools") == 6)

    # 2.2 Alias Health endpoint
    h_alias = client.get("/mcp/health")
    assert_test("FastAPI: GET /mcp/health (Alias)", h_alias.status_code == 200)

    # 2.3 JSON-RPC initialize
    init_req = {"jsonrpc": "2.0", "id": 101, "method": "initialize"}
    init_resp = client.post("/api/v1/mcp/rpc", json=init_req)
    assert_test("JSON-RPC: initialize", init_resp.status_code == 200 and init_resp.json().get("result", {}).get("serverInfo") is not None)

    # 2.4 JSON-RPC tools/list
    list_req = {"jsonrpc": "2.0", "id": 102, "method": "tools/list"}
    list_resp = client.post("/api/v1/mcp/rpc", json=list_req)
    assert_test("JSON-RPC: tools/list", len(list_resp.json().get("result", {}).get("tools", [])) == 6)

    # 2.5 JSON-RPC tools/call
    call_req = {
        "jsonrpc": "2.0",
        "id": 103,
        "method": "tools/call",
        "params": {
            "name": "manakai_check_supersession_history",
            "arguments": {"standard": "IS 12269"}
        }
    }
    call_resp = client.post("/api/v1/mcp/rpc", json=call_req)
    call_json = call_resp.json()
    assert_test("JSON-RPC: tools/call IS 12269", call_json.get("result", {}).get("isError") is False)

    # -------------------------------------------------------------
    # 3. CLAUDE DESKTOP STDIO BRIDGE TESTS
    # -------------------------------------------------------------
    print("\n[PHASE 3] Testing Claude Desktop Stdio Bridge Subprocess...")
    bridge_script = str(PROJECT_ROOT / "application" / "mcp_server" / "claude_desktop_bridge.py")
    python_exe = sys.executable

    p = subprocess.Popen(
        [python_exe, bridge_script],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8"
    )

    sample_request = json.dumps({"jsonrpc": "2.0", "id": 999, "method": "tools/list"}) + "\n"
    stdout_data, stderr_data = p.communicate(sample_request, timeout=30)
    
    bridge_ok = False
    try:
        bridge_parsed = json.loads(stdout_data.strip())
        bridge_ok = len(bridge_parsed.get("result", {}).get("tools", [])) == 6
    except Exception:
        pass

    assert_test("Stdio Bridge: JSON-RPC tools/list pipe", bridge_ok, f"(Status: {p.returncode})")

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n=================================================================")
    print(f"  TEST RESULTS: {passed_tests} / {total_tests} TESTS PASSED ({int((passed_tests/total_tests)*100)}%)")
    print("=================================================================")

    if passed_tests == total_tests:
        print("[SUCCESS] All ManakAI MCP Server components are 100% error-free and production-ready!")
        return 0
    else:
        print("[ERROR] Some tests failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
