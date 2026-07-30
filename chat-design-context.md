# Bold AI Chat — Design Context & Decisions

*Prepared for Brian (data science) as we plumb the chat service end-to-end. Written by Izabela with Claude, drawn from the working prototype and specs.*
*Last updated: July 2026.*

This is the design thinking behind the June chat prototype — the behavior model, the
rules that shape what the assistant says, the reuse model for standing up more chat
agents, and the technical shape of the prototype. It's meant to give you the same
context I have so the chat you build lines up with the design intent.

**Living artifacts (source of truth over this doc where they conflict):**
- **Working prototype (user-testing build):** https://izabela-del.github.io/bold-chat/june-web.html
- **Behavior/agent-logic spec:** [`figma-chat-ui/chat-agent-logic-spec.md`](figma-chat-ui/chat-agent-logic-spec.md) — the coverage gate, modes, cost/Part D answers.
- **UI spec + reusable component kit:** [`figma-chat-ui/chat-ui-spec.md`](figma-chat-ui/chat-ui-spec.md), [`figma-chat-ui/`](figma-chat-ui/)
- **Live backend proxy:** [`api/june.js`](api/june.js) — server-side system prompt + Claude call.
- Other prototypes: [`bold-onboarding-june.html`](bold-onboarding-june.html) (phone-mock), [`bold-care-chat-poc.html`](bold-care-chat-poc.html) (member-app chat).

---

## 0. Your two questions — short answers

**Q: Start with 3–4 pre-selected common questions/objections, or jump straight into onboarding?**
**Both — keyed to the user's intent, which the entry point tells us.** If they arrived with intent
("Check my coverage"), jump straight into the task-first onboarding — don't make them wade through
pills. If the entry is exploratory ("Ask June", FAQ), open with 3–4 pills (cost, eligibility,
safety/privacy, how visits work) **plus** a lead pill that steers to coverage. **If we plumb one path
first, start with the pills + free-text surface** — it's the simpler shell, and answering cost/eligibility
objections early is where we save the most drop-off. Either way, every path steers back to confirming
coverage. (Detail in §2 and §3.)

**Q: Can/should the base chat interface be shared across agents (care-coordinator vs. health/nutrition coach)?**
**Yes — share the shell, separate the logic.** Three layers: (1) a shared chat *shell*
(bubbles, header, composer, pills, control widgets, accessibility) built once and reused — already
componentized in the Figma kit; (2) a *theme* layer per agent (avatar/name/color/label) as tokens;
(3) per-agent *logic* (prompt, flows, tools, safety) — the real difference. One flag: a care coordinator
may be a **human**, which needs an additive presence/delivery-state module the AI coach won't. Net: the
shell is basically done, so spinning up a new agent is mostly theming + its flow. (Detail in §11.)

---

## 1. What the chat is for

June is Bold's AI health assistant for a **Medicare, 65+** weight-management / healthy-aging audience.
In the onboarding context, the chat has **one job before anything else: confirm the member's coverage.**
Everything about the design serves that job while being warm, trustworthy, and genuinely helpful.

---

## 2. Core behavior model — the coverage gate + two entry points

**The coverage gate.** Coverage state drives the whole conversation:

```
coverageConfirmed = false  →  give GENERAL figures, steer toward confirming coverage
coverageConfirmed = true   →  answers get SPECIFIC to the member's plan; rest of setup unlocks
```

We gate because cost / eligibility / "is this covered?" can't be answered honestly without knowing the
member's plan. Until then June gives general ranges and offers to confirm coverage; after, the same
questions get concrete ("your plan covers this visit at $0 — confirmed").

**Two entry points = two instances** (not one screen with a toggle):
- **June — Ask** (from a floating button / FAQ / general curiosity): a focused Q&A opener —
  "Ask me anything about Bold…" + 3–4 question pills. No onboarding preamble.
- **June — Coverage** (from a "Check my coverage" CTA): **task-first.** Opens on the task
  ("Let's confirm your coverage — then I can give you a better estimate"), not "what's on your mind?"

In the prototype these are two code paths (`runAsk()` vs `run()` → `runOnboarding()`), selected by
`enterJune(mode)`. The Ask instance always includes a lead pill — "Let's verify my coverage →" — that
hands off into the onboarding flow. **Design principle: no matter where the member starts, steer back
to confirming coverage.**

---

## 3. Pills vs. jump-in — the fuller reasoning

- **Intent-first routing.** A click on "Check coverage" is a declared intent; respect it and go straight
  to the task. An ambiguous entry needs help forming a question — that's what pills are for.
- **Objections early = less drop-off.** Cost and eligibility are the top places this audience bails.
  Surfacing them as answerable pills up front (and answering honestly) beats hiding them behind a form.
- **Pills solve the blank-composer problem.** A 65+ user often doesn't know what they're "allowed" to
  type. 3–4 concrete options lower that barrier; free text is still there for anyone who wants it.
- **Recommended starter pills:** *What will it cost?* · *Am I eligible for medication?* ·
  *Is this safe & private?* · *How does the visit work?* (+ a lead "verify my coverage" pill).
