// =====================================================================
//  data.js  —  THE ONLY FILE YOU NEED TO EDIT
//
//  Every page on the site is built from what's in here.
//  After editing, open index.html in a browser to check it still works.
//  If a page goes blank, you've probably lost a comma or a quote mark.
//
//  Dates are always written as "YYYY-MM-DD"  (e.g. "2026-09-21").
//  Text can have blank lines in it to make paragraphs — use \n\n.
//  Anything marked TODO is still blank and shows as "(nothing written yet)".
// =====================================================================

window.SITE = {

  // Shows a "sample content" strip at the top of every page while true.
  sampleContent: false,

  // ------------------------------------------------------------------
  //  LEARNER  (shows on Home and Learner bio)
  //  This is public. Preferred name only — no surname, no school email,
  //  no photos of you, nothing you wouldn't want a stranger to read.
  // ------------------------------------------------------------------
  learner: {
    name: "Justin",
    grade: "",            // TODO e.g. "Grade 11"
    year: "2026–27",

    // One sentence about you as a learner.
    tagline: "",          // TODO e.g. "I'm more interested in how things work than in memorising facts about them."

    // What you're taking this year and why (Home page).
    thisYear: "This year I'm taking CS50, Harvard's introduction to computer science, through VLD. I had a few things I wanted to work on, including SAT prep, but I chose to improve my computer science skills.",

    // What you hoped to gain (Learner bio).
    hopedToGain: "",      // TODO one or two sentences on what you were actually after

    // A quote or motto you'd actually say out loud.
    motto: {
      text: "",           // TODO
      by: ""
    },

    // The one thing you wish someone had told you in week one.
    adviceForG10: ""      // TODO
  },

  // ------------------------------------------------------------------
  //  COURSES  (Course log, Home, Learner bio)
  //  Keep them in the order you took them. If you switch, leave the
  //  old course in with status "switched" and fill in a `switched`
  //  block — the reason is the interesting part:
  //
  //    switched: { date: "2026-10-05", to: "New course name", reason: "..." }
  //
  //  status: "active" | "completed" | "switched"
  //  progress: a number from 0 to 100
  // ------------------------------------------------------------------
  courses: [
    {
      name: "CS50: Introduction to Computer Science",
      provider: "Harvard / edX",
      url: "https://cs50.harvard.edu/x/",
      approved: "2026-09-07",   // TODO change to the date your teacher approved it, if different
      status: "active",
      progress: 25,             // TODO adjust if you're further along than I guessed
      progressNote: "Week 2 of 10 — Arrays and debugging",
      why: "I had multiple things I wanted to work on, including preparing for the SAT, but I chose to improve my computer science skills."
      // completed: "2027-01-15",   <- add this line when you finish
    }
  ],

  // ------------------------------------------------------------------
  //  REFLECTION JOURNAL  — one entry after every session
  //  Entries can go in any order; the site sorts them by date.
  //  The journal page has a "Copy a blank entry" button that gives you
  //  a template with the next week and date already filled in.
  //
  //  score: your course rubric lists 100, 89, 79 and 69.
  //         Other numbers still display, but they won't match a rubric
  //         band, so check what your teacher expects.
  //  teacherScore: leave as null until you've checked ManageBac
  // ------------------------------------------------------------------
  journal: [
    {
      week: 2,
      date: "2026-09-07",
      course: "CS50: Introduction to Computer Science",
      workedOn: "I worked on choosing my topic and eventually decided on CS50. I also watched the introductory video and got started on Week 0, which introduces CS50 and Scratch.",
      challenge: "The challenging part was deciding which course to actually choose for VLD. I had multiple options and things I wanted to work on, but I still chose to improve my computer science skills.",
      score: 89,
      scoreWhy: "I took a long while to decide whether to do computer science or prepare for the SAT.",
      teacherScore: null,  // fill in after checking ManageBac
      teacherNote: "",
      nextTime: "Next time I will focus and start doing the course as soon as the class begins, to prevent getting off task."
    },
    {
      week: 3,
      date: "2026-09-14",
      course: "CS50: Introduction to Computer Science",
      workedOn: "I watched the video moving on from Scratch into C, and learned the fundamental basics of the C language and how it works using a simple starter program.",
      challenge: "Generally, remembering the names of the parts of the code that C needs in order to compile.",
      score: 90,           // TODO not one of the rubric bands (100 / 89 / 79 / 69)
      scoreWhy: "It went decently and I absorbed a good amount of information, but some of what I covered was material I already knew.",
      teacherScore: null,  // fill in after checking ManageBac
      teacherNote: "",
      nextTime: "I would skip ahead to a more challenging and unfamiliar part once I can tell I already know the material, and start working on the CS50 project."
    },
    {
      week: 4,
      date: "2026-09-21",
      course: "CS50: Introduction to Computer Science",
      workedOn: "I watched the video moving further into C, plus a brief introduction to the command line interface and the fundamental basics of Linux. I also hosted this progress website on GitHub Pages so that it is publicly available.",
      challenge: "Creating a workflow that deploys the pages once there is a commit or a push to GitHub.",
      score: 95,           // TODO not one of the rubric bands (100 / 89 / 79 / 69)
      scoreWhy: "It went pretty well and I picked up a couple of new concepts. I rate myself highly because of the amount of work I got through today.",
      teacherScore: null,  // fill in after checking ManageBac
      teacherNote: "",
      nextTime: "I would start working on the CS50 final project instead of watching videos for the whole class."
    },
    {
      week: 6,
      date: "2026-10-05",
      course: "CS50: Introduction to Computer Science",
      workedOn: "I watched the video moving on into arrays, which also introduced the fundamental basics of debugging code and the history of debugging.",
      challenge: "Finding the bugs inside the examples.",
      score: 95,           // TODO not one of the rubric bands (100 / 89 / 79 / 69)
      scoreWhy: "It went pretty well and I picked up a couple of new concepts. I also managed to update the website. I rate myself highly because of the amount of work I got through today.",
      teacherScore: null,  // fill in after checking ManageBac
      teacherNote: "",
      nextTime: "I would start working on the CS50 final project next time."
    }
  ],

  // ------------------------------------------------------------------
  //  RUBRIC  — what each score means. Edit the wording to match the
  //  rubric your teacher gave you.
  // ------------------------------------------------------------------
  rubric: {
    100: "Fully self-directed: planned the session, stayed on task the whole time, worked through problems on my own, and can show what I finished.",
    89:  "Mostly self-directed: on task nearly all session with one small slip (a late start, a distraction, an unfinished piece) that I noticed and named.",
    79:  "Partly self-directed: needed a nudge or lost a chunk of the session; got some work done but not what I planned.",
    69:  "Not really a working session: little progress, off task for most of it, or no plan to begin with."
  },

  // ------------------------------------------------------------------
  //  EVIDENCE  — certificates, screenshots, final project proof
  //  Put files in the evidence/ folder and point `file` at them.
  //  Images (png, jpg, gif, webp, svg) show as pictures; anything else
  //  (pdf etc.) shows as a link. Use `url` instead of `file` for
  //  something that lives online (a GitHub repo, a Scratch project).
  //
  //  type: "certificate" | "screenshot" | "project"
  // ------------------------------------------------------------------
  evidence: [
    {
      title: "This portfolio, live on GitHub Pages",
      type: "project",
      date: "2026-09-21",
      course: "CS50: Introduction to Computer Science",
      file: "",
      url: "https://cyli310.github.io/VLD/",
      caption: "Built and deployed the VLD progress site myself, including getting it to redeploy on every push."
    }
  ]
};
