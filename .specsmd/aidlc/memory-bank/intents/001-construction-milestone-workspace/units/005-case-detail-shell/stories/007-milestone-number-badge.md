---
id: 007-milestone-number-badge
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: should
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 007-milestone-number-badge

## User Story

**As an** HFA staff member or Developer
**I want** each milestone row to display its sequence number
**So that** I can quickly reference milestones by number in conversations and understand overall case structure at a glance

## Acceptance Criteria

- [ ] **Given** the milestone list in the case detail view, **When** it renders, **Then** each milestone row shows a number badge indicating its position in the sequence (e.g. "1", "2", "3")
- [ ] **Given** the number badge, **When** displayed, **Then** it appears visually distinct (e.g. a small circle badge) to the left of or alongside the milestone name
- [ ] **Given** milestones in various states (open, active, completed), **When** displayed, **Then** the number badge is visible regardless of milestone state

## Technical Notes

- Milestone sequence is determined by the `order` or `position` column on the `milestones` table (or insertion order if no explicit ordering column exists)
- Add a small circular badge element in the milestone row template — plain integer, no padding text
- No data model changes required — sequence number derives from the milestone list's sort order

## Dependencies

### Requires
- `002-hfa-panel-slots`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Case has only 1 milestone | Badge shows "1" |
| Milestones have no explicit order column | Use array index + 1 from the sorted query result |

## Out of Scope

- Reordering milestones via drag-and-drop
- Configurable badge style per HFA tenant
