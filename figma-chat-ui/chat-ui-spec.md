# Bold AI Chat — UI spec (context for Figma)

Reference spec for the Bold AI chat screen from the `bold-chat` prototype
(`bold-care-chat-poc.html`, live at izabela-del.github.io/bold-chat). Use this as
context for Figma AI (First Draft / Make) or when hand-building components.

Target file: `Untitled` — key `BFAh85XW5XxjtdTbP9FbX8`, page node `0:1`.

## Color tokens
| Token | Hex | Use |
|---|---|---|
| ink | `#16121f` | primary text |
| ink-soft | `#5a5566` | secondary text / role |
| line | `#e9e6f0` | dividers, header/composer borders |
| brand | `#5b16e0` | user bubble, send button, AI tag |
| brand-press | `#4a10bd` | pill text, Topics text |
| brand-soft | `#efe9fe` | Topics button fill |
| bot-bubble | `#f6f4fc` fill / `#ece6f8` border | assistant bubbles |
| pill-border | `#d9d2f2` | suggestion pill + input border |
| page | `#ffffff` | screen background |

## Type (Inter — Figtree in the web app)
- Header name: 16 / Semi Bold / ink
- Header role: 12 / Medium / ink-soft
- AI tag: 10 / Bold / white, +0.4 tracking
- Bubble text: 16 / line-height 24 — Regular (bot), Semi Bold (user)
- Pill: 15 / Bold / brand-press
- Placeholder: 15 / Regular / #8b86a0

## Layout — screen 393 × 852 (vertical stack)
1. **Status bar** — height 46, white, `9:41` left + signal/wifi/battery right, padding 28/24.
2. **Header** — padding 10/14, gap 11, 1px bottom border (`line`):
   - Orb avatar 40×40 (radial gradient light→violet→deep purple)
   - Name row: “Bold AI” + **AI** tag (brand pill, radius 6, padding 2/6)
   - Role: “Care Coordinator · replies instantly”
3. **Thread** — fills remaining height, padding 16/15, gap 13:
   - **Bot bubble**: fill `bot-bubble`, 1px `#ece6f8`, radius 18 (top-left 7), padding 14/16, max text width ~268.
   - **User bubble**: fill `brand`, white text, radius 18 (top-right 7), right-aligned.
   - **Suggestion pills** (wrap, gap 8): white, 1.5px `pill-border`, radius 22, padding 11/16.
4. **Composer** — padding 12/14, 1px top border, gap 7:
   - **Input shell**: radius 24, 1.5px `pill-border`, padding 5/6, contains:
     - **Topics** button (brand-soft, radius 20, height 40, “≡ Topics”)
     - placeholder “Type your own question…”
     - **Send** circle 40, brand fill, white “↑”

## Sample content
- Bot: “Hi Carol — I'm Bold AI, your care coordinator, and I'm really glad you're here.”
- Bot: “Let's start by getting your insurance sorted so your visit's covered — and you can ask me anything along the way, that's what I'm here for.”
- User: “How does the visit work?”
- Bot: “Your first visit is a 45-minute video call with your Bold provider, right from home — no travel, no waiting room.”
- Pills: “Confirm my insurance” · “What will it cost?” · “Am I eligible for medication?”
