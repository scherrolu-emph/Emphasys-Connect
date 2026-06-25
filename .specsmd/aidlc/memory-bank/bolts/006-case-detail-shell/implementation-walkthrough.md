---
stage: implement
bolt: "006"
created: 2026-06-25T09:30:00Z
---

## Implementation Walkthrough: Case Detail Shell

### Summary

Built the full case detail shell including responsive layout, signal store, avatar component, and participants tab with add/remove mutations. All new code is standalone components using Angular Signals throughout, with Realtime subscription lifecycle tied to Ionic view hooks.

### Structure Overview

New files span three layers: domain models extended in `case.models.ts`, service methods added to `case.service.ts` and `realtime.service.ts`, and a new page with two supporting components. The store is provided at the component level so each navigation gets fresh state.

### Completed Work

- [x] `client/src/app/core/cases/case.models.ts` — Added `CaseDetail`, `MilestoneDetail`, `PrerequisiteSummary`, `CaseParticipant`, `ConversationMessage` interfaces
- [x] `client/src/app/core/cases/case.service.ts` — Added `getCaseDetail`, `getParticipants`, `getMessages`, `addParticipant`, `removeParticipant`; each mutation also writes a system `conversation_message`
- [x] `client/src/app/core/realtime/realtime.service.ts` — Upgraded `subscribeToCase` to accept typed `CaseRealtimeCallbacks` object; added `case_participants` listener alongside existing listeners
- [x] `client/src/app/pages/case-detail/case-detail.store.ts` — Signal store with `caseDetail`, `participants`, `messages`, `loading`, `error`; `appendMessage` and `refreshParticipants` for Realtime callbacks; `reset()` for clean teardown
- [x] `client/src/app/components/avatar/avatar.component.ts` — Standalone; `name` and `size` inputs; initials computed from display name; background color from `hashName(name) % 8` palette; no randomness
- [x] `client/src/app/components/participants-tab/participants-tab.component.ts` — Three computed groups (agencyParticipants, developerParticipants, otherParticipants); YOU badge on self; lock icon on self row; trash → inline confirm → `removeParticipant` output; add form with email + role select → `addParticipant` output; developer-only-remove guard
- [x] `client/src/app/components/participants-tab/participants-tab.component.html` — `@for` per group; pending invite badge; conditional HFA vs read-only rendering
- [x] `client/src/app/components/participants-tab/participants-tab.component.scss` — Section headers, participant rows, inline confirm, sticky add CTA
- [x] `client/src/app/pages/case-detail/case-detail.page.ts` — `IonPage` with `providers: [CaseDetailStore]`; `ionViewWillEnter`/`ionViewWillLeave` Realtime lifecycle; `activeTab` and `activeRightTab` signals; `unreadCount` computed from `lastReadAt`; access guard redirects non-participants
- [x] `client/src/app/pages/case-detail/case-detail.page.html` — Mobile: `IonSegment` 3-tab; Desktop (≥768px): CSS-grid two-panel with right-panel sub-tabs; case header with title, reference number, type badge, active milestone
- [x] `client/src/app/pages/case-detail/case-detail.page.scss` — Mobile-first layout; `@media (min-width: 768px)` switches to `display: grid`; `@media (min-width: 1024px)` adjusts column ratio
- [x] `client/src/app/app.routes.ts` — Added `cases/:id` lazy route behind `authGuard`

### Key Decisions

- **Store provided in component**: `providers: [CaseDetailStore]` on `CaseDetailPage` means each route navigation creates a fresh store instance — no stale data bleeds between case navigations
- **Single layout component**: Mobile and desktop layouts coexist in one template with CSS `display: none` at the breakpoint — simpler than two components, avoids duplicating Participants tab logic
- **Realtime callbacks are optional**: `CaseRealtimeCallbacks` fields are all optional so existing call sites (which passed no callbacks) continue to compile without changes
- **Participant refresh on any Realtime event**: Rather than parsing the payload to add/remove individual rows, `onParticipant` always re-fetches the full list — simpler and immune to ordering issues

### Deviations from Plan

- `getMessages` added to `CaseService` (was `MessageService` in plan) — no `MessageService` existed yet; keeping it in `CaseService` avoids creating a one-method service for now
- `CommonModule` imported in `AvatarComponent` — required by the template even though no directives from it are used (Angular standalone requirement for `[style.*]` bindings in older versions); harmless

### Dependencies Added

None — all imports use existing packages already in `package.json`.

### Developer Notes

The `ionViewWillLeave` / `ngOnDestroy` double-unsubscribe is intentional: `ionViewWillLeave` handles normal navigation, `ngOnDestroy` handles component destruction if the route is removed from the stack without triggering `ionViewWillLeave` (edge case in Ionic's view stack management).
