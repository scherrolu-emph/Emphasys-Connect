import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { DashboardStore } from '../dashboard/dashboard.store';
import { CaseCardComponent } from '../dashboard/case-card/case-card.component';

@Component({
  selector: 'app-my-cases',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Cases</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="dashboard-container">
        @if (store.isLoading()) {
          <ion-list>
            @for (n of skeletonRows; track n) {
              <ion-item>
                <ion-label>
                  <ion-skeleton-text [animated]="true" style="width: 60%; height: 16px;"></ion-skeleton-text>
                  <ion-skeleton-text [animated]="true" style="width: 40%; height: 12px; margin-top: 6px;"></ion-skeleton-text>
                </ion-label>
              </ion-item>
            }
          </ion-list>
        }

        @if (store.error()) {
          <div class="empty-state">
            <p>Could not load cases — pull down to retry</p>
          </div>
        }

        @if (!store.isLoading() && !store.error() && store.filteredCases().length === 0) {
          <div class="empty-state">
            <p>No active cases — you'll be added to cases by your HFA.</p>
          </div>
        }

        @if (!store.isLoading() && store.filteredCases().length > 0) {
          <ion-list class="ec-list cases-list" lines="none">
            @for (c of store.filteredCases(); track c.id) {
              <app-case-card [caseItem]="c" (selected)="navigateToCase($event)" />
            }
          </ion-list>
        }
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonSkeletonText,
    IonRefresher, IonRefresherContent,
    CaseCardComponent,
  ],
})
export class MyCasesPage implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(DashboardStore);

  readonly skeletonRows = [1, 2, 3, 4];

  ngOnInit(): void {
    void this.store.loadForDeveloper();
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    await this.store.loadForDeveloper();
    (event.target as HTMLIonRefresherElement).complete();
  }

  navigateToCase(caseId: string): void {
    this.router.navigate(['/cases', caseId]);
  }
}
