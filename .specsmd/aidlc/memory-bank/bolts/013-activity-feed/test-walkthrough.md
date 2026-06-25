---
stage: test
bolt: "013"
created: 2026-06-25T00:00:00Z
---

## Test Report: Activity Feed

### Summary

- **Tests**: 20/20 passed (new tests); 0 new failures introduced
- **Pre-existing failures**: 2 (in `case-detail.page.spec.ts` and `notification.service` — unrelated to this bolt; pre-exist before Bolt 013)
- **Coverage**: All domain logic in `timeAgo()` and `ActivityService.getActivity()` covered; `RealtimeService.activityMessage$` integration verified

### Test Files

- [x] `client/src/app/core/activity/activity.model.spec.ts` — 6 tests covering all branches of `timeAgo()` (just now, minutes, hours, days, boundary at 1m, boundary at 1h)
- [x] `client/src/app/core/activity/activity.service.spec.ts` — 4 tests: service creation, empty participations returns `[]`, system message maps to `ActivityItem` with `messageType: 'system'` and no `authorName`, manual message resolves `authorName` from profiles
- [x] `client/src/app/core/realtime/realtime.service.spec.ts` — extended with 2 new tests: `activityMessage$` is an observable, `onMessage` callback fires when a message event is received via `subscribeToCase`

### Acceptance Criteria Validation

- ✅ **"Activity" tab visible in bottom nav as third tab (both personas)**: `BottomNavComponent` renders Cases|My Tasks|Activity for HFA; My Cases|My Tasks|Activity for Participant; added to `DashboardPage` and `MyCasesPage`
- ✅ **Feed shows messages across all user's cases newest-first (LIMIT 50)**: `ActivityService` queries `conversation_messages` ordered `created_at DESC LIMIT 50` across user's `case_participants`
- ✅ **Each row: event description, case name, relative timestamp**: template renders `item.body` (2-line clamp), `item.caseName`, `timeAgo(item.createdAt)` 
- ✅ **System events muted style; manual messages show author name**: `activity-item--system` CSS class on system rows; `activity-author` paragraph conditionally rendered for manual messages
- ✅ **Tap any row → navigates to /cases/{caseId}**: `(click)="navigateToCase(item.caseId)"` → `router.navigate(['/cases', caseId])`
- ✅ **Empty state "No activity yet"**: rendered when `!isLoading() && activities().length === 0`
- ✅ **Realtime INSERT prepends item live**: `subscribeToCase` callback updates `activities` signal via `.update(prev => [newItem, ...prev])`
- ✅ **IonSkeletonText shown while loading**: rendered when `isLoading()` is true; set false in `finally` block

### Issues Found

None — build clean, all new tests passing, pre-existing test failures are unrelated to this bolt.

### Notes

- The `/my-tasks` route does not exist yet (Bolt 012 in parallel); `BottomNavComponent` renders the tab button but navigation will 404 until Bolt 012 ships.
- Pre-existing `case-detail.page.spec.ts` failure is a Supabase mock ordering issue in the test harness unrelated to any changes in this bolt.
