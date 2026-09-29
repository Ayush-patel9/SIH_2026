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
    icon: "Search",
    title: "Query Entity Recognition",
    subtitle: "NLP + Named Entity Extraction on Procurement Intent",
  },
  vector_retrieval: {
    icon: "Compass",
    title: "Dense Vector Search",
    subtitle: "Semantic Cosine Similarity over 22,000+ Bureau Catalog Items",
  },
  graph_traversal: {
    icon: "Share2",
    title: "Knowledge Graph Expansion",
    subtitle: "Multi-Hop Normative Cross-Reference & Succession Traversal",
  },
  qco_compliance_lookup: {
    icon: "Scale",
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

/**
 * Synthesizes a beginner-friendly, non-technical metaphor and 3-part explainer:
 * 1. Simple Metaphor (What it is)
 * 2. The Danger/Audit Trap (Why officers get in trouble)
 * 3. Exact Action (What to paste in the tender)
 */
export function synthesizeExplainLikeImNewHere(rec: {
  is_number?: string;
  year_published?: number;
  title?: string;
  scope_snippet?: string;
  certification?: {
    mandatory?: boolean;
    scheme?: string;
    qco_order_name?: string | null;
  };
}) {
  const isNum = rec.is_number || "IS 269:2015";
  const numOnly = isNum.split(":")[0];
  
  if (numOnly.includes("269") || numOnly.includes("8112") || numOnly.includes("12269")) {
    return {
      metaphor: "Think of IS 269 as the official government recipe book and strength guarantee for cement.",
      trap: "Common Trap: Older government tenders used to cite IS 8112 (for 43 grade) or IS 12269 (for 53 grade). BIS withdrew both and merged them into IS 269:2015. Citing the old numbers gives vendors a legal loophole to supply uncertified stock.",
      action: "Actionable Requirement: Write 'IS 269:2015 with mandatory BIS ISI Mark' in your BoQ schedule. Always mandate compressive strength test certificates under IS 4031.",
    };
  }

  if (numOnly.includes("1786") || numOnly.includes("2062")) {
    return {
      metaphor: "Think of this standard as the earthquake and load-bearing backbone requirement for steel rebars/structural plates.",
      trap: "Common Trap: Older 1985/2000 revisions allowed mild steel without guaranteed seismic ductility. Steel QCO 2024 mandates Fe 500D / Fe 550D with strict elongation tolerances under IS 1786:2008.",
      action: "Actionable Requirement: Specify 'IS 1786:2008 Grade Fe 500D with BIS ISI Mark' and require chemical mill test certificates verifying Sulphur and Phosphorus limits.",
    };
  }

  if (numOnly.includes("4984") || numOnly.includes("14333")) {
    return {
      metaphor: "Think of IS 4984 as the leak-proof, non-toxic guarantee for drinking water supply pipes.",
      trap: "Common Trap: Citing unamended 1995 standards allows suppliers to use low-grade recycled PE-63 polymer instead of PE-80/PE-100 virgin grade, causing pipe bursts under pressure.",
      action: "Actionable Requirement: Specify 'IS 4984:2016 PN6/PN10 with Amendment 2 compliance and BIS Scheme-I ISI Mark'.",
    };
  }

  return {
    metaphor: `Think of ${isNum} as the mandatory quality benchmark protecting your department from substandard procurement.`,
    trap: `Common Trap: Standards get updated by BIS. Using an outdated version leaves the procurement officer personally liable during CVC and CAG audit reviews.`,
    action: `Actionable Requirement: Cite '${isNum}' explicitly in your tender document and require the vendor to upload a verified BIS license before bid evaluation.`,
  };
}
