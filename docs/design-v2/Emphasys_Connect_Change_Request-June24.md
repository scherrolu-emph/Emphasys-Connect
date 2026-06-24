# Change Request — Design Doc → June 24 Meeting Alignment

**For:** the design agent
**Source of change:** Bogdan / team working session, June 24 2026 (transcript)
**Applies to:** Emphasys Connect Design Document (current consolidated version)

---

## How to read this

The June 24 session was a **pivot, not a polish.** The team locked in a concrete architecture (Supabase, IMC + eDocs integration, passwordless auth) and **narrowed the hackathon scope hard.** Several decisions in the current design doc are now reversed or deferred. This document lists every divergence as **FROM (current doc) → TO (new direction)**, grouped by severity:

- **🔴 Reversals** — the new direction contradicts a decision already written into the doc. These need active rewrites, not additions.
- **🟡 Additions** — genuinely new requirements the doc doesn't cover yet.
- **🟢 Deferrals** — things in the doc that are now explicitly out of scope for the hackathon.

A consolidated section-by-section edit list is at the end (§ "Edit map").

> ⚠️ **Biggest single shift:** the product is no longer a general multi-type case workspace with templated creation and rich multi-party collaboration. For the hackathon it is a **two-persona (HFA ↔ Developer) construction-milestone communication tool, with cases *imported from IMC* rather than created, and documents handled by eDocs/IMC rather than the app.** Most reversals below flow from that.

> 📐 **What's in the design agent's lane (read this first).** This is a **design** document — screens, flows, states, and interactions. The backend and infrastructure decisions in the transcript (**Supabase, the IMC and eDocs integrations, passwordless auth/token plumbing, Azure hosting, login-date logging**) are **engineering concerns and do NOT need to be designed, mocked, or wired in the design doc.** They appear below only as *context* so the screens make sense. The design agent's job for those items is limited to the **UI surface** they produce — e.g. the look of the 6-digit-code login screen, the empty state for a user with no cases, the Import-from-IMC picker screen, and the eDocs upload interface as the user *sees* it. Treat everything behind those screens as a black box that "just works." Where this doc says "mockable," that means **engineering** may stub the connection — it is **not** an instruction to the designer to build fake data plumbing.

---

## 🔴 Reversals (contradict the current doc)

### R1 — Cases are IMPORTED from IMC, not created in-app
- **FROM:** §8.6 specifies a four-step "Create a case" wizard with templates, manual entry, and role assignment. §5 has a templates data model; §9 lists create-case build tiers.
- **TO:** Cases are created by an **HFA pressing an "Import" button** that pulls a project from **IMC** (the back-office system). IMC supplies project name, address, location, unit count, and developer contact (email, phone). There is **no manual create wizard** and **no template system** in scope.
- **Why:** Case creation is triggered by funding being awarded in IMC; IMC is the source of truth.
- **Action:** Replace the entire §8.6 create-case flow and the §5 "Templates" subsection with an **Import-from-IMC flow**. Remove templates from scope (see R2).

### R2 — Templates are OUT; remove the template system entirely
- **FROM:** §5 "Templates — the case blueprint," §8.6 template gallery + save-as, §9 template build tiers, §12 template open decisions.
- **TO:** No templates. Milestones and prerequisites are **imported from IMC per project** (each HFA defines their own there). The structure that templates were meant to provide now comes from IMC.
- **Action:** Delete the templates data model, the template gallery, save-as-template, and all template references. (Note for the file: the standalone create-case/template content we consolidated in is now obsolete for the hackathon.)

### R3 — The item model changes: Milestones → Prerequisites (two-level), with new statuses
- **FROM:** §5 flat "Outstanding items," each with status `Pending → Submitted → Under Review → Accepted / Returned`, plus a cross-cutting Overdue flag and an optional severity field.
- **TO:** A **two-level structure**:
  - **Milestones** — imported from IMC; each has a *target number of days to completion* and a status of **Open / Active / Completed** (Active = the current milestone). Completing a milestone triggers the next to open.
  - **Prerequisites** — items that must be satisfied to complete a milestone. Statuses (system-defined, **not** user-configurable): **Pending / Open → Received / Processing → Accepted**; rejection reverts to **Pending / Open**.
  - Prerequisite types: **Document submission** (most common) and **Acceptance / comment** (written approval, no physical document).
  - Some milestones have **no prerequisites** (internal HFA steps) — shown for transparency with status + comments only.
