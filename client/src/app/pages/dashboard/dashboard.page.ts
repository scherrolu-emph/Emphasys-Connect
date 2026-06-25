import { Component, effect, inject } from '@angular/core';
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
  IonSkeletonText,
  IonChip,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStore } from './dashboard.store';
import { CaseCardComponent } from './case-card/case-card.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { FILTER_CHIPS, CASE_TYPE_LABELS } from '../../core/cases/case.models';
import type { FilterType } from '../../core/cases/case.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton,
    IonList, IonItem, IonLabel, IonSkeletonText,
    IonChip, IonRefresher, IonRefresherContent,
    CaseCardComponent,
    BottomNavComponent,
  ],
})
export class DashboardPage {
  private readonly auth = inject(AuthService);
  readonly isHfa = this.auth.isHfa;
  private readonly router = inject(Router);
  readonly store = inject(DashboardStore);

  readonly filterChips = FILTER_CHIPS;
  readonly skeletonRows = [1, 2, 3, 4];

  constructor() {
    effect(() => {
      const hfaId = this.auth.hfaId();
      if (hfaId) this.store.load(hfaId);
    });
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    const hfaId = this.auth.hfaId();
    if (hfaId) await this.store.load(hfaId);
    (event.target as HTMLIonRefresherElement).complete();
  }

  navigateToCase(caseId: string): void {
    this.router.navigate(['/cases', caseId]);
  }

  createCase(): void {
    this.router.navigate(['/create-case/type']);
  }

  filterLabel(type: FilterType): string {
    if (type === 'all') return 'All';
    return CASE_TYPE_LABELS[type];
  }
}
