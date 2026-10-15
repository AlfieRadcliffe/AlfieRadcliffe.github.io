# alfieradcliffe.github.io

Personal portfolio and CV of **Alfie Radcliffe**, Computer Science student at Newcastle University.

Live at **https://alfieradcliffe.github.io**

## Structure

| File | What it is |
|---|---|
| `index.html` | The website (layout, styles, about, skills, experience) |
| `projects.js` | **The project list. Edit this to add or update projects.** |
| `sprite.js` | Pixel Alfie, the animated mascot (drawn on canvas; edit `BASE` to change the art) |
| `boot.js` | AlfieOS boot screen and mode menu (plays once per visitor; `?boot` replays it) |
| `terminal.html` / `terminal.js` | Terminal mode: a shell with `ls`, `cat`, `man alfie`, `neofetch`, `ping`… |
| `404.html` | "Segmentation fault" page for broken links |
| `cv.html` | Source for the CV |
| `cv.pdf` | The CV linked from the site, generated from `cv.html` |
| `assets/` | Screenshots and GIFs for projects |

## Adding a project

1. Open `projects.js`, copy an existing `{ ... }` block and fill it in.
2. Put a screenshot or GIF in `assets/` and set `media: "assets/your-file.gif"`.
3. As you finish roadmap steps, change `done: false` to `done: true`. The progress bar updates automatically.
4. Commit and push. GitHub Pages redeploys in about a minute.

## Updating the CV

Edit `cv.html`, open it in Edge or Chrome, press **Ctrl+P**, then **Save as PDF** with margins set to *None*. Save it over `cv.pdf`.

Built by hand with HTML, CSS and JavaScript, with no frameworks.
