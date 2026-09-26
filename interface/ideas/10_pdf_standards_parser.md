# Feature 10 — PDF Standards Parser
## Offline IS Document Processing · Section Extractor · Clause Highlighter

---

## WHY THIS EXISTS

The actual IS document PDFs (IS 269:2015, IS 1786:2008, etc.) are sold by BIS and are in the possession of government departments. Officers sometimes need to cross-reference the AI recommendation with the actual clause text. But IS PDFs are dense, multi-page documents in two-column BIS format. This standalone Python script ingests a BIS standards PDF and extracts key sections — scope, definitions, requirements, test methods, certification marks — outputting them as structured JSON that can feed back into the application.

---

## WHAT IT IS

A standalone Python CLI script in `application/pdf_parser/`. It takes a BIS PDF file as input and produces a structured JSON output that conforms to the `StandardsResponse` schema (specifically the `scope_snippet`, `test_methods`, and `allied_standards` sections). **No API calls. No pipeline dependency. Pure file-processing.**

---

## KEY INSIGHT

PyMuPDF (`fitz`) can extract text from most BIS PDFs. The text extraction is imperfect (due to two-column layout and scanned pages), but the key sections (Scope, Requirements, Test Methods) always appear at predictable positions in BIS documents and can be extracted reliably with simple text search patterns.

---

## SCRIPT STRUCTURE

```
application/pdf_parser/
├── parse_bis_pdf.py        ← Main CLI script
├── section_extractors.py   ← Section-specific extraction functions
├── bis_patterns.py         ← Regex patterns for BIS document structure
├── output_formatter.py     ← Format extracted data as StandardsResponse-compatible JSON
├── requirements.txt        ← pymupdf (fitz), pdfplumber, click
└── README.md               ← Usage instructions
```

---

## COMPONENT 1 — `parse_bis_pdf.py` (CLI Entry Point)

```python
#!/usr/bin/env python3
"""
parse_bis_pdf.py
================
Standalone CLI to extract structured information from a BIS Indian Standard PDF.

Usage:
    python parse_bis_pdf.py --input IS_269_2015.pdf --output IS_269_2015_parsed.json
    python parse_bis_pdf.py --input IS_269_2015.pdf --sections scope,requirements,test_methods
    python parse_bis_pdf.py --input IS_269_2015.pdf --is-number IS269 --dry-run

Output:
    A JSON file conforming to the interface/contract_schema.json partial shape.
"""

import click
import json
import sys
from pathlib import Path
from section_extractors import (
    extract_scope, extract_requirements, extract_test_methods,
    extract_definitions, extract_certification_marks, extract_is_number_from_header
)
from output_formatter import format_as_contract_json

@click.command()
@click.option('--input', '-i', required=True, type=click.Path(exists=True), help='Path to BIS PDF file')
@click.option('--output', '-o', default=None, help='Output JSON path (default: same name as input with .json)')
@click.option('--is-number', default=None, help='Override IS number (auto-detected from PDF if not provided)')
@click.option('--sections', default='all', help='Comma-separated sections to extract: scope,requirements,test_methods,definitions,certification')
@click.option('--dry-run', is_flag=True, help='Print extracted text without writing output file')
def main(input, output, is_number, sections, dry_run):
    input_path = Path(input)
    output_path = Path(output) if output else input_path.with_suffix('.json')
    sections_to_extract = sections.split(',') if sections != 'all' else ['scope', 'requirements', 'test_methods', 'definitions', 'certification']

    click.echo(f"🔍 Processing: {input_path.name}")

    try:
        import fitz  # PyMuPDF
        doc = fitz.open(str(input_path))
    except ImportError:
        click.echo("❌ PyMuPDF not installed. Run: pip install pymupdf")
        sys.exit(1)

    # Extract raw text from all pages
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + "\n"
    doc.close()

    # Extract IS number from header if not provided
    detected_is_number = is_number or extract_is_number_from_header(full_text)
    click.echo(f"📋 Detected IS number: {detected_is_number}")

    # Extract sections
    extracted = {}
    if 'scope' in sections_to_extract:
        extracted['scope'] = extract_scope(full_text)
        click.echo(f"  ✓ Scope extracted ({len(extracted['scope'])} chars)")
    if 'requirements' in sections_to_extract:
        extracted['requirements'] = extract_requirements(full_text)
        click.echo(f"  ✓ Requirements extracted ({len(extracted['requirements'])} chars)")
    if 'test_methods' in sections_to_extract:
        extracted['test_methods'] = extract_test_methods(full_text)
        click.echo(f"  ✓ Test methods extracted ({len(extracted['test_methods'])} items)")
    if 'definitions' in sections_to_extract:
        extracted['definitions'] = extract_definitions(full_text)
    if 'certification' in sections_to_extract:
        extracted['certification'] = extract_certification_marks(full_text)

    # Format as partial StandardsResponse JSON
    result = format_as_contract_json(extracted, detected_is_number)

    if dry_run:
        click.echo("\n--- DRY RUN OUTPUT ---")
        click.echo(json.dumps(result, indent=2))
        return

    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)
    click.echo(f"\n✅ Output written to: {output_path}")

if __name__ == '__main__':
    main()
```

