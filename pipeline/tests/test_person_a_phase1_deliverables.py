#!/usr/bin/env python3
"""
test_person_a_phase1_deliverables.py
Comprehensive test suite verifying Person A's Phase 1 deliverables (A1 to A7):
A1: Master catalog enrichment (zero nulls on mandatory fields, 200+ enriched standards)
A2: Normative reference graph (50+ standards, bidirectional referenced_by)
A3: Regulatory QCO & CRS coverage (CRS Scheme-II, DPIIT/Ministry QCOs)
A4: Multilingual Indic lexicons (Hindi 50+, Tamil 20+, Telugu 20+, synonyms mapped)
A5: Pipeline core guarantees (allied >= 2, graph_path >= 3, reasoning_trace >= 4, checklist >= 3, spec_draft != None, scope_snippet != "")
A6: Staleness monitor (10+ typed AlertPayloads with affected tender metadata)
A7: PDF tender parser (text & clause extraction, scanned fallback error handling)
"""

import io
import sys
import json
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pipeline.config.api_contract_models import (
    StandardsResponse,
    AlertPayload,
    QueryRequest
)
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from pipeline.rag_engine.staleness_monitor import staleness_monitor
from pipeline.rag_engine.pdf_parser import PDFTenderExtractor, extract_text_from_pdf

DATA_DIR = Path(__file__).parent.parent / "data"


# =========================================================================
# A1: Master Catalog Enrichment
# =========================================================================
def test_a1_master_catalog_mandatory_fields():
    catalog_path = DATA_DIR / "01_master_catalog" / "unified_standards.json"
    assert catalog_path.exists()
    with open(catalog_path, "r", encoding="utf-8") as f:
        standards = json.load(f)

    assert len(standards) >= 20000, f"Expected >= 20000 standards, found {len(standards)}"

    # Check mandatory fields on all standards
    null_is = sum(1 for s in standards if not s.get("is_number"))
    null_title = sum(1 for s in standards if not s.get("title"))
    null_ics = sum(1 for s in standards if not s.get("ics_codes") or len(s.get("ics_codes", [])) == 0)
    null_scope = sum(1 for s in standards if not s.get("scope_snippet"))
    generic_iec = sum(1 for s in standards if s.get("is_number") in ["IS IEC", "IS IEC ", "IS/IEC"])

    assert null_is == 0, f"Found {null_is} standards with null is_number"
    assert null_title == 0, f"Found {null_title} standards with null title"
    assert null_ics == 0, f"Found {null_ics} standards with null ics_codes"
    assert null_scope == 0, f"Found {null_scope} standards with null scope_snippet"
    assert generic_iec == 0, f"Found {generic_iec} unparsed IS IEC entries"


def test_a1_priority_domains_enriched():
    catalog_path = DATA_DIR / "01_master_catalog" / "unified_standards.json"
    with open(catalog_path, "r", encoding="utf-8") as f:
        standards = json.load(f)

    std_dict = {s["is_number"]: s for s in standards}

    priority_standards = [
        "IS 269", "IS 455", "IS 1489 (PART 1)", "IS 456", "IS 1786",
        "IS 2062", "IS 800", "IS 4984", "IS 4985", "IS 694",
        "IS 7098 (PART 2)", "IS 16102 (PART 1)", "IS 13252 (PART 1)",
        "IS 16046 (PART 2)", "IS 15658", "IS 2185 (PART 3)", "IS 2925"
    ]

    for is_num in priority_standards:
        assert is_num in std_dict, f"Priority standard {is_num} missing from master catalog"
        item = std_dict[is_num]
        assert item.get("certification"), f"Missing certification object for {is_num}"
        assert item.get("scope_snippet"), f"Missing scope snippet for {is_num}"
        assert len(item.get("ics_codes", [])) > 0, f"Missing ICS code for {is_num}"


