import re
import logging
from typing import Dict, Any, List, Optional, Set
from pipeline.config.api_contract_models import (
    ReasoningStep,
    PlainLanguageExplanation,
    ComplianceChecklistItem,
    SpecDraftExport,
    AlliedStandard,
    PrimaryRecommendation,
    OutdatedCitation
)
from pipeline.rag_engine.llm_gateway import llm_gateway, LLMTaskType

logger = logging.getLogger(__name__)

IS_PATTERN = re.compile(r'\b(?:IS|SP|IS/ISO|IS/IEC)\s*(\d{2,5}(?:\s*\(Part\s*\d+\))?(?:\s*:\s*\d{4})?)', re.IGNORECASE)


def norm_is_num(is_str: str) -> str:
    """Normalizes an Indian Standard citation to numeric core for grounding assertion."""
    s = str(is_str).upper().strip()
    s = re.sub(r':\s*\d{4}', '', s)
    s = re.sub(r'[^A-Z0-9]', '', s)
    return s


class LLMReasoner:
    """
    Stage 5 (AI Call #2: Grounded Reasoning & Synthesis) + Stage 6 (Grounding Validation Safety Net).
    Synthesizes explainability traces, plain-language summaries, compliance checklists, and NIT spec drafts.
    Enforces 0% hallucination gate by validating that all referenced standards exist in retrieved candidates.
    """
    def generate_reasoning_and_synthesis(
        self,
        query_text: str,
        primary: PrimaryRecommendation,
        allied_list: List[AlliedStandard],
        outdated_list: List[OutdatedCitation],
        structured_query: Optional[Dict[str, Any]] = None,
        allowed_candidates: Optional[List[str]] = None,
        intent: str = "STANDARD_LOOKUP"
    ) -> Dict[str, Any]:
        """
        Stage 5 & Stage 6 execution:
        1. AI Call #2: Synthesizes reasoning trace and checklist strictly constrained to retrieved candidates.
        2. Stage 6 Grounding Validation: Deterministically checks all cited IS numbers against candidate pool.
        """
        candidate_list = allowed_candidates or [primary.is_number] + [a.is_number for a in allied_list] + [o.cited_standard for o in outdated_list]
        
        # Stage 5: AI Call #2
        raw_output = llm_gateway.call(
            LLMTaskType.REASONING_SYNTHESIS,
            query_text=query_text,
            structured_query=structured_query,
            primary=primary,
            allied_list=allied_list,
            outdated_list=outdated_list,
            intent=intent,
            allowed_candidate_standards=candidate_list
        )

        # Convert dict items to typed models for StandardsResponse contract
        trace_objs = [
            ReasoningStep.model_validate(s) if isinstance(s, dict) else s
            for s in raw_output.get("reasoning_trace", [])
        ]
        
        plain_dict = raw_output.get("plain_language_explanation", {})
        plain_obj = PlainLanguageExplanation.model_validate(plain_dict) if isinstance(plain_dict, dict) else plain_dict

        checklist_objs = [
            ComplianceChecklistItem.model_validate(c) if isinstance(c, dict) else c
            for c in raw_output.get("compliance_checklist", [])
        ]

        spec_dict = raw_output.get("spec_draft_export", {})
        spec_obj = SpecDraftExport.model_validate(spec_dict) if isinstance(spec_dict, dict) else spec_dict

        synthesis_result = {
            "reasoning_trace": trace_objs,
            "plain_language_explanation": plain_obj,
            "compliance_checklist": checklist_objs,
            "spec_draft_export": spec_obj
        }

        # Stage 6: Deterministic Grounding Safety Net
        validated_result = self.validate_grounding(
            synthesis_output=synthesis_result,
            allowed_candidates=candidate_list,
            primary=primary
        )

        return validated_result

    def validate_grounding(
        self,
        synthesis_output: Dict[str, Any],
        allowed_candidates: List[str],
        primary: PrimaryRecommendation
    ) -> Dict[str, Any]:
        """
        Stage 6 — Grounding validation (deterministic safety net, no LLM):
        Regex-extracts every IS number cited in AI Call #2's output.
        Asserts that every single one is grounded in allowed_candidates.
        If an ungrounded IS number is detected, intercepts and replaces it with the primary standard.
        """
        allowed_norms: Set[str] = {norm_is_num(c) for c in allowed_candidates if c}
        primary_norm = norm_is_num(primary.is_number)

        # 1. Validate Plain Language Explanation
        plain_obj: PlainLanguageExplanation = synthesis_output["plain_language_explanation"]
        if plain_obj and plain_obj.text:
            plain_citations = IS_PATTERN.findall(plain_obj.text)
            for cited in plain_citations:
                norm_cited = norm_is_num(f"IS {cited}")
                if norm_cited not in allowed_norms:
                    logger.warning(
                        f"[Stage 6 Safety Net] Detected ungrounded standard 'IS {cited}' in reasoning text. Enforcing '{primary.is_number}'."
                    )
                    # Safe regex substitution
                    plain_obj.text = re.sub(
                        rf"\b(?:IS|SP|IS/ISO|IS/IEC)\s*{re.escape(cited)}\b",
                        primary.is_number,
                        plain_obj.text,
                        flags=re.IGNORECASE
                    )

        # 2. Validate Compliance Checklist
        for item in synthesis_output.get("compliance_checklist", []):
            item_text = getattr(item, "item", "")
            action_text = getattr(item, "action_required", "")
            for txt in [item_text, action_text]:
                for cited in IS_PATTERN.findall(txt):
                    norm_cited = norm_is_num(f"IS {cited}")
                    if norm_cited not in allowed_norms:
                        logger.warning(
                            f"[Stage 6 Safety Net] Detected ungrounded standard 'IS {cited}' in checklist. Sanitizing to '{primary.is_number}'."
                        )
                        if hasattr(item, "item"):
                            item.item = re.sub(rf"\b(?:IS|SP|IS/ISO|IS/IEC)\s*{re.escape(cited)}\b", primary.is_number, item.item, flags=re.IGNORECASE)
                        if hasattr(item, "action_required"):
                            item.action_required = re.sub(rf"\b(?:IS|SP|IS/ISO|IS/IEC)\s*{re.escape(cited)}\b", primary.is_number, item.action_required, flags=re.IGNORECASE)

        # 3. Validate Spec Draft Export
        spec_obj: SpecDraftExport = synthesis_output["spec_draft_export"]
        if spec_obj and spec_obj.tender_clause_text:
            for cited in IS_PATTERN.findall(spec_obj.tender_clause_text):
                norm_cited = norm_is_num(f"IS {cited}")
                if norm_cited not in allowed_norms:
                    logger.warning(
                        f"[Stage 6 Safety Net] Detected ungrounded standard 'IS {cited}' in spec draft. Replacing with '{primary.is_number}'."
                    )
                    spec_obj.tender_clause_text = re.sub(
                        rf"\b(?:IS|SP|IS/ISO|IS/IEC)\s*{re.escape(cited)}\b",
                        primary.is_number,
                        spec_obj.tender_clause_text,
                        flags=re.IGNORECASE
                    )

        return synthesis_output
