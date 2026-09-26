#!/usr/bin/env python3
"""
bhashini_client.py
Bhashini Dhruva / ULCA NMT (Neural Machine Translation) Client for Indic Languages.
Supports bidirectional translation between English and Hindi, Tamil, Telugu, Marathi, Gujarati, and Bengali.
Includes automatic local regional lexicon fallback when API keys are absent or offline.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

LEXICON_DIR = Path(__file__).parent.parent / "data" / "06_multilingual_lexicon"
SYNONYM_INDEX_PATH = LEXICON_DIR / "synonym_search_index.json"
REGIONAL_PATH = LEXICON_DIR / "regional_glossary_multi.json"

class BhashiniClient:
    """
    Bhashini NMT inference client for Indian Public Procurement intelligence.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("BHASHINI_API_KEY")
        self.user_id = os.environ.get("BHASHINI_USER_ID", "manakai_procurement_user")
        self.pipeline_endpoint = os.environ.get(
            "BHASHINI_ENDPOINT",
            "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
        )
        self.synonyms: Dict[str, Any] = {}
        self.regional_glossaries: Dict[str, Any] = {}
        self._load_local_lexicons()

    def _load_local_lexicons(self):
        if SYNONYM_INDEX_PATH.exists():
            try:
                with open(SYNONYM_INDEX_PATH, "r", encoding="utf-8") as f:
                    self.synonyms = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load local synonym index: {e}")

        if REGIONAL_PATH.exists():
            try:
                with open(REGIONAL_PATH, "r", encoding="utf-8") as f:
                    self.regional_glossaries = json.load(f).get("glossaries", {})
            except Exception as e:
                logger.warning(f"Could not load regional glossaries: {e}")

    def translate_to_english(self, text: str, source_lang: str) -> Tuple[str, bool]:
        """
        Translates vernacular procurement query text to English.
        Returns (translated_text, bhashini_used).
        """
        if not text or source_lang in ["en", "english"]:
            return text, False

        # If live Bhashini API key is configured
        if self.api_key:
            try:
                import urllib.request
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "translation",
                            "config": {
                                "language": {
                                    "sourceLanguage": source_lang,
                                    "targetLanguage": "en"
                                }
                            }
                        }
                    ],
                    "inputData": {
                        "input": [{"source": text}]
                    }
                }
                req = urllib.request.Request(
                    self.pipeline_endpoint,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": self.api_key,
                        "User-Agent": "ManakAI-Bhashini-Client/1.0"
                    }
                )
                with urllib.request.urlopen(req, timeout=2.5) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    translated = data["pipelineResponse"][0]["output"][0]["target"]
                    if translated:
                        return translated, True
            except Exception as e:
                logger.warning(f"Live Bhashini API call failed, using local lexicon fallback: {e}")

        # Local Lexicon & Synonym Translation Fallback
        clean_text = text.strip()
        # Direct key lookup
        if clean_text in self.synonyms:
            entry = self.synonyms[clean_text]
            canonical = entry.get("canonical") if isinstance(entry, dict) else None
            if canonical:
                return canonical, False

        # Substring replacement for regional terminology
        translated_words = clean_text
        for k, v in self.synonyms.items():
            if len(k) >= 2 and k in translated_words:
                canonical = v.get("canonical") if isinstance(v, dict) else str(v)
                if canonical:
                    translated_words = translated_words.replace(k, canonical)

        return translated_words, False

    def translate_from_english(self, text: str, target_lang: str) -> Tuple[str, bool]:
        """
        Translates English explainability summary back to user's vernacular language.
        Returns (translated_text, bhashini_used).
        """
        if not text or target_lang in ["en", "english"]:
            return text, False

        if self.api_key:
            try:
                import urllib.request
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "translation",
                            "config": {
                                "language": {
                                    "sourceLanguage": "en",
                                    "targetLanguage": target_lang
                                }
                            }
                        }
                    ],
                    "inputData": {
                        "input": [{"source": text}]
                    }
                }
                req = urllib.request.Request(
                    self.pipeline_endpoint,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": self.api_key
                    }
                )
                with urllib.request.urlopen(req, timeout=2.5) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    translated = data["pipelineResponse"][0]["output"][0]["target"]
                    if translated:
                        return translated, True
            except Exception as e:
                logger.warning(f"Bhashini reverse translation failed: {e}")

        return text, False

# Global Singleton Instance
bhashini_client = BhashiniClient()
