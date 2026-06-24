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

The shared case detail screen that both HFA staff and Developers land on when opening a case. Renders a two-panel layout — Actions/Status panel on the left, Conversation panel on the right — with persona-specific content in each panel. Handles mobile reflow (single column with panel toggle), data loading, and Realtime subscription lifecycle. Units 006 and 007 fill the panels; this unit provides the container, data layer, and routing.

## Scope

### In Scope
- `/cases/:id` route (accessible to both HFA and Developer participants)
- Two-panel layout component: left/top panel + right/bottom panel
- Mobile reflow: stacked single column with "Actions" / "Conversation" toggle tabs
- Persona detection: renders HFA variant vs. Developer variant based on `is_hfa`
- Data loading: fetches case, milestones (with prerequisites), case participants, initial messages
- `CaseDetailStore` (signal-based): holds case, milestones, prerequisites, participants, messages signals
- Realtime subscription started on enter (`ionViewDidEnter`), stopped on leave (`ionViewWillLeave`)
- Notification bell icon in header (count badge — logic delegated to Unit 007)
- Case header: project title, type badge, active milestone name
- Participant sidebar strip (scrollable horizontal on mobile): shows participant display names + contact roles
- Access control: non-participant users redirected away

### Out of Scope
- Actions panel content (Unit 006 — milestone/prereq flow)
- Conversation thread content (Unit 007)
- Case import (Unit 004)
- Editing case structure (happens in IMC)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-4 | Case Detail — HFA Two-Panel View (Actions + Conversation, mobile reflow) | Must |
| FR-5 | Case Detail — Developer View (read-only Status + Conversation) | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Case | Loaded by `:id`; provides title, type, status |
| Milestone | All milestones for the case, ordered; active one highlighted |
| Prerequisite | Nested under milestones; full status + type |
| Case Participant | List of participants with contact roles |
| Conversation Message | Initial page loaded here; Realtime appends new ones |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `CaseService.getCaseDetail(caseId)` | Fetches case + milestones + prerequisites in one query |
| `CaseService.getParticipants(caseId)` | Fetches case participants |
| `MessageService.getMessages(caseId, limit)` | Fetches initial 50 messages |
| `RealtimeService.subscribeToCase(caseId)` | Opens channel; delegates events to store |
| `CaseDetailStore.applyRealtimeEvent(event)` | Updates signals on incoming Realtime broadcast |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Case detail layout — two-panel desktop, single-column mobile with toggle | Must |
| 002 | HFA variant — Actions panel slot + Conversation panel slot (empty until units 006/007) | Must |
| 003 | Developer variant — read-only Status panel slot + Conversation panel slot | Must |
| 004 | Data loading, CaseDetailStore signals, Realtime subscription lifecycle | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | RealtimeService, Supabase client, typed database types |
| 002-auth-screens | Authenticated session, `is_hfa` flag for persona switching |

### Depended By
| Unit | Reason |
|------|--------|
| 006-milestone-prereq-flow | Fills the Actions panel; reads from CaseDetailStore |
| 007-conversation-thread | Fills the Conversation panel; reads from CaseDetailStore |

### External Dependencies
None beyond Supabase.

---

## Technical Context

### Suggested Technology
- `CaseDetailStore` — standalone service using Angular Signals (`signal()`, `computed()`)
- `@defer` for lazy-loading panel components (Units 006 + 007)
- `IonPage`, `IonHeader`, `IonContent` — Ionic page shell
- CSS Grid / Flexbox for two-panel layout
- Ionic `IonSegment` / `IonSegmentButton` for mobile panel toggle
- `ionViewDidEnter` / `ionViewWillLeave` lifecycle for Realtime subscription

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase | Query | Multi-table join: case + milestones + prerequisites + participants |
| Supabase Realtime | Channel | `case:{caseId}` — messages + prerequisite + milestone changes |

---

## Constraints

- Non-participant users (no row in `case_participants`) must be redirected — RLS will also block the query
- Realtime must be unsubscribed on `ionViewWillLeave` to prevent ghost subscriptions
- The panel slots are empty until Units 006 and 007 are built — use placeholder components for testing

---

## Success Criteria

### Functional
- [ ] `/cases/:id` loads case, milestones, prerequisites, participants
- [ ] HFA user sees two-panel layout with Actions (left) + Conversation (right)
- [ ] Developer user sees Status (left, read-only) + Conversation (right)
- [ ] Mobile layout stacks panels with toggle; toggle switches between panels
- [ ] Realtime subscription is open while on the case detail screen
- [ ] Realtime subscription closes when navigating away
- [ ] Non-participant user is redirected on load

### Non-Functional
- [ ] Case detail renders in < 1 second on local dev

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-005-1 | S1, S2, S3, S4 | Full case detail shell — layout, persona variants, data loading, Realtime lifecycle |
