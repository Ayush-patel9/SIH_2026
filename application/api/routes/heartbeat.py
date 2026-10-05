"""
Heartbeat & S2 Service Health API Route
Provides ultra-fast (< 10ms) GET /api/heartbeat matching S2 keepalive contract.
"""

from fastapi import APIRouter, Response
from application.services.s2_heartbeat_service import s2_heartbeat_service

router = APIRouter(tags=["Heartbeat & Keepalive"])

@router.get("/api/heartbeat", summary="Inbound S2 Heartbeat")
@router.get("/heartbeat", summary="Inbound S2 Heartbeat (Root alias)")
def get_heartbeat(response: Response):
    """
    Lightweight inbound heartbeat endpoint for S1/S2 keepalive.
    Responds in < 10ms from in-memory cache without blocking DB queries.
    """
    # Custom keepalive header for latency inspection
    response.headers["X-Service-Name"] = "S2"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return s2_heartbeat_service.get_diagnostics()

@router.post("/api/heartbeat/ping-s1", summary="Manually Ping S1 Heartbeat")
async def manual_ping_s1():
    """Immediately pings S1's heartbeat endpoint and records metrics."""
    success = await s2_heartbeat_service.ping_s1()
    return {"success": success, "diagnostics": s2_heartbeat_service.get_diagnostics()}