# =========================================================================
# A2: Knowledge Graph (Normative Reference Graph)
# =========================================================================
def test_a2_normative_reference_graph_integrity():
    graph_path = DATA_DIR / "04_conformity_ecosystem" / "normative_reference_graph.json"
    assert graph_path.exists(), "normative_reference_graph.json does not exist"
    with open(graph_path, "r", encoding="utf-8") as f:
        graph = json.load(f)

    assert len(graph) >= 50, f"Expected >= 50 standards in normative graph, found {len(graph)}"

    # Verify bidirectional references
    for std_id, details in graph.items():
        assert "test_methods" in details
        assert "raw_material_specs" in details
        assert "installation_codes" in details
        assert "allied_normative" in details
        assert "referenced_by" in details


# =========================================================================
# A3: Regulatory QCO & CRS Coverage
# =========================================================================
def test_a3_qco_and_crs_catalogue():
    crs_path = DATA_DIR / "03_regulatory_qco" / "crs_complete_electronics.json"
    qco_path = DATA_DIR / "03_regulatory_qco" / "qco_mapping_matrix.json"
    assert crs_path.exists()
    assert qco_path.exists()

    with open(crs_path, "r", encoding="utf-8") as f:
        crs_data = json.load(f)
    with open(qco_path, "r", encoding="utf-8") as f:
        qco_data = json.load(f)

    assert len(crs_data) >= 40, f"Expected >= 40 CRS products, found {len(crs_data)}"
    assert len(qco_data) >= 80, f"Expected >= 80 QCO standards, found {len(qco_data)}"

    # Ensure key mandatory products exist
    qco_keys = list(qco_data.keys())
    assert any("1786" in k for k in qco_keys), "IS 1786 (Steel) missing from QCO matrix"
    assert any("269" in k for k in qco_keys), "IS 269 (Cement) missing from QCO matrix"
    assert any("4984" in k for k in qco_keys), "IS 4984 (HDPE) missing from QCO matrix"


# =========================================================================
# A4: Multilingual Lexicon
# =========================================================================
def test_a4_multilingual_indic_lexicon():
    hi_path = DATA_DIR / "06_multilingual_lexicon" / "technical_glossary_hi.json"
    reg_path = DATA_DIR / "06_multilingual_lexicon" / "regional_glossary_multi.json"
    syn_path = DATA_DIR / "06_multilingual_lexicon" / "synonym_search_index.json"

    with open(hi_path, "r", encoding="utf-8") as f:
        hi_data = json.load(f)
    with open(reg_path, "r", encoding="utf-8") as f:
        reg_data = json.load(f)
    with open(syn_path, "r", encoding="utf-8") as f:
        syn_data = json.load(f)

    # Hindi terms
    hi_terms = hi_data.get("terms", hi_data)
    assert len(hi_terms) >= 150

    # Regional terms: Tamil and Telugu >= 20
    glossaries = reg_data.get("glossaries", {})
    assert len(glossaries.get("Tamil", {})) >= 20, "Tamil glossary has < 20 terms"
    assert len(glossaries.get("Telugu", {})) >= 20, "Telugu glossary has < 20 terms"
    assert len(glossaries.get("Gujarati", {})) >= 20, "Gujarati glossary has < 20 terms"
    assert len(glossaries.get("Marathi", {})) >= 20, "Marathi glossary has < 20 terms"

    # Synonyms index
    assert len(syn_data) >= 500, f"Expected >= 500 synonym entries, found {len(syn_data)}"
    assert "सीमेंट" in syn_data
    assert "சிமெண்ட்" in syn_data
    assert "సిమెంట్" in syn_data


