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
    title: "Real-time multiplayer game server",
    status: "in-progress",
    featured: true,
    tagline:
      "An authoritative game server in C that keeps players in sync over an unreliable network.",
    problem:
      "Online games feel instant even though packets take tens of milliseconds and sometimes never arrive. " +
      "I want to understand — and build — the techniques that make that possible, putting my Networks module into practice.",
    built:
      "A UDP server running a fixed-rate simulation tick, with a lightweight client. Clients send inputs, the server " +
      "is the single source of truth, and clients use prediction and reconciliation to hide latency.",
    hardest: "",
    metrics: [],
    tags: ["C", "UDP sockets", "Networking", "Linux"],
    milestones: [
      { text: "UDP client/server with a custom binary packet format", done: false },
      { text: "Fixed-timestep authoritative simulation loop", done: false },
      { text: "Client-side prediction and server reconciliation", done: false },
      { text: "Entity interpolation and lag compensation", done: false },
      { text: "Load test: many simulated clients, measure tick time and bandwidth", done: false },
    ],
    media: null,
    links: [],
  },
  {
    title: "Hobby operating system",
    status: "planned",
    featured: true,
    tagline:
      "A small x86 operating system written from scratch in C and assembly.",
    problem:
      "Everything I write runs on top of an OS I've never looked inside. Building one is the most direct way to " +
      "understand memory, interrupts and processes at the lowest level.",
    built:
      "A kernel that boots on real hardware or QEMU, takes control of the CPU, manages memory and runs multiple " +
      "processes, finishing with a simple interactive shell.",
    hardest: "",
    metrics: [],
    tags: ["C", "x86 Assembly", "QEMU", "Low-level"],
    milestones: [
      { text: "Boot into a kernel and print to the screen (VGA text mode)", done: false },
      { text: "Interrupt handling (GDT, IDT) and a keyboard driver", done: false },
      { text: "Physical memory manager and paging", done: false },
      { text: "Kernel heap (malloc/free)", done: false },
      { text: "Pre-emptive round-robin process scheduler", done: false },
      { text: "Simple interactive shell", done: false },
    ],
    media: null,
    links: [],
  },
];
