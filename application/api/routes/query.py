from fastapi import APIRouter, HTTPException, Body, UploadFile, File
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.config.api_contract_models import (
    QueryRequest,
    StandardsResponse,
    SpecDraftExport
)
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

router = APIRouter(prefix="/api/v1", tags=["Standards Intelligence & RAG"])

class TenderUploadPayload(BaseModel):
    document_text: str = Field(..., description="Raw pasted tender text or extracted PDF text")
    issuing_ministry: Optional[str] = "GENERAL"
    role: Optional[str] = "PROCUREMENT_OFFICER"
    mode: Optional[str] = "recommend"

class NitExportRequest(BaseModel):
    query_or_standard: str
    tender_id: Optional[str] = "NIT-2026-AUTO"
    include_qa_clauses: bool = True

@router.post("/query", response_model=StandardsResponse, summary="Query Standards Intelligence")
def query_standards(request: QueryRequest):
    """
    Core RAG & Knowledge Graph Intelligence Endpoint.
    Processes user query, resolves supersessions, evaluates QCO compliance,
    and returns full explainability trace with cryptographic audit hash.
    """
    try:
        response = graph_rag_pipeline.process_query(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing error: {str(e)}")

@router.post("/tender-upload", response_model=List[StandardsResponse], summary="Process Multi-Item Tender Document")
def upload_tender_document(payload: TenderUploadPayload):
    """
    2-LLM Ingestion Endpoint:
    1. LLM Call 1: Decomposes multi-clause raw tender text into structured line items.
    2. GraphRAG: Runs multi-channel retrieval on every item.
    3. LLM Call 2: Returns full compliance analysis and audit trail for all items.
    """
    try:
        if not payload.document_text.strip():
            raise HTTPException(status_code=400, detail="document_text cannot be empty.")
        
        responses = graph_rag_pipeline.process_tender_document(
            document_text=payload.document_text,
            role=payload.role or "PROCUREMENT_OFFICER",
            mode=payload.mode or "recommend"
        )
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tender document ingestion error: {str(e)}")

@router.post("/export-nit", response_model=SpecDraftExport, summary="Export Citation-Ready NIT Tender Clause")
def export_nit_clause(req: NitExportRequest):
    """
    Generates citation-ready technical specifications, mandatory certification clauses,
    and test certificate submission requirements ready to be pasted into NIT tender documents.
    """
    try:
        query_req = QueryRequest(input={"text": req.query_or_standard})
        standards_resp = graph_rag_pipeline.process_query(query_req)
        
        if standards_resp.spec_draft_export:
            return standards_resp.spec_draft_export
        
        # Fallback export clause
        prim = standards_resp.primary_recommendation
        return SpecDraftExport(
            tender_clause_text=f"The supplied material shall strictly conform to {prim.is_number} ({prim.title}).",
            mandatory_certifications=["Valid BIS License / Certification Mark" if prim.certification.mandatory else "ISO 9001 Quality System"],
            quality_assurance_requirements=[f"Conformance to {prim.is_number} chemical and physical standards."],
            test_certificate_mandates=[a.is_number for a in standards_resp.allied_standards[:3]]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NIT Export error: {str(e)}")

@router.post("/upload-pdf", response_model=List[StandardsResponse], summary="Upload PDF Tender Document")
async def upload_pdf_tender(
    file: UploadFile = File(...),
    role: Optional[str] = "PROCUREMENT_OFFICER",
    mode: Optional[str] = "recommend"
):
    """
    Accepts multipart PDF upload. Extracts clean text via pdfplumber,
    decomposes tender into line items, and runs GraphRAG retrieval on each.
    """
    try:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are accepted.")
        
        pdf_bytes = await file.read()
        if len(pdf_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")
        
        from application.pdf_parser.pdf_tender_parser import extract_and_analyse
        responses = extract_and_analyse(
            pdf_bytes=pdf_bytes,
            role=role or "PROCUREMENT_OFFICER",
            mode=mode or "recommend"
        )
        return responses
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

