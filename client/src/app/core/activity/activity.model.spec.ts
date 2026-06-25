import { timeAgo } from './activity.model';

describe('timeAgo', () => {
  it('returns "just now" for timestamps less than 1 minute ago', () => {
    const iso = new Date(Date.now() - 30_000).toISOString();
    expect(timeAgo(iso)).toBe('just now');
  });

  it('returns minutes for timestamps 1–59 minutes ago', () => {
    const iso = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(iso)).toBe('5m ago');
  });

  it('returns hours for timestamps 1–23 hours ago', () => {
    const iso = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(timeAgo(iso)).toBe('3h ago');
  });

  it('returns days for timestamps 24+ hours ago', () => {
    const iso = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(timeAgo(iso)).toBe('2d ago');
  });

  it('returns "1m ago" at exactly 60 seconds', () => {
    const iso = new Date(Date.now() - 60_000).toISOString();
    expect(timeAgo(iso)).toBe('1m ago');
  });

  it('returns "1h ago" at exactly 60 minutes', () => {
    const iso = new Date(Date.now() - 3_600_000).toISOString();
    expect(timeAgo(iso)).toBe('1h ago');
  });
});
