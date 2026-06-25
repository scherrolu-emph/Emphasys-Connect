import { Component, input } from '@angular/core';
import type { ConversationMessage } from '../../../core/cases/case.models';

@Component({
  selector: 'app-system-message',
  standalone: true,
  imports: [],
  template: `<p class="system-msg">{{ message().content }}</p>`,
  styles: [`
    .system-msg {
      text-align: center;
      font-size: 0.75rem;
      font-style: italic;
      color: #6B7280;
      margin: 6px 0;
      padding: 0 16px;
    }
  `],
})
export class SystemMessageComponent {
  readonly message = input.required<ConversationMessage>();
}
