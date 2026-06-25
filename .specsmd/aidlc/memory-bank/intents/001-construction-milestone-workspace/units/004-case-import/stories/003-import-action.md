---
id: 003-confirm-and-participants
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-confirm-and-participants

## User Story
**As an** HFA staff member
**I want** to review the case structure and invite participants before creating the case
**So that** the right people are notified and attached to the case from the moment it is created

## Acceptance Criteria
- [ ] **Given** the confirm screen opens with an IMC project, **When** it renders, **Then** the project name, address, and case type are displayed at the top; each milestone is listed with a count of prerequisites (e.g. "3 prerequisites"); tapping a milestone row expands to show prerequisite names
- [ ] **Given** the confirm screen opens for a "Start blank" case, **When** it renders, **Then** a case title text field is shown (required); no milestone structure is displayed (it will be set up later)
- [ ] **Given** the confirm screen opens for "Loan Underwriting" or "Bond Issuance", **When** it renders, **Then** the screen behaves identically to "Start blank" (title field required, no milestone structure); a placeholder note is displayed: "Milestone data will be imported from [case type system] in a future release"
- [ ] **Given** an IMC-backed case, **When** the screen renders, **Then** the Developer contact from the IMC project is pre-populated in the Participants section with role "Developer" and cannot be removed
- [ ] **Given** the Participants section, **When** rendered, **Then** the creating HFA user is shown as a pre-populated participant with role "HFA Staff" (read-only, cannot be removed)
- [ ] **Given** the Participants section, **When** the HFA clicks "Add participant", **Then** an inline form appears with: email address field + role selector (Developer, HFA Staff); entering a valid email and role and clicking "Add" appends the participant to the list
- [ ] **Given** the participant list, **When** a manually-added participant is shown, **Then** a remove icon allows the HFA to remove that participant before creation
- [ ] **Given** the user is ready to proceed, **When** the "Create case" CTA is tapped, **Then** navigation to the create action (story 004) begins; no Supabase writes occur on this screen
- [ ] **Given** the user wants to go back, **When** "Cancel" or back navigation is used, **Then** the app returns to the previous screen without any state changes

## Technical Notes
- Route: `/create-case/confirm`
- Route state carries: `{ imcProject?: ImcProject; caseType: CaseType; caseTitle?: string }` — `caseTitle` required for blank type
- `participants = signal<ParticipantDraft[]>([])` pre-populated from IMC data or empty (HFA user always included)
- `ParticipantDraft`: `{ email: string; role: 'developer' | 'hfa_staff'; source: 'imc' | 'manual' }`
- Milestone accordion: `IonAccordionGroup` + `IonAccordion`; read-only
- "Add participant" inline form: `(click)` toggle; validate email format client-side before appending
- "Create case" CTA: navigates to `/create-case/create` passing full `CreateCasePayload` as route state
- Participants section labeled "Participants" (not "Stakeholders")

## Dependencies
### Requires
- `002-imc-project-search` (for IMC-backed types)
- `001-case-type-selection` (for blank type, navigates here directly after title entry)
### Enables
- `004-create-case-action`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Blank case: user leaves title empty and taps "Create case" | Blocked — CTA disabled until title is non-empty |
| IMC project has zero milestones | Empty milestone section shown with note "No milestones defined in IMC — add them after creation"; creation still allowed |
| HFA adds duplicate email | Second entry ignored; toast "Participant already added" shown |
| Router state is missing (direct URL navigation) | Redirect to `/create-case/type` |

## Out of Scope
- Sending participant invitations at this step (handled by story 004 via Edge Function)
- Editing milestone/prerequisite names (IMC is source of truth)
- Setting participant-level permissions beyond role
