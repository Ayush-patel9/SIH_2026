/**
 * projectsClient.ts
 * REST Client for Neon PostgreSQL Projects, Tenders & Ingestion Endpoints.
 */
import { API_BASE } from '../../api/standardsClient';
const API_BASE_URL = `${API_BASE}/api/v1`;

export interface BackendProject {
  id: string;
  nitNumber: string;
  title: string;
  department: string;
  estimatedValue: string;
  status: 'DRAFT' | 'INGESTED' | 'ANALYZING' | 'NEEDS_REVIEW' | 'COMPLETED';
  complianceScore: number;
  hasDocument: boolean;
  lastModified?: string;
  recencyTimestamp: number;
  pdfFileName?: string | null;
  pdfUrl?: string | null;
  documentText?: string | null;
  isFrozen?: boolean;
  isAnalyzed?: boolean;
  analysisPhase?: string;
  stage1Data?: any;
  stage2Data?: any;
  stage3Data?: any;
}

export const projectsClient = {
  /**
   * Fetch all procurement projects from Neon PostgreSQL.
   */
  async getProjects(): Promise<BackendProject[]> {
    try {
      const resp = await fetch(`${API_BASE_URL}/projects`);
      if (!resp.ok) {
        throw new Error(`Failed to load projects: HTTP ${resp.status}`);
      }
      const data = await resp.json();
      return data.projects || [];
    } catch (err) {
      console.error('Error fetching projects from Neon:', err);
      throw err;
    }
  },

  /**
   * Fetch a single project with its full tender text, Cloudinary PDF, and saved analysis.
   */
  async getProject(projectId: string): Promise<BackendProject> {
    const resp = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    if (!resp.ok) {
      throw new Error(`Project ${projectId} not found: HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.project;
  },

  /**
   * Create a new procurement project in Neon PostgreSQL.
   */
  async createProject(payload: {
    title: string;
    nitNumber: string;
    department: string;
    estimatedValue?: string;
  }): Promise<BackendProject> {
    const resp = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: payload.title,
        nit_number: payload.nitNumber,
        department: payload.department,
        estimated_value: payload.estimatedValue || 'TBD',
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to create project: HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.project;
  },

  /**
   * Ingest and freeze a tender specification document for a project.
   */
  async ingestDocument(
    projectId: string,
    payload: {
      documentText: string;
      filename?: string;
      cloudinaryUrl?: string | null;
      cloudinaryPublicId?: string | null;
    }
  ): Promise<any> {
    const resp = await fetch(`${API_BASE_URL}/projects/${projectId}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_text: payload.documentText,
        filename: payload.filename || 'TENDER_SPECIFICATION.pdf',
        cloudinary_url: payload.cloudinaryUrl || null,
        cloudinary_public_id: payload.cloudinaryPublicId || null,
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to ingest document: HTTP ${resp.status}`);
    }
    return await resp.json();
  },

  /**
   * Delete a procurement project from Neon PostgreSQL.
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const resp = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to delete project: HTTP ${resp.status}`);
    }
    return true;
  },

  /**
   * Fetch chat history for a project.
   */
  async getChatHistory(projectId: string): Promise<any[]> {
    try {
      const resp = await fetch(`${API_BASE_URL}/projects/${projectId}/chat`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.history || [];
    } catch {
      return [];
    }
  },
};

