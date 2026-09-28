import { API_BASE } from '../../api/standardsClient';

export interface GazetteSummary {
  monitored_portals: number;
  portals_list: string[];
  protected_capital_cr: number;
  active_qco_orders: number;
  intercepted_citations: number;
  last_scan_timestamp: string;
  scan_iteration?: number;
}

export interface GazetteEvent {
  id: string;
  orderNumber: string;
  ministry: string;
  date: string;
  enforcementDate?: string;
  affectedStandard: string;
  supersededStandard?: string;
  eventType: 'NEW_QCO' | 'SUPERSEDED' | 'AMENDMENT' | 'WITHDRAWAL';
  impactedTendersCount: number;
  financialExposureCr: number;
  gazetteSnippet: string;
  actionRequired: string;
  category?: string;
  scheme?: string;
}

export interface GazetteRadarData {
  status: string;
  summary: GazetteSummary;
  total_events: number;
  events: GazetteEvent[];
}

export interface CorrigendumResponse {
  status: string;
  corrigendum_id: string;
  gazette_id: string;
  order_number: string;
  affected_standard: string;
  corrigendum_text: string;
  timestamp: string;
}

export async function fetchGazetteRadarData(): Promise<GazetteRadarData> {
  const response = await fetch(`${API_BASE}/api/v1/gazette/radar`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Gazette Radar data: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerGazetteScan(): Promise<GazetteRadarData & { message?: string; scanned_portals?: number }> {
  const response = await fetch(`${API_BASE}/api/v1/gazette/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to trigger Gazette scan: ${response.statusText}`);
  }
  return response.json();
}

export async function generateCorrigendum(
  gazetteId: string,
  tenderNitNumber = 'NIT-2026-MORTH-HQ-088',
  projectTitle = 'National Infrastructure Development Project'
): Promise<CorrigendumResponse> {
  const response = await fetch(`${API_BASE}/api/v1/gazette/corrigendum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gazette_id: gazetteId,
      tender_nit_number: tenderNitNumber,
      project_title: projectTitle,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate corrigendum: ${response.statusText}`);
  }
  return response.json();
}
