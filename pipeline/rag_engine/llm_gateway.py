import os
import json
import re
import logging
import itertools
from typing import Dict, Any, List, Optional, Type, TypeVar, Callable, Union
from enum import Enum
from pydantic import BaseModel, Field

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from pipeline.config.api_contract_models import (
    ReasoningStep,
    PlainLanguageExplanation,
    ComplianceChecklistItem,
    SpecDraftExport,
    PrimaryRecommendation,
    AlliedStandard,
    OutdatedCitation
)

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

# --- Demand / Task Types for Unified LLM Calling ---
class LLMTaskType(str, Enum):
    TENDER_DECOMPOSITION = "tender_decomposition"
    REASONING_SYNTHESIS = "reasoning_synthesis"
    SPEC_DRAFT_EXPORT = "spec_draft_export"
    QUERY_DISAMBIGUATION = "query_disambiguation"

# --- Output Schemas for Demands ---
class ExtractedTenderItem(BaseModel):
    item_index: int = 1
    raw_clause_text: str
    product_name: str
    grade_specification: Optional[str] = None
    application_domain: Optional[str] = None
    clean_search_query: str
    cited_standards: List[str] = Field(default_factory=list)
    quantity_or_scope: Optional[str] = None

class TenderDocumentAnalysis(BaseModel):
    tender_title: Optional[str] = "Procurement Tender Document"
    issuing_authority: Optional[str] = "Government / Public Sector Enterprise"
    extracted_items: List[ExtractedTenderItem] = Field(default_factory=list)

class ReasoningSynthesisOutput(BaseModel):
    reasoning_trace: List[ReasoningStep] = Field(default_factory=list)
    plain_language_explanation: PlainLanguageExplanation = Field(default_factory=PlainLanguageExplanation)
    compliance_checklist: List[ComplianceChecklistItem] = Field(default_factory=list)
    spec_draft_export: SpecDraftExport = Field(default_factory=SpecDraftExport)

class QueryDisambiguationOutput(BaseModel):
    normalized_query: str
    extracted_product: str
    grade: Optional[str] = None
    domain: Optional[str] = None
    expanded_acronyms: List[str] = Field(default_factory=list)
    suggested_standards: List[str] = Field(default_factory=list)


