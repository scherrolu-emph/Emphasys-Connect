---
id: 002-confirm-screen
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-confirm-screen

## User Story
**As an** HFA staff member
**I want** to preview the milestone and prerequisite structure before committing an import
**So that** I can verify I have selected the right project and understand what will be created

## Acceptance Criteria
- [ ] **Given** the confirm screen opens, **When** the component initialises, **Then** the project name, address, and developer contact email are displayed at the top of the screen
- [ ] **Given** the milestone list renders, **When** the data is from the IMC stub, **Then** each milestone is shown with its name and a count of prerequisites (e.g. "3 prerequisites")
- [ ] **Given** a milestone row is expanded (accordion), **When** the user taps it, **Then** the prerequisite names for that milestone are revealed inline
- [ ] **Given** the user is ready to proceed, **When** the "Import" CTA is tapped, **Then** navigation to the import action (story 003) begins; no Supabase writes occur on this screen
- [ ] **Given** the user wants to go back, **When** "Cancel" or the back navigation is used, **Then** the app returns to the IMC project picker without any state changes

## Technical Notes
- `ImcProject` read from `Router.getCurrentNavigation()?.extras?.state?.['project']` on component init; stored in a local signal
- Milestone accordion uses `IonAccordionGroup` + `IonAccordion`; each slot toggle is handled by Ionic natively
- "Import" CTA: `IonButton` with `(click)` navigating to import action route, passing the same `ImcProject` state forward
- This screen is entirely read-only — no service calls, no signals that mutate external state
- Prerequisite count: `milestone.prerequisites.length` from the stub data

## Dependencies
### Requires
- 001-imc-project-picker

### Enables
- 003-import-action

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Router state is missing (user navigates directly to URL) | Component redirects to `/import` picker; no crash |
| Milestone has zero prerequisites | Row shows "0 prerequisites"; accordion still renders but body is empty |
| Project has a very long name or address | Text truncates with CSS `text-overflow: ellipsis`; full text accessible via expand or tooltip |
| User rotates device between picker and confirm | Layout reflows; no data loss |

## Out of Scope
- Editing milestone names or prerequisite names before importing
- Adding custom prerequisites on the confirm screen
- Displaying milestone target days on this screen
