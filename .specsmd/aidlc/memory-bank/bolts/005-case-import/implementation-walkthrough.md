---
stage: implement
bolt: "005"
created: 2026-06-25T01:00:00Z
---

## Implementation Walkthrough: Create Case (Unit 004)

### Summary

Built the four-screen "Create a case" sub-flow for HFA staff: type selection, IMC project search, confirm + participants, and atomic case creation. The flow threads Angular Router state through all screens, stubs IMC data with a static JSON asset cached in-memory, and writes case rows sequentially to Supabase with a compensating delete on failure. A `Relationships: []` fix was applied to all tables in `database.types.ts` to satisfy the Supabase v2 `GenericTable` constraint.

### Structure Overview

Three layers: domain models and services in `core/cases/`, four routed page components under `pages/create-case/`, and route + dashboard wiring at the app level. All pages are HFA-guarded lazy-loaded standalone components. State flows forward via `Router.navigate({ state: ... })` and is validated on each screen's `ngOnInit` — missing state redirects to `/create-case/type`.

### Completed Work

- [x] `client/src/app/core/cases/import.models.ts` — domain interfaces: `ImcProject`, `ImcMilestone`, `ImcPrerequisite`, `ParticipantDraft`, `CreateCasePayload`, `CreateCaseRouteState`
- [x] `client/src/assets/imc-stub.json` — three seeded IMC projects (River View Apartments, Oakwood Family Homes, Cedar Creek Senior Living) with milestones and prerequisites
- [x] `client/src/app/core/cases/import.service.ts` — lazy-loads and caches `imc-stub.json`; filters by project name or number (case-insensitive); returns empty array for queries under 2 chars
- [x] `client/src/app/core/cases/case.service.ts` — added `createCase(payload, hfaId, createdBy)`: sequential inserts for cases → milestones → prerequisites → case_participants → conversation_messages; compensating delete on any failure
- [x] `client/src/app/pages/create-case/type/case-type-selection.page.ts` — lists four case types; routes Development Construction to search, all others directly to confirm
- [x] `client/src/app/pages/create-case/type/case-type-selection.page.html` — `IonList` with `button detail` items; Cancel returns to dashboard
- [x] `client/src/app/pages/create-case/type/case-type-selection.page.scss` — section header and item sizing
- [x] `client/src/app/pages/create-case/search/imc-project-search.page.ts` — implements `AfterViewInit`; attaches `fromEvent + debounceTime(300)` to native input; writes results to signal; validates route state on init
- [x] `client/src/app/pages/create-case/search/imc-project-search.page.html` — native `<input>` with `#searchInput` ref; spinner during load; results list; empty state
- [x] `client/src/app/pages/create-case/search/imc-project-search.page.scss` — search input styling, loading row, empty state
- [x] `client/src/app/pages/create-case/confirm/create-case-confirm.page.ts` — milestone accordion for IMC types; title field for blank/others; participant signal pre-populated from IMC + creator; inline add form with duplicate-email toast; routes to `/create-case/create` with full `CreateCasePayload`
- [x] `client/src/app/pages/create-case/confirm/create-case-confirm.page.html` — `IonAccordionGroup` milestone tree; participant list with remove buttons for manual entries; inline add form; "Create case" CTA disabled when title empty
- [x] `client/src/app/pages/create-case/confirm/create-case-confirm.page.scss` — section headers, field groups, participant tags, inline add form layout
- [x] `client/src/app/pages/create-case/create/create-case-action.page.ts` — reads payload from route state on `ngOnInit`; calls `CaseService.createCase()`; navigates to `/cases/:id` with `replaceUrl: true` on success; shows error toast and returns to confirm on failure; triggers `DashboardStore.load()` on success
- [x] `client/src/app/pages/create-case/create/create-case-action.page.html` — full-screen centered spinner with "Creating case…" label
- [x] `client/src/app/pages/create-case/create/create-case-action.page.scss` — full-height flex overlay
- [x] `client/src/app/app.routes.ts` — added four `create-case/*` routes, all guarded by `hfaGuard`
- [x] `client/src/app/pages/dashboard/dashboard.page.ts` — added `IonButtons`, `IonButton` imports; added `createCase()` method
- [x] `client/src/app/pages/dashboard/dashboard.page.html` — "Create a case" toolbar button in `slot="end"`
- [x] `client/src/app/core/supabase/database.types.ts` — added `Relationships: []` to all 7 tables; added `Views` and `Functions` to satisfy `GenericSchema`

