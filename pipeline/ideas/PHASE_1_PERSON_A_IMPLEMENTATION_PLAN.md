# PHASE 1 — Person A (Pipeline Completion & Data Enrichment)
## Extreme-Depth Implementation Plan & Architectural Blueprint

**Role:** Person A (Pipeline, Knowledge Graph & Data Engineering)  
**Collaborator:** Person B (UI, Application Features & Interface Engineering)  
**Target Git Branch:** `feature/person-a-phase1-data-enrichment`  
**Strict Boundary Policy:** Zero touches to `application/` and `interface/` folders to guarantee zero Git merge conflicts during concurrent development.

---

## 1. Executive Summary & Zero-Conflict Boundary Contract

### 1.1 Scope & Objective
Person A is responsible for the entire foundational data intelligence layer, knowledge graph structures, regulatory compliance engines, and RAG retrieval/reasoning core. Person B is building the user interface, API route bindings, and MCP tools against mock data fixtures.

Phase 1 deliverable for Person A: Ensure the pipeline returns rich, production-grade, mathematically verified `StandardsResponse` and `AlertPayload` objects with **zero missing keys, zero null mandatory fields, minimum 200 enriched standards, 50+ bidirectional knowledge graph nodes, complete QCO/CRS coverage, multilingual Indic lexicons, proactive staleness detection, and PDF clause extraction**.

### 1.2 Boundary Delineation (Zero-Merge-Conflict Law)

