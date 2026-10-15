/* ============================================================
   Pixel Alfie: the AlfieOS mascot.
   A 16×22 chibi sprite drawn on <canvas>: brown hair, blue eyes,
   and a small mole above the left of his mouth.

   Usage (auto): <div data-alfie data-alfie-scale="8"
                       data-alfie-wave data-alfie-say="Hi!"></div>
   Usage (JS):   const a = AlfieSprite.mount(el, { scale: 8 });
                 a.say("Hello", 2000); a.wave(1500); a.happy(1500);
   ============================================================ */
(function () {
  const PAL = {
    K: "#2a1840", // outline
    H: "#7b4a2a", h: "#b0703f", d: "#5a3418", // hair, curl highlight, curl shadow
    S: "#ffd9b8", C: "#ff9fb0", // skin, blush
    B: "#2f8bff", b: "#10388f", W: "#ffffff", // eyes
    M: "#4a2a1c", // mole
    m: "#d9485f", // mouth
    T: "#ff4d5e", t: "#ffd23f", // hoodie, hoodie trim
    P: "#3a3f6c", F: "#2a1840", // trousers, shoes
  };
  // prettier-ignore
  const BASE = [
    "......KK.KK.KK......", // curly hair
    "....KKHHKHHKHHKK....",
    "...KHhdHHhdHHhdHK...",
    "..KHdHhHdHhHdHhHdK..",
    ".KHhHdHHhHdHHhHdHHK.",
    "KHdHHhHdHHhHdHHhHdHK",
    "KhHdHHhdHHHhdHHdHhHK",
    "KHdHhHdHHdHHhdHHdHdK",
    "KdHhdHHdhHHdhHHdhHdK", // curly fringe
    "KHdHHhSSdHHdSShHdHHK",
    ".KHdSSSSdSSdSSSSdHK.",
    ".KHHSSBWSSSSBWSSHHK.", // blue eyes
    ".KdHSSBbSSSSBbSSHdK.",
    "..KSSCSSSSSSSSCSSK..",
    "...KSSSSMSSSSSSSK...", // M = mole, top-left of the mouth
    "...KSSSSSmmSSSSSK...",
    "....KKSSSSSSSSKK....",
    ".....KTTtSStTTK.....",
    "....KTTTTTTTTTTK....",
    "...KSKTTTTTTTTKSK...",
    "...KSKTTttttTTKSK...",
    "....KKPPPPPPPPKK....",
    ".....KPPPKKPPPK.....",
    ".....KFFFKKFFFK.....",
    ".....KKKKKKKKKK.....",
  ];
  // Frame coordinates are relative to the face: rows start below the
  // hair tufts (TOP) and columns inside the side padding (PAD), so the
  // waving arm can reach columns 16–17.
  const TOP = 3, PAD = 2, ROWS = BASE.length, COLS = BASE[0].length, CANVAS_ROWS = ROWS + 2; // headroom for bob + shadow

  const ARM_UP = [[16,13,"."],[17,13,"."],[17,14,"."],[16,14,"K"],[15,14,"S"],[15,15,"K"],[14,15,"S"],[14,14,"K"],[14,16,"K"]];
  const FRAMES = {
    blink: [[8,4,"S"],[8,5,"S"],[8,10,"S"],[8,11,"S"],[9,4,"K"],[9,5,"K"],[9,10,"K"],[9,11,"K"]],
    waveA: ARM_UP.concat([[13,15,"S"],[13,14,"K"],[13,16,"K"],[12,15,"S"],[12,14,"K"],[12,16,"K"],[11,15,"K"]]),
    waveB: ARM_UP.concat([[13,16,"S"],[13,15,"K"],[13,17,"K"],[12,16,"S"],[12,15,"K"],[12,17,"K"],[11,16,"K"]]),
    happy: [[12,7,"K"],[12,8,"K"],[13,7,"m"],[13,8,"m"],[8,4,"K"],[8,5,"S"],[9,4,"S"],[9,5,"K"],[8,10,"S"],[8,11,"K"],[9,10,"K"],[9,11,"S"]],
  };

  function grid(overrides) {
    const g = BASE.map((r) => r.split(""));
    overrides.forEach((o) => o.forEach(([r, c, ch]) => (g[r + TOP][c + PAD] = ch)));
    return g;
  }

  function draw(ctx, scale, overrides, lift) {
    ctx.clearRect(0, 0, COLS * scale, CANVAS_ROWS * scale);
    ctx.fillStyle = "rgba(42,24,64,.18)"; // ground shadow
    ctx.fillRect(5 * scale, (CANVAS_ROWS - 1) * scale, 10 * scale, scale);
    const g = grid(overrides);
    const y0 = 1 - lift;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const ch = g[r][c];
        if (ch === ".") continue;
        ctx.fillStyle = PAL[ch];
        ctx.fillRect(c * scale, (r + y0) * scale, scale, scale);
      }
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mount(el, opts) {
    opts = opts || {};
    const scale = opts.scale || 6;
    const wrap = document.createElement("span");
    wrap.className = "alfie-sprite";
    wrap.style.cssText = "position:relative;display:inline-block;line-height:0;vertical-align:bottom";
    const cv = document.createElement("canvas");
    cv.width = COLS * scale; cv.height = CANVAS_ROWS * scale;
    cv.style.imageRendering = "pixelated";
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", opts.label || "Pixel-art Alfie: brown hair, blue eyes, red hoodie");
    wrap.appendChild(cv);
    const bubble = document.createElement("span");
    bubble.className = "alfie-bubble";
    bubble.hidden = true;
    wrap.appendChild(bubble);
    el.appendChild(wrap);
    const ctx = cv.getContext("2d");

    let tick = 0, blinkUntil = 0, nextBlink = 20 + Math.random() * 20;
    let waveUntil = opts.wave ? Infinity : 0, happyUntil = 0, sayTimer = null;

    function render() {
      const o = [];
      const waving = tick < waveUntil, happy = tick < happyUntil;
      if (tick < blinkUntil && !happy) o.push(FRAMES.blink);
      if (waving) o.push(Math.floor(tick / 3) % 2 ? FRAMES.waveA : FRAMES.waveB);
      if (happy) o.push(FRAMES.happy);
      const lift = reduced ? 0 : happy ? (tick % 4 < 2 ? 1 : 0) : (Math.floor(tick / 5) % 2);
      draw(ctx, scale, o, lift);
    }
    const timer = reduced ? null : setInterval(() => {
      tick++;
      if (tick > nextBlink) { blinkUntil = tick + 1; nextBlink = tick + 20 + Math.random() * 30; }
      render();
    }, 110);
    render();

    const ms = (n) => Math.round(n / 110);
    const ctl = {
      el: wrap,
      say(text, dur) {
        clearTimeout(sayTimer);
        bubble.textContent = text; bubble.hidden = !text;
        if (dur) sayTimer = setTimeout(() => (bubble.hidden = true), dur);
      },
      wave(dur) { waveUntil = dur ? tick + ms(dur) : Infinity; if (reduced) { draw(ctx, scale, [FRAMES.waveA], 0); } },
      stopWave() { waveUntil = 0; },
      happy(dur) { happyUntil = tick + ms(dur || 1500); if (reduced) draw(ctx, scale, [FRAMES.happy], 0); },
      destroy() { clearInterval(timer); wrap.remove(); },
    };
    if (opts.say) ctl.say(opts.say);
    if (reduced && opts.wave) ctl.wave();
    return ctl;
  }

  // Head-only image, used for the favicon
  function faceURL(scale) {
    scale = scale || 4;
    const cv = document.createElement("canvas");
    cv.width = COLS * scale; cv.height = COLS * scale;
    const ctx = cv.getContext("2d");
    const g = grid([]);
    for (let r = 0; r < 17; r++)
      for (let c = 0; c < COLS; c++) {
        const ch = g[r][c];
        if (ch === ".") continue;
        ctx.fillStyle = PAL[ch];
        ctx.fillRect(c * scale, (r + 2) * scale, scale, scale);
      }
    return cv.toDataURL("image/png");
  }

  const CSS = `
  .alfie-bubble { position:absolute; left:100%; top:0; margin-left:4px; white-space:nowrap; line-height:1.3;
    font:600 14px/1.3 "Pixelify Sans", "JetBrains Mono", monospace; color:#1b1430; background:#fff;
    border:3px solid #1b1430; border-radius:10px; padding:6px 10px; box-shadow:3px 3px 0 #1b1430; z-index:2; }
  .alfie-bubble::before { content:""; position:absolute; left:-9px; top:12px; border:6px solid transparent;
    border-right-color:#1b1430; border-left:0; }
  .alfie-bubble.left { left:auto; right:100%; margin:0 4px 0 0; }
  .alfie-bubble.left::before { left:auto; right:-9px; border-right:0; border-left:6px solid #1b1430; }`;

  function autoMount() {
    if (!document.getElementById("alfie-sprite-css")) {
      const st = document.createElement("style"); st.id = "alfie-sprite-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    document.querySelectorAll("[data-alfie]").forEach((el) => {
      const ctl = mount(el, {
        scale: +el.dataset.alfieScale || 6,
        wave: el.hasAttribute("data-alfie-wave"),
        say: el.dataset.alfieSay,
      });
      if (el.hasAttribute("data-alfie-left")) ctl.el.querySelector(".alfie-bubble").classList.add("left");
      el.alfie = ctl;
    });
    // Favicon = Alfie's face
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = faceURL(4);
  }

  window.AlfieSprite = { mount, faceURL, CSS, init: autoMount };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoMount);
  else autoMount();
})();
