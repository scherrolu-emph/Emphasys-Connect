---
id: 003-mention-autocomplete-and-notification
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 003-mention-autocomplete-and-notification

## User Story
**As a** any case participant
**I want** to @-mention another participant in a message and have them notified by email
**So that** I can directly flag a specific participant's attention without leaving the thread

## Acceptance Criteria
- [ ] **Given** the user is typing in the composer, **When** they type `@`, **Then** a participant picker popup opens immediately positioned above the input, listing all case participants by display name and role
- [ ] **Given** the popup is open, **When** the user continues typing after `@`, **Then** the participant list filters in real time to names matching the typed characters
- [ ] **Given** the popup is open, **When** the user selects a participant, **Then** `@[DisplayName]` is inserted into the message body at the cursor position and the popup closes
- [ ] **Given** the popup is open, **When** the user presses Escape or clicks outside the popup, **Then** the popup closes without inserting a token
- [ ] **Given** a message containing `@[DisplayName]` is sent, **When** the send action fires, **Then** the `dispatch-mention-notification` Edge Function is called with the mentioned participant's user ID and the message preview
- [ ] **Given** the Edge Function is called, **When** it executes, **Then** a notification email is dispatched (or logged only for hackathon) containing the case title and message preview

## Technical Notes
- Keydown listener on the composer textarea for the `@` character
- `computed()` signal filtering `CaseDetailStore.participants` based on characters typed after `@`
- Dropdown is positioned using CSS `position: absolute` relative to the composer container
- Parse `@[DisplayName]` tokens from the message body on send to identify mentioned user IDs
- Edge Function `dispatch-mention-notification`; email delivery may be logged-only for hackathon

## Dependencies
### Requires
- `002-message-composer`
### Enables
- None

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Mentioned participant is not a case participant at time of send | Token still inserted; Edge Function receives an unrecognised name and logs a warning without throwing |
| Two `@` tokens in one message | Both parsed; Edge Function called once per unique mentioned user |
| Participant display name contains special characters | Token uses exact display name; no sanitisation needed beyond HTML escaping in the rendered message |

## Out of Scope
- In-app push notifications
- SMS notifications
- Mention highlighting in the rendered message (post-hackathon)
