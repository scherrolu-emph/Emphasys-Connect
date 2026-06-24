---
id: 002-overdue-visual-state
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-overdue-visual-state

## User Story
**As an** HFA staff member
**I want** overdue cases to be visually flagged on the dashboard list
**So that** I can immediately identify which cases need urgent attention without reading every row

## Acceptance Criteria
- [ ] **Given** a case has an active milestone whose `activated_at + target_days` is in the past and the milestone status is not `completed`, **When** the case list renders, **Then** the case row has a red left border and a red badge showing the count of overdue prerequisites
- [ ] **Given** a case has no overdue prerequisites, **When** the case list renders, **Then** no red indicators appear on that row
- [ ] **Given** the overdue calculation runs, **When** the cases signal updates (e.g. after pull-to-refresh), **Then** overdue states are recomputed from the refreshed data without a page reload
- [ ] **Given** a milestone has `target_days = null` (no deadline set), **When** the overdue check runs, **Then** the milestone is never treated as overdue
- [ ] **Given** the milestone status is `completed`, **When** the overdue check runs, **Then** the milestone is never treated as overdue regardless of date

## Technical Notes
- Pure function `isOverdue(milestone: MilestoneSummary): boolean` placed in a shared utility file: `return milestone.targetDays !== null && milestone.status !== 'completed' && (new Date(milestone.activatedAt).getTime() + milestone.targetDays * 86_400_000) < Date.now()`
- `overdueCount(milestone)` counts prerequisites whose `status !== 'accepted'` when `isOverdue(milestone)` is true
- Red left border: CSS class `case-row--overdue` toggled via `[class.case-row--overdue]="isOverdue(c.activeMilestone)"` on the `IonItem`
- Red badge: `<ion-badge color="danger">` rendered with `@if (isOverdue(c.activeMilestone))`
- No server-side overdue field — computation is entirely client-side to keep the schema simple

## Dependencies
### Requires
- 001-case-list-screen

### Enables
- None (visual enhancement on top of case list)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| System clock is behind (device time incorrect) | Overdue state may not show; no special handling for v1 |
| Case transitions from overdue to on-time via pull-to-refresh | Red indicators removed after refresh without any animation |
| Multiple milestones overdue on the same case | Badge shows total overdue prerequisite count across all overdue milestones |
| `activated_at` is null (milestone not yet started) | `isOverdue` returns false; no red indicator |

## Out of Scope
- Server-side overdue notifications or alerts
- Overdue email/push notifications
- Per-prerequisite overdue indicators (only milestone-level aggregation shown on dashboard)
