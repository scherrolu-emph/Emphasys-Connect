import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseCardComponent } from './case-card.component';
import type { CaseSummary } from '../../../core/cases/case.models';

const makeSummary = (overrides: Partial<CaseSummary> = {}): CaseSummary => ({
  id: 'c1',
  title: 'Test Case',
  caseType: 'development_construction',
  activeMilestone: null,
  prereqAccepted: 1,
  prereqTotal: 4,
  milestoneCompleted: 2,
  milestoneTotal: 5,
  ...overrides,
});

describe('CaseCardComponent', () => {
  let component: CaseCardComponent;
  let fixture: ComponentFixture<CaseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('caseItem', makeSummary());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('progressPercent', () => {
    it('calculates progress from milestone counts', () => {
      fixture.componentRef.setInput('caseItem', makeSummary({ milestoneCompleted: 2, milestoneTotal: 4 }));
      expect(component.progressPercent()).toBe(50);
    });

    it('returns 0 when milestoneTotal is 0', () => {
      fixture.componentRef.setInput('caseItem', makeSummary({ milestoneCompleted: 0, milestoneTotal: 0 }));
      expect(component.progressPercent()).toBe(0);
    });

    it('rounds to nearest integer', () => {
      fixture.componentRef.setInput('caseItem', makeSummary({ milestoneCompleted: 1, milestoneTotal: 3 }));
      expect(component.progressPercent()).toBe(33);
    });

    it('reaches 100 when all milestones complete', () => {
      fixture.componentRef.setInput('caseItem', makeSummary({ milestoneCompleted: 4, milestoneTotal: 4 }));
      expect(component.progressPercent()).toBe(100);
    });
  });

  describe('milestone count display', () => {
    it('renders milestone count text in the template', () => {
      fixture.componentRef.setInput('caseItem', makeSummary({ milestoneCompleted: 2, milestoneTotal: 5 }));
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.milestone-progress');
      expect(el?.textContent?.trim()).toBe('2 of 5 milestones completed');
    });

    it('renders 0 of N when no milestones are complete', () => {
      fixture.componentRef.setInput('caseItem', makeSummary({ milestoneCompleted: 0, milestoneTotal: 3 }));
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('.milestone-progress');
      expect(el?.textContent?.trim()).toBe('0 of 3 milestones completed');
    });
  });
});
