#!/usr/bin/env python3
"""
WebSocket and Real-time Streaming Routes for SIH 2026 — BIS Standards Intelligence Platform.
Provides bidirectional WebSocket endpoints for:
1. /ws/pipeline — Live stage-by-stage GraphRAG pipeline execution, reasoning token streaming, and authority logs.
2. /ws/alerts   — Real-time supersession alerts, gazette notifications, and QCO enforcement broadcasts.
"""

import sys
import os
import json
import asyncio
import logging
from typing import Dict, Any, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.config.api_contract_models import QueryRequest, StandardsResponse
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from pipeline.rag_engine.staleness_monitor import staleness_monitor
from application.services.project_repository import get_saved_approved_standard

logger = logging.getLogger("bis_websocket_api")

router = APIRouter(tags=["WebSockets & Live Streaming"])


class ConnectionManager:
    """Manages active WebSocket connections for broadcasts and pipeline streaming."""
    def __init__(self):
        self.active_pipeline_connections: Set[WebSocket] = set()
        self.active_alert_connections: Set[WebSocket] = set()

    async def connect_pipeline(self, websocket: WebSocket):
        await websocket.accept()
        self.active_pipeline_connections.add(websocket)
        logger.info(f"Pipeline WebSocket connected. Total active: {len(self.active_pipeline_connections)}")

    def disconnect_pipeline(self, websocket: WebSocket):
        self.active_pipeline_connections.discard(websocket)
        logger.info(f"Pipeline WebSocket disconnected. Total active: {len(self.active_pipeline_connections)}")

    async def connect_alerts(self, websocket: WebSocket):
        await websocket.accept()
        self.active_alert_connections.add(websocket)
        logger.info(f"Alerts WebSocket connected. Total active: {len(self.active_alert_connections)}")

    def disconnect_alerts(self, websocket: WebSocket):
        self.active_alert_connections.discard(websocket)
        logger.info(f"Alerts WebSocket disconnected. Total active: {len(self.active_alert_connections)}")

    async def broadcast_alert(self, alert_data: Dict[str, Any]):
        """Broadcasts an alert to all connected alert stream clients."""
        dead_connections = set()
        message = json.dumps({"type": "live_alert", "alert": alert_data, "timestamp": datetime.now(timezone.utc).isoformat()})
        for ws in self.active_alert_connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead_connections.add(ws)
        for dead in dead_connections:
            self.active_alert_connections.discard(dead)


ws_manager = ConnectionManager()


