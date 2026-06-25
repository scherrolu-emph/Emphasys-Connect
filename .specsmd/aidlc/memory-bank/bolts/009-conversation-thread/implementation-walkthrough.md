---
stage: implement
bolt: 009-conversation-thread
created: 2026-06-25T00:00:00Z
---

## Implementation Walkthrough: Conversation Thread — Rendering + Composer

### Summary

Built the full conversation panel for the Case Detail page: a flat chronological thread of system and manual messages, plus a message composer with optimistic send and auto-scroll to bottom. The panel wires into both the mobile tab slot and the desktop right-panel slot via `ConversationPanelComponent`.

### Structure Overview

Six files implement the feature. Three presentational leaf components (`SystemMessageComponent`, `MessageBubbleComponent`, `MessageComposerComponent`) are composed by one smart `ConversationPanelComponent`. A new `MessageService` handles the Supabase insert. A small fix to `CaseDetailStore.appendMessage` prevents Realtime from duplicating messages that were already inserted optimistically.

### Completed Work

- [x] `client/src/app/core/message/message.service.ts` — inserts manual `conversation_messages` rows; maps the returned DB row to `ConversationMessage`
- [x] `client/src/app/components/conversation/system-message/system-message.component.ts` — presentational; renders system messages centred, italic, muted
- [x] `client/src/app/components/conversation/message-bubble/message-bubble.component.ts` — presentational; left/right alignment from `isOwn` input; author label + timestamp
- [x] `client/src/app/components/conversation/message-bubble/message-bubble.component.html` — bubble layout
- [x] `client/src/app/components/conversation/message-bubble/message-bubble.component.scss` — own (blue right) vs other (grey left) bubble styles using design tokens
- [x] `client/src/app/components/conversation/message-composer/message-composer.component.ts` — presentational; native `textarea` auto-grow, Enter-to-send (Shift+Enter = newline), clears on send
- [x] `client/src/app/components/conversation/message-composer/message-composer.component.html` — composer layout
- [x] `client/src/app/components/conversation/message-composer/message-composer.component.scss` — textarea + send button styles
- [x] `client/src/app/components/conversation/conversation-panel/conversation-panel.component.ts` — smart component; injects `CaseDetailStore`, `AuthService`, `MessageService`; optimistic send with rollback; auto-scroll via `effect()` + `viewChild`
- [x] `client/src/app/components/conversation/conversation-panel/conversation-panel.component.html` — `@for` over messages, dispatches to system/bubble components; scroll anchor div; error display
- [x] `client/src/app/components/conversation/conversation-panel/conversation-panel.component.scss` — flex column host; scrollable thread; pinned composer area
- [x] `client/src/app/pages/case-detail/case-detail.page.ts` — added `ConversationPanelComponent` to imports
- [x] `client/src/app/pages/case-detail/case-detail.page.html` — replaced both empty-slot divs (mobile + desktop) with `<app-conversation-panel [caseId]="...">`
- [x] `client/src/app/pages/case-detail/case-detail.store.ts` — `appendMessage` made idempotent to prevent Realtime duplicate when optimistic message already landed

### Key Decisions

- **Optimistic idempotency in store**: `appendMessage` now skips inserts where `id` already exists. This prevents the Realtime `INSERT` event (which fires after our DB write returns) from appending a duplicate alongside the already-confirmed persisted message.
- **`viewChild` + `effect` for auto-scroll**: Reads `store.messages()` to trigger the effect on every new message; the `scrollAnchor` div at the thread bottom is targeted with `scrollIntoView`. Guarded with `isPlatformBrowser` for SSR safety.
- **Author label resolution in panel, not bubble**: `ConversationPanelComponent` resolves display names from `store.participants()` so `MessageBubbleComponent` stays purely presentational (receives a pre-resolved `authorLabel: string`).
- **Plain `textarea` over `IonTextarea`**: Ionic shell-only coding standard; auto-grow handled via `input` event height reset.

### Deviations from Plan

None — implementation matches the plan exactly.

### Dependencies Added

None — no new packages required.

### Developer Notes

`ConversationPanelComponent` injects `CaseDetailStore` from the parent page's provider scope (`providers: [CaseDetailStore]` on `CaseDetailPage`). It must remain a child of `CaseDetailPage` in the DI tree; do not elevate the store to `providedIn: 'root'`.
