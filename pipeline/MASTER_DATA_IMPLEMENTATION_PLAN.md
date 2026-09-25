# Master Data Implementation Plan
## AI-Powered Indian Standards Recommendation Engine — SIH 2026

> **Current State (post-audit):** 21,992 standards catalogued, **only 113 (0.5%) have full text**, 0 ICS codes, 0 amendment history, 99 QCO keys vs 769+ needed, 7 GeM categories, 15 Hindi terms.

---

## CRITICAL GAPS TABLE — What Is Missing

| Data Layer | Currently Have | Target Needed | Gap |
|---|---|---|---|
| Standards with full text | 113 (0.5%) | ~8,000 from IA | **21,879 missing** |
| Mandatory QCO full texts | 0 of 97 | All mandatory standards | **100% missing** |
| QCO regulatory coverage | 99 lookup keys | 187+ QCOs / 769+ products | **670+ products missing** |
| Amendment history | 0% of standards | All 22K standards | **100% missing** |
| ICS codes | 0% of standards | All 22K standards | **100% missing** |
| CRS electronics list | 0 items | 70+ product categories | **100% missing** |
| Lab registry | 10 hardcoded | 500+ from LIMS | **98% missing** |
| GeM categories | 7 categories | 200+ categories | **96% missing** |
| Multilingual terms | 108 synonym keys | 500+ Hindi pairs | **97% missing** |
| Real tender corpus | 3 test cases | 50+ real NITs/BoQs | **94% missing** |

---

## PHASE 1 — Internet Archive Bulk Full-Text Download (HIGHEST PRIORITY)

**Goal:** Get full OCR text for all ~8,000 available Indian Standards from archive.org

**Source:** `archive.org` — identifiers matching `gov.in.is.*` (Public.Resource.Org archive)

**What's available:** ~8,000–10,000 standards as `_djvu.txt` OCR text files (~50KB each, ~400MB total)

### Script to Build: `scripts/11_ia_bulk_fulltext_download.py`

```
Strategy:
1. internetarchive.search_items('identifier:gov.in.is*', fl=['identifier','title','subject'])
2. Cross-reference with our 21,992 master catalog to find all matching identifiers
3. Priority queue: Mandatory QCO standards FIRST, then by division
4. Download _djvu.txt files (avoid PDFs — they are 10x larger, OCR txt is sufficient)
5. Rate limit: 3 requests/second, exponential backoff on errors
6. Checkpoint every 500 downloads (resume-capable)
7. After each batch: trigger 08_deep_fulltext_and_rag_builder.py
```

**Download Priority Order:**
1. **CRITICAL:** All 97 mandatory QCO/CRS standards (0 of 97 downloaded right now!)
2. LITD division (electronics, IT) — 4,796 standards
3. CED division (civil, concrete, steel) — 1,292 standards
4. MTD division (metallurgy, testing) — 1,278 standards
5. ETD division (electrotechnical) — 1,100 standards
6. CHD division (chemicals, plastics) — 1,497 standards
7. TXD division (textiles, yarn, fabrics) — 1,152 standards
8. FAD division (food, agriculture) — 573 standards
9. MED division (mechanical engineering) — 675 standards
10. Remaining divisions

**Expected Output After Phase 1:**
- 8,000 txt files in `raw_ia_downloads/`
- 8,000 parsed clause JSONs in `parsed_clauses/`
- ~25,000 RAG document chunks
- ~50,000 normative graph edges

---

## PHASE 2 — Complete QCO + Regulatory Data (ALL 187+ QCOs)

**Goal:** Cover all 769+ mandatory products (currently only 99 out of 769+)

**Sources:**
1. `bis.gov.in/product-certification/products-under-compulsory-certification/` — ISI Mark master list
2. `crsbis.in` — Scheme-II CRS (electronics/IT, 70+ categories)
3. `egazette.gov.in` — Gazette notifications as legal backing
4. DPIIT, Ministry of Steel, MeitY, Ministry of Chemicals official pages

### Script to Build: `scripts/12_full_qco_scraper.py`

**Ministry-wise QCO products to fetch:**

