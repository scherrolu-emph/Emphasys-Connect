---
intent: 001-case-workspace-item-checklist
phase: inception
status: draft
created: 2026-06-23T00:00:00Z
updated: 2026-06-23T00:00:00Z
---

# Requirements: Case Workspace & Item Checklist

## Intent Overview

The core shared case workspace — the central product experience of Emphasys Connect. HFA staff and external partners (General Contractors, Inspectors, Lenders, Property Owners) share the same live view of a case: its outstanding items, participant roster, and full activity history. Participants interact with items (advancing or returning status), exchange threaded notes and questions on individual items, and watch every action broadcast live via SignalR — replacing the broken status quo of email threads and spreadsheet status trackers.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Replace email/spreadsheet coordination with a single shared workspace | All case state visible in one screen; zero emails required to signal a status change | Must |
| Prove live real-time updates (the hero demo moment) | Partner marks item Submitted → HFA activity log updates within 1 second, no page refresh | Must |
| Give HFA staff clear item accountability and overdue visibility | Overdue items visually distinct; counts visible on dashboard without opening case | Must |
| Enable structured async collaboration via threads | Partner can ask a question; HFA answers inline; open-question badge clears live on resolve | Must |

---

## Functional Requirements

### FR-1: HFA Dashboard
- **Description**: Authenticated HFA staff see a list of all cases. Each row shows: case title, type badge (Loan / Construction Draw / Inspection / Application), overdue item count (red badge), outstanding item count, and a progress bar. Cases with overdue items have a red left border. A type filter (All / Construction Draw / Inspection / Application) narrows the list.
- **Acceptance Criteria**: Dashboard loads all cases; overdue count is accurate (items with due_date < now AND status not in Accepted/Returned); type filter hides non-matching cases; tapping a case navigates to Case Detail.
- **Priority**: Must

### FR-2: Case Detail — Items List
- **Description**: Case detail screen shows all non-cancelled items for the case. Each item row displays: title, assigned owner avatar, due date, status badge (color-coded), overdue flag (red), open-question count badge. Items marked cancelled are struck through and excluded from progress counts but remain visible in the list.
- **Acceptance Criteria**: Items render with correct status badges; overdue flag appears when due_date < now and status is not Accepted or Returned; cancelled items shown struck-through; item row tap opens Item Detail sheet.
- **Priority**: Must

### FR-3: Case Detail — Participant Sidebar
- **Description**: A sidebar (or collapsible panel) lists all CaseParticipants with their identity label (Lender, Inspector, General Contractor, Property Owner, etc.) and who added them.
- **Acceptance Criteria**: All participants for the case are shown with identity label and added-by attribution.
- **Priority**: Must

### FR-4: Case Detail — Activity Log Timeline
- **Description**: A single chronological timeline of ActivityEvents for the case. System events (item status changes, participant additions, thread resolves) are the spine. Threaded notes/questions appear as collapsed references within the timeline (e.g., "3 comments on Architect Certification → expand"). New events appended live via SignalR without page reload.
- **Acceptance Criteria**: Events render in chronological order; thread references are collapsed by default and expandable; new SignalR EventAdded events append to the top without a page refresh.
- **Priority**: Must

### FR-5: Item Status Mutations
- **Description**: Status transitions follow the defined flow: Pending → Submitted → Under Review → Accepted or Returned → Pending. External partners can mark Submitted. HFA staff can move to Under Review, Accepted, or Returned (with note). Every status change writes an ActivityEvent row in the same DB transaction and broadcasts ItemUpdated via SignalR to all case group members.
- **Acceptance Criteria**: Each allowed transition is available to the correct role; disallowed transitions are not shown; ActivityEvent is written atomically with status change; ItemUpdated broadcast reaches all connected clients within 1 second.
- **Priority**: Must

### FR-6: Item Cancel / Archive
- **Description**: HFA staff can cancel an item. Cancelled items are never hard-deleted; they become is_cancelled=true and are struck through in the UI, excluded from outstanding/overdue counts. An ActivityEvent is written and broadcast.
- **Acceptance Criteria**: Cancelled item appears struck-through; excluded from progress bar denominator and overdue count; reappears in list with visual distinction; cannot be re-activated.
- **Priority**: Must

