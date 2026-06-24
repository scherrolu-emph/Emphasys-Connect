# Feature Brief — Create Case & Templates

**Emphasys Connect** · companion to the main Design Document
For: design & implementation · Scope tier: **Tier 2** (see §7)

---

## 1. What this feature is

A flow that lets an HFA user create a brand-new case manually, optionally starting from a **reusable template** that comes with tasks pre-built and ready to assign. Templates carry the structure of a recurring case type (construction draw, loan compliance, inspection, application review) so staff don't rebuild the same checklist every time. Staff can also **save any existing case as a new template**, so the library grows from real work.

This replaces the main Design Document's §9 decision to *mock* case creation. That mock (pre-load 3 sample cases) still stands for the core demo; this brief specifies the real flow for when it's built. See §7 for how the two coexist.

---

## 2. Why templates matter (design rationale)

- **They make heavy cases survivable.** The construction draw use case has ~10 partner roles and a recurring monthly checklist. Nobody hand-builds that every month. Templates are what let the product scale from simple demo cases to the real messy ones.
- **They encode institutional knowledge.** A well-made "Construction Draw" template *is* the agency's authoritative checklist of what a draw requires — which directly addresses the compliance-risk pain point (expired insurance, missing certifications) from the construction use case.
- **They define work by role, not by person.** A template knows a draw needs *a lender, an architect, an inspector* — it does not know *which* ones. So the create flow's central job is assigning real people to the template's roles. This reuses the existing invite/participant mechanics.

---

## 3. The data model: what a template contains

A template is a reusable blueprint. It does **not** contain people or absolute dates.

| Template field | Description |
|---|---|
| Name | e.g. "Construction Draw — Monthly" |
| Case type | Loan, inspection, application, construction (extensible) |
| Roles required | The set of identity-label roles this case needs filled (e.g. developer, GC, architect, inspector, lender, insurer). Drives the assignment step. |
| Item blueprints | The pre-built tasks. Each carries: **title**, optional **description/instructions**, the **role responsible** (not a person), and a **relative due date** (see below). Optional **severity** if that decision lands (main doc §5). |

### Relative due dates — important
Templates cannot hardcode calendar dates. Each item blueprint stores a **due-date offset** — e.g. *"due 14 days after case start."* At creation, the flow computes real dates from the offset and the case start date. The designer should mock **relative** dates ("Due: Start + 14d") in the template view, and **resolved absolute** dates only after creation. Hardcoding "Due June 30" in a template mock would misrepresent how this works.

### Items are assigned by role, then to a person
In the template, an item's owner is a *role slot* ("Lender"). During creation, once the user assigns a real person to the Lender role, every Lender item inherits that person as owner. This is why the assignment step is role-centric, not item-by-item — assign once per role, not once per task.

---

## 4. The create-case flow (4 steps)

A linear wizard. "Manual / blank" is simply the empty template — same flow, nothing pre-filled — so there is **one flow, not two**.

