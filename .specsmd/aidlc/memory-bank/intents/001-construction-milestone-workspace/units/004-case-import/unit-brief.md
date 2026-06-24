---
unit: 004-case-import
intent: 001-construction-milestone-workspace
phase: inception
status: draft
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Create Case

## Purpose

Allow HFA staff to create a new case in Emphasys Connect — either by linking an IMC project or starting blank. The HFA chooses a case type ("Development Construction", "Loan Underwriting", "Bond Issuance", or "Start blank"), searches for the IMC project by number or name (for non-blank types), previews the milestone/prerequisite structure, invites participants inline, then creates the case atomically. For the hackathon the IMC connection is stubbed with seed data.

## Scope

### In Scope
- "Create a case" button on the HFA dashboard (replaces "Import from IMC")
- "Choose a starting point" screen: four case types — Start blank, Development Construction, Loan Underwriting, Bond Issuance
- IMC project search: text input for project # or name (replaces list picker)
- Confirm screen: milestone/prerequisite structure preview + inline participant invitation
- Participant invitation as part of the creation flow:
  - Pre-populated with IMC Developer contact (for IMC-backed types)
  - HFA creator pre-populated (always)
  - HFA can add further participants (email + role) before creating
- Create action: creates `cases`, `milestones`, `prerequisites`, `case_participants` rows in Supabase atomically (or Edge Function)
- System message written on creation: "Case imported from IMC: {title}" or "Case created: {title}"
- Navigation to the new case detail after creation

### Out of Scope
- Actual IMC API/DB connection (stubbed with seeded `imc_projects_stub` data)
- Sending actual participant invitation emails (logged only for hackathon)
- Manual milestone/prerequisite editing in-app (edits happen in IMC)
- Blank case milestone setup in-app (added post-hackathon or via IMC later)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Create Case — type selection, IMC project search, confirm + participants, atomic create | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Case Type | `blank \| development_construction \| loan_underwriting \| bond_issuance`; stored on `cases.case_type` |
| IMC Project | Source data: project number, name, address, developer contact email, milestones, prerequisites |
| Case | Created in Supabase on action; `case_type` column required |
| Milestone | Created per IMC milestone; Milestone 1 `active`, rest `open` |
| Prerequisite | Created per IMC prerequisite; `status: pending_open` |
| Case Participant | Any person attached to the case; `case_participants` row with `user_id`, `contact_role` |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `ImportService.searchImcProjects(query)` | Returns filtered IMC projects from stub matching project # or name |
| `CaseService.createCase(payload)` | Edge Function call: creates case + milestones + prerequisites + participants + system message |
| `NotificationService.notifyParticipants(caseId)` | Logs participant invites (stubbed for hackathon) |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Case type selection — "Choose a starting point" screen | Must |
| 002 | IMC project search by project # or name | Must |
| 003 | Confirm screen + inline participant invitation | Must |
| 004 | Create case action — atomic write + navigate | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | All table schemas (including `case_type` column), typed client, Supabase write access |
| 002-auth-screens | HFA-authenticated session required |
| 003-hfa-dashboard | "Create a case" button lives on the dashboard |

### Depended By
None — create case produces the case that Units 005–007 operate on.

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| IMC | Source of project/milestone/prerequisite structure | Medium — stubbed for hackathon |
| Email Provider | Participant invite notification | Medium — logged only for hackathon |

---

## Technical Context

### Suggested Technology
- `ImportService` — wraps IMC stub search
- `CaseService.createCase` — wraps Supabase Edge Function or sequential inserts
- IMC stub: seeded `imc_projects_stub` table or static JSON in `/assets/imc-stub.json`
- Debounced search input (300 ms)
- Route state passed forward through 4-screen sub-flow via Angular Router `extras.state`

### Schema Note
- `cases` table needs a `case_type` column: `text NOT NULL DEFAULT 'blank'` with a check constraint on the four enum values
- `case_participants.contact_role` already planned in Unit 001; ensure it accepts 'developer' and 'hfa_staff' values

---

## Constraints

- IMC connection stubbed for hackathon — must work with fixture data
- Participant invitation is part of the creation flow, not a separate post-creation step
- "Stakeholders" label replaced by "Participants" everywhere in the UI

---

## Success Criteria

### Functional
- [ ] "Create a case" button on dashboard opens the "Choose a starting point" screen
- [ ] All four case types are selectable
- [ ] IMC-backed types route to project search; Start blank skips search
- [ ] Stub search returns results when project # or name is entered
- [ ] Confirm screen shows correct milestone/prereq structure
- [ ] Participant invitation: pre-populated HFA + Developer (IMC types); HFA can add more
- [ ] Case creation succeeds atomically; case appears on dashboard and navigates to case detail
- [ ] System message appears in conversation thread on creation

### Non-Functional
- [ ] Case creation (Edge Function path) completes in < 2 seconds on local dev

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-005 | S1, S2, S3, S4 | Full create-case flow: type selection → IMC search → confirm + participants → atomic create |
