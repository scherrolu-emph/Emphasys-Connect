import { Injectable } from '@angular/core';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private channels = new Map<string, RealtimeChannel>();

  subscribeToCase(caseId: string): RealtimeChannel {
    const existing = this.channels.get(caseId);
    if (existing) return existing;

    const channel = supabase
      .channel(`case:${caseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_messages', filter: `case_id=eq.${caseId}` },
        () => {}
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prerequisites', filter: `case_id=eq.${caseId}` },
        () => {}
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'milestones', filter: `case_id=eq.${caseId}` },
        () => {}
      )
      .subscribe();

    this.channels.set(caseId, channel);
    return channel;
  }

  unsubscribe(caseId: string): void {
    const channel = this.channels.get(caseId);
    if (!channel) return;
    channel.unsubscribe();
    this.channels.delete(caseId);
  }
}
