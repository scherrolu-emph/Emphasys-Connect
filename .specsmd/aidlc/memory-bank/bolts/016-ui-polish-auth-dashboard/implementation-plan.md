---
stage: plan
bolt: "016"
created: 2026-06-25T13:00:00Z
---

## Implementation Plan: UI Polish — Auth + Dashboard

### Objective

Three cosmetic/UX changes: Emphasys branding on the login page, milestone-count progress on HFA dashboard cards, and repositioning the "Create a case" button below the case list.

---

### Deliverables

1. **Login page branding** — Emphasys wordmark SVG above the login card; "Powered by Emphasys" caption below the demo quick-login section
2. **Milestone count on case card** — Replace `X/Y accepted` prereq text with `X of Y milestones completed`; requires new fields on `CaseSummary` and updated `mapToSummary`
3. **Repositioned "Create a case" button** — Remove from toolbar; add below the `<ion-list>` in content (and prominently in the empty state)

---

### Dependencies

- `src/assets/emphasys-logo.svg` — must be created (no existing logo asset)
- `CaseSummary` interface (`case.models.ts`) — needs `milestoneCompleted: number` and `milestoneTotal: number`
- `mapToSummary()` (`case.service.ts`) — must compute milestone counts from `raw.milestones`
- `RawMilestone` already carries `status` — no Supabase query changes required

---

### Technical Approach

**Story 005 — Login branding**

- Create `client/src/assets/emphasys-logo.svg`: a simple SVG wordmark ("Emphasys") using a clean sans-serif path. No binary assets needed — SVG is text.
- In `login.page.html`: add `<img class="login-logo" src="assets/emphasys-logo.svg" alt="Emphasys" />` as the first child of `.login-wrap`, above `.login-card`.
- Add `<p class="login-powered">Powered by Emphasys</p>` after `.login-demo` (or inside it as the last child).
- Add `.login-logo` and `.login-powered` styles to `login.page.scss`.

**Story 004 — Milestone count display**

- Add `milestoneCompleted: number` and `milestoneTotal: number` to `CaseSummary` interface in `case.models.ts`.
- Update `mapToSummary()`: `milestoneTotal = raw.milestones.length`, `milestoneCompleted = raw.milestones.filter(m => m.status === 'completed').length`.
- Update `case-card.component.html`: replace `<span class="prereq-progress">{{ caseItem().prereqAccepted }}/{{ caseItem().prereqTotal }} accepted</span>` with `<span class="milestone-progress">{{ caseItem().milestoneCompleted }} of {{ caseItem().milestoneTotal }} milestones completed</span>`.
- The `progressPercent()` computed in `case-card.component.ts` currently uses prereq counts. Change it to use `milestoneCompleted / milestoneTotal` for the progress bar fill.
- The `prereqAccepted`/`prereqTotal` fields remain on `CaseSummary` — they may be used elsewhere (overdue logic, etc.). Only the display label changes in the card.

**Story 005 — Create case button position**

- Remove `<ion-button fill="solid" color="primary" (click)="createCase()">Create a case</ion-button>` from `<ion-buttons slot="end">` in the toolbar.
- Add a "Create a case" button block at the bottom of `.dashboard-container`, after the `@if` block that renders the cases list:
  - Visible in all states (loading, empty, populated) — it's always an available action.
  - Use a full-width `ec-btn ec-btn--primary` style button inside a `.create-case-wrap` div.
- In the empty state, the button will appear directly below the "No active cases" message, making it prominent.
- Add `.create-case-wrap` styles to `dashboard.page.scss`: padding, max-width, centered.

---

### Acceptance Criteria

- [ ] Login: Emphasys logo (or wordmark SVG) visible above the login card on mobile and desktop
- [ ] Login: "Powered by Emphasys" text visible below the demo quick-login section
- [ ] Login: branding is responsive and doesn't overflow on narrow screens
- [ ] Dashboard: each case card shows "X of Y milestones completed" (not prereq count)
- [ ] Dashboard: the progress bar fill reflects milestone completion ratio
- [ ] Dashboard: "Create a case" button appears below the last case row (not in toolbar)
- [ ] Dashboard: "Create a case" button is prominent when the case list is empty
- [ ] No TypeScript errors; `ng lint` passes
