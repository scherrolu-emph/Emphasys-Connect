import { TestBed } from '@angular/core/testing';
import { CaseDetailStore } from './case-detail.store';
import { CaseService } from '../../core/cases/case.service';
import type { CaseDetail, CaseParticipant, ConversationMessage, MilestoneDetail, PrerequisiteSummary } from '../../core/cases/case.models';

const makePrereq = (overrides: Partial<PrerequisiteSummary> = {}): PrerequisiteSummary => ({
  id: 'pr-1', title: 'Prereq 1', type: 'document_submission',
  status: 'pending_open', requested: false, returned: false,
  ownerId: null, uploadLink: null, docName: null, notes: null,
  submittedAt: null, acceptedAt: null, ...overrides,
});

const makeMilestone = (overrides: Partial<MilestoneDetail> = {}): MilestoneDetail => ({
  id: 'm-1', title: 'Milestone 1', status: 'active', orderIndex: 0,
  targetDays: null, activatedAt: null, completedAt: null, prerequisites: [], ...overrides,
});

const makeDetail = (overrides: Partial<CaseDetail> = {}): CaseDetail => ({
  id: 'case-1', hfaId: 'hfa-1', title: 'Lotus Apartments',
  referenceNumber: 'MF-2024-0188', caseType: 'development_construction',
  milestones: [], activeMilestone: null, ...overrides,
});

const makeParticipant = (id: string, role: CaseParticipant['role'] = 'developer'): CaseParticipant => ({
  id,
  hfaId: 'hfa-1',
  caseId: 'case-1',
  userId: `user-${id}`,
  email: `${id}@example.com`,
  displayName: `User ${id}`,
  role,
  inviteStatus: 'accepted',
});

const makeMessage = (id: string): ConversationMessage => ({
  id,
  hfaId: 'hfa-1',
  caseId: 'case-1',
  authorId: 'user-1',
  type: 'message',
  content: `Message ${id}`,
  createdAt: new Date().toISOString(),
});

