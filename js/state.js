/* ============================================================
   State, saved quietly in the browser
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var KEY = 'awang.field.v1';

  var defaults = {
    seenIntro: false,
    seenAbout: false,
    secretUnlocked: false,
    cranes: [],
    night: false,
    musicOn: true,
    sfxOn: true,
    volume: 42,
    staticMode: false,
    reduceMotion: false,
    konami: false
  };

  var saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch (e) { saved = {}; }

  var state = {};
  Object.keys(defaults).forEach(function (k) {
    state[k] = saved[k] === undefined ? defaults[k] : saved[k];
  });

  AW.state = state;
  AW.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  };
  AW.resetField = function () {
    state.secretUnlocked = false;
    state.cranes = [];
    state.night = false;
    state.seenAbout = false;
    AW.save();
  };

  AW.prefersReducedMotion = function () {
    return !!state.reduceMotion || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  var toastEl, toastTimer;
  AW.toast = function (msg, ms) {
    toastEl = toastEl || document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  };

  AW.say = function (text, pos) {
    var stage = document.getElementById('desk-stage');
    if (!stage || document.getElementById('desk').hidden || window.innerWidth < 700) {
      AW.toast(text);
      return;
    }
    var old = stage.querySelector('.bubble');
    if (old) old.remove();
    var b = document.createElement('div');
    b.className = 'bubble';
    b.textContent = text;
    b.style.left = (pos && pos.x ? pos.x : 45) + '%';
    b.style.top = (pos && pos.y ? pos.y : 34) + '%';
    stage.appendChild(b);
    requestAnimationFrame(function () { b.classList.add('on'); });
    setTimeout(function () {
      b.classList.remove('on');
      setTimeout(function () { b.remove(); }, 400);
    }, 3400);
  };

  // if the reading view was chosen last time, don't flash the room
  if (state.staticMode) {
    var d = document.getElementById('desk');
    if (d) d.hidden = true;
  }
  if (state.reduceMotion) document.documentElement.classList.add('calm');
})();
