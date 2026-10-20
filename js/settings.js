/* ============================================================
   Settings
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var state = AW.state;
  var panel, open = false;

  function setSwitch(el, on) {
    el.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  function sync() {
    setSwitch(document.getElementById('set-music'), state.musicOn);
    setSwitch(document.getElementById('set-sfx'), state.sfxOn);
    setSwitch(document.getElementById('set-static'), !!state.staticMode);
    setSwitch(document.getElementById('set-motion'), !!state.reduceMotion);
    var vol = document.getElementById('set-volume');
    if (vol && document.activeElement !== vol) vol.value = state.volume;
    var btn = document.getElementById('btn-audio');
    if (btn) {
      btn.classList.toggle('is-muted', !state.musicOn);
      btn.setAttribute('aria-label', state.musicOn ? 'Mute music' : 'Unmute music');
    }
  }

  function show() {
    if (panel.hidden) {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('show'); });
    }
    open = true;
    state.settingsOpen = true;
    sync();
    var first = panel.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }

  function close() {
    if (!panel || panel.hidden) return;
    panel.classList.remove('show');
    open = false;
    state.settingsOpen = false;
    setTimeout(function () { panel.hidden = true; }, 260);
  }

  function wire() {
    panel = document.getElementById('settings');
    document.getElementById('settings-close').addEventListener('click', close);
    document.getElementById('btn-settings').addEventListener('click', function (e) {
      e.stopPropagation();
      if (open) close(); else show();
    });

    document.getElementById('set-music').addEventListener('click', function () {
      state.musicOn = !state.musicOn;
      if (AW.Audio) {
        if (state.musicOn) AW.Audio.resumeMusic(); else AW.Audio.pauseMusic();
      }
      AW.save();
      sync();
    });

    document.getElementById('set-sfx').addEventListener('click', function () {
      state.sfxOn = !state.sfxOn;
      AW.save();
      sync();
      if (state.sfxOn && AW.Audio) AW.Audio.click();
    });

    document.getElementById('set-volume').addEventListener('input', function (e) {
      if (AW.Audio) AW.Audio.setVolume(parseInt(e.target.value, 10));
    });

    document.getElementById('set-static').addEventListener('click', function () {
      AW.setMode(state.staticMode ? 'field' : 'static');
      sync();
    });

    document.getElementById('set-motion').addEventListener('click', function () {
      state.reduceMotion = !state.reduceMotion;
      document.documentElement.classList.toggle('calm', state.reduceMotion);
      AW.save();
      sync();
      AW.toast(state.reduceMotion ? 'Motion reduced.' : 'Motion restored.');
    });

    document.getElementById('set-desk').addEventListener('click', function () {
      close();
      if (AW.Desk && AW.Desk.returnToDesk) AW.Desk.returnToDesk();
    });

    document.getElementById('set-reset').addEventListener('click', function () {
      AW.resetField();
      AW.toast('Starting over.');
      setTimeout(function () { location.reload(); }, 500);
    });

    document.addEventListener('pointerdown', function (e) {
      if (!open) return;
      if (panel.contains(e.target) || e.target.closest('#btn-settings')) return;
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) close();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wire(); sync(); });
  else { wire(); sync(); }

  AW.Settings = { toggle: function () { if (open) close(); else show(); }, open: show, close: close, sync: sync };
})();
