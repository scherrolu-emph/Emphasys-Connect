---
id: 002-message-composer
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-message-composer

## User Story
**As a** any case participant
**I want** to send a manual message to the conversation thread
**So that** I can communicate with the other party directly inside the case without switching to email

## Acceptance Criteria
- [ ] **Given** the Conversations tab is active, **When** rendered for any authenticated participant, **Then** a text input field and "Send" button are always visible at the bottom of the Conversation panel — the composer is never hidden or collapsed
- [ ] **Given** the user types a message and presses "Send", **When** the send action fires, **Then** a `manual` message row is inserted in `conversation_messages` and the message appears in the thread for the sender immediately (optimistic update)
- [ ] **Given** an optimistic message is in the thread, **When** the Supabase insert confirms, **Then** the message remains; if the insert fails, the optimistic message is removed and an error toast is shown
- [ ] **Given** the counterpart is viewing the same case, **When** the sender sends a message, **Then** the message appears in the counterpart's thread via Realtime without any page refresh
- [ ] **Given** the text input is empty, **When** the user views the composer, **Then** the "Send" button is disabled
- [ ] **Given** the user presses Enter, **When** the input is focused and not empty, **Then** the message is sent; Shift+Enter inserts a newline instead

## Technical Notes
- `MessageService.sendMessage(caseId, body)` handles the Supabase insert
- Optimistic update: push a provisional message object to `CaseDetailStore.messages` signal before the async call resolves; replace or remove on settle
- Use `IonTextarea` with `autoGrow: true` or a native `<textarea>` with CSS auto-grow
- Key event listener: `(keydown.enter)` with `$event.shiftKey` check

## Dependencies
### Requires
- `001-thread-rendering`
### Enables
- `003-mention-autocomplete-and-notification`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User sends a message and immediately navigates away | Optimistic message is in-flight; no rollback needed if write succeeds asynchronously |
| Message body is only whitespace | Treated as empty; Send disabled after trim check |
| Very long message (>2000 chars) | Client-side cap at 2000 chars; character counter shown at 1800+ |

## Out of Scope
- File attachments
- Message formatting (bold/italic)
- Read receipts per message
