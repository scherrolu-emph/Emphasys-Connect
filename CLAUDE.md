# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Emphasys Connect** — a shared case workspace for Housing Finance Agencies (HFAs) to coordinate with external partners (lenders, inspectors, contractors) on open cases: loan compliance reviews, property inspections, construction draws, and application reviews. Replaces email/spreadsheet coordination with a real-time shared workspace where every participant sees what's outstanding and watches the process move live.

Full design spec: [docs/superpowers/specs/2026-06-23-emphasys-connect-design.md](docs/superpowers/specs/2026-06-23-emphasys-connect-design.md)

## Stack

- **Frontend**: Ionic 7 + Angular 17+ (Capacitor for native mobile; web output for future Emphasys product integration)
- **Backend**: .NET 8 Web API — controllers, ASP.NET Core Identity + JWT, SignalR hub
- **Data**: EF Core 8 + SQL Server LocalDB
- **Real-time**: SignalR — hub at `/hubs/case`, broadcasts `ItemUpdated` / `EventAdded` / `ParticipantAdded`

## Commands

### Frontend (`/client`)
```bash
npm install               # Install dependencies
ionic serve               # Dev server (browser)
ionic capacitor run ios   # Run on iOS simulator
ionic capacitor run android  # Run on Android emulator
ng test                   # Unit tests
ng lint                   # Lint
```

### Backend (`/server`)
```bash
dotnet restore            # Restore packages
dotnet run                # Start API (http://localhost:5000)
dotnet test               # Run tests
dotnet ef migrations add <Name>   # Add EF migration
dotnet ef database update         # Apply migrations + seed data
```

## Architecture

**Two subsystems, one API contract.** Frontend and backend are developed independently and meet at the REST + SignalR interface. Dev 1 owns backend; Dev 2 owns frontend.

**Ionic is shell-only.** Ionic components are used exclusively for the mobile chrome (navigation, page transitions, tab bar). All content screens are plain Angular components + CSS. Avoid `IonModal`, `IonActionSheet`, `IonAlert` — use Angular overlays instead.

**Real-time is load-bearing.** The SignalR hub must broadcast on every item status change and activity log entry. The hero demo moment — a partner marks an item Submitted and the HFA's timeline updates live with no email sent — is the product's core proof point. Never poll as a fallback in the demo build.

**Multi-tenancy is structural, not enforced (v1).** Every entity carries `hfa_id`. Enforcement (row-level security / middleware) is mocked for the hackathon but the schema is designed to support it without migration changes.

**Items are never hard-deleted.** Cancel/archive only. A cancelled item is struck through and excluded from counts but stays in the record with its full history.

**Activity log is a single timeline.** System events (item status changes, participant adds) are the spine. Threaded notes/questions are folded in as collapsed references — never peers in the global stream.

## Auth (hackathon)

No registration flow. Five pre-seeded accounts (see design spec §4). JWT stored in localStorage for the hackathon build; migrate to `@capacitor/preferences` before any production build.

## Coding Standards

- Strict TypeScript — no `any`
- `hfa_id` on every new entity from day one
- All item mutations must write an `ActivityEvent` row in the same transaction and broadcast via SignalR
- EF migrations: never modify an existing migration — always add a new one
- Standalone components only — no `NgModules`; every component declares its own `imports`
- Guard all `window`/`document` globals with `isPlatformBrowser()` to preserve Capacitor native compatibility
- Angular Signals for state and UI binding; RxJS only for HTTP streams, SignalR listeners, or multi-source composition
- Presentational components use `input()`/`output()` signals; smart components inject services via functional `inject()`
- Use `@if`/`@for (item of items; track item.id)` control flow — never `*ngIf`/`*ngFor`
- Signal values are immutable — update via `.set()` or `.update(prev => ...)`; never mutate directly
- Wrap every page in `<ion-content>`; use `<ion-list>`/`<ion-item>` for lists to preserve native scrolling
- C#: file-scoped namespaces, global usings, primary constructors, and pattern matching preferred
- C#: every I/O and DB call must be `async`/`await` with `CancellationToken` passed to EF Core
- SignalR backend: implement `ICaseHubClient` interface on the hub — no raw `SendAsync("string", ...)` calls
- SignalR frontend: centralise all `.on(...)` listeners in `SignalRService`; match event name strings exactly; map payloads to typed TS interfaces immediately
- SignalR connection: start in `ionViewDidEnter`/app-initializer with `withAutomaticReconnect()`; stop in `ionViewWillLeave`/`ngOnDestroy`
- Keep controllers thin — HTTP concerns only; business logic belongs in services
- Use strongly-typed DTOs for all request/response payloads — no anonymous objects or `dynamic`
- Never expose EF Core entities directly to the frontend — always map to a DTO first


## What to Avoid

- Do not modify existing EF migrations — add a new one
- Do not check API keys or secrets into source control
- Do not use `IonModal` / `IonActionSheet` / `IonAlert` (adds unnecessary Ionic learning surface)
- Do not add a polling fallback for the SignalR real-time updates
- Don't catch an Exception if you cannot act on it. If you cannot act on the Exception, bubble it up to inform the user

## Behavioral Guidelines

1. **Verification**: Never assume functionality; verify with code scans or execution tests.
2. **Simplicity**: Prefer surgical, small file edits over global, sprawling modifications.
3. **Staged Execution**: For tasks over 10 minutes, halt and request human feedback.
4. **Code Only Focus**: Do not explain basic Angular or C# concepts. Provide functional, production-ready snippets directly.
5. **No Boilerplate**: Omit repetitive import blocks or standard namespace layouts unless explicitly requested. Use `// ... existing imports ...` to save context space.
6. **Cross-Platform Aware**: The Angular frontend runs inside a Capacitor webview on iOS/Android. Always avoid browser-exclusive APIs that break under Capacitor — guard with `isPlatformBrowser()` or Capacitor's platform utilities.

## Development Workflow

- **Spec First**: Before coding, write a brief, one-sentence plan for approval.
- **TDD Mandatory**: Write tests *before* implementing new logic.
- **Validation**: Always run test suites and linter before marking a feature as "Done".

## Agents

The `shared-team-agents/` directory is reserved for shared agent configurations and prompts used across the team.
