---
id: 003-seed-data
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-seed-data

## User Story

**As a** demo presenter
**I want** realistic pre-loaded case data available on `supabase db reset`
**So that** the hackathon demo can run immediately without manual data entry

## Acceptance Criteria

- [ ] **Given** `supabase db reset` runs, **When** seed completes, **Then** 2 user accounts exist: `staff@hfa.demo` (`is_hfa: true`) and `developer@demo.com`
- [ ] **Given** seed completes, **When** HFA staff logs in, **Then** 1 active case appears on the dashboard with 2 milestones
- [ ] **Given** the case exists, **When** data is inspected, **Then** Milestone 1 has 2 prerequisites (1 `document_submission`, 1 `acceptance_comment`), Milestone 2 has 2 prerequisites
- [ ] **Given** seed completes, **When** Developer logs in, **Then** they are a participant in the case
- [ ] **Given** the case conversation thread is opened, **When** seed is applied, **Then** at least 1 system message ("Case imported from IMC: ...") exists

## Technical Notes

- Seed file: `supabase/seed.sql`
- Use Supabase Auth admin API (or direct `auth.users` insert) for demo accounts
- Milestone 1 status: `active`; Milestone 2 status: `open`
- One prerequisite in Milestone 1 should be `received_processing` (developer already uploaded) to show mid-flight state in demo

## Dependencies

### Requires
- 001-supabase-schema-and-rls

### Enables
- All demo scenarios

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| `supabase db reset` run twice | Idempotent — same data, no duplicate key errors |
| Auth user creation in seed | Use `supabase.auth.admin.createUser()` or SQL insert with UUID |

## Out of Scope

- Multiple cases (one is sufficient for hackathon)
- Participant removal
