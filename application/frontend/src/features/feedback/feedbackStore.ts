/**
 * feedbackStore.ts
 * Persistent store & Continuous Learning telemetry for Human-in-the-Loop
 * Officer Review Queue & BIS Technical Sectional Committee Moderation.
 */

import type { FeedbackRequest, VerificationStatus } from '../../types';
import { getSession } from '../../store/userStore';

export interface ExtendedFeedbackItem extends FeedbackRequest {
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sectional_committee?: string; // e.g. "CED 02 (Cement & Concrete)", "MTD 04 (Steel)"
  affected_tenders_count?: number;
  gazette_qco_ref?: string;
}

function getStoreKey(): string {
  const session = getSession();
  const userId = session?.id || 'officer';
  return `manakai_${userId}_feedback_moderation_queue_v2`;
}

const COMPREHENSIVE_SEED_FEEDBACK: ExtendedFeedbackItem[] = [
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-CAG-2026-901',
    timestamp: '2026-09-29T08:30:00Z',
    original_query_id: 'uuid-cag-audit-4091',
    original_recommendation_id: 'rec-cement-001',
    submitter: {
      user_id: 'auditor_menon',
      role: 'OFFICER',
      ministry_code: 'CAG Audit Cell',
    },
    feedback_type: 'OUTDATED_STANDARD',
    flagged_is_number: 'IS 8112:1989',
    correct_is_number: 'IS 269:2015',
    officer_notes: 'Public tender cited withdrawn IS 8112 for 43-grade OPC. Mandatory QCO requires consolidated IS 269:2015.',
    verified: true,
    verification_status: 'VERIFIED_CORRECT',
    severity: 'CRITICAL',
    sectional_committee: 'CED 02 (Cement and Concrete Sectional Committee)',
    affected_tenders_count: 14,
    gazette_qco_ref: 'Cement (Quality Control) Order, S.O. 1404(E)',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-RLY-2026-412',
    timestamp: '2026-09-28T16:15:00Z',
    original_query_id: 'uuid-rail-girder-8812',
    original_recommendation_id: 'rec-steel-002',
    submitter: {
      user_id: 'chief_eng_sharma',
      role: 'OFFICER',
      ministry_code: 'Ministry of Railways (CORE)',
    },
    feedback_type: 'MISSING_ALLIED_STANDARD',
    flagged_is_number: 'IS 2062:2011',
    correct_is_number: 'IS 1757 (Part 1):2020',
    officer_notes: 'Sub-zero Charpy V-notch impact testing per IS 1757 must be explicitly enforced for Grade E250 BR bridge girders.',
    verified: false,
    verification_status: 'PENDING',
    severity: 'HIGH',
    sectional_committee: 'MTD 04 (Wrought Steel Products)',
    affected_tenders_count: 8,
    gazette_qco_ref: 'Steel and Steel Products (Quality Control) Order 2024',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-JJM-2026-108',
    timestamp: '2026-09-28T11:45:00Z',
    original_query_id: 'uuid-jjm-pipes-3301',
    original_recommendation_id: 'rec-pipes-003',
    submitter: {
      user_id: 'eng_verma',
      role: 'OFFICER',
      ministry_code: 'Jal Jeevan Mission / UP Jal Nigam',
    },
    feedback_type: 'OUTDATED_STANDARD',
    flagged_is_number: 'IS 4984:1995',
    correct_is_number: 'IS 4984:2016 (Amd 3)',
    officer_notes: 'Tender cited superseded 1995 edition lacking virgin PE-100 resin and Environmental Stress Crack Resistance (ESCR) requirements.',
    verified: false,
    verification_status: 'PENDING',
    severity: 'CRITICAL',
    sectional_committee: 'MED 17 (Plastics Piping Systems)',
    affected_tenders_count: 22,
    gazette_qco_ref: 'Potable Water Distribution Mandatory ISI Scheme',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-CPWD-2026-304',
    timestamp: '2026-09-27T14:20:00Z',
    original_query_id: 'uuid-cpwd-rebar-7711',
    original_recommendation_id: 'rec-rebar-004',
    submitter: {
      user_id: 'se_patil',
      role: 'OFFICER',
      ministry_code: 'CPWD Central Vista Project',
    },
    feedback_type: 'WRONG_CERTIFICATION',
    flagged_is_number: 'IS 1786:1985',
    correct_is_number: 'IS 1786:2008 Grade Fe 500D',
    officer_notes: 'Rebar specification restricted to 3 primary brand names violating GFR Rule 144(xi); updated to non-restrictive Fe 500D BIS licensees.',
    verified: true,
    verification_status: 'VERIFIED_CORRECT',
    severity: 'HIGH',
    sectional_committee: 'CED 54 (Concrete Reinforcement)',
    affected_tenders_count: 5,
    gazette_qco_ref: 'GFR 2017 Rule 144(xi) Non-Restrictive Competition',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-DISCOM-2026-550',
    timestamp: '2026-09-27T09:10:00Z',
    original_query_id: 'uuid-discom-xfmr-9022',
    original_recommendation_id: 'rec-transformer-005',
    submitter: {
      user_id: 'dir_elec_mishra',
      role: 'OFFICER',
      ministry_code: 'State Electricity Transmission (UPPCL)',
    },
    feedback_type: 'OUTDATED_STANDARD',
    flagged_is_number: 'IS 2026:1977',
    correct_is_number: 'IS 1180 (Part 1):2014',
    officer_notes: '1977 distribution transformer losses non-compliant with mandatory Bureau of Energy Efficiency (BEE) Star Rating Level-2 norms.',
    verified: false,
    verification_status: 'PENDING',
    severity: 'HIGH',
    sectional_committee: 'ETD 16 (Transformers)',
    affected_tenders_count: 11,
    gazette_qco_ref: 'BEE Energy Conservation Act & QCO 2023',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-NHAI-2026-720',
    timestamp: '2026-09-26T15:00:00Z',
    original_query_id: 'uuid-nhai-bitumen-1190',
    original_recommendation_id: 'rec-bitumen-006',
    submitter: {
      user_id: 'highway_gm_singh',
      role: 'OFFICER',
      ministry_code: 'NHAI / MoRTH',
    },
    feedback_type: 'WRONG_STANDARD',
    flagged_is_number: 'IS 702:1988',
    correct_is_number: 'IS 73:2013 (VG-30 / VG-40)',
    officer_notes: 'Industrial bitumen (IS 702) was erroneously cited instead of highway paving grade bitumen (IS 73). Remediation verified.',
    verified: true,
    verification_status: 'VERIFIED_CORRECT',
    severity: 'MEDIUM',
    sectional_committee: 'PCD 03 (Bitumen, Tar and Related Products)',
    affected_tenders_count: 7,
    gazette_qco_ref: 'MoRTH Specifications for Road and Bridge Works',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'FBK-MES-2026-880',
    timestamp: '2026-09-25T13:30:00Z',
    original_query_id: 'uuid-mes-cable-5510',
    original_recommendation_id: 'rec-cable-007',
    submitter: {
      user_id: 'col_raghavan',
      role: 'OFFICER',
      ministry_code: 'Military Engineer Services (DRDO)',
    },
    feedback_type: 'MISSING_ALLIED_STANDARD',
    flagged_is_number: 'IS 7098 (Part 2):2011',
    correct_is_number: 'IS 10810 (Part 53):2021',
    officer_notes: 'Underground armoring & Flame Retardant Low Smoke (FRLS) oxygen index testing required escalation to Sectional Committee.',
    verified: false,
    verification_status: 'ESCALATED',
    severity: 'HIGH',
    sectional_committee: 'ETD 09 (Power Cables)',
    affected_tenders_count: 3,
    gazette_qco_ref: 'Defence Infrastructure Security Specification',
  },
];