describe('CaseDetailStore', () => {
  let store: CaseDetailStore;
  let caseServiceSpy: jasmine.SpyObj<CaseService>;

  beforeEach(() => {
    caseServiceSpy = jasmine.createSpyObj('CaseService', [
      'getCaseDetail', 'getParticipants', 'getMessages',
    ]);
    TestBed.configureTestingModule({
      providers: [
        CaseDetailStore,
        { provide: CaseService, useValue: caseServiceSpy },
      ],
    });
    store = TestBed.inject(CaseDetailStore);
  });

  it('starts with null state and loading false', () => {
    expect(store.caseDetail()).toBeNull();
    expect(store.participants()).toEqual([]);
    expect(store.messages()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('loadCase populates all signals on success', async () => {
    const detail = makeDetail();
    const participants = [makeParticipant('p1'), makeParticipant('p2', 'hfa_staff')];
    const messages = [makeMessage('m1')];

    caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(detail));
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve(participants));
    caseServiceSpy.getMessages.and.returnValue(Promise.resolve(messages));

    await store.loadCase('case-1');

    expect(store.caseDetail()).toEqual(detail);
    expect(store.participants()).toEqual(participants);
    expect(store.messages()).toEqual(messages);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('loadCase sets error on failure', async () => {
    caseServiceSpy.getCaseDetail.and.returnValue(Promise.reject(new Error('Not found')));
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
    caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));

    await store.loadCase('case-1');

    expect(store.error()).toBe('Not found');
    expect(store.loading()).toBeFalse();
  });

  it('activeMilestone returns null when no active milestone', async () => {
    const detail = makeDetail();
    caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(detail));
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
    caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));

    await store.loadCase('case-1');
    expect(store.activeMilestone()).toBeNull();
  });

  it('appendMessage adds a message to the list', async () => {
    caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(makeDetail()));
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
    caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));
    await store.loadCase('case-1');

    store.appendMessage({
      id: 'new-msg',
      hfa_id: 'hfa-1',
      case_id: 'case-1',
      author_id: 'user-1',
      type: 'message',
      content: 'Hello',
      created_at: '2026-06-25T10:00:00Z',
    });

    expect(store.messages().length).toBe(1);
    expect(store.messages()[0].id).toBe('new-msg');
    expect(store.messages()[0].content).toBe('Hello');
  });

  it('reset clears all state', async () => {
    caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(makeDetail()));
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([makeParticipant('p1')]));
    caseServiceSpy.getMessages.and.returnValue(Promise.resolve([makeMessage('m1')]));
    await store.loadCase('case-1');

    store.reset();

    expect(store.caseDetail()).toBeNull();
    expect(store.participants()).toEqual([]);
    expect(store.messages()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  describe('applyPrereqUpdate', () => {
    it('immutably updates the matching prereq in caseDetail', async () => {
      const prereq = makePrereq({ id: 'pr-1', status: 'pending_open' });
      const milestone = makeMilestone({ id: 'm-1', status: 'active', prerequisites: [prereq] });
      const detail = makeDetail({ milestones: [milestone], activeMilestone: milestone });
      caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(detail));
      caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
      caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));
      await store.loadCase('case-1');

      store.applyPrereqUpdate('pr-1', { status: 'received_processing' });

      const updated = store.milestones()[0].prerequisites[0];
      expect(updated.status).toBe('received_processing');
      expect(updated.id).toBe('pr-1');
    });

    it('does not mutate other prereqs', async () => {
      const p1 = makePrereq({ id: 'pr-1', status: 'pending_open' });
      const p2 = makePrereq({ id: 'pr-2', status: 'pending_open' });
      const milestone = makeMilestone({ prerequisites: [p1, p2] });
      const detail = makeDetail({ milestones: [milestone], activeMilestone: milestone });
      caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(detail));
      caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
      caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));
      await store.loadCase('case-1');

      store.applyPrereqUpdate('pr-1', { status: 'accepted' });

      expect(store.milestones()[0].prerequisites[1].status).toBe('pending_open');
    });

    it('is a no-op when caseDetail is null', () => {
      expect(() => store.applyPrereqUpdate('pr-1', { status: 'accepted' })).not.toThrow();
    });
  });

  describe('applyMilestoneUpdate', () => {
    it('immutably updates the matching milestone', async () => {
      const m1 = makeMilestone({ id: 'm-1', status: 'active' });
      const detail = makeDetail({ milestones: [m1], activeMilestone: m1 });
      caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(detail));
      caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
      caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));
      await store.loadCase('case-1');

      store.applyMilestoneUpdate('m-1', { status: 'completed', completedAt: '2026-06-25T15:00:00Z' });

      expect(store.milestones()[0].status).toBe('completed');
      expect(store.milestones()[0].completedAt).toBe('2026-06-25T15:00:00Z');
    });

    it('rebuilds activeMilestone after a status change', async () => {
      const m1 = makeMilestone({ id: 'm-1', status: 'active', orderIndex: 0 });
      const m2 = makeMilestone({ id: 'm-2', status: 'open', orderIndex: 1, title: 'Next Milestone' });
      const detail = makeDetail({ milestones: [m1, m2], activeMilestone: m1 });
      caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(detail));
      caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
      caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));
      await store.loadCase('case-1');

      store.applyMilestoneUpdate('m-1', { status: 'completed' });
      store.applyMilestoneUpdate('m-2', { status: 'active' });

      expect(store.activeMilestone()?.id).toBe('m-2');
      expect(store.activeMilestone()?.title).toBe('Next Milestone');
    });

    it('is a no-op when caseDetail is null', () => {
      expect(() => store.applyMilestoneUpdate('m-1', { status: 'completed' })).not.toThrow();
    });
  });

  it('refreshParticipants re-fetches participant list', async () => {
    caseServiceSpy.getCaseDetail.and.returnValue(Promise.resolve(makeDetail()));
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve([]));
    caseServiceSpy.getMessages.and.returnValue(Promise.resolve([]));
    await store.loadCase('case-1');

    const updated = [makeParticipant('p1'), makeParticipant('p2')];
    caseServiceSpy.getParticipants.and.returnValue(Promise.resolve(updated));
    store.refreshParticipants('case-1');

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(store.participants()).toEqual(updated);
  });
});
