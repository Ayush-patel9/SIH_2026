/**
 * tenderAnalysisClient.ts
 * API Client functions for 3-Stage Tender Pipeline & Chatbot
 */

import type {
  DecomposeResponse,
  Stage2MapResponse,
  ClarifyResponse,
  Stage3FinalizeResponse,
  StandardDetailResponse,
  ExtractedProductItem,
  MappedProductItem,
} from './types';
import { API_BASE } from '../../api/standardsClient';

export interface UploadTenderDocResponse {
  status: string;
  cloudinary_url: string;
  public_id: string;
  filename: string;
  bytes: number;
  format: string;
}

export async function uploadTenderDocument(file: File): Promise<UploadTenderDocResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/v1/tender/upload-document`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function stage1Decompose(
  documentText?: string,
  tenderTitle = 'Government Procurement Tender',
  issuingAuthority = 'CPWD / Public Authority',
  cloudinaryUrl?: string,
  projectId?: string
): Promise<DecomposeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/tender/stage1-decompose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_text: documentText || '',
      tender_title: tenderTitle,
      issuing_authority: issuingAuthority,
      cloudinary_url: cloudinaryUrl || undefined,
      project_id: projectId || undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Stage 1 Decomposition failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function stage2MapProducts(
  products: ExtractedProductItem[],
  documentText: string,
  projectId?: string
): Promise<Stage2MapResponse> {
  const res = await fetch(`${API_BASE}/api/v1/tender/stage2-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products,
      document_text: documentText,
      project_id: projectId || undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Stage 2 Mapping failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function stage2Clarify(
  productId: string,
  questionId: string,
  selectedOption: string,
  documentText: string,
  currentProductMapping: MappedProductItem,
  projectId?: string
): Promise<ClarifyResponse> {
  const res = await fetch(`${API_BASE}/api/v1/tender/stage2-clarify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      question_id: questionId,
      selected_option: selectedOption,
      document_text: documentText,
      current_product_mapping: currentProductMapping,
      project_id: projectId || undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Stage 2B Clarification failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function stage3Finalize(
  documentText: string,
  approvedItems: Array<{
    product_id: string;
    product_name: string;
    clause_number: string;
    page_number: number;
    approved_is: string;
    approved_title: string;
    verbatim_quote: string;
    officer_notes?: string;
  }>,
  projectId?: string
): Promise<Stage3FinalizeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/tender/stage3-finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_text: documentText,
      approved_items: approvedItems,
      project_id: projectId || undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Stage 3 Finalization failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function getStandardDetail(isNumber: string): Promise<StandardDetailResponse> {
  const encoded = encodeURIComponent(isNumber);
  const res = await fetch(`${API_BASE}/api/v1/tender/standards/detail/${encoded}`);

  if (!res.ok) {
    throw new Error(`Failed to retrieve standard details for ${isNumber}`);
  }

  return await res.json();
}

export async function sendTenderChatMessage(
  documentText: string,
  query: string,
  history: Array<{ sender: string; text: string }> = [],
  projectId?: string
): Promise<{ answer: string; referenced_pages: number[]; model_used: string }> {
  const res = await fetch(`${API_BASE}/api/v1/tender/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_text: documentText,
      query,
      conversation_history: history,
      project_id: projectId || undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chat query failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export const tenderAnalysisClient = {
  decomposeStage1: stage1Decompose,
  mapStage2: (documentText: string, products: ExtractedProductItem[], projectId?: string) =>
    stage2MapProducts(products, documentText, projectId),
  clarifyStage2: (
    productId: string,
    questionId: string,
    selectedOption: string,
    documentText: string,
    currentProductMapping: MappedProductItem,
    projectId?: string
  ) => stage2Clarify(productId, questionId, selectedOption, documentText, currentProductMapping, projectId),
  finalizeStage3: (
    documentText: string,
    mappedProducts: MappedProductItem[],
    _metadata?: any,
    projectId?: string
  ) => {
    const approvedItems = mappedProducts.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      clause_number: p.clause_number,
      page_number: p.page_number,
      approved_is: p.recommended_is,
      approved_title: p.recommended_is_title,
      verbatim_quote: p.verbatim_quote,
      officer_notes: p.officer_clarification_answer || p.engineering_rationale,
    }));
    return stage3Finalize(documentText, approvedItems, projectId);
  },
  getStandardDetail,
  sendTenderChatMessage,
};
