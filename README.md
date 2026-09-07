# VLD portfolio

A small static website for a Virtual Learning Day (VLD) course portfolio. No frameworks,
no build step — just HTML, CSS and one data file. Open `index.html` in a browser and it works.

## Pages

| Page | File | What goes there |
|---|---|---|
| Home | `index.html` | Who you are as a learner and what you're taking this year |
| Course log | `course-log.html` | Your course, the date it was approved, progress, and any switches (with reasons) |
| Reflection journal | `journal.html` | Dated entries after every session, using the four-question template |
| Learner bio | `bio.html` | A short, safe profile written for G10 students |
| Evidence | `evidence.html` | Certificates, screenshots, or final project proof once you finish |

## The only file you edit: `data.js`

Everything on every page comes from `data.js`. The HTML files are just empty shells.

- **Your details** → the `learner` block (name, grade, tagline, motto, advice…)
- **Courses** → the `courses` list. If you switch course, keep the old one in with
  `status: "switched"` and fill in the `switched` block with the date and the reason.
- **Journal entries** → the `journal` list. Add one object per session; the site sorts them
  by date for you. The journal page has a **Copy a blank entry** button that gives you a
  pre-filled template with the next week number and date.
- **Evidence** → the `evidence` list. Put the actual files in the `evidence/` folder.
- **Rubric wording** → the `rubric` block. Change the descriptions to match your course rubric.

When you've replaced the sample content, set `sampleContent: false` at the top of the file
to hide the yellow strip.

**If a page goes blank** you've broken the syntax in `data.js` — usually a missing comma
between entries or an unclosed quote. Open the browser console (right-click → Inspect →
Console) and it will point at the line.

### Adding a journal entry

1. Open `journal.html` in your browser and click **Copy a blank entry**.
2. Open `data.js`, find the `journal: [` list, and paste the entry in (anywhere inside the list).
3. Fill in the four answers. `score` is 100, 89, 79 or 69. Leave `teacherScore: null`
   until you've checked ManageBac, then put in what your teacher gave you.
4. Reload the page.

### Adding evidence

1. Put the file in the `evidence/` folder, e.g. `evidence/cs50p-certificate.pdf`.
2. Add an item to the `evidence` list in `data.js` with `file: "evidence/cs50p-certificate.pdf"`.
   For something online (a GitHub repo, a video), use `url: "https://…"` instead of `file`.

## Publishing on GitHub Pages

1. Create a new repository on GitHub (public, e.g. `vld-portfolio`). Don't add a README —
   this folder already has one.
2. In a terminal, from this folder:

   ```bash
   git init
   git add .
   git commit -m "VLD portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/vld-portfolio.git
   git push -u origin main
   ```

3. On GitHub, open the repo → **Settings** → **Pages**.
4. Under **Build and deployment**, set Source to **Deploy from a branch**, pick **main** and
   **/ (root)**, then Save.
5. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/vld-portfolio/`.

Every time you edit `data.js`, commit and push again and the site updates:

```bash
git add . && git commit -m "Week 3 reflection" && git push
```

All links in the site are relative, so it works at any URL — a project page, a user page,
or a custom domain.

## Changing the look

Colours are CSS variables at the top of `style.css`. Change `--accent` to recolour the
whole site; there's a matching block for dark mode just below it. Fonts use whatever's on
the reader's computer (a serif for headings, the system sans for body text), so nothing
external is loaded.
