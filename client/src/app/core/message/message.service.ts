import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { ConversationMessage } from '../cases/case.models';

interface RawMessage {
  id: string;
  hfa_id: string;
  case_id: string;
  author_id: string | null;
  type: 'system' | 'message';
  content: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  async sendMessage(
    caseId: string,
    hfaId: string,
    authorId: string,
    content: string,
  ): Promise<ConversationMessage> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        hfa_id: hfaId,
        case_id: caseId,
        author_id: authorId,
        type: 'message',
        content,
      })
      .select('id, hfa_id, case_id, author_id, type, content, created_at')
      .single();

    if (error) throw error;
    const raw = data as unknown as RawMessage;
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
}
