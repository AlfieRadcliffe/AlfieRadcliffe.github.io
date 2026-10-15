/* ============================================================
   alfsh — the AlfieOS terminal
   A tiny shell over a fake filesystem. Projects come from
   projects.js; everything else is defined in PROFILE below.
   To add a command, add an entry to COMMANDS.
   ============================================================ */
(function () {
  const PROJECTS = window.PROJECTS || [];
  const EMAIL = "alfieradcliffe1234@gmail.com";
  const GITHUB = "https://github.com/AlfieRadcliffe";
  const LINKEDIN = "https://www.linkedin.com/in/alfie-radcliffe-09584b27b/";

  const PROFILE = {
    about:
`Alfie Radcliffe
Second-year BSc Computer Science student, Newcastle University.
First-year average: 80%+ (First Class).

I like knowing how things actually work: what code is doing to the
network, the memory and the CPU. That's why my projects lean towards
systems programming: a real-time multiplayer game server in C, and
next, a small x86 operating system written from scratch.

Looking for: a 12-month industrial placement, 2027–28, in any
software engineering team. Based in Newcastle; open to relocation
and remote work.`,
    skills:
`LANGUAGES   C ★  Python ★  Java ★  HTML ★  CSS ★  SQL
CONCEPTS    Algorithms & data structures, networking (TCP/UDP,
            sockets), security programming
TOOLS       Git & GitHub, Linux, VS Code

★ = strongest`,
    experience:
`2025 – 2029   BSc Computer Science, Newcastle University
              · First-year average 80%+
              · Modules: Security Programming, Algorithms, Networks
              · Includes a 12-month placement year (2027–28)

1 week        Work experience, TUBR (Sheffield)
              · AI & predictive-analytics startup building
                demand-forecasting software for hospitality`,
    contact:
`email      ${EMAIL}
github     ${GITHUB}
linkedin   ${LINKEDIN}

Tip: run "open email", "open github" or "open linkedin".`,
    plan:
`Current focus
  [ ] Get the game server's UDP packet layer working
  [ ] Start the OS: boot to "Hello, kernel" in QEMU
  [ ] Land a 2027–28 placement   <- you can help with this one`,
  };

  /* ---------- Filesystem ---------- */
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function projectText(p) {
    const st = { "in-progress": "IN PROGRESS", planned: "PLANNED", complete: "COMPLETE" }[p.status] || p.status;
    let s = `# ${p.title}   [${st}]\n${p.tagline}\n`;
    if (p.problem) s += `\nWHY\n${p.problem}\n`;
    if (p.built) s += `\nWHAT I'M BUILDING\n${p.built}\n`;
    if (p.hardest) s += `\nHARDEST PART\n${p.hardest}\n`;
    if (p.milestones && p.milestones.length) {
      const done = p.milestones.filter((m) => m.done).length;
      s += `\nROADMAP (${done}/${p.milestones.length})\n` + p.milestones.map((m) => `  [${m.done ? "x" : " "}] ${m.text}`).join("\n") + "\n";
    }
    if (p.tags && p.tags.length) s += `\nSTACK  ${p.tags.join(" · ")}\n`;
    if (p.links && p.links.length) s += p.links.map((l) => `LINK   ${l.url}`).join("\n") + "\n";
    return s.trimEnd();
  }
  const file = (content, extra) => Object.assign({ type: "file", content }, extra || {});
  const dir = (children) => ({ type: "dir", children });
  const projectFiles = {};
  PROJECTS.forEach((p) => (projectFiles[slug(p.title) + ".md"] = file(projectText(p))));

  const FS = dir({
    home: dir({
      alfie: dir({
        "about.txt": file(PROFILE.about),
        "skills.txt": file(PROFILE.skills),
        "experience.txt": file(PROFILE.experience),
        "contact.txt": file(PROFILE.contact),
        "cv.pdf": file(null, { url: "cv.pdf" }),
        projects: dir(projectFiles),
        ".plan": file(PROFILE.plan),
      }),
    }),
    etc: dir({ motd: file("Welcome to AlfieOS. Be nice to the kernel.") }),
  });
  const HOME = ["home", "alfie"];
  let cwd = HOME.slice();

  function resolve(path) {
    if (!path) return cwd.slice();
    let parts = path.startsWith("/") ? [] : path.startsWith("~") ? HOME.slice() : cwd.slice();
    path.replace(/^~/, "").split("/").forEach((seg) => {
      if (!seg || seg === ".") return;
      if (seg === "..") parts.pop(); else parts.push(seg);
    });
    return parts;
  }
  function nodeAt(parts) {
    let n = FS;
    for (const p of parts) {
      if (!n || n.type !== "dir" || !n.children[p]) return null;
      n = n.children[p];
    }
    return n;
  }
  const pretty = (parts) => {
    const s = "/" + parts.join("/");
    const h = "/" + HOME.join("/");
    return s.startsWith(h) ? "~" + s.slice(h.length) : s;
  };

  /* ---------- Output ---------- */
  const out = document.getElementById("out");
  const input = document.getElementById("in");
  const ps = document.getElementById("ps");
  const term = document.getElementById("term");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label || url)}</a>`;

  function print(text, cls) { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = text; out.appendChild(d); scroll(); }
  function html(h) { const d = document.createElement("div"); d.innerHTML = h; out.appendChild(d); scroll(); }
  function scroll() { term.scrollTop = term.scrollHeight; }
  function promptHTML() { return `alfie@alfieos:<b>${esc(pretty(cwd))}</b>$ `; }
  function setPrompt() { ps.innerHTML = promptHTML(); }

  const sprites = []; // neofetch portraits, stopped on clear
  function clearScreen() { sprites.splice(0).forEach((s) => s.destroy()); out.innerHTML = ""; }

  /* ---------- Buddy Alfie (stands on the grass and reacts) ---------- */
  const REACTIONS = {
    help: "Lots to explore!", ls: "Have a look around", cat: "Good read, that one", cd: "Wheee!",
    man: "That's me!", neofetch: "Ooh, nice portrait", ping: "Packets go brrr", open: "Opening it now…",
    whoami: "You're awesome :)", history: "We've done a lot!", clear: "Squeaky clean ✨", rm: "Hey! Careful!",
    vim: "Good luck escaping…", echo: "…echo…", exit: "Bye!", reboot: "See you soon!",
  };
  function buddy() { const b = document.getElementById("buddy"); return b && b.alfie; }
  function react(name, ok, args) {
    const b = buddy();
    if (!b) return;
    if (!ok) { b.say("Hmm? Try help", 2500); return; }
    if (name === "sudo" && args.join(" ").toLowerCase() === "hire alfie") { b.happy(2500); b.wave(2500); b.say("YES!! 🎉", 3000); return; }
    if (name === "sudo") { b.say("Nice try 😏", 2500); return; }
    b.say(REACTIONS[name] || "Cool!", 3500);
    if (name === "man" || name === "neofetch") b.wave(1600);
  }

  /* ---------- Commands ---------- */
  const history = [];
  let hIdx = 0, busy = false, cancel = null;

  const COMMANDS = {
    help: { desc: "list commands", run() {
      html('<span class="b">alfsh, version 2.0</span>. Commands:');
      Object.entries(COMMANDS).filter(([, c]) => c.desc).forEach(([n, c]) =>
        html(`  <span class="u">${n.padEnd(10)}</span> <span class="d">${esc(c.desc)}</span>`));
      html('\n<span class="d">Tab completes, ↑/↓ for history, Ctrl+L clears. Start with </span><span class="g">ls</span><span class="d"> or </span><span class="g">man alfie</span><span class="d">.</span>');
    }},
    ls: { desc: "list files (-a for hidden)", run(args) {
      const all = args.includes("-a");
      const target = args.find((a) => !a.startsWith("-"));
      const n = nodeAt(resolve(target));
      if (!n) return print(`ls: cannot access '${target}': No such file or directory`, "r");
      if (n.type === "file") return print(target);
      const names = Object.keys(n.children).filter((k) => all || !k.startsWith(".")).sort();
      html(names.map((k) => {
        const c = n.children[k];
        const cls = c.type === "dir" ? "dir" : k.endsWith(".pdf") ? "pdf" : k.startsWith(".") ? "hid" : "";
        return `<span class="${cls}">${esc(k)}${c.type === "dir" ? "/" : ""}</span>`;
      }).join("   ") || '<span class="d">(empty)</span>');
    }},
    cd: { desc: "change directory", run(args) {
      const p = resolve(args[0] || "~");
      const n = nodeAt(p);
      if (!n) return print(`cd: ${args[0]}: No such file or directory`, "r");
      if (n.type !== "dir") return print(`cd: ${args[0]}: Not a directory`, "r");
      cwd = p;
    }},
    pwd: { desc: "print working directory", run() { print("/" + cwd.join("/")); } },
    cat: { desc: "print a file", run(args) {
      if (!args.length) return print("usage: cat <file>", "r");
      args.forEach((a) => {
        const n = nodeAt(resolve(a));
        if (!n) return print(`cat: ${a}: No such file or directory`, "r");
        if (n.type === "dir") return print(`cat: ${a}: Is a directory`, "r");
        if (n.url) return html(`cat: ${esc(a)}: binary file. Try <span class="g">open ${esc(a)}</span>`);
        print(n.content);
      });
    }},
    open: { desc: "open cv.pdf, github, linkedin or email", run(args) {
      const a = (args[0] || "").toLowerCase();
      const targets = { github: GITHUB, linkedin: LINKEDIN, email: "mailto:" + EMAIL, cv: "cv.pdf" };
      let url = targets[a.replace(/\.pdf$/, "")];
      if (!url) { const n = nodeAt(resolve(args[0])); if (n && n.url) url = n.url; }
      if (!url) return print("usage: open cv.pdf | github | linkedin | email", "r");
      window.open(url, "_blank", "noopener");
      html(`Opening ${link(url)}`);
    }},
    whoami: { desc: "who are you?", run() { print("recruiter (probably). Hi! 👋  Try: man alfie"); } },
    man: { desc: "manual pages (try: man alfie)", run(args) {
      if ((args[0] || "") !== "alfie") return print(args[0] ? `No manual entry for ${args[0]}. Try: man alfie` : "What manual page do you want? Try: man alfie", "r");
      const H = (s) => `<span class="b">${s}</span>`;
      html(
`${H("ALFIE(1)")}                  User Commands                  ${H("ALFIE(1)")}

