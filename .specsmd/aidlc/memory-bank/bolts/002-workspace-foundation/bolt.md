---
id: "002"
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 004-angular-app-shell
  - 005-realtime-service
created: 2026-06-24T00:00:00Z
requires_bolts: ["001"]
enables_bolts: ["003", "004", "006"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Angular project bootstrap with Ionic shell, auth guard, and RealtimeService channel management
---

# Bolt 002 — Workspace Foundation: Angular Shell + RealtimeService

## Objective

Bootstrap the Angular + Ionic app shell with working routing, an auth guard, and the centralised RealtimeService. This is the frontend foundation all feature bolts build on.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 004-angular-app-shell | Ionic shell, routing, auth guard | Must |
| 005-realtime-service | Per-case Realtime channel service | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Scaffold Ionic + Angular 17 project with standalone components config
- Map routes: `/login`, `/login/verify`, `/dashboard`, `/cases/:id`, `/empty`
- Design functional `authGuard` reading `AuthService.currentUser` signal
- Design `RealtimeService` channel map: `Map<string, RealtimeChannel>`; subscribe/unsubscribe API
- Plan `ionViewDidEnter` / `ionViewWillLeave` lifecycle hooks for channel management

### Stage 2: Implement
- Create `app.config.ts` with `provideRouter()`, `provideIonicAngular()`, token for SupabaseClient
- Create `AuthService` with `currentUser` signal and `isHfa` computed
- Implement `authGuard` functional guard using `inject(AuthService)`
- Create `AppComponent` with `IonApp` + `IonRouterOutlet`
- Implement `RealtimeService` with `subscribeToCase(caseId)` → `RealtimeChannel` handle and `unsubscribe(handle)`
- Subscribe to `postgres_changes` for `conversation_messages`, `prerequisites`, `milestones` filtered by `case_id`

### Stage 3: Test
- `ionic serve` → no console errors on load
- Navigate to `/dashboard` unauthenticated → redirects to `/login`
- `RealtimeService.subscribeToCase()` called twice with same id → no duplicate channels
- `unsubscribe()` called → channel removed from map
