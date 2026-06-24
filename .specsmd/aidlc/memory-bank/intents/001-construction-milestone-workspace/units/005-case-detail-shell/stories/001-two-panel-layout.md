---
id: 001-two-panel-layout
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-two-panel-layout

## User Story
**As a** any authenticated user
**I want** to see a two-panel case detail screen that adapts correctly across smartphone, tablet, and desktop
**So that** I can work efficiently on any device without losing context

## Acceptance Criteria
- [ ] **Given** a viewport `<768px` (mobile), **When** the user navigates to the case detail screen, **Then** a single-column layout is shown with three toggle tabs at the top: **Actions | Conversation | Participants** (HFA) or **Status | Conversation | Participants** (Participant)
- [ ] **Given** mobile layout, **When** the user taps a toggle tab, **Then** the corresponding panel becomes visible and the other two are hidden
- [ ] **Given** a viewport `768px–1279px` (tablet), **When** the user navigates to the case detail screen, **Then** the left panel (Actions/Status) and right panel are displayed side by side with a `2fr 3fr` column split; the right panel has a sub-tab bar: **Conversation | Participants**
- [ ] **Given** a viewport `≥1280px` (desktop), **When** the user navigates to the case detail screen, **Then** the two panels are displayed side by side with a `1fr 2fr` column split inside a `max-width: 1400px` centered container; the right panel sub-tab bar remains **Conversation | Participants**
- [ ] **Given** any viewport ≥768px, **When** both panels are rendered, **Then** each panel scrolls independently without affecting the other
- [ ] **Given** the layout implementation, **When** inspecting the CSS, **Then** it uses CSS grid with `@media` breakpoints — no Ionic layout primitives for the split

## Technical Notes
- `display: grid` with two `@media` breakpoints:
  - `@media (min-width: 768px)`: `grid-template-columns: 2fr 3fr`
  - `@media (min-width: 1280px)`: `grid-template-columns: 1fr 2fr; max-width: 1400px; margin: 0 auto`
- Mobile: `IonSegment` + `IonSegmentButton` for three-tab toggle (Actions/Status | Conversation | Participants); hidden at ≥768px
- Tablet/Desktop: right panel has its own `IonSegment` sub-tab bar (`Conversation | Participants`); left panel has no sub-tabs
- No `IonSplitPane` or other Ionic layout primitives for the two-panel split
- `activeTab = signal<'actions'|'conversation'|'participants'>('actions')` on mobile; `activeRightTab = signal<'conversation'|'participants'>('conversation')` on tablet/desktop

## Dependencies
### Requires
- None
### Enables
- `002-hfa-panel-slots`
- `003-developer-panel-slots`
- `004-data-loading-and-realtime`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Viewport exactly 768px | Treated as tablet (two-panel `2fr 3fr` layout) |
| User rotates device from portrait to landscape | Layout reflows without data loss |

## Out of Scope
- Actual panel content (handled by Units 006 and 007)
- Persistent tab selection across navigations
