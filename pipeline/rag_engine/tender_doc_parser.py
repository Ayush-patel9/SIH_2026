import re
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from pipeline.rag_engine.llm_gateway import llm_gateway

logger = logging.getLogger(__name__)

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

class TenderDocParser:
    """
    LLM Call 1: Analyzes raw multi-page tender text or uploaded PDF clauses,
    decomposes them into structured procurement line items, and generates clean search queries.
    """
    def __init__(self):
        # Common BIS acronym dictionary for deterministic expansion
        self.acronym_expansions = {
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

    def parse_raw_tender_text(self, document_text: str) -> TenderDocumentAnalysis:
        """
        Decomposes raw tender document text into structured procurement items.
        """
        clean_text = document_text.strip()

        # Check if LLM Gateway is available for intelligent decomposition
        if llm_gateway.is_available():
            try:
                prompt = (
                    f"Analyze the following procurement tender document text:\n\n"
                    f"\"\"\"\n{clean_text[:4000]}\n\"\"\"\n\n"
                    f"Task:\n"
                    f"1. Extract all individual goods/materials/products being procured.\n"
                    f"2. For each item, extract: product_name, grade_specification, application_domain, "
                    f"any explicitly cited Indian Standards (cited_standards), and a clean_search_query optimized for BIS standard retrieval.\n"
                    f"Output strict JSON conforming to TenderDocumentAnalysis schema."
                )
                res = llm_gateway.generate_json(prompt, schema=TenderDocumentAnalysis, model_type="flash")
                return TenderDocumentAnalysis.model_validate(res)
            except Exception as e:
                logger.info(f"Using rule-based tender decomposition fallback: {e}")

        # Deterministic Fallback Clause Splitter
        paragraphs = [p.strip() for p in re.split(r"\n{2,}|\b(?=Item\s*\d+:|Clause\s*\d+:|\d+\.\s+[A-Z])", clean_text) if len(p.strip()) > 15]
        if not paragraphs:
            paragraphs = [clean_text]

        items: List[ExtractedTenderItem] = []
        item_idx = 1
        for para in paragraphs:
            # Skip pure document headers / titles
            if re.match(r"^(?:NOTICE\s+INVITING\s+TENDER|NIT\s+NO|TENDER\s+DOCUMENT|GOVERNMENT\s+OF|INVITATION\s+FOR\s+BIDS)", para, re.IGNORECASE):
                continue

            # Expand acronyms
            expanded_query = para
            for pat, repl in self.acronym_expansions.items():
                expanded_query = re.sub(pat, repl, expanded_query, flags=re.IGNORECASE)

            # Extract any cited IS numbers
            cited = re.findall(r"\b(?:IS|SP|IS/ISO|IS/IEC)\s*\d{2,5}(?:\s*:\s*\d{4})?", para, re.IGNORECASE)
            cited_clean = [re.sub(r"\s+", " ", c).strip().upper() for c in cited]

            # Extract simple product name
            product_guess = re.sub(r"\b(procurement|supply|purchase|tender|of|for|the|and|in|mandatory|as per|conforming to|item\s*\d+:?)\b", " ", para[:120], flags=re.IGNORECASE)
            product_guess = re.sub(r"\s+", " ", product_guess).strip()

            items.append(ExtractedTenderItem(
                item_index=item_idx,
                raw_clause_text=para,
                product_name=product_guess[:80] or f"Procurement Item {item_idx}",
                clean_search_query=expanded_query[:150],
                cited_standards=cited_clean
            ))
            item_idx += 1

        return TenderDocumentAnalysis(
            tender_title="Procurement Specification Document",
            issuing_authority="Government Procurement Entity",
            extracted_items=items
        )
