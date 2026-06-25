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
});
