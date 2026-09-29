#!/usr/bin/env python3
"""
Feature #10: Standalone PDF / Text Tender Document Parser and IS Version Diff Engine
Extracts technical specification clauses, Bill of Quantities (BoQ) items, identifies cited IS numbers,
detects outdated or withdrawn standards, and recommends latest revisions with legal QCO backing.
Includes page-aware extraction, verbatim quote mapping for PDF highlighter, and GraphRAG connection.
"""

import sys
import os
import re
import json
import io
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

BASE_DIR = Path(__file__).parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.rag_engine.pdf_parser import (
    PDFTenderExtractor,
    pdf_tender_extractor,
    extract_text_from_pdf,
    make_pdf_part
)
from pipeline.config.api_contract_models import StandardsResponse

DATA_DIR = BASE_DIR / "pipeline" / "data" if (BASE_DIR / "pipeline" / "data").exists() else BASE_DIR / "data"
CATALOG_PATH = DATA_DIR / "01_master_catalog" / "unified_standards.json"
QCO_PATH = DATA_DIR / "03_regulatory_qco" / "qco_mapping_matrix.json"


def extract_pages(pdf_bytes: bytes) -> List[str]:
    """Extracts an array of page text strings from PDF bytes."""
    return pdf_tender_extractor.extract_pages(pdf_bytes)


def extract_clause_annotations(pdf_bytes: bytes) -> List[Dict[str, Any]]:
    """Extracts structured clause annotations with verbatim quotes and page numbers for PDF highlighting."""
    return pdf_tender_extractor.extract_clause_annotations(pdf_bytes)


def extract_and_analyse(
    pdf_bytes: bytes,
    role: str = "PROCUREMENT_OFFICER",
    mode: str = "recommend"
) -> List[StandardsResponse]:
    """
    Full pipeline execution:
    1. Extracts clean text and pages from PDF bytes.
    2. Decomposes multi-clause items via GraphRAG pipeline.
    3. Runs multi-channel retrieval and returns StandardsResponse list.
    """
    return pdf_tender_extractor.extract_and_analyse(
        pdf_bytes=pdf_bytes,
        role=role,
        mode=mode
    )


class TenderPDFParser:
    def __init__(self):
        self.catalog = self._load_json(CATALOG_PATH)
        self.qco_matrix = self._load_json(QCO_PATH)
        self.standards_by_num = {}
        for r in self.catalog:
            norm = self._norm_key(r.get("is_number", ""))
            self.standards_by_num[norm] = r

    @staticmethod
    def _load_json(path: Path) -> Any:
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    @staticmethod
    def _norm_key(is_num: str) -> str:
        s = str(is_num).upper().strip()
        s = re.sub(r'\s*:\s*\d{4}', '', s)
        s = re.sub(r'[^A-Z0-9]', '', s)
        return s

    def parse_document_text(self, document_text: str) -> Dict[str, Any]:
        """
        Parses tender document text and returns structured audit with citations, outdated flags,
        and recommendations.
        """
        pattern = r'(?:IS|IS/ISO|IS/IEC|SP)\s*(?:[:\s]\s*(\d+(?:\s*\([A-Za-z0-9/\s]+\))?))(?:\s*:\s*(\d{4}))?'
        
        matches = re.finditer(pattern, document_text, re.IGNORECASE)
        citations_found = []
        seen_keys = set()

        for m in matches:
            full_match = m.group(0).strip()
            num_part = m.group(1).strip() if m.group(1) else ""
            year_part = m.group(2).strip() if (m.lastindex and m.lastindex >= 2 and m.group(2)) else None
            
            is_num_clean = f"IS {num_part}".strip()
            norm = self._norm_key(is_num_clean)
            
            if norm in seen_keys:
                continue
            seen_keys.add(norm)

            master_record = self.standards_by_num.get(norm)
            
            latest_year = master_record.get("year_published") if master_record else None
            latest_id = master_record.get("standard_id", is_num_clean) if master_record else is_num_clean
            title = master_record.get("title", f"Standard Specification {is_num_clean}") if master_record else "Unindexed Standard"
            is_mandatory = master_record.get("regulatory_compliance", {}).get("is_mandatory", False) if master_record else False

            is_outdated = False
            outdated_reason = None

            if year_part and latest_year:
                try:
                    cited_yr = int(year_part)
                    if cited_yr < latest_year:
                        is_outdated = True
                        outdated_reason = f"Cites {year_part} version. Latest published version is {latest_id} (Rev {master_record.get('edition', '')})."
                except ValueError:
                    pass

            if norm == "IS8112" or norm == "IS12269":
                is_outdated = True
                outdated_reason = "Standard was superseded and merged into unified IS 269:2015."
                latest_id = "IS 269:2015"
            elif norm == "IS780":
                is_outdated = True
                outdated_reason = "Withdrawn and replaced by IS 14846:2000."
                latest_id = "IS 14846:2000"
            elif norm == "IS1786" and year_part and int(year_part) < 2008:
                is_outdated = True
                outdated_reason = f"Cites {year_part} version. Latest published version is IS 1786:2008."
                latest_id = "IS 1786:2008"
            elif norm == "IS4984" and year_part and int(year_part) < 2016:
                is_outdated = True
                outdated_reason = f"Cites {year_part} version. Latest published version is IS 4984:2016."
                latest_id = "IS 4984:2016"

            qco_order = None
            if norm in self.qco_matrix or is_mandatory:
                qco_order = "Compulsory BIS Certification under Quality Control Order (QCO)"

            citations_found.append({
                "cited_text": full_match,
                "is_number": is_num_clean,
                "cited_year": year_part,
                "latest_standard_id": latest_id,
                "standard_title": title,
                "is_outdated": is_outdated,
                "outdated_warning": outdated_reason,
                "qco_mandate": qco_order,
                "is_mandatory": is_mandatory or (norm in self.qco_matrix)
            })

        outdated_count = sum(1 for c in citations_found if c["is_outdated"])
        mandatory_count = sum(1 for c in citations_found if c["is_mandatory"])

        use_discard_matrix = []
        for c in citations_found:
            if c["is_outdated"]:
                use_discard_matrix.append({
                    "discard": c["cited_text"],
                    "use": c["latest_standard_id"],
                    "reason": c["outdated_warning"],
                    "action": "DISCARD_AND_REPLACE"
                })

        return {
            "total_citations_found": len(citations_found),
            "outdated_citations_count": outdated_count,
            "mandatory_qco_count": mandatory_count,
            "citations": citations_found,
            "use_discard_matrix": use_discard_matrix,
            "audit_verdict": "ACTION_REQUIRED" if outdated_count > 0 else "COMPLIANT",
            "recommended_amendments_summary": [
                f"Replace '{c['cited_text']}' with '{c['latest_standard_id']}' ({c['outdated_warning']})"
                for c in citations_found if c["is_outdated"]
            ]
        }


def main():
    if len(sys.argv) > 1:
        filepath = Path(sys.argv[1])
        if filepath.exists():
            text = filepath.read_text(encoding="utf-8")
        else:
            text = " ".join(sys.argv[1:])
    else:
        text = """
        TENDER FOR HIGHWAY FLYOVER:
        1. Cement shall be 43 Grade OPC conforming to IS 8112:1989.
        2. Reinforcement steel shall be Fe 415 TMT bars conforming to IS 1786:1985.
        3. Plain concrete shall conform to IS 456:2000.
        4. Coarse aggregates shall adhere to IS 383:1970.
        5. Water pipes shall be heavy GI conforming to IS 1239 (Part 1):1990.
        """

    parser = TenderPDFParser()
    result = parser.parse_document_text(text)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
