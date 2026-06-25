---
id: '012'
unit: 009-my-tasks
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
started: '2026-06-25T00:00:00Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-06-25T00:00:00Z'
    artifact: implementation-plan.md
  - name: implement
    completed: '2026-06-25T00:00:00Z'
    artifact: implementation-walkthrough.md
  - name: test
    completed: '2026-06-25T16:11:01Z'
    artifact: test-walkthrough.md
stories:
  - 001-my-tasks-screen
created: '2026-06-24T00:00:00Z'
requires_bolts:
  - '007'
  - '008'
enables_bolts: []
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Cross-case join query, Realtime subscription across multiple case channels, badge count on tab icon
completed: '2026-06-25T16:11:01Z'
---

# Bolt 012 — My Tasks: Cross-Case Prerequisite Inbox

## Objective

Add a "My Tasks" bottom navigation tab showing all prerequisites that require action from the logged-in user, drawn across all their cases. Each task row links back to the relevant case detail. Badge count on the tab updates live via Realtime.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-my-tasks-screen | My Tasks tab, cross-case list, badge count, Realtime updates | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Route: `/my-tasks`; second tab in `IonTabBar` (HFA: Cases → My Tasks → Activity; Participant: My Cases → My Tasks → Activity)
- `TaskService.getMyTasks(userId)`: Supabase join — `prerequisites` + `milestones` + `cases` + `case_participants` — filtered to prerequisites where `assigned_to = userId` AND `status IN ('pending_open', 'received_processing')`
- Consider a Supabase view or RPC `get_my_tasks(user_id)` to keep the client query simple
- Realtime: subscribe to prerequisite changes across the user's case IDs in `RealtimeService`; on any change re-run `getMyTasks`
- `taskCount = computed(() => tasks().length)` drives `IonBadge` on tab button

### Stage 2: Implement
- Add `MyTasksComponent` at route `/my-tasks`
- `TaskService.getMyTasks(userId: string): Promise<MyTask[]>` — join query or RPC
- `MyTask` interface: `{ prereqId, prereqTitle, prereqType, status, caseId, caseTitle, milestoneId, milestoneName }`
- `tasks = signal<MyTask[]>([])`; `taskCount = computed(() => tasks().length)`
- `@for (task of tasks(); track task.prereqId)` loop; `IonItem` with `routerLink="/cases/{task.caseId}"`
- Each `IonItem`: primary label = prereq title; supporting line = case title + " › " + milestone name; end slot = status badge
- Loading state: `IonSkeletonText` rows while query in flight
- Empty state: centered icon + "You have no outstanding tasks" text
- `IonBadge` on the "My Tasks" `IonTabButton` bound to `taskCount()`
- Extend `RealtimeService` to accept an array of case IDs and subscribe to all at once for the tasks view; unsubscribe in `ngOnDestroy`

### Stage 3: Test
- Log in as Developer (participant) → "My Tasks" tab shows prerequisites in `pending_open` state across all their cases
- Log in as HFA → "My Tasks" tab shows prerequisites in `received_processing` state
- HFA approves a prerequisite from case detail → returns to My Tasks tab → approved item is gone; badge count decrements
- Empty state: user with no pending tasks sees empty state message
- Realtime: have second browser approve a prereq → My Tasks tab in first browser updates live
- Badge count: navigate away from My Tasks → badge still shows correct count
