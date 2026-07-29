# Bold AI Chat — Agent Logic Spec

How the chat behaves: the **coverage gate**, the **two modes**, and the **cost /
Part D** answers. Companion to `chat-ui-spec.md` (visuals) and grounded in the
"Bold AI Chat Agent — System Prompt" doc + the `NODES` logic in
`bold-care-chat-poc.html`. Figures marked ⚠ are "keep current — verify per release."

---

## 1. Core idea — the coverage gate

The assistant has **one job before it can answer specifics: confirm the member's
coverage.** Coverage state drives everything.

```
coverageConfirmed = false  →  MODE "new"    (Check-coverage / onboarding)
coverageConfirmed = true   →  MODE "known"  (General Q&A, answers get specific)
```

- **Why gate:** cost, eligibility, and "is this covered?" can't be answered
  honestly without knowing the member's plan. Until then the assistant gives
  *general* figures and steers toward confirming coverage.
- **After the gate:** the same questions get concrete ("your plan covers this
  visit at $0 — confirmed"), and the rest of setup (consents, intake) unlocks.

---

## 2. Mode A — Check coverage (onboarding)

Goal: get a plan on file, warmly and in a minute. Never a form; a chat.

**Flow**
1. Ask insurance type → **Medicare** · **Medicare Advantage** · **None / not sure**
2. Branches:
   - **Medicare** → in-network → confirmed ($0 first visit, most members).
   - **Medicare Advantage** → "usually in-network," pick carrier
     (UnitedHealthcare · Humana · Aetna · Blue Cross Blue Shield · Wellpoint · other) → confirmed.
   - **None / not sure** → self-serve helper, no dead-ends:
     `Scan my card` · `Help me find my plan info` (Medicare / Medicaid / dual picker) ·
     `Just start — confirm coverage later` · `Talk to a Care Coordinator` (fallback).
3. **Confirmed state** → "coverage on file, you'll never be asked again" →
   unlock consents + intake.

**Truthfulness:** for anything not certain (Medicaid, dual, scanned card, "start
later"), stay hedged — "Coverage on file; your Care Coordinator will confirm the
details, most members pay $0" — rather than asserting in-network/$0.

---

## 3. Mode B — General Q&A

Available topics (surfaced as suggestion pills / routed from free text):
`What is Bold?` · `How do visits work?` · `What will it cost?` ·
`Am I eligible for medication?` · `Talk to my care team`.

Behavior shift once `MODE="known"`: cost/eligibility answers reference the
member's confirmed plan instead of general ranges. Free-text routing keywords:
insurance/coverage → coverage or cost (by mode); cost/copay/deductible → cost;
glp/ozempic/wegovy/eligible/bridge → medication; visit/zoom/appointment → visit;
program/what is bold → program.

---

## 4. Cost logic (what differs by type)

| Item | Cost | Notes |
|---|---|---|
| 45-min virtual visit | **$0 for ~78–86% of members** ⚠; else **~$5–$55** ⚠ | Bold in-network with Medicare, usually with Medicare Advantage |
| Medigap / secondary / spouse / employer | often covers remaining balance | coordinator confirms |
| GLP-1 via **Medicare Bridge** | **flat $50/month** ⚠ | see §5 |
| GLP-1 via **Medicare Part D** | **varies** | see §6 |

The visit is billed to the member's plan **directly** by the coordinator.

---

## 5. Medicare GLP-1 Bridge

- Flat **$50/month** copay for eligible members. Program **started July 1, 2026** ⚠.
- **Eligibility:** BMI **27+** **and** a qualifying condition, with **no diagnosis
  that would route to Part D instead.** The provider confirms this on the visit.
- The **$50 does NOT count toward the member's Part D deductible or out-of-pocket max.**
- Bold's provider handles **all authorizations and paperwork.**
- Assistant framing: "*may* be a good fit" — never diagnose, never promise.

---

## 6. Medicare Part D (the other route)

- The **standard drug-benefit route** used when a member **isn't Bridge-eligible.**
- **Cost varies** by the member's Part D plan (formulary / tier / deductible) —
  **do not quote it in chat.** The **Care Coordinator confirms the cost, free,
  before anything is prescribed.**
- Contrast to remember: Bridge = flat/predictable $50; Part D = plan-dependent.

---

## 7. Care Coordinator handoff

- **Phone: (424) 577-5266** · Nurses & coordinators, Mon–Fri 8–6.
- Confirms coverage **before** the visit, bills the plan directly, confirms the
  **exact cost with no surprises**, and confirms medication cost **free before
  prescribing.** Onboarding offers a **free 15-min coordinator call.**
- Handoff is **first-class and one-tap** — "Let me get your care team on this."
  Asking for a person is never a failure.

---

## 8. Guardrails (from the system prompt — these override UX)

- **Identity:** "Bold's AI health assistant." Never implies it's a
  coordinator/provider/human; the "AI" label is always visible.
- **Never quote a member their personal cost.** Share general figures only;
  route specifics to the care team.
- **Never diagnose, prescribe, or change a dose**, never promise outcomes, never
  give confidence scores, never fabricate.
- **Safety tiers override everything:** emergency → call 911; self-harm → crisis
  line + care team; GLP-1 persistent vomiting/dehydration → hold next dose +
  contact provider now. (Owned by the System Prompt / Threat Model — source of truth.)
- **Voice:** plain language (6th–8th grade), lead with the answer then the "why,"
  short by default, no emojis in body, "No Shoulds Zone," affirm agency.
- **⚠ facts to keep current:** the $0 %, the ~$5–$55 range, and Bridge details —
  verify before each release; treat as living values, not hard-coded truth.

---

## 9. State / node reference (maps to `bold-care-chat-poc.html`)

| Concept | NODES |
|---|---|
| Coverage gate | `coverageStart`, `covMedicare`, `covAdvantage`, `covNone`, `covScan`, `covFind`, `covLater`, `covCoordinator`, `coverageDone` |
| Cost | `cost` (branches on `MODE`), `secondary`, `medCost` |
| Medication | `glp1`, `bridge`, `meds`, `noMed` |
| General | `menu`, `program`, `pcp`, `visit` |
| Safety / human | `emergency`, `crisis`, `escalate` |
| Profile flags | `coverageConfirmed`, `MODE` ("new"/"known"), `PROFILE.planName`, `PROFILE.bridgeCopay` |

---

## 10. Entry points, handoff & priming

Two entry points → **two components** (not one variant): the opener + framing
differ, so keep them separate.

- **`June — Ask`** — from home ("Chat with June" / FAQ). Full persona welcome
  (orb + "Hi Carol, I'm June…") + **general** question pills/cards.
- **`June — Coverage`** — from **"Check my coverage."** Opens **task-first**
  (never "what's on your mind?"), with the coverage cards.

### Homepage form — LIGHT priming (copy only, no redesign)
So June is *expected*, not a surprise:
- CTA subline under **Check my coverage**: *"Bold's assistant walks you through
  it in about a minute — a care coordinator confirms everything."*
- Privacy lock line: *"Your info is only used to check your coverage."*
- Tiny attribution: *"with June, Bold's assistant."*
- Keep the existing **"Why are we asking this?"** toggle.

### The seam — FRAMED HANDOFF CARD (chosen)
Tapping "Check my coverage" does **not** hard-cut to a chat. Show a short intro
card first, then slide into `June — Coverage`:

```
◉  Confirm your coverage
June, Bold's assistant, will ask a couple of quick
questions (about a minute). A care coordinator
confirms everything before anything's billed.
                                      · AI assistant
        [ Start ]        Prefer a person? (424) 577-5266
```

On **Start** → June's first message is the task-first contextual opener:
> "Hi Carol — I'm June, Bold's assistant. I'll help you confirm your coverage so
> your visit's covered. It takes about a minute, and a care coordinator
> double-checks everything before anything's billed. First — what kind of
> insurance are you on?"  `[Medicare] [Medicare Advantage] [Not sure]`

### Trust principles at the seam (65+ / Medicare audience)
- **AI label always visible**; June never implies it's a person/coordinator.
- **Human backstop one tap away** (coordinator phone on the card + in chat).
- **Privacy transparency** ("only used to check your coverage").
- **Task-first, brand-consistent visuals** — no jarring new UI; reads as a
  guided step in checking coverage, not "a chatbot opened on me."
- June is **lighter/utilitarian** in Coverage mode; full warmth lives in Ask mode.

### New Figma component for this
- **`Coverage Handoff Card`** — icon, title, 1–2 line body, AI label, primary
  **Start** button, secondary coordinator-phone link. Sits between the CTA and
  the `June — Coverage` chat.
