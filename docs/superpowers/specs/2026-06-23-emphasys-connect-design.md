# Emphasys Connect — Hackathon Design Spec

**Date:** 2026-06-23  
**Scope:** 2-day hackathon · 2 developers  
**Source design doc:** [Claude Design project](https://claude.ai/design/p/322ec1eb-5edb-4faa-b63a-806260048aba)

---

## 1. Product thesis

HFAs coordinate complex multi-party processes (loan compliance, property inspections, construction draws, application reviews) with external partners — lenders, inspectors, contractors, property owners. Today that coordination lives in email threads, spreadsheets, and phone calls. No single source of truth.

**Emphasys Connect** consolidates the entire case — outstanding items, participants, and full activity history — into one shared workspace every party can see and act in. The record and the conversation are the same object, anchored to the case.

### The money shot (demo must nail this)
A lender marks an item **Submitted** and the HFA staff's activity log updates **live** — with no email sent by anyone. This single beat is the proof of the entire thesis.

---

## 2. Architecture

**Stack:** Ionic + Angular · .NET 8 Web API · SignalR · EF Core · SQL Server LocalDB · ASP.NET Core Identity + JWT

```
┌─────────────────────────────────────────────┐
│  Ionic / Angular (frontend)                 │
│  ┌──────────────────────────────────────┐   │
│  │ Ionic shell: IonApp, IonPage,        │   │
│  │ IonTabs, IonHeader, IonContent       │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ Angular components: all screens,     │   │
│  │ services, SignalR client             │   │
│  └──────────────────────────────────────┘   │
└───────────────────┬─────────────────────────┘
                    │ HTTP + WebSocket (SignalR)
┌───────────────────▼─────────────────────────┐
│  .NET 8 Web API                             │
│  Controllers · SignalR Hub · Identity + JWT │
│  EF Core 8 + SQL Server LocalDB             │
└─────────────────────────────────────────────┘
```

### Minimal Ionic surface
Use Ionic only for the mobile chrome. All content is plain Angular + CSS.

| Ionic component | Purpose |
|---|---|
| `IonApp`, `IonRouterOutlet` | App shell |
| `IonPage`, `IonHeader`, `IonContent` | Every screen |
| `IonToolbar`, `IonTitle`, `IonButtons` | Top bar |
| `IonTabs`, `IonTabBar`, `IonTabButton` | Bottom nav |
| `IonIcon`, `IonBadge`, `IonButton` | UI atoms |

Avoid: `IonModal`, `IonActionSheet`, `IonAlert` — use Angular overlays or plain CSS toggles.

---

## 3. Data model

### Core entities

```
HFA
  id, name

User
  id, hfa_id (nullable — null = external), email, password_hash, display_name, role

Case
  id, hfa_id, title, type (Loan|ConstructionDraw|Inspection|Application), reference_id,
  status (Active|Closed), created_at, created_by

CaseParticipant
  id, case_id, user_id, identity_label (Lender|Inspector|GC|PropertyOwner|...), added_by, added_at

Item
  id, case_id, title, owner_id, due_date, status (Pending|Submitted|UnderReview|Accepted|Returned),
  is_cancelled, cancelled_at, created_at

ActivityEvent
  id, case_id, event_type, actor_id, item_id (nullable), payload (JSON), created_at

Thread (notes/questions on an item)
  id, item_id, case_id, author_id, body, is_question, is_resolved, created_at
```

### Item status flow
```
Pending → Submitted → Under Review → Accepted
                                   ↘ Returned → (back to Pending)
```

**Overdue** = cross-cutting flag: `due_date < now` AND status not in (Accepted, Returned).

### `hfa_id` on every table
Include from day one. Enforcement layer (row-level security, middleware) is mocked for hackathon.

---

## 4. Authentication (hackathon-simplified)

- ASP.NET Core Identity + JWT Bearer
- No registration flow built — 5 pre-seeded accounts:
  - `staff@hfa.demo` — HFA staff (internal)
  - `lender@demo.com` — Lender (external, Case 1 participant)
  - `inspector@demo.com` — Inspector (external, Case 2 participant)
  - `owner@demo.com` — Property owner (external, Case 2 participant)
  - `lender2@demo.com` — Sub-contributor (added live during demo)
- Login returns JWT; stored in Ionic/Angular via `@capacitor/preferences` (or localStorage for hackathon)

---

## 5. API endpoints

### Auth
```
POST /api/auth/login          → { token, user }
```

### Cases
```
GET  /api/cases               → case list with overdue counts, progress
GET  /api/cases/{id}          → full case detail (items + participants + recent events)
```

### Items
```
POST /api/cases/{id}/items              → create item (HFA only)
PUT  /api/items/{id}/status             → update status (Submitted / UnderReview / Accepted / Returned)
PUT  /api/items/{id}                    → edit title / due date / owner (HFA only)
POST /api/items/{id}/cancel             → cancel/archive (HFA only)
POST /api/items/{id}/reassign           → reassign owner
```

### Activity & threads
```
GET  /api/cases/{id}/activity           → paginated event log
POST /api/items/{id}/threads            → add note or question
PUT  /api/threads/{id}/resolve          → resolve a question
```

### Participants
```
POST /api/cases/{id}/participants       → invite / add participant
```

### SignalR Hub: `/hubs/case`
```
Client joins group: JoinCase(caseId)
Server broadcasts:  ItemUpdated(event)   — on any item status change
                    EventAdded(event)    — on any activity log entry
                    ParticipantAdded(participant)
```

---

## 6. Core screens

### 6.1 HFA Dashboard
- List of all 3 cases, each showing: title, type badge, overdue count (red), outstanding item count, progress bar
- Type filter (All / Construction Draw / Inspection / Application)
- Overdue cases visually distinct (red left border + count badge)

### 6.2 Case Detail
- **Outstanding items list**: title, owner avatar, due date, status badge, overdue flag, open-question badge
- **Participant sidebar**: identity-label role, who added them
- **Activity log**: single timeline — system events as the spine, threaded notes/questions as collapsed references ("3 comments on Income Verification → expand")
- Item row tap → item detail sheet

### 6.3 Item Interaction
- **External participant**: Mark Submitted, Add Note, Ask Question
- **HFA staff**: Accept, Return (with note), Edit title/due date/owner, Cancel, Reassign
- Every action fires a `POST` and the SignalR hub broadcasts `EventAdded` to all case participants

### 6.4 Login
- Email + password → JWT → route to dashboard
- Two quick-login buttons for demo: "Log in as HFA Staff" / "Log in as General Contractor" (pre-fill credentials)

---

## 7. Hero demo flow

**Scenario**: Draw #4 for Maple Street Affordable Housing — a mid-flight monthly draw package where the GC's pay application is ready to submit but an open question is blocking the architect certification.

1. HFA staff logs in → sees dashboard with 3 cases; Maple Street draw is amber (1 overdue, items outstanding)
2. Opens **Construction Draw — Maple Street** case → sees 5 items, GC and Inspector already in participants
3. On second device: **GC logs in** → lands in the full shared case view — sees every item, every participant, the full activity log
4. GC finds a blocker on the architect certification → asks a question: *"Building C is only 72% complete per the inspector — do you need a revised schedule before I submit the arch cert?"*
5. HFA sees the open-question badge appear **live** on the Architect Certification item, without refreshing
6. HFA answers the question inline → marks it **Resolved**; badge clears on GC's screen live
7. GC pulls in their **Architect** as a sub-contributor to handle the certification directly — addition appears as a system event for all to see
8. GC marks **Contractor Pay Application** → Submitted
9. HFA's activity log entry appears **live** — *"GC submitted Contractor Pay Application"* — **no email sent**
10. HFA moves it to Under Review → event broadcasts back to GC's screen

### The money shot
Step 9: the instant "Mark Submitted" fires on the GC's device and the HFA's timeline updates in real time — replacing the broken status quo where a partner uploads something and then has to separately email a human to say so.

### Pre-demo checklist
- HFA staff and GC accounts logged in on separate devices/browsers
- SignalR WebSocket connected (verify in DevTools Network tab)
- Case 1 seeded in mid-flight state: open question pre-loaded on architect cert item, pay app in Pending
- Case 2 showing red/overdue on dashboard for visual contrast

---

## 8. Seed data

### Case 1 — Construction Draw #4 · Maple Street Affordable Housing *(hero case)*
- **Type**: Construction Draw
- **Participants**: HFA staff, General Contractor, Inspector (pre-seeded); Architect added live during demo
- **State**: Mid-flight — some items accepted, one overdue, one with open question
- **Items**:
  - Inspection Report → *Accepted* (Inspector submitted, HFA accepted in prior draw cycle)
  - Construction Progress Photos → *Accepted*
  - Contractor Pay Application → *Pending* (GC submits this live during demo)
  - Architect Certification → *Pending* — has **open question**: *"Building C is showing 72% complete in the inspection report but 85% in the schedule. Which is current?"*
  - Lien Waivers (Subcontractors) → *Overdue* (due date past, GC hasn't submitted)
- **Activity log pre-seeded**: nudge sent on lien waivers ("Reminder sent to GC — lien waivers overdue by 2 days")

### Case 2 — Multifamily Inspection Deficiencies · River Bend Apartments *(overdue/red)*
- **Type**: Inspection
- **Participants**: HFA staff, property owner, inspector
- **State**: One item past cure-period deadline → red on dashboard
- **Items**:
  - Correct life-threatening deficiency (smoke/CO detector) → *Overdue*
  - Submit evidence-of-repair photos → *Pending*
  - Certify deficiency correction → *Pending*
- Activity log: "Nudge sent to Property Owner — smoke/CO deficiency overdue by 4 days"

### Case 3 — Application Review · Elmwood Senior Housing *(nearly complete/green)*
- **Type**: Application
- **Participants**: HFA staff, lender
- **State**: Mostly done — strong progress bar, contrast against Case 1's amber
- **Items**: Environmental Clearance (*Accepted*), Market Study (*Accepted*), Financial Statements (*Accepted*), Zoning Approval (*Under Review*)

---

### Pre-seeded accounts

| Email | Role | Cases |
|---|---|---|
| `staff@hfa.demo` | HFA Staff (internal) | All cases |
| `gc@maplestreet.demo` | General Contractor | Case 1 |
| `inspector@demo.com` | Inspector | Cases 1 & 2 |
| `owner@riverbend.demo` | Property Owner | Case 2 |
| `lender@elmwood.demo` | Lender | Case 3 |
| `architect@demo.com` | Architect (sub-contributor, added live) | Case 1 |

---

## 9. Build vs mock

| Build | Mock |
|---|---|
| HFA Dashboard | Case creation (pre-seeded data) |
| Case detail (items + log + participants) | Email invitation delivery (log in as pre-created account) |
| Item status updates with live SignalR | Push notification scheduler ("nudge sent" in seed data) |
| Pre-seeded JWT auth | Multi-tenancy enforcement (`hfa_id` on schema, not enforced) |
| Threaded notes/questions + resolve | Participant removal UI |
| Participant sidebar | Registration/onboarding flow |

---

## 10. Developer split

**Dev 1 — Backend**
- Day 1 AM: Project setup, EF Core models, migrations, seed data, JWT auth
- Day 1 PM: REST endpoints (cases, items, activity), SignalR hub scaffolded
- Day 2 AM: Item mutation endpoints, SignalR broadcasting on every state change
- Day 2 PM: End-to-end SignalR test, seed data polish

**Dev 2 — Frontend**
- Day 1 AM: Ionic/Angular project setup, routing, auth service, login screen, tab shell
- Day 1 PM: Dashboard screen wired to API
- Day 2 AM: Case detail screen (items list + participant sidebar + activity log)
- Day 2 PM: Item interaction (status updates), wire SignalR client → live updates

**Sync point:** End of Day 1 — agree on final API shapes before Day 2 diverges.

---

## 11. Out of scope (v1)

- Document storage / file upload
- Sensitive-field redaction for externals
- Cross-HFA unified partner view
- Automatic case creation from Lotus / multifamily suite
- AI-powered features
- Real-time chat beyond case-anchored threaded notes
- Case creation UI (Tier 2 — build only if core loop is solid with time remaining)

---

## 12. Visual direction

Modern SaaS (Linear/Notion spirit): restrained neutral palette, single functional accent (`#1593D8`), status via subtle color + shape, generous whitespace.

**Dual density**: HFA dashboard = dense command center. External partner case view = calmer, more guided. Same design tokens, different density.

**Status language** (plain English, define once, use everywhere):
- Pending → neutral
- Submitted → accent blue, in-motion
- Under Review → accent blue, attention
- Accepted → success green
- Returned → caution amber
- Overdue → error red (overlay flag on any non-terminal status)
- Open question → small distinct badge, clears on resolve
