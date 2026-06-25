---
stage: plan
bolt: "005"
created: 2026-06-25T00:00:00Z
---

## Implementation Plan: Create Case (Unit 004)

### Objective

Build the four-screen "Create a case" sub-flow for HFA staff: type selection → IMC project search (Development Construction only) → confirm + participants → atomic case creation. The flow threads route state through screens, stubs IMC data with a static JSON asset, and creates cases atomically via sequential Supabase inserts.

---

### Deliverables

1. **Domain models** — `ImcProject`, `ImcMilestone`, `ImcPrerequisite`, `ParticipantDraft`, `CreateCasePayload` in `client/src/app/models/`
2. **IMC stub data** — `client/src/assets/imc-stub.json` — 3 seeded IMC projects with milestones and prerequisites
3. **`ImportService`** — `client/src/app/core/cases/import.service.ts` — `searchImcProjects(query)` debounced stub search
4. **`CaseService.createCase(payload)`** — add atomic creation method to existing service (sequential inserts: `cases` → `milestones` → `prerequisites` → `case_participants` → `conversation_messages`)
5. **`CaseTypeSelectionPage`** — `client/src/app/pages/create-case/type/` — 4 case type options; routes to search (Development Construction) or confirm (all others)
6. **`ImcProjectSearchPage`** — `client/src/app/pages/create-case/search/` — debounced text search, results list, route to confirm
7. **`CreateCaseConfirmPage`** — `client/src/app/pages/create-case/confirm/` — milestone accordion (IMC types), title field (blank/others), participant list with add/remove inline form
8. **`CreateCaseActionPage`** — `client/src/app/pages/create-case/create/` — full-screen loading overlay, calls `createCase()`, navigates to `/cases/:id` on success
9. **Route registration** — add `create-case/:step` children to `app.routes.ts`; guard redirects back to `/create-case/type` on missing state
10. **Dashboard "Create a case" button** — add `IonButton` to toolbar in `dashboard.page.html`; visible to HFA only

---

### Dependencies

- `CaseType` enum: already defined in `database.types.ts` ✅
- `case_type` DB column: already present in migration 001 ✅
- `case_participants` table: already present with `contact_role` ✅
- `conversation_messages` table: already present ✅
- `AuthService.hfaId()` and `AuthService.userId()`: available for participant pre-population
- `CaseService` (existing): will be extended, not replaced

---

### Technical Approach

**Route state threading** — Angular `Router.navigate([...], { state: payload })` carries `{ caseType, imcProject?, caseTitle? }` forward. Each screen reads `router.getCurrentNavigation()?.extras.state` on init; if state is missing, redirects to `/create-case/type`. The final confirm → create navigation also passes the full `CreateCasePayload` as state.

**IMC stub** — Static JSON asset at `assets/imc-stub.json`. `ImportService` fetches it once (lazy), caches in memory, filters by `project.name` or `project.projectNumber` (case-insensitive `includes`). No network call per search.

**Debounce** — `ImcProjectSearchPage` uses `fromEvent` + `debounceTime(300)` RxJS chain on the input; results written to `results = signal<ImcProject[]>([])`.

**Atomic create** — Sequential inserts in `CaseService.createCase()`:
1. Insert `cases` row → get `caseId`
2. Insert all `milestones` rows (first: `active`, rest: `open`)
3. Insert all `prerequisites` rows (`pending_open`)
4. Insert `case_participants` rows (resolve profiles by email; create placeholder if not found)
5. Insert `conversation_messages` system message ("Case imported from IMC: {title}" or "Case created: {title}")
On any step failure: attempt compensating delete of the `cases` row; throw error.

**No Edge Function** — Sequential inserts are sufficient for the hackathon; atomicity is best-effort with compensating delete. The Edge Function path is documented as the production upgrade in story 004 technical notes.

**Dashboard button** — `IonButton` in `<ion-toolbar>` of dashboard, clicking `router.navigate(['/create-case/type'])`. Only rendered when `auth.isHfa()`.

---

### Acceptance Criteria

- [ ] "Create a case" button visible on HFA dashboard; navigates to `/create-case/type`
- [ ] All four case types are listed with label and description
- [ ] "Development Construction" routes to `/create-case/search`; all other types route to `/create-case/confirm`
- [ ] IMC search returns results after 300 ms debounce; empty state shown when no match
- [ ] Confirm screen shows milestone accordion for IMC types; title field for blank/others
- [ ] Developer from IMC pre-populated in Participants; HFA creator always pre-populated; both non-removable
- [ ] "Add participant" inline form works; duplicate email shows toast
- [ ] Create action: full-screen loading overlay; success navigates to `/cases/:id` with `replaceUrl: true`
- [ ] New case appears on dashboard after creation (store reload triggered)
- [ ] System `conversation_messages` row created on success
- [ ] Cancel/back navigation leaves no data in DB
- [ ] Direct URL navigation without state redirects to `/create-case/type`
