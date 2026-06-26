import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { Database } from '../supabase/database.types';

type ParticipantRow = { case_id: string; cases: { id: string; title: string } | null };
type MilestoneRow = Pick<Database['public']['Tables']['milestones']['Row'], 'id' | 'case_id' | 'title' | 'status'>;

export type ParticipantCaseSummary = {
  id: string;
  title: string;
  activeMilestoneName: string | null;
  milestoneCompleted: number;
  milestoneTotal: number;
};

@Injectable({ providedIn: 'root' })
export class CaseService {
  constructor() {}

  async getParticipantCases(userId: string): Promise<ParticipantCaseSummary[]> {
    try {
      // Fetch participant rows including the case basic info
      const { data: participantData, error: pErr } = await supabase
        .from('case_participants')
        .select('case_id, cases(id,title)')
        .eq('user_id', userId);

      if (pErr) throw pErr;
      if (!participantData || participantData.length === 0) return [];
      const participants = participantData as ParticipantRow[];

      const caseIds = Array.from(new Set(participants.map(p => p.case_id)));

      // Fetch all milestones for these cases to compute completed/total counts
      const { data: milestoneData, error: mErr } = await supabase
        .from('milestones')
        .select('id, case_id, title, status')
        .in('case_id', caseIds);

      if (mErr) throw mErr;
      const milestones = (milestoneData ?? []) as MilestoneRow[];

      // Group milestones by case
      const milestonesByCase = new Map<string, MilestoneRow[]>();
      for (const m of milestones) {
        const list = milestonesByCase.get(m.case_id) ?? [];
        list.push(m);
        milestonesByCase.set(m.case_id, list);
      }

      // Build result per unique case
      const results: ParticipantCaseSummary[] = [];
      const caseById = new Map<string, ParticipantCaseSummary>();
      for (const part of participants) {
        const c = part.cases;
        const cid = part.case_id;
        if (caseById.has(cid)) continue;

        const caseMilestones = milestonesByCase.get(cid) ?? [];
        const active = caseMilestones.find(m => m.status === 'active') ?? null;

        const entry: ParticipantCaseSummary = {
          id: cid,
          title: c?.title ?? 'Untitled Case',
          activeMilestoneName: active?.title ?? null,
          milestoneCompleted: caseMilestones.filter(m => m.status === 'completed').length,
          milestoneTotal: caseMilestones.length,
        };

        caseById.set(cid, entry);
        results.push(entry);
      }

      return results;
    } catch (err: any) {
      console.error('CaseService.getParticipantCases error', err);
      throw new Error(err?.message ?? 'Failed to load participant cases');
    }
  }
}
