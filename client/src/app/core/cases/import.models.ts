import type { CaseType, ParticipantRole } from '../supabase/database.types';

export interface ImcPrerequisite {
  id: string;
  title: string;
  type: 'document_submission' | 'acceptance_comment';
}

export interface ImcMilestone {
  id: string;
  title: string;
  order: number;
  prerequisites: ImcPrerequisite[];
}

export interface ImcProject {
  id: string;
  projectNumber: string;
  name: string;
  address: string;
  developerEmail: string;
  milestones: ImcMilestone[];
}

export interface ParticipantDraft {
  email: string;
  role: ParticipantRole;
  source: 'imc' | 'manual' | 'creator';
}

export interface CreateCasePayload {
  caseType: CaseType;
  title: string;
  imcProject?: ImcProject;
  participants: ParticipantDraft[];
}

export interface CreateCaseRouteState {
  caseType: CaseType;
  imcProject?: ImcProject;
  caseTitle?: string;
}
