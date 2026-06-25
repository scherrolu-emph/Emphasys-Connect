import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { By } from '@angular/platform-browser';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;

  function create(name: string, size = 36): AvatarComponent {
    fixture = TestBed.createComponent(AvatarComponent);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AvatarComponent],
    });
  });

  it('shows two initials for a two-word name', () => {
    create('Alice Johnson');
    const el = fixture.debugElement.query(By.css('.avatar'));
    expect(el.nativeElement.textContent.trim()).toBe('AJ');
  });

  it('shows two chars for a single-word name', () => {
    create('Bob');
    const el = fixture.debugElement.query(By.css('.avatar'));
    expect(el.nativeElement.textContent.trim()).toBe('BO');
  });

  it('uses first and last word for multi-word names', () => {
    create('Mary Beth Williams');
    const el = fixture.debugElement.query(By.css('.avatar'));
    expect(el.nativeElement.textContent.trim()).toBe('MW');
  });

  it('is uppercase', () => {
    create('alice johnson');
    const el = fixture.debugElement.query(By.css('.avatar'));
    expect(el.nativeElement.textContent.trim()).toBe('AJ');
  });

  it('applies size as width and height in px', () => {
    create('Test User', 48);
    const el = fixture.debugElement.query(By.css('.avatar')).nativeElement as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('produces deterministic colors — same name yields same color', () => {
    create('Alice Johnson');
    const color1 = (fixture.debugElement.query(By.css('.avatar')).nativeElement as HTMLElement).style.backgroundColor;
    fixture.destroy();

    create('Alice Johnson');
    const color2 = (fixture.debugElement.query(By.css('.avatar')).nativeElement as HTMLElement).style.backgroundColor;

    expect(color1).toBe(color2);
  });

  it('produces different colors for different names (usually)', () => {
    create('Alice Johnson');
    const color1 = (fixture.debugElement.query(By.css('.avatar')).nativeElement as HTMLElement).style.backgroundColor;
    fixture.destroy();

    create('Bob Smith');
    const color2 = (fixture.debugElement.query(By.css('.avatar')).nativeElement as HTMLElement).style.backgroundColor;

    // Not guaranteed to differ but these two names hash to different palette slots
    expect(color1).not.toBe(color2);
  });
});
