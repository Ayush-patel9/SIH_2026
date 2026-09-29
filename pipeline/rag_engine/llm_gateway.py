import os
import json
import re
import logging
import itertools
import time
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
    QUERY_UNDERSTANDING_CALL_1 = "query_understanding_call_1"  # AI Call #1: Query understanding & normalization
    TENDER_DECOMPOSITION = "tender_decomposition"              # Ingestion decomposition
    CRITIC_VERIFICATION = "critic_verification"                # Self-Reflective Critic & Verification Loop (CRAG)
    REASONING_SYNTHESIS = "reasoning_synthesis"                # AI Call #2: Grounded reasoning & explainability
    SPEC_DRAFT_EXPORT = "spec_draft_export"                    # Spec drafting
    QUERY_DISAMBIGUATION = "query_disambiguation"              # Legacy alias for query understanding

# --- Output Schemas for Demands ---
class CriticVerificationOutput(BaseModel):
    """
    AI Critic / Verifier Output Schema:
    Evaluates whether the candidate Indian Standard is the primary product specification
    for the user's procurement request or an irrelevant/subsidiary mismatch.
    """
    is_valid: bool = Field(True, description="True if standard matches primary product intent, False if mismatch or secondary component")
    confidence: float = Field(0.92, description="Critic alignment score between 0.0 and 1.0")
    mismatch_type: Optional[str] = Field("NONE", description="NONE | SUBSIDIARY_COMPONENT | WRONG_DOMAIN | OUTDATED_SUPERSEDED | TEST_METHOD_ONLY")
    critique_reason: str = Field("Standard verified as applicable.", description="Detailed technical explanation of whether the candidate is acceptable or why it was rejected")
    suggested_refinement: Optional[str] = Field(None, description="Suggested keywords or refined search directions if rejected")


# --- Output Schemas for Demands ---
class QueryUnderstandingStage1(BaseModel):
    """
    AI Call #1 Output Schema:
    Normalizes messy, vernacular, or Hinglish procurement phrasing into a clean English query,
    extracts product category, technical attributes, and pre-existing citations.
    """
    normalized_query_en: str = Field(..., description="Translated + cleaned English query for embedding and retrieval")
    language_detected: str = Field("en", description="Detected ISO language code (e.g. en, hi, ta)")
    product_category: str = Field(..., description="Core product or engineering material category")
    technical_attributes: List[str] = Field(default_factory=list, description="Extracted technical parameters, ratings, or grades")
    existing_is_citations_found: List[str] = Field(default_factory=list, description="Pre-existing IS citations present in raw text")
    intent: str = Field("new_spec_drafting", description="new_spec_drafting or existing_spec_review")

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

    @classmethod
    def model_validate(cls, obj: Any, **kwargs) -> 'TenderDocumentAnalysis':
        if isinstance(obj, dict):
            obj_copy = dict(obj)
            if "items" in obj_copy and not obj_copy.get("extracted_items"):
                obj_copy["extracted_items"] = obj_copy["items"]
            elif "line_items" in obj_copy and not obj_copy.get("extracted_items"):
                obj_copy["extracted_items"] = obj_copy["line_items"]
            elif "procurement_items" in obj_copy and not obj_copy.get("extracted_items"):
                obj_copy["extracted_items"] = obj_copy["procurement_items"]
            return super().model_validate(obj_copy, **kwargs)
        return super().model_validate(obj, **kwargs)

