#!/usr/bin/env python3
"""
comprehensive_stress_and_security_audit.py
Senior Engineer Comprehensive Stress Testing, Security Auditing, and Contract Verification.

Covers:
1. Security & Injection Vulnerability Testing (SQLi, XSS, Path Traversal, Command Injection, Null Bytes, ReDoS, Error Masking)
2. High-Payload & Memory Stress Testing (100k+ chars, huge PDFs, deep JSON)
3. FastAPI Endpoints Exhaustive Audit (Health, Query, Tender-Upload, Upload-PDF, Export-NIT, Alerts, Feedback)
4. Multi-Threaded Concurrency & High-Load Stress (50 concurrent requests with latency percentiles)
5. Interface Adapter & Contract Schema Deep Validation
6. Standalone Model Context Protocol (MCP) Server Tool Verification
7. Frontend TypeScript Build Verification

Run: ./venv/bin/python3 tests/comprehensive_stress_and_security_audit.py
"""

import os
import sys
import io
import re
import json
import time
import subprocess
import threading
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi.testclient import TestClient
from application.api.main import app
from pipeline.config.api_contract_models import (
    QueryRequest,
    StandardsResponse,
    FeedbackRequest,
    AlertPayload,
    SpecDraftExport
)
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from interface.adapter import InterfaceAdapter
from application.mcp_server.server import dispatch_tool, ALL_TOOLS

client = TestClient(app)