type FeedbackListener = () => void;
const feedbackListeners = new Set<FeedbackListener>();

function notifyFeedbackListeners() {
  feedbackListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('FeedbackStore listener error:', e);
    }
  });
}

export const FeedbackStore = {
  subscribe(listener: FeedbackListener): () => void {
    feedbackListeners.add(listener);
    return () => feedbackListeners.delete(listener);
  },

  getAll(): ExtendedFeedbackItem[] {
    try {
      const key = getStoreKey();
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(COMPREHENSIVE_SEED_FEEDBACK));
        return COMPREHENSIVE_SEED_FEEDBACK;
      }
      return JSON.parse(stored);
    } catch {
      return COMPREHENSIVE_SEED_FEEDBACK;
    }
  },

  save(payload: ExtendedFeedbackItem): void {
    try {
      const existing = this.getAll();
      const updated = [payload, ...existing.filter((f) => f.feedback_id !== payload.feedback_id)];
      localStorage.setItem(getStoreKey(), JSON.stringify(updated));
      notifyFeedbackListeners();
    } catch (e) {
      console.warn('FeedbackStore: Failed to save feedback payload', e);
    }
  },

  add(payload: ExtendedFeedbackItem): void {
    this.save(payload);
  },

  updateStatus(feedbackId: string, newStatus: VerificationStatus): void {
    try {
      const existing = this.getAll();
      const updated = existing.map((item) => {
        if (item.feedback_id === feedbackId) {
          return {
            ...item,
            verification_status: newStatus,
            verified: ['VERIFIED_CORRECT', 'VERIFIED_INCORRECT'].includes(newStatus),
          };
        }
        return item;
      });
      localStorage.setItem(getStoreKey(), JSON.stringify(updated));
      notifyFeedbackListeners();
    } catch (e) {
      console.warn('FeedbackStore: Failed to update status', e);
    }
  },

  batchUpdateStatus(feedbackIds: string[], newStatus: VerificationStatus): void {
    try {
      const existing = this.getAll();
      const updated = existing.map((item) => {
        if (feedbackIds.includes(item.feedback_id)) {
          return {
            ...item,
            verification_status: newStatus,
            verified: ['VERIFIED_CORRECT', 'VERIFIED_INCORRECT'].includes(newStatus),
          };
        }
        return item;
      });
      localStorage.setItem(getStoreKey(), JSON.stringify(updated));
      notifyFeedbackListeners();
    } catch (e) {
      console.warn('FeedbackStore: Failed to batch update status', e);
    }
  },

  delete(feedbackId: string): void {
    try {
      const existing = this.getAll();
      const updated = existing.filter((f) => f.feedback_id !== feedbackId);
      localStorage.setItem(getStoreKey(), JSON.stringify(updated));
      notifyFeedbackListeners();
    } catch (e) {
      console.warn('FeedbackStore: Failed to delete feedback ticket', e);
    }
  },

  exportJSON(): void {
    const all = this.getAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ManakAI_Human_Moderation_Queue_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  resetDefaults(): void {
    localStorage.setItem(getStoreKey(), JSON.stringify(COMPREHENSIVE_SEED_FEEDBACK));
    notifyFeedbackListeners();
  },
};
