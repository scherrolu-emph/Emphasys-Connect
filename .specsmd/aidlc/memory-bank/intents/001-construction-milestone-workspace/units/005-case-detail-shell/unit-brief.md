---
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
phase: inception
status: draft
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Case Detail Shell

## Purpose

The shared case detail screen for both HFA staff and participants. Renders a three-tab layout — Actions/Status | Conversation | Participants — with the Participants tab managed by this unit and the other panels filled by Units 006 and 007. Handles mobile toggle tabs, tablet/desktop two-panel with right-panel sub-tabs, data loading, Realtime subscription lifecycle, and participant add/remove (HFA only).

## Scope

### In Scope
- `/cases/:id` route (accessible to all case participants)
- Three-tab layout: Actions/Status | Conversation | Participants (mobile: full-width toggle; tablet/desktop: left panel + right panel with Conversation/Participants sub-tabs)
- Case header: project title, reference number (e.g. "Lotus #MF-2024-0188"), case type badge, active milestone name
- Persona detection: HFA vs. Participant rendering based on `is_hfa`
- `CaseDetailStore` (signal-based): case, milestones, prerequisites, participants, messages signals
- Realtime subscription started on enter, stopped on leave
- **Participants tab**: grouped list (YOUR AGENCY / DEVELOPER / OTHER PARTICIPANTS), avatar with initials + deterministic color, YOU badge, lock/trash icons, add/remove mutations (HFA only), Conversation tab unread badge
- Access control: non-participant users redirected

### Out of Scope
- Actions panel content (Unit 006)
- Conversation thread content (Unit 007)
- Case creation (Unit 004)
- Editing milestone/prerequisite structure (happens in IMC)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-4 | Case Detail — HFA Three-Tab View (Actions + Conversation + Participants) | Must |
| FR-5 | Case Detail — Participant View (Status + Conversation + Participants, read-only) | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Case | Loaded by `:id`; provides title, `referenceNumber`, case type |
| Milestone | All milestones ordered; active one highlighted in header |
| Prerequisite | Nested under milestones; full status + type |
| Case Participant | List with display name, role, email, invite status |
| Conversation Message | Initial page loaded here; Realtime appends new ones |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `CaseService.getCaseDetail(caseId)` | Fetches case + milestones + prerequisites in one query |
| `CaseService.getParticipants(caseId)` | Fetches case participants joined with profiles |
| `CaseService.addParticipant(caseId, email, role)` | Adds participant; writes system message |
| `CaseService.removeParticipant(caseId, participantId)` | Removes participant; writes system message |
| `MessageService.getMessages(caseId, limit)` | Fetches initial 50 messages |
| `RealtimeService.subscribeToCase(caseId)` | Opens channel; delegates events to store |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 5 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Three-tab layout — mobile toggle + right-panel sub-tabs on tablet/desktop | Must |
| 002 | HFA variant — Actions panel slot + case header with reference number | Must |
| 003 | Participant variant — Status panel slot + access guard | Must |
| 004 | Data loading, CaseDetailStore signals, Realtime subscription lifecycle | Must |
| 005 | Participants tab — grouped list, add/remove (HFA), Conversation tab unread badge | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | RealtimeService, Supabase client, typed DB types; `cases.reference_number` column |
| 002-auth-screens | Authenticated session, `is_hfa` flag |

### Depended By
| Unit | Reason |
|------|--------|
| 006-milestone-prereq-flow | Fills Actions panel; reads CaseDetailStore |
| 007-conversation-thread | Fills Conversation panel; reads CaseDetailStore |

---

## Technical Context

### Suggested Technology
- `CaseDetailStore` — standalone Signal service
- `IonPage`, `IonHeader`, `IonContent` — Ionic page shell
- CSS Grid for two-panel layout; `IonSegment`/`IonSegmentButton` for mobile toggle and right-panel sub-tabs
- `ionViewDidEnter` / `ionViewWillLeave` for Realtime subscription lifecycle

### Schema Notes
- `cases.reference_number TEXT` — human-readable project reference (e.g. "Lotus #MF-2024-0188"); populated from IMC on import; optional for blank cases

---

## Constraints

- Non-participant users must be redirected; RLS also blocks the query
- Realtime must unsubscribe on `ionViewWillLeave` to prevent ghost subscriptions
- No "Invite participant" or "Add stakeholder" option in the Actions panel — participant management is exclusively in the Participants tab
- "OTHER STAKEHOLDERS" section label renamed to "OTHER PARTICIPANTS" in all UI text

---

## Success Criteria

### Functional
- [ ] Case header shows title, reference number, case type badge, active milestone
- [ ] Three tabs render correctly on mobile (full-width toggle)
- [ ] Tablet/desktop: left panel + right panel with Conversation/Participants sub-tabs
- [ ] Participants tab: grouped list with YOUR AGENCY / DEVELOPER / OTHER PARTICIPANTS sections
- [ ] HFA can add and remove participants; each action writes a system message
- [ ] Participants view the list read-only
- [ ] Conversation tab badge shows unread count; clears on tab activate
- [ ] Realtime subscription open while on screen; closed on navigate away
- [ ] Non-participant redirected on load

### Non-Functional
- [ ] Case detail renders in < 1 second on local dev

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-006 | S1–S5 | Full case detail shell — three-tab layout, case header, data loading, Realtime, Participants tab |
