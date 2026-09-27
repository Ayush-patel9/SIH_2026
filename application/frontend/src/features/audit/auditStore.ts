/**
 * auditStore.ts
 * Client-side persistent vault storing all query records and audit certificates in localStorage.
 */

import type { StandardsResponse } from '../../types';

export interface StoredAuditRecord {
  id: string;
  response: StandardsResponse;
  savedAt: number;
}

const STORAGE_PREFIX = 'manakai_audit_';

export const AuditStore = {
  save(response: StandardsResponse): void {
    try {
      const queryId = response.meta?.query_id || `query-${Date.now()}`;
      const key = `${STORAGE_PREFIX}${queryId}`;
      const entry: StoredAuditRecord = {
        id: queryId,
        response,
        savedAt: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('AuditStore: Failed to save audit log entry to localStorage', e);
    }
  },

  add(response: StandardsResponse): void {
    this.save(response);
  },

  getAll(): StoredAuditRecord[] {
    try {
      const records: StoredAuditRecord[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              records.push(JSON.parse(item));
            } catch {
              // ignore corrupted entry
            }
          }
        }
      }
      return records.sort((a, b) => b.savedAt - a.savedAt);
    } catch (e) {
      console.warn('AuditStore: Failed to load audit logs', e);
      return [];
    }
  },

  findByHash(hash: string): StoredAuditRecord | undefined {
    const cleaned = hash.trim().toLowerCase();
    return this.getAll().find(
      (entry) =>
        entry.response.audit_record?.audit_hash?.toLowerCase() === cleaned ||
        entry.response.meta?.audit_reference_hash?.toLowerCase() === cleaned
    );
  },

  exportCSV(): void {
    const records = this.getAll();
    if (records.length === 0) {
      alert('No audit logs available to export.');
      return;
    }

    const headers = [
      'Query ID',
      'Recommendation Ref',
      'Timestamp (UTC)',
      'Primary Standard',
      'Title',
      'Division',
      'Audit Hash (SHA-256)',
      'Logged',
      'Dry Run',
      'RTI Exportable',
    ];

    const rows = records.map((r) => {
      const resp = r.response;
      return [
        `"${resp.meta?.query_id || ''}"`,
        `"${resp.audit_record?.recommendation_id || ''}"`,
        `"${resp.meta?.timestamp || ''}"`,
        `"${resp.primary_recommendation?.is_number || ''}"`,
        `"${(resp.primary_recommendation?.title || '').replace(/"/g, '""')}"`,
        `"${resp.primary_recommendation?.division_code || ''}"`,
        `"${resp.audit_record?.audit_hash || resp.meta?.audit_reference_hash || ''}"`,
        resp.audit_record?.logged ? 'TRUE' : 'FALSE',
        resp.audit_record?.dry_run ? 'TRUE' : 'FALSE',
        resp.audit_record?.rti_exportable ? 'TRUE' : 'FALSE',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ManakAI_CVC_Audit_Vault_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
