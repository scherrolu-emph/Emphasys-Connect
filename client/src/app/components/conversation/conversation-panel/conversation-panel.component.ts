import { PLATFORM_ID, Component, computed, effect, inject, input, signal, viewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CaseDetailStore } from '../../../pages/case-detail/case-detail.store';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageService } from '../../../core/message/message.service';
import { SystemMessageComponent } from '../system-message/system-message.component';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import type { ConversationMessage } from '../../../core/cases/case.models';

@Component({
  selector: 'app-conversation-panel',
  standalone: true,
  imports: [SystemMessageComponent, MessageBubbleComponent, MessageComposerComponent],
  templateUrl: './conversation-panel.component.html',
  styleUrls: ['./conversation-panel.component.scss'],
})
export class ConversationPanelComponent {
  private readonly store = inject(CaseDetailStore);
  private readonly auth = inject(AuthService);
  private readonly messageSvc = inject(MessageService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly caseId = input.required<string>();

  private readonly scrollAnchor = viewChild<ElementRef<HTMLElement>>('scrollAnchor');

  readonly messages = computed(() => this.store.messages());
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);

  readonly sending = signal(false);
  readonly sendError = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.store.messages(); // track
      if (isPlatformBrowser(this.platformId)) {
        this.scrollAnchor()?.nativeElement.scrollIntoView({ block: 'end' });
      }
    });
  }

  authorLabel(msg: ConversationMessage): string {
    if (!msg.authorId) return '';
    const match = this.store.participants().find(p => p.userId === msg.authorId);
    return match?.displayName ?? (msg.authorId === this.currentUserId() ? 'You' : 'Participant');
  }

  isOwnMessage(msg: ConversationMessage): boolean {
    return msg.authorId !== null && msg.authorId === this.currentUserId();
  }

  async onSend(text: string): Promise<void> {
    const caseId = this.caseId();
    const userId = this.currentUserId();
    const hfaId = this.store.caseDetail()?.hfaId;
    if (!userId || !hfaId) return;

    const tempId = crypto.randomUUID();
    const optimistic: ConversationMessage = {
      id: tempId,
      hfaId,
      caseId,
      authorId: userId,
      type: 'message',
      content: text,
      createdAt: new Date().toISOString(),
    };

    this.store.messages.update(prev => [...prev, optimistic]);
    this.sending.set(true);
    this.sendError.set(null);

    try {
      const persisted = await this.messageSvc.sendMessage(caseId, hfaId, userId, text);
      this.store.messages.update(prev =>
        prev.map(m => m.id === tempId ? persisted : m),
      );
    } catch {
      this.store.messages.update(prev => prev.filter(m => m.id !== tempId));
      this.sendError.set('Message failed to send. Try again.');
    } finally {
      this.sending.set(false);
    }
  }
}
