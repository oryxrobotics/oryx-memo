/* Oryx Robotics — Investment Memo renderer. Vanilla JS, no deps.
   Shares the Strategy Portal's design language; content model is prose + media. */
(function () {
  "use strict";
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  var D = window.ORYX_MEMO;
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var el = function (html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  // "@img:x" -> file path for the plaintext dev build; the encrypted build
  // inlines it as a data: URI before this ever runs.
  var img = function (v) { if (!v) return ""; return v.indexOf("@img:") === 0 ? "assets/img/" + v.slice(5) : v; };

  // Robot head crowned with oryx horns — the brand mark (matches portal).
  var HORNS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" aria-label="Oryx mark"><g fill="currentColor">' +
    '<polygon points="146,226 192,226 142,52 106,64"/><polygon points="254,226 208,226 258,52 294,64"/>' +
    '<path d="M112 226 L288 226 L312 258 L312 312 L260 372 L140 372 L88 312 L88 258 Z"/>' +
    '<rect x="128" y="270" width="58" height="26" rx="5" fill="#F1EBDE"/><rect x="214" y="270" width="58" height="26" rx="5" fill="#F1EBDE"/></g></svg>';

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    var m = D.meta;
    var nav = D.sections.map(function (s) {
      return '<li><a href="#' + s.id + '" data-target="' + s.id + '"><span class="nav-num">' + esc(s.num) +
        '</span><span class="nav-q">' + esc(s.kicker) + "</span></a></li>";
    }).join("");
    return el(
      '<aside class="sidebar" id="sidebar">' +
        '<div class="brandblock"><span class="wm"><span class="mark">' + HORNS + "</span>" +
          '<span class="wm-text">' + esc(m.wordmark) + '<span class="arabic">' + esc(m.arabic) + "</span></span></span></div>" +
        '<div class="sub-brand">' + esc(m.docTitle) + "</div>" +
        '<ul class="nav">' + nav + "</ul>" +
        '<div class="sidebar-foot">' + esc(m.prepared) + "</div>" +
      "</aside>"
    );
  }

  /* ---------- Hero ---------- */
  function buildHero() {
    var m = D.meta;
    return el(
      '<section class="hero" id="top">' +
        '<div class="hero-copy">' +
          '<div class="eyebrow">' + esc(m.eyebrow) + "</div>" +
          '<h1 class="thesis">' + esc(m.thesis) + "</h1>" +
          (m.subline ? '<p class="subline">' + esc(m.subline) + "</p>" : "") +
          '<p class="intro">' + esc(m.intro) + "</p>" +
          '<p class="prepared">' + esc(m.prepared) + "</p>" +
        "</div>" +
        (m.heroImg ? '<div class="hero-art"><img src="' + img(m.heroImg) + '" alt="ORYX-01" loading="eager">' +
          (m.heroTag ? '<span class="tag">' + esc(m.heroTag) + "</span>" : "") + "</div>" : "") +
      "</section>"
    );
  }

  /* ---------- Extras ---------- */
  function renderExtra(x) {
    switch (x.type) {
      case "table": {
        var th = x.headers.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("");
        var last = x.rows.length - 1;
        var tr = x.rows.map(function (r, i) {
          return "<tr" + (x.highlightLast && i === last ? ' class="hl"' : "") + ">" +
            r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
        }).join("");
        return '<div class="extra">' + (x.title ? "<h4>" + esc(x.title) + "</h4>" : "") +
          '<table class="t"><thead><tr>' + th + "</tr></thead><tbody>" + tr + "</tbody></table></div>";
      }
      case "stats":
        return '<div class="stats">' + x.items.map(function (s) {
          return '<div class="stat"><div class="val">' + esc(s.val) + '</div><div class="lbl">' + esc(s.lbl) + "</div></div>";
        }).join("") + "</div>";
      case "stack":
        return '<div class="stack">' + x.items.map(function (t) {
          return '<div class="tier"><div class="tnum">' + esc(t.n) + '</div><div class="tbody">' +
            '<div class="ttop"><span class="tname">' + esc(t.name) + "</span>" +
            (t.tag ? '<span class="ttag">' + esc(t.tag) + "</span>" : "") + "</div>" +
            '<p class="td">' + esc(t.d) + "</p></div></div>";
        }).join("") + "</div>" +
          (x.foot ? '<div class="stack-foot"><p>' + esc(x.foot) + "</p></div>" : "");
      case "figures":
        return '<div class="figrow' + (x.className ? " " + x.className : "") + '">' + x.items.map(function (f) {
          return '<figure class="fig"><div class="figimg">' +
            (f.label ? '<span class="figlabel">' + esc(f.label) + "</span>" : "") +
            (f.tag ? '<span class="figtag">' + esc(f.tag) + "</span>" : "") +
            '<img src="' + img(f.img) + '" alt="" loading="lazy"></div>' +
            (f.cap ? "<figcaption>" + esc(f.cap) + "</figcaption>" : "") + "</figure>";
        }).join("") + "</div>";
      case "banner":
        return '<div class="banner"><span class="lbl">' + esc(x.label) + '</span><div class="txt">' + esc(x.text) + "</div></div>";
      case "note":
        return '<div class="note">' + (x.title ? "<h5>" + esc(x.title) + "</h5>" : "") + "<p>" + esc(x.text) + "</p></div>";
      case "layers":
        return '<div class="extra"><h4>' + esc(x.title) + '</h4><div class="layers">' + x.items.map(function (l) {
          return '<div class="layer' + (l.highlight ? " hl" : "") + '"><span class="lid">' + esc(l.id) +
            '</span><span><span class="lname">' + esc(l.name) + '</span><span class="ld">' + esc(l.d) + "</span></span>" +
            '<span class="lwhere ' + (l.where === "cloud" ? "cloud" : "") + '">' + esc(l.where) + "</span></div>";
        }).join("") + "</div></div>";
      case "arenas":
        return '<div class="arenas">' + x.items.map(function (a) {
          return '<div class="arena"><h4>' + esc(a.name) + '</h4><p class="means">' + esc(a.means) + "</p><ul>" +
            a.players.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>";
        }).join("") + "</div>";
      case "team":
        return '<div class="team">' + x.items.map(function (mb) {
          return '<div class="member"><div class="mname">' + esc(mb.name) + '</div><div class="mrole">' +
            esc(mb.role) + '</div><p class="mbio">' + esc(mb.bio) + "</p></div>";
        }).join("") + "</div>";
      case "timeline":
        return '<div class="extra"><h4>' + esc(x.title) + '</h4><div class="timeline">' + x.items.map(function (t) {
          return '<div class="tl-item"><div class="tl-when">' + esc(t.when) + '</div><div class="tl-action">' +
            esc(t.action) + '</div><div class="tl-output">→ ' + esc(t.output) + "</div></div>";
        }).join("") + "</div></div>";
      default: return "";
    }
  }

  /* ---------- Section ---------- */
  function buildSection(s) {
    var html = '<section class="section" id="' + s.id + '">' +
      '<div class="kicker"><span class="num">' + esc(s.num) + '</span><span class="cat">' + esc(s.kicker) + "</span></div>" +
      "<h2>" + esc(s.kicker) + "</h2>";
    if (s.lead) html += '<p class="lead">' + esc(s.lead) + "</p>";
    if (s.body && s.body.length) html += '<div class="body">' + s.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>";
    html += (s.extras || []).map(renderExtra).join("") + "</section>";
    return el(html);
  }

  function buildFooter() {
    return el('<footer class="footer"><span class="ribbon"><span class="dot"></span>Confidential — Oryx Robotics</span>' +
      '<div class="meta">Investment memo · Pre-Seed · June 2026. Oryx Robotics is a Delaware C-Corp; its autonomy mind operates under Islah AI. ' +
      "This document contains forward-looking statements and targets that are not historical results, and is not an offer of securities.</div></footer>");
  }

  /* ---------- Mount ---------- */
  function mount() {
    D = window.ORYX_MEMO || D;
    if (!D || !D.sections) return;
    var root = document.getElementById("app");
    root.appendChild(buildSidebar());
    var content = el('<main class="content"><div class="wrap" id="wrap"></div></main>');
    var wrap = content.querySelector("#wrap");
    wrap.appendChild(buildHero());
    D.sections.forEach(function (s) { wrap.appendChild(buildSection(s)); });
    wrap.appendChild(buildFooter());
    root.appendChild(content);
    setupMobileMenu(root.querySelector(".sidebar"));
    setupScrollSpy();
    var h = document.documentElement, prev = h.style.scrollBehavior;
    h.style.scrollBehavior = "auto"; window.scrollTo(0, 0); h.style.scrollBehavior = prev;
  }

  function setupMobileMenu(sidebar) {
    var btn = el('<button class="menubtn" aria-label="Open navigation">☰ Memo</button>');
    var scrim = el('<div class="scrim"></div>');
    document.body.appendChild(btn); document.body.appendChild(scrim);
    function close() { sidebar.classList.remove("open"); scrim.classList.remove("show"); }
    btn.addEventListener("click", function () { var o = sidebar.classList.toggle("open"); scrim.classList.toggle("show", o); });
    scrim.addEventListener("click", close);
    sidebar.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
  }

  // Active section = whichever spans a reference line ~35% down the viewport.
  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
    var ticking = false;
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.35, current = null;
      D.sections.forEach(function (s) {
        var n = document.getElementById(s.id);
        if (!n) return;
        var r = n.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = s.id;
      });
      links.forEach(function (a) { a.classList.toggle("active", !!current && a.getAttribute("data-target") === current); });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  function boot() {
    if (window.history && "scrollRestoration" in window.history) history.scrollRestoration = "manual";
    // Plaintext dev build: data is already here, mount now. Encrypted build:
    // data arrives after the gate decrypts, so expose mount() for gate.js.
    if (window.ORYX_MEMO) mount(); else window.__oryxMount = mount;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
