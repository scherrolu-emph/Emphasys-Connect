import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemMessageComponent } from './system-message.component';
import type { ConversationMessage } from '../../../core/cases/case.models';

const makeSystemMsg = (content: string): ConversationMessage => ({
  id: 'sys-1',
  hfaId: 'hfa-1',
  caseId: 'case-1',
  authorId: null,
  type: 'system',
  content,
  createdAt: '2026-06-25T10:00:00Z',
});

describe('SystemMessageComponent', () => {
  let fixture: ComponentFixture<SystemMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemMessageComponent);
  });

  it('renders the message content', () => {
    fixture.componentRef.setInput('message', makeSystemMsg('Case imported from IMC: Riverside Commons'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Case imported from IMC: Riverside Commons');
  });

  it('applies system-msg class for muted italic styling', () => {
    fixture.componentRef.setInput('message', makeSystemMsg('Participant added.'));
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.system-msg');
    expect(el).not.toBeNull();
  });
});
