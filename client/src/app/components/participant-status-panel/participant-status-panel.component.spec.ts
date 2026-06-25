import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { ParticipantStatusPanelComponent } from './participant-status-panel.component';
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
): Promise<ComponentFixture<ParticipantStatusPanelComponent>> {
  await TestBed.configureTestingModule({
    imports: [ParticipantStatusPanelComponent, IonicModule.forRoot()],
  }).compileComponents();

  const fixture = TestBed.createComponent(ParticipantStatusPanelComponent);
  fixture.componentRef.setInput('milestones', milestones);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('ParticipantStatusPanelComponent', () => {
  describe('empty state', () => {
    it('shows empty state when milestones array is empty', async () => {
      const fixture = await create([]);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('No milestones have been defined yet');
    });
  });

  describe('milestone list', () => {
    it('renders all milestones including open and completed ones', async () => {
      const fixture = await create([
        makeMilestone('completed', [], { id: 'm-1', orderIndex: 0 }),
        makeMilestone('active', [], { id: 'm-2', orderIndex: 1 }),
        makeMilestone('open', [], { id: 'm-3', orderIndex: 2 }),
      ]);
      const items = fixture.debugElement.queryAll(By.css('.milestone-item'));
      expect(items.length).toBe(3);
    });

    it('shows a status badge on each milestone header', async () => {
      const fixture = await create([makeMilestone('active')]);
      const badge = fixture.debugElement.query(By.css('.milestone-header .badge'));
      expect(badge).toBeTruthy();
    });

    it('renders milestone titles', async () => {
      const fixture = await create([makeMilestone('active', [], { title: 'Site Review' })]);
      const title = fixture.debugElement.query(By.css('.milestone-title'));
      expect((title.nativeElement as HTMLElement).textContent?.trim()).toBe('Site Review');
    });
  });

  describe('upload link', () => {
    it('shows upload link for document_submission prereq in pending_open with uploadLink', async () => {
      const prereq = makePrereq({
        type: 'document_submission',
        status: 'pending_open',
        uploadLink: 'https://edocs.example.com/upload/123',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const link = fixture.debugElement.query(By.css('a.upload-link'));
      expect(link).toBeTruthy();
      expect((link.nativeElement as HTMLAnchorElement).href).toContain('edocs.example.com');
    });

    it('hides upload link when prerequisite status is received_processing', async () => {
      const prereq = makePrereq({
        type: 'document_submission',
        status: 'received_processing',
        uploadLink: 'https://edocs.example.com/upload/123',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const link = fixture.debugElement.query(By.css('a.upload-link'));
      expect(link).toBeNull();
    });

    it('hides upload link when uploadLink is null even if status is pending_open', async () => {
      const prereq = makePrereq({
        type: 'document_submission',
        status: 'pending_open',
        uploadLink: null,
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const link = fixture.debugElement.query(By.css('a.upload-link'));
      expect(link).toBeNull();
    });

    it('upload link opens in a new tab', async () => {
      const prereq = makePrereq({
        type: 'document_submission',
        status: 'pending_open',
        uploadLink: 'https://edocs.example.com/upload/123',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const link = fixture.debugElement.query(By.css('a.upload-link'));
      expect((link.nativeElement as HTMLAnchorElement).target).toBe('_blank');
    });
  });

  describe('Mark as ready button', () => {
    it('shows "Mark as ready" for acceptance_comment prereq in pending_open', async () => {
      const prereq = makePrereq({
        type: 'acceptance_comment',
        status: 'pending_open',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const btn = fixture.debugElement.query(By.css('.mark-ready-btn'));
      expect(btn).toBeTruthy();
    });

    it('hides "Mark as ready" for acceptance_comment prereq in accepted state', async () => {
      const prereq = makePrereq({
        type: 'acceptance_comment',
        status: 'accepted',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const btn = fixture.debugElement.query(By.css('.mark-ready-btn'));
      expect(btn).toBeNull();
    });

    it('hides "Mark as ready" for document_submission prereqs', async () => {
      const prereq = makePrereq({
        type: 'document_submission',
        status: 'pending_open',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const btn = fixture.debugElement.query(By.css('.mark-ready-btn'));
      expect(btn).toBeNull();
    });

    it('emits markReady with the prereq id when "Mark as ready" is clicked', async () => {
      const prereq = makePrereq({
        id: 'pr-target',
        type: 'acceptance_comment',
        status: 'pending_open',
      });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const emitted: string[] = [];
      fixture.componentInstance.markReady.subscribe((id: string) => emitted.push(id));

      const btn = fixture.debugElement.query(By.css('.mark-ready-btn'));
      (btn.nativeElement as HTMLElement).click();

      expect(emitted).toEqual(['pr-target']);
    });
  });

  describe('no HFA action buttons', () => {
    it('does not render Accept, Return, or Request document buttons', async () => {
      const prereq = makePrereq({ type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).not.toContain('Accept');
      expect(text).not.toContain('Return with note');
      expect(text).not.toContain('Request document');
    });
  });

  describe('milestone accordion', () => {
    it('expands the active milestone by default', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
      ]);
      const rows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(rows.length).toBe(1);
    });

    it('keeps completed and upcoming milestones collapsed by default', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
        makeMilestone('open', [makePrereq({ id: 'pr-o' })], { id: 'm-open' }),
      ]);
      const rows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(rows.length).toBe(1); // only active is expanded
    });

    it('expands a collapsed milestone when its header is clicked', async () => {
      const fixture = await create([
        makeMilestone('completed', [makePrereq({ id: 'pr-c' })]),
        makeMilestone('active', [makePrereq({ id: 'pr-a' })], { id: 'm-active' }),
      ]);
      const headers = fixture.debugElement.queryAll(By.css('.milestone-header'));
      (headers[0].nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(rows.length).toBe(2);
    });

    it('collapses an expanded milestone when its header is clicked again', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const header = fixture.debugElement.query(By.css('.milestone-header'));
      (header.nativeElement as HTMLElement).click();
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('.prereq-row'));
      expect(rows.length).toBe(0);
    });

    it('rotates the chevron when a milestone is expanded', async () => {
      const fixture = await create([makeMilestone('active', [makePrereq()])]);
      const chevron = fixture.debugElement.query(By.css('.milestone-chevron'));
      expect((chevron.nativeElement as HTMLElement).classList).toContain('is-open');
    });
  });
});
