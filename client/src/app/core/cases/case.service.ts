import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { CaseType, MilestoneStatus, ParticipantRole, PrerequisiteStatus } from '../supabase/database.types';
import type {
  CaseDetail,
  CaseParticipant,
  CaseSummary,
  ConversationMessage,
  MilestoneDetail,
  MilestoneSummary,
  PrerequisiteSummary,
} from './case.models';
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

interface RawPrereqDetail {
  id: string;
  title: string;
  type: 'document_submission' | 'acceptance_comment';
  status: PrerequisiteStatus;
  requested: boolean;
  returned: boolean;
  owner_id: string | null;
  upload_link: string | null;
  doc_name: string | null;
  notes: string | null;
  submitted_at: string | null;
  accepted_at: string | null;
}

interface RawMilestoneDetail {
  id: string;
  title: string;
  status: MilestoneStatus;
  order_index: number;
  target_days: number | null;
  activated_at: string | null;
  completed_at: string | null;
  prerequisites: RawPrereqDetail[];
}

interface RawCaseDetail {
  id: string;
  hfa_id: string;
  title: string;
  reference_number: string | null;
  case_type: CaseType;
  milestones: RawMilestoneDetail[];
}

interface RawParticipant {
  id: string;
  hfa_id: string;
  case_id: string;
  user_id: string | null;
  email: string;
  role: ParticipantRole;
  invite_status: 'pending' | 'accepted';
  profiles: { display_name: string } | null;
}

interface RawMessage {
  id: string;
  hfa_id: string;
  case_id: string;
  author_id: string | null;
  type: 'system' | 'message';
  content: string;
  created_at: string;
}

function mapPrereqDetail(raw: RawPrereqDetail): PrerequisiteSummary {
  return {
    id: raw.id,
    title: raw.title,
    type: raw.type,
    status: raw.status,
    requested: raw.requested,
    returned: raw.returned,
    ownerId: raw.owner_id,
    uploadLink: raw.upload_link,
    docName: raw.doc_name,
    notes: raw.notes,
    submittedAt: raw.submitted_at,
    acceptedAt: raw.accepted_at,
  };
}

function mapMilestoneDetail(raw: RawMilestoneDetail): MilestoneDetail {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    orderIndex: raw.order_index,
    targetDays: raw.target_days,
    activatedAt: raw.activated_at,
    completedAt: raw.completed_at,
    prerequisites: raw.prerequisites.map(mapPrereqDetail),
  };
}

function mapCaseDetail(raw: RawCaseDetail): CaseDetail {
  const milestones = raw.milestones.map(mapMilestoneDetail);
  return {
    id: raw.id,
    hfaId: raw.hfa_id,
    title: raw.title,
    referenceNumber: raw.reference_number,
    caseType: raw.case_type,
    milestones,
    activeMilestone: milestones.find(m => m.status === 'active') ?? null,
  };
}

function mapParticipant(raw: RawParticipant): CaseParticipant {
  return {
    id: raw.id,
    hfaId: raw.hfa_id,
    caseId: raw.case_id,
    userId: raw.user_id,
    email: raw.email,
    displayName: raw.profiles?.display_name ?? null,
    role: raw.role,
    inviteStatus: raw.invite_status,
  };
}

function mapMessage(raw: RawMessage): ConversationMessage {
  return {
    id: raw.id,
    hfaId: raw.hfa_id,
    caseId: raw.case_id,
    authorId: raw.author_id,
    type: raw.type,
    content: raw.content,
    createdAt: raw.created_at,
  };
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

  async getCaseDetail(caseId: string): Promise<CaseDetail> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        id, hfa_id, title, reference_number, case_type,
        milestones (
          id, title, status, order_index, target_days, activated_at, completed_at,
          prerequisites (
            id, title, type, status, requested, returned,
            owner_id, upload_link, doc_name, notes, submitted_at, accepted_at
          )
        )
      `)
      .eq('id', caseId)
      .order('order_index', { referencedTable: 'milestones', ascending: true })
      .single();

    if (error) throw error;
    return mapCaseDetail(data as unknown as RawCaseDetail);
  }

  async getParticipants(caseId: string): Promise<CaseParticipant[]> {
    const { data, error } = await supabase
      .from('case_participants')
      .select('id, hfa_id, case_id, user_id, email, role, invite_status, profiles ( display_name )')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as unknown as RawParticipant[]).map(mapParticipant);
  }

  async getMessages(caseId: string, limit = 50): Promise<ConversationMessage[]> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('id, hfa_id, case_id, author_id, type, content, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data as unknown as RawMessage[]).map(mapMessage);
  }

  async addParticipant(caseId: string, hfaId: string, email: string, role: ParticipantRole, authorId: string): Promise<CaseParticipant> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const { data: participant, error } = await supabase
      .from('case_participants')
      .insert({ hfa_id: hfaId, case_id: caseId, user_id: profile?.id ?? null, email, role, source: 'manual' })
      .select('id, hfa_id, case_id, user_id, email, role, invite_status, profiles ( display_name )')
      .single();

    if (error) throw error;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: authorId,
      type: 'system',
      content: `${email} was added as ${role === 'developer' ? 'Developer' : 'HFA Staff'}.`,
    });

    const { data: caseRow } = await supabase.from('cases').select('title').eq('id', caseId).single();
    supabase.functions.invoke('notify-participant-added', {
      body: { email, caseName: caseRow?.title ?? 'your case', appUrl: window.location.origin },
    }).catch(err => console.error('notify-participant-added failed', err));

    return mapParticipant(participant as unknown as RawParticipant);
  }

  async removeParticipant(caseId: string, hfaId: string, participantId: string, email: string, authorId: string): Promise<void> {
    const { error } = await supabase
      .from('case_participants')
      .delete()
      .eq('id', participantId);

    if (error) throw error;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: authorId,
      type: 'system',
      content: `${email} was removed from this case.`,
    });
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
