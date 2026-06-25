---
stage: implement
bolt: "002"
created: 2026-06-24T00:00:00Z
---

## Implementation Walkthrough: Workspace Foundation — Angular Shell + RealtimeService

### Summary

The Angular shell was completed by the previous engineer (story 004 — app.config, AuthService, authGuard, AppComponent, all routes, PostLoginService). This session completed the one remaining item: RealtimeService (story 005), which centralises all Supabase Realtime channel subscriptions per case and prevents duplicate channels.

### Structure Overview

RealtimeService is a root-level singleton at `client/src/app/core/realtime/`. It maintains a `Map<caseId, RealtimeChannel>` and exposes two methods: `subscribeToCase` (idempotent — returns existing channel on repeat calls) and `unsubscribe` (removes the channel and closes the Supabase subscription). The service registers postgres_changes listeners for the three tables that drive live UI updates: `conversation_messages`, `prerequisites`, and `milestones`, each filtered by `case_id`.

### Completed Work

- [x] `client/src/app/core/realtime/realtime.service.ts` — singleton service managing per-case Supabase Realtime channels
- [x] `client/src/app/core/realtime/realtime.service.spec.ts` — Jasmine unit tests covering channel creation, deduplication, multi-case isolation, unsubscribe behaviour, and no-op safety

### Key Decisions

- **No-op callbacks in service**: The service's `.on()` handlers use empty callbacks (`() => {}`). Consumers (CaseDetailComponent, ConversationThread, etc.) add their own `.on()` handlers to the returned channel to receive typed payloads. This keeps the service focused on lifecycle management, not event dispatch.
- **Keyed by caseId**: Channel names are `case:{caseId}` — deterministic and collision-free across cases.
- **`unsubscribe` is safe to call without a prior subscribe**: The method short-circuits on unknown keys, so `ionViewWillLeave` guards are not needed.

### Deviations from Plan

None — implementation matches the bolt spec exactly.

### Dependencies Added

None.

### Developer Notes

When a consuming component wants to react to live DB changes, it calls `subscribeToCase(caseId)` and adds its own `.on('postgres_changes', ...)` handler to the returned channel. The Supabase client dispatches events to all registered handlers on the channel, including those added after `.subscribe()` was called. Components must call `unsubscribe(caseId)` in `ionViewWillLeave` or `ngOnDestroy` — but only when they are the last consumer. For the hackathon, a single case detail component owns the subscription lifecycle.
