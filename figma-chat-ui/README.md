# Bold — Chat UI Builder (Figma plugin)

Generates the Bold AI **chat screen** as native, editable Figma layers (auto-layout
frames, real text, matched colors) so you can iterate on it in Figma.

## Run it

1. Download this folder (`manifest.json` + `code.js`) to your machine.
2. In the Figma **desktop app**, open the file you want to build into
   (e.g. `Untitled` → file key `BFAh85XW5XxjtdTbP9FbX8`).
3. Menu → **Plugins → Development → Import plugin from manifest…** → pick `manifest.json`.
4. Menu → **Plugins → Development → “Bold — Chat UI Builder”**.
5. A 393×852 phone frame named **“Bold AI — Chat”** appears on the current page,
   selected and zoomed to.

### No-import alternative (Scripter)
Install the free **Scripter** plugin, paste the contents of `code.js`, and Run.
(Skip the `manifest.json` step.)

## What it builds
A single chat screen: status bar → header (orb avatar, “Bold AI” + AI tag,
“Care Coordinator · replies instantly”) → thread (bot + user bubbles) →
suggestion pills → composer (Topics button, input, send).

## Notes
- **Font:** Figma ships **Inter**, not Figtree, so the script uses Inter at the
  same sizes/weights. If you have Figtree installed, swap `"Inter"` → `"Figtree"`
  at the top of `code.js` (and adjust styles if needed).
- Everything is plain auto-layout + text — no components/variables yet. Say the
  word and I can add a version that publishes bubble/pill **components** and
  wires your color/text **variables**.
- Tokens mirror `bold-care-chat-poc.html` — see `chat-ui-spec.md`.
