#!/usr/bin/env python3
"""
ManakAI Temporal CLI Tool.
Interact with Temporal.io durable workflows directly from the command line.

Commands:
  • health: Check Temporal server status
  • submit: Submit a tender PDF or text file for durable processing
  • status: Track live progress and stage results for a workflow ID
  • signal: Send Human-in-the-Loop clarification choices to a paused workflow

Usage:
  python scripts/run_temporal_cli.py health
  python scripts/run_temporal_cli.py submit MOCK_GOVERNMENT_TENDER_NIT_2026.pdf
  python scripts/run_temporal_cli.py status <workflow_id> --watch
"""

import sys
import os
import time
import json
import asyncio
import argparse
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from application.temporal.config import TEMPORAL_HOST, TEMPORAL_NAMESPACE, TEMPORAL_TASK_QUEUE, TEMPORAL_UI_URL
from application.temporal.client import (
    start_tender_workflow,
    query_workflow_progress,
    send_clarification_signal,
    check_temporal_health
)


def print_banner():
    print("=" * 70)
    print("  🏛️  MANAKAI TEMPORAL DURABLE INGESTION ENGINE CLI")
    print(f"  • Temporal Server: {TEMPORAL_HOST} (Namespace: {TEMPORAL_NAMESPACE})")
    print(f"  • Task Queue:      {TEMPORAL_TASK_QUEUE}")
    print(f"  • Web Dashboard:   {TEMPORAL_UI_URL}")
    print("=" * 70)


async def cmd_health():
    print("\n🔍 Checking Temporal Server connectivity...")
    res = await check_temporal_health()
    if res.get("status") == "HEALTHY":
        print(f"✅ SUCCESS: Temporal Server is healthy and reachable at {res.get('host')}")
        print(f"🌐 Temporal Web UI: {TEMPORAL_UI_URL}")
    else:
        print(f"❌ ERROR: Temporal Server is unreachable at {res.get('host')}")
        print(f"   Details: {res.get('error')}")
        print("\n👉 Tip: Start the dev server in another terminal by running:")
        print("   /opt/homebrew/bin/temporal server start-dev")


async def cmd_submit(file_path: str, title: str, authority: str, watch: bool = True):
    path_obj = Path(file_path)
    if not path_obj.exists():
        print(f"❌ Error: File '{file_path}' does not exist.")
        return

    print(f"\n📄 Submitting '{path_obj.name}' for durable processing...")
    
    input_data = {
        "file_path": str(path_obj.resolve()),
        "tender_title": title,
        "issuing_authority": authority,
        "auto_finalize": True
    }

    try:
        res = await start_tender_workflow(input_data)
        workflow_id = res["workflow_id"]
        print(f"\n🚀 Workflow started successfully!")
        print(f"   • Workflow ID:    {workflow_id}")
        print(f"   • Task Queue:     {res['task_queue']}")
        print(f"   • Live Web Trace: {res['temporal_ui_url']}")

        if watch:
            print("\n👀 Watching live execution progress in terminal...\n")
            await cmd_status(workflow_id, watch=True)
    except Exception as e:
        print(f"❌ Failed to start workflow: {e}")
        print("Make sure both 'temporal server start-dev' and 'python -m application.temporal.worker' are running.")