- **Action:** Replace the §5 item lifecycle with this milestone/prerequisite model and the new status sets. Retire `Submitted/Under Review/Returned` naming in favor of `Received-Processing / Accepted / (revert to) Pending-Open`. Drop **severity** entirely (R8).

### R4 — Documents live in eDocs/IMC, not the app; the app orchestrates, it doesn't store
- **FROM:** §9 lists "Document storage / file upload" as out of scope, but the construction Building brief and threads describe attachments and a draw package inside the workspace.
- **TO:** The app is **explicitly not the document repository.** It orchestrates submission:
  - When a prerequisite becomes active, the developer gets a **notification with an upload link**.
  - The link opens an **interface built on top of eDocs**; the upload stores the file in **eDocs**, flips the IMC prerequisite to **Received/Processing**, and creates an **eDocs↔IMC link**.
  - HFA reviews **in IMC**; accept → Accepted; reject → back to Pending/Open + developer re-notified.
- **Action:** Add a "Document Handling" section reflecting this orchestration model. Keep "app is not a file store" but replace the vague reference-only language with the eDocs/IMC upload-link flow.

### R5 — Two personas only for the hackathon: HFA and Developer
- **FROM:** §3/§4 and the Building brief center a **10+ persona** multiplayer story; the hero demo (§6) is "a case becomes multiplayer" with a GC pulling in subs, an inspector, an architect, etc.
- **TO:** Hackathon scope is **HFA (internal) and Developer (external) only.** All other partners (GC, architect, inspector, lender, investor, etc.) are **later phases.** The developer is the single external actor; other parties route through them (the very problem being solved, acknowledged as a later fix).
- **Action:** Rewrite the hero demo (§6) and sample data around HFA↔Developer. Keep the 10+ persona list only as a **future-vision** note, clearly marked out of hackathon scope. Remove sub-contributor-invite mechanics from scope (R6).

### R6 — Invitation model changes: HFA invites from IMC contacts; externals do NOT invite anyone
- **FROM:** §4 "HFA staff invite externals; externals can add their own sub-contributors," with reassignment-within-org rules.
- **TO:** During import, the **HFA selects stakeholders from the IMC project contacts table** (or adds a contact manually) and **assigns each a contact role.** All invited stakeholders get a case-created email. There is **no external-initiated invitation** and **no sub-contributor self-add** in scope (only two personas exist anyway).
- **Action:** Replace §4 invitation rules with the IMC-contact-selection model. Remove external-invite and sub-contributor language from scope. Remove item **reassignment** rules (R8 — not part of the milestone/prereq model discussed).

### R7 — Passwordless auth via Supabase replaces "register to join"
- **FROM:** §3 "registration is required to join a case," with magic link only as a doorway into registration; the whole "activation cost" framing.
- **TO:** **Passwordless login:** user enters email → receives a **6-digit token** by email → enters it. Handled by **Supabase.** Any valid email can have an account; users with no cases see an **empty state.** **Only HFA-flagged accounts** (flag set manually by Emphasys IT in Supabase) can create/import cases.
- **Action:** Replace §3's activation-cost/registration narrative with the passwordless + HFA-flag model. The "magic link as doorway into registration" line is now the actual primary auth, not a fallback. *Design-agent scope: only the **screens** — the email-entry screen, the 6-digit-code entry screen, and the HFA vs. non-HFA difference in what's visible after login. The Supabase auth flow itself is engineering, not a design deliverable.*

### R8 — Drop severity, item reassignment, and cancel/archive nuance
- **FROM:** §5 severity field (open decision), item modify/cancel/reassign rules, §12 related open decisions.
- **TO:** None of these came up in the new model. The milestone/prerequisite structure is imported and its statuses are system-defined. **Severity, reassignment, and the cancel-vs-delete item rules are out of scope** (not discussed, not part of the IMC-driven model).
- **Action:** Remove severity throughout; remove item-management (modify/cancel/reassign) rules from scope. (If any item-edit ability is needed, it happens in IMC, not the app.)

