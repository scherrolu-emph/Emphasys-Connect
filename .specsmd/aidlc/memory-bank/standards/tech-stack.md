# Tech Stack

## Overview

Emphasys Connect is a full-stack mobile-first web application using TypeScript/Angular on the frontend and C#/.NET 8 on the backend, targeting Ionic Capacitor for native mobile deployment and browser output for future Emphasys product integration.

## Languages

- **Frontend**: TypeScript (strict mode, no `any`)
- **Backend**: C# (.NET 8)

TypeScript provides type safety across the Angular/Ionic ecosystem. C# is the existing Emphasys platform language with strong EF Core and SignalR support.

## Framework

- **Frontend**: Ionic 7 + Angular 17+
- **Mobile runtime**: Capacitor (iOS/Android native)
- **Backend**: ASP.NET Core (.NET 8 Web API)
- **Real-time**: SignalR hub at `/hubs/case`

Ionic provides the mobile chrome only (navigation bar, page transitions, tab bar). All content screens are plain Angular components + CSS. Ionic overlay components (`IonModal`, `IonActionSheet`, `IonAlert`) are prohibited — use Angular overlays instead.

## Authentication

ASP.NET Core Identity + JWT

Hackathon build: JWT stored in `localStorage`, six pre-seeded accounts — `staff@hfa.demo`, `gc@maplestreet.demo`, `inspector@demo.com`, `owner@riverbend.demo`, `lender@elmwood.demo`, `architect@demo.com` (architect is pre-seeded but added to Case 1 live during the demo). No registration flow. Before any production build: migrate token storage to `@capacitor/preferences`.

## Infrastructure & Deployment

- **Development**: SQL Server LocalDB, .NET dev server on `http://localhost:5000`, Ionic dev server (browser via `ionic serve`)
- **Production**: TBD (out of scope for hackathon)

## Package Manager

npm (Ionic/Angular standard; managed under `/client`)

## Decision Relationships

- Ionic is shell-only — never use Ionic overlays for content; use Angular overlays
- SignalR is load-bearing: broadcasts `ItemUpdated`, `EventAdded`, `ParticipantAdded` on every state change
- No polling fallback — SignalR hub is the sole notification mechanism for the demo
- JWT in localStorage is a deliberate hackathon shortcut — must migrate before production
