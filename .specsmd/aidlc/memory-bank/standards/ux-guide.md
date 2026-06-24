---
name: ux-guide
description: UX and visual direction for Emphasys Connect v2 — mobile-first, two-panel, dual-density
metadata:
  type: reference
---

# UX Guide

## Visual Direction

Modern SaaS in the spirit of Linear / Notion: restrained neutral palette, single functional accent, status via subtle color + shape, generous whitespace, strong type hierarchy.

**One caution:** pure Linear-cold reads as unfriendly to a government/HFA audience. Add just enough warmth and labeling clarity that a non-technical reviewer is never lost. Status language is plain English, never jargon.

### Design tokens

| Token | Value |
|---|---|
| Accent | `#1593D8` (Emphasys blue) |
| Success | `#22C55E` |
| Caution | `#F59E0B` |
| Error/overdue | `#EF4444` |
| Neutral text | `#1F2937` |
| Muted text | `#6B7280` |
| Surface | `#FFFFFF` |
| Background | `#F9FAFB` |
| Border | `#E5E7EB` |

## Mobile-First, Responsive

- Design for mobile viewport (375px) first
- Scale up to tablet (768px) and desktop (1024px+)
- The two-panel HFA layout must reflow gracefully to a single column on mobile
  - Mobile: stacked panels with a tab or toggle switch between Actions and Conversation
  - Tablet/desktop: side-by-side panels

## Dual Density

Both personas use the same design tokens at different densities:

- **HFA view** — command center density. More information per screen, tighter spacing. HFA staff are power users who know the domain.
- **Developer view** — calmer, more guided. More whitespace. Status is explained, not assumed. Developer may be using this product for the first time.

Same tokens. Different rhythm.

## Screen Inventory

### Auth screens
- **Email entry**: Large centered email input, "Send code" CTA. Clean, minimal.
- **OTP entry**: 6-digit code input. "Resend code" option. Clear error states.
- **Empty state**: User logged in but no cases assigned. Friendly message; no broken-looking empty table.

### HFA Dashboard (case list)
- Each case row: title, type badge, milestone progress indicator, overdue count (red badge if > 0)
- Cases with overdue prerequisites: red left border
- Type filter: All / Loan / Inspection / Application (tab or chip strip)
- Dense layout — this is a command center

### Case Detail — HFA
Two-panel layout:
- **Actions panel** (left/top on mobile): Active milestone, prerequisite checklist with status badges, action buttons (Trigger document request, Accept, Return with note)
- **Conversation panel** (right/bottom on mobile): Chronological thread, system messages interleaved with manual messages, message composer at the bottom

### Case Detail — Developer
Two-panel layout (simpler):
- **Status panel** (left/top): Read-only milestone progress, prerequisites assigned to this developer with upload links
- **Conversation panel** (right/bottom): Same thread as HFA view, message composer

### Import from IMC (HFA only)
- Picker: list of IMC projects available to import. Each row shows project name, address, developer contact.
- On select: confirm screen with milestone/prerequisite preview before importing.

### eDocs Upload (Developer)
- Accessed via email link or conversation thread link
- Simple upload interface: file picker, prerequisite context shown, submit button
- Success state confirms upload and shows "Under review" status

## Status Visual Language

Define once, use everywhere. Applied as badge color + text:

| Status | Visual | Plain-text label |
|---|---|---|
| `pending_open` | Neutral (grey) | Pending |
| `received_processing` | Accent blue, in-motion | Received — Under Review |
| `accepted` | Success green | Accepted |
| Returned/rejected | Caution amber | Returned |
| Milestone open | Neutral | Upcoming |
| Milestone active | Accent blue | In Progress |
| Milestone completed | Success green | Complete |
| Overdue | Error red overlay | Overdue (shown as a flag on top of any non-terminal status) |

## Conversation Thread

- System messages: muted background, small system icon, brief terse text ("Draw Request Form received — under review")
- Manual messages: standard chat bubble, author name + role label, timestamp
- No threading or nesting — flat chronological list
- Composer at bottom: plain text input + send button; no rich formatting needed for hackathon

## Navigation

Bottom tab bar (Ionic `IonTabs`) for mobile:
- **Cases** (home)
- **Profile** (minimal — show user name, log out)

No nested tab bars. Deep navigation uses `IonRouterOutlet` push/pop.

## Tone

- Action labels: plain verbs — "Send", "Accept", "Return", "Upload"
- System messages: past tense, subject-first — "HFA staff accepted Draw Request Form" not "Accepted"
- Empty states: friendly, explain why the screen is empty, offer a next action where relevant
- Error messages: plain English, say what happened and what to do — never "An error occurred"
