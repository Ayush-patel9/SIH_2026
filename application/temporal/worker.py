"""
Temporal Worker Process for ManakAI (SIH 2026).
Polls the task queue and executes workflows and activities.

Run via:
    python -m application.temporal.worker
"""

import sys
import os
import asyncio
import argparse
import logging
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from temporalio.client import Client
from temporalio.worker import Worker

from application.temporal.config import (
    TEMPORAL_HOST,
    TEMPORAL_NAMESPACE,
    TEMPORAL_TASK_QUEUE,
    TEMPORAL_UI_URL
)
from application.temporal.workflows import TenderProcessingWorkflow
from application.temporal.activities import (
    extract_pdf_activity,
    stage1_decompose_activity,
    stage2_tri_retrieval_activity,
    apply_clarifications_activity,
    stage3_finalize_activity,
    persist_results_activity
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [TemporalWorker] %(message)s"
)
logger = logging.getLogger("manakai.temporal.worker")


async def run_worker(host: str, namespace: str, task_queue: str):
    """
    Connects to Temporal Server and starts listening for workflow and activity tasks.
    """
    logger.info("=" * 60)
    logger.info("🤖 Starting ManakAI Temporal Ingestion Worker...")
    logger.info(f"   • Host:       {host}")
    logger.info(f"   • Namespace:  {namespace}")
    logger.info(f"   • Task Queue: {task_queue}")
    logger.info(f"   • Web UI:     {TEMPORAL_UI_URL}")
    logger.info("=" * 60)

    try:
        client = await Client.connect(host, namespace=namespace)
        logger.info("✓ Connected to Temporal Server successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Temporal Server at {host}: {e}")
        logger.error("Please ensure Temporal Server is running (e.g., 'temporal server start-dev').")
        sys.exit(1)

    worker = Worker(
        client,
        task_queue=task_queue,
        workflows=[TenderProcessingWorkflow],
        activities=[
            extract_pdf_activity,
            stage1_decompose_activity,
            stage2_tri_retrieval_activity,
            apply_clarifications_activity,
            stage3_finalize_activity,
            persist_results_activity
        ],
        max_concurrent_activities=10,
        max_concurrent_workflow_tasks=10
    )

    logger.info(f"🚀 Worker is now polling task queue '{task_queue}' for incoming jobs...")
    logger.info("Press Ctrl+C to stop.")
    
    try:
        await worker.run()
    except asyncio.CancelledError:
        logger.info("Worker received shutdown signal. Exiting gracefully.")


def main():
    parser = argparse.ArgumentParser(description="ManakAI Temporal Worker CLI")
    parser.add_argument("--host", default=TEMPORAL_HOST, help=f"Temporal Server host (default: {TEMPORAL_HOST})")
    parser.add_argument("--namespace", default=TEMPORAL_NAMESPACE, help=f"Temporal namespace (default: {TEMPORAL_NAMESPACE})")
    parser.add_argument("--task-queue", default=TEMPORAL_TASK_QUEUE, help=f"Task queue name (default: {TEMPORAL_TASK_QUEUE})")
    
    args = parser.parse_args()

    try:
        asyncio.run(run_worker(host=args.host, namespace=args.namespace, task_queue=args.task_queue))
    except KeyboardInterrupt:
        logger.info("Worker stopped by user.")


if __name__ == "__main__":
    main()
