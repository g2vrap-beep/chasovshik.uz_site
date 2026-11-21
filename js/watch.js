/* CHASOVSHIK.UZ — hero: часы собираются при скролле и показывают время Ташкента.
   Система координат деталей: SVG 300×480, ось стрелок — (150, 240). */
(function () {
  'use strict';

  var A = 'assets/watch/';
  var CX = 150, CY = 240;
  var NS = 'http://www.w3.org/2000/svg';

  /* Слои (координаты из проекта ASRLUX, Submariner 41 · сталь, чёрный) */
  var L = {
    strap:  { f: 'strap_oyster.avif',  x: 100.61, y: 221.63, w: 99.21,  h: 245.77 },
    caseL:  { f: 'case.avif',          x: 52.68,  y: 131.63, w: 213.58, h: 225.08 },
    dial:   { f: 'dial_black.avif',    x: 74.0,   y: 163.33, w: 152.18, h: 153.45 },
    date:   { x: 201.24, y: 240.36, w: 16.82, h: 10.8 },
    cyc:    { f: 'cyclops.avif',       x: 185.09, y: 228.25, w: 32.3,   h: 24.23 },
    bezel:  { f: 'bezel_black.avif',   x: 52.12,  y: 141.78, w: 196.0,  h: 198.18 },
    hh:     { f: 'hand-hour.avif',     x: 141.53, y: 195.24, w: 16.88,  h: 51.75 },
    mh:     { f: 'hand-minute.avif',   x: 143.49, y: 170.0,  w: 13.25,  h: 76.5 },
    sh:     { f: 'hand-second.avif',   x: 145.19, y: 170.57, w: 9.75,   h: 88.5 }
  };
  /* Рехаут (кольцо между циферблатом и безелем): циферблат и стрелки уменьшены в K раз */
  var RG = { k: .89, r1: 79, rb: 76.6 };
  var STEEL = '#c3c7cd';
  var STRAP_OFF = 90;

  /* Разлёт деталей: dx, dy (ед. SVG), поворот, масштаб, окно сборки [start, end] по прогрессу */
  var PARTS = [
    { id: 'strapT', dx: -40,  dy: -250, r: -16, s: 0.06, t: [0.02, 0.20] },
    { id: 'strapB', dx: 90,   dy: 250,  r: 12,  s: 0.06, t: [0.04, 0.22] },
    { id: 'case',   dx: -170, dy: 190,  r: -20, s: 0.10, t: [0.12, 0.32] },
    { id: 'dial',   dx: 240,  dy: -120,  r: 28,  s: 0.12, t: [0.24, 0.42] },
    { id: 'bezel',  dx: 230,  dy: 200,  r: -34, s: 0.10, t: [0.34, 0.52] },
    { id: 'hh',     dx: -150, dy: -200, r: 50,  s: 0.25, t: [0.44, 0.60] },
    { id: 'mh',     dx: -90,  dy: -260, r: -40, s: 0.25, t: [0.47, 0.63] },
    { id: 'sh',     dx: -200, dy: -100,  r: 70,  s: 0.25, t: [0.50, 0.66] },
    { id: 'glass',  dx: 110,  dy: -250, r: 18,  s: 0.20, t: [0.58, 0.72] }
  ];
  /* Какая подпись активна: индекс в window.STAGES и окно */
  var STAGE_T = [0.02, 0.12, 0.24, 0.34, 0.44, 0.58];
  var DONE_AT = 0.74, EXIT_AT = 0.88;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function img(l, parent, extra) {
    var a = { href: A + l.f, x: l.x, y: l.y, width: l.w, height: l.h };
    if (extra) for (var k in extra) a[k] = extra[k];
    return el('image', a, parent);
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var section = document.getElementById('assemble');
  var svg = document.getElementById('watch');
  if (!section || !svg) return;

  /* ---------- построение SVG ---------- */
  var defs = el('defs', {}, svg);
  var lg = el('linearGradient', { id: 'strapFade', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 250, x2: 0, y2: 466 }, defs);
  el('stop', { offset: 0, 'stop-color': '#fff' }, lg);
  el('stop', { offset: 0.3, 'stop-color': '#fff' }, lg);
  el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, lg);
  var mask = el('mask', { id: 'strapMask', maskUnits: 'userSpaceOnUse', x: 90, y: 200, width: 120, height: 300 }, defs);
  el('rect', { x: 90, y: 200, width: 120, height: 300, fill: 'url(#strapFade)' }, mask);

  var rg = el('radialGradient', { id: 'shadowG' }, defs);
  el('stop', { offset: 0, 'stop-color': '#000', 'stop-opacity': .55 }, rg);
  el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': 0 }, rg);

  var glow = el('radialGradient', { id: 'glowG' }, defs);
  el('stop', { offset: 0, 'stop-color': '#a94e2b', 'stop-opacity': .28 }, glow);
  el('stop', { offset: 1, 'stop-color': '#a94e2b', 'stop-opacity': 0 }, glow);

  var glare = el('linearGradient', { id: 'glareG', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': .16 }, glare);
  el('stop', { offset: .45, 'stop-color': '#fff', 'stop-opacity': 0 }, glare);

  var root = el('g', { id: 'w-root' }, svg);
  var glowEl = el('circle', { cx: CX, cy: CY, r: 260, fill: 'url(#glowG)' }, root);
  var shadow = el('ellipse', { cx: CX + 14, cy: CY + 30, rx: 150, ry: 150, fill: 'url(#shadowG)' }, root);

  var G = {};
  function part(id) { G[id] = el('g', { 'class': 'w-part' }, root); return G[id]; }

  var sT = el('g', { transform: 'translate(0 ' + (480 - STRAP_OFF) + ') scale(1 -1)' }, part('strapT'));
  img(L.strap, sT, { mask: 'url(#strapMask)' });
  var sB = el('g', { transform: 'translate(0 ' + STRAP_OFF + ')' }, part('strapB'));
  img(L.strap, sB, { mask: 'url(#strapMask)' });

  var cg = part('case');
  img(L.caseL, cg);
  (function rehaut() {
    var dcx = L.dial.x + L.dial.w / 2, dcy = L.dial.y + L.dial.h / 2;
    var rd = L.dial.w / 2 * RG.k, r0 = rd - 1.5, r1 = RG.r1, mid = (r0 + r1) / 2, ro = RG.rb - 1.7;
    function mix(h, t) {
      return '#' + [1, 3, 5].map(function (i) {
        var v = parseInt(h.substr(i, 2), 16);
        return Math.round(t < 0 ? v * (1 + t) : v + (255 - v) * t).toString(16).padStart(2, '0');
      }).join('');
    }
    var la = el('linearGradient', { id: 'rgA', gradientUnits: 'userSpaceOnUse', x1: dcx - r1, y1: dcy - r1, x2: dcx + r1, y2: dcy + r1 }, defs);
    [[0, mix(STEEL, -.3)], [.3, mix(STEEL, -.12)], [.5, STEEL], [.72, mix(STEEL, .45)], [1, mix(STEEL, -.12)]]
      .forEach(function (a) { el('stop', { offset: a[0], 'stop-color': a[1] }, la); });
    var lc = el('linearGradient', { id: 'rgC', gradientUnits: 'userSpaceOnUse', x1: dcx - r1, y1: dcy - r1, x2: dcx + r1, y2: dcy + r1 }, defs);
    [[0, '#7d8189'], [.5, '#c9ccd2'], [1, '#f0f1f4']].forEach(function (a) { el('stop', { offset: a[0], 'stop-color': a[1] }, lc); });
    var rb = el('radialGradient', { id: 'rgB', gradientUnits: 'userSpaceOnUse', cx: dcx, cy: dcy, r: r1 }, defs);
    [[(rd - .5) / r1, .4], [(rd + 3.5) / r1, 0], [(RG.rb - 2.4) / r1, 0], [RG.rb / r1, .35], [1, .35]]
      .forEach(function (a) { el('stop', { offset: a[0], 'stop-color': '#000', 'stop-opacity': a[1] }, rb); });
    el('circle', { cx: dcx, cy: dcy, r: mid, fill: 'none', stroke: 'url(#rgA)', 'stroke-width': r1 - r0 }, cg);
    el('circle', { cx: dcx, cy: dcy, r: r1, fill: 'url(#rgB)' }, cg);
    el('circle', { cx: dcx, cy: dcy, r: ro + .8, fill: 'none', stroke: 'url(#rgC)', 'stroke-opacity': .7, 'stroke-width': 1.6 }, cg);
    el('circle', { cx: dcx, cy: dcy, r: rd + .2, fill: 'none', stroke: '#000', 'stroke-opacity': .55, 'stroke-width': .5 }, cg);
    L.dcx = dcx; L.dcy = dcy;
  })();

  var dg = el('g', { transform: 'translate(' + L.dcx + ' ' + L.dcy + ') scale(' + RG.k + ') translate(' + (-L.dcx) + ' ' + (-L.dcy) + ')' }, part('dial'));
  var d = L.date;
  el('rect', { x: d.x - d.w / 2 - 1, y: d.y - d.h / 2 - 1, width: d.w + 2, height: d.h + 2, fill: '#f4f1ea' }, dg);
  img(L.dial, dg);
  var dateText = el('text', {
    x: d.x, y: d.y + 0.4, 'font-size': d.h * .82, 'text-anchor': 'middle', 'dominant-baseline': 'central',
    'font-family': 'Arial, Helvetica, sans-serif', 'font-weight': 700, fill: '#111'
  }, dg);
  var brand = el('text', {
    x: CX, y: 205, 'font-size': 7.2, 'text-anchor': 'middle', 'letter-spacing': 1.1,
    'font-family': 'Forum, Georgia, serif', fill: '#eef2ef'
  }, dg);
  brand.textContent = 'CHASOVSHIK';
  var sub = el('text', {
    x: CX, y: 213, 'font-size': 3.2, 'text-anchor': 'middle', 'letter-spacing': .9,
    'font-family': 'Golos Text, Arial, sans-serif', fill: '#cfd8d3', opacity: .85
  }, dg);
  sub.textContent = 'TASHKENT';
  var tag = el('text', {
    x: CX, y: 270, 'font-size': 3.4, 'text-anchor': 'middle', 'letter-spacing': .8,
    'font-family': 'Golos Text, Arial, sans-serif', fill: '#e4ebe7', opacity: .9
  }, dg);
  tag.textContent = 'ВРЕМЯ БЕСЦЕННО';

  img(L.bezel, part('bezel'));

  var HS = 'translate(' + CX + ' ' + CY + ') scale(' + RG.k + ') translate(' + (-CX) + ' ' + (-CY) + ')';

  var rotH = el('g', {}, el('g', { transform: HS }, part('hh'))); img(L.hh, rotH);
  var rotM = el('g', {}, el('g', { transform: HS }, part('mh'))); img(L.mh, rotM);
  var rotS = el('g', {}, el('g', { transform: HS }, part('sh'))); img(L.sh, rotS);

  var gl = part('glass');
  img(L.cyc, el('g', { transform: 'translate(' + L.dcx + ' ' + L.dcy + ') scale(' + RG.k + ') translate(' + (-L.dcx) + ' ' + (-L.dcy) + ')' }, gl));
  el('circle', { cx: CX, cy: CY, r: 76.6, fill: 'url(#glareG)' }, gl);
  el('circle', { cx: CX, cy: CY, r: 76.6, fill: 'none', stroke: '#fff', 'stroke-opacity': .10, 'stroke-width': .6 }, gl);

  /* ---------- время Ташкента (UTC+5, без перевода часов) ---------- */
  function tashkent() {
    var t = new Date(Date.now() + 5 * 3600e3);
    return {
      h: t.getUTCHours(), m: t.getUTCMinutes(), s: t.getUTCSeconds(), ms: t.getUTCMilliseconds(), day: t.getUTCDate()
    };
  }
  var lastDay = -1, lastMin = -1;
  var clockOut = document.getElementById('tk-time');
  function setHands() {
    var t = tashkent();
    var sec = t.s + Math.floor(t.ms / 125) / 8;          // 8 полушагов в секунду — плавный ход механики
    var min = t.m + sec / 60;
    var hr = (t.h % 12) + min / 60;
    rotS.setAttribute('transform', 'rotate(' + (sec * 6).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    rotM.setAttribute('transform', 'rotate(' + (min * 6).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    rotH.setAttribute('transform', 'rotate(' + (hr * 30).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    if (t.day !== lastDay) { dateText.textContent = t.day; lastDay = t.day; }
    if (clockOut && t.m !== lastMin) {
      clockOut.textContent = (t.h < 10 ? '0' : '') + t.h + ':' + (t.m < 10 ? '0' : '') + t.m;
      lastMin = t.m;
    }
  }

  /* ---------- раскладка viewBox под экран ---------- */
  var vw, vh, mobile, spread;
  function layout() {
    vw = window.innerWidth; vh = window.innerHeight;
    mobile = vw < 820;
    var Hu = mobile ? 900 : 640;                 // сколько единиц SVG по высоте экрана
    var k = Hu / vh;
    var cxPx = mobile ? vw * .5 : vw * .66;
    var cyPx = mobile ? vh * .60 : vh * .5;
    var x0 = CX - cxPx * k, y0 = CY - cyPx * k;
    svg.setAttribute('viewBox', x0.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + (vw * k).toFixed(1) + ' ' + Hu);
    spread = mobile ? .62 : 1;
    section.__Hu = Hu;
  }

  /* ---------- прогресс скролла ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intro = document.querySelector('.hero-intro');
  var stagesBox = document.querySelector('.hero-stages');
  var done = document.querySelector('.hero-done');
  var hint = document.querySelector('.hero-hint');
  var mCap = document.querySelector('.hero-mcap');

  function progress() {
    if (reduce) return 0.8;
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - vh;
    return clamp(-r.top / total, 0, 1);
  }

  var lastStage = -2;
  function render(now) {
    var p = progress();
    var float = reduce ? 0 : now / 1000;

    for (var i = 0; i < PARTS.length; i++) {
      var c = PARTS[i];
      var lp = clamp((p - c.t[0]) / (c.t[1] - c.t[0]), 0, 1);
      var e = 1 - easeOut(lp);                                   // 1 — разобрано, 0 — на месте
      var fx = Math.sin(float * .7 + i * 1.7) * 5 * e;           // лёгкое парение пока деталь в воздухе
      var fy = Math.cos(float * .6 + i * 2.3) * 6 * e;
      var tx = c.dx * spread * e + fx, ty = c.dy * spread * e + fy;
      var sc = 1 + c.s * e;
      G[c.id].setAttribute('transform',
        'translate(' + tx.toFixed(2) + ' ' + ty.toFixed(2) + ') rotate(' + (c.r * e).toFixed(2) + ' ' + CX + ' ' + CY +
        ') translate(' + CX + ' ' + CY + ') scale(' + sc.toFixed(4) + ') translate(' + (-CX) + ' ' + (-CY) + ')');
      G[c.id].style.opacity = (c.id === 'glass' ? (1 - e) : (0.55 + 0.45 * (1 - e))).toFixed(3);
    }

    var assembled = clamp((p - 0.6) / 0.14, 0, 1);
    shadow.style.opacity = (.25 + .75 * assembled).toFixed(3);
    glowEl.style.opacity = (.5 + .5 * assembled).toFixed(3);

    /* уход вниз */
    var ex = easeInOut(clamp((p - EXIT_AT) / (1 - EXIT_AT), 0, 1));
    var Hu = section.__Hu || 640;
    root.setAttribute('transform', 'translate(0 ' + (ex * Hu * .42).toFixed(1) + ') translate(' + CX + ' ' + CY + ') scale(' + (1 - ex * .18).toFixed(4) + ') translate(' + (-CX) + ' ' + (-CY) + ')');
    svg.style.opacity = (1 - ex * .6).toFixed(3);

    /* тексты */
    if (reduce) { setHands(); requestAnimationFrame(render); return; }
    if (intro) {
      var io = clamp(1 - (p - 0.015) / 0.05, 0, 1);
      intro.style.opacity = io.toFixed(3);
      intro.style.transform = 'translateY(' + (-(1 - io) * 24).toFixed(1) + 'px)';
      intro.style.visibility = io < .01 ? 'hidden' : 'visible';
    }
    if (hint) hint.style.opacity = clamp(1 - p / 0.03, 0, 1).toFixed(3);

    var stage = -1;
    for (var j = 0; j < STAGE_T.length; j++) if (p >= STAGE_T[j]) stage = j;
    if (p >= DONE_AT) stage = 99;
    if (p < 0.035) stage = -1;
    if (stage !== lastStage) {
      lastStage = stage;
      var stageItems = stagesBox ? stagesBox.querySelectorAll('li') : [];
      for (var q = 0; q < stageItems.length; q++) {
        stageItems[q].classList.toggle('is-active', q === stage);
        stageItems[q].classList.toggle('is-past', stage === 99 || q < stage);
      }
      if (mCap && window.STAGES) {
        var st = window.STAGES[stage];
        mCap.innerHTML = st ? '<b>' + st.service + '</b><span>' + window.priceOf(st.price) + '</span>' : '';
        mCap.classList.toggle('is-on', !!st);
      }
    }
    if (stagesBox) {
      var so = clamp((p - 0.03) / 0.04, 0, 1) * clamp(1 - (p - DONE_AT + 0.02) / 0.03, 0, 1);
      stagesBox.style.opacity = so.toFixed(3);
      stagesBox.style.visibility = so < .01 ? 'hidden' : 'visible';
    }
    if (done) {
      var dn = clamp((p - DONE_AT) / 0.04, 0, 1) * clamp(1 - (p - EXIT_AT) / 0.05, 0, 1);
      done.style.opacity = dn.toFixed(3);
      done.style.transform = 'translateY(' + ((1 - dn) * 16).toFixed(1) + 'px)';
      done.style.visibility = dn < .01 ? 'hidden' : 'visible';
    }

    setHands();
    requestAnimationFrame(render);
  }

  layout();
  window.addEventListener('resize', layout);
  requestAnimationFrame(render);
})();
