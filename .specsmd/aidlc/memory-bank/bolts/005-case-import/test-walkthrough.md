---
stage: test
bolt: "005"
created: 2026-06-25T09:05:00Z
---

## Test Walkthrough: Create Case (Unit 004)

### Summary

Three spec files written and verified: `ImportService`, `CaseService.createCase()`, and `CreateCaseConfirmPage`. All 100 tests in the suite pass (up from 83 before this bolt). No pre-existing tests were broken.

### Spec Files Written

| File | Tests | Coverage |
|------|-------|----------|
| `client/src/app/core/cases/import.service.spec.ts` | 7 | search filtering (name, projectNumber, empty query), cache (fetch once), error propagation |
| `client/src/app/core/cases/create-case.service.spec.ts` | 6 | happy path (blank + IMC), RLS operation order, prerequisite milestone_id threading, compensating delete, cases-insert failure |
| `client/src/app/pages/create-case/confirm/create-case-confirm.page.spec.ts` | 21 | redirect guard, computed signals (isImcBacked, isBlankLike, canCreate), participant init, addParticipant (valid, invalid, duplicate), removeParticipant, isRemovable, proceed navigation, back routing |

### Key Decisions

- **Separate spec file for `createCase()`**: Rather than adding to the existing `case.service.spec.ts` (which covers `getHfaCases`), the `createCase` tests were placed in `create-case.service.spec.ts` to keep the file readable. Both files use `spyOn(supabase, 'from')` with per-table callFake dispatch.
- **`insertOrder` array pattern for RLS ordering test**: Tracks the sequence of table names passed to `supabase.from()` during an IMC case creation and asserts `case_participants` index < `milestones` index. This directly encodes the RLS fix without coupling to private implementation details.
- **`spyOnProperty(history, 'state')` for route-state injection**: Component reads from `history.state` in `ngOnInit`. Spying the property at the Jasmine level was the simplest approach without needing a real router navigation.
- **Separate `it` blocks for `isBlankLike` variants**: A for-loop calling `spyOnProperty` three times in one `it` block fails on the second call ("already spied upon"). Split into three `it` blocks, each in its own Jasmine test context.

### Fixes Applied During Testing

- **`as unknown as Array<...>` cast**: `capturedPrereqs` typed as `unknown[] | null`; casting directly to `Array<{ milestone_id: string }>` was rejected by TypeScript ("neither type sufficiently overlaps"). Fixed by casting through `unknown` first.
- **`spyOnProperty` one-per-it limitation**: See "isBlankLike" item above.

### Test Results

```
TOTAL: 100 SUCCESS (0 FAILED)
```

All pre-existing tests (83 from prior bolts) continue to pass.
