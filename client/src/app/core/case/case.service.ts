import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { Database } from '../supabase/database.types';

type ParticipantRow = { case_id: string; cases: { id: string; title: string } | null };
type MilestoneRow = Pick<Database['public']['Tables']['milestones']['Row'], 'id' | 'case_id' | 'title'>;
type PrereqRow = Pick<Database['public']['Tables']['prerequisites']['Row'], 'id' | 'milestone_id' | 'status'>;

export type ParticipantCaseSummary = {
  id: string;
  title: string;
  activeMilestoneName: string | null;
  prereqAccepted: number;
  prereqTotal: number;
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

      // Fetch active milestones for these cases
      const { data: milestoneData, error: mErr } = await supabase
        .from('milestones')
        .select('id, case_id, title')
        .in('case_id', caseIds)
        .eq('status', 'active');

      if (mErr) throw mErr;
      const milestones = milestoneData as MilestoneRow[] | null;

      const milestoneByCase = new Map<string, { id: string; title: string }>();
      if (milestones) {
        for (const m of milestones) milestoneByCase.set(m.case_id, { id: m.id, title: m.title });
      }

      // For any active milestone ids, fetch prerequisites to compute counts
      const milestoneIds = Array.from(new Set(Array.from(milestoneByCase.values()).map((m) => m.id)));

      const prereqCounts = new Map<string, { accepted: number; total: number }>();
      if (milestoneIds.length > 0) {
        const { data: prereqData, error: prErr } = await supabase
          .from('prerequisites')
          .select('id, milestone_id, status')
          .in('milestone_id', milestoneIds);

        if (prErr) throw prErr;
        const prereqs = prereqData as PrereqRow[] | null;

        if (prereqs) {
          for (const p of prereqs) {
            const mid = p.milestone_id;
            const entry = prereqCounts.get(mid) ?? { accepted: 0, total: 0 };
            entry.total += 1;
            if (p.status === 'accepted') entry.accepted += 1;
            prereqCounts.set(mid, entry);
          }
        }
      }

      // Build result per unique case
      const results: ParticipantCaseSummary[] = [];
      const caseById = new Map<string, ParticipantCaseSummary>();
      for (const part of participants) {
        const c = part.cases;
        const cid = part.case_id;
        if (caseById.has(cid)) continue;

        const caseTitle = c?.title ?? 'Untitled Case';
        const active = milestoneByCase.get(cid) ?? null;
        const counts = active ? prereqCounts.get(active.id) ?? { accepted: 0, total: 0 } : { accepted: 0, total: 0 };

        const entry: ParticipantCaseSummary = {
          id: cid,
          title: caseTitle,
          activeMilestoneName: active ? active.title : null,
          prereqAccepted: counts.accepted,
          prereqTotal: counts.total,
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
