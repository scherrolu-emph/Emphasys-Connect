import { Component, ElementRef, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [],
  templateUrl: './message-composer.component.html',
  styleUrls: ['./message-composer.component.scss'],
})
export class MessageComposerComponent {
  readonly send = output<string>();
  readonly mentionQuery = output<string | null>();
  readonly text = signal('');

  private readonly ta = viewChild<ElementRef<HTMLTextAreaElement>>('ta');

  onInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.text.set(el.value);
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;

    const cursor = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, cursor);
    const match = before.match(/@(\w*)$/);
    this.mentionQuery.emit(match ? match[1] : null);
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey && this.text().trim()) {
      ke.preventDefault();
      this.onSend();
    }
  }

  onSend(): void {
    const trimmed = this.text().trim();
    if (!trimmed) return;
    this.mentionQuery.emit(null);
    this.send.emit(trimmed);
    this.text.set('');
    const el = this.ta()?.nativeElement;
    if (el) el.style.height = 'auto';
  }

  insertMention(displayName: string): void {
    const el = this.ta()?.nativeElement;
    if (!el) return;
    const cursor = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, cursor);
    const after = el.value.slice(cursor);
    const match = before.match(/@(\w*)$/);
    if (!match) return;
    const replaceFrom = cursor - match[0].length;
    const token = `@[${displayName}]`;
    const newText = before.slice(0, replaceFrom) + token + after;
    el.value = newText;
    this.text.set(newText);
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    const newCursor = replaceFrom + token.length;
    el.setSelectionRange(newCursor, newCursor);
    el.focus();
    this.mentionQuery.emit(null);
  }
}