${H("NAME")}
       alfie - systems-minded CS student, available for placement

${H("SYNOPSIS")}
       ${H("alfie")} [<span class="u">--placement</span>=2027-28] [<span class="u">--relocate</span>] [<span class="u">--remote</span>]

${H("DESCRIPTION")}
       Second-year BSc Computer Science student at Newcastle
       University with a first-year average of 80%+. Writes C,
       Python and Java. Most at home close to the hardware:
       networks, operating systems, performance-critical code.

${H("OPTIONS")}
       <span class="u">--placement</span>   12-month industrial placement, 2027-28.
       <span class="u">--relocate</span>    Open to relocation.
       <span class="u">--remote</span>      Also happy working remotely.

${H("SKILLS")}
       C, Python, Java, HTML, CSS (strong); SQL; Git, Linux.
       Algorithms, networking (TCP/UDP), security programming.

${H("PROJECTS")}
${PROJECTS.map((p) => `       ${esc(p.title)} <span class="d">(${esc(p.status)})</span>`).join("\n")}

${H("EXIT STATUS")}
       Returns 0 when hired. Currently returns 1 (seeking placement).

${H("BUGS")}
       Occasionally writes C at 3am. Known to say "it works on my
       machine". Both fixes are in progress.

${H("SEE ALSO")}
       ${link("cv.pdf", "cv.pdf")}, ${link(GITHUB, "github")}(1), ${link(LINKEDIN, "linkedin")}(1), ${link("mailto:" + EMAIL, "email")}(1)

