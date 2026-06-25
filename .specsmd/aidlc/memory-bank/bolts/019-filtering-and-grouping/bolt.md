---
id: "019"
unit: 009-my-tasks
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 002-active-milestone-tasks-filter
  - 002-activity-grouped-by-case
created: 2026-06-25T12:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: ["015"]
enables_bolts: []
requires_units: []
blocks: false

complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt 019 — Filtering and Grouping

## Objective

Two cross-unit improvements to the bottom-nav views: filter My Tasks to active-milestone prerequisites only, and group the Activity Feed by case.

> **Note**: Story `002-active-milestone-tasks-filter` is in unit `009-my-tasks`; story `002-activity-grouped-by-case` is in unit `010-activity-feed`. Both are included for efficiency given their similar scope and no interdependencies.

## Stories in Scope

| Story | Unit | Title | Priority |
|-------|------|-------|----------|
| 002-active-milestone-tasks-filter | 009-my-tasks | Filter My Tasks to active milestones only | Must |
| 002-activity-grouped-by-case | 010-activity-feed | Group activity feed entries by case | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Review current My Tasks query in `MyTasksService`; plan the `milestones.status = 'active'` join filter
- Confirm badge count signal path — ensure it uses the same filtered query
- Review current Activity Feed data shape; design `Map<caseId, ActivityEvent[]>` grouping and sort logic
- Plan Realtime re-sort: when a new event arrives, move its case group to the top

### Stage 2: Implement
- **My Tasks**: Update prerequisites query to join `milestones` and filter `milestones.status = 'active'`; update nav badge count signal to use filtered result; update empty state copy to "No active tasks — check back when your next milestone opens"
- **Activity Feed**: Post-fetch, group events by `case_id` into an ordered array of `{ caseId, caseName, latestEvent, events[] }`; sort groups descending by `latestEvent.created_at`; update template with `@for` over groups, rendering a case header + nested event list; on Realtime prepend, re-sort groups by latest event

### Stage 3: Test
- My Tasks: prerequisites from non-active milestones are absent; active-milestone prereqs present; badge count matches filtered list; Realtime milestone activation adds new tasks without refresh
- Activity Feed: events grouped under case headers; most recently active case at top; new Realtime event moves its case group to top position
