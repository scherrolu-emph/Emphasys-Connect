---
stage: implement
bolt: "013"
created: 2026-06-25T00:00:00Z
---

## Implementation Walkthrough: Activity Feed

### Summary

Added the Activity Feed tab as the third bottom-navigation tab for both HFA and Participant personas. The feed queries `conversation_messages` across all of the user's cases (via `case_participants`), renders them newest-first with visual distinction between system and manual events, and receives live Realtime inserts without a page refresh.

### Structure Overview

New standalone service (`ActivityService`) handles the three-step Supabase query (case IDs → messages → author names). A new `BottomNavComponent` provides the fixed bottom navigation bar shared across all three primary pages. `ActivityPage` wires service + Realtime + routing into the feed view. `RealtimeService` gains a lightweight `activityMessage$` Subject for future cross-component broadcasting.

### Completed Work

- [x] `client/src/app/core/activity/activity.model.ts` — `ActivityItem` interface + `timeAgo()` pure helper
- [x] `client/src/app/core/activity/activity.service.ts` — `ActivityService.getActivity(userId)` with three-step query and author name resolution
- [x] `client/src/app/components/bottom-nav/bottom-nav.component.ts` — fixed bottom nav, `isHfa` input drives home tab label/route, `computed` tabs signal
- [x] `client/src/app/pages/activity/activity.page.ts` — `ActivityPage` standalone component; `signal<ActivityItem[]>` + `isLoading` signal; subscribes to all case channels on init, unsubscribes on destroy
- [x] `client/src/app/pages/activity/activity.page.html` — skeleton loading, empty state, `@for` list with system/manual styling, bottom nav
- [x] `client/src/app/pages/activity/activity.page.scss` — `--padding-bottom: 60px`, system-row muted background, 2-line body clamp
- [x] `client/src/app/core/realtime/realtime.service.ts` — added `ActivityMessageEvent` interface, `Subject<ActivityMessageEvent>` + `activityMessage$` observable; fires on every `conversation_messages` INSERT across any subscribed channel
- [x] `client/src/app/app.routes.ts` — `/activity` lazy-loaded route with `authGuard`
- [x] `client/src/app/pages/dashboard/dashboard.page.ts` — added `BottomNavComponent` import + `isHfa` signal
- [x] `client/src/app/pages/dashboard/dashboard.page.html` — added `<app-bottom-nav [isHfa]="isHfa()" />`
- [x] `client/src/app/pages/dashboard/dashboard.page.scss` — added `--padding-bottom: 60px` on `ion-content`
- [x] `client/src/app/pages/my-cases/my-cases.page.ts` — added `BottomNavComponent` import + `<app-bottom-nav [isHfa]="false" />` in template

### Key Decisions

- **Two-step query over RPC**: kept query logic in TypeScript rather than a DB function to avoid deployment dependencies; straightforward for LIMIT 50 scope
- **Author names in third query**: batched single `profiles` SELECT rather than per-row joins; eliminates N+1 and avoids join complexity in the typed client
- **BottomNavComponent over IonTabBar**: plain CSS fixed nav avoids nested Ionic routing complexity; lets Bolt 012 (My Tasks page) simply add the page at `/my-tasks` without restructuring routes
- **ngOnDestroy unsubscribe**: ActivityPage unsubscribes its case channels on destroy so CaseDetailPage gets fresh channel callbacks when navigating to a case

### Deviations from Plan

None — all deliverables implemented as specified in `implementation-plan.md`.

### Dependencies Added

None — `rxjs` Subject was already a transitive dependency via `@supabase/supabase-js`.

### Developer Notes

- The `/my-tasks` route does not exist yet (Bolt 012); the My Tasks tab button in `BottomNavComponent` navigates there but will 404 until Bolt 012 ships. This is intentional — Bolt 013 owns the nav shell structure.
- `router.url` in `BottomNavComponent` is read synchronously at render time; it correctly highlights the active tab on initial render. Angular's change detection re-evaluates on navigation events so active state stays accurate.
