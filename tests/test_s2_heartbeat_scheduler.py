"""
Unit and Integration Tests for S2 Heartbeat & Daily Scraper Scheduler System
Covers:
1. Inbound GET /api/heartbeat latency and schema (< 10ms)
2. Outbound keepalive ping to S1 (success, failure, timeout handling)
3. Atomic lock insertion in daily_scraper_runs (concurrency & idempotency)
4. Stale run reclamation (>2h timeout cleanup)
5. S1 Scraper Trigger coordination
"""

import time
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from application.api.main import app
from application.services.s2_heartbeat_service import S2HeartbeatService
from application.services.db_config import get_connection, release_connection

client = TestClient(app)

def test_inbound_heartbeat_endpoint_contract_and_latency():
    """Validates GET /api/heartbeat responds in < 10ms with strict JSON schema."""
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

    scraper = diag["daily_scraper_status"]
    assert "today_date" in scraper
    assert scraper["state"] in ("COMPLETED", "RUNNING", "PENDING", "FAILED", "CLAIMED")
    assert "last_run_started_at" in scraper
    assert "last_run_completed_at" in scraper

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

def test_atomic_lock_in_daily_scraper_runs():
    """
    Tests atomic distributed lock insertion in daily_scraper_runs.
    Ensures exactly 1 worker can claim a run_date, and subsequent attempts fail safely.
    """
    service = S2HeartbeatService()
    service.init_tables()

    test_date = "2099-12-31"  # isolated future test date

    conn = get_connection()
    assert conn is not None
    try:
        with conn.cursor() as cur:
            # Clean up test row if exists
            cur.execute("DELETE FROM daily_scraper_runs WHERE run_date = %s;", (test_date,))
            conn.commit()

            # Attempt 1: Should claim successfully
            cur.execute("""
                INSERT INTO daily_scraper_runs (run_date, status, claimed_by, started_at)
                VALUES (%s, 'CLAIMED', 'S2', NOW())
                ON CONFLICT (run_date) DO NOTHING
                RETURNING run_date;
            """, (test_date,))
            row1 = cur.fetchone()
            conn.commit()
            assert row1 is not None, "First claim must succeed"
            assert str(row1[0]) == test_date

            # Attempt 2: Same date must be skipped by ON CONFLICT DO NOTHING
            cur.execute("""
                INSERT INTO daily_scraper_runs (run_date, status, claimed_by, started_at)
                VALUES (%s, 'CLAIMED', 'S2', NOW())
                ON CONFLICT (run_date) DO NOTHING
                RETURNING run_date;
            """, (test_date,))
            row2 = cur.fetchone()
            conn.commit()
            assert row2 is None, "Duplicate claim must return None (atomically skipped)"

            # Cleanup
            cur.execute("DELETE FROM daily_scraper_runs WHERE run_date = %s;", (test_date,))
            conn.commit()
    finally:
        release_connection(conn)

def test_stale_run_reclamation():
    """Tests cleanup_stale_runs marks runs stuck > 2h as FAILED."""
    service = S2HeartbeatService()
    test_date = "2099-11-30"

    conn = get_connection()
    assert conn is not None
    try:
        with conn.cursor() as cur:
            # Insert a run started 3 hours ago
            cur.execute("DELETE FROM daily_scraper_runs WHERE run_date = %s;", (test_date,))
            cur.execute("""
                INSERT INTO daily_scraper_runs (run_date, status, claimed_by, started_at)
                VALUES (%s, 'RUNNING', 'S2', NOW() - INTERVAL '3 hours');
            """, (test_date,))
            conn.commit()

            # Run cleanup
            service.cleanup_stale_runs()

            # Verify it transitioned to FAILED
            cur.execute("SELECT status, error_message FROM daily_scraper_runs WHERE run_date = %s;", (test_date,))
            row = cur.fetchone()
            assert row is not None
            assert row[0] == "FAILED"
            assert "dyno restart" in row[1]

            # Cleanup
            cur.execute("DELETE FROM daily_scraper_runs WHERE run_date = %s;", (test_date,))
            conn.commit()
    finally:
        release_connection(conn)

@pytest.mark.asyncio
async def test_scraper_trigger_execution_flow():
    """Tests check_and_trigger_daily_scraper communicating with S1."""
    service = S2HeartbeatService()
    service.s1_scraper_trigger_url = "https://mock-aerix-s1.onrender.com/api/scraper/trigger"
    service.scraper_api_key = "test-secret-key-123"

    test_date = "2099-10-31"

    # Mock atomic claim to return test_date
    with patch.object(service, "_atomic_claim_run", return_value=test_date), \
         patch.object(service, "_update_run_status") as mock_update, \
         patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:

        import unittest.mock
        mock_resp = unittest.mock.MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "status": "ACCEPTED",
            "message": "Production scraper successfully spawned in background.",
            "pid": 4567
        }
        mock_post.return_value = mock_resp

        result = await service.check_and_trigger_daily_scraper(force=True)

        assert result["status"] == "COMPLETED"
        assert result["run_date"] == test_date
        assert result["s1_response"]["pid"] == 4567

        # Verify X-API-KEY was passed
        mock_post.assert_called_once()
        headers_sent = mock_post.call_args[1].get("headers", {})
        assert headers_sent.get("X-API-KEY") == "test-secret-key-123"

        # Verify DB status updated to COMPLETED
        mock_update.assert_called_with(test_date, "COMPLETED")