### Key Decisions

- **Sequential inserts over Edge Function**: Simpler for the hackathon; Edge Function is the documented production path in story 004 technical notes. Compensating delete provides best-effort rollback.
- **Static JSON stub over seeded DB table**: Eliminates a migration and a Supabase query per search; the asset is fetched once and cached in `ImportService`.
- **Native `<input>` with `fromEvent` on search screen**: Ionic's `IonSearchbar` emits on its own debounce cycle; using a native input gives precise 300 ms control via RxJS.
- **`history.state` fallback for route state**: `router.getCurrentNavigation()` is only non-null during navigation; on hard refresh or direct URL, `history.state` preserves the last state. Both are read on `ngOnInit`.
- **`Relationships: []` fix in database.types.ts**: `@supabase/postgrest-js` v2 `GenericTable` requires this field. Without it, all `.insert()` calls resolved their argument type to `never`. SELECT queries were unaffected because existing code already cast with `as unknown`.

### Deviations from Plan

- **`database.types.ts` fix was unplanned**: Adding `Relationships: []` and `Views`/`Functions` to the schema was not in the implementation plan. Discovered during build; applied as part of this bolt since it was required to compile.
- **`IonIcon` removed from type selection page**: Plan noted using `detail` chevron on `IonItem`; the `detail` attribute renders the chevron natively, so an explicit `IonIcon` import was not needed.

### Post-Completion Fixes (discovered during developer smoke test)

After the bolt was marked complete, manual testing as `developer@demo.com` revealed the developer dashboard was empty. Root cause was a two-layer gap in how the developer persona loads cases — neither existed before this bolt, so neither was in scope, but both were fixed here to unblock testing.

**Files added/changed:**

- [x] `client/src/app/core/cases/case.service.ts` — added `getParticipantCases()`: same select as `getHfaCases` but no `.eq('hfa_id', ...)` filter; the `cases_select` RLS function `is_case_participant()` restricts results to cases where `auth.uid()` is a participant
- [x] `client/src/app/pages/dashboard/dashboard.store.ts` — added `loadForDeveloper()`: calls `getParticipantCases()` and updates the shared `cases` signal
- [x] `client/src/app/pages/my-cases/my-cases.page.ts` — replaced the placeholder stub ("You'll be added to cases by your HFA.") with a real case list: calls `store.loadForDeveloper()` in `ngOnInit`, renders `CaseCardComponent` rows with skeleton loading, pull-to-refresh, and empty/error states

**Root cause detail:** The developer is routed to `/my-cases` (not `/dashboard`) by `PostLoginService`. The `/my-cases` page was an unimplemented stub from Bolt 002. The `/dashboard` route is behind `hfaGuard` — the developer never reaches it. A second issue: `getHfaCases(hfaId)` filters by `hfa_id`, which is `null` for a developer profile; `getParticipantCases()` omits that filter and relies on RLS instead.

**Scope note:** The `my-cases` case list is formally part of Bolt 011 (Participant case list — Developer view). What was implemented here is the minimum needed to make the developer usable: data loading, the list, and navigation to `/cases/:id`. Bolt 011 will add filtering, sorting, and the My Tasks/Activity tabs.

### Dependencies Added

None — all dependencies were already present in `package.json`.

### Developer Notes

- Route state must be read as `router.getCurrentNavigation()?.extras.state ?? history.state` — the `getCurrentNavigation()` call returns `null` if not read synchronously in the constructor or `ngOnInit` during the navigation event.
- The confirm page pre-populates participants from `auth.profile()` which is a signal; if the profile hasn't loaded yet (e.g. slow OTP login), the HFA creator email will be an empty string. For the hackathon this is acceptable since the demo uses pre-seeded accounts.
- `CaseService.createCase()` is not transactional — the compensating delete runs a best-effort `DELETE` on failure but does not guarantee atomicity. The Edge Function path (future) solves this properly.
