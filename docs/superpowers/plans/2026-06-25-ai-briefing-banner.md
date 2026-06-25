# AI Briefing Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a role-aware AI briefing banner that streams a pre-written catch-up summary on every page load, with action chips and a dismiss button.

**Architecture:** `AiBriefingService` (root-level singleton) owns visibility state, dummy data, and the typewriter interval. `AiBriefingBannerComponent` reads role from `AuthService`, gets briefing from the service, runs the 300ms skeleton → stream → chips lifecycle, and cleans up on destroy. `DashboardPage` (HFA) and `MyCasesPage` (Developer) each host the banner above their content, guarded by `briefingService.visible()`. A "Catch me up" button in each page's header calls `briefingService.resetAndShow()` to replay.

**Tech Stack:** Angular 20, Ionic 8, TypeScript 5.9, Angular Signals, `setInterval`-based typewriter (no API call)

## Global Constraints

- Standalone components only — no NgModules; every component declares its own `imports`
- Angular Signals for all state (`signal()`, `computed()`) — no RxJS
- `@if` / `@for (item of items; track item.id)` control flow — never `*ngIf` / `*ngFor`
- Signal values updated via `.set()` or `.update()` — never mutated directly
- No `IonModal`, `IonActionSheet`, `IonAlert`
- Strict TypeScript — no `any`
- `hfa_id` on new DB entities (not applicable here — no schema changes)
- Branch: `feature/ai-briefing-banner`

---

## File Map

| Status | Path | Responsibility |
|---|---|---|
| **Create** | `client/src/app/core/ai-briefing/ai-briefing.service.ts` | Visibility signal, dummy data, typewriter streaming |
| **Create** | `client/src/app/core/ai-briefing/ai-briefing.service.spec.ts` | Service unit tests |
| **Create** | `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.ts` | Banner logic, skeleton→stream→chips lifecycle |
| **Create** | `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.html` | Banner template |
| **Create** | `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.scss` | Gradient card, skeleton shimmer, blink cursor, chips |
| **Create** | `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.spec.ts` | Component unit tests |
| **Modify** | `client/src/app/pages/dashboard/dashboard.page.ts` | Import banner component + inject service |
| **Modify** | `client/src/app/pages/dashboard/dashboard.page.html` | Add banner above filter chips + catch-me-up button |
| **Modify** | `client/src/app/pages/my-cases/my-cases.page.ts` | Import banner component + inject service + add to template |
| ~~Modify~~ | ~~`client/src/app/components/bottom-nav/bottom-nav.component.ts`~~ | Re-trigger moved to page headers (✨ button in IonToolbar) — avoids bottom nav layout disruption |

---

## Task 1: AiBriefingService

**Files:**
- Create: `client/src/app/core/ai-briefing/ai-briefing.service.ts`
- Test: `client/src/app/core/ai-briefing/ai-briefing.service.spec.ts`

**Interfaces:**
- Produces: `BriefingChip { label: string; route: string }`, `Briefing { text: string; chips: BriefingChip[] }`, `AiBriefingService` with `visible`, `getBriefing`, `startStream`, `dismiss`, `resetAndShow`

- [ ] **Step 1: Write the failing test**

Create `client/src/app/core/ai-briefing/ai-briefing.service.spec.ts`:

```typescript
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AiBriefingService } from './ai-briefing.service';

describe('AiBriefingService', () => {
  let service: AiBriefingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiBriefingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('visible starts as true', () => {
    expect(service.visible()).toBeTrue();
  });

  it('getBriefing returns HFA data for isHfa=true', () => {
    const b = service.getBriefing(true);
    expect(b.text).toContain('Sunrise Commons');
    expect(b.chips.length).toBe(3);
    expect(b.chips[0].route).toBe('/my-tasks');
  });

  it('getBriefing returns developer data for isHfa=false', () => {
    const b = service.getBriefing(false);
    expect(b.text).toContain('foundation inspection');
    expect(b.chips.length).toBe(2);
  });

  it('dismiss sets visible to false', () => {
    service.dismiss();
    expect(service.visible()).toBeFalse();
  });

  it('resetAndShow sets visible to true after dismiss', () => {
    service.dismiss();
    service.resetAndShow();
    expect(service.visible()).toBeTrue();
  });

  it('startStream emits characters one by one at 12ms intervals', fakeAsync(() => {
    const target = signal('');
    let done = false;
    service.startStream('Hi', target, () => { done = true; });
    tick(12);
    expect(target()).toBe('H');
    tick(12);
    expect(target()).toBe('Hi');
    tick(12); // fires onComplete
    expect(done).toBeTrue();
  }));

  it('startStream cleanup stops the interval', fakeAsync(() => {
    const target = signal('');
    const cleanup = service.startStream('Hello', target, () => {});
    tick(12);
    expect(target()).toBe('H');
    cleanup();
    tick(500);
    expect(target()).toBe('H');
  }));
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd client && ng test --watch=false
```

