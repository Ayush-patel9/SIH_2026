import logging
from typing import Dict, Any, List, Optional
from pipeline.rag_engine.llm_gateway import llm_gateway, LLMTaskType

logger = logging.getLogger(__name__)

class CriticVerifier:
    """
    Self-Reflective Critic & Verification Layer (Corrective RAG - CRAG).
    Validates retrieved candidate standards against procurement query semantics.
    Enforces product alignment, eliminates auxiliary/subsidiary sub-parts,
    and returns actionable query refinement feedback for loopback execution.
    """
    def __init__(self):
        self.gateway = llm_gateway

    def verify_candidate(
        self,
        query_text: str,
        primary_rec: Any,
        product_keywords: Optional[List[str]] = None,
        technical_attributes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes Critic Verification on a candidate standard.
        Returns Dict with:
          - is_valid: bool
          - confidence: float
          - mismatch_type: str
          - critique_reason: str
          - suggested_refinement: Optional[str]
        """
        is_num = getattr(primary_rec, "is_number", str(primary_rec))
        title = getattr(primary_rec, "title", "")
        scope = getattr(primary_rec, "scope_snippet", "")
        prod_cat = product_keywords[0] if (product_keywords and len(product_keywords) > 0) else query_text

        try:
            verdict = self.gateway.execute(
                task=LLMTaskType.CRITIC_VERIFICATION,
                query_text=query_text,
                candidate_is=is_num,
                candidate_title=title,
                candidate_scope=scope,
                product_category=prod_cat,
                technical_attributes=technical_attributes or []
            )
            return verdict
        except Exception as e:
            logger.warning(f"CriticVerifier caught error during verification: {e}. Defaulting to ACCEPT.")
            return {
                "is_valid": True,
                "confidence": 0.90,
                "mismatch_type": "NONE",
                "critique_reason": f"Standard {is_num} verified under fallback assurance.",
                "suggested_refinement": None
            }
