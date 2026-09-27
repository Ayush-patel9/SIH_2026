/**
 * feedbackStore.ts
 * Client-side persistent store for human-in-the-loop review tickets and moderation queue.
 */

import type { FeedbackRequest, VerificationStatus } from '../../types';
import feedbackMockRaw from '../../fixtures/feedback_request_mock.json';
import { getSession } from '../../store/userStore';

function getStoreKey(): string {
  const session = getSession();
  const userId = session?.id || 'anon';
  return `manakai_${userId}_feedback_queue`;
}

const SEED_FEEDBACK: FeedbackRequest[] = [
  feedbackMockRaw as unknown as FeedbackRequest,
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'fbk-steel-8821',
    timestamp: '2026-09-26T09:45:00Z',
    original_query_id: 'uuid-steel-4011',
    original_recommendation_id: 'rec-steel-001',
    submitter: {
      user_id: 'officer_sharma',
      role: 'BIS_EXPERT',
      ministry_code: 'Ministry of Steel',
    },
    feedback_type: 'MISSING_ALLIED_STANDARD',
    flagged_is_number: 'IS 2062:2011',
    correct_is_number: 'IS 1757:1988',
    officer_notes: 'Sub-zero Charpy V-notch impact test (IS 1757) should be flagged as mandatory for Grade E250 Quality D.',
    verified: true,
    verification_status: 'VERIFIED_CORRECT',
  },
  {
    $schema: 'SIH2026.FeedbackRequest.v1',
    feedback_id: 'fbk-cement-1092',
    timestamp: '2026-09-25T14:20:00Z',
    original_query_id: 'uuid-9f8a-4b2c-11e9',
    original_recommendation_id: 'rec-6d2f-48e2-b184',
    submitter: {
      user_id: 'auditor_menon',
      role: 'AUDITOR',
      ministry_code: 'CAG',
    },
    feedback_type: 'OUTDATED_STANDARD',
    flagged_is_number: 'IS 8112:1989',
    correct_is_number: 'IS 269:2015',
    officer_notes: 'Found vendor tender citing IS 8112 (withdrawn). The AI correctly detected the supersession.',
    verified: true,
    verification_status: 'VERIFIED_CORRECT',
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

  getAll(): FeedbackRequest[] {
    try {
      const key = getStoreKey();
      const stored = localStorage.getItem(key);
      if (!stored) {
        // Initialize with default seeds
        localStorage.setItem(key, JSON.stringify(SEED_FEEDBACK));
        return SEED_FEEDBACK;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_FEEDBACK;
    }
  },

  save(payload: FeedbackRequest): void {
    try {
      const existing = this.getAll();
      const updated = [payload, ...existing.filter((f) => f.feedback_id !== payload.feedback_id)];
      localStorage.setItem(getStoreKey(), JSON.stringify(updated));
      notifyFeedbackListeners();
    } catch (e) {
      console.warn('FeedbackStore: Failed to save feedback payload', e);
    }
  },

  add(payload: FeedbackRequest): void {
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

  exportJSON(): void {
    const all = this.getAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ManakAI_Expert_Feedback_Queue_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  resetDefaults(): void {
    localStorage.setItem(getStoreKey(), JSON.stringify(SEED_FEEDBACK));
    notifyFeedbackListeners();
  },
};
