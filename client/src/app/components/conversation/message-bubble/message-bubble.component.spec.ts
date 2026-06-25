import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageBubbleComponent } from './message-bubble.component';
import type { ConversationMessage } from '../../../core/cases/case.models';

const makeMsg = (overrides: Partial<ConversationMessage> = {}): ConversationMessage => ({
  id: 'msg-1',
  hfaId: 'hfa-1',
  caseId: 'case-1',
  authorId: 'user-1',
  type: 'message',
  content: 'Hello world',
  createdAt: '2026-06-25T10:00:00Z',
  ...overrides,
});

describe('MessageBubbleComponent', () => {
  let fixture: ComponentFixture<MessageBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBubbleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageBubbleComponent);
  });

  it('renders message content', () => {
    fixture.componentRef.setInput('message', makeMsg({ content: 'Test content' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test content');
  });

  it('applies own class when isOwn is true', () => {
    fixture.componentRef.setInput('message', makeMsg());
    fixture.componentRef.setInput('isOwn', true);
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.bubble-row');
    expect(row.classList).toContain('own');
  });

  it('does not apply own class when isOwn is false', () => {
    fixture.componentRef.setInput('message', makeMsg());
    fixture.componentRef.setInput('isOwn', false);
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.bubble-row');
    expect(row.classList).not.toContain('own');
  });

  it('renders author label when provided', () => {
    fixture.componentRef.setInput('message', makeMsg());
    fixture.componentRef.setInput('authorLabel', 'Jane Smith');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Jane Smith');
  });

  it('hides author element when authorLabel is empty', () => {
    fixture.componentRef.setInput('message', makeMsg());
    fixture.componentRef.setInput('authorLabel', '');
    fixture.detectChanges();
    const author = fixture.nativeElement.querySelector('.author');
    expect(author).toBeNull();
  });

  it('formats timestamp as locale time string', () => {
    fixture.componentRef.setInput('message', makeMsg({ createdAt: '2026-06-25T10:30:00Z' }));
    fixture.detectChanges();
    const ts = fixture.nativeElement.querySelector('.ts');
    expect(ts.textContent.trim()).not.toBe('');
  });
});