- **If we ship one path first:** the pills + free-text surface is the simpler shell and the higher-value
  one to validate; the structured onboarding sequence (chips, fields, scheduler, consents) layers on top.

---

## 4. Cost & eligibility — the honesty rules (important for the model)

These are the trickiest answers and the ones most likely to erode trust if wrong. The rules:

- **Lead with the figures, don't deflect to a human.** Virtual visits are **$0 for most members**
  (~78–86% ⚠); otherwise roughly **$5–$55** per 45-min visit. ⚠ = "keep current, verify per release."
- **GLP-1 via the Medicare GLP-1 Bridge = flat $50/month** ⚠ for eligible members; Bold's provider
  handles all authorizations.
- **Never claim Part D (or any plan) automatically covers a GLP-1 — it does not.** If the Bridge isn't a
  fit, stay open and honest: the member **may still qualify through other conditions**, and there can be
  **other discounts depending on their plan.** A care coordinator explores every option **for free before
  anything is prescribed.**
- **Never quote a personal cost** the assistant can't actually know. Give general figures, then
  **ask** whether they'd like to confirm coverage for a better estimate.
- **The cost → coverage on-ramp:** after answering a cost question, June asks
  *"Do you want me to confirm your coverage to get a better estimate?"* with **Yes** / **"No, I have
  more questions."** If they decline, keep answering warmly — never push.

Full matrix, Bridge eligibility (BMI 27+ and a qualifying condition, no Part-D-routing diagnosis), and
the "$50 doesn't count toward Part D deductible/OOP max" note live in the agent-logic spec §4–6.

---

## 5. Answer-first, and human handoff as a first-class option

- **Answer-first.** Default to answering with what we know about Bold. A hand-off to a person is an
  optional *next* step, never a substitute for answering. Do **not** reply with only "want me to connect
  you to Team Bold?" when June could answer. This was a specific correction during design — early versions
  deflected cost questions to a human, which we killed.
- **Handoff is one tap and never a failure.** Asking for a person is always honored immediately. A free
  15-minute care-coordinator call is part of getting set up; the coordinator confirms coverage, bills the
  plan directly, and confirms exact cost with no surprises before anything is charged.

---

## 6. Conversational data collection (not a form)

When the member chooses to confirm coverage, June collects details **one at a time, conversationally** —
never a wall of form fields:

- Order: first name → (gentle spelling check) → last name → email → date of birth → insurance.
- **Only after they opt in** to confirming coverage — we don't front-load a form on the landing page.
- **Read the name back** and ask them to confirm it matches their insurance / ID card **exactly**
  (Medicare eligibility is name-match sensitive).
- If they came from a landing form, recap what we have and confirm before proceeding.

**Input robustness we built (worth mirroring server-side / in the real build):**
- **Validation** — no empty values, no "there"; email format-checked; height/weight require plausible numbers.
- **Gentle name-typo confirm** — if a first name is one edit away from a common name (e.g. "Kartie" →
  "Katie"), June asks which they meant rather than silently "correcting"; keeps the unique spelling if they confirm.
- **DOB auto-formats to MM/DD/YYYY** as they type, respecting slashes they type or paste
  ("1/1/1958" stays correct, normalizes to 01/01/1958), and rejects implausible dates.
- **Fields default blank** in the testing build so participants enter their own data.

---

## 7. Staying on task + self-correction (recent design work)

Because a free-text composer runs *alongside* the guided flow, two things had to be handled so an aside
doesn't derail the goal:

- **Asides don't abandon the flow.** If the member interrupts mid-onboarding to ask something, June
  answers, then **re-anchors on confirming coverage** and re-surfaces the pending step — instead of
  drifting into an open-ended "How can I help you today?"
- **June owns and overwrites its own collected data.** If the member corrects their name / email / DOB,
  June **updates it directly and confirms** ("Done — I've updated your name to Izabela") rather than saying
  "I can't edit your profile, ask your care team." (Corrections to *clinical* info or the *confirmed
  insurance/plan* still route to the care team — those aren't June's to change.)

In the prototype these are handled client-side so they're reliable even if the model is off; the server
prompt was also updated to match. In the real build this is a good candidate for **explicit tools/actions**
(e.g. `updateProfileField`, `resumeFlow`) rather than relying on the model to infer intent.

---

## 8. Voice, tone & vocabulary

Follows the "Bold AI Chat Agent" system-prompt doc (mirrored in [`api/june.js`](api/june.js)):
warm/expert/playful, **plain language (6th–8th grade), lead with the answer, short by default, no emojis.**
"No Shoulds Zone" — encourage the next small step, never use fear to motivate, a missed day is a clean
slate. Affirm agency and independence.

**Vocabulary — use:** Members, Older Adults, Team Bold, Provider, Trainer, Movement, Care Plan, Step.
**Avoid:** Users, Elderly, Seniors (unless the member says it first), Workout, Fitness, Program, Class.

---

## 9. Safety tiers (override everything)

