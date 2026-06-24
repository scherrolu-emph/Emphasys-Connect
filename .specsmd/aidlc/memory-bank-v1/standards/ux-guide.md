# UX Guide

## Overview

Mobile-first design using Ionic 7 as a shell-only chrome provider. All content UI is plain Angular + CSS. The design goal is a shared workspace that feels native on mobile and embeds cleanly in Emphasys web products.

## Design System / Component Library

**Ionic 7** — used for mobile chrome only:
- `IonApp`, `IonRouterOutlet`, `IonTabs`, `IonTabBar`, `IonTabButton`
- `IonHeader`, `IonToolbar`, `IonTitle`, `IonButtons`, `IonBackButton`
- `IonContent` (page scroll container)
- `IonList`, `IonItem`, `IonLabel`, `IonNote` (list primitives only)

**Prohibited Ionic components** (adds unnecessary Ionic learning surface):
- `IonModal` → use Angular overlay / CSS panel
- `IonActionSheet` → use custom Angular menu
- `IonAlert` → use custom Angular confirmation component

All visual content (case workspace, item cards, activity timeline) uses plain HTML + Angular + custom CSS.

## Styling Approach

Custom CSS with Ionic CSS variables as the token layer.

- Use Ionic CSS variables (`--ion-color-primary`, `--ion-background-color`, etc.) for theming
- Component styles are scoped (Angular `ViewEncapsulation.Emulated`, the default)
- No external CSS frameworks (no Tailwind, Bootstrap, or Material) — keeps bundle small for mobile
- Responsive layout: CSS Flexbox / Grid; relative units (`rem`, `%`, `vw`)

## Accessibility Standards

- WCAG 2.1 AA target (not audited for hackathon, but no deliberate violations)
- Semantic HTML for all content components (no `div` soup)
- Ionic's built-in ARIA roles on shell components

## Responsive Design Strategy

Mobile-first breakpoints:

| Breakpoint | Target |
|------------|--------|
| `< 576px` | Phone (primary target) |
| `576px–1024px` | Tablet / wide phone |
| `> 1024px` | Embedded web view in Emphasys desktop product |

Stack layout on mobile; side-by-side (case list + workspace) on tablet and above.

## Key UX Principles

1. **Real-time visibility is the product.** The hero moment: a partner marks an item Submitted and the HFA's timeline updates live with no email. Every UI decision should reinforce this.
2. **Every participant sees what's outstanding.** The workspace is a shared source of truth, not a messaging thread.
3. **Status is always visible.** Item status, case progress, and pending actions are never buried.
4. **Activity log is a timeline, not a chat.** System events are the spine; notes are collapsed references.
