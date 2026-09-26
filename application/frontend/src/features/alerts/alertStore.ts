import type { AlertPayload, CitationSeverity } from '../../types';

const ALERT_STORE_KEY = 'manakAI:alerts:v1';

export type AlertWithRead = AlertPayload & {
  _read?: boolean;
};

export const MOCK_ALERTS: AlertWithRead[] = [
  {
    $schema: 'SIH2026.AlertPayload.v1',
    alert_id: 'alt-001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    alert_type: 'STANDARD_WITHDRAWN',
    severity: 'CRITICAL',
    affected_standard: {
      is_number: 'IS 8112:1989',
      event: 'Standard Withdrawn — 43 Grade Ordinary Portland Cement specification consolidated into IS 269:2015',
      replacement: 'IS 269:2015',
    },
    affected_tenders: [
      {
        tender_id: 'NIT-PWD-2026-001',
        ministry: 'MoHUA',
        officer_user_id: 'officer_4091',
        cited_version: 'IS 8112:1989',
      },
      {
        tender_id: 'NIT-NHAI-2026-014',
        ministry: 'MoRTH',
        officer_user_id: 'officer_5892',
        cited_version: 'IS 8112:1989',
      },
    ],
    recommended_action:
      'Immediately issue corrigendum replacing IS 8112:1989 with IS 269:2015 (incorporating 43-grade requirements) across all tender clauses.',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    _read: false,
  },
  {
    $schema: 'SIH2026.AlertPayload.v1',
    alert_id: 'alt-002',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    alert_type: 'STANDARD_AMENDED',
    severity: 'HIGH',
    affected_standard: {
      is_number: 'IS 1786:2008',
      event: 'Amendment 3 published — mandatory rib geometry marking and nominal mass tolerance revisions for Fe 500D rebars',
      replacement: null,
    },
    affected_tenders: [
      {
        tender_id: 'NIT-NHAI-2026-014',
        ministry: 'MoRTH',
        officer_user_id: 'officer_5892',
        cited_version: 'IS 1786:2008 (Amd 2)',
      },
      {
        tender_id: 'NIT-RAIL-2026-088',
        ministry: 'Indian Railways',
        officer_user_id: 'officer_2104',
        cited_version: 'IS 1786:2008',
      },
    ],
    recommended_action:
      'Update tender technical specifications to explicitly reference IS 1786:2008 incorporating Amendment 3 for all high-ductility rebar consignments.',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    _read: false,
  },
  {
    $schema: 'SIH2026.AlertPayload.v1',
    alert_id: 'alt-003',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    alert_type: 'QCO_ENFORCEMENT_DATE',
    severity: 'CRITICAL',
    affected_standard: {
      is_number: 'IS 13252 (Part 1):2010',
      event: 'Compulsory Registration Scheme (CRS) mandatory enforcement date approaching under MeitY Electronics & IT Goods QCO',
      replacement: null,
    },
    affected_tenders: [
      {
        tender_id: 'NIT-SMART-2026-003',
        ministry: 'MeitY',
        officer_user_id: 'officer_7712',
        cited_version: 'IS 13252 (Part 1):2010',
      },
    ],
    recommended_action:
      'Disqualify bidders without valid BIS CRS R-number registration for surveillance CCTV equipment before financial bid opening.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    _read: false,
  },
  {
    $schema: 'SIH2026.AlertPayload.v1',
    alert_id: 'alt-004',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    alert_type: 'STANDARD_UNDER_REVISION',
    severity: 'MEDIUM',
    affected_standard: {
      is_number: 'IS 456:2000',
      event: 'BIS Technical Committee CED-2 reviewing IS 456 for comprehensive 2026 revision with new high-strength concrete mix codes',
      replacement: null,
    },
    affected_tenders: [
      {
        tender_id: 'NIT-MoHUA-2026-007',
        ministry: 'MoHUA',
        officer_user_id: 'officer_3301',
        cited_version: 'IS 456:2000',
      },
    ],
    recommended_action:
      'Monitor BIS Gazette publications. Existing contracts remain valid under IS 456:2000 until draft standard is formally gazetted.',
    deadline: null,
    _read: true,
  },
  {
    $schema: 'SIH2026.AlertPayload.v1',
    alert_id: 'alt-005',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    alert_type: 'NEW_MANDATORY_STANDARD',
    severity: 'HIGH',
    affected_standard: {
      is_number: 'IS 17800:2022',
      event: 'New mandatory quality control standard gazetted for Solar PV Modules under Ministry of New & Renewable Energy (MoNRE) Order',
      replacement: null,
    },
    affected_tenders: [
      {
        tender_id: 'NIT-CPWD-2026-019',
        ministry: 'CPWD',
        officer_user_id: 'officer_9012',
        cited_version: 'IS 17800:2022',
      },
    ],
    recommended_action:
      'All government rooftop and ground-mount solar tenders must mandate BIS Scheme-I certification under IS 17800:2022.',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    _read: false,
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('AlertStore listener error:', e);
    }
  });
}

