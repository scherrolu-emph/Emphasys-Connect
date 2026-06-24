---
id: 005-realtime-service
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 005-realtime-service

## User Story

**As a** developer
**I want** a centralised RealtimeService that manages per-case channel subscriptions
**So that** components can receive live DB updates without managing Supabase channels directly

## Acceptance Criteria

- [ ] **Given** `RealtimeService.subscribeToCase(caseId)` is called, **When** a row is inserted into `conversation_messages` for that case, **Then** the subscription callback is invoked with the new row
- [ ] **Given** a subscription exists, **When** `unsubscribe(handle)` is called, **Then** the Supabase channel is removed and no more events arrive
- [ ] **Given** two components subscribe to the same caseId, **When** a message arrives, **Then** both callbacks fire
- [ ] **Given** the app navigates away from a case, **When** `ionViewWillLeave` fires, **Then** `unsubscribe` is called and the channel is closed

## Technical Notes

- Subscribe to `postgres_changes` for tables: `conversation_messages`, `prerequisites`, `milestones` — filtered by `case_id`
- Return a typed `RealtimeChannel` handle from `subscribeToCase()`
- `RealtimeService` is `providedIn: 'root'`; the channel map is a `Map<caseId, RealtimeChannel>`
- Components call `subscribeToCase` in `ionViewDidEnter` / `ngOnInit` and `unsubscribe` in `ionViewWillLeave` / `ngOnDestroy`

## Dependencies

### Requires
- 002-typescript-types-and-client
- 001-supabase-schema-and-rls (Realtime must be enabled on tables)

### Enables
- 005-case-detail-shell/004-data-loading-and-realtime
- 007-conversation-thread (live message append)
- 006-milestone-prereq-flow (live status updates)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Network drop while subscribed | Supabase client auto-reconnects; events resume on reconnect |
| Subscribe called twice with same caseId | Return existing channel or create new one — no duplicate channels |

## Out of Scope

- Presence tracking (users online)
- Broadcast (non-DB) events
