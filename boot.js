/* ============================================================
   AlfieOS boot screen
   Plays once per visitor (remembered in localStorage): hand-drawn Alfie,
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
  // Styled with the notebook theme (theme.css): lined paper, pen, sticky notes
  const css = `
  #boot { position: fixed; inset: 0; z-index: 1000; overflow: auto; color: var(--ink);
    font: 20px/1.4 var(--print);
    background-color: var(--paper);
    background-image: linear-gradient(90deg, transparent 70px, var(--margin) 70px, var(--margin) 72px, transparent 72px),
      repeating-linear-gradient(180deg, transparent 0 33px, var(--rule) 33px 34px);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px 16px 40px;
    transition: opacity .3s steps(3); }
  #boot.fade { opacity: 0; pointer-events: none; }
  #boot .logo { font: 400 clamp(42px, 8vw, 66px)/1.2 var(--scrawl); transform: rotate(-3deg); }
  #boot .logo span { color: var(--pen-red); }
  #boot .ver { font: 22px var(--note); color: var(--pencil); margin-top: -6px; }
  #boot .barwrap { width: min(440px, 88vw); margin-top: 6px; }
  #boot .bar { height: 30px; border: 3px solid var(--ink); border-radius: var(--wobbly); background: #fff; overflow: hidden; filter: url(#alfie-boil); }
  #boot .bar i { display: block; height: 100%; width: 0; border-right: 3px solid var(--ink);
    background: repeating-linear-gradient(-45deg, var(--pen-red) 0 3px, transparent 3px 9px); }
  #boot .msg { margin-top: 10px; min-height: 1.4em; font: 17px/1.4 var(--type); text-align: center; color: var(--pencil); }
  #boot .msg b { color: var(--pen-blue); font-weight: 400; }
  #boot .skip { position: fixed; bottom: 16px; right: 20px; font: 21px var(--note); color: var(--pencil); }
  #boot .menu { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; width: min(580px, 90vw); margin-top: 10px; }
  @media (max-width: 520px) { #boot .menu { grid-template-columns: 1fr; gap: 22px; } }
  #boot .opt { text-align: left; cursor: pointer; color: var(--ink); border: 0; font: inherit; transform: rotate(-2deg); transition: transform .1s steps(2); }
  #boot .opt:nth-child(2) { transform: rotate(2deg); }
  #boot .opt b { display: block; font: 700 32px/1.1 var(--hand); }
  #boot .opt small { font: 21px/1.3 var(--note); }
  #boot .opt .file { font: 17px var(--type); color: var(--pencil); }
  #boot .opt.sel, #boot .opt:hover { transform: rotate(0) scale(1.05); outline: 3px solid var(--ink); outline-offset: 4px; border-radius: 4px; }
  #boot .hint { font: 22px var(--note); text-align: center; margin-top: 18px; }
  #boot .hint b { color: var(--pen-red); }
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
    '<div class="boot-stage"><div class="barwrap"><div class="bar"><i></i></div><div class="msg"></div></div></div>' +
    '<div class="skip">press any key to skip ›</div>';
  document.body.appendChild(box);
  document.documentElement.style.overflow = "hidden";

  // Hand-drawn Alfie (sprite.js)
  let alfie = null;
  if (window.AlfieSprite) {
    if (!document.getElementById("alfie-sprite-css")) {
      const st = document.createElement("style"); st.id = "alfie-sprite-css"; st.textContent = AlfieSprite.CSS; document.head.appendChild(st);
    }
    alfie = AlfieSprite.mount(box.querySelector(".who"), { scale: 11, label: "Alfie's doodle of himself" });
    alfie.say("booting up…");
  }

  const fill = box.querySelector(".bar i");
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
    if (alfie) { alfie.say("pick one!"); alfie.wave(); }
    const items = [
      { title: "recruiter.app", label: "Recruiter mode", hint: "the clean, quick-to-read portfolio", go: () => close() },
      { title: "terminal.app", label: "Terminal mode", hint: "explore with a shell: ls, cat, man alfie", go: () => { remember(); location.href = "terminal.html"; } },
    ];
    let sel = 0, left = 8;
    const stage = box.querySelector(".boot-stage");
    stage.innerHTML = '<div class="menu"></div><p class="hint">use ← → and Enter, or click. recruiter mode starts in <b class="t">' + left + '</b>s</p>';
    const menu = stage.querySelector(".menu"), t = stage.querySelector(".t");
    const btns = items.map((it, i) => {
      const b = document.createElement("button");
      b.className = "opt sticky" + (i ? " pink" : "");
      b.innerHTML = `<span class="file">${it.title}</span><b>${it.label}</b><small>${it.hint}</small>`;
      b.addEventListener("click", it.go);
      b.addEventListener("mouseenter", () => { sel = i; draw(); });
      menu.appendChild(b);
      return b;
    });
    function draw() {
      btns.forEach((b, i) => b.classList.toggle("sel", i === sel));
      if (alfie) { alfie.say(sel ? "ooh, hacker mode!" : "nice and simple!"); if (sel) alfie.surprised(900); else alfie.happy(900); }
    }
    draw();
    btns[0].focus({ preventScroll: true });
    const tick = setInterval(() => {
      left--; t.textContent = left;
      if (left <= 0) { clearInterval(tick); items[sel].go(); }
    }, 1000);
    menuKeys = (e) => {
      clearInterval(tick);
      if (t.parentNode) t.parentNode.textContent = "use ← → and Enter, or click";
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
    fill.style.width = Math.round(((i + 1) / STEPS.length) * 100) + "%"; // jumps in steps, like it's being coloured in
    if (alfie && i === 6) alfie.say("☕ mmm…");
  }));
  at(2200 + 350, showMenu);
})();
