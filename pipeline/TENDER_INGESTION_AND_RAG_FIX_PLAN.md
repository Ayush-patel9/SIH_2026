# Implementation Plan: End-to-End Tender Ingestion & 2-LLM GraphRAG Pipeline

## Executive Summary
This document establishes the implementation blueprint for the **End-to-End Tender Document Processing & GraphRAG Pipeline**. It covers raw document ingestion, **LLM Call 1** (Tender Decomposition), the **Tri-Retrieval & Knowledge Graph Engine** (with 5 critical accuracy fixes), **LLM Call 2** (Audit Trail & Explainability Synthesis), and output validation against `API_CONTRACT_SCHEMA.md`.

---

## 🏛️ End-to-End Pipeline Architecture

```
                       [ 1. Raw Procurement Tender Input ]
                         (Multi-clause text, PDF upload)
                                        │
                                        ▼
                       [ 2. LLM Call 1: Tender Decomposer ]
                       (Decomposes into items, clean queries,
                        acronym expansion, cited IS numbers)
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
        [ Line Item 1 ]                                 [ Line Item 2 ]
  "43 Grade OPC for Highway"                       "HDPE Pipes 110mm PN6"
                 │                                             │
                 ▼                                             ▼
  ┌───────────────────────────────┐             ┌───────────────────────────────┐
  │   Tri-Retrieval & GraphRAG    │             │   Tri-Retrieval & GraphRAG    │
  │ • Entity-Weighted BM25 (4x)   │             │ • Entity-Weighted BM25 (4x)   │
  │ • Strict Exact IS Lookup      │             │ • Strict Exact IS Lookup      │
  │ • CRS Electronics Catalog     │             │ • CRS Electronics Catalog     │
  │ • 2-Tier Knowledge Graph      │             │ • 2-Tier Knowledge Graph      │
  │ • Supersession (IS 8112→269)  │             │ • Supersession (IS 8112→269)  │
  └──────────────┬────────────────┘             └──────────────┬────────────────┘
                 │                                             │
                 └──────────────────────┬──────────────────────┘
                                        │
                                        ▼
                       [ 3. LLM Call 2: Audit & Synthesis ]
                       • Generates "Why" clause citations
                       • Performs QCO compliance checks (ISI vs CRS)
                       • Flags withdrawn/outdated citations
                       • Builds Officer Compliance Checklist
                       • Exports citation-ready tender clauses
                                        │
                                        ▼
                       [ 4. Canonical JSON Contract Output ]
                        (Strict StandardsResponse v1 Schema)
```

---

## 🎯 The 5 Core Pipeline Fixes

| # | Issue Identified in Stress Test | Root Cause | Exact Engineering Fix |
|---|---|---|---|
| **1** | **Context Noise Overpowering Product** (e.g., TMT rebars for earthquake matching `IS 1893` design code instead of `IS 1786` steel bars) | BM25 treats background context words with high frequency equally to product names. | In `tri_retrieval.py`, apply **Entity-Guided 4x Term Multiplier** on tokens extracted as `PRODUCT` and `GRADE_SPECIFICATION`. |
| **2** | **Acronym & CRS Electronics Gaps** (HDPE, CCTV, Laptops matching generic standards) | Acronyms unexpanded; CRS Electronics dataset unindexed. | 1. Ingest [`crs_complete_electronics.json`](file:///c:/Users/abhyudaya/sih108/SIH_2026/pipeline/data/03_regulatory_qco/crs_complete_electronics.json) into `tri_retrieval.py`.<br>2. Add canonical Acronym Expansion Lexicon (`HDPE`, `CCTV`, `UPVC`, `XLPE`, `AAC`, `TMT`, `LED`). |
| **3** | **Exact IS Lookup Ambiguity** (`IS 302` matching coaxial cables ending in 302) | Regex allowed substring suffix matches. | Enforce **strict word boundary regex** (`\bIS\s*302\b`) and prioritize base part numbers (`IS 302 (Part 1)`). |
| **4** | **Knowledge Graph Sparsity** (11/19 queries had empty allied standards) | `normative_edges.json` only contains edges for standards with parsed full-text PDFs. | Implement **2-Tier Knowledge Graph Fallback**: Tier 1 (Direct parsed edges) $\to$ Tier 2 (Domain/Division test-method matrix: e.g., Steel $\to$ IS 1608 tensile test; Cement $\to$ IS 4031/4032; Electrical $\to$ IS 302; Pipes $\to$ IS 12235; Masonry $\to$ IS 2185). |
| **5** | **Compound Vernacular Queries** (Paver blocks matching Cement raw material) | Keyword "सीमेंट" triggered cement override, ignoring "पेवर ब्लॉक". | Compound noun priority in `nlp_extractor.py` ensuring finished products take precedence over raw ingredients. |

---

## 📅 Step-by-Step Implementation Roadmap

### Phase 1: Ingestion & LLM Call 1 (`pipeline/rag_engine/tender_doc_parser.py`)
- [x] Create `TenderDocParser` with Pydantic data models (`ExtractedTenderItem`, `TenderDocumentAnalysis`).
- [ ] Connect LLM Call 1 via `llm_gateway` to decompose multi-clause tender documents into clean, searchable queries with acronym expansions and extracted cited standards.

### Phase 2: Upgraded Retrieval & Fixes 1–5 (`pipeline/rag_engine/tri_retrieval.py` & `reranker_fusion.py`)
- [ ] Index CRS Electronics (`crs_complete_electronics.json`) for IT equipment and electronic appliances (`BIS_CRS` Scheme-II).
- [ ] Implement entity-weighted BM25 scoring (4x weight for Product & Grade tokens).
- [ ] Fix strict word boundary matching for exact IS numbers.
- [ ] Add 2-Tier Knowledge Graph fallback matrix so allied standards are never empty.
- [ ] Implement compound vernacular noun resolution for Hindi/regional inputs.

### Phase 3: Reasoning, Audit Trail & LLM Call 2 (`pipeline/rag_engine/llm_reasoner.py`)
- [ ] Connect LLM Call 2 to synthesize explainability traces, "Why" clause justifications, QCO compliance status (ISI vs CRS), and citation-ready spec draft export clauses.

### Phase 4: Master Pipeline Integration & Verification (`pipeline/rag_engine/pipeline_core.py`)
- [ ] Update `GraphRAGPipeline` to support both single query and full multi-item raw tender documents.
- [ ] Run the 19-query real-world procurement stress audit and verify 100% accuracy and 0 issues.
