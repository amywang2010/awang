/* ============================================================
   Sound. Everything here is synthesised, no audio files.
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});
  var state = AW.state;

  var ctx = null, master = null, musicBus = null, sfxBus = null;
  var reverb = null, delayNode = null;
  var started = false, timer = null, chordIndex = 0, melodyTimer = null;

  function ensure() {
    if (!ctx) {
      // never build an AudioContext before a real gesture; browsers hate it
      if (!AW.__gesture) return false;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = (state.volume == null ? 42 : state.volume) / 100;
      master.connect(ctx.destination);

      musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = 1;
      sfxBus.connect(master);

      // a small, cheap reverb
      reverb = ctx.createConvolver();
      var len = ctx.sampleRate * 2.6;
      var buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var ch = 0; ch < 2; ch++) {
        var data = buf.getChannelData(ch);
        for (var i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
        }
      }
      reverb.buffer = buf;
      var wet = ctx.createGain();
      wet.gain.value = .32;
      reverb.connect(wet);
      wet.connect(master);
      reverb.connect(musicBus);

      delayNode = ctx.createDelay(1.2);
      delayNode.delayTime.value = .42;
      var fb = ctx.createGain();
      fb.gain.value = .28;
      var dWet = ctx.createGain();
      dWet.gain.value = .22;
      delayNode.connect(fb);
      fb.connect(delayNode);
      delayNode.connect(dWet);
      dWet.connect(musicBus);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function tone(opts) {
    if (!ensure()) return;
    var t0 = opts.when || ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = opts.cutoff || 2000;
    filter.Q.value = .6;
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + (opts.dur || .2));
    var peak = opts.gain == null ? .2 : opts.gain;
    var attack = opts.attack == null ? .01 : opts.attack;
    var dur = opts.dur || .3;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filter);
    filter.connect(g);
    if (opts.bus === 'sfx') {
      g.connect(sfxBus);
      if (opts.verb) g.connect(reverb);
    } else {
      g.connect(musicBus);
      g.connect(delayNode);
      if (opts.verb !== false) g.connect(reverb);
    }
    osc.start(t0);
    osc.stop(t0 + dur + .05);
  }

  function noise(dur, gain, type, freq, when) {
    if (!ensure()) return;
    var t0 = when || ctx.currentTime;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = type || 'bandpass';
    f.frequency.value = freq || 1200;
    f.Q.value = .8;
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    src.start(t0);
  }

  /* ---------------------------------------------------------
     Music
     --------------------------------------------------------- */
  var CHORDS = [
    [53, 57, 60, 64],   // Fmaj7
    [48, 52, 55, 59],   // Cmaj7
    [55, 59, 62, 64],   // G6
    [57, 60, 64, 67]    // Am7
  ];
  var SCALE = [69, 72, 74, 76, 79, 81, 84, 86, 88];

  function playChord() {
    var chord = CHORDS[chordIndex % CHORDS.length];
    chordIndex++;
    var t0 = ctx.currentTime + .05;
    chord.forEach(function (n, i) {
      tone({ freq: midi(n + 12), dur: 8.5, gain: .055, attack: 2.6, type: 'sine', cutoff: 1500, when: t0 + i * .09, verb: true });
      tone({ freq: midi(n), dur: 7.5, gain: .05, attack: 2.2, type: 'triangle', cutoff: 800, when: t0 + i * .05, verb: true });
    });
    // a single high shimmer
    if (Math.random() > .4) {
      tone({ freq: midi(chord[2] + 24), dur: 5, gain: .022, attack: 1.4, type: 'sine', when: t0 + 1.2, verb: true });
    }
  }

  function playMelody() {
    if (!started) return;
    var n = SCALE[Math.floor(Math.random() * SCALE.length)];
    var t0 = ctx.currentTime + .06;
    tone({ freq: midi(n), dur: 2.4, gain: .038, attack: .05, type: 'triangle', cutoff: 2400, when: t0, verb: true });
    if (Math.random() > .68) {
      setTimeout(function () {
        if (!started) return;
        tone({ freq: midi(n + (Math.random() > .5 ? 2 : -2)), dur: 1.9, gain: .026, attack: .04, type: 'sine', cutoff: 2200, when: ctx.currentTime + .05, verb: true });
      }, 380 + Math.random() * 300);
    }
    melodyTimer = setTimeout(playMelody, 2600 + Math.random() * 3600);
  }

  function startMusic() {
    if (!ensure()) return;
    if (started) {
      if (state.musicOn) musicBus.gain.setTargetAtTime(.5, ctx.currentTime, .6);
      return;
    }
    started = true;
    if (!state.musicOn) return;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(.0001, ctx.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(.5, ctx.currentTime + 4);
    playChord();
    timer = setInterval(function () {
      if (!ctx || !state.musicOn) return;
      playChord();
    }, 9000);
    melodyTimer = setTimeout(playMelody, 4200);
  }

  function pauseMusic() {
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(.0001, ctx.currentTime, .4);
  }

  function resumeMusic() {
    if (!ctx) return;
    if (!started) { startMusic(); return; }
    musicBus.gain.setTargetAtTime(.5, ctx.currentTime, .8);
  }

  /* ---------------------------------------------------------
     Sound effects
     --------------------------------------------------------- */
  var api = {
    click: function () {
      if (!ensure() || !state.sfxOn) return;
      tone({ freq: 660, to: 880, dur: .09, gain: .06, type: 'sine', bus: 'sfx' });
    },
    softTick: function () {
      if (!ctx || !state.sfxOn) return;
      tone({ freq: 1320, dur: .04, gain: .018, type: 'sine', bus: 'sfx' });
    },
    chirp: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      tone({ freq: 1900, to: 2900, dur: .1, gain: .07, type: 'sine', bus: 'sfx', when: t0, verb: true });
      tone({ freq: 2400, to: 1750, dur: .12, gain: .06, type: 'sine', bus: 'sfx', when: t0 + .12, verb: true });
      tone({ freq: 2800, to: 2100, dur: .07, gain: .04, type: 'triangle', bus: 'sfx', when: t0 + .26 });
    },
    step: function () {
      if (!ctx || !state.sfxOn) return;
      noise(.09, .035, 'lowpass', 420);
    },
    paper: function () {
      if (!ensure() || !state.sfxOn) return;
      noise(.22, .09, 'bandpass', 2600);
      setTimeout(function () { noise(.16, .05, 'bandpass', 1800); }, 70);
    },
    whoosh: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      var len = Math.floor(ctx.sampleRate * 1.1);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(i / len, 1.4);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(320, t0);
      f.frequency.exponentialRampToValueAtTime(3800, t0 + 1);
      f.Q.value = .7;
      var g = ctx.createGain();
      g.gain.value = .16;
      src.connect(f); f.connect(g); g.connect(sfxBus);
      src.start(t0);
    },
    unlock: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      [0, 4, 7, 12, 16].forEach(function (semi, i) {
        tone({ freq: midi(72 + semi), dur: 1.1, gain: .06, type: 'sine', bus: 'sfx', when: t0 + i * .09, verb: true });
      });
    },
    pickup: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      tone({ freq: midi(76), dur: .22, gain: .06, type: 'triangle', bus: 'sfx', when: t0, verb: true });
      tone({ freq: midi(83), dur: .34, gain: .05, type: 'sine', bus: 'sfx', when: t0 + .07, verb: true });
    },
    error: function () {
      if (!ensure() || !state.sfxOn) return;
      tone({ freq: 180, to: 120, dur: .24, gain: .07, type: 'triangle', bus: 'sfx' });
    },
    purr: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      for (var i = 0; i < 5; i++) {
        tone({ freq: 96, dur: .28, gain: .05, type: 'sawtooth', bus: 'sfx', when: t0 + i * .13, cutoff: 300 });
      }
    },
    sip: function () {
      if (!ensure() || !state.sfxOn) return;
      noise(.3, .04, 'highpass', 1600);
      tone({ freq: 420, to: 300, dur: .2, gain: .03, type: 'sine', bus: 'sfx' });
    },
    softChime: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      [0, 7, 12].forEach(function (s, i) {
        tone({ freq: midi(69 + s), dur: .9, gain: .03, type: 'sine', bus: 'sfx', when: t0 + i * .12, verb: true });
      });
    },
    bloom: function () {
      if (!ensure() || !state.sfxOn) return;
      var t0 = ctx.currentTime;
      [72, 76, 79, 84, 88, 91].forEach(function (n, i) {
        tone({ freq: midi(n), dur: 1.4, gain: .045, type: 'sine', bus: 'sfx', when: t0 + i * .07, verb: true });
      });
    },
    startMusic: startMusic,
    pauseMusic: pauseMusic,
    resumeMusic: resumeMusic,
    toggleMusic: function () {
      state.musicOn = !state.musicOn;
      AW.save();
      if (state.musicOn) { resumeMusic(); } else { pauseMusic(); }
      if (state.musicOn && state.sfxOn) api.softTick();
      var btn = document.getElementById('btn-audio');
      if (btn) {
        btn.classList.toggle('is-muted', !state.musicOn);
        btn.setAttribute('aria-label', state.musicOn ? 'Mute music' : 'Unmute music');
      }
      return state.musicOn;
    },
    setVolume: function (v) {
      state.volume = v;
      if (master) master.gain.setTargetAtTime(v / 100, ctx.currentTime, .1);
      AW.save();
    },
    setMusicEnabled: function (on) {
      state.musicOn = on;
      if (on) resumeMusic(); else pauseMusic();
      AW.save();
    },
    setSfxEnabled: function (on) { state.sfxOn = on; AW.save(); },
    ensure: ensure
  };

  AW.Audio = api;

  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () {
      AW.__gesture = true;
      ensure();
    }, { once: true, passive: true });
  });
})();
