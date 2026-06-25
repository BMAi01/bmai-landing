/* ============================================================================
   O FIO — guide-thread that emanates from the hero 3D star (#heroThree) and
   descends the whole page on scroll. Lives in the RIGHT gutter (the star's
   side) so it never crosses the reading column, never blocks clicks
   (pointer-events:none), and draws progressively with scroll.

   Fully self-contained: creates its own <style> + <svg>, hooks scroll/resize/
   ScrollTrigger refresh, and wraps everything in try/catch so it can never
   throw into the page. Disabled gracefully for prefers-reduced-motion (static
   draw, no float). 2026-06-25.
   ========================================================================== */
(function () {
  'use strict';
  if (typeof document === 'undefined' || !document.body) return;

  var NS = 'http://www.w3.org/2000/svg';
  var ACCENT = '#db5500', ACCENT_HOT = '#ff7a1a';
  var REDUCE = false;
  try { REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ---- helpers -------------------------------------------------------------
  function el(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // Catmull-Rom -> cubic bezier smoothing (same feel as the prototype).
  function smooth(pts) {
    if (pts.length < 2) return '';
    var d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' +
                   c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' +
                   p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }

  // ---- style ---------------------------------------------------------------
  var style = document.createElement('style');
  style.textContent =
    '#fioOverlay{position:absolute;top:0;left:0;width:100%;height:0;z-index:70;' +
      'pointer-events:none;overflow:visible;contain:layout style;}' +
    '#fioOverlay .fio-line{filter:drop-shadow(0 0 6px rgba(219,85,0,.5));}' +
    '#fioOverlay .fio-head{filter:drop-shadow(0 0 16px rgba(219,85,0,.7));}' +
    '@media (max-width:1024px){#fioOverlay{opacity:.55;}' +
      '#fioOverlay .fio-line{stroke-width:1.6px;filter:drop-shadow(0 0 4px rgba(219,85,0,.45));}}' +
    '@media print{#fioOverlay{display:none!important;}}';
  document.head.appendChild(style);

  // ---- svg scaffold --------------------------------------------------------
  var svg = el('svg', { id: 'fioOverlay', 'aria-hidden': 'true', preserveAspectRatio: 'none' });
  svg.innerHTML =
    '<defs><linearGradient id="fioGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">' +
    '<stop offset="0" stop-color="' + ACCENT_HOT + '"/>' +
    '<stop offset="0.5" stop-color="' + ACCENT + '"/>' +
    '<stop offset="1" stop-color="' + ACCENT_HOT + '"/></linearGradient></defs>';

  var ghost = el('path', { fill: 'none', stroke: 'rgba(219,85,0,0.12)', 'stroke-width': 1.5, 'stroke-linecap': 'round' });
  var nodes = el('g', {});
  var fio   = el('path', { fill: 'none', stroke: 'url(#fioGrad)', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  fio.setAttribute('class', 'fio-line');

  var head    = el('g', {}); head.setAttribute('class', 'fio-head');
  var headRing = el('circle', { r: 9, fill: 'none', stroke: ACCENT, 'stroke-width': 1.5, opacity: 0.6 });
  var headDot  = el('circle', { r: 4, fill: ACCENT_HOT });
  head.appendChild(headRing); head.appendChild(headDot);

  svg.appendChild(ghost); svg.appendChild(nodes); svg.appendChild(fio); svg.appendChild(head);
  document.body.appendChild(svg);

  // ---- state ---------------------------------------------------------------
  var SECTIONS = ['.manifesto', '#quem-somos', '#metodo', '#cases', '#para-quem', '#form', '#faq', '#contato'];
  var len = 0, prog = 0, target = 0, nodeList = [], raf = null, t0 = 0;
  var isDesktop = true;

  function lenAt(path, targetY) {
    var best = 0, bd = 1e9;
    for (var i = 0; i <= 60; i++) {
      var l = (i / 60) * len, pt = path.getPointAtLength(l), dd = Math.abs(pt.y - targetY);
      if (dd < bd) { bd = dd; best = l; }
    }
    return best;
  }

  // ---- build the path geometry --------------------------------------------
  function build() {
    try {
      var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight,
                          document.documentElement.offsetHeight);
      var vw = document.documentElement.clientWidth || window.innerWidth;
      if (vw < 2 || docH < 2) return;
      isDesktop = vw >= 1025;

      svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + docH);
      svg.style.height = docH + 'px';

      var sy = window.scrollY || document.documentElement.scrollTop || 0;

      // Reading column geometry (mirrors .container max-width 1200, pad 40).
      var contentHalf = Math.min(600, vw / 2 - 24);
      var colR = vw / 2 + contentHalf;            // right edge of reading column
      var margin = vw >= 1025 ? 26 : 12;
      var gutter = Math.max(0, (vw - margin) - colR);
      var laneX, amp;
      if (gutter > 40) {                          // real gutter: ride its centre, gentle weave
        laneX = colR + gutter / 2;
        amp = Math.min(gutter * 0.4, 52);
      } else {                                    // thin/no gutter (mobile): hug the far edge
        laneX = vw - margin - 4;
        amp = 0;
      }

      // Origin: anchored to the hero 3D star (floats on the right of #heroThree).
      var start = { x: laneX, y: 0 };
      var hero = document.getElementById('hero');
      if (hero) {
        var hr = hero.getBoundingClientRect();
        start = {
          x: clamp(hr.left + hr.width * 0.72, colR, vw - margin),
          y: hr.top + sy + hr.height * 0.46
        };
      }

      var pts = [start];
      var anchorPts = [];
      for (var i = 0; i < SECTIONS.length; i++) {
        var s = document.querySelector(SECTIONS[i]);
        if (!s) continue;
        var r = s.getBoundingClientRect();
        if (r.height < 2) continue;
        var y = r.top + sy + r.height / 2;
        // organic undulation, fully contained inside the gutter
        var x = laneX + Math.sin(i * 0.9 + 0.6) * amp * 0.6;
        pts.push({ x: x, y: y });
        anchorPts.push({ x: x, y: y });
      }
      pts.push({ x: laneX, y: docH - 8 });

      var d = smooth(pts);
      ghost.setAttribute('d', d);
      fio.setAttribute('d', d);
      len = fio.getTotalLength();
      fio.style.strokeDasharray = len;

      // section nodes (desktop only — on mobile they'd poke into content)
      while (nodes.firstChild) nodes.removeChild(nodes.firstChild);
      nodeList = [];
      if (isDesktop) {
        for (var j = 0; j < anchorPts.length; j++) {
          var p = anchorPts[j];
          var ring = el('circle', { cx: p.x, cy: p.y, r: 10, fill: 'none', stroke: ACCENT, 'stroke-width': 1.4 });
          ring.style.opacity = '0.22';
          var dot = el('circle', { cx: p.x, cy: p.y, r: 3, fill: ACCENT });
          dot.style.opacity = '0.32';
          nodes.appendChild(ring); nodes.appendChild(dot);
          nodeList.push({ ring: ring, dot: dot, len: lenAt(fio, p.y) });
        }
      }

      onScroll();
      apply();
    } catch (e) { /* never throw into the page */ }
  }

  // ---- scroll -> target ----------------------------------------------------
  function onScroll() {
    var max = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    var sc = window.scrollY || document.documentElement.scrollTop || 0;
    target = max > 0 ? clamp(sc / max, 0, 1) : 0;
  }

  // ---- per-frame draw ------------------------------------------------------
  function apply() {
    if (!len) return;
    try {
      var drawn = len * prog;
      fio.style.strokeDashoffset = len - drawn;

      var at = clamp(drawn, 0.0001, len - 0.001);
      var pt = fio.getPointAtLength(at);
      // subtle float synced to the hero star's vertical bob (sin(t*0.8))
      var bob = (!REDUCE && prog < 0.04) ? Math.sin(t0 * 0.0008) * 4 : 0;
      head.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + (pt.y + bob).toFixed(1) + ')');
      // guide-star rests on the hero 3D star at the top, fades slightly once the fio is fully drawn
      head.style.opacity = prog >= 0.999 ? '0.85' : '1';

      for (var i = 0; i < nodeList.length; i++) {
        var n = nodeList[i], reached = at >= n.len - 6;
        n.dot.style.opacity = reached ? '1' : '0.32';
        n.ring.style.opacity = reached ? '0.7' : '0.22';
        n.dot.setAttribute('r', reached ? 4 : 3);
      }
    } catch (e) {}
  }

  function tick(ts) {
    t0 = ts || 0;
    prog += (target - prog) * 0.18;
    if (Math.abs(target - prog) < 0.0002) prog = target;
    apply();
    raf = requestAnimationFrame(tick);
  }

  // ---- wiring (defensive: rebuild whenever layout can change) --------------
  var rt = null;
  function rebuild() { clearTimeout(rt); rt = setTimeout(build, 120); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', rebuild, { passive: true });
  window.addEventListener('load', build);

  // GSAP ScrollTrigger builds pin-spacers async (método section) → rebuild on refresh.
  function hookST() {
    if (window.ScrollTrigger && window.ScrollTrigger.addEventListener) {
      window.ScrollTrigger.addEventListener('refresh', rebuild);
      return true;
    }
    return false;
  }
  if (!hookST()) {
    var tries = 0, iv = setInterval(function () {
      if (hookST() || ++tries > 40) clearInterval(iv);
    }, 150);
  }

  // Language switch (PT/EN/ES) changes section heights → ResizeObserver catches it.
  if ('ResizeObserver' in window) {
    try { new ResizeObserver(rebuild).observe(document.body); } catch (e) {}
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);

  build();
  setTimeout(build, 500);
  setTimeout(build, 1500);
  setTimeout(build, 3000);
  raf = requestAnimationFrame(tick);
})();
