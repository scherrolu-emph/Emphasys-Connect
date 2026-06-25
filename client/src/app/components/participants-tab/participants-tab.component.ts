import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, trashOutline, addOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import type { CaseParticipant } from '../../core/cases/case.models';
import type { ParticipantRole } from '../../core/supabase/database.types';
import { AvatarComponent } from '../avatar/avatar.component';

addIcons({ lockClosedOutline, trashOutline, addOutline, checkmarkOutline, closeOutline });

export interface AddParticipantRequest {
  email: string;
  role: ParticipantRole;
}

@Component({
  selector: 'app-participants-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList, IonItem, IonLabel, IonButton, IonIcon, IonBadge, IonSelect, IonSelectOption, IonInput,
    AvatarComponent,
  ],
  templateUrl: './participants-tab.component.html',
  styleUrls: ['./participants-tab.component.scss'],
})
export class ParticipantsTabComponent {
  readonly participants = input.required<CaseParticipant[]>();
  readonly currentUserId = input.required<string | null>();
  readonly currentUserHfaId = input.required<string | null>();
  readonly isHfa = input.required<boolean>();

  readonly addParticipant = output<AddParticipantRequest>();
  readonly removeParticipant = output<CaseParticipant>();

  readonly removingId = signal<string | null>(null);
  readonly addFormOpen = signal(false);
  readonly addEmail = signal('');
  readonly addRole = signal<ParticipantRole>('developer');
  readonly addError = signal<string | null>(null);

  readonly agencyParticipants = computed(() =>
    this.participants().filter(p => p.role === 'hfa_staff'),
  );

  readonly developerParticipants = computed(() =>
    this.participants().filter(p => p.role === 'developer'),
  );

  readonly otherParticipants = computed(() =>
    this.participants().filter(p => p.role !== 'hfa_staff' && p.role !== 'developer'),
  );

  isSelf(p: CaseParticipant): boolean {
    return p.userId === this.currentUserId();
  }

  displayLabel(p: CaseParticipant): string {
    return p.displayName ?? p.email;
  }

  isPending(p: CaseParticipant): boolean {
    return p.inviteStatus === 'pending';
  }

  confirmRemove(p: CaseParticipant): void {
    this.addError.set(null);
    if (p.role === 'developer' && this.developerParticipants().length === 1) {
      this.addError.set('Cannot remove the only Developer from this case.');
      return;
    }
    this.removingId.set(p.id);
  }

  cancelRemove(): void {
    this.removingId.set(null);
  }

  doRemove(p: CaseParticipant): void {
    this.removingId.set(null);
    this.removeParticipant.emit(p);
  }

  openAddForm(): void {
    this.addFormOpen.set(true);
    this.addEmail.set('');
    this.addRole.set('developer');
    this.addError.set(null);
  }

  cancelAdd(): void {
    this.addFormOpen.set(false);
    this.addError.set(null);
  }

  submitAdd(): void {
    const email = this.addEmail().trim();
    if (!email || !email.includes('@')) {
      this.addError.set('Enter a valid email address.');
      return;
    }
    this.addFormOpen.set(false);
    this.addParticipant.emit({ email, role: this.addRole() });
  }
}
