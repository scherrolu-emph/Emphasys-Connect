---
id: 001-thread-rendering
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 001-thread-rendering

## User Story
**As a** any case participant
**I want** to see the full conversation thread with system events and manual messages interleaved in chronological order
**So that** I can follow the case history in a single timeline without switching between views

## Acceptance Criteria
- [ ] **Given** the Conversation panel is rendered, **When** messages exist, **Then** they are displayed in chronological order (oldest first, newest at bottom)
- [ ] **Given** the message list, **When** a system message is rendered, **Then** it uses a muted background, a small system icon, and terse body text (e.g. "HFA accepted Draw Request Form")
- [ ] **Given** the message list, **When** a manual message is rendered, **Then** it shows the author's display name, contact role (e.g. "HFA Staff"), timestamp, and body
- [ ] **Given** the Conversation panel loads, **When** the initial fetch completes, **Then** the thread auto-scrolls to the bottom so the newest message is visible
- [ ] **Given** the conversation has more than 50 messages, **When** the panel renders, **Then** a "Load earlier messages" button is shown at the top; tapping it fetches the previous page and prepends those messages

## Technical Notes
- Reads `CaseDetailStore.messages` signal
- `@for (msg of messages(); track msg.id)` loop
- Separate presentational components: `SystemMessageComponent` and `ManualMessageComponent`
- Auto-scroll uses `ElementRef` + `scrollIntoView({ behavior: 'instant' })` after initial render
- Pagination uses Supabase range query with offset; prepend to signal with `.update(prev => [...olderMessages, ...prev])`

## Dependencies
### Requires
- `005/004-data-loading-and-realtime`
### Enables
- `002-message-composer`
- `003-mention-autocomplete-and-notification`
- `004-notification-bell`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Thread has exactly 50 messages | "Load earlier messages" button not shown (no next page) |
| User is at mid-scroll when a new Realtime message arrives | Auto-scroll only triggers if user was already at the bottom; otherwise a "New messages" nudge appears |
| System message body is very long | Truncated at 120 chars with "…" expand toggle |

## Out of Scope
- Message editing or deletion
- Reactions
- File attachments
- Threaded replies (activity log folding is post-hackathon)
