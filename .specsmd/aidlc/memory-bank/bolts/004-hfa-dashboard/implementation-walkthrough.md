---
stage: implement
bolt: 004-hfa-dashboard
created: 2026-06-25T00:00:00Z
---

## Implementation Walkthrough: HFA Dashboard — Case List with Overdue Visuals

### Summary

The HFA dashboard case list is now fully implemented. A new `CaseService` queries Supabase for all cases belonging to the HFA org, mapping nested milestone and prerequisite data to typed domain interfaces. A Signal-based `DashboardStore` (root-scoped) drives the `DashboardPage` with filter chips, pull-to-refresh, skeleton loading, and empty states. A presentational `CaseCardComponent` renders each row.

### Structure Overview

The work spans three layers: (1) core domain layer — models, service, utility function; (2) auth layer — `hfaGuard` and profile-aware `AuthService`; (3) dashboard feature — store, page, and card component. The schema migration adds `target_days` and `activated_at` to `milestones`, enabling the overdue computation.

### Completed Work

- [x] `supabase/migrations/002_bolt004_milestone_overdue.sql` — adds `target_days`/`activated_at` to milestones; adds HFA-staff cases RLS policy
- [x] `client/src/app/core/supabase/database.types.ts` — updated milestones Row/Insert/Update with new columns
- [x] `client/src/app/core/auth/auth.service.ts` — added `profile` signal, `hfaId` computed; `isHfa` now reads from profile row (source of truth) rather than user_metadata
- [x] `client/src/app/core/cases/case.models.ts` — `CaseSummary`, `MilestoneSummary`, `FilterType`, `CASE_TYPE_LABELS`, `FILTER_CHIPS`
- [x] `client/src/app/core/cases/overdue.utils.ts` — pure `isOverdue(milestone)` function; wired and correct; will activate when `target_days`/`activated_at` are populated
- [x] `client/src/app/core/cases/case.service.ts` — `getHfaCases(hfaId)` with nested Supabase query; maps raw rows to `CaseSummary[]`
- [x] `client/src/app/core/auth/hfa.guard.ts` — `hfaGuard`: no session → `/login`, authenticated non-HFA → `/my-cases`
- [x] `client/src/app/pages/dashboard/dashboard.store.ts` — root-scoped Signal store; `cases`, `isLoading`, `error`, `selectedType` signals; `filteredCases` computed; `load()` and `selectType()` methods
- [x] `client/src/app/pages/dashboard/case-card/case-card.component.ts` — presentational; `caseItem` input, `selected` output, `overdue`/`typeLabel`/`milestoneName` computed signals
- [x] `client/src/app/pages/dashboard/case-card/case-card.component.html` — card layout with overdue class, type badge, milestone name, prereq progress
- [x] `client/src/app/pages/dashboard/case-card/case-card.component.scss` — overdue red border, type badge colours, desktop grid columns at ≥1280px
- [x] `client/src/app/pages/dashboard/dashboard.page.ts` — smart component; injects store + auth; ngOnInit triggers load; pull-to-refresh handler; navigation to `/cases/:id`
- [x] `client/src/app/pages/dashboard/dashboard.page.html` — chip strip, skeleton rows, error/empty states, IonList of CaseCardComponent
- [x] `client/src/app/pages/dashboard/dashboard.page.scss` — responsive container (960px tablet, 1200px desktop)
- [x] `client/src/app/app.routes.ts` — `/dashboard` now guarded by `hfaGuard` (was `authGuard`)
- [x] `client/src/app/core/auth/auth.service.spec.ts` — updated `isHfa` tests to use `profile` signal

### Key Decisions

- **Profile over user_metadata for isHfa**: `AuthService.isHfa` now reads from the `profiles` table row rather than `user_metadata`. This makes `hfa_id` and `is_hfa` derivable from a single source of truth, avoiding divergence if metadata is stale.
- **Root-scoped DashboardStore**: Providing the store at root level ensures the selected filter chip survives navigation to a case detail and back — satisfying story 003's persistence criterion without URL params.
- **`isOverdue` always false until schema populated**: The overdue utility is correct and wired. It returns false because `target_days`/`activated_at` are NULL in current seed data. The infrastructure is ready; no further code changes needed.
- **Type cast for nested Supabase query**: The hand-authored `Database` type doesn't define table relationships, so the nested query result is cast via `as unknown as RawCase[]`. Local raw interfaces keep the cast narrow and type-safe within `case.service.ts`.
- **`hfaGuard` on `/dashboard`**: Replaces the generic `authGuard`. Developers redirected to `/my-cases` instead of getting a blank HFA dashboard.

### Deviations from Plan

- Filter chips use `[caseItem]` binding name (not `[case]`) to comply with `@angular-eslint/no-input-rename` which disallows aliasing inputs.

### Dependencies Added

None — all Ionic components used were already in the project's `@ionic/angular` dependency.

### Developer Notes

Run `supabase/migrations/002_bolt004_milestone_overdue.sql` against the Supabase project before testing the dashboard. The `cases_select_hfa_staff` RLS policy is required for the HFA query to return rows.
