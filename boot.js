/* ============================================================
   AlfieOS boot screen
   Plays once per visitor (remembered in localStorage): pixel Alfie,
   a loading bar and boot messages, then a menu to choose
   Recruiter mode (the normal site) or Terminal mode.
   Any key / click skips the boot. Add ?boot to the URL, or click
   "Reboot" in the footer, to see it again.
   Needs sprite.js loaded first. Include this as the FIRST thing
   inside <body> so the overlay covers the page before it paints.
   ============================================================ */
(function () {
  const KEY = "alfieos-booted";
  let seen = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  const forced = /[?&]boot\b/.test(location.search);
  window.alfieReboot = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.href = location.pathname + "?boot";
  };
  if (seen && !forced) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ink = "#1b1430";

  const css = `
  #boot { position: fixed; inset: 0; z-index: 1000; overflow: auto; color: ${ink};
    font: 500 16px/1.4 "Pixelify Sans", "JetBrains Mono", monospace;
    background: linear-gradient(180deg, #6cc8ff 0%, #c9eeff 80%);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px 16px 90px;
    transition: opacity .35s, transform .35s; }
  #boot.fade { opacity: 0; transform: scale(1.04); pointer-events: none; }
  #boot::after { content: ""; position: fixed; left: 0; right: 0; bottom: 0; height: 56px; background: #3ddc97;
    border-top: 3px solid ${ink}; background-image: repeating-linear-gradient(90deg, #3ddc97 0 24px, #22b574 24px 32px, #3ddc97 32px 56px);
    background-size: 56px 12px; background-repeat: repeat-x; }
  #boot .logo { font: 700 clamp(40px, 8vw, 64px)/1 "Pixelify Sans", monospace; letter-spacing: .02em;
    color: #fff; -webkit-text-stroke: 3px ${ink}; paint-order: stroke fill; text-shadow: 5px 5px 0 ${ink}; }
  #boot .logo span { color: #ffd23f; }
  #boot .ver { margin-top: -10px; font-size: 15px; }
  #boot .barwrap { width: min(420px, 90vw); }
  #boot .bar { display: grid; grid-template-columns: repeat(20, 1fr); gap: 3px; padding: 4px; border: 3px solid ${ink};
    background: #fff; box-shadow: 4px 4px 0 ${ink}; border-radius: 6px; }
  #boot .bar i { height: 16px; background: #eee6d6; transition: background .1s; }
  #boot .bar i.on { background: #ff4d5e; }
  #boot .bar i.on:nth-child(3n) { background: #ffd23f; } #boot .bar i.on:nth-child(3n+1) { background: #2f6bff; }
  #boot .msg { margin-top: 10px; min-height: 1.4em; font: 13px/1.4 "JetBrains Mono", monospace; text-align: center; }
  #boot .msg b { color: #2f6bff; }
  #boot .skip { position: fixed; bottom: 70px; right: 16px; font-size: 13px; z-index: 1; }
  #boot .menu { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: min(560px, 92vw); }
  @media (max-width: 520px) { #boot .menu { grid-template-columns: 1fr; } }
  #boot .opt { text-align: left; cursor: pointer; font: inherit; color: ${ink}; background: #fff; border: 3px solid ${ink};
    border-radius: 12px; box-shadow: 5px 5px 0 ${ink}; padding: 0; overflow: hidden; transition: transform .1s, box-shadow .1s; }
  #boot .opt .tb { padding: 5px 10px; border-bottom: 3px solid ${ink}; font-size: 14px; background: #2f6bff; color: #fff; }
  #boot .opt:nth-child(2) .tb { background: #ff4d5e; }
  #boot .opt .bd { padding: 12px; }
  #boot .opt b { display: block; font-size: 22px; }
  #boot .opt small { font: 13px/1.35 Inter, sans-serif; }
  #boot .opt.sel, #boot .opt:hover { transform: translate(-3px, -3px); box-shadow: 8px 8px 0 ${ink}; background: #ffd23f; }
  #boot .hint { font-size: 14px; text-align: center; }
  #boot .hint b { color: #ff4d5e; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.id = "boot";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "AlfieOS boot screen. Choose Recruiter mode or Terminal mode");
  box.innerHTML =
    '<div class="who"></div>' +
    '<div class="logo">Alfie<span>OS</span></div><div class="ver">version 2.0 · ' + new Date().getFullYear() + '</div>' +
    '<div class="stage"><div class="barwrap"><div class="bar">' + "<i></i>".repeat(20) + '</div><div class="msg"></div></div></div>' +
    '<div class="skip">press any key to skip ›</div>';
  document.body.appendChild(box);
  document.documentElement.style.overflow = "hidden";

  // Pixel Alfie (sprite.js)
  let alfie = null;
  if (window.AlfieSprite) {
    if (!document.getElementById("alfie-sprite-css")) {
      const st = document.createElement("style"); st.id = "alfie-sprite-css"; st.textContent = AlfieSprite.CSS; document.head.appendChild(st);
    }
    alfie = AlfieSprite.mount(box.querySelector(".who"), { scale: 7, label: "Pixel Alfie" });
    alfie.say("Booting up…");
  }

  const bars = box.querySelectorAll(".bar i");
  const msg = box.querySelector(".msg");
  const projects = (window.PROJECTS || []).length || 2;
  const STEPS = [
    "Checking memory… <b>OK</b>",
    "Loading kernel <b>alfie-2.0-cs</b>",
    "Mounting <b>/home/alfie</b>",
    "Mounting <b>/projects</b> (" + projects + " entries)",
    "Starting <b>network.service</b> (TCP, UDP)",
    "Starting <b>compiler.service</b> (gcc, javac, python3)",
    "Brewing coffee… <b>OK</b>",
    "Starting <b>placement.service</b> (seeking 2027–28 employer)",
    "Reached <b>portfolio.target</b>",
  ];

  let timers = [], done = false, menuKeys = null;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  function showMenu() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    box.querySelector(".skip").remove();
    if (alfie) { alfie.say("Pick one!"); alfie.wave(); }
    const items = [
      { title: "recruiter.app", label: "Recruiter mode", hint: "The clean, quick-to-read portfolio.", go: () => close() },
      { title: "terminal.app", label: "Terminal mode", hint: "Explore with a shell: ls, cat, man alfie.", go: () => { remember(); location.href = "terminal.html"; } },
    ];
    let sel = 0, left = 8;
    const stage = box.querySelector(".stage");
    stage.innerHTML = '<div class="menu"></div><p class="hint" style="margin-top:16px">Use ← → and Enter, or click. Recruiter mode starts in <b class="t">' + left + '</b>s.</p>';
    const menu = stage.querySelector(".menu"), t = stage.querySelector(".t");
    const btns = items.map((it, i) => {
      const b = document.createElement("button");
      b.className = "opt";
      b.innerHTML = `<div class="tb">${it.title}</div><div class="bd"><b>${it.label}</b><small>${it.hint}</small></div>`;
      b.addEventListener("click", it.go);
      b.addEventListener("mouseenter", () => { sel = i; draw(); });
      menu.appendChild(b);
      return b;
    });
    function draw() {
      btns.forEach((b, i) => b.classList.toggle("sel", i === sel));
      if (alfie) alfie.say(sel ? "Ooh, hacker mode!" : "Nice and simple!");
    }
    draw();
    btns[0].focus({ preventScroll: true });
    const tick = setInterval(() => {
      left--; t.textContent = left;
      if (left <= 0) { clearInterval(tick); items[sel].go(); }
    }, 1000);
    menuKeys = (e) => {
      clearInterval(tick);
      if (t.parentNode) t.parentNode.textContent = "Use ← → and Enter, or click.";
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) { sel = 1 - sel; draw(); btns[sel].focus({ preventScroll: true }); e.preventDefault(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); items[sel].go(); }
      else if (e.key === "Escape") items[0].go();
      else if (e.key === "1" || e.key === "2") items[+e.key - 1].go();
    };
  }

  function onKey(e) { if (menuKeys) menuKeys(e); else showMenu(); }
  function remember() { try { localStorage.setItem(KEY, "1"); } catch (e) {} }
  function close() {
    remember();
    document.removeEventListener("keydown", onKey);
    box.classList.add("fade");
    document.documentElement.style.overflow = "";
    if (forced) history.replaceState(null, "", location.pathname + location.hash);
    setTimeout(() => { if (alfie) alfie.destroy(); box.remove(); }, 400);
  }

  document.addEventListener("keydown", onKey);
  box.addEventListener("click", () => { if (!done) showMenu(); });

  if (reduced) { showMenu(); return; }
  const per = 2200 / STEPS.length;
  STEPS.forEach((s, i) => at(per * i, () => {
    msg.innerHTML = s;
    const lit = Math.round(((i + 1) / STEPS.length) * bars.length);
    bars.forEach((b, j) => b.classList.toggle("on", j < lit));
    if (alfie && i === 6) alfie.say("☕ mmm…");
  }));
  at(2200 + 350, showMenu);
})();
