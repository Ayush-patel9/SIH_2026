"""
Unit and Integration Tests for S2 Heartbeat System
Covers:
1. Inbound GET /api/heartbeat latency and schema (< 10ms)
2. Outbound keepalive ping to S1 (success, failure, timeout handling)
3. POST /api/heartbeat/ping-s1 endpoint
"""

import time
import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from application.api.main import app
from application.services.s2_heartbeat_service import S2HeartbeatService

client = TestClient(app)

def test_inbound_heartbeat_endpoint_contract_and_latency():
    """Validates GET /api/heartbeat responds in < 10ms with strict JSON schema."""
    # Warmup client / Starlette middleware
    client.get("/api/heartbeat")

    latencies = []
    # Execute 5 times to measure warm latency
    for _ in range(5):
        t0 = time.perf_counter()
        resp = client.get("/api/heartbeat")
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000)

    assert resp.status_code == 200
    avg_latency = sum(latencies) / len(latencies)
    assert avg_latency < 10.0, f"Expected < 10ms, got {avg_latency:.2f}ms"

    data = resp.json()
    # Contract assertions
    assert data["service"] == "S2"
    assert data["status"] in ("HEALTHY", "DEGRADED", "INITIALIZING")
    assert "timestamp" in data

    diag = data["diagnostics"]
    assert "target_s1_url" in diag
    assert "last_heartbeat_attempt" in diag
    assert "last_successful_heartbeat" in diag
    assert "last_failure" in diag
    assert "consecutive_successes" in diag
    assert isinstance(diag["consecutive_successes"], int)

@pytest.mark.asyncio
async def test_outbound_ping_s1_success():
    """Tests S2 outbound ping when S1 responds 200 OK."""
    service = S2HeartbeatService()
    service.s1_heartbeat_url = "https://mock-aerix-s1.onrender.com/api/heartbeat"

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_get.return_value = mock_resp

        success = await service.ping_s1()
        assert success is True
        assert service._consecutive_successes == 1
        assert service._consecutive_failures == 0
        assert service._last_success_at is not None
        assert service._last_failure is None

        diag = service.get_diagnostics()
        assert diag["diagnostics"]["consecutive_successes"] == 1
        assert diag["diagnostics"]["last_successful_heartbeat"] is not None

@pytest.mark.asyncio
async def test_outbound_ping_s1_failure_and_timeout():
    """Tests S2 outbound ping handling timeouts and 5xx errors without crashing."""
    service = S2HeartbeatService()
    service.s1_heartbeat_url = "https://mock-aerix-s1.onrender.com/api/heartbeat"

    # 1. Test Timeout Handling
    import httpx
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.TimeoutException("Connection timed out")

        success = await service.ping_s1()
        assert success is False
        assert service._consecutive_failures == 1
        assert service._consecutive_successes == 0
        assert "Timeout" in service._last_failure

    # 2. Test 503 Service Unavailable
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_resp = AsyncMock()
        mock_resp.status_code = 503
        mock_resp.text = "Service Unavailable"
        mock_get.return_value = mock_resp

        success = await service.ping_s1()
        assert success is False
        assert service._consecutive_failures == 2
        assert "HTTP 503" in service._last_failure

def test_manual_ping_s1_route():
    """Tests POST /api/heartbeat/ping-s1 route."""
    with patch("application.services.s2_heartbeat_service.s2_heartbeat_service.ping_s1", new_callable=AsyncMock) as mock_ping:
        mock_ping.return_value = True
        resp = client.post("/api/heartbeat/ping-s1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "diagnostics" in data
