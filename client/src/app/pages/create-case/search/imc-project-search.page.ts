import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, ElementRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  IonSpinner,
} from '@ionic/angular/standalone';
import { ImportService } from '../../../core/cases/import.service';
import type { ImcProject } from '../../../core/cases/import.models';
import type { CaseType } from '../../../core/supabase/database.types';
import type { CreateCaseRouteState } from '../../../core/cases/import.models';

@Component({
  selector: 'app-imc-project-search',
  templateUrl: './imc-project-search.page.html',
  styleUrls: ['./imc-project-search.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonList, IonItem, IonLabel, IonSpinner,
  ],
})
export class ImcProjectSearchPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly importService = inject(ImportService);
  private inputSub?: Subscription;

  readonly searchEl = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly caseType = signal<CaseType>('development_construction');
  readonly results = signal<ImcProject[]>([]);
  readonly isLoading = signal(false);
  readonly hasSearched = signal(false);

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state as CreateCaseRouteState | undefined
      ?? (history.state as CreateCaseRouteState | undefined);

    if (!state?.caseType || state.caseType !== 'development_construction') {
      this.router.navigate(['/create-case/type'], { replaceUrl: true });
      return;
    }
    this.caseType.set(state.caseType);
  }

  ngAfterViewInit(): void {
    const inputEl = this.searchEl()?.nativeElement;
    if (!inputEl) return;

    this.inputSub = fromEvent<Event>(inputEl, 'input')
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(async event => {
        const query = (event.target as HTMLInputElement).value.trim();
        await this.search(query);
      });
  }

  ngOnDestroy(): void {
    this.inputSub?.unsubscribe();
  }

  private async search(query: string): Promise<void> {
    if (query.length < 2) {
      this.results.set([]);
      this.hasSearched.set(false);
      return;
    }
    this.isLoading.set(true);
    try {
      const found = await this.importService.searchImcProjects(query);
      this.results.set(found);
      this.hasSearched.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectProject(project: ImcProject): void {
    this.router.navigate(['/create-case/confirm'], {
      state: { caseType: this.caseType(), imcProject: project },
    });
  }

  back(): void {
    this.router.navigate(['/create-case/type']);
  }
}
