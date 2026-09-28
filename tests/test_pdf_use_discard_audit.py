import pytest
import io
import sys
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pypdf import PdfWriter
from application.pdf_parser.pdf_tender_parser import (
    TenderPDFParser,
    extract_pages,
    extract_clause_annotations,
    extract_and_analyse,
)

def create_dummy_tender_pdf() -> bytes:
    """Helper to generate a clean multi-page PDF in-memory for testing."""
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()

def test_tender_pdf_parser_use_discard():
    sample_tender = """
    GOVERNMENT OF INDIA TENDER SPECIFICATION:
    Clause 1.1: Supply of 43 Grade Ordinary Portland Cement conforming to IS 8112:1989.
    Clause 1.2: Fe 415 TMT Steel reinforcement bars conforming to IS 1786:1985.
    Clause 1.3: Concrete aggregates conforming to IS 383:2016.
    Clause 1.4: Water supply HDPE pipes conforming to IS 4984:1995 with PE-80 resin.
    """
    parser = TenderPDFParser()
    result = parser.parse_document_text(sample_tender)

    assert result["total_citations_found"] >= 3
    assert result["outdated_citations_count"] >= 2
    assert result["audit_verdict"] == "ACTION_REQUIRED"
    assert "use_discard_matrix" in result
    assert len(result["use_discard_matrix"]) >= 2

    # Verify IS 8112 replacement
    cement_discard = next((m for m in result["use_discard_matrix"] if "IS 8112" in str(m.get("discard"))), None)
    assert cement_discard is not None
    assert "IS 269" in cement_discard["use"]

def test_extract_clause_annotations_structure():
    from pipeline.rag_engine.pdf_parser import PDFTenderExtractor
    extractor = PDFTenderExtractor()
    
    # Test _audit_clause directly
    audit_res = extractor._audit_clause("Cement conforming to IS 8112:1989", ["IS 8112:1989"])
    status, replacement, cvc_note, suggested, discard_std, use_std, why_disc, action_typ, qco_info = audit_res
    
    assert status == "WITHDRAWN"
    assert "IS 269:2015" in replacement
    assert "CVC" in cvc_note
    assert discard_std == "IS 8112:1989"
    assert "IS 269:2015" in use_std
    assert action_typ == "DISCARD_AND_REPLACE"
    assert qco_info is not None
