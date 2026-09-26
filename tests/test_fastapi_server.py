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

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

