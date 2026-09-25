# Implementation Plan: KG-Augmented RAG Pipeline for BIS Standards Intelligence Platform

## Overview
Implement the complete end-to-end **KG-Augmented RAG (GraphRAG) Pipeline** as specified in the architecture diagram, guaranteeing strict 100% compliance with the canonical API contract schema (`API_CONTRACT_SCHEMA.md`).

---

## 🏗️ Pipeline Architecture Mapping

```
                       [ Procurement Input ]
                     (Text / PDF / Query / Mode)
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │    NLP Extraction & Embedding     │
                │  (Entities, Language, Query Vec)  │
                └─────────────────┬─────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
 ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
 │ Vector Search │        │Knowledge Graph│        │Exact / Lexicon│
 │Dense/Semantic │        │Normative Refs │        │ IS No. & BM25 │
 └───────┬───────┘        └───────┬───────┘        └───────┬───────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │   Reranking & Score Fusion        │
                │(Dense + Graph Boost + Exact Bonus)│
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │        LLM Reasoning Layer        │
                │  (Synthesis, "Why", Gap-Check)    │
                └─────────────────┬─────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
 ┌────────────────────────┐                       ┌─────────────────┐
 │   StandardsResponse    │                       │Spec Draft Export│
 │  (Ranked Standards,    │                       │(Editable Tender │
 │   XAI, Audit Hash)     │                       │  Ready Clauses) │
 └────────────────────────┘                       └─────────────────┘
```

---

## 📋 Implementation Modules

### Module 1: `pipeline/rag_engine/llm_gateway.py`
- Centralized LLM caller with key rotation pool (`GEMINI_API_KEYS`), task-based routing (`gemini-2.5-flash` vs `gemini-2.5-pro`), automatic fallbacks, and deterministic offline resilience when API keys are absent.

### Module 2: `pipeline/rag_engine/nlp_extractor.py`
- Entity extraction (`PRODUCT`, `GRADE_SPECIFICATION`, `APPLICATION_DOMAIN`, `TEST_PARAMETER`), language detection (English, Hindi, Tamil, etc.), transliteration normalization, and query intent classification (`STANDARD_LOOKUP`, `COMPLIANCE_CHECK`, `OUTDATED_DETECTION`).

### Module 3: `pipeline/rag_engine/tri_retrieval.py`
- **Vector Retrieval**: Dense similarity / TF-IDF scoring across title, scope, product descriptions, and ICS codes.
- **Knowledge Graph Traversal**: Traverses normative reference edges (`clause2_normative_graph/normative_edges.json`), test method links, and supersession chains.
- **Keyword & Exact Match**: Regex IS extractor, synonym index lookup (`synonym_search_index.json`), and GeM category matching.

### Module 4: `pipeline/rag_engine/reranker_fusion.py`
- Reciprocal Rank Fusion (RRF) and weighted confidence score breakdown (`semantic_vector_score`, `keyword_exact_match`, `graph_co_citation_boost`).
- Outdated citation detection and automatic active replacement mapping.

### Module 5: `pipeline/rag_engine/llm_reasoner.py`
- Generates "Why" explanations for allied standards (`allied_standards[].why`).
- Generates reasoning traces (`reasoning_trace`), plain language executive summaries (`plain_language_explanation`), compliance checklists (`compliance_checklist`), and editable tender clauses for spec export.

### Module 6: `pipeline/rag_engine/pipeline_core.py`
- Main entry point: `GraphRAGPipeline.process_query(request: QueryRequest) -> StandardsResponse`.
- Attaches SHA-256 audit record hash and validates against `API_CONTRACT_SCHEMA.md`.

### Module 7: Verification & Comprehensive Test Suite
- `tests/test_kg_rag_pipeline.py` testing:
  1. 43 Grade Cement (IS 269:2015, IS 4031 allied test, IS 8112 outdated flag, QCO ISI mark).
  2. TMT Rebars for seismic design (IS 1786, IS 1608, IS 13920).
  3. Multilingual / Vernacular query (Hindi devanagari).
  4. Explicit withdrawn standard query (IS 8112).
  5. Spec draft export validation.