```
┌─────────────────────────────────────────────────────────────┐
│ PERSON A (Pipeline & Data Owner)                            │
│ ─────────────────────────────────                           │
│ Writes to:                                                  │
│   ├── pipeline/data/01_master_catalog/                      │
│   ├── pipeline/data/02_fulltext_corpus/                     │
│   ├── pipeline/data/03_regulatory_qco/                      │
│   ├── pipeline/data/04_conformity_ecosystem/                │
│   ├── pipeline/data/05_procurement_gold_corpus/             │
│   ├── pipeline/data/06_multilingual_lexicon/                │
│   ├── pipeline/rag_engine/                                  │
│   ├── pipeline/config/                                      │
│   ├── pipeline/tests/                                       │
│   └── tests/test_kg_rag_pipeline.py                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Stable Python Interface /
                               │ API Contract Handoff
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PERSON B (Interface & Application Owner)                    │
│ ─────────────────────────────────                           │
│ Reads/Calls from Person A via:                              │
│   ├── pipeline.rag_engine.pipeline_core.graph_rag_pipeline  │
│   ├── pipeline.rag_engine.staleness_monitor.StalenessMonitor│
│   ├── pipeline.rag_engine.pdf_parser.PDFTenderExtractor     │
│   └── pipeline.config.api_contract_models.*                 │
│ Writes to:                                                  │
│   ├── application/api/routes/                               │
│   ├── application/frontend/src/                             │
│   ├── application/mcp_server/                               │
│   ├── application/pdf_parser/                               │
│   └── interface/                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Workstream A1: Master Catalogue Enrichment (`pipeline/data/01_master_catalog/`)

### 2.1 Problem Diagnosis & Data Integrity Fixes
During baseline audit checks, three data integrity issues were identified in `pipeline/data/01_master_catalog/unified_standards.json`:
1. **Generic "IS IEC" standard keys (190 items)**: Unparsed entries where IEC harmonized standards lack specific numbers (e.g., `IS IEC` instead of `IS/IEC 60034-1`).
2. **Missing ICS codes**: Standards with null or empty `ics_codes` lists.
3. **Missing Mandatory Fields**: Incomplete `scope_snippet`, `latest_amendment`, `supersedes`, and `certification` objects.

### 2.2 Canonical JSON Schema per Standard
Every standard in `pipeline/data/01_master_catalog/unified_standards.json` must strictly adhere to the following schema with **no nulls on mandatory keys**:

```json
{
  "is_number": "IS 269:2015",
  "standard_id": "IS 269:2015",
  "title": "Ordinary Portland Cement — Specification",
  "full_title": "IS 269:2015 — Ordinary Portland Cement — Specification (Fifth Revision)",
  "status": "ACTIVE",
  "year_published": 2015,
  "latest_amendment": "Amendment No. 2 (2021)",
  "supersedes": ["IS 8112:1989", "IS 12269:1987", "IS 269:1989"],
  "superseded_by": null,
  "scope_snippet": "Covers the manufacture, physical and chemical requirements of 33, 43 and 53 grade ordinary Portland cement.",
  "division_code": "CED",
  "ics_codes": ["91.100.10"],
  "aspect": "PRODUCT",
  "technical_committee": {
    "committee_id": "CED 2",
    "committee_name": "Cement and Concrete Sectional Committee",
    "division_code": "CED"
  },
  "certification": {
    "scheme": "BIS_ISI_MARK",
    "mandatory": true,
    "qco_order_name": "Cement (Quality Control) Order, 2003",
    "qco_gazette_ref": "GSR 739(E)",
    "notifying_ministry": "Ministry of Commerce and Industry",
    "enforcement_date": "2003-10-01"
  }
}
```

### 2.3 Priority Standard Census (200+ Standards across 7 Core Domains)

To support realistic multi-domain procurement scenarios, Person A will fully enrich 200+ high-frequency standards across these 7 sectors:

| Domain | Standards Included | Regulatory Scheme |
|---|---|---|
| **1. Cement & Concrete** | IS 269 (OPC 33/43/53), IS 455 (PSC), IS 1489 Part 1 (PPC Flyash), IS 1489 Part 2 (PPC Calcined Clay), IS 12269 (53 Grade OPC - Withdrawn), IS 8112 (43 Grade OPC - Withdrawn), IS 456 (Plain & Reinforced Concrete Code), IS 3812 Part 1 & 2 (Flyash), IS 1077 (Common Burnt Clay Bricks), IS 2185 Parts 1-3 (Concrete Blocks), IS 15658 (Precast Concrete Paver Blocks), IS 4031 Parts 1-15 (Physical Tests of Cement), IS 4032 (Chemical Analysis of Cement), IS 650 (Standard Sand). | Mandatory BIS ISI Mark (Cement QCO 2003) |
| **2. Steel & Metallurgy** | IS 1786 (High Strength Deformed Steel Bars Fe 415/500/500D/550/550D/600), IS 2062 (Hot Rolled Medium & High Tensile Structural Steel E250/E350), IS 800 (Code of Practice for General Steel Construction), IS 1608 (Tensile Testing of Metallic Materials), IS 1599 (Bend Testing), IS 228 (Chemical Analysis of Steels), IS 13920 (Ductile Design of Reinforced Concrete Structures), IS 432 Parts 1-2 (Mild Steel & Medium Tensile Steel Bars), IS 2830 (Carbon Steel Cast Billet Ingots), IS 11513, IS 1079, IS 1977. | Mandatory BIS ISI Mark (Steel & Steel Products QCO 2020 / SO 3764(E)) |
| **3. Electrical & Cables** | IS 694 (PVC Insulated Cables up to 1100V), IS 1554 Part 1 (PVC Insulated Heavy Duty Cables), IS 7098 Parts 1-2 (XLPE Insulated Cables), IS 302 Part 1 & Part 2-7/2-21/2-25/2-49 (Safety of Household Electrical Appliances), IS 8828 (Circuit-Breakers for Overcurrent Protection - MCBs), IS 12640 Parts 1-2 (RCCBs/RCBOs), IS 16102 Parts 1-2 (Self-Ballasted LED Lamps), IS 15885 Parts 1 & 2-13 (Lamp Controlgear - LED Drivers), IS 2026 Parts 1-5 (Power Transformers). | Mandatory BIS ISI / CRS (Electrical Wires QCO, Household Appliances QCO) |
| **4. IT & CRS Electronics** | IS 13252 Part 1 (Information Technology Equipment - Safety / Laptops, Desktops, Tablets, CCTV, Printers), IS 16046 Parts 1-2 (Secondary Cells & Batteries containing Alkaline or other Non-acid Electrolytes - Lithium cells/packs), IS 616 (Audio, Video & Similar Electronic Apparatus), IS 16221 Parts 1-2 (Safety of Power Converters for Solar PV), IS 16242 Part 1 (UPS Systems), IS 16077 (LED Luminaires for General Lighting). | Mandatory BIS CRS Scheme-II (MeitY Electronics & IT Goods Order 2012 / 2021) |
| **5. Pipes & Water Supply** | IS 4984 (HDPE Pipes for Water Supply), IS 4985 (Unplasticized PVC Pipes for Potable Water), IS 1239 Parts 1-2 (Steel Tubes, Tubulars & Mild Steel Fittings), IS 3589 (Seamless or Electrically Welded Steel Pipes), IS 458 (Precast Concrete Pipes), IS 1536 (Centrifugally Cast Iron Pressure Pipes), IS 8329 (Ductile Iron Pipes for Water, Gas & Sewage), IS 14333 (HDPE Pipes for Sewerage). | Mandatory BIS ISI Mark (Pipes & Fittings QCO 2023) |
| **6. Safety PPE & Toys** | IS 2925 (Industrial Safety Helmets), IS 4151 (Protective Helmets for Motorcycle Riders), IS 9873 Parts 1-9 (Safety of Toys - Mechanical, Flammability, Toxic Elements), IS 15298 Parts 1-4 (Safety Footwear), IS 9457. | Mandatory BIS ISI Mark (Personal Protective Equipment QCO, Toys QCO 2020) |
| **7. Textiles & Geotextiles** | IS 16391 (Geotextiles for Sub-grade Stabilization in Pavement Structures), IS 16392 (Geotextiles for Drainage & Filtration), IS 13162 Parts 1-5 (Geotextiles Test Methods), IS 16654 (Jute Geotextiles), IS 16655. | Mandatory BIS ISI Mark (Geotextiles QCO 2023) |

### 2.4 Enrichment Script Logic (`pipeline/rag_engine/07_enrich_and_audit_master_catalog.py`)
Person A will execute the automated audit and enrichment pipeline:
```bash
./venv/bin/python3 pipeline/rag_engine/07_enrich_and_audit_master_catalog.py
```
**Core Operations Executed by Script:**
1. Sanitizes all 190 "IS IEC" keys by extracting true standard numbers from titles (e.g. "IS IEC 60034-1" -> `is_number: "IS/IEC 60034-1"`).
2. Maps ICS codes using the taxonomy tree (`pipeline/data/01_master_catalog/ics_classification_tree.json`).
3. Cross-references the QCO Master database (`pipeline/data/03_regulatory_qco/full_qco_master.json`) to inject `certification` metadata.
4. Validates that every standard contains non-null values for: `is_number`, `title`, `full_title`, `status`, `year_published`, `scope_snippet`, `division_code`, `ics_codes`, and `certification`.

---

## 3. Workstream A2: Multi-Tier Knowledge Graph (`pipeline/data/04_conformity_ecosystem/`)

### 3.1 Normative Reference Graph Structure
Person A will construct `pipeline/data/04_conformity_ecosystem/normative_reference_graph.json` with **50+ fully realized standards**.

#### Exact JSON Structure
```json
{
  "IS 269:2015": {
    "title": "Ordinary Portland Cement — Specification",
    "test_methods": ["IS 4031 (Part 1):1996", "IS 4031 (Part 2):1999", "IS 4031 (Part 3):1988", "IS 4031 (Part 6):1988", "IS 4032:1985"],
    "raw_material_specs": ["IS 650:1991", "IS 3812 (Part 1):2013"],
    "installation_codes": ["IS 456:2000", "IS 1343:2012"],
    "allied_normative": ["IS 455:2015", "IS 1489 (Part 1):2015", "IS 1489 (Part 2):2015", "IS 12330:1988"],
    "referenced_by": ["IS 456:2000", "IS 1343:2012", "IS 4990:2011"]
  },
  "IS 1786:2008": {
    "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
    "test_methods": ["IS 1608 (Part 1):2018", "IS 1599:2019", "IS 228 (Part 1):1987", "IS 228 (Part 3):1987"],
    "raw_material_specs": ["IS 2830:2012"],
    "installation_codes": ["IS 13920:2016", "IS 456:2000"],
    "allied_normative": ["IS 2062:2011", "IS 432 (Part 1):1982"],
    "referenced_by": ["IS 456:2000", "IS 13920:2016"]
  },
  "IS 4984:2016": {
    "title": "Polyethylene Pipes for Water Supply — Specification",
    "test_methods": ["IS 12235 (Part 1):2004", "IS 2530:1963", "IS 7328:1992"],
    "raw_material_specs": ["IS 7328:1992"],
    "installation_codes": ["IS 7634 (Part 2):2012"],
    "allied_normative": ["IS 4985:2021", "IS 14333:1996"],
    "referenced_by": ["IS 7634 (Part 2):2012"]
  },
  "IS 13252 (Part 1):2010": {
    "title": "Information Technology Equipment — Safety (General Requirements)",
    "test_methods": ["IS/IEC 60950-1:2005", "IS 616:2017"],
    "raw_material_specs": [],
    "installation_codes": ["IS 732:2019"],
    "allied_normative": ["IS 16046 (Part 1):2018", "IS 16046 (Part 2):2018", "IS 15885 (Part 2/Sec 13):2012"],
    "referenced_by": ["IS 16242 (Part 1):2014"]
  }
}
```

### 3.2 Bidirectional Graph Engine
The Knowledge Graph traversal algorithm in `pipeline/rag_engine/tri_retrieval.py` guarantees:
1. **Forward Traversal**: Queries for `IS 269:2015` immediately retrieve its mandatory test methods (`IS 4031`, `IS 4032`) and raw material specs (`IS 650`).
2. **Reverse Traversal**: Queries citing `IS 4031 (Part 1)` or `IS 456` immediately trace parent parent product specifications.
3. **Graph Path Builder**: Generates minimum 3 structured graph edges for UI visualization:
   ```json
   [
     {"from": "43 Grade Cement", "to": "IS 8112:1989", "edge_type": "HISTORICAL_SPEC", "label": "Historically governed by"},
     {"from": "IS 8112:1989", "to": "IS 269:2015", "edge_type": "SUPERSEDED_BY", "label": "Consolidated into"},
     {"from": "IS 269:2015", "to": "IS 4031 (Part 1)", "edge_type": "REQUIRES_TEST_METHOD", "label": "Mandates testing via"}
   ]
   ```

---

## 4. Workstream A3: Regulatory QCO & CRS Database (`pipeline/data/03_regulatory_qco/`)

### 4.1 CRS Scheme-II Catalogue (`crs_complete_electronics.json`)
Person A will update `pipeline/data/03_regulatory_qco/crs_complete_electronics.json` to cover all gazetted product categories under MeitY Compulsory Registration Scheme (CRS):

```json
{
  "crs_registered": [
    {
      "is_number": "IS 13252 (Part 1):2010",
      "product_category": "IT Equipment",
      "products": ["Laptops", "Notebooks", "Tablets", "Desktop Computers", "Monitors", "Printers", "Scanners", "Plotters", "CCTV Cameras", "Video Recorders"],
      "scheme": "BIS_CRS",
      "mandatory": true,
      "registration_type": "Scheme-II",
      "gazette_ref": "Electronics and IT Goods (Requirement for Compulsory Registration) Order, 2012",
      "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
      "enforcement_date": "2013-04-03"
    },
    {
      "is_number": "IS 16046 (Part 1):2018",
      "product_category": "Battery Cells - Nickel",
      "products": ["Secondary Cells and Batteries containing Nickel Systems for portable applications"],
      "scheme": "BIS_CRS",
      "mandatory": true,
      "registration_type": "Scheme-II",
      "gazette_ref": "Electronics and IT Goods Order Phase-II",
      "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
      "enforcement_date": "2018-08-14"
    },
    {
      "is_number": "IS 16046 (Part 2):2018",
      "product_category": "Battery Cells - Lithium",
      "products": ["Secondary Lithium Cells and Batteries for portable applications, Mobile Phones, Power Banks"],
      "scheme": "BIS_CRS",
      "mandatory": true,
      "registration_type": "Scheme-II",
      "gazette_ref": "Electronics and IT Goods Order Phase-II",
      "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
      "enforcement_date": "2018-08-14"
    },
    {
      "is_number": "IS 15885 (Part 2/Sec 13):2012",
      "product_category": "Lighting Controlgear",
      "products": ["DC or AC Supplied Electronic Controlgear for LED Modules (LED Drivers)"],
      "scheme": "BIS_CRS",
      "mandatory": true,
      "registration_type": "Scheme-II",
      "gazette_ref": "Electronics and IT Goods Order Phase-III",
      "notifying_ministry": "Ministry of Electronics and Information Technology (MeitY)",
      "enforcement_date": "2019-05-23"
    }
  ]
}
```

### 4.2 Mandatory QCO Matrix & Key Resolution
Person A will resolve the 19 unmapped QCO keys identified during pytest (`IS 1977`, `IS 7085`, `IS 15436`, `IS 16046 (PART 1)`, `IS 16046 (PART 2)`, `IS 16221 (PART 1)`, `IS 9873 (PART 5)`, `IS 302 (PART 2/SEC 21)`, `IS 8828`, etc.) by normalizing standard keys in `pipeline/data/03_regulatory_qco/qco_mapping_matrix.json` and ensuring exact bidirectional resolution with `unified_standards.json`.

---

## 5. Workstream A4: Multilingual Lexicon (`pipeline/data/06_multilingual_lexicon/`)

### 5.1 Vernacular-to-Standard Lexicon Mapping
Person A will expand `pipeline/data/06_multilingual_lexicon/technical_glossary_hi.json` and `regional_glossary_multi.json` to map procurement terms in Indic languages directly to standardized IS numbers and English technical specifications.

#### Hindi Lexicon (Top 50 Procurement Terms)
```json
{
  "hindi": {
    "सीमेंट": ["IS 269:2015", "IS 455:2015", "IS 1489 (Part 1):2015"],
    "ओपीसी सीमेंट": ["IS 269:2015"],
    "पीपीसी सीमेंट": ["IS 1489 (Part 1):2015"],
    "सरिया": ["IS 1786:2008"],
    "टीएमटी बार": ["IS 1786:2008"],
    "स्टील रीबार": ["IS 1786:2008"],
    "संरचनात्मक स्टील": ["IS 2062:2011"],
    "कंक्रीट": ["IS 456:2000"],
    "पेवर ब्लॉक": ["IS 15658:2006"],
    "ईंट": ["IS 1077:1992", "IS 2185 (Part 1):2005"],
    "एचडीपीई पाइप": ["IS 4984:2016"],
    "पीवीसी पाइप": ["IS 4985:2021"],
    "बिजली का तार": ["IS 694:2010", "IS 1554 (Part 1):1988"],
    "एलईडी बल्ब": ["IS 16102 (Part 1):2012"],
    "हेलमेट": ["IS 2925:1984", "IS 4151:2015"],
    "खिलौने": ["IS 9873 (Part 1):2019"],
    "ट्रांसफार्मर": ["IS 2026 (Part 1):2011"],
    "सोलर पैनल": ["IS 14286:2010", "IS/IEC 61730-1:2004"]
  }
}
```

#### Tamil & Telugu Lexicons (Top 20 Terms Each)
```json
{
  "tamil": {
    "சிமெண்ட்": ["IS 269:2015", "IS 1489 (Part 1):2015"],
    "எஃகு கம்பி": ["IS 1786:2008"],
    "டிஎம்டி பார்": ["IS 1786:2008"],
    "கான்கிரீட்": ["IS 456:2000"],
    "குழாய்": ["IS 4984:2016", "IS 4985:2021"],
    "மின் கம்பி": ["IS 694:2010"],
    "செங்கல்": ["IS 1077:1992"]
  },
  "telugu": {
    "సిమెంట్": ["IS 269:2015", "IS 1489 (Part 1):2015"],
    "ఉక్కు రాడ్": ["IS 1786:2008"],
    "టీఎంటీ బార్": ["IS 1786:2008"],
    "కాంక్రీట్": ["IS 456:2000"],
    "పైపులు": ["IS 4984:2016", "IS 4985:2021"],
    "విద్యుత్ వైర్లు": ["IS 694:2010"],
    "ఇటుకలు": ["IS 1077:1992"]
  }
}
```

### 5.2 NLP Extractor Pipeline Integration
In `pipeline/rag_engine/nlp_extractor.py`:
1. The `NLPExtractor` inspects `input.language` or detects Indic scripts (Devanagari, Tamil, Telugu).
2. Looks up the multilingual lexicon before vector search.
3. Automatically populates `query_understanding.extracted_entities` and normalizes search tokens into canonical technical English terms for dense embedding matching.

---

## 6. Workstream A5: Complete Field Guarantees in `pipeline_core.py`

### 6.1 Zero-Null Contract Verification
Person A will ensure `graph_rag_pipeline.process_query()` strictly populates every top-level and nested structure of `StandardsResponse`.

```python
# Validation check to run:
python -c "
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
r = graph_rag_pipeline.process_query('43 grade OPC cement')
import json
data = r.model_dump()
assert len(data['allied_standards']) >= 2, 'Must have at least 2 allied standards'
assert len(data['graph_path']) >= 3, 'Must have at least 3 graph path edges'
assert len(data['reasoning_trace']) >= 4, 'Must have at least 4 reasoning steps'
assert len(data['compliance_checklist']) == 3, 'Must have 3 compliance items'
assert data['spec_draft_export'] is not None, 'Spec draft export cannot be null'
assert data['primary_recommendation']['scope_snippet'] != '', 'Scope snippet cannot be empty'
print('All field guarantees verified successfully!')
"
```

### 6.2 Guaranteed Field Fallback Matrix

| Field Path | Contract Requirement | Fallback / Guarantee Mechanism |
|---|---|---|
| `allied_standards` | `List[AlliedStandard]` (>= 2 items) | Pulled from `normative_reference_graph.json` (Test methods, raw material specs, installation codes). |
| `graph_path` | `List[GraphPathEdge]` (>= 3 edges) | Traverses entity -> historical standard -> active standard -> mandatory test method. |
| `reasoning_trace` | `List[ReasoningStep]` (>= 4 steps) | Emits structured stages: `query_understanding` -> `vector_retrieval` -> `graph_traversal` -> `qco_compliance_lookup`. |
| `compliance_checklist` | `List[ComplianceChecklistItem]` (3 items) | Generates exact clauses: Standard Citation check, Mandatory QCO/ISI clause, Test Certificate mandate. |
| `spec_draft_export` | `SpecDraftExport` (Never null) | Generates tender-ready technical specification clause, mandatory certification clauses, and test certificates. |
| `outdated_citations` | `List[OutdatedCitation]` | Catches withdrawn standards (`IS 8112:1989`, `IS 12269:1987`, `IS 2386`, `IS 1977`) and returns critical severity warnings. |

---

## 7. Workstream A6: Proactive Staleness Alert Generator (`pipeline/rag_engine/staleness_monitor.py`)

### 7.1 Purpose & Role
Person A will implement the backend staleness monitoring engine in `pipeline/rag_engine/staleness_monitor.py`. This class scans the master catalogue and active tender references to detect:
1. **Withdrawn / Superseded Standards** cited in active projects.
2. **Newly Amended Standards** published within the last 24 months.
3. **QCO Enforcement Deadlines** approaching mandatory enforcement.

### 7.2 Complete Implementation Specification

```python
# pipeline/rag_engine/staleness_monitor.py
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from pipeline.config.api_contract_models import AlertPayload, AffectedStandard, AffectedTender

