import { PLATFORM_ID, Component, computed, effect, inject, input, signal, viewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CaseDetailStore } from '../../../pages/case-detail/case-detail.store';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageService } from '../../../core/message/message.service';
import { NotificationService } from '../../../core/notification/notification.service';
import { SystemMessageComponent } from '../system-message/system-message.component';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';
import { MentionPopupComponent } from '../mention-popup/mention-popup.component';
import type { CaseParticipant, ConversationMessage } from '../../../core/cases/case.models';

@Component({
  selector: 'app-conversation-panel',
  standalone: true,
  imports: [SystemMessageComponent, MessageBubbleComponent, MessageComposerComponent, MentionPopupComponent],
  templateUrl: './conversation-panel.component.html',
  styleUrls: ['./conversation-panel.component.scss'],
})
export class ConversationPanelComponent {
  private readonly store = inject(CaseDetailStore);
  private readonly auth = inject(AuthService);
  private readonly messageSvc = inject(MessageService);
  private readonly notifSvc = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly caseId = input.required<string>();

  private readonly scrollAnchor = viewChild<ElementRef<HTMLElement>>('scrollAnchor');
  private readonly composer = viewChild(MessageComposerComponent);

  readonly messages = computed(() => this.store.messages());
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly participants = computed(() => this.store.participants());

  readonly sending = signal(false);
  readonly sendError = signal<string | null>(null);
  readonly mentionQuery = signal<string | null>(null);

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

  onMentionQuery(q: string | null): void {
    this.mentionQuery.set(q);
  }

  onMentionSelected(participant: CaseParticipant): void {
    const name = participant.displayName ?? participant.email;
    this.composer()?.insertMention(name);
    this.mentionQuery.set(null);
  }

  onMentionDismissed(): void {
    this.mentionQuery.set(null);
  }

  async onSend(text: string): Promise<void> {
    if (this.sending()) return;
    const caseId = this.caseId();
    const userId = this.currentUserId();
    const hfaId = this.store.caseDetail()?.hfaId;
    if (!userId || !hfaId) return;

    const mentionedUserIds = this.resolveMentionedUserIds(text);

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
      const persisted = await this.messageSvc.sendMessage(caseId, hfaId, userId, text, mentionedUserIds);
      this.store.messages.update(prev =>
        prev.map(m => m.id === tempId ? persisted : m),
      );
      const caseTitle = this.store.caseDetail()?.title ?? 'a case';
      for (const uid of mentionedUserIds) {
        void this.notifSvc.writeNotification(
          hfaId, uid, caseId, 'mention',
          `You were mentioned in ${caseTitle}`,
          text.slice(0, 100),
        );
      }
    } catch {
      this.store.messages.update(prev => prev.filter(m => m.id !== tempId));
      this.sendError.set('Message failed to send. Try again.');
    } finally {
      this.sending.set(false);
    }
  }

  private resolveMentionedUserIds(text: string): string[] {
    const tokens: string[] = [];
    const re = /@\[([^\]]+)\]/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      tokens.push(match[1]);
    }
    if (!tokens.length) return [];
    return [
      ...new Set(
        tokens
          .map(name => this.store.participants().find(p => (p.displayName ?? p.email) === name)?.userId)
          .filter((id): id is string => !!id),
      ),
    ];
  }
}