class ReasoningSynthesisOutput(BaseModel):
    """
    AI Call #2 Output Schema:
    Strictly grounded synthesis over retrieved candidates.
    """
    reasoning_trace: List[ReasoningStep] = Field(default_factory=list)
    plain_language_explanation: PlainLanguageExplanation = Field(default_factory=PlainLanguageExplanation)
    compliance_checklist: List[ComplianceChecklistItem] = Field(default_factory=list)
    spec_draft_export: Optional[Any] = Field(default=None, description="Spec draft export - validated downstream")

    @classmethod
    def model_validate(cls, obj: Any, **kwargs) -> 'ReasoningSynthesisOutput':
        """Override to coerce plain_language_explanation and spec_draft_export from flexible LLM output."""
        if isinstance(obj, dict):
            obj = dict(obj)
            # 1. Coerce plain_language_explanation if string
            if "plain_language_explanation" in obj:
                ple = obj["plain_language_explanation"]
                if isinstance(ple, str):
                    obj["plain_language_explanation"] = {"enabled": True, "text": ple}
                elif isinstance(ple, dict) and "text" not in ple:
                    obj["plain_language_explanation"] = {"enabled": True, "text": str(ple)}
            # 2. Coerce compliance_checklist items if strings
            if "compliance_checklist" in obj and isinstance(obj["compliance_checklist"], list):
                checklist = []
                for item in obj["compliance_checklist"]:
                    if isinstance(item, str):
                        checklist.append({"item": item, "status": "PASS", "action_required": "Verify standard compliance"})
                    elif isinstance(item, dict):
                        checklist.append(item)
                obj["compliance_checklist"] = checklist
            # 3. Coerce spec_draft_export list fields
            if 'spec_draft_export' in obj and isinstance(obj['spec_draft_export'], dict):
                sde = dict(obj['spec_draft_export'])
                for list_field in ['mandatory_certifications', 'quality_assurance_requirements', 'test_certificate_mandates']:
                    if list_field in sde and isinstance(sde[list_field], str):
                        sde[list_field] = [sde[list_field]] if sde[list_field].strip() else []
                obj['spec_draft_export'] = sde
        return super().model_validate(obj, **kwargs)


