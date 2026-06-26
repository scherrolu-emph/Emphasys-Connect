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

  describe('upload widget', () => {
    it('shows Upload toggle button for document_submission prereq in pending_open', async () => {
      const prereq = makePrereq({ type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);
      expect(fixture.debugElement.query(By.css('.upload-toggle-btn'))).toBeTruthy();
    });

    it('hides Upload toggle button when status is received_processing', async () => {
      const prereq = makePrereq({ type: 'document_submission', status: 'received_processing' });
      const fixture = await create([makeMilestone('active', [prereq])]);
      expect(fixture.debugElement.query(By.css('.upload-toggle-btn'))).toBeNull();
    });

    it('hides Upload toggle button when milestone is not active', async () => {
      const prereq = makePrereq({ type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('open', [prereq])]);
      expect(fixture.debugElement.query(By.css('.upload-toggle-btn'))).toBeNull();
    });

    it('upload panel is hidden until toggle button is clicked', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      expect(fixture.debugElement.query(By.css('.upload-widget'))).toBeNull();

      (fixture.debugElement.query(By.css('.upload-toggle-btn')).nativeElement as HTMLElement).click();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.upload-widget'))).toBeTruthy();
    });

    it('shows filename after a file is selected', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.componentInstance.toggleUpload('pr-1');
      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'report.pdf' }] } } as unknown as Event);
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain('report.pdf');
    });

    it('shows submit button only after a file is selected', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.componentInstance.toggleUpload('pr-1');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.upload-submit-btn'))).toBeNull();

      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'doc.pdf' }] } } as unknown as Event);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.upload-submit-btn'))).toBeTruthy();
    });

    it('emits submitDocument with prereqId, prereqTitle and docName on submit', async () => {
      const prereq = makePrereq({ id: 'pr-t', title: 'Site Survey', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      const emitted: { prereqId: string; prereqTitle: string; docName: string }[] = [];
      fixture.componentInstance.submitDocument.subscribe((e: typeof emitted[0]) => emitted.push(e));

      fixture.componentInstance.toggleUpload('pr-t');
      fixture.componentInstance.onFileSelected('pr-t', { target: { files: [{ name: 'survey.pdf' }] } } as unknown as Event);
      fixture.detectChanges();

      (fixture.debugElement.query(By.css('.upload-submit-btn')).nativeElement as HTMLElement).click();

      expect(emitted).toEqual([{ prereqId: 'pr-t', prereqTitle: 'Site Survey', docName: 'survey.pdf' }]);
    });

    it('clears file selection when Cancel is clicked', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.componentInstance.toggleUpload('pr-1');
      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'report.pdf' }] } } as unknown as Event);
      expect(fixture.componentInstance.selectedFiles().get('pr-1')).toBe('report.pdf');

      fixture.componentInstance.toggleUpload('pr-1'); // Cancel

      expect(fixture.componentInstance.selectedFiles().get('pr-1')).toBeUndefined();
    });

    it('shows an error message for a disallowed file type', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.componentInstance.toggleUpload('pr-1');
      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'script.exe' }], value: '' } } as unknown as Event);

      expect(fixture.componentInstance.fileErrors().get('pr-1')).toBeTruthy();
    });

    it('does not add an invalid file to selectedFiles', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.componentInstance.toggleUpload('pr-1');
      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'virus.exe' }], value: '' } } as unknown as Event);

      expect(fixture.componentInstance.selectedFiles().get('pr-1')).toBeUndefined();
    });

    it('clears the error when a valid file is selected after an invalid one', async () => {
      const prereq = makePrereq({ id: 'pr-1', type: 'document_submission', status: 'pending_open' });
      const fixture = await create([makeMilestone('active', [prereq])]);

      fixture.componentInstance.toggleUpload('pr-1');
      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'bad.exe' }], value: '' } } as unknown as Event);
      expect(fixture.componentInstance.fileErrors().get('pr-1')).toBeTruthy();

      fixture.componentInstance.onFileSelected('pr-1', { target: { files: [{ name: 'good.pdf' }] } } as unknown as Event);

      expect(fixture.componentInstance.fileErrors().get('pr-1')).toBeUndefined();
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
