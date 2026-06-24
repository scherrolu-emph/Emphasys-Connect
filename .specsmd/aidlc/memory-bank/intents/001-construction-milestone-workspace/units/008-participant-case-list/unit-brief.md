---
unit: 008-participant-case-list
intent: 001-construction-milestone-workspace
phase: inception
status: draft
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Participant Case List

## Purpose

The home screen for all non-HFA participants after login. Shows every case the signed-in user has been added to via `case_participants`. Calm, guided density — simpler than the HFA dashboard. Entry point to Case Detail.

For the hackathon the only participant persona is Developer. The screen is intentionally named and built persona-agnostically so that future partner types (GC, Inspector, Lender, Architect, etc.) get this same screen for free when they are added as `case_participants` — no code changes needed.

## Scope

### In Scope
- `/my-cases` screen (non-HFA participants only — guarded; redirects HFA to `/dashboard`)
- Case list fetched from `case_participants` joined with `cases` for the current user
- Per-case row: project title, active milestone name, prerequisite progress ("{accepted}/{total} accepted")
- Tap case row → navigate to `/cases/:id`
- Empty state when participant has no assigned cases
- Loading skeleton state
- Responsive layout: three breakpoints matching ux-guide standard

### Out of Scope
- Overdue counts and overdue visual state (HFA concern only)
- Type filter (participants have few cases; filtering not needed in v1)
- Import from IMC action (HFA-only)
- Case detail content (Unit 005)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Passwordless Auth — post-login routing to participant home screen | Must |
| FR-5 | Case Detail — Developer/Participant View (entry point navigation) | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Case | `cases` row reached via `case_participants` join for current user |
| Case summary | Active milestone name + accepted/total prereq counts |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `CaseService.getParticipantCases(userId)` | Fetches cases via `case_participants` join; returns `ParticipantCaseSummary[]` |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 1 |
| Must Have | 1 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Participant case list screen with per-case row, empty state, navigation | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | Supabase client, typed `case_participants` + `cases` tables |
| 002-auth-screens | Authenticated session, post-login routing to `/my-cases` |

### Depended By
| Unit | Reason |
|------|--------|
| 005-case-detail-shell | Participant case list is the entry point to case detail for any multi-case participant |

---

## Technical Context

### Suggested Technology
- `CaseService.getParticipantCases(userId)` — joins `case_participants` → `cases` → active `milestones` → prerequisite counts
- `ParticipantCaseSummary`: `{ id, title, activeMilestoneName: string | null, prereqAccepted: number, prereqTotal: number }`
- `IonList` + `IonItem` for case rows (native scroll)
- Route guard: `canActivate` checks `isHfa()` — HFA users redirected to `/dashboard`; all other authenticated users allowed

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase | Query | `case_participants` join `cases`, active `milestones`, `prerequisites` aggregate |

---

## Constraints

- Non-HFA screen — route guard redirects HFA accounts to `/dashboard`
- No overdue logic — that metric is HFA-facing only
- Calm/guided density per ux-guide dual-density principle
- `is_hfa` boolean is a hackathon simplification — future role system will use `contact_role` or a dedicated roles table (see coding-standards.md)

---

## Success Criteria

### Functional
- [ ] Non-HFA login routes to `/my-cases`
- [ ] Case list shows only cases the participant is in via `case_participants`
- [ ] Each row shows project title, active milestone name, accepted/total prereq progress
- [ ] Tapping a case navigates to `/cases/:id`
- [ ] Zero cases → empty state "You'll be added to cases by your HFA"
- [ ] HFA account navigating to `/my-cases` is redirected to `/dashboard`

### Non-Functional
- [ ] Screen renders in < 1 second on local dev

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-011-1 | S1 | Participant case list — data fetch, row rendering, empty state, navigation |
