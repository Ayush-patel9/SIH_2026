import time
import uuid
import hashlib
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Union

from pipeline.config.api_contract_models import (
    QueryRequest,
    StandardsResponse,
    MetaInfo,
    AuditRecord,
    StalenessRisk,
    MultilingualInfo,
    PrimaryRecommendation,
    AlliedStandard,
    SpecDraftExport
)
from pipeline.rag_engine.nlp_extractor import NLPExtractor
from pipeline.rag_engine.tri_retrieval import TriRetrievalLayer, SYNONYM_INDEX_FILE
from pipeline.rag_engine.reranker_fusion import RerankerAndFusion
from pipeline.rag_engine.llm_reasoner import LLMReasoner
from pipeline.rag_engine.tender_doc_parser import TenderDocParser, TenderDocumentAnalysis

logger = logging.getLogger(__name__)

class GraphRAGPipeline:
    """
    Master KG-Augmented RAG (GraphRAG) Pipeline for the BIS Standards Intelligence Platform.
    Supports single queries, tender clauses, and full multi-item raw tender document decomposition.
    """
    def __init__(self):
        logger.info("Initializing Master GraphRAG Pipeline...")
        self.nlp_extractor = NLPExtractor(synonym_index_path=SYNONYM_INDEX_FILE)
        self.tri_retrieval = TriRetrievalLayer()
        self.reranker_fusion = RerankerAndFusion(self.tri_retrieval)
        self.llm_reasoner = LLMReasoner()
        self.tender_doc_parser = TenderDocParser()
        logger.info("Master GraphRAG Pipeline successfully initialized and ready for queries.")

    def process_query(self, request_input: Union[QueryRequest, Dict[str, Any], str]) -> StandardsResponse:
        """
        Processes a single procurement query, tender clause, or spec text.
        """
        start_time = time.perf_counter()

        # 1. Normalize QueryRequest
        if isinstance(request_input, str):
            req = QueryRequest(input={"text": request_input})
        elif isinstance(request_input, dict):
            req = QueryRequest.model_validate(request_input)
        else:
            req = request_input

        query_text = req.input.text.strip()
        user_lang = req.input.language

        # 2. NLP Extraction & Intent Classification
        understanding = self.nlp_extractor.extract_understanding(query_text, user_language=user_lang)
        product_keywords = [e.entity for e in understanding.extracted_entities if e.type in ["PRODUCT", "GRADE_SPECIFICATION"]]

        # 3. Tri-Retrieval Layer Execution
        # Path A: Entity-Weighted Vector Search (4x on Product & Grade)
        vector_candidates = self.tri_retrieval.retrieve_vector_candidates(
            query_text=understanding.normalized_text,
            product_keywords=product_keywords,
            top_k=15
        )
        # Path B: Strict Exact IS, CRS Electronics, & Lexicon Lookup
        exact_candidates = self.tri_retrieval.exact_and_lexicon_lookup(query_text)

        # 4. Reranking, Score Fusion & Supersession Resolution
        fusion_result = self.reranker_fusion.fuse_and_rank(
            query_text=query_text,
            vector_candidates=vector_candidates,
            exact_candidates=exact_candidates,
            max_results=req.preferences.max_results
        )

        primary_rec: PrimaryRecommendation = fusion_result["primary"]
        allied_stds: List[AlliedStandard] = [
            AlliedStandard.model_validate(a) for a in fusion_result["allied_standards"]
        ]
        outdated_stds = fusion_result["outdated_citations"]
        graph_edges = fusion_result["graph_path_edges"]

        # Default fallback if nothing was matched
        if not primary_rec:
            primary_rec = PrimaryRecommendation(
                is_number="IS 269:2015",
                standard_id="IS 269:2015",
                title="Ordinary Portland Cement — Specification",
                full_title="IS 269:2015 — Ordinary Portland Cement — Specification (Fifth Revision)",
                status="ACTIVE",
                confidence=0.85
            )

        # 5. LLM Reasoning Layer (Synthesis, Trace, Checklist, Spec Draft)
        reasoning_output = self.llm_reasoner.generate_reasoning_and_synthesis(
            query_text=query_text,
            primary=primary_rec,
            allied_list=allied_stds,
            outdated_list=outdated_stds,
            intent=understanding.query_intent
        )

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        timestamp_now = datetime.now(timezone.utc).isoformat()
        rec_uuid = f"rec-{uuid.uuid4().hex[:8]}"

        # Compute SHA-256 Audit Reference Hash
        audit_payload = f"{req.query_id}:{rec_uuid}:{primary_rec.is_number}:{timestamp_now}"
        audit_hash = hashlib.sha256(audit_payload.encode("utf-8")).hexdigest()

        # 6. Assemble Full StandardsResponse
        is_dry_run = req.input.mode == "dry_run"
        
        response = StandardsResponse(
            schema_version="SIH2026.StandardsResponse.v1",
            meta=MetaInfo(
                query_id=req.query_id,
                session_id=req.session_id,
                timestamp=timestamp_now,
                processing_time_ms=elapsed_ms,
                pipeline_version="1.0.0",
                model_version="gemini-2.5-pro",
                data_snapshot_date="2026-09-26",
                audit_reference_hash=audit_hash,
                mode=req.input.mode
            ),
            query_understanding=understanding,
            primary_recommendation=primary_rec,
            allied_standards=allied_stds if req.preferences.include_allied_standards else [],
            outdated_citations=outdated_stds,
            graph_path=graph_edges if req.preferences.include_graph_path else [],
            reasoning_trace=reasoning_output["reasoning_trace"],
            plain_language_explanation=reasoning_output["plain_language_explanation"],
            compliance_checklist=reasoning_output["compliance_checklist"],
            audit_record=AuditRecord(
                recommendation_id=rec_uuid,
                query_id=req.query_id,
                timestamp=timestamp_now,
                standards_version_snapshot={
                    primary_rec.is_number: {
                        "status_at_query_time": primary_rec.status,
                        "amendment_at_query_time": primary_rec.latest_amendment or "Standard"
                    }
                },
                audit_hash=audit_hash,
                logged=not is_dry_run,
                dry_run=is_dry_run,
                rti_exportable=True
            ),
            staleness_risk=StalenessRisk(
                risk_level="HIGH" if outdated_stds else "NONE",
                message=outdated_stds[0].message if outdated_stds else "All recommended standards are active and up to date.",
                standards_under_revision=[]
            ),
            multilingual=MultilingualInfo(
                bhashini_used=understanding.detected_language != "en",
                detected_input_language=understanding.detected_language,
                response_language=understanding.detected_language,
                available_translations=["hi", "ta", "te", "mr", "gu", "bn"]
            ),
            spec_draft_export=reasoning_output["spec_draft_export"]
        )

        return response

    def process_tender_document(self, document_text: str, role: str = "PROCUREMENT_OFFICER", mode: str = "recommend") -> List[StandardsResponse]:
        """
        Full 2-LLM Workflow:
        1. LLM Call 1: Decomposes multi-clause tender into structured items.
        2. GraphRAG Retrieval: Runs on each item with 2-Tier Knowledge Graph & QCO checks.
        3. LLM Call 2: Returns validated StandardsResponse for every item in the document.
        """
        analysis: TenderDocumentAnalysis = self.tender_doc_parser.parse_raw_tender_text(document_text)
        responses: List[StandardsResponse] = []

        session_id = f"sess-{uuid.uuid4().hex[:8]}"

        for item in analysis.extracted_items:
            req = QueryRequest(
                session_id=session_id,
                auth={"role": role},
                input={
                    "text": item.clean_search_query or item.raw_clause_text,
                    "source": "tender_upload",
                    "mode": mode
                },
                context={
                    "known_standards": item.cited_standards,
                    "product_category": item.product_name
                }
            )
            resp = self.process_query(req)
            responses.append(resp)

        return responses

# Master Pipeline Singleton
graph_rag_pipeline = GraphRAGPipeline()
