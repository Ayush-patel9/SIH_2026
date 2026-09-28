import pytest
from fastapi.testclient import TestClient
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from application.api.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test GET /api/v1/health."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["engine"]["indexed_standards_count"] > 0

def test_query_endpoint():
    """Test POST /api/v1/query."""
    payload = {
        "$schema": "SIH2026.QueryRequest.v1",
        "input": {
            "text": "Procurement of 43 grade ordinary portland cement for highway construction.",
            "language": "en",
            "source": "direct_query",
            "mode": "recommend"
        }
    }
    response = client.post("/api/v1/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["$schema"] == "SIH2026.StandardsResponse.v1"
    assert "269" in data["primary_recommendation"]["is_number"]
    assert data["primary_recommendation"]["certification"]["mandatory"] is True
    assert len(data["audit_record"]["audit_hash"]) == 64

def test_tender_upload_endpoint():
    """Test POST /api/v1/tender-upload with multi-clause tender text."""
    payload = {
        "document_text": """
        Item 1: Supply of 43 Grade Ordinary Portland Cement for highway culvert works.
        Item 2: High strength Thermo-Mechanically Treated (TMT) steel rebars Fe 500D for bridge piers.
        Item 3: High Density Polyethylene (HDPE) pipes 110mm PN6 for water drainage culverts.
        """,
        "role": "PROCUREMENT_OFFICER",
        "mode": "recommend"
    }
    response = client.post("/api/v1/tender-upload", json=payload)
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 3
    assert "269" in items[0]["primary_recommendation"]["is_number"]
    assert "1786" in items[1]["primary_recommendation"]["is_number"]
    assert "4984" in items[2]["primary_recommendation"]["is_number"]

def test_export_nit_endpoint():
    """Test POST /api/v1/export-nit."""
    payload = {
        "query_or_standard": "Fe 500D TMT steel rebars",
        "include_qa_clauses": True
    }
    response = client.post("/api/v1/export-nit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tender_clause_text" in data
    assert len(data["mandatory_certifications"]) > 0

def test_feedback_endpoints():
    """Test POST & GET /api/v1/feedback."""
    payload = {
        "$schema": "SIH2026.FeedbackRequest.v1",
        "original_query_id": "uuid-test-1234",
        "original_recommendation_id": "rec-test-5678",
        "submitter": {
            "user_id": "officer_test",
            "role": "AUDITOR"
        },
        "feedback_type": "WRONG_STANDARD",
        "flagged_is_number": "IS 8112:1989",
        "correct_is_number": "IS 269:2015",
        "officer_notes": "IS 8112 is withdrawn, correct citation is IS 269."
    }
    post_res = client.post("/api/v1/feedback", json=payload)
    assert post_res.status_code == 200
    assert post_res.json()["status"] == "RECORDED"

    get_res = client.get("/api/v1/feedback")
    assert get_res.status_code == 200
    assert len(get_res.json()) > 0

def test_upload_pdf_endpoint():
    """Test POST /api/v1/upload-pdf with a valid PDF stream."""
    pdf_content = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 12 Tf
72 712 Td
(1. Supply of 43 Grade Ordinary Portland Cement conforming to IS 269:2015.) Tj
0 -20 Td
(2. Fe 500D TMT steel rebars conforming to IS 1786.) Tj
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
0000000416 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
495
%%EOF"""
    response = client.post(
        "/api/v1/upload-pdf",
        files={"file": ("tender.pdf", pdf_content, "application/pdf")},
        data={"role": "PROCUREMENT_OFFICER"}
    )
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 2
    assert "269" in items[0]["primary_recommendation"]["is_number"]

def test_upload_pdf_annotated_endpoint():
    """Test POST /api/v1/upload-pdf-annotated with PDF stream returning page breakdowns & clause annotations."""
    pdf_content = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 12 Tf
72 712 Td
(Clause 4.1.2: Supply of 43 Grade Ordinary Portland Cement conforming to IS 8112:1989.) Tj
0 -20 Td
(Clause 7.3.1: Fe 500D TMT steel rebars conforming to IS 1786.) Tj
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
0000000416 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
495
%%EOF"""
    response = client.post(
        "/api/v1/upload-pdf-annotated",
        files={"file": ("tender.pdf", pdf_content, "application/pdf")},
        data={"role": "PROCUREMENT_OFFICER"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "responses" in data
    assert "extracted_text" in data
    assert "pages" in data
    assert "clause_annotations" in data
    assert len(data["pages"]) > 0
    assert len(data["clause_annotations"]) > 0
    assert data["clause_annotations"][0]["pageNumber"] == 1
    assert "verbatimQuote" in data["clause_annotations"][0]

def test_alerts_endpoints():
    """Test GET /api/v1/alerts and POST /api/v1/alerts/simulate."""
    get_res = client.get("/api/v1/alerts")
    assert get_res.status_code == 200
    alerts = get_res.json()
    assert len(alerts) > 0
    assert "alert_id" in alerts[0]

    sim_res = client.post(
        "/api/v1/alerts/simulate",
        params={
            "is_number": "IS 456:2000",
            "event_type": "STANDARD_AMENDED",
            "event_description": "Amendment 5 published"
        }
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["status"] == "SIMULATION_DISPATCHED"
    assert sim_data["alert"]["affected_standard"]["is_number"] == "IS 456:2000"

def test_dynamic_knowledge_graph_subgraph():
    """Test dynamic relational Knowledge Graph traversal for arbitrary IS numbers across domains."""
    # 1. Test Steel Rebars IS 1786
    res1 = client.get("/api/v1/knowledge-graph/subgraph?center=IS+1786&limit=15")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["center"] == "IS 1786"
    assert len(data1["nodes"]) > 0
    assert any("1786" in n["isNumber"] for n in data1["nodes"])
    assert any("1608" in n["isNumber"] or "1599" in n["isNumber"] for n in data1["nodes"])

    # 2. Test Armoured Power Cables IS 7098
    res2 = client.get("/api/v1/knowledge-graph/subgraph?center=IS+7098&limit=15")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["center"] == "IS 7098"
    assert any("7098" in n["isNumber"] for n in data2["nodes"])
    assert any("10810" in n["isNumber"] or "8130" in n["isNumber"] for n in data2["nodes"])

    # 3. Test Industrial Helmets IS 2925
    res3 = client.get("/api/v1/knowledge-graph/subgraph?center=IS+2925&limit=15")
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["center"] == "IS 2925"
    assert any("2925" in n["isNumber"] for n in data3["nodes"])

    # 4. Test HDPE Pipes IS 4984
    res4 = client.get("/api/v1/knowledge-graph/subgraph?center=IS+4984&limit=15")
    assert res4.status_code == 200
    data4 = res4.json()
    assert any("4984" in n["isNumber"] for n in data4["nodes"])

    # 5. Test Default Overview Hub
    res5 = client.get("/api/v1/knowledge-graph/subgraph")
    assert res5.status_code == 200
    data5 = res5.json()
    assert data5["total_indexed"] >= 20000
    assert len(data5["nodes"]) > 5
    assert len(data5["edges"]) > 5

def test_historical_lineage_endpoint():
    """Test GET /api/v1/knowledge-graph/lineage for historical supersession lineages."""
    # 1. Fire Extinguishers IS 15683 (Flagship consolidation)
    res1 = client.get("/api/v1/knowledge-graph/lineage?standard=IS+15683")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "IS 15683" in data1["standard_code"]
    assert len(data1["evolution"]) >= 4
    assert any("940" in e["code"] or "2171" in e["code"] for e in data1["evolution"])
    assert any("QCO" in e["code"] or "QCO" in e["title"] for e in data1["evolution"])

    # 2. Obsolete / Withdrawn 43-Grade Cement IS 8112
    res2 = client.get("/api/v1/knowledge-graph/lineage?standard=IS+8112")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["is_withdrawn"] is True
    assert data2["withdrawn_alert"] is not None
    assert "269" in data2["withdrawn_alert"]["replacement"]
    assert data2["withdrawn_alert"]["severity"] == "CRITICAL"

    # 3. Withdrawn Structural Steel IS 226 -> IS 2062
    res3 = client.get("/api/v1/knowledge-graph/lineage?standard=IS+226")
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["is_withdrawn"] is True
    assert "2062" in data3["canonical_replacement"]

    # 4. TMT Steel Rebars IS 1786
    res4 = client.get("/api/v1/knowledge-graph/lineage?standard=IS+1786")
    assert res4.status_code == 200
    data4 = res4.json()
    assert len(data4["evolution"]) >= 4
    assert any(e["year"] == 2008 for e in data4["evolution"])

    # 5. Potable Drinking Water IS 10500
    res5 = client.get("/api/v1/knowledge-graph/lineage?standard=IS+10500")
    assert res5.status_code == 200
    data5 = res5.json()
    assert len(data5["evolution"]) >= 3
    assert any("2012" in e["code"] for e in data5["evolution"])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

