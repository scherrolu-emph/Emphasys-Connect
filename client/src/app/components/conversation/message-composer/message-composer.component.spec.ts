import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComposerComponent } from './message-composer.component';

describe('MessageComposerComponent', () => {
  let fixture: ComponentFixture<MessageComposerComponent>;
  let component: MessageComposerComponent;

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
});
