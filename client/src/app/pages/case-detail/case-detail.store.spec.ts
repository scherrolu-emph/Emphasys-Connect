import { TestBed } from '@angular/core/testing';
import { CaseDetailStore } from './case-detail.store';
import { CaseService } from '../../core/cases/case.service';
import type { CaseDetail, CaseParticipant, ConversationMessage } from '../../core/cases/case.models';

const makeDetail = (): CaseDetail => ({
  id: 'case-1',
  hfaId: 'hfa-1',
  title: 'Lotus Apartments',
  referenceNumber: 'MF-2024-0188',
  caseType: 'development_construction',
  milestones: [],
  activeMilestone: null,
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
