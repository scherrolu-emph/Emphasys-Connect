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

# Unit Brief: Case Import

## Purpose

Allow HFA staff to import a funded project from IMC into Emphasys Connect. The HFA sees a picker of available IMC projects, previews the milestone/prerequisite structure, and confirms the import. The case, milestones, and prerequisites are created in Supabase, and the Developer contact is invited (notified by email). For the hackathon, the IMC connection is stubbed with seed data.

## Scope

### In Scope
- "Import from IMC" button on the HFA dashboard
- IMC project picker screen: list of importable projects (name, address, developer contact)
- Confirm screen: milestone/prerequisite structure preview before committing
- Import action: creates `cases`, `milestones`, `prerequisites`, `case_participants` rows in Supabase in one transaction (or Edge Function)
- System message written to `conversation_messages`: "Case imported from IMC: [project name]"
- Developer contact notified by email (Edge Function; stubbed for hackathon)
- Navigation to the new case detail after import

### Out of Scope
- Actual IMC API/DB connection (stubbed for hackathon with seeded IMC project data)
- Template-based case creation (removed — structure comes from IMC)
- Manual milestone/prerequisite creation in-app (edits happen in IMC)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Import Case from IMC — picker, confirm, create case + milestones + prerequisites, notify developer | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| IMC Project | Source data: project name, address, developer contact email, milestones (ordered), prerequisites per milestone |
| Case | Created in Supabase on import; references `imc_project_id` |
| Milestone | Created per IMC milestone; first milestone is `open`, rest `open` |
| Prerequisite | Created per IMC prerequisite; `status: pending_open` |
| Case Participant | HFA staff (creator) + Developer (from IMC contact) added as participants |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `ImportService.getImcProjects()` | Returns list of importable projects from IMC stub/API |
| `ImportService.importProject(imcProjectId)` | Creates case + milestones + prerequisites + participants + system message in Supabase |
| `NotificationService.notifyDeveloper(caseId, email)` | Edge Function to send case-created email (stubbed for hackathon) |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | IMC project picker screen (stubbed data) | Must |
| 002 | Confirm screen with milestone/prerequisite preview | Must |
| 003 | Import action — create case + participants + system message; navigate to case | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | All table schemas, typed client, Supabase write access |
| 002-auth-screens | HFA-authenticated session required |
| 003-hfa-dashboard | "Import from IMC" button lives on the dashboard |

### Depended By
None — import creates the case that Units 005–007 operate on.

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| IMC | Source of project/milestone/prerequisite structure | Medium — stubbed for hackathon; real integration is post-hackathon |
| Email Provider | Developer invite notification | Medium — use stub/log for hackathon |

---

## Technical Context

### Suggested Technology
- `ImportService` — wraps IMC stub + Supabase write
- IMC stub: a static JSON fixture in `/assets/imc-stub.json` or seeded Supabase table `imc_projects_stub`
- Import transaction: Supabase Edge Function (`import-imc-project`) to atomically create all rows
- `IonList` + `IonItem` for picker, confirm screen with milestone accordion

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| IMC (stub) | Static fixture or seeded table | Real DB access in post-hackathon |
| Supabase Edge Function | `invoke('import-imc-project', {imcProjectId})` | Atomic case creation |

---

## Constraints

- Hackathon: IMC connection stubbed — must work with fixture data without real IMC
- Import is the ONLY way cases are created — no manual form
- The import screen is HFA-only

---

## Success Criteria

### Functional
- [ ] IMC picker shows at least 1 importable project from stub data
- [ ] Confirm screen shows milestone list with prerequisite counts
- [ ] Confirming import creates case, milestones, prerequisites in Supabase
- [ ] HFA staff and Developer are added as case participants
- [ ] System message "Case imported from IMC" appears in conversation thread
- [ ] After import, user navigates to the new case detail
- [ ] Imported case appears on HFA dashboard

### Non-Functional
- [ ] Import completes in < 2 seconds on local dev

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-004-1 | S1, S2, S3 | Full IMC import flow — picker, confirm, create, navigate |