Expected: compilation error — `AiBriefingService` not found.

- [ ] **Step 3: Create the service**

Create `client/src/app/core/ai-briefing/ai-briefing.service.ts`:

```typescript
import { Injectable, WritableSignal, signal } from '@angular/core';

export interface BriefingChip {
  label: string;
  route: string;
}

export interface Briefing {
  text: string;
  chips: BriefingChip[];
}

@Injectable({ providedIn: 'root' })
export class AiBriefingService {
  readonly visible = signal(true);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  getBriefing(isHfa: boolean): Briefing {
    if (isHfa) {
      return {
        text: 'Since Thursday, 3 things need your attention. Developer on Sunrise Commons submitted 2 documents — one is awaiting your review. Riverdale Phase 2 has 3 overdue prerequisites. A developer on Lakeside Commons sent a message 2 days ago with no reply yet.',
        chips: [
          { label: 'View My Tasks', route: '/my-tasks' },
          { label: 'Open Sunrise Commons', route: '/cases/demo-case-1' },
          { label: 'Open Lakeside Commons', route: '/cases/demo-case-2' },
        ],
      };
    }
    return {
      text: 'Since Thursday, HFA accepted your foundation inspection on Sunrise Commons — Phase 2 is now active. You have 2 new prerequisites ready to action. One document upload is overdue by 3 days.',
      chips: [
        { label: 'View My Tasks', route: '/my-tasks' },
        { label: 'Open Sunrise Commons', route: '/cases/demo-case-1' },
      ],
    };
  }

  startStream(
    text: string,
    target: WritableSignal<string>,
    onComplete: () => void
  ): () => void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    target.set('');
    let index = 0;
    this.intervalId = setInterval(() => {
      if (index < text.length) {
        target.update(current => current + text[index]);
        index++;
      } else {
        clearInterval(this.intervalId!);
        this.intervalId = null;
        onComplete();
      }
    }, 12);
    return () => {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  dismiss(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.visible.set(false);
  }

  resetAndShow(): void {
    this.visible.set(true);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd client && ng test --watch=false
```

Expected: all 8 `AiBriefingService` tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/app/core/ai-briefing/
git commit -m "feat: add AiBriefingService with typewriter streaming and dummy data"
```

---

## Task 2: AiBriefingBannerComponent

**Files:**
- Create: `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.ts`
- Create: `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.html`
- Create: `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.scss`
- Test: `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.spec.ts`

**Interfaces:**
- Consumes: `AiBriefingService.getBriefing(isHfa: boolean): Briefing`, `AiBriefingService.startStream(...)`, `AiBriefingService.dismiss()`, `AuthService.isHfa: Signal<boolean>`, `BriefingChip { label, route }`
- Produces: `AiBriefingBannerComponent` (selector: `app-ai-briefing-banner`, no inputs)

- [ ] **Step 1: Write the failing test**

Create `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AiBriefingBannerComponent } from './ai-briefing-banner.component';
import { AiBriefingService } from '../../core/ai-briefing/ai-briefing.service';
import { AuthService } from '../../core/auth/auth.service';

