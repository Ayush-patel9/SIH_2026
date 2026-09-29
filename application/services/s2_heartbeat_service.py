"""
S2 Heartbeat & Daily Scraper Scheduler Service
Coordinates persistent mutual keepalive with S1 (AERIX API) and orchestrates
the daily production airfare scraper trigger with atomic PostgreSQL state persistence.
"""

import os
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
import httpx
from application.services.db_config import get_connection, release_connection

logger = logging.getLogger("s2_heartbeat")

class S2HeartbeatService:
    def __init__(self):
        # Configuration from environment
        self.s1_heartbeat_url = os.getenv("S1_HEARTBEAT_URL", "").strip()
        self.s1_scraper_trigger_url = os.getenv("S1_SCRAPER_TRIGGER_URL", "").strip()
        self.scraper_api_key = os.getenv("SCRAPER_API_KEY", "").strip()
        self.interval_seconds = float(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "90.0"))
        self.http_timeout = float(os.getenv("HEARTBEAT_HTTP_TIMEOUT", "10.0"))
        self.schedule_time_utc = os.getenv("SCRAPER_SCHEDULE_TIME_UTC", "23:30").strip()

        # In-memory diagnostics cache for < 10ms responses on GET /api/heartbeat
        self._state_lock = None
        self._last_attempt_at: Optional[str] = None
        self._last_success_at: Optional[str] = None
        self._last_failure: Optional[str] = None
        self._consecutive_successes: int = 0
        self._consecutive_failures: int = 0
        self._service_status: str = "INITIALIZING"

        # Daily scraper status cache
        self._scraper_today_date: str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._scraper_state: str = "PENDING"
        self._scraper_started_at: Optional[str] = None
        self._scraper_completed_at: Optional[str] = None

        # Background task handle
        self._worker_task: Optional[asyncio.Task] = None
        self._is_running: bool = False

    def reload_config(self):
        """Reload configuration from environment variables."""
        self.s1_heartbeat_url = os.getenv("S1_HEARTBEAT_URL", "").strip()
        self.s1_scraper_trigger_url = os.getenv("S1_SCRAPER_TRIGGER_URL", "").strip()
        self.scraper_api_key = os.getenv("SCRAPER_API_KEY", "").strip()
        self.interval_seconds = float(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "90.0"))
        self.http_timeout = float(os.getenv("HEARTBEAT_HTTP_TIMEOUT", "10.0"))
        self.schedule_time_utc = os.getenv("SCRAPER_SCHEDULE_TIME_UTC", "23:30").strip()

    def init_tables(self):
        """Ensures service_heartbeats and daily_scraper_runs tables exist in Neon DB."""
        conn = get_connection()
        if not conn:
            logger.warning("[S2] Database not available to initialize tables.")
            return

        try:
            with conn.cursor() as cur:
                # Table A: service_heartbeats
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

                # Table B: daily_scraper_runs
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS daily_scraper_runs (
                        run_date DATE PRIMARY KEY,
                        status VARCHAR(50) NOT NULL,
                        claimed_by VARCHAR(50) NOT NULL,
                        started_at TIMESTAMPTZ,
                        completed_at TIMESTAMPTZ,
                        failed_at TIMESTAMPTZ,
                        error_message TEXT,
                        trigger_source VARCHAR(50) DEFAULT 'S2_CRON_HEARTBEAT',
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );
                """)
                conn.commit()
                logger.info("[S2] Verified Neon PostgreSQL tables: service_heartbeats, daily_scraper_runs")
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
                # 1. Load S2 heartbeat row
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

                # 2. Load today's scraper run status
                cur.execute("""
                    SELECT run_date, status, started_at, completed_at
                    FROM daily_scraper_runs
                    WHERE run_date = CURRENT_DATE;
                """)
                scraper_row = cur.fetchone()
                if scraper_row:
                    r_date, r_status, r_started, r_completed = scraper_row
                    self._scraper_today_date = str(r_date)
                    self._scraper_state = r_status
                    self._scraper_started_at = r_started.isoformat() if r_started else None
                    self._scraper_completed_at = r_completed.isoformat() if r_completed else None
                else:
                    self._scraper_today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                    self._scraper_state = "PENDING"
                    self._scraper_started_at = None
                    self._scraper_completed_at = None

                logger.info(f"[S2] State loaded from DB: status={self._service_status}, succ={self._consecutive_successes}, scraper={self._scraper_state}")
        except Exception as e:
            logger.error(f"[S2] Error loading state from DB: {e}")
        finally:
            release_connection(conn)

    def cleanup_stale_runs(self):
        """
        Reclaims/fails any runs stuck in CLAIMED or RUNNING for over 2 hours
        due to sudden dyno restarts.
        """
        conn = get_connection()
        if not conn:
            return

        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE daily_scraper_runs
                    SET status = 'FAILED',
                        failed_at = NOW(),
                        error_message = 'Interrupted by dyno restart or timeout (>2h)',
                        updated_at = NOW()
                    WHERE status IN ('CLAIMED', 'RUNNING')
                      AND started_at < NOW() - INTERVAL '2 hours';
                """)
                affected = cur.rowcount
                if affected > 0:
                    conn.commit()
                    logger.warning(f"[S2] Cleaned up {affected} stale scraper run(s) stuck > 2 hours.")
        except Exception as e:
            logger.error(f"[S2] Failed to cleanup stale runs: {e}")
            if conn:
                conn.rollback()
        finally:
            release_connection(conn)

    def get_diagnostics(self) -> Dict[str, Any]:
        """
        Ultra-fast in-memory diagnostics provider (< 10ms, typical < 0.5ms).
        Matches the exact JSON schema requested by the S2 specification.
        """
        # Determine overall service status:
        # If consecutive failures > 3, report DEGRADED, else HEALTHY
        effective_status = "DEGRADED" if self._consecutive_failures > 3 else "HEALTHY"

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
                "daily_scraper_status": {
                    "today_date": self._scraper_today_date,
                    "state": self._scraper_state,
                    "last_run_started_at": self._scraper_started_at,
                    "last_run_completed_at": self._scraper_completed_at
                }
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

    def is_schedule_due(self) -> bool:
        """
        Checks if the daily scraper trigger is due.
        Default: 05:00 AM IST (23:30 UTC).
        """
        now_utc = datetime.now(timezone.utc)
        try:
            sched_parts = self.schedule_time_utc.split(":")
            sched_hour = int(sched_parts[0])
            sched_minute = int(sched_parts[1]) if len(sched_parts) > 1 else 0
        except Exception:
            sched_hour = 23
            sched_minute = 30

        # Run if current time is within or past the scheduled hour and minute
        # Note: Atomic INSERT ON CONFLICT DO NOTHING ensures it executes only once per day.
        if (now_utc.hour > sched_hour) or (now_utc.hour == sched_hour and now_utc.minute >= sched_minute):
            return True
        return False

    async def check_and_trigger_daily_scraper(self, force: bool = False) -> Dict[str, Any]:
        """
        Executes atomic claim on daily_scraper_runs in PostgreSQL.
        If claimed: updates status to RUNNING, sends POST to S1, and marks COMPLETED/FAILED.
        """
        if not force and not self.is_schedule_due():
            return {"status": "SKIPPED", "reason": "Not yet scheduled time"}

        # Attempt atomic claim in PostgreSQL
        claimed_date = await asyncio.to_thread(self._atomic_claim_run)
        if not claimed_date:
            return {"status": "SKIPPED", "reason": "Today's run already claimed or completed"}

        # Update in-memory cache
        self._scraper_today_date = str(claimed_date)
        self._scraper_state = "RUNNING"
        self._scraper_started_at = datetime.now(timezone.utc).isoformat()
        self._scraper_completed_at = None

        logger.info(f"[S2] Atomically claimed daily scraper run for {claimed_date}. Triggering S1...")

        # If S1 scraper trigger URL not configured
        if not self.s1_scraper_trigger_url:
            err = "S1_SCRAPER_TRIGGER_URL not configured"
            logger.error(f"[S2] {err}")
            await asyncio.to_thread(self._update_run_status, claimed_date, "FAILED", error_message=err)
            self._scraper_state = "FAILED"
            return {"status": "FAILED", "error": err}

        # Send POST to S1
        headers = {}
        if self.scraper_api_key:
            headers["X-API-KEY"] = self.scraper_api_key

        success = False
        error_msg = None
        s1_data = None

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.s1_scraper_trigger_url, headers=headers)
                if resp.status_code in (200, 201, 202, 204):
                    success = True
                    try:
                        s1_data = resp.json()
                        if asyncio.iscoroutine(s1_data):
                            s1_data = await s1_data
                    except Exception:
                        s1_data = resp.text
                else:
                    error_msg = f"S1 returned HTTP {resp.status_code}: {resp.text[:200]}"
        except Exception as e:
            error_msg = f"Failed to contact S1 trigger: {str(e)[:200]}"

        if success:
            completed_iso = datetime.now(timezone.utc).isoformat()
            await asyncio.to_thread(self._update_run_status, claimed_date, "COMPLETED")
            self._scraper_state = "COMPLETED"
            self._scraper_completed_at = completed_iso
            logger.info(f"[S2] Scraper triggered successfully on S1. S1 response: {s1_data}")
            return {"status": "COMPLETED", "run_date": str(claimed_date), "s1_response": s1_data}
        else:
            await asyncio.to_thread(self._update_run_status, claimed_date, "FAILED", error_message=error_msg)
            self._scraper_state = "FAILED"
            logger.error(f"[S2] Scraper trigger failed: {error_msg}")
            return {"status": "FAILED", "run_date": str(claimed_date), "error": error_msg}

    def _atomic_claim_run(self) -> Optional[str]:
        """Atomically inserts row for CURRENT_DATE in daily_scraper_runs. Returns run_date if claimed."""
        conn = get_connection()
        if not conn:
            return None

        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO daily_scraper_runs (run_date, status, claimed_by, started_at)
                    VALUES (CURRENT_DATE, 'CLAIMED', 'S2', NOW())
                    ON CONFLICT (run_date) DO NOTHING
                    RETURNING run_date;
                """)
                row = cur.fetchone()
                if row:
                    conn.commit()
                    return str(row[0])
                return None
        except Exception as e:
            logger.error(f"[S2] Atomic claim error: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            release_connection(conn)

    def _update_run_status(self, run_date: str, status: str, error_message: Optional[str] = None):
        """Updates status of daily_scraper_runs in PostgreSQL."""
        conn = get_connection()
        if not conn:
            return

        try:
            with conn.cursor() as cur:
                if status == "COMPLETED":
                    cur.execute("""
                        UPDATE daily_scraper_runs
                        SET status = 'COMPLETED',
                            completed_at = NOW(),
                            updated_at = NOW()
                        WHERE run_date = %s;
                    """, (run_date,))
                elif status == "FAILED":
                    cur.execute("""
                        UPDATE daily_scraper_runs
                        SET status = 'FAILED',
                            failed_at = NOW(),
                            error_message = %s,
                            updated_at = NOW()
                        WHERE run_date = %s;
                    """, (error_message, run_date))
                elif status == "RUNNING":
                    cur.execute("""
                        UPDATE daily_scraper_runs
                        SET status = 'RUNNING',
                            updated_at = NOW()
                        WHERE run_date = %s;
                    """, (run_date,))
                conn.commit()
        except Exception as e:
            logger.error(f"[S2] Error updating run status: {e}")
            if conn:
                conn.rollback()
        finally:
            release_connection(conn)

    async def _run_loop(self):
        """Main async background loop for S2 keepalive and scheduler."""
        logger.info(f"[S2] Background heartbeat & scheduler loop started (interval={self.interval_seconds}s).")
        self._is_running = True

        # Initial small delay to let server finish booting
        await asyncio.sleep(2.0)

        while self._is_running:
            try:
                # 1. Outbound heartbeat ping to S1
                await self.ping_s1()

                # 2. Check and trigger daily scraper if schedule is due
                await self.check_and_trigger_daily_scraper()

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
        """Starts the background worker task."""
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


# Global singleton instance
s2_heartbeat_service = S2HeartbeatService()
