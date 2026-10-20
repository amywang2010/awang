/* ============================================================
   The small hidden things
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var state = AW.state;

  /* petal bloom ------------------------------------------------- */
  function bloom() {
    var layer = document.createElement('div');
    layer.className = 'petal-burst';
    layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--d', (Math.random() * .8) + 's');
      p.style.setProperty('--dur', (2.6 + Math.random() * 2.4) + 's');
      p.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
      p.style.setProperty('--r', (Math.random() * 360) + 'deg');
      p.style.background = ['#F0B9C4', '#F7E3A1', '#C8B6E6', '#FBF5E9'][i % 4];
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 5600);
    if (AW.Audio) AW.Audio.bloom();
  }
  AW.Eggs = { bloom: bloom };

  /* day / night ------------------------------------------------- */
  function wireSun() {
    var sun = document.getElementById('sun');
    if (!sun) return;
    sun.addEventListener('click', function () {
      if (!AW.World || !AW.World.hasEntered()) return;
      var night = !AW.World.isNight();
      AW.World.setNight(night);
      if (AW.Audio) AW.Audio.softChime();
      AW.toast(night ? 'The field at night.' : 'Morning.');
    });
    sun.setAttribute('role', 'button');
    sun.setAttribute('tabindex', '0');
    sun.setAttribute('aria-label', 'Change the time of day');
    sun.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sun.click(); }
    });
  }

  /* konami ------------------------------------------------------ */
  var seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    if (AW.state.panelOpen || AW.state.settingsOpen) return;
    var k = e.key.toLowerCase();
    if (k === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        pos = 0;
        state.konami = true;
        AW.save();
        bloom();
        AW.toast('Marmalade flew a loop around the field.');
      }
    } else {
      pos = k === seq[0] ? 1 : 0;
    }
  });

  /* typing the bird's name -------------------------------------- */
  var typed = '';
  document.addEventListener('keydown', function (e) {
    if (AW.state.panelOpen || AW.state.settingsOpen) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.indexOf('marmalade') !== -1) {
      typed = '';
      if (AW.World && AW.World.hasEntered() && !AW.state.panelOpen) {
        if (AW.Audio) AW.Audio.chirp();
        AW.toast('Marmalade answers from somewhere above you.');
        if (AW.Eggs.bloom) bloom();
      }
    }
  });

  /* sun is wired once the DOM is ready -------------------------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireSun);
  else wireSun();

  /* for the people who open devtools ---------------------------- */
  try {
    console.log('%cAmy Wang', 'font-family:Georgia,serif;font-size:26px;color:#6B4B8A;');
    console.log('%cThe bird is called Marmalade. Type her name in the field.\nThere are seven paper cranes. Press J to see your journal.', 'font-family:monospace;font-size:12px;color:#4C405C;');
  } catch (e) { /* ignore */ }
})();
