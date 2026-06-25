import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { MyTask } from './task.models';
import type { Database } from '../supabase/database.types';

type PrereqRow = Pick<
  Database['public']['Tables']['prerequisites']['Row'],
  'id' | 'title' | 'type' | 'status' | 'case_id' | 'milestone_id'
>;
type CaseRow = Pick<Database['public']['Tables']['cases']['Row'], 'id' | 'title'>;
type MilestoneRow = Pick<Database['public']['Tables']['milestones']['Row'], 'id' | 'title'>;

@Injectable({ providedIn: 'root' })
export class TaskService {
  async getMyTasks(userId: string, isHfa: boolean, hfaId: string | null): Promise<MyTask[]> {
    const caseIds = isHfa
      ? await this.getHfaCaseIds(hfaId)
      : await this.getParticipantCaseIds(userId);

    if (caseIds.length === 0) return [];

    const { data: activeMilestones, error: mErr } = await supabase
      .from('milestones')
      .select('id')
      .in('case_id', caseIds)
      .eq('status', 'active');
    if (mErr) throw mErr;
    const activeMilestoneIds = (activeMilestones ?? []).map(m => m.id);
    if (activeMilestoneIds.length === 0) return [];

    const statusFilter = isHfa ? 'received_processing' : 'pending_open';

    const { data: prereqs, error: pErr } = await supabase
      .from('prerequisites')
      .select('id, title, type, status, case_id, milestone_id')
      .in('milestone_id', activeMilestoneIds)
      .eq('status', statusFilter);

    if (pErr) throw pErr;
    if (!prereqs || prereqs.length === 0) return [];

    const typedPrereqs = prereqs as PrereqRow[];
    const milestoneIds = [...new Set(typedPrereqs.map(p => p.milestone_id))];
    const uniqueCaseIds = [...new Set(typedPrereqs.map(p => p.case_id))];

    const [milestoneMap, caseMap] = await Promise.all([
      this.fetchMilestones(milestoneIds),
      this.fetchCases(uniqueCaseIds),
    ]);

    return typedPrereqs.map(p => ({
      prereqId: p.id,
      prereqTitle: p.title,
      prereqType: p.type,
      status: p.status,
      caseId: p.case_id,
      caseTitle: caseMap.get(p.case_id) ?? '',
      milestoneId: p.milestone_id,
      milestoneName: milestoneMap.get(p.milestone_id) ?? '',
    }));
  }

  private async getParticipantCaseIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('case_participants')
      .select('case_id')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map(p => p.case_id);
  }

  private async getHfaCaseIds(hfaId: string | null): Promise<string[]> {
    if (!hfaId) return [];
    const { data, error } = await supabase
      .from('cases')
      .select('id')
      .eq('hfa_id', hfaId);
    if (error) throw error;
    return (data ?? []).map(c => c.id);
  }

  private async fetchMilestones(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const { data, error } = await supabase
      .from('milestones')
      .select('id, title')
      .in('id', ids);
    if (error) throw error;
    return new Map((data as MilestoneRow[] ?? []).map(m => [m.id, m.title]));
  }

  private async fetchCases(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const { data, error } = await supabase
      .from('cases')
      .select('id, title')
      .in('id', ids);
    if (error) throw error;
    return new Map((data as CaseRow[] ?? []).map(c => [c.id, c.title]));
  }
}
