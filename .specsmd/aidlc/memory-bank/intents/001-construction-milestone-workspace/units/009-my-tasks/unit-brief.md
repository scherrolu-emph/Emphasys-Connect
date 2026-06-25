---
unit: 009-my-tasks
intent: 001-construction-milestone-workspace
phase: inception
status: complete
created: '2026-06-24T00:00:00Z'
updated: '2026-06-24T00:00:00Z'
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: My Tasks

## Purpose

A dedicated bottom-navigation tab that shows every prerequisite requiring action from the currently logged-in user, drawn across all of their cases. The goal is to give participants (HFA staff or Developer) a single inbox view so they never miss a required action on any case. Each task row shows the prerequisite title, the case it belongs to, and the milestone it lives under.

## Scope

### In Scope
- "My Tasks" tab in the bottom navigation bar (visible to all authenticated users)
- Cross-case query: prerequisites where `assigned_to = currentUser.id` AND status requires user action
  - For participants (non-HFA): prerequisites in `pending_open` status with an upload link or a "Mark as ready" requirement
  - For HFA: prerequisites in `received_processing` status awaiting Approve/Return
- Each task row displays: prerequisite title, case title, milestone name, status badge
- Tapping a task row navigates to the relevant case detail (deep link to `/cases/{caseId}`)
- Empty state: "You have no outstanding tasks" with a checkmark illustration
- Badge count on the "My Tasks" tab icon showing total open task count (updates via Realtime)

### Out of Scope
- Filtering or sorting tasks (all tasks shown in default order: oldest first)
- Marking tasks complete from the My Tasks tab (action happens inside the case detail)
- Tasks assigned to other users

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-12 | My Tasks — cross-case prerequisite inbox for logged-in user | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| My Task | A prerequisite row where the logged-in user has a pending action |
| Task Context | The case title + milestone name attached to each prerequisite for orientation |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `TaskService.getMyTasks(userId)` | Queries prerequisites joined with milestones + cases where action is required for this user |
| `RealtimeService` | Subscribes to prerequisite status changes across all user's cases; updates badge count and task list |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 1 |
| Must Have | 1 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | My Tasks screen — cross-case prerequisite list with case and milestone context | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | `prerequisites`, `milestones`, `cases` schema; typed client |
| 002-auth-screens | Authenticated user session required for `currentUser.id` |
| 006-milestone-prereq-flow | Prerequisite status model; status values that require user action |

### Depended By
None — My Tasks is a read + deep-link unit; it does not own any mutations.

---

## Technical Context

### Suggested Technology
- `TaskService.getMyTasks(userId)` — Supabase join query: `prerequisites` + `milestones` + `cases` + `case_participants` filtered by `userId`
- Supabase Realtime: extend `RealtimeService` to subscribe to prerequisite changes across all user's cases (or use a user-level channel)
- Tab badge: `taskCount = computed(() => tasks().length)` drives an `IonBadge` on the tab button
- Bottom nav: add "My Tasks" as fourth tab in `IonTabBar`; use an inbox/checklist icon

---

## Constraints

- Query must be efficient: use a Supabase view or RPC if join is complex
- Badge count must update live (Realtime) — do not poll
- Tab is visible to all authenticated users (HFA and participants)

---

## Success Criteria

### Functional
- [ ] "My Tasks" tab is visible in the bottom nav for all authenticated users
- [ ] Tab shows a badge count of open tasks (live-updated via Realtime)
- [ ] Task list shows all prerequisites requiring action from the logged-in user across all cases
- [ ] Each task row shows prerequisite title, case title, milestone name, status badge
- [ ] Tapping a task navigates to the correct case detail
- [ ] Empty state shown when no tasks outstanding

### Non-Functional
- [ ] Initial task list loads in < 1 second

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-012 | S1 | My Tasks tab + cross-case task list + badge count + Realtime updates |
