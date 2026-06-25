---
stage: implement
bolt: "018"
created: 2026-06-25T22:30:00Z
---

## Implementation Walkthrough: Prerequisite Status Updates (Bolt 018)

### Summary

Added a `getDisplayStatus` pure utility function that maps a prerequisite + milestone status to one of five display states. Updated `PrereqStatusBadgeComponent` to accept this computed display status instead of the raw DB status. Both the HFA Actions panel and Developer Status panel now compute display status per prereq and pass it to the badge, with upload links and action buttons guarded against non-active milestones.

### Structure Overview

All changes are display-layer only. No DB migration was needed — `returned: boolean` already existed on the prerequisites table, TypeScript types, and the `returnWithNote()` mutation. A pre-existing stale spec (`notification-bell.component.spec.ts`) was also fixed as it was blocking compilation.

### Completed Work

- [x] `client/src/app/core/cases/prereq-display-status.util.ts` — pure `getDisplayStatus(prereq, milestoneStatus)` returning `DisplayPrereqStatus`
- [x] `client/src/app/core/cases/prereq-display-status.util.spec.ts` — 6 unit tests covering all 5 mapping cases
- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.ts` — input renamed from `status` to `displayStatus: DisplayPrereqStatus`; labels updated; new `badge-muted` and `badge-danger` cases added
- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.scss` — added `badge-muted` (grey) and `badge-danger` (red) styles
- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.spec.ts` — rewritten for 5 display states
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.ts` — added `prereqDisplayStatus()` method
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.html` — both badge usages updated to `[displayStatus]`
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.ts` — added `prereqDisplayStatus()` method
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.html` — badge updated; upload link and mark-ready button guarded with `m.status === 'active'`; `is-not-ready` class added to prereq row
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.scss` — `.prereq-row.is-not-ready { opacity: 0.55 }` added
- [x] `client/src/app/components/notification-bell/notification-bell.component.spec.ts` — rewritten to match current component (pre-existing stale tests removed)

### Key Decisions

- **Pure utility function over component method**: `getDisplayStatus` lives in its own file so it can be tested in isolation and used by any future component without importing a component class.
- **Badge input rename**: Changing from `status` to `displayStatus` makes the intent explicit — callers must pre-compute the display state; the badge is purely presentational.
- **`m.status === 'active'` guard in developer panel**: Cleaner than computing `displayStatus` twice for the upload link condition; correctly prevents "Deficiency" prereqs from losing their upload link.

### Deviations from Plan

None — implemented exactly as planned.

### Dependencies Added

None.

### Developer Notes

The 6 pre-existing test failures (`MyTasksPage` + `CaseDetailPage`) are Supabase Realtime mock errors that predate this bolt. 319/325 tests pass.
