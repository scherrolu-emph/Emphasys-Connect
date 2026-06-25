---
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
phase: inception
status: complete
created: 2026-06-24T00:00:00Z
updated: 2026-06-25T00:00:00Z
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: HFA Dashboard

## Purpose

The command-center home screen for HFA staff. Shows all active cases for the HFA org with at-a-glance status: active milestone name, overdue prerequisite count, overall progress. Filterable by case type. Entry point to Case Detail.

## Scope

### In Scope
- `/dashboard` screen (HFA only — guarded)
- Case list fetched from `cases` joined with milestone/prerequisite counts
- Per-case row: project title, type badge (Loan / Inspection / Application), active milestone name, overdue prerequisite count (red badge if > 0), milestone progress indicator
- Red left border on cases with overdue prerequisites
- Type filter chip strip: All / Loan / Inspection / Application
- Tap case row → navigate to `/cases/:id`
- Pull-to-refresh
- Loading skeleton state

### Out of Scope
- Case creation (cases imported from IMC — Unit 004)
- Case detail content (Unit 005)
- Developer-facing screens (Developers have their own case list at `/my-cases` — Unit 008)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-2 | HFA Dashboard — case list with milestone progress, overdue counts, type filter | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Case | `cases` row with `hfa_id` filter |
| Case summary | Computed: active milestone, overdue prereq count, total/accepted prereq counts |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `CaseService.getHfaCases(hfaId)` | Fetches cases + computes summary fields |
| `isOverdue(prerequisite)` | Computed: `target_days` exceeded and milestone not `completed` |
| Type filter | Client-side filter on `case.type` |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Case list screen with per-case row (title, type badge, milestone, progress) | Must |
| 002 | Overdue visual state (red badge, red left border) | Must |
| 003 | Type filter and pull-to-refresh | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | Supabase client, typed cases/milestones/prerequisites tables |
| 002-auth-screens | Authenticated HFA session, `is_hfa` guard |

### Depended By
| Unit | Reason |
|------|--------|
| 004-case-import | Dashboard is the entry point for the "Import from IMC" action |

### External Dependencies
None beyond Supabase.

---

## Technical Context

### Suggested Technology
- Angular Signals for filter state + case list signal
- `CaseService.getHfaCases()` — single query joining cases + milestone progress
- Overdue computed client-side from `target_days` + `milestone.activated_at`
- `IonList` + `IonItem` for case rows (native scroll)
- Chip strip for type filter using `@for`

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase | Query | `cases` left join `milestones`, `prerequisites` — aggregate counts |

---

## Constraints

- HFA-only screen — route guard must block Developer accounts
- Overdue flag is computed, not stored as a DB status field
- Dense layout acceptable — HFA staff are power users

---

## Success Criteria

### Functional
- [ ] Dashboard loads all cases for the HFA org
- [ ] Each case row shows correct type badge, active milestone name, overdue count, progress
- [ ] Cases with overdue prerequisites show red left border and red badge
- [ ] Type filter correctly hides/shows cases by type
- [ ] Tapping a case navigates to `/cases/:id`
- [ ] Pull-to-refresh reloads case list
- [ ] Developer account cannot reach `/dashboard` (redirected)

### Non-Functional
- [ ] Dashboard renders in < 1 second on local dev

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-003-1 | S1, S2, S3 | Full HFA dashboard — case list, overdue state, filter |