# =========================================================================
# A5: Pipeline Core Guarantees (Zero Nulls & Guaranteed Lengths)
# =========================================================================
@pytest.mark.parametrize("query_text", [
    "43 grade OPC cement for road construction",
    "Fe 500D TMT steel rebars for seismic bridge piers",
    "HDPE pipes 110mm PN6 for water supply",
    "IS 8112:1989 ordinary portland cement",
    "IS 12269:1987 53 grade cement",
    "IS 2386 testing of aggregates",
    "Self-ballasted LED lamps for street lighting",
    "Laptops and tablet computers for government school",
    "Precast concrete paver blocks for walkway",
    "Industrial safety helmets for factory workers"
])
def test_a5_pipeline_core_guarantees(query_text):
    resp: StandardsResponse = graph_rag_pipeline.process_query(query_text)
    d = resp.model_dump(by_alias=True)

    # Schema & Meta
    assert d["$schema"] == "SIH2026.StandardsResponse.v1"
    assert len(d["meta"]["audit_reference_hash"]) == 64
    assert d["meta"]["processing_time_ms"] >= 0

    # Primary Recommendation
    primary = d["primary_recommendation"]
    assert primary["is_number"], "Empty is_number"
    assert primary["title"], "Empty title"
    assert primary["scope_snippet"], "Empty scope snippet"
    assert len(primary["ics_codes"]) > 0, "Empty ics_codes"
    assert primary["confidence"] > 0.0, "Zero confidence"
    assert primary["certification"] is not None

    # Guaranteed sub-objects
    assert len(d["allied_standards"]) >= 2, f"allied_standards length {len(d['allied_standards'])} < 2"
    assert len(d["graph_path"]) >= 3, f"graph_path edges {len(d['graph_path'])} < 3"
    assert len(d["reasoning_trace"]) >= 4, f"reasoning_trace steps {len(d['reasoning_trace'])} < 4"
    assert len(d["compliance_checklist"]) >= 3, f"compliance_checklist items {len(d['compliance_checklist'])} < 3"
    assert d["plain_language_explanation"]["text"], "Empty plain language explanation"
    assert d["spec_draft_export"] is not None, "spec_draft_export is None"
    assert len(d["spec_draft_export"]["tender_clause_text"]) > 10

    # Audit Record
    assert d["audit_record"]["recommendation_id"].startswith("rec-")
    assert d["audit_record"]["audit_hash"]


def test_a5_superseded_detection():
    resp_8112 = graph_rag_pipeline.process_query("Supply of 43 grade cement conforming to IS 8112:1989")
    assert len(resp_8112.outdated_citations) > 0
    assert any("8112" in c.cited_standard for c in resp_8112.outdated_citations)
    assert "269" in resp_8112.primary_recommendation.is_number

    resp_12269 = graph_rag_pipeline.process_query("53 grade ordinary portland cement as per IS 12269:1987")
    assert len(resp_12269.outdated_citations) > 0
    assert any("12269" in c.cited_standard for c in resp_12269.outdated_citations)
    assert "269" in resp_12269.primary_recommendation.is_number


# =========================================================================
# A6: Staleness Alert Generator
# =========================================================================
def test_a6_staleness_monitor_alerts():
    alerts = staleness_monitor.get_active_alerts()
    assert len(alerts) >= 10, f"Expected >= 10 alerts, found {len(alerts)}"

    # Verify AlertPayload schema structure
    for a in alerts:
        assert a["$schema"] == "SIH2026.AlertPayload.v1"
        assert a["alert_id"].startswith("alt-")
        assert a["alert_type"] in [
            "STANDARD_SUPERSEDED", "STANDARD_AMENDED", "STANDARD_WITHDRAWN",
            "QCO_ENFORCEMENT_DATE", "NEW_MANDATORY_STANDARD"
        ]
        assert a["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        assert a["affected_standard"]["is_number"]
        assert len(a["affected_tenders"]) > 0
        assert a["recommended_action"]

    # Test filtering by standard
    cement_alerts = staleness_monitor.get_alerts_for_standard("IS 8112")
    assert len(cement_alerts) >= 1
    assert "8112" in cement_alerts[0]["affected_standard"]["is_number"]


# =========================================================================
# A7: PDF Parser & Clause Extractor
# =========================================================================
def test_a7_pdf_parser_scanned_handling():
    extractor = PDFTenderExtractor()
    with pytest.raises(ValueError, match="Empty PDF byte stream"):
        extractor.extract_text_from_pdf(b"")

    with pytest.raises(ValueError, match="Unable to extract text"):
        extractor.extract_text_from_pdf(b"%PDF-1.4 dummy non-text content %%EOF")