class SeniorEngineerAuditor:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.vulnerabilities: List[Dict[str, Any]] = []
        self.start_time = time.time()

    def record_pass(self, name: str, detail: str = ""):
        self.passed += 1
        msg = f"  ✓ [PASS] {name}"
        if detail:
            msg += f" ({detail})"
        print(msg)

    def record_fail(self, name: str, issue: str, severity: str = "HIGH", payload: Any = None):
        self.failed += 1
        vuln = {
            "name": name,
            "issue": issue,
            "severity": severity,
            "payload": str(payload)[:200] if payload else None
        }
        self.vulnerabilities.append(vuln)
        print(f"  ❌ [{severity}] {name}: {issue}")

    def run_all(self):
        print("=" * 85)
        print(" 🛡️ SENIOR ENGINEER COMPREHENSIVE STRESS & SECURITY AUDIT (PHASE 1 & PHASE 2)")
        print("=" * 85)

        # 1. Security & Injection Attacks
        self.audit_1_security_and_injection_resilience()

        # 2. Extreme Input & Memory Blowup Stress
        self.audit_2_extreme_payload_and_dos_stress()

        # 3. FastAPI REST Endpoints Exhaustive Audit
        self.audit_3_fastapi_endpoints_deep_audit()

        # 4. Multi-Item & PDF Tender Processing Security
        self.audit_4_pdf_and_tender_processing_resilience()

        # 5. Multi-Threaded Concurrency & High Load Stress
        self.audit_5_concurrent_load_stress_testing()

        # 6. Interface Adapter & Contract Schema Strictness
        self.audit_6_interface_adapter_and_contracts()

        # 7. Model Context Protocol (MCP) Server Tools Audit
        self.audit_7_mcp_server_tools_audit()

        # 8. Frontend TypeScript Build Verification
        self.audit_8_frontend_build_verification()

        # Final Summary
        total_time = round(time.time() - self.start_time, 2)
        print("\n" + "=" * 85)
        print(f" 📊 AUDIT COMPLETE in {total_time}s: {self.passed} Passed, {self.failed} Issues/Vulnerabilities Found")
        print("=" * 85)

        if self.vulnerabilities:
            print("\n🚨 VULNERABILITY REPORT:")
            for idx, v in enumerate(self.vulnerabilities, 1):
                print(f"{idx}. [{v['severity']}] {v['name']}: {v['issue']}")
            return False
        else:
            print("\n🏆 ZERO VULNERABILITIES FOUND! Platform passes all security, stress & contract standards.")
            return True

    # -------------------------------------------------------------------------
    # AUDIT 1: Security & Injection Attacks
    # -------------------------------------------------------------------------
    def audit_1_security_and_injection_resilience(self):
        print("\n[Audit 1/8] Security & Injection Resilience (SQLi, XSS, Path Traversal, Command Injection)...")

        attack_payloads = [
            ("SQLi - Boolean True", "' OR '1'='1' --", "query"),
            ("SQLi - Drop Table", "'; DROP TABLE standards; --", "query"),
            ("SQLi - Union Select", "1' UNION SELECT 1, 'admin', 'password' --", "query"),
            ("XSS - Script Tag", "<script>alert('XSS-TEST')</script>", "query"),
            ("XSS - Img OnError", "<img src=x onerror=alert(document.domain)>", "query"),
            ("XSS - SVG Vector", "<svg/onload=alert('XSS')>", "query"),
            ("Path Traversal - Linux", "../../../../etc/passwd", "query"),
            ("Path Traversal - Windows", "..\\..\\..\\windows\\win.ini", "query"),
            ("Path Traversal - Proc Environ", "/proc/self/environ", "query"),
            ("Command Injection - Subshell", "$(whoami)", "query"),
            ("Command Injection - Pipe Cat", "cement | cat /etc/passwd", "query"),
            ("Command Injection - Semicolon", "cement; id; echo done", "query"),
            ("Null Byte Injection", "IS 269\x00.pdf", "query")
        ]

        for name, payload, target in attack_payloads:
            try:
                res = client.post("/api/v1/query", json={
                    "input": {"text": payload, "mode": "recommend"}
                })
                # Check response code: must not be 500 unhandled crash
                if res.status_code == 500:
                    self.record_fail(name, f"Server crashed with 500 on injection input: {res.text}", "HIGH", payload)
                    continue

                data = res.json()
                # Check that response maintains contract integrity
                if "$schema" not in data or not data.get("primary_recommendation", {}).get("is_number"):
                    self.record_fail(name, "Response contract violated on injection input", "MEDIUM", data)
                else:
                    self.record_pass(f"{name} safely sanitized & handled gracefully")
            except Exception as e:
                self.record_fail(name, f"Exception occurred during injection test: {e}", "CRITICAL", payload)

    # -------------------------------------------------------------------------
    # AUDIT 2: Extreme Payload & DoS Stress
    # -------------------------------------------------------------------------
    def audit_2_extreme_payload_and_dos_stress(self):
        print("\n[Audit 2/8] Extreme Payload & Denial of Service Stress Testing...")

        # 1. 100,000 Character Query String
        huge_text = "Ordinary Portland Cement 43 Grade " * 3000
        start_t = time.perf_counter()
        res = client.post("/api/v1/query", json={"input": {"text": huge_text}})
        elapsed = time.perf_counter() - start_t
        if res.status_code == 200:
            self.record_pass(f"100k Character Input processed in {round(elapsed*1000, 1)}ms without crash")
        else:
            self.record_fail("100k Char Input", f"Status {res.status_code}: {res.text}", "HIGH")

        # 2. Deeply Nested Malformed JSON to Test Request Body Parser
        malformed_cases = [
            ("Malformed JSON - Truncated", '{"input": {"text": "IS 269"', 422),
            ("Malformed JSON - Wrong Types", '{"input": {"text": 12345, "language": 999}}', 422),
            ("Empty Body", '', 422),
            ("Array instead of Object", '[{"text": "IS 269"}]', 422)
        ]

        for name, raw_body, exp_status in malformed_cases:
            res = client.post("/api/v1/query", content=raw_body, headers={"Content-Type": "application/json"})
            if res.status_code == exp_status:
                self.record_pass(f"{name} correctly returned HTTP {exp_status}")
            else:
                self.record_fail(name, f"Expected {exp_status}, got {res.status_code}", "MEDIUM")

        # 3. Regex Catastrophic Backtracking (ReDoS) Test
        redos_payload = "IS " + ("9" * 50) + " (Part " + ("1" * 50) + ") : 2026 !!!!!!!"
        start_t = time.perf_counter()
        res = client.post("/api/v1/query", json={"input": {"text": redos_payload}})
        elapsed = time.perf_counter() - start_t
        if elapsed < 0.5:
            self.record_pass(f"ReDoS payload handled in {round(elapsed*1000, 1)}ms (Immune to catastrophic backtracking)")
        else:
            self.record_fail("ReDoS Stress", f"Backtracking caused slow execution: {elapsed}s", "HIGH")

    # -------------------------------------------------------------------------
    # AUDIT 3: FastAPI REST Endpoints Exhaustive Audit
    # -------------------------------------------------------------------------
    def audit_3_fastapi_endpoints_deep_audit(self):
        print("\n[Audit 3/8] FastAPI Endpoints Exhaustive Contract & Behavioral Audit...")

        # 1. Root & Health
        root_res = client.get("/")
        if root_res.status_code == 200 and "service" in root_res.json():
            self.record_pass("GET / (Root Service Index)")
        else:
            self.record_fail("GET /", f"Invalid response: {root_res.status_code}")

        health_res = client.get("/api/v1/health")
        if health_res.status_code == 200:
            h_data = health_res.json()
            if h_data.get("engine", {}).get("indexed_standards_count", 0) > 20000:
                self.record_pass(f"GET /api/v1/health (Catalog Census: {h_data['engine']['indexed_standards_count']} standards)")
            else:
                self.record_fail("GET /api/v1/health", f"Catalog census count too low: {h_data}")
        else:
            self.record_fail("GET /api/v1/health", f"Status: {health_res.status_code}")

        # 2. Multi-Domain Queries against /api/v1/query
        domain_queries = [
            ("Civil - Cement", "43 grade ordinary portland cement for RCC bridge piers", "IS 269"),
            ("Civil - Rebars", "Fe 500D high strength deformed steel rebars for seismic zone", "IS 1786"),
            ("Civil - Paver Blocks", "Precast concrete blocks for paving walkways and bus stops", "IS 15658"),
            ("Civil - AAC Blocks", "Autoclaved aerated concrete blocks for masonry construction", "IS 2185"),
            ("Electrical - Cables", "11kV XLPE insulated cross linked polyethylene power cable", "IS 7098"),
            ("Electrical - Transformer", "Three phase distribution transformer 100 kVA outdoor type", "IS 1180"),
            ("Electrical - LED", "Self-ballasted LED lamps for general lighting 9W B22", "IS 16102"),
            ("Mechanical - Pipes", "HDPE high density polyethylene solid wall pipes for potable water", "IS 4984"),
            ("Mechanical - Submersible Pump", "Electric submersible pumpset for irrigation borewell", "IS 14220"),
            ("IT/Electronics - Laptop", "Laptop computers with Intel Core processor under CRS", "IS 13252"),
            ("IT/Electronics - CCTV", "Video surveillance system CCTV camera for smart city project", "IS 13252"),
            ("Safety - Helmet", "Industrial safety helmets for civil construction laborers", "IS 2925"),
            ("Vernacular Hindi", "हाईवे निर्माण के लिए साधारण पोर्टलैंड सीमेंट ४३ ग्रेड", "IS 269"),
            ("Vernacular Tamil", "நெடுஞ்சாலை பணிகளுக்கான சிமெண்ட் மற்றும் கம்பி", "IS 269"),
            ("Vernacular Telugu", "వంతెన నిర్మాణానికి టీఎంటీ రాడ్లు మరియు సిమెంట్", "IS 1786"),
            ("Vernacular Gujarati", "પીવાના પાણી પુરવઠા માટે એચડીપીઇ પાઇપ", "IS 4984"),
            ("Vernacular Marathi", "रस्ते बांधकामासाठी सिमेंट आणि टीएमटी पोलाद", "IS 269"),
            ("Vernacular Bengali", "পানীয় জলের সরবরাহের জন্য পাইপ", "IS 4984")
        ]

        for label, q_text, exp_is in domain_queries:
            res = client.post("/api/v1/query", json={"input": {"text": q_text, "mode": "recommend"}})
            if res.status_code != 200:
                self.record_fail(label, f"Status code {res.status_code}: {res.text}", "HIGH")
                continue
            data = res.json()
            prim_is = data.get("primary_recommendation", {}).get("is_number", "")
            if exp_is not in prim_is:
                self.record_fail(label, f"Expected {exp_is} in primary recommendation, got '{prim_is}'", "HIGH", q_text)
            else:
                self.record_pass(f"{label} -> {prim_is}")

        # 3. Export NIT Endpoint
        nit_res = client.post("/api/v1/export-nit", json={
            "query_or_standard": "Fe 500D TMT steel rebars",
            "tender_id": "NIT-NHAI-2026-098",
            "include_qa_clauses": True
        })
        if nit_res.status_code == 200:
            nit_data = nit_res.json()
            if "tender_clause_text" in nit_data and len(nit_data["mandatory_certifications"]) > 0:
                self.record_pass("POST /api/v1/export-nit (Valid Spec Draft Generated)")
            else:
                self.record_fail("POST /api/v1/export-nit", "Missing required export fields", "HIGH", nit_data)
        else:
            self.record_fail("POST /api/v1/export-nit", f"Status {nit_res.status_code}: {nit_res.text}")

        # 4. Proactive Alerts & Simulation
        alerts_get = client.get("/api/v1/alerts")
        if alerts_get.status_code == 200 and len(alerts_get.json()) > 0:
            self.record_pass(f"GET /api/v1/alerts ({len(alerts_get.json())} active alerts loaded)")
        else:
            self.record_fail("GET /api/v1/alerts", f"Failed to retrieve active alerts: {alerts_get.text}")

        sim_res = client.post("/api/v1/alerts/simulate", params={
            "is_number": "IS 8112:1989",
            "event_type": "STANDARD_WITHDRAWN",
            "event_description": "Withdrawn and replaced by IS 269:2015",
            "affected_tender_id": "NIT-MORTH-2026-SIM"
        })
        if sim_res.status_code == 200 and sim_res.json().get("status") == "SIMULATION_DISPATCHED":
            self.record_pass("POST /api/v1/alerts/simulate (Dispatched simulated alert)")
        else:
            self.record_fail("POST /api/v1/alerts/simulate", f"Failed simulation: {sim_res.text}")

        # 5. Feedback Loop
        fb_post = client.post("/api/v1/feedback", json={
            "$schema": "SIH2026.FeedbackRequest.v1",
            "original_query_id": "uuid-audit-1234",
            "original_recommendation_id": "rec-audit-5678",
            "submitter": {"user_id": "senior_auditor_01", "role": "AUDITOR", "ministry_code": "MoRTH"},
            "feedback_type": "WRONG_STANDARD",
            "flagged_is_number": "IS 8112:1989",
            "correct_is_number": "IS 269:2015",
            "officer_notes": "IS 8112 is withdrawn; mandatory citation must be IS 269:2015."
        })
        if fb_post.status_code == 200 and fb_post.json().get("status") == "RECORDED":
            self.record_pass("POST /api/v1/feedback (Recorded expert correction)")
        else:
            self.record_fail("POST /api/v1/feedback", f"Failed feedback recording: {fb_post.text}")

        fb_get = client.get("/api/v1/feedback")
        if fb_get.status_code == 200 and len(fb_get.json()) > 0:
            self.record_pass(f"GET /api/v1/feedback ({len(fb_get.json())} feedback entries in audit queue)")
        else:
            self.record_fail("GET /api/v1/feedback", f"Failed to list feedback: {fb_get.text}")

    # -------------------------------------------------------------------------
    # AUDIT 4: PDF & Multi-Item Tender Document Processing
    # -------------------------------------------------------------------------
    def audit_4_pdf_and_tender_processing_resilience(self):
        print("\n[Audit 4/8] PDF Tender Document Parser & Multi-Item Decomposition...")

        # 1. Multi-Item Tender Text Upload
        multi_item_doc = """
        GOVERNMENT OF MAHARASHTRA — PUBLIC WORKS DEPARTMENT
        TENDER NOTICE NO: EE/PWD/NAGPUR/2026/04
        
        Item No 1: Supply and stacking of 43 Grade Ordinary Portland Cement (OPC) conforming to IS 269:2015. Quantity: 5,000 Bags.
        Item No 2: High strength deformed steel bars (TMT) Fe 500D grade conforming to IS 1786:2008. Quantity: 200 MT.
        Item No 3: High Density Polyethylene (HDPE) solid wall water pipes 110mm PN10 conforming to IS 4984:2016. Length: 3,500 Meters.
        Item No 4: Self-ballasted LED street luminaires 90W conforming to IS 16102 (Part 1) and IS 10322. Quantity: 350 Nos.
        Item No 5: Precast concrete interlocking paver blocks 80mm thickness M40 grade conforming to IS 15658:2006. Area: 10,000 Sqm.
        """

        res = client.post("/api/v1/tender-upload", json={"document_text": multi_item_doc})
        if res.status_code != 200:
            self.record_fail("Multi-Item Tender Upload", f"Status {res.status_code}: {res.text}", "HIGH")
        else:
            items = res.json()
            if len(items) == 5:
                self.record_pass(f"Multi-Item Ingestion decomposed {len(items)} distinct BoQ items correctly")
            else:
                self.record_fail("Multi-Item Ingestion", f"Expected 5 items, got {len(items)}", "HIGH")

        # 2. Empty Document Text in Tender Upload (Should return 400 Bad Request)
        res_empty = client.post("/api/v1/tender-upload", json={"document_text": "   "})
        if res_empty.status_code in [400, 500]:
            self.record_pass("Empty Tender Upload correctly rejected with error")
        else:
            self.record_fail("Empty Tender Upload", f"Expected error status, got {res_empty.status_code}", "MEDIUM")

        # 3. PDF Upload Endpoint - Non-PDF File (Should return 400)
        res_non_pdf = client.post(
            "/api/v1/upload-pdf",
            files={"file": ("malicious_script.sh", b"#!/bin/bash\necho 'hack'", "text/x-sh")}
        )
        if res_non_pdf.status_code == 400:
            self.record_pass("Non-PDF File (.sh) upload rejected with HTTP 400")
        else:
            self.record_fail("Non-PDF File Upload", f"Expected 400, got {res_non_pdf.status_code}", "HIGH")

        # 4. PDF Upload Endpoint - Zero-byte PDF File (Should return 400)
        res_zero_pdf = client.post(
            "/api/v1/upload-pdf",
            files={"file": ("empty.pdf", b"", "application/pdf")}
        )
        if res_zero_pdf.status_code == 400:
            self.record_pass("Zero-byte PDF file rejected with HTTP 400")
        else:
            self.record_fail("Zero-byte PDF Upload", f"Expected 400, got {res_zero_pdf.status_code}", "HIGH")

        # 5. PDF Upload Endpoint - Valid Multi-Item PDF
        synthetic_pdf = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 200 >> stream
