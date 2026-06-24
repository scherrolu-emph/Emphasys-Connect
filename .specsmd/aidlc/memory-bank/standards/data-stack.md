# Data Stack

## Overview

SQL Server LocalDB for development with EF Core 8 as the ORM. Multi-tenancy is structural via `hfa_id` on every entity (row-level enforcement is mocked for v1 but the schema is designed to add it without migrations).

## Database

SQL Server LocalDB (development)

The existing Emphasys platform database engine. Every entity carries `hfa_id` from day one for multi-tenant isolation. **Exception**: `User.hfa_id` is nullable — `null` means external partner (GC, inspector, lender, etc.); non-null means HFA staff. Items are never hard-deleted — `Item.is_cancelled` (boolean) flips to `true` with a `cancelled_at` timestamp; cancelled items remain in the record with full history, struck through in the UI, and excluded from counts.

## ORM / Database Client

EF Core 8

Integrated with .NET 8. Handles migrations, seeding, and LINQ-based queries. CRITICAL: migrations are append-only — never modify an existing migration file, always add a new one.

## Decision Relationships

- `hfa_id` is required on every new entity except `User` (where it is nullable to distinguish external partners from HFA staff)
- All item mutations must write an `ActivityEvent` row in the **same EF transaction** — no mutation without an audit trail
- Every item mutation must also broadcast via SignalR in the same request (after the DB transaction commits)
- EF migration files under `server/Data/Migrations/` are immutable once committed
