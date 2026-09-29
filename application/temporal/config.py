"""
Temporal.io Configuration and Constants for ManakAI (SIH 2026).
Defines host, port, task queues, and workflow parameters.
"""

import os

TEMPORAL_HOST = os.getenv("TEMPORAL_HOST", "localhost:7233")
TEMPORAL_NAMESPACE = os.getenv("TEMPORAL_NAMESPACE", "default")
TEMPORAL_TASK_QUEUE = os.getenv("TEMPORAL_TASK_QUEUE", "manakai-tender-task-queue")
TEMPORAL_UI_URL = os.getenv("TEMPORAL_UI_URL", "http://localhost:8233")

# Workflow Constants
WORKFLOW_TENDER_INGESTION = "TenderProcessingWorkflow"
ACTIVITY_TIMEOUT_SECONDS = int(os.getenv("TEMPORAL_ACTIVITY_TIMEOUT", "300"))
