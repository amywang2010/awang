/* ============================================================
   The field: ground, landmarks, movement, camera
   ============================================================ */
(function () {
  'use strict';

  var AW = (window.AW = window.AW || {});
  var state = AW.state;
  var W = 4200, H = 3000;

  var world, camera, groundWrap, decor, sitesWrap, playerEl, nearbyEl;
  var mini = null, miniCtx = null, miniBase = null, miniT = 0, pathLines = null;
  var groundCanvas, skyCanvas;
  var cam = { x: 0, y: 0 };
  var p = { x: 2100, y: 1720, vx: 0, vy: 0, facing: 1, moving: false, speed: 0 };
  var target = null;
  var pendingSite = null;
  var pendingCrane = null;
  var keys = Object.create(null);
  var stations = [];
  var obstacles = [];
  var cranes = [];
  var butterflies = [];
  var built = false;
  var entered = false;
  var paused = false;
  var last = 0;
  var t = 0;
  var footTimer = 0;
  var vw = 0, vh = 0;

  /* ---------------------------------------------------------
     Deterministic-ish randomness
     --------------------------------------------------------- */
  var seed = 20261020;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
  function rr(a, b) { return a + rnd() * (b - a); }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

  /* ---------------------------------------------------------
     Art
     --------------------------------------------------------- */
  var INK = 'rgba(58,44,34,.45)';

  function treeArt(kind, s) {
    s = s || 1;
    if (kind === 'oak') {
      return '<svg viewBox="0 0 280 340" width="' + Math.round(280 * s) + '" height="' + Math.round(340 * s) + '" aria-hidden="true">' +
        '<ellipse cx="140" cy="330" rx="88" ry="14" fill="#4F6140" opacity=".2"/>' +
        '<path d="M122 330c3-40 6-72 4-104c8 16 15 34 18 52c5-24 13-44 24-60c-3 38-2 76 0 112Z" fill="#7E5738"/>' +
        '<path d="M132 328c2-38 4-70 3-100c4 18 6 38 7 56" stroke="#6B4529" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/>' +
        '<g class="tree-sway">' +
        '<path d="M140 22c34 0 58 18 62 42c26 6 42 28 38 52c18 16 14 42-6 52c2 26-20 44-46 40c-10 22-38 30-60 16c-20 16-48 8-56-14c-24 2-40-18-34-40c-20-14-18-40 2-52c-4-26 16-46 42-46c6-30 30-50 58-50Z" fill="#4F7449"/>' +
        '<path d="M62 168c-6-18 4-36 22-40c4-22 26-34 44-26c10-18 34-22 48-8c16-8 36 0 40 16c16 4 24 20 18 34c-10 20-34 26-56 20c-14 14-38 16-52 4c-18 12-42 6-50-10c-6 4-10 6-14 10Z" fill="#5E8556"/>' +
        '<path d="M96 116c6-18 26-28 44-22c8-14 28-16 38-4c14-2 26 8 26 20c-8 16-28 22-46 16c-12 10-32 10-44 0c-8 2-14 0-18-10Z" fill="#7CA36E"/>' +
        '<path d="M84 80c14-14 36-18 52-8c14-10 34-6 42 8c-12 12-32 16-48 10c-14 10-34 8-46-10Z" fill="#8FB57E" opacity=".7"/>' +
        '<g fill="#40603E" opacity=".35">' +
        '<ellipse cx="96" cy="210" rx="34" ry="16"/><ellipse cx="196" cy="216" rx="30" ry="14"/><ellipse cx="150" cy="232" rx="26" ry="10"/>' +
        '</g>' +
        '<g fill="#A6C793" opacity=".5">' +
        '<ellipse cx="108" cy="104" rx="16" ry="9"/><ellipse cx="176" cy="126" rx="12" ry="7"/><ellipse cx="146" cy="86" rx="9" ry="6"/>' +
        '</g>' +
        '</g></svg>';
    }
    if (kind === 'birch') {
      return '<svg viewBox="0 0 220 360" width="' + Math.round(220 * s) + '" height="' + Math.round(360 * s) + '" aria-hidden="true">' +
        '<ellipse cx="110" cy="350" rx="58" ry="11" fill="#4F6140" opacity=".18"/>' +
        '<path d="M101 352c2-70 3-140 1-210h16c-2 70-1 140 1 210Z" fill="#EBE4D3"/>' +
        '<path d="M112 352c1-70 2-140 0-210h5c-1 70 0 140 2 210Z" fill="#C9BFA9" opacity=".7"/>' +
        '<g stroke="#7E7264" stroke-width="3" stroke-linecap="round" opacity=".5">' +
        '<path d="M104 300h12M103 268h13M105 220h11M104 180h12M106 152h10M103 116h12"/></g>' +
        '<path d="M108 210c-14-10-22-24-24-38M114 176c12-8 20-20 22-32" stroke="#8C8071" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>' +
        '<g class="tree-sway">' +
        '<path d="M46 128c-8-26 8-48 30-52c2-24 24-40 44-34c12-18 38-18 48 0c22-2 38 14 36 34c16 8 18 30 4 40c6 20-10 36-30 34c-8 18-32 24-48 12c-14 12-36 10-44-6c-20 4-36-8-40-28Z" fill="#6F9A66"/>' +
        '<path d="M64 96c6-18 26-26 42-18c8-12 28-14 38-2c14 0 24 12 22 24c-10 14-30 18-46 10c-12 8-30 6-40-6c-8 2-14-2-16-8Z" fill="#86AE76"/>' +
        '<path d="M88 68c12-10 30-10 40 0c10-4 22 2 24 12c-10 8-26 8-36 2c-10 6-24 2-28-14Z" fill="#A2C795" opacity=".9"/>' +
        '<g fill="#5C8455" opacity=".45"><ellipse cx="72" cy="140" rx="24" ry="9"/><ellipse cx="146" cy="146" rx="22" ry="8"/></g>' +
        '</g></svg>';
    }
    return '<svg viewBox="0 0 200 340" width="' + Math.round(200 * s) + '" height="' + Math.round(340 * s) + '" aria-hidden="true">' +
      '<ellipse cx="100" cy="330" rx="54" ry="11" fill="#40532F" opacity=".22"/>' +
      '<rect x="94" y="244" width="12" height="86" fill="#6E4B31"/>' +
      '<g class="tree-sway">' +
      '<path d="M100 24c10 6 14 14 16 22l30 54c4 8 2 14-6 14h-16l14 34c3 8 0 14-8 14h-14l12 36c2 8-2 14-10 14H82c-8 0-12-6-10-14l12-36H70c-8 0-11-6-8-14l14-34H60c-8 0-10-6-6-14l30-54c2-8 6-16 16-22Z" fill="#3C5C42"/>' +
      '<path d="M100 46c6 4 9 10 10 16l24 44c3 6 0 10-6 10h-14l10 24c2 6-1 10-7 10h-8l-3-8-3 8h-8c-6 0-9-4-7-10l10-24H84c-6 0-9-4-6-10l24-44c1-6 4-12 10-16Z" fill="#4A6E4E" opacity=".95"/>' +
      '<path d="M100 16l10 26c-4 6-16 6-20 0Z" fill="#5B8459"/>' +
      '<g fill="#6E9A66" opacity=".55"><path d="M78 96l10 22H68Z"/><path d="M122 96l10 22h-20Z"/><path d="M70 156l9 20H61Z"/><path d="M130 156l9 20h-18Z"/></g>' +
      '<g fill="#2F4A36" opacity=".4"><path d="M84 200l16 42H68Z"/><path d="M116 200l16 42h-32Z"/></g>' +
      '</g></svg>';
  }

  function rr(a, b) { return a + rnd() * (b - a); }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

  /* ---------------------------------------------------------
     Art
     --------------------------------------------------------- */
  var INK = 'rgba(58,44,34,.45)';

  function treeArt(kind, s) {
    s = s || 1;
    if (kind === 'oak') {
      return '<svg viewBox="0 0 280 340" width="' + Math.round(280 * s) + '" height="' + Math.round(340 * s) + '" aria-hidden="true">' +
        '<ellipse cx="140" cy="330" rx="86" ry="14" fill="#5E7047" opacity=".18"/>' +
        '<path d="M126 330c2-46 4-80 2-118 10 20 16 42 16 62 4-26 12-46 24-62-2 40-4 80-2 118Z" fill="#8A6244"/>' +
        '<path d="M140 250c-6-30 0-64 6-84" stroke="#7A5539" stroke-width="5" fill="none"/>' +
        '<g class="tree-sway">' +
        '<circle cx="96" cy="150" r="66" fill="#5C8259"/>' +
        '<circle cx="186" cy="140" r="60" fill="#6A9264"/>' +
        '<circle cx="140" cy="98" r="58" fill="#739B6D"/>' +
        '<circle cx="140" cy="164" r="66" fill="#648A5F"/>' +
        '<circle cx="104" cy="120" r="40" fill="#8DB683" opacity=".85"/>' +
        '<circle cx="176" cy="106" r="34" fill="#93BA88" opacity=".7"/>' +
        '<circle cx="140" cy="72" r="26" fill="#9BC08F" opacity=".55"/>' +
        '</g></svg>';
    }
    if (kind === 'birch') {
      return '<svg viewBox="0 0 220 360" width="' + Math.round(220 * s) + '" height="' + Math.round(360 * s) + '" aria-hidden="true">' +
        '<ellipse cx="110" cy="350" rx="58" ry="11" fill="#5E7047" opacity=".16"/>' +
        '<path d="M102 352c2-70 3-140 1-210h16c-2 70-1 140 1 210Z" fill="#E7DFCE"/>' +
        '<g stroke="#8C8071" stroke-width="3" stroke-linecap="round" opacity=".55">' +
        '<path d="M104 300h12M103 268h13M105 220h11M104 180h12M106 152h10"/></g>' +
        '<g class="tree-sway">' +
        '<ellipse cx="112" cy="96" rx="66" ry="54" fill="#86AE76"/>' +
        '<ellipse cx="74" cy="122" rx="42" ry="34" fill="#78A06C"/>' +
        '<ellipse cx="152" cy="118" rx="38" ry="31" fill="#7DA471"/>' +
        '<ellipse cx="112" cy="62" rx="34" ry="26" fill="#A2C795" opacity=".8"/>' +
        '</g></svg>';
    }
    return '<svg viewBox="0 0 200 340" width="' + Math.round(200 * s) + '" height="' + Math.round(340 * s) + '" aria-hidden="true">' +
      '<ellipse cx="100" cy="330" rx="54" ry="11" fill="#4E6040" opacity=".2"/>' +
      '<rect x="94" y="250" width="12" height="80" fill="#7A5539"/>' +
      '<g class="tree-sway">' +
      '<path d="M100 30L168 148H32Z" fill="#3E5E45"/>' +
      '<path d="M100 78L176 196H24Z" fill="#496B4F"/>' +
      '<path d="M100 132L186 250H14Z" fill="#3A5A41"/>' +
      '<path d="M100 46L152 132H48Z" fill="#5F8A65" opacity=".75"/>' +
      '</g></svg>';
  }

  var ART = {
    cottage: '<svg viewBox="0 0 320 300" width="320" height="300" aria-hidden="true">' +
      '<defs><linearGradient id="ctWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E3CFB0"/><stop offset=".3" stop-color="#F8EDD9"/><stop offset="1" stop-color="#E8D6BA"/></linearGradient>' +
      '<linearGradient id="ctRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8F6BA0"/><stop offset="1" stop-color="#66447A"/></linearGradient></defs>' +
      '<ellipse cx="160" cy="288" rx="130" ry="16" fill="#5E7047" opacity=".18"/>' +
      '<rect x="58" y="256" width="204" height="34" rx="6" fill="#C7B79B"/>' +
      '<g stroke="#AC9878" stroke-width="2" opacity=".7"><path d="M58 272h204M108 256v34M162 256v34M216 256v34"/></g>' +
      '<rect x="66" y="150" width="188" height="112" rx="4" fill="url(#ctWall)"/>' +
      '<path d="M66 150h188v16H66Z" fill="#C6A276" opacity=".3"/>' +
      '<path d="M66 150h188v112H66Z" fill="none" stroke="#D9C4A5" stroke-width="3"/>' +
      '<path d="M68 152l-24 12v-10l24-12Zm184 0l24 12v-10l-24-12Z" fill="#E4D3B8"/>' +
      '<path d="M30 152L160 66l130 86Z" fill="url(#ctRoof)"/>' +
      '<path d="M30 152L160 66l22 14-108 72Z" fill="#A484B4" opacity=".45"/>' +
      '<path d="M46 152L160 78l114 74Z" fill="#8E6A9E"/>' +
      '<g stroke="#6A4B7A" stroke-width="2" opacity=".4"><path d="M78 132l82-54M120 152l82-54M180 152l64-42"/></g>' +
      '<rect x="210" y="86" width="26" height="52" rx="2" fill="#C08A6E"/>' +
      '<rect x="206" y="82" width="34" height="9" rx="3" fill="#A9755C"/>' +
      '<g class="smoke" fill="#F3E9D8" opacity=".7"><circle cx="223" cy="66" r="7"/><circle cx="232" cy="52" r="9"/><circle cx="228" cy="38" r="6"/></g>' +
      '<circle cx="160" cy="150" r="22" fill="#F8E6B8" stroke="#C9A87C" stroke-width="5"/>' +
      '<path d="M160 132v36M142 150h36" stroke="#C9A87C" stroke-width="4"/>' +
      '<g><rect x="84" y="196" width="52" height="46" rx="3" fill="#F8E6B8" stroke="#C9A87C" stroke-width="5"/>' +
      '<path d="M110 196v46M84 219h52" stroke="#C9A87C" stroke-width="4"/>' +
      '<rect x="84" y="242" width="52" height="8" fill="#B98A5E"/></g>' +
      '<g><rect x="196" y="196" width="52" height="46" rx="3" fill="#F8E6B8" stroke="#C9A87C" stroke-width="5"/>' +
      '<path d="M222 196v46M196 219h52" stroke="#C9A87C" stroke-width="4"/>' +
      '<rect x="196" y="242" width="52" height="8" fill="#B98A5E"/></g>' +
      '<g fill="#7FA57B"><circle cx="92" cy="248" r="5"/><circle cx="104" cy="250" r="5"/><circle cx="116" cy="248" r="5"/><circle cx="128" cy="250" r="5"/>' +
      '<circle cx="204" cy="248" r="5"/><circle cx="216" cy="250" r="5"/><circle cx="228" cy="248" r="5"/><circle cx="240" cy="250" r="5"/></g>' +
      '<g fill="#F0B9C4"><circle cx="98" cy="247" r="3"/><circle cx="110" cy="249" r="3"/><circle cx="122" cy="247" r="3"/><circle cx="210" cy="247" r="3"/><circle cx="222" cy="249" r="3"/><circle cx="234" cy="247" r="3"/></g>' +
      '<path d="M138 262h44v-46a22 22 0 0 0-44 0Z" fill="#8E6A9E"/>' +
      '<path d="M144 262v-42a16 16 0 0 1 32 0v42Z" fill="#A98FD4"/>' +
      '<circle cx="170" cy="236" r="3" fill="#F7E3A1"/>' +
      '<rect x="132" y="260" width="56" height="8" rx="3" fill="#C7B79B"/>' +
      '<g transform="translate(64 190)"><rect width="14" height="34" rx="4" fill="#C9A87C"/><circle cx="7" cy="12" r="7" fill="#FFE2A0"/><rect y="20" width="14" height="5" fill="#B08A5E"/></g>' +
      '<g fill="#6F9569"><path d="M70 250c-12-10-12-30-2-40 8 8 8 26 2 40Z"/><path d="M74 250c8-14 24-18 32-12-8 10-20 14-32 12Z" opacity=".85"/></g>' +
      '</svg>',

    observatory: '<svg viewBox="0 0 300 310" width="300" height="310" aria-hidden="true">' +
      '<defs><linearGradient id="obDome" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#A7C0AD"/><stop offset="1" stop-color="#78947E"/></linearGradient>' +
      '<linearGradient id="obWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8CBB2"/><stop offset=".32" stop-color="#F0E7D4"/><stop offset="1" stop-color="#DDD0B7"/></linearGradient></defs>' +
      '<ellipse cx="150" cy="298" rx="130" ry="18" fill="#5E7047" opacity=".18"/>' +
      '<path d="M14 298c16-46 62-66 136-66s120 20 136 66Z" fill="#93B079"/>' +
      '<path d="M40 298c14-34 52-50 110-50s96 16 110 50Z" fill="#A3BE88" opacity=".7"/>' +
      '<g><rect x="96" y="152" width="108" height="132" rx="6" fill="#E6DCC8"/>' +
      '<rect x="96" y="152" width="108" height="132" rx="6" fill="none" stroke="#C9B99A" stroke-width="3"/>' +
      '<g stroke="#CFC0A2" stroke-width="2" opacity=".8"><path d="M96 186h108M96 220h108M96 254h108"/></g>' +
      '<path d="M104 284v-40a46 46 0 0 1 92 0v40Z" fill="#7E5C8E"/>' +
      '<path d="M116 284v-38a34 34 0 0 1 68 0v38Z" fill="#FFDFA0"/>' +
      '<path d="M150 214v70M116 284h68" stroke="#8E6A9E" stroke-width="4" opacity=".5"/>' +
      '<rect x="142" y="246" width="16" height="38" rx="8" fill="#A98FD4"/>' +
      '<circle cx="150" cy="268" r="3" fill="#F7E3A1"/></g>' +
      '<g><path d="M92 154a58 46 0 0 1 116 0Z" fill="url(#obDome)"/>' +
      '<path d="M116 154a42 33 0 0 1 34 -32" fill="none" stroke="#B9CDBE" stroke-width="2" opacity=".55"/>' +
      '<path d="M92 154a58 46 0 0 1 116 0" fill="none" stroke="#76937F" stroke-width="3"/>' +
      '<path d="M132 108l10-30h20l-8 30Z" fill="#7E5C8E"/>' +
      '<rect x="144" y="112" width="12" height="44" rx="4" fill="#D9A65B"/>' +
      '<g transform="translate(150 128) rotate(-27)"><rect x="-7" y="-52" width="14" height="58" rx="7" fill="#D9A65B"/><rect x="-7" y="-62" width="14" height="12" rx="6" fill="#C08A4E"/><rect x="-3" y="-58" width="6" height="8" fill="#FFF0C8"/></g>' +
      '<ellipse cx="150" cy="156" rx="58" ry="7" fill="#76937F" opacity=".6"/></g>' +
      '<g stroke="#B9A98C" stroke-width="3"><path d="M112 208l-18 30M188 208l18 30"/></g>' +
      '<g fill="#6F9569"><circle cx="86" cy="288" r="12"/><circle cx="100" cy="292" r="9"/><circle cx="214" cy="288" r="12"/><circle cx="200" cy="292" r="9"/></g>' +
      '<g fill="#F0B9C4"><circle cx="86" cy="284" r="4"/><circle cx="214" cy="284" r="4"/></g>' +
      '</svg>',

    laurels: '<svg viewBox="0 0 300 290" width="300" height="290" aria-hidden="true">' +
      '<ellipse cx="150" cy="278" rx="120" ry="15" fill="#5E7047" opacity=".18"/>' +
      '<rect x="56" y="240" width="188" height="36" rx="5" fill="#CBB99B"/>' +
      '<rect x="56" y="240" width="188" height="7" rx="3" fill="#DDCCAE"/>' +
      '<g stroke="#B5A183" stroke-width="2" opacity=".7"><path d="M96 240v36M150 240v36M204 240v36"/></g>' +
      '<g><rect x="78" y="112" width="26" height="132" rx="4" fill="#E2D6C0"/>' +
      '<rect x="196" y="112" width="26" height="132" rx="4" fill="#DCCFB8"/>' +
      '<path d="M78 118c0-30 34-42 72-42s72 12 72 42v10H78Z" fill="#E2D6C0"/>' +
      '<path d="M78 128h144" stroke="#C7B695" stroke-width="3"/>' +
      '<g stroke="#B5A183" stroke-width="2" opacity=".6"><path d="M104 112v132M196 112v132"/></g>' +
      '<path d="M150 176v40" stroke="#B08A5E" stroke-width="2"/>' +
      '<circle cx="150" cy="196" r="20" fill="#D9A65B"/><circle cx="150" cy="196" r="15" fill="none" stroke="#B9854A" stroke-width="2"/>' +
      '<text x="150" y="202" text-anchor="middle" font-family="Fraunces, serif" font-size="14" fill="#7A4E20">A</text>' +
      '<g fill="#F7E3A1" stroke="#C79A50" stroke-width="1.5"><circle cx="150" cy="150" r="13"/><circle cx="118" cy="158" r="10"/><circle cx="182" cy="158" r="10"/></g>' +
      '<g fill="#8E8AA0" stroke="#77738A" stroke-width="1.5"><circle cx="150" cy="150" r="7" opacity=".35"/></g>' +
      '<g fill="#B7A0E2" opacity=".9"><path d="M136 124l14 8-14 8Z"/><path d="M164 124l-14 8 14 8Z"/></g>' +
      '</g>' +
      '<g fill="#6F9569">' +
      '<path d="M62 240c-14-6-16-24-4-30 8 8 8 22 4 30Z"/><path d="M238 240c14-6 16-24 4-30-8 8-8 22-4 30Z"/>' +
      '<path d="M150 240c-4-12 4-22 14-22 0 12-6 18-14 22Z" opacity=".85"/>' +
      '</g>' +
      '<path d="M150 240v-14" stroke="#4F6B52" stroke-width="2"/>' +
      '<circle cx="164" cy="222" r="5" fill="#F0B9C4"/>' +
      '</svg>',

    workshop: '<svg viewBox="0 0 320 270" width="320" height="270" aria-hidden="true">' +
      '<ellipse cx="160" cy="258" rx="126" ry="16" fill="#5E7047" opacity=".18"/>' +
      '<g><path d="M96 254L142 78h8l-40 176Z" fill="#9C7248"/><path d="M224 254l-44-176h-8l40 176Z" fill="#8A6244"/>' +
      '<rect x="120" y="112" width="112" height="98" rx="3" fill="#F7EFDE"/>' +
      '<rect x="120" y="112" width="112" height="98" rx="3" fill="none" stroke="#CBB99B" stroke-width="4"/>' +
      '<g stroke="#A98FD4" stroke-width="2.4" fill="none" opacity=".9">' +
      '<circle cx="160" cy="150" r="18"/><path d="M160 132v36M142 150h36"/>' +
      '<path d="M126 188h100M132 176h44M132 196h70" stroke="#9FB79E"/></g>' +
      '<g fill="#D9A65B"><circle cx="160" cy="150" r="3"/><circle cx="178" cy="168" r="3"/></g>' +
      '<path d="M136 112v-8h80v8" fill="none" stroke="#B08A5E" stroke-width="4"/>' +
      '<circle cx="160" cy="104" r="3" fill="#B08A5E"/></g>' +
      '<g transform="translate(20 132)"><rect x="10" y="0" width="60" height="86" rx="4" fill="#C9A87C"/>' +
      '<rect x="10" y="0" width="60" height="86" rx="4" fill="none" stroke="#A9805A" stroke-width="3"/>' +
      '<g fill="#F7EFDE"><rect x="18" y="10" width="44" height="20" rx="2"/><rect x="18" y="36" width="44" height="16" rx="2" transform="rotate(-3 40 44)"/><rect x="18" y="58" width="30" height="18" rx="2"/></g>' +
      '<g fill="#D98E9A"><circle cx="24" cy="17" r="2"/><circle cx="30" cy="17" r="2"/></g>' +
      '<g fill="#8E6A9E"><circle cx="24" cy="45" r="2"/></g>' +
      '</g>' +
      '<g transform="translate(266 190)"><path d="M0 8h54v10a10 10 0 0 1-10 10H10A10 10 0 0 1 0 18Z" fill="#8E6A9E"/>' +
      '<rect x="6" y="-6" width="42" height="16" rx="3" fill="#A98FD4"/>' +
      '<path d="M14 0h26" stroke="#F7EFDE" stroke-width="3" opacity=".6"/></g>' +
      '<g transform="translate(258 128)"><rect x="0" y="0" width="10" height="54" rx="4" fill="#C9A87C"/><rect x="-6" y="54" width="22" height="8" rx="3" fill="#B08A5E"/><circle cx="5" cy="10" r="8" fill="#FFE2A0"/></g>' +
      '<g fill="#6F9569"><path d="M40 250c-10-12-6-30 6-34 4 12 0 26-6 34Z"/><path d="M278 254c10-12 6-30-6-34-4 12 0 26 6 34Z"/></g>' +
      '<g fill="#F0B9C4"><circle cx="52" cy="242" r="4"/><circle cx="264" cy="246" r="4"/></g>' +
      '</svg>',

    gramophone: '<svg viewBox="0 0 240 240" width="240" height="240" aria-hidden="true">' +
      '<ellipse cx="120" cy="228" rx="92" ry="14" fill="#5E7047" opacity=".2"/>' +
      '<ellipse cx="120" cy="214" rx="70" ry="20" fill="#8A6244"/>' +
      '<path d="M50 214c0-14 32-22 70-22s70 8 70 22v6H50Z" fill="#A9805A"/>' +
      '<g stroke="#7A5539" stroke-width="2" opacity=".6"><path d="M58 206c18-8 44-12 62-12s44 4 62 12"/></g>' +
      '<rect x="82" y="176" width="76" height="30" rx="4" fill="#8E6A9E"/>' +
      '<rect x="82" y="176" width="76" height="7" rx="3" fill="#A98FD4"/>' +
      '<path d="M160 190l16-4" stroke="#D9A65B" stroke-width="4" stroke-linecap="round"/>' +
      '<g transform="translate(120 176)"><path d="M-6 0h12v-34l30-46c4-6-2-12-8-9L8 -50 -6 -48Z" fill="#D9A65B"/>' +
      '<ellipse cx="26" cy="-72" rx="34" ry="12" transform="rotate(-22 26 -72)" fill="#E5B872"/>' +
      '<ellipse cx="26" cy="-72" rx="22" ry="7" transform="rotate(-22 26 -72)" fill="#8E6A9E" opacity=".55"/>' +
      '<path d="M-6 -34c10 4 22 2 30-4" stroke="#C08A4E" stroke-width="3" fill="none"/></g>' +
      '<g class="music-notes" fill="#6B4B8A" font-family="Fraunces, serif">' +
      '<text x="176" y="92" font-size="26" class="n1">♪</text><text x="196" y="66" font-size="19" class="n2">♫</text><text x="160" y="56" font-size="16" class="n3">♪</text>' +
      '</g>' +
      '<g fill="#6F9569"><path d="M36 218c-12-8-12-26-2-32 6 10 6 24 2 32Z"/><path d="M206 218c12-8 12-26 2-32-6 10-6 24-2 32Z"/></g>' +
      '<g fill="#F0B9C4"><circle cx="46" cy="208" r="5"/><circle cx="196" cy="208" r="5"/></g>' +
      '<g fill="#F7E3A1"><circle cx="52" cy="204" r="3"/><circle cx="190" cy="204" r="3"/></g>' +
      '</svg>',

    mailbox: '<svg viewBox="0 0 170 240" width="170" height="240" aria-hidden="true">' +
      '<ellipse cx="85" cy="226" rx="58" ry="11" fill="#5E7047" opacity=".2"/>' +
      '<rect x="78" y="112" width="14" height="112" rx="4" fill="#9C7248"/>' +
      '<rect x="66" y="212" width="38" height="10" rx="4" fill="#7A5539"/>' +
      '<path d="M32 130v-28a40 40 0 0 1 80 0v28Z" fill="#8E6A9E"/>' +
      '<path d="M38 130v-26a34 34 0 0 1 68 0v26Z" fill="#A98FD4"/>' +
      '<rect x="32" y="126" width="80" height="18" rx="5" fill="#7E5C8E"/>' +
      '<path d="M40 116h64" stroke="#E4D9F4" stroke-width="2" opacity=".55"/>' +
      '<g transform="translate(120 96)"><rect width="9" height="46" rx="3" fill="#D9A65B"/><path d="M0 0h24v20H0Z" fill="#E5B872"/></g>' +
      '<g transform="translate(96 100) rotate(8)"><rect width="34" height="24" rx="2" fill="#F7EFDE"/><path d="M0 0l17 12L34 0" fill="none" stroke="#CBB99B" stroke-width="2"/></g>' +
      '<g fill="#6F9569"><path d="M58 222c-10-10-8-26 2-32 6 10 2 24-2 32Z"/><path d="M112 224c10-10 8-26-2-32-6 10-2 24 2 32Z"/></g>' +
      '<g fill="#F0B9C4"><circle cx="66" cy="214" r="4"/><circle cx="104" cy="216" r="4"/></g>' +
      '</svg>',

    gate: '<svg viewBox="0 0 270 290" width="270" height="290" aria-hidden="true">' +
      '<ellipse cx="135" cy="278" rx="110" ry="16" fill="#5E7047" opacity=".18"/>' +
      '<g><rect x="32" y="118" width="34" height="150" rx="5" fill="#DFD2BA"/>' +
      '<rect x="204" y="118" width="34" height="150" rx="5" fill="#D8CAB1"/>' +
      '<path d="M32 122c0-34 46-48 103-48s103 14 103 48v10H32Z" fill="#E5D8C0"/>' +
      '<g stroke="#C6B492" stroke-width="2" opacity=".7"><path d="M49 166h-34M221 166h34M32 216h34M204 216h34"/></g>' +
      '</g>' +
      '<g stroke="#6E7F62" stroke-width="5" fill="none" stroke-linecap="round">' +
      '<path d="M66 150v126M104 150v126M135 150v126M166 150v126M204 150v126"/>' +
      '<path d="M62 176h146M62 214h146M62 250h146"/></g>' +
      '<g fill="#D9A65B"><circle cx="104" cy="176" r="4"/><circle cx="135" cy="214" r="4"/><circle cx="166" cy="176" r="4"/></g>' +
      '<path d="M66 146c18-32 48-38 69-38s51 6 69 38" fill="none" stroke="#6E7F62" stroke-width="5"/>' +
      '<g fill="#6F9569" opacity=".95">' +
      '<path d="M42 210c-18-4-24-24-12-34 12 4 16 22 12 34Z"/><path d="M226 196c18-4 24-24 12-34-12 4-16 22-12 34Z"/>' +
      '<path d="M60 132c-6-16 4-28 16-28 0 14-6 22-16 28Z"/>' +
      '</g>' +
      '<g fill="#F0B9C4"><circle cx="44" cy="196" r="4"/><circle cx="52" cy="186" r="3"/><circle cx="224" cy="182" r="4"/></g>' +
      '<g class="gate-glow" opacity=".7"><ellipse cx="135" cy="120" rx="46" ry="30" fill="#FFF0C8" opacity=".5"/></g>' +
      '</svg>',

    bench: '<svg viewBox="0 0 210 150" width="210" height="150" aria-hidden="true">' +
      '<ellipse cx="105" cy="140" rx="86" ry="9" fill="#5E7047" opacity=".2"/>' +
      '<g stroke="#8A6244" stroke-width="6" stroke-linecap="round"><path d="M36 142v-34M174 142v-34M54 140v-26M156 140v-26"/></g>' +
      '<g><rect x="28" y="94" width="154" height="13" rx="5" fill="#C08A5E"/>' +
      '<rect x="28" y="80" width="154" height="10" rx="4" fill="#C99A6C"/>' +
      '<rect x="28" y="66" width="154" height="9" rx="4" fill="#C08A5E"/>' +
      '<rect x="44" y="40" width="12" height="50" rx="5" fill="#B08052"/>' +
      '<rect x="154" y="40" width="12" height="50" rx="5" fill="#B08052"/>' +
      '<rect x="44" y="34" width="122" height="12" rx="5" fill="#B98A5E"/></g>' +
      '<g transform="translate(112 82) rotate(-7)"><rect width="34" height="26" rx="2" fill="#F7EFDE"/><path d="M4 26v-26M30 26v-26" stroke="#D7C8AC" stroke-width="2"/><path d="M8 8h18M8 14h14" stroke="#B9A98C" stroke-width="2"/></g>' +
      '<g fill="#6F9569"><path d="M20 142c-10-10-8-26 2-32 6 10 2 24-2 32Z"/><path d="M190 142c10-10 8-26-2-32-6 10-2 24 2 32Z"/></g>' +
      '</svg>',

    sundial: '<svg viewBox="0 0 130 130" width="130" height="130" aria-hidden="true">' +
      '<ellipse cx="65" cy="120" rx="52" ry="9" fill="#5E7047" opacity=".2"/>' +
      '<ellipse cx="65" cy="112" rx="46" ry="14" fill="#BFB49B"/>' +
      '<ellipse cx="65" cy="107" rx="46" ry="14" fill="#D6CBB2"/>' +
      '<ellipse cx="65" cy="106" rx="34" ry="9" fill="#E3D9C2"/>' +
      '<g stroke="#B4A78C" stroke-width="1.6" opacity=".8">' +
      '<path d="M65 98v3M51 99l1 3M79 99l-1 3M42 103l2 2M88 103l-2 2"/></g>' +
      '<path d="M62 104h6v-30l-6-3Z" fill="#A98FD4"/>' +
      '<path d="M62 74l6 3v-8Z" fill="#8E6A9E"/>' +
      '<g fill="#6F9569"><path d="M26 110c-8-8-6-20 2-24 4 8 2 18-2 24Z"/><path d="M104 110c8-8 6-20-2-24-4 8-2 18 2 24Z"/></g>' +
      '<circle cx="34" cy="100" r="3" fill="#F0B9C4"/><circle cx="98" cy="104" r="3" fill="#F7E3A1"/>' +
      '</svg>',

    crane: '<svg viewBox="0 0 40 30" width="40" height="30" aria-hidden="true">' +
      '<path d="M4 20L20 8l16 12Z" fill="#FBF5E9"/><path d="M20 8L28 4l4 8Z" fill="#EDE0C9"/>' +
      '<path d="M4 20l8-8 8 6-6 8Z" fill="#F3E9D6"/><path d="M28 14l8 2-4 6Z" fill="#FBF5E9"/>' +
      '<path d="M20 8l-2-6 6 4Z" fill="#E5D8C0"/>' +
      '<path d="M4 20l-2 4 8-2" fill="#EDE0C9" stroke="none"/>' +
      '</svg>'
  };

  /* ---------------------------------------------------------
     Stations
     --------------------------------------------------------- */
  var SITES = [
    { id: 'about', x: 1650, y: 1520, art: 'cottage', artW: 320, label: 'the cottage', verb: 'Look around the cottage', nudge: 'about',
      blurb: 'Grade 11 at St. Robert IB, research at the Kellis Lab, MIT CSAIL.' },
    { id: 'research', x: 2650, y: 1480, art: 'observatory', artW: 300, label: 'the observatory', verb: 'Start reading', nudge: 'research',
      blurb: 'Seven projects: certified statistics, a drug engine, an Alzheimer’s pipeline.' },
    { id: 'recognition', x: 3230, y: 2010, art: 'laurels', artW: 300, label: 'the laurels', verb: 'See the shelf', nudge: 'recognition',
      blurb: 'Competition results, academic results, and certifications.' },
    { id: 'projects', x: 1020, y: 2350, art: 'workshop', artW: 320, label: 'the workshop', verb: 'See the projects', nudge: 'projects',
      blurb: 'The Kellis Lab platform, Window to the Mind, Heartware, and CNScope.' },
    { id: 'arts', x: 2330, y: 1440, art: 'gramophone', artW: 240, label: 'the gramophone', verb: 'Listen', nudge: 'arts',
      blurb: 'Music, poetry, and teaching swimming.' },
    { id: 'contact', x: 1620, y: 2580, art: 'mailbox', artW: 170, label: 'the mailbox', verb: 'Write a letter', nudge: 'contact',
      blurb: 'Email and LinkedIn.' },
    { id: 'bench', x: 2810, y: 2455, art: 'bench', artW: 210, label: 'the bench', verb: 'Sit for a minute', nudge: 'bench',
      blurb: 'A science fact, different each visit.' },
    { id: 'secret', x: 430, y: 820, art: 'gate', artW: 270, label: 'the garden gate', verb: 'Go through', nudge: 'secret', locked: true,
      blurb: 'Locked, unless you found the password on the desk.' }
  ];

  function buildStations() {
    SITES.forEach(function (s) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'site site--' + s.id;
      btn.dataset.site = s.id;
      btn.style.left = s.x + 'px';
      btn.style.top = s.y + 'px';
      btn.style.zIndex = Math.round(s.y);
      btn.setAttribute('aria-label', s.label + '. ' + s.verb + '.');
      var scale = s.artW ? s.artW / 320 : 1;
      btn.innerHTML =
        '<span class="site-glow" style="top:' + (s.artW * 0.62) + 'px"></span>' +
        '<span class="site-art">' + ART[s.art] + '</span>' +
        '<span class="site-label">' + s.label + '</span>' +
        '<span class="site-tip" aria-hidden="true"><span class="site-tip-name">' + s.label + '</span>' +
        '<span class="site-tip-blurb">' + (s.blurb || s.verb) + '</span></span>';
      if (s.locked && !state.secretUnlocked) btn.classList.add('is-hidden');
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        goToStation(s);
      });
      sitesWrap.appendChild(btn);
      s.el = btn;
      stations.push(s);
      obstacles.push({ x: s.x, y: s.y - 24, rx: 110, ry: 46 });
    });
  }

  /* ---------------------------------------------------------
     Scenery
     --------------------------------------------------------- */
  function buildScenery() {
    var treeSpots = [
      [420, 500, 'oak', 1.25], [760, 640, 'pine', 1.1], [1640, 520, 'oak', 1.0],
      [2420, 470, 'birch', 1.2], [2860, 620, 'oak', 1.15], [3620, 720, 'pine', 1.0],
      [3900, 1350, 'oak', 1.3], [3720, 1750, 'birch', 1.0], [3960, 2350, 'oak', 1.2],
      [3480, 2820, 'pine', 1.15], [2600, 2860, 'oak', 1.0], [2050, 2880, 'birch', .95],
      [1200, 2850, 'oak', 1.2], [620, 2680, 'pine', 1.05], [300, 2100, 'oak', 1.15],
      [520, 1750, 'birch', .95], [270, 1050, 'pine', .9], [1150, 830, 'oak', .95],
      [1560, 720, 'birch', 1.0], [2600, 780, 'pine', .95], [3960, 900, 'birch', .95],
      [940, 1950, 'birch', .9], [1720, 2260, 'oak', .95], [2320, 2380, 'pine', .9],
      [2700, 1960, 'birch', .9], [3620, 2520, 'oak', 1.05], [1900, 1180, 'oak', .8],
      [1500, 1840, 'oak', .9], [1950, 1310, 'birch', .95], [2470, 1820, 'oak', 1.0], [1790, 2010, 'pine', .85]
    ];
    function addTree(x, y, kind, s) {
      var d = document.createElement('div');
      d.className = 'tree';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.zIndex = Math.round(y);
      d.innerHTML = treeArt(kind, s);
      if (rnd() > .72) d.style.transform = 'translate(-50%,-100%) scaleX(-1)';
      decor.appendChild(d);
      obstacles.push({ x: x, y: y - 6, rx: 26 * s, ry: 14 });
    }
    treeSpots.forEach(function (tp) { addTree(tp[0], tp[1], tp[2], tp[3]); });

    // a dense edge of trees so the field feels enclosed
    for (var bx = 200; bx < W - 140; bx += 300) {
      if (Math.abs(bx - 430) < 320) continue;
      addTree(bx + rr(-50, 50), rr(430, 545), pick(['oak', 'pine', 'birch', 'oak']), rr(.95, 1.3));
      addTree(bx + rr(-70, 70), rr(2900, 2970), pick(['oak', 'pine', 'birch', 'oak']), rr(.95, 1.3));
    }
    for (var by = 780; by < 2760; by += 380) {
      addTree(rr(170, 260), by + rr(-50, 50), pick(['oak', 'pine', 'birch']), rr(.9, 1.2));
      addTree(rr(3950, 4040), by + rr(-50, 50), pick(['oak', 'pine', 'birch']), rr(.9, 1.2));
    }

    // tall grass clumps
    for (var gi = 0; gi < 80; gi++) {
      var gx = rr(160, W - 160), gy = rr(560, H - 90);
      if (nearSites(gx, gy, 240) || inPond(gx, gy)) continue;
      var tuft = document.createElement('div');
      tuft.className = 'grass-tuft';
      tuft.style.left = gx + 'px';
      tuft.style.top = gy + 'px';
      tuft.style.zIndex = Math.round(gy);
      var blades = '';
      for (var gb = 0; gb < 9; gb++) {
        var lean = rr(-16, 16);
        blades += '<path d="M0 0C' + (lean * .3) + ' -14 ' + lean + ' -26 ' + (lean * 1.3) + ' -38" />';
      }
      tuft.innerHTML = '<svg viewBox="-24 -46 48 50" width="' + Math.round(rr(42, 74)) + '" aria-hidden="true"><g transform="translate(0 0)" fill="none" stroke="' + pick(['#7FA75F', '#8FB56C', '#6E9553']) + '" stroke-width="2.2" stroke-linecap="round">' + blades + '</g></svg>';
      decor.appendChild(tuft);
    }

    // a ring of stones where you land
    for (var st = 0; st < 9; st++) {
      var ang = (st / 9) * Math.PI * 2 + .2;
      var sx3 = 2100 + Math.cos(ang) * rr(96, 116);
      var sy3 = 1720 + Math.sin(ang) * rr(64, 78);
      var stone = document.createElement('div');
      stone.className = 'rock';
      stone.style.left = sx3 + 'px';
      stone.style.top = sy3 + 'px';
      stone.style.zIndex = Math.round(sy3);
      stone.innerHTML = '<svg viewBox="0 0 80 44" width="' + Math.round(rr(26, 40)) + '" aria-hidden="true"><ellipse cx="40" cy="40" rx="30" ry="5" fill="#5E7047" opacity=".16"/><path d="M14 40c-4-10 4-20 16-22 10-2 16 3 20 10 6 2 8 7 4 12Z" fill="#C3B7A1"/><path d="M20 34c2-7 8-12 16-12" stroke="#D8CEB9" stroke-width="3" fill="none"/></svg>';
      decor.appendChild(stone);
    }

    // the sundial: an old thing that changes the light
    var su = document.createElement('button');
    su.type = 'button';
    su.className = 'sundial';
    su.style.left = '3540px';
    su.style.top = '1450px';
    su.style.zIndex = '1450';
    su.id = 'sundial';
    su.setAttribute('aria-label', 'An old sundial. Touch it to move the light.');
    su.innerHTML = ART.sundial;
    su.addEventListener('click', function (e) {
      e.stopPropagation();
      var night = !AWWorld.isNight();
      AWWorld.setNight(night);
      if (AW.Audio) AW.Audio.softChime();
      AW.toast(night ? 'The field goes dark. The fireflies come out.' : 'The light comes back.');
    });
    decor.appendChild(su);

    var bushes = [[560, 1520], [1240, 1620], [1820, 1560], [2440, 1480], [2920, 1560], [3380, 1440], [720, 2050], [1420, 2350], [1980, 2620], [2560, 2200], [3560, 2220], [3880, 2020], [1080, 1050], [2200, 1180], [1720, 860]];
    bushes.forEach(function (b) {
      var d = document.createElement('div');
      d.className = 'bush';
      d.style.left = b[0] + 'px';
      d.style.top = b[1] + 'px';
      d.style.zIndex = Math.round(b[1]);
      d.innerHTML = '<svg viewBox="0 0 120 70" width="' + Math.round(rr(70, 110)) + '" aria-hidden="true"><ellipse cx="60" cy="64" rx="52" ry="7" fill="#5E7047" opacity=".18"/><circle cx="38" cy="42" r="24" fill="#6F9569"/><circle cx="64" cy="32" r="28" fill="#7CA474"/><circle cx="88" cy="46" r="20" fill="#85AC7B"/><g fill="#F0B9C4"><circle cx="40" cy="34" r="3.4"/><circle cx="76" cy="26" r="3.4"/><circle cx="92" cy="44" r="2.8"/></g></svg>';
      decor.appendChild(d);
    });

    var rocks = [[640, 1240], [1350, 2000], [2180, 2060], [2940, 1250], [3660, 1980], [900, 2660], [2450, 1080]];
    rocks.forEach(function (b) {
      var d = document.createElement('div');
      d.className = 'rock';
      d.style.left = b[0] + 'px';
      d.style.top = b[1] + 'px';
      d.style.zIndex = Math.round(b[1]);
      d.innerHTML = '<svg viewBox="0 0 80 44" width="' + Math.round(rr(38, 68)) + '" aria-hidden="true"><ellipse cx="40" cy="40" rx="34" ry="5" fill="#5E7047" opacity=".18"/><path d="M12 40c-4-12 4-24 18-26 12-2 18 4 22 12 6 2 8 8 4 14Z" fill="#B9AE99"/><path d="M18 34c2-8 10-14 20-14" stroke="#CFC5B0" stroke-width="3" fill="none"/></svg>';
      decor.appendChild(d);
    });

    // flower clusters
    for (var i = 0; i < 34; i++) {
      var x = rr(140, W - 140), y = rr(560, H - 120);
      if (nearSites(x, y, 320)) continue;
      var d = document.createElement('div');
      d.className = 'flowerpatch';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.zIndex = Math.round(y);
      var petals = '';
      var colors = ['#F0B9C4', '#F7E3A1', '#C8B6E6', '#FBF5E9', '#E8A39A'];
      var n = Math.round(rr(3, 7));
      for (var j = 0; j < n; j++) {
        var ox = rr(-26, 26), oy = rr(-9, 9);
        petals += '<g transform="translate(' + (ox + 40) + ' ' + (oy + 20) + ')"><circle r="4.4" fill="' + pick(colors) + '"/><circle r="1.6" fill="#F7E3A1"/></g>';
      }
      d.innerHTML = '<svg viewBox="0 0 80 32" width="' + Math.round(rr(48, 82)) + '" aria-hidden="true"><g stroke="#5F8A63" stroke-width="2" stroke-linecap="round"><path d="M20 22v8M40 20v10M60 22v8"/></g>' + petals + '</svg>';
      decor.appendChild(d);
    }

    // pond reeds + lily pads
    for (var k = 0; k < 16; k++) {
      var a = Math.PI + (k / 15) * Math.PI;
      var rx = 3150 + Math.cos(a) * (300 + rr(-30, 30));
      var ry = 2520 + Math.sin(a) * (140 + rr(-16, 16));
      var reed = document.createElement('div');
      reed.className = 'reeds';
      reed.style.left = rx + 'px';
      reed.style.top = (ry + 20) + 'px';
      reed.style.zIndex = Math.round(ry);
      reed.innerHTML = '<svg viewBox="0 0 30 74" width="26" aria-hidden="true"><g stroke="#6B8F5F" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M15 72c-2-22-6-38-10-48M15 72c0-24 2-40 6-52M15 72c-4-16-10-24-14-30"/></g><ellipse cx="12" cy="22" rx="3.4" ry="8" fill="#8A6B4A"/><ellipse cx="22" cy="16" rx="3" ry="7" fill="#8A6B4A"/></svg>';
      decor.appendChild(reed);
    }

    // butterflies
    for (var b = 0; b < 55; b++) {
      var fx = rr(200, W - 200), fy = rr(700, H - 300);
      var foam = document.createElement('div');
      foam.className = 'firefly';
      foam.style.left = fx + 'px';
      foam.style.top = fy + 'px';
      foam.style.animationDelay = (-rr(0, 4)) + 's';
      decor.appendChild(foam);
    }

    for (var bi = 0; bi < 6; bi++) {
      var el = document.createElement('div');
      el.className = 'butterfly';
      var bx = rr(300, W - 300), by = rr(700, H - 400);
      el.style.left = bx + 'px';
      el.style.top = by + 'px';
      el.style.zIndex = Math.round(by) + 1;
      el.innerHTML = '<svg viewBox="0 0 26 22" aria-hidden="true"><g class="wing"><path d="M13 11C4 0 0 4 2 10c2 6 8 7 11 5Z" fill="#F0B9C4"/><path d="M13 11c9-11 13-7 11-1-2 6-8 7-11 5Z" fill="#E8A39A"/></g><path d="M13 4v14" stroke="#5B4A44" stroke-width="1.6" stroke-linecap="round"/><path d="M13 5l-3-3M13 5l3-3" stroke="#5B4A44" stroke-width="1.2"/></svg>';
      decor.appendChild(el);
      butterflies.push({ el: el, bx: bx, by: by, ph: rr(0, 6.28), sp: rr(.35, .8), amp: rr(30, 90) });
    }
  }

  function nearSites(x, y, r) {
    for (var i = 0; i < SITES.length; i++) {
      if (Math.hypot(SITES[i].x - x, SITES[i].y - y) < r) return true;
    }
    return false;
  }

  /* ---------------------------------------------------------
     Ground
     --------------------------------------------------------- */
  function paintGround() {
    groundCanvas = document.createElement('canvas');
    groundCanvas.id = 'ground-canvas';
    groundCanvas.width = W / 2;
    groundCanvas.height = H / 2;
    groundWrap.appendChild(groundCanvas);
    var g = groundCanvas.getContext('2d');
    g.scale(0.5, 0.5);

    var base = g.createLinearGradient(0, 400, 0, H);
    base.addColorStop(0, '#B0C983');
    base.addColorStop(.45, '#9DBB73');
    base.addColorStop(1, '#7F9E5C');
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);

    // soft meadow patches
    var patches = ['#A0BD78', '#B4CD8B', '#97B573', '#AECA84', '#8CAB69'];
    for (var i = 0; i < 90; i++) {
      var px = rr(0, W), py = rr(400, H), prx = rr(120, 420), pry = rr(70, 190);
      var rg = g.createRadialGradient(px, py, 0, px, py, prx);
      rg.addColorStop(0, pick(patches));
      rg.addColorStop(1, 'rgba(160,190,120,0)');
      g.globalAlpha = .5;
      g.fillStyle = rg;
      g.beginPath();
      g.ellipse(px, py, prx, pry, rr(-.4, .4), 0, 6.3);
      g.fill();
    }
    g.globalAlpha = 1;

    // long tree shadows and sunlit patches
    for (var b = 0; b < 60; b++) {
      var sx2 = rr(0, W), sy2 = rr(430, H), srx = rr(110, 340), sry = rr(40, 130);
      var sg = g.createRadialGradient(sx2, sy2, 0, sx2, sy2, srx);
      sg.addColorStop(0, 'rgba(60, 84, 50, .16)');
      sg.addColorStop(1, 'rgba(60, 84, 50, 0)');
      g.fillStyle = sg;
      g.beginPath();
      g.ellipse(sx2, sy2, srx, sry, rr(-.5, .5), 0, 6.3);
      g.fill();
    }
    for (var l = 0; l < 34; l++) {
      var lx2 = rr(0, W), ly2 = rr(430, H), lrx = rr(120, 300), lry = rr(50, 140);
      var lg = g.createRadialGradient(lx2, ly2, 0, lx2, ly2, lrx);
      lg.addColorStop(0, 'rgba(255, 246, 205, .2)');
      lg.addColorStop(1, 'rgba(255, 246, 205, 0)');
      g.fillStyle = lg;
      g.beginPath();
      g.ellipse(lx2, ly2, lrx, lry, rr(-.5, .5), 0, 6.3);
      g.fill();
    }

    // paths: one network, drawn as solid strokes so junctions never double up
    var HUB = [2100, 1720];
    var pathPts = pathLines = [
      [[1650, 1512], [1790, 1592], [1950, 1652], HUB],
      [HUB, [2260, 1652], [2420, 1566], [2560, 1462], [2650, 1392]],
      [HUB, [2400, 1798], [2760, 1898], [3060, 1968], [3200, 2002]],
      [HUB, [1912, 1876], [1782, 2136], [1702, 2396], [1620, 2556]],
      [HUB, [1862, 1898], [1562, 2088], [1252, 2228], [1084, 2308]],
      [[1650, 1492], [1420, 1372], [1180, 1222], [900, 1052], [622, 872], [470, 792]],
      [[3200, 2020], [3100, 2178], [2962, 2318], [2842, 2428]],
      [[2842, 2472], [3010, 2518], [3150, 2538]],
      [[2320, 1488], [2322, 1462], [2330, 1452]]
    ];

    g.lineCap = 'round';
    g.lineJoin = 'round';

    // a clearing where the paths meet, so the hub reads as a place
    var hubG = g.createRadialGradient(HUB[0], HUB[1], 20, HUB[0], HUB[1], 168);
    hubG.addColorStop(0, '#F2E4C4');
    hubG.addColorStop(.72, '#E8D6B2');
    hubG.addColorStop(1, 'rgba(232,214,178,0)');
    g.fillStyle = hubG;
    g.beginPath();
    g.ellipse(HUB[0], HUB[1], 168, 128, 0, 0, 6.3);
    g.fill();

    function pathNet() {
      var path = new Path2D();
      pathPts.forEach(function (pts) {
        path.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length - 1; i++) {
          var mx = (pts[i][0] + pts[i + 1][0]) / 2;
          var my = (pts[i][1] + pts[i + 1][1]) / 2;
          path.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
        }
        var n = pts.length - 1;
        path.quadraticCurveTo(pts[n][0], pts[n][1], pts[n][0], pts[n][1]);
      });
      return path;
    }
    var net = pathNet();
    var bands = [[104, '#93A76D'], [92, '#C6AF86'], [78, '#E3D0A9'], [58, '#F4E8C9']];
    bands.forEach(function (b) {
      g.strokeStyle = b[1];
      g.lineWidth = b[0];
      g.stroke(net);
    });

    // path speckles, kept off the hub so the clearing stays clean
    for (var s2 = 0; s2 < 1500; s2++) {
      var sp = pathPts[Math.floor(rnd() * pathPts.length)];
      var seg = Math.floor(rnd() * (sp.length - 1));
      var f = rnd();
      var px2 = sp[seg][0] + (sp[seg + 1][0] - sp[seg][0]) * f + rr(-22, 22);
      var py2 = sp[seg][1] + (sp[seg + 1][1] - sp[seg][1]) * f + rr(-22, 22);
      if (Math.hypot(px2 - HUB[0], py2 - HUB[1]) < 150) continue;
      g.fillStyle = rnd() > .5 ? 'rgba(168,146,108,.3)' : 'rgba(243,233,212,.38)';
      g.fillRect(px2, py2, rr(1, 3), rr(1, 3));
    }

    // pond
    var pondX = 3150, pondY = 2520, pondRX = 330, pondRY = 156;
    g.save();
    g.beginPath();
    g.ellipse(pondX, pondY, pondRX + 26, pondRY + 20, 0, 0, 6.3);
    var bank = g.createRadialGradient(pondX, pondY, pondRY * .5, pondX, pondY, pondRX + 30);
    bank.addColorStop(0, 'rgba(214,198,160,0)');
    bank.addColorStop(1, '#D3C096');
    g.fillStyle = bank;
    g.fill();
    var water = g.createLinearGradient(pondX, pondY - pondRY, pondX, pondY + pondRY);
    water.addColorStop(0, '#9FC6CC');
    water.addColorStop(.5, '#89B6C2');
    water.addColorStop(1, '#6F9FB2');
    g.beginPath();
    g.ellipse(pondX, pondY, pondRX, pondRY, 0, 0, 6.3);
    g.fillStyle = water;
    g.fill();
    g.clip();
    // ripples
    g.strokeStyle = 'rgba(255,255,255,.34)';
    for (var r2 = 0; r2 < 16; r2++) {
      g.lineWidth = rr(.8, 1.8);
      g.beginPath();
      g.ellipse(pondX + rr(-200, 200), pondY + rr(-80, 80), rr(20, 70), rr(4, 12), 0, 0, 6.3);
      g.stroke();
    }
    // reflection of sky
    g.fillStyle = 'rgba(255,244,214,.16)';
    g.beginPath();
    g.ellipse(pondX - 60, pondY - 40, 150, 40, -.15, 0, 6.3);
    g.fill();
    g.restore();
    // lily pads
    for (var lp = 0; lp < 9; lp++) {
      var lx = pondX + rr(-230, 240), ly = pondY + rr(-90, 100);
      g.fillStyle = '#6F9569';
      g.beginPath();
      g.ellipse(lx, ly, rr(12, 24), rr(7, 13), rr(0, 3), 0, 6.3);
      g.fill();
      g.fillStyle = '#85AC7B';
      g.beginPath();
      g.ellipse(lx - 2, ly - 2, rr(8, 15), rr(5, 8), rr(0, 3), 0, 6.3);
      g.fill();
      if (rnd() > .7) {
        g.fillStyle = '#F0B9C4';
        g.beginPath();
        g.arc(lx + 8, ly - 6, 4, 0, 6.3);
        g.fill();
      }
    }

    // grass, in patches
    for (var t2 = 0; t2 < 2600; t2++) {
      var gx = rr(0, W), gy = rr(430, H);
      if (inPond(gx, gy)) continue;
      var shade = pick(['#7FA75F', '#8FB56C', '#9CC077', '#749B58', '#A7C784']);
      g.strokeStyle = shade;
      g.lineWidth = rr(1, 2.4);
      g.beginPath();
      g.moveTo(gx, gy);
      g.quadraticCurveTo(gx + rr(-5, 5), gy - rr(6, 14), gx + rr(-9, 9), gy - rr(9, 20));
      g.stroke();
    }

    // flower dots
    for (var f2 = 0; f2 < 900; f2++) {
      var fxp = rr(0, W), fyp = rr(450, H);
      if (inPond(fxp, fyp) || nearSites(fxp, fyp, 90)) continue;
      g.fillStyle = pick(['#F7E3A1', '#FBF5E9', '#C8B6E6', '#F0B9C4', '#E8A39A']);
      g.globalAlpha = rr(.5, .95);
      g.beginPath();
      g.arc(fxp, fyp, rr(1.4, 3.4), 0, 6.3);
      g.fill();
    }
    g.globalAlpha = 1;

    // widen the meadow into a soft bottom edge
    var edge = g.createLinearGradient(0, H - 220, 0, H);
    edge.addColorStop(0, 'rgba(110,140,88,0)');
    edge.addColorStop(1, 'rgba(80,108,64,.45)');
    g.fillStyle = edge;
    g.fillRect(0, H - 220, W, 220);
  }

  function inPond(x, y) {
    var dx = (x - 3150) / 360;
    var dy = (y - 2520) / 180;
    return dx * dx + dy * dy < 1;
  }

  function smooth(g, pts, width, color) {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2;
      var my = (pts[i][1] + pts[i + 1][1]) / 2;
      g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    var n = pts.length - 1;
    g.quadraticCurveTo(pts[n][0], pts[n][1], pts[n][0], pts[n][1]);
    g.stroke();
  }

  /* ---------------------------------------------------------
     Effects canvas
     --------------------------------------------------------- */
  var fx, fxc, petals = [], puffs = [], ripples = [];
  function buildFx() {
    fx = document.createElement('canvas');
    fx.id = 'fx-canvas';
    fx.setAttribute('aria-hidden', 'true');
    world.appendChild(fx);
    fxc = fx.getContext('2d');
    sizeFx();
    for (var i = 0; i < 26; i++) {
      petals.push({
        x: rr(0, vw), y: rr(-vh, vh),
        r: rr(2.5, 5.5), sp: rr(12, 32), drift: rr(-14, 14),
        ph: rr(0, 6.28), rot: rr(0, 6.28), vr: rr(-.6, .6),
        c: pick(['rgba(240,185,196,.8)', 'rgba(251,245,233,.75)', 'rgba(247,227,161,.7)'])
      });
    }
  }

  function sizeFx() {
    if (!fx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = vw * dpr;
    fx.height = vh * dpr;
    fx.style.width = vw + 'px';
    fx.style.height = vh + 'px';
    fxc.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------------------------------------------------------
     Cranes
     --------------------------------------------------------- */
  var CRANE_SPOTS = [
    [700, 1760], [1450, 1190], [2680, 1180], [3560, 1860],
    [1960, 2740], [2980, 2820], [1180, 2050]
  ];
  function buildCranes() {
    CRANE_SPOTS.forEach(function (pt, i) {
      if (state.cranes.indexOf(i) !== -1) return;
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'crane';
      el.style.left = pt[0] + 'px';
      el.style.top = pt[1] + 'px';
      el.style.zIndex = Math.round(pt[1]) + 2;
      el.style.setProperty('--d', (i * .5) + 's');
      el.setAttribute('aria-label', 'A folded paper crane, number ' + (state.cranes.length + 1) + '. Pick it up.');
      el.innerHTML = ART.crane;
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var d = Math.hypot(pt[0] - p.x, pt[1] - p.y);
        if (d > 130) {
          walkTo(pt[0], pt[1] + 40);
          pendingCrane = i;
          if (AW.toast) AW.toast('Walking over to it.');
          return;
        }
        collectCrane(i, pt);
      });
      decor.appendChild(el);
      cranes.push({ i: i, el: el, x: pt[0], y: pt[1] });
    });
  }

  function collectCrane(i, pt) {
    if (state.cranes.indexOf(i) !== -1) return;
    state.cranes.push(i);
    AW.save();
    var found = cranes.filter(function (c) { return c.i === i; })[0];
    if (found) {
      found.el.classList.add('taken');
      setTimeout(function () { found.el.remove(); }, 700);
    }
    puff(pt[0], pt[1], 12, '#FBF5E9');
    if (AW.Audio) AW.Audio.pickup();
    if (AW.Panels) AW.Panels.updateCranes();
    var n = state.cranes.length;
    if (n === CRANE_SPOTS.length) {
      AW.toast('All seven paper cranes found.');
      if (AW.Audio) AW.Audio.unlock();
    } else {
      AW.toast('Paper crane ' + n + ' of 7 \u2014 ' + (CRANE_SPOTS.length - n) + ' still hiding.');
    }
  }

  /* ---------------------------------------------------------
     Movement
     --------------------------------------------------------- */
  function walkTo(x, y) {
    target = { x: Math.max(120, Math.min(W - 120, x)), y: Math.max(560, Math.min(H - 90, y)) };
    pendingSite = null;
    pendingCrane = null;
  }

  function goToStation(site) {
    if (site.locked && !state.secretUnlocked) {
      AW.toast('The gate is locked. The password is on the desk.');
      return;
    }
    var dx = p.x - site.x;
    var dy = p.y - site.y;
    var dist = Math.hypot(dx, dy);
    if (dist < 300) {
      openSite(site);
    } else {
      var a = Math.atan2(dy, dx);
      var tx = site.x + Math.cos(a) * 190;
      var ty = site.y + Math.sin(a) * 190;
      target = { x: tx, y: ty };
      pendingSite = site;
      if (AW.Audio) AW.Audio.step();
    }
  }

  function openSite(site) {
    target = null;
    pendingSite = null;
    p.moving = false;
    if (AW.Panels) AW.Panels.open(site.id);
  }

  function updateMovement(dt) {
    var ax = 0, ay = 0;
    if (keys.arrowleft || keys.a) ax -= 1;
    if (keys.arrowright || keys.d) ax += 1;
    if (keys.arrowup || keys.w) ay -= 1;
    if (keys.arrowdown || keys.s) ay += 1;
    if (stick.active) {
      ax += stick.x;
      ay += stick.y;
    }

    if (ax || ay) {
      target = null;
      pendingSite = null;
      var len = Math.hypot(ax, ay) || 1;
      ax /= len; ay /= len;
    } else if (target) {
      var dx = target.x - p.x;
      var dy = target.y - p.y;
      var d = Math.hypot(dx, dy);
      if (d < 6) {
        target = null;
        if (pendingSite) {
          var site = pendingSite;
          pendingSite = null;
          setTimeout(function () { openSite(site); }, 120);
        } else if (pendingCrane != null) {
          var ci = pendingCrane;
          pendingCrane = null;
          collectCrane(ci, CRANE_SPOTS[ci]);
        }
      } else {
        ax = dx / d; ay = dy / d;
      }
    }

    var speed = 335;
    var moving = !!(ax || ay);
    if (moving) {
      var nx = p.x + ax * speed * dt;
      var ny = p.y + ay * speed * dt;
      // resolve obstacles one axis at a time so you slide along walls
      if (!blocked(nx, p.y)) p.x = nx;
      if (!blocked(p.x, ny)) p.y = ny;
      p.x = Math.max(120, Math.min(W - 120, p.x));
      p.y = Math.max(560, Math.min(H - 90, p.y));
      if (ax > .25) p.facing = 1;
      else if (ax < -.25) p.facing = -1;
      footTimer -= dt;
      if (footTimer <= 0) {
        footTimer = .3;
        puff(p.x + rr(-8, 8), p.y, 2, 'rgba(214,205,180,.85)');
        if (AW.Audio && state.sfxOn) AW.Audio.step();
      }
    }
    p.moving = moving;
    p.speed = moving ? speed : 0;
    playerEl.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)';
    playerEl.style.zIndex = Math.round(p.y);
    playerEl.classList.toggle('facing-left', p.facing === -1);
    AW.Character.update(dt, { moving: moving, speed: speed });

    var bob = moving ? Math.sin(t * 14) * .5 : 0;
    playerEl.querySelector('.player-shadow').style.transform = 'translateX(-50%) scale(' + (moving ? 1.04 : 1) + ',' + (moving ? .92 : 1) + ')';
  }

  function blocked(x, y) {
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      var dx = (x - o.x) / (o.rx + 26);
      var dy = (y - o.y) / (o.ry + 18);
      if (dx * dx + dy * dy < 1) return true;
    }
    if (inPond(x, y + 8)) return true;
    return false;
  }

  /* ---------------------------------------------------------
     Camera + station proximity
     --------------------------------------------------------- */
  function updateCamera(dt) {
    var tx = p.x - vw / 2 + p.facing * 40;
    var ty = p.y - vh * .6;
    tx = Math.max(0, Math.min(W - vw, tx));
    ty = Math.max(0, Math.min(H - vh, ty));
    var k = 1 - Math.pow(.0016, dt);
    cam.x += (tx - cam.x) * k;
    cam.y += (ty - cam.y) * k;
    camera.style.transform = 'translate3d(' + (-cam.x).toFixed(2) + 'px,' + (-cam.y).toFixed(2) + 'px,0)';
  }

  var nearSite = null;
  function updateNear() {
    var best = null, bestD = 1e9;
    for (var i = 0; i < stations.length; i++) {
      var s = stations[i];
      if (s.el.classList.contains('is-hidden')) continue;
      var d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < bestD) { bestD = d; best = s; }
    }
    var threshold = 250;
    if (best && bestD < threshold) {
      if (nearSite !== best) {
        if (nearSite) nearSite.el.classList.remove('near');
        best.el.classList.add('near');
        nearSite = best;
        nearbyEl.hidden = false;
        nearbyEl.innerHTML = '<div class="nearby-pill"><span class="keycap">E</span>' + best.verb + ' <em>\u00b7 ' + best.label + '</em></div>';
        if (AW.Audio) AW.Audio.softTick();
      }
      nearbyEl.style.left = best.x + 'px';
      nearbyEl.style.top = (best.y - (best.artW === 170 ? 250 : 330)) + 'px';
    } else if (nearSite) {
      nearSite.el.classList.remove('near');
      nearSite = null;
      nearbyEl.hidden = true;
    }
    // the place name
    var place = document.getElementById('hud-place');
    if (place) {
      var name = 'the field';
      if (nearSite) name = nearSite.label;
      else if (p.y < 1150) name = 'the north meadow';
      else if (p.y > 2400) name = 'the south path';
      else if (p.x < 1400) name = 'the west woods';
      else if (p.x > 2900) name = 'the east rise';
      if (place.textContent !== name) place.textContent = name;
    }
  }

  /* ---------------------------------------------------------
     Minimap
     --------------------------------------------------------- */
  function buildMinimap() {
    mini = document.getElementById('minimap');
    var canvas = document.getElementById('minimap-canvas');
    if (!mini || !canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = 168, ch = 120;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    miniCtx = canvas.getContext('2d');
    miniCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var sx = cw / W, sy = ch / H;
    miniBase = document.createElement('canvas');
    miniBase.width = cw * dpr;
    miniBase.height = ch * dpr;
    var b = miniBase.getContext('2d');
    b.setTransform(dpr, 0, 0, dpr, 0, 0);

    b.fillStyle = '#A9C47E';
    b.fillRect(0, 0, cw, ch);
    var wash = b.createLinearGradient(0, 0, 0, ch);
    wash.addColorStop(0, 'rgba(255,250,220,.28)');
    wash.addColorStop(1, 'rgba(70,92,54,.22)');
    b.fillStyle = wash;
    b.fillRect(0, 0, cw, ch);

    // paths, thin
    if (pathLines) {
      b.strokeStyle = 'rgba(246,233,201,.95)';
      b.lineWidth = 2.6;
      b.lineCap = 'round';
      b.lineJoin = 'round';
      pathLines.forEach(function (pts) {
        b.beginPath();
        b.moveTo(pts[0][0] * sx, pts[0][1] * sy);
        for (var i = 1; i < pts.length - 1; i++) {
          var mx = (pts[i][0] + pts[i + 1][0]) / 2;
          var my = (pts[i][1] + pts[i + 1][1]) / 2;
          b.quadraticCurveTo(pts[i][0] * sx, pts[i][1] * sy, mx * sx, my * sy);
        }
        var n = pts.length - 1;
        b.quadraticCurveTo(pts[n][0] * sx, pts[n][1] * sy, pts[n][0] * sx, pts[n][1] * sy);
        b.stroke();
      });
    }

    // pond
    b.fillStyle = 'rgba(140,182,194,.95)';
    b.beginPath();
    b.ellipse(3150 * sx, 2520 * sy, 330 * sx, 156 * sy, 0, 0, 6.3);
    b.fill();

    // landmarks
    stations.forEach(function (st) {
      if (st.id === 'secret' && !state.secretUnlocked) return;
      b.beginPath();
      b.arc(st.x * sx, st.y * sy, 2.6, 0, 6.3);
      b.fillStyle = '#6B4B8A';
      b.fill();
      b.lineWidth = 1.4;
      b.strokeStyle = 'rgba(251,245,233,.95)';
      b.stroke();
    });

    mini.addEventListener('click', function (ev) {
      var r = canvas.getBoundingClientRect();
      var wx = ((ev.clientX - r.left) / r.width) * W;
      var wy = ((ev.clientY - r.top) / r.height) * H;
      var hit = null;
      stations.forEach(function (st) {
        if (st.id === 'secret' && !state.secretUnlocked) return;
        if (Math.hypot(st.x - wx, st.y - wy) < 150) hit = st;
      });
      if (hit) goToStation(hit);
      else walkTo(wx, wy);
    });
  }

  function drawMinimap(now) {
    if (!miniCtx || !miniBase) return;
    if (now - miniT < 90) return;
    miniT = now;
    var cw = 168, ch = 120;
    var sx = cw / W, sy = ch / H;
    miniCtx.clearRect(0, 0, cw, ch);
    miniCtx.drawImage(miniBase, 0, 0, cw, ch);

    // where you are looking
    miniCtx.strokeStyle = 'rgba(255,255,255,.75)';
    miniCtx.lineWidth = 1;
    miniCtx.strokeRect(cam.x * sx, cam.y * sy, vw * sx, vh * sy);

    // you
    miniCtx.beginPath();
    miniCtx.arc(p.x * sx, p.y * sy, 3.1, 0, 6.3);
    miniCtx.fillStyle = '#FBF5E9';
    miniCtx.fill();
    miniCtx.lineWidth = 1.8;
    miniCtx.strokeStyle = '#3F2E52';
    miniCtx.stroke();
  }

  /* ---------------------------------------------------------
     Effects
     --------------------------------------------------------- */
  function puff(x, y, n, color) {
    for (var i = 0; i < n; i++) {
      puffs.push({ x: x, y: y, vx: rr(-22, 22), vy: rr(-26, -6), life: 1, max: rr(.4, .9), r: rr(2, 5), c: color });
    }
  }

  function updateFx(dt) {
    if (!fxc) return;
    fxc.clearRect(0, 0, vw, vh);
    var still = AW.prefersReducedMotion();
    // petals in screen space
    for (var i = 0; !still && i < petals.length; i++) {
      var pt = petals[i];
      pt.y += pt.sp * dt;
      pt.x += Math.sin(t * .7 + pt.ph) * 6 * dt + pt.drift * dt;
      pt.rot += pt.vr * dt;
      if (pt.y > vh + 20) { pt.y = -20; pt.x = rr(0, vw); }
      if (pt.x < -20) pt.x = vw + 20;
      if (pt.x > vw + 20) pt.x = -20;
      fxc.save();
      fxc.translate(pt.x, pt.y);
      fxc.rotate(pt.rot);
      fxc.fillStyle = pt.c;
      fxc.beginPath();
      fxc.ellipse(0, 0, pt.r, pt.r * .55, 0, 0, 6.3);
      fxc.fill();
      fxc.restore();
    }
    // puffs in world space
    for (var j = puffs.length - 1; j >= 0; j--) {
      var q = puffs[j];
      q.life -= dt / q.max;
      if (q.life <= 0) { puffs.splice(j, 1); continue; }
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 18 * dt;
      fxc.globalAlpha = q.life * .8;
      fxc.fillStyle = q.c;
      fxc.beginPath();
      fxc.arc(q.x - cam.x, q.y - cam.y, q.r * (1.4 - q.life * .4), 0, 6.3);
      fxc.fill();
    }
    fxc.globalAlpha = 1;
    // ripples
    for (var k = ripples.length - 1; k >= 0; k--) {
      var rp = ripples[k];
      rp.life -= dt / .9;
      if (rp.life <= 0) { ripples.splice(k, 1); continue; }
      fxc.strokeStyle = 'rgba(255,255,255,' + (rp.life * .5) + ')';
      fxc.lineWidth = 1.5;
      fxc.beginPath();
      fxc.arc(rp.x - cam.x, rp.y - cam.y, (1 - rp.life) * 34 + 6, 0, 6.3);
      fxc.stroke();
    }
    // butterflies
    for (var b = 0; !still && b < butterflies.length; b++) {
      var bf = butterflies[b];
      var nx = bf.bx + Math.sin(t * bf.sp + bf.ph) * bf.amp;
      var ny = bf.by + Math.cos(t * bf.sp * .8 + bf.ph) * bf.amp * .5;
      bf.el.style.transform = 'translate(' + (nx - bf.bx) + 'px,' + (ny - bf.by) + 'px)';
    }
  }

  /* ---------------------------------------------------------
     Main loop
     --------------------------------------------------------- */
  function loop(now) {
    if (!entered || paused) return;
    var dt = Math.min(.05, (now - last) / 1000) || 0;
    last = now;
    t += dt;
    if (!AW.state.panelOpen) updateMovement(dt);
    updateCamera(dt);
    updateNear();
    updateFx(dt);
    drawMinimap(now);
    requestAnimationFrame(loop);
  }

  /* ---------------------------------------------------------
     Input
     --------------------------------------------------------- */
  var stick = { active: false, x: 0, y: 0 };

  function bindInput() {
    document.addEventListener('keydown', function (e) {
      if (!entered) return;
      if (AW.state.panelOpen || AW.state.settingsOpen) return;
      var k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) !== -1) e.preventDefault();
      if (k === 'e') {
        if (nearSite) { e.preventDefault(); openSite(nearSite); }
        return;
      }
      if (k === 'j' && AW.Panels) { AW.Panels.open('journal'); return; }
      if (k === 'g' && AW.Panels) { AW.Panels.open('guide'); return; }
      if (k === 'm' && AW.Audio) { AW.Audio.toggleMusic(); return; }
      keys[k] = true;
      if (k.indexOf('arrow') === 0) keys[k] = true;
    });
    document.addEventListener('keyup', function (e) {
      keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener('blur', function () { keys = Object.create(null); });

    // click-to-walk
    world.addEventListener('pointerdown', function (e) {
      if (!entered) return;
      if (e.target.closest('.world-hud, .touch-stick, .site, .panel-layer, .crane, .minimap')) return;
      if (AW.state.panelOpen || e.button === 2) return;
      var rect = world.getBoundingClientRect();
      var sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      var wx = sx + cam.x, wy = sy + cam.y;
      walkTo(wx, wy);
      ripples.push({ x: wx, y: wy, life: 1 });
      if (AW.Audio && state.sfxOn) AW.Audio.step();
    });

    // touch joystick
    var ts = document.getElementById('touch-stick');
    var knob = ts.querySelector('.stick-knob');
    if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
      ts.hidden = false;
      var dragging = false;
      var cx0 = 0, cy0 = 0;
      function start(e) {
        dragging = true;
        var r = ts.getBoundingClientRect();
        cx0 = r.left + r.width / 2;
        cy0 = r.top + r.height / 2;
        move(e);
      }
      function move(e) {
        if (!dragging) return;
        e.preventDefault();
        var t0 = e.touches ? e.touches[0] : e;
        var dx = t0.clientX - cx0, dy = t0.clientY - cy0;
        var d = Math.hypot(dx, dy);
        var max = 46;
        if (d > max) { dx *= max / d; dy *= max / d; d = max; }
        knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        stick.x = dx / max;
        stick.y = dy / max;
        stick.active = d > 6;
      }
      function end() {
        dragging = false;
        stick.active = false;
        stick.x = 0; stick.y = 0;
        knob.style.transform = '';
      }
      ts.addEventListener('pointerdown', start);
      ts.addEventListener('pointermove', move);
      ts.addEventListener('pointerup', end);
      ts.addEventListener('pointercancel', end);
    }
  }

  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    sizeFx();
    cam.x = Math.max(0, Math.min(W - vw, p.x - vw / 2));
    cam.y = Math.max(0, Math.min(H - vh, p.y - vh * .6));
    camera.style.transform = 'translate3d(' + (-cam.x) + 'px,' + (-cam.y) + 'px,0)';
  }

  /* ---------------------------------------------------------
     Public
     --------------------------------------------------------- */
  var AWWorld = {
    enter: function () {
      if (entered) return;
      entered = true;
      build();
      world.hidden = false;
      resize();
      requestAnimationFrame(function () {
        world.classList.add('on');
        playerEl.classList.add('dropping');
        setTimeout(function () { playerEl.classList.remove('dropping'); }, 900);
        puff(p.x, p.y, 16, 'rgba(220,210,182,.9)');
        last = performance.now();
        paused = false;
        requestAnimationFrame(loop);
        if (AW.Audio && state.musicOn) AW.Audio.startMusic();
        setTimeout(function () {
          if (AW.Panels) AW.Panels.open('about');
        }, 1500);
      });
    },
    openSite: openSite,
    goToStation: goToStation,
    goToSite: function (id) {
      var st = stations.filter(function (s) { return s.id === id; })[0];
      if (st) goToStation(st);
    },
    hasEntered: function () { return entered; },
    show: function () {
      if (!world) return;
      world.hidden = false;
      world.classList.add('on');
      paused = false;
      last = performance.now();
      requestAnimationFrame(loop);
      if (AW.Audio && state.musicOn) AW.Audio.resumeMusic();
    },
    hide: function () {
      paused = true;
      if (world) world.classList.remove('on');
    },
    unlockGate: function () {
      var g = stations.filter(function (s) { return s.id === 'secret'; })[0];
      if (g) {
        g.locked = false;
        g.el.classList.remove('is-hidden');
        puff(g.x, g.y - 20, 22, 'rgba(255,240,200,.95)');
      }
    },
    setNight: function (on) {
      if (world) world.classList.toggle('night', on);
      state.night = on;
      AW.save();
      },
    isNight: function () { return !!state.night; },
    jump: function (x, y) {
      p.x = x; p.y = y; target = null; pendingSite = null;
      cam.x = Math.max(0, Math.min(W - vw, x - vw / 2));
      cam.y = Math.max(0, Math.min(H - vh, y - vh * .6));
    }
  };
  AW.World = AWWorld;

  function build() {
    if (built) return;
    built = true;
    world = document.getElementById('world');
    camera = document.getElementById('camera');
    groundWrap = document.getElementById('ground');
    decor = document.getElementById('decor');
    sitesWrap = document.getElementById('sites');
    playerEl = document.getElementById('player');
    nearbyEl = document.getElementById('nearby');

    paintGround();
    buildStations();
    buildScenery();
    buildCranes();
    buildFx();
    playerEl.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)';
    AW.Character.init(document.getElementById('player-svg'));
    bindInput();
    window.addEventListener('resize', resize);
    if (state.night) world.classList.add('night');
    if (state.secretUnlocked) {
      var g = stations.filter(function (s) { return s.id === 'secret'; })[0];
      if (g) g.el.classList.remove('is-hidden');
    }
    buildMinimap();
    // initial camera
    vw = window.innerWidth; vh = window.innerHeight;
    cam.x = Math.max(0, Math.min(W - vw, p.x - vw / 2));
    cam.y = Math.max(0, Math.min(H - vh, p.y - vh * .6));
    camera.style.transform = 'translate3d(' + (-cam.x) + 'px,' + (-cam.y) + 'px,0)';
  }
})();
