import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { HfaActionsPanelComponent } from './hfa-actions-panel.component';
import type { MilestoneDetail, PrerequisiteSummary } from '../../core/cases/case.models';

const makePrereq = (
  overrides: Partial<PrerequisiteSummary> = {},
): PrerequisiteSummary => ({
  id: 'pr-1',
  title: 'Test Prereq',
  type: 'document_submission',
  status: 'pending_open',
  requested: false,
  returned: false,
  ownerId: null,
  uploadLink: null,
  docName: null,
  notes: null,
  submittedAt: null,
  acceptedAt: null,
  ...overrides,
});

const makeMilestone = (
  status: MilestoneDetail['status'],
  prereqs: PrerequisiteSummary[] = [],
  overrides: Partial<MilestoneDetail> = {},
): MilestoneDetail => ({
  id: `m-${status}`,
  title: `Milestone ${status}`,
  status,
  orderIndex: 0,
  targetDays: null,
  activatedAt: null,
  completedAt: null,
  prerequisites: prereqs,
  ...overrides,
});

async function create(
  milestones: MilestoneDetail[],
): Promise<ComponentFixture<HfaActionsPanelComponent>> {
  await TestBed.configureTestingModule({
    imports: [HfaActionsPanelComponent, IonicModule.forRoot()],
  }).compileComponents();

  const fixture = TestBed.createComponent(HfaActionsPanelComponent);
  fixture.componentRef.setInput('milestones', milestones);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('HfaActionsPanelComponent', () => {
  describe('empty states', () => {
    it('shows "No milestones" state when milestones array is empty', async () => {
      const fixture = await create([]);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('No milestones have been defined yet');
    });

    it('shows "All milestones complete" state when all are completed', async () => {
      const fixture = await create([
        makeMilestone('completed'),
        makeMilestone('completed', [], { id: 'm-2', orderIndex: 1 }),
      ]);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('All milestones complete');
    });

    it('shows "No prerequisites defined" when active milestone has no prereqs', async () => {
      const fixture = await create([makeMilestone('active', [])]);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('No prerequisites defined');
    });
  });

  describe('active milestone rendering', () => {
    it('shows active milestone title', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq()], { title: 'Draw Request' }),
      ]);
      const header = fixture.debugElement.query(By.css('.milestone-title'));
      expect((header.nativeElement as HTMLElement).textContent?.trim()).toBe('Draw Request');
    });

    it('does not show a status badge on the milestone header', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const header = fixture.debugElement.query(By.css('.milestone-header'));
      const badge = header.query(By.css('.badge'));
      expect(badge).toBeNull();
    });

    it('renders one prereq row per prerequisite', async () => {
      const prereqs = [
        makePrereq({ id: 'pr-1', title: 'Prereq 1' }),
        makePrereq({ id: 'pr-2', title: 'Prereq 2' }),
      ];
      const fixture = await create([makeMilestone('active', prereqs)]);
      const rows = fixture.debugElement.queryAll(By.css('.prereq-item'));
      expect(rows.length).toBe(2);
    });
  });

  describe('type icons', () => {
    it('shows attach-outline icon for document_submission prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'document_submission' })]),
      ]);
      const icon = fixture.debugElement.query(By.css('ion-icon.type-icon'));
      expect((icon.nativeElement as HTMLElement).getAttribute('name')).toBe('attach-outline');
    });

    it('shows checkmark-outline icon for acceptance_comment prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'acceptance_comment' })]),
      ]);
      const icon = fixture.debugElement.query(By.css('ion-icon.type-icon'));
      expect((icon.nativeElement as HTMLElement).getAttribute('name')).toBe('checkmark-outline');
    });
  });

  describe('accordion behaviour', () => {
    it('starts with all prereq rows collapsed', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const details = fixture.debugElement.queryAll(By.css('.prereq-details'));
      expect(details.length).toBe(0);
    });

    it('expands a prereq row on click', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const toggle = fixture.debugElement.query(By.css('.prereq-toggle'));
      (toggle.nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const details = fixture.debugElement.queryAll(By.css('.prereq-details'));
      expect(details.length).toBe(1);
    });

    it('collapses an expanded row when clicked again', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const toggle = fixture.debugElement.query(By.css('.prereq-toggle'));
      (toggle.nativeElement as HTMLElement).click();
      fixture.detectChanges();
      (toggle.nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const details = fixture.debugElement.queryAll(By.css('.prereq-details'));
      expect(details.length).toBe(0);
    });

    it('only one prereq is expanded at a time', async () => {
      const prereqs = [
        makePrereq({ id: 'pr-1', title: 'Prereq 1' }),
        makePrereq({ id: 'pr-2', title: 'Prereq 2' }),
      ];
      const fixture = await create([makeMilestone('active', prereqs)]);
      const toggles = fixture.debugElement.queryAll(By.css('.prereq-toggle'));

      (toggles[0].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      (toggles[1].nativeElement as HTMLElement).click();
      fixture.detectChanges();

      const details = fixture.debugElement.queryAll(By.css('.prereq-details'));
      expect(details.length).toBe(1);
    });
  });

  describe('action buttons — conditional visibility', () => {
    it('shows Accept and Return buttons only for received_processing prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ status: 'received_processing' })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.action-accept'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.action-return'))).toBeTruthy();
    });

    it('hides Accept and Return buttons for pending_open prereqs', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq({ status: 'pending_open' })])]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.action-accept'))).toBeNull();
      expect(fixture.debugElement.query(By.css('.action-return'))).toBeNull();
    });

    it('shows Request document button for document_submission prereqs in pending_open when not yet requested', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'document_submission', status: 'pending_open', requested: false })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.action-request'))).toBeTruthy();
    });

    it('hides Request document button once requested', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'document_submission', status: 'pending_open', requested: true })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.action-request'))).toBeNull();
    });

    it('hides Request document button for acceptance_comment prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'acceptance_comment', status: 'pending_open' })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.action-request'))).toBeNull();
    });

    it('shows accepted state label for accepted prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ status: 'accepted' })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      const done = fixture.debugElement.query(By.css('.action-done'));
      expect(done).toBeTruthy();
    });
  });

  describe('output events', () => {
    it('acceptPrereq emits with prereqId, prereqTitle and milestoneId when Accept clicked', async () => {
      const prereq = makePrereq({ id: 'pr-1', title: 'My Prereq', status: 'received_processing' });
      const fixture = await create([makeMilestone('active', [prereq], { id: 'm-1' })]);
      const comp = fixture.componentInstance;
      let emitted: unknown;
      comp.acceptPrereq.subscribe((v: unknown) => (emitted = v));

      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.action-accept')).nativeElement.click();

      expect(emitted).toEqual({ prereqId: 'pr-1', prereqTitle: 'My Prereq', milestoneId: 'm-1' });
    });

    it('triggerRequest emits with prereqId and prereqTitle when Request document clicked', async () => {
      const prereq = makePrereq({ id: 'pr-2', title: 'Doc Prereq', type: 'document_submission', status: 'pending_open', requested: false });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const comp = fixture.componentInstance;
      let emitted: unknown;
      comp.triggerRequest.subscribe((v: unknown) => (emitted = v));

      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.action-request')).nativeElement.click();

      expect(emitted).toEqual({ prereqId: 'pr-2', prereqTitle: 'Doc Prereq' });
    });
  });

  describe('return-with-note form', () => {
    it('shows note textarea after clicking Return with note', async () => {
      const prereq = makePrereq({ status: 'received_processing' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.action-return')).nativeElement.click();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.return-note-input'))).toBeTruthy();
    });

    it('Confirm return button is disabled when note is empty', async () => {
      const prereq = makePrereq({ status: 'received_processing' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.action-return')).nativeElement.click();
      fixture.detectChanges();

      const confirmBtn = fixture.debugElement.queryAll(By.css('.return-note-actions .action-return'))[0];
      expect((confirmBtn.nativeElement as HTMLButtonElement).disabled).toBeTrue();
    });

    it('Cancel hides the note form', async () => {
      const prereq = makePrereq({ status: 'received_processing' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.action-return')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.return-note-actions button:last-child')).nativeElement.click();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.return-note-input'))).toBeNull();
    });
  });
});
