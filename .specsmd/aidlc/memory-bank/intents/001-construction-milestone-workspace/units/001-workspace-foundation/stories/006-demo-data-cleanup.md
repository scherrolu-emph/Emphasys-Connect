---
id: 006-demo-data-cleanup
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 006-demo-data-cleanup

## User Story

**As a** demo presenter
**I want** the seed data to contain only realistic, named cases with correct prerequisite types
**So that** the hackathon demo looks credible and avoids confusion from test/placeholder data

## Acceptance Criteria

- [ ] **Given** the seeded database, **When** the HFA dashboard loads, **Then** no cases with "Test" in their name are present
- [ ] **Given** the seeded cases, **When** any case is opened, **Then** all cases have realistic project names, addresses, and developer contacts
- [ ] **Given** a Development Construction case, **When** its prerequisites are inspected, **Then** all prerequisites are of type `document_submission` (no `acceptance_comment` / checkbox certification types)
- [ ] **Given** the seed migration runs, **When** it completes, **Then** at least 2 realistic demo cases exist with meaningful milestone and prerequisite structures

## Technical Notes

- Update `seed.sql` (or equivalent seed script) to remove any case/project rows where `title ILIKE '%test%'`
- Replace with ≥2 realistic Development Construction cases (e.g. "Riverside Affordable Housing Phase 2", "Oakview Senior Living")
- Set all `prerequisites.type = 'document_submission'` for Construction case seed rows
- Ensure milestone and prerequisite counts are meaningful for demo: ≥2 milestones each with ≥2 prerequisites

## Dependencies

### Requires
- `001-supabase-schema-and-rls`
- `003-seed-data`

### Enables
- All demo-facing units (003, 004, 005, 006, 007)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Seed script run on already-seeded DB | Idempotent — truncates and re-inserts demo rows |
| Cases referenced by existing `case_participants` | Cascade delete handled before re-insert |

## Out of Scope

- Removing cases created after seed via the UI (runtime data)
- Changing non-Construction case prerequisite types