| Ministry | Product Count | Key Standards |
|---|---|---|
| DPIIT | ~120 products | IS 2062, IS 1786, IS 1239, IS 1363, IS 1151 (tyres) |
| MeitY (CRS Scheme-II) | ~70 categories | IS 616, IS 13252, IS 16046, IS 16102, IS 16221 |
| Ministry of Steel | ~40 products | IS 1786, IS 432, IS 2831, IS 1977 |
| Ministry of Chemicals | ~30 products | IS 10151, IS 7328, IS 10146 |
| Ministry of Consumer Affairs | ~20 products | IS 10000, IS 17240 |
| Ministry of Textiles | ~15 products | IS 9708, IS 3655 |
| Ministry of Health | ~15 products | IS 9873, IS 5440, IS 10254 |
| Ministry of Power | ~25 products | IS 1180, IS 13779, IS 694, IS 7098 |
| Ministry of Road Transport | ~20 products | IS 2553, IS 1151, IS 15436 |
| Ministry of Housing/BIS | ~35 products | IS 269, IS 383, IS 456, IS 1489 |
| BIS Hallmarking | 2 products | IS 1417, IS 2112 |

**Output Files:**
```
data/03_regulatory_qco/
├── full_qco_master.json           # All 769+ products
├── meity_crs_complete.json        # CRS electronics list
├── dpiit_products.json
├── ministry_steel_products.json
└── gazette_references/            # SO notification numbers
```

---

## PHASE 3 — Complete BIS Catalogue Metadata Enrichment

**Goal:** Add ICS codes, amendment history, gazette links for all 22,000 standards

**Source:** `standards.bis.gov.in/website/know-your-standards` per-standard form

**Fields currently missing for all 21,992 standards:**
- `ics_codes`: International Classification for Standards codes
- `amendments`: List of amendments with year and description
- `superseded_by`: If standard was replaced
- `supersedes`: What it replaced
- `gazette_notification`: SO number and date
- `degree_of_equivalence`: ISO/IEC equivalent if any
- `pages`: Number of pages (proxy for document depth)

### Script: `scripts/13_bis_catalogue_enricher.py`

```
Strategy:
1. For each IS number in master catalog:
   - POST to standards.bis.gov.in/website/know-your-standards
   - Parse HTML response for ICS codes, amendments, gazette links
2. Rate limit: 2 requests/second max
3. Checkpoint every 500 requests
4. Update unified_standards.json in place
```

**Enriched record example:**
```json
{
  "is_number": "IS 1786",
  "ics_codes": ["77.140.15"],
  "amendments": [
    {"no": 1, "year": 2008},
    {"no": 2, "year": 2016}
  ],
  "supersedes": "IS 1786:1979",
  "gazette_notification": "SO 3764(E) 2020-09-01",
  "degree_of_equivalence": "Technically Equivalent to ISO 6935-2"
}
```

---

## PHASE 4 — CRS Electronics Full Registry

**Goal:** Complete Scheme-II CRS mandatory electronics list from crsbis.in

**Source:** `crsbis.in/product/view/product-under-crs`

**70+ product categories to capture:**
- Mobiles, smartphones (IS 13252 Pt1, IS 16046 Pt2)
- Laptops, tablets (IS 13252 Pt1)
- LED luminaires & drivers (IS 16102, IS 10322)
- Power banks & chargers (IS 13252 Pt1, IS 16046)
- Smart watches (IS 13252 Pt1)
- CCTV cameras, DVRs, NVRs (IS 13252 Pt1)
- Solar PV panels (IS 14286)
- Solar inverters (IS 16221)
- UPS/inverter systems (IS 16242)
- Set-top boxes (IS 13252 Pt1)
- Secondary lithium cells (IS 16046 Pt1, Pt2)
- Network switches, routers (IS 13252 Pt1)
- Electric vehicle charging equipment (IS 17017)
- LED chips and modules (IS 16102 Pt5)
- Power supplies and adapters

### Script: `scripts/14_crs_electronics_scraper.py`

**Output:** `data/03_regulatory_qco/crs_complete_electronics.json`

---

## PHASE 5 — BIS Testing Lab Registry (LIMS)

**Goal:** Map all recognized testing labs to the standards they can test against

**Source:** `lims.bis.gov.in/home/search_is_number`

**What we get per IS number:**
- Lab name, lab code
- Location (state, district, address)
- NABL accreditation number and scope
- Contact (phone, email)
- Recognized for which test parameters

### Script: `scripts/15_lims_lab_registry.py`

```
Strategy:
1. For each of the 187+ QCO mandatory IS numbers:
   - POST to lims.bis.gov.in search with IS number
   - Parse all lab results (name, location, NABL code, scope)
2. Store as IS_number → [{lab_id, name, state, nabl, contact}]
3. Expected: ~500 unique labs across all mandatory standards
```

**Output:** `data/04_conformity_ecosystem/lims_lab_registry.json`

---

## PHASE 6 — ISI Licensee Registry (Manakonline)

**Goal:** Ground truth of which manufacturers hold IS licenses (for procurement verification)

**Source:** `manakonline.in/MANAK/API/allindiafirstlicencereport`

**What we get:** IS number → certified manufacturers (name, state, license no, expiry)

