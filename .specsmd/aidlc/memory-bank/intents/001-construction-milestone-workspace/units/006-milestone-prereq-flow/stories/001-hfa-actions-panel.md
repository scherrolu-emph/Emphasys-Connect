---
id: 001-hfa-actions-panel
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-hfa-actions-panel

## User Story
**As a** HFA staff
**I want** to see the active milestone and its prerequisites with correct status badges in the Actions panel
**So that** I can immediately assess what is outstanding for the active milestone without navigating elsewhere

## Acceptance Criteria
- [ ] **Given** the Actions panel is rendered for an HFA user, **When** the case has an active milestone, **Then** the active milestone title is displayed at the top of the panel
- [ ] **Given** the active milestone, **When** prerequisites are listed, **Then** each prerequisite shows a status badge — Pending, Received—Under Review, or Accepted — with color-coded styling per ux-guide standards
- [ ] **Given** a prerequisite of type `document_submission`, **When** it is rendered, **Then** a paperclip/document icon is shown alongside the title
- [ ] **Given** a prerequisite of type `acceptance_comment`, **When** it is rendered, **Then** a checkmark icon is shown alongside the title
- [ ] **Given** the case has no active milestone (all complete), **When** the Actions panel renders, **Then** an "All milestones complete" empty state is shown

## Technical Notes
- Reads from `CaseDetailStore.milestones` and `CaseDetailStore.prerequisites` signals
- Status badge is a small standalone component; color mapping: Pending=gray, Received—Under Review=amber, Accepted=green
- `@for (prereq of prerequisites(); track prereq.id)` loop
- No action buttons in this story — mutations handled in stories 002 and 003

## Dependencies
### Requires
- `005/004-data-loading-and-realtime`
### Enables
- `002-accept-and-return-actions`
- `003-trigger-document-request`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Active milestone has no prerequisites | Milestone title shown with "No prerequisites defined" message |
| Prerequisite has an unknown status value | Renders with a neutral gray badge and no icon |

## Out of Scope
- Accept/Return action buttons (story 002)
- Request Document button (story 003)
- Developer-facing status panel (story 004)
