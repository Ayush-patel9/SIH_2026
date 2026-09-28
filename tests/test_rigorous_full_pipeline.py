"""
Comprehensive Pytest Test Suite for the full 8-Stage GraphRAG Pipeline,
statutory MCP tools, multilingual translation, and legal audit seals.
"""

import os
import sys
import pytest
from datetime import datetime, timezone

# Ensure SIH_2026 is on python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.config.api_contract_models import QueryRequest, StandardsResponse
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from pipeline.rag_engine.tri_retrieval import TriRetrievalLayer
from pipeline.rag_engine.nlp_extractor import NLPExtractor
from pipeline.rag_engine.staleness_monitor import StalenessMonitor
from pipeline.rag_engine.pdf_parser import PDFTenderExtractor
from application.mcp_server.server import dispatch_tool, ALL_TOOLS


class TestRigorousFullPipeline:
    """10-Layer Rigorous Verification of the ManakAI Platform"""

    # 1. Master Catalog & QCO Mandatory Enforcement
    def test_01_master_catalog_census_and_qco(self):
        tri = TriRetrievalLayer()
        assert len(tri.master_standards) >= 20000
        # Check mandatory QCO mapping
        opc_std = tri.exact_and_lexicon_lookup("IS 269:2015")
        assert len(opc_std) > 0
        assert opc_std[0][0]["status"] == "ACTIVE"

    # 2. Multilingual Vernacular Extraction
    @pytest.mark.parametrize("query, lang, expected_is", [
        ("राजमार्ग और पुल निर्माण के लिए 43 ग्रेड पोर्टलैंड सीमेंट", "hi", "269"),
        ("கட்டுமானத்திற்கான எஃகு கம்பிகள் Fe 500D", "ta", "1786"),
        ("পৌরসভার পানীয় জলের জন্য এইচডিপিই পাইপ", "bn", "4984"),
    ])
    def test_02_multilingual_indic_extraction(self, query, lang, expected_is):
        nlp = NLPExtractor()
        und = nlp.extract_understanding(query, user_language=lang)
        resp = graph_rag_pipeline.process_query(QueryRequest(input={"text": query, "language": lang}))
        assert expected_is in resp.primary_recommendation.is_number

    # 3. Typo & Noisy Technical Query Recovery
    def test_03_noisy_technical_query_recovery(self):
        nlp = NLPExtractor()
        noisy = "procuremnt of portlnd cemnt 43grd for concrite"
        und = nlp.extract_understanding(noisy)
        assert len(und.extracted_entities) >= 1

    # 4. Outdated & Superseded Standards Traps
    @pytest.mark.parametrize("withdrawn_query, cited_is, current_replacement", [
        ("Supply of 43 grade cement as per IS 8112:1989 for culvert construction.", "8112", "IS 269:2015"),
        ("Supply of 53 grade cement as per IS 12269:1987 for high rise piers.", "12269", "IS 269:2015"),
    ])
    def test_04_superseded_standards_forensics(self, withdrawn_query, cited_is, current_replacement):
        resp = graph_rag_pipeline.process_query(QueryRequest(input={"text": withdrawn_query, "mode": "audit"}))
        assert len(resp.outdated_citations) > 0
        assert cited_is in resp.outdated_citations[0].cited_standard
        assert resp.outdated_citations[0].severity == "CRITICAL"
        assert "269" in resp.primary_recommendation.is_number

    # 5. National Procurement 10-Item Benchmark
    @pytest.mark.parametrize("query_text, expected_is, mandatory_check", [
        ("Procurement of 43 grade ordinary portland cement for national highway bridge.", "269", True),
        ("High strength deformed steel bars Fe 500D grade for seismic zone IV RCC building.", "1786", True),
        ("Structural steel standard quality plates and sections E250 grade for railway bridge girders.", "2062", True),
        ("High-definition IP surveillance cameras with ONVIF compliance (IS 13252).", "13252", True),
        ("Supply of 11kV cross-linked polyethylene insulated armoured power cables as per IS 7098 Part 2.", "7098", True),
        ("High Density Polyethylene pipes 110mm PN6 for rural drinking water supply project.", "4984", True),
        ("Industrial safety helmets for factory and construction workers.", "2925", True),
        ("Self-ballasted LED lamps for municipal street lighting under QCO scheme.", "16102", True),
        ("Laptops and tablet computers under Scheme II Compulsory Registration Scheme.", "13252", True),
        ("Precast concrete paver blocks 80mm thickness for heavy traffic walkways.", "15658", True),
    ])
    def test_05_national_procurement_benchmarks(self, query_text, expected_is, mandatory_check):
        resp = graph_rag_pipeline.process_query(query_text)
        assert expected_is in resp.primary_recommendation.is_number
        if mandatory_check:
            assert resp.primary_recommendation.certification.mandatory is True or resp.primary_recommendation.certification.scheme == "BIS_CRS"

    # 6. SHA-256 Audit Seal Integrity
    def test_06_sha256_audit_seal_integrity(self):
        resp = graph_rag_pipeline.process_query(QueryRequest(input={"text": "Procurement of 43 grade cement", "mode": "audit"}))
        audit = resp.audit_record
        assert len(audit.audit_hash) == 64
        assert audit.logged is True
        assert audit.rti_exportable is True

    # 7. Model Context Protocol (MCP) Server Tool Dispatch
    def test_07_mcp_statutory_tools(self):
        # 7.1 Recommend
        res1 = dispatch_tool("get_standard_recommendation", {"query": "43 grade cement"})
        assert "269" in res1["primary_recommendation"]["is_number"]

        # 7.2 Status
        res2 = dispatch_tool("check_standard_status", {"is_number": "IS 8112:1989"})
        assert res2["status"] == "WITHDRAWN"
        assert "269" in str(res2.get("replaced_by", ""))

        # 7.3 Alerts
        res3 = dispatch_tool("list_active_alerts", {"limit": 5})
        alerts = res3 if isinstance(res3, list) else res3.get("alerts", [])
        assert len(alerts) > 0

        # 7.4 NIT Clause
        res4 = dispatch_tool("generate_nit_clause", {"is_number": "IS 269:2015", "product_name": "Ordinary Portland Cement"})
        assert "IS 269:2015" in res4["clause_text"]

        # 7.5 Testing Labs
        res5 = dispatch_tool("find_testing_labs", {"is_number": "IS 269:2015"})
        labs = res5 if isinstance(res5, list) else res5.get("labs", [])
        assert len(labs) > 0

        # 7.6 Verify Licensee
        res6 = dispatch_tool("verify_isi_licensee", {"is_number": "IS 269:2015", "manufacturer_name": "UltraTech"})
        licensees = res6 if isinstance(res6, list) else res6.get("licensees", [])
        assert len(licensees) > 0

    # 8. Multi-Item Tender Document Decomposition
    def test_08_multi_item_tender_decomposition(self):
        raw_tender = """
        NIT-2026-PWD-01
        Item 1: 43 Grade Ordinary Portland Cement for Culverts (IS 269).
        Item 2: Fe 500D TMT Steel Rebars for Bridge Pier (IS 1786).
        Item 3: 110mm HDPE Pipes PN6 for Water Culverts (IS 4984).
        """
        analysis = graph_rag_pipeline.tender_doc_parser.parse_raw_tender_text(raw_tender)
        assert len(analysis.extracted_items) >= 3
        queries = [item.clean_search_query for item in analysis.extracted_items]
        assert len(queries) >= 3

    # 9. Real-time Streaming WebSocket Events
    def test_09_streaming_events_emission(self):
        events = []
        def on_event(e):
            events.append(e)

        resp = graph_rag_pipeline.process_query_streaming("Supply of 43 grade ordinary portland cement", on_event=on_event)
        assert len(events) >= 5
        assert any(e.get("stage") == 0 for e in events)
        assert any(e.get("stage") == 1 for e in events)
        assert any(e.get("stage") == 3 for e in events)
        assert any(e.get("stage") == 4 for e in events)

    # 10. Staleness Monitor Supersession Delta
    def test_10_staleness_monitor_delta(self):
        monitor = StalenessMonitor()
        alerts = monitor.get_all_alerts(limit=10)
        assert len(alerts) > 0
        assert any("8112" in (a.get("affected_standard", {}).get("is_number", "") or "") or "12269" in (a.get("affected_standard", {}).get("is_number", "") or "") for a in alerts)
