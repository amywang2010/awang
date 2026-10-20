/* ============================================================
   Field notes
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var C = AW.content;

  var layer, wrap, panel, kickerEl, titleEl, bodyEl, footEl, closeBtn;
  var lastFocus = null;
  var current = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function paragraphs(arr) {
    return arr.map(function (p) { return '<p>' + p + '</p>'; }).join('');
  }

  function facts(arr) {
    return '<div class="fact-grid">' + arr.map(function (f) {
      return '<div><p class="fact-k">' + esc(f.k) + '</p><p class="fact-v">' + esc(f.v) + '</p></div>';
    }).join('') + '</div>';
  }

  function metrics(arr) {
    return '<div class="metric-row">' + arr.map(function (m) {
      return '<div class="metric"><p class="metric-v">' + esc(m.value) + '</p><p class="metric-l">' + esc(m.label) + '</p></div>';
    }).join('') + '</div>';
  }

  function notes(str) {
    return str ? '<p class="panel-note">' + str + '</p>' : '';
  }

  var views = {
    about: function () {
      return {
        kicker: C.about.kicker,
        title: C.about.title,
        body: (C.about.photo ? '<figure class="panel-photo">' +
          '<img src="' + C.about.photo.src + '" alt="' + esc(C.about.photo.alt) + '" width="400" height="400" loading="lazy" decoding="async">' +
          '<figcaption>' + esc(C.about.photo.caption) + '</figcaption></figure>' : '') +
          paragraphs(C.about.paragraphs) + facts(C.about.facts) + notes(C.about.note),
        foot: '<p class="panel-hint">Walk with the arrow keys or by clicking the grass. Press E when something is close.</p>' +
          '<div class="contact-actions">' +
          '<a class="btn-ink" href="mailto:' + C.email + '">Write to me</a>' +
          '<button class="btn-outline" type="button" data-open="research">See the research</button>' +
          '</div>'
      };
    },

    research: function () {
      return {
        kicker: 'Research',
        title: 'What I have been working on',
        body: '<p>' + C.researchIntro + '</p><div class="entry-list">' +
          C.research.map(function (r, i) {
            return '<button class="entry" type="button" data-research="' + i + '">' +
              '<span class="entry-top"><span class="entry-title">' + r.title + '<span class="entry-arrow">\u2192</span></span>' +
              '<span class="entry-year">' + r.year + '</span></span>' +
              '<span class="entry-sub">' + r.field + ' \u00b7 ' + r.sub + '</span>' +
              '</button>';
          }).join('') + '</div>' +
          '<div class="quote-block"><p class="quote-text">\u201c' + C.quote.text + '\u201d</p>' +
          '<p class="quote-who">' + C.quote.who + ', ' + C.quote.role + '</p></div>',
        foot: ''
      };
    },

    recognition: function () {
      var featured = C.recognition.featured ? '<div class="rec-featured">' + C.recognition.featured.map(function (f) {
        return '<div class="rec-flag"><span class="rec-flag-name">' + esc(f.label) + '</span>' +
          '<span class="rec-flag-detail">' + esc(f.detail) + '</span></div>';
      }).join('') + '</div>' : '';
      return {
        kicker: C.recognition.kicker,
        title: C.recognition.title,
        body: '<p>' + C.recognition.intro + '</p>' + featured + C.recognition.groups.map(function (g) {
          return '<p class="group-head">' + esc(g.title) + '</p>' + g.items.map(function (it) {
            return '<div class="award"><span class="award-name">' + esc(it.label) + '</span>' +
              '<span class="award-detail">' + esc(it.detail || '') + '</span></div>';
          }).join('');
        }).join(''),
        foot: ''
      };
    },

    work: function () {
      return {
        kicker: C.work.kicker,
        title: C.work.title,
        body: '<p>' + C.work.intro + '</p>' + C.work.groups.map(function (g) {
          return '<div class="timeline-item"><div class="timeline-when">' + esc(g.period) + '</div>' +
            '<div><p class="timeline-role">' + esc(g.role) + '</p>' +
            '<p class="timeline-org">' + esc(g.org) + '</p>' +
            '<p class="timeline-blurb">' + esc(g.blurb) + '</p></div></div>';
        }).join(''),
        foot: ''
      };
    },

    projects: function () {
      return {
        kicker: C.projects.kicker,
        title: C.projects.title,
        body: C.projects.items.map(function (p) {
          return '<div class="project-item">' +
            (p.img ? '<figure class="project-photo"><img src="' + p.img + '" alt="' + esc(p.imgAlt || '') + '" loading="lazy" decoding="async"><figcaption>' + esc(p.imgCaption || '') + '</figcaption></figure>' : '') +
            '<p class="project-title">' + esc(p.title) + '</p>' +
            '<p class="project-sub">' + esc(p.sub) + '</p>' +
            '<p class="project-body">' + esc(p.body) + '</p>' +
            (p.link ? '<a class="project-link" href="' + p.link + '" target="_blank" rel="noopener">' + esc(p.linkLabel) + ' \u2197</a>' : '') +
            '</div>';
        }).join(''),
        foot: ''
      };
    },

    arts: function () {
      return {
        kicker: C.arts.kicker,
        title: C.arts.title,
        body: paragraphs(C.arts.paragraphs) + facts(C.arts.facts),
        foot: ''
      };
    },

    contact: function () {
      return {
        kicker: C.contact.kicker,
        title: C.contact.title,
        body: '<p>' + C.contact.body + '</p>' + facts([
          { k: 'Email', v: C.email },
          { k: 'LinkedIn', v: 'linkedin.com/in/amy-wang' },
          { k: 'Location', v: C.location }
        ]) + notes(C.contact.note),
        foot: '<div class="contact-actions">' +
          '<a class="btn-ink" href="mailto:' + C.email + '">' + C.email + '</a>' +
          '<a class="btn-outline" href="' + C.linkedin + '" target="_blank" rel="noopener">LinkedIn \u2197</a>' +
          '</div>'
      };
    },

    secret: function () {
      return {
        kicker: 'A small secret',
        title: C.secret.title,
        body: paragraphs(C.secret.body),
        foot: ''
      };
    },

    bench: function () {
      var facts = [
        'A fruit fly has about 140,000 neurons and roughly 50 million synapses. The complete wiring diagram was published in 2024, assembled by a large consortium from electron microscopy.',
        'Almost every cell in your body carries the same genome. What separates a neuron from a skin cell is which genes are switched on, not which genes are present.',
        'Protein-coding DNA is about 1.5% of the human genome. Much of the rest decides when and where those genes are read.',
        'The retina develops as an outgrowth of the embryonic brain. It is the only part of the central nervous system you can photograph directly.',
        'Alzheimer\u2019s pathology begins well before symptoms. Amyloid biomarkers can be abnormal 15 to 20 years before diagnosis, which is the window early detection is trying to reach.',
        'APOE4 is the strongest common genetic risk factor for late-onset Alzheimer\u2019s, but carrying it is neither necessary nor sufficient to develop the disease.',
        'Bacteria can survive antibiotics without resistance mutations by entering a dormant, tolerant state. Tolerance is not resistance, and it is one reason infections relapse after treatment.',
        'Proteins can condense into droplets without a membrane. Tau does this inside neurons, and the physics of these condensates is now a major area of cell biology.'
      ];
      var line = facts[Math.floor(Math.random() * facts.length)];
      return {
        kicker: 'A minute',
        title: 'On the bench',
        body: '<p style="font-family:var(--font-display);font-size:1.25rem;line-height:1.5;color:var(--ink)">' + line + '</p>',
        foot: ''
      };
    },

    guide: function () {
      var G = C.guide;
      return {
        kicker: G.kicker,
        title: G.title,
        body: '<p>' + G.intro + '</p>' +
          '<div class="guide-list">' +
          G.places.map(function (pl) {
            return '<button class="guide-row" type="button" data-walkto="' + pl.site + '">' +
              '<span class="guide-place">' + esc(pl.place) + '</span>' +
              '<span class="guide-what">' + esc(pl.what) + '</span>' +
              '<span class="guide-arrow" aria-hidden="true">→</span>' +
              '</button>';
          }).join('') + '</div>' +
          '<p class="panel-note">' + G.reading + '</p>',
        foot: '<div class="contact-actions">' +
          '<button class="btn-ink" type="button" data-reading="1">Open the professional resume</button>' +
          '<button class="btn-outline" type="button" data-close-panel="1">Back to the field</button>' +
          '</div>'
      };
    },

    journal: function () {
      var total = 7;
      var have = AW.state.cranes || [];
      var slots = '';
      for (var i = 0; i < total; i++) {
        if (have.indexOf(i) !== -1) {
          slots += '<div class="crane-slot filled">' +
            '<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M4 20L20 8l16 12Z" fill="#FBF5E9"/><path d="M20 8L28 4l4 8Z" fill="#EDE0C9"/><path d="M4 20l8-8 8 6-6 8Z" fill="#F3E9D6"/><path d="M28 14l8 2-4 6Z" fill="#FBF5E9"/><path d="M20 8l-2-6 6 4Z" fill="#E5D8C0"/></svg>' +
            '</div>';
        } else {
          slots += '<div class="crane-slot">' + (i + 1) + '</div>';
        }
      }
      var body = '<p>' + (have.length ? 'You have found ' + have.length + ' of 7 folded paper cranes. They are scattered around the field, usually near something worth looking at.' : C.journal.empty) + '</p>' +
        '<div class="crane-grid">' + slots + '</div>' +
        (have.length === total ? notes('All seven collected.') : '');
      return { kicker: 'Journal', title: C.journal.title, body: body, foot: '' };
    }
  };

  function researchDetail(i) {
    var r = C.research[i];
    if (!r) return views.research();
    return {
      kicker: r.field,
      title: r.title,
      body: '<div class="research-head"><p class="research-sub">' + r.sub + '</p></div>' +
        paragraphs(r.body) + metrics(r.metrics) + notes(r.note),
      foot: '<button class="btn-outline" type="button" data-open="research">\u2190 All research</button>'
    };
  }

  function render(view) {
    kickerEl.textContent = view.kicker || '';
    titleEl.textContent = view.title || '';
    bodyEl.innerHTML = view.body || '';
    footEl.innerHTML = view.foot || '';
    bodyEl.scrollTop = 0;
    requestAnimationFrame(function () {
      var first = panel.querySelector('.panel-body .entry, .panel-body .project-item, .panel-body .timeline-item');
      if (first) first.classList.add('in');
    });
  }

  function open(id) {
    if (id === 'bench' && (!AW.World || !AW.World.hasEntered())) {
      AW.toast('Walk to the bench first.');
      return;
    }
    if (id === 'secret' && !AW.state.secretUnlocked) {
      AW.toast('That gate is still locked.');
      return;
    }
    if (AW.Settings && AW.Settings.close) AW.Settings.close();
    var view = (views[id] || views.about)();
    current = id;
    lastFocus = document.activeElement;
    render(view);
    document.title = (view.title ? view.title + ' — ' : '') + 'Amy Wang';
    layer.hidden = false;
    AW.state.panelOpen = true;
    requestAnimationFrame(function () { layer.classList.add('is-open'); });
    setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 100);
    if (AW.Audio) AW.Audio.paper();
  }

  function close() {
    if (layer.hidden) return;
    var closedId = current;
    layer.classList.remove('is-open');
    AW.state.panelOpen = false;
    current = null;
    if (AW.Panels && AW.Panels.onClose) AW.Panels.onClose(closedId);
    document.title = 'Amy Wang';
    setTimeout(function () {
      layer.hidden = true;
      bodyEl.innerHTML = '';
      footEl.innerHTML = '';
    }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function init() {
    layer = document.getElementById('panel-layer');
    wrap = document.getElementById('panel-wrap');
    panel = document.getElementById('panel');
    kickerEl = document.getElementById('panel-kicker');
    titleEl = document.getElementById('panel-title');
    bodyEl = document.getElementById('panel-body');
    footEl = document.getElementById('panel-foot');
    closeBtn = document.getElementById('panel-close');

    closeBtn.addEventListener('click', close);
    document.getElementById('panel-scrim').addEventListener('click', close);

    panel.addEventListener('click', function (e) {
      var r = e.target.closest('[data-research]');
      if (r) {
        var i = parseInt(r.getAttribute('data-research'), 10);
        render(researchDetail(i));
        if (AW.Audio) AW.Audio.paper();
        return;
      }
      var o = e.target.closest('[data-open]');
      if (o) {
        open(o.getAttribute('data-open'));
        return;
      }
      var walk = e.target.closest('[data-walkto]');
      if (walk) {
        var siteId = walk.getAttribute('data-walkto');
        close();
        if (AW.World && AW.World.goToSite) AW.World.goToSite(siteId);
        return;
      }
      if (e.target.closest('[data-reading]')) {
        close();
        if (AW.setMode) AW.setMode('static');
        return;
      }
      if (e.target.closest('[data-close-panel]')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (layer.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') {
        var f = panel.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  AW.Panels = {
    open: open,
    close: close,
    updateCranes: function () {
      var badge = document.getElementById('crane-count');
      var n = (AW.state.cranes || []).length;
      if (badge) {
        badge.textContent = n + '/7';
        badge.classList.toggle('on', n > 0);
      }
      if (current === 'journal') render(views.journal());
    },
    show: function (opts) {
      lastFocus = document.activeElement;
      layer.hidden = false;
      AW.state.panelOpen = true;
      render(opts);
      requestAnimationFrame(function () { layer.classList.add('is-open'); });
      setTimeout(function () { closeBtn.focus({ preventScroll: true }); }, 100);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