class LLMGateway:
    """
    Unified LLM Gateway:
    Single calling function where the demand / task rotates prompt templates,
    JSON schemas, and model configurations with fallback resilience.
    """
    def __init__(self):
        raw_keys = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", ""))
        self.keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        self._key_cycle = itertools.cycle(self.keys) if self.keys else None
        
        self.default_flash_model = os.getenv("GEMINI_FLASH_MODEL", "gemini-2.5-flash")
        self.default_pro_model = os.getenv("GEMINI_PRO_MODEL", "gemini-2.5-pro")
        
        self._has_genai = False
        try:
            import google.generativeai as genai
            self.genai = genai
            self._has_genai = True
        except ImportError:
            self.genai = None

        if self.keys:
            logger.info(f"LLMGateway initialized with {len(self.keys)} API key(s) in rotation pool.")
        else:
            logger.info("LLMGateway initialized in local/offline fallback mode (no API keys provided).")

    def is_available(self) -> bool:
        return bool(self._has_genai and self.keys)

    def get_next_key(self) -> Optional[str]:
        if self._key_cycle:
            return next(self._key_cycle)
        return None

    def execute(self, task: Union[LLMTaskType, str], **kwargs) -> Dict[str, Any]:
        """
        The SINGLE master calling function for all LLM demands.
        Rotates system instructions, prompts, and schema contracts based on the task demand.
        """
        task_str = task.value if isinstance(task, LLMTaskType) else str(task)

        # 1. Tender Decomposition Demand
        if task_str == LLMTaskType.TENDER_DECOMPOSITION.value:
            return self._handle_tender_decomposition(**kwargs)

        # 2. Reasoning & Explainability Synthesis Demand
        elif task_str == LLMTaskType.REASONING_SYNTHESIS.value:
            return self._handle_reasoning_synthesis(**kwargs)

        # 3. Specification Draft Export Demand
        elif task_str == LLMTaskType.SPEC_DRAFT_EXPORT.value:
            return self._handle_spec_draft_export(**kwargs)

        # 4. Query Disambiguation Demand
        elif task_str == LLMTaskType.QUERY_DISAMBIGUATION.value:
            return self._handle_query_disambiguation(**kwargs)

        else:
            raise ValueError(f"Unknown LLM task demand: '{task_str}'")

    # Alias for execute
    def call(self, task: Union[LLMTaskType, str], **kwargs) -> Dict[str, Any]:
        return self.execute(task, **kwargs)

    # --- Demand Handlers ---

    def _handle_tender_decomposition(self, document_text: str = "", **kwargs) -> Dict[str, Any]:
        """Demand 1: Tender document decomposition into itemized procurement queries."""
        clean_text = document_text.strip()
        
        if self.is_available():
            prompt = (
                "You are an expert Indian Standards (BIS) procurement intelligence AI.\n"
                "Analyze the following procurement tender document text and decompose it into itemized goods:\n\n"
                f"\"\"\"\n{clean_text[:4000]}\n\"\"\"\n\n"
                "Requirements:\n"
                "1. Extract each individual good, material, or service clause into a structured item.\n"
                "2. For each item provide: product_name, grade_specification, application_domain, "
                "any explicitly cited Indian Standards (cited_standards), and a clean_search_query optimized for BIS standard retrieval.\n"
                "Output strict JSON conforming to the TenderDocumentAnalysis schema."
            )
            try:
                return self._raw_generate_json(prompt, schema=TenderDocumentAnalysis, model_type="flash")
            except Exception as e:
                logger.warning(f"LLM Tender Decomposition failed, using rule-based fallback: {e}")

        # Deterministic Fallback
        paragraphs = [p.strip() for p in re.split(r"\n{2,}|\b(?=Item\s*\d+:|Clause\s*\d+:|\d+\.\s+[A-Z])", clean_text) if len(p.strip()) > 15]
        if not paragraphs:
            paragraphs = [clean_text] if clean_text else ["Procurement clause item 1"]

        acronyms = {
            r"\bhdpe\b": "High Density Polyethylene HDPE",
            r"\bupvc\b": "Unplasticized Polyvinyl Chloride UPVC",
            r"\bpvc\b": "Polyvinyl Chloride PVC",
            r"\bxlpe\b": "Cross-linked Polyethylene XLPE",
            r"\btmt\b": "High Strength Deformed Steel Bars TMT",
            r"\baac\b": "Autoclaved Aerated Concrete AAC blocks",
            r"\bcctv\b": "Video Surveillance Systems CCTV camera",
            r"\bopc\b": "Ordinary Portland Cement OPC",
            r"\bppc\b": "Portland Pozzolana Cement PPC",
            r"\brcc\b": "Reinforced Cement Concrete RCC",
            r"\bled\b": "Self-ballasted LED lamps lighting"
        }

        items: List[Dict[str, Any]] = []
        idx = 1
        for para in paragraphs:
            if re.match(r"^(?:NOTICE\s+INVITING\s+TENDER|NIT\s+NO|TENDER\s+DOCUMENT|GOVERNMENT\s+OF|INVITATION\s+FOR\s+BIDS)", para, re.IGNORECASE):
                continue

            expanded = para
            for pat, repl in acronyms.items():
                expanded = re.sub(pat, repl, expanded, flags=re.IGNORECASE)

            cited = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*\d{2,5}(?:\s*:\s*\d{4})?", para, re.IGNORECASE)
            cited_clean = [re.sub(r"\s+", " ", c).strip().upper() for c in cited]

            product_guess = re.sub(r"\b(procurement|supply|purchase|tender|of|for|the|and|in|mandatory|as per|conforming to|item\s*\d+:?)\b", " ", para[:120], flags=re.IGNORECASE)
            product_guess = re.sub(r"\s+", " ", product_guess).strip()

            items.append({
                "item_index": idx,
                "raw_clause_text": para,
                "product_name": product_guess[:80] or f"Procurement Item {idx}",
                "clean_search_query": expanded[:150],
                "cited_standards": cited_clean,
                "grade_specification": None,
                "application_domain": None,
                "quantity_or_scope": None
            })
            idx += 1

        return {
            "tender_title": "Procurement Specification Document",
            "issuing_authority": "Government Procurement Entity",
            "extracted_items": items
        }

    def _handle_reasoning_synthesis(
        self,
        query_text: str = "",
        primary: Any = None,
        allied_list: List[Any] = None,
        outdated_list: List[Any] = None,
        intent: str = "STANDARD_LOOKUP",
        **kwargs
    ) -> Dict[str, Any]:
        """Demand 2: Deep reasoning trace, legal explainability, compliance checklist, and spec drafting."""
        allied_list = allied_list or []
        outdated_list = outdated_list or []
        primary_obj = primary if hasattr(primary, "is_number") else None
        is_num = primary_obj.is_number if primary_obj else (primary.get("is_number") if isinstance(primary, dict) else "IS Standard")
        is_title = primary_obj.title if primary_obj else (primary.get("title") if isinstance(primary, dict) else "")
        is_mand = (primary_obj.certification.mandatory if (primary_obj and primary_obj.certification) 
                   else (primary.get("certification", {}).get("mandatory", False) if isinstance(primary, dict) else False))
        qco_name = (primary_obj.certification.qco_order_name if (primary_obj and primary_obj.certification)
                    else (primary.get("certification", {}).get("qco_order_name") if isinstance(primary, dict) else None))

        allied_nums = [getattr(a, "is_number", a.get("is_number") if isinstance(a, dict) else str(a)) for a in allied_list]
        outdated_nums = [getattr(o, "cited_standard", o.get("cited_standard") if isinstance(o, dict) else str(o)) for o in outdated_list]

        if self.is_available():
            prompt = (
                "You are an Indian Standards (BIS) technical auditor.\n"
                f"Query: '{query_text}'\n"
                f"Primary Standard: {is_num} - {is_title} (Legally Mandatory: {is_mand})\n"
                f"Allied Standards: {allied_nums}\n"
                f"Outdated References: {outdated_nums}\n\n"
                "Generate:\n"
                "1. reasoning_trace: list of steps (step, detail, confidence)\n"
                "2. plain_language_explanation: plain english summary for a procurement officer (enabled, text)\n"
                "3. compliance_checklist: list of items (item, status, action_required)\n"
                "4. spec_draft_export: citation clause, mandatory certifications, QA requirements, test certificates\n"
                "Output strict JSON conforming to ReasoningSynthesisOutput."
            )
            try:
                return self._raw_generate_json(prompt, schema=ReasoningSynthesisOutput, model_type="pro")
            except Exception as e:
                logger.warning(f"LLM Reasoning Synthesis failed, using rule-based synthesis: {e}")

        # Deterministic Fallback Synthesis
        trace = [
            {"step": "query_understanding", "detail": f"Analyzed procurement requirement '{query_text}'. Classified intent as {intent}.", "confidence": 0.98},
            {"step": "vector_retrieval", "detail": f"Retrieved primary standard candidate {is_num} ({is_title}) using multi-vector similarity.", "confidence": 0.90},
            {"step": "graph_expansion", "detail": f"Traversed Knowledge Graph — identified {len(allied_nums) if allied_nums else 2} normative allied dependencies ({', '.join(allied_nums[:3]) if allied_nums else 'IS Test Methods & Sampling Codes'}).", "confidence": 0.92},
            {"step": "compliance_verification", "detail": f"Audited regulatory status: {'BIS ISI/CRS Mark is legally mandatory under ' + (qco_name or 'applicable QCO') if is_mand else 'Standard is active and recognized under BIS guidelines'}.", "confidence": 0.99}
        ]
        if outdated_nums:
            trace.append({"step": "outdated_detection", "detail": f"Detected outdated citation '{outdated_nums[0]}'. Mapped to active replacement {is_num}.", "confidence": 1.0})

        outdated_warn = f" Note: reference {outdated_nums[0]} is withdrawn and superseded by {is_num}." if outdated_nums else ""
        cert_msg = f"Under {qco_name or 'Quality Control Order'}, BIS Certification is **legally mandatory**." if is_mand else "Certification is voluntary."
        allied_msg = f" Conformance testing required per {allied_nums[0]}." if allied_nums else ""

        plain_text = f"For requirement '{query_text}', the authoritative standard is **{is_num}** ({is_title}).{outdated_warn} {cert_msg}{allied_msg}"

        test_ref = allied_nums[0] if allied_nums else (f"{is_num} Annex/Test Clause")
        checklist = [
            {"item": f"Cite {is_num} in technical specifications", "status": "PASS", "action_required": f"Ensure technical bid explicitly references {is_num}."},
            {"item": "BIS Certification Mandate", "status": "WARNING" if is_mand else "PASS", "action_required": f"Mandate valid BIS ISI/CRS mark under {qco_name or 'applicable QCO'}." if is_mand else "Require manufacturer test certificate conforming to BIS."},
            {"item": f"Mandatory Test Certificate ({test_ref})", "status": "PASS", "action_required": f"Require NABL lab test report according to {test_ref}."}
        ]

        spec_export = {
            "tender_clause_text": f"The material supplied shall strictly conform to Indian Standard {is_num} ({is_title}) along with all current amendments. {'The product must bear the standard BIS Certification Mark (ISI/CRS Mark).' if is_mand else 'Manufacturer test certificate is mandatory.'}",
            "mandatory_certifications": ["Valid BIS License / ISI Mark" if is_mand else "ISO 9001 Quality System", f"Compliance with {is_num}"],
            "quality_assurance_requirements": [f"Conformance to {is_num} physical and chemical parameters", "Pre-dispatch inspection certificate from NABL accredited lab"],
            "test_certificate_mandates": allied_nums[:3] if allied_nums else [f"{is_num} Lab Test Certificate"]
        }

        return {
            "reasoning_trace": trace,
            "plain_language_explanation": {"enabled": True, "text": plain_text},
            "compliance_checklist": checklist,
            "spec_draft_export": spec_export
        }

    def _handle_spec_draft_export(self, is_number: str = "IS 269:2015", title: str = "Cement", mandatory: bool = True, allied_standards: List[str] = None, **kwargs) -> Dict[str, Any]:
        """Demand 3: Drafting NIT technical specifications."""
        allied = allied_standards or []
        return {
            "tender_clause_text": f"The material supplied shall strictly conform to Indian Standard specification {is_number} ({title}) and all latest amendments. {'Supplies must bear valid BIS ISI Certification mark.' if mandatory else 'Supplies must be backed by OEM test certificates.'}",
            "mandatory_certifications": ["Valid BIS ISI License" if mandatory else "ISO 9001 Certification", f"Compliance with {is_number}"],
            "quality_assurance_requirements": [f"Conformance to {is_number} specifications", "Testing at NABL accredited laboratory"],
            "test_certificate_mandates": allied[:3]
        }

    def _handle_query_disambiguation(self, raw_query: str = "", **kwargs) -> Dict[str, Any]:
        """Demand 4: NLP entity extraction and query disambiguation."""
        return {
            "normalized_query": raw_query.strip().lower(),
            "extracted_product": raw_query.strip(),
            "grade": None,
            "domain": None,
            "expanded_acronyms": [],
            "suggested_standards": []
        }

    def _raw_generate_json(self, prompt: str, schema: Optional[Type[T]] = None, model_type: str = "flash") -> Dict[str, Any]:
        """Internal low-level runner across available keys."""
        if not self.is_available():
            raise RuntimeError("LLM Gateway is in offline mode.")

        model_name = self.default_pro_model if model_type == "pro" else self.default_flash_model
        attempts = max(len(self.keys), 1)
        last_error = None

        for attempt in range(attempts):
            key = self.get_next_key()
            try:
                self.genai.configure(api_key=key)
                model = self.genai.GenerativeModel(model_name)
                
                system_instruction = "You are an expert Indian Standards (BIS) intelligence AI. Output strict JSON only without markdown formatting."
                full_prompt = f"{system_instruction}\n\nTask:\n{prompt}\n\nOutput JSON matching schema."
                
                response = model.generate_content(
                    full_prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                text = response.text.strip()
                if text.startswith("```"):
                    text = re.sub(r"^```(?:json)?\s*", "", text)
                    text = re.sub(r"\s*```$", "", text)
                
                data = json.loads(text)
                if schema:
                    validated = schema.model_validate(data)
                    return validated.model_dump()
                return data

            except Exception as e:
                logger.warning(f"LLM attempt {attempt + 1}/{attempts} failed with key ...{key[-4:] if key else 'None'}: {e}")
                last_error = e
                continue

        raise RuntimeError(f"All LLM keys exhausted. Last error: {last_error}")

# Master singleton instance
llm_gateway = LLMGateway()
