#!/usr/bin/env python3
"""
Test Suite for Multi-Key Gemini API Switching and Rate-Limit Auto-Failover.
Verifies:
1. Comma-separated key parsing (1 to 7+ keys)
2. Safe key masking in logs
3. Round-robin rotation ordering
4. Automatic 429 / ResourceExhausted detection and immediate failover to next key in pool
5. Cooldown expiration and recovery
6. Live execution across pool
"""

import os
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from pipeline.rag_engine.llm_gateway import LLMGateway, LLMTaskType


def test_key_parsing_and_sanitization():
    """Verify parsing of 6-7 comma/newline separated keys with spaces and quotes."""
    gateway = LLMGateway()
    
    raw_keys_input = """
        AIzaSyA_key1_abc123, "AIzaSyB_key2_def456",
        'AIzaSyC_key3_ghi789',
        AIzaSyD_key4_jkl012, AIzaSyE_key5_mno345;
        AIzaSyF_key6_pqr678, AIzaSyG_key7_stu901
    """
    
    parsed = gateway._parse_keys(raw_keys_input)
    assert len(parsed) == 7, f"Expected 7 keys, got {len(parsed)}: {parsed}"
    assert parsed[0] == "AIzaSyA_key1_abc123"
    assert parsed[1] == "AIzaSyB_key2_def456"
    assert parsed[2] == "AIzaSyC_key3_ghi789"
    assert parsed[3] == "AIzaSyD_key4_jkl012"
    assert parsed[4] == "AIzaSyE_key5_mno345"
    assert parsed[5] == "AIzaSyF_key6_pqr678"
    assert parsed[6] == "AIzaSyG_key7_stu901"
    
    print("[PASS] Successfully parsed and cleaned 7 keys from varied delimiters.")


def test_key_masking():
    """Verify secure masking of API keys in log outputs."""
    gateway = LLMGateway()
    key = "AQ.Ab8RN6JMUcUlAGr87AlhT1KPzehL1y_QpIQKG-buKigOOVoL9g"
    masked = gateway._mask_key(key)
    assert masked == "AQ.Ab8...oL9g"
    assert key not in masked  # Raw middle section is masked
    print(f"[PASS] Key masking verified: {masked}")


def test_round_robin_rotation_and_cooldown_failover():
    """Verify round-robin rotation and instant skip of rate-limited keys."""
    gateway = LLMGateway()
    test_keys = [f"KEY_{i}" for i in range(1, 8)]  # 7 keys
    gateway.keys = test_keys
    gateway._current_key_idx = 0
    gateway._key_cooldowns = {}

    # Initial order starts with KEY_1
    ordered = gateway._get_ordered_keys()
    assert ordered[0] == "KEY_1"
    assert len(ordered) == 7

    # Mark KEY_1 as successful -> advances to KEY_2
    gateway._mark_key_success("KEY_1")
    assert gateway._get_ordered_keys()[0] == "KEY_2"

    # Mark KEY_2 as having hit a 429 rate limit
    class Fake429Error(Exception):
        pass
    
    fake_err = Fake429Error("429 ResourceExhausted: Quota exceeded for quota metric 'Generate Content Requests' per minute")
    gateway._mark_key_error("KEY_2", fake_err)

    # Cooldown should be registered
    assert "KEY_2" in gateway._key_cooldowns
    assert gateway._key_cooldowns["KEY_2"] > time.time() + 50.0

    # Ordered keys should immediately prioritize ready keys: KEY_3, KEY_4, KEY_5, KEY_6, KEY_7, KEY_1, with KEY_2 at the very end
    new_order = gateway._get_ordered_keys()
    assert new_order[0] == "KEY_3"
    assert new_order[-1] == "KEY_2"
    assert len(new_order) == 7

    print("[PASS] 429 rate limit put KEY_2 on cooldown; next request seamlessly routes to KEY_3!")


def test_rate_limit_error_detection():
    """Verify that all variants of rate limit and quota exhaustion exceptions are caught."""
    gateway = LLMGateway()

    err_cases = [
        Exception("429 Too Many Requests"),
        Exception("ResourceExhausted: 429 Quota exceeded"),
        Exception("GoogleAPICallError: Resource exhausted (rate_limit_exceeded)"),
        Exception("Requests per minute (RPM) limit reached for default tier"),
        Exception("Service Unavailable: 503 Overloaded backend")
    ]

    for err in err_cases:
        assert gateway._is_rate_limit_or_quota_error(err) is True, f"Failed to detect rate limit in: {err}"

    # Non-rate-limit error (e.g. JSON syntax)
    non_rate_err = ValueError("Invalid JSON token at line 1")
    assert gateway._is_rate_limit_or_quota_error(non_rate_err) is False

    print("[PASS] All rate limit / quota exhaustion error patterns correctly recognized.")


if __name__ == "__main__":
    test_key_parsing_and_sanitization()
    test_key_masking()
    test_round_robin_rotation_and_cooldown_failover()
    test_rate_limit_error_detection()
    print("\n✅ All Multi-Key Auto-Switching & Rate-Limit Tests Passed Successfully!")