---

## COMPONENT 2 — `section_extractors.py`

```python
import re
from typing import List, Dict, Any

# BIS documents always have these section headers in predictable formats
SCOPE_PATTERNS = [
    r'(?:^|\n)1\s+SCOPE\s*\n(.*?)(?=\n\d+\s+[A-Z])',
    r'(?:^|\n)SCOPE\s*\n(.*?)(?=\n[A-Z])',
]

REQUIREMENTS_PATTERNS = [
    r'(?:^|\n)\d+\s+REQUIREMENTS?\s*\n(.*?)(?=\n\d+\s+[A-Z])',
    r'(?:^|\n)\d+\s+PHYSICAL REQUIREMENTS?\s*\n(.*?)(?=\n\d+\s+[A-Z])',
]

TEST_METHOD_IS_PATTERN = re.compile(r'IS\s*(\d+)\s*(?:\(Part\s*\d+\))?\s*(?::\s*\d{4})?')

def extract_is_number_from_header(text: str) -> str:
    """Extracts IS number from the first page header of a BIS document."""
    patterns = [
        r'IS\s*(\d+(?:\s*\(Part\s*\d+\))?)\s*:\s*(\d{4})',
        r'INDIAN STANDARD\s+IS\s*(\d+)',
    ]
    for p in patterns:
        m = re.search(p, text[:2000])  # Only check first 2000 chars
        if m:
            return f"IS {m.group(1)}:{m.group(2) if m.lastindex >= 2 else ''}"
    return "IS_UNKNOWN"

def extract_scope(text: str) -> str:
    """Extracts the Scope section from a BIS document."""
    for pattern in SCOPE_PATTERNS:
        m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if m:
            scope_text = m.group(1).strip()
            # Clean up BIS formatting artifacts
            scope_text = re.sub(r'\n+', ' ', scope_text)
            scope_text = re.sub(r'\s{2,}', ' ', scope_text)
            return scope_text[:2000]  # Cap at 2000 chars
    # Fallback: first paragraph after title
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 50]
    return lines[0] if lines else "Scope not extractable from this PDF."

def extract_test_methods(text: str) -> List[Dict[str, Any]]:
    """Extracts all referenced IS test method standards from the document."""
    found = set()
    for m in TEST_METHOD_IS_PATTERN.finditer(text):
        is_ref = m.group(0).strip()
        if 'Test' in text[max(0, m.start()-100):m.end()+100] or 'Method' in text[max(0, m.start()-100):m.end()+100]:
            found.add(is_ref)

    # Get context for each reference (what test it's for)
    results = []
    for is_ref in found:
        context_match = re.search(
            rf'(.{{0,80}}){re.escape(is_ref)}(.{{0,80}})',
            text
        )
        context = (context_match.group(1) + context_match.group(2)).strip() if context_match else ''
        results.append({
            "is_number": is_ref,
            "context": context[:160],
        })

    return results

def extract_requirements(text: str) -> str:
    """Extracts the Requirements section."""
    for pattern in REQUIREMENTS_PATTERNS:
        m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if m:
            req_text = m.group(1).strip()[:3000]
            req_text = re.sub(r'\n+', '\n', req_text)
            return req_text
    return "Requirements section not extractable from this PDF."

def extract_definitions(text: str) -> List[Dict[str, str]]:
    """Extracts defined terms from the Definitions section."""
    definitions = []
    defn_section = re.search(r'DEFINITIONS?(.*?)(?=\n\d+\s+[A-Z])', text, re.DOTALL | re.IGNORECASE)
    if defn_section:
        defn_text = defn_section.group(1)
        # BIS definitions follow: "term — definition text"
        for m in re.finditer(r'([A-Z][a-z\s]+)\s*[—–-]\s*(.+?)(?=\n[A-Z]|\Z)', defn_text, re.DOTALL):
            definitions.append({
                "term": m.group(1).strip(),
                "definition": m.group(2).strip()[:400],
            })
    return definitions[:20]  # Limit to 20 definitions

def extract_certification_marks(text: str) -> Dict[str, Any]:
    """Extracts BIS certification mark information from the document."""
    has_isi = bool(re.search(r'ISI\s+Mark|Standard\s+Mark|BIS\s+Licence|CM/L', text, re.IGNORECASE))
    has_crs = bool(re.search(r'CRS|R-Number|Compulsory Registration', text, re.IGNORECASE))
    has_qco = bool(re.search(r'Quality\s+Control\s+Order|QCO', text, re.IGNORECASE))
    qco_match = re.search(r'([\w\s]+Quality\s+Control\s+Order[\w\s,()]*\d{4})', text)

    return {
        "has_isi_mark": has_isi,
        "has_crs": has_crs,
        "has_qco_reference": has_qco,
        "qco_name": qco_match.group(1).strip() if qco_match else None,
        "mandatory": has_isi or has_crs,
        "scheme": "ISI_MARK" if has_isi else ("CRS" if has_crs else "VOLUNTARY"),
    }
```

