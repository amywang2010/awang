/* ============================================================
   Reading view. The same person, no walking required.
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var C = AW.content;
  var rendered = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function render() {
    if (rendered) return;
    rendered = true;
    var mount = document.getElementById('main-static');

    var stats = C.stats.map(function (s) {
      return '<li><span class="stat-v">' + esc(s.value) + '</span><span class="stat-l">' + esc(s.label) + '</span></li>';
    }).join('');

    var research = C.research.map(function (r, i) {
      return '<article class="r-entry" id="r-' + r.id + '">' +
        '<div class="r-side"><span class="r-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="r-year">' + esc(r.year) + '</span></div>' +
        '<div class="r-main"><p class="r-field">' + esc(r.field) + '</p>' +
        '<h3>' + esc(r.title) + '</h3>' +
        '<p class="r-sub">' + esc(r.sub) + '</p>' +
        r.body.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
        '<ul class="r-metrics">' + r.metrics.map(function (m) {
          return '<li><span>' + esc(m.value) + '</span>' + esc(m.label) + '</li>';
        }).join('') + '</ul>' +
        (r.note ? '<p class="r-note">' + r.note + '</p>' : '') +
        '</div></article>';
    }).join('');

    var work = C.work.groups.map(function (g) {
      return '<article class="w-item"><p class="w-when">' + esc(g.period) + '</p>' +
        '<div><h3>' + esc(g.role) + '</h3><p class="w-org">' + esc(g.org) + '</p>' +
        '<p class="w-blurb">' + esc(g.blurb) + '</p></div></article>';
    }).join('');

    var featured = C.recognition.featured ? '<div class="rec-featured">' + C.recognition.featured.map(function (f) {
      return '<div class="rec-flag"><span class="rec-flag-name">' + esc(f.label) + '</span>' +
        '<span class="rec-flag-detail">' + esc(f.detail) + '</span></div>';
    }).join('') + '</div>' : '';

    var recognition = C.recognition.groups.map(function (g) {
      return '<div class="rec-group"><h3>' + esc(g.title) + '</h3><ul>' + g.items.map(function (it) {
        return '<li><span class="rec-name">' + esc(it.label) + '</span>' +
          (it.detail ? '<span class="rec-detail">' + esc(it.detail) + '</span>' : '') + '</li>';
      }).join('') + '</ul></div>';
    }).join('');

    var projects = C.projects.items.map(function (p) {
      return '<article class="p-item">' +
        (p.img ? '<figure class="p-photo"><img src="' + p.img + '" alt="' + esc(p.imgAlt || '') + '" loading="lazy" decoding="async">' +
          (p.imgCaption ? '<figcaption>' + esc(p.imgCaption) + '</figcaption>' : '') + '</figure>' : '') +
        '<p class="p-sub">' + esc(p.sub) + '</p>' +
        '<h3>' + esc(p.title) + '</h3><p>' + esc(p.body) + '</p>' +
        (p.link ? '<a href="' + p.link + '" target="_blank" rel="noopener">' + esc(p.linkLabel) + ' \u2197</a>' : '') +
        '</article>';
    }).join('');

    mount.innerHTML =
      '<header class="site-nav">' +
        '<a class="site-mark" href="#top" aria-label="Amy Wang, back to top">Amy Wang</a>' +
        '<nav aria-label="Sections">' +
          '<a href="#about">About</a><a href="#research">Research</a><a href="#work">Work</a>' +
          '<a href="#recognition">Recognition</a><a href="#projects">Projects</a><a href="#off">Outside the lab</a><a href="#contact">Contact</a>' +
        '</nav>' +
        '<button class="mode-btn" id="to-field" type="button">Interactive version</button>' +
      '</header>' +
      '<main id="top">' +
        '<section class="s-hero">' +
          '<p class="s-eyebrow">' + esc(C.hero.meta) + '</p>' +
          '<h1>' + esc(C.name) + '</h1>' +
          '<p class="s-lede">' + C.hero.intro + '</p>' +
          '<div class="s-actions"><a class="s-btn" href="mailto:' + C.email + '">' + C.email + '</a>' +
          '<a class="s-btn s-btn--ghost" href="' + C.linkedin + '" target="_blank" rel="noopener">LinkedIn \u2197</a></div>' +
          '<ul class="s-stats">' + stats + '</ul>' +
        '</section>' +

        '<section class="s-section" id="about">' +
          '<div class="s-head"><span>01</span><h2>About</h2></div>' +
          '<div class="s-about">' +
            '<div class="s-about-text">' +
              (C.about.photo ? '<figure class="s-photo"><img src="' + C.about.photo.src + '" alt="' + esc(C.about.photo.alt) + '" loading="lazy" decoding="async">' +
                '<figcaption>' + esc(C.about.photo.caption) + '</figcaption></figure>' : '') +
              C.about.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
            '<aside class="s-aside"><dl>' + C.about.facts.map(function (f) {
              return '<div><dt>' + esc(f.k) + '</dt><dd>' + esc(f.v) + '</dd></div>';
            }).join('') + '</dl></aside>' +
          '</div>' +
        '</section>' +

        '<section class="s-section" id="research">' +
          '<div class="s-head"><span>02</span><h2>Research</h2></div>' +
          '<p class="s-intro">' + C.researchIntro + '</p>' +
          '<div class="r-list">' + research + '</div>' +
          '<blockquote class="s-quote"><p>\u201c' + C.quote.text + '\u201d</p>' +
          '<cite>' + C.quote.who + '<span>' + C.quote.role + '</span></cite></blockquote>' +
        '</section>' +

        '<section class="s-section" id="work">' +
          '<div class="s-head"><span>03</span><h2>Work</h2></div>' +
          '<p class="s-intro">' + C.work.intro + '</p>' +
          '<div class="w-list">' + work + '</div>' +
        '</section>' +

        '<section class="s-section" id="recognition">' +
          '<div class="s-head"><span>04</span><h2>Recognition</h2></div>' +
          '<p class="s-intro">' + C.recognition.intro + '</p>' +
          featured +
          '<div class="rec-grid">' + recognition + '</div>' +
        '</section>' +

        '<section class="s-section" id="projects">' +
          '<div class="s-head"><span>05</span><h2>Projects</h2></div>' +
          '<div class="p-grid">' + projects + '</div>' +
        '</section>' +

        '<section class="s-section" id="off">' +
          '<div class="s-head"><span>06</span><h2>Outside the lab</h2></div>' +
          '<div class="s-about">' +
            '<div class="s-about-text">' + C.arts.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
            '<aside class="s-aside"><dl>' + C.arts.facts.map(function (f) {
              return '<div><dt>' + esc(f.k) + '</dt><dd>' + esc(f.v) + '</dd></div>';
            }).join('') + '</dl></aside>' +
          '</div>' +
        '</section>' +

        '<section class="s-section s-contact" id="contact">' +
          '<div class="s-head"><span>07</span><h2>Contact</h2></div>' +
          '<div class="c-grid"><div><p class="c-lede">' + C.contact.body + '</p>' +
          '<p class="c-note">' + C.contact.note + '</p></div>' +
          '<div class="c-links"><a href="mailto:' + C.email + '">' + C.email + '</a>' +
          '<a href="' + C.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
          '<span>' + C.location + '</span></div></div>' +
        '</section>' +
      '</main>' +
      '<footer class="s-footer"><span>Amy Wang \u00b7 ' + new Date().getFullYear() + '</span>' +
      '<button class="mode-btn" type="button" data-to-field>Open the field</button></footer>';

    mount.querySelectorAll('#to-field, [data-to-field]').forEach(function (b) {
      b.addEventListener('click', function () { AW.setMode('field'); });
    });

    // tiny scroll reveal
    if ('IntersectionObserver' in window && !AW.prefersReducedMotion()) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); }
        });
      }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
      mount.querySelectorAll('.r-entry, .w-item, .p-item, .rec-group, .s-head').forEach(function (el) {
        el.classList.add('s-reveal');
        io.observe(el);
      });
    }
  }

  AW.Static = { render: render, isRendered: function () { return rendered; } };
})();
