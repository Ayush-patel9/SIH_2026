#!/usr/bin/env python3
"""
pdf_parser.py
PDF Tender Extractor & Decomposition Engine.
Extracts clean, structured clause text and table schedules from uploaded tender documents (PDF format)
and pipelines them through GraphRAGPipeline.process_tender_document().
"""

import io
import re
import logging
from typing import List, Dict, Any, Optional

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

from pipeline.config.api_contract_models import StandardsResponse
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

logger = logging.getLogger(__name__)


class PDFTenderExtractor:
    """
    Extracts text, clauses, and tables from PDF tender documents,
    handling structural formatting, scanned-document fallbacks, and multi-item extraction.
    """
    def __init__(self):
        logger.info("Initializing PDF Tender Extractor (pdfplumber: %s, pypdf: %s)", PDFPLUMBER_AVAILABLE, PYPDF_AVAILABLE)

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """
        Extract raw text preserving clause structure and table contents.
        """
        if not pdf_bytes or len(pdf_bytes) == 0:
            raise ValueError("Empty PDF byte stream provided.")

        extracted_pages: List[str] = []

        # Attempt 1: pdfplumber (best for tables & layout)
        if PDFPLUMBER_AVAILABLE:
            try:
                with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                    for idx, page in enumerate(pdf.pages):
                        # Extract table text
                        tables = page.extract_tables()
                        table_text = ""
                        if tables:
                            for table in tables:
                                for row in table:
                                    cleaned_row = [str(c).strip() for c in row if c is not None and str(c).strip()]
                                    if cleaned_row:
                                        table_text += " | ".join(cleaned_row) + "\n"

                        # Extract regular text
                        page_text = page.extract_text(layout=False) or ""
                        
                        combined = ""
                        if page_text.strip():
                            combined += page_text + "\n"
                        if table_text.strip():
                            combined += "\n[TABLE SCHEDULE]\n" + table_text + "\n"

                        if combined.strip():
                            extracted_pages.append(combined)

                if extracted_pages:
                    full_text = "\n--- PAGE BREAK ---\n".join(extracted_pages)
                    return self._clean_and_structure_text(full_text)
            except Exception as e:
                logger.warning(f"pdfplumber extraction failed, attempting pypdf fallback: {e}")

        # Attempt 2: pypdf fallback
        if PYPDF_AVAILABLE:
            try:
                reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                for page in reader.pages:
                    txt = page.extract_text() or ""
                    if txt.strip():
                        extracted_pages.append(txt)

                if extracted_pages:
                    full_text = "\n".join(extracted_pages)
                    return self._clean_and_structure_text(full_text)
            except Exception as e:
                logger.error(f"pypdf extraction also failed: {e}")

        # If no extractable text found, it is likely a scanned image PDF
        if not extracted_pages:
            raise ValueError(
                "Unable to extract text from PDF. The document may be a scanned image without an embedded OCR text layer."
            )

        return "\n".join(extracted_pages)

    def _clean_and_structure_text(self, text: str) -> str:
        """
        Cleans header/footer artifacts and normalizes clause numbering.
        """
        # Normalize carriage returns and multiple newlines
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Remove consecutive page breaks
        text = re.sub(r"(?:--- PAGE BREAK ---\n?)+", "\n\n", text)
        # Fix fragmented words split across lines
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
        # Collapse excessive whitespace
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    def extract_and_analyse(
        self,
        pdf_bytes: bytes,
        role: str = "PROCUREMENT_OFFICER",
        mode: str = "recommend"
    ) -> List[StandardsResponse]:
        """
        End-to-End Pipeline: PDF bytes -> Clean Text -> Clause Decomposition -> GraphRAG Analysis -> StandardsResponse[].
        """
        clean_text = self.extract_text_from_pdf(pdf_bytes)
        if not clean_text or len(clean_text.strip()) < 10:
            raise ValueError("Extracted PDF text is too short to analyze for procurement standards.")

        return graph_rag_pipeline.process_tender_document(
            document_text=clean_text,
            role=role,
            mode=mode
        )


# Singleton Instance
pdf_tender_extractor = PDFTenderExtractor()


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Convenience helper for extracting raw text from PDF bytes."""
    return pdf_tender_extractor.extract_text_from_pdf(pdf_bytes)


def extract_and_analyse(
    pdf_bytes: bytes,
    role: str = "PROCUREMENT_OFFICER",
    mode: str = "recommend"
) -> List[StandardsResponse]:
    """Convenience helper for full PDF -> StandardsResponse[] analysis."""
    return pdf_tender_extractor.extract_and_analyse(pdf_bytes, role=role, mode=mode)