export const AlertStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAll(): AlertWithRead[] {
    try {
      const stored = localStorage.getItem(ALERT_STORE_KEY);
      if (!stored) {
        this.save(MOCK_ALERTS);
        return MOCK_ALERTS;
      }
      return JSON.parse(stored);
    } catch {
      return MOCK_ALERTS;
    }
  },

  getById(alertId: string): AlertWithRead | undefined {
    return this.getAll().find((a) => a.alert_id === alertId);
  },

  save(alerts: AlertWithRead[]): void {
    try {
      localStorage.setItem(ALERT_STORE_KEY, JSON.stringify(alerts));
      notify();
    } catch (e) {
      console.error('Failed to save alerts to localStorage', e);
    }
  },

  acknowledge(alertId: string): void {
    const all = this.getAll();
    const idx = all.findIndex((a) => a.alert_id === alertId);
    if (idx >= 0) {
      all[idx]._read = true;
      this.save(all);
    }
  },

  markAllAsRead(): void {
    const all = this.getAll().map((a) => ({ ...a, _read: true }));
    this.save(all);
  },

  addAlert(alert: AlertWithRead): void {
    const all = this.getAll();
    const existingIdx = all.findIndex((a) => a.alert_id === alert.alert_id);
    if (existingIdx >= 0) {
      all[existingIdx] = alert;
    } else {
      all.unshift(alert);
    }
    this.save(all);
  },

  resetToMock(): void {
    this.save(MOCK_ALERTS);
  },

  getUnreadCount(): number {
    return this.getAll().filter((a) => !a._read).length;
  },

  getCriticalCount(): number {
    return this.getAll().filter((a) => a.severity === 'CRITICAL' && !a._read).length;
  },

  /**
   * Simulates a live push event from the BIS Gazette scraper / backend pipeline
   */
  simulateNewGazetteAlert(): AlertWithRead {
    const randomId = `alt-sim-${Math.floor(1000 + Math.random() * 9000)}`;
    const simAlerts: AlertWithRead[] = [
      {
        $schema: 'SIH2026.AlertPayload.v1',
        alert_id: randomId,
        timestamp: new Date().toISOString(),
        alert_type: 'STANDARD_AMENDED',
        severity: 'HIGH' as CitationSeverity,
        affected_standard: {
          is_number: 'IS 383:2016',
          event: 'Amendment 2 published in Gazette of India — revised limits for alkali-silica reactive aggregate in structural works',
          replacement: null,
        },
        affected_tenders: [
          {
            tender_id: 'NIT-PWD-2026-001',
            ministry: 'MoHUA',
            officer_user_id: 'officer_4091',
            cited_version: 'IS 383:2016',
          },
        ],
        recommended_action:
          'Issue addendum requiring test certificates per Amendment 2 test protocols before aggregate batching.',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        _read: false,
      },
      {
        $schema: 'SIH2026.AlertPayload.v1',
        alert_id: randomId,
        timestamp: new Date().toISOString(),
        alert_type: 'STANDARD_SUPERSEDED',
        severity: 'CRITICAL' as CitationSeverity,
        affected_standard: {
          is_number: 'IS 800:1984',
          event: 'Working Stress Design code IS 800:1984 superseded — Limit State Method under IS 800:2007 mandatory',
          replacement: 'IS 800:2007',
        },
        affected_tenders: [
          {
            tender_id: 'NIT-RAIL-2026-088',
            ministry: 'Indian Railways',
            officer_user_id: 'officer_2104',
            cited_version: 'IS 800:1984',
          },
        ],
        recommended_action:
          'Audit tender structural calculations and update all design requirements to Limit State Method (IS 800:2007).',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        _read: false,
      },
    ];

    const chosen = simAlerts[Math.floor(Math.random() * simAlerts.length)];
    this.addAlert(chosen);
    return chosen;
  },
};