These outrank all UX and tone, and the model must never soften them:
1. **Emergency** (chest pain, trouble breathing, stroke signs, fainting) → tell them to call **911** now.
2. **Self-harm** → care + **988** Suicide & Crisis Lifeline, offer the care team; don't counsel or minimize.
3. **GLP-1 urgent safety** (persistent vomiting / dehydration ~24h) → per protocol, **hold next dose +
   contact provider now**, offer a hand-off.
4. **Route to a human** anytime clinical judgment, dosing, lab interpretation, or a person is requested.

Never diagnose, prescribe, change a dose, promise outcomes, give confidence scores, or fabricate. The
system-prompt / threat model is the source of truth for these.

---

## 10. Accessibility & trust (65+ / Medicare)

- **Accessibility:** large readable type (Figtree + Source Serif 4), high contrast (we specifically
  darkened light greys for older eyes), generous tap targets, **read-aloud** (speech synthesis) and
  **voice input** (speech recognition), reduced-motion support.
- **Trust at the seam:** the **"AI" label is always visible** — June never implies it's a person or a
  coordinator. A **human backstop is one tap away** (coordinator phone on the intro card and in chat).
  **Privacy is stated plainly:** info is used only to confirm eligibility and shared with the Bold care
  team — never sold. A **framed handoff card** precedes the coverage chat so it reads as a guided step,
  not "a chatbot opened on me."

---

## 11. Reuse model — one shell, many agents

Split the system into three layers; the top layer is ~80–90% reusable across agents:

| Layer | What's in it | Shared? |
|---|---|---|
| **Chat shell** | message list, bot/member bubbles, typing indicator, header (avatar/name/AI label/close), composer (text/send/voice), suggestion pills, inline control widgets (chips, fields, cards, scheduler), read-aloud, 65+ a11y | **Shared** — built once; already componentized in the Figma kit (Chat/Bubble set, Header, Composer, Send Button, Suggestion Pill) |
| **Theme** | avatar, name, accent color, label ("AI assistant" vs "your coordinator" vs "your coach") | **Per agent, but config** — token swap, not a redesign |
| **Agent logic** | system prompt / persona, conversation flows, tools/actions, pill content, safety & escalation rules | **Per agent** — the real differentiator |

**The one scoping flag:** a **care-coordinator** chat may have a **human** on the other end, while a
**coach** may be AI. The *visuals* are shared, but human chat needs an **additive state model** the AI
shell doesn't: presence / availability windows, message delivery & queue states ("a coordinator will
reply in ~X"), and notifications for async replies. So it's "one shell + a human-presence module," not
two designs. Worth scoping explicitly so the coordinator side isn't under-estimated.

**Bottom line on effort:** because the reusable shell already exists (Figma components + the working
prototype), standing up a new agent's chat is mostly (a) theme tokens and (b) its flow/prompt — not a new
chat UI each time.

---

## 12. How the prototype is built (for plumbing reference)

- **Front end:** single-file HTML/CSS/JS. A small **async/await conversation engine** drives the flow —
  helpers like `bot()`, `me()`, `control()`, and awaitable widgets `askChips()`, `askField()`,
  `askYesNo()`, `askHeight()`, `askWeight()`. Each inline control renders a widget and resolves a Promise
  when the member answers, so the guided flow reads as straight-line `await` code. A progress bar and
  suggestion pills sit on top.
- **Live backend:** [`api/june.js`](api/june.js) is a **Vercel serverless proxy**. It holds the Anthropic
  API key **server-side** (never in the browser), injects Bold's system prompt, and forwards the
  conversation to the Claude Messages API. It's **CORS-locked** to Bold origins, has a shared-secret
  handshake header, and best-effort per-IP rate limiting; the real cost backstop is a spend cap on the key.
- **Graceful degradation:** if the proxy is unavailable, the client falls back to **canned intent-based
  replies**, so the demo never dead-ends. Model is currently `claude-opus-4-8` (swappable).
- **Note for the real build:** the prototype infers some intents (corrections, cost questions) with regex
  heuristics client-side for reliability. In production these are better as **explicit tool calls / a
  structured state machine** around the model, with the model doing language and the app owning state
  (profile, coverage status, flow position).

---

## 13. Open questions / decisions to make together

- **Default entry** for the first end-to-end version — Ask (pills) or Coverage (jump-in)? (I lean Ask for
  the MVP shell; see §0/§3.)
- **State ownership:** which of profile / coverage status / flow position lives in the app vs. is inferred
  by the model? (Recommend app-owned, model-assisted.)
- **Tooling surface:** what actions do we expose to the model (update field, confirm coverage, book
  coordinator call, hand off to human)?
- **Human presence:** is the care-coordinator agent AI, human, or hybrid — and what async/notification
  behavior does that imply? (§11.)
- **Which ⚠ figures are canonical** ($0 %, $5–$55 range, Bridge $50) and who owns keeping them current.
- **Persistence & PHI handling** for real member data (the prototype uses none of this).

---

*Questions or want any section expanded — ping Izabela. The prototype and specs linked at the top are the
most current source of truth.*
