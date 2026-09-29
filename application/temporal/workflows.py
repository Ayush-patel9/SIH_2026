"""
Temporal Workflows for ManakAI (SIH 2026).
Orchestrates durable execution of the end-to-end 3-stage tender processing pipeline.
Includes Human-in-the-Loop clarification handling, timeout recovery, and non-retryable error filtering.
"""

import asyncio
from datetime import timedelta
from typing import Dict, Any, Optional
from temporalio import workflow
from temporalio.common import RetryPolicy

# Retry policy tailored for LLM rate-limits and network latency.
# Explicitly skips unrecoverable schema validation, HTTP 4xx, and type errors.
LLM_RETRY_POLICY = RetryPolicy(
    initial_interval=timedelta(seconds=2),
    backoff_coefficient=2.0,
    maximum_interval=timedelta(seconds=30),
    maximum_attempts=5,
    non_retryable_error_types=[
        "ValueError",
        "FileNotFoundError",
        "ValidationError",
        "HTTPException",
        "KeyError",
        "TypeError"
    ]
)

# Standard activity retry policy
STANDARD_RETRY_POLICY = RetryPolicy(
    initial_interval=timedelta(seconds=1),
    backoff_coefficient=2.0,
    maximum_interval=timedelta(seconds=15),
    maximum_attempts=3
)


@workflow.defn
class TenderProcessingWorkflow:
    """
    Main Durable Execution Workflow for Tender Processing.
    Coordinates: PDF Extraction -> Stage 1 Decomposition -> Stage 2 IS Mapping -> Stage 3 Finalize.
    Supports real-time progress queries and human-in-the-loop clarification signals.
    """

    def __init__(self):
        self.workflow_id: str = ""
        self.status: str = "INITIALIZING"
        self.progress: int = 5
        self.current_stage: str = "INITIALIZING"
        self.message: str = "Tender workflow queued."
        self.tender_metadata: Dict[str, Any] = {}
        self.stage1_result: Optional[Dict[str, Any]] = None
        self.stage2_result: Optional[Dict[str, Any]] = None
        self.stage3_result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None
        
        # Human-in-the-loop synchronization
        self.waiting_for_clarification: bool = False
        self.clarification_answers: Dict[str, str] = {}
        self.clarification_received: bool = False

    @workflow.run
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.workflow_id = workflow.info().workflow_id
        self.status = "RUNNING"
        self.message = "Starting multi-stage ingestion pipeline."

        try:
            # Step 1: Extract Document / PDF
            self.current_stage = "EXTRACTING_PDF"
            self.progress = 15
            self.message = "Extracting text and tables from tender document..."

            extracted_doc = await workflow.execute_activity(
                "extract_pdf_activity",
                input_data,
                start_to_close_timeout=timedelta(minutes=3),
                retry_policy=STANDARD_RETRY_POLICY
            )

            # Step 2: Stage 1 Decomposition (Gemini Flash)
            self.current_stage = "STAGE1_DECOMPOSE"
            self.progress = 40
            self.message = "Running Stage 1: Decomposing specifications into procurement line items..."

            self.stage1_result = await workflow.execute_activity(
                "stage1_decompose_activity",
                extracted_doc,
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=LLM_RETRY_POLICY
            )
            self.tender_metadata = self.stage1_result.get("tender_metadata", {})

            # Step 3: Stage 2 Tri-Retrieval & Knowledge Graph Mapping
            self.current_stage = "STAGE2_MAP"
            self.progress = 70
            self.message = "Running Stage 2: Tri-Retrieval & Normative Knowledge Graph mapping..."

            self.stage2_result = await workflow.execute_activity(
                "stage2_tri_retrieval_activity",
                self.stage1_result,
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=LLM_RETRY_POLICY
            )

            # Optional Step: Check if Human-in-the-Loop clarification is requested
            auto_finalize = input_data.get("auto_finalize", True)
            if not auto_finalize:
                self.current_stage = "WAITING_FOR_CLARIFICATION"
                self.status = "PAUSED_FOR_USER_INPUT"
                self.waiting_for_clarification = True
                self.message = "Waiting for procurement engineer to select clarification options..."
                
                # Wait up to 24 hours for user signal, with graceful timeout recovery
                try:
                    await workflow.wait_condition(
                        lambda: self.clarification_received,
                        timeout=timedelta(hours=24)
                    )
                except Exception as timeout_ex:
                    workflow.logger.warning(
                        f"Clarification window timed out: {timeout_ex}. Auto-finalizing with default standards."
                    )
                    self.message = "Clarification window timed out; proceeding with standard high-confidence matches."
                finally:
                    self.waiting_for_clarification = False

                # If user provided clarification answers via signal, apply them to mappings
                if self.clarification_answers and self.stage2_result:
                    self.message = "Applying engineer clarifications to standards mappings..."
                    self.stage2_result = await workflow.execute_activity(
                        "apply_clarifications_activity",
                        {"stage2_data": self.stage2_result, "answers": self.clarification_answers},
                        start_to_close_timeout=timedelta(minutes=2),
                        retry_policy=STANDARD_RETRY_POLICY
                    )

            # Step 4: Stage 3 Finalize & NIT Schedule
            self.current_stage = "STAGE3_FINALIZE"
            self.status = "RUNNING"
            self.progress = 90
            self.message = "Running Stage 3: Generating grounded clause rewrites and redline diffs..."

            self.stage3_result = await workflow.execute_activity(
                "stage3_finalize_activity",
                self.stage2_result,
                start_to_close_timeout=timedelta(minutes=4),
                retry_policy=LLM_RETRY_POLICY
            )

            # Step 5: Database Persistence
            self.current_stage = "PERSISTING_RESULTS"
            self.progress = 98
            self.message = "Saving audit and analysis record to repository..."

            await workflow.execute_activity(
                "persist_results_activity",
                self.stage3_result,
                start_to_close_timeout=timedelta(minutes=1),
                retry_policy=STANDARD_RETRY_POLICY
            )

            self.status = "COMPLETED"
            self.progress = 100
            self.current_stage = "DONE"
            self.message = "Tender intelligence analysis completed successfully."

            return {
                "workflow_id": self.workflow_id,
                "status": self.status,
                "progress": 100,
                "tender_metadata": self.tender_metadata,
                "stage1_result": self.stage1_result,
                "stage2_result": self.stage2_result,
                "stage3_result": self.stage3_result
            }

        except Exception as e:
            self.status = "FAILED"
            self.error = str(e)
            self.message = f"Workflow failed: {str(e)}"
            workflow.logger.error(f"TenderProcessingWorkflow failed: {e}")
            raise e

    @workflow.query
    def get_progress(self) -> Dict[str, Any]:
        """
        Query method to check the real-time state of the workflow without blocking.
        """
        return {
            "workflow_id": self.workflow_id,
            "status": self.status,
            "progress": self.progress,
            "current_stage": self.current_stage,
            "message": self.message,
            "waiting_for_clarification": self.waiting_for_clarification,
            "tender_metadata": self.tender_metadata,
            "has_stage1": self.stage1_result is not None,
            "has_stage2": self.stage2_result is not None,
            "has_stage3": self.stage3_result is not None,
            "stage1_result": self.stage1_result,
            "stage2_result": self.stage2_result,
            "stage3_result": self.stage3_result,
            "error": self.error
        }

    @workflow.signal
    def submit_clarifications(self, answers: Dict[str, str]):
        """
        Signal method for Human-in-the-Loop user clarification responses.
        """
        self.clarification_answers = answers or {}
        self.clarification_received = True
