/* ============================================
   PERFORMANCE GATE — desliga animações pesadas
   em mobile, touch devices e prefers-reduced-motion
   ============================================ */
const IS_MOBILE = matchMedia('(max-width: 768px), (max-height: 500px) and (orientation: landscape)').matches;
const IS_TOUCH  = matchMedia('(hover: none), (pointer: coarse)').matches;
const PREFERS_REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* LOW_MOTION só em a11y. Mobile roda versão leve das animações (ver main
   QUEM SOMOS — ciclo mobile simplificado). Particles canvas/counters/cursor
   trail continuam gated por IS_MOBILE separadamente. */
const LOW_MOTION = PREFERS_REDUCE;

/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('done'), 200);
});

/* ============================================
   MOBILE NAV
   ============================================ */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const langBtn = document.getElementById('lang-btn');
const langHome = langBtn?.parentElement; // lembra onde o lang-btn vivia (body/header)

function syncLangPosition(active) {
  if (!langBtn) return;
  // Mobile: ao abrir o drawer, move o lang-btn pra dentro como última opção.
  // Ao fechar, devolve pro home original (body).
  if (active && nav && !nav.contains(langBtn)) nav.appendChild(langBtn);
  else if (!active && langHome && !langHome.contains(langBtn)) langHome.appendChild(langBtn);
}

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  const active = nav.classList.toggle('active');
  document.body.classList.toggle('nav-open', active);
  syncLangPosition(active);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('active');
  nav.classList.remove('active');
  document.body.classList.remove('nav-open');
  syncLangPosition(false);
}));

/* ============================================
   HEADER
   ============================================ */
const header = document.getElementById('header');
(function () {
  let lastState = false;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const s = scrollY > 30;
      if (s !== lastState) {
        header.classList.toggle('scrolled', s);
        lastState = s;
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* ============================================
   SCROLL PROGRESS
   ============================================ */
const progress = document.getElementById('scrollProgress');
(function () {
  // rAF throttle — evita mutation de style em todo scroll event (que roda até
  // 120x/s em trackpads MacOS). Com rAF, limita ao refresh rate do display.
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (h > 0) progress.style.width = (scrollY / h * 100) + '%';
      ticking = false;
    });
  }, { passive: true });
})();

/* ============================================
   SMOOTH SCROLL — Lenis (premium inertia) + fallback nativo
   Lenis roda no desktop. Mobile: scroll nativo (smoothTouch: false).
   Respeita prefers-reduced-motion.
   ============================================ */
let lenisInstance = null;
(function initLenis() {
  // Espera script do CDN carregar (script defer + init após DOMContentLoaded)
  const ready = () => {
    if (PREFERS_REDUCE || typeof window.Lenis === 'undefined') return;
    try {
      lenisInstance = new window.Lenis({
        lerp: 0.1,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false
      });
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Sync com ScrollTrigger quando GSAP carrega
      window.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined' && lenisInstance) {
          lenisInstance.on('scroll', ScrollTrigger.update);
        }
      });
    } catch (e) {
      console.warn('[lenis] init falhou, usando scroll nativo:', e);
      lenisInstance = null;
    }
  };
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Script defer pode ainda não ter rodado — tenta agora, e re-tenta após load
    ready();
    if (!lenisInstance) window.addEventListener('load', ready, { once: true });
  } else {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  }
})();

/* Anchor links — usa Lenis quando disponível, fallback scrollTo nativo */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const t = document.querySelector(href);
    if (!t) return;
    e.preventDefault();
    if (lenisInstance) {
      lenisInstance.scrollTo(t, { offset: -56, duration: 1.2 });
    } else {
      scrollTo({ top: t.offsetTop - 56, behavior: 'smooth' });
    }
  });
});

/* ============================================
   REVEAL — Apple fade up
   ============================================ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

function reveal(sel, stagger) {
  if (LOW_MOTION) {
    document.querySelectorAll(sel).forEach(el => el.classList.add('reveal', 'revealed'));
    return;
  }
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    if (stagger) el.style.transitionDelay = (i % 4) * 0.07 + 's';
    revealObs.observe(el);
  });
}

reveal('.problema__card', true);
reveal('.versus__col', true);
reveal('.aria__card', true);
reveal('.resultados__item', true);
reveal('.personas__card', true);
reveal('.faq__item', true);
reveal('.team-card-wrap:not(:has(#tc-1))', true);  /* Pedro (#tc-1) sem fade-in de entrada */
reveal('.cs-card', true);

/* ============================================
   QS CARD STACK — reveal suave on scroll (equivalente whileInView, once)
   IntersectionObserver com rootMargin -50px pra disparar um pouco antes.
   Fade + slide horizontal leve (x: 40 → 0) — GPU-only (transform + opacity).
   ============================================ */
(function() {
  const stack = document.querySelector('.card-stack');
  if (!stack) return;
  if (LOW_MOTION) {
    stack.classList.add('card-stack--reveal', 'card-stack--revealed');
    return;
  }
  stack.classList.add('card-stack--reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-stack--revealed');
        io.unobserve(entry.target);  /* once: true */
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  io.observe(stack);
})();
/* NUNCA aplicar reveal em .card-stack ou .qs-scene-wrap — elas ficam dentro
   de section com scroll-lock; opacity:0 sem trigger deixa o card invisível
   enquanto o user está preso pela trava. */

/* ============================================
   HERO FX — composição tech em canvas (grid pontos + linhas circuito + pulsos)
   Pausa fora do viewport. DPR cap 2. Respeita reduced-motion.
   ============================================ */
