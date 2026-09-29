"""
Data models and dataclasses for Temporal Workflows and Activities.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, model_validator


class TenderWorkflowInput(BaseModel):
    document_text: Optional[str] = Field(None, description="Raw text of the tender")
    cloudinary_url: Optional[str] = Field(None, description="Cloudinary HTTPS URL of the tender PDF")
    file_path: Optional[str] = Field(None, description="Local filepath to the tender PDF")
    tender_title: Optional[str] = "Government Procurement Tender"
    issuing_authority: Optional[str] = "Government / Public Sector Enterprise"
    project_id: Optional[str] = None
    auto_finalize: bool = True
    dry_run: bool = False

    @model_validator(mode="after")
    def validate_source(self) -> "TenderWorkflowInput":
        has_text = bool(self.document_text and self.document_text.strip())
        has_url = bool(self.cloudinary_url and self.cloudinary_url.strip())
        has_path = bool(self.file_path and self.file_path.strip())
        if not (has_text or has_url or has_path):
            raise ValueError(
                "TenderWorkflowInput requires at least one source: 'document_text', 'cloudinary_url', or 'file_path'."
            )
        return self


class WorkflowProgressState(BaseModel):
    workflow_id: str = ""
    status: str = "INITIALIZING"  # INITIALIZING, EXTRACTING_PDF, STAGE1_DECOMPOSE, STAGE2_MAP, WAITING_FOR_CLARIFICATION, STAGE3_FINALIZE, COMPLETED, FAILED
    progress: int = 0
    current_stage: str = "INITIALIZING"
    message: str = "Workflow has been queued."
    waiting_for_clarification: bool = False
    tender_metadata: Optional[Dict[str, Any]] = None
    has_stage1: bool = False
    has_stage2: bool = False
    has_stage3: bool = False
    stage1_result: Optional[Dict[str, Any]] = None
    stage2_result: Optional[Dict[str, Any]] = None
    stage3_result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ClarificationSignalPayload(BaseModel):
    selected_options: Dict[str, str] = Field(
        default_factory=dict,
        description="Map of product_id -> selected option_id or custom string"
    )

