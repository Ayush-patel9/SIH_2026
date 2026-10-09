"""
S2 Heartbeat Service
Coordinates persistent mutual keepalive with S1 (AERIX API) with PostgreSQL state persistence.
"""

import os
import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from application.services.db_config import get_connection, release_connection

logger = logging.getLogger("s2_heartbeat")

class S2HeartbeatService:
    def __init__(self):
        # Configuration from environment
        self.s1_heartbeat_url = os.getenv("S1_HEARTBEAT_URL", "").strip()
        self.interval_seconds = float(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "90.0"))
        self.http_timeout = float(os.getenv("HEARTBEAT_HTTP_TIMEOUT", "10.0"))
        self.outbound_enabled = os.getenv("ENABLE_OUTBOUND_HEARTBEAT", "false").lower() in ("true", "1", "yes")

        # In-memory diagnostics cache for < 10ms responses on GET /api/heartbeat
        self._state_lock = None
        self._last_attempt_at: Optional[str] = None
        self._last_success_at: Optional[str] = None
        self._last_failure: Optional[str] = None
        self._consecutive_successes: int = 0
        self._consecutive_failures: int = 0
        self._service_status: str = "INITIALIZING"

        # Background task handle
        self._worker_task: Optional[asyncio.Task] = None
        self._is_running: bool = False

    def reload_config(self):
        """Reload configuration from environment variables."""
        self.s1_heartbeat_url = os.getenv("S1_HEARTBEAT_URL", "").strip()
        self.interval_seconds = float(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "90.0"))
        self.http_timeout = float(os.getenv("HEARTBEAT_HTTP_TIMEOUT", "10.0"))
        self.outbound_enabled = os.getenv("ENABLE_OUTBOUND_HEARTBEAT", "false").lower() in ("true", "1", "yes")

    def init_tables(self):
        """Ensures service_heartbeats table exists in Neon DB."""
        conn = get_connection()
        if not conn:
            logger.warning("[S2] Database not available to initialize tables.")
            return

        try:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS service_heartbeats (
                        service_id VARCHAR(50) PRIMARY KEY,
                        target_url VARCHAR(500),
                        last_attempt_at TIMESTAMPTZ,
                        last_success_at TIMESTAMPTZ,
                        last_failure_at TIMESTAMPTZ,
                        last_error TEXT,
                        consecutive_failures INTEGER DEFAULT 0,
                        consecutive_successes INTEGER DEFAULT 0,
                        status VARCHAR(50) DEFAULT 'INITIALIZING',
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );
                """)
                conn.commit()
                logger.info("[S2] Verified Neon PostgreSQL table: service_heartbeats")
        except Exception as e:
            logger.error(f"[S2] Failed to initialize tables: {e}")
            if conn:
                conn.rollback()
        finally:
            release_connection(conn)

    def load_state_from_db(self):
        """Hydrates in-memory cache from PostgreSQL on service startup."""
        conn = get_connection()
        if not conn:
            return

        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT target_url, last_attempt_at, last_success_at, last_failure_at,
                           last_error, consecutive_failures, consecutive_successes, status
                    FROM service_heartbeats
                    WHERE service_id = 'S2';
                """)
                row = cur.fetchone()
                if row:
                    target_url, attempt, success, failure, err, c_fail, c_succ, status = row
                    self._last_attempt_at = attempt.isoformat() if attempt else None
                    self._last_success_at = success.isoformat() if success else None
                    self._last_failure = err if err else (failure.isoformat() if failure else None)
                    self._consecutive_successes = c_succ or 0
                    self._consecutive_failures = c_fail or 0
                    self._service_status = status or "HEALTHY"

                logger.info(f"[S2] State loaded from DB: status={self._service_status}, succ={self._consecutive_successes}")
        except Exception as e:
            logger.error(f"[S2] Error loading state from DB: {e}")
        finally:
            release_connection(conn)

    def get_diagnostics(self) -> Dict[str, Any]:
        """
        Ultra-fast in-memory diagnostics provider (< 10ms, typical < 0.5ms).
        """
        effective_status = "DEGRADED" if (self.outbound_enabled and self._consecutive_failures > 3) else "HEALTHY"

        return {
            "service": "S2",
            "status": effective_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "diagnostics": {
                "target_s1_url": self.s1_heartbeat_url or "NOT_CONFIGURED",
                "last_heartbeat_attempt": self._last_attempt_at,
                "last_successful_heartbeat": self._last_success_at,
                "last_failure": self._last_failure,
                "consecutive_successes": self._consecutive_successes,
                "outbound_heartbeat_active": self._is_running,
                "outbound_heartbeat_enabled": self.outbound_enabled
            }
        }

    async def ping_s1(self) -> bool:
        """
        Sends an asynchronous HTTP GET to S1_HEARTBEAT_URL.
        Catches timeouts, connection drops, and HTTP errors gracefully.
        Updates PostgreSQL and in-memory cache.
        """
        if not self.s1_heartbeat_url:
            logger.debug("[S2] S1_HEARTBEAT_URL not configured. Skipping outbound ping.")
            return False

        now_utc = datetime.now(timezone.utc)
        now_iso = now_utc.isoformat()
        self._last_attempt_at = now_iso

        success = False
        error_msg = None

        try:
            async with httpx.AsyncClient(timeout=self.http_timeout) as client:
                resp = await client.get(self.s1_heartbeat_url)
                if resp.status_code in (200, 204):
                    success = True
                else:
                    error_msg = f"HTTP {resp.status_code}: {resp.text[:100]}"
        except httpx.TimeoutException:
            error_msg = f"Timeout after {self.http_timeout}s"
        except httpx.NetworkError as ne:
            error_msg = f"Network error: {str(ne)[:100]}"
        except Exception as ex:
            error_msg = f"Exception: {str(ex)[:100]}"

        # Update in-memory state
        if success:
            self._consecutive_successes += 1
            self._consecutive_failures = 0
            self._last_success_at = now_iso
            self._last_failure = None
            self._service_status = "HEALTHY"
            logger.info(f"[S2] Outbound heartbeat to S1 ({self.s1_heartbeat_url}) succeeded. Consecutive successes: {self._consecutive_successes}")
        else:
            self._consecutive_failures += 1
            self._consecutive_successes = 0
            self._last_failure = error_msg
            self._service_status = "DEGRADED" if self._consecutive_failures > 3 else "HEALTHY"
            logger.warning(f"[S2] Outbound heartbeat to S1 failed ({error_msg}). Consecutive failures: {self._consecutive_failures}")

        # Update Neon DB asynchronously in a thread to keep async loop unblocked
        await asyncio.to_thread(self._persist_heartbeat_to_db, success, now_utc, error_msg)
        return success

    def _persist_heartbeat_to_db(self, success: bool, now_utc: datetime, error_msg: Optional[str]):
        """Persists S2 heartbeat metrics to service_heartbeats table."""
        conn = get_connection()
        if not conn:
            return

        try:
            with conn.cursor() as cur:
                if success:
                    cur.execute("""
                        INSERT INTO service_heartbeats (
                            service_id, target_url, last_attempt_at, last_success_at,
                            last_error, consecutive_failures, consecutive_successes, status, updated_at
                        )
                        VALUES ('S2', %s, %s, %s, NULL, 0, 1, 'HEALTHY', NOW())
                        ON CONFLICT (service_id) DO UPDATE SET
                            target_url = EXCLUDED.target_url,
                            last_attempt_at = EXCLUDED.last_attempt_at,
                            last_success_at = EXCLUDED.last_success_at,
                            last_error = NULL,
                            consecutive_failures = 0,
                            consecutive_successes = service_heartbeats.consecutive_successes + 1,
                            status = 'HEALTHY',
                            updated_at = NOW();
                    """, (self.s1_heartbeat_url, now_utc, now_utc))
                else:
                    cur.execute("""
                        INSERT INTO service_heartbeats (
                            service_id, target_url, last_attempt_at, last_failure_at,
                            last_error, consecutive_failures, consecutive_successes, status, updated_at
                        )
                        VALUES ('S2', %s, %s, %s, %s, 1, 0, 'DEGRADED', NOW())
                        ON CONFLICT (service_id) DO UPDATE SET
                            target_url = EXCLUDED.target_url,
                            last_attempt_at = EXCLUDED.last_attempt_at,
                            last_failure_at = EXCLUDED.last_failure_at,
                            last_error = EXCLUDED.last_error,
                            consecutive_failures = service_heartbeats.consecutive_failures + 1,
                            consecutive_successes = 0,
                            status = CASE WHEN service_heartbeats.consecutive_failures >= 2 THEN 'DEGRADED' ELSE service_heartbeats.status END,
                            updated_at = NOW();
                    """, (self.s1_heartbeat_url, now_utc, now_utc, error_msg))
                conn.commit()
        except Exception as e:
            logger.error(f"[S2] Failed to persist heartbeat to DB: {e}")
            if conn:
                conn.rollback()
        finally:
            release_connection(conn)

    async def _run_loop(self):
        """Main async background loop for S2 keepalive."""
        if not self.outbound_enabled:
            logger.info("[S2] Outbound heartbeat is disabled. Exiting loop.")
            return

        logger.info(f"[S2] Background heartbeat loop started (interval={self.interval_seconds}s).")
        self._is_running = True

        # Initial small delay to let server finish booting
        await asyncio.sleep(2.0)

        while self._is_running and self.outbound_enabled:
            try:
                # Outbound heartbeat ping to S1
                await self.ping_s1()
            except asyncio.CancelledError:
                logger.info("[S2] Background loop received cancellation.")
                break
            except Exception as e:
                logger.error(f"[S2] Unhandled error in background loop: {e}", exc_info=True)

            # Sleep for the configured interval
            try:
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break

        logger.info("[S2] Background loop exited.")

    def start(self):
        """Starts the background worker task if outbound heartbeat is enabled."""
        if not self.outbound_enabled:
            logger.info("[S2] Outbound heartbeat is disabled (keepalive handled via external cron worker). Worker not started.")
            return

        if self._worker_task and not self._worker_task.done():
            logger.warning("[S2] Worker task already running.")
            return

        self._is_running = True
        self._worker_task = asyncio.create_task(self._run_loop())
        logger.info("[S2] S2HeartbeatService worker task scheduled.")

    def stop(self):
        """Stops the background worker task."""
        self._is_running = False
        if self._worker_task and not self._worker_task.done():
            self._worker_task.cancel()
            logger.info("[S2] S2HeartbeatService worker task cancelled.")

    @property
    def is_running(self) -> bool:
        return self._is_running and bool(self._worker_task and not self._worker_task.done())


# Global singleton instance
s2_heartbeat_service = S2HeartbeatService()