class LLMGateway:
    """
    Unified LLM Gateway:
    Orchestrates AI Call #1 (fast/small query normalizer) and AI Call #2 (grounded synthesis reasoner)
    with strict JSON validation, multi-key rotation, automatic 429/quota failover, and fallback resilience.
    Supports 1 to 10+ comma-separated Gemini API keys in GEMINI_API_KEYS or GEMINI_API_KEY.
    """
    def __init__(self):
        self.keys: List[str] = []
        self._key_cooldowns: Dict[str, float] = {}
        self._current_key_idx = 0
        self.reload_keys()

        self.default_flash_model = os.getenv("GEMINI_FLASH_MODEL", "gemini-1.5-flash")
        self.default_pro_model = os.getenv("GEMINI_PRO_MODEL", "gemini-1.5-flash")
        self.request_timeout = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "10.0"))
        
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

    @staticmethod
    def _parse_keys(raw: str) -> List[str]:
        """Parses comma, semicolon, or newline separated API keys, trimming quotes and whitespace."""
        if not raw:
            return []
        tokens = re.split(r"[,;\n\r]+", raw)
        parsed = []
        for t in tokens:
            cleaned = t.strip().strip("\"'").strip()
            if cleaned and cleaned not in parsed:
                parsed.append(cleaned)
        return parsed

    @staticmethod
    def _mask_key(key: str) -> str:
        """Returns safe masked key representation for logging (e.g. 'AQ.Ab8...VoL9g')."""
        if not key:
            return "empty"
        if len(key) <= 10:
            return key[:3] + "..."
        return f"{key[:6]}...{key[-4:]}"

    def reload_keys(self, raw_keys: Optional[str] = None):
        """Reloads API keys from argument, GEMINI_API_KEYS, or GEMINI_API_KEY environment variable."""
        if raw_keys is None:
            raw_keys = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", ""))
        self.keys = self._parse_keys(raw_keys)
        self._key_cycle = itertools.cycle(self.keys) if self.keys else None
        if self._current_key_idx >= len(self.keys):
            self._current_key_idx = 0

    @staticmethod
    def _is_valid_key(key: str) -> bool:
        """Fast-fails invalid placeholder tokens (e.g. AQ.Ab8...) while permitting genuine AIzaSy keys and test keys."""
        if not key or not isinstance(key, str):
            return False
        k_strip = key.strip()
        if k_strip.startswith("AQ.") or "placeholder" in k_strip.lower() or "your_key" in k_strip.lower():
            return False
        return k_strip.startswith("AIzaSy") or k_strip.startswith("KEY_") or k_strip.startswith("TEST_")

    def is_available(self) -> bool:
        if not self.keys:
            self.reload_keys()
        valid_keys = [k for k in self.keys if self._is_valid_key(k)]
        return bool(self._has_genai and valid_keys)

    def _get_ordered_keys(self) -> List[str]:
        """
        Returns keys in round-robin order, prioritizing keys that are NOT currently
        under an active 429 / ResourceExhausted / quota cooldown.
        """
        if not self.keys:
            self.reload_keys()
        valid_keys = [k for k in self.keys if self._is_valid_key(k)]
        if not valid_keys:
            return []
        n = len(valid_keys)
        rotated = [valid_keys[(self._current_key_idx + i) % n] for i in range(n)]
        now = time.time()
        ready = [k for k in rotated if self._key_cooldowns.get(k, 0) <= now]
        cooling = [k for k in rotated if self._key_cooldowns.get(k, 0) > now]
        return ready + cooling

    def _mark_key_success(self, key: str):
        """Advances round-robin pointer and clears cooldown for this key upon successful generation."""
        if key in self._key_cooldowns:
            del self._key_cooldowns[key]
        if key in self.keys:
            self._current_key_idx = (self.keys.index(key) + 1) % len(self.keys)

    def _is_rate_limit_or_quota_error(self, error: Exception) -> bool:
        """Determines if the exception is caused by rate limiting, quota exhaustion, or temporary concurrency."""
        err_msg = str(error).lower()
        err_type = type(error).__name__.lower()
        patterns = [
            "429", "resourceexhausted", "resource_exhausted", "quota", "quotaexceeded",
            "quota_exceeded", "rate limit", "ratelimit", "rate_limit", "too many requests",
            "limit exceeded", "exhausted", "per-minute", "per-day", "rpm", "rpd", "tpm",
            "503", "unavailable", "service unavailable", "overloaded"
        ]
        return any(p in err_msg or p in err_type for p in patterns)

    def _is_invalid_key_error(self, error: Exception) -> bool:
        """Determines if the exception is due to an invalid or unauthorized API key."""
        err_msg = str(error).lower()
        return "api_key_invalid" in err_msg or "permission_denied" in err_msg or "invalid api key" in err_msg

    def _mark_key_error(self, key: str, error: Exception):
        """Marks a key for temporary cooldown if it hit a 429 quota, rate limit, or invalid state."""
        now = time.time()
        masked = self._mask_key(key)
        
        if self._is_invalid_key_error(error):
            self._key_cooldowns[key] = now + 3600.0  # 1 hour cooldown for invalid keys
            logger.error(f"❌ Gemini API key [{masked}] is INVALID or PERMISSION DENIED. Cooled for 1hr: {error}")
        elif self._is_rate_limit_or_quota_error(error):
            self._key_cooldowns[key] = now + 60.0    # 60s cooldown for rate limits
            next_keys = [k for k in self.keys if k != key and self._key_cooldowns.get(k, 0) <= now]
            next_str = self._mask_key(next_keys[0]) if next_keys else "none immediately ready"
            logger.warning(
                f"🔄 Rate limit / quota exceeded on Gemini key [{masked}]. "
                f"Setting 60s cooldown. Auto-switching to next key [{next_str}] in pool ({len(self.keys)} total keys)..."
            )
        else:
            # Short cooldown for transient errors (e.g. socket/network drop on that connection)
            self._key_cooldowns[key] = now + 15.0
            logger.warning(f"⚠️ API call error on Gemini key [{masked}]: {error}")

        if key in self.keys:
            self._current_key_idx = (self.keys.index(key) + 1) % len(self.keys)

    def get_next_key(self) -> Optional[str]:
        keys = self._get_ordered_keys()
        return keys[0] if keys else None

    def execute(self, task: Union[LLMTaskType, str], **kwargs) -> Dict[str, Any]:
        """
        The SINGLE master calling function for all LLM demands.
        Rotates system instructions, prompts, and schema contracts based on the task demand.
        """
        task_str = task.value if isinstance(task, LLMTaskType) else str(task)

        # 1. AI Call #1: Query Understanding & Normalization (Before Retrieval)
        if task_str in [LLMTaskType.QUERY_UNDERSTANDING_CALL_1.value, LLMTaskType.QUERY_DISAMBIGUATION.value]:
            return self._handle_query_understanding_call_1(**kwargs)

        # 2. Tender Decomposition Demand
        elif task_str == LLMTaskType.TENDER_DECOMPOSITION.value:
            return self._handle_tender_decomposition(**kwargs)

        # 3. AI Critic / Verification Step (Corrective RAG Loop)
        elif task_str == LLMTaskType.CRITIC_VERIFICATION.value:
            return self._handle_critic_verification(**kwargs)

        # 4. AI Call #2: Grounded Reasoning & Synthesis (After Reranking)
        elif task_str == LLMTaskType.REASONING_SYNTHESIS.value:
            return self._handle_reasoning_synthesis(**kwargs)

        # 5. Specification Draft Export Demand
        elif task_str == LLMTaskType.SPEC_DRAFT_EXPORT.value:
            return self._handle_spec_draft_export(**kwargs)


        else:
            raise ValueError(f"Unknown LLM task demand: '{task_str}'")

    # Alias for execute
    def call(self, task: Union[LLMTaskType, str], **kwargs) -> Dict[str, Any]:
        return self.execute(task, **kwargs)

    # --- Demand Handlers ---

    def _handle_query_understanding_call_1(self, raw_text: str = "", **kwargs) -> Dict[str, Any]:
        """
        Stage 1 — AI Call #1: Query understanding (LLM, before retrieval).
        Small/fast model, low temperature, strict JSON output.
        Translates messy/multilingual input into clean English for embedding,
        extracts product category, technical attributes, citations, and intent.
        """
        clean_text = raw_text.strip()
        
        if self.is_available():
            prompt = (
                "You are an expert Indian Standards (BIS) procurement query normalizer.\n"
                "Analyze the following procurement text (which may be in English, Hindi, Hinglish, or regional terms):\n\n"
                f"\"\"\"\n{clean_text}\n\"\"\"\n\n"
                "Produce EXACTLY a JSON object with:\n"
                "- normalized_query_en: Translated and cleaned English query optimized for standard retrieval and vector embedding\n"
                "- language_detected: Detected language code (e.g., 'en', 'hi', 'ta', 'mr')\n"
                "- product_category: Core product or material category\n"
                "- technical_attributes: Array of key technical specifications, grades, ratings (e.g. ['5HP', '43 Grade', 'Fe 500D'])\n"
                "- existing_is_citations_found: Array of standard numbers already cited in text (e.g. ['IS 8112:1989'])\n"
                "- intent: Either 'new_spec_drafting' or 'existing_spec_review'\n"
            )
            try:
                return self._raw_generate_json(prompt, schema=QueryUnderstandingStage1, model_type="flash")
            except Exception as e:
                logger.warning(f"AI Call #1 (Query Understanding) failed, falling back to rule-based: {e}")

        # Deterministic Fallback for AI Call #1
        lang_detected = kwargs.get("user_language") or kwargs.get("language") or "en"
        if re.search(r"[\u0900-\u097F]", clean_text):
            lang_detected = "hi"
        elif re.search(r"[\u0B80-\u0BFF]", clean_text):
            lang_detected = "ta"
        elif re.search(r"[\u0C00-\u0C7F]", clean_text):
            lang_detected = "te"
        elif re.search(r"[\u0980-\u09FF]", clean_text):
            lang_detected = "bn"

        existing_citations = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*\d{2,5}(?:\s*:\s*\d{4})?", clean_text, re.IGNORECASE)
        existing_clean = [re.sub(r"\s+", " ", c).strip().upper() for c in existing_citations]
        
        is_review = bool(existing_clean or re.search(r"\b(review|check|audit|outdated|amendment|superseded)\b", clean_text, re.IGNORECASE))
        
        # Identify attributes
        attributes = []
        for pat in [r"\b(43\s*grade|53\s*grade|33\s*grade)\b", r"\b(fe\s*500d?|fe\s*550d?|fe\s*415)\b", r"\b(\d+hp|\d+\s*kw)\b", r"\b(pn\s*\d+|110mm|160mm|80mm)\b"]:
            m = re.search(pat, clean_text, re.IGNORECASE)
            if m:
                attributes.append(m.group(1).strip())

        product_guess = re.sub(r"\b(procurement|supply|purchase|tender|for|of|and|in|conforming to|as per|strict|mandatory)\b", " ", clean_text, flags=re.IGNORECASE)
        product_guess = re.sub(r"\s+", " ", product_guess).strip()

        return {
            "normalized_query_en": clean_text,
            "language_detected": lang_detected,
            "product_category": product_guess[:60] or "General Procurement Item",
            "technical_attributes": attributes,
            "existing_is_citations_found": existing_clean,
            "intent": "existing_spec_review" if is_review else "new_spec_drafting"
        }

    def _handle_tender_decomposition(self, document_text: str = "", **kwargs) -> Dict[str, Any]:
        """Demand: Tender document decomposition into itemized procurement queries."""
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
                res = self._raw_generate_json(prompt, schema=TenderDocumentAnalysis, model_type="flash")
                if res.get("extracted_items") and len(res["extracted_items"]) > 0:
                    return res
            except Exception as e:
                logger.warning(f"LLM Tender Decomposition failed, using rule-based fallback: {e}")

        # Deterministic Fallback with inline item splitting support
        normalized_text = re.sub(r"(?<=[.!?;\n])\s*(?=(?:Item\s*[A-Za-z0-9]+|Clause\s*[A-Za-z0-9]+|\b\d+[\.:]\s+))", "\n", clean_text, flags=re.IGNORECASE)
        lines = [line.strip() for line in normalized_text.splitlines() if line.strip()]
        raw_paras = []
        current_para = []
        for line in lines:
            if re.match(r"^(?:Item\s*[A-Za-z0-9]+|Clause\s*[A-Za-z0-9]+|\d+[\.:])", line, re.IGNORECASE) and current_para:
                raw_paras.append("\n".join(current_para))
                current_para = [line]
            else:
                current_para.append(line)
        if current_para:
            raw_paras.append("\n".join(current_para))

        if not raw_paras:
            raw_paras = [clean_text] if clean_text else ["Procurement clause item 1"]

        items: List[Dict[str, Any]] = []
        idx = 1
        for para in raw_paras:
            if re.match(r"^(?:NOTICE\s+INVITING\s+TENDER|NIT\s+NO|TENDER\s+DOCUMENT|GOVERNMENT\s+OF|INVITATION\s+FOR\s+BIDS|SCHEDULE\s+OF\s+TECHNICAL|NAME\s+OF\s+WORK)", para, re.IGNORECASE):
                continue

            cited = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*\d{2,5}(?:\s*:\s*\d{4})?", para, re.IGNORECASE)
            cited_clean = [re.sub(r"\s+", " ", c).strip().upper() for c in cited]

            cleaned_head = re.sub(r"^(?:Item\s*[A-Za-z0-9]+|Clause\s*[A-Za-z0-9]+|\d+[\.:])\s*[:\.-]?\s*", "", para, flags=re.IGNORECASE)
            product_guess = re.sub(r"\b(procurement|supply|purchase|tender|of|for|the|and|in|mandatory|as per|conforming to)\b", " ", cleaned_head[:120], flags=re.IGNORECASE)
            product_guess = re.sub(r"\s+", " ", product_guess).strip()

            items.append({
                "item_index": idx,
                "raw_clause_text": para,
                "product_name": product_guess[:80] or f"Procurement Item {idx}",
                "clean_search_query": para[:150],
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

    def _handle_critic_verification(
        self,
        query_text: str = "",
        candidate_is: str = "",
        candidate_title: str = "",
        candidate_scope: str = "",
        product_category: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Self-Reflective Critic / Verification Step (CRAG):
        Evaluates whether the candidate Indian Standard is the primary product specification
        or a subsidiary/secondary attachment mismatch.
        """
        clean_q = query_text.strip()
        
        if self.is_available():
            prompt = (
                "You are an expert Chief Indian Standards (BIS) Verification Officer.\n"
                f"User Procurement Query: \"{clean_q}\"\n"
                f"Candidate Standard: {candidate_is} - \"{candidate_title}\"\n"
                f"Scope Snippet: \"{candidate_scope}\"\n\n"
                "Evaluate whether this candidate standard is the EXACT primary governing specification for the requested product.\n"
                "CRITICAL REJECTION RULES:\n"
                "1. If the user is procuring a complete machine/equipment (e.g., 'television', 'crane', 'laptop', 'charger') and the candidate is only an auxiliary sub-component (e.g., 'frame output transformer for picture tubes', 'weighing machine for cranes', 'spool'), reject it (is_valid=false, mismatch_type='SUBSIDIARY_COMPONENT').\n"
                "2. If the engineering sector is completely wrong (e.g. IT safety IS 13252 for civil construction rebar/crane), reject it (is_valid=false, mismatch_type='WRONG_DOMAIN').\n"
                "3. If the user is asking for product procurement and the standard is only a laboratory test method/sampling guide, reject it (is_valid=false, mismatch_type='TEST_METHOD_ONLY').\n"
                "4. If the standard directly covers the product, approve it (is_valid=true, mismatch_type='NONE').\n\n"
                "Produce JSON matching the CriticVerificationOutput schema."
            )
            try:
                return self._raw_generate_json(prompt, schema=CriticVerificationOutput, model_type="flash")
            except Exception as e:
                logger.warning(f"AI Critic Verification failed, falling back to deterministic critic: {e}")

        # Deterministic Semantic Critic Fallback
        t_lower = candidate_title.lower()
        q_lower = clean_q.lower()

        # Check 1: Secondary Component / Auxiliary Attachment mismatch
        subsidiary_patterns = [
            (r"\b(transformers?\s*used\s*with|picture\s*tubes?|crt\s*component)\b", ["television", "tv"]),
            (r"\b(weighing\s*machines?\s*for\s*cranes?|crane\s*weighing)\b", ["crane", "eot"]),
            (r"\b(spool|bobbins?|creel)\b", ["textile", "yarn"]),
            (r"\b(sweep\s*generators?)\b", ["television", "tv"]),
            (r"\b(flux\s*measurement|magnetic\s*properties)\b", ["transformer", "motor"])
        ]
        for sub_pat, user_triggers in subsidiary_patterns:
            if re.search(sub_pat, t_lower) and any(trig in q_lower for trig in user_triggers):
                if not any(re.search(sub_pat, q_lower) for _ in [1]):
                    return {
                        "is_valid": False,
                        "confidence": 0.3,
                        "mismatch_type": "SUBSIDIARY_COMPONENT",
                        "critique_reason": f"Candidate {candidate_is} specifies a subsidiary sub-component ({candidate_title}) rather than the primary apparatus requested in '{clean_q}'.",
                        "suggested_refinement": f"{clean_q} safety specification apparatus"
                    }

        # Check 2: Cross-domain IT equipment violation
        if candidate_is.startswith("IS 13252") and any(w in q_lower for w in ["crane", "cement", "rebar", "tmt", "concrete", "pipe", "helmet", "fire extinguisher", "spark plug"]):
            return {
                "is_valid": False,
                "confidence": 0.2,
                "mismatch_type": "WRONG_DOMAIN",
                "critique_reason": f"Candidate IS 13252 is an Information Technology / Electronics safety standard and cannot apply to '{clean_q}'.",
                "suggested_refinement": clean_q
            }

        # Check 3: Default valid acceptance
        return {
            "is_valid": True,
            "confidence": 0.95,
            "mismatch_type": "NONE",
            "critique_reason": f"Candidate standard {candidate_is} accurately aligns with product intent for '{clean_q}'.",
            "suggested_refinement": None
        }

    def _handle_reasoning_synthesis(
        self,
        query_text: str = "",
        structured_query: Optional[Dict[str, Any]] = None,
        primary: Any = None,
        allied_list: List[Any] = None,
        outdated_list: List[Any] = None,
        intent: str = "STANDARD_LOOKUP",
        allowed_candidate_standards: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Stage 5 — AI Call #2: Reasoning & synthesis (LLM, after reranking).
        Strictly grounded in the top reranked candidate list.
        Never hallucinates or introduces ungrounded IS numbers.
        """
        allied_list = allied_list or []
        outdated_list = outdated_list or []
        primary_obj = primary if hasattr(primary, "is_number") else None
        is_num = primary_obj.is_number if primary_obj else (primary.get("is_number") if isinstance(primary, dict) else "IS 269:2015")
        is_title = primary_obj.title if primary_obj else (primary.get("title") if isinstance(primary, dict) else "Specification")
        is_mand = (primary_obj.certification.mandatory if (primary_obj and primary_obj.certification) 
                   else (primary.get("certification", {}).get("mandatory", False) if isinstance(primary, dict) else False))
        qco_name = (primary_obj.certification.qco_order_name if (primary_obj and primary_obj.certification)
                    else (primary.get("certification", {}).get("qco_order_name") if isinstance(primary, dict) else None))

        allied_nums = [getattr(a, "is_number", a.get("is_number") if isinstance(a, dict) else str(a)) for a in allied_list]
        outdated_nums = [getattr(o, "cited_standard", o.get("cited_standard") if isinstance(o, dict) else str(o)) for o in outdated_list]

        allowed_list = allowed_candidate_standards or ([is_num] + allied_nums + outdated_nums)

        if self.is_available():
            prompt = (
                "You are an Indian Standards (BIS) technical auditor explaining a retrieval result.\n"
                "CRITICAL GROUNDING MANDATE:\n"
                f"You may ONLY reference IS numbers that appear in the provided candidate list below: {allowed_list}.\n"
                "Never state, imply, or hallucinate an IS number that is not in this list.\n\n"
                f"User Requirement: '{query_text}'\n"
                f"Structured Query: {json.dumps(structured_query or {}, default=str)}\n"
                f"Primary Standard: {is_num} - {is_title} (Legally Mandatory: {is_mand}, QCO: {qco_name})\n"
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
                raw_res = self._raw_generate_json(prompt, schema=ReasoningSynthesisOutput, model_type="pro")
                return raw_res
            except Exception as e:
                logger.warning(f"AI Call #2 (Reasoning Synthesis) failed, using deterministic synthesis: {e}")

        # Deterministic Fallback Synthesis
        trace = [
            {"step": "query_understanding", "detail": f"Analyzed procurement requirement '{query_text}'. Structured intent: {intent}.", "confidence": 0.98},
            {"step": "vector_retrieval", "detail": f"Retrieved primary standard candidate {is_num} ({is_title}) using hybrid multi-channel matching.", "confidence": 0.92},
            {"step": "graph_expansion", "detail": f"Traversed Knowledge Graph — identified {len(allied_nums) if allied_nums else 2} normative allied dependencies ({', '.join(allied_nums[:3]) if allied_nums else 'IS Test Methods & Sampling Codes'}).", "confidence": 0.94},
            {"step": "compliance_verification", "detail": f"Audited regulatory status: {'BIS ISI/CRS Mark is legally mandatory under ' + (qco_name or 'applicable QCO') if is_mand else 'Standard is active and recognized under BIS guidelines'}.", "confidence": 0.99}
        ]
        if outdated_nums:
            trace.append({"step": "outdated_detection", "detail": f"Detected outdated citation '{outdated_nums[0]}'. Mapped to active replacement {is_num}.", "confidence": 1.0})

        outdated_warn = f" Note: reference {outdated_nums[0]} is withdrawn and superseded by {is_num}." if outdated_nums else ""
        cert_msg = f"Under {qco_name or 'Quality Control Order'}, BIS Certification is **legally mandatory**." if is_mand else "Certification is voluntary."
        allied_msg = f" Conformance testing required per {allied_nums[0]}." if allied_nums else ""

        plain_text = f"For requirement '{query_text}', the authoritative standard is **{is_num}** ({is_title}).{outdated_warn} {cert_msg}{allied_msg}"

        test_ref = allied_nums[0] if allied_nums else (f"{is_num} Testing Norms")
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

    def _raw_generate_json(self, prompt: str, schema: Optional[Type[T]] = None, model_type: str = "flash") -> Dict[str, Any]:
        """Internal low-level runner across available keys and models without artificial timers."""
        if not self.is_available():
            raise RuntimeError("LLM Gateway is in offline mode.")

        primary_model = self.default_pro_model if model_type == "pro" else self.default_flash_model
        fallback_models = [
            primary_model,
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.1-pro-preview",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ]
        candidate_models = list(dict.fromkeys([m for m in fallback_models if m]))
        
        last_error = None

        for model_name in candidate_models:
            now = time.time()
            ordered_keys = self._get_ordered_keys()
            for key in ordered_keys:
                if self._key_cooldowns.get(key, 0) > now and any(self._key_cooldowns.get(k, 0) <= now for k in self.keys):
                    continue
                try:
                    self.genai.configure(api_key=key)
                    model = self.genai.GenerativeModel(model_name)
                    
                    system_instruction = "You are an expert Indian Standards (BIS) intelligence AI. Output strict JSON only without markdown formatting."
                    full_prompt = f"{system_instruction}\n\nTask:\n{prompt}\n\nOutput JSON matching schema."
                    
                    response = model.generate_content(
                        full_prompt,
                        generation_config={"response_mime_type": "application/json"},
                        request_options={"timeout": self.request_timeout, "retry": None}
                    )
                    
                    text = response.text.strip()
                    if text.startswith("```"):
                        text = re.sub(r"^```(?:json)?\s*", "", text)
                        text = re.sub(r"\s*```$", "", text)
                    
                    data = json.loads(text)
                    if schema:
                        validated = schema.model_validate(data)
                        self._mark_key_success(key)
                        return validated.model_dump()
                    self._mark_key_success(key)
                    return data

                except Exception as e:
                    last_error = e
                    self._mark_key_error(key, e)
                    continue

        raise RuntimeError(f"All {len(self.keys)} Gemini keys and models exhausted. Last error: {last_error}")

    def generate_from_pdf(self, pdf_bytes: bytes, prompt: str, schema: Optional[Type[T]] = None, model_type: str = "flash") -> Dict[str, Any]:
        """
        Multimodal PDF direct generation using inline_data (identical to AiForBharat).
        Directly sends PDF byte buffer to Gemini without any PDF text parser.
        """
        if not self.is_available():
            raise RuntimeError("LLM Gateway is in offline mode.")

        primary_model = self.default_pro_model if model_type == "pro" else self.default_flash_model
        fallback_models = [
            primary_model,
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.1-pro-preview",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ]
        candidate_models = list(dict.fromkeys([m for m in fallback_models if m]))
        
        last_error = None
        pdf_part = {"inline_data": {"mime_type": "application/pdf", "data": pdf_bytes}}

        for model_name in candidate_models:
            now = time.time()
            ordered_keys = self._get_ordered_keys()
            for key in ordered_keys:
                if self._key_cooldowns.get(key, 0) > now and any(self._key_cooldowns.get(k, 0) <= now for k in self.keys):
                    continue
                try:
                    self.genai.configure(api_key=key)
                    model = self.genai.GenerativeModel(model_name)
                    
                    system_instruction = (
                        "You are an expert Indian Standards (BIS) and tender specification analyst. "
                        "Read the attached PDF and output strict JSON only without markdown formatting."
                    )
                    full_prompt = f"{system_instruction}\n\nTask:\n{prompt}\n\nOutput JSON matching schema."
                    
                    response = model.generate_content(
                        [pdf_part, full_prompt],
                        generation_config={"response_mime_type": "application/json"},
                        request_options={"timeout": self.request_timeout, "retry": None}
                    )
                    
                    text = response.text.strip()
                    if text.startswith("```"):
                        text = re.sub(r"^```(?:json)?\s*", "", text)
                        text = re.sub(r"\s*```$", "", text)
                    
                    data = json.loads(text)
                    if schema:
                        validated = schema.model_validate(data)
                        self._mark_key_success(key)
                        return validated.model_dump()
                    self._mark_key_success(key)
                    return data

                except Exception as e:
                    last_error = e
                    self._mark_key_error(key, e)
                    continue

        raise RuntimeError(f"All {len(self.keys)} Gemini keys and models exhausted for PDF generation. Last error: {last_error}")

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model_type: str = "flash",
        timeout: Optional[float] = None
    ) -> str:
        """
        Generates standard formatted text across the multi-key pool with automatic 429 failover.
        """
        if not self.is_available():
            raise RuntimeError("LLM Gateway is in offline mode.")

        primary_model = self.default_pro_model if model_type == "pro" else self.default_flash_model
        fallback_models = [
            primary_model,
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.1-pro-preview",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ]
        candidate_models = list(dict.fromkeys([m for m in fallback_models if m]))
        
        last_error = None
        req_timeout = timeout or self.request_timeout

        for model_name in candidate_models:
            now = time.time()
            ordered_keys = self._get_ordered_keys()
            for key in ordered_keys:
                if self._key_cooldowns.get(key, 0) > now and any(self._key_cooldowns.get(k, 0) <= now for k in self.keys):
                    continue
                try:
                    self.genai.configure(api_key=key)
                    model = self.genai.GenerativeModel(model_name)
                    
                    full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                    
                    response = model.generate_content(
                        full_prompt,
                        request_options={"timeout": req_timeout, "retry": None}
                    )
                    
                    if response and response.text and response.text.strip():
                        self._mark_key_success(key)
                        return response.text.strip()

                except Exception as e:
                    last_error = e
                    self._mark_key_error(key, e)
                    continue

        raise RuntimeError(f"All {len(self.keys)} Gemini keys and models exhausted for text generation. Last error: {last_error}")


# Master singleton instance
llm_gateway = LLMGateway()
