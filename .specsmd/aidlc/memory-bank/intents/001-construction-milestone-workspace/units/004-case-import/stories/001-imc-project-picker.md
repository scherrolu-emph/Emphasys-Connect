---
id: 001-imc-project-picker
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-imc-project-picker

## User Story
**As an** HFA staff member
**I want** to see a list of available IMC projects to import
**So that** I can select the correct project and begin setting it up as a case in Emphasys Connect

## Acceptance Criteria
- [ ] **Given** the HFA dashboard is loaded, **When** it renders, **Then** an "Import from IMC" button is visible (e.g., in the toolbar or as a FAB)
- [ ] **Given** the "Import from IMC" button is tapped, **When** the navigation occurs, **Then** the IMC project picker screen opens and `ImportService.getImcProjects()` is called
- [ ] **Given** the stub data loads, **When** the picker renders, **Then** at least one project row is shown; each row displays: project name, address, and developer contact email
- [ ] **Given** a project row is tapped, **When** the tap event fires, **Then** the app navigates to the confirm screen, passing the selected `ImcProject` as router state
- [ ] **Given** the stub data is loading, **When** the request is in flight, **Then** a loading skeleton is shown for the project rows

## Technical Notes
- `ImportService.getImcProjects(): Promise<ImcProject[]>` returns stub fixture data; source is either a static JSON asset (`assets/imc-stub.json`) or a query against an `imc_projects_stub` table seeded in `supabase/seed.sql`
- `ImcProject` interface: `{ id: string; name: string; address: string; developerEmail: string; milestones: ImcMilestone[] }`
- `isLoading = signal(true)` controls skeleton visibility; `projects = signal<ImcProject[]>([])`
- Use `IonList` + `IonItem` with `detail` chevron; `IonSkeletonText` for loading state
- Navigation to confirm screen: `Router.navigate(['/import/confirm'], { state: { project } })`

## Dependencies
### Requires
- 003-post-login-routing (unit 002)
- 001-case-list-screen (unit 003)

### Enables
- 002-confirm-screen

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Stub data returns empty array | Empty state shown: "No projects available to import" |
| Stub data fetch throws an error | Error message shown with retry button |
| User navigates back from confirm screen | Picker re-displays with previously loaded list (no re-fetch) |
| Same project is available to import twice (duplicate in stub) | Both rows shown; import action handles deduplication in story 003 |

## Out of Scope
- Real IMC API integration (stub data only for hackathon)
- Searching or filtering the IMC project list
- Importing from non-IMC sources
