---
id: "015"
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 006-demo-data-cleanup
  - 007-demo-conversation-seed
created: 2026-06-25T12:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: []
enables_bolts: ["016", "017", "018", "019"]
requires_units: []
blocks: false

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 1
---

# Bolt 015 — Demo Data Refresh

## Objective

Replace all placeholder/test seed data with a clean, realistic demo dataset: named cases, document-submission prerequisites, pre-loaded conversation threads, and HFA activity events.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 006-demo-data-cleanup | Remove test cases, add realistic demo cases, doc-submission prereqs | Must |
| 007-demo-conversation-seed | Pre-load conversations + HFA activity feed with dummy data | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Identify all seed scripts / migration files to update
- Define 2 realistic Development Construction cases with names, addresses, developer contacts
- Define milestone + prerequisite structure per case (all prereqs `document_submission` type)
- Define 5+ pre-seeded `conversation_messages` per case (mix of `system` and `manual` types)
- Define 6+ `activity_events` for HFA user spanning both cases

### Stage 2: Implement
- Update `seed.sql` (or equivalent): remove rows where `cases.title ILIKE '%test%'`
- Insert 2 realistic demo cases with correct `case_type`, milestones, prerequisites
- Set all prerequisite `type = 'document_submission'` for Construction cases
- Insert `conversation_messages` rows per case with realistic author names and timestamps
- Insert `activity_events` rows for HFA user with realistic event types and timestamps

### Stage 3: Test
- Run seed script on clean DB — verify no "Test" cases present
- Open demo case conversation — verify 5+ messages visible in thread
- Open HFA activity feed — verify 6+ events visible, spanning both cases
- Verify all prerequisites in Construction cases are `document_submission` type
