import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MilestoneStatusBadgeComponent } from './milestone-status-badge.component';
import type { MilestoneDetail } from '../../core/cases/case.models';

async function create(
  status: MilestoneDetail['status'],
): Promise<ComponentFixture<MilestoneStatusBadgeComponent>> {
  await TestBed.configureTestingModule({
    imports: [MilestoneStatusBadgeComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(MilestoneStatusBadgeComponent);
  fixture.componentRef.setInput('status', status);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('MilestoneStatusBadgeComponent', () => {
  it('shows "Upcoming" with neutral class for open', async () => {
    const fixture = await create('open');
    const span = fixture.debugElement.query(By.css('.badge-neutral'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Upcoming');
  });

  it('shows "In Progress" with accent class for active', async () => {
    const fixture = await create('active');
    const span = fixture.debugElement.query(By.css('.badge-accent'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('In Progress');
  });

  it('shows "Complete" with success class for completed', async () => {
    const fixture = await create('completed');
    const span = fixture.debugElement.query(By.css('.badge-success'));
    expect(span).toBeTruthy();
    expect((span.nativeElement as HTMLElement).textContent?.trim()).toBe('Complete');
  });
});
