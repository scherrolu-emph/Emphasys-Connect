# API Conventions

## Overview

Resource-oriented REST API with JWT authentication. All mutations return the updated resource and trigger a SignalR broadcast. Consistent error format across all endpoints.

## API Style

REST over HTTP/1.1. Resource-oriented URLs, standard HTTP verbs.

Base URL: `http://localhost:5000/api` (development)

## Versioning

No versioning for v1 (hackathon). URL versioning (`/api/v2/...`) when breaking changes are needed post-hackathon.

## Request / Response Format

- Content-Type: `application/json` on all requests and responses
- Dates: ISO 8601 with time and timezone (`2026-06-23T10:30:00Z`)
- IDs: integer primary keys (EF default)

## Response Format

**Success (single resource)**:
```json
{
  "data": { ... }
}
```

**Success (collection)**:
```json
{
  "data": [ ... ],
  "total": 42
}
```

**Created (201)**:
```json
{
  "data": { "id": 123, ... }
}
```

## Error Response Format

```json
{
  "code": "ITEM_NOT_FOUND",
  "message": "Case item 42 was not found.",
  "details": {}
}
```

**HTTP Status Codes**:

| Status | When |
|--------|------|
| 200 OK | Successful GET, PUT, PATCH |
| 201 Created | Successful POST (resource created) |
| 204 No Content | Successful DELETE (no body) |
| 400 Bad Request | Validation failure |
| 401 Unauthorized | Missing or invalid JWT |
| 403 Forbidden | Valid JWT but wrong `hfa_id` scope |
| 404 Not Found | Resource not found |
| 409 Conflict | Business rule violation (e.g., invalid status transition) |
| 500 Internal Server Error | Unhandled exception |

## URL Patterns

```
GET    /api/cases                          # List cases for current HFA
GET    /api/cases/{id}                     # Get case with items
POST   /api/cases                          # Create case
GET    /api/cases/{id}/items               # List items for case
POST   /api/cases/{id}/items               # Add item to case
PATCH  /api/cases/{id}/items/{itemId}      # Update item (status, assignment)
GET    /api/cases/{id}/activity            # Activity timeline
POST   /api/cases/{id}/participants        # Add participant
POST   /api/auth/login                     # Authenticate (returns JWT)
```

## Pagination Strategy

Offset pagination for lists (where applicable):

```
GET /api/cases?offset=0&limit=20
```

Response includes `total` count. Default `limit`: 50. Max `limit`: 200.

## Authentication Header

```
Authorization: Bearer <jwt-token>
```

All routes except `/api/auth/*` require a valid JWT. `hfa_id` is extracted from JWT claims server-side — clients never send `hfa_id` directly.

## SignalR Conventions

Hub URL: `/hubs/case`

After authenticating, clients join a case group: `await connection.invoke("JoinCase", caseId)`

**Server → Client events**:

| Event | Payload |
|-------|---------|
| `ItemUpdated` | `{ caseId, item: CaseItemDto }` |
| `EventAdded` | `{ caseId, event: ActivityEventDto }` |
| `ParticipantAdded` | `{ caseId, participant: ParticipantDto }` |

Every API mutation that changes case state MUST broadcast the corresponding SignalR event after the DB transaction commits.
