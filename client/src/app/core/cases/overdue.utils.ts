import type { MilestoneSummary } from './case.models';

export function isOverdue(milestone: MilestoneSummary | null): boolean {
  if (!milestone) return false;
  if (milestone.status === 'completed') return false;
  if (milestone.targetDays === null || milestone.activatedAt === null) return false;
  const deadline = new Date(milestone.activatedAt).getTime() + milestone.targetDays * 86_400_000;
  return deadline < Date.now();
}
