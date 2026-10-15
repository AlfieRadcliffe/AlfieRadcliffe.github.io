/* ============================================================
   AlfieOS boot screen
   Plays once per visitor (remembered in localStorage), then shows
   a GRUB-style menu: Recruiter mode (the normal site) or Terminal.
   Any key / click skips the boot log. Add ?boot to the URL, or click
   "Reboot" in the footer, to see it again.
   Include this as the FIRST thing inside <body> so the overlay
   covers the page before it paints.
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

  const css = `
  #boot { position: fixed; inset: 0; z-index: 1000; background: #05070c; color: #cbd5e1;
          font: 14px/1.6 "JetBrains Mono", ui-monospace, Consolas, monospace;
          padding: 24px 16px; overflow: hidden; cursor: default; transition: opacity .35s; }
  #boot.fade { opacity: 0; pointer-events: none; }
  #boot .log { max-width: 760px; margin: 0 auto; white-space: pre-wrap; word-break: break-word; }
  #boot .ok { color: #60a5fa; }  #boot .warn { color: #f87171; }  #boot .dim { color: #64748b; }
  #boot .brand { color: #f3f4f6; font-weight: 700; }
  #boot .skip { position: fixed; bottom: 16px; right: 16px; color: #64748b; font-size: 12px; }
  #boot .grub { max-width: 640px; margin: 8vh auto 0; border: 1px solid #334155; padding: 18px 0 14px; }
  #boot .grub h2 { font: inherit; text-align: center; color: #f3f4f6; margin-bottom: 14px; }
  #boot .grub ul { list-style: none; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 8px 0; }
  #boot .grub li { padding: 4px 22px; cursor: pointer; }
  #boot .grub li.sel { background: #2563eb; color: #fff; }
  #boot .grub li:hover:not(.sel) { background: #0f172a; }
  #boot .grub li small { color: #94a3b8; }  #boot .grub li.sel small { color: #dbeafe; }
  #boot .grub p { text-align: center; color: #64748b; font-size: 12px; margin-top: 12px; padding: 0 12px; }
  #boot .grub p b { color: #f87171; font-weight: 400; }
  #boot .cur::after { content: "_"; animation: bootblink 1s steps(1) infinite; }
  @keyframes bootblink { 50% { opacity: 0; } }
  @media (max-width: 520px) { #boot { font-size: 12px; } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const box = document.createElement("div");
  box.id = "boot";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "AlfieOS boot screen — choose Recruiter mode or Terminal mode");
  box.innerHTML = '<div class="log"></div><div class="skip">press any key to skip</div>';
  document.body.appendChild(box);
  document.documentElement.style.overflow = "hidden";
  const log = box.querySelector(".log");

  const mem = (navigator.deviceMemory ? navigator.deviceMemory * 1024 * 1024 : 8388608).toLocaleString("en-GB");
  const cores = navigator.hardwareConcurrency || 4;
  const LINES = [
    ['<span class="brand">AlfieBIOS v2.0</span>  <span class="dim">(c) ' + new Date().getFullYear() + ' Alfie Radcliffe</span>', 0],
    ["CPU: " + cores + " cores detected", 120],
    ["Memory test: " + mem + "K <span class=\"ok\">OK</span>", 160],
    ["", 60],
    ["Booting from <span class=\"brand\">alfieradcliffe.github.io</span>...", 160],
    ["[<span class=\"ok\">  OK  </span>] Loaded kernel  <span class=\"dim\">alfie-2.0-cs (x86_64)</span>", 140],
    ["[<span class=\"ok\">  OK  </span>] Mounted /home/alfie", 100],
    ["[<span class=\"ok\">  OK  </span>] Mounted /projects  <span class=\"dim\">(" + ((window.PROJECTS || []).length || 2) + " entries)</span>", 100],
    ["[<span class=\"ok\">  OK  </span>] Started network.service  <span class=\"dim\">(UDP, TCP)</span>", 100],
    ["[<span class=\"ok\">  OK  </span>] Started compiler.service  <span class=\"dim\">(gcc, javac, python3)</span>", 100],
    ["[<span class=\"warn\"> WAIT </span>] Starting placement.service  <span class=\"dim\">(2027–28: seeking employer)</span>", 180],
    ["[<span class=\"ok\">  OK  </span>] Reached target <span class=\"brand\">portfolio.target</span>", 160],
  ];

  let timers = [], done = false;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function showMenu() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    box.querySelector(".skip").remove();
    const items = [
      { label: "Recruiter mode", hint: "the clean, quick-to-read portfolio", go: () => close() },
      { label: "Terminal mode", hint: "explore with a shell: ls, cat, man alfie", go: () => { remember(); location.href = "terminal.html"; } },
    ];
    let sel = 0, left = 8;
    log.innerHTML =
      '<div class="grub"><h2>GNU GRUB  version 2.12 — AlfieOS</h2><ul></ul>' +
      '<p>Use ↑ ↓ and Enter, or click. Default boots in <b class="t">' + left + '</b>s.</p></div>';
    const ul = log.querySelector("ul"), t = log.querySelector(".t");
    function draw() {
      ul.innerHTML = "";
      items.forEach((it, i) => {
        const li = document.createElement("li");
        li.className = i === sel ? "sel" : "";
        li.innerHTML = (i === sel ? "*" : " ") + " " + it.label + "  <small>— " + it.hint + "</small>";
        li.addEventListener("click", it.go);
        li.addEventListener("mouseenter", () => { sel = i; draw(); });
        ul.appendChild(li);
      });
    }
    draw();
    const tick = setInterval(() => {
      left--; t.textContent = left;
      if (left <= 0) { clearInterval(tick); items[sel].go(); }
    }, 1000);
    menuKeys = (e) => {
      clearInterval(tick);
      if (t.parentNode) t.parentNode.textContent = "Use ↑ ↓ and Enter, or click.";
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { sel = (sel + 1) % items.length; draw(); e.preventDefault(); }
      else if (e.key === "Enter") items[sel].go();
      else if (e.key === "Escape") items[0].go();
      else if (e.key === "1" || e.key === "2") items[+e.key - 1].go();
    };
  }

  let menuKeys = null;
  function onKey(e) { if (menuKeys) menuKeys(e); else showMenu(); }
  function onClick(e) { if (!done) showMenu(); }

  function remember() { try { localStorage.setItem(KEY, "1"); } catch (e) {} }
  function close() {
    remember();
    document.removeEventListener("keydown", onKey);
    box.classList.add("fade");
    document.documentElement.style.overflow = "";
    if (forced) history.replaceState(null, "", location.pathname + location.hash);
    setTimeout(() => box.remove(), 400);
  }

  document.addEventListener("keydown", onKey);
  box.addEventListener("click", onClick);

  if (reduced) { showMenu(); return; }
  let t = 0;
  LINES.forEach(([html, delay]) => {
    t += delay;
    at(t, () => { const d = document.createElement("div"); d.innerHTML = html || "&nbsp;"; log.appendChild(d); });
  });
  at(t + 450, showMenu);
})();
