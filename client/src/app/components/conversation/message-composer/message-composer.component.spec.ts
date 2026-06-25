import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComposerComponent } from './message-composer.component';

describe('MessageComposerComponent', () => {
  let fixture: ComponentFixture<MessageComposerComponent>;
  let component: MessageComposerComponent;

  const getTextarea = (): HTMLTextAreaElement =>
    fixture.nativeElement.querySelector('textarea');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageComposerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageComposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Send button is disabled when textarea is empty', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.send-btn');
    expect(btn.disabled).toBeTrue();
  });

  it('Send button is disabled when textarea contains only whitespace', () => {
    component.text.set('   ');
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.send-btn');
    expect(btn.disabled).toBeTrue();
  });

  it('Send button is enabled when textarea has non-empty text', () => {
    component.text.set('Hello');
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.send-btn');
    expect(btn.disabled).toBeFalse();
  });

  it('emits trimmed text on Send click', () => {
    const emitted: string[] = [];
    component.send.subscribe((v: string) => emitted.push(v));
    component.text.set('  Hi there  ');
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.send-btn');
    btn.click();
    expect(emitted).toEqual(['Hi there']);
  });

  it('clears text after Send', () => {
    component.text.set('Hi');
    fixture.detectChanges();
    component.onSend();
    expect(component.text()).toBe('');
  });

  it('does not emit when text is empty', () => {
    const emitted: string[] = [];
    component.send.subscribe((v: string) => emitted.push(v));
    component.onSend();
    expect(emitted).toHaveSize(0);
  });

  it('Enter key sends message when text is non-empty', () => {
    const emitted: string[] = [];
    component.send.subscribe((v: string) => emitted.push(v));
    component.text.set('Enter test');
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
    component.onEnter(event);
    expect(emitted).toEqual(['Enter test']);
  });

  it('Shift+Enter does not send', () => {
    const emitted: string[] = [];
    component.send.subscribe((v: string) => emitted.push(v));
    component.text.set('Shift enter');
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    component.onEnter(event);
    expect(emitted).toHaveSize(0);
  });

  // --- @-mention integration ---

  it('onInput emits mentionQuery with token when @ pattern is detected', () => {
    const queries: Array<string | null> = [];
    component.mentionQuery.subscribe((q: string | null) => queries.push(q));
    const ta = getTextarea();
    ta.value = 'Hey @ali';
    ta.selectionStart = ta.value.length;
    ta.selectionEnd = ta.value.length;
    ta.dispatchEvent(new Event('input'));
    expect(queries).toContain('ali');
  });

  it('onInput emits mentionQuery(null) when no @ pattern before cursor', () => {
    const queries: Array<string | null> = [];
    component.mentionQuery.subscribe((q: string | null) => queries.push(q));
    const ta = getTextarea();
    ta.value = 'Hello world';
    ta.selectionStart = ta.value.length;
    ta.selectionEnd = ta.value.length;
    ta.dispatchEvent(new Event('input'));
    expect(queries[queries.length - 1]).toBeNull();
  });

  it('onInput emits mentionQuery("") when text ends with bare @', () => {
    const queries: Array<string | null> = [];
    component.mentionQuery.subscribe((q: string | null) => queries.push(q));
    const ta = getTextarea();
    ta.value = 'Hey @';
    ta.selectionStart = ta.value.length;
    ta.selectionEnd = ta.value.length;
    ta.dispatchEvent(new Event('input'));
    expect(queries).toContain('');
  });

  it('onSend emits mentionQuery(null) after successful send', () => {
    const queries: Array<string | null> = [];
    component.mentionQuery.subscribe((q: string | null) => queries.push(q));
    component.text.set('Hello');
    component.onSend();
    const lastQuery = queries[queries.length - 1];
    expect(lastQuery).toBeNull();
  });

  it('insertMention replaces @query fragment at cursor with @[Name] token', () => {
    const ta = getTextarea();
    ta.value = 'Hey @ali';
    ta.selectionStart = ta.value.length;
    ta.selectionEnd = ta.value.length;
    fixture.detectChanges();
    component.insertMention('Alice Dev');
    expect(component.text()).toContain('@[Alice Dev]');
    expect(component.text()).not.toContain('@ali');
  });

  it('insertMention emits mentionQuery(null) after insertion', () => {
    const queries: Array<string | null> = [];
    component.mentionQuery.subscribe((q: string | null) => queries.push(q));
    const ta = getTextarea();
    ta.value = '@ali';
    ta.selectionStart = ta.value.length;
    ta.selectionEnd = ta.value.length;
    component.insertMention('Alice Dev');
    expect(queries[queries.length - 1]).toBeNull();
  });
});
