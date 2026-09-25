import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pipeline.config.api_contract_models import QueryUnderstanding, ExtractedEntity
from pipeline.rag_engine.llm_gateway import llm_gateway

logger = logging.getLogger(__name__)

class NLPExtractor:
    """
    Extracts entities, detects language/script, normalizes query text,
    and identifies procurement intents.
    """
    def __init__(self, synonym_index_path: Optional[str] = None):
        self.synonyms: Dict[str, Any] = {}
        if synonym_index_path:
            try:
                with open(synonym_index_path, "r", encoding="utf-8") as f:
                    self.synonyms = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load synonym index: {e}")

        # Regex patterns for common entity types in BIS procurement
        self.grade_patterns = [
            r"\b(43\s*grade|53\s*grade|33\s*grade)\b",
            r"\b(fe\s*500d?|fe\s*550d?|fe\s*415d?|fe\s*600)\b",
            r"\b(m\s*15|m\s*20|m\s*25|m\s*30|m\s*35|m\s*40)\b",
            r"\b(cat\s*5e?|cat\s*6a?|cat\s*7)\b",
            r"\b(grade\s*[a-z0-9]+)\b"
        ]
        
        self.domain_patterns = [
            (r"\b(highway|road|expressway|bridge|pavement|flyover)\b", "Highway & Transportation Infrastructure"),
            (r"\b(earthquake|seismic|rcc|building|structural|foundation)\b", "Civil Building Construction & Structural Safety"),
            (r"\b(irrigation|agriculture|farming|borewell|well)\b", "Agricultural & Water Supply Systems"),
            (r"\b(electrical|power|transformer|switchgear|cable|wire)\b", "Electrotechnical & Power Distribution"),
            (r"\b(electronics|it|cctv|surveillance|datacenter|server|laptop)\b", "Information Technology & Electronics (CRS)"),
            (r"\b(solar|pv|renewable|inverter|battery)\b", "Solar & Renewable Energy Systems"),
            (r"\b(fire|safety|extinguisher|flame|hydrant)\b", "Fire Fighting & Personal Safety")
        ]

    def detect_language(self, text: str) -> Tuple[str, bool]:
        """Detects language script and indicates if Bhashini translation is used."""
        if any('\u0900' <= char <= '\u097f' for char in text):
            return "hi", True  # Hindi (Devanagari)
        elif any('\u0b80' <= char <= '\u0bff' for char in text):
            return "ta", True  # Tamil
        elif any('\u0c00' <= char <= '\u0c7f' for char in text):
            return "te", True  # Telugu
        elif any('\u0a80' <= char <= '\u0aff' for char in text):
            return "gu", True  # Gujarati
        elif any('\u0980' <= char <= '\u09ff' for char in text):
            return "bn", True  # Bengali
        elif any('\u0d00' <= char <= '\u0d7f' for char in text):
            return "ml", True  # Malayalam
        elif any('\u0c80' <= char <= '\u0cff' for char in text):
            return "kn", True  # Kannada
        elif any('\u0a00' <= char <= '\u0a7f' for char in text):
            return "pa", True  # Punjabi
        return "en", False

    def extract_is_numbers(self, text: str) -> List[str]:
        """Extract explicit standard citations e.g. 'IS 269:2015', 'IS 8112', 'IS 1786'."""
        matches = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*\d{2,5}(?:\s*\([A-Za-z0-9\s]+\))?(?:\s*:\s*\d{4})?", text, re.IGNORECASE)
        # Clean and uppercase
        cleaned = []
        for m in matches:
            norm = re.sub(r"\s+", " ", m).strip().upper()
            if norm not in cleaned:
                cleaned.append(norm)
        return cleaned

    def extract_understanding(self, text: str, user_language: str = "en") -> QueryUnderstanding:
        """
        Full NLP parsing: Entities, Intent, Language, and Normalized Text.
        """
        detected_lang, is_vernacular = self.detect_language(text)
        if user_language and user_language != "en":
            detected_lang = user_language

        # Check LLM Gateway if online
        if llm_gateway.is_available():
            try:
                prompt = (
                    f"Analyze this procurement text: '{text}'.\n"
                    f"Extract entities (PRODUCT, GRADE_SPECIFICATION, APPLICATION_DOMAIN, TEST_PARAMETER), "
                    f"detect intent (STANDARD_LOOKUP, COMPLIANCE_CHECK, OUTDATED_DETECTION, ALLIED_DISCOVERY), "
                    f"and provide normalized search text."
                )
                res = llm_gateway.generate_json(prompt, schema=QueryUnderstanding, model_type="flash")
                return QueryUnderstanding.model_validate(res)
            except Exception as e:
                logger.info(f"Using rule-based NLP extraction fallback: {e}")

        # Deterministic Rule-Based Extraction
        entities: List[ExtractedEntity] = []
        normalized_tokens: List[str] = []

        # 1. Extract Grade
        for pat in self.grade_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                entities.append(ExtractedEntity(
                    entity=m.group(1).strip(),
                    type="GRADE_SPECIFICATION",
                    confidence=0.96
                ))
                break

        # 2. Extract Application Domain
        domain_found = False
        for pat, dom_name in self.domain_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                entities.append(ExtractedEntity(
                    entity=m.group(1).strip(),
                    type="APPLICATION_DOMAIN",
                    confidence=0.94
                ))
                domain_found = True
                break

        # 3. Extract Product Entity
        # Remove common procurement filler words
        clean_text = re.sub(r"\b(procurement|supply|purchase|tender|specification|for|of|the|and|in|with|mandatory|required|grade|is|standard)\b", " ", text, flags=re.IGNORECASE)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()
        
        if clean_text:
            entities.append(ExtractedEntity(
                entity=clean_text,
                type="PRODUCT",
                confidence=0.95
            ))

        # Detect intent
        intent = "STANDARD_LOOKUP"
        if re.search(r"\b(audit|check|verify|comply|compliance|qco|order|rule)\b", text, re.IGNORECASE):
            intent = "COMPLIANCE_CHECK"
        elif re.search(r"\b(outdated|superseded|withdrawn|old|valid|revision)\b", text, re.IGNORECASE):
            intent = "OUTDATED_DETECTION"
        elif re.search(r"\b(allied|test|method|sampling|raw material|related)\b", text, re.IGNORECASE):
            intent = "ALLIED_DISCOVERY"

        return QueryUnderstanding(
            detected_language=detected_lang,
            original_text=text,
            normalized_text=clean_text or text,
            extracted_entities=entities,
            query_intent=intent
        )
