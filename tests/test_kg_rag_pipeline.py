import os
import sys
import json
import pytest

# Ensure SIH_2026 is on python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.config.api_contract_models import QueryRequest, StandardsResponse
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

def test_pipeline_cement_query():
    """Test 1: Procurement of 43 grade ordinary portland cement for highway."""
    query = "Procurement of 43 grade ordinary portland cement for highway construction."
    req = QueryRequest(input={"text": query, "mode": "recommend"})
    
    response = graph_rag_pipeline.process_query(req)
    assert isinstance(response, StandardsResponse)
    
    # Verify primary recommendation
    assert "269" in response.primary_recommendation.is_number
    assert response.primary_recommendation.status == "ACTIVE"
    assert response.primary_recommendation.confidence >= 0.8
    
    # Verify allied standards from Knowledge Graph
    assert len(response.allied_standards) > 0
    assert any("4031" in a.is_number or "4032" in a.is_number for a in response.allied_standards)
    
    # Verify QCO status
    assert response.primary_recommendation.certification.mandatory is True
    
    # Verify Audit Record
    assert response.audit_record.logged is True
    assert len(response.audit_record.audit_hash) == 64
    assert response.audit_record.rti_exportable is True

def test_pipeline_withdrawn_superseded_detection():
    """Test 2: Query specifically citing old withdrawn IS 8112:1989."""
    query = "Supply of 43 grade cement as per IS 8112:1989 for bridge works."
    req = QueryRequest(input={"text": query, "mode": "audit"})
    
    response = graph_rag_pipeline.process_query(req)
    
    # Verify that outdated citation is caught
    assert len(response.outdated_citations) > 0
    assert "8112" in response.outdated_citations[0].cited_standard
    assert response.outdated_citations[0].severity == "CRITICAL"
    
    # Verify primary recommendation was safely swapped to IS 269
    assert "269" in response.primary_recommendation.is_number

def test_pipeline_tmt_steel_rebars():
    """Test 3: High strength deformed steel bars (TMT) for earthquake resistant RCC."""
    query = "High strength deformed steel bars Fe 500D for earthquake resistant RCC building structure."
    req = QueryRequest(input={"text": query})
    
    response = graph_rag_pipeline.process_query(req)
    assert isinstance(response, StandardsResponse)
    
    # Should resolve to IS 1786
    assert "1786" in response.primary_recommendation.is_number
    assert response.primary_recommendation.certification.mandatory is True
    assert len(response.allied_standards) > 0

def test_pipeline_multilingual_paver_block_query():
    """Test 4: Vernacular Hindi compound query for Paver blocks."""
    query = "सीमेंट कंक्रीट पेवर ब्लॉक 80mm मोटाई"
    req = QueryRequest(input={"text": query, "language": "hi"})
    
    response = graph_rag_pipeline.process_query(req)
    assert isinstance(response, StandardsResponse)
    assert "15658" in response.primary_recommendation.is_number
    assert response.query_understanding.detected_language == "hi"

def test_pipeline_crs_electronics_and_hdpe():
    """Test 5: CRS Electronics (Laptops/Tablets) and HDPE pipes."""
    # Test HDPE pipes
    hdpe_resp = graph_rag_pipeline.process_query("HDPE pipes for rural drinking water supply project")
    assert "4984" in hdpe_resp.primary_recommendation.is_number

    # Test Laptops under CRS
    laptop_resp = graph_rag_pipeline.process_query("Laptops and tablet computers under Scheme II CRS registration")
    assert "13252" in laptop_resp.primary_recommendation.is_number
    assert laptop_resp.primary_recommendation.certification.scheme == "BIS_CRS"

def test_pipeline_multi_item_tender_document_processing():
    """Test 6: Full multi-item raw tender document decomposition & processing."""
    raw_tender_doc = """
    NOTICE INVITING TENDER (NIT No. 2026/PWD/091)
    
    Item 1: Supply of 43 Grade Ordinary Portland Cement for highway culvert works.
    
    Item 2: High strength Thermo-Mechanically Treated (TMT) steel rebars Fe 500D for bridge piers.
    
    Item 3: High Density Polyethylene (HDPE) pipes 110mm PN6 for water drainage culverts.
    """
    
    results = graph_rag_pipeline.process_tender_document(raw_tender_doc)
    assert len(results) == 3
    assert all(isinstance(r, StandardsResponse) for r in results)
    
    # Item 1 -> IS 269
    assert "269" in results[0].primary_recommendation.is_number
    # Item 2 -> IS 1786
    assert "1786" in results[1].primary_recommendation.is_number
    # Item 3 -> IS 4984
    assert "4984" in results[2].primary_recommendation.is_number

def test_pipeline_spec_draft_export():
    """Test 7: Verify citation-ready Spec Draft Export clause generation."""
    query = "5HP submersible pump for agricultural water supply"
    req = QueryRequest(input={"text": query})
    
    response = graph_rag_pipeline.process_query(req)
    assert response.spec_draft_export is not None
    assert len(response.spec_draft_export.tender_clause_text) > 20
    assert len(response.spec_draft_export.quality_assurance_requirements) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