### Step 0 — Entry point
"+ New Case" button on the home/dashboard (HFA staff only). *(Note: this is the dashboard's own create action — distinct from the participant-list "+ Invite," which stays the only way to add people to an existing case per main doc §8.)*

### Step 1 — Choose a starting point
A gallery of template cards:
- **Built-in templates:** Construction Draw, Loan Compliance Review, Inspection / Deficiencies, Application Review.
- **Saved templates:** any the agency has saved from prior cases (§6).
- **Start blank:** the manual path — an empty case with no pre-built items.

Each card shows the template name, type, role count, and item count so the user knows what they're getting. Selecting one carries its blueprint into the next steps; the user can still add/edit/remove items later, so a template is a starting point, never a cage.

### Step 2 — Case details
- **Case title**
- **Type** (pre-filled from template, editable)
- **Reference ID** — ties back to Lotus / multifamily suite (main doc §5)
- **Case start date** — the anchor that resolves all relative due dates into real ones

### Step 3 — Assign people to roles *(the heart of the flow)*
The template's required roles are listed, each as a slot to fill. For each role:
- **Assign an existing participant** (search the directory), **or**
- **Invite someone** — opens the same invite form from main doc §8.4 (name, email, organization dropdown + "Enter new…", role pre-filled). The invite is sent and the person is provisionally attached to the role.

As roles are filled, the items belonging to each role light up with their now-resolved owner. Roles may be left unassigned and filled later — the case can be created with open role slots (those items show as unassigned, a visible to-do). For a **blank** start, this step lets the user add roles/people freely instead of working from a required list.

### Step 4 — Review & create
A summary: case details, the full item list with resolved owners and computed due dates, and any unassigned slots flagged. Editable inline — add, remove, or edit items and due dates before committing. On **Create**:
- The case is created with all items, owners, and dates.
- A system event opens the activity log: *"Case created from [template name] by [staff]."*
- Each pre-built item logs its creation, consistent with main doc item-management events.

---

## 5. Manual / blank path (explicit)

Choosing **Start blank** in Step 1 runs the identical four steps with nothing pre-filled: the user names the case (Step 2), adds participants and roles as needed (Step 3), and builds items from scratch — title, owner, due date — in Step 3/4. No separate UI. This guarantees the manual capability the feature requires while keeping a single code path.

---

## 6. Save a case as a template

From any existing case, an HFA staff action **"Save as template."** It captures the current structure and strips the instance-specific data:
- **Keeps:** case type, the set of roles present, and the items — converted to blueprints (title, description, role-as-owner).
- **Strips:** the actual people, the reference ID, the activity log, statuses, and absolute dates.
- **Converts dates:** the user is prompted to set each item's due date as an offset from start (or the system infers it from the original dates relative to the case start). 
- Prompts for a **template name**, then adds it to the Saved templates in Step 1.

This is the full extent of template management for this build — **built-in templates + save-as.** No standalone template editor; editing a template means saving a freshly built case over it or creating a new one. **[Decision]**

---

## 7. Scope: how this coexists with the core build

The main Design Document deliberately **mocks** case creation to protect the multiplayer hand-off demo (the hero). This feature is therefore **Tier 2**: build only if the core loop is solid and time remains.

It is written to be **modular** so partial implementation still demos well:

| Build tier | What ships | Demo value |
|---|---|---|
| **Tier 2a — the impressive slice** | Step 1 template gallery + Step 3 role-assignment screen, wired to seeded built-in templates, producing a real case | Shows the template idea and the role-to-person assignment — the visually compelling, conceptually novel parts — without the full wizard plumbing |
| **Tier 2b — full flow** | All 4 steps, relative-date resolution, create writes a real case | Complete manual + templated creation |
| **Tier 2c — save-as-template** | §6 | Closes the loop: templates grow from real cases |

If none of Tier 2 is built, it remains a strong **"designed and ready"** pitch beat: *"Cases are created from reusable templates — here's the construction draw template with its ten roles and monthly checklist, pre-built and waiting to be assigned."*

### Seed data to prepare regardless
- A **Construction Draw** built-in template (≈10 roles, monthly checklist drawn from the construction use case: draw request, inspection report, architect certification, pay application, lien waivers, insurance certificate, environmental report, etc.) — this is the template that best sells the feature.
- Lighter built-ins for Loan, Inspection, Application mirroring the three sample cases in main doc §7.

---

## 8. Design notes for the implementer

- **One flow, not two.** Blank = empty template. Resist building a separate "manual" path.
- **Assign by role, inherit to items.** The assignment screen is role-centric; filling a role populates all its items' owners at once. This is the interaction to get right.
- **Relative dates everywhere in templates.** Show "Start + Nd" in template/blueprint views; resolve to absolute only after a start date exists.
- **Reuse, don't reinvent.** Step 3's invite is the §8.4 invite form. Created items, owners, and events follow main-doc item-management rules. The "+ New Case" button is distinct from the participant "+ Invite."
- **Open slots are allowed.** A case can be created with roles unfilled; unassigned items are a visible to-do, not a blocker.
- **Dual-density.** This is a staff-only, command-center flow — it can be denser than the partner-facing surfaces (main doc §10).

---

## 9. Open decisions for the team

1. **Severity in templates** — if the severity field lands (main doc §5), item blueprints should carry it; otherwise omit. Keep blueprint schema ready for it.
2. **Date-offset inference on save-as** (§6) — auto-infer offsets from the original case's dates, or always prompt the user to set them? *Recommendation: infer, then let the user adjust.*
3. **Where Tier 2 sits against the hero loop** — confirm this is genuinely after the core multiplayer demo is solid, so it doesn't pull hours from the thing that wins the hackathon.
