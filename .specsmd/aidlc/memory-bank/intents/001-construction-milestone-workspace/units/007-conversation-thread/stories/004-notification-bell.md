---
id: 004-notification-bell
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 004-notification-bell

## User Story
**As a** any case participant
**I want** to see how many unread messages are in the case thread since my last visit
**So that** I can quickly identify active cases with new activity without opening each one

## Acceptance Criteria
- [ ] **Given** the user opens the case detail screen, **When** messages exist with `created_at` after the user's `last_viewed_at` for this case, **Then** the bell icon in the case header shows a badge with the unread count
- [ ] **Given** the unread count is 0, **When** the bell renders, **Then** the badge is hidden (not shown as "0")
- [ ] **Given** the user opens the case detail screen, **When** `ionViewDidEnter` fires, **Then** `last_viewed_at` is updated to now and the unread count resets to 0 immediately in the UI without a page refresh
- [ ] **Given** a new Realtime message arrives while the user has the case open, **When** the message lands, **Then** the bell count does not increment (user is already viewing the case)

## Technical Notes
- `last_viewed_at` stored per user per case; a `case_reads` Supabase table is the preferred approach; localStorage is acceptable for the hackathon
- `computed()` signal derived from `CaseDetailStore.messages` filtered by `created_at > lastRead`
- Bell icon uses `IonIcon` with an `IonBadge` overlay
- Update `last_viewed_at` in `ionViewDidEnter` to avoid flash of stale count

## Dependencies
### Requires
- `001-thread-rendering`
### Enables
- None

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User's `last_viewed_at` is null (first visit) | All messages counted as unread; `last_viewed_at` set on first open |
| User opens the case in two browser tabs simultaneously | Each tab updates `last_viewed_at` independently; second update is a no-op (same or later timestamp) |
| Clock skew between client and Supabase server | Use server-side `now()` for `last_viewed_at` writes; compare against server timestamps |

## Out of Scope
- Unread counts shown on the cases list screen (separate feature)
- Per-message read receipts
- Push notification badge on native app icon
