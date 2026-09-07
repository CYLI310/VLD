/* =====================================================================
   site.js — builds every page from data.js.
   You shouldn't need to edit this file.
   ===================================================================== */
(function () {
  "use strict";

  var S = window.SITE;
  var page = document.body.getAttribute("data-page") || "home";
  var app = document.getElementById("app");

  /* ---------- if data.js failed to load, say so clearly ------------- */
  if (!S || typeof S !== "object") {
    app.innerHTML =
      '<div class="card error-box"><h2>Couldn’t read data.js</h2>' +
      '<p>The site loads all of its content from <code>data.js</code>, and that file didn’t load. ' +
      'Nine times out of ten this is a missing comma, an unclosed quote, or a stray bracket. ' +
      'Open the browser console (right-click → Inspect → Console) and it will tell you the line number.</p></div>';
    return;
  }

  /* ---------- helpers ----------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function paras(s) {
    var t = String(s == null ? "" : s).trim();
    if (!t) return '<p class="muted">(nothing written yet)</p>';
    return t.split(/\n\s*\n/).map(function (p) {
      return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function parseDate(iso) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(iso || "").trim());
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function fmtDate(iso) {
    var d = parseDate(iso);
    if (!d) return iso ? esc(iso) : "—";
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }
  function toISO(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  function byDateDesc(a, b) { return String(b.date || "").localeCompare(String(a.date || "")); }
  function byDateAsc(a, b) { return String(a.date || "").localeCompare(String(b.date || "")); }
  function clamp(n, lo, hi) { n = Number(n); if (isNaN(n)) return lo; return Math.max(lo, Math.min(hi, n)); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  function extLink(url, text) {
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + '</a>';
  }
  function hasValue(v) { return v !== null && v !== undefined && String(v).trim() !== ""; }

  /* ---------- data ----------------------------------------------------- */
  var L = S.learner || {};
  var courses = Array.isArray(S.courses) ? S.courses : [];
  var journal = (Array.isArray(S.journal) ? S.journal.slice() : []).sort(byDateDesc);
  var evidence = (Array.isArray(S.evidence) ? S.evidence.slice() : []).sort(byDateDesc);
  var rubric = S.rubric || {};

  function journalStats() {
    var n = journal.length;
    var weeks = journal.map(function (e) { return Number(e.week) || 0; });
    var latestWeek = n ? Math.max.apply(null, weeks) : 0;
    var scores = journal.map(function (e) { return Number(e.score); }).filter(function (x) { return !isNaN(x) && x > 0; });
    var avg = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : null;
    var checked = journal.filter(function (e) { return hasValue(e.teacherScore); });
    var agreed = checked.filter(function (e) { return Number(e.teacherScore) === Number(e.score); }).length;
    return { n: n, latestWeek: latestWeek, avg: avg, checked: checked.length, agreed: agreed };
  }

  function statusInfo(c) {
    var s = String(c.status || "active").toLowerCase();
    var label = { active: "In progress", completed: "Completed", switched: "Switched away" }[s];
    return { cls: label ? s : "other", label: label || c.status };
  }

  /* ---------- shared chrome: brand, footer, sample strip ---------------- */
  function renderChrome() {
    var name = L.name || "VLD";
    Array.prototype.forEach.call(document.querySelectorAll("[data-learner-name]"), function (el) {
      el.textContent = name;
    });
    if (L.name) document.title = document.title.replace("VLD Portfolio", L.name + " · VLD");

    var left = document.querySelector("[data-footer-left]");
    var right = document.querySelector("[data-footer-right]");
    if (left) left.textContent = name + " · Virtual Learning Day" + (L.year ? " " + L.year : "");
    if (right) right.textContent = journal.length ? "Last reflection: " + fmtDate(journal[0].date) : "No reflections yet";

    if (S.sampleContent) {
      var strip = document.createElement("div");
      strip.className = "sample-strip";
      strip.innerHTML = "This site is still showing sample content. Edit <code>data.js</code> to make it yours, then set <code>sampleContent: false</code>.";
      var header = document.querySelector("header.site");
      header.parentNode.insertBefore(strip, header.nextSibling);
    }
  }

  /* ---------- pieces ------------------------------------------------------ */
  function statCard(n, label) {
    return '<div class="card stat"><div class="n">' + n + '</div><div class="l">' + label + '</div></div>';
  }

  function progressBar(c) {
    var pct = clamp(c.progress, 0, 100);
    return '<div class="bar-row"><div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct + '%"></span></div><span class="pct">' + pct + '%</span></div>' +
      (c.progressNote ? '<div class="small muted">' + esc(c.progressNote) + '</div>' : "");
  }

  function courseCard(c, compact) {
    var st = statusInfo(c);
    var h = '<article class="card course">';
    h += '<div class="course-head"><div>';
    h += (compact ? "<h3>" : "<h2>") + esc(c.name) + (compact ? "</h3>" : "</h2>");
    var prov = [];
    if (c.provider) prov.push(esc(c.provider));
    if (c.url) prov.push(extLink(c.url, "course page ↗"));
    if (prov.length) h += '<div class="provider">' + prov.join(" · ") + "</div>";
    h += '</div><span class="pill ' + st.cls + '">' + esc(st.label) + "</span></div>";
    h += progressBar(c);
    if (!compact) {
      h += "<dl>";
      h += "<dt>Approved</dt><dd>" + fmtDate(c.approved) + "</dd>";
      if (c.completed) h += "<dt>Completed</dt><dd>" + fmtDate(c.completed) + "</dd>";
      h += "</dl>";
      if (c.why) h += '<div class="why"><div class="kicker">Why this course</div>' + paras(c.why) + "</div>";
      if (c.switched) {
        var k = "Switched";
        if (c.switched.date) k += " on " + fmtDate(c.switched.date);
        if (c.switched.to) k += " to " + esc(c.switched.to);
        h += '<div class="switch-note"><div class="k">' + k + "</div>" + paras(c.switched.reason) + "</div>";
      }
    }
    h += "</article>";
    return h;
  }

  function question(num, label, bodyHtml) {
    return '<div class="q"><div class="q-label"><span class="q-num">' + num + "</span>" + label + "</div>" + bodyHtml + "</div>";
  }

  function teacherLine(e) {
    if (!hasValue(e.teacherScore)) {
      return '<div class="teacher-line"><span class="tag pending">ManageBac</span><span class="muted">Not checked against my teacher’s read yet.</span></div>';
    }
    var same = Number(e.teacherScore) === Number(e.score);
    return '<div class="teacher-line"><span class="tag ' + (same ? "agree" : "differ") + '">' +
      (same ? "Teacher agreed" : "Teacher saw it differently") + "</span>" +
      "<span>Teacher gave <strong>" + esc(e.teacherScore) + "</strong>" +
      (e.teacherNote ? " — " + esc(e.teacherNote) : "") + "</span></div>";
  }

  function entryCard(e) {
    var h = '<article class="card entry" id="week-' + esc(e.week) + '" data-course="' + esc(e.course) + '">';
    h += '<div class="entry-head"><div class="title">Week ' + esc(e.week) +
      '<span class="sep">·</span>' + fmtDate(e.date) +
      '<span class="sep">·</span>Course: <span class="name">' + esc(e.course) + "</span></div>";
    h += '<span class="score" data-score="' + esc(e.score) + '" title="Self-score">' + esc(e.score) + "<small>self</small></span></div>";
    h += '<div class="entry-body">';
    h += question(1, "What did I work on today?", paras(e.workedOn));
    h += question(2, "What was challenging, and how did I handle it?", paras(e.challenge));
    var q3 = '<p class="score-line"><strong>Self-score: ' + esc(e.score) + ".</strong>" +
      (rubric[e.score] ? ' <span class="muted">' + esc(rubric[e.score]) + "</span>" : "") + "</p>" +
      paras(e.scoreWhy) + teacherLine(e);
    h += question(3, "How well did I run my own learning today?", q3);
    h += question(4, "What will I do differently or keep doing next session?", paras(e.nextTime));
    h += "</div></article>";
    return h;
  }

  function blankEntryTemplate() {
    var st = journalStats();
    var nextWeek = st.latestWeek + 1;
    var d = journal.length ? parseDate(journal[0].date) : null;
    var nextDate = d ? toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)) : toISO(new Date());
    var course = journal.length ? journal[0].course : (courses.length ? courses[courses.length - 1].name : "");
    return [
      "    {",
      "      week: " + nextWeek + ",",
      '      date: "' + nextDate + '",',
      '      course: "' + String(course).replace(/"/g, '\\"') + '",',
      '      workedOn: "",',
      '      challenge: "",',
      "      score: 89,           // 100, 89, 79 or 69",
      '      scoreWhy: "",',
      "      teacherScore: null,  // fill in after checking ManageBac",
      '      teacherNote: "",',
      '      nextTime: ""',
      "    },"
    ].join("\n");
  }

  /* ---------- pages --------------------------------------------------------- */
  var SECTIONS = [
    { href: "course-log.html", t: "Course log", d: "My course, the date it was approved, progress, and any switches (with reasons)." },
    { href: "journal.html", t: "Reflection journal", d: "A dated entry after every session, using the four-question template." },
    { href: "bio.html", t: "Learner bio", d: "A short profile written for the Grade 10 students who come after me." },
    { href: "evidence.html", t: "Evidence", d: "Certificates, screenshots, and final project proof once I finish." }
  ];

  function renderHome() {
    var st = journalStats();
    var active = courses.filter(function (c) { return statusInfo(c).cls === "active"; });
    var showing = active.length ? active : courses.slice(-1);
    var h = "";

    h += '<section class="hero">';
    h += '<div class="meta">' +
      (L.grade ? '<span class="pill">' + esc(L.grade) + "</span>" : "") +
      (L.year ? '<span class="pill">VLD ' + esc(L.year) + "</span>" : "") + "</div>";
    h += "<h1>Hi, I’m " + esc(L.name || "a VLD learner") + ".</h1>";
    if (L.tagline) h += '<p class="lede">' + esc(L.tagline) + "</p>";
    h += "</section>";

    h += "<section>";
    h += '<div class="kicker">This year</div><h2>What I’m taking</h2>';
    if (L.thisYear) h += '<div class="lede" style="margin-bottom:18px">' + paras(L.thisYear) + "</div>";
    if (showing.length) {
      h += '<div class="grid ' + (showing.length > 1 ? "two" : "") + '">' + showing.map(function (c) { return courseCard(c, true); }).join("") + "</div>";
    } else {
      h += '<div class="empty"><h3>No course yet</h3><p>Add one to <code>data.js</code> once it’s been approved.</p></div>';
    }
    h += '<p class="small" style="margin-top:12px"><a href="course-log.html">See the full course log →</a></p>';
    h += "</section>";

    h += "<section>";
    h += '<div class="kicker">Where I’m at</div><h2>Progress so far</h2>';
    h += '<div class="grid four">' +
      statCard(st.n, plural(st.n, "reflection").split(" ")[1]) +
      statCard(st.latestWeek || "—", "latest week") +
      statCard(st.avg != null ? st.avg : "—", "avg self-score") +
      statCard(evidence.length, plural(evidence.length, "evidence item").split(" ").slice(1).join(" ")) +
      "</div>";
    h += "</section>";

    if (journal.length) {
      var e = journal[0];
      h += "<section>";
      h += '<div class="kicker">Latest reflection</div>';
      h += '<article class="card"><h2 style="font-size:1.25rem">Week ' + esc(e.week) + ' · ' + fmtDate(e.date) + ' · ' + esc(e.course) + "</h2>";
      h += '<div class="score-row"><span class="score" data-score="' + esc(e.score) + '">' + esc(e.score) + "<small>self</small></span></div>";
      h += paras(e.workedOn);
      h += '<p class="small" style="margin-top:12px"><a href="journal.html#week-' + esc(e.week) + '">Read the full entry →</a></p>';
      h += "</article></section>";
    }

    h += "<section>";
    h += '<div class="kicker">Sections</div><h2>Around this site</h2>';
    h += '<ul class="section-links grid two">' + SECTIONS.map(function (s) {
      return '<li class="card"><a href="' + s.href + '"><div class="t">' + s.t + '</div><div class="d">' + s.d + "</div></a></li>";
    }).join("") + "</ul>";
    h += "</section>";

    app.innerHTML = h;
  }

  function renderCourseLog() {
    var h = '<div class="page-head"><div class="kicker">Course log</div><h1>What I’m taking, and how it’s going</h1>' +
      '<p class="lede">Each course, the date it was approved, how far I’ve got — and any switches, with the reason, because that’s the interesting part.</p></div>';

    if (!courses.length) {
      h += '<div class="empty"><h3>No course logged yet</h3><p>Add your first course to the <code>courses</code> list in <code>data.js</code>.</p></div>';
      app.innerHTML = h;
      return;
    }

    h += "<section>";
    courses.forEach(function (c, i) {
      h += courseCard(c, false);
      if (c.switched && i < courses.length - 1) h += '<div class="switch-arrow" aria-hidden="true">↓</div>';
    });
    h += "</section>";

    var ev = [];
    courses.forEach(function (c) {
      if (c.approved) ev.push({ date: c.approved, cls: "approved", t: "Approved — " + c.name, x: c.provider || "" });
      if (c.switched && c.switched.date) ev.push({ date: c.switched.date, cls: "switch", t: "Switched away from " + c.name, x: c.switched.to ? "to " + c.switched.to : "" });
      if (c.completed) ev.push({ date: c.completed, cls: "completed", t: "Completed — " + c.name, x: "" });
    });
    ev.sort(byDateAsc);
    if (ev.length) {
      h += '<section><div class="kicker">Timeline</div><h2>Key dates</h2><div class="card"><ul class="timeline">';
      ev.forEach(function (e) {
        h += '<li class="' + e.cls + '"><div class="d">' + fmtDate(e.date) + '</div><div class="t">' + esc(e.t) + "</div>" + (e.x ? '<div class="x">' + esc(e.x) + "</div>" : "") + "</li>";
      });
      h += "</ul></div></section>";
    }
    app.innerHTML = h;
  }

  function renderJournal() {
    var st = journalStats();
    var courseNames = [];
    journal.forEach(function (e) { if (e.course && courseNames.indexOf(e.course) < 0) courseNames.push(e.course); });

    var h = '<div class="page-head"><div class="kicker">Reflection journal</div><h1>One entry after every session</h1>' +
      '<p class="lede">Four questions, answered honestly. “It was hard” isn’t a reflection — what exactly was hard, and what did I do about it?</p></div>';

    h += '<div class="grid four">' +
      statCard(st.n, plural(st.n, "entry", "entries").split(" ")[1]) +
      statCard(st.latestWeek || "—", "latest week") +
      statCard(st.avg != null ? st.avg : "—", "avg self-score") +
      statCard(st.checked ? st.agreed + " / " + st.checked : "—", "teacher agreed") +
      "</div>";

    h += '<div class="toolbar no-print">';
    if (courseNames.length > 1) {
      h += '<label for="course-filter">Course</label><select id="course-filter"><option value="">All courses</option>' +
        courseNames.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + "</option>"; }).join("") + "</select>";
    }
    h += '<div class="spacer"></div>';
    h += '<button class="btn" id="copy-template" type="button">Copy a blank entry</button>';
    h += "</div>";

    var rubricKeys = Object.keys(rubric).sort(function (a, b) { return b - a; });
    if (rubricKeys.length) {
      h += '<details class="card no-print" style="margin-bottom:24px"><summary>What the scores mean</summary><div class="rubric-key">';
      rubricKeys.forEach(function (k) {
        h += '<div class="r"><span class="score" data-score="' + esc(k) + '">' + esc(k) + "</span><div>" + esc(rubric[k]) + "</div></div>";
      });
      h += '</div><p class="small muted" style="margin-top:14px">Edit these descriptions in <code>data.js</code> so they match the wording on your course rubric.</p></details>';
    }

    if (!journal.length) {
      h += '<div class="empty"><h3>No entries yet</h3><p>Write your first one after your first session. Use the “Copy a blank entry” button above and paste it into the <code>journal</code> list in <code>data.js</code>.</p></div>';
    } else {
      h += '<div class="entries">' + journal.map(entryCard).join("") + "</div>";
    }

    h += '<details class="card no-print" id="template-box" style="margin-top:32px"><summary>Blank entry template</summary>' +
      '<p class="small muted">Paste this into the <code>journal</code> list in <code>data.js</code>. Week, date and course are pre-filled based on your last entry.</p>' +
      "<pre id=\"template-code\">" + esc(blankEntryTemplate()) + "</pre></details>";

    app.innerHTML = h;

    var sel = document.getElementById("course-filter");
    if (sel) {
      sel.addEventListener("change", function () {
        var v = sel.value;
        Array.prototype.forEach.call(document.querySelectorAll(".entry"), function (el) {
          el.hidden = !!v && el.getAttribute("data-course") !== v;
        });
      });
    }

    var btn = document.getElementById("copy-template");
    var box = document.getElementById("template-box");
    var pre = document.getElementById("template-code");
    btn.addEventListener("click", function () {
      var text = blankEntryTemplate();
      var done = function () { btn.textContent = "Copied — paste it into data.js"; setTimeout(function () { btn.textContent = "Copy a blank entry"; }, 2500); };
      var fallback = function () {
        box.open = true;
        var range = document.createRange(); range.selectNodeContents(pre);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(range);
        btn.textContent = "Select-all is done — press Ctrl/Cmd+C";
        setTimeout(function () { btn.textContent = "Copy a blank entry"; }, 3000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });

    if (location.hash) {
      var target = document.querySelector(location.hash);
      if (target) target.scrollIntoView();
    }
  }

  function renderBio() {
    var h = '<div class="page-head"><div class="kicker">Learner bio</div>' +
      "<h1>" + esc(L.name || "A VLD learner") + (L.grade ? ", " + esc(L.grade) : "") + "</h1>" +
      (L.tagline ? '<p class="lede">' + esc(L.tagline) + "</p>" : "") + "</div>";

    h += '<div class="bio-grid">';

    h += '<div class="card bio-item"><div class="kicker">Course(s) I took through VLD</div>';
    if (courses.length) {
      h += "<ul>";
      courses.forEach(function (c) {
        var st = statusInfo(c);
        h += "<li><strong>" + esc(c.name) + "</strong>" + (c.provider ? " <span class=\"muted\">(" + esc(c.provider) + ")</span>" : "") +
          ' <span class="pill ' + st.cls + '">' + esc(st.label) + "</span>";
        if (c.switched) {
          h += '<div class="small" style="margin-top:4px">Switched' + (c.switched.date ? " on " + fmtDate(c.switched.date) : "") +
            (c.switched.to ? " to <strong>" + esc(c.switched.to) + "</strong>" : "") + (c.switched.reason ? " — " + esc(c.switched.reason) : "") + "</div>";
        }
        h += "</li>";
      });
      h += "</ul>";
    } else {
      h += '<p class="muted">Nothing approved yet.</p>';
    }
    h += "</div>";

    h += '<div class="card bio-item"><div class="kicker">What I hoped to gain</div><div class="v">' + paras(L.hopedToGain) + "</div></div>";

    if (L.motto && (L.motto.text || typeof L.motto === "string")) {
      var mt = typeof L.motto === "string" ? L.motto : L.motto.text;
      var by = typeof L.motto === "string" ? "" : L.motto.by;
      h += '<div class="bio-item"><div class="kicker">A quote or motto that means something to me</div>' +
        '<blockquote class="motto">“' + esc(mt) + "”" + (by ? "<footer>" + esc(by) + "</footer>" : "") + "</blockquote></div>";
    }

    h += '<div class="card accent bio-item"><div class="kicker">My advice for a G10 student starting this course</div><div class="v">' + paras(L.adviceForG10) + "</div></div>";

    h += "</div>";
    h += '<p class="small muted" style="margin-top:28px">Written for Grade 10 students choosing their VLD course. Preferred name only — nothing here I wouldn’t say to a stranger.</p>';
    app.innerHTML = h;
  }

  function isImage(path) { return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(String(path || "")); }
  var TYPE_ICON = { certificate: "🎓", screenshot: "🖼", project: "🛠" };

  function renderEvidence() {
    var h = '<div class="page-head"><div class="kicker">Evidence</div><h1>Proof of what I finished</h1>' +
      '<p class="lede">Certificates, screenshots and final project work. This page fills up as the year goes on.</p></div>';

    if (!evidence.length) {
      h += '<div class="empty"><h3>Nothing here yet</h3><p>That’s normal early in the year. When you finish a module, a project, or the whole course, drop the file into the <code>evidence/</code> folder and add it to the <code>evidence</code> list in <code>data.js</code>.</p></div>';
      app.innerHTML = h;
      return;
    }

    h += '<div class="evidence-grid">';
    evidence.forEach(function (it, i) {
      var link = it.file || it.url || "";
      var type = String(it.type || "").toLowerCase();
      var icon = TYPE_ICON[type] || "📎";
      h += '<article class="card ev">';
      if (it.file && isImage(it.file)) {
        h += '<a class="thumb" href="' + esc(it.file) + '" target="_blank" rel="noopener"><img src="' + esc(it.file) + '" alt="' + esc(it.title) + '" data-ev="' + i + '" loading="lazy"></a>';
      } else if (link) {
        h += '<a class="thumb placeholder" href="' + esc(link) + '" target="_blank" rel="noopener"><div>' + icon + "<div><span>" + esc(type || "file") + "</span></div></div></a>";
      } else {
        h += '<div class="thumb placeholder"><div>' + icon + "<div><span>" + esc(type || "item") + "</span></div></div></div>";
      }
      h += '<div class="body">';
      h += '<div class="meta">' + (type ? '<span class="pill">' + esc(type) + "</span>" : "") + (it.date ? "<span>" + fmtDate(it.date) + "</span>" : "") + "</div>";
      h += "<h3>" + esc(it.title || "Untitled") + "</h3>";
      if (it.course) h += '<div class="small muted">' + esc(it.course) + "</div>";
      if (it.caption) h += '<div class="cap">' + esc(it.caption) + "</div>";
      if (link) h += '<div class="open"><a href="' + esc(link) + '" target="_blank" rel="noopener">Open ' + (it.file ? "file" : "link") + " ↗</a></div>";
      h += "</div></article>";
    });
    h += "</div>";
    app.innerHTML = h;

    Array.prototype.forEach.call(document.querySelectorAll("img[data-ev]"), function (img) {
      img.addEventListener("error", function () {
        var a = img.parentNode;
        var card = a.parentNode;
        var note = document.createElement("div");
        note.className = "missing";
        note.textContent = "File not found: " + img.getAttribute("src") + " — check the path in data.js";
        a.classList.add("placeholder");
        a.innerHTML = "<div>❓<div><span>missing file</span></div></div>";
        card.querySelector(".body").appendChild(note);
      });
    });
  }

  /* ---------- go --------------------------------------------------------- */
  renderChrome();
  ({ home: renderHome, "course-log": renderCourseLog, journal: renderJournal, bio: renderBio, evidence: renderEvidence }[page] || renderHome)();
})();