(function initHeroFx() {
  const canvas = document.getElementById('heroFxCanvas');
  const host   = document.getElementById('heroFx');
  if (!canvas || !host) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduce = PREFERS_REDUCE;
  const isMobile = matchMedia('(max-width: 768px)').matches;

  let W = 0, H = 0, dpr = 1;
  let dots = [];
  let segments = [];
  let nodes = [];
  let pulses = [];
  let raf = null;
  let running = false;
  let t0 = performance.now();

  const GAP = isMobile ? 52 : 40;
  const DOT_COUNT_PULSE_RATIO = 0.15;   // fração de pontos que pulsam
  const LINE_COUNT = isMobile ? 6 : 11;

  function resize() {
    const rect = host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(rect.width);
    H = Math.floor(rect.height);
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
  }

  function rng(seed) {
    let s = seed | 0;
    return function() {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) % 10000) / 10000;
    };
  }

  function buildScene() {
    // Grid pontos
    dots = [];
    const cols = Math.ceil(W / GAP) + 1;
    const rows = Math.ceil(H / GAP) + 1;
    const rand = rng(42);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pulse = rand() < DOT_COUNT_PULSE_RATIO;
        dots.push({
          x: c * GAP,
          y: r * GAP,
          pulse,
          phase: rand() * Math.PI * 2
        });
      }
    }

    // Linhas de circuito ortogonais — 2 a 4 segmentos cada, grudadas no grid
    segments = [];
    nodes = [];
    const r2 = rng(7);
    for (let i = 0; i < LINE_COUNT; i++) {
      const startC = Math.floor(r2() * cols);
      const startR = Math.floor(r2() * rows);
      let cx = startC, cy = startR;
      const segCount = 2 + Math.floor(r2() * 3);
      const linePts = [{ x: cx * GAP, y: cy * GAP }];
      let lastDir = null;
      for (let s = 0; s < segCount; s++) {
        // Alterna eixo pra manter ortogonal sem recuo
        const horizontal = lastDir === 'v' || (lastDir === null && r2() < .5);
        lastDir = horizontal ? 'h' : 'v';
        const len = 3 + Math.floor(r2() * 6);
        const dir = r2() < .5 ? -1 : 1;
        if (horizontal) cx = Math.max(0, Math.min(cols, cx + len * dir));
        else            cy = Math.max(0, Math.min(rows, cy + len * dir));
        linePts.push({ x: cx * GAP, y: cy * GAP });
      }
      // Cria segmentos em sequência + nós nas pontas
      const lineSegs = [];
      for (let s = 0; s < linePts.length - 1; s++) {
        const a = linePts[s], b = linePts[s + 1];
        lineSegs.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
      }
      segments.push({ segs: lineSegs, opacity: 0.3 + r2() * 0.4 });
      // Nós: primeiro e último da linha
      nodes.push({ x: linePts[0].x, y: linePts[0].y, phase: r2() * Math.PI * 2 });
      nodes.push({ x: linePts[linePts.length - 1].x, y: linePts[linePts.length - 1].y, phase: r2() * Math.PI * 2 });

      // Pulso por linha
      const totalLen = lineSegs.reduce((sum, s) => sum + Math.hypot(s.bx - s.ax, s.by - s.ay), 0);
      pulses.push({
        lineIdx: i,
        t: r2() * 1,            // 0..1 posição atual
        speed: (0.12 + r2() * 0.12) / 1000, // por ms
        totalLen
      });
    }
  }

  function pulsePosition(line, t) {
    let dist = t * line.segs.reduce((s, seg) => s + Math.hypot(seg.bx - seg.ax, seg.by - seg.ay), 0);
    for (const s of line.segs) {
      const len = Math.hypot(s.bx - s.ax, s.by - s.ay);
      if (dist <= len) {
        const k = dist / len;
        return { x: s.ax + (s.bx - s.ax) * k, y: s.ay + (s.by - s.ay) * k };
      }
      dist -= len;
    }
    const last = line.segs[line.segs.length - 1];
    return { x: last.bx, y: last.by };
  }

  function render(nowMs) {
    ctx.clearRect(0, 0, W, H);
    const tt = (nowMs - t0) / 1000;

    // Camada 1: pontos do grid
    for (const d of dots) {
      let a = 0.08;
      if (d.pulse && !reduce) {
        a = 0.08 + (Math.sin(tt * 1.8 + d.phase) * 0.5 + 0.5) * 0.17;
      }
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Camada 2: linhas de circuito
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (const line of segments) {
      ctx.strokeStyle = `rgba(255,107,0,${line.opacity.toFixed(3)})`;
      ctx.beginPath();
      for (const s of line.segs) {
        ctx.moveTo(s.ax, s.ay);
        ctx.lineTo(s.bx, s.by);
      }
      ctx.stroke();
    }

    // Nós nas pontas
    for (const n of nodes) {
      const pulse = reduce ? .5 : (0.5 + 0.5 * Math.sin(tt * 2 + n.phase));
      const r = 2 + pulse * 1.2;
      ctx.fillStyle = '#ff6b00';
      ctx.shadowColor = 'rgba(255,107,0,.85)';
      ctx.shadowBlur = 8 + pulse * 6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Camada pulsos viajando nas linhas
    if (!reduce) {
      for (const p of pulses) {
        p.t += p.speed * 16;
        if (p.t > 1) p.t = 0;
        const line = segments[p.lineIdx];
        if (!line) continue;
        const pos = pulsePosition(line, p.t);
        const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 14);
        g.addColorStop(0, 'rgba(255,165,92,.95)');
        g.addColorStop(.4, 'rgba(255,107,0,.5)');
        g.addColorStop(1, 'rgba(255,107,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function loop(now) {
    if (!running) return;
    render(now);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  // Init + resize (debounced)
  let resizeT = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { resize(); if (reduce) render(performance.now()); }, 140);
  }, { passive: true });

  resize();
  if (reduce) {
    render(performance.now());
    return;
  }

  // Pausa fora do viewport
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0) start();
      else stop();
    });
  }, { threshold: 0 });
  io.observe(document.getElementById('hero') || host);

  // Pausa em tab oculta
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (document.getElementById('hero')?.getBoundingClientRect().bottom > 0) start();
  });
})();

/* ============================================
   HERO TITLE — simple fade in
   ============================================ */
(function () {
  const title = document.getElementById('heroTitle');
  if (!title) return;
  title.style.animation = 'fadeUp .6s var(--ease) .2s both';
})();

/* ============================================
   COUNTERS — em mobile vai direto pro número final
   ============================================ */
if (LOW_MOTION) {
  document.querySelectorAll('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
} else {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1600, t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(2, -10 * p)) * target);
        p < 1 ? requestAnimationFrame(tick) : (el.textContent = target);
      })(t0);
      cObs.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => cObs.observe(el));
}

/* ============================================
   MANIFESTO — staggered reveal (instant em mobile)
   ============================================ */
if (LOW_MOTION) {
  document.querySelectorAll('.manifesto__line').forEach(l => l.classList.add('revealed'));
} else {
  const mObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); mObs.unobserve(e.target); } });
  }, { threshold: .2 });
  document.querySelectorAll('.manifesto__line').forEach((l, i) => {
    l.style.transitionDelay = i * .14 + 's';
    mObs.observe(l);
  });
}

/* ============================================
   FAQ
   ============================================ */
document.querySelectorAll('.faq__q').forEach(b => {
  b.addEventListener('click', () => {
    const it = b.parentElement, open = it.classList.contains('active');
    document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('active'));
    if (!open) it.classList.add('active');
  });
});

/* ============================================
   PERSONA TILT (desktop)
   ============================================ */
