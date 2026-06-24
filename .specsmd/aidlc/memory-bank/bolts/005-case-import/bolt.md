---
id: "005"
unit: 004-case-import
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-imc-project-picker
  - 002-confirm-screen
  - 003-import-action
created: 2026-06-24T00:00:00Z
requires_bolts: ["004"]
enables_bolts: ["006"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: IMC stub service, multi-step picker → confirm flow, atomic Supabase insert with system message creation
---

# Bolt 005 — Case Import: IMC Project Picker + Atomic Import

## Objective

Build the two-step IMC import flow: pick a project from the stubbed IMC list, preview the milestone/prerequisite structure, then import atomically into Supabase with an initial system message.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-imc-project-picker | IMC project list from stub | Must |
| 002-confirm-screen | Milestone/prereq preview before import | Must |
| 003-import-action | Atomic case creation + system message | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- IMC stub: `ImcService` returns hardcoded project list (2–3 projects with milestone/prereq structures)
- Flow: Dashboard FAB → `/import/pick` → select project → `/import/confirm` → confirm → `/cases/:id`
- Atomic import: single Supabase transaction (or sequential inserts within a DB function) creates case + milestones + prerequisites + initial system message
- Confirm screen: accordion showing milestone titles with prerequisite names underneath
- Error handling: if import fails, nothing is partially created (use Postgres function or Edge Function)

### Stage 2: Implement
- Create `ImcService` with `getProjects(): Observable<ImcProject[]>` returning stub data
- `ImcProject` type: `{ id, name, milestones: [{ title, prerequisites: [{ name, type }] }] }`
- `ImportPickerComponent` at `/import/pick`: `IonList` of projects → tap to select → navigate to confirm
- `ImportConfirmComponent` at `/import/confirm`: accordion preview, "Import" CTA button
- `CaseImportService.importCase(imcProject)`: inserts case, then milestones (Milestone 1 `active`, rest `open`), then prerequisites (`pending_open`), then system message "Case imported from IMC: {name}"
- On success: navigate to `/cases/:id` with new case id
- Add FAB or toolbar button on dashboard to trigger import flow

### Stage 3: Test
- Dashboard → FAB → picker shows 2–3 stub IMC projects
- Select project → confirm screen shows correct milestone/prereq tree
- Tap "Import" → case created, appears immediately on dashboard (re-query), navigate to case detail
- System message "Case imported from IMC..." appears in conversation thread
- DB: milestones and prerequisites inserted with correct statuses
- Cancel from confirm screen → no partial data in DB
