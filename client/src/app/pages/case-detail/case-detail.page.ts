import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-case-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Case Details</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Case detail page is under construction.</p>
      <p *ngIf="caseId">Case ID: {{ caseId }}</p>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, NgIf],
})
export class CaseDetailPage {
  readonly caseId = inject(ActivatedRoute).snapshot.paramMap.get('id');
}
