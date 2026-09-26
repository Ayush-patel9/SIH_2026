import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from pipeline.rag_engine.llm_gateway import (
    llm_gateway,
    LLMTaskType,
    ExtractedTenderItem,
    TenderDocumentAnalysis
)

logger = logging.getLogger(__name__)

class TenderDocParser:
    """
    LLM Call 1: Analyzes raw multi-page tender text or uploaded PDF clauses,
    decomposes them into structured procurement line items, and generates clean search queries.
    Uses the unified LLM Gateway with demand rotation.
    """
    def parse_raw_tender_text(self, document_text: str) -> TenderDocumentAnalysis:
        """
        Decomposes raw tender document text into structured procurement items.
        Calls LLM Gateway with TENDER_DECOMPOSITION demand.
        """
        clean_text = document_text.strip()
        result_dict = llm_gateway.call(
            LLMTaskType.TENDER_DECOMPOSITION,
            document_text=clean_text
        )
        return TenderDocumentAnalysis.model_validate(result_dict)
