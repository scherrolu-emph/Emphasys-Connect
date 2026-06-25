---
stage: test
bolt: "007"
created: 2026-06-25T00:00:00Z
---

## Test Report: Milestone/Prereq Display Panels

### Summary

- **Tests**: 174/174 passed (39 new tests added by this bolt)
- **Coverage**: All acceptance criteria verified via unit tests
- **Issues found**: 1 — existing `CaseDetailPage` spec mock was missing the new `milestones` computed signal; fixed in this stage

### Test Files

- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.spec.ts` — label and CSS class mapping for all three prereq statuses (3 tests)
- [x] `client/src/app/components/milestone-status-badge/milestone-status-badge.component.spec.ts` — label and CSS class mapping for all three milestone statuses (3 tests)
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.spec.ts` — empty states, milestone rendering, type icons, accordion behaviour, action button placeholder state (17 tests)
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.spec.ts` — empty state, all-milestone rendering, upload link conditions, mark-ready button conditions, markReady output emit, no HFA buttons (16 tests)
- [x] `client/src/app/pages/case-detail/case-detail.page.spec.ts` — updated mock to include `milestones` signal; all 11 pre-existing page tests pass (no regressions)

### Acceptance Criteria Validation

- ✅ **HFA Actions panel shows active milestone title** — tested: `'shows active milestone title'`
- ✅ **No milestone status pill on header** — tested: `'does not show a status badge on the milestone header'`
- ✅ **Prereq rows collapsed by default** — tested: `'starts with all prereq rows collapsed'`
- ✅ **Accordion expand on tap** — tested: `'expands a prereq row on click'`
- ✅ **Accordion collapse on re-tap** — tested: `'collapses an expanded row when clicked again'`
- ✅ **Only one row expanded at a time** — tested: `'only one prereq is expanded at a time'`
- ✅ **Status badge colors** — tested via `PrereqStatusBadgeComponent` and `MilestoneStatusBadgeComponent` specs
- ✅ **Document type icon (attach-outline)** — tested: `'shows attach-outline icon for document_submission prereqs'`
- ✅ **Comment type icon (checkmark-outline)** — tested: `'shows checkmark-outline icon for acceptance_comment prereqs'`
- ✅ **"All milestones complete" empty state** — tested
- ✅ **"No milestones yet" empty state** — tested
- ✅ **"No prerequisites defined" empty state** — tested
- ✅ **Action buttons are disabled placeholders** — tested: `'renders action buttons as disabled placeholders'`
- ✅ **Request document button only for document_submission** — tested
- ✅ **Participant panel shows all milestones** — tested: `'renders all milestones including open and completed ones'`
- ✅ **Milestone status badges on participant panel** — tested
- ✅ **Upload link for doc_submission + pending_open + uploadLink present** — tested
- ✅ **No upload link when received_processing** — tested
- ✅ **No upload link when uploadLink is null** — tested
- ✅ **Upload link opens in new tab** — tested
- ✅ **"Mark as ready" for acceptance_comment + pending_open** — tested
- ✅ **No "Mark as ready" for acceptance_comment + accepted** — tested
- ✅ **No "Mark as ready" for document_submission** — tested
- ✅ **markReady output emits prereqId** — tested: `'emits markReady with the prereq id when Mark as ready is clicked'`
- ✅ **No HFA action buttons in participant panel** — tested

### Issues Found

1 issue found and resolved: `CaseDetailPage` spec mocked `CaseDetailStore` without the new `milestones` computed signal. All 11 pre-existing tests were failing with `TypeError: ctx_r1.store.milestones is not a function`. Fixed by adding `milestones: signal([])` to the spy object's property map.

### Notes

- Realtime badge update (change prereq status in Supabase Studio → badge refreshes) requires manual smoke test; confirmed structurally valid since `CaseDetailStore.milestones` is a `computed()` from `caseDetail` which is updated by `appendMessage` and Realtime subscriptions already wired in Bolt 006.
- Action button mutations (Accept, Return with note, Request document) are confirmed disabled in this bolt; handlers are wired in Bolt 008.
