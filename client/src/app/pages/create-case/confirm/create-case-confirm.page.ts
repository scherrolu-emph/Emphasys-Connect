import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth.service';
import type { CreateCaseRouteState, ParticipantDraft, CreateCasePayload } from '../../../core/cases/import.models';
import type { CaseType, ParticipantRole } from '../../../core/supabase/database.types';

@Component({
  selector: 'app-create-case-confirm',
  templateUrl: './create-case-confirm.page.html',
  styleUrls: ['./create-case-confirm.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonList, IonItem, IonLabel,
    IonAccordionGroup, IonAccordion,
    IonSelect, IonSelectOption,
  ],
})
export class CreateCaseConfirmPage implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toastCtrl = inject(ToastController);

  readonly state = signal<CreateCaseRouteState | null>(null);
  readonly caseTitle = signal('');
  readonly participants = signal<ParticipantDraft[]>([]);
  readonly showAddForm = signal(false);

  readonly newEmail = signal('');
  readonly newRole = signal<ParticipantRole>('developer');

  readonly isImcBacked = computed(() => {
    const s = this.state();
    return s?.caseType === 'development_construction' && !!s.imcProject;
  });

  readonly isBlankLike = computed(() => {
    const t = this.state()?.caseType;
    return t === 'blank' || t === 'loan_underwriting' || t === 'bond_issuance';
  });

  readonly canCreate = computed(() => {
    if (this.isBlankLike() && !this.caseTitle().trim()) return false;
    return true;
  });

  readonly caseTypeLabel = computed(() => {
    const labels: Record<CaseType, string> = {
      blank: 'Blank Case',
      development_construction: 'Development Construction',
      loan_underwriting: 'Loan Underwriting',
      bond_issuance: 'Bond Issuance',
    };
    return labels[this.state()?.caseType ?? 'blank'];
  });

  ngOnInit(): void {
    const s = this.router.getCurrentNavigation()?.extras.state as CreateCaseRouteState | undefined
      ?? (history.state as CreateCaseRouteState | undefined);

    if (!s?.caseType) {
      this.router.navigate(['/create-case/type'], { replaceUrl: true });
      return;
    }
    this.state.set(s);

    const hfaEmail = this.auth.profile()?.email ?? '';
    const initial: ParticipantDraft[] = [
      { email: hfaEmail, role: 'hfa_staff', source: 'creator' },
    ];

    if (s.imcProject?.developerEmail) {
      initial.push({ email: s.imcProject.developerEmail, role: 'developer', source: 'imc' });
    }

    if (s.caseTitle) this.caseTitle.set(s.caseTitle);
    this.participants.set(initial);
  }

  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    this.newEmail.set('');
    this.newRole.set('developer');
  }

  async addParticipant(): Promise<void> {
    const email = this.newEmail().trim().toLowerCase();
    if (!email || !email.includes('@')) return;

    const already = this.participants().some(p => p.email.toLowerCase() === email);
    if (already) {
      const toast = await this.toastCtrl.create({
        message: 'Participant already added',
        duration: 2000,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
      return;
    }

    this.participants.update(list => [
      ...list,
      { email, role: this.newRole(), source: 'manual' },
    ]);
    this.showAddForm.set(false);
    this.newEmail.set('');
  }

  removeParticipant(email: string): void {
    this.participants.update(list => list.filter(p => p.email !== email));
  }

  isRemovable(p: ParticipantDraft): boolean {
    return p.source === 'manual';
  }

  proceed(): void {
    const s = this.state();
    if (!s) return;

    const title = this.isImcBacked()
      ? (s.imcProject?.name ?? '')
      : this.caseTitle().trim();

    const payload: CreateCasePayload = {
      caseType: s.caseType,
      title,
      imcProject: s.imcProject,
      participants: this.participants(),
    };

    this.router.navigate(['/create-case/create'], { state: { payload } });
  }

  back(): void {
    const s = this.state();
    if (s?.caseType === 'development_construction') {
      this.router.navigate(['/create-case/search'], {
        state: { caseType: s.caseType },
      });
    } else {
      this.router.navigate(['/create-case/type']);
    }
  }
}