if (matchMedia('(min-width:769px) and (hover:hover)').matches) {
  document.querySelectorAll('[data-tilt]').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `translateY(-4px) perspective(600px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
}

/* ============================================
   NAV ACTIVE
   ============================================ */
const navLinks = document.querySelectorAll('.floatnav__item');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe;
document.querySelectorAll('section[id]').forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' }).observe(s);
});

/* ============================================
   TEAM MOBILE — cinematic full-screen controller
   Pointer events nativos (sem libs). Desktop continua no IIFE abaixo.
   ============================================ */
(function () {
  const root = document.getElementById('team-mobile');
  if (!root) return;
  // Só ativa em mobile (CSS já esconde em desktop, mas evita trabalho do JS)
  if (!matchMedia('(max-width: 768px)').matches) return;

  const slides = Array.from(root.querySelectorAll('.team-mslide'));
  const dots   = Array.from(root.querySelectorAll('.team-mdot'));
  const prevZ  = document.getElementById('teamMPrev');
  const nextZ  = document.getElementById('teamMNext');
  const hint   = document.getElementById('teamMobileHint');
  const track  = document.getElementById('teamMobileTrack');
  if (!slides.length || !track) return;

  let current = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragDx = 0;
  let dragLocked = null; // 'x' | 'y' | null
  let pointerId = null;
  let hintHidden = false;
  const PREFERS_REDUCE_LOCAL = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SWIPE_THRESHOLD = 60;

  function hideHint(force) {
    if (hintHidden && !force) return;
    hintHidden = true;
    root.classList.add('is-hidden-hint');
  }
  // Hint some após 3s mesmo sem interação
  setTimeout(() => hideHint(false), 3000);

  function goTo(idx) {
    const n = slides.length;
    const next = ((idx % n) + n) % n;
    if (next === current) return;
    slides.forEach((s, i) => {
      const active = i === next;
      s.classList.toggle('is-active', active);
      s.classList.toggle('is-out', !active && i === current);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      s.style.transform = '';  // limpa drag residual
    });
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });
    current = next;
    hideHint(true);

    // Limpa will-change depois da transição pra liberar GPU
    const cleanup = () => {
      slides.forEach(s => { s.style.willChange = ''; });
    };
    setTimeout(cleanup, 700);
  }

  // Dots
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.idx, 10);
      goTo(idx);
    });
  });

  // Zonas laterais
  if (prevZ) prevZ.addEventListener('click', () => goTo(current - 1));
  if (nextZ) nextZ.addEventListener('click', () => goTo(current + 1));

  // Pointer events pro swipe
  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerId = e.pointerId;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragDx = 0;
    dragLocked = null;
    root.classList.add('is-dragging');
    try { root.setPointerCapture(pointerId); } catch (_) {}
  }
  function onMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (!dragLocked) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      } else return;
    }
    if (dragLocked !== 'x') return;
    e.preventDefault();
    dragDx = dx;
    const w = root.clientWidth || 360;
    const pct = Math.max(-1, Math.min(1, dx / w));
    // Move ativo com o dedo; próximo/anterior entra pelo lado oposto
    const activeEl = slides[current];
    const nextEl   = slides[(current + 1) % slides.length];
    const prevEl   = slides[(current - 1 + slides.length) % slides.length];
    activeEl.style.transform = `translate3d(${dx}px, 0, 0) scale(1)`;
    activeEl.style.opacity   = String(1 - Math.abs(pct) * 0.4);
    if (dx < 0) {
      nextEl.style.visibility = 'visible';
      nextEl.style.opacity    = String(Math.abs(pct));
      nextEl.style.transform  = `translate3d(${w + dx}px, 0, 0) scale(${1.05 - 0.05 * Math.abs(pct)})`;
      prevEl.style.transform  = '';
      prevEl.style.opacity    = '';
    } else if (dx > 0) {
      prevEl.style.visibility = 'visible';
      prevEl.style.opacity    = String(Math.abs(pct));
      prevEl.style.transform  = `translate3d(${-w + dx}px, 0, 0) scale(${1.05 - 0.05 * Math.abs(pct)})`;
      nextEl.style.transform  = '';
      nextEl.style.opacity    = '';
    }
  }
  function onUp(e) {
    if (!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
    dragging = false;
    root.classList.remove('is-dragging');
    try { root.releasePointerCapture(pointerId); } catch (_) {}
    pointerId = null;

    // Limpa inline styles temporários de drag
    slides.forEach(s => {
      s.style.transform  = '';
      s.style.opacity    = '';
      s.style.visibility = '';
    });

    if (dragLocked === 'x' && Math.abs(dragDx) > SWIPE_THRESHOLD) {
      if (dragDx < 0) goTo(current + 1);
      else goTo(current - 1);
    }
    dragLocked = null;
    dragDx = 0;
  }
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove, { passive: false });
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onUp);

  // Teclado nas zonas
  [prevZ, nextZ].forEach((z, idx) => {
    if (!z) return;
    z.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goTo(idx === 0 ? current - 1 : current + 1);
      }
    });
  });
})();

/* ============================================
   TEAM — hover-driven desktop (click/tap no touch)
   ============================================ */
(function () {
  const wraps = Array.from(document.querySelectorAll('.team-card-wrap'));
  if (!wraps.length) return;
  const section = document.getElementById('para-quem');
  const pin = document.getElementById('team-pin');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

  // ARIA + semântica
  wraps.forEach((wrap, i) => {
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-expanded', 'false');
    const name = wrap.querySelector('.tc-front-info h3')?.textContent?.trim() || `Membro ${i + 1}`;
    wrap.setAttribute('aria-label', `Ver bio de ${name}`);
  });

  function flipOne(wrap) {
    wraps.forEach(w => {
      const on = w === wrap;
      w.classList.toggle('flipped', on);
      w.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  function flipNone() {
    wraps.forEach(w => {
      w.classList.remove('flipped');
      w.setAttribute('aria-expanded', 'false');
    });
  }

  // Keyboard: Enter/Space toggle, Esc fecha
  wraps.forEach(wrap => {
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (wrap.classList.contains('flipped')) flipNone();
        else flipOne(wrap);
      } else if (e.key === 'Escape') {
        flipNone();
        wrap.blur();
      }
    });
  });

  if (isTouch) {
    // ── Touch: click toggle + tap fora fecha + auto-flip stagger ──
    wraps.forEach(wrap => {
      wrap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrap.classList.contains('flipped')) flipNone();
        else flipOne(wrap);
      });
    });
    document.addEventListener('click', (e) => {
      if (section && !section.contains(e.target)) flipNone();
    });

    // Swipe horizontal — navega entre cards do time
    if (section) {
      let sx = 0, sy = 0;
      section.addEventListener('touchstart', e => {
        const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY;
      }, { passive: true });
      section.addEventListener('touchend', e => {
        const t = e.changedTouches[0];
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
        // acha atual (primeiro flipped) e navega
        let cur = wraps.findIndex(w => w.classList.contains('flipped'));
        if (cur < 0) cur = 0;
        const dir = dx < 0 ? 1 : -1;
        const n = (cur + dir + wraps.length) % wraps.length;
        flipOne(wraps[n]);
      }, { passive: true });
    }

    // Auto-flip stagger ao entrar viewport (demo visual em mobile)
    if (pin && !reduceMotion) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          wraps.forEach((w, i) => setTimeout(() => w.classList.add('flipped'), 600 + i * 220));
          io.disconnect();
        });
      }, { threshold: 0.35 });
      io.observe(pin);
    }
    return;
  }

  // ── Desktop: hover-driven com delay 120/250 ──
  let enterTimer = null;
  let leaveTimer = null;

  wraps.forEach(wrap => {
    wrap.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      clearTimeout(enterTimer);
      enterTimer = setTimeout(() => flipOne(wrap), 120);
    });
    wrap.addEventListener('focus', () => {
      clearTimeout(leaveTimer);
      clearTimeout(enterTimer);
      flipOne(wrap);
    });
    wrap.addEventListener('click', () => {
      // Click em desktop: bypass delay, abre/fecha direto
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
      if (wrap.classList.contains('flipped')) flipNone();
      else flipOne(wrap);
    });
  });

  // Sair da seção → colapsa após 250ms (tolerância)
  if (section) {
    section.addEventListener('mouseleave', () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(flipNone, 250);
    });
    section.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
    });
    section.addEventListener('focusout', (e) => {
      if (!section.contains(e.relatedTarget)) {
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(flipNone, 250);
      }
    });
  }
})();

/* ============================================
   MÉTODO DEIA — carrossel horizontal com snap + efeitos
   ============================================ */
(function() {
  const ARIA_KEYS = ['d', 'e', 'i', 'a'];
  const ARIA_LETTERS = { d: 'D', e: 'E', i: 'I', a: 'A' };
  function getAriaData() {
    const t = (window.I18N && window.I18N.t.bind(window.I18N)) || ((k) => k);
    return ARIA_KEYS.map((k, idx) => ({
      num: `0${idx + 1} / 04`,
      letter: ARIA_LETTERS[k],
      title:    t(`aria.${k}.title`),
      subtitle: t(`aria.${k}.subtitle`),
      desc:     t(`aria.${k}.desc`),
      bullets:  [1, 2, 3, 4, 5].map(n => t(`aria.${k}.b${n}`)),
      tag:      t(`aria.${k}.tag`),
      result:   t(`aria.${k}.result`)
    }));
  }

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const nodes    = document.querySelectorAll('#aria-flow .aria-node');
  const viewport = document.getElementById('metodoViewport');
  const track    = document.getElementById('metodoTrack');
  const prevBtn  = document.getElementById('metodoPrev');
  const nextBtn  = document.getElementById('metodoNext');
  const dotsWrap = document.getElementById('metodoDots');
  const section  = document.getElementById('metodo');
  if (!track || !viewport || !section) return;

  let ARIA_DATA = getAriaData();
  let current = 0;
  let autoTimer = null;
  let userInteracting = false;
  let resumeTimer = null;
  const AUTO_MS = 5000;

  function cardHTML(d, i) {
    return `
      <article class="metodo-card" data-idx="${i}" role="tab" aria-label="${escapeHtml(d.title)}" tabindex="0">
        <div class="metodo-card-letter" aria-hidden="true">${escapeHtml(d.letter)}</div>
        <div class="metodo-card-num">${escapeHtml(d.num)}</div>
        <h3 class="metodo-card-title">${escapeHtml(d.title)}</h3>
        <div class="metodo-card-subtitle">${escapeHtml(d.subtitle)}</div>
        <p class="metodo-card-desc">${escapeHtml(d.desc)}</p>
        <ul class="metodo-card-bullets">${d.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
        <div class="metodo-card-footer">
          <span class="metodo-card-tag">${escapeHtml(d.tag)}</span>
          <span class="metodo-card-result">${escapeHtml(d.result)}</span>
        </div>
      </article>
    `;
  }

  function render() {
    track.innerHTML = ARIA_DATA.map((d, i) => cardHTML(d, i)).join('');
    if (dotsWrap) {
      dotsWrap.innerHTML = ARIA_DATA.map((d, i) =>
        `<button type="button" class="metodo-dot" role="tab" data-idx="${i}" aria-label="Ir para fase ${d.letter} — ${escapeHtml(d.title)}"></button>`
      ).join('');
    }
    bindCards();
    bindDots();
    updateActive(0, { scroll: false });
  }

  function bindCards() {
    track.querySelectorAll('.metodo-card').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        goTo(idx, { user: true });
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.dataset.idx, 10);
          goTo(idx, { user: true });
        }
      });
    });
  }

  function bindDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.metodo-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.idx, 10);
        goTo(idx, { user: true });
      });
    });
  }

  function updateActive(idx, opts) {
    opts = opts || {};
    current = idx;
    track.querySelectorAll('.metodo-card').forEach((c, i) => {
      c.classList.toggle('is-active', i === idx);
      c.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    const flow = document.getElementById('aria-flow');
    if (flow) flow.style.setProperty('--aria-progress', String(idx));
    nodes.forEach((n, i) => {
      n.classList.toggle('active', i === idx);
      n.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      n.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.metodo-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
    }
    updateArrows();
    if (opts.scroll !== false) scrollToIndex(idx);
  }

  function scrollToIndex(idx) {
    const card = track.children[idx];
    if (!card) return;
    const vpRect = viewport.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = (cardRect.left - vpRect.left) + viewport.scrollLeft
                 - (viewport.clientWidth / 2 - card.clientWidth / 2);
    viewport.scrollTo({
      left: offset,
      behavior: LOW_MOTION ? 'auto' : 'smooth'
    });
  }

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    // Não desabilito — faço looping
    prevBtn.setAttribute('aria-disabled', 'false');
    nextBtn.setAttribute('aria-disabled', 'false');
  }

  function goTo(idx, opts) {
    const n = ARIA_DATA.length;
    const next = ((idx % n) + n) % n;
    updateActive(next);
    if (opts && opts.user) pauseAuto();
  }

  function pauseAuto() {
    userInteracting = true;
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      userInteracting = false;
      startAuto();
    }, 8000);
  }

  function startAuto() {
    if (autoTimer || LOW_MOTION || userInteracting) return;
    autoTimer = setInterval(() => goTo(current + 1), AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Arrows
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1, { user: true }));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1, { user: true }));

  // Keyboard: setas navegam quando foco está no carrossel
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1, { user: true }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1, { user: true }); }
  });

  // Detecta card central visível durante scroll manual
  let scrollTimeout = null;
  viewport.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const vpRect = viewport.getBoundingClientRect();
      const vpCenter = vpRect.left + vpRect.width / 2;
      let closest = 0, minDist = Infinity;
      track.querySelectorAll('.metodo-card').forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const d = Math.abs(center - vpCenter);
        if (d < minDist) { minDist = d; closest = i; }
      });
      if (closest !== current) updateActive(closest, { scroll: false });
    }, 90);
  }, { passive: true });

  // Pills D/E/I/A navegam
  nodes.forEach((node, i) => {
    node.setAttribute('role', 'tab');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-pressed', 'false');
    node.setAttribute('aria-controls', 'metodoTrack');
    node.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(i, { user: true });
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goTo(i, { user: true });
      }
    });
  });

  // Pause auto no hover/touch da viewport
  ['mouseenter', 'touchstart', 'focusin'].forEach(ev => {
    viewport.addEventListener(ev, () => pauseAuto(), { passive: true });
  });

  // i18n re-render
  window.addEventListener('i18n:change', () => {
    ARIA_DATA = getAriaData();
    const prev = current;
    render();
    updateActive(prev, { scroll: false });
  });

  // Entrada no viewport → fade + translateY + inicia auto-play
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        track.querySelectorAll('.metodo-card').forEach((c, i) => {
          setTimeout(() => c.classList.add('is-entered'), i * 80);
        });
        startAuto();
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  // Pause quando sai da viewport
  const ioPause = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) stopAuto();
      else if (!userInteracting) startAuto();
    });
  }, { threshold: 0.2 });

  render();
  io.observe(section);
  ioPause.observe(section);

  // Trigger externo (section dots etc)
  document.addEventListener('metodo:set', (e) => {
    const i = e && e.detail && e.detail.index;
    if (typeof i === 'number') goTo(i, { user: true });
  });
})();

/* ============================================
   QS CARD STACK — HOVER slide (esq→dir) + EXPLODE ao sair o cursor
   ============================================ */
function _initCardStackFx() {
  const stack = document.querySelector('.card-stack');
  if (!stack || stack.dataset.fxInit === '1') return;
  stack.dataset.fxInit = '1';

  if (IS_TOUCH) {
    // Mobile: auto-cycle alterna card 1 ↔ card 2 a cada 2.5s quando visível
    let cycleTimer = null;
    const CYCLE_MS = 2500;
    function tickStack() {
      stack.classList.toggle('is-revealed');
    }
    function startStackCycle() {
      if (cycleTimer || LOW_MOTION) return;
      cycleTimer = setInterval(tickStack, CYCLE_MS);
    }
    function stopStackCycle() {
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    }
    const qsSection = document.getElementById('quem-somos');
    if (qsSection) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) startStackCycle();
          else stopStackCycle();
        });
      }, { threshold: 0.25 });
      io.observe(qsSection);
    } else {
      startStackCycle();
    }
    // Tap também alterna manualmente (pausa/retoma o cycle)
    stack.addEventListener('click', () => {
      stopStackCycle();
      stack.classList.toggle('is-revealed');
      setTimeout(startStackCycle, 4000);
    });
    return;
  }

  /* Desktop: depth-of-field via hover puro CSS (sem JS de explode/snap) */
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initCardStackFx);
} else {
  _initCardStackFx();
}

/* ============================================
   GSAP SCROLL FX
   ============================================ */
addEventListener('load', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = matchMedia('(max-width: 768px)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Normaliza scroll: uniformiza wheel/trackpad/touch num único easing curve.
  // Deixa o scroll com momentum mais consistente e menos "solavancos"
  // entre devices diferentes.
  try {
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });
  } catch (e) {}

  // Word-reveal helper (desktop only)
  const wordStyle = document.createElement('style');
  wordStyle.textContent = `.word-wrap{display:inline-block;overflow:hidden;vertical-align:bottom}.word{display:inline-block;will-change:transform}`;
  document.head.appendChild(wordStyle);

  function splitAndReveal(selector) {
    document.querySelectorAll(selector).forEach(el => {
      if (el.querySelector('em, strong, span, a, br')) return;
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="word-wrap"><span class="word">${w}</span></span>`).join(' ');
      const wordEls = el.querySelectorAll('.word');
      gsap.fromTo(wordEls,
        { y: '100%', opacity: 0 },
        {
          y: '0%', opacity: 1, duration: .6, ease: 'power2.out', stagger: .04,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });
  }

  // 1) Hero — entrada da imagem (slide da esquerda) + parallax (desktop + mobile)
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    gsap.fromTo(heroVisual,
      { xPercent: -130, opacity: 0 },
      {
        xPercent: 0, opacity: 1, duration: 1.6, ease: 'power4.out', delay: .3,
        onComplete: () => heroVisual.classList.add('entered')
      }
    );
  }

  // 2) ARIA slides — sem GSAP de entrada (CSS classes controlam tudo, evita jitter no hover)

  // 3) Team flip cards — entrada fade-up, flip ao entrar na viewport (stagger)
  gsap.fromTo('.team-card-wrap',
    { y: 60, opacity: 0 },
    {
      y: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .1,
      scrollTrigger: { trigger: '#team-pin', start: 'top 85%', toggleActions: 'play none none none' }
    }
  );

  // 4) Cases cards
  document.querySelectorAll('.mv-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .8, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        delay: i * .15
      }
    );
  });

  // 5) Chips e títulos de seção
  document.querySelectorAll('.tag, .section__title').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      }
    );
  });

  // 6) Word reveal — desktop only, parágrafos chave
  if (!isMobile) {
    splitAndReveal('.hero__sub, .pb__desc, .section__sub, .aria-header__lead');
  }

  // 7) Números grandes — pop in (containers, não os <span data-count>)
  document.querySelectorAll('.resultados__num, .hero__stat-value').forEach(el => {
    gsap.fromTo(el,
      { scale: .8, y: 20 },
      {
        scale: 1, y: 0, duration: .9, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  /* ── #por-que (versus) ────────────────────── */
  gsap.fromTo('#por-que .section__title',
    { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    {
      clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 1.1, ease: 'power4.out',
      scrollTrigger: { trigger: '#por-que', start: 'top 80%', toggleActions: 'play none none none' }
    }
  );

  const dx = isMobile ? 40 : 100;
  gsap.fromTo('.versus__col--old',
    { x: -dx, opacity: 0, rotateY: isMobile ? 0 : 12 },
    {
      x: 0, opacity: 1, rotateY: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.versus__grid', start: 'top 82%', toggleActions: 'play none none none' }
    }
  );
  gsap.fromTo('.versus__col--new',
    { x: dx, opacity: 0, rotateY: isMobile ? 0 : -12 },
    {
      x: 0, opacity: 1, rotateY: 0, duration: 1, ease: 'power3.out', delay: .15,
      scrollTrigger: { trigger: '.versus__grid', start: 'top 82%', toggleActions: 'play none none none' }
    }
  );

  document.querySelectorAll('.versus__col').forEach((col, ci) => {
    const items = col.querySelectorAll('li');
    if (!items.length) return;
    gsap.fromTo(items,
      { x: ci === 0 ? -30 : 30, opacity: 0 },
      {
        x: 0, opacity: 1, duration: .5, ease: 'power2.out', stagger: .07, delay: .5,
        scrollTrigger: { trigger: '.versus__grid', start: 'top 78%', toggleActions: 'play none none none' }
      }
    );
  });

  /* ── Footer ───────────────────────────────── */
  gsap.fromTo('.footer',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.footer', start: 'top 92%', toggleActions: 'play none none none',
        onEnter: () => document.querySelector('.footer')?.classList.add('line-in')
      }
    }
  );

  gsap.fromTo('.footer__col li',
    { y: 20, opacity: 0 },
    {
      y: 0, opacity: 1, duration: .5, stagger: .05, ease: 'power2.out', delay: .2,
      scrollTrigger: { trigger: '.footer', start: 'top 92%', toggleActions: 'play none none none' }
    }
  );

  gsap.fromTo('.footer__col h4',
    { y: 16, opacity: 0 },
    {
      y: 0, opacity: 1, duration: .6, stagger: .08, ease: 'power2.out',
      scrollTrigger: { trigger: '.footer', start: 'top 92%', toggleActions: 'play none none none' }
    }
  );

  gsap.fromTo('.footer__watermark h2',
    { opacity: 0, scale: .9 },
    {
      opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out', delay: .3,
      scrollTrigger: { trigger: '.footer', start: 'top 80%', toggleActions: 'play none none none' }
    }
  );

  // Copyright typewriter
  const fcEl = document.querySelector('.footer__bottom p');
  if (fcEl) {
    const text = fcEl.textContent;
    fcEl.textContent = '';
    gsap.to({}, {
      duration: text.length * .025, ease: 'none',
      onUpdate: function () {
        const chars = Math.floor(this.progress() * text.length);
        fcEl.textContent = text.slice(0, chars);
      },
      scrollTrigger: { trigger: '.footer', start: 'top 90%', toggleActions: 'play none none none' }
    });
  }

  if (isMobile) ScrollTrigger.config({ limitCallbacks: true });
});

/* ============================================
   SECTION DOTS — scroll spy + click smooth
   ============================================ */
(function () {
  const sdots = document.getElementById('sdots');
  if (!sdots) return;
  const dots = sdots.querySelectorAll('.sd');
  const targets = Array.from(dots).map(d => document.getElementById(d.dataset.target));

  function update() {
    const mid = innerHeight * 0.45;
    let cur = 0;
    targets.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= mid) cur = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    sdots.classList.toggle('vis', scrollY > 80);
  }
  addEventListener('scroll', update, { passive: true });
  update();

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      targets[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ============================================
   CASES — carrossel
   ============================================ */
const CASES_DATA = [
  {
    id: 'mataco',
    logo: 'assets/images/logo-mataco.png',
    logoBg: 'transparent',
    empresa: 'Mataco',
    area: 'Agência de Marketing',
    tag: 'Comercial',
    tagColor: 'orange',
    ceo: 'Arthur',
    cargo: 'CEO · Mataco',
    solucao: 'Agente de Prospecção',
    depoimento: '"Antes a gente perdia lead todo dia por falta de follow-up. Hoje o agente prospecta no Instagram, WhatsApp e e-mail enquanto a gente foca no que importa."',
    resultados: [
      { val: '+4h', lbl: 'por dia devolvidas ao time' },
      { val: '3',   lbl: 'canais integrados' },
      { val: '0',   lbl: 'leads perdidos por falta de contato' }
    ]
  },
  {
    id: 'gastroobesi',
    logo: 'assets/images/logo-gastroobesi.png',
    logoBg: 'dark',
    empresa: 'GastroObesi',
    area: 'Saúde',
    tag: 'Atendimento',
    tagColor: 'green',
    ceo: 'Dr. Tulio',
    cargo: 'CEO · GastroObesi',
    solucao: 'Agente de Atendimento',
    depoimento: '"300 mensagens por dia e o time não conseguia dar conta. Hoje o agente resolve tudo fora do horário, filtra o que é urgente e só manda pro humano o que realmente precisa."',
    resultados: [
      { val: '300',  lbl: 'mensagens/dia atendidas' },
      { val: '24/7', lbl: 'atendimento ininterrupto' },
      { val: '↓',    lbl: 'necessidade de atendente humano' }
    ]
  },
  {
    id: 'ocanto',
    logo: 'assets/images/logo-ocanto.png',
    logoBg: 'transparent',
    empresa: 'O Canto',
    area: 'Restaurante',
    tag: 'Operações',
    tagColor: 'blue',
    ceo: 'Felipe',
    cargo: 'CEO · O Canto',
    solucao: 'Gestão de Estoque com IA',
    depoimento: '"A gente descobria que o produto tinha acabado só na hora do serviço. Hoje o sistema avisa antes, as compras são certas e o desperdício caiu de forma visível."',
    resultados: [
      { val: '↓',   lbl: 'desperdício e custo de compra' },
      { val: '0',   lbl: 'surpresas de falta de produto' },
      { val: '3-5', lbl: 'pessoas liberadas do controle manual' }
    ]
  },
  {
    id: 'sohydraulica',
    logo: 'assets/images/logo-sohydraulica.png',
    logoBg: 'white',
    empresa: 'Só Hydráulica',
    area: 'Material de Construção',
    tag: 'Atendimento + Operações',
    tagColor: 'purple',
    ceo: 'Mariangela',
    cargo: 'CEO · Só Hydráulica',
    solucao: 'Atendimento + Gestão de Estoque',
    depoimento: '"A gente perdia venda porque não sabia o que tinha em estoque e ainda tinha 400 mensagens por dia sem resposta. A BMAI resolveu os dois de uma vez."',
    resultados: [
      { val: '400', lbl: 'atendimentos/dia com IA' },
      { val: '↑',   lbl: 'vendas recuperadas' },
      { val: '2×',  lbl: 'frentes resolvidas' }
    ]
  }
];


/* ============================================
   GLOBAL GLOW EFFECTS — shimmer, border-lit, particles
   ============================================ */
(function() {
  // Shimmer nos títulos ao entrar na viewport
  const shimmerIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('shimmer-active'), 200);
        shimmerIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('section h2, .sec-h').forEach(el => shimmerIO.observe(el));

  // Border-lit nos cards
  const borderIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('border-lit');
        borderIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.aria-card, .dep-card, .qc, .nin, .mv-card').forEach(el => borderIO.observe(el));
})();

/* Partículas flutuantes globais — OFF em mobile/reduced-motion */
(function() {
  if (LOW_MOTION || IS_MOBILE) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.35;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W = canvas.width  = innerWidth;
  let H = canvas.height = innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = innerWidth;
    H = canvas.height = innerHeight;
  }, { passive: true });

  const N = IS_MOBILE ? 10 : 24;
  const pts = Array.from({ length: N }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    r:  Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    o:  Math.random() * 0.5 + 0.2,
    t:  Math.random() * Math.PI * 2
  }));

  (function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.t += 0.008;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      const opacity = p.o * (0.6 + Math.sin(p.t) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(219,85,0,${opacity})`;
      ctx.fill();
    }
  })();
})();
// ============================================================
// FORMULÁRIO → ANNA
// ============================================================
(function () {
  const form = document.getElementById('bmai-form');
  if (!form) return;

  const btnDefaultHTML = 'Enviar para o time da BMAi <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  const feedback = document.getElementById('form-feedback');

  const icons = {
    success: '<svg class="fb-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    error:   '<svg class="fb-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warn:    '<svg class="fb-ico" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  function showFeedback(type, msg) {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.className = 'form-feedback form-feedback--' + type;
    feedback.innerHTML = (icons[type] || '') + '<span class="fb-msg">' + msg + '</span>';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = form.querySelector('.form-submit');
    const val = id => (document.getElementById(id)?.value || '').trim();
    const nome     = val('f-nome');
    const empresa  = val('f-empresa');
    const email    = val('f-email');
    const telefone = val('f-tel');
    const cargo    = val('f-cargo');
    const segmento = val('f-segmento');
    const colab    = val('f-colab');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const telOk = telefone.replace(/\D/g, '').length >= 10;
    const camposRaw = [
      ['f-nome', !!nome], ['f-empresa', !!empresa],
      ['f-email', !!email && emailOk], ['f-tel', !!telefone && telOk],
      ['f-cargo', !!cargo], ['f-segmento', !!segmento],
      ['f-colab', !!colab]
    ];
    // ignora campos que não existem no DOM (compat com HTML antigo)
    const campos = camposRaw.filter(([id]) => document.getElementById(id));
    let faltantes = 0;
    campos.forEach(([id, ok]) => {
      const el = document.getElementById(id);
      if (!ok) { el?.classList.add('field-invalid'); faltantes++; }
      else el?.classList.remove('field-invalid');
    });
    if (faltantes > 0) {
      const msg = !email || emailOk ? (
        faltantes === 1 ? 'Preencha o campo destacado para enviar.'
                        : 'Preencha os ' + faltantes + ' campos destacados para enviar.'
      ) : 'Verifique o e-mail e os campos destacados.';
      showFeedback('warn', msg);
      const first = form.querySelector('.field-invalid');
      first?.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    if (feedback) feedback.hidden = true;

    const whatsapp = telefone.replace(/\D/g, '');

    try {
      const res = await fetch('https://anna.bmai.space/lead-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, empresa, email, whatsapp, cargo, segmento, colaboradores: colab })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('HTTP ' + res.status + ' ' + txt);
      }

      showFeedback('success', 'Recebido! O time da BMAi vai entrar em contato em até 24h.');
      form.reset();
    } catch (err) {
      console.error('[bmai-form] Falha no envio:', err);
      showFeedback('error', 'Não conseguimos enviar agora. Tente novamente em instantes ou chame o time da BMAi no WhatsApp.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = btnDefaultHTML;
    }
  });
})();


/* ============================================
   CASES DE SUCESSO
   ============================================ */
(function() {
  // ── Hero reveal ──
  const hero = document.getElementById('csHero');
  if (hero) {
    const heroObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        hero.classList.add('is-visible');
        heroObs.disconnect();
      }
    }, { threshold: 0.2 });
    heroObs.observe(hero);
  }

  // ── Grid cards reveal + glow ──
  const grid = document.getElementById('csGrid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.cs-card');

  const gridObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('is-visible'), i * 150);
      });
      gridObs.disconnect();
    }
  }, { threshold: 0.15 });
  gridObs.observe(grid);

  // Cursor-follow glow
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--gx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--gy', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });
})();

/* CURSOR TRAIL removido a pedido — sem bola de cursor */

/* ============================================
   TEXT HOVER EFFECT — mouse spotlight
   ============================================ */
(() => {
  const svg = document.querySelector('.text-hover__svg');
  if (!svg) return;

  const reveal = document.getElementById('thReveal');
  let hovering = false;

  svg.addEventListener('mouseenter', () => { hovering = true; });
  svg.addEventListener('mouseleave', () => {
    hovering = false;
    reveal.setAttribute('cx', '-9999');
    reveal.setAttribute('cy', '-9999');
  });

  svg.addEventListener('mousemove', (e) => {
    if (!hovering) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    reveal.setAttribute('cx', svgPt.x);
    reveal.setAttribute('cy', svgPt.y);
  });

  // start offscreen
  reveal.setAttribute('cx', '-9999');
  reveal.setAttribute('cy', '-9999');
})();

/* ============================================
   FOOTER GLOW LOGO — mouse spotlight
   ============================================ */
(() => {
  const wrap = document.getElementById('footerGlow');
  if (!wrap) return;

  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    wrap.style.setProperty('--sx', (e.clientX - rect.left) + 'px');
    wrap.style.setProperty('--sy', (e.clientY - rect.top) + 'px');
  });

  wrap.addEventListener('mouseleave', () => {
    wrap.style.setProperty('--sx', '-999px');
    wrap.style.setProperty('--sy', '-999px');
  });
})();

/* ============================================
   QUEM SOMOS — IDV enxurrada (12s loop)
   ============================================ */
(function () {
  const scene = document.getElementById('qsScene');
  if (!scene) return;
  const stage   = scene.querySelector('.qs-stage');
  const notifs  = Array.from(scene.querySelectorAll('.qs-notif'));
  const rings   = Array.from(scene.querySelectorAll('.qs-ring'));
  const brand   = document.getElementById('qsBrand');
  if (!notifs.length) return;

  // Mobile / reduced-motion: estado estático — notifs visíveis + brand.
  // Sem 'qs--done' (evita mostrar todos com check verde, confunde a
  // narrativa) e sem 'qs--brand-on' (evita overlay dark que apagava as
  // notifs e deixava só o brand no meio do nada).
  if (LOW_MOTION) {
    notifs.forEach(n => n.classList.add('qs--in'));
    brand?.classList.add('qs--in');
    return;
  }

  // Agrupa notifs por wave (data-wave 1/2/3) → ordem de pop-in
  const wave1 = notifs.filter(n => n.dataset.wave === '1');
  const wave2 = notifs.filter(n => n.dataset.wave === '2');
  const wave3 = notifs.filter(n => n.dataset.wave === '3');

  // Shuffle pra feel de "popcorn" (mesmo resultado em cada ciclo ok, mas não linear pela ordem HTML)
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let timers = [];
  function after(ms, fn) {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }
  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function resetScene() {
    notifs.forEach(n => n.classList.remove('qs--in', 'qs--flash', 'qs--done', 'qs--unstamp'));
    rings.forEach(r => r.classList.remove('qs--go'));
    brand?.classList.remove('qs--in', 'qs--out');
    stage?.classList.remove('qs-stage--chaos');
    scene.classList.remove('qs--brand-on', 'qs--brand-off');
  }

  function popIn(el, delayMs) {
    after(delayMs, () => {
      el.classList.add('qs--in', 'qs--flash');
      after(200, () => el.classList.remove('qs--flash'));
    });
  }

  function playCycle() {
    resetScene();
    stage?.classList.add('qs-stage--chaos');

    // ── Phase 1 — CHAOS (0 → 2.5s) ──
    // Wave A: 5 cards 150ms → 850ms
    const wA = shuffle(wave1);
    wA.forEach((n, i) => popIn(n, 150 + i * 140 + Math.random() * 80));
    // Wave B: 5 cards 900ms → 1650ms
    const wB = shuffle(wave2);
    wB.forEach((n, i) => popIn(n, 900 + i * 150 + Math.random() * 90));
    // Wave C: 4 cards 1700ms → 2400ms
    const wC = shuffle(wave3);
    wC.forEach((n, i) => popIn(n, 1700 + i * 175 + Math.random() * 100));

    // ── Phase 2 — CHAOS ACALMA (2.5s) ──
    after(2500, () => stage?.classList.remove('qs-stage--chaos'));

    // ── BRAND CARD entra (~3.0s, depois de todas as notifs popparem) ──
    after(3000, () => {
      brand?.classList.add('qs--in');
      scene.classList.remove('qs--brand-off');
      scene.classList.add('qs--brand-on');
    });

    // ── Phase 3 — READING RINGS (4.0 → 5.5s) — BMAi processando em massa ──
    after(4000, () => rings[0]?.classList.add('qs--go'));
    after(4150, () => rings[1]?.classList.add('qs--go'));
    after(4300, () => rings[2]?.classList.add('qs--go'));
    // cleanup rings quando animação termina (2s depois)
    after(6500, () => rings.forEach(r => r.classList.remove('qs--go')));

    // ── Phase 4 — STAMPS (5.5 → 9.0s) — 4 waves, stagger irregular ──
    const allNotifs = shuffle(notifs);
    // Wave A (~5.5-5.85s): 3 cards
    allNotifs.slice(0, 3).forEach((n, i) => after(5500 + i * 120 + Math.random() * 80, () => n.classList.add('qs--done')));
    // Wave B (~6.1-6.55): 4 cards
    allNotifs.slice(3, 7).forEach((n, i) => after(6100 + i * 130 + Math.random() * 80, () => n.classList.add('qs--done')));
    // Wave C (~6.85-7.35): 3 cards
    allNotifs.slice(7, 10).forEach((n, i) => after(6850 + i * 140 + Math.random() * 90, () => n.classList.add('qs--done')));
    // Wave D (~7.6-8.0): resto
    allNotifs.slice(10).forEach((n, i) => after(7600 + i * 150 + Math.random() * 90, () => n.classList.add('qs--done')));

    // ── Phase 5 — RESOLVED (9.0 → 10.5s) ──
    // calm — já está no estado desejado

    // ── Phase 6 — REVERSE LOOP (10.3 → 12.0s) ──
    // Brand sai primeiro
    after(10300, () => {
      brand?.classList.add('qs--out');
      scene.classList.remove('qs--brand-on');
      scene.classList.add('qs--brand-off');
    });
    // un-stamp staggered
    const unshuffled = shuffle(notifs);
    unshuffled.forEach((n, i) => {
      after(10500 + i * 50, () => {
        n.classList.add('qs--unstamp');
        after(420, () => n.classList.remove('qs--done', 'qs--unstamp'));
      });
    });

    // Restart em 12s
    after(12000, playCycle);
  }

  /* Mobile: ciclo leve — evita travamento. Sem rings, sem backdrop dark,
     sem camera jitter, menos stamps, ciclo mais curto. */
  function playCycleMobile() {
    resetScene();
    // Pop-in rápido de todas (stagger 60ms — parece "enxurrada" mas sem waves)
    const order = shuffle(notifs);
    order.forEach((n, i) => {
      after(80 + i * 60, () => {
        n.classList.add('qs--in', 'qs--flash');
        after(200, () => n.classList.remove('qs--flash'));
      });
    });
    // Brand entra após todas as notifs aparecerem
    after(1800, () => brand?.classList.add('qs--in'));
    // ~8 notifs recebem check (pra sentir resolução, sem todas)
    const toStamp = shuffle(notifs).slice(0, 8);
    toStamp.forEach((n, i) => after(3000 + i * 160, () => n.classList.add('qs--done')));
    // Reverse: brand sai + un-stamp
    after(6500, () => brand?.classList.add('qs--out'));
    toStamp.forEach((n, i) => {
      after(6800 + i * 40, () => {
        n.classList.add('qs--unstamp');
        after(400, () => n.classList.remove('qs--done', 'qs--unstamp'));
      });
    });
    // Restart em 8s
    after(8000, playCycleMobile);
  }

  let running = false;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) {
        running = true;
        (IS_MOBILE ? playCycleMobile : playCycle)();
      } else if (!e.isIntersecting && running) {
        running = false;
        clearAll();
        resetScene();
      }
    });
  }, { threshold: 0.2 });
  io.observe(scene);
})();

/* Footer: ano dinâmico */
(function () {
  const y = document.getElementById('footerYear');
  if (y) y.textContent = new Date().getFullYear();
})();
