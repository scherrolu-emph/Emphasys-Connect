import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PrereqStatusBadgeComponent } from './prereq-status-badge.component';
import type { DisplayPrereqStatus } from '../../core/cases/prereq-display-status.util';

async function create(
  displayStatus: DisplayPrereqStatus,
): Promise<ComponentFixture<PrereqStatusBadgeComponent>> {
  await TestBed.configureTestingModule({
    imports: [PrereqStatusBadgeComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(PrereqStatusBadgeComponent);
  fixture.componentRef.setInput('displayStatus', displayStatus);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('PrereqStatusBadgeComponent', () => {
  it('shows "Not Ready" with muted class', async () => {
    const fixture = await create('not_ready');
    const span = fixture.debugElement.query(By.css('.badge-muted'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Not Ready');
  });

  it('shows "Pending" with neutral class', async () => {
    const fixture = await create('pending');
    const span = fixture.debugElement.query(By.css('.badge-neutral'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Pending');
  });

  it('shows "Deficiency" with danger class', async () => {
    const fixture = await create('deficiency');
    const span = fixture.debugElement.query(By.css('.badge-danger'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Deficiency');
  });

  it('shows "Submitted - Under Review" with caution class', async () => {
    const fixture = await create('submitted_under_review');
    const span = fixture.debugElement.query(By.css('.badge-caution'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Submitted - Under Review');
  });

  it('shows "Accepted" with success class', async () => {
    const fixture = await create('accepted');
    const span = fixture.debugElement.query(By.css('.badge-success'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Accepted');
  });
});
