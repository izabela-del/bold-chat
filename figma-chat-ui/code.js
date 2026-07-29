// Bold — Chat UI Builder (Figma plugin)
// Builds the Bold AI chat screen as native, editable Figma layers.
// Run: Plugins → Development → "Bold — Chat UI Builder".
//
// Design tokens mirror bold-care-chat-poc.html (:root):
//   ink #16121f · ink-soft #5a5566 · line #e9e6f0 · brand #5b16e0
//   brand-press #4a10bd · brand-soft #efe9fe · bot bubble #f6f4fc / border #ece6f8
// Figma ships Inter (not Figtree), so this uses Inter at matched sizes/weights.

(async () => {
  // ---- font loading (must precede any text) ----
  const FONTS = ["Regular", "Medium", "Semi Bold", "Bold"];
  for (const style of FONTS) {
    await figma.loadFontAsync({ family: "Inter", style });
  }

  // ---- helpers ----
  const hex = (h) => {
    h = h.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    };
  };
  const solid = (h, a = 1) => [{ type: "SOLID", color: hex(h), opacity: a }];

  function mkText(chars, o = {}) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: o.style || "Regular" };
    t.characters = chars;
    t.fontSize = o.size || 16;
    t.fills = solid(o.color || "#16121f");
    t.textAlignHorizontal = o.align || "LEFT";
    if (o.lh) t.lineHeight = { value: o.lh, unit: "PIXELS" };
    if (o.spacing != null) t.letterSpacing = { value: o.spacing, unit: "PIXELS" };
    if (o.width) {
      t.textAutoResize = "HEIGHT";
      t.resize(o.width, t.height);
    } else {
      t.textAutoResize = "WIDTH_AND_HEIGHT";
    }
    return t;
  }

  function frame(name, o = {}) {
    const f = figma.createFrame();
    f.name = name;
    f.fills = o.fill ? solid(o.fill) : [];
    f.clipsContent = o.clip !== undefined ? o.clip : false;
    if (o.layout) {
      f.layoutMode = o.layout; // "HORIZONTAL" | "VERTICAL"
      f.itemSpacing = o.gap || 0;
      f.paddingTop = o.pt || 0;
      f.paddingBottom = o.pb || 0;
      f.paddingLeft = o.pl || 0;
      f.paddingRight = o.pr || 0;
      f.primaryAxisSizingMode = o.primary || "AUTO";
      f.counterAxisSizingMode = o.counter || "AUTO";
      if (o.align) f.counterAxisAlignItems = o.align; // MIN|CENTER|MAX
      if (o.justify) f.primaryAxisAlignItems = o.justify; // MIN|CENTER|MAX|SPACE_BETWEEN
    }
    if (o.radius != null) f.cornerRadius = o.radius;
    if (o.stroke) {
      f.strokes = solid(o.stroke);
      f.strokeWeight = o.strokeW || 1;
      f.strokeAlign = "INSIDE";
    }
    return f;
  }

  const fill = (node) => { node.layoutSizingHorizontal = "FILL"; return node; };

  // ---------------------------------------------------------------
  // PHONE (screen)  393 × 852, vertical stack
  // ---------------------------------------------------------------
  const phone = frame("Bold AI — Chat", {
    fill: "#ffffff", layout: "VERTICAL", primary: "FIXED", counter: "FIXED",
    radius: 0, clip: true,
  });
  phone.resize(393, 852);

  // ---- status bar ----
  const status = frame("statusbar", {
    fill: "#ffffff", layout: "HORIZONTAL", counter: "CENTER", justify: "SPACE_BETWEEN",
    pl: 28, pr: 24,
  });
  status.appendChild(mkText("9:41", { size: 15, style: "Bold", color: "#000000" }));
  status.appendChild(mkText("● ● ●   ⌁   ▮", { size: 12, style: "Bold", color: "#000000" }));
  phone.appendChild(status);
  fill(status);
  status.counterAxisSizingMode = "FIXED";
  status.resize(status.width, 46);

  // ---- header (thead) ----
  const header = frame("header", {
    fill: "#ffffff", layout: "HORIZONTAL", counter: "CENTER", gap: 11,
    pl: 14, pr: 14, pt: 10, pb: 12, stroke: "#e9e6f0", strokeW: 1,
  });
  // avatar orb (radial gradient)
  const avatar = figma.createEllipse();
  avatar.resize(40, 40);
  avatar.name = "avatar";
  avatar.fills = [{
    type: "GRADIENT_RADIAL",
    gradientTransform: [[0.9, 0, 0.05], [0, 0.9, 0.05]],
    gradientStops: [
      { position: 0, color: { r: 0.93, g: 0.96, b: 1, a: 1 } },
      { position: 0.45, color: { r: 0.62, g: 0.52, b: 0.92, a: 1 } },
      { position: 1, color: { r: 0.22, g: 0.06, b: 0.43, a: 1 } },
    ],
  }];
  header.appendChild(avatar);

  const idCol = frame("id", { layout: "VERTICAL", gap: 2 });
  const nameRow = frame("name-row", { layout: "HORIZONTAL", counter: "CENTER", gap: 6 });
  nameRow.appendChild(mkText("Bold AI", { size: 16, style: "Semi Bold", color: "#16121f" }));
  const tag = frame("ai-tag", { fill: "#5b16e0", layout: "HORIZONTAL", counter: "CENTER", pl: 6, pr: 6, pt: 2, pb: 2, radius: 6 });
  tag.appendChild(mkText("AI", { size: 10, style: "Bold", color: "#ffffff", spacing: 0.4 }));
  nameRow.appendChild(tag);
  idCol.appendChild(nameRow);
  idCol.appendChild(mkText("Care Coordinator · replies instantly", { size: 12, style: "Medium", color: "#5a5566" }));
  header.appendChild(idCol);
  phone.appendChild(header);
  fill(header);

  // ---- thread (grows to fill) ----
  const thread = frame("thread", {
    fill: "#ffffff", layout: "VERTICAL", gap: 13, pl: 15, pr: 15, pt: 16, pb: 14,
    primary: "FIXED", counter: "FIXED",
  });
  phone.appendChild(thread);
  fill(thread);
  thread.layoutGrow = 1;

  const MAXW = 268; // bubble text wrap width

  function bubble(text, isMe) {
    const row = frame(isMe ? "row-me" : "row-bot", {
      layout: "HORIZONTAL", primary: "FIXED", counter: "AUTO",
      justify: isMe ? "MAX" : "MIN",
    });
    const b = frame("bubble", {
      layout: "VERTICAL", pt: 14, pb: 14, pl: 16, pr: 16, radius: 18,
      fill: isMe ? "#5b16e0" : "#f6f4fc",
    });
    if (!isMe) { b.strokes = solid("#ece6f8"); b.strokeWeight = 1; b.strokeAlign = "INSIDE"; }
    const t = mkText(text, {
      size: 16, style: isMe ? "Semi Bold" : "Regular",
      color: isMe ? "#ffffff" : "#16121f", width: MAXW, lh: 24,
    });
    b.appendChild(t);
    // tail: flatten one top corner
    if (isMe) b.topRightRadius = 7; else b.topLeftRadius = 7;
    row.appendChild(b);
    thread.appendChild(row);
    fill(row);
    return row;
  }

  bubble("Hi Carol — I'm Bold AI, your care coordinator, and I'm really glad you're here.", false);
  bubble("Let's start by getting your insurance sorted so your visit's covered — and you can ask me anything along the way, that's what I'm here for.", false);
  bubble("How does the visit work?", true);
  bubble("Your first visit is a 45-minute video call with your Bold provider, right from home — no travel, no waiting room.", false);

  // ---- suggestion pills ----
  const pills = frame("suggestions", { layout: "HORIZONTAL", gap: 8, pt: 2 });
  pills.layoutWrap = "WRAP";
  pills.counterAxisSpacing = 8;
  ["Confirm my insurance", "What will it cost?", "Am I eligible for medication?"].forEach((label) => {
    const p = frame("pill", {
      layout: "HORIZONTAL", counter: "CENTER", pt: 11, pb: 11, pl: 16, pr: 16,
      radius: 22, fill: "#ffffff", stroke: "#d9d2f2", strokeW: 1.5,
    });
    p.appendChild(mkText(label, { size: 15, style: "Bold", color: "#4a10bd" }));
    pills.appendChild(p);
  });
  thread.appendChild(pills);
  fill(pills);

  // ---- composer ----
  const composer = frame("composer", {
    fill: "#ffffff", layout: "HORIZONTAL", counter: "CENTER", gap: 7,
    pl: 14, pr: 14, pt: 12, pb: 14, stroke: "#e9e6f0", strokeW: 1,
  });
  const shell = frame("input-shell", {
    layout: "HORIZONTAL", counter: "CENTER", gap: 7, pl: 6, pr: 5, pt: 5, pb: 5,
    radius: 24, fill: "#ffffff", stroke: "#d9d2f2", strokeW: 1.5,
  });
  const topics = frame("topics", { layout: "HORIZONTAL", counter: "CENTER", gap: 5, pl: 13, pr: 13, radius: 20, fill: "#efe9fe" });
  topics.appendChild(mkText("≡ Topics", { size: 12.5, style: "Bold", color: "#4a10bd" }));
  shell.appendChild(topics);
  topics.counterAxisSizingMode = "FIXED";
  topics.resize(topics.width, 40);
  const placeholder = mkText("Type your own question…", { size: 15, style: "Regular", color: "#8b86a0" });
  shell.appendChild(placeholder);
  fill(placeholder);
  const send = frame("send", { layout: "HORIZONTAL", counter: "CENTER", justify: "CENTER", radius: 20, fill: "#5b16e0" });
  send.appendChild(mkText("↑", { size: 18, style: "Bold", color: "#ffffff" }));
  send.primaryAxisSizingMode = "FIXED";
  send.counterAxisSizingMode = "FIXED";
  send.resize(40, 40);
  shell.appendChild(send);
  composer.appendChild(shell);
  fill(shell);
  phone.appendChild(composer);
  fill(composer);

  // ---- place & focus ----
  phone.x = figma.viewport.center.x - 196;
  phone.y = figma.viewport.center.y - 426;
  figma.currentPage.appendChild(phone);
  figma.currentPage.selection = [phone];
  figma.viewport.scrollAndZoomIntoView([phone]);
  figma.closePlugin("Bold chat UI built ✓");
})();
