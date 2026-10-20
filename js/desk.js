/* ============================================================
   Desk: boot, password gate, bird, and the way in
   ============================================================ */
(function () {
  'use strict';

  var AW = (window.AW = window.AW || {});
  var state = AW.state;

  var desk = document.getElementById('desk');
  var stage = document.getElementById('desk-stage');
  var boot = document.getElementById('boot');
  var welcome = document.getElementById('welcome');
  var screenOff = document.getElementById('screen-off');
  var screenFoot = document.getElementById('screen-foot');
  var gate = document.getElementById('password-gate');
  var gateInput = document.getElementById('password-input');
  var gateMsg = document.getElementById('gate-msg');
  var secret = document.getElementById('screen-secret');
  var warp = document.getElementById('warp');
  var warpWord = document.getElementById('warp-word');
  var bird = document.getElementById('bird');

  var booted = false;
  var leaving = false;

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function runBoot() {
    var lines = boot.querySelectorAll('.boot-line');
    var i = 0;
    var step = function () {
      if (i > 0) lines[i - 1].classList.add('on');
      if (i >= lines.length) {
        setTimeout(function () {
          boot.classList.add('done');
          screenOff.classList.add('off');
          setTimeout(function () {
            welcome.classList.add('on');
            welcome.classList.add('is-shown');
            screenFoot.innerHTML = 'or press <kbd>enter</kbd>';
            if (AW.Audio) AW.Audio.softChime();
          }, 260);
        }, 420);
        return;
      }
      i++;
      setTimeout(step, 230 + Math.random() * 90);
    };
    setTimeout(step, 520);
    booted = true;
  }

  function skipBoot() {
    if (leaving) return;
    boot.classList.add('done');
    screenOff.classList.add('off');
    welcome.classList.add('on');
    screenFoot.innerHTML = 'or press <kbd>enter</kbd>';
    booted = true;
  }

  /* ---------------------------------------------------------
     Password
     --------------------------------------------------------- */
  function openGate() {
    if (AW.Audio) AW.Audio.click();
    welcome.classList.add('hidden');
    welcome.style.display = 'none';
    gate.hidden = false;
    setTimeout(function () { gateInput.focus(); }, 60);
    if (state.secretUnlocked) {
      gateMsg.textContent = 'Already unlocked. The gate behind the cottage is open.';
      gateMsg.className = 'gate-msg good';
    }
  }

  function closeGate() {
    gate.hidden = true;
    secret.hidden = true;
    welcome.style.display = '';
    welcome.classList.add('on');
    screenFoot.innerHTML = 'or press <kbd>enter</kbd>';
  }

  function submitGate(e) {
    if (e) e.preventDefault();
    var value = (gateInput.value || '').trim().toLowerCase();
    if (!value) return;
    if (value === 'orchid') {
      state.secretUnlocked = true;
      AW.save();
      gate.hidden = true;
      secret.hidden = false;
      if (AW.Audio) AW.Audio.unlock();
      if (AW.Eggs) AW.Eggs.bloom();
      if (AW.World && AW.World.unlockGate) AW.World.unlockGate();
    } else if (value === 'bird' || value === 'manolis' || value === 'mantis') {
      gateMsg.textContent = 'Not quite. The hint is on the sticky note.';
      gateMsg.className = 'gate-msg';
      shakeScreen();
    } else {
      var tries = [
        'Not that one. Try the plant by the window.',
        'Not quite. One word, a flower.',
        'Still not it. The note on the desk says it.'
      ];
      state.tries = (state.tries || 0) + 1;
      gateMsg.textContent = tries[(state.tries - 1) % tries.length];
      gateMsg.className = 'gate-msg bad';
      shakeScreen();
      if (AW.Audio) AW.Audio.error();
      if (AW.Desk && AW.Desk.chirp) AW.Desk.chirp();
    }
  }

  function shakeScreen() {
    var frame = document.getElementById('screen-frame');
    frame.classList.remove('shake');
    void frame.offsetWidth;
    frame.classList.add('shake');
  }

  /* ---------------------------------------------------------
     Bird
     --------------------------------------------------------- */
  var birdLines = [
    'The orchid by the window is worth a look.',
    'You are early. I usually wake up around noon.',
    'The password is written on the desk.',
    'I have been on this monitor since Tuesday.',
    'There are seven paper cranes in the field.'
  ];
  var birdIdx = 0;

  var birdSeq = 0;
  var birdTimer = null;

  function birdClear() {
    bird.classList.remove('look-l', 'look-r', 'look-down', 'preen', 'hop', 'flick', 'chirp', 'is-looking', 'is-preening');
  }

  function birdDo(classes, ms) {
    birdClear();
    void bird.offsetWidth;
    classes.forEach(function (c) { bird.classList.add(c); });
    var seq = ++birdSeq;
    if (ms) {
      setTimeout(function () {
        if (seq === birdSeq) birdClear();
      }, ms);
    }
  }

  function chirp() {
    if (AW.Audio) AW.Audio.chirp();
    birdDo(['chirp'], 1700);
  }

  function birdLook() {
    var r = Math.random();
    var cls = r < 0.36 ? 'look-l' : r < 0.68 ? 'look-r' : 'look-down';
    birdDo([cls, 'is-looking'], 2200 + Math.random() * 900);
  }

  function birdPreen() {
    birdDo(['preen', 'is-preening'], 2800);
    setTimeout(function () { if (AW.Audio) AW.Audio.paper(); }, 420);
    setTimeout(function () { if (AW.Audio) AW.Audio.paper(); }, 1200);
  }

  function birdHop() {
    birdDo(['hop'], 960);
    if (AW.Audio) AW.Audio.click();
  }

  function birdFlick() {
    birdDo(['flick'], 860);
  }

  function birdTalk() {
    chirp();
    AW.say(birdLines[birdIdx % birdLines.length], { x: 44, y: 34 });
    birdIdx++;
  }

  /* she keeps her own schedule: look, chirp, preen, hop, flick */
  function birdLoop() {
    birdTimer = setTimeout(function () {
      if (!desk.hidden && !leaving && !document.hidden && !AW.prefersReducedMotion()) {
        var r = Math.random();
        if (r < 0.28) birdLook();
        else if (r < 0.54) chirp();
        else if (r < 0.72) birdPreen();
        else if (r < 0.87) birdHop();
        else birdFlick();
      }
      birdLoop();
    }, 2300 + Math.random() * 3300);
  }

  /* ---------------------------------------------------------
     The way in
     --------------------------------------------------------- */
  function enter() {
    if (leaving) return;
    leaving = true;
    if (AW.Audio) {
      AW.Audio.click();
      AW.Audio.startMusic();
      AW.Audio.whoosh();
    }

    var reduced = AW.prefersReducedMotion();
    screenFoot.style.opacity = '0';
    document.getElementById('welcome').style.transform = 'scale(1.06)';
    document.getElementById('welcome').style.transition = 'transform 1.1s ease, opacity .6s ease';
    document.getElementById('welcome').style.opacity = '0';

    stage.style.transformOrigin = '50% 42%';

    if (!reduced) {
      setTimeout(function () { stage.classList.add('zooming'); }, 180);
      setTimeout(function () { openWarp(); }, 1050);
      setTimeout(function () { warp.classList.add('flash'); }, 1560);
      setTimeout(function () {
        desk.classList.add('leaving');
        document.body.classList.add('in-world');
        if (AW.World) AW.World.enter();
      }, 1750);
      setTimeout(function () { closeWarp(); }, 2350);
    } else {
      setTimeout(function () {
        desk.classList.add('leaving');
        document.body.classList.add('in-world');
        openWarp();
        if (AW.World) AW.World.enter();
        setTimeout(closeWarp, 500);
      }, 250);
    }
  }

  /* warp canvas: radial streaks */
  var raf = null;
  function openWarp() {
    warp.hidden = false;
    requestAnimationFrame(function () { warp.classList.add('on'); });
    warpWord.textContent = 'the field';
    setTimeout(function () { warpWord.classList.add('on'); }, 240);
    startStreaks();
  }
  function closeWarp() {
    warp.classList.remove('on');
    warpWord.classList.remove('on');
    setTimeout(function () {
      warp.hidden = true;
      warp.classList.remove('flash');
      if (raf) cancelAnimationFrame(raf);
      desk.hidden = true;
    }, 700);
  }

  function startStreaks() {
    var canvas = document.getElementById('warp-canvas');
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, cx, cy;
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h * 0.42;
    }
    resize();
    window.addEventListener('resize', resize);

    var streaks = [];
    for (var i = 0; i < 150; i++) {
      streaks.push({
        a: Math.random() * Math.PI * 2,
        r: Math.random() * 60,
        sp: 2.4 + Math.random() * 9,
        len: 30 + Math.random() * 150,
        w: 0.7 + Math.random() * 2.2,
        hue: Math.random() > 0.55 ? '238, 224, 255' : '190, 160, 235'
      });
    }
    var start = performance.now();
    function draw(now) {
      var t = (now - start) / 1000;
      ctx.fillStyle = 'rgba(23, 17, 31, 0.34)';
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < streaks.length; i++) {
        var s = streaks[i];
        s.r += s.sp * (1 + s.r / 300);
        if (s.r > Math.hypot(w, h)) { s.r = Math.random() * 40; s.a = Math.random() * Math.PI * 2; }
        var x = cx + Math.cos(s.a) * s.r;
        var y = cy + Math.sin(s.a) * s.r;
        var x2 = cx + Math.cos(s.a) * (s.r - s.len);
        var y2 = cy + Math.sin(s.a) * (s.r - s.len);
        var g = ctx.createLinearGradient(x2, y2, x, y);
        g.addColorStop(0, 'rgba(' + s.hue + ', 0)');
        g.addColorStop(1, 'rgba(' + s.hue + ', ' + Math.min(1, s.r / 350) * 0.85 + ')');
        ctx.strokeStyle = g;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255, 246, 228, ' + Math.min(0.5, t / 2.4) + ')';
      ctx.beginPath();
      ctx.arc(cx, cy, 30 + t * 220, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
  }

  /* ---------------------------------------------------------
     Wiring
     --------------------------------------------------------- */
  function wire() {
    document.getElementById('skip-intro').addEventListener('click', function () {
      if (!booted) skipBoot();
      else if (!leaving) enter();
    });

    document.getElementById('btn-visitors').addEventListener('click', enter);
    document.getElementById('btn-password').addEventListener('click', openGate);
    document.getElementById('gate-cancel').addEventListener('click', closeGate);
    document.getElementById('secret-close').addEventListener('click', closeGate);
    gate.addEventListener('submit', submitGate);

    bird.addEventListener('click', birdTalk);
    bird.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); birdTalk(); }
    });

    document.getElementById('cat').addEventListener('click', function () {
      if (AW.Audio) AW.Audio.purr();
      AW.say('purrrrr.', { x: 74, y: 88 });
    });

    document.getElementById('mug').addEventListener('click', function () {
      if (AW.Audio) AW.Audio.sip();
      AW.say('Still warm.', { x: 35, y: 60 });
    });

    var orchid = document.getElementById('orchid');
    if (orchid) {
      orchid.addEventListener('click', function () {
        if (AW.Audio) AW.Audio.paper();
        AW.say('An orchid. It leans toward the window.', { x: 31, y: 58 });
      });
      orchid.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); orchid.dispatchEvent(new MouseEvent('click')); }
      });
    }

    document.getElementById('sticky').addEventListener('click', function () {
      if (AW.Audio) AW.Audio.paper();
      AW.say('A note to self: water the orchid.', { x: 58, y: 45 });
    });

    document.getElementById('screen-frame').addEventListener('click', function (e) {
      if (e.target.closest('button, input, form')) return;
      if (booted && !leaving) enter();
    });

    document.addEventListener('keydown', function (e) {
      if (desk.hidden) return;
      if (e.key === 'Enter' && !gate.hidden) return;
      if (e.key === 'Enter' && booted && !leaving) { e.preventDefault(); enter(); }
      if (e.key === 'Escape' && (!gate.hidden || !secret.hidden)) closeGate();
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  AW.Desk = {
    enter: enter,
    chirp: chirp,
    returnToDesk: function () {
      leaving = false;
      desk.hidden = false;
      desk.classList.remove('leaving');
      stage.classList.remove('zooming');
      warp.hidden = true;
      warp.classList.remove('on', 'flash');
      document.body.classList.remove('in-world');
      welcome.classList.add('on');
      welcome.style.display = '';
      welcome.style.opacity = '1';
      welcome.style.transform = 'none';
      screenOff.classList.add('off');
      gate.hidden = true;
      secret.hidden = true;
      if (AW.World) AW.World.hide();
      document.getElementById('world').hidden = true;
      state.staticMode = false;
      AW.save();
      if (AW.Audio) AW.Audio.pauseMusic();
    }
  };

  function init() {
    wire();
    var seen = state.seenIntro;
    if (seen) {
      screenOff.classList.add('off');
      welcome.classList.add('on');
      booted = true;
    } else {
      runBoot();
      state.seenIntro = true;
      AW.save();
    }
    birdLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