@router.websocket("/ws/pipeline")
async def websocket_pipeline_endpoint(websocket: WebSocket):
    """
    Live WebSocket for 8-Stage GraphRAG Pipeline Execution:
    Clients send:
      {"type": "query", "text": "...", "mode": "recommend", "role": "PROCUREMENT_OFFICER", "language": "en"}
    Server streams:
      - {"type": "stage_start", "stage": 0..7, "name": "...", "detail": "...", "elapsed_ms": 120}
      - {"type": "stage_complete", "stage": 0..7, "name": "...", "detail": "..."}
      - {"type": "authority_log", "log": "...", "level": "info"}
      - {"type": "pipeline_complete", "data": <StandardsResponse>}
    """
    await ws_manager.connect_pipeline(websocket)
    try:
        # Welcome event
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Connected to SIH 2026 BIS Standards Intelligence Live Pipeline Socket.",
            "pipeline_version": "1.0.0",
            "models_active": ["gemini-3.8-flash", "faiss-dense-vector", "2-tier-kg"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }))

        while True:
            try:
                data_text = await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception:
                break

            try:
                msg = json.loads(data_text)
            except Exception:
                await websocket.send_text(json.dumps({"type": "error", "message": "Invalid JSON format."}))
                continue

            msg_type = msg.get("type", "query")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}))
                continue
            elif msg_type == "close":
                break

            if msg_type == "query":
                query_text = msg.get("text", "").strip()
                if not query_text:
                    await websocket.send_text(json.dumps({"type": "error", "message": "Query text cannot be empty."}))
                    continue

                mode = msg.get("mode", "recommend")
                role = msg.get("role", "PROCUREMENT_OFFICER")
                language = msg.get("language", "en")

                # 1. Check if user query matches an approved/saved standard in Database
                cached_entry = get_saved_approved_standard(query_text)
                if cached_entry and "response_data" in cached_entry:
                    resp_dict = cached_entry["response_data"]
                    if isinstance(resp_dict, dict):
                        if "meta" not in resp_dict:
                            resp_dict["meta"] = {}
                        resp_dict["meta"]["approved_in_db"] = True
                        resp_dict["meta"]["approved_by"] = cached_entry.get("approved_by", "Technical Officer")
                        resp_dict["meta"]["approved_at"] = cached_entry.get("approved_at", "")

                    logger.info(f"✓ Instant DB Hit in WebSocket: Returning approved standard {cached_entry.get('is_number')} from Neon PostgreSQL.")

                    # Stream instant verification sequence to frontend
                    await websocket.send_text(json.dumps({
                        "type": "stage_start",
                        "stage": 0,
                        "name": "Database Verification",
                        "detail": f"Instant verified match found in Bureau DB for {cached_entry.get('is_number')} ({cached_entry.get('title')}).",
                        "elapsed_ms": 8,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }))
                    await asyncio.sleep(0.05)
                    await websocket.send_text(json.dumps({
                        "type": "authority_log",
                        "log": f"🏛️ Bureau Database Match: Verified approved specification for {cached_entry.get('is_number')} retrieved directly from Neon PostgreSQL. Zero LLM latency.",
                        "level": "success",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }))
                    await asyncio.sleep(0.05)
                    await websocket.send_text(json.dumps({
                        "type": "stage_complete",
                        "stage": 0,
                        "name": "Database Verification",
                        "detail": "Verified Bureau DB Record retrieved instantly.",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }))
                    await asyncio.sleep(0.05)
                    await websocket.send_text(json.dumps({
                        "type": "pipeline_complete",
                        "data": resp_dict,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }))
                    continue

                req = QueryRequest(
                    input={"text": query_text, "mode": mode, "language": language},
                    auth={"role": role}
                )

                queue: asyncio.Queue = asyncio.Queue()
                loop = asyncio.get_running_loop()

                def sync_callback(event_dict: Dict[str, Any]):
                    loop.call_soon_threadsafe(queue.put_nowait, event_dict)

                async def run_pipeline():
                    try:
                        resp = await asyncio.to_thread(
                            graph_rag_pipeline.process_query_streaming,
                            req,
                            sync_callback
                        )
                        await queue.put({"__done__": True, "result": resp})
                    except Exception as exc:
                        await queue.put({"__done__": True, "error": str(exc)})

                pipeline_task = asyncio.create_task(run_pipeline())

                while True:
                    event = await queue.get()
                    if isinstance(event, dict) and event.get("__done__"):
                        if "error" in event:
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "message": f"Pipeline execution error: {event['error']}",
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            }))
                        else:
                            resp_obj: StandardsResponse = event["result"]
                            await websocket.send_text(json.dumps({
                                "type": "pipeline_complete",
                                "data": resp_obj.model_dump(),
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            }))
                        break
                    else:
                        event["timestamp"] = datetime.now(timezone.utc).isoformat()
                        await websocket.send_text(json.dumps(event))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket pipeline unhandled exception: {e}")
    finally:
        ws_manager.disconnect_pipeline(websocket)


@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """
    Live WebSocket for Regulatory Alerts & Gazette Supersession Broadcasts:
    - Sends full active alert payload upon connection.
    - Pushes real-time alerts as amendments/QCOs are monitored.
    """
    await ws_manager.connect_alerts(websocket)
    try:
        all_alerts = staleness_monitor.get_all_alerts(limit=20)
        alerts_dicts = [a if isinstance(a, dict) else a.model_dump() for a in all_alerts]
        
        await websocket.send_text(json.dumps({
            "type": "alerts_snapshot",
            "total_alerts": len(alerts_dicts),
            "alerts": alerts_dicts,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }))

        while True:
            try:
                data = await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception:
                break

            try:
                payload = json.loads(data)
                if payload.get("type") == "close":
                    break
                elif payload.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}))
                elif payload.get("type") == "refresh":
                    fresh_alerts = [a if isinstance(a, dict) else a.model_dump() for a in staleness_monitor.get_all_alerts(limit=20)]
                    await websocket.send_text(json.dumps({
                        "type": "alerts_snapshot",
                        "total_alerts": len(fresh_alerts),
                        "alerts": fresh_alerts,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }))
            except Exception:
                pass

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Alerts WebSocket unhandled exception: {e}")
    finally:
        ws_manager.disconnect_alerts(websocket)
