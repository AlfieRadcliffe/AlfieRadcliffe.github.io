/* ============================================================
   PROJECTS — this is the only file you need to edit to add work.

   To add a project, copy one { ... } block, paste it at the top
   of the list, and fill it in. Fields:

     title      Project name
     status     "complete" | "in-progress" | "planned"
     featured   true  -> big case-study card
                false -> small card under "Other projects"
     tagline    One sentence: what it is
     problem    Why it exists / what you wanted to learn
     built      What you built (main components, design choices)
     hardest    The hardest technical problem and how you solved it
     metrics    Short numbers worth bragging about, e.g. "120k req/s"
     tags       Languages and tools
     milestones Optional checklist; set done: true as you go
     media      Path to a screenshot/GIF in assets/, or null
     links      [{ label: "Source code", url: "https://..." }]

   Leave a field as "" or [] if you don't have it yet — it simply
   won't be shown.
   ============================================================ */

window.PROJECTS = [
  {
    title: "AlfieOS: this portfolio",
    status: "complete",
    featured: true,
    tagline:
      "A portfolio that boots like an operating system, set in a notebook and starring a character I drew myself.",
    problem:
      "Most student portfolios look the same. I wanted mine to show both sides of what I care about: a working " +
      "terminal for the technical side, and a hand-drawn, characterful design for the HCI side, without making " +
      "it any slower for a recruiter to read.",
    built:
      "A boot screen with a mode picker, a recruiter-friendly notebook page, and a terminal mode with a fake " +
      "filesystem (ls, cd, cat, man, tab completion, history and a real network ping). My drawing is split into " +
      "layers and animated at a choppy 7 frames a second with an SVG \"line boil\" filter, so it feels hand-animated.",
    hardest:
      "Keeping it playful without hurting usability. Every gimmick is skippable, the layout works on phones, " +
      "animation stops for people who turn on reduced motion, and the whole thing runs with no frameworks.",
    metrics: ["0 frameworks", "works on phones", "reduced-motion friendly"],
    tags: ["HTML", "CSS", "JavaScript", "SVG filters", "GitHub Pages"],
    milestones: [],
    media: "assets/projects/alfieos.png",
    links: [
      { label: "Try the terminal", url: "terminal.html" },
      { label: "Source code", url: "https://github.com/AlfieRadcliffe/AlfieRadcliffe.github.io" },
    ],
  },
  {
    title: "Hand-drawn online party game",
    status: "planned",
    featured: true,
    tagline:
      "A multiplayer browser party game for friends to play together, with every character and scene drawn by hand.",
    problem:
      "Online party games like Gartic Phone and Ultimate Chicken Horse are some of the most fun I've had with friends. " +
      "I want to build one end to end: real-time networking, game design that's easy to pick up, and an art style that's mine.",
    built:
      "Players join a room with a short code from any browser, no download needed. The game stays in sync in real time " +
      "over WebSockets, and all the art is drawn by me on paper, then scanned and cleaned up into black-and-white sprites.",
    hardest: "",
    metrics: [],
    tags: ["JavaScript", "WebSockets", "Node.js", "HTML Canvas", "Game design"],
    milestones: [
      { text: "Pick the game idea and sketch the rules on paper", done: false },
      { text: "Lobby: create a room, share a code, see who's joined", done: false },
      { text: "Real-time sync between players over WebSockets", done: false },
      { text: "Core game loop: rounds, scoring and a winner", done: false },
      { text: "Hand-drawn art scanned in and animated", done: false },
      { text: "Playtest with friends, fix what confuses people", done: false },
      { text: "Deploy online so anyone can play", done: false },
    ],
    media: null,
    links: [],
  },
];
