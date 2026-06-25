import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { CaseType, MilestoneStatus, PrerequisiteStatus } from '../supabase/database.types';
import type { CaseSummary, MilestoneSummary } from './case.models';
import type { CreateCasePayload } from './import.models';

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

  async getParticipantCases(): Promise<CaseSummary[]> {
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
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data as unknown as RawCase[]).map(mapToSummary);
  }

  async createCase(payload: CreateCasePayload, hfaId: string, createdBy: string): Promise<string> {
    const { imcProject, caseType, title, participants } = payload;

    // 1. Insert cases row
    const { data: caseRow, error: caseErr } = await supabase
      .from('cases')
      .insert({
        hfa_id: hfaId,
        title,
        case_type: caseType,
        imc_project_id: imcProject?.id ?? null,
        created_by: createdBy,
      })
      .select('id')
      .single();
    if (caseErr) throw caseErr;
    const caseId = caseRow.id;

    try {
      // 2. Insert case_participants first — milestones/prereqs/msgs RLS requires
      //    the inserting user to already be a participant of the case.
      //    cp_insert allows this first insert because cases.created_by = auth.uid().
      for (const draft of participants) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', draft.email)
          .maybeSingle();

        const { error: partErr } = await supabase.from('case_participants').insert({
          hfa_id: hfaId,
          case_id: caseId,
          user_id: profile?.id ?? null,
          email: draft.email,
          role: draft.role,
          source: draft.source,
        });
        if (partErr) throw partErr;
      }

      // 3. Insert milestones + prerequisites (IMC-backed types only)
      if (imcProject && imcProject.milestones.length > 0) {
        for (const [idx, m] of imcProject.milestones.entries()) {
          const milestoneStatus: MilestoneStatus = idx === 0 ? 'active' : 'open';
          const activatedAt = idx === 0 ? new Date().toISOString() : null;

          const { data: milestoneRow, error: mErr } = await supabase
            .from('milestones')
            .insert({
              hfa_id: hfaId,
              case_id: caseId,
              title: m.title,
              order_index: m.order,
              status: milestoneStatus,
              activated_at: activatedAt,
            })
            .select('id')
            .single();
          if (mErr) throw mErr;

          if (m.prerequisites.length > 0) {
            const { error: prereqErr } = await supabase.from('prerequisites').insert(
              m.prerequisites.map(p => ({
                hfa_id: hfaId,
                case_id: caseId,
                milestone_id: milestoneRow.id,
                title: p.title,
                type: p.type,
                status: 'pending_open' as PrerequisiteStatus,
              })),
            );
            if (prereqErr) throw prereqErr;
          }
        }
      }

      // 4. System message
      const systemContent =
        caseType === 'development_construction' && imcProject
          ? `Case imported from IMC: ${title}`
          : `Case created: ${title}`;

      const { error: msgErr } = await supabase.from('conversation_messages').insert({
        hfa_id: hfaId,
        case_id: caseId,
        author_id: createdBy,
        type: 'system',
        content: systemContent,
      });
      if (msgErr) throw msgErr;
    } catch (err) {
      // Compensating delete — remove the cases row if any downstream step failed
      await supabase.from('cases').delete().eq('id', caseId);
      throw err;
    }

    return caseId;
  }
}
