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
    title: "Pen Golf",
    status: "in-progress",
    featured: true,
    tagline:
      "An online party game: mini golf on notebook pages, where every player sabotages the course with hand-drawn traps.",
    problem:
      "Online party games like Ultimate Chicken Horse are some of the most fun I've had with friends. I want to build one " +
      "end to end: multiplayer networking, game design that's easy to pick up, and an art style that's mine.",
    built:
      "Friends join a room with a short code from any browser. Before each hole, everyone secretly places a trap (ink blots, " +
      "eraser walls, springs) and then takes turns putting. You only score if you sink it and someone else doesn't, so traps " +
      "have to be mean but not impossible. All the art is drawn by me on paper, then scanned into black-and-white sprites.",
    hardest: "",
    metrics: [],
    tags: ["JavaScript", "HTML Canvas", "Node.js", "WebSockets", "Game design"],
    milestones: [
      { text: "Pick the game idea and sketch the rules on paper", done: true },
      { text: "Single player: drag to putt a ball around a page", done: true },
      { text: "Courses: walls, a hole, and sinking the ball", done: true },
      { text: "Traps: place them and make them affect the ball", done: true },
      { text: "Lobby: create a room, share a code, see who's joined", done: false },
      { text: "Multiplayer turns synced between players", done: false },
      { text: "Rounds, scoring and a winner", done: true },
      { text: "Hand-drawn art scanned in and animated", done: false },
      { text: "Playtest with friends and deploy online", done: false },
    ],
    media: "assets/projects/pen-golf.png",
    links: [],
  },
];
