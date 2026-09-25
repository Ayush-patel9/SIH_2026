# Feature 01: Explainability vs. Black-Box (Reasoning Trail & Subgraph Explorer)

## 1. Executive Summary & Value Proposition
Government procurement officers cannot legally or administratively rely on opaque "black-box" AI recommendations. If an officer cites a standard in a ₹50 Crore tender and it is challenged by a bidder or audited by the Central Vigilance Commission (CVC), the officer must justify *why* that standard was chosen.
This feature provides an end-to-end **Reasoning Trail & Interactive Knowledge Graph Explorer** that visualizes the exact 4-stage pipeline recursion (Named Entity Recognition $\rightarrow$ Vector Similarity $\rightarrow$ Knowledge Graph Traversal $\rightarrow$ QCO Regulatory Verification).

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Headless Graph Layout Engine**: Construct a deterministic node-link layout algorithm in TypeScript/Python (using D3-hierarchy, Cytoscape.js, or lightweight SVG force physics) that renders entity $\rightarrow$ standard $\rightarrow$ test method relationships without needing a live Neo4j database.
- **Scoring Breakdown Calculator**: Build pure mathematical formatting components that normalize weighted vector scores, keyword BM25 scores, and graph co-citation boosts into visual percentage bars.
- **4-Stage Stepper State Machine**: Implement a timeline parser that maps `reasoning_trace[]` array elements into discrete verification cards (NER, Vector Retrieval, Graph Expansion, QCO Enforcement).
- **Synthetic Graph Path Generator / Simulator**: A standalone utility that takes any raw query and produces a mock `graph_path` array for local testing and demonstration.
- **Fail-Safe Fallback Handler**: If `graph_path` is empty or the pipeline times out, automatically generate a "Direct Match Linage" fallback state so the interface never crashes.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Real dense vector cosine similarity calculations over 22,000 embedded Indian Standards.
- Real dynamic multi-hop traversal across all 50,000 normative references in `raw_ia_downloads`.
- Real-time LLM query intent extraction running against live Gemini/Ollama endpoints.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`StandardsResponse` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "reasoning_trace": [
    {
      "step": "query_understanding",
      "detail": "Identified product 'Ordinary Portland Cement', grade '43', domain 'Highway'.",
      "confidence": 0.98
    },
    {
      "step": "vector_retrieval",
      "detail": "Dense vector search returned IS 269:2015 (score 0.92) and IS 8112:1989 (score 0.88).",
      "confidence": 0.92
    },
    {
      "step": "graph_traversal",
      "detail": "Knowledge graph verified IS 8112:1989 is WITHDRAWN and consolidated into IS 269:2015.",
      "confidence": 1.0
    },
    {
      "step": "qco_compliance_lookup",
      "detail": "Verified Cement (Quality Control) Order 2003 mandates BIS ISI certification for IS 269.",
      "confidence": 0.99
    }
  ],
  "confidence_breakdown": {
    "semantic_vector_score": 0.45,
    "keyword_exact_match": 0.30,
    "graph_co_citation_boost": 0.19
  },
  "graph_path": [
    { "from": "43 Grade Cement", "to": "IS 8112:1989", "edge_type": "HISTORICAL_SPEC", "label": "Historically governed by" },
    { "from": "IS 8112:1989", "to": "IS 269:2015", "edge_type": "SUPERSEDED_BY", "label": "Consolidated into" },
    { "from": "IS 269:2015", "to": "IS 4031 (Part 1)", "edge_type": "REQUIRES_TEST_METHOD", "label": "Mandates testing via" }
  ]
}
```

### The Lock (How Application Consumes It):
- Pass `response.reasoning_trace` into `ReasoningTimeline`.
- Pass `response.graph_path` into `KnowledgeGraphViewer`.
- Pass `response.confidence_breakdown` into `ConfidenceBar`.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/explainability/graphParser.ts`: Converts raw `graph_path` edges into adjacency lists with node classification (Product, Withdrawn Standard, Active Standard, Test Method).
2. `src/modules/explainability/reasoningParser.ts`: Evaluates pipeline steps, flags low-confidence steps ($< 0.80$) with warning badges.
3. `src/modules/explainability/mockGraphGenerator.ts`: Generates rich relational graphs for testing all product categories (Cement, Steel, Electronics, Textiles).

### Edge-Case Handling:
- If `graph_path` is empty $\rightarrow$ Render single-node target: `Query` $\rightarrow$ `Primary Standard`.
- If `confidence_breakdown` is missing $\rightarrow$ Derive default 60/30/10 distribution from `primary_recommendation.confidence`.