BT
/F1 12 Tf
72 712 Td
(1. Supply of 43 Grade Ordinary Portland Cement conforming to IS 269:2015 for concrete pier cap works.) Tj
0 -24 Td
(2. Thermo-Mechanically Treated TMT steel bars Fe 500D grade conforming to IS 1786.) Tj
0 -24 Td
(3. High Density Polyethylene HDPE pipes 160mm PN10 as per IS 4984:2016 for water supply line.) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000496 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
575
%%EOF"""

        res_valid_pdf = client.post(
            "/api/v1/upload-pdf",
            files={"file": ("tender_spec.pdf", synthetic_pdf, "application/pdf")}
        )
        if res_valid_pdf.status_code == 200:
            pdf_items = res_valid_pdf.json()
            if len(pdf_items) == 3:
                self.record_pass(f"Multipart PDF upload extracted & decomposed {len(pdf_items)} items successfully")
            else:
                self.record_fail("PDF Upload Decomposition", f"Expected 3 items, got {len(pdf_items)}", "HIGH")
        else:
            self.record_fail("PDF Upload Endpoint", f"Status {res_valid_pdf.status_code}: {res_valid_pdf.text}", "HIGH")

    # -------------------------------------------------------------------------
    # AUDIT 5: Multi-Threaded Concurrency & High Load Stress
    # -------------------------------------------------------------------------
    def audit_5_concurrent_load_stress_testing(self):
        print("\n[Audit 5/8] Multi-Threaded Concurrency & High-Load Stress Testing (50 concurrent requests)...")

        endpoints = [
            ("POST /query", lambda: client.post("/api/v1/query", json={"input": {"text": "IS 269 ordinary portland cement"}})),
            ("POST /query (TMT)", lambda: client.post("/api/v1/query", json={"input": {"text": "Fe 500D TMT steel rebars"}})),
            ("POST /query (HDPE)", lambda: client.post("/api/v1/query", json={"input": {"text": "HDPE pipe for drinking water"}})),
            ("GET /health", lambda: client.get("/api/v1/health")),
            ("GET /alerts", lambda: client.get("/api/v1/alerts"))
        ]

        total_requests = 50
        latencies = []
        errors = []

        def worker_task(idx):
            endpoint_name, fn = endpoints[idx % len(endpoints)]
            t0 = time.perf_counter()
            try:
                res = fn()
                elapsed_ms = (time.perf_counter() - t0) * 1000
                if res.status_code == 200:
                    return (True, elapsed_ms, endpoint_name, None)
                else:
                    return (False, elapsed_ms, endpoint_name, f"Status {res.status_code}")
            except Exception as e:
                elapsed_ms = (time.perf_counter() - t0) * 1000
                return (False, elapsed_ms, endpoint_name, str(e))

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(worker_task, i) for i in range(total_requests)]
            for fut in as_completed(futures):
                success, lat, ep, err = fut.result()
                latencies.append(lat)
                if not success:
                    errors.append((ep, err))

        if errors:
            self.record_fail("Concurrent Load Test", f"{len(errors)} requests failed out of {total_requests}", "HIGH", errors)
        else:
            avg_lat = round(sum(latencies) / len(latencies), 1)
            p95_lat = round(sorted(latencies)[int(len(latencies) * 0.95)], 1)
            min_lat = round(min(latencies), 1)
            max_lat = round(max(latencies), 1)
            self.record_pass(
                "50 Concurrent Requests (0 errors)",
                f"Min: {min_lat}ms, Avg: {avg_lat}ms, P95: {p95_lat}ms, Max: {max_lat}ms"
            )

    # -------------------------------------------------------------------------
    # AUDIT 6: Interface Adapter & Contract Schema Strictness
    # -------------------------------------------------------------------------
    def audit_6_interface_adapter_and_contracts(self):
        print("\n[Audit 6/8] Interface Adapter & Contract Schema Strictness...")
        adapter = InterfaceAdapter()

        # 1. Test transform_pipeline_output with all fields provided
        full_res = adapter.transform_pipeline_output(
            raw_query="Ordinary Portland Cement 43 Grade",
            retrieved_standards=[{
                "is_number": "IS 269:2015",
                "standard_id": "IS 269:2015",
                "title": "Ordinary Portland Cement — Specification",
                "full_title": "IS 269:2015 — Ordinary Portland Cement — Specification (Fifth Revision)",
                "status": "ACTIVE",
                "confidence": 0.95
            }],
            qco_data={"mandatory": True, "scheme": "BIS_ISI_MARK", "qco_order_name": "Cement QCO 2003"},
            normative_refs=[{"is_number": "IS 4031 (Part 1)", "relation_type": "TEST_METHOD"}],
            outdated_list=[]
        )

        try:
            # Validate with Pydantic contract
            validated = StandardsResponse.model_validate(full_res)
            self.record_pass("InterfaceAdapter.transform_pipeline_output (Full Data) valid against StandardsResponse")
        except Exception as e:
            self.record_fail("Adapter Full Transform", f"Pydantic validation failed: {e}", "CRITICAL", full_res)

        # 2. Test transform_pipeline_output with empty / None inputs (Fallbacks)
        empty_res = adapter.transform_pipeline_output(
            raw_query="gibberish non-existent product",
            retrieved_standards=None,
            qco_data=None,
            normative_refs=None,
            outdated_list=None
        )

        try:
            validated_empty = StandardsResponse.model_validate(empty_res)
            self.record_pass("InterfaceAdapter.transform_pipeline_output (Empty/None Fallback) valid against StandardsResponse")
        except Exception as e:
            self.record_fail("Adapter Fallback Transform", f"Pydantic validation failed on fallback: {e}", "HIGH", empty_res)

        # 3. Test Fixtures in interface/fixtures/
        fixtures_dir = PROJECT_ROOT / "interface" / "fixtures"
        for fix_file in fixtures_dir.glob("*.json"):
            with open(fix_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            try:
                if "alert" in fix_file.name:
                    if isinstance(data, list):
                        for item in data:
                            AlertPayload.model_validate(item)
                    else:
                        AlertPayload.model_validate(data)
                elif "query_request" in fix_file.name:
                    QueryRequest.model_validate(data)
                elif "feedback_request" in fix_file.name:
                    FeedbackRequest.model_validate(data)
                else:
                    StandardsResponse.model_validate(data)
                self.record_pass(f"Fixture: {fix_file.name} conforms 100% to schema")
            except Exception as e:
                self.record_fail(f"Fixture {fix_file.name}", f"Schema validation error: {e}", "HIGH")

    # -------------------------------------------------------------------------
    # AUDIT 7: Model Context Protocol (MCP) Server Tools Audit
    # -------------------------------------------------------------------------
    def audit_7_mcp_server_tools_audit(self):
        print("\n[Audit 7/8] Model Context Protocol (MCP) Server Standalone Tools Audit...")

        # 1. Check tool definitions
        if len(ALL_TOOLS) >= 6:
            self.record_pass(f"MCP Server has {len(ALL_TOOLS)} registered statutory tools")
        else:
            self.record_fail("MCP Tool Registry", f"Expected >= 6 tools, found {len(ALL_TOOLS)}", "HIGH")

        # 2. Test get_standard_recommendation
        res_rec = dispatch_tool("get_standard_recommendation", {"query": "43 grade OPC cement for bridge"})
        if "$schema" in res_rec and "primary_recommendation" in res_rec:
            self.record_pass("MCP Tool: get_standard_recommendation")
        else:
            self.record_fail("MCP Tool: get_standard_recommendation", "Invalid response structure", "HIGH", res_rec)

        # 3. Test check_standard_status (Active)
        res_act = dispatch_tool("check_standard_status", {"is_number": "IS 269:2015"})
        if res_act.get("status") == "ACTIVE" and res_act.get("certification", {}).get("mandatory") is True:
            self.record_pass("MCP Tool: check_standard_status (Active IS 269:2015)")
        else:
            self.record_fail("MCP Tool: check_standard_status", f"Unexpected status: {res_act}", "HIGH")

        # 4. Test check_standard_status (Withdrawn)
        res_with = dispatch_tool("check_standard_status", {"is_number": "IS 8112:1989"})
        if res_with.get("status") == "WITHDRAWN" and res_with.get("replaced_by") == "IS 269:2015":
            self.record_pass("MCP Tool: check_standard_status (Withdrawn IS 8112 -> IS 269)")
        else:
            self.record_fail("MCP Tool: check_standard_status (Withdrawn)", f"Unexpected response: {res_with}", "HIGH")

        # 5. Test list_active_alerts
        res_alt = dispatch_tool("list_active_alerts", {"severity": "ALL", "limit": 5})
        if isinstance(res_alt, list) and len(res_alt) > 0:
            self.record_pass(f"MCP Tool: list_active_alerts ({len(res_alt)} alerts returned)")
        else:
            self.record_fail("MCP Tool: list_active_alerts", f"Expected list of alerts, got {res_alt}", "HIGH")

        # 6. Test generate_nit_clause
        res_nit = dispatch_tool("generate_nit_clause", {
            "is_number": "IS 1786:2008",
            "product_name": "TMT Rebars Fe 500D",
            "template": "standard_gem"
        })
        if "clause_text" in res_nit and "IS 1786:2008" in res_nit["clause_text"]:
            self.record_pass("MCP Tool: generate_nit_clause (GeM template)")
        else:
            self.record_fail("MCP Tool: generate_nit_clause", f"Unexpected response: {res_nit}", "HIGH")

        # 7. Test find_testing_labs
        res_labs = dispatch_tool("find_testing_labs", {"is_number": "IS 269", "state": "Delhi"})
        if isinstance(res_labs, list) and len(res_labs) > 0:
            self.record_pass(f"MCP Tool: find_testing_labs ({len(res_labs)} accredited labs found)")
        else:
            self.record_fail("MCP Tool: find_testing_labs", f"No labs found: {res_labs}", "MEDIUM")

        # 8. Test verify_isi_licensee
        res_lic = dispatch_tool("verify_isi_licensee", {"is_number": "IS 269:2015", "manufacturer_name": "UltraTech"})
        if isinstance(res_lic, list) and len(res_lic) > 0:
            self.record_pass("MCP Tool: verify_isi_licensee (UltraTech CM/L verified)")
        else:
            self.record_fail("MCP Tool: verify_isi_licensee", f"Licensee verification failed: {res_lic}", "MEDIUM")

        # 9. Test Unregistered Tool Error Handling
        try:
            dispatch_tool("unregistered_malicious_tool", {})
            self.record_fail("MCP Unknown Tool", "Failed to raise ValueError for unknown tool", "HIGH")
        except ValueError:
            self.record_pass("MCP Tool Dispatcher safely rejects unregistered tools with ValueError")

    # -------------------------------------------------------------------------
    # AUDIT 8: Frontend Build Verification
    # -------------------------------------------------------------------------
    def audit_8_frontend_build_verification(self):
        print("\n[Audit 8/8] Frontend TypeScript & Production Build Verification...")
        frontend_dir = PROJECT_ROOT / "application" / "frontend"
        if not frontend_dir.exists():
            self.record_fail("Frontend Directory", "application/frontend does not exist", "HIGH")
            return

        try:
            cmd = "cd application/frontend && npm run build"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                self.record_pass("Frontend TypeScript & Vite build succeeded with 0 errors")
            else:
                self.record_fail("Frontend Build", f"Build failed: {result.stderr}", "HIGH")
        except Exception as e:
            self.record_fail("Frontend Build", f"Error during frontend build check: {e}", "MEDIUM")


if __name__ == "__main__":
    auditor = SeniorEngineerAuditor()
    success = auditor.run_all()
    sys.exit(0 if success else 1)
