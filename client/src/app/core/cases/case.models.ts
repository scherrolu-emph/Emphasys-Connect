import type { CaseType, ParticipantRole, InviteStatus, MessageType } from '../supabase/database.types';

export interface MilestoneSummary {
  id: string;
  title: string;
  status: 'open' | 'active' | 'completed';
  targetDays: number | null;
  activatedAt: string | null;
}

export interface CaseSummary {
  id: string;
  title: string;
  caseType: CaseType;
  activeMilestone: MilestoneSummary | null;
  prereqAccepted: number;
  prereqTotal: number;
}

export interface PrerequisiteSummary {
  id: string;
  title: string;
  type: 'document_submission' | 'acceptance_comment';
  status: 'pending_open' | 'received_processing' | 'accepted';
  requested: boolean;
  returned: boolean;
  ownerId: string | null;
  uploadLink: string | null;
  docName: string | null;
  notes: string | null;
  submittedAt: string | null;
  acceptedAt: string | null;
}

export interface MilestoneDetail {
  id: string;
  title: string;
  status: 'open' | 'active' | 'completed';
  orderIndex: number;
  targetDays: number | null;
  activatedAt: string | null;
  completedAt: string | null;
  prerequisites: PrerequisiteSummary[];
}

export interface CaseDetail {
  id: string;
  hfaId: string;
  title: string;
  referenceNumber: string | null;
  caseType: CaseType;
  milestones: MilestoneDetail[];
  activeMilestone: MilestoneDetail | null;
}

export interface CaseParticipant {
  id: string;
  hfaId: string;
  caseId: string;
  userId: string | null;
  email: string;
  displayName: string | null;
  role: ParticipantRole;
  inviteStatus: InviteStatus;
}

export interface ConversationMessage {
  id: string;
  hfaId: string;
  caseId: string;
  authorId: string | null;
  type: MessageType;
  content: string;
  createdAt: string;
}

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  blank: 'General',
  development_construction: 'Construction',
  loan_underwriting: 'Loan',
  bond_issuance: 'Application',
};

export type FilterType = 'all' | CaseType;

export const FILTER_CHIPS: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'development_construction', label: 'Construction' },
  { value: 'loan_underwriting', label: 'Loan' },
  { value: 'bond_issuance', label: 'Application' },
];
