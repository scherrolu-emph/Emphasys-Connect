---
id: 002-hfa-panel-slots
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-hfa-panel-slots

## User Story
**As a** HFA staff
**I want** to see the correct panel containers when viewing a case as HFA staff
**So that** I can immediately orient to the Actions and Conversation areas specific to my role

## Acceptance Criteria
- [ ] **Given** an authenticated user with `is_hfa: true`, **When** the case detail screen loads, **Then** the left panel is labelled "Actions" with a placeholder until Unit 006 is built
- [ ] **Given** an authenticated user with `is_hfa: true`, **When** the case detail screen loads, **Then** the right panel shows "Conversation" placeholder until Unit 007 is built
- [ ] **Given** the case detail screen, **When** rendered for an HFA user, **Then** the case header shows project title, type badge, and active milestone name
- [ ] **Given** the case detail screen, **When** rendered for an HFA user, **Then** a participant strip with horizontal scroll shows each participant's display name and contact role

## Technical Notes
- `@if (isHfa())` structural rendering to show HFA-specific panel labels
- `CaseDetailStore` provides case metadata signals
- Placeholder `<div>` with "Actions panel loading…" text until Unit 006 component is injected
- Participant strip is a horizontally scrolling flex row; no Ionic list component

## Dependencies
### Requires
- `001-two-panel-layout`
### Enables
- Unit 006 stories

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Case has no active milestone | Header shows "No active milestone" |
| Case has no participants yet | Participant strip shows empty state text |

## Out of Scope
- Actual Actions panel content (Unit 006)
- Conversation panel content (Unit 007)
