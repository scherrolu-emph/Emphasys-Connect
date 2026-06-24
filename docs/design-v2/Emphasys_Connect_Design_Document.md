# Emphasys Connect — Design Document

**Partner Coordination & Collaboration Workspace for Housing Finance Agencies**
Hackathon prototype scope · Built on the original CoordHub scoping brief (Emphasys Software, June 2025), refined through design discussion. *(CoordHub was the brief's working title; the product is now Emphasys Connect.)*

---

## 0. How to read this document

This document supersedes the original scoping brief where they conflict. The brief framed Emphasys Connect as a task-tracker with a magic-link escape hatch for partners. Through discussion we reshaped it into something more ambitious and more coherent: **a shared case workspace that external partners are invited into.** The sections below capture the decisions that define that shift, the reasoning behind them, and the build scope for a 2–3 day hackathon.

Where a decision departs from the original brief, it's marked **[Changed from brief]** so the team understands the intent.

---

## 1. Product thesis

Housing Finance Agencies (HFAs) coordinate complex, multi-party processes — loan compliance review, property inspections, application reviews — with people *outside* the agency: lenders, inspectors, property owners, general contractors, vendors. Today that coordination happens in email threads, spreadsheets, Teams chats, and phone calls. There is no single source of truth. Information floats in mailboxes and gets lost.

The defining pain is concrete and documented in the domain: a partner uploads a required document, then has to *separately* notify a human that they did it — and the review system does not detect the upload on its own. If they forget to send that notification, the item simply sits, untouched, while everyone assumes someone else is acting. The back-and-forth of "submit → agency returns a list of conditions/deficiencies → partner clears them → re-review" is the universal shape of HFA work, and every hand-off in that loop is a chance for information to fall through a crack.

**Emphasys Connect consolidates the entire case — its outstanding items, its participants, and its full activity history — into one shared space that everyone involved can see and act in.** The conversation and the record become the same object, anchored to the case, so nothing floats away.

### The one-sentence pitch

> Emphasys Connect turns a tangle of emails, spreadsheets, and phone calls into a single shared workspace where every party on a case can see what's outstanding, answer each other's questions, and watch the process move — in real time, in one place.

---

## 2. Design principles

These five principles resolve the tensions we surfaced in discussion. When a build decision is ambiguous, defer to these.

1. **The case is the unit of access.** If you're a participant in a case, you see the whole case — every item, every participant, the full activity log. Access is granted at the case level, never the item level. The silo is the enemy; a keyhole view per person just rebuilds silos inside the app. **[Changed from brief — brief scoped partners to individual items.]**

2. **Open within a case, closed across cases.** The privacy wall doesn't disappear; it moves. Inside a case: full visibility for participants. Across cases: total isolation. Lender A on Case 1 can never see Case 2. Every record carries an `hfa_id` and a case scope, and queries are always filtered by them.

3. **The record and the conversation are one timeline.** Status changes and human discussion live in the same chronological log so context never splits across two places. But structure does the filtering: system events are the terse spine; notes and questions thread onto the item they concern and appear *folded* in the timeline. The default view is calm; chatter is one click away, never in your face. (Closer to GitHub issues than to Slack.)

4. **Questions have a terminal state.** A question can be marked *resolved*. Open questions act as soft outstanding items with a small badge. This gives multiplayer back-and-forth an end state instead of an ever-growing wall, and makes "answer the open questions" a visible, finishable job.

5. **Valuable solo, transformative multiplayer.** The tool earns its keep for an HFA staffer even before any partner joins (it replaces their spreadsheet). It becomes genuinely powerful the moment a case turns multiplayer. We lead the demo with the multiplayer moment, but never at the expense of solo value.

---

## 3. The activation trade-off we accepted

The original brief's magic-link guest mode (respond to one item, no account) was designed to remove the main adoption barrier. **We dropped it. [Changed from brief.]**

Rationale: if the product's value *is* the shared full-picture workspace, a guest who can only touch one item never experiences that value — so frictionless-but-shallow access undercuts the whole thesis. We traded it for register-but-deep.

The consequence is explicit and must be designed for: **we raised the activation cost, so the invitation-and-registration moment is now mission-critical.** It is the first thing a partner experiences and it does the persuading. The original brief mocked this flow entirely; in this design it deserves real attention. A magic link may still exist, but only as a fast *doorway into registration* — not as a permanent reduced-access mode.

---

## 4. Roles & access model

We collapsed the brief's three-tier permission matrix. The key insight: "role" means two different things for internal vs. external people, and conflating them was the source of the difficulty.

| | Internal (HFA staff) | External participant |
|---|---|---|
| **What "role" means** | A *permission* — who can approve, return, close, create | An *identity label* — "this is the lender / inspector / GC," so everyone knows who's who. Does **not** gate what they can see within a case. |
| **Sees** | All cases for their HFA, full detail | Every case they are a participant in, in full |
| **Can do** | Create cases; add, modify, cancel, and reassign items (any owner); review & decide (accept/return); invite anyone; close items | Update item status, submit work, add notes, ask/answer questions, add their own sub-contributors, reassign their own items within their own org |
| **Account** | Standing system account | Registered account (required to join any case) |

### Invitation rules

- **HFA staff invite external participants** into a case.
- **External participants can add their own sub-contributors** (e.g. a GC pulls in a subcontractor).
- **Every addition is a visible system event** in the activity log — "GC added [Subcontractor] to the case." No silent additions; visibility of the participant list is itself part of "nothing floats."
- The data model records **who added each participant** (accountability / audit trail), and assumes an HFA ability to remove a participant. *Removal need not be built for the hackathon, but the schema should support it.*

### Known edge to flag, not build (v2)

Sub-contributors added by an external currently inherit the same full-case view. For a loan case containing a borrower's sensitive financial data, that may be too broad. **Sensitive-field redaction for externals is a v2 line** — flag it in the pitch as designed, don't build it for the hackathon.

---

## 5. The case

A **case** is a record created by HFA staff that links to an existing process in another Emphasys tool (Lotus, multifamily suite). The case lives in Emphasys Connect; the underlying work lives in the source system. Emphasys Connect does not read or write source-system data in v1.

| Field | Description |
|---|---|
| Type | Loan, inspection, application review (extensible to future workflow types) |
| Reference ID | Ties back to the record in Lotus / multifamily suite |
| `hfa_id` | Tenant scope, on every record from day one (architectural foresight) |
| Participants | HFA staff + invited externals, each with an identity-label role and an "added by" reference |
| Outstanding items | Checklist of things needed, each owned by a participant |
| Activity log | Single chronological timeline — system events (spine) + threaded notes/questions (folded) |

### Outstanding items

Each item has a **title**, an **owner** (the participant responsible), a **due date**, and a **status**:

```
Pending  →  Submitted  →  Under Review  →  Accepted
                                        ↘  Returned  → (back to Pending / re-submit)
```

This status flow is the real-world "conditions clearing" loop: the agency returns a list of conditions or deficiencies; the partner clears each one; re-review continues until everything is accepted.

**Overdue is a cross-cutting flag, not a status.** Any item past its due date in a non-terminal status is flagged overdue. This drives dashboard counts and the red visual state.

#### Managing items — create, modify, cancel, reassign

The case manager (HFA staff) owns the item list, and items stay editable through their life. Every one of these actions writes a system event to the timeline, so the management of the case is as visible as the work itself.

**Create.** HFA staff add items to a case at any time (not only at creation) — a returned condition, a newly discovered deficiency, or a follow-up request all become new items mid-flight. Event: *"Staff added item: X, assigned to [owner], due [date]."*

**Modify.** HFA staff can edit an item's title, due date, and owner after creation. Edits to material fields are logged so history is never silently rewritten — e.g. *"Staff changed due date on X from [old] to [new]."* This matters most for due dates, since an extended deadline is exactly the kind of change that otherwise gets lost in email.

**Cancel (never hard-delete).** Removing an item is a **cancel/archive**, not a deletion. A cancelled item is struck through and greyed, drops out of outstanding and overdue counts, but stays in the record with its full history and a system event: *"Staff cancelled item: X."* This is deliberate — in a tool whose entire premise is "nothing floats away," silently erasing an item with its activity would contradict the thesis. There is no hard-delete in v1; a mistakenly created item is simply cancelled. **[Decision: cancel/archive only.]**

**Reassign.** An item's owner can change — important for real coordination, e.g. a partner going on vacation handing their items off. The rule mirrors the invitation model (bounded autonomy for externals, full reach for staff): **[Decision]**
- **HFA staff can reassign any item to any participant** in the case.
- **An external owner can reassign their own item within their own organization** — a lender hands off to another lender on the case, but cannot push the item onto the HFA or another org. (If the intended new owner isn't yet in the case, this pairs with the external's existing ability to add their own sub-contributors.)
- Reassignment is a system event — *"[Old owner] reassigned X to [new owner]"* — so the hand-off is visible to everyone and no item quietly changes hands. Any threaded notes/questions on the item travel with it; its status and due date are unchanged.

These actions are reflected live in the activity log, consistent with the hand-off money shot (§6).

#### Severity / priority — DECISION PENDING

The inspection domain has a real severity dimension (life-threatening → severe → moderate → low). It would make the inspection case ring true and give the dashboard a second sortable axis, but it is scope beyond the brief's status-only item model. **Open decision for the team:** keep items status-only for hackathon simplicity, or add a severity field for domain realism. Recommendation: include it as an optional field on the schema, surface it only on the inspection case, skip building sort/filter on it unless time allows.

### The activity log, precisely

- **System events** are first-class, terse timeline entries: *submitted, accepted, returned, nudge sent, participant joined.* These are what the dashboard counts.
- **Notes and questions thread onto a specific item** (or onto the case when genuinely general) — they do **not** post into the global stream as peers.
- In the timeline, conversation appears as a **collapsed reference** ("3 new comments on Income Verification"), expandable inline. Present for context, folded so it never drowns the events.
- **Questions carry an open/resolved state.** An open question shows a badge on its item ("1 open question") and acts as a soft outstanding item.

---

## 6. The hero demo — a case becomes multiplayer

The demo must prove the thesis, and the thesis is multiplayer. A single partner responding is still essentially single-threaded; what *shows* multiplayer is three participants converging on one case. The narrative:

1. **HFA staff** opens a loan compliance case and reviews returned conditions.
2. Staff **invites a lender**; the lender registers and lands in the **full shared case view** — sees everything, not a keyhole.
3. The lender hits a blocker and **pulls in their own sub-contributor / an inspector** to answer a question. The addition appears as a system event for all to see.
4. The third party **answers the open question in the threaded log**; the question flips to **resolved** and its badge clears.
5. The lender **marks an item submitted** — and the HFA's activity log updates **live, with no email sent by anyone.**

### The money shot

Step 5 is the single most important micro-interaction in the product: the instant "Mark submitted" fires and the HFA's view updates in real time, replacing the broken status quo where a partner uploads something and then has to separately email a human to say so. If the demo has one beat the audience remembers, it is this one. Design and rehearse it deliberately.

---

## 7. Sample data — three cases, chosen to exercise every state

The dashboard must show its full range at a glance, so the three pre-loaded cases are deliberately in different states and different types. Item names are drawn from real HFA workflows so the demo rings true to a domain audience.

### Case 1 — Loan compliance review · *the hero / live-demo case*
- **Type:** Loan · **Partners:** a lender (loan officer), plus a sub-contributor pulled in during the demo
- **State:** mid-flight, with room to move an item live on stage
- **Items:**
  - Verification of employment — *Submitted* (move to Under Review live)
  - Updated bank statements + letter of explanation for large deposit — *Pending*
  - Signed borrower affidavit — *Accepted*
- Carries the open question that gets resolved in the demo.

### Case 2 — Multifamily inspection deficiencies · *the overdue / red case*
- **Type:** Inspection · **Partners:** property owner/manager + inspector
- **State:** one item past its cure-period deadline → red on dashboard, overdue count > 0, "nudge sent" system event in the log
- **Items:**
  - Correct life-threatening deficiency (smoke/CO detector) — *Overdue*
  - Submit evidence-of-repair photos — *Pending*
  - Certify deficiency correction — *Pending*
- The natural place to demonstrate the optional severity dimension.

### Case 3 — Application review · *the nearly-complete / green case*
- **Type:** Application · **Partner:** a registered lender
- **State:** mostly done — satisfying near-full progress bar, strong contrast against Case 2's red
- **Items:** nearly all *Accepted*, one final item *Under Review*

Together these give the dashboard healthy / overdue / nearly-done states simultaneously, exercise the type filter (loan / inspection / application), and use only real partner roles (lender, inspector, property owner, sub-contractor).

---

## 8. Core screens

### 8.1 HFA dashboard
Bird's-eye view of all active cases for the HFA. Per-case: status indicators, overdue counts, outstanding-item totals, progress. Filterable by case type. Overdue cases visually distinct (red). This is the solo-value surface and can be denser — it's a command center.

### 8.2 Case detail — *the heart of the product*
A single case in full:
- **Outstanding items** with status, owner, due date, overdue flag, and open-question badge
- **Participant sidebar** — who's on the case, their identity-label role, who added them
- **Activity log** — the single timeline: system events as the spine, threaded notes/questions folded in as expandable references
- Item-level thread view: expand an item to see and add its notes/questions, mark questions resolved

### 8.3 Item interaction (the hand-off & management)
Owner of an item can **mark submitted** and **add a note**; HFA can **accept** or **return** (with conditions). HFA staff also have item-management controls — **add** a new item, **edit** title/due date/owner, **cancel** (archive), and **reassign**; an external owner can **reassign within their own org**. Every transition and management action writes a system event that appears live in the timeline.

### 8.4 Invitation & registration — *now first-class [Changed from brief]*
The flow that turns an invited email into a registered participant landing in the full case view. This is the activation moment; it must feel fast and obviously worth it. Magic link, if present, is a doorway into registration — not a permanent guest mode.

---

## 9. Hackathon build scope

### Build
- HFA dashboard — case list, status indicators, overdue counts, type filter
- Case detail — outstanding items + single activity-log timeline (events + folded threads)
- Item status updates — mark submitted, add note, accept/return; live timeline update
- Item management (HFA staff) — add items mid-case, modify title/due date/owner, cancel (archive, not delete), reassign; each logged as a system event
- Reassignment — staff reassign any item; external owners reassign their own items within their org
- Threaded notes/questions on items, with open/resolved state and badges
- Participant sidebar with identity-label roles and "added by"
- The multiplayer hero flow end-to-end (invite → join → add sub-contributor → resolve question → submit)

### Mock
- **Case creation** — pre-load the 3 sample cases instead of building the multi-step form
- **Registration/invite delivery** — pre-create participant accounts; simulate the "join" rather than sending real email. (Design the screen; fake the plumbing.)
- **Nudge / notification system** — reference as designed; show the resulting "nudge sent" event in seeded data, don't build the scheduler
- **Multi-tenancy** — include `hfa_id` on every table; do not build the enforcement layer
- **Participant removal** — schema supports "added by"; removal UI not built

### Out of scope (v1)
- Document storage / file upload (items reference what's needed; files live in source systems)
- Sensitive-field redaction for externals (the v2 privacy line)
- Cross-HFA unified partner view (the known multi-tenancy edge case)
- Automatic case creation from Lotus or other tools
- AI-powered features
- Real-time chat beyond case-anchored threaded notes

---

## 10. Visual direction

Modern SaaS, in the spirit of Linear / Notion: restrained neutral palette with a single functional accent, status communicated through subtle color + shape rather than loud badges, generous whitespace, strong type hierarchy, keyboard-friendly density on the staff side.

**Dual-density from shared tokens.** The staff dashboard is a dense command center; the external participant's case view is calmer and more guided. Both dial the *same* design tokens (color, type, spacing, status language) to different densities — so the two surfaces feel like one product without dumbing down the staff tool.

**One caution:** pure Linear-cold can read as unfriendly to a government/HFA audience. Add just enough warmth and labeling clarity that a non-technical reviewer is never lost. Status language should be plain English, not jargon.

### Status visual language (define once, use everywhere)
- **Pending** — neutral
- **Submitted** — accent, in-motion
- **Under Review** — accent, attention
- **Accepted** — success
- **Returned** — caution (needs re-work)
- **Overdue** — error/red, applied as an overlay flag on top of any non-terminal status
- **Open question** — small distinct badge, clears on resolve

---

## 11. Pitch framing

> "HFAs run complex, multi-party processes — loans, inspections, application reviews — and today the coordination lives in email threads, spreadsheets, and phone calls. Nobody has the full picture. With Emphasys Connect, the whole case lives in one shared space: every participant sees what's outstanding, answers each other's questions, and watches the process move in real time.
>
> For this prototype we focused on the moment that proves it — a case going multiplayer: an HFA assigns work, a lender joins and sees the full picture, pulls in a sub-contributor to resolve a question, and submits — and everyone sees it happen live, with no email sent. Invitations, notifications, multi-tenancy, and redaction are designed and ready to build."

---

## 12. Open decisions for the team

1. **Severity field** (§5) — include the inspection-domain severity dimension, or stay status-only? *Recommendation: optional field on schema, surfaced only on the inspection case.*
2. **Magic link as registration doorway** (§3) — build the fast-path-into-registration, or simulate joining entirely for the demo?
3. **Sub-contributor visibility** (§4) — confirm sub-contributors added by externals inherit the full case view for the hackathon, with redaction explicitly deferred to v2.
