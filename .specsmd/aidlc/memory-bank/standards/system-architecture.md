# System Architecture

## Overview

Two-subsystem architecture (Angular frontend + .NET 8 backend) communicating over a REST + SignalR contract. Multi-tenancy is structural from day one. Real-time is load-bearing, not a nice-to-have.

## Architecture Style

**Client-Server with Event-Driven Real-time Layer**

- Frontend: Single-page Angular app (SPA) wrapped in Ionic mobile shell
- Backend: Stateless REST API + stateful SignalR hub
- Data: Single SQL Server database with `hfa_id`-scoped multi-tenancy

Frontend and backend are developed independently and meet only at the REST + SignalR interface. Dev 1 owns backend; Dev 2 owns frontend.

## Domain Model (Core Entities)

```text
HFA
 └── Case (loan compliance, inspection, draw, application review)
      ├── Item              ← work items with status lifecycle
      │    ├── ActivityEvent ← immutable audit log
      │    └── Thread        ← threaded notes/questions on an item
      └── CaseParticipant   ← HFA staff + external partners
```

**Key invariants:**
- A `Case` belongs to exactly one `HFA` (via `hfa_id`)
- Every `Item` state change writes an `ActivityEvent` in the same transaction
- `Item` status lifecycle:
  ```
  Pending → Submitted → Under Review → Accepted
                                     ↘ Returned → (back to Pending)
  ```
- **Overdue** is a cross-cutting flag (`due_date < now` AND status not in Accepted/Returned), not a status value
- Items are never hard-deleted — cancellation sets `is_cancelled = true` (separate boolean, not a status)
- Activity log is a single timeline: system events (item status, participant adds) are the spine; threaded notes/questions are collapsed references, never peers
- `User.hfa_id` is **nullable** — null means external partner (GC, inspector, lender, etc.); non-null means HFA staff

## API Design

REST over HTTP with JWT auth. SignalR hub at `/hubs/case`.

- Resource-oriented endpoints (`/api/cases/{id}/items`)
- All mutations return the updated resource
- SignalR broadcasts on every mutation (after DB commit)
- Hub events: `ItemUpdated`, `EventAdded`, `ParticipantAdded`

## State Management (Frontend)

Angular services as the state layer — no NgRx or external state library for the hackathon.

- `CaseService`: case + item state, updated on SignalR `ItemUpdated` events
- `ActivityService`: activity timeline, updated on `EventAdded` events
- `AuthService`: JWT token management

## Caching Strategy

No caching for the hackathon build. Simplicity over performance.

## Security Patterns

- JWT bearer tokens on all API routes (except `/api/auth/*`)
- `hfa_id` extracted from JWT claims and applied to all queries (mocked enforcement in v1)
- No secrets in source control — `appsettings.Development.json` is git-ignored
- CORS restricted to dev origins in development; locked down for production

## Multi-Tenancy

Structural multi-tenancy: every entity carries `hfa_id`. Row-level enforcement is mocked for the hackathon (middleware reads `hfa_id` from JWT but does not filter at the DB layer). Schema is designed to add enforcement without migration changes.
