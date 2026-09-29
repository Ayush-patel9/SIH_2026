from fastapi import APIRouter, HTTPException, Body, UploadFile, File
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger("standards_query_api")

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

from application.services.project_repository import (
    save_approved_standard,
    get_saved_approved_standard,
    list_saved_approved_standards
)

class ApproveStandardPayload(BaseModel):
    standard_data: Dict[str, Any]
    search_query: Optional[str] = ""
    approved_by: Optional[str] = "Technical Officer / Bureau Authority"

from fastapi.responses import JSONResponse

@router.post("/query", summary="Query Standards Intelligence")
def query_standards(request: QueryRequest):
    """
    Core RAG & Knowledge Graph Intelligence Endpoint.
    Processes user query, checks for verified database approvals, resolves supersessions,
    evaluates QCO compliance, and returns full explainability trace with cryptographic audit hash.
    """
    try:
        # 1. Check if user query matches an approved/saved standard in DB
        query_text = request.input.get("text", "") if isinstance(request.input, dict) else str(request.input)
        cached_entry = get_saved_approved_standard(query_text)
        if cached_entry and "response_data" in cached_entry:
            resp_dict = cached_entry["response_data"]
            if isinstance(resp_dict, dict):
                if "meta" not in resp_dict:
                    resp_dict["meta"] = {}
                resp_dict["meta"]["approved_in_db"] = True
                resp_dict["meta"]["approved_by"] = cached_entry.get("approved_by", "Technical Officer")
                resp_dict["meta"]["approved_at"] = cached_entry.get("approved_at", "")
            return JSONResponse(content=resp_dict)

        response = graph_rag_pipeline.process_query(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline processing error: {str(e)}")

@router.post("/standards/approve", summary="Save & Permanently Approve Standard in Database")
def approve_and_save_standard(payload: ApproveStandardPayload):
    """
    Saves and approves a verified Indian Standard dossier in the Neon PostgreSQL database.
    """
    try:
        saved = save_approved_standard(
            standard_data=payload.standard_data,
            search_query=payload.search_query or "",
            approved_by=payload.approved_by or "Technical Officer"
        )
        return {
            "status": "APPROVED_AND_SAVED",
            "message": f"Standard {saved['is_number']} successfully approved and stored in database.",
            "record": saved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve standard: {str(e)}")

@router.get("/standards/saved", summary="List All Approved Standards from Database")
def get_all_saved_standards():
    """
    Retrieves all verified standards dossiers stored in the database.
    """
    try:
        items = list_saved_approved_standards()
        return {
            "status": "SUCCESS",
            "count": len(items),
            "items": items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved standards: {str(e)}")

@router.get("/standards/saved/{is_number}", summary="Get Specific Saved Standard Dossier")
def get_saved_standard_by_key(is_number: str):
    """
    Retrieves a single verified standard dossier by IS number or keyword.
    """
    item = get_saved_approved_standard(is_number)
    if not item:
        raise HTTPException(status_code=404, detail=f"No approved standard found for {is_number}")
    return item

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
    except HTTPException:
        raise
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NIT Export error: {str(e)}")

class PDFAnnotatedTenderResponse(BaseModel):
    responses: List[StandardsResponse] = Field(default_factory=list)
    extracted_text: str
    pages: List[str] = Field(default_factory=list)
    clause_annotations: List[Dict[str, Any]] = Field(default_factory=list)

@router.post("/upload-pdf", response_model=List[StandardsResponse], summary="Upload PDF Tender Document")
async def upload_pdf_tender(
    file: UploadFile = File(...),
    role: Optional[str] = "PROCUREMENT_OFFICER",
    mode: Optional[str] = "recommend"
):
    """
    Accepts multipart PDF upload. Extracts clean text via pdfplumber/pypdf/gemini,
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
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

@router.post("/upload-pdf-annotated", response_model=PDFAnnotatedTenderResponse, summary="Upload PDF with Clause Annotations and Highlighting")
async def upload_pdf_tender_annotated(
    file: UploadFile = File(...),
    role: Optional[str] = "PROCUREMENT_OFFICER",
    mode: Optional[str] = "recommend"
):
    """
    Enhanced Multimodal / Page-Aware PDF Tender Extractor:
    1. Extracts page-by-page text preserving layout and table schedules.
    2. Identifies all technical clauses with verbatim quotes and page numbers for PDF highlighting.
    3. Runs GraphRAG retrieval and supersession checks across all line items.
    4. Returns responses, extracted text, page array, and clause annotations.
    """
    try:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are accepted.")
        
        pdf_bytes = await file.read()
        if len(pdf_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded PDF file is empty.")
        
        from application.pdf_parser.pdf_tender_parser import (
            extract_text_from_pdf,
            extract_pages,
            extract_clause_annotations,
            extract_and_analyse
        )
        
        text = extract_text_from_pdf(pdf_bytes)
        pages = extract_pages(pdf_bytes)
        annotations = extract_clause_annotations(pdf_bytes)
        responses = extract_and_analyse(
            pdf_bytes=pdf_bytes,
            role=role or "PROCUREMENT_OFFICER",
            mode=mode or "recommend"
        )
        
        return PDFAnnotatedTenderResponse(
            responses=responses,
            extracted_text=text,
            pages=pages,
            clause_annotations=annotations
        )
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Annotated PDF processing error: {str(e)}")

# -------------------------------------------------------------------------
# INTERACTIVE BIS AUTHORITY & GAZETTE LEGAL AI ASSISTANT CHATBOT
# -------------------------------------------------------------------------
from pipeline.rag_engine.llm_gateway import LLMGateway
llm_gateway = LLMGateway()

class AuthorityChatPayload(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, Any]]] = None
    standard_context: Optional[Dict[str, Any]] = None
    role: Optional[str] = "PROCUREMENT_OFFICER"
    language: Optional[str] = "en"

@router.post("/authority/chat", summary="Interactive BIS Authority & Gazette Legal AI Chatbot")
def authority_assistant_chat(payload: AuthorityChatPayload):
    """
    Official Bureau of Indian Standards (BIS) Technical & Gazette Legal AI Assistant.
    Provides instant, technically authoritative guidance on standard specifications,
    QCO statutory orders, mandatory lab test protocols, CVC compliance, and tender clause formulations.
    """
    user_q = payload.query.strip()
    if not user_q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    ctx = payload.standard_context or {}
    is_num = ctx.get("is_number") or "Indian Standard"
    title = ctx.get("title") or "Technical Specification"
    status = ctx.get("status") or "ACTIVE"
    year = ctx.get("year_published") or "Current Issue"
    scope = ctx.get("scope_snippet") or ""
    qco = ctx.get("qco") or ctx.get("certification") or {}
    qco_mandatory = qco.get("mandatory", True) if isinstance(qco, dict) else True
    qco_order = qco.get("qco_order_name") or "Statutory BIS Quality Control Order" if isinstance(qco, dict) else "Statutory BIS QCO"
    scheme = qco.get("scheme", "BIS_ISI_MARK") if isinstance(qco, dict) else "BIS_ISI_MARK"
    
    # Build history context
    history_str = ""
    if payload.conversation_history:
        history_str = "\n".join([f"{m.get('sender', 'User').capitalize()}: {m.get('text', '')}" for m in payload.conversation_history[-4:]])

    if llm_gateway.is_available():
        system_prompt = f"""You are the official Bureau of Indian Standards (BIS) Technical & Gazette Authority AI Assistant (ManakAI).
You assist government procurement officers, vigilance authorities, structural engineers, and industrial bidders in interpreting Indian Standards, mandatory Quality Control Orders (QCOs), testing protocols, and CVC defense guidelines.

Active Standard Context:
- Standard: {is_num} ({title})
- Status: {status} (Year / Revision: {year})
- Scope / Description: {scope}
- Legal Certification Status: {'MANDATORY (ISI Mark / CRS)' if qco_mandatory else 'Voluntary'} under {qco_order} (Scheme: {scheme})

Conversation History:
{history_str}

User Question: {user_q}

INSTRUCTIONS:
1. Provide a direct, technically accurate, and legally defensible response.
2. Structure your reply with Markdown: use **bold** for key standard clauses and acts, bullet points for parameter limits, and clean formatting.
3. Cite statutory provisions (e.g., Section 16 of the BIS Act 2016, GFR Rule 144, CVC Guidelines) where applicable.
4. If asked about lab tests, mention mandatory testing protocols (e.g. compressive strength, fineness, tensile ratio, dielectric test, chemical limits) and NABL certificate submission mandates.
5. If asked about tender drafting, give exact citation-ready clause wording with mandatory standard numbers."""

        try:
            res = llm_gateway._raw_generate_json(
                f"{system_prompt}\n\nOutput strict JSON: {{\"reply\": \"Your detailed markdown response here\"}}",
                model_type="flash"
            )
            if res and "reply" in res and res["reply"].strip():
                return {
                    "reply": res["reply"],
                    "is_number": is_num,
                    "model_used": "Gemini 3.8 Flash / ManakAI Authority Engine"
                }
        except Exception as e:
            logger.warning(f"Authority assistant LLM call failed, using domain expert fallback: {e}")

    # Fallback Domain Knowledge Engine
    q_lower = user_q.lower()
    
    # 1. QCO / ISI Mandate
    if any(w in q_lower for w in ["isi", "mandatory", "qco", "gazette", "legal", "compulsory", "order", "act"]):
        reply = (
            f"Under the statutory **{qco_order}** issued under **Section 16 of the Bureau of Indian Standards Act, 2016**, compliance with **{is_num}** is **strictly mandatory** for all public procurement and commercial supply in India.\n\n"
            f"**Key Legal Mandates:**\n"
            f"- **Certification Scheme:** {scheme.replace('_', ' ')} with valid BIS Certification Mark (CML License).\n"
            f"- **Statutory Effect:** Procuring non-ISI marked items or citing withdrawn specifications in government NITs constitutes a direct violation of **GFR Rule 144(i)** and invites CVC vigilance inquiries.\n"
            f"- **Vendor Prerequisite:** Bidders must possess a valid, operative BIS license on the date of bid submission."
        )
    # 2. Lab Testing & Parameter Protocol
    elif any(w in q_lower for w in ["test", "lab", "parameter", "strength", "nabl", "certificate", "method", "limit"]):
        reply = (
            f"Consignments supplied under **{is_num}** ({title}) must strictly undergo standardized laboratory test protocols before acceptance:\n\n"
            f"**Mandatory Testing & Quality Protocols:**\n"
            f"- **Manufacturer Test Certificate (MTC):** Must accompany each lot with batch numbers, date of manufacture, and chemical/physical test results.\n"
            f"- **Third-Party NABL Verification:** Random samples must be tested at BIS-recognized or NABL-accredited laboratories.\n"
            f"- **Critical Acceptance Criteria:** Materials failing compressive strength, chemical residue limits, or safety thresholds cannot be relaxed without technical committee approval."
        )
    # 3. CVC Audit Defense & Vigilance
    elif any(w in q_lower for w in ["cvc", "audit", "vigilance", "defense", "objection", "rti", "gfr", "rule"]):
        reply = (
            f"**CVC Audit Defense & Vigilance Clearance Protocol:**\n\n"
            f"By incorporating **{is_num}** into your tender schedule, your procurement is shielded under **Central Vigilance Commission (CVC) Technical Audit Guidelines**:\n\n"
            f"1. **Impartial Specification Norm:** Eliminates restrictive proprietary clauses by benchmarking against a national standard.\n"
            f"2. **Cryptographic Proof of Lineage:** Every query generates a 64-character SHA-256 sealed audit certificate validating active standard status at NIT publication time.\n"
            f"3. **GFR 144 Conformance:** Fully aligns with General Financial Rules 2017 Rule 144(i) requiring technical specifications to correspond to national standards."
        )
    # 4. NIT Clause Formulation
    elif any(w in q_lower for w in ["nit", "clause", "draft", "tender", "text", "specification"]):
        reply = (
            f"**Recommended Citation-Ready NIT Clause for {is_num}:**\n\n"
            f"> *\"The material/goods supplied shall strictly conform to **{is_num}** ({title}) with all up-to-date amendments in force. The contractor/vendor must hold a valid BIS License with Standard Mark (ISI Mark) and furnish certified copies of Manufacturer Test Certificates (MTC) and NABL-accredited test reports for each consignment prior to dispatch.\"*"
        )
    # 5. Supersession & Reaffirmation
    elif any(w in q_lower for w in ["supersed", "withdrawn", "amend", "history", "version", "year", "old"]):
        reply = (
            f"**Status & Supersession History for {is_num}:**\n\n"
            f"- **Active Specification:** **{is_num}** (Reaffirmed/Published: **{year}**).\n"
            f"- **Current Status:** `{status}`.\n"
            f"- **Regulatory Directive:** Always verify that tenders reference the latest consolidated standard rather than withdrawn legacy codes to avoid audit disqualification."
        )
    # 6. General Intelligent Default
    else:
        reply = (
            f"**Bureau of Indian Standards — Technical Advisory for {is_num}:**\n\n"
            f"**{is_num}** governs **{title}**.\n\n"
            f"- **Scope:** {scope or 'Sets national standards for quality, safety, sampling, and performance testing.'}\n"
            f"- **Compliance:** {'Mandatory BIS ISI Mark enforced by Gazette QCO' if qco_mandatory else 'Voluntary BIS Quality Standard'}.\n\n"
            f"You can ask me for specific lab test thresholds, legal QCO notification dates, CVC audit defense statements, or draft tender clauses for this standard!"
        )

    return {
        "reply": reply,
        "is_number": is_num,
        "model_used": "ManakAI Authority Engine"
    }



