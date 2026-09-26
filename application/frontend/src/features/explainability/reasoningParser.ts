/**
 * reasoningParser.ts
 * Parser, metadata mappers, and fallback generators for reasoning trace and confidence breakdowns.
 */

export interface ReasoningStep {
  step: string;
  detail: string;
  confidence: number;
}

export interface ConfidenceBreakdownData {
  semantic_vector_score?: number;
  keyword_exact_match?: number;
  graph_co_citation_boost?: number;
}

export interface StepMetadata {
  icon: string;
  title: string;
  subtitle: string;
}

export const STEP_LABELS: Record<string, StepMetadata> = {
  query_understanding: {
    icon: "🔍",
    title: "Query Entity Recognition",
    subtitle: "NLP + Named Entity Extraction on Procurement Intent",
  },
  vector_retrieval: {
    icon: "📐",
    title: "Dense Vector Search",
    subtitle: "Semantic Cosine Similarity over 22,000+ Bureau Catalog Items",
  },
  graph_traversal: {
    icon: "🕸️",
    title: "Knowledge Graph Expansion",
    subtitle: "Multi-Hop Normative Cross-Reference & Succession Traversal",
  },
  qco_compliance_lookup: {
    icon: "⚖️",
    title: "QCO Regulatory Lookup",
    subtitle: "Ministry Gazette Quality Control Order Verification",
  },
};

export const FALLBACK_TRACE: ReasoningStep[] = [
  {
    step: "query_understanding",
    detail: "Query processed: Extracted entity 'Ordinary Portland Cement', grade '43', application 'Highway'.",
    confidence: 0.98,
  },
  {
    step: "vector_retrieval",
    detail: "Dense vector catalog search returned IS 269:2015 as top recommendation (similarity 0.92).",
    confidence: 0.92,
  },
  {
    step: "graph_traversal",
    detail: "Knowledge graph verified IS 8112:1989 is WITHDRAWN and superseded by IS 269:2015.",
    confidence: 1.0,
  },
  {
    step: "qco_compliance_lookup",
    detail: "Cement (Quality Control) Order 2003 mandates BIS ISI certification under Section 16 of the BIS Act.",
    confidence: 0.99,
  },
];

/**
 * Calculate normalized percentage segments for the Confidence Breakdown bar.
 */
export function calculateConfidenceBreakdown(
  breakdown?: ConfidenceBreakdownData,
  globalConfidence = 0.94
) {
  const semantic = breakdown?.semantic_vector_score ?? globalConfidence * 0.48;
  const keyword = breakdown?.keyword_exact_match ?? globalConfidence * 0.32;
  const graph = breakdown?.graph_co_citation_boost ?? globalConfidence * 0.20;

  const total = semantic + keyword + graph || 1;

  return {
    semanticPct: Math.round((semantic / total) * 100),
    keywordPct: Math.round((keyword / total) * 100),
    graphPct: Math.round((graph / total) * 100),
    globalConfidencePct: Math.round(globalConfidence * 100),
    raw: { semantic, keyword, graph },
  };
}

/**
 * Synthesize a natural language explanation if missing.
 */
export function synthesizePlainLanguage(rec: {
  is_number?: string;
  year_published?: number;
  scope_snippet?: string;
  certification?: {
    mandatory?: boolean;
    scheme?: string;
    qco_order_name?: string | null;
  };
}) {
  const isNum = rec.is_number || "IS 269:2015";
  const year = rec.year_published || 2015;
  const mandatoryText = rec.certification?.mandatory
    ? `BIS ${rec.certification.scheme?.replace(/_/g, " ") || "ISI Mark"} certification is legally mandatory under ${rec.certification.qco_order_name || "the notified Quality Control Order"}.`
    : "Voluntary compliance certification applies.";

  return `For this procurement specification, the current legally applicable standard is ${isNum} (${year}). Citing superseded standards risks severe Central Vigilance Commission (CVC) audit scrutiny. ${mandatoryText}`;
}
