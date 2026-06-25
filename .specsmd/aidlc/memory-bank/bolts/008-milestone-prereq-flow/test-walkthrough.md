---
stage: test
bolt: "008"
created: 2026-06-25T15:00:00Z
---

## Test Report: Milestone/Prereq Flow — Mutations + Auto-Advance

### Summary

- **Tests**: 211/211 passed
- **Coverage**: All new service methods, store mutation helpers, and panel component actions covered

---

### Test Files

- [x] `client/src/app/core/cases/prerequisite.service.spec.ts` — markReady, accept, returnWithNote, triggerDocumentRequest: update args, system message inserts, error propagation
- [x] `client/src/app/core/cases/milestone.service.spec.ts` — checkAndAdvance: no-op if not all accepted, advances milestone + activates next + inserts message when all accepted, handles no-next-milestone case
- [x] `client/src/app/pages/case-detail/case-detail.store.spec.ts` — applyPrereqUpdate: correct prereq updated, other prereqs unchanged, no-op on null; applyMilestoneUpdate: correct milestone updated, activeMilestone rebuilt
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.spec.ts` — all existing tests updated + new: conditional Accept/Return visibility, Request document visibility guards, acceptPrereq/triggerRequest output events, return-note form show/hide, Confirm disabled when empty, Cancel dismisses form

---

### Acceptance Criteria Validation

- ✅ **markReady on acceptance_comment prereq → received_processing + system message**: service spec covers update args and message content
- ✅ **Accept on received_processing → accepted + system message**: service spec covers status and MilestoneService.checkAndAdvance call
- ✅ **Return with note → pending_open + note in message + stored in notes**: service spec covers update payload and message content
- ✅ **Trigger document request → upload_link written + requested: true + system message**: service spec verifies all three
- ✅ **All prereqs accepted → milestone completed + next active + system message**: milestone service spec covers full advance flow including "is now active" message
- ✅ **Real-time updates (second tab)**: `applyPrereqUpdate`/`applyMilestoneUpdate` store methods tested; Realtime wiring in page is verified by build (no TypeScript errors, callbacks conform to `CaseRealtimeCallbacks` interface)

---

### Issues Found

None. All 211 tests pass cleanly. The `console.error '[LoginPage] signInWithOtp error: Rate limited'` in test output is intentional — a pre-existing test verifying the login error-handling path; it is not a test failure.

---

### Notes

The HFA panel component spec was updated to reflect the new conditional-button behavior (buttons now shown/hidden by status rather than always-disabled). The old "renders action buttons as disabled placeholders" test was replaced with targeted conditional-visibility tests that match the live implementation.
