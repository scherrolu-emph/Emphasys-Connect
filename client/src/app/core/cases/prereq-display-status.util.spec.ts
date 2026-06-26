import { getDisplayStatus } from './prereq-display-status.util';
import type { PrerequisiteSummary } from './case.models';

function prereq(overrides: Partial<PrerequisiteSummary> = {}): PrerequisiteSummary {
  return {
    id: 'p1',
    title: 'Test Prereq',
    type: 'document_submission',
    status: 'pending_open',
    requested: false,
    returned: false,
    ownerId: null,
    uploadLink: null,
    docName: null,
    notes: null,
    submittedAt: null,
    acceptedAt: null,
    ...overrides,
  };
}

describe('getDisplayStatus', () => {
  it('returns not_ready for open milestone regardless of prereq status', () => {
    expect(getDisplayStatus(prereq({ status: 'pending_open' }), 'open')).toBe('not_ready');
    expect(getDisplayStatus(prereq({ status: 'received_processing' }), 'open')).toBe('not_ready');
    expect(getDisplayStatus(prereq({ status: 'accepted' }), 'open')).toBe('not_ready');
  });

  it('passes through actual prereq status for completed milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'pending_open' }), 'completed')).toBe('pending');
  });

  it('returns accepted for accepted prereq on completed milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'accepted' }), 'completed')).toBe('accepted');
  });

  it('returns submitted_under_review for received_processing prereq on completed milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'received_processing' }), 'completed')).toBe('submitted_under_review');
  });

  it('returns submitted_under_review for received_processing in active milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'received_processing' }), 'active')).toBe('submitted_under_review');
  });

  it('returns deficiency for pending_open + returned in active milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'pending_open', returned: true }), 'active')).toBe('deficiency');
  });

  it('returns pending for pending_open + not returned in active milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'pending_open', returned: false }), 'active')).toBe('pending');
  });

  it('returns accepted for accepted in active milestone', () => {
    expect(getDisplayStatus(prereq({ status: 'accepted' }), 'active')).toBe('accepted');
  });
});