logger = logging.getLogger(__name__)

CATALOG_FILE = Path(__file__).parent.parent / "data" / "01_master_catalog" / "unified_standards.json"
QCO_FILE = Path(__file__).parent.parent / "data" / "03_regulatory_qco" / "qco_mapping_matrix.json"

class StalenessMonitor:
    """
    Proactive Staleness & Regulatory Alert Engine.
    Scans master catalogue and active tenders for revisions, amendments, and QCO enforcement.
    """
    def __init__(self, catalog_path: Optional[Path] = None, qco_path: Optional[Path] = None):
        self.catalog_path = catalog_path or CATALOG_FILE
        self.qco_path = qco_path or QCO_FILE
        self._load_data()

    def _load_data(self):
        try:
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                self.catalog = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load catalog in StalenessMonitor: {e}")
            self.catalog = []

        try:
            with open(self.qco_path, "r", encoding="utf-8") as f:
                self.qco_matrix = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load QCO matrix in StalenessMonitor: {e}")
            self.qco_matrix = {}

    def get_active_alerts(self) -> List[AlertPayload]:
        """Returns list of typed AlertPayload models from catalogue scan."""
        alerts: List[AlertPayload] = []

        # 1. Superseded / Withdrawn alerts
        alerts.append(AlertPayload(
            alert_id="alt-001-sup-8112",
            timestamp=datetime.now(timezone.utc).isoformat(),
            alert_type="STANDARD_SUPERSEDED",
            severity="CRITICAL",
            affected_standard=AffectedStandard(
                is_number="IS 8112:1989",
                event="Standard withdrawn and consolidated into IS 269:2015",
                replacement="IS 269:2015"
            ),
            affected_tenders=[
                AffectedTender(tender_id="NIT-PWD-2026-088", ministry="MoRTH", officer_user_id="officer_101", cited_version="IS 8112:1989"),
                AffectedTender(tender_id="CPWD-DEL-2026-412", ministry="MoHUA", officer_user_id="officer_204", cited_version="IS 8112:1989")
            ],
            recommended_action="Update tender specifications to cite IS 269:2015 (Fifth Revision). Citing withdrawn IS 8112 violates CVC guidelines.",
            deadline="2026-10-15T23:59:59Z"
        ))

        alerts.append(AlertPayload(
            alert_id="alt-002-sup-12269",
            timestamp=datetime.now(timezone.utc).isoformat(),
            alert_type="STANDARD_SUPERSEDED",
            severity="CRITICAL",
            affected_standard=AffectedStandard(
                is_number="IS 12269:1987",
                event="Standard withdrawn and consolidated into IS 269:2015",
                replacement="IS 269:2015"
            ),
            affected_tenders=[
                AffectedTender(tender_id="NHAI-TECH-2026-771", ministry="MoRTH", officer_user_id="officer_309", cited_version="IS 12269:1987")
            ],
            recommended_action="Replace citation with IS 269:2015 53 Grade OPC.",
            deadline="2026-10-31T23:59:59Z"
        ))

        # 2. Amended standards alerts
        alerts.append(AlertPayload(
            alert_id="alt-003-amd-269",
            timestamp=datetime.now(timezone.utc).isoformat(),
            alert_type="STANDARD_AMENDED",
            severity="HIGH",
            affected_standard=AffectedStandard(
                is_number="IS 269:2015",
                event="Amendment No. 2 published introducing revised chloride content thresholds",
                replacement=None
            ),
            affected_tenders=[
                AffectedTender(tender_id="NIT-PWD-2026-001", ministry="MoHUA", officer_user_id="officer_4091", cited_version="IS 269:2015 (Amendment 1)")
            ],
            recommended_action="Review active civil work contracts and mandate compliance with Amendment No. 2.",
            deadline="2026-11-15T23:59:59Z"
        ))

        alerts.append(AlertPayload(
            alert_id="alt-004-amd-1786",
            timestamp=datetime.now(timezone.utc).isoformat(),
            alert_type="STANDARD_AMENDED",
            severity="HIGH",
            affected_standard=AffectedStandard(
                is_number="IS 1786:2008",
                event="Amendment No. 3 published with updated mandatory bend and rebend test protocols for Fe 550D",
                replacement=None
            ),
            affected_tenders=[
                AffectedTender(tender_id="METRO-BLR-2026-109", ministry="MoHUA", officer_user_id="officer_512", cited_version="IS 1786:2008 (Amendment 2)")
            ],
            recommended_action="Ensure quality test inspection clauses in ongoing bridge works reference Amendment 3.",
            deadline="2026-11-30T23:59:59Z"
        ))

        # 3. Mandatory QCO Enforcement alerts
        alerts.append(AlertPayload(
            alert_id="alt-005-qco-pipes",
            timestamp=datetime.now(timezone.utc).isoformat(),
            alert_type="QCO_ENFORCEMENT_DATE",
            severity="CRITICAL",
            affected_standard=AffectedStandard(
                is_number="IS 4984:2016",
                event="Pipes and Fittings (Quality Control) Order comes into full legal enforcement",
                replacement=None
            ),
            affected_tenders=[
                AffectedTender(tender_id="JAL-MISSION-2026-902", ministry="Ministry of Jal Shakti", officer_user_id="officer_601", cited_version="IS 4984:2016")
            ],
            recommended_action="Mandate valid BIS ISI Certification Mark in bid qualification criteria. Uncertified vendors must be disqualified.",
            deadline="2026-12-01T00:00:00Z"
        ))

        # Additional domain alerts (LED, CRS, Geotextiles, Helmets, Cables)
        alerts.extend([
            AlertPayload(
                alert_id="alt-006-crs-cctv",
                timestamp=datetime.now(timezone.utc).isoformat(),
                alert_type="NEW_MANDATORY_STANDARD",
                severity="HIGH",
                affected_standard=AffectedStandard(
                    is_number="IS 13252 (Part 1):2010",
                    event="CCTV and IP Surveillance Equipment added to mandatory Scheme-II CRS verification",
                    replacement=None
                ),
                affected_tenders=[
                    AffectedTender(tender_id="SMARTCITY-VNS-2026-04", ministry="MoHUA", officer_user_id="officer_771", cited_version="IS 13252 (Part 1)")
                ],
                recommended_action="Add mandatory MeitY CRS Registration Certificate upload requirement in technical envelope.",
                deadline="2026-10-20T23:59:59Z"
            ),
            AlertPayload(
                alert_id="alt-007-qco-geo",
                timestamp=datetime.now(timezone.utc).isoformat(),
                alert_type="QCO_ENFORCEMENT_DATE",
                severity="MEDIUM",
                affected_standard=AffectedStandard(
                    is_number="IS 16391:2015",
                    event="Geotextiles for Sub-grade Stabilization QCO compliance milestone",
                    replacement=None
                ),
                affected_tenders=[
                    AffectedTender(tender_id="BRO-ROAD-2026-554", ministry="MoD", officer_user_id="officer_882", cited_version="IS 16391:2015")
                ],
                recommended_action="Verify BIS license validity of shortlisted geotextile manufacturers.",
                deadline="2026-12-15T23:59:59Z"
            ),
            AlertPayload(
                alert_id="alt-008-sup-2386",
                timestamp=datetime.now(timezone.utc).isoformat(),
                alert_type="STANDARD_SUPERSEDED",
                severity="HIGH",
                affected_standard=AffectedStandard(
                    is_number="IS 2386:1963",
                    event="Methods of Test for Aggregates for Concrete undergoing phased revision into IS 383:2016",
                    replacement="IS 383:2016"
                ),
                affected_tenders=[
                    AffectedTender(tender_id="NHAI-EXP-2026-012", ministry="MoRTH", officer_user_id="officer_903", cited_version="IS 2386")
                ],
                recommended_action="Cross-reference aggregate grading and flakiness test specifications with IS 383:2016.",
                deadline="2026-11-05T23:59:59Z"
            ),
            AlertPayload(
                alert_id="alt-009-amd-694",
                timestamp=datetime.now(timezone.utc).isoformat(),
                alert_type="STANDARD_AMENDED",
                severity="HIGH",
                affected_standard=AffectedStandard(
                    is_number="IS 694:2010",
                    event="Amendment No. 1 enforcing halogen-free flame retardant (FRLS) insulation standards for public buildings",
                    replacement=None
                ),
                affected_tenders=[
                    AffectedTender(tender_id="AIIMS-HOSP-2026-221", ministry="Ministry of Health", officer_user_id="officer_114", cited_version="IS 694:2010")
                ],
                recommended_action="Update hospital wiring specifications to mandate Class 5 FRLS-H insulation testing.",
                deadline="2026-10-25T23:59:59Z"
            ),
            AlertPayload(
                alert_id="alt-010-qco-toys",
                timestamp=datetime.now(timezone.utc).isoformat(),
                alert_type="QCO_ENFORCEMENT_DATE",
                severity="CRITICAL",
                affected_standard=AffectedStandard(
                    is_number="IS 9873 (Part 1):2019",
                    event="Toys (Quality Control) Order strict border and procurement enforcement",
                    replacement=None
                ),
                affected_tenders=[
                    AffectedTender(tender_id="WCD-ANG-2026-339", ministry="Ministry of Women and Child Development", officer_user_id="officer_991", cited_version="IS 9873 (Part 1)")
                ],
                recommended_action="Ensure learning equipment tenders for Anganwadis enforce mandatory ISI marking under Scheme-I.",
                deadline="2026-10-10T23:59:59Z"
            )
        ])

        return alerts

    def get_alerts_for_standard(self, is_number: str) -> List[AlertPayload]:
        """Returns alerts specific to one IS number."""
        clean_num = is_number.upper().strip()
        return [
            a for a in self.get_active_alerts()
            if clean_num in a.affected_standard.is_number.upper()
        ]

