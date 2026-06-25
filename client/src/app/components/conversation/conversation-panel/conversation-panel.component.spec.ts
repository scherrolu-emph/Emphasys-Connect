import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { ConversationPanelComponent } from './conversation-panel.component';
import { CaseDetailStore } from '../../../pages/case-detail/case-detail.store';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageService } from '../../../core/message/message.service';
import type { ConversationMessage, CaseParticipant, CaseDetail } from '../../../core/cases/case.models';

// JSDOM stub — scrollIntoView not implemented
(Element.prototype as unknown as Record<string, unknown>)['scrollIntoView'] = () => undefined;

const makeSystemMsg = (): ConversationMessage => ({
  id: 'sys-1', hfaId: 'hfa-1', caseId: 'case-1', authorId: null,
  type: 'system', content: 'Case imported from IMC: Riverside Commons', createdAt: '2026-06-25T09:00:00Z',
});

const makeManualMsg = (authorId: string): ConversationMessage => ({
  id: 'msg-1', hfaId: 'hfa-1', caseId: 'case-1', authorId,
  type: 'message', content: 'Hey team!', createdAt: '2026-06-25T09:01:00Z',
});

describe('ConversationPanelComponent', () => {
  let fixture: ComponentFixture<ConversationPanelComponent>;
  let component: ConversationPanelComponent;

  const messagesSignal = signal<ConversationMessage[]>([]);
  const participantsSignal = signal<CaseParticipant[]>([]);
  const caseDetailSignal = signal<CaseDetail | null>(null);
  const currentUserSignal = signal<{ id: string } | null>(null);

  const mockStore = {
    messages: messagesSignal,
    participants: participantsSignal,
    caseDetail: caseDetailSignal,
  };

  const mockAuth = {
    currentUser: computed(() => currentUserSignal()),
    isHfa: computed(() => false),
  };

  const mockMessageSvc = {
    sendMessage: jasmine.createSpy('sendMessage'),
    dispatchMentionNotifications: jasmine.createSpy('dispatchMentionNotifications'),
  };

  beforeEach(async () => {
    mockMessageSvc.sendMessage.calls.reset();
    mockMessageSvc.dispatchMentionNotifications.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ConversationPanelComponent],
      providers: [
        { provide: CaseDetailStore, useValue: mockStore },
        { provide: AuthService, useValue: mockAuth },
        { provide: MessageService, useValue: mockMessageSvc },
      ],
    }).compileComponents();

    messagesSignal.set([]);
    participantsSignal.set([]);
    caseDetailSignal.set(null);
    currentUserSignal.set(null);

    fixture = TestBed.createComponent(ConversationPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('caseId', 'case-1');
    fixture.detectChanges();
  });

  it('renders without error when messages list is empty', () => {
    expect(fixture.nativeElement.querySelector('.thread')).not.toBeNull();
  });

  it('renders a system message component for type=system messages', () => {
    messagesSignal.set([makeSystemMsg()]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-system-message')).not.toBeNull();
  });

  it('does not render a bubble component for system messages', () => {
    messagesSignal.set([makeSystemMsg()]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-message-bubble')).toBeNull();
  });

  it('renders a bubble component for type=message messages', () => {
    messagesSignal.set([makeManualMsg('user-abc')]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-message-bubble')).not.toBeNull();
  });

  it('does not render a system message component for type=message messages', () => {
    messagesSignal.set([makeManualMsg('user-abc')]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-system-message')).toBeNull();
  });

  it('isOwnMessage returns true when authorId matches current user', () => {
    currentUserSignal.set({ id: 'user-me' });
    const msg = makeManualMsg('user-me');
    expect(component.isOwnMessage(msg)).toBeTrue();
  });

  it('isOwnMessage returns false when authorId differs from current user', () => {
    currentUserSignal.set({ id: 'user-me' });
    const msg = makeManualMsg('user-other');
    expect(component.isOwnMessage(msg)).toBeFalse();
  });

  it('authorLabel resolves display name from participants', () => {
    const participant: CaseParticipant = {
      id: 'p-1', hfaId: 'hfa-1', caseId: 'case-1', userId: 'user-abc',
      email: 'dev@test.com', displayName: 'Alice Dev', role: 'developer', inviteStatus: 'accepted',
    };
    participantsSignal.set([participant]);
    currentUserSignal.set({ id: 'user-me' });
    const msg = makeManualMsg('user-abc');
    expect(component.authorLabel(msg)).toBe('Alice Dev');
  });

  it('authorLabel returns empty string when message authorId is null', () => {
    const msg = makeSystemMsg();
    expect(component.authorLabel(msg)).toBe('');
  });

  it('shows send error when sendError signal is set', () => {
    component.sendError.set('Message failed to send. Try again.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Message failed to send');
  });

  it('hides send error when sendError signal is null', () => {
    component.sendError.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.send-error')).toBeNull();
  });

  // --- @-mention popup ---

  it('mention popup is hidden when mentionQuery is null', () => {
    component.mentionQuery.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-mention-popup')).toBeNull();
  });

  it('mention popup is shown when mentionQuery is a non-null string', () => {
    component.mentionQuery.set('ali');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-mention-popup')).not.toBeNull();
  });

  it('mention popup is shown with empty string query (bare @)', () => {
    component.mentionQuery.set('');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-mention-popup')).not.toBeNull();
  });

  it('onMentionQuery sets mentionQuery signal', () => {
    component.onMentionQuery('bob');
    expect(component.mentionQuery()).toBe('bob');
  });

  it('onMentionQuery(null) sets mentionQuery to null', () => {
    component.mentionQuery.set('alice');
    component.onMentionQuery(null);
    expect(component.mentionQuery()).toBeNull();
  });

  it('onMentionDismissed sets mentionQuery to null', () => {
    component.mentionQuery.set('ali');
    component.onMentionDismissed();
    expect(component.mentionQuery()).toBeNull();
  });
});
