import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { EdocsService } from './edocs.service';
import { MilestoneService } from './milestone.service';
import { NotificationService } from '../notification/notification.service';

@Injectable({ providedIn: 'root' })
export class PrerequisiteService {
  private readonly edocsService = inject(EdocsService);
  private readonly milestoneService = inject(MilestoneService);
  private readonly notifSvc = inject(NotificationService);

  async markReady(prereqId: string, prereqTitle: string, caseId: string, hfaId: string): Promise<void> {
    const { error } = await supabase
      .from('prerequisites')
      .update({ status: 'received_processing', updated_at: new Date().toISOString() })
      .eq('id', prereqId);
    if (error) throw error;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: null,
      type: 'system',
      content: `Developer marked "${prereqTitle}" as ready for review.`,
    });
  }

  async accept(
    prereqId: string,
    prereqTitle: string,
    milestoneId: string,
    caseId: string,
    hfaId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('prerequisites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', prereqId);
    if (error) throw error;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: null,
      type: 'system',
      content: `HFA accepted: "${prereqTitle}".`,
    });

    await this.milestoneService.checkAndAdvance(milestoneId, caseId, hfaId);
  }

  async returnWithNote(
    prereqId: string,
    prereqTitle: string,
    note: string,
    caseId: string,
    hfaId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('prerequisites')
      .update({ status: 'pending_open', returned: true, notes: note, updated_at: new Date().toISOString() })
      .eq('id', prereqId);
    if (error) throw error;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: null,
      type: 'system',
      content: `HFA returned "${prereqTitle}": ${note}`,
    });
  }

  async submitDocument(
    prereqId: string,
    prereqTitle: string,
    docName: string,
    caseId: string,
    hfaId: string,
    displayName: string | null,
    email?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('prerequisites')
      .update({ status: 'received_processing', doc_name: docName, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', prereqId);
    if (error) throw error;

    const submitter = displayName ?? email ?? 'Participant';
    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: null,
      type: 'system',
      content: `${submitter} submitted "${docName}" for "${prereqTitle}".`,
    });

    const { data: hfaParticipants } = await supabase
      .from('case_participants')
      .select('user_id')
      .eq('case_id', caseId)
      .eq('role', 'hfa_staff')
      .not('user_id', 'is', null);

    for (const p of hfaParticipants ?? []) {
      void this.notifSvc.writeNotification(
        hfaId, p.user_id, caseId, 'assigned',
        'Document submitted for review',
        `${submitter} submitted "${docName}" for "${prereqTitle}".`,
        prereqId,
      );
    }
  }

  async triggerDocumentRequest(
    prereqId: string,
    prereqTitle: string,
    caseId: string,
    hfaId: string,
  ): Promise<void> {
    const uploadLink = this.edocsService.generateUploadUrl(prereqId);

    const { error } = await supabase
      .from('prerequisites')
      .update({ upload_link: uploadLink, requested: true, updated_at: new Date().toISOString() })
      .eq('id', prereqId);
    if (error) throw error;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: null,
      type: 'system',
      content: `Document request sent: "${prereqTitle}".`,
    });
  }
}