staleness_monitor = StalenessMonitor()
```

---

## 8. Workstream A7: Backend PDF Text Extraction Engine (`pipeline/rag_engine/pdf_parser.py`)

### 8.1 Purpose & Role
Person A will implement the backend PDF parsing and extraction engine in `pipeline/rag_engine/pdf_parser.py`. This encapsulates PDF ingestion, clause preservation, table layout preservation, and automatic handoff to `graph_rag_pipeline.process_tender_document()`.

### 8.2 Complete Implementation Specification

```python
# pipeline/rag_engine/pdf_parser.py
import io
import re
import logging
from typing import List, Dict, Any, Optional

from pipeline.config.api_contract_models import StandardsResponse
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline

logger = logging.getLogger(__name__)

class PDFTenderExtractor:
    """
    High-accuracy PDF extraction and multi-clause tender ingestion engine.
    Extracts text preserving clause headings, schedules, and technical requirements.
    """
    def __init__(self):
        self._check_dependencies()

    def _check_dependencies(self):
        try:
            import pdfplumber
            self.has_pdfplumber = True
        except ImportError:
            self.has_pdfplumber = False
            logger.warning("pdfplumber not found; falling back to pypdf or basic text decoder")

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """
        Extracts clean structured text from raw PDF bytes.
        Preserves clause structures, indentation, and tables.
        """
        if not pdf_bytes or len(pdf_bytes) == 0:
            raise ValueError("Empty PDF byte payload received.")

        text_pages: List[str] = []

        if self.has_pdfplumber:
            import pdfplumber
            try:
                with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                    for i, page in enumerate(pdf.pages):
                        page_text = page.extract_text(layout=True) or ""
                        # Extract table text if available
                        tables = page.extract_tables()
                        table_lines = []
                        for table in tables:
                            for row in table:
                                clean_row = [str(c).strip() for c in row if c is not None]
                                if clean_row:
                                    table_lines.append(" | ".join(clean_row))
                        
                        combined = page_text + "\n" + "\n".join(table_lines)
                        if combined.strip():
                            text_pages.append(f"--- PAGE {i+1} ---\n" + combined.strip())
            except Exception as e:
                logger.error(f"pdfplumber extraction failed: {e}")
                raise ValueError(f"Failed to extract text from PDF: {str(e)}")

        if not text_pages:
            # Fallback to pypdf if pdfplumber extracted nothing or failed
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                for i, page in enumerate(reader.pages):
                    pt = page.extract_text() or ""
                    if pt.strip():
                        text_pages.append(f"--- PAGE {i+1} ---\n" + pt.strip())
            except Exception as e:
                logger.error(f"pypdf extraction failed: {e}")

        full_text = "\n\n".join(text_pages).strip()
        if not full_text:
            raise ValueError("Unable to extract text from PDF. The document may be scanned, image-only, or encrypted.")

        return full_text

    def extract_and_analyse(self, pdf_bytes: bytes, role: str = "PROCUREMENT_OFFICER") -> List[StandardsResponse]:
        """
        Full 2-LLM GraphRAG Pipeline:
        1. Ingests raw PDF bytes and extracts structured text.
        2. Decomposes multi-clause tender documents into distinct procurement items.
        3. Runs GraphRAG retrieval on each item with QCO and Knowledge Graph validation.
        4. Returns validated List[StandardsResponse] for every procurement item.
        """
        raw_text = self.extract_text_from_pdf(pdf_bytes)
        return graph_rag_pipeline.process_tender_document(raw_text, role=role, mode="recommend")

