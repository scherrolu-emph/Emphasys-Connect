---
stage: plan
bolt: "018"
created: 2026-06-25T22:00:00Z
---

## Implementation Plan: Prerequisite Status Updates (Bolt 018)

### Objective

Two prerequisite display improvements using display-layer logic only: (1) "Not Ready" for prerequisites belonging to non-active milestones, (2) accurate status labels — "Submitted - Under Review", "Deficiency" — in place of the current "Pending" / "Received — Under Review".

---

### Current State (from codebase audit)

- **`PrereqStatusBadgeComponent`** — accepts `status: PrereqStatus` input; labels are `'Pending'` / `'Received — Under Review'` / `'Accepted'`
- **HFA Actions Panel** — passes `prereq.status` directly to the badge; shows action buttons based on `prereq.status`
- **Developer Status Panel** — passes `prereq.status` to badge; shows upload link when `status === 'pending_open'`
- **`returned: boolean`** — already exists on the `prerequisites` DB table, TypeScript types, `PrerequisiteSummary` interface, and `returnWithNote()` already sets it to `true`
- **No DB migration needed** — `returned` is fully wired

---

### Deliverables

1. **`prereq-display-status.util.ts`** — new pure utility  
   Path: `client/src/app/core/cases/prereq-display-status.util.ts`  
   Exports `getDisplayStatus(prereq: PrerequisiteSummary, milestoneStatus: MilestoneStatus): DisplayPrereqStatus`  
   Mapping:
   - `milestoneStatus !== 'active'` → `'not_ready'`
   - `prereq.status === 'received_processing'` → `'submitted_under_review'`
   - `prereq.status === 'pending_open' && prereq.returned` → `'deficiency'`
   - `prereq.status === 'pending_open'` → `'pending'`
   - `prereq.status === 'accepted'` → `'accepted'`

2. **Updated `PrereqStatusBadgeComponent`**  
   Path: `client/src/app/components/prereq-status-badge/prereq-status-badge.component.ts`  
   - Change input from `status: PrereqStatus` to `displayStatus: DisplayPrereqStatus`
   - New label map: `not_ready → 'Not Ready'`, `pending → 'Pending'`, `deficiency → 'Deficiency'`, `submitted_under_review → 'Submitted - Under Review'`, `accepted → 'Accepted'`
   - New CSS class map: `not_ready → 'badge badge-muted'`, `deficiency → 'badge badge-danger'`, others unchanged

3. **Updated HFA Actions Panel**  
   Path: `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.ts`  
   - Accept `milestones` with their `status` field (already available via `CaseDetailStore`)
   - For each prereq, compute `displayStatus = getDisplayStatus(prereq, milestone.status)` — either in component or inline in template via a helper method
   - Pass `[displayStatus]="..."` to `<app-prereq-status-badge>`
   - Wrap action buttons in `@if (displayStatus !== 'not_ready')` so they hide for non-active prereqs

4. **Updated Developer Status Panel**  
   Path: `client/src/app/components/participant-status-panel/participant-status-panel.component.ts`  
   - Compute `displayStatus` per prereq using `getDisplayStatus`
   - Pass `[displayStatus]` to badge
   - Hide upload link when `displayStatus === 'not_ready'`
   - Add `not-ready` CSS class to prereq row when `displayStatus === 'not_ready'` for visual de-emphasis

5. **`prereq-display-status.util.spec.ts`** — unit tests for all 5 mapping cases  
   Path: `client/src/app/core/cases/prereq-display-status.util.spec.ts`

---

### Dependencies

- No DB migration — `returned` column already exists
- No new Supabase queries — purely display-layer
- `CaseDetailStore` milestone signals already include `status` field

---

### Technical Approach

**Single helper function** — `getDisplayStatus` is a pure function with no side effects. It takes the minimal data it needs and returns a typed string. Both panels import and call it; no shared state needed.

**Badge refactor** — the badge's input type changes from the raw DB status to `DisplayPrereqStatus`. All callers must pass the computed display status. The badge has no knowledge of milestones or the `returned` flag.

**Template pattern in both panels:**
```
prereqDisplayStatus(prereq, milestone.status)
  → pass to [displayStatus] on badge
  → guard action buttons / upload links with @if
```

**Realtime path** — when a milestone activates via Realtime, `CaseDetailStore` updates the milestone's `status` signal. Both panels re-render because they bind to the store's signals — `getDisplayStatus` re-runs automatically, transitioning "Not Ready" prereqs to their real status without any additional wiring.

---

### Acceptance Criteria

- [ ] Non-active milestone prereqs show "Not Ready" in both HFA and Developer panels
- [ ] HFA action buttons hidden for "Not Ready" prereqs
- [ ] Developer upload link hidden and row visually muted for "Not Ready" prereqs
- [ ] `received_processing` prereq shows "Submitted - Under Review" (not "Received — Under Review")
- [ ] `pending_open` + `returned: true` shows "Deficiency"
- [ ] `pending_open` + `returned: false` shows "Pending"
- [ ] `accepted` continues to show "Accepted"
- [ ] Realtime milestone activation: "Not Ready" prereqs update to real status without refresh
- [ ] Unit tests pass for all 5 `getDisplayStatus` cases
- [ ] `ng test` suite passes (no regressions)
