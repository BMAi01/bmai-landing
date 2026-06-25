/* ============================================================================
   O FIO — guide-thread that emanates from the hero 3D star, stays INVISIBLE
   inside the hero (revealed as it exits), carries the BMAi symbol on its tip,
   descends on scroll and TERMINATES on the team video (#teamVideoStage).
   In the #metodo section it moves slower/smoother (that area glitches because
   ScrollTrigger fires 'refresh' mid-scroll).

   Fully self-contained: own <style> + <svg>, defensive rebuilds, all wrapped
   in try/catch so it can never throw into the page. Honors
   prefers-reduced-motion. 2026-06-25.
   ========================================================================== */
(function () {
  'use strict';
  if (typeof document === 'undefined' || !document.body) return;

  var NS = 'http://www.w3.org/2000/svg';
  var ACCENT = '#db5500', ACCENT_HOT = '#ff7a1a';
  var REDUCE = false;
  try { REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function el(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // Catmull-Rom -> cubic bezier. Control points are X-clamped to [minX,maxX] so
  // the serpentine swings never overshoot off-screen (Bézier stays in its hull).
  function smooth(pts, minX, maxX) {
    if (pts.length < 2) return '';
    var lo = (minX == null) ? -1e9 : minX, hi = (maxX == null) ? 1e9 : maxX;
    var d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = clamp(p1.x + (p2.x - p0.x) / 6, lo, hi), c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = clamp(p2.x - (p3.x - p1.x) / 6, lo, hi), c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' +
                   c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' +
                   p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }

  // ---- style ---------------------------------------------------------------
  var style = document.createElement('style');
  style.textContent =
    // z-index 0 → BEHIND the sections (which are z-index:1). Shows through the
    // transparent sections (manifesto/quem-somos/cases/para-quem) and is naturally
    // hidden behind the opaque ones (hero/form/contato). The mask also blanks the
    // #metodo band so the thread "disappears" there and re-enters at cases.
    '#fioOverlay{position:absolute;top:0;left:0;width:100%;height:0;z-index:70;' +
      'pointer-events:none;overflow:visible;contain:layout style;}' +
    '#fioOverlay .fio-line{filter:drop-shadow(0 0 6px rgba(219,85,0,.5));}' +
    '#fioOverlay .fio-head{filter:drop-shadow(0 0 14px rgba(219,85,0,.75));}' +
    '@media (max-width:1024px){#fioOverlay{opacity:.55;}' +
      '#fioOverlay .fio-line{stroke-width:1.6px;filter:drop-shadow(0 0 4px rgba(219,85,0,.45));}}' +
    '@media print{#fioOverlay{display:none!important;}}';
  document.head.appendChild(style);

  // ---- svg scaffold --------------------------------------------------------
  var svg = el('svg', { id: 'fioOverlay', 'aria-hidden': 'true', preserveAspectRatio: 'none' });
  svg.innerHTML =
    '<defs>' +
      '<linearGradient id="fioGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">' +
        '<stop offset="0" stop-color="' + ACCENT_HOT + '"/>' +
        '<stop offset="0.5" stop-color="' + ACCENT + '"/>' +
        '<stop offset="1" stop-color="' + ACCENT_HOT + '"/></linearGradient>' +
      // vertical reveal mask: stops built in build() to BLACK-out (hide) the hero
      // band and the #metodo band, WHITE (show) elsewhere. userSpaceOnUse over docH.
      '<linearGradient id="fioReveal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1"></linearGradient>' +
      '<mask id="fioMask" maskUnits="userSpaceOnUse"><rect id="fioMaskRect" fill="url(#fioReveal)"/></mask>' +
    '</defs>';

  var wrap = el('g', { mask: 'url(#fioMask)' });        // everything inside is hero-masked

  // only the drawn portion is ever shown — no ghost/preview of the path ahead
  var fio   = el('path', { fill: 'none', stroke: 'url(#fioGrad)', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  fio.setAttribute('class', 'fio-line');

  // head = just the BMAi symbol riding the tip (no rings/dots)
  var head    = el('g', {}); head.setAttribute('class', 'fio-head');
  var headDot  = el('circle', { r: 4, fill: ACCENT_HOT });        // fallback only until symbol loads
  var headSym  = el('path', { fill: ACCENT, 'fill-rule': 'evenodd' });
  headSym.style.display = 'none';
  head.appendChild(headDot); head.appendChild(headSym);

  wrap.appendChild(fio); wrap.appendChild(head);
  svg.appendChild(wrap);
  document.body.appendChild(svg);

  // load the BMAi symbol path for the tip (same source as the hero 3D art)
  try {
    fetch('assets/images/simbolo-laranja.svg').then(function (r) { return r.text(); }).then(function (txt) {
      var m = txt.match(/\sd="([^"]+)"/);
      if (!m) return;
      headSym.setAttribute('d', m[1]); headSym.style.display = ''; headDot.style.display = 'none';
      // centre on the symbol's REAL bbox (it isn't perfectly 400,400) so it sits
      // exactly on the tip — no orbit/offset.
      try {
        var bb = headSym.getBBox(), s = 30 / Math.max(bb.width, bb.height);
        var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
        headSym.setAttribute('transform', 'scale(' + s.toFixed(5) + ') translate(' + (-cx).toFixed(1) + ' ' + (-cy).toFixed(1) + ')');
      } catch (e2) {}
    }).catch(function () {});
  } catch (e) {}

  // ---- state ---------------------------------------------------------------
  // path stops at the team video; sections AFTER the video are intentionally excluded.
  // SIDES is explicit (not alternating): the tall #metodo MUST share its side with
  // its neighbours so the thread runs STRAIGHT down through it — any weave inside the
  // tall sticky section reads as the thread darting side-to-side. Weave lives at the
  // top (manifesto↔quem-somos) and bottom (cases→video) instead.
  var SECTIONS = ['.manifesto', '#quem-somos', '#metodo', '#cases'];
  var SIDES    = ['left',       'right',       'right',    'right'];
  var len = 0, raf = null, t0 = 0, ySamp = [], lenSamp = [];
  var built = false, lastVW = -1, lastDocH = -1;
  var TIP_VH = 0.6;   // tip rides at 60% of the viewport → draw follows the scroll

  // ---- build the path geometry --------------------------------------------
  function build(force) {
    try {
      var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight,
                          document.documentElement.offsetHeight);
      var vw = document.documentElement.clientWidth || window.innerWidth;
      if (vw < 2 || docH < 2) return;

      // Skip redundant rebuilds (ScrollTrigger 'refresh' fires repeatedly during
      // #metodo with invalidateOnRefresh:true → rebuilding mid-scroll = the glitch).
      if (!force && built && vw === lastVW && Math.abs(docH - lastDocH) < 2) { render(); return; }
      lastVW = vw; lastDocH = docH; built = true;

      svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + docH);
      svg.style.height = docH + 'px';

      var sy = window.scrollY || document.documentElement.scrollTop || 0;

      // reading-column geometry (mirrors .container max-width 1200, pad 40)
      var contentHalf = Math.min(600, vw / 2 - 24);
      var midX = vw / 2;
      var colL = midX - contentHalf, colR = midX + contentHalf;
      var margin = vw >= 1025 ? 26 : 12;
      // serpentine lanes: one in each side gutter (just outside the text column)
      var leftLaneX  = clamp((margin + colL) / 2, margin, colL - 2);
      var rightLaneX = clamp((colR + (vw - margin)) / 2, colR + 2, vw - margin);
      function laneFor(side) { return side === 'left' ? leftLaneX : side === 'right' ? rightLaneX : midX; }

      // origin anchored to the hero 3D star (kept, but hidden by the hero mask)
      var hero = document.getElementById('hero');
      var heroBottom = 0;
      var start = { x: rightLaneX, y: 0 };
      if (hero) {
        var hr = hero.getBoundingClientRect();
        heroBottom = hr.top + sy + hr.height;
        start = { x: clamp(hr.left + hr.width * 0.72, midX, vw - margin), y: hr.top + sy + hr.height * 0.46 };
      }

      // #metodo band — hidden by the mask so the thread "disappears" there and
      // re-enters at cases (right). #metodo may be absent in some renders → skip.
      // #metodo is hidden at RUNTIME (see render → overlay opacity) because its
      // sticky/scrub geometry can't be captured here. Mask only handles the hero.
      var mTop = 0, mBot = 0;

      // Reveal mask: WHITE = visible, BLACK = hidden. Black-out the hero band and
      // the #metodo band, white elsewhere (smooth fades). userSpaceOnUse over docH.
      var maskRect = svg.querySelector('#fioMaskRect');
      var reveal = svg.querySelector('#fioReveal');
      var mask = svg.querySelector('#fioMask');
      if (maskRect && reveal && mask) {
        mask.setAttribute('x', 0); mask.setAttribute('y', 0);
        mask.setAttribute('width', vw); mask.setAttribute('height', docH);
        maskRect.setAttribute('x', 0); maskRect.setAttribute('y', 0);
        maskRect.setAttribute('width', vw); maskRect.setAttribute('height', docH);
        reveal.setAttribute('x1', 0); reveal.setAttribute('y1', 0);
        reveal.setAttribute('x2', 0); reveal.setAttribute('y2', docH);
        var F = 70, stops = [[0, '#000']];
        stops.push([Math.max(1, heroBottom - 90), '#000']);
        stops.push([heroBottom + 30, '#fff']);
        if (mBot > mTop) {
          stops.push([mTop - 12, '#fff']);
          stops.push([mTop + F, '#000']);
          stops.push([mBot - F, '#000']);
          stops.push([mBot + F, '#fff']);
        }
        stops.push([docH, '#fff']);
        // sort + strictly-increasing offsets, then rebuild <stop> children
        stops.sort(function (a, b) { return a[0] - b[0]; });
        while (reveal.firstChild) reveal.removeChild(reveal.firstChild);
        var prevOff = -1;
        for (var si = 0; si < stops.length; si++) {
          var off = clamp(stops[si][0] / docH, 0, 1);
          if (off <= prevOff) off = Math.min(1, prevOff + 0.0001);
          prevOff = off;
          var st = el('stop', {}); st.setAttribute('offset', off.toFixed(5)); st.setAttribute('stop-color', stops[si][1]);
          reveal.appendChild(st);
        }
      }

      // Gentle serpentine: ONE anchor per section, alternating sides at the
      // section centre. The horizontal swing is spread across the whole gap
      // between section centres → smooth wave, no sharp boundary S-curves.
      var pts = [start];
      for (var i = 0; i < SECTIONS.length; i++) {
        var s = document.querySelector(SECTIONS[i]);
        if (!s) continue;
        var r = s.getBoundingClientRect();
        if (r.height < 2) continue;
        var cy = r.top + sy + r.height / 2;
        pts.push({ x: laneFor(SIDES[i] || 'right'), y: cy });
      }

      // terminus: stop ABOVE the team video — nothing ever draws on it.
      var stage = document.getElementById('teamVideoStage');
      if (stage) {
        var vr = stage.getBoundingClientRect();
        pts.push({ x: midX, y: vr.top + sy - 56 });
      } else {
        pts.push({ x: midX, y: docH - 8 });
      }

      var d = smooth(pts, margin, vw - margin);
      fio.setAttribute('d', d);
      len = fio.getTotalLength();
      fio.style.strokeDasharray = len;

      // doc-Y → arc-length map, so the draw tracks SCROLL position (not arc length).
      // Forced monotonic in y (gentle horizontal swings never go backwards anyway).
      ySamp = []; lenSamp = [];
      var SAMP = 240, prevY = -1e9;
      for (var k = 0; k <= SAMP; k++) {
        var ll = len * k / SAMP, pp = fio.getPointAtLength(ll), yy = pp.y;
        if (yy < prevY) yy = prevY; prevY = yy;
        ySamp.push(yy); lenSamp.push(ll);
      }

      render();
    } catch (e) { /* never throw into the page */ }
  }

  // length where the path reaches a given document-Y (binary search on the map)
  function lenAtY(y) {
    var n = ySamp.length;
    if (!n) return 0;
    if (y <= ySamp[0]) return 0;
    if (y >= ySamp[n - 1]) return len;
    var lo = 0, hi = n - 1;
    while (lo + 1 < hi) { var mid = (lo + hi) >> 1; if (ySamp[mid] < y) lo = mid; else hi = mid; }
    var y0 = ySamp[lo], y1 = ySamp[hi], t = y1 > y0 ? (y - y0) / (y1 - y0) : 0;
    return lenSamp[lo] + t * (lenSamp[hi] - lenSamp[lo]);
  }

  // ---- per-frame draw ------------------------------------------------------
  // The tip is pinned to a document-Y that tracks scroll (scrollY + TIP_VH·vh), so
  // the drawn portion ALWAYS follows the scroll — no lag, no arc-length drift.
  function render() {
    if (!len) return;
    try {
      var sy = window.scrollY || document.documentElement.scrollTop || 0;
      var vh = window.innerHeight || document.documentElement.clientHeight;

      // Bulletproof #metodo hide: whenever the metodo section occupies the viewport
      // centre, fade the WHOLE thread out (runtime, viewport-based — no geometry math).
      var metEl = document.getElementById('metodo');
      if (metEl) {
        var mr = metEl.getBoundingClientRect(), c = vh * 0.5, T = vh * 0.3;
        var dd = Math.min(c - mr.top, mr.bottom - c);   // >0 → viewport centre inside metodo
        svg.style.opacity = clamp(-dd / T, 0, 1).toFixed(3);
      } else { svg.style.opacity = '1'; }

      var drawn = clamp(lenAtY(sy + vh * TIP_VH), 0, len);
      var prog = drawn / len;
      fio.style.strokeDashoffset = len - drawn;

      var at = clamp(drawn, 0.0001, len - 0.001);
      var pt = fio.getPointAtLength(at);
      var bob = (!REDUCE && prog < 0.04) ? Math.sin(t0 * 0.0008) * 4 : 0;
      head.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + (pt.y + bob).toFixed(1) + ')');
      // fade the tip out as it reaches the terminus above the video
      head.style.opacity = prog <= 0.9 ? '1' : clamp((1 - prog) / 0.1, 0, 1).toFixed(3);
    } catch (e) {}
  }

  function tick(ts) {
    t0 = ts || 0;
    render();
    raf = requestAnimationFrame(tick);
  }

  // ---- wiring --------------------------------------------------------------
  var rt = null;
  function rebuild() { clearTimeout(rt); rt = setTimeout(function () { build(false); }, 120); }

  window.addEventListener('scroll', render, { passive: true });   // rAF also renders; this keeps it crisp
  window.addEventListener('resize', rebuild, { passive: true });
  window.addEventListener('load', function () { build(true); });

  function hookST() {
    if (window.ScrollTrigger && window.ScrollTrigger.addEventListener) {
      window.ScrollTrigger.addEventListener('refresh', rebuild);
      return true;
    }
    return false;
  }
  if (!hookST()) { var tries = 0, iv = setInterval(function () { if (hookST() || ++tries > 40) clearInterval(iv); }, 150); }

  if ('ResizeObserver' in window) { try { new ResizeObserver(rebuild).observe(document.body); } catch (e) {} }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { build(true); });

  build(true);
  setTimeout(function () { build(true); }, 500);
  setTimeout(function () { build(true); }, 1500);
  setTimeout(function () { build(true); }, 3000);
  raf = requestAnimationFrame(tick);
})();
