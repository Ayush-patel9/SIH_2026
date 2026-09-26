#!/usr/bin/env python3
"""
pdf_parser.py
PDF Standards & Tender Extractor Engine.
Extracts clean, structured clause text, tables, scopes, test methods, and certification marks from
uploaded tender documents (PDF format) and connects directly to GraphRAGPipeline.
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

# Section header regex patterns for BIS standards and Government tenders
SCOPE_PATTERNS = [
    r'(?:^|\n)1\s+SCOPE\s*\n(.*?)(?=\n\d+\s+[A-Z]|\Z)',
    r'(?:^|\n)SCOPE\s*\n(.*?)(?=\n[A-Z]|\Z)',
    r'(?:^|\n)1\.\s+SCOPE\s*\n(.*?)(?=\n\d+\.|\Z)'
]

REQUIREMENTS_PATTERNS = [
    r'(?:^|\n)\d+\s+REQUIREMENTS?\s*\n(.*?)(?=\n\d+\s+[A-Z]|\Z)',
    r'(?:^|\n)\d+\s+PHYSICAL REQUIREMENTS?\s*\n(.*?)(?=\n\d+\s+[A-Z]|\Z)',
    r'(?:^|\n)\d+\s+TECHNICAL SPECIFICATIONS?\s*\n(.*?)(?=\n\d+\s+[A-Z]|\Z)'
]

TEST_METHOD_IS_PATTERN = re.compile(r'\b(?:IS|SP|IS/ISO|IS/IEC)\s*(\d{2,5}(?:\s*\(Part\s*\d+\))?(?:\s*:\s*\d{4})?)', re.IGNORECASE)


class PDFTenderExtractor:
    """
    Extracts text, structured sections (Scope, Requirements, Test Methods, Definitions, Certification Marks),
    and table schedules from PDF tender documents.
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

        # Attempt 1: pdfplumber (best for multi-column layout & table schedules)
        if PDFPLUMBER_AVAILABLE:
            try:
                with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                    for idx, page in enumerate(pdf.pages):
                        tables = page.extract_tables()
                        table_text = ""
                        if tables:
                            for table in tables:
                                for row in table:
                                    cleaned_row = [str(c).strip() for c in row if c is not None and str(c).strip()]
                                    if cleaned_row:
                                        table_text += " | ".join(cleaned_row) + "\n"

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

        if not extracted_pages:
            raise ValueError(
                "Unable to extract text from PDF. The document may be a scanned image without an embedded OCR text layer."
            )

        return "\n".join(extracted_pages)

    def extract_structured_sections(self, text: str) -> Dict[str, Any]:
        """
        Extracts key sections: Scope, Technical Requirements, Referenced Test Standards,
        Definitions, and Quality Certification Markings.
        """
        return {
            "is_number": self._extract_is_number_from_header(text),
            "scope": self._extract_scope(text),
            "requirements": self._extract_requirements(text),
            "test_methods": self._extract_test_methods(text),
            "definitions": self._extract_definitions(text),
            "certification": self._extract_certification_marks(text)
        }

    def _clean_and_structure_text(self, text: str) -> str:
        """Cleans header/footer artifacts and normalizes clause numbering."""
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"(?:--- PAGE BREAK ---\n?)+", "\n\n", text)
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    def _extract_is_number_from_header(self, text: str) -> Optional[str]:
        """Extracts standard citation from document header."""
        m = re.search(r'\b(?:IS|SP|IS/ISO|IS/IEC)\s*(\d{2,5}(?:\s*\(Part\s*\d+\))?(?:\s*:\s*\d{4})?)', text[:2000], re.IGNORECASE)
        if m:
            return f"IS {m.group(1)}".strip()
        return None

    def _extract_scope(self, text: str) -> str:
        """Extracts the Scope section."""
        for pattern in SCOPE_PATTERNS:
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if m:
                clean = re.sub(r'\s+', ' ', m.group(1).strip())
                return clean[:2000]
        lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 50]
        return lines[0] if lines else "Scope specified in technical schedule."

    def _extract_requirements(self, text: str) -> str:
        """Extracts Technical Requirements section."""
        for pattern in REQUIREMENTS_PATTERNS:
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if m:
                return re.sub(r'\n+', '\n', m.group(1).strip()[:3000])
        return "Conforms to technical schedule requirements."

    def _extract_test_methods(self, text: str) -> List[Dict[str, str]]:
        """Extracts referenced test method standards with context."""
        results = []
        seen = set()
        for m in TEST_METHOD_IS_PATTERN.finditer(text):
            is_ref = m.group(0).strip().upper()
            is_ref = re.sub(r'\s+', ' ', is_ref)
            if is_ref not in seen:
                seen.add(is_ref)
                start = max(0, m.start() - 80)
                end = min(len(text), m.end() + 80)
                context = text[start:end].replace('\n', ' ').strip()
                results.append({
                    "is_number": is_ref,
                    "context": context[:160]
                })
        return results[:10]

    def _extract_definitions(self, text: str) -> List[Dict[str, str]]:
        """Extracts defined engineering terms."""
        definitions = []
        defn_section = re.search(r'DEFINITIONS?(.*?)(?=\n\d+\s+[A-Z]|\Z)', text, re.DOTALL | re.IGNORECASE)
        if defn_section:
            defn_text = defn_section.group(1)
            for m in re.finditer(r'([A-Z][a-z\s]+)\s*[—–-]\s*(.+?)(?=\n[A-Z]|\Z)', defn_text, re.DOTALL):
                definitions.append({
                    "term": m.group(1).strip(),
                    "definition": m.group(2).strip()[:300]
                })
        return definitions[:15]

    def _extract_certification_marks(self, text: str) -> Dict[str, Any]:
        """Extracts BIS certification mark and QCO info."""
        has_isi = bool(re.search(r'ISI\s*Mark|Standard\s*Mark|BIS\s*Licen[cs]e|CM/L', text, re.IGNORECASE))
        has_crs = bool(re.search(r'CRS|R-Number|Compulsory\s*Registration', text, re.IGNORECASE))
        has_qco = bool(re.search(r'Quality\s*Control\s*Order|QCO', text, re.IGNORECASE))
        qco_match = re.search(r'([\w\s]+Quality\s+Control\s+Order[\w\s,()]*\d{4})', text)

        return {
            "has_isi_mark": has_isi,
            "has_crs": has_crs,
            "has_qco_reference": has_qco,
            "qco_name": qco_match.group(1).strip() if qco_match else None,
            "mandatory": has_isi or has_crs or has_qco,
            "scheme": "BIS_CRS" if has_crs else ("BIS_ISI_MARK" if has_isi else "VOLUNTARY")
        }

    def extract_and_analyse(
        self,
        pdf_bytes: bytes,
        role: str = "PROCUREMENT_OFFICER",
        mode: str = "recommend"
    ) -> List[StandardsResponse]:
        """
        Full End-to-End Pipeline:
        PDF bytes -> Clean Text -> Clause & Section Decomposition -> GraphRAG Analysis -> StandardsResponse[].
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
