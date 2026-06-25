---
id: 002-activity-grouped-by-case
unit: 010-activity-feed
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-activity-grouped-by-case

## User Story

**As an** HFA staff member or Developer
**I want** the activity feed to group events by case
**So that** I can quickly scan what has happened on each project without events from different cases interleaving

## Acceptance Criteria

- [ ] **Given** the activity feed screen, **When** it renders with events from multiple cases, **Then** events are grouped under a case header (case name) rather than shown in a flat chronological list
- [ ] **Given** each case group, **When** rendered, **Then** events within the group are ordered newest-first
- [ ] **Given** the case groups themselves, **When** displayed, **Then** groups are ordered by the timestamp of their most recent event (most recently active case first)
- [ ] **Given** a new Realtime event arrives for a case, **When** prepended, **Then** the group for that case moves to the top (if it isn't already) and the new event appears at the top of that group
- [ ] **Given** the activity feed with only one case, **When** rendered, **Then** the single case group header is still shown for visual consistency

## Technical Notes

- Group events client-side after fetching: `Map<caseId, ActivityEvent[]>` sorted by max event timestamp per group
- Alternatively, sort by `case_id, created_at DESC` in the query and segment in the template using `@for` with a group-break condition
- Case header should show: case name + a subtle timestamp ("last activity X minutes ago")
- Realtime prepend logic: on new event, find or create the case group, prepend to its events array, then re-sort the groups array by latest event timestamp

## Dependencies

### Requires
- `001-activity-feed-screen`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All events from one case | Single group shown; no layout change |
| Event arrives for a case not yet in the feed | New group created and inserted in correct sort position |
| Case has only 1 event | Group shows with 1 item; no visual issues |

## Out of Scope

- Collapsing/expanding case groups
- Filtering activity feed by case
