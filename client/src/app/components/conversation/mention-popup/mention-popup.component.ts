import { Component, ElementRef, HostListener, computed, inject, input, output } from '@angular/core';
import type { CaseParticipant } from '../../../core/cases/case.models';

@Component({
  selector: 'app-mention-popup',
  standalone: true,
  imports: [],
  templateUrl: './mention-popup.component.html',
  styleUrls: ['./mention-popup.component.scss'],
})
export class MentionPopupComponent {
  private readonly elementRef = inject(ElementRef);

  readonly participants = input<CaseParticipant[]>([]);
  readonly query = input<string>('');
  readonly participantSelected = output<CaseParticipant>();
  readonly dismissed = output<void>();

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.participants().filter(p =>
      (p.displayName ?? p.email).toLowerCase().includes(q),
    );
  });

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const el = this.elementRef.nativeElement as HTMLElement;
    if (!el.contains(event.target as Node)) {
      this.dismissed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dismissed.emit();
  }

  select(participant: CaseParticipant): void {
    this.participantSelected.emit(participant);
  }
}
