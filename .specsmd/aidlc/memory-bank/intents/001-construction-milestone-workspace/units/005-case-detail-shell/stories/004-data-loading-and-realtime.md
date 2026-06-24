---
id: 004-data-loading-and-realtime
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 004-data-loading-and-realtime

## User Story
**As a** any case participant
**I want** case data to load on entry and stay live throughout the session
**So that** I always see the current state without manually refreshing

## Acceptance Criteria
- [ ] **Given** a user navigating to `/cases/:id`, **When** the route activates, **Then** the component fetches case metadata, milestones, prerequisites, participants, and the initial 50 messages from Supabase
- [ ] **Given** data is being fetched, **When** the fetch is in flight, **Then** a loading indicator is shown in place of panel content
- [ ] **Given** the component has loaded, **When** `ionViewDidEnter` fires, **Then** `RealtimeService.subscribeToCase(caseId)` is called
- [ ] **Given** an active Realtime subscription, **When** `ionViewWillLeave` fires, **Then** `unsubscribe` is called to clean up the channel
- [ ] **Given** an active Realtime subscription, **When** a `postgres_changes` event arrives for case data, **Then** the relevant `CaseDetailStore` signal is updated and the UI re-renders

## Technical Notes
- `CaseDetailStore` is a standalone injectable service using Angular `signal()` for `case`, `milestones`, `prerequisites`, `participants`, `messages`
- Inject `RealtimeService`; subscribe/unsubscribe in `ionViewDidEnter` / `ionViewWillLeave`
- Handle `postgres_changes` events by calling `.update()` on the affected signal
- Initial fetch is a single compound Supabase query or sequential parallel queries using `Promise.all`

## Dependencies
### Requires
- `001-two-panel-layout`
### Enables
- All Unit 006 and Unit 007 stories (they all read from `CaseDetailStore`)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Network error during initial fetch | Error state shown with retry button |
| Realtime event arrives before initial fetch completes | Event queued or ignored; store populated by initial fetch |
| User navigates away and back quickly | Previous subscription cleaned up before new one starts |

## Out of Scope
- Pagination beyond the initial 50 messages (Unit 007 story 001)
- Offline support
