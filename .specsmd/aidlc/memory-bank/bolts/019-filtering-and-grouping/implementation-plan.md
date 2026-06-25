---
stage: plan
bolt: "019"
created: 2026-06-25T23:30:00Z
---

## Implementation Plan: Filtering and Grouping (Bolt 019)

### Objective

Two independent display improvements: (1) My Tasks filters to active-milestone prerequisites only, (2) Activity Feed groups events under case headers sorted by most-recent-case-first.

---

### Current State (from codebase audit)

**My Tasks**
- Query: `from('prerequisites').select('id, title, type, status, case_id, milestone_id').in('case_id', caseIds).eq('status', statusFilter)` — no milestone status filter
- Badge count: `TaskBadgeService.count` signal, set to `myTasks.length` after load in `my-tasks.page.ts`
- Empty state: "You have no outstanding tasks"
- Realtime: `subscribeToPrereqChanges(caseIds, callback)` → full reload on any prereq change

**Activity Feed**
- `ActivityItem` already has `caseId: string` and `caseName: string` ✅ — no query change needed
- Flat `activities` signal, rendered with a single `@for` loop
- Realtime prepend: `this.activities.update(prev => [newItem, ...prev])`
- No grouping currently

---

### Deliverables

#### 1. My Tasks — Active Milestone Filter

**`client/src/app/core/tasks/task.service.ts`**
- Before the prerequisites query, fetch active milestone IDs for the user's cases:
  ```
  from('milestones').select('id').in('case_id', caseIds).eq('status', 'active')
  ```
- If no active milestones → return `[]` immediately (skip prereq query)
- Add `.in('milestone_id', activeMilestoneIds)` to the existing prerequisites query
- Badge count auto-corrects (still set to `myTasks.length` after filter)

**`client/src/app/pages/my-tasks/my-tasks.page.ts` (template)**
- Update empty state text: "No active tasks — check back when your next milestone opens"

#### 2. Activity Feed — Group by Case

**`client/src/app/pages/activity/activity.page.ts`**
- Add `readonly activityGroups = computed(...)` derived from the existing flat `activities` signal
- Groups by `caseId`, sorts groups by `latestAt` descending (most-recently-active case first)
- Events within each group stay in their natural order (already newest-first from initial fetch + prepend)
- Realtime prepend (`[newItem, ...prev]`) continues to work unchanged — `activityGroups` recomputes automatically

New type (inline or in `activity.model.ts`):
```typescript
interface ActivityGroup {
  caseId: string;
  caseName: string;
  latestAt: string;
  events: ActivityItem[];
}
```

**`client/src/app/pages/activity/activity.page.html`**
- Replace flat `@for (item of activities())` with nested:
  ```
  @for (group of activityGroups(); track group.caseId) {
    <case-header>{{ group.caseName }} · last activity timeAgo(group.latestAt)</case-header>
    @for (item of group.events; track item.messageId) { ... }
  }
  ```

---

### Dependencies

- No schema changes
- No new Supabase queries for activity (grouping is client-side computed)
- One additional Supabase query for My Tasks (fetch active milestone IDs)

---

### Technical Approach

**My Tasks filter** — two-step query: fetch active milestone IDs first, then filter prereqs by those IDs. This avoids complex join syntax and is safe if the milestones table has no Supabase foreign-key join configured.

**Activity grouping** — `computed()` over flat `activities` signal. No changes to the Realtime handler; when a new event prepends to `activities`, `activityGroups` recomputes automatically and re-sorts. Zero extra complexity for real-time updates.

---

### Acceptance Criteria

- [ ] My Tasks shows only prerequisites from milestones where `status === 'active'`
- [ ] Prereqs from `open` or `completed` milestones are excluded
- [ ] My Tasks empty state reads "No active tasks — check back when your next milestone opens"
- [ ] Nav badge count reflects the filtered (active-milestone-only) task count
- [ ] Realtime milestone activation triggers My Tasks refresh showing newly active prereqs
- [ ] Activity Feed events are grouped under case name headers
- [ ] Groups are sorted by most-recent event (most active case at top)
- [ ] Events within each group are newest-first
- [ ] New Realtime event moves its case group to the top without page refresh
- [ ] Single-case scenario still shows the group header
- [ ] `ng test` — no new failures
