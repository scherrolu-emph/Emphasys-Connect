import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { CaseService, ParticipantCaseSummary } from '../../core/case/case.service';

@Component({
  selector: 'app-my-cases',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Cases</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="participant-cases-container">
        @if (auth.currentUser()) {
          @if (isLoading) {
            <ion-list>
              @for (row of skeletonRows; track row) {
                <ion-item lines="none">
                  <ion-label>
                    <ion-skeleton-text animated style="width: 70%"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 40%; margin-top: 0.5rem"></ion-skeleton-text>
                  </ion-label>
                </ion-item>
              }
            </ion-list>
          } @else if (cases.length > 0) {
            <ion-list>
              @for (c of cases; track c.id) {
                <ion-item button detail (click)="onSelectCase(c.id)">
                  <ion-label>
                    <h3>{{ c.title }}</h3>
                    @if (c.activeMilestoneName) {
                      <p>{{ c.activeMilestoneName }}</p>
                    }
                  </ion-label>
                  <ion-badge slot="end" color="primary">{{ c.prereqAccepted }}/{{ c.prereqTotal }}</ion-badge>
                </ion-item>
              }
            </ion-list>
          } @else {
            <p>You’ll be added to cases by your HFA.</p>
          }
        }
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSkeletonText,
  ],
  styles: [
    ".participant-cases-container { width: 100%; margin: 0 auto; }",
    "@media (min-width: 768px) { .participant-cases-container { max-width: 960px; } }",
    "@media (min-width: 1280px) { .participant-cases-container { max-width: 1200px; } }",
    "ion-item { cursor: pointer; }",
  ],
})
export class MyCasesPage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly caseService = inject(CaseService);
  private readonly router = inject(Router);
  cases: ParticipantCaseSummary[] = [];
  isLoading = true;
  readonly skeletonRows = [1, 2, 3, 4];

  async ngOnInit() {
    const user = this.auth.currentUser();
    if (!user) return;
    try {
      this.cases = await this.caseService.getParticipantCases(user.id);
    } catch (err) {
      console.error('Failed to load participant cases', err);
      this.cases = [];
    } finally {
      this.isLoading = false;
    }
  }

  onSelectCase(caseId: string): void {
    this.router.navigate(['/cases', caseId]);
  }
}
