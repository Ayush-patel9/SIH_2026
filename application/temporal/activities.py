"""
Temporal Activities for ManakAI (SIH 2026).
Defines atomic, durable units of execution for PDF extraction,
Stage 1 decomposition, Stage 2 Tri-Retrieval mapping, Stage 2B clarification,
Stage 3 NIT finalization, and Database Persistence.
All blocking operations are safely offloaded to worker threads via asyncio.to_thread.
"""

import os
import io
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from temporalio import activity

from application.api.routes.tender_pipeline import (
    DecomposeRequest,
    DecomposeResponse,
    stage1_decompose_tender,
    Stage2MapRequest,
    Stage2MapResponse,
    stage2_map_products,
    Stage3FinalizeRequest,
    Stage3FinalizeResponse,
    stage3_finalize_tender,
    ExtractedProductItem,
    ProductISMapping,
    FinalizedProductIS
)
from application.services.project_repository import save_pipeline_analysis

logger = logging.getLogger("manakai.temporal.activities")


@activity.defn
async def extract_pdf_activity(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Activity 1: PDF/Document Text Extractor.
    Extracts text and page layout from local PDF or Cloudinary/HTTP URL.
    Safely offloads PDF parsing to a background thread to keep event loop responsive.
    """
    activity.logger.info("Starting extract_pdf_activity...")
    file_path = input_data.get("file_path")
    cloudinary_url = input_data.get("cloudinary_url")
    document_text = input_data.get("document_text")

    extracted_text = document_text or ""
    page_count = 1
    pdf_bytes: Optional[bytes] = None

    # Step A: Check local file path
    if file_path and os.path.exists(file_path):
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            activity.logger.info(f"Loaded {len(pdf_bytes)} bytes from local path: {file_path}")
        except Exception as e:
            activity.logger.warning(f"Could not read local file {file_path}: {e}")

    # Step B: If no local file but URL provided, download over HTTPS
    if not pdf_bytes and cloudinary_url and str(cloudinary_url).startswith("http"):
        activity.logger.info(f"Downloading PDF from remote URL: {cloudinary_url}")
        try:
            async with httpx.AsyncClient(timeout=35.0, follow_redirects=True) as client:
                resp = await client.get(cloudinary_url)
                if resp.status_code == 200:
                    pdf_bytes = resp.content
                    activity.logger.info(f"Downloaded {len(pdf_bytes)} bytes from URL.")
                else:
                    activity.logger.warning(f"Failed to download PDF from URL (Status {resp.status_code})")
        except Exception as err:
            activity.logger.warning(f"HTTP error downloading PDF from {cloudinary_url}: {err}")

    # Step C: Parse PDF bytes in a thread
    if pdf_bytes and len(pdf_bytes) > 0:
        def _parse_bytes(raw: bytes):
            text_out = ""
            p_count = 1
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(stream=raw, filetype="pdf")
                p_count = len(doc)
                pages = [page.get_text() for page in doc]
                text_out = "\n\n--- PAGE BREAK ---\n\n".join(pages)
            except Exception as e1:
                try:
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(raw)) as pdf:
                        p_count = len(pdf.pages)
                        text_out = "\n\n".join(p.extract_text() or "" for p in pdf.pages)
                except Exception as e2:
                    text_out = ""
            return text_out, p_count

        parsed_text, parsed_count = await asyncio.to_thread(_parse_bytes, pdf_bytes)
        if parsed_text and len(parsed_text.strip()) > 10:
            extracted_text = parsed_text
            page_count = parsed_count
            activity.logger.info(f"Successfully extracted {len(extracted_text)} chars across {page_count} pages.")

    return {
        "document_text": extracted_text,
        "page_count": page_count,
        "file_path": file_path,
        "cloudinary_url": cloudinary_url,
        "tender_title": input_data.get("tender_title", "Government Procurement Tender"),
        "issuing_authority": input_data.get("issuing_authority", "Government / PSU"),
        "project_id": input_data.get("project_id"),
        "auto_finalize": input_data.get("auto_finalize", True)
    }


@activity.defn
async def stage1_decompose_activity(extract_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Activity 2: Stage 1 Decomposition.
    Calls Gemini Flash / Pro via LLMGateway to decompose tender specifications
    into distinct procurement products, clause numbers, quotes, and RAG queries.
    Offloaded to worker thread.
    """
    activity.logger.info("Starting stage1_decompose_activity with Gemini LLM...")
    
    req = DecomposeRequest(
        document_text=extract_result.get("document_text"),
        cloudinary_url=extract_result.get("cloudinary_url"),
        file_path=extract_result.get("file_path"),
        tender_title=extract_result.get("tender_title", "Government Procurement Tender"),
        issuing_authority=extract_result.get("issuing_authority", "Government / PSU"),
        project_id=extract_result.get("project_id")
    )

    # Execute Stage 1 logic in thread to prevent blocking event loop
    resp = await asyncio.to_thread(stage1_decompose_tender, req)
    if hasattr(resp, "model_dump"):
        resp_dict = resp.model_dump()
    elif isinstance(resp, dict):
        resp_dict = resp
    else:
        resp_dict = {}
    
    activity.logger.info(
        f"Stage 1 complete: Extracted {len(resp_dict.get('products', []))} products."
    )
    
    return {
        "tender_metadata": resp_dict.get("tender_metadata", {}),
        "products": resp_dict.get("products", []),
        "document_text": extract_result.get("document_text"),
        "project_id": extract_result.get("project_id"),
        "auto_finalize": extract_result.get("auto_finalize", True)
    }


@activity.defn
async def stage2_tri_retrieval_activity(stage1_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Activity 3: Stage 2 Tri-Retrieval & Knowledge Graph Standards Mapping.
    Performs Dense Semantic + BM25 Lexical + Normative Graph traversal
    to match products to BIS standards, detect QCO mandates, and generate clarification MCQs.
    Offloaded to worker thread.
    """
    activity.logger.info("Starting stage2_tri_retrieval_activity...")

    products_raw = stage1_result.get("products", [])
    products_objs = [ExtractedProductItem(**p) for p in products_raw]

    req = Stage2MapRequest(
        document_text=stage1_result.get("document_text", ""),
        products=products_objs,
        project_id=stage1_result.get("project_id")
    )

    resp = await asyncio.to_thread(stage2_map_products, req)
    if hasattr(resp, "model_dump"):
        resp_dict = resp.model_dump()
    elif isinstance(resp, dict):
        resp_dict = resp
    else:
        resp_dict = {}

    activity.logger.info(
        f"Stage 2 complete: Mapped {len(resp_dict.get('mappings', []))} items. "
        f"Outdated detected: {resp_dict.get('audit_summary', {}).get('outdated_standards_count', 0)}"
    )

    return {
        "mappings": resp_dict.get("mappings", []),
        "audit_summary": resp_dict.get("audit_summary", {}),
        "tender_metadata": stage1_result.get("tender_metadata", {}),
        "document_text": stage1_result.get("document_text", ""),
        "project_id": stage1_result.get("project_id"),
        "auto_finalize": stage1_result.get("auto_finalize", True)
    }



@activity.defn
async def apply_clarifications_activity(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Activity 3B: Apply User Clarifications (Human-in-the-Loop).
    Updates Stage 2 mappings based on user-selected clarification answers.
    """
    stage2_data = payload.get("stage2_data", {})
    answers = payload.get("answers", {})  # { product_id: option_id_or_is }

    activity.logger.info(f"Applying {len(answers)} user clarification responses to mappings...")
    mappings = stage2_data.get("mappings", [])

    for m in mappings:
        pid = m.get("product_id")
        if pid in answers:
            chosen = answers[pid]
            # Check if chosen matches an option in clarification_question
            q = m.get("clarification_question") or {}
            options = q.get("options", [])
            matched_opt = next((opt for opt in options if opt.get("option_id") == chosen), None)

            if matched_opt and matched_opt.get("associated_standard"):
                m["mapped_is"] = matched_opt["associated_standard"]
                desc = matched_opt.get("description") or matched_opt.get("label") or "Indian Standard Specification"
                m["is_title"] = f"{matched_opt['associated_standard']} — {desc}" if matched_opt["associated_standard"] not in desc else desc
                m["confidence"] = 95
                m["mapping_rationale"] = f"Clarified by procurement engineer: {matched_opt.get('label', '')}"
                activity.logger.info(f"✓ Product {pid} updated to {m['mapped_is']} ({m['is_title']}) via option {chosen}")
            elif chosen.strip().upper().startswith("IS") or chosen.strip().upper().startswith("SP"):
                m["mapped_is"] = chosen.strip().upper()
                m["is_title"] = f"{chosen.strip().upper()} Specification"
                m["confidence"] = 95
                m["mapping_rationale"] = "Clarified by procurement engineer direct IS selection."
                activity.logger.info(f"✓ Product {pid} updated to {m['mapped_is']} via direct entry")

    stage2_data["mappings"] = mappings
    return stage2_data


@activity.defn
async def stage3_finalize_activity(stage2_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Activity 4: Stage 3 Finalize & Grounded NIT Spec Generation.
    Generates exact clause redline diffs, CVC compliance rationale, and formatted NIT schedule.
    Safely handles empty mappings (0 items scenario) without throwing HTTP 400.
    """
    activity.logger.info("Starting stage3_finalize_activity...")

    mappings_raw = stage2_result.get("mappings", [])
    
    # Empty documents / 0 extracted items guard
    if not mappings_raw:
        activity.logger.info("No mappings to finalize. Returning empty structured NIT response.")
        return {
            "clause_diffs": [],
            "clauses": [],
            "nit_specification_schedule": [],
            "full_nit_draft_text": "## NOTICE INVITING TENDER (NIT)\nNo specific BIS compliance line items identified in this document.",
            "nit_spec_schedule": "No items to schedule.",
            "summary": {
                "initial_compliance_score": 100,
                "final_compliance_score": 100,
                "outdated_standards_eliminated": 0,
                "mandatory_qco_clauses_added": 0,
                "total_products_governed": 0
            },
            "cvc_audit_record": {
                "audit_hash": "0000000000000000000000000000000000000000000000000000000000000000",
                "status": "EMPTY_DOCUMENT",
                "total_clauses_modernized": 0
            },
            "audit_hash": "0000000000000000000000000000000000000000000000000000000000000000",
            "mappings": [],
            "audit_summary": stage2_result.get("audit_summary", {}),
            "tender_metadata": stage2_result.get("tender_metadata", {}),
            "project_id": stage2_result.get("project_id")
        }

    # Construct FinalizedProductIS pairs from stage 2 mappings
    finalized_pairs = []
    for m in mappings_raw:
        finalized_pairs.append(FinalizedProductIS(
            product_id=m.get("product_id") or "prod-1",
            product_name=m.get("product_name") or "Procurement Material",
            clause_number=m.get("clause_number") or "Clause 1.0",
            page_number=m.get("page_number") or 1,
            verbatim_quote=m.get("verbatim_quote") or m.get("product_name") or "",
            chosen_is=m.get("mapped_is") or m.get("chosen_is") or "IS 269:2015",
            is_title=m.get("is_title") or "Indian Standard Specification",
            mandatory_qco=m.get("mandatory_qco", False),
            qco_order_name=m.get("qco_order_name") or "Quality Control Order",
            allied_standards=m.get("allied_standards") or []
        ))

    req = Stage3FinalizeRequest(
        document_text=stage2_result.get("document_text", ""),
        finalized_pairs=finalized_pairs,
        tender_title=stage2_result.get("tender_metadata", {}).get("title", "Government Tender"),
        project_id=stage2_result.get("project_id")
    )

    resp = await asyncio.to_thread(stage3_finalize_tender, req)
    if hasattr(resp, "model_dump"):
        resp_dict = resp.model_dump()
    elif isinstance(resp, dict):
        resp_dict = resp
    else:
        resp_dict = {}

    activity.logger.info("Stage 3 complete: Finalized NIT clauses and diffs.")

    return {
        "clause_diffs": resp_dict.get("clause_diffs", []),
        "clauses": resp_dict.get("clause_diffs", []),
        "nit_specification_schedule": resp_dict.get("nit_specification_schedule", []),
        "full_nit_draft_text": resp_dict.get("full_nit_draft_text", ""),
        "nit_spec_schedule": resp_dict.get("exportable_nit_schedule", resp_dict.get("full_nit_draft_text", "")),
        "summary": resp_dict.get("summary", {}),
        "cvc_audit_record": resp_dict.get("cvc_audit_record", {}),
        "audit_hash": resp_dict.get("audit_hash"),
        "mappings": mappings_raw,
        "audit_summary": stage2_result.get("audit_summary", {}),
        "tender_metadata": stage2_result.get("tender_metadata", {}),
        "project_id": stage2_result.get("project_id")
    }


@activity.defn
async def persist_results_activity(final_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Activity 5: Database Persistence.
    Saves complete 3-stage pipeline analysis to Neon PostgreSQL / Local Repository.
    Correctly adheres to save_pipeline_analysis keyword arguments.
    """
    project_id = final_payload.get("project_id")
    persisted = False
    if project_id:
        try:
            activity.logger.info(f"Persisting analysis for project {project_id}...")
            await asyncio.to_thread(
                save_pipeline_analysis,
                project_id=project_id,
                phase="DASHBOARD_COMPLETED",
                stage1_result={
                    "products": final_payload.get("mappings", []),
                    "tender_metadata": final_payload.get("tender_metadata")
                },
                stage2_result={
                    "mappings": final_payload.get("mappings", []),
                    "audit_summary": final_payload.get("audit_summary")
                },
                stage3_result={
                    "clauses": final_payload.get("clause_diffs", []),
                    "nit_spec_schedule": final_payload.get("full_nit_draft_text")
                },
                current_step_text="Temporal Workflow Completed Analysis"
            )
            persisted = True
            activity.logger.info(f"✓ Persisted analysis to project {project_id} successfully.")
        except Exception as e:
            activity.logger.warning(f"Could not persist analysis to database: {e}")

    return {
        "status": "SUCCESS",
        "persisted": persisted,
        "project_id": project_id
    }
