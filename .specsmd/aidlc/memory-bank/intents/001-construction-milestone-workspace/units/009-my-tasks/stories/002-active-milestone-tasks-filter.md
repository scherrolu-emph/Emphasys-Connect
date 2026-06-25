---
id: 002-active-milestone-tasks-filter
unit: 009-my-tasks
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-active-milestone-tasks-filter

## User Story

**As a** Developer
**I want** My Tasks to show only prerequisites from active milestones
**So that** my task list contains only work I can actually act on right now

## Acceptance Criteria

- [ ] **Given** the My Tasks screen, **When** it loads, **Then** only prerequisites belonging to milestones with `status === 'active'` are shown
- [ ] **Given** a prerequisite whose milestone status is `open` or `completed`, **When** My Tasks renders, **Then** that prerequisite is excluded from the list
- [ ] **Given** a milestone transitions from `open` to `active` (via Realtime), **When** the update arrives, **Then** its prerequisites appear in My Tasks without a page refresh
- [ ] **Given** My Tasks with the filter applied, **When** no active-milestone prerequisites exist for the user, **Then** a meaningful empty state is shown: "No active tasks — check back when your next milestone opens"

## Technical Notes

- Add a join/filter condition to the My Tasks query: `milestones.status = 'active'`
- Update the Supabase query in `MyTasksService` (or equivalent): add `.eq('milestones.status', 'active')` to the prerequisites query via foreign-key join
- The badge count on the bottom nav tab must also reflect the filtered count (active-milestone tasks only)
- Realtime: the existing milestone status subscription in `RealtimeService` should trigger a My Tasks refresh when a milestone becomes active

## Dependencies

### Requires
- `001-my-tasks-screen`
- `006-milestone-prereq-flow/005-milestone-auto-advance`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User has prerequisites across multiple cases, some active some not | Only active-milestone prereqs shown; cross-case filter applies correctly |
| All milestones completed | Empty state shown |

## Out of Scope

- Filtering by prerequisite status within active milestones (show all statuses)
- Adding a toggle to show non-active tasks
