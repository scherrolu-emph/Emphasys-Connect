---
unit: 010-activity-feed
intent: 001-construction-milestone-workspace
phase: inception
status: complete
created: '2026-06-24T00:00:00Z'
updated: '2026-06-24T00:00:00Z'
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Activity Feed

## Purpose

A dedicated bottom-navigation tab that shows a chronological, cross-case event feed for the logged-in user — all system events and manual messages that have occurred across their cases, newest first. Activity is read-only and informational; it complements My Tasks (which shows only actionable items) by giving users a full view of everything that has happened across their portfolio.

## Scope

### In Scope
- "Activity" tab in the bottom navigation bar (third tab for both HFA and Participant)
- Cross-case event feed: all `conversation_messages` rows (system and manual) across the user's cases, ordered newest-first
- Each activity row shows: event description (message body), case name, timestamp; tap navigates to `/cases/{caseId}`
- Loading skeleton while initial query runs
- Empty state: "No activity yet" when the user has no cases or no messages
- Live updates via Realtime: new events appear at the top of the feed without a page refresh

### Relationship to Other Units
- **My Tasks (Unit 009)**: actionable items only; Activity shows everything including resolved/completed events
- **Notification Bell (Unit 007, story 004)**: bell tracks per-case unread counts; Activity is the persistent, scrollable history of all events once the bell is cleared
- **Per-case Conversation Thread (Unit 007, story 001)**: per-case only; Activity aggregates across all cases

### Out of Scope
- Filtering or searching the activity feed
- Marking activity items as read/unread (bell in Unit 007 handles unread per case)
- Activity actions (approve, send message) — all mutations happen inside the case detail

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-13 | Activity Feed — cross-case event log for logged-in user | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Activity Item | A `conversation_messages` row (system or manual) from any of the user's cases |
| Activity Context | Case name attached to each item for orientation |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `ActivityService.getActivity(userId)` | Queries `conversation_messages` joined with `cases` + `case_participants` for the user's cases, ordered by `created_at DESC` |
| `RealtimeService` | Extends existing subscription to push new messages to the activity feed in real time |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 1 |
| Must Have | 1 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Activity feed screen — cross-case event log, Realtime updates, deep link to case | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | `conversation_messages`, `cases`, `case_participants` schema; typed client |
| 002-auth-screens | Authenticated user session required |
| 007-conversation-thread | Message model (`system` vs `manual` types); message write patterns already established |

### Depended By
None — Activity is read-only; it does not own any mutations.

---

## Technical Context

### Suggested Technology
- `ActivityService.getActivity(userId)`: Supabase join — `conversation_messages` + `cases` + `case_participants` WHERE `case_participants.user_id = userId` ORDER BY `created_at DESC` LIMIT 50
- Consider a Supabase view or RPC `get_activity_feed(user_id)` if join is complex
- Realtime: reuse the user's existing case channel subscriptions in `RealtimeService`; prepend new messages to the `activities` signal
- `activities = signal<ActivityItem[]>([])`

---

## Constraints

- Feed is read-only — no actions from this tab
- Initial load limited to 50 most recent items; pagination optional post-hackathon
- Live updates via Realtime — do not poll

---

## Success Criteria

### Functional
- [ ] "Activity" tab visible in bottom nav (third tab, both personas)
- [ ] Feed shows events from all user's cases, newest first
- [ ] Each row: event description + case name + timestamp; tap → navigates to case detail
- [ ] New events appear live without refresh
- [ ] Empty state when no events exist

### Non-Functional
- [ ] Initial feed loads in < 1 second

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-013 | S1 | Activity feed tab + cross-case event list + Realtime prepend |