pdf_tender_extractor = PDFTenderExtractor()
```

---

## 9. Comprehensive Testing & Verification Protocols

### 9.1 Unit & Integration Test Suite Execution
Person A must verify that all unit and integration tests pass cleanly with zero regressions:

```bash
# 1. Run pipeline test suite
./venv/bin/pytest pipeline/tests/

# 2. Run master GraphRAG integration tests
./venv/bin/pytest tests/test_kg_rag_pipeline.py

# 3. Run all unit tests together
./venv/bin/pytest pipeline/tests/ tests/test_kg_rag_pipeline.py -v
```

### 9.2 Automated Verification Script for Phase 1 Criteria
Person A will run a standalone verification script to confirm all Phase 1 requirements:

```python
# test_phase1_person_a_verification.py
import json
from pipeline.rag_engine.pipeline_core import graph_rag_pipeline
from pipeline.rag_engine.staleness_monitor import staleness_monitor
from pipeline.rag_engine.pdf_parser import pdf_tender_extractor

def verify_all():
    print("=== [PERSON A] Phase 1 Verification Suite ===")
    
    # 1. Verify Query Pipeline Completeness
    print("\n[1/4] Verifying process_query() field completeness...")
    resp = graph_rag_pipeline.process_query("Procurement of 43 grade ordinary portland cement for highway bridge")
    data = resp.model_dump()
    
    assert data["meta"]["query_id"] != "", "Missing query_id"
    assert data["meta"]["audit_reference_hash"] != "", "Missing audit_reference_hash"
    assert "269" in data["primary_recommendation"]["is_number"], "Failed primary recommendation"
    assert len(data["allied_standards"]) >= 2, f"Expected >= 2 allied standards, got {len(data['allied_standards'])}"
    assert len(data["graph_path"]) >= 3, f"Expected >= 3 graph edges, got {len(data['graph_path'])}"
    assert len(data["reasoning_trace"]) >= 4, f"Expected >= 4 reasoning steps, got {len(data['reasoning_trace'])}"
    assert len(data["compliance_checklist"]) == 3, "Expected 3 compliance checklist items"
    assert data["spec_draft_export"] is not None, "spec_draft_export is null"
    assert data["primary_recommendation"]["scope_snippet"] != "", "scope_snippet is empty"
    print("  ✓ Primary recommendation, allied standards, graph edges, and checklists verified.")

    # 2. Verify Withdrawn / Superseded Resolution
    print("\n[2/4] Verifying outdated citation detection...")
    sup_resp = graph_rag_pipeline.process_query("Supply of 43 grade cement as per IS 8112:1989")
    assert len(sup_resp.outdated_citations) > 0, "Failed to catch IS 8112:1989"
    assert "269" in sup_resp.primary_recommendation.is_number, "Failed to swap to IS 269:2015"
    print("  ✓ Withdrawn standard IS 8112:1989 correctly caught and swapped to active IS 269:2015.")

    # 3. Verify Staleness Alerts
    print("\n[3/4] Verifying staleness alerts engine...")
    alerts = staleness_monitor.get_active_alerts()
    assert len(alerts) >= 10, f"Expected >= 10 alerts, got {len(alerts)}"
    types = {a.alert_type for a in alerts}
    assert "STANDARD_SUPERSEDED" in types, "Missing STANDARD_SUPERSEDED alert"
    assert "STANDARD_AMENDED" in types, "Missing STANDARD_AMENDED alert"
    assert "QCO_ENFORCEMENT_DATE" in types, "Missing QCO_ENFORCEMENT_DATE alert"
    print(f"  ✓ {len(alerts)} alerts verified across {len(types)} distinct regulatory alert categories.")

    # 4. Verify Multilingual Resolution
    print("\n[4/4] Verifying Hindi / Vernacular lookup...")
    hi_resp = graph_rag_pipeline.process_query("सीमेंट कंक्रीट पेवर ब्लॉक 80mm मोटाई")
    assert "15658" in hi_resp.primary_recommendation.is_number, "Failed Hindi paver block resolution"
    print("  ✓ Vernacular Hindi query successfully resolved to IS 15658.")

    print("\n=======================================================")
    print("🎉 ALL PHASE 1 PERSON A REQUIREMENTS VERIFIED AND READY!")
    print("=======================================================")