---

## 🟡 Additions (new, not yet in the doc)

### A1 — Two-panel HFA interface: Actions panel + Conversation panel
The HFA view has **two persistent panels**:
- **Actions panel** — milestone/prerequisite status, trigger document requests, manage the case, trigger reminders.
- **Conversation panel** — the persistent thread: system-generated messages (status changes, upload links, prerequisite activations) **and** manual chat between HFA and developer.
The **developer view** is the same conversation thread plus a **read-only, informational** view of milestone/prerequisite status — developers **cannot trigger actions**, only see status and converse.
- **Action:** Add a new screens section specifying the two-panel HFA layout and the limited developer layout. This **replaces** the §8.2 case-detail "outstanding items + activity log" layout for the hackathon.

### A2 — The conversation thread is the spine (not a folded side-channel)
- **FROM (nuance shift):** §5 made the activity log a record-first timeline with conversation *folded* onto items to minimize noise.
- **TO:** The team explicitly wants a **conversational primary surface** — one always-open thread mixing system messages and manual messages. System actions (e.g., "upload link sent to developer," "prerequisite X received") **appear as messages in the thread.** Questions about a document are expected to be **manual messages**, since the external partner is not co-reviewing the document.
- **Action:** Recast the activity log as a **case conversation thread** with interleaved system + manual messages. The "questions thread onto a specific item, folded" model is superseded by a single conversational thread for the hackathon. (Keep open/resolved questions only if cheap; not emphasized in the new model.)

### A3 — Notification system (email-first, link-back)
- Default channel: **Email** (already captured for all users). Future: SMS, WhatsApp, push via a provider like Twilio.
- Every notification carries a **direct link** to the relevant case thread / prerequisite.
- **Triggers (hackathon):**
  1. **Case created** → all invited stakeholders notified.
  2. **Prerequisite status changes** → relevant party notified (developer on activation; HFA on upload/Received).
  3. **New manual message** posted → relevant party notified.
- **Not a trigger:** a milestone simply moving to the next milestone (notify only when a prerequisite is *assigned to* a person).
- **Action:** Replace the §5 nudge/notification reference with this explicit trigger list. A "missed-activity aggregator" digest is **nice-to-have only.**

### A4 — IMC + eDocs integration layer (mockable)
- **IMC** = source of truth for case/project data, milestones, prerequisites, and their statuses.
- **eDocs** = document storage; the upload UI is built on top of it.
- For the hackathon, **integrations may be stubbed by engineering**, with real API/DB connections added incrementally. Deployment targets **Emphasys-managed (Azure-hosted) clients first** (direct DB access, no APIs needed yet).
- **Action:** This is **engineering context, not a design task.** The design agent owns only the two **screens** that touch these systems — the **Import-from-IMC picker** (selecting a project + its contacts) and the **eDocs upload interface** as the user experiences it. How the data actually moves between the app, IMC, and eDocs is not designed or mocked in this doc; assume it works. Capture the integration facts in a short architecture note for context only.

### A5 — Mobile-first, responsive
- **TO:** Design approach is **mobile-first, responsive** (scales up to tablet/desktop).
- **FROM:** §10 implied a dense desktop "command center" for staff.
- **Action:** Update §10 visual direction to mobile-first; the HFA two-panel layout must reflow gracefully to a single column on mobile.

