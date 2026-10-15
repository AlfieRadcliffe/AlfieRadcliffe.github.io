/* ============================================================
   Alfie: the AlfieOS mascot, from Alfie's own drawing
   (assets/alfie.png, ink on a transparent background).

   Animated like hand-drawn cartoons: a "line boil" filter
   re-wobbles the ink a few times a second, and poses change at
   a low, choppy frame rate. The right arm is a separate cut-out
   of the same drawing so it can swing up to wave.

   Usage (auto): <div data-alfie data-alfie-scale="10"
                       data-alfie-wave data-alfie-say="Hi!"></div>
   Usage (JS):   const a = AlfieSprite.mount(el, { scale: 10 });
                 a.say("Hello", 2000); a.wave(1500); a.happy(1500);
   ============================================================ */
(function () {
  const INK = "#262123";
  const FPS_MS = 150; // ~7 drawings a second: choppy on purpose
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Image paths are resolved next to this script, so pages in any folder work
  const here = (document.currentScript && document.currentScript.src) || location.href;
  const IMG = new URL("assets/alfie.png", here).href;
  const HEAD = new URL("assets/alfie-head.png", here).href;
  const RATIO = 729 / 565; // drawing height / width

  // The right arm's cut-out box and shoulder pivot, as % of the drawing
  const ARM = { left: 72.9, top: 37, bottom: 55.6, pivotX: 73.3, pivotY: 47.3 };
  const MOLE = { x: 31.9, y: 32.6 }; // small mole, top-left of the mouth

  /* ---------- Line boil: shared SVG filter, re-seeded on a timer ---------- */
  function ensureBoil() {
    if (document.getElementById("alfie-boil-defs")) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "alfie-boil-defs";
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.innerHTML =
      '<filter id="alfie-boil" x="-3%" y="-3%" width="106%" height="106%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="4"/></filter>';
    (document.body || document.documentElement).appendChild(svg);
    if (reduced) return;
    const turb = svg.querySelector("feTurbulence");
    let seed = 1;
    setInterval(() => { seed = (seed % 3) + 1; turb.setAttribute("seed", seed); }, 170);
  }

  function mount(el, opts) {
    opts = opts || {};
    ensureBoil();
    const width = Math.round((opts.scale || 6) * 17);
    const wrap = document.createElement("span");
    wrap.className = "alfie-sprite";
    wrap.style.cssText = `position:relative;display:inline-block;line-height:0;vertical-align:bottom;width:${width}px;height:${Math.round(width * RATIO)}px`;

    const fig = document.createElement("span");
    fig.setAttribute("role", "img");
    fig.setAttribute("aria-label", opts.label || "Alfie's hand-drawn doodle of himself");
    fig.style.cssText = "position:absolute;inset:0;filter:url(#alfie-boil)";
    const layer = (clip) => {
      const img = document.createElement("img");
      img.src = IMG; img.alt = ""; img.draggable = false;
      img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;clip-path:${clip};user-select:none`;
      fig.appendChild(img);
      return img;
    };
    const A = ARM;
    const body = layer(`polygon(0 0,100% 0,100% ${A.top}%,${A.left}% ${A.top}%,${A.left}% ${A.bottom}%,100% ${A.bottom}%,100% 100%,0 100%)`);
    const arm = layer(`polygon(${A.left}% ${A.top}%,100% ${A.top}%,100% ${A.bottom}%,${A.left}% ${A.bottom}%)`);
    arm.style.transformOrigin = `${A.pivotX}% ${A.pivotY}%`;
    const mole = document.createElement("span");
    const dot = Math.max(2, Math.round(width / 120));
    mole.style.cssText = `position:absolute;left:${MOLE.x}%;top:${MOLE.y}%;width:${dot * 2}px;height:${dot * 2}px;border-radius:50%;background:${INK}`;
    fig.appendChild(mole);
    wrap.appendChild(fig);

    const bubble = document.createElement("span");
    bubble.className = "alfie-bubble";
    bubble.hidden = true;
    wrap.appendChild(bubble);
    el.appendChild(wrap);

    let tick = 0, waveUntil = opts.wave ? Infinity : 0, happyUntil = 0, sayTimer = null;

    function render() {
      const happy = tick < happyUntil, waving = tick < waveUntil;
      // Stepped poses, no tweening: that's what makes it feel hand-animated
      const bob = reduced ? 0 : happy ? (tick % 2 ? -12 : 0) : (Math.floor(tick / 4) % 2) * 3;
      const tilt = reduced ? 0 : happy ? (tick % 2 ? 3 : -3) : (Math.floor(tick / 6) % 2 ? 1.2 : -1.2);
      fig.style.transform = `translateY(${bob}px) rotate(${tilt}deg)`;
      const armRot = waving ? (reduced ? -40 : Math.floor(tick / 2) % 2 ? -55 : -28) : happy ? -35 : 0;
      arm.style.transform = `rotate(${armRot}deg)`;
    }
    const timer = reduced ? null : setInterval(() => { tick++; render(); }, FPS_MS);
    render();

    const frames = (ms) => Math.round(ms / FPS_MS);
    const ctl = {
      el: wrap,
      say(text, dur) {
        clearTimeout(sayTimer);
        bubble.textContent = text; bubble.hidden = !text;
        if (dur) sayTimer = setTimeout(() => (bubble.hidden = true), dur);
      },
      wave(dur) { waveUntil = dur ? tick + frames(dur) : Infinity; render(); },
      stopWave() { waveUntil = 0; render(); },
      happy(dur) { happyUntil = tick + frames(dur || 1500); render(); },
      destroy() { clearInterval(timer); wrap.remove(); },
    };
    if (opts.say) ctl.say(opts.say);
    return ctl;
  }

  // Head-only image, used for the favicon and menu-bar logo
  function faceURL() { return HEAD; }

  const CSS = `
  .alfie-bubble { position:absolute; left:88%; top:2%; white-space:nowrap; line-height:1.15; z-index:2;
    font:400 22px/1.15 "Gaegu", "Patrick Hand", cursive; color:${INK}; background:#fffef8;
    border:2.5px solid ${INK}; border-radius:255px 15px 225px 15px/15px 225px 15px 255px; padding:6px 14px 8px;
    transform:rotate(-2deg); box-shadow:3px 3px 0 rgba(38,33,35,.18); }
  .alfie-bubble.left { left:auto; right:88%; transform:rotate(2deg); }`;

  function autoMount() {
    ensureBoil();
    if (!document.getElementById("alfie-sprite-css")) {
      const st = document.createElement("style"); st.id = "alfie-sprite-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    document.querySelectorAll("[data-alfie]").forEach((el) => {
      if (el.alfie) return;
      const ctl = mount(el, {
        scale: +el.dataset.alfieScale || 6,
        wave: el.hasAttribute("data-alfie-wave"),
        say: el.dataset.alfieSay,
      });
      if (el.hasAttribute("data-alfie-left")) ctl.el.querySelector(".alfie-bubble").classList.add("left");
      el.alfie = ctl;
    });
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.type = "image/png";
    link.href = HEAD;
  }

  window.AlfieSprite = { mount, faceURL, CSS, init: autoMount, ensureBoil };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoMount);
  else autoMount();
})();
