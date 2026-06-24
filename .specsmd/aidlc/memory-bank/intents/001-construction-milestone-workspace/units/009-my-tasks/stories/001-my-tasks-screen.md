---
id: 001-my-tasks-screen
unit: 009-my-tasks
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-my-tasks-screen

## User Story
**As any** authenticated user (HFA or participant)
**I want** to see all prerequisites that require my action across all my cases in one place
**So that** I can stay on top of outstanding work without opening each case individually

## Acceptance Criteria
- [ ] **Given** the app is loaded, **When** any authenticated user views the bottom navigation, **Then** a "My Tasks" tab is visible as the second tab (HFA: Cases | **My Tasks** | Activity; Participant: My Cases | **My Tasks** | Activity)
- [ ] **Given** the user taps "My Tasks", **When** the screen renders, **Then** `TaskService.getMyTasks(currentUserId)` is called and results are displayed as a list
- [ ] **Given** the task list renders, **When** tasks exist, **Then** each row shows:
  - Prerequisite title (primary text)
  - Case title (secondary text, e.g. "Riverside Commons")
  - Milestone name (tertiary text, e.g. "Foundation Inspection")
  - Status badge (Pending / Received—Under Review)
- [ ] **Given** a task row is tapped, **When** the tap fires, **Then** the app navigates to `/cases/{caseId}` (the relevant case detail)
- [ ] **Given** no tasks are outstanding for the logged-in user, **When** the screen renders, **Then** an empty state is shown: "You have no outstanding tasks" with a supporting illustration or icon
- [ ] **Given** the "My Tasks" tab is shown in the nav bar, **When** the user has at least one outstanding task, **Then** a numeric badge on the tab icon shows the count of open tasks
- [ ] **Given** a prerequisite status changes (via Realtime), **When** it affects the logged-in user's task list, **Then** the task list and badge count update live without a page refresh
- [ ] **Given** the screen is loading, **When** the query is in flight, **Then** skeleton rows are shown while data loads

## Technical Notes
- Route: `/my-tasks`; second tab in `IonTabBar` (between Cases/My Cases and Activity)
- `TaskService.getMyTasks(userId: string): Observable<MyTask[]>` — Supabase join:
  ```
  prerequisites
    JOIN milestones ON milestones.id = prerequisites.milestone_id
    JOIN cases ON cases.id = milestones.case_id
    JOIN case_participants ON case_participants.case_id = cases.id
      AND case_participants.user_id = userId
  WHERE prerequisites.status IN ('pending_open', 'received_processing')
    AND prerequisites.assigned_to = userId
  ```
  (Exact filter logic for "action required" per role: HFA sees `received_processing`; participants see `pending_open` with upload link or `acceptance_comment` prereqs)
- `MyTask` interface: `{ prereqId, prereqTitle, prereqType, status, caseId, caseTitle, milestoneId, milestoneName }`
- `tasks = signal<MyTask[]>([])`; `taskCount = computed(() => tasks().length)`
- `IonBadge` on the tab button driven by `taskCount()`
- Realtime: subscribe to `postgres_changes` on `prerequisites` filtered by `case_ids` for the user's cases; on change, re-run `getMyTasks`
- `IonSkeletonText` for loading state; `@for (task of tasks(); track task.prereqId)` loop

## Dependencies
### Requires
- `006/001-hfa-actions-panel` (prerequisite status model)
- `002/003-post-login-routing` (nav shell must include the "My Tasks" tab)
### Enables
- None — navigates to existing case detail screen

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User is on My Tasks and a new task arrives via Realtime | New row appears at the correct position; badge count increments |
| User taps a task for a case they no longer have access to | Navigation to case detail; RLS will block data load; case detail shows "Not found" empty state |
| User has tasks across 20+ cases | Full list shown; no artificial cap; virtual scrolling may be added post-hackathon |
| Prerequisite transitions out of "action required" (e.g. accepted) | Row removed from My Tasks list; badge count decrements |

## Out of Scope
- Filtering by case or milestone
- Bulk actions (approve multiple from My Tasks)
- Push notifications (post-hackathon)
