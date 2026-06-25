import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PrereqStatusBadgeComponent } from './prereq-status-badge.component';
import type { PrerequisiteSummary } from '../../core/cases/case.models';

async function create(
  status: PrerequisiteSummary['status'],
): Promise<ComponentFixture<PrereqStatusBadgeComponent>> {
  await TestBed.configureTestingModule({
    imports: [PrereqStatusBadgeComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(PrereqStatusBadgeComponent);
  fixture.componentRef.setInput('status', status);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('PrereqStatusBadgeComponent', () => {
  it('shows "Pending" with neutral class for pending_open', async () => {
    const fixture = await create('pending_open');
    const span = fixture.debugElement.query(By.css('.badge-neutral'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Pending');
  });

  it('shows "Received — Under Review" with caution class for received_processing', async () => {
    const fixture = await create('received_processing');
    const span = fixture.debugElement.query(By.css('.badge-caution'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Received — Under Review');
  });

  it('shows "Accepted" with success class for accepted', async () => {
    const fixture = await create('accepted');
    const span = fixture.debugElement.query(By.css('.badge-success'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Accepted');
  });
});
