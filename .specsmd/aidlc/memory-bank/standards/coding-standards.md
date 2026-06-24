# Coding Standards

## Overview

Strict TypeScript frontend with Angular conventions; idiomatic C# backend following .NET 8 patterns. Both layers share the invariant that every item mutation is atomic with its activity log entry and SignalR broadcast.

## Code Formatting

**Frontend (TypeScript)**:
- Tool: Prettier (Angular default config)
- Key Settings: 2-space indent, single quotes, trailing commas on multiline

**Backend (C#)**:
- Tool: `.editorconfig` + `dotnet format`
- Key Settings: 4-space indent, standard .NET naming/formatting conventions

## Linting

**Frontend**:
- Tool: ESLint + Angular ESLint
- Strictness: Strict — `strict: true` in `tsconfig.json`
- Key Rules: `@typescript-eslint/no-explicit-any: error`, unused vars: error, no implicit returns

**Backend**:
- Tool: Roslyn analyzers (built-in .NET)
- Strictness: Default .NET analyzer warnings treated as errors in CI

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| TS variables | camelCase | `caseId`, `isLoading` |
| TS functions | camelCase | `getCaseById`, `markItemSubmitted` |
| TS classes / components | PascalCase | `CaseWorkspaceComponent` |
| TS interfaces | PascalCase (no `I` prefix) | `CaseItem`, `ActivityEvent` |
| Angular services | PascalCase + `Service` | `CaseService`, `SignalRService` |
| C# classes / interfaces | PascalCase | `CaseController`, `ActivityEvent` |
| C# methods | PascalCase | `GetCaseById`, `MarkItemSubmitted` |
| C# public properties | PascalCase | `HfaId`, `CreatedAt` |
| C# parameters / local variables | camelCase | `caseId`, `cancellationToken` |
| C# private fields | `_camelCase` (readonly) | `_caseRepository` |
| DB columns / EF shadow props | snake_case | `hfa_id`, `created_at` |

**File Naming**:
- Angular components: `kebab-case.component.ts`
- Angular services: `kebab-case.service.ts`
- C# files: `PascalCase.cs`

## File Organization

**Pattern**: Feature-based (frontend) + layer-based (backend)

**Frontend Structure** (`/client/src/app`):
```text
core/            # Singleton services (auth, SignalR, HTTP interceptors)
features/
  cases/         # Case workspace feature
  items/         # Work items feature
  activity/      # Activity timeline
shared/          # Shared components, pipes, directives
```

**Backend Structure** (`/server`):
```text
Controllers/     # API endpoints
Models/          # EF entities (all carry HfaId)
Services/        # Business logic
Hubs/            # SignalR hub
Data/
  Migrations/    # EF migrations (append-only, never edit)
  Seeders/       # Seed data (5 pre-seeded accounts)
```

**Conventions**:
- Tests: co-located for Angular (`*.spec.ts`), separate `*.Tests` project for .NET
- No barrel `index.ts` re-exports (direct imports only)
- Never commit API keys, JWT secrets, or connection strings — use `appsettings.Development.json` (git-ignored)

## Testing Strategy

**Frontend**:
- Framework: Jasmine + Karma (`ng test`)
- Coverage target: Critical paths — auth flow, case workspace interactions, SignalR update handling

**Backend**:
- Framework: xUnit (`dotnet test`)
- Coverage target: All business logic service methods, all controller endpoints

**Test Types**:

| Type | Tool | When to Use |
|------|------|-------------|
| Unit | Jasmine / xUnit | Business logic, services, utilities |
| Integration | Angular TestBed / xUnit + LocalDB | Component rendering, API endpoints |
| E2E | Not scoped for hackathon | — |

**Conventions**:
- Test naming: `it('should {behavior} when {condition}')`
- Mock strategy: Mock at system boundaries (HTTP, SignalR hub); use real LocalDB for backend integration tests
- Never mock the database in integration tests — use a real LocalDB instance

## Frontend

- **Structure**: Standalone components only — no `NgModules`. Every component, pipe, and directive uses `standalone: true` and declares its own `imports`.
- **Native**: Capacitor handles all mobile builds. Never use `window`, `document`, or other browser globals directly — guard with `isPlatformBrowser()` or Capacitor's platform check so SSR/native targets don't break.
- **Reactivity**: Angular Signals own all local state and UI binding. RxJS is reserved for async boundaries: HTTP calls, SignalR event streams, and multi-source data composition. Do not use `BehaviorSubject` or `Subject` where a `signal()` suffices.
- **Component architecture**:
  - *Presentational (dumb)*: receive data via `input()` signals, emit events via `output()`. No service injection.
  - *Smart (container)*: inject services with the functional `inject()` pattern (not constructor injection). Own the data-fetch and pass results down to presentational children.
- **Control flow**: Use Angular 17 built-in control flow syntax — `@if`, `@else`, `@for (item of items; track item.id)`. Never use `*ngIf` or `*ngFor`.
- **Signal immutability**: Treat Signal values as immutable. Always update via `.set()` or `.update(prev => ...)` — never mutate object properties directly on a signal value.
- **Ionic layout**: Every page component must be wrapped in `<ion-content>`. Use `<ion-list>` and `<ion-item>` for list rendering to preserve native scrolling performance on mobile.

```typescript
// smart component — functional inject
@Component({ standalone: true, ... })
export class CaseWorkspaceComponent {
  private caseService = inject(CaseService);
  case = toSignal(this.caseService.getCase(this.id));
}

// presentational component — input/output signals
@Component({ standalone: true, ... })
export class ItemCardComponent {
  item = input.required<CaseItem>();
  statusChange = output<ItemStatus>();
}

// control flow — @if/@for, not *ngIf/*ngFor
@if (items().length > 0) {
  <ion-list>
    @for (item of items(); track item.id) {
      <ion-item>{{ item.title }}</ion-item>
    }
  </ion-list>
}
```

## Backend API

- **C# syntax**: Use file-scoped namespaces, global usings, and primary constructors where appropriate. Prefer clean pattern matching over long `if`/`else` chains.
- **Async**: Every I/O and DB operation must be `async`/`await`. Always pass `CancellationToken` through to EF Core calls (e.g., `await _db.Cases.FindAsync(id, ct)`).
- **Thin controllers**: Controllers handle only HTTP concerns (routing, model binding, response shaping). All business logic lives in service classes injected via constructor DI.
- **Strongly-typed DTOs**: Every request and response uses a dedicated DTO class in a `Dtos/` folder. No anonymous objects, no `dynamic`, no `object` return types.
- **Never expose EF entities**: EF Core entity classes (`Models/`) must never be serialized directly to the frontend. Map to a DTO before returning from any controller action.

```
Controllers/
  CasesController.cs        # thin — calls IService, returns DTOs
Services/
  ICaseService.cs
  CaseService.cs            # business logic here
Dtos/
  Requests/                 # incoming payloads
    CreateItemRequest.cs
  Responses/                # outgoing payloads
    CaseDetailResponse.cs
Models/                     # EF entities — never leave this layer
  Case.cs
```

## SignalR & Real-Time

### Backend

- **Strongly-typed hub interface**: Define `ICaseHubClient` and use it as the generic parameter on the hub. All server→client methods must be declared on this interface — never call `Clients.Group(...).SendAsync("string", ...)` with a raw string.

```csharp
public interface ICaseHubClient
{
    Task ItemUpdated(int caseId, CaseItemDto item);
    Task EventAdded(int caseId, ActivityEventDto @event);
    Task ParticipantAdded(int caseId, ParticipantDto participant);
}

public class CaseHub : Hub<ICaseHubClient>
{
    // clients invoked as: await Clients.Group(...).ItemUpdated(caseId, dto);
}
```

### Frontend

- **Exact event names**: Angular hub listener methods must match the server event name strings exactly (`ItemUpdated`, `EventAdded`, `ParticipantAdded`). No magic strings scattered across components — centralise all `.on(...)` calls inside `SignalRService`.
- **Typed payloads**: Map every inbound socket payload immediately to a typed TS interface at the point of receipt. Never pass `any` through to components.
- **Connection lifecycle**:
  - Start the hub connection in `ionViewDidEnter` (per-page) or an app-initializer (global); never in a constructor.
  - Enable auto-reconnect (`withAutomaticReconnect()`).
  - Stop and clean up the connection in `ionViewWillLeave` / `ngOnDestroy` to avoid duplicate listeners on re-entry.

```typescript
// signalr.service.ts — centralised, typed
export class SignalRService {
  private connection = new HubConnectionBuilder()
    .withUrl('/hubs/case', { accessTokenFactory: () => this.auth.token() })
    .withAutomaticReconnect()
    .build();

  itemUpdated$ = new Subject<{ caseId: number; item: CaseItemDto }>();

  async start() {
    this.connection.on('ItemUpdated', (caseId: number, item: CaseItemDto) =>
      this.itemUpdated$.next({ caseId, item })
    );
    await this.connection.start();
  }

  async stop() { await this.connection.stop(); }
}
```

## Error Handling

**Pattern**: throw/catch with structured HTTP error responses

**API Error Format**:
```json
{ "code": "ITEM_NOT_FOUND", "message": "Human-readable message", "details": {} }
```

**Frontend**: Angular HTTP interceptor catches errors; SignalR disconnect triggers automatic reconnect (no polling fallback).

**Backend**: Global exception middleware maps domain exceptions to HTTP status codes. Use typed exception classes (e.g., `NotFoundException`, `ConflictException`) rather than raw exceptions.

## Logging

**Frontend**: `console.error` in dev; structured Angular `ErrorHandler` for production.

**Backend**: `ILogger<T>` (built-in .NET) with structured JSON output in production.

**Levels**:

| Level | Usage |
|-------|-------|
| Error | Unhandled exceptions, failed SignalR broadcasts |
| Warning | Auth failures, missing expected data |
| Information | Item state transitions, participant adds, case events |
| Debug | SignalR message payloads (dev only) |

**Rules**:
- Always log: item state transitions, auth events, SignalR broadcast results
- Never log: JWT tokens, passwords, `hfa_id` tied to user PII
