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
- [ ] **Given** the active milestone, **When** prerequisites are listed, **Then** each prerequisite row is **collapsed by default** — showing only the prerequisite title and status badge; no action buttons visible in the collapsed state
- [ ] **Given** a collapsed prerequisite row, **When** the user taps it, **Then** the row **expands** to reveal the prerequisite details and any action buttons (defined in stories 002 and 003); tapping again collapses it
- [ ] **Given** the expanded state, **When** a prerequisite shows a status badge, **Then** the badge reads — Pending, Received—Under Review, or Accepted — with color-coded styling per ux-guide standards
- [ ] **Given** a prerequisite of type `document_submission`, **When** it is expanded, **Then** a document/paperclip icon is shown alongside the title in both collapsed and expanded states
- [ ] **Given** a prerequisite of type `acceptance_comment`, **When** it is expanded, **Then** a checkmark icon is shown alongside the title in both collapsed and expanded states
- [ ] **Given** the case has milestones and all are completed, **When** the Actions panel renders, **Then** an "All milestones complete" empty state is shown
- [ ] **Given** the case has no milestones at all (blank case type with none added yet), **When** the Actions panel renders, **Then** a "No milestones yet" empty state is shown — this is a valid state for blank cases, not an error
- [ ] **Given** any milestone, **When** the Actions panel renders, **Then** no "Awaiting all prerequisites" pill or similar status pill is displayed on the milestone header

## Technical Notes
- Reads from `CaseDetailStore.milestones` and `CaseDetailStore.prerequisites` signals
- Status badge standalone component; color mapping: Pending=gray, Received—Under Review=amber, Accepted=green
- Each prerequisite row uses `expandedPrereqId = signal<string | null>(null)` — only one expanded at a time (accordion pattern); clicking an already-open row closes it
- `@for (prereq of prerequisites(); track prereq.id)` loop; `@if (expandedPrereqId() === prereq.id)` to show expanded content
- No "Awaiting all prerequisites" pill — remove any such status indicator from the milestone header
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
