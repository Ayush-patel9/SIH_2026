import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pipeline.config.api_contract_models import QueryUnderstanding, ExtractedEntity
from pipeline.rag_engine.llm_gateway import llm_gateway, LLMTaskType, QueryUnderstandingStage1

logger = logging.getLogger(__name__)

class NLPExtractor:
    """
    Stage 1 — AI Call #1 & Deterministic NLP Extraction Layer:
    Extracts entities, detects language/script, normalizes query text into clean English for embedding,
    expands trade acronyms, and identifies procurement intents.
    """
    def __init__(self, synonym_index_path: Optional[str] = None):
        self.synonyms: Dict[str, Any] = {}
        if synonym_index_path:
            try:
                with open(synonym_index_path, "r", encoding="utf-8") as f:
                    self.synonyms = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load synonym index: {e}")

        # Canonical Trade & Engineering Acronym Expansions
        self.acronym_map = {
            r"\bhdpe\b": "high density polyethylene pipes hdpe",
            r"\bupvc\b": "unplasticized polyvinyl chloride upvc pipes",
            r"\bpvc\b": "polyvinyl chloride pvc",
            r"\bxlpe\b": "cross-linked polyethylene xlpe insulated power cables",
            r"\btmt\b": "high strength deformed steel bars tmt",
            r"\baac\b": "autoclaved aerated concrete aac blocks",
            r"\bcctv\b": "video surveillance systems cctv security camera",
            r"\bopc\b": "ordinary portland cement opc",
            r"\bppc\b": "portland pozzolana cement ppc",
            r"\brcc\b": "reinforced cement concrete rcc",
            r"\bled\b": "self-ballasted led lamps general lighting",
            r"\bcrs\b": "compulsory registration scheme crs electronics"
        }

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
            (r"\b(irrigation|agriculture|farming|borewell|well|drinking\s*water|jal\s*jeevan)\b", "Agricultural & Water Supply Systems"),
            (r"\b(electrical|power|transformer|switchgear|cable|wire|11kv)\b", "Electrotechnical & Power Distribution"),
            (r"\b(electronics|it|cctv|surveillance|datacenter|server|laptop|computer|tablet)\b", "Information Technology & Electronics (CRS)"),
            (r"\b(solar|pv|renewable|inverter|battery)\b", "Solar & Renewable Energy Systems"),
            (r"\b(fire|safety|extinguisher|flame|hydrant)\b", "Fire Fighting & Personal Safety")
        ]

    def detect_language(self, text: str) -> Tuple[str, bool]:
        """Detects language script and indicates if Bhashini translation is used."""
        if any('\u0900' <= char <= '\u097f' for char in text):
            if re.search(r"(साठी|आणि|पोलाद|तपासणी|शिरस्त्राण|निविदा|काँक्रीट|वीट|पाईप|रस्ते|बांधकाम|करावे|आहेत)", text):
                return "mr", True
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
        """Extract explicit standard citations with strict word boundaries."""
        matches = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*(\d{2,5}(?:\s*\(Part\s*\d+\))?(?:\s*:\s*\d{4})?)", text, re.IGNORECASE)
        cleaned = []
        for m in matches:
            norm = f"IS {m}".strip().upper()
            norm = re.sub(r"\s+", " ", norm)
            if norm not in cleaned:
                cleaned.append(norm)
        return cleaned

    def extract_understanding(self, text: str, user_language: str = "en") -> QueryUnderstanding:
        """
        Stage 1 — AI Call #1 (with Deterministic Rule-Based Fallback):
        Extracts structured entities, normalizes messy/vernacular text into English for embedding,
        and identifies procurement intent.
        """
        detected_lang, is_vernacular = self.detect_language(text)
        if user_language and user_language != "en":
            detected_lang = user_language

        # Stage 1: AI Call #1 (LLM Query Understanding)
        if llm_gateway.is_available():
            try:
                res_dict = llm_gateway.call(
                    LLMTaskType.QUERY_UNDERSTANDING_CALL_1,
                    raw_text=text
                )
                stage1_obj = QueryUnderstandingStage1.model_validate(res_dict)
                
                entities: List[ExtractedEntity] = []
                if stage1_obj.product_category:
                    entities.append(ExtractedEntity(
                        entity=stage1_obj.product_category,
                        type="PRODUCT",
                        confidence=0.98
                    ))
                for attr in stage1_obj.technical_attributes:
                    entities.append(ExtractedEntity(
                        entity=attr,
                        type="GRADE_SPECIFICATION",
                        confidence=0.95
                    ))

                return QueryUnderstanding(
                    detected_language=stage1_obj.language_detected or detected_lang,
                    original_text=text,
                    normalized_text=stage1_obj.normalized_query_en or text,
                    extracted_entities=entities,
                    query_intent=stage1_obj.intent
                )
            except Exception as e:
                logger.info(f"AI Call #1 fallback to deterministic rules: {e}")

        # Deterministic Rule-Based Fallback
        expanded_text = text
        for pat, repl in self.acronym_map.items():
            expanded_text = re.sub(pat, repl, expanded_text, flags=re.IGNORECASE)

        entities: List[ExtractedEntity] = []

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
        for pat, dom_name in self.domain_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                entities.append(ExtractedEntity(
                    entity=m.group(1).strip(),
                    type="APPLICATION_DOMAIN",
                    confidence=0.94
                ))
                break

        # 3. Handle Compound Nouns and Vernacular Synonyms
        clean_text = expanded_text
        if "पेवर ब्लॉक" in text or "paver block" in text.lower():
            clean_text = "precast concrete blocks for paving paver blocks"
        elif "सीमेंट" in text and "कंक्रीट" not in text:
            clean_text = "ordinary portland cement"
        else:
            clean_text = re.sub(r"\b(procurement|supply|purchase|tender|specification|for|of|the|and|in|with|mandatory|required|grade|is|standard|conforming|to|under)\b", " ", expanded_text, flags=re.IGNORECASE)
            clean_text = re.sub(r"\s+", " ", clean_text).strip()
        
        if clean_text:
            entities.append(ExtractedEntity(
                entity=clean_text[:80],
                type="PRODUCT",
                confidence=0.95
            ))

        intent = "STANDARD_LOOKUP"
        if re.search(r"\b(audit|check|verify|comply|compliance|qco|order|rule|scheme)\b", text, re.IGNORECASE):
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
