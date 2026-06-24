---
id: 001-activity-feed-screen
unit: 010-activity-feed
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-activity-feed-screen

## User Story
**As any** authenticated user (HFA or participant)
**I want** to see a chronological feed of everything that has happened across all my cases
**So that** I can stay informed about case progress without opening each case individually

## Acceptance Criteria
- [ ] **Given** the bottom navigation bar, **When** any authenticated user views it, **Then** an "Activity" tab is shown as the third tab (HFA: Cases | My Tasks | Activity; Participant: My Cases | My Tasks | Activity)
- [ ] **Given** the user taps "Activity", **When** the screen renders, **Then** `ActivityService.getActivity(currentUserId)` is called and results are displayed newest-first
- [ ] **Given** the activity feed renders, **When** items exist, **Then** each row shows:
  - Event description (message body — truncated to 2 lines with ellipsis)
  - Case name (secondary label, e.g. "Riverside Commons")
  - Relative timestamp (e.g. "2 hours ago")
  - A visual distinction between system events (muted style, small icon) and manual messages (standard style with author name)
- [ ] **Given** an activity row is tapped, **When** the tap fires, **Then** the app navigates to `/cases/{caseId}` for that item
- [ ] **Given** no activity exists (user has no cases or no messages), **When** the screen renders, **Then** an empty state is shown: "No activity yet"
- [ ] **Given** a new event occurs on any of the user's cases (via Realtime), **When** the broadcast arrives, **Then** the new item is prepended to the top of the feed without a page refresh
- [ ] **Given** the screen is loading, **When** the initial query is in flight, **Then** skeleton rows are shown

## Technical Notes
- Route: `/activity`; third tab in `IonTabBar` for both HFA and Participant personas
- `ActivityItem` interface: `{ messageId, body, messageType: 'system' | 'manual', authorName?: string, caseId, caseName, createdAt }`
- `ActivityService.getActivity(userId: string): Promise<ActivityItem[]>` — Supabase join:
  ```
  conversation_messages
    JOIN cases ON cases.id = conversation_messages.case_id
    JOIN case_participants ON case_participants.case_id = cases.id
      AND case_participants.user_id = userId
  ORDER BY conversation_messages.created_at DESC
  LIMIT 50
  ```
- `activities = signal<ActivityItem[]>([])`
- Realtime: reuse `RealtimeService` case channel subscriptions; on new `conversation_messages` INSERT for any of the user's cases, prepend to `activities` signal: `.update(prev => [newItem, ...prev])`
- System message row: muted background, small lightning/gear icon, no author name
- Manual message row: standard background, author display name shown above body
- Relative timestamp: use a simple helper (e.g. `formatDistanceToNow` equivalent — implement without date-fns dependency)
- `IonSkeletonText` for loading state; `@for (item of activities(); track item.messageId)` loop

## Dependencies
### Requires
- `007/001-thread-rendering` (message model: system vs manual types already defined)
- `002/003-post-login-routing` (nav shell must include the "Activity" tab)
### Enables
- None — navigates to existing case detail screen

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| A new Realtime event arrives while user is mid-scroll | New item prepended to top; user is not auto-scrolled away from current position |
| Activity body is very long | Truncated at 2 lines with "…"; full text visible inside the case conversation thread |
| User has activity from 20+ cases | Initial 50 items shown; oldest events drop off the bottom; no infinite scroll for hackathon |
| User taps an activity item for a case they no longer participate in | RLS blocks case detail data load; case detail shows "Not found" empty state |

## Out of Scope
- Filtering activity by case or event type
- Marking individual activity items as read
- Pagination / infinite scroll (first 50 items only for hackathon)
- Push notifications
