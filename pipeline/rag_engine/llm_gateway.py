import os
import json
import re
import logging
import itertools
from typing import Dict, Any, List, Optional, Type, TypeVar
from pydantic import BaseModel

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class LLMGateway:
    """
    Centralized LLM Gateway with API key rotation, task-based model routing,
    structured output validation, and offline resilient fallback.
    """
    def __init__(self):
        # Extract keys from GEMINI_API_KEYS (comma-separated) or single GEMINI_API_KEY
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

    def generate_json(self, prompt: str, schema: Optional[Type[T]] = None, model_type: str = "flash") -> Dict[str, Any]:
        """
        Executes structured JSON generation with key rotation and Pydantic validation.
        """
        if not self.is_available():
            raise RuntimeError("LLM Gateway is operating in offline mode.")

        model_name = self.default_pro_model if model_type == "pro" else self.default_flash_model
        attempts = max(len(self.keys), 1)
        last_error = None

        for attempt in range(attempts):
            key = self.get_next_key()
            try:
                self.genai.configure(api_key=key)
                model = self.genai.GenerativeModel(model_name)
                
                system_instruction = "You are an expert Indian Standards (BIS) intelligence AI. Output strict JSON only without formatting wrappers."
                full_prompt = f"{system_instruction}\n\nTask:\n{prompt}\n\nProvide response in valid JSON matching schema."
                
                response = model.generate_content(
                    full_prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                text = response.text.strip()
                # Clean potential markdown wrapping
                if text.startswith("```"):
                    text = re.sub(r"^```(?:json)?\s*", "", text)
                    text = re.sub(r"\s*```$", "", text)
                
                data = json.loads(text)
                if schema:
                    validated = schema.model_validate(data)
                    return validated.model_dump()
                return data

            except Exception as e:
                logger.warning(f"LLM request attempt {attempt + 1}/{attempts} failed with key ...{key[-4:] if key else 'None'}: {e}")
                last_error = e
                continue

        raise RuntimeError(f"All LLM keys/attempts exhausted. Last error: {last_error}")

# Master singleton instance
llm_gateway = LLMGateway()