### Script: `scripts/16_manak_licensee_scraper.py`

**Output:** `data/04_conformity_ecosystem/manak_licensee_registry.json`

**Use in RAG:** When a procurement officer queries "IS 1786 certified manufacturers in Tamil Nadu" → answer directly from this registry

---

## PHASE 7 — GeM Full Product Category Specifications

**Goal:** 200+ GeM categories with IS standard references and golden parameters

**Source:** `gem.gov.in` catalogue (requires Selenium — JS-rendered)

**Target 200+ category groups:**

| Domain | Count | Example IS References |
|---|---|---|
| Construction & Infrastructure | 35 | IS 456, IS 1786, IS 269, IS 875 |
| Electrical Works | 30 | IS 694, IS 1554, IS 732, IS 1180 |
| IT & Electronics | 40 | IS 13252, IS 16046, IS 16102 |
| Chemicals & Paints | 20 | IS 2932, IS 101, IS 7328 |
| Textiles & PPE | 25 | IS 15298, IS 11226, IS 3735 |
| Mechanical Equipment | 20 | IS 1363, IS 1239, IS 1570 |
| Vehicles & Transport | 15 | IS 2553, IS 1151 |
| Medical Supplies | 20 | IS 5440, IS 9873, IS 1612 |
| Steel Products | 25 | IS 2062, IS 1786, IS 432 |
| Furniture & Fittings | 10 | IS 1003, IS 1823, IS 3457 |

### Script: `scripts/17_gem_full_categories.py`

**Output:**
- `data/05_procurement_gold_corpus/gem_full_categories.json` (200+ categories)
- `data/05_procurement_gold_corpus/gem_spec_sheets/` (Golden spec sheets per category)

---

## PHASE 8 — Real Tender Corpus from CPPP

**Goal:** 50+ real government tenders with IS citations for diff engine testing

**Source:** `eprocure.gov.in/cppp/` — Central Public Procurement Portal

**Target Tender Types to collect:**
1. PWD Road/Bridge Construction (IS 456, IS 1786, IS 383, IS 516)
2. Municipal Water Supply (IS 1239, IS 4984, IS 10500, IS 3114)
3. Government Building (IS 456, IS 875, IS 13920, IS 1893)
4. Electrical Installations (IS 732, IS 694, IS 3043, IS 1554)
5. IT Procurement (IS 13252, IS 16046, IS 616)
6. Steel/TMT Supply (IS 2062, IS 1786, IS 432)
7. Cement Supply (IS 269, IS 1489, IS 8112)

**For each tender, produce:**
```
data/05_procurement_gold_corpus/cppp_live_tenders/
├── NIT_001/
│   ├── raw_tender.txt           # OCR-extracted text
│   ├── found_citations.json     # All IS numbers detected
│   ├── outdated_citations.json  # Old IS versions found
│   └── recommended_updates.json # What our engine should suggest
```

### Script: `scripts/18_cppp_tender_corpus.py`

---

## PHASE 9 — Multilingual Technical Glossary Expansion

**Goal:** 500+ Hindi/multilingual technical terms (up from 108 synonym keys)

**Sources:**
1. CSTT — Commission for Scientific and Technical Terminology (`cstt.gov.in`)
2. IRS/Raj Bhasha technical PDF glossaries
3. BIS Hindi standard publications
4. MHRD technical vocabulary databases

**Domain coverage:**
- Construction: निर्माण, सुदृढ़ीकरण (reinforcement), संपीड़न शक्ति (compressive strength)
- Electrical: प्रतिरोध (resistance), वोल्टेज (voltage), ट्रांसफार्मर (transformer)
- Mechanical: तनन शक्ति (tensile strength), कठोरता (hardness), लचीलापन (ductility)
- Chemical: रासायनिक संरचना (chemical composition), शुद्धता (purity)
- Procurement: निविदा (tender), क्रय (purchase), विनिर्देश (specifications)

**Regional languages to add:** Tamil, Telugu, Gujarati, Marathi, Bengali (transliterated)

**Output:**
- `data/06_multilingual_lexicon/technical_glossary_hi.json` (500+ pairs)
- `data/06_multilingual_lexicon/regional_glossary_multi.json` (5 languages)

---

## PHASE 10 — ICS Classification Tree

**Goal:** Complete ISO ICS hierarchical tree for semantic query routing

**Source:** ISO ICS classification (public domain)

**How it is used:**
- "Laptop safety" → routes to ICS 33 (Telecommunications) → IS 13252
- "Reinforcement steel" → routes to ICS 77.140.15 → IS 1786
- "Drinking water quality" → routes to ICS 13.060 → IS 10500

