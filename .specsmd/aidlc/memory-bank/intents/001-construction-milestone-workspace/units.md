---
intent: 001-construction-milestone-workspace
phase: inception
status: units-defined
updated: 2026-06-24T00:00:00Z
---

# Units: Construction Milestone Workspace

## Summary

| Metric | Count |
|--------|-------|
| Total Units | 7 |
| Frontend Feature Units | 7 |
| Backend Service Units | 0 (Supabase BaaS — schema + RLS in Unit 001) |

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Passwordless Authentication | `002-auth-screens` |
| FR-2 | HFA Dashboard — Case List | `003-hfa-dashboard` |
| FR-3 | Import Case from IMC | `004-case-import` |
| FR-4 | Case Detail — HFA Two-Panel View | `005-case-detail-shell` |
| FR-5 | Case Detail — Developer View | `005-case-detail-shell` |
| FR-6 | Milestone Status Flow | `006-milestone-prereq-flow` |
| FR-7 | Prerequisite Status Flow — Document Submission | `006-milestone-prereq-flow` |
| FR-8 | Prerequisite Status Flow — Acceptance Comment | `006-milestone-prereq-flow` |
| FR-9 | Manual Messaging (HFA ↔ Developer) | `007-conversation-thread` |
| FR-10 | Supabase Realtime — Live Thread Updates | `001-workspace-foundation` |
| FR-11 | @-Mentions and Notification Bell | `007-conversation-thread` |

## Units

| # | Unit | Purpose | Dependencies | FRs |
|---|------|---------|--------------|-----|
| 001 | `workspace-foundation` | Supabase schema + RLS + seed data, Angular app shell, routing, Ionic shell, AuthService, RealtimeService | None | FR-10 |
| 002 | `auth-screens` | Passwordless OTP screens, session guards, empty state | 001 | FR-1 |
| 003 | `hfa-dashboard` | Case list screen, overdue indicators, type filter | 001, 002 | FR-2 |
| 004 | `case-import` | IMC picker screen, confirm screen, case creation in Supabase | 001, 002, 003 | FR-3 |
| 005 | `case-detail-shell` | Two-panel case detail layout, HFA/Developer variants, mobile reflow, milestone progress + prereq list rendering | 001, 002 | FR-4, FR-5 |
| 006 | `milestone-prereq-flow` | Milestone/prereq status transitions, upload link generation, accept/return actions, system message writes | 005 | FR-6, FR-7, FR-8 |
| 007 | `conversation-thread` | Thread rendering, manual message composer, @-mention autocomplete, notification bell, Realtime subscription | 005 | FR-9, FR-11 |

## Dependency Graph

```
001-workspace-foundation
        │
        ├──► 002-auth-screens
        │           │
        │           ├──► 003-hfa-dashboard ──► 004-case-import
        │           │
        │           └──► 005-case-detail-shell
        │                       │
        │                       ├──► 006-milestone-prereq-flow
        │                       │
        │                       └──► 007-conversation-thread
```

## Build Order (hackathon recommended)

**Dev 1 path**: 001 → 004 (IMC import + schema) → 006 (milestone/prereq actions)  
**Dev 2 path**: 002 (auth) → 003 (dashboard) → 005 (case detail shell) → 007 (conversation thread)

Sync point: after Unit 001 is complete (shared Supabase schema + types).
