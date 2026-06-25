---
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
created: 2026-06-25T00:00:00Z
last_updated: 2026-06-25T23:59:00Z
---

# Construction Log: 006-milestone-prereq-flow

## Original Plan

**From Inception**: 2 bolts planned
**Planned Date**: 2026-06-24T00:00:00Z

| Bolt ID | Stories | Type |
|---------|---------|------|
| 007 | S1, S4 | simple-construction-bolt |
| 008 | S2, S3, S5 | simple-construction-bolt |

## Replanning History

| Date | Action | Change | Reason | Approved |
|------|--------|--------|--------|----------|

## Current Bolt Structure

| Bolt ID | Stories | Status | Changed |
|---------|---------|--------|---------|
| 007 | S1 (hfa-actions-panel), S4 (participant-status-panel) | ✅ complete | - |
| 008 | S2 (accept-and-return), S3 (trigger-document-request), S5 (milestone-auto-advance) | ✅ complete | - |

## Execution History

| Date | Bolt | Event | Details |
|------|------|-------|---------|
| 2026-06-25T00:00:00Z | 007 | started | Stage 1: Plan |
| 2026-06-25T00:00:00Z | 007 | stage-complete | Plan → Implement |
| 2026-06-25T00:00:00Z | 007 | stage-complete | Implement → Test |
| 2026-06-25T00:00:00Z | 007 | completed | All 3 stages done |
| 2026-06-25T14:30:00Z | 008 | started | Stage 1: Plan |
| 2026-06-25T14:35:00Z | 008 | stage-complete | Plan → Implement |
| 2026-06-25T14:45:00Z | 008 | stage-complete | Implement → Test |
| 2026-06-25T15:00:00Z | 008 | completed | All 3 stages done |
| 2026-06-25T23:59:00Z | 007 | post-bolt fixes | Gap analysis + UX improvements applied after completion (see Notes) |
| 2026-06-25T22:00:00Z | 018 | started | Stage 1: Plan |
| 2026-06-25T22:30:00Z | 018 | stage-complete | Plan → Implement: prereq-display-status util + badge refactor + panel updates |
| 2026-06-25T23:00:00Z | 018 | stage-complete | Implement → Test: 319/325 passing (6 pre-existing Realtime failures) |

## Execution Summary

| Metric | Value |
|--------|-------|
| Original bolts planned | 2 |
| Current bolt count | 2 |
| Bolts completed | 2 |
| Bolts in progress | 0 |
| Bolts remaining | 0 |
| Replanning events | 0 |

## Notes

Bolt 007 covers display-only panels (no mutations). Bolt 008 wires all status mutations and milestone auto-advance.

### Post-Bolt 007 Gap Fixes (2026-06-25)

Applied after bolt completion via gap analysis against story ACs:

- **HFA Actions Panel**: was only showing the active milestone; fixed to iterate all milestones with full timeline. Completed/upcoming milestones show flat prereq rows (title + status badge). Active milestone retains the prereq accordion with action button placeholders.
- **Milestone accordion (both panels)**: added milestone-level collapse/expand. Active milestone expands by default; completed/upcoming start collapsed. Chevron rotates on toggle. Uses `expandedMilestoneIds = computed<Set<string>>()` derived from `userToggledIds` signal — no effect() needed.
- **Participants tab disclaimer**: added "Added participants get an email invitation and can view the case & respond to items assigned to them." below the Add Participant button (story 005 AC).
- **Remove confirmation**: now reads "Remove [name]?" using `displayLabel(p)` instead of a generic "Remove?" (story 005 AC).
- All fixes committed in `77153e4`. Tests: 198/198 passing.
