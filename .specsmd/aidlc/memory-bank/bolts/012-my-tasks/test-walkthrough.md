---
stage: test
bolt: "012"
created: 2026-06-25T00:00:00Z
---

## Test Report: My Tasks

### Summary

- **Tests**: 271/271 passed
- **New tests added**: 19 (6 TaskService + 13 MyTasksPage)
- **Pre-existing**: 252 (no regressions)

### Test Files

- [x] `client/src/app/core/tasks/task.service.spec.ts` — participant empty case, participant no prereqs, participant full mapping, HFA null ID, HFA received_processing mapping, DB error propagation
- [x] `client/src/app/pages/my-tasks/my-tasks.page.spec.ts` — loading skeleton, skeleton removal, task list rendering, prereq+case title display, milestone name display, badge count update, empty state text, empty badge count, navigation, realtime subscribe, realtime no-subscribe when empty, realtime unsubscribe on destroy, unauthenticated guard

### Acceptance Criteria Validation

- ✅ **My Tasks tab visible for all authenticated users**: `TabsPage` renders tab bar with `tab="my-tasks"` for all personas
- ✅ **Tab shows badge count (live)**: `TaskBadgeService.count` driven by `MyTasksPage.loadTasks`, bound to `IonBadge` in `TabsPage`
- ✅ **Task list shows prereq title, case title, milestone name, status badge**: verified by `my-tasks.page.spec.ts` content assertions
- ✅ **Tapping task navigates to `/cases/{caseId}`**: `navigateToCase()` spec passes
- ✅ **Empty state shown when no tasks**: "no outstanding tasks" text verified
- ✅ **IonSkeletonText loading state**: skeleton rows visible before `ngOnInit` resolves
- ✅ **Realtime subscription on load, unsubscription on destroy**: subscription spec passes
- ✅ **No subscription when no tasks**: empty-task subscription guard spec passes
- ✅ **Badge count set to 0 when empty**: empty badge count spec passes
- ✅ **Lint**: `ng lint --max-warnings=0` — all files pass

### Issues Found

None. The `as any` cast is used in test builders to satisfy TypeScript's strict generic `supabase.from()` return type — consistent with the pattern in `prerequisite.service.spec.ts`.

### Notes

The `ERROR: '[LoginPage] signInWithOtp error'` log in test output is a pre-existing console.error from `login.page.spec.ts` testing an error-handling path; it is not a test failure (all 271 PASS).
