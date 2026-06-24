---
name: tech-stack
description: Technology stack for Emphasys Connect v2 — Supabase backend, Ionic/Angular frontend
metadata:
  type: reference
---

# Tech Stack

## Overview

Emphasys Connect is a mobile-first web application using TypeScript/Angular on the frontend and Supabase as the full backend (database, auth, real-time, edge functions). Ionic Capacitor targets native iOS/Android; the web output integrates with future Emphasys products.

## Languages

- **Frontend**: TypeScript (strict mode, no `any`)
- **Backend logic**: TypeScript (Supabase Edge Functions, Deno runtime)

## Frontend Framework

- **Shell**: Ionic 7
- **App framework**: Angular 17+
- **Mobile runtime**: Capacitor (iOS/Android native)

Ionic provides the mobile chrome only (navigation bar, page transitions, tab bar). All content screens are plain Angular components + CSS. Ionic overlay components (`IonModal`, `IonActionSheet`, `IonAlert`) are prohibited — use Angular overlays or plain CSS toggles.

## Backend: Supabase

| Service | Role |
|---|---|
| PostgreSQL | Primary database (hosted on Supabase, deployed to Azure for Emphasys clients) |
| Supabase Auth | Passwordless OTP — email → 6-digit code |
| Supabase Realtime | Live channel subscriptions per case (replaces SignalR) |
| Supabase Edge Functions | Server-side logic: notification triggers, IMC import orchestration |
| Supabase Storage | NOT used — documents live in eDocs |

## Authentication

Passwordless via Supabase Auth:
1. User enters email address
2. Supabase sends a 6-digit OTP to that email
3. User enters code → authenticated session

HFA accounts carry a custom `is_hfa` flag in the Supabase `auth.users` metadata, set manually by Emphasys IT. Only `is_hfa: true` accounts can import cases and take HFA actions. Any valid email can receive an account — users with no cases see an empty state.

**Hackathon**: Pre-create two accounts (`staff@hfa.demo`, `developer@demo.com`). OTP delivery may be simulated.

## External Integrations

- **IMC** — Emphasys back-office system. Source of truth for projects, milestones, and prerequisites. Cases are imported from IMC; the app never creates case structure.
- **eDocs** — Emphasys document storage. The app generates upload links that write directly to eDocs. The app never stores files.

In v1 (hackathon), both integrations may be **stubbed by engineering** with seeded data. The UI surfaces (Import-from-IMC picker, eDocs upload interface) are still designed and built; the actual API/DB connections are incrementally added.

## Hosting

- **Development**: Supabase local (`supabase start`), Ionic dev server (`ionic serve`)
- **Production**: Azure (Emphasys-managed clients; direct Supabase DB connection, no API proxy needed in v1)

## Package Manager

npm (Ionic/Angular standard, managed under `/client`)

## Key Constraints

- Supabase Realtime is the sole mechanism for live UI updates — no polling fallback
- All Supabase calls use generated typed client (`Database` types from `supabase gen types typescript`)
- `hfa_id` on every table from day one; RLS policies enforced from day one (not mocked)
- Supabase anon key and service role key must not be committed — use environment files excluded by `.gitignore`
