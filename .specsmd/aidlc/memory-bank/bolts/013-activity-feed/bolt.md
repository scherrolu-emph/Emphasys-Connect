---
id: "013"
unit: 010-activity-feed
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-activity-feed-screen
created: 2026-06-24T00:00:00Z
requires_bolts: ["009", "010"]
enables_bolts: []
requires_units: []
blocks: false
complexity:
  estimate: low
  reason: Read-only join query; Realtime reuses existing case channel subscriptions already wired in Unit 007
---

# Bolt 013 — Activity Feed: Cross-Case Event Log

## Objective

Add the "Activity" tab (third tab for both personas) with a cross-case, newest-first event feed drawn from `conversation_messages`. New events prepend to the feed live via Realtime; tapping any row deep-links to the relevant case detail.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-activity-feed-screen | Cross-case event feed, Realtime prepend, deep link | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Route: `/activity`; add as third `IonTabButton` in `IonTabBar` for both HFA and Participant nav shells
- `ActivityItem` interface: `{ messageId, body, messageType, authorName?, caseId, caseName, createdAt }`
- `ActivityService.getActivity(userId)`: join `conversation_messages` + `cases` + `case_participants`; ORDER BY `created_at DESC` LIMIT 50
- Consider Supabase RPC `get_activity_feed(user_id)` if join is verbose
- Realtime: on any `conversation_messages` INSERT for the user's cases, prepend new `ActivityItem` to signal
- Two visual styles: system (muted, icon) vs manual (standard, author name)

### Stage 2: Implement
- `ActivityFeedComponent` at route `/activity`
- `ActivityService.getActivity(userId)` — Supabase join query
- `activities = signal<ActivityItem[]>([])`; `isLoading = signal(true)`
- `@for (item of activities(); track item.messageId)` loop
- System row: `IonItem` with muted background, small icon, no author; body truncated at 2 lines
- Manual row: `IonItem` with author name above body, truncated at 2 lines
- Relative timestamp helper function (no external dependency)
- Empty state: centered icon + "No activity yet"
- `IonSkeletonText` loading rows
- Extend `RealtimeService` to prepend new messages from existing case subscriptions to `ActivityFeedComponent` via a shared signal or service observable
- Add "Activity" `IonTabButton` to both HFA nav shell and Participant nav shell (tab order: Cases/My Cases → My Tasks → Activity)

### Stage 3: Test
- Log in as HFA → Activity tab shows events from all HFA's cases newest-first
- Log in as Participant → Activity tab shows events from participant's cases
- Post a message from second browser → Activity feed in first browser prepends the new item live
- Tap any activity row → navigates to correct case detail
- Empty state: new user with no cases sees "No activity yet"
- System events (e.g. "HFA approved Draw Request Form") use muted style; manual messages show author name
