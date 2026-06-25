---
stage: plan
bolt: "013"
created: 2026-06-25T00:00:00Z
---

## Implementation Plan: Activity Feed

### Objective
Add the "Activity" tab (third tab for both HFA and Participant) with a cross-case, newest-first event feed drawn from `conversation_messages`. Live Realtime updates prepend items; tapping a row deep-links to the relevant case detail.

### Deliverables
- `ActivityItem` interface in `client/src/app/core/activity/activity.model.ts`
- `timeAgo()` helper in the same file
- `ActivityService.getActivity(userId)` in `client/src/app/core/activity/activity.service.ts`
- `BottomNavComponent` in `client/src/app/components/bottom-nav/bottom-nav.component.ts`
- `ActivityPage` at route `/activity` in `client/src/app/pages/activity/`
- Extend `RealtimeService` with `activityMessage$` Subject
- Add `/activity` route to `app.routes.ts`
- Add `<app-bottom-nav>` to `DashboardPage` (HFA) and `MyCasesPage` (Participant)

### Dependencies
- `RealtimeService` (Unit 007): existing case channel subscriptions; extended, not replaced
- `conversation_messages` + `cases` + `case_participants` tables (Unit 001)
- `profiles` table: display names for manual messages
- `AuthService`: `currentUser()` and `isHfa` signal
- HFA nav shell (`/dashboard`) + Participant nav shell (`/my-cases`)

### Technical Approach
- `ActivityService.getActivity(userId)`: two-step Supabase query
  1. `case_participants` WHERE `user_id = userId` joined to `cases(id, title)` → caseIds + caseNameMap
  2. `conversation_messages` WHERE `case_id IN (caseIds)` ORDER BY `created_at DESC` LIMIT 50
  3. `profiles` for manual-message author display names (batched, single query)
- `RealtimeService`: add `private _activityMessage Subject<ActivityMessageEvent>` exposed as `activityMessage$`; fire on every `conversation_messages` INSERT across any subscribed channel
- `ActivityPage`: on init, calls `getActivity()` then iterates unique caseIds and calls `subscribeToCase()` with `onMessage` callback; on destroy, calls `unsubscribe()` for each
- `BottomNavComponent`: fixed bottom nav bar using plain CSS + `ion-icon`; `isHfa` input drives tab 1 (Cases vs My Cases); tabs 2–3 are always My Tasks + Activity
- Content padding: pages with `<app-bottom-nav>` set `--padding-bottom: 60px` on `ion-content`

### Acceptance Criteria
- [ ] "Activity" tab visible in bottom nav for both HFA and Participant as third tab
- [ ] Feed shows conversation_messages across all user's cases, newest first (LIMIT 50)
- [ ] Each row: event description (2-line truncated), case name, relative timestamp
- [ ] System events use muted background; manual messages show author name
- [ ] Tap any row → navigates to /cases/{caseId}
- [ ] Empty state: "No activity yet" when no messages exist
- [ ] Realtime INSERT on subscribed case channels prepends item live
- [ ] IonSkeletonText shown while initial query is in flight
