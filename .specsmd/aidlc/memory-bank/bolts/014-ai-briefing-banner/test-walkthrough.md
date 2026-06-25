---
stage: test
bolt: "014"
created: 2026-06-25T00:00:00Z
---

## Test Walkthrough: AI Briefing Banner

### Automated Tests

**Test run:** `ng test --watch=false`
**Result:** 349 PASS / 1 FAIL (pre-existing)

| Suite | Tests | Result |
|-------|-------|--------|
| AiBriefingService | 8 | ✅ All pass |
| AiBriefingBannerComponent | 7 | ✅ All pass |
| MyCasesPage (regression fix) | 8 | ✅ All pass |
| All other suites | 326 | ✅ All pass |
| CaseDetailPage (pre-existing) | 1 | ❌ `realtime:notifications` — unrelated to this bolt |

**New test coverage:**
- `AiBriefingService`: visible signal init, getBriefing per role, dismiss, resetAndShow, startStream char-by-char (`fakeAsync`), cleanup stops interval
- `AiBriefingBannerComponent`: create, getBriefing called with correct isHfa, skeleton before stream, streaming starts after 300ms, chips not visible pre-stream, dismiss delegates, onChip navigates

### Code Review

**Reviewer verdict:** READY TO MERGE

| Finding | Severity | Status |
|---------|----------|--------|
| No test for dismiss → resetAndShow → replay path | Important | Deferred to Bolt 015 |
| Shared `intervalId` on root singleton (safe for current routing) | Minor | Accepted |
| `briefingService` public on page classes (idiomatic Angular) | Minor | Accepted |
| `/my-tasks` chip route exists in routing ✅ | Observation | N/A |

### Manual Verification (pending)
Browser verification to be completed by developer before merge:
- [ ] HFA: banner streams in on Dashboard load, 3 chips appear, dismiss and replay work
- [ ] Developer: banner streams in on My Cases load, 2 chips appear
- [ ] Page refresh restores banner
