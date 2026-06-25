import type { NotificationType } from '../supabase/database.types';

export interface AppNotification {
  id: string;
  hfaId: string;
  userId: string;
  caseId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  prereqId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface OverdueItem {
  caseId: string;
  caseTitle: string;
  milestoneId: string;
  milestoneName: string;
  daysOverdue: number;
}