async def cmd_status(workflow_id: str, watch: bool = False):
    prev_stage = None
    while True:
        try:
            state = await query_workflow_progress(workflow_id)
            status = state.get("status", "UNKNOWN")
            progress = state.get("progress", 0)
            stage = state.get("current_stage", "UNKNOWN")
            msg = state.get("message", "")

            if stage != prev_stage or not watch:
                bar_len = 30
                filled = int(bar_len * (progress / 100))
                bar = "█" * filled + "░" * (bar_len - filled)
                print(f"[{bar}] {progress:3d}% | Stage: {stage:20s} | Status: {status}")
                if msg:
                    print(f"   ↳ {msg}")
                prev_stage = stage

            if status in ("COMPLETED", "FAILED") or not watch:
                if status == "COMPLETED":
                    print("\n" + "=" * 70)
                    print("🎉 WORKFLOW COMPLETED SUCCESSFULLY!")
                    print("=" * 70)
                    meta = state.get("tender_metadata") or {}
                    s1 = state.get("stage1_result") or {}
                    s2 = state.get("stage2_result") or {}
                    s3 = state.get("stage3_result") or {}
                    
                    products = s1.get("products", [])
                    mappings = s2.get("mappings", [])
                    clauses = s3.get("clause_diffs") or s3.get("clauses", [])
                    audit = s3.get("cvc_audit_record", {})

                    print(f"📋 Tender Title:        {meta.get('title', 'N/A')}")
                    print(f"🏢 Issuing Authority:   {meta.get('department', 'N/A')}")
                    print(f"📦 Line Items Extracted: {len(products)}")
                    print(f"🔗 BIS Standards Mapped: {len(mappings)}")
                    print(f"✍️ Modernized Clauses:   {len(clauses)}")
                    if audit.get("audit_hash"):
                        print(f"🔒 Cryptographic Hash:   {audit.get('audit_hash')}")
                    print(f"🌐 Live Web Dashboard:   {TEMPORAL_UI_URL}/namespaces/{TEMPORAL_NAMESPACE}/workflows/{workflow_id}")
                    print("=" * 70)
                elif status == "FAILED":
                    print("\n" + "=" * 70)
                    print(f"❌ WORKFLOW FAILED: {state.get('error')}")
                    print(f"🌐 Inspect Stack Trace: {TEMPORAL_UI_URL}/namespaces/{TEMPORAL_NAMESPACE}/workflows/{workflow_id}")
                    print("=" * 70)
                break

            await asyncio.sleep(2.0)
        except Exception as e:
            print(f"⚠️ Error checking status: {e}")
            if not watch:
                break
            await asyncio.sleep(3.0)


async def cmd_signal(workflow_id: str, product_id: str, option_id: str):
    print(f"\n📡 Sending signal to workflow {workflow_id}...")
    answers = {product_id: option_id}
    try:
        res = await send_clarification_signal(workflow_id, answers)
        print(f"✓ Signal sent: {res}")
    except Exception as e:
        print(f"❌ Error sending signal: {e}")


def main():
    print_banner()
    parser = argparse.ArgumentParser(description="ManakAI Temporal CLI Tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Health command
    subparsers.add_parser("health", help="Check Temporal server health")

    # Submit command
    submit_p = subparsers.add_parser("submit", help="Submit a tender document for ingestion")
    submit_p.add_argument("file", help="Path to PDF or document file")
    submit_p.add_argument("--title", default="Government Procurement Tender", help="Tender title")
    submit_p.add_argument("--authority", default="Government / PSU Authority", help="Issuing department")
    submit_p.add_argument("--no-watch", action="store_true", help="Do not wait and watch progress in console")

    # Status command
    status_p = subparsers.add_parser("status", help="Query progress of a workflow")
    status_p.add_argument("workflow_id", help="Temporal Workflow ID")
    status_p.add_argument("--watch", "-w", action="store_true", help="Continuously watch until completion")

    # Signal command
    signal_p = subparsers.add_parser("signal", help="Send clarification signal")
    signal_p.add_argument("workflow_id", help="Temporal Workflow ID")
    signal_p.add_argument("--product-id", required=True, help="Product ID")
    signal_p.add_argument("--option-id", required=True, help="Chosen Option ID")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if args.command == "health":
        asyncio.run(cmd_health())
    elif args.command == "submit":
        asyncio.run(cmd_submit(args.file, args.title, args.authority, watch=not args.no_watch))
    elif args.command == "status":
        asyncio.run(cmd_status(args.workflow_id, watch=args.watch))
    elif args.command == "signal":
        asyncio.run(cmd_signal(args.workflow_id, args.product_id, args.option_id))


if __name__ == "__main__":
    main()
