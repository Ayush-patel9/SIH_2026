#!/usr/bin/env python3
"""
projects.py
FastAPI Router for Project Dossiers, Tender Ingestion & Neon PostgreSQL Persistence.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from application.services.project_repository import (
    list_projects,
    get_project,
    create_project,
    ingest_tender_document,
    save_pipeline_analysis,
    save_chat_message,
    get_chat_history
)

router = APIRouter(prefix="/api/v1/projects", tags=["Procurement Projects & Dossiers"])

# Pydantic Request Models
class CreateProjectRequest(BaseModel):
    title: str = Field(..., description="Project / Tender Title")
    nit_number: str = Field(..., description="Official NIT or Tender ID")
    department: str = Field("National Highways Authority of India (NHAI)", description="Issuing Authority")
    estimated_value: Optional[str] = Field("TBD", description="Estimated Contract Value")

class IngestDocumentRequest(BaseModel):
    document_text: str = Field(..., description="Pasted or extracted text of the tender specification")
    filename: Optional[str] = Field("TENDER_SPECIFICATION.pdf", description="Original filename")
    cloudinary_url: Optional[str] = Field(None, description="Cloudinary HTTPS URL if uploaded as PDF")
    cloudinary_public_id: Optional[str] = Field(None, description="Cloudinary asset public ID")

class ChatMessagePayload(BaseModel):
    sender: str = Field(..., description="'user' or 'assistant'")
    text: str = Field(..., description="Chat message content")
    citations: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

@router.get("", summary="List all procurement projects from Neon PostgreSQL")
def get_all_projects():
    """Retrieve all procurement projects with tender status and compliance scores."""
    try:
        projects = list_projects()
        return {
            "status": "SUCCESS",
            "total": len(projects),
            "projects": projects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch projects: {str(e)}")

@router.post("", summary="Create a new procurement project")
def post_create_project(payload: CreateProjectRequest):
    """Create a new procurement project entry in Neon PostgreSQL."""
    try:
        new_proj = create_project(
            title=payload.title,
            nit_number=payload.nit_number,
            department=payload.department,
            estimated_value=payload.estimated_value or "TBD"
        )
        return {
            "status": "SUCCESS",
            "project": new_proj
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create project: {str(e)}")

@router.get("/{project_id}", summary="Get project details with tender & analysis state")
def get_single_project(project_id: str):
    """Fetch complete project dossier, tender text, and 3-stage AI analysis state."""
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found in Neon database.")
    return {
        "status": "SUCCESS",
        "project": proj
    }

@router.post("/{project_id}/ingest", summary="Ingest tender document into project")
def post_ingest_document(project_id: str, payload: IngestDocumentRequest):
    """Associate a tender document (text + Cloudinary PDF) with a project and freeze it."""
    proj = get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found.")

    try:
        res = ingest_tender_document(
            project_id=project_id,
            document_text=payload.document_text,
            filename=payload.filename or "INGESTED_TENDER.pdf",
            cloudinary_url=payload.cloudinary_url,
            cloudinary_public_id=payload.cloudinary_public_id
        )
        return {
            "status": "SUCCESS",
            "message": "Tender document successfully ingested and dossier frozen in Neon.",
            "data": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")

@router.get("/{project_id}/chat", summary="Get tender chat history")
def get_project_chat(project_id: str):
    """Fetch persistent chat history for the tender assistant."""
    history = get_chat_history(project_id)
    return {
        "status": "SUCCESS",
        "history": history
    }

@router.post("/{project_id}/chat", summary="Save tender chat message")
def post_project_chat(project_id: str, payload: ChatMessagePayload):
    """Save a chat message in the conversation history."""
    try:
        save_chat_message(
            project_id=project_id,
            sender=payload.sender,
            text=payload.text,
            citations=payload.citations
        )
        return {"status": "SUCCESS"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save message: {str(e)}")
