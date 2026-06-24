# AGENTS.md

This file provides guidance to AI coding agents (OpenAI Codex, ChatGPT) when working in this repository.

## Project

**Emphasys Connect** — a shared case workspace for Housing Finance Agencies (HFAs) to coordinate with external partners (lenders, inspectors, contractors) on open cases: loan compliance reviews, property inspections, construction draws, and application reviews. Replaces email/spreadsheet coordination with a real-time shared workspace where every participant sees what's outstanding and watches the process move live.

Full design spec: [docs/superpowers/specs/2026-06-23-emphasys-connect-design.md](docs/superpowers/specs/2026-06-23-emphasys-connect-design.md)

## Stack

- **Frontend**: Ionic 7 + Angular 17+ (Capacitor for native mobile)
- **Backend**: .NET 8 Web API — controllers, ASP.NET Core Identity + JWT, SignalR hub at `/hubs/case`
- **Data**: EF Core 8 + SQL Server LocalDB
- **Real-time**: SignalR broadcasts `ItemUpdated` / `EventAdded` / `ParticipantAdded`

## Commands

### Frontend (`/client`)
```bash
npm install
ionic serve
ng test
ng lint
```

### Backend (`/server`)
```bash
dotnet restore
dotnet run
dotnet test
dotnet ef migrations add <Name>
dotnet ef database update
```

## Key Architecture Rules

- **Ionic is shell-only**: Use Ionic only for `IonApp`, `IonPage`, `IonHeader`, `IonContent`, `IonTabs`, `IonIcon`, `IonBadge`, `IonButton`. All content is plain Angular + CSS.
- **Real-time is load-bearing**: Every item mutation must broadcast via SignalR in the same transaction as the DB write. Never substitute polling.
- **Items are never hard-deleted**: Cancel/archive only (`is_cancelled = true`). Deleted items break the audit trail.
- **Every mutation writes an ActivityEvent**: Item status changes, participant adds, reassignments — all must produce an `ActivityEvent` row. This is what the live timeline displays.
- **`hfa_id` on every entity**: Multi-tenancy is structural. Add `hfa_id` to every new table from day one.
- **No new EF migrations modify existing ones**: Always `dotnet ef migrations add <Name>` — never edit a committed migration file.

## Coding Standards

- Strict TypeScript — no `any`
- No `IonModal` / `IonActionSheet` / `IonAlert` — use Angular overlays
- JWT stored in localStorage (hackathon); migrate to `@capacitor/preferences` for production
- All API responses follow the shape established in existing controllers

## What to Avoid

- Do not modify existing EF migration files
- Do not commit secrets or API keys
- Do not add polling as a fallback for SignalR
- Do not use Ionic overlay components (`IonModal`, `IonAlert`, `IonActionSheet`)
