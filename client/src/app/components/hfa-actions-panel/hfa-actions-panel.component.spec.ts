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

    it('shows all completed milestones in timeline when all are completed', async () => {
      const fixture = await create([
        makeMilestone('completed'),
        makeMilestone('completed', [], { id: 'm-2', orderIndex: 1 }),
      ]);
      const sections = fixture.debugElement.queryAll(By.css('.milestone-section'));
      expect(sections.length).toBe(2);
    });

    it('shows "No prerequisites defined" when active milestone has no prereqs', async () => {
      const fixture = await create([makeMilestone('active', [])]);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('No prerequisites defined');
    });
  });

  describe('milestone timeline rendering', () => {
    it('shows active milestone title', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq()], { title: 'Draw Request' }),
      ]);
      const header = fixture.debugElement.query(By.css('.milestone-title'));
      expect((header.nativeElement as HTMLElement).textContent?.trim()).toBe('Draw Request');
    });

    it('shows a status badge on every milestone header', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const header = fixture.debugElement.query(By.css('.milestone-header'));
      const badge = header.query(By.css('.badge'));
      expect(badge).toBeTruthy();
    });

    it('renders all milestones in the timeline', async () => {
      const fixture = await create([
        makeMilestone('completed', [], { title: 'Phase 1' }),
        makeMilestone('active', [makePrereq()], { title: 'Phase 2', id: 'm-active' }),
        makeMilestone('open', [], { title: 'Phase 3', id: 'm-open' }),
      ]);
      const sections = fixture.debugElement.queryAll(By.css('.milestone-section'));
      expect(sections.length).toBe(3);
    });

    it('shows prereq accordion only for active milestone', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
        makeMilestone('open', [makePrereq({ id: 'pr-o' })], { id: 'm-open' }),
      ]);
      const toggles = fixture.debugElement.queryAll(By.css('.prereq-toggle'));
      expect(toggles.length).toBe(1);
    });

    it('shows flat prereq rows for completed and upcoming milestones after expanding them', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
        makeMilestone('open', [makePrereq({ id: 'pr-o' })], { id: 'm-open' }),
      ]);
      // Completed and open start collapsed — click their headers to expand
      const headers = fixture.debugElement.queryAll(By.css('.milestone-header'));
      (headers[0].nativeElement as HTMLElement).click(); // completed
      (headers[2].nativeElement as HTMLElement).click(); // open
      fixture.detectChanges();
      const flatRows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(flatRows.length).toBe(2);
    });

    it('shows all prereqs across all milestones when all expanded', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c1' }), makePrereq({ id: 'pr-c2' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
      ]);
      // Expand the completed milestone
      const headers = fixture.debugElement.queryAll(By.css('.milestone-header'));
      (headers[0].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const accordionRows = fixture.debugElement.queryAll(By.css('.prereq-item'));
      const flatRows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(accordionRows.length).toBe(1);
      expect(flatRows.length).toBe(2);
    });

    it('renders one prereq row per prerequisite on the active milestone', async () => {
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

  describe('action buttons in expanded state', () => {
    it('shows Accept and Return buttons for any expanded prereq', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      const accept = fixture.debugElement.query(By.css('.action-accept'));
      const ret = fixture.debugElement.query(By.css('.action-return'));
      expect(accept).toBeTruthy();
      expect(ret).toBeTruthy();
    });

    it('shows Request document button for document_submission prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'document_submission' })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      const request = fixture.debugElement.query(By.css('.action-request'));
      expect(request).toBeTruthy();
    });

    it('hides Request document button for acceptance_comment prereqs', async () => {
      const fixture = await create([
        makeMilestone('active', [makePrereq({ type: 'acceptance_comment' })]),
      ]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      const request = fixture.debugElement.query(By.css('.action-request'));
      expect(request).toBeNull();
    });

    it('renders action buttons as disabled placeholders', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      fixture.debugElement.query(By.css('.prereq-toggle')).nativeElement.click();
      fixture.detectChanges();
      const buttons = fixture.debugElement.queryAll(By.css('.prereq-actions button'));
      const allDisabled = buttons.every(b => (b.nativeElement as HTMLButtonElement).disabled);
      expect(allDisabled).toBeTrue();
    });
  });

  describe('milestone accordion', () => {
    it('expands the active milestone by default', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
      ]);
      const accordionRows = fixture.debugElement.queryAll(By.css('.prereq-item'));
      expect(accordionRows.length).toBe(1);
    });

    it('keeps completed and upcoming milestones collapsed by default', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
        makeMilestone('open', [makePrereq({ id: 'pr-o' })], { id: 'm-open' }),
      ]);
      const flatRows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(flatRows.length).toBe(0);
    });

    it('expands a collapsed milestone when its header is clicked', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq()], { id: 'm-active' }),
      ]);
      const headers = fixture.debugElement.queryAll(By.css('.milestone-header'));
      (headers[0].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const flatRows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(flatRows.length).toBe(1);
    });

    it('collapses an expanded milestone when its header is clicked again', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const header = fixture.debugElement.query(By.css('.milestone-header'));
      (header.nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.prereq-item'));
      expect(rows.length).toBe(0);
    });

    it('rotates the chevron when a milestone is expanded', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const chevron = fixture.debugElement.query(By.css('.milestone-chevron'));
      expect((chevron.nativeElement as HTMLElement).classList).toContain('is-open');
    });
  });
});
