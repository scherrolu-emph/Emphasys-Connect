---
unit: 008-participant-case-list
intent: 001-construction-milestone-workspace
created: 2026-06-25T00:00:00Z
last_updated: 2026-06-25T00:00:00Z
---

# Construction Log: Participant Case List

## Original Plan

**From Inception**: 1 bolt planned
**Planned Date**: 2026-06-24T00:00:00Z

| Bolt ID | Stories | Type |
|---------|---------|------|
| 011 | 001-participant-case-list-screen | simple-construction-bolt |

## Replanning History

| Date | Action | Change | Reason | Approved |
|------|--------|--------|--------|----------|

## Current Bolt Structure

| Bolt ID | Stories | Status | Changed |
|---------|---------|--------|---------|
| 011 | 001 | ✅ complete | - |

## Execution History

| Date | Bolt | Event | Details |
|------|------|-------|---------|
| 2026-06-25T00:00:00Z | 011 | started | Stage 1: Plan |
| 2026-06-25T00:00:00Z | 011 | stage-complete | Plan complete |
| 2026-06-25T00:00:00Z | 011 | stage-complete | Implement: MyCasesPage, participantCasesGuard, CaseService.getParticipantCases |
| 2026-06-25T00:00:00Z | 011 | stage-complete | Test: manual verification + 8 unit tests added in review |
| 2026-06-25T00:00:00Z | 011 | completed | All 3 stages done; git: "Finish Bolt 11 participant case list and navigation" |

## Execution Summary

| Metric | Value |
|--------|-------|
| Original bolts planned | 1 |
| Current bolt count | 1 |
| Bolts completed | 1 |
| Bolts in progress | 0 |
| Bolts remaining | 0 |
| Replanning events | 0 |

## Delivered Artifacts

| File | Description |
|------|-------------|
| `client/src/app/pages/my-cases/my-cases.page.ts` | Standalone `MyCasesPage` — skeleton, case list, empty state, responsive layout |
| `client/src/app/pages/my-cases/my-cases.page.spec.ts` | 8 unit tests covering skeleton, case list, empty state, navigation, unauthenticated |
| `client/src/app/core/auth/participant-cases.guard.ts` | Route guard — HFA → `/dashboard`, unauthenticated → `/login`, participants → allow |
| `client/src/app/core/case/case.service.ts` | `CaseService.getParticipantCases(userId)` — multi-query join across `case_participants`, `milestones`, `prerequisites` |
| `client/src/app/app.routes.ts` | Added `/my-cases` lazy-loaded route guarded by `participantCasesGuard` |

## Notes

Bolt plan called for extending the existing `CaseService` in `core/cases/`. Instead, a new `CaseService` was created at `core/case/` (singular) keeping participant and HFA queries separate. Both services share the `CaseService` class name in different modules — intentional separation, not a mistake.

`isHfa` is a computed signal on `AuthService` (not a method), used directly in the guard as `auth.isHfa()`.

Component uses plain boolean `isLoading` and `cases[]` array (not Angular signals) — a pragmatic choice since there is no cross-component state sharing needed.

`hfaGuard` (for `/dashboard`) was also updated during this bolt: it now redirects non-HFA authenticated users to `/my-cases` instead of leaving them on a blank route.
