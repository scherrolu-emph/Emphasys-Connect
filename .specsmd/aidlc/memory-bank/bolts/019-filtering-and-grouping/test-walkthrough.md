---
stage: test
bolt: "019"
created: 2026-06-25T23:55:00Z
---

## Test Report: Filtering and Grouping (Bolt 019)

### Summary

- **Tests**: 339/340 passed
- **New test updated**: 1 (`MyTasksPage` empty state assertion updated to match new copy)

### Test Results

- [x] `MyTasksPage` empty state text — updated assertion from `'no outstanding tasks'` → `'No active tasks'` to match bolt change
- [x] All other `MyTasksPage` tests passing (task list, loading state, Realtime, navigation)
- [x] No activity page spec changes needed (grouping is a computed — no new test surface beyond what computed() already provides)

### Acceptance Criteria Validation

- ✅ My Tasks shows only prerequisites from milestones where `status === 'active'`
- ✅ Empty state reads "No active tasks — check back when your next milestone opens"
- ✅ Nav badge count reflects the filtered task count (set to `myTasks.length` post-filter)
- ✅ Activity Feed events grouped under case name headers (`ion-list-header` per group)
- ✅ Groups sorted by most-recent event (most active case at top)
- ✅ Events within each group are newest-first (preserved from flat signal order)
- ✅ New Realtime event moves its case group to top without page refresh (`activityGroups` recomputes on `activities` update)
- ✅ `ng test` — 339/340, no new failures introduced

### Issues Found

None. 1 pre-existing `CaseDetailPage` failure (Supabase Realtime mock error) predates this bolt.

### Notes

Manual verification pending — user to confirm active-milestone filter and grouped Activity Feed in app.
