import os
import sys
import unittest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

class TestCriticFeedbackLoop(unittest.TestCase):
    def test_television_direct_apparatus(self):
        res = graph_rag_pipeline.process_query("television")
        self.assertEqual(res.primary_recommendation.is_number, "IS 616")
        self.assertTrue(res.meta.critic_verified)
        self.assertNotIn("IS 10488", res.primary_recommendation.is_number)

    def test_crane_procurement(self):
        res = graph_rag_pipeline.process_query("electric overhead travelling crane")
        self.assertIn("3177", res.primary_recommendation.is_number)
        self.assertTrue(res.meta.critic_verified)

    def test_mobile_charger_power_adapter(self):
        res = graph_rag_pipeline.process_query("mobile phone fast charger power adapter")
        self.assertIn("13252", res.primary_recommendation.is_number)
        self.assertTrue(res.meta.critic_verified)

    def test_rejection_and_loopback_behavior(self):
        # Test direct critic reject simulation on a subsidiary component
        from pipeline.rag_engine.critic_verifier import CriticVerifier
        from pipeline.config.api_contract_models import PrimaryRecommendation

        verifier = CriticVerifier()
        mock_rec = PrimaryRecommendation(
            is_number="IS 10488 (PART 2)",
            standard_id="IS 10488 (PART 2)",
            title="Frame Output Transformers Used With Television Picture Tubes",
            full_title="IS 10488 (PART 2) - Frame Output Transformers Used With Television Picture Tubes",
            status="ACTIVE",
            scope_snippet="Transformers used with television picture tubes.",
            division_code="LITD",
            confidence=0.8
        )
        verdict = verifier.verify_candidate(
            query_text="smart television 55 inch",
            primary_rec=mock_rec
        )
        self.assertFalse(verdict["is_valid"])
        self.assertEqual(verdict["mismatch_type"], "SUBSIDIARY_COMPONENT")
        print(f"Critic successfully caught and rejected subsidiary component: {verdict['critique_reason']}")

if __name__ == "__main__":
    unittest.main()
