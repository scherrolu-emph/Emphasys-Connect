---
stage: plan
bolt: "012"
created: 2026-06-25T00:00:00Z
---

## Implementation Plan: My Tasks

### Objective

Add a "My Tasks" bottom-navigation tab that shows every prerequisite requiring action from the logged-in user across all their cases, with a live-updating badge count driven by Supabase Realtime.

### Current Navigation Context

The app currently has **no `IonTabBar`** — navigation is route-only via `AppComponent` with a bare `IonRouterOutlet`. This bolt must introduce a tab shell component as the nav wrapper, with the My Tasks tab as the second slot.

Tab layout (same for both personas):

| Slot | HFA route | Participant route | Label |
|------|-----------|------------------|-------|
| 1 | `/dashboard` | `/my-cases` | Cases / My Cases |
| 2 | `/my-tasks` | `/my-tasks` | My Tasks |
| 3 | `/activity` | `/activity` | Activity *(stub — bolt 013)* |

The tab shell wraps the router outlet. Tab 3 (Activity) does not exist yet; its `IonTabButton` will be rendered but disabled until bolt 013 ships.

### Deliverables

- `client/src/app/pages/tabs/tabs.page.ts` — `IonTabs` + `IonTabBar` shell; persona-aware first-tab routing; badge on My Tasks button
- `client/src/app/pages/tabs/tabs.page.html` — template for the tab layout
- `client/src/app/pages/my-tasks/my-tasks.page.ts` — smart component at `/my-tasks`
- `client/src/app/core/tasks/task.service.ts` — `TaskService.getMyTasks(userId)` (Supabase RPC `get_my_tasks`)
- `client/src/app/core/tasks/task.models.ts` — `MyTask` interface
- `supabase/migrations/YYYYMMDD_get_my_tasks_rpc.sql` — Supabase RPC + supporting view
- Update `client/src/app/core/realtime/realtime.service.ts` — add `subscribeToPrereqChanges(caseIds, cb)` method
- Update `client/src/app/app.routes.ts` — add `/my-tasks` route, wrap HFA + participant routes under the tabs shell
- Unit tests: `task.service.spec.ts`, `my-tasks.page.spec.ts`

### Dependencies

- `supabase` client singleton (`supabase.client.ts`): already exists
- `AuthService.currentUser()` / `AuthService.isHfa()`: already exists
- `RealtimeService`: already exists; needs extension
- `CaseService.getParticipantCases()` / HFA case list: needed to collect `caseIds` for Realtime multi-case subscription
- Ionic tab components: `IonTabs`, `IonTabBar`, `IonTabButton`, `IonBadge`, `IonIcon` — already in `@ionic/angular/standalone`
- `addIcons` for tab icons (`list-outline`, `checkbox-outline`, `pulse-outline`) from `ionicons`

### Technical Approach

**Supabase RPC for the query**
A direct Supabase join from the client on `prerequisites + milestones + cases + case_participants` filtered by `assigned_to` is feasible but brittle. A Supabase RPC `get_my_tasks(p_user_id uuid)` keeps the query server-side and returns typed rows. The RPC filters:
- `prerequisites.assigned_to = p_user_id`
- `prerequisites.status IN ('pending_open', 'received_processing')`
- Joins `milestones` and `cases` for context fields

**Routing restructure: tabs shell**
Current routes (`dashboard`, `my-cases`) are flat. We need a `TabsPage` shell that owns the `IonTabBar` and hosts a child `IonRouterOutlet`. Angular's `loadChildren` with a routes array is the clean pattern here — the tabs shell becomes a parent route whose children are `dashboard`, `my-cases`, `my-tasks`, and later `activity`.

The auth guards stay on the child routes (HFA guard on `dashboard`, participant guard on `my-cases`).

**Realtime multi-case subscription**
`RealtimeService` currently subscribes per case. For My Tasks we need to watch prerequisite changes across all the user's cases at once. The simplest extension: add `subscribeToPrereqChanges(caseIds: string[], callback: () => void)` that creates one channel per case ID listening only to `prerequisites` table changes — deduplicates against existing channels using the existing `channels` Map.

**Badge count**
`MyTasksPage` holds `tasks = signal<MyTask[]>([])` and `taskCount = computed(() => tasks().length)`. It passes `taskCount` up to `TabsPage` via a shared service (`TaskBadgeService` — a lightweight `WritableSignal<number>` singleton) so the `IonBadge` in `TabsPage` stays reactive without coupling the pages directly.

**Tab 3 stub**
Render the Activity `IonTabButton` with `disabled` attribute. This keeps the visual chrome complete without an unimplemented route.

### Acceptance Criteria

- [ ] "My Tasks" tab is visible in the bottom nav for all authenticated users (HFA and participant)
- [ ] `TaskService.getMyTasks(userId)` calls the Supabase `get_my_tasks` RPC and returns `MyTask[]`
- [ ] Task list shows: prerequisite title, case title, milestone name, status badge per row
- [ ] Tapping a task row navigates to `/cases/{caseId}`
- [ ] Empty state ("You have no outstanding tasks") shown when task list is empty
- [ ] `IonBadge` on the My Tasks tab button shows `taskCount()`; hides when count is 0
- [ ] Badge count updates live without refresh when prerequisite status changes via Realtime
- [ ] `IonSkeletonText` loading state shown during initial query
- [ ] Navigation to tab 1 (Cases/My Cases) works for HFA and participant respectively
- [ ] Tab 3 (Activity) renders as disabled/grayed until bolt 013 ships
- [ ] `ng lint` passes; `ng test` passes
