import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MentionPopupComponent } from './mention-popup.component';
import type { CaseParticipant } from '../../../core/cases/case.models';

const makeParticipant = (overrides: Partial<CaseParticipant> = {}): CaseParticipant => ({
  id: 'p-1', hfaId: 'hfa-1', caseId: 'case-1', userId: 'u-1',
  email: 'alice@test.com', displayName: 'Alice Dev',
  role: 'developer', inviteStatus: 'accepted',
  ...overrides,
});

describe('MentionPopupComponent', () => {
  let fixture: ComponentFixture<MentionPopupComponent>;
  let component: MentionPopupComponent;

  const PARTICIPANTS: CaseParticipant[] = [
    makeParticipant({ id: 'p-1', userId: 'u-1', displayName: 'Alice Dev', email: 'alice@test.com' }),
    makeParticipant({ id: 'p-2', userId: 'u-2', displayName: 'Bob Staff', email: 'bob@hfa.demo', role: 'hfa_staff' }),
    makeParticipant({ id: 'p-3', userId: null, displayName: null, email: 'carol@test.com' }),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentionPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MentionPopupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('participants', PARTICIPANTS);
    fixture.componentRef.setInput('query', '');
    fixture.detectChanges();
  });

  it('renders all participants when query is empty', () => {
    const items = fixture.nativeElement.querySelectorAll('li:not(.no-match)');
    expect(items.length).toBe(3);
  });

  it('filters by displayName case-insensitively', () => {
    fixture.componentRef.setInput('query', 'ali');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('li:not(.no-match)');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Alice Dev');
  });

  it('falls back to email when displayName is null', () => {
    fixture.componentRef.setInput('query', 'carol');
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('li:not(.no-match)');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('carol@test.com');
  });

  it('shows no-match item when nothing matches', () => {
    fixture.componentRef.setInput('query', 'zzz');
    fixture.detectChanges();
    const noMatch = fixture.nativeElement.querySelector('li.no-match');
    expect(noMatch).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('li:not(.no-match)').length).toBe(0);
  });

  it('emits participantSelected when a participant is clicked', () => {
    const emitted: CaseParticipant[] = [];
    component.participantSelected.subscribe((p: CaseParticipant) => emitted.push(p));
    const items: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('li:not(.no-match)');
    items[0].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0].displayName).toBe('Alice Dev');
  });

  it('emits dismissed on Escape keydown', () => {
    const emitted: unknown[] = [];
    component.dismissed.subscribe(() => emitted.push(true));
    component.onEscape();
    expect(emitted.length).toBe(1);
  });

  it('emits dismissed on click outside the component', () => {
    const emitted: unknown[] = [];
    component.dismissed.subscribe(() => emitted.push(true));
    const outsideEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(outsideEvent, 'target', { value: document.body });
    component.onDocClick(outsideEvent);
    expect(emitted.length).toBe(1);
  });

  it('does NOT emit dismissed when clicking inside the component', () => {
    const emitted: unknown[] = [];
    component.dismissed.subscribe(() => emitted.push(true));
    const insideEl: HTMLElement = fixture.nativeElement;
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: insideEl });
    component.onDocClick(event);
    expect(emitted.length).toBe(0);
  });
});