### FR-7: Item Edit (HFA Only)
- **Description**: HFA staff can edit an item's title, due date, and assigned owner. Each edit writes an ActivityEvent. Owner reassign also available as a dedicated action.
- **Acceptance Criteria**: HFA user sees edit controls; external partner does not; edit persists and ActivityEvent is logged.
- **Priority**: Must

### FR-8: Threaded Notes & Questions
- **Description**: Any case participant can add a note or question on an individual item. Questions display an open-question badge on the item row (visible in the items list). HFA staff can mark a question Resolved; the badge clears. Thread posts write ActivityEvent rows and broadcast EventAdded via SignalR so the open-question badge updates live for all participants.
- **Acceptance Criteria**: Participant can post note or question; question badge appears on item row; HFA can resolve; badge clears live on all connected clients without page refresh.
- **Priority**: Must

### FR-9: SignalR Real-Time Broadcasting
- **Description**: The .NET SignalR hub at /hubs/case broadcasts three event types: ItemUpdated (any item status change), EventAdded (any activity log entry including thread posts), ParticipantAdded (new participant added to case). Clients join the case group on Case Detail load. All broadcasts update the UI without polling.
- **Acceptance Criteria**: On Case Detail load, client joins SignalR group; ItemUpdated triggers item status re-render; EventAdded appends to activity log; ParticipantAdded adds participant to sidebar. No polling fallback.
- **Priority**: Must

### FR-10: External Partner Case View
- **Description**: External partners (non-HFA users) see the full Case Detail: all items, all participants, and the full activity log. Their action set is limited: Mark Submitted (on their assigned items), Add Note, Ask Question. They cannot cancel, edit, accept, or return items.
- **Acceptance Criteria**: External partner role sees case detail with correct read-only vs. action subset; no HFA-only controls rendered; partner actions correctly restricted by role on the API side.
- **Priority**: Must

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Case Detail load | Time to interactive | < 1s on local dev |
| SignalR event delivery | Latency from server broadcast to UI update | < 1 second |
| Activity log | Initial page | ≤ 50 events loaded, paginated |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Authentication | JWT Bearer | Token stored in localStorage for hackathon; migrate to @capacitor/preferences before production |
| Authorization | Role-based (HFA staff vs. external partner) | Enforced on API endpoints; UI reflects role |
| Multi-tenancy | hfa_id on all entities | Enforcement mocked for hackathon; schema ready for row-level security |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| SignalR connection | Reconnection on drop | Auto-reconnect; no manual refresh required during demo |
| Item mutations | Atomicity | ActivityEvent written in same DB transaction as status change |

---

## Constraints

### Technical Constraints
- Items are **never hard-deleted** — cancel/archive only
- `hfa_id` must be present on every new entity from day one
- All item mutations must write an `ActivityEvent` row in the same transaction and broadcast via SignalR
- No polling fallback for SignalR — real-time is load-bearing for the demo
- Ionic components used for shell chrome only (IonPage, IonHeader, IonContent, IonTabs) — no IonModal, IonActionSheet, IonAlert
- EF migrations: never modify existing — always add new

### Business Constraints
- 2-day hackathon timeline; 2 developers (Dev 1: backend, Dev 2: frontend)
- No case creation UI — all data pre-seeded (3 cases, 5 items each)
- No file/document upload
- No participant removal UI
- No registration/onboarding flow

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Pre-seeded data covers all demo scenarios | Demo gaps if seed is incomplete | Seed data defined in spec §8; validate before demo day |
| SignalR WebSocket works in local dev network | Demo fails to show live updates | Verify in DevTools Network tab pre-demo; have wired fallback demo script |
| JWT auth is sufficient for hackathon security model | N/A (demo-only) | Document migration path to @capacitor/preferences for production |
| External partner role is determined by User.role field | Authorization gaps if role not set | Seed data must include correct roles for all 5 accounts |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Should overdue flag be computed client-side or returned by API? | Dev 1 | 2026-06-23 | Pending |
| Does the activity log need infinite scroll or is 50-event initial load sufficient for demo? | Team | 2026-06-23 | Pending |
