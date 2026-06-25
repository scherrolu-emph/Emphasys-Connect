---
stage: test
bolt: "006"
created: 2026-06-25T09:45:00Z
---

## Test Report: Case Detail Shell

### Summary

- **Tests**: 139/139 passed (39 new tests added; 100 pre-existing tests continue to pass)
- **Coverage**: All 5 stories covered; all acceptance criteria verified

### Test Files

- [x] `client/src/app/pages/case-detail/case-detail.store.spec.ts` — CaseDetailStore signal state, loadCase success/failure, appendMessage, refreshParticipants, reset
- [x] `client/src/app/components/avatar/avatar.component.spec.ts` — Initials extraction (two-word, single-word, multi-word), uppercase, size binding, deterministic color
- [x] `client/src/app/components/participants-tab/participants-tab.component.spec.ts` — Group rendering, hidden empty sections, YOU badge, trash buttons (HFA vs non-HFA), developer-only-remove guard, add form validation, pending invite badge
- [x] `client/src/app/pages/case-detail/case-detail.page.spec.ts` — Component creation, ionViewWillEnter loads and subscribes, ionViewWillLeave unsubscribes and resets, tab signals, unreadCount, case header rendering

### Acceptance Criteria Validation

- ✅ `/cases/:id` route loads for authenticated participants; non-participants are redirected
- ✅ Case header displays title, reference number, case type badge, active milestone name
- ✅ Mobile: three-tab `IonSegment` (Actions | Conversation | Participants) shows one panel at a time
- ✅ Tablet/desktop (≥768px): two-panel CSS grid; right panel has sub-tabs (Conversation | Participants)
- ✅ `CaseDetailStore` signals populated on load; `loading` true during fetch, false after
- ✅ Realtime subscription opened on `ionViewWillEnter`; unsubscribed on `ionViewWillLeave`
- ✅ Participants tab shows three groups (YOUR AGENCY / DEVELOPER / OTHER PARTICIPANTS); empty sections hidden
- ✅ Avatar initials correct; color deterministic from name hash
- ✅ YOU badge on current user row; lock icon; no trash on self
- ✅ HFA: trash → inline confirm → participant removed; system message written
- ✅ HFA: "+ Add participant" → inline form → submit → participant row appears; system message written
- ✅ Cannot remove the only Developer — blocked with error message
- ✅ Pending invite rows show email + "Pending" chip
- ✅ Conversation tab badge shows unread count; clears when Conversation tab activated
- ✅ Realtime: new `case_participants` row inserted in Supabase Studio appears live in Participants tab

### Issues Found

None. Two test fixes were made during authoring:
- `IonBackButton` subscribes to `Router.events` — router spy needed `{ events: new Subject() }` property
- `loadAndSubscribe` is fire-and-forget so realtime subscription test needed a short `setTimeout` to await the async chain

### Notes

All 100 pre-existing tests continue to pass — no regressions from the new code.
