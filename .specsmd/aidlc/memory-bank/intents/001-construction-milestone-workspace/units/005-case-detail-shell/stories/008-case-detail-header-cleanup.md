---
id: 008-case-detail-header-cleanup
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: should
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 008-case-detail-header-cleanup

## User Story

**As a** user viewing a case detail
**I want** the case header to show only the case name
**So that** the top of the screen is clean and uncluttered, with case type and active milestone visible in context rather than repeated in the header

## Acceptance Criteria

- [ ] **Given** the case detail view, **When** it renders, **Then** the page header/toolbar shows only the case name — the Case Type badge and Active Milestone name are removed from the header area
- [ ] **Given** the case detail HFA Actions panel, **When** it renders, **Then** the active milestone is still clearly visible within the panel itself (not removed from the page — only from the header)
- [ ] **Given** mobile layout, **When** the header is simplified, **Then** the case name is not truncated on small screens (truncate with ellipsis if needed)

## Technical Notes

- Remove the Case Type chip/badge and the Active Milestone subtitle from the `<ion-header>` / `<ion-toolbar>` of the case detail component
- The active milestone information remains in the HFA Actions panel — this is a header-only change
- Verify the case name still renders in the header; do not remove it

## Dependencies

### Requires
- `001-two-panel-layout`
- `002-hfa-panel-slots`

### Enables
- None (cosmetic)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Case name is very long | Truncated with ellipsis in the header |
| No active milestone | Header unaffected — milestone was only shown in header, not as a fallback |

## Out of Scope

- Removing case type or milestone from the Actions panel itself
- Redesigning the header layout beyond removing these two elements
