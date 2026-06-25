import { isOverdue } from './overdue.utils';
import type { MilestoneSummary } from './case.models';

const base: MilestoneSummary = {
  id: 'm1',
  title: 'Milestone 1',
  status: 'active',
  targetDays: 30,
  activatedAt: new Date(Date.now() - 40 * 86_400_000).toISOString(),
};

describe('isOverdue', () => {
  it('returns false for null', () => {
    expect(isOverdue(null)).toBeFalse();
  });

  it('returns false when milestone is completed', () => {
    expect(isOverdue({ ...base, status: 'completed' })).toBeFalse();
  });

  it('returns false when targetDays is null', () => {
    expect(isOverdue({ ...base, targetDays: null })).toBeFalse();
  });

  it('returns false when activatedAt is null', () => {
    expect(isOverdue({ ...base, activatedAt: null })).toBeFalse();
  });

  it('returns true when deadline has passed', () => {
    expect(isOverdue(base)).toBeTrue();
  });

  it('returns false when deadline has not yet passed', () => {
    const future: MilestoneSummary = {
      ...base,
      activatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    };
    expect(isOverdue(future)).toBeFalse();
  });
});
