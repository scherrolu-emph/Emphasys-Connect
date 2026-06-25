# AI Briefing Banner — Design Spec
**Date:** 2026-06-25  
**Branch:** `feature/ai-briefing-banner`  
**Status:** Approved — ready for implementation

---

## Summary

A smart, dismissible AI briefing banner that appears at the top of the user's home screen on login (or after a meaningful absence). It "streams" a pre-written role-aware catch-up message using a typewriter effect, then surfaces 2–3 action chips pointing to the most urgent items. No external API call — dummy data only for the hackathon prototype.

---

## Goals

- Give judges an immediate "wow moment" on login: AI text visibly streams in
- Reduce cognitive load for both HFA staff and Developers returning to the app
- Surface the most urgent items without requiring navigation
- Be additive — zero changes to existing routing, schema, or services

---

## Scope (Hackathon Prototype)

**In scope:**
- `AiBriefingBannerComponent` — visual banner with streaming text + action chips + dismiss
- `AiBriefingService` — show/hide logic, dummy data, typewriter streaming via signals
- Integration into `DashboardPage` (HFA) and `MyCasesPage` (Developer)
- "Catch me up" re-trigger button near `NotificationBellComponent` in `BottomNavComponent`
- `localStorage` persistence of last-seen timestamp

**Out of scope (future):**
- Real Claude API call
- Live Supabase data in summary
- Per-case deep-link navigation from chips (chips show as buttons, routing deferred)

---

## Behaviour

### Show Condition
Banner is shown when: `Date.now() - lastSeenTimestamp > 2 * 60 * 60 * 1000` (2 hours).  
`lastSeenTimestamp` is read from `localStorage` key `ec-last-seen`.

On banner **dismiss** (× button): write current timestamp to `ec-last-seen`. Banner hidden for the session.

On **"Catch me up"** re-trigger: reset the show condition and replay the stream.

### Streaming
Pre-written string is emitted character-by-character via `setInterval` (12ms per character — fast enough to feel live, slow enough to read). Uses an Angular Signal (`streamedText = signal('')`) updated in the interval callback.

### Skeleton State
While streaming has not started (first ~300ms), show a 3-line skeleton placeholder to prevent layout jump.

---

## Dummy Data

### HFA Scenario (`is_hfa = true`)

**Summary text:**
```
Since Thursday, 3 things need your attention. Developer on Sunrise Commons submitted 2 documents — one is awaiting your review. Riverdale Phase 2 has 3 overdue prerequisites. A developer on Lakeside Commons sent a message 2 days ago with no reply yet.
```

**Action chips:**
- `View My Tasks` → `/my-tasks`
- `Open Sunrise Commons` → `/cases/demo-case-1`
- `Open Lakeside Commons` → `/cases/demo-case-2`

### Developer Scenario (`is_hfa = false`)

**Summary text:**
```
Since Thursday, HFA accepted your foundation inspection on Sunrise Commons — Phase 2 is now active. You have 2 new prerequisites ready to action. One document upload is overdue by 3 days.
```

**Action chips:**
- `View My Tasks` → `/my-tasks`
- `Open Sunrise Commons` → `/cases/demo-case-1`

---

## Components

### `AiBriefingBannerComponent`

**Selector:** `app-ai-briefing-banner`  
**Type:** Standalone presentational + smart (injects `AiBriefingService`, `Router`)  
**Inputs:** none (reads role from service)  
**Template structure:**
```
<div class="ai-banner">
  <div class="ai-banner__header">
    <span class="ai-banner__icon">🤖</span>
    <span class="ai-banner__label">AI Briefing</span>
    <button class="ai-banner__dismiss" (click)="dismiss()">✕</button>
  </div>
  <div class="ai-banner__body">
    @if (isStreaming()) {
      <p class="ai-banner__text">{{ streamedText() }}<span class="cursor">|</span></p>
    } @else {
      <!-- skeleton lines -->
    }
  </div>
  @if (chipsVisible()) {
    <div class="ai-banner__chips">
      @for (chip of chips(); track chip.label) {
        <button class="ai-banner__chip" (click)="onChip(chip)">{{ chip.label }}</button>
      }
    </div>
  }
</div>
```

**Signals:**
- `streamedText = signal('')`
- `isStreaming = signal(false)`
- `chipsVisible = signal(false)` — set to true once streaming completes

### `AiBriefingService`

**ProvidedIn:** `'root'`  
**Responsibilities:**
- `shouldShow(): boolean` — checks `ec-last-seen` in localStorage
- `dismiss(): void` — writes timestamp, updates `visible` signal
- `getBriefing(isHfa: boolean): { text: string; chips: Chip[] }` — returns dummy data
- `startStream(text: string, target: WritableSignal<string>): void` — typewriter via setInterval, returns cleanup fn
- `resetAndShow(): void` — clears `ec-last-seen`, sets `visible` to true, restarts the stream (used by "Catch me up" re-trigger)
- `visible = signal(false)` — reactive show/hide

### Chip model
```ts
interface BriefingChip {
  label: string;
  route: string;
}
```

Chips navigate via `Router.navigate()` on click.

---

## Integration Points

| Page | Change |
|---|---|
| `DashboardPage` | Add `<app-ai-briefing-banner>` above the case list, guarded by `@if (briefingService.visible())` |
| `MyCasesPage` | Same pattern |
| `BottomNavComponent` | Add a small `Catch me up` icon-button next to the bell; calls `briefingService.resetAndShow()` |

---

## Styling

- Card style: rounded corners (`border-radius: 12px`), subtle gradient background (`#f0f4ff` → `#e8f0fe`), light box shadow
- Left accent border: `4px solid var(--ion-color-primary)`
- Chips: pill-shaped, outlined, primary color
- Cursor blink: CSS `@keyframes blink` on the `|` character
- Mobile-first: full width on mobile, max-width `600px` on tablet+

---

## File Map

```
client/src/app/
  core/
    ai-briefing/
      ai-briefing.service.ts
      ai-briefing.service.spec.ts
  components/
    ai-briefing-banner/
      ai-briefing-banner.component.ts
      ai-briefing-banner.component.html
      ai-briefing-banner.component.scss
      ai-briefing-banner.component.spec.ts
```

---

## Non-Goals

- No NgModule (standalone only)
- No IonModal / IonAlert / IonActionSheet
- No polling
- No real API call in this iteration
