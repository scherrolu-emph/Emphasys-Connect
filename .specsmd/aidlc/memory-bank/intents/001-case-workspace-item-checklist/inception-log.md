---
intent: 001-case-workspace-item-checklist
created: 2026-06-23T00:00:00Z
completed: null
status: in-progress
---

# Inception Log: 001-case-workspace-item-checklist

## Overview

**Intent**: Core shared case workspace — HFA Dashboard, Case Detail, Item Checklist, Threaded Notes/Questions, and SignalR real-time broadcasting.
**Type**: green-field
**Created**: 2026-06-23

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ | requirements.md |
| System Context | [ ] | system-context.md |
| Units | [ ] | units.md |
| Unit Briefs | [ ] | units/{unit-name}/unit-brief.md |
| Stories | [ ] | units/{unit-name}/stories/*.md |
| Bolt Plan | [ ] | memory-bank/bolts/ |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 10 |
| Non-Functional Requirements | 7 |
| Units | TBD |
| Stories | TBD |
| Bolts Planned | TBD |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| TBD — defined during units skill | — | — | — |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-06-23 | Include threads/notes in this intent | Threads are demo-critical (hero demo steps 4–6); tightly coupled to Item surface; same SignalR hub | Yes |
| 2026-06-23 | Include SignalR in this intent scope | Real-time is load-bearing; no polling fallback; same hub serves item mutations and thread posts | Yes |
| 2026-06-23 | Exclude participant add/invite | Separate concern; not required for core case workspace demo loop | Yes |
| 2026-06-23 | Exclude auth/login | Separate intent; pre-seeded JWT sufficient for this intent's scope | Yes |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| — | — | — | — |

## Ready for Construction

**Checklist**:
- [x] Requirements documented
- [ ] System context defined
- [ ] Units decomposed
- [ ] Stories created for all units
- [ ] Bolts planned
- [ ] Human review complete

## Next Steps

1. Define system context and boundaries
2. Decompose into units
3. Create stories per unit
4. Plan construction bolts

## Dependencies

- Auth/JWT must be available before this intent's API endpoints can be tested end-to-end (separate intent)
- Seed data must be applied before demo scenarios can be validated
