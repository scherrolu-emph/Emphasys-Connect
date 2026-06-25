import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import { EdocsService } from './edocs.service';
import { MilestoneService } from './milestone.service';

@Injectable({ providedIn: 'root' })
export class PrerequisiteService {
  private readonly edocsService = inject(EdocsService);
  private readonly milestoneService = inject(MilestoneService);

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