### A6 — Backend = Supabase; login-date logging for future billing
- Supabase provides auth, database, and real-time. Log **latest login date per user** to support a future active-user billing model (nice-to-have if time).
- **Action:** **Engineering context only — nothing to design.** Record in the architecture note for completeness; it produces no screen or flow. (Any future billing/active-user reporting is also out of the design agent's scope.)

---

## 🟢 Deferrals (now explicitly out of scope for hackathon)

Add/confirm these in the Out-of-scope list:
- **D1** — Personas beyond HFA + Developer (GC, architect, inspector, lender, investor, environmental, local gov, utilities, insurers).
- **D2** — AI-driven orchestration (proactive notifications, document validation/classification). *(Already out; reaffirm.)*
- **D3** — Generic case creation not tied to IMC (the manual milestone-definition interface) — a *future* "nice if time" stretch, not core.
- **D4** — Push notifications, SMS/WhatsApp escalation.
- **D5** — **The full draw process** — deemed complex and covered by existing systems. *(Important: this softens the Building/draw brief — the hackathon centers the simpler milestone/prerequisite flow, not the full 10-document draw package.)*
- **D6** — Tenant inspection use case.
- **D7** — Document collaboration / joint review & commenting on documents inside the app.

---

## Edit map (section-by-section)

| Doc section | Change | Type |
|---|---|---|
| §0 How to read | Add note: doc realigned to June 24 pivot; hackathon = HFA↔Developer milestone tool on IMC/eDocs. | edit |
| §1 Thesis | Keep the "stop info floating in email" core; re-center on construction-milestone + audit trail; note single-developer-portal problem explicitly. | edit |
| §2 Principles | Drop "transformative multiplayer" emphasis; principle 5 becomes HFA-and-developer transparency. Keep audit-trail + single-source principles. | edit |
| §3 Activation trade-off | **Replace** with passwordless Supabase auth + HFA-flag (R7). | rewrite |
| §4 Roles & access | **Replace** with two personas; IMC-contact invitation; remove external-invite & sub-contributor & reassignment (R5, R6, R8). | rewrite |
| §5 The case | **Replace** item model with Milestones + Prerequisites and new statuses (R3); replace activity log with conversation thread (A2); remove Templates subsection (R2); remove severity (R8). | rewrite |
| §6 Hero demo | **Replace** "becomes multiplayer" with HFA↔Developer milestone loop: prereq activated → upload link → developer uploads → HFA reviews → accepted → milestone advances (R5). | rewrite |
| §7 Sample data | Re-seed for one imported IMC project, HFA + Developer, a few milestones each with prerequisites; keep it believable but drop the 10-persona threads (R5, D5). | rewrite |
| §8 Screens | Replace 8.1–8.6: Home/empty-state, Case (two-panel Actions + Conversation for HFA; read-only status + conversation for developer), Import-from-IMC flow, eDocs upload-link interface. Remove invite-form-as-spec'd, @-mention/bell can stay simplified (A1, A3, R1). | rewrite |
| §8.6 Create-case | **Delete**; replace with Import-from-IMC (R1). | delete/replace |
| §9 Build scope | Rebuild Build/Mock/Out lists around the new scope; mock IMC import + eDocs upload (A4); move templates, 10-persona flow, draw package, create-wizard to out/deferred (R1, R2, D1, D5). | rewrite |
| §10 Visual direction | Mobile-first responsive; two-panel reflow (A5). | edit |
| §11 Pitch | Re-frame: HFA + developer, milestone transparency, audit trail, IMC/eDocs orchestration; future personas as the expansion story. | edit |
| §12 Open decisions | Remove template/severity/sub-contributor items; add: active-user billing model (A6), digest aggregator (A3), generic non-IMC cases (D3). | edit |
| Add: Architecture | New section, **context only**: Supabase backend, IMC + eDocs integration, Azure-hosted clients first, login-date logging. No screens or mocks for these — engineering owns them (A4, A6). | add (context) |
| Add: Document Handling | New section per R4. | add |
| Add: Notifications | New section per A3. | add |

---

## Open questions to confirm with the team before rewriting

1. **Activity log vs. conversation thread:** the new model is conversation-first (A2). Confirm we're fully retiring the "folded notes-on-items" structure for the hackathon, or keeping a light version.
2. **Building/draw brief status:** D5 defers the *full* draw process. Confirm the Building case content (10-doc package, draw cycles) is shelved as future, and the hackathon uses the simpler imported milestone/prerequisite structure (pending Alan's sample IMC workflow).
3. **Where item edits happen:** confirm all prerequisite/milestone edits live in **IMC**, and the app is read/orchestrate-only on structure (HFA acts via the Actions panel but underlying truth is IMC).
4. **@-mentions & notification bell** (existing build items): keep in simplified form for two personas, or defer? They still make sense for the conversation thread but weren't called out in the session.