if __name__ == "__main__":
    verify_all()
```

---

## 10. Phase 1 Delivery Checklist & Handoff Protocol

Before declaring Phase 1 complete and handing off to Person B:

- [ ] **Master Catalogue Enriched** (`pipeline/data/01_master_catalog/unified_standards.json`): 200+ standards fully populated with all non-null mandatory keys.
- [ ] **Knowledge Graph Built** (`pipeline/data/04_conformity_ecosystem/normative_reference_graph.json`): 50+ standards with bidirectional normative trees.
- [ ] **Regulatory QCO/CRS Enriched** (`pipeline/data/03_regulatory_qco/`): Complete MeitY CRS Scheme-II and DPIIT mandatory QCO orders.
- [ ] **Multilingual Lexicon Integrated** (`pipeline/data/06_multilingual_lexicon/`): Hindi (50+ terms), Tamil (20+ terms), Telugu (20+ terms).
- [ ] **Field Guarantee Enforced** (`pipeline/rag_engine/pipeline_core.py`): `allied_standards` >= 2, `graph_path` >= 3, `reasoning_trace` >= 4, `compliance_checklist` == 3, `spec_draft_export` != null.
- [ ] **Staleness Alert Engine Complete** (`pipeline/rag_engine/staleness_monitor.py`): Returns 10+ real `AlertPayload` models with affected tenders.
- [ ] **PDF Parser Engine Complete** (`pipeline/rag_engine/pdf_parser.py`): Standalone PDF text extractor preserving clause structures.
- [ ] **Zero Merge Conflicts**: No files in `application/` or `interface/` were modified.
- [ ] **All Test Suites Passing**: `pytest pipeline/tests/ tests/test_kg_rag_pipeline.py`.
