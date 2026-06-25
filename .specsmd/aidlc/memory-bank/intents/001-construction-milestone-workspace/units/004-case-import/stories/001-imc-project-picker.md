---
id: 001-case-type-selection
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: 2026-06-24T00:00:00Z
updated: 2026-06-25T00:00:00Z
assigned_bolt: "005"
implemented: true
---

# Story: 001-case-type-selection

## User Story
**As an** HFA staff member
**I want** to choose a starting point when creating a new case
**So that** I can create either a blank case or a pre-structured case linked to an IMC project

## Acceptance Criteria
- [ ] **Given** the HFA dashboard is loaded, **When** it renders, **Then** a "Create a case" button is visible (toolbar or FAB)
- [ ] **Given** the "Create a case" button is tapped, **When** the navigation occurs, **Then** a "Choose a starting point" screen opens listing four case type options:
  - **Start blank** (first option)
  - **Development Construction**
  - **Loan Underwriting**
  - **Bond Issuance**
- [ ] **Given** the user selects "Start blank", **When** the tap event fires, **Then** the app navigates to the confirm screen (`/create-case/confirm`) carrying `caseType: 'blank'` as route state
- [ ] **Given** the user selects "Development Construction", **When** the tap event fires, **Then** the app navigates to the IMC project search screen (`/create-case/search`) carrying `caseType: 'development_construction'` as route state
- [ ] **Given** the user selects "Loan Underwriting" or "Bond Issuance", **When** the tap event fires, **Then** the app navigates to the confirm screen (`/create-case/confirm`) carrying the selected `caseType` as route state (placeholder flow — no back-office integration for hackathon)
- [ ] **Given** the "Choose a starting point" screen, **When** rendered, **Then** each option shows a label and a short description:
  - Start blank: "No back-office project — set up milestones manually"
  - Development Construction: "Link to an IMC construction project"
  - Loan Underwriting: "Loan underwriting case — back-office integration coming soon"
  - Bond Issuance: "Bond issuance case — back-office integration coming soon"

## Technical Notes
- Route: `/create-case/type`
- `caseType` enum: `'blank' | 'development_construction' | 'loan_underwriting' | 'bond_issuance'` — must be stored as a `case_type` column on the `cases` table (note for Unit 001 schema update)
- Navigation state carries `{ caseType }` forward through the create-case sub-flow
- Use `IonList` + `IonItem` with `detail` chevron for the option list
- No back-stack issue: "Choose a starting point" is entry point for the sub-flow

## Dependencies
### Requires
- `003/003-post-login-routing` (unit 002)
- `003/001-case-list-screen` (unit 003)
### Enables
- `002-imc-project-search` (for IMC-backed types)
- `003-confirm-and-participants` (for blank type, directly)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User navigates to this screen directly via URL without auth | Auth guard redirects to login |
| User presses back from the type selection screen | Returns to HFA dashboard |

## Out of Scope
- Case type descriptions managed at runtime (static text for hackathon)
- Hiding unavailable case types (all 4 always shown)
