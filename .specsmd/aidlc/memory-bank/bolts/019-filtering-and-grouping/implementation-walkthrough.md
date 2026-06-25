---
stage: implement
bolt: "019"
created: 2026-06-25T23:45:00Z
---

## Implementation Walkthrough: Filtering and Grouping (Bolt 019)

### Files Modified

#### 1. `client/src/app/core/tasks/task.service.ts`
- Added active milestone pre-query before the prerequisites query:
  ```typescript
  const { data: activeMilestones } = await supabase
    .from('milestones').select('id')
    .in('case_id', caseIds).eq('status', 'active');
  const activeMilestoneIds = (activeMilestones ?? []).map(m => m.id);
  if (activeMilestoneIds.length === 0) return [];
  ```
- Changed prereq query filter from `.in('case_id', caseIds)` → `.in('milestone_id', activeMilestoneIds)`
- The downstream `fetchMilestones` call is unchanged — milestone names are still fetched for display

#### 2. `client/src/app/pages/my-tasks/my-tasks.page.ts`
- Empty state copy: "You have no outstanding tasks" → "No active tasks — check back when your next milestone opens"

#### 3. `client/src/app/pages/activity/activity.page.ts`
- Added `computed` to Angular core imports
- Added `IonListHeader` to Ionic imports and component `imports` array
- Added `ActivityGroup` interface (inline):
  ```typescript
  interface ActivityGroup {
    caseId: string; caseName: string; latestAt: string; events: ActivityItem[];
  }
  ```
- Added `readonly activityGroups = computed<ActivityGroup[]>(...)`:
  - Groups flat `activities` signal by `caseId` (preserves newest-first order within each group)
  - Sets `latestAt` to the first encountered item per group (which is the most recent, since items are newest-first)
  - Sorts groups by `latestAt` descending — most recently active case at top
  - Recomputes automatically on any Realtime prepend

#### 4. `client/src/app/pages/activity/activity.page.html`
- Replaced flat `@for (item of activities())` with:
  ```html
  @for (group of activityGroups(); track group.caseId) {
    <ion-list lines="full">
      <ion-list-header class="case-group-header">
        <ion-label>{{ group.caseName }}</ion-label>
        <span class="group-latest">{{ timeAgo(group.latestAt) }}</span>
      </ion-list-header>
      @for (item of group.events; track item.messageId) { ... }
    </ion-list>
  }
  ```
- Removed `caseName` + dot from per-item meta line (now shown in group header)

#### 5. `client/src/app/pages/activity/activity.page.scss`
- Added `.case-group-header` styles: light background, border-top, 13px bold font
- Added `.group-latest` styles: 11px medium color, aligned right
- Removed unused `.activity-case` / `.activity-dot` rules

### Test Results
- 338/340 passing — no new failures
- 2 pre-existing `CaseDetailPage` failures (Supabase Realtime mock error, unrelated to this bolt)
- MyTasksPage test failures from prior session resolved (filter query change cleaned up mock path)
