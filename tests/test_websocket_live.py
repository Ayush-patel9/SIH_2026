#!/usr/bin/env python3
"""
Test WebSocket endpoints for SIH 2026 — BIS Standards Intelligence Platform.
Validates:
1. /ws/pipeline bidirectional connection and 8-stage streaming events.
2. /ws/alerts snapshot and keepalive ping/pong.
"""

import sys
import os
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from application.api.main import app

def test_websocket_pipeline_streaming():
    client = TestClient(app)
    with client.websocket_connect("/ws/pipeline") as websocket:
        welcome = websocket.receive_json()
        assert welcome["type"] == "connected"
        assert "BIS Standards Intelligence" in welcome["message"]

        # Send test query
        websocket.send_json({
            "type": "query",
            "text": "HDPE pipes IS 4984 for water distribution",
            "mode": "recommend",
            "role": "PROCUREMENT_OFFICER"
        })

        events = []
        while True:
            evt = websocket.receive_json()
            events.append(evt)
            if evt.get("type") in ["pipeline_complete", "error"]:
                break

        assert len(events) >= 5, f"Expected at least 5 stage events, got {len(events)}"
        complete_evt = events[-1]
        assert complete_evt["type"] == "pipeline_complete"
        data = complete_evt["data"]
        assert "primary_recommendation" in data
        assert "is_number" in data["primary_recommendation"]


def test_websocket_alerts_broadcast():
    client = TestClient(app)
    with client.websocket_connect("/ws/alerts") as websocket:
        snapshot = websocket.receive_json()
        assert snapshot["type"] == "alerts_snapshot"
        assert "alerts" in snapshot
        assert isinstance(snapshot["alerts"], list)

        # Send Ping and expect Pong
        websocket.send_json({"type": "ping"})
        pong = websocket.receive_json()
        assert pong["type"] == "pong"
        
        # Send close
        websocket.send_json({"type": "close"})
