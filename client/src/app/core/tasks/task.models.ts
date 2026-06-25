import type { PrerequisiteStatus, PrerequisiteType } from '../supabase/database.types';

export interface MyTask {
  prereqId: string;
  prereqTitle: string;
  prereqType: PrerequisiteType;
  status: PrerequisiteStatus;
  caseId: string;
  caseTitle: string;
  milestoneId: string;
  milestoneName: string;
}
