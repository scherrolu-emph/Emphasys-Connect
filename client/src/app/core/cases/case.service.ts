import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { CaseType, MilestoneStatus, PrerequisiteStatus } from '../supabase/database.types';
import type { CaseSummary, MilestoneSummary } from './case.models';

interface RawPrereq {
  id: string;
  status: PrerequisiteStatus;
}

interface RawMilestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  target_days: number | null;
  activated_at: string | null;
  prerequisites: RawPrereq[];
}

interface RawCase {
  id: string;
  title: string;
  case_type: CaseType;
  milestones: RawMilestone[];
}

function mapMilestone(raw: RawMilestone): MilestoneSummary {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    targetDays: raw.target_days,
    activatedAt: raw.activated_at,
  };
}

function mapToSummary(raw: RawCase): CaseSummary {
  const active = raw.milestones.find(m => m.status === 'active') ?? null;
  const prereqTotal = active?.prerequisites.length ?? 0;
  const prereqAccepted = active?.prerequisites.filter(p => p.status === 'accepted').length ?? 0;

  return {
    id: raw.id,
    title: raw.title,
    caseType: raw.case_type,
    activeMilestone: active ? mapMilestone(active) : null,
    prereqAccepted,
    prereqTotal,
  };
}

@Injectable({ providedIn: 'root' })
export class CaseService {
  async getHfaCases(hfaId: string): Promise<CaseSummary[]> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        id,
        title,
        case_type,
        milestones (
          id,
          title,
          status,
          target_days,
          activated_at,
          prerequisites ( id, status )
        )
      `)
      .eq('hfa_id', hfaId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data as unknown as RawCase[]).map(mapToSummary);
  }
}
