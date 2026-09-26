/**
 * deadlineUtils.ts
 * Computes deadline urgency, days remaining countdowns, and formatting for gazette compliance deadlines.
 */

export function getDaysRemaining(deadlineISO: string | null | undefined): number | null {
  if (!deadlineISO) return null;
  const now = new Date();
  const deadline = new Date(deadlineISO);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export type UrgencyLevel = 'EXPIRED' | 'CRITICAL_URGENT' | 'APPROACHING' | 'NORMAL' | 'NO_DEADLINE';

export function getUrgencyLevel(daysRemaining: number | null): UrgencyLevel {
  if (daysRemaining === null) return 'NO_DEADLINE';
  if (daysRemaining <= 0) return 'EXPIRED';
  if (daysRemaining <= 7) return 'CRITICAL_URGENT';
  if (daysRemaining <= 30) return 'APPROACHING';
  return 'NORMAL';
}

export function formatDeadlineBadge(deadlineISO: string | null | undefined): {
  text: string;
  color: string;
  badgeClass: string;
} {
  const days = getDaysRemaining(deadlineISO);
  const level = getUrgencyLevel(days);

  switch (level) {
    case 'EXPIRED':
      return {
        text: 'DEADLINE EXPIRED',
        color: 'var(--error-line)',
        badgeClass: 'withdrawn',
      };
    case 'CRITICAL_URGENT':
      return {
        text: `⏰ ${days}d REMAINING (CRITICAL)`,
        color: 'var(--error-line)',
        badgeClass: 'withdrawn',
      };
    case 'APPROACHING':
      return {
        text: `⏳ ${days} days left`,
        color: '#B45309',
        badgeClass: 'in-progress',
      };
    case 'NORMAL':
      return {
        text: `📅 ${days} days remaining`,
        color: 'var(--ink-secondary)',
        badgeClass: 'active',
      };
    case 'NO_DEADLINE':
    default:
      return {
        text: 'NO FIXED DEADLINE',
        color: 'var(--ink-muted)',
        badgeClass: 'in-progress',
      };
  }
}
