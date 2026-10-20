/* ============================================================
   The little person. Hand-built SVG, animated by hand.
   ============================================================ */
(function () {
  'use strict';
  var AW = (window.AW = window.AW || {});

  var MARKUP = [
    '<g id="ch-backhair">',
    '<path d="M40 12C22 12 14 26 14 44c0 18-2 30-6 42 10 6 18 2 22-6 2 8 6 12 10 12s8-4 10-12c4 8 12 12 22 6-4-12-6-24-6-42 0-18-8-32-26-32Z" fill="#2C2335"/>',
    '</g>',
    '<g id="ch-legs">',
    '<g id="ch-leg-l"><rect x="27" y="96" width="12" height="26" rx="5.5" fill="#4B3F60"/><path d="M26 118h15a4 4 0 0 1 4 4v2a3 3 0 0 1-3 3h-16a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z" fill="#F3E9D6"/></g>',
    '<g id="ch-leg-r"><rect x="41" y="96" width="12" height="26" rx="5.5" fill="#413654"/><path d="M40 118h15a4 4 0 0 1 4 4v2a3 3 0 0 1-3 3h-16a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z" fill="#EFE3CE"/></g>',
    '</g>',
    '<g id="ch-torso">',
    '<path d="M40 68c-12 0-19 5-20 14l-3 22c0 6 4 10 10 10h26c6 0 10-4 10-10l-3-22c-1-9-8-14-20-14Z" fill="#B7A0E2"/>',
    '<path d="M27 74c-3 8-4 22-4 34 0 4 3 6 7 6h6V72c-4 0-7 1-9 2Z" fill="#A78BD6"/>',
    '<path d="M40 68c-5 0-9 1-12 3l4 6 8-3 8 3 4-6c-3-2-7-3-12-3Z" fill="#F3E9D6"/>',
    '<path d="M40 80v34" stroke="#9A7FC9" stroke-width="1.4" opacity=".5"/>',
    '<g id="ch-arm-l"><rect x="15" y="74" width="10" height="28" rx="5" fill="#B7A0E2"/><circle cx="20" cy="102" r="5.6" fill="#F0C9AE"/></g>',
    '<g id="ch-arm-r"><rect x="55" y="74" width="10" height="28" rx="5" fill="#AA8DD9"/><circle cx="60" cy="102" r="5.6" fill="#F0C9AE"/></g>',
    '<path d="M24 82l32 20" stroke="#8E6C57" stroke-width="3.4" opacity=".9"/>',
    '<path d="M50 99h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H50a3 3 0 0 1-3-3V102a3 3 0 0 1 3-3Z" fill="#D9A65B"/>',
    '<path d="M50 99h10a3 3 0 0 1 3 3H47a3 3 0 0 1 3-3Z" fill="#E5B872"/>',
    '</g>',
    '<g id="ch-head">',
    '<path d="M40 22c-11 0-18 8-18 20 0 12 8 22 18 22s18-10 18-22c0-12-7-20-18-20Z" fill="#F3CDB4"/>',
    '<path d="M40 22c-8 0-14 4-17 11 3 3 8 5 15 5 8 0 14-2 18-6-3-6-9-10-16-10Z" fill="#2C2335"/>',
    '<path d="M22 34c-2 8 0 14 4 16 1-8 3-13 6-16Z" fill="#2C2335"/>',
    '<path d="M58 34c2 8 0 14-4 16-1-8-3-13-6-16Z" fill="#2C2335"/>',
    '<g id="ch-eyes">',
    '<ellipse cx="33" cy="46" rx="2.5" ry="3" fill="#2C2335"/>',
    '<ellipse cx="47" cy="46" rx="2.5" ry="3" fill="#2C2335"/>',
    '<circle cx="33.8" cy="45" r=".9" fill="#FFF8EC"/>',
    '<circle cx="47.8" cy="45" r=".9" fill="#FFF8EC"/>',
    '</g>',
    '<ellipse cx="28.5" cy="52" rx="4" ry="2.4" fill="#E8A39A" opacity=".45"/>',
    '<ellipse cx="51.5" cy="52" rx="4" ry="2.4" fill="#E8A39A" opacity=".45"/>',
    '<path id="ch-mouth" d="M37 55c1.6 1.6 4.4 1.6 6 0" fill="none" stroke="#B5716B" stroke-width="1.8" stroke-linecap="round"/>',
    '<g id="ch-flower" transform="translate(56 30)">',
    '<circle r="4.6" fill="#F7E3A1"/><circle cx="-4.4" cy="-2" r="3" fill="#F0B9C4"/><circle cx="4.4" cy="-2" r="3" fill="#F0B9C4"/><circle cy="-5" r="3" fill="#F0B9C4"/><circle cx="-2.6" cy="4" r="3" fill="#F0B9C4"/><circle cx="2.6" cy="4" r="3" fill="#F0B9C4"/>',
    '</g>',
    '</g>'
  ].join('');

  var el = {}, svg, blinkTimer = 0, blinking = 0, phase = 0, idleT = 0;

  function init(svgEl) {
    svg = svgEl;
    svg.innerHTML = MARKUP;
    el.torso = svg.querySelector('#ch-torso');
    el.head = svg.querySelector('#ch-head');
    el.legL = svg.querySelector('#ch-leg-l');
    el.legR = svg.querySelector('#ch-leg-r');
    el.armL = svg.querySelector('#ch-arm-l');
    el.armR = svg.querySelector('#ch-arm-r');
    el.eyes = svg.querySelector('#ch-eyes');
    el.backhair = svg.querySelector('#ch-backhair');
    el.blinkTimer = 2 + Math.random() * 3;
  }

  function rot(node, angle, cx, cy) {
    if (!node) return;
    node.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ' ' + cx + ' ' + cy + ')');
  }
  function move(node, x, y) {
    if (!node) return;
    node.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
  }
  function rotMove(node, angle, cx, cy, ty) {
    if (!node) return;
    node.setAttribute('transform', 'translate(0 ' + ty.toFixed(2) + ') rotate(' + angle.toFixed(2) + ' ' + cx + ' ' + cy + ')');
  }

  var char = {
    update: function (dt, opts) {
      var moving = opts.moving;
      var speed = opts.speed || 0;
      idleT += dt;

      if (moving) {
        phase += dt * (5.4 + speed * 0.012);
        var swing = Math.sin(phase) * 26;
        var swingB = Math.sin(phase + Math.PI) * 26;
        rot(el.legL, swing, 33, 98);
        rot(el.legR, swingB, 47, 98);
        var bob = Math.abs(Math.sin(phase)) * -3;
        rotMove(el.armL, swingB * 0.75, 20, 76, bob);
        rotMove(el.armR, swing * 0.75, 60, 76, bob);
        move(el.torso, 0, bob);
        move(el.head, 0, bob + Math.sin(phase * 2) * 0.7);
        move(el.backhair, 0, bob);
        rot(el.backhair, Math.sin(phase) * 3.2, 40, 16);
      } else {
        var breathe = Math.sin(idleT * 1.9) * 0.9;
        rot(el.legL, 0, 33, 98);
        rot(el.legR, 0, 47, 98);
        rotMove(el.armL, 3 + breathe * 0.8, 20, 76, breathe * 0.5);
        rotMove(el.armR, -3 - breathe * 0.8, 60, 76, breathe * 0.5);
        move(el.torso, 0, breathe * 0.5);
        move(el.head, 0, breathe * 0.7);
        move(el.backhair, 0, breathe * 0.5);
        rot(el.backhair, Math.sin(idleT * 0.8) * 1.2, 40, 16);
      }

      el.blinkTimer -= dt;
      if (el.blinkTimer <= 0) {
        el.blinkTimer = 2.4 + Math.random() * 4.2;
        blinking = 0.14;
      }
      if (blinking > 0) {
        blinking -= dt;
        el.eyes.style.transform = 'scaleY(.08)';
        el.eyes.style.transformBox = 'fill-box';
        el.eyes.style.transformOrigin = 'center';
      } else if (el.eyes) {
        el.eyes.style.transform = '';
      }
    }
  };

  AW.Character = {
    init: init,
    update: function (dt, opts) { if (el.torso) char.update(dt, opts); }
  };
})();
