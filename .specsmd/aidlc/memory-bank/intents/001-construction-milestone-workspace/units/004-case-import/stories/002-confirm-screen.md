---
id: 002-imc-project-search
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-imc-project-search

## User Story
**As an** HFA staff member
**I want** to search for an IMC project by project number or name
**So that** I can quickly find and link the correct funded project without scrolling through a full list

## Acceptance Criteria
- [ ] **Given** the IMC project search screen opens (Development Construction only), **When** it renders, **Then** a single text input is shown with placeholder "Enter project # or name"
- [ ] **Given** the user types at least 2 characters, **When** the input value changes, **Then** `ImportService.searchImcProjects(query)` is called and matching results are displayed below the input as a list (project name + project number + address)
- [ ] **Given** matching results are shown, **When** the user taps a result, **Then** the app navigates to the confirm screen (`/create-case/confirm`) passing the selected `ImcProject` and `caseType` as route state
- [ ] **Given** the query returns no results, **When** the list renders, **Then** an empty state message is shown: "No projects found — check the project number or name"
- [ ] **Given** the search is in flight, **When** a request is pending, **Then** a loading indicator is shown below the input; results replace it on completion
- [ ] **Given** the route state carries `caseType`, **When** the screen renders, **Then** the screen header displays the selected case type (e.g. "New Development Construction Case")

## Technical Notes
- Route: `/create-case/search` — only reachable when `caseType === 'development_construction'`; all other case types skip this screen
- `ImportService.searchImcProjects(query: string): Promise<ImcProject[]>` — filters stub data by `project.name.includes(query)` or `project.projectNumber.includes(query)` (case-insensitive)
- `ImcProject` interface: `{ id: string; projectNumber: string; name: string; address: string; developerEmail: string; milestones: ImcMilestone[] }`
- Debounce input by 300 ms before triggering search
- Use a `searchQuery = signal('')` and `results = signal<ImcProject[]>([])`
- Route state validated on init: if `caseType !== 'development_construction'`, navigate back to `/create-case/type`

## Dependencies
### Requires
- `001-case-type-selection`
### Enables
- `003-confirm-and-participants`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User clears the search field | Results list clears; no empty state shown (field is just blank) |
| Stub data fetch throws | Error message shown with retry option |
| User navigates back from confirm screen | Search screen re-displays with previous query and results (no re-fetch) |
| Multiple projects share the same name | All are listed; user selects the one matching their project number |

## Out of Scope
- Real IMC API integration (stub search only for hackathon)
- Advanced filtering (by status, HFA, date range)
- This screen is skipped entirely for "Start blank" case type
