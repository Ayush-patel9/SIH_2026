import logging
from typing import Dict, Any, List, Optional
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

class LLMReasoner:
    """
    Synthesizes explainability traces, plain-language summaries,
    compliance checklists, and tender-ready spec draft export clauses
    using the unified LLM Gateway with REASONING_SYNTHESIS demand.
    """
    def generate_reasoning_and_synthesis(
        self,
        query_text: str,
        primary: PrimaryRecommendation,
        allied_list: List[AlliedStandard],
        outdated_list: List[OutdatedCitation],
        intent: str = "STANDARD_LOOKUP"
    ) -> Dict[str, Any]:
        """
        Invokes LLM Gateway with REASONING_SYNTHESIS demand.
        Returns validated ReasoningSteps, PlainLanguageExplanation, ComplianceChecklist, and SpecDraftExport.
        """
        raw_output = llm_gateway.call(
            LLMTaskType.REASONING_SYNTHESIS,
            query_text=query_text,
            primary=primary,
            allied_list=allied_list,
            outdated_list=outdated_list,
            intent=intent
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

        return {
            "reasoning_trace": trace_objs,
            "plain_language_explanation": plain_obj,
            "compliance_checklist": checklist_objs,
            "spec_draft_export": spec_obj
        }
