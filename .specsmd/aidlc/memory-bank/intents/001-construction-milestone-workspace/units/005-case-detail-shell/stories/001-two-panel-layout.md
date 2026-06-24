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
**I want** to see a two-panel case detail screen that reflows correctly on mobile
**So that** I can work efficiently on both desktop and mobile without losing context

## Acceptance Criteria
- [ ] **Given** a viewport ≥768px, **When** the user navigates to the case detail screen, **Then** the left panel (Actions/Status) and right panel (Conversation) are displayed side by side
- [ ] **Given** a viewport <768px, **When** the user navigates to the case detail screen, **Then** a single-column layout is shown with "Actions" and "Conversation" toggle tabs at the top
- [ ] **Given** mobile layout, **When** the user taps a toggle tab, **Then** the corresponding panel becomes visible and the other is hidden
- [ ] **Given** any viewport, **When** both panels are rendered, **Then** each panel scrolls independently without affecting the other
- [ ] **Given** the layout implementation, **When** inspecting the CSS, **Then** it uses CSS grid or flexbox (no Ionic layout primitives for the split)

## Technical Notes
- Standalone `CaseDetailComponent`; CSS `display: grid` with `grid-template-columns: 1fr 1fr` for desktop
- `@media` breakpoint at 768px for mobile reflow
- `IonSegment` + `IonSegmentButton` for the mobile toggle tabs
- No `IonSplitPane` or other Ionic layout primitives for the two-panel split

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
| Viewport exactly 768px | Treated as desktop (two-panel layout) |
| User rotates device from portrait to landscape | Layout reflows without data loss |

## Out of Scope
- Actual panel content (handled by Units 006 and 007)
- Persistent tab selection across navigations