---

## COMPONENT 3 — `output_formatter.py`

```python
def format_as_contract_json(extracted: dict, is_number: str) -> dict:
    """
    Formats extracted PDF data as a partial StandardsResponse-compatible JSON.
    This output can be merged with the primary adapter output to enrich
    the scope_snippet, test_methods, and allied_standards fields.
    """
    return {
        "_source": "pdf_parser",
        "_is_number": is_number,
        "_partial": True,  # Signal to adapter that this is an enrichment, not a full response
        "scope_snippet": extracted.get('scope', '')[:500],
        "scope_full": extracted.get('scope', ''),
        "requirements_full": extracted.get('requirements', ''),
        "definitions": extracted.get('definitions', []),
        "test_methods_extracted": extracted.get('test_methods', []),
        "certification": extracted.get('certification', {}),
    }
```

---

## INTEGRATION WITH MAIN APPLICATION

When the PDF parser output is available, it can enrich the fixture/adapter response:
```js
// In the frontend:
async function loadEnrichedResponse(baseResponse, pdfParserOutputPath) {
  try {
    const pdfData = await fetch(pdfParserOutputPath).then(r => r.json());
    if (pdfData._partial) {
      return {
        ...baseResponse,
        primary_recommendation: {
          ...baseResponse.primary_recommendation,
          scope_snippet: pdfData.scope_snippet || baseResponse.primary_recommendation.scope_snippet,
          test_methods: pdfData.test_methods_extracted.length > 0
            ? pdfData.test_methods_extracted.map(t => ({ is_number: t.is_number, parameter: t.context }))
            : baseResponse.primary_recommendation.test_methods,
        }
      };
    }
  } catch { /* fallback to base response */ }
  return baseResponse;
}
```

---

## USAGE EXAMPLES

```bash
# Basic usage
python parse_bis_pdf.py --input IS_269_2015.pdf

# Extract only scope and test methods
python parse_bis_pdf.py --input IS_269_2015.pdf --sections scope,test_methods

# Dry run (print output, don't write file)
python parse_bis_pdf.py --input IS_269_2015.pdf --dry-run

# Override IS number (useful for scanned PDFs where header is an image)
python parse_bis_pdf.py --input cement_standard.pdf --is-number "IS 269:2015"
```

---

## WHAT NOT TO BUILD HERE

- ❌ Do not use OCR for scanned PDFs (out of scope — text-based PDFs only)
- ❌ Do not call any cloud vision API
- ❌ Do not import anything from `pipeline/`
- ❌ Do not build a web UI for this — it is purely a CLI tool