**Output:** `data/01_master_catalog/ics_classification_tree.json`

---

## IMPLEMENTATION SCRIPT SEQUENCE

| Script | Priority | Run Time | Data Added |
|---|---|---|---|
| `11_ia_bulk_fulltext_download.py` | 🔴 CRITICAL | ~8 hours (overnight) | 8,000 standard texts |
| `12_full_qco_scraper.py` | 🔴 CRITICAL | ~2 hours | 670+ more QCO products |
| `13_bis_catalogue_enricher.py` | 🟠 HIGH | ~3 hours | ICS + amendments for all 22K |
| `14_crs_electronics_scraper.py` | 🟠 HIGH | ~30 min | 70+ CRS product categories |
| `15_lims_lab_registry.py` | 🟠 HIGH | ~1 hour | 500+ lab-to-standard mappings |
| `16_manak_licensee_scraper.py` | 🟡 MEDIUM | ~1 hour | Licensee ground truth |
| `17_gem_full_categories.py` | 🔴 CRITICAL | ~2 hours | 200+ GeM categories |
| `18_cppp_tender_corpus.py` | 🟠 HIGH | ~3 hours | 50+ real tender pairs |
| `19_multilingual_glossary.py` | 🟡 MEDIUM | ~1 hour | 500+ multilingual terms |
| `20_ics_tree_builder.py` | 🟡 MEDIUM | ~30 min | Full ICS hierarchy |

---

## CURRENT STATE vs TARGET STATE

| Metric | NOW | AFTER ALL PHASES |
|---|---|---|
| Standards with full text | **113 (0.5%)** | ~8,000 (36%) |
| Mandatory QCO products | **99** | 769+ |
| RAG document chunks | **337** | ~30,000 |
| Normative graph edges | **1,876** | ~50,000 |
| GeM categories mapped | **7** | 200+ |
| Real tender test pairs | **3** | 50+ |
| Multilingual terms | **108 synonym keys** | 500+ pairs (6 languages) |
| Lab-to-standard mappings | **10 (hardcoded)** | 500+ (from LIMS) |
| Standards with ICS codes | **0 (0%)** | 21,992 (100%) |
| Standards with amendment data | **0 (0%)** | 21,992 (100%) |

---

## DATA QUALITY REQUIREMENTS (NON-NEGOTIABLE)

### Standard Records:
- `is_number` — Non-null, normalized ("IS 1786", not "is 1786" or "1786")
- `title` — Full title, no truncation  
- `status` — "ACTIVE" / "WITHDRAWN" / "UNDER_REVISION"
- `amendments` — Array (empty `[]` if none, never `null`)
- `ics_codes` — Array (empty `[]` if none, never `null`)
- `regulatory_compliance.is_mandatory` — Boolean, not null

### Full-Text Records:
- `clause_1_scope` — Min 60 chars, zero synthetic fallbacks
- `clause_2_normative_references` — List (empty list ok, `null` NOT ok)
- `clause_4_requirements.marking_requirements` — Min 2 items always

### Normative Graph Edges:
- `source` ≠ `target` (zero self-loops)
- `source_title` and `target_title` — Non-null, non-empty
- `relation_type` — One of 9 valid types

### QCO Records:
- `is_number` — Links to valid master catalog entry
- `ministry` — Full official ministry name
- `gazette_notification` — SO number + date
- `enforcement_date` — ISO 8601 format
- `scheme` — "SCHEME_I" / "SCHEME_II" / "SCHEME_IV"

---

## DATA SOURCES REFERENCE

| Source | URL | Method | Rate Limit |
|---|---|---|---|
| Internet Archive | `archive.org` | `internetarchive` Python lib | 3 req/sec |
| BIS Catalogue | `standards.bis.gov.in/website/catalogue-list` | BeautifulSoup | 2 req/sec |
| BIS KYS | `standards.bis.gov.in/website/know-your-standards` | POST form | 1 req/sec |
| BIS Compulsory | `bis.gov.in/product-certification/products-under-compulsory-certification/` | HTML parse | 1 req/sec |
| CRS BIS | `crsbis.in` | HTML table parse | 1 req/sec |
| LIMS Labs | `lims.bis.gov.in/home/search_is_number` | Form POST | 1 req/sec |
| Manakonline | `manakonline.in/MANAK/API/allindiafirstlicencereport` | JSON API | 1 req/sec |
| GeM | `gem.gov.in` | Selenium JS | Manual |
| CPPP | `eprocure.gov.in/cppp/` | PDF download | Manual |
| eGazette | `egazette.gov.in` | PDF search | 1 req/sec |
| CSTT | `cstt.gov.in` | HTML/PDF | 1 req/sec |
