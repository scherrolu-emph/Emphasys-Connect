---
stage: plan
bolt: "020"
created: 2026-06-25T00:00:00Z
---

## Implementation Plan: AI Briefing Banner

### Objective
Add a role-aware streaming AI briefing banner to both home screens. On every page load, HFA staff see a catch-up about their cases; Developers see their task/milestone status. Text streams via typewriter effect. No API call — dummy strings only.

### Deliverables
- `AiBriefingService` at `client/src/app/core/ai-briefing/ai-briefing.service.ts`
- `AiBriefingBannerComponent` at `client/src/app/components/ai-briefing-banner/` (ts + html + scss + spec)
- Updated `client/src/app/pages/dashboard/dashboard.page.ts` + `.html`
- Updated `client/src/app/pages/my-cases/my-cases.page.ts`
- Updated `client/src/app/pages/my-cases/my-cases.page.spec.ts`

### Dependencies
- `AuthService.isHfa` — determines which dummy scenario to serve
- `DashboardPage` — host for HFA banner
- `MyCasesPage` — host for Developer banner

### Technical Approach
- `AiBriefingService` is `providedIn: 'root'`; `visible = signal(true)` so banner shows on every load
- `startStream(text, target, onComplete): () => void` — `setInterval` at 12ms/char; returns cleanup fn
- Component calls cleanup in `ngOnDestroy`; 300ms `setTimeout` before streaming starts (skeleton window)
- `@if (briefingService.visible())` guard in each host page — Angular destroys/recreates component on dismiss/replay
- Dismiss is in-memory only (no `localStorage`) — page refresh resets `visible` to `true`

### Dummy Data
**HFA**: "Since Thursday, 3 things need your attention. Developer on Sunrise Commons submitted 2 documents — one is awaiting your review. Riverdale Phase 2 has 3 overdue prerequisites. A developer on Lakeside Commons sent a message 2 days ago with no reply yet."
Chips: View My Tasks → /my-tasks | Open Sunrise Commons → /cases/demo-case-1 | Open Lakeside Commons → /cases/demo-case-2

**Developer**: "Since Thursday, HFA accepted your foundation inspection on Sunrise Commons — Phase 2 is now active. You have 2 new prerequisites ready to action. One document upload is overdue by 3 days."
Chips: View My Tasks → /my-tasks | Open Sunrise Commons → /cases/demo-case-1

### Acceptance Criteria
- [ ] Banner shows on Dashboard (HFA) and My Cases (Developer) on every page load
- [ ] Skeleton shimmer for 300ms before streaming starts
- [ ] Text streams character-by-character at 12ms/char
- [ ] Action chips appear after stream completes
- [ ] ✕ dismisses for session; ✨ toolbar button replays
- [ ] No memory leaks — interval cleaned up on destroy
- [ ] 15 new tests passing
