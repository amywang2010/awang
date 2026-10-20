/* ============================================================
   Boot, cursor, and the switch between field and reading view
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var state = AW.state;

  /* ---------------------------------------------------------
     Custom cursor
     --------------------------------------------------------- */
  var dot, trailCanvas, tctx, mx = -100, my = -100, cx = -100, cy = -100;
  var points = [], lastTrail = 0, cursorRaf = null, pointerFine = false;

  function initCursor() {
    pointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!pointerFine) return;
    dot = document.querySelector('.cursor-dot');
    trailCanvas = document.getElementById('cursor-trail');
    tctx = trailCanvas.getContext('2d');
    sizeTrail();
    document.body.classList.add('cursor-live');

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (document.body.classList.contains('cursor-live')) {
        var now = performance.now();
        if (now - lastTrail > 34) {
          lastTrail = now;
          points.push({ x: mx + (Math.random() - .5) * 6, y: my + (Math.random() - .5) * 6, life: 1, r: 1 + Math.random() * 1.8 });
          if (points.length > 30) points.shift();
        }
      }
    }, { passive: true });

    window.addEventListener('pointerover', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var typing = t.closest('input, textarea, [contenteditable="true"]');
      document.body.classList.toggle('cursor-text', !!typing);
      var hot = !!t.closest('button, a, [role="button"], .site, .crane, .switch, .entry, #bird, #cat, #mug, #sticky');
      document.body.classList.toggle('cursor-hot', hot);
    }, { passive: true });

    window.addEventListener('pointerdown', function () {
      document.body.classList.add('cursor-press');
    });
    window.addEventListener('pointerup', function () {
      document.body.classList.remove('cursor-press');
    });
    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-live');
    });
    document.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-live');
    });
    window.addEventListener('resize', sizeTrail);

    if (!AW.prefersReducedMotion()) {
      cursorRaf = requestAnimationFrame(cursorLoop);
    } else {
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }
  }

  function sizeTrail() {
    if (!trailCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    trailCanvas.width = window.innerWidth * dpr;
    trailCanvas.height = window.innerHeight * dpr;
    trailCanvas.style.width = window.innerWidth + 'px';
    trailCanvas.style.height = window.innerHeight + 'px';
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cursorLoop() {
    cx += (mx - cx) * .32;
    cy += (my - cy) * .32;
    if (dot) dot.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
    if (tctx) {
      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = points.length - 1; i >= 0; i--) {
        var pt = points[i];
        pt.life -= .035;
        if (pt.life <= 0) { points.splice(i, 1); continue; }
        tctx.globalAlpha = pt.life * .34;
        tctx.fillStyle = i % 5 === 0 ? '#D9A65B' : '#8E6BC4';
        tctx.beginPath();
        tctx.arc(pt.x, pt.y, pt.r * pt.life, 0, 6.3);
        tctx.fill();
      }
      tctx.globalAlpha = 1;
    }
    cursorRaf = requestAnimationFrame(cursorLoop);
  }

  /* ---------------------------------------------------------
     Modes
     --------------------------------------------------------- */
  AW.setMode = function (mode) {
    if (mode === 'static') {
      state.staticMode = true;
      AW.save();
      if (AW.Panels) AW.Panels.close();
      if (AW.Settings) AW.Settings.close();
      AW.Static.render();
      document.getElementById('main-static').hidden = false;
      document.getElementById('desk').hidden = true;
      document.getElementById('world').hidden = true;
      if (AW.World && AW.World.hide) AW.World.hide();
      document.body.classList.add('is-static');
      document.body.classList.remove('in-world', 'cursor-live');
      window.scrollTo(0, 0);
      if (AW.Audio) AW.Audio.pauseMusic();
      if (AW.Settings) AW.Settings.sync();
    } else {
      state.staticMode = false;
      AW.save();
      document.getElementById('main-static').hidden = true;
      document.body.classList.remove('is-static');
      if (AW.World && AW.World.hasEntered()) {
        AW.World.show();
        document.getElementById('desk').hidden = true;
        if (pointerFine) document.body.classList.add('cursor-live');
        if (state.musicOn && AW.Audio) AW.Audio.resumeMusic();
      } else {
        document.getElementById('desk').hidden = false;
        document.body.classList.remove('in-world');
        if (pointerFine) document.body.classList.add('cursor-live');
      }
      window.scrollTo(0, 0);
      if (AW.Settings) AW.Settings.sync();
      AW.toast('Back in the field.');
    }
  };

  /* ---------------------------------------------------------
     HUD
     --------------------------------------------------------- */
  function syncAudioButton() {
    var btn = document.getElementById('btn-audio');
    if (!btn) return;
    btn.classList.toggle('is-muted', !state.musicOn);
    btn.setAttribute('aria-label', state.musicOn ? 'Mute music' : 'Unmute music');
  }

  function wireHud() {
    // the skip link is the keyboard shortcut through the intro
    var skip = document.querySelector('.skip-link');
    if (skip) skip.addEventListener('click', function (e) {
      var w = document.getElementById('world');
      if (w && !w.hidden) {
        var j = document.getElementById('btn-journal');
        if (j) { e.preventDefault(); j.focus(); }
        return;
      }
      var go = document.getElementById('btn-visitors');
      if (go && !document.getElementById('desk').classList.contains('leaving')) {
        e.preventDefault();
        go.click();
      }
    });

    var audioBtn = document.getElementById('btn-audio');
    if (audioBtn) audioBtn.addEventListener('click', function () {
      if (AW.Audio) AW.Audio.toggleMusic();
      syncAudioButton();
    });

    var journalBtn = document.getElementById('btn-journal');
    if (journalBtn) journalBtn.addEventListener('click', function () {
      if (AW.Panels) AW.Panels.open('journal');
    });

    var nameBtn = document.getElementById('hud-name');
    if (nameBtn) nameBtn.addEventListener('click', function () {
      if (AW.Panels) AW.Panels.open('about');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (AW.Settings) AW.Settings.close();
      }
    });
  }

  /* ---------------------------------------------------------
     Start
     --------------------------------------------------------- */
  function start() {
    document.body.classList.remove('is-loading');
    initCursor();
    wireHud();
    syncAudioButton();
    if (AW.Panels) AW.Panels.updateCranes();
    if (state.staticMode) {
      AW.setMode('static');
    } else {
      var m = /[?&]view=static/.test(location.search);
      if (m) AW.setMode('static');
    }
    if (state.night && AW.World && AW.World.isNight) { /* applied on enter */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
