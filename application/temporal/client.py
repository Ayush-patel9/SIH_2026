"""
Temporal Client Wrapper for ManakAI.
Provides async interfaces for starting workflows, querying live progress, and sending signals.
Includes connection locking, real network RPC health checks, and full fallback result extraction.
"""

import uuid
import asyncio
import logging
from typing import Dict, Any, Optional
from temporalio.client import Client, WorkflowHandle

from application.temporal.config import (
    TEMPORAL_HOST,
    TEMPORAL_NAMESPACE,
    TEMPORAL_TASK_QUEUE,
    WORKFLOW_TENDER_INGESTION
)
from application.temporal.workflows import TenderProcessingWorkflow

logger = logging.getLogger("manakai.temporal.client")

_CLIENT_INSTANCE: Optional[Client] = None
_CLIENT_LOCK = asyncio.Lock()


async def get_temporal_client() -> Client:
    """
    Returns or establishes an asynchronous connection to the Temporal server.
    Thread-safe & async-lock protected against connection races.
    """
    global _CLIENT_INSTANCE
    if _CLIENT_INSTANCE is None:
        async with _CLIENT_LOCK:
            if _CLIENT_INSTANCE is None:
                try:
                    logger.info(f"Connecting to Temporal server at {TEMPORAL_HOST} (namespace={TEMPORAL_NAMESPACE})...")
                    _CLIENT_INSTANCE = await Client.connect(
                        TEMPORAL_HOST,
                        namespace=TEMPORAL_NAMESPACE
                    )
                    logger.info("✓ Connected to Temporal server successfully.")
                except Exception as e:
                    logger.error(f"Failed to connect to Temporal server at {TEMPORAL_HOST}: {e}")
                    raise e
    return _CLIENT_INSTANCE


async def start_tender_workflow(
    input_data: Dict[str, Any],
    workflow_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Triggers a new durable TenderProcessingWorkflow execution in Temporal.
    Returns immediately with workflow_id and initial status.
    """
    client = await get_temporal_client()
    wf_id = workflow_id or f"tender-ingest-{uuid.uuid4().hex[:10]}"

    logger.info(f"Starting TenderProcessingWorkflow with ID: {wf_id}")

    handle = await client.start_workflow(
        TenderProcessingWorkflow.run,
        input_data,
        id=wf_id,
        task_queue=TEMPORAL_TASK_QUEUE
    )

    return {
        "workflow_id": wf_id,
        "status": "QUEUED",
        "task_queue": TEMPORAL_TASK_QUEUE,
        "temporal_ui_url": f"http://localhost:8233/namespaces/{TEMPORAL_NAMESPACE}/workflows/{wf_id}"
    }


async def query_workflow_progress(workflow_id: str) -> Dict[str, Any]:
    """
    Queries the live state, progress percentage, and current stage of a workflow.
    If direct query is unavailable (e.g. worker restarted after completion),
    falls back to describing and fetching full execution results.
    """
    client = await get_temporal_client()
    handle: WorkflowHandle = client.get_workflow_handle(workflow_id)

    try:
        progress_data = await handle.query(TenderProcessingWorkflow.get_progress)
        return progress_data
    except Exception as e:
        logger.warning(f"Live query failed for workflow {workflow_id} ({e}). Falling back to describe/result...")
        try:
            desc = await handle.describe()
            status_name = desc.status.name if hasattr(desc, "status") else "UNKNOWN"

            fallback_data: Dict[str, Any] = {
                "workflow_id": workflow_id,
                "status": status_name,
                "progress": 100 if status_name == "COMPLETED" else 0,
                "current_stage": status_name,
                "message": f"Workflow execution status: {status_name}",
                "waiting_for_clarification": False,
                "has_stage1": False,
                "has_stage2": False,
                "has_stage3": False,
                "error": str(e) if status_name == "FAILED" else None
            }

            # If completed, fetch historical result payload
            if status_name == "COMPLETED":
                try:
                    res_payload = await handle.result()
                    if isinstance(res_payload, dict):
                        fallback_data.update({
                            "progress": 100,
                            "current_stage": "DONE",
                            "tender_metadata": res_payload.get("tender_metadata"),
                            "has_stage1": bool(res_payload.get("stage1_result")),
                            "has_stage2": bool(res_payload.get("stage2_result")),
                            "has_stage3": bool(res_payload.get("stage3_result")),
                            "stage1_result": res_payload.get("stage1_result"),
                            "stage2_result": res_payload.get("stage2_result"),
                            "stage3_result": res_payload.get("stage3_result"),
                        })
                except Exception as rx:
                    logger.warning(f"Could not retrieve completed result payload: {rx}")

            return fallback_data
        except Exception as desc_err:
            logger.error(f"Failed to describe workflow {workflow_id}: {desc_err}")
            raise desc_err


async def send_clarification_signal(workflow_id: str, answers: Dict[str, str]) -> Dict[str, Any]:
    """
    Sends a signal to resume a paused workflow with human-in-the-loop answers.
    """
    client = await get_temporal_client()
    handle: WorkflowHandle = client.get_workflow_handle(workflow_id)
    
    await handle.signal(TenderProcessingWorkflow.submit_clarifications, answers)
    return {"status": "SIGNAL_SENT", "workflow_id": workflow_id}


from temporalio.api.workflowservice.v1 import GetSystemInfoRequest


async def check_temporal_health() -> Dict[str, Any]:
    """
    Performs a real gRPC network RPC ping to the Temporal server.
    """
    try:
        client = await get_temporal_client()
        # Perform live network RPC ping
        info = await client.workflow_service.get_system_info(GetSystemInfoRequest())
        return {
            "status": "HEALTHY",
            "host": TEMPORAL_HOST,
            "namespace": TEMPORAL_NAMESPACE,
            "task_queue": TEMPORAL_TASK_QUEUE,
            "server_version": getattr(info, "server_version", "1.32.0")
        }
    except Exception as e:
        return {
            "status": "UNREACHABLE",
            "host": TEMPORAL_HOST,
            "error": str(e)
        }

