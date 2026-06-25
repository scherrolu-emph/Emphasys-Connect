import { Component, input } from '@angular/core';
import type { ConversationMessage } from '../../../core/cases/case.models';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [],
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.scss'],
})
export class MessageBubbleComponent {
  readonly message = input.required<ConversationMessage>();
  readonly isOwn = input<boolean>(false);
  readonly authorLabel = input<string>('');

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