AlfieOS 2.0                       ${new Date().getFullYear()}                       ${H("ALFIE(1)")}`);
    }},
    neofetch: { desc: "system info (with a portrait)", run() {
      const info = [
        `<span class="u">alfie</span>@<span class="u">alfieos</span>`,
        `<span class="d">---------------</span>`,
        `<span class="r">OS</span>: AlfieOS 2.0 x86_64 (web)`,
        `<span class="r">Host</span>: Newcastle University`,
        `<span class="r">Uptime</span>: Year 2 of 4 (incl. placement)`,
        `<span class="r">Shell</span>: alfsh 2.0`,
        `<span class="r">Languages</span>: C, Python, Java`,
        `<span class="r">Packages</span>: ${PROJECTS.length} projects`,
        `<span class="r">Avg</span>: 80%+ (First)`,
        `<span class="r">Status</span>: seeking 2027–28 placement`,
      ];
      const row = document.createElement("div");
      row.className = "fetch";
      const pic = document.createElement("div");
      row.appendChild(pic);
      const pre = document.createElement("pre");
      pre.innerHTML = info.join("\n");
      row.appendChild(pre);
      out.appendChild(row);
      if (window.AlfieSprite) sprites.push(AlfieSprite.mount(pic, { scale: 6 }));
      scroll();
    }},
    ping: { desc: "measure real latency to a host", async run(args) {
      const self = !args[0] && location.protocol.startsWith("http");
      const host = (args[0] || (self ? location.host : "github.com")).replace(/^https?:\/\//, "").split("/")[0];
      const base = self ? location.origin : `https://${host}`;
      print(`PING ${host}: 4 requests over ${base.split(":")[0].toUpperCase()}`);
      const times = [];
      let stop = false; cancel = () => (stop = true);
      for (let i = 1; i <= 4 && !stop; i++) {
        const t0 = performance.now();
        try {
          await Promise.race([
            fetch(`${base}/${self ? "sprite.js" : "favicon.ico"}?ping=${Date.now()}`, { mode: "no-cors", cache: "no-store" }),
            new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
          ]);
          const ms = performance.now() - t0;
          times.push(ms);
          html(`reply from ${esc(host)}: seq=${i} time=<span class="g">${ms.toFixed(1)} ms</span>`);
        } catch (e) {
          print(`request seq=${i} timed out`, "r");
        }
        if (i < 4 && !stop) await new Promise((r) => setTimeout(r, 400));
      }
      if (stop) print("^C");
      print(`--- ${host} ping statistics ---`, "d");
      if (times.length) {
        const min = Math.min(...times), max = Math.max(...times), avg = times.reduce((a, b) => a + b, 0) / times.length;
        print(`${times.length} received, rtt min/avg/max = ${min.toFixed(1)}/${avg.toFixed(1)}/${max.toFixed(1)} ms`);
        print("(the first request includes DNS + TLS handshake — that's why it's slower)", "d");
      } else print("0 received", "r");
    }},
    history: { desc: "command history", run() { history.forEach((h, i) => print(`${String(i + 1).padStart(4)}  ${h}`)); } },
    echo: { desc: "print text", run(args) { print(args.join(" ")); } },
    date: { run() { print(new Date().toString()); } },
    uname: { run(args) { print(args.includes("-a") ? "AlfieOS alfieos 2.0-cs #1 SMP x86_64 alfsh" : "AlfieOS"); } },
    clear: { desc: "clear the screen", run() { clearScreen(); } },
    sudo: { run(args) {
      if (args.join(" ").toLowerCase() === "hire alfie")
        return html(`[sudo] password for recruiter: ********\n<span class="g">Access granted.</span> Excellent decision.\nNext step: ${link("mailto:" + EMAIL, EMAIL)}`);
      print("alfie is not in the sudoers file. This incident will be reported.", "r");
      html('<span class="d">(psst: try </span><span class="g">sudo hire alfie</span><span class="d">)</span>');
    }},
    rm: { run(args) { print(args.join(" ").includes("-rf") ? "Nice try. The filesystem is read-only (and so is my CV)." : "rm: permission denied", "r"); } },
    vim: { run() { print("You are now trapped in vim. Just kidding — type 'exit' to leave the terminal.", "d"); } },
    exit: { desc: "back to recruiter mode", run() { location.href = "index.html"; } },
    reboot: { desc: "replay the boot screen", run() { try { localStorage.removeItem("alfieos-booted"); } catch (e) {} location.href = "index.html?boot"; } },
  };
  COMMANDS.gui = COMMANDS.exit;
  COMMANDS.ll = { run(a) { COMMANDS.ls.run(["-a", ...a]); } };

  async function run(line) {
    html(promptHTML() + esc(line));
    const trimmed = line.trim();
    if (!trimmed) return;
    history.push(trimmed); hIdx = history.length;
    const [name, ...args] = trimmed.split(/\s+/);
    const cmd = COMMANDS[name.toLowerCase()];
    if (!cmd) { html(`alfsh: command not found: ${esc(name)}. Type <span class="g">help</span> for a list.`); react(name, false); return; }
    react(name.toLowerCase(), true, args);
    busy = true;
    try { await cmd.run(args); } catch (e) { print("error: " + e.message, "r"); }
    busy = false; cancel = null; setPrompt(); scroll();
    if (queue.length) run(queue.shift());
  }
  // Like a real terminal, input typed while a command runs is buffered
  const queue = [];
  function submit(line) { if (busy) queue.push(line); else run(line); }

  /* ---------- Tab completion ---------- */
  function complete() {
    const v = input.value;
    const parts = v.split(/\s+/);
    if (parts.length === 1) {
      const m = Object.keys(COMMANDS).filter((c) => c.startsWith(parts[0]));
      if (m.length === 1) input.value = m[0] + " ";
      else if (m.length > 1) { html(promptHTML() + esc(v)); print(m.join("   ")); }
      return;
    }
    const last = parts[parts.length - 1];
    const slash = last.lastIndexOf("/");
    const base = slash >= 0 ? last.slice(0, slash + 1) : "";
    const frag = last.slice(slash + 1);
    const n = nodeAt(resolve(base || "."));
    if (!n || n.type !== "dir") return;
    const m = Object.keys(n.children).filter((k) => k.startsWith(frag) && (frag.startsWith(".") || !k.startsWith(".")));
    if (m.length === 1) {
      const isDir = n.children[m[0]].type === "dir";
      parts[parts.length - 1] = base + m[0] + (isDir ? "/" : " ");
      input.value = parts.join(" ");
    } else if (m.length > 1) { html(promptHTML() + esc(v)); print(m.join("   ")); }
  }

  /* ---------- Input ---------- */
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const v = input.value; input.value = ""; submit(v); }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowUp") { if (hIdx > 0) input.value = history[--hIdx]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; e.preventDefault(); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); clearScreen(); }
    else if (e.key === "c" && e.ctrlKey && input.selectionStart === input.selectionEnd) { html(promptHTML() + esc(input.value) + "^C"); input.value = ""; }
  });
  document.addEventListener("keydown", (e) => { if (busy && e.key === "c" && e.ctrlKey && cancel) cancel(); });
  term.addEventListener("click", () => { if (!getSelection().toString()) input.focus(); });
  document.querySelectorAll(".chips button").forEach((b) => b.addEventListener("click", () => { submit(b.textContent); input.focus(); }));
  document.querySelectorAll("[data-cmd]").forEach((b) => b.addEventListener("click", () => { submit(b.dataset.cmd); input.focus(); }));

  /* ---------- Boot ---------- */
  setPrompt();
  html(
`<span class="b">AlfieOS 2.0</span> <span class="d">(alfsh)</span> — Alfie Radcliffe's portfolio, as a shell.
<span class="d">Last login: ${new Date().toDateString()} from ${esc(location.host || "localhost")}</span>

Type <span class="g">help</span> to see commands, or try <span class="g">ls</span>, <span class="g">cat about.txt</span>, <span class="g">man alfie</span>, <span class="g">neofetch</span>.
Prefer a normal web page? Type <span class="g">exit</span> or use the button at the top.
`);
  input.focus();

  /* ---------- Console easter egg ---------- */
  console.log("%c>_ AlfieOS", "font: 700 20px monospace; color: #60a5fa");
  console.log("%cOh hey, you opened the console. We'd probably get on.\nSource: " + GITHUB + "/AlfieRadcliffe.github.io\nSay hi: " + EMAIL,
    "font: 13px monospace; color: #94a3b8");
})();
