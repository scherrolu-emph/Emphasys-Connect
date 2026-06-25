import type { PrerequisiteSummary } from './case.models';

export type DisplayPrereqStatus =
  | 'not_ready'
  | 'pending'
  | 'deficiency'
  | 'submitted_under_review'
  | 'accepted';

export function getDisplayStatus(
  prereq: PrerequisiteSummary,
  milestoneStatus: 'open' | 'active' | 'completed',
): DisplayPrereqStatus {
  if (milestoneStatus !== 'active') return 'not_ready';
  if (prereq.status === 'received_processing') return 'submitted_under_review';
  if (prereq.status === 'pending_open' && prereq.returned) return 'deficiency';
  if (prereq.status === 'pending_open') return 'pending';
  return 'accepted';
}
