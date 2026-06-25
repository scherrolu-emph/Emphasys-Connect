---
stage: implement
bolt: "016"
created: 2026-06-25T13:30:00Z
---

## Implementation Walkthrough: UI Polish — Auth + Dashboard

### Summary

Three cosmetic and UX improvements delivered: Emphasys branding on the login page (SVG wordmark + "Powered by" caption), milestone-count progress on HFA dashboard case cards replacing prereq counts, and the "Create a case" button repositioned below the case list in page content rather than the toolbar.

### Structure Overview

Changes touch the auth screens unit (login page HTML/SCSS + new SVG asset) and the HFA dashboard unit (case card HTML/TS/SCSS, dashboard template/SCSS, model interface, and service mapping function). No new components or services were created. All changes are additive or surgical replacements.

### Completed Work

- [x] `client/src/assets/emphasys-logo.svg` — new SVG wordmark: two blue accent bars + "Emphasys" in navy bold text
- [x] `client/src/app/pages/login/login.page.html` — added `<img class="login-logo">` above the login card; added `<p class="login-powered">` after the demo section
- [x] `client/src/app/pages/login/login.page.scss` — added `.login-logo` (180px width, block) and `.login-powered` (caption color, centered) styles
- [x] `client/src/app/core/cases/case.models.ts` — added `milestoneCompleted: number` and `milestoneTotal: number` to `CaseSummary` interface
- [x] `client/src/app/core/cases/case.service.ts` — `mapToSummary()` now computes `milestoneTotal` (all milestones) and `milestoneCompleted` (status === 'completed') from `raw.milestones`; no Supabase query change needed
- [x] `client/src/app/pages/dashboard/case-card/case-card.component.html` — replaced prereq label with "X of Y milestones completed"
- [x] `client/src/app/pages/dashboard/case-card/case-card.component.ts` — `progressPercent()` computed now uses `milestoneCompleted / milestoneTotal` ratio
- [x] `client/src/app/pages/dashboard/case-card/case-card.component.scss` — renamed `.prereq-progress` to `.milestone-progress`
- [x] `client/src/app/pages/dashboard/dashboard.page.html` — removed `<ion-button>Create a case</ion-button>` from toolbar; added `<button class="ec-btn ec-btn--primary">` inside `.create-case-wrap` div at the bottom of `.dashboard-container`
- [x] `client/src/app/pages/dashboard/dashboard.page.scss` — added `.create-case-wrap` (top/bottom padding) and `.create-case-btn` (full width) styles
- [x] `client/src/app/pages/dashboard/dashboard.store.spec.ts` — added `milestoneCompleted: 0, milestoneTotal: 0` to `makeCase` helper
- [x] `client/src/app/core/cases/case.service.spec.ts` — added milestone count assertions to both test cases

### Key Decisions

- **`prereqAccepted`/`prereqTotal` kept on `CaseSummary`**: These fields remain because `my-cases` (developer view) uses a different type (`ParticipantCaseSummary`) and the overdue logic still references active milestone prereqs. Removing them would break unrelated code.
- **Plain `<button>` for Create a case**: Used `ec-btn ec-btn--primary` (native button) instead of `IonButton` to follow the coding standard — Ionic components are shell-only; content area uses plain elements.
- **SVG wordmark as inline asset**: No binary logo existed; created a text-based SVG so it renders at any resolution without a network call and can be committed to source control safely.

### Deviations from Plan

None — implemented exactly as planned.

### Dependencies Added

None.

### Developer Notes

The pre-existing TypeScript errors in `notification-bell.component.spec.ts` (testing methods not present on the component) are unrelated to this bolt and existed before these changes. All bolt-touched files are clean per `ng lint` and `tsc --noEmit`.
