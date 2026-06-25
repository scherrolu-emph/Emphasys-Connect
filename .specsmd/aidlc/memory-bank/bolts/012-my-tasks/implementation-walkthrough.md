---
stage: implement
bolt: "012"
created: 2026-06-25T00:00:00Z
---

## Implementation Walkthrough: My Tasks

### Summary

Added the "My Tasks" tab as the second bottom-navigation entry for all authenticated users. The implementation introduces a tab shell component that wraps the three main tabbed routes (`dashboard`, `my-cases`, `my-tasks`) under a shared `IonTabBar`, with a live badge count on the My Tasks button driven by a singleton signal service.

### Structure Overview

A new `TabsPage` shell component was added as the parent route at path `''`. All previously flat tab-level routes (`dashboard`, `my-cases`) and the new `my-tasks` route are now children of this shell. Full-screen routes (`cases/:id`, `create-case/*`, `login`) remain flat and bypass the tab shell entirely. A lightweight `TaskBadgeService` singleton propagates the task count from `MyTasksPage` to `TabsPage` without coupling the two pages directly.

### Completed Work

- [x] `client/src/app/core/tasks/task.models.ts` — `MyTask` interface: prereq title, case title, milestone name, status, IDs for navigation
- [x] `client/src/app/core/tasks/task-badge.service.ts` — singleton `WritableSignal<number>` shared between `MyTasksPage` and `TabsPage` for reactive badge count
- [x] `client/src/app/core/tasks/task.service.ts` — `getMyTasks(userId, isHfa, hfaId)`: multi-step Supabase queries (participant case IDs or HFA case IDs → filtered prerequisites → milestone + case title lookups); no RPC needed
- [x] `client/src/app/core/realtime/realtime.service.ts` — added `subscribeToPrereqChanges(caseIds[], callback)` and `unsubscribePrereqChanges(caseIds[])` using `tasks:{caseId}` channel keys to avoid collisions with existing case channels
- [x] `client/src/app/pages/my-tasks/my-tasks.page.ts` — smart component at `/my-tasks`: signal-based task list, loading skeleton, empty state, Realtime subscription on `ngOnInit`, cleanup on `ngOnDestroy`, badge count propagation via `TaskBadgeService`
- [x] `client/src/app/pages/tabs/tabs.page.ts` — `IonTabs` + `IonTabBar` shell; persona-conditional first tab (HFA→`dashboard`, participant→`my-cases`); badge on My Tasks tab; Activity tab rendered as `disabled` stub
- [x] `client/src/app/app.routes.ts` — routes restructured: `dashboard`, `my-cases`, `my-tasks` are now children of the tabs shell at path `''`; removed duplicate `cases/:id` route; added child empty-path redirect to `my-tasks`

### Key Decisions

- **No RPC migration**: The multi-step client-side query approach (matching the pattern in `case.service.ts`) is readable and avoids a DB migration. An RPC can be introduced post-hackathon if query performance becomes a concern.
- **`tasks:` channel key prefix**: Realtime subscriptions for My Tasks use `tasks:{caseId}` as the map key, separate from the `{caseId}` key used by `subscribeToCase`. This lets both coexist without conflict in the shared `channels` Map.
- **Flat tabs via `path: ''` parent**: The tabs shell at path `''` with child routes keeps all existing URLs unchanged (`/dashboard`, `/my-cases`, `/my-tasks`) while adding the shared bottom nav.
- **Activity tab disabled**: Tab 3 renders with `disabled` attribute — preserves the three-tab visual chrome without routing to a non-existent page.

### Deviations from Plan

- **TaskBadgeService instead of passing count through a route**: The plan mentioned passing the count from `MyTasksPage` to `TabsPage`. Using a singleton service (`TaskBadgeService`) is cleaner — no need to wire output signals through route params.
- **No SQL migration**: The plan included a Supabase RPC file. A direct multi-step query was sufficient and consistent with the existing codebase pattern.

### Dependencies Added

None — all dependencies (`@ionic/angular/standalone`, `ionicons`) were already present.

### Developer Notes

- `TaskBadgeService.count` is set by `MyTasksPage` on every load (including Realtime-triggered reloads). If the user navigates to My Tasks from another tab, the badge already reflects the correct count from the last time My Tasks was active. On first app load, the badge shows 0 until My Tasks is visited — this is acceptable for the hackathon.
- The Realtime subscription subscribes only to the case IDs from the initial task load. New cases added mid-session won't trigger updates until the next full reload.
