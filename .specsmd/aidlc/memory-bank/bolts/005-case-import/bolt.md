---
id: "005"
unit: 004-case-import
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
started: 2026-06-25T00:00:00Z
completed: 2026-06-25T09:10:00Z
current_stage: done
stages_completed:
  - name: plan
    completed: 2026-06-25T00:00:00Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-25T01:00:00Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-25T09:10:00Z
    artifact: test-walkthrough.md
stories:
  - 001-case-type-selection
  - 002-imc-project-search
  - 003-confirm-and-participants
  - 004-create-case-action
created: 2026-06-24T00:00:00Z
updated: 2026-06-25T00:00:00Z
requires_bolts: ["004"]
enables_bolts: ["006"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: 4-screen sub-flow with route state threading, IMC stub search, participant invitation inline form, atomic Supabase Edge Function create
---

# Bolt 005 — Create Case: Type Selection → IMC Search → Confirm + Participants → Create

## Objective

Build the four-step "Create a case" flow: choose a case type ("Start blank" or an IMC-backed type), search for an IMC project by number or name, preview the milestone/prerequisite structure and invite participants, then atomically create the case in Supabase.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-case-type-selection | "Choose a starting point" — four case type options | Must |
| 002-imc-project-search | IMC project search by project # or name | Must |
| 003-confirm-and-participants | Confirm screen + inline participant invitation | Must |
| 004-create-case-action | Atomic case creation + navigation | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Route sub-flow: `/create-case/type` → `/create-case/search` (IMC types only) → `/create-case/confirm` → `/create-case/create`
- `cases` table needs `case_type` column — coordinate with Unit 001 schema if not already added
- Route state threads `{ caseType, imcProject?, caseTitle? }` through all screens
- IMC stub: `ImportService.searchImcProjects(query)` filters seeded projects by # or name (debounced 300 ms)
- Confirm screen: accordion milestone preview (read-only) + participant `signal<ParticipantDraft[]>` with add/remove
- Create action: Edge Function `create-case` or sequential inserts; atomic; returns `{ caseId }`
- "Start blank" skips search screen; routes directly to confirm with no milestone data

### Stage 2: Implement
- `CaseTypeSelectionComponent` at `/create-case/type`: `IonList` of 4 options; tap → navigate with `caseType` state
- `ImcProjectSearchComponent` at `/create-case/search`: debounced text input → `ImportService.searchImcProjects()` → tap result → navigate to confirm
- `CreateCaseConfirmComponent` at `/create-case/confirm`:
  - For IMC types: read-only milestone accordion; `IonAccordionGroup`
  - For blank: case title text input (required)
  - Participants section (labeled "Participants"): pre-populated from IMC or empty; "Add participant" inline form; email + role selector; remove icon per manual entry
  - "Create case" CTA navigates to `/create-case/create` with full `CreateCasePayload`
- `CreateCaseActionComponent` (loading route) at `/create-case/create`: full-screen loading overlay; calls `CaseService.createCase(payload)`; on success navigates to `/cases/:id` with `replaceUrl: true`; on failure returns to confirm with error toast
- Add "Create a case" FAB/toolbar button on HFA dashboard

### Stage 3: Test
- Dashboard → "Create a case" → choose "Development Construction" → search "River" → select project → confirm screen shows correct milestone tree → add one participant → tap "Create case" → navigate to new case detail → case appears on dashboard
- Same flow for "Start blank": skip search → enter title → no milestone preview → add participant → create
- Tap "Cancel" from confirm → no data in DB
- Loading state: "Create case" button disabled during create call
- Participant edge case: add duplicate email → toast "Participant already added"
