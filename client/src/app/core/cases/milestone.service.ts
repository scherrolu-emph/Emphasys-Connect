import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  async checkAndAdvance(milestoneId: string, caseId: string, hfaId: string): Promise<void> {
    const { data: prereqs, error: prereqErr } = await supabase
      .from('prerequisites')
      .select('status')
      .eq('milestone_id', milestoneId);
    if (prereqErr) throw prereqErr;
    if (!prereqs?.length || !prereqs.every(p => p.status === 'accepted')) return;

    const { data: milestone, error: msErr } = await supabase
      .from('milestones')
      .select('title, order_index')
      .eq('id', milestoneId)
      .single();
    if (msErr) throw msErr;

    const now = new Date().toISOString();

    const { error: completeErr } = await supabase
      .from('milestones')
      .update({ status: 'completed', completed_at: now })
      .eq('id', milestoneId);
    if (completeErr) throw completeErr;

    const { data: nextMilestone } = await supabase
      .from('milestones')
      .select('id, title')
      .eq('case_id', caseId)
      .eq('status', 'open')
      .gt('order_index', milestone.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextMilestone) {
      const { error: activateErr } = await supabase
        .from('milestones')
        .update({ status: 'active', activated_at: now })
        .eq('id', nextMilestone.id);
      if (activateErr) throw activateErr;
    }

    const content = nextMilestone
      ? `Milestone "${milestone.title}" completed. "${nextMilestone.title}" is now active.`
      : `Milestone "${milestone.title}" completed.`;

    await supabase.from('conversation_messages').insert({
      hfa_id: hfaId,
      case_id: caseId,
      author_id: null,
      type: 'system',
      content,
    });
  }
}