describe('AiBriefingBannerComponent', () => {
  let fixture: ComponentFixture<AiBriefingBannerComponent>;
  let component: AiBriefingBannerComponent;
  let briefingServiceSpy: jasmine.SpyObj<AiBriefingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    briefingServiceSpy = jasmine.createSpyObj('AiBriefingService', [
      'getBriefing', 'startStream', 'dismiss'
    ]);
    briefingServiceSpy.getBriefing.and.returnValue({
      text: 'Test summary text.',
      chips: [{ label: 'View Tasks', route: '/my-tasks' }],
    });
    briefingServiceSpy.startStream.and.returnValue(() => {});

    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isHfa: signal(false),
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AiBriefingBannerComponent],
      providers: [
        { provide: AiBriefingService, useValue: briefingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiBriefingBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls getBriefing with isHfa from AuthService on init', () => {
    expect(briefingServiceSpy.getBriefing).toHaveBeenCalledWith(false);
  });

  it('shows skeleton before streaming starts', () => {
    expect(component.isStreaming()).toBeFalse();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-banner__skeleton')).toBeTruthy();
  });

  it('starts streaming after 300ms', fakeAsync(() => {
    tick(300);
    expect(component.isStreaming()).toBeTrue();
    expect(briefingServiceSpy.startStream).toHaveBeenCalled();
  }));

  it('chips not visible before stream completes', fakeAsync(() => {
    tick(300);
    expect(component.chipsVisible()).toBeFalse();
  }));

  it('dismiss calls briefingService.dismiss', () => {
    component.dismiss();
    expect(briefingServiceSpy.dismiss).toHaveBeenCalled();
  });

  it('onChip navigates to chip route', () => {
    component.onChip({ label: 'View Tasks', route: '/my-tasks' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-tasks']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd client && ng test --watch=false
```

Expected: compilation error — `AiBriefingBannerComponent` not found.

- [ ] **Step 3: Create the component TypeScript**

Create `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.ts`:

```typescript
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AiBriefingService, BriefingChip } from '../../core/ai-briefing/ai-briefing.service';

@Component({
  selector: 'app-ai-briefing-banner',
  templateUrl: './ai-briefing-banner.component.html',
  styleUrls: ['./ai-briefing-banner.component.scss'],
  standalone: true,
  imports: [],
})
export class AiBriefingBannerComponent implements OnInit, OnDestroy {
  private readonly briefingService = inject(AiBriefingService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly streamedText = signal('');
  readonly isStreaming = signal(false);
  readonly chipsVisible = signal(false);
  readonly chips = signal<BriefingChip[]>([]);

  private initTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanupStream: (() => void) | null = null;

  ngOnInit(): void {
    const { text, chips } = this.briefingService.getBriefing(this.auth.isHfa());
    this.chips.set(chips);
    this.initTimer = setTimeout(() => {
      this.isStreaming.set(true);
      this.cleanupStream = this.briefingService.startStream(
        text,
        this.streamedText,
        () => this.chipsVisible.set(true)
      );
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
    }
    this.cleanupStream?.();
  }

  dismiss(): void {
    this.briefingService.dismiss();
  }

  onChip(chip: BriefingChip): void {
    this.router.navigate([chip.route]);
  }
}
```

- [ ] **Step 4: Create the template**

Create `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.html`:

```html
<div class="ai-banner">
  <div class="ai-banner__header">
    <span class="ai-banner__icon">🤖</span>
    <span class="ai-banner__label">AI Briefing</span>
    <button class="ai-banner__dismiss" (click)="dismiss()" aria-label="Dismiss briefing">✕</button>
  </div>

  <div class="ai-banner__body">
    @if (isStreaming()) {
      <p class="ai-banner__text">{{ streamedText() }}<span class="cursor" aria-hidden="true">|</span></p>
    } @else {
      <div class="ai-banner__skeleton">
        <div class="skeleton-line skeleton-line--80"></div>
        <div class="skeleton-line skeleton-line--60"></div>
        <div class="skeleton-line skeleton-line--40"></div>
      </div>
    }
  </div>

  @if (chipsVisible()) {
    <div class="ai-banner__chips">
      @for (chip of chips(); track chip.label) {
        <button class="ai-banner__chip" (click)="onChip(chip)">{{ chip.label }}</button>
      }
    </div>
  }
</div>
```

- [ ] **Step 5: Create the styles**

Create `client/src/app/components/ai-briefing-banner/ai-briefing-banner.component.scss`:

```scss
.ai-banner {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 12px;
  border-left: 4px solid var(--ion-color-primary, #3880ff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  margin: 12px 16px;

  @media (min-width: 768px) {
    margin: 16px auto;
    max-width: 600px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__icon { font-size: 18px; }

  &__label {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--ion-color-primary, #3880ff);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__dismiss {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ion-color-medium, #92949c);
    font-size: 16px;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;

    &:hover { color: var(--ion-color-dark, #222428); }
  }

  &__body { min-height: 56px; }

  &__text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--ion-color-dark, #222428);
    margin: 0;
  }

  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  &__chip {
    background: transparent;
    border: 1.5px solid var(--ion-color-primary, #3880ff);
    border-radius: 20px;
    color: var(--ion-color-primary, #3880ff);
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    padding: 5px 14px;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--ion-color-primary, #3880ff);
      color: white;
    }
  }
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #dde4f0 25%, #c8d3e8 50%, #dde4f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;

  &--80 { width: 80%; }
  &--60 { width: 60%; }
  &--40 { width: 40%; }
}

.cursor {
  animation: blink 0.8s step-end infinite;
  color: var(--ion-color-primary, #3880ff);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd client && ng test --watch=false
```

Expected: all 7 `AiBriefingBannerComponent` tests pass alongside the 8 service tests.

- [ ] **Step 7: Commit**

```bash
git add client/src/app/components/ai-briefing-banner/
git commit -m "feat: add AiBriefingBannerComponent with skeleton, streaming, and chips"
```

---

## Task 3: Integrate into DashboardPage (HFA)

**Files:**
- Modify: `client/src/app/pages/dashboard/dashboard.page.ts`
- Modify: `client/src/app/pages/dashboard/dashboard.page.html`

**Interfaces:**
- Consumes: `AiBriefingBannerComponent` (selector `app-ai-briefing-banner`), `AiBriefingService.visible: Signal<boolean>`, `AiBriefingService.resetAndShow(): void`

- [ ] **Step 1: Update dashboard.page.ts**

Add `AiBriefingBannerComponent` to imports and inject `AiBriefingService`:

```typescript
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
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';
import { AiBriefingBannerComponent } from '../../components/ai-briefing-banner/ai-briefing-banner.component';
import { AiBriefingService } from '../../core/ai-briefing/ai-briefing.service';
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
    CaseCardComponent, NotificationBellComponent,
    AiBriefingBannerComponent,
  ],
})
export class DashboardPage {
  private readonly auth = inject(AuthService);
  readonly isHfa = this.auth.isHfa;
  private readonly router = inject(Router);
  readonly store = inject(DashboardStore);
  readonly briefingService = inject(AiBriefingService);

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
```

- [ ] **Step 2: Update dashboard.page.html**

Add the banner and a "Catch me up" button. Replace the full file content:

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Cases</ion-title>
    <ion-buttons slot="end">
      <ion-button fill="solid" color="primary" (click)="createCase()">
        Create a case
      </ion-button>
      <ion-button fill="clear" size="small" (click)="briefingService.resetAndShow()" aria-label="Catch me up">
        ✨
      </ion-button>
      <app-notification-bell />
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>

  <div class="dashboard-container">

    @if (briefingService.visible()) {
      <app-ai-briefing-banner />
    }

    <div class="filter-chips">
      @for (chip of filterChips; track chip.value) {
        <ion-chip
          [class.chip--active]="store.selectedType() === chip.value"
          (click)="store.selectType(chip.value)">
          {{ chip.label }}
        </ion-chip>
      }
    </div>

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
        @if (store.selectedType() === 'all') {
          <p>No active cases</p>
        } @else {
          <p>No {{ filterLabel(store.selectedType()) }} cases</p>
        }
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
```

- [ ] **Step 3: Verify build compiles**

```bash
cd client && ng build 2>&1 | tail -20
```

Expected: `Build at: ... - Hash: ... - Time: ...ms` with no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/app/pages/dashboard/
git commit -m "feat: integrate AI briefing banner into DashboardPage"
```

---

## Task 4: Integrate into MyCasesPage (Developer)

**Files:**
- Modify: `client/src/app/pages/my-cases/my-cases.page.ts`

**Interfaces:**
- Consumes: `AiBriefingBannerComponent`, `AiBriefingService.visible`, `AiBriefingService.resetAndShow`

- [ ] **Step 1: Update my-cases.page.ts**

Replace the full file content (MyCasesPage uses an inline template):

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
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
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';
import { AiBriefingBannerComponent } from '../../components/ai-briefing-banner/ai-briefing-banner.component';
import { AiBriefingService } from '../../core/ai-briefing/ai-briefing.service';

@Component({
  selector: 'app-my-cases',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Cases</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" size="small" (click)="briefingService.resetAndShow()" aria-label="Catch me up">
            ✨
          </ion-button>
          <app-notification-bell />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="participant-cases-container">
        @if (briefingService.visible()) {
          <app-ai-briefing-banner />
        }
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
            <p>You'll be added to cases by your HFA.</p>
          }
        }
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    NotificationBellComponent,
    AiBriefingBannerComponent,
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
  readonly briefingService = inject(AiBriefingService);
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
```

- [ ] **Step 2: Verify build compiles**

```bash
cd client && ng build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/app/pages/my-cases/my-cases.page.ts
git commit -m "feat: integrate AI briefing banner into MyCasesPage"
```

---

## Task 5: Verify end-to-end in browser

- [ ] **Step 1: Start the dev server**

```bash
cd client && ionic serve
```

Expected: app starts at `http://localhost:8100`

- [ ] **Step 2: Test HFA flow**

1. Open `http://localhost:8100` and log in as `staff@hfa.demo`
2. Confirm banner appears at top of Dashboard with skeleton shimmer for ~300ms
3. Confirm HFA text streams in character-by-character
4. Confirm 3 chips appear after stream completes: `View My Tasks`, `Open Sunrise Commons`, `Open Lakeside Commons`
5. Click `✕` — banner disappears
6. Click `✨` in the toolbar — banner reappears and re-streams
7. Refresh the page — banner appears again automatically

- [ ] **Step 3: Test Developer flow**

1. Log in as `developer@demo.com`
2. Confirm banner appears at top of My Cases with developer-specific text
3. Confirm 2 chips: `View My Tasks`, `Open Sunrise Commons`
4. Confirm dismiss and re-trigger work identically

- [ ] **Step 4: Run full test suite**

```bash
cd client && ng test --watch=false
```

Expected: all tests pass with no regressions.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: AI briefing banner complete — demo-ready on feature/ai-briefing-banner"
```
