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
  // Ao abrir o drawer mobile, empurra o lang-btn pra dentro do nav
  // (pra aparecer como último item); ao fechar, devolve pro home original.
  if (active && nav && !nav.contains(langBtn)) nav.appendChild(langBtn);
  else if (!active && langHome && !langHome.contains(langBtn)) langHome.appendChild(langBtn);
}

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  const active = nav.classList.toggle('active');
  syncLangPosition(active);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('active');
  nav.classList.remove('active');
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
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) scrollTo({ top: t.offsetTop - 56, behavior: 'smooth' });
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
   ARIA METHOD — interactive flow diagram
   ============================================ */
(function() {
  const ARIA_DATA = [
    {
      num: '01 / 04', letter: 'D', title: 'Diagnóstico',
      subtitle: 'Entender antes de agir.',
      desc: 'Mapeamos fluxos reais, medimos onde a operação sangra e identificamos onde a IA vai gerar tração. Sem contexto, toda tecnologia vira custo — por isso nada é configurado antes desse passo.',
      bullets: [
        'Mapeamento do processo comercial',
        'Identificação de perdas invisíveis',
        'Entrevistas com time e gestão',
        'Priorização por impacto e viabilidade',
        'Mapa de oportunidades acionáveis'
      ],
      time: '⏱ 1 a 2 semanas',
      tag: 'Contexto antes de ferramenta.',
      result: 'Entregável: mapa de oportunidades priorizadas'
    },
    {
      num: '02 / 04', letter: 'E', title: 'Estruturação',
      subtitle: 'Preparamos o terreno antes de plantar inteligência.',
      desc: 'Reorganizamos processos, definimos KPIs mensuráveis e desenhamos a arquitetura dos agentes. IA em cima de caos é caos acelerado — por isso estruturamos primeiro.',
      bullets: [
        'Arquitetura dos agentes e fluxos',
        'KPIs mensuráveis e metas concretas',
        'Projeção de ROI por frente',
        'Escolha de stack e integrações',
        'Cronograma com marcos semanais'
      ],
      time: '⏱ 1 a 2 semanas',
      tag: 'Processo antes de inteligência.',
      result: 'Entregável: blueprint técnico + plano de resultados'
    },
    {
      num: '03 / 04', letter: 'I', title: 'Implementação',
      subtitle: 'Inteligência integrada onde gera impacto.',
      desc: 'Construímos agentes sob medida e integramos à operação que você já usa. Testamos em produção, ajustamos com o time e só escalamos quando o resultado é comprovado — nada lançado no escuro.',
      bullets: [
        'Construção sob medida dos agentes',
        'Integração com as ferramentas já em uso',
        'Validação em produção antes da escala',
        'Treinamento e onboarding do time',
        'ROI visível já no 1º mês'
      ],
      time: '⏱ 3 a 6 semanas',
      tag: 'Execução onde dá resultado.',
      result: 'Entregável: sistema funcionando em produção'
    },
    {
      num: '04 / 04', letter: 'A', title: 'Acompanhamento',
      subtitle: 'Cliente BMAi vira parceiro — não só mais um.',
      desc: 'Monitoramos indicadores, ajustamos prompts e lógica conforme o negócio evolui e você tem acesso ao nosso SaaS interno de métricas. Se a gente construiu, a gente mantém.',
      bullets: [
        'Monitoramento contínuo de indicadores',
        'Ajuste de prompts conforme o negócio evolui',
        'Suporte direto ao time',
        'Acesso ao SaaS interno da BMAi',
        'Expansão gradual das soluções'
      ],
      time: '⏱ Contínuo',
      tag: 'Se construímos, sustentamos.',
      result: 'Entregável: dashboard mensal + acesso ao SaaS BMAi'
    }
  ];

  const nodes  = document.querySelectorAll('.aria-node');
  const detail = document.getElementById('aria-detail');
  const inner  = document.getElementById('aria-detail-inner');
  if (!nodes.length || !detail || !inner) return;

  let current = -1;
  let animating = false;

  function renderDetail(d) {
    return `
      <div class="aria-detail-grid">
        <div class="aria-detail-left">
          <div class="aria-detail-num">${d.num}</div>
          <div class="aria-detail-letter">${d.letter}</div>
          <h3 class="aria-detail-title">${d.title}</h3>
          <div class="aria-detail-subtitle">${d.subtitle}</div>
          <p class="aria-detail-desc">${d.desc}</p>
        </div>
        <div class="aria-detail-right">
          <ul class="aria-detail-bullets">
            ${d.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
          <div class="aria-detail-footer">
            <span class="aria-detail-tag">${d.tag}</span>
            <span class="aria-detail-time">${d.time}</span>
            <span class="aria-detail-result">${d.result}</span>
          </div>
        </div>
      </div>
    `;
  }

  function activate(index, opts) {
    opts = opts || {};
    if (animating && !opts.force) return;
    if (index === current) {
      if (opts.noToggle) return;    /* Trigger externo nunca fecha */
      nodes[index].classList.remove('active');
      detail.classList.remove('open');
      current = -1;
      return;
    }
    animating = true;
    current = index;
    nodes.forEach((n, i) => n.classList.toggle('active', i === index));

    if (detail.classList.contains('open')) {
      inner.style.opacity = '0';
      inner.style.transform = 'translateY(12px)';
      setTimeout(() => {
        inner.innerHTML = renderDetail(ARIA_DATA[index]);
        inner.style.opacity = '';
        inner.style.transform = '';
        animating = false;
      }, 300);
    } else {
      inner.innerHTML = renderDetail(ARIA_DATA[index]);
      detail.classList.add('open');
      setTimeout(() => { animating = false; }, 600);
    }
  }

  // ARIA + semantic role
  nodes.forEach((node, i) => {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-pressed', 'false');
    node.setAttribute('aria-controls', 'aria-detail');
  });
  function syncPressed() {
    nodes.forEach((n, i) => n.setAttribute('aria-pressed', i === current ? 'true' : 'false'));
  }

  // Touch detection
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  let enterTimer = null;

  nodes.forEach((node, i) => {
    if (!isTouch) {
      node.addEventListener('mouseenter', () => {
        clearTimeout(enterTimer);
        enterTimer = setTimeout(() => { activate(i); syncPressed(); }, 120);
      });
      node.addEventListener('mouseleave', () => clearTimeout(enterTimer));
      node.addEventListener('focus', () => {
        clearTimeout(enterTimer);
        if (current !== i) { activate(i); syncPressed(); }
      });
    }
    // Click funciona sempre (desktop bypass delay, touch único gatilho)
    node.addEventListener('click', () => {
      clearTimeout(enterTimer);
      activate(i); syncPressed();
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clearTimeout(enterTimer);
        activate(i); syncPressed();
      }
    });
  });

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(() => { activate(0); syncPressed(); }, 400);
      io.disconnect();
    }
  }, { threshold: 0.4 });
  io.observe(document.getElementById('metodo'));

  /* Trigger externo (ex: scroll-hijack) — nunca fecha, só troca */
  document.addEventListener('metodo:set', (e) => {
    const i = e.detail && e.detail.index;
    if (typeof i === 'number') { activate(i, { noToggle: true, force: true }); syncPressed(); }
  });

  /* Swipe horizontal pra navegar entre as 4 etapas DEIA (touch devices) */
  const metodoSection = document.getElementById('metodo');
  if (metodoSection && IS_TOUCH) {
    let sx = 0, sy = 0;
    metodoSection.addEventListener('touchstart', e => {
      const t = e.changedTouches[0];
      sx = t.clientX; sy = t.clientY;
    }, { passive: true });
    metodoSection.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      // threshold 60px + dominante horizontal (não interfere em scroll vertical)
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
      const dir = dx < 0 ? 1 : -1; // swipe left → next, right → prev
      const n = (current + dir + nodes.length) % nodes.length;
      activate(n);
      syncPressed();
    }, { passive: true });
  }
})();

/* ============================================
   SCROLL HIJACK — lock de verdade estilo Framer
   Desktop only. Touch/reduced-motion caem no fallback sticky+progress.
   ============================================ */
(function() {
  if (IS_TOUCH || PREFERS_REDUCE) return;

  const configs = [
    { sel: '.qs-pinned',     stack: '.card-stack', distance: 1600 },
    { sel: '.metodo-pinned', nodes: '.aria-node',  distance: 1800 },
  ];

  const targets = configs
    .map(c => ({ ...c, node: document.querySelector(c.sel) }))
    .filter(c => c.node);
  if (!targets.length) return;

  let lock = null;
  /* lock = { target, progress, anchorY } */

  function tryAcquireLock(deltaY) {
    if (lock) return;
    const vh = window.innerHeight;
    for (const t of targets) {
      const rect = t.node.getBoundingClientRect();
      /* Captura quando a section ocupa bem a tela: top <= 10 e ainda tem
         pelo menos 60% de bottom visível. Alargado pra não perder scroll rápido. */
      if (rect.top <= 10 && rect.bottom > vh * 0.6) {
        if (deltaY > 0 && rect.top > -30) {
          /* Entrada por cima: snap no topo da section */
          lock = { target: t, progress: 0, anchorY: window.scrollY + rect.top };
          t.node.classList.add('lock-active');
          window.scrollTo(0, lock.anchorY);
          return;
        }
        if (deltaY < 0 && rect.top < -30) {
          /* Entrada por baixo (scroll reverso): snap no topo tb mas com
             progress no máximo pra começar a regredir */
          lock = {
            target: t,
            progress: t.distance,
            anchorY: window.scrollY + rect.top,
          };
          t.node.classList.add('lock-active');
          window.scrollTo(0, lock.anchorY);
          return;
        }
      }
    }
  }

  function releaseLock(direction) {
    if (!lock) return;
    lock.target.node.classList.remove('lock-active');
    const anchorY = lock.anchorY;
    const vh = window.innerHeight;
    lock = null;
    /* Nudge pra sair do zone de captura na direção certa */
    if (direction > 0) window.scrollTo(0, anchorY + vh + 2);
    else window.scrollTo(0, anchorY - 2);
  }

  function applyProgress() {
    if (!lock) return;
    const t = Math.max(0, Math.min(1, lock.progress / lock.target.distance));

    if (lock.target.stack) {
      const stack = lock.target.node.querySelector(lock.target.stack);
      if (stack) stack.style.setProperty('--progress', t.toFixed(3));
    }

    if (lock.target.nodes) {
      /* Mapeia progress pra um dos 4 nodes DEIA */
      const ns = lock.target.node.querySelectorAll(lock.target.nodes);
      if (ns.length) {
        const idx = Math.min(ns.length - 1, Math.floor(t * ns.length));
        if (idx !== lock.lastIdx) {
          lock.lastIdx = idx;
          document.dispatchEvent(new CustomEvent('metodo:set', { detail: { index: idx } }));
        }
      }
    }
  }

  addEventListener('wheel', (e) => {
    /* Sem lock ativo: tenta capturar quando a section encosta */
    if (!lock) { tryAcquireLock(e.deltaY); if (!lock) return; }

    e.preventDefault();
    lock.progress += e.deltaY;

    if (lock.progress < 0) { releaseLock(-1); return; }
    if (lock.progress >= lock.target.distance) { releaseLock(1); return; }

    /* Mantém a página congelada no ponto de ancoragem */
    window.scrollTo(0, lock.anchorY);
    applyProgress();
  }, { passive: false });

  /* Libera lock se o user apertar tecla, clicar ou mexer em hash */
  addEventListener('keydown', (e) => {
    if (!lock) return;
    if (['Escape','Tab','Home','End','PageUp','PageDown','ArrowUp','ArrowDown',' '].includes(e.key)) {
      releaseLock(e.key === 'PageUp' || e.key === 'Home' || e.key === 'ArrowUp' ? -1 : 1);
    }
  });
})();

/* ============================================
   CARD STACK — swap on scroll progress (fallback pra touch/reduce-motion
   e pra quando o scroll-hijack ainda não capturou o lock)
   ============================================ */
(function() {
  const stacks = document.querySelectorAll('.card-stack');
  if (!stacks.length) return;

  function update() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    stacks.forEach(stack => {
      const section = stack.closest('section') || stack.parentElement;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - vh;
      let progress;
      if (scrollable > 40) {
        /* Pinned section: 0 = topo acabou de encostar, 1 = fim do pin */
        progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      } else {
        const total = rect.height + vh;
        const passed = vh - rect.top;
        progress = Math.max(0, Math.min(1, passed / total));
      }
      /* Zonas de scroll dentro do pin:
           0.00 – 0.25: card 1 puro (trava na tela antes de nada acontecer)
           0.25 – 0.60: transição card 1 → card 2
           0.60 – 1.00: card 2 puro (segura preso antes de liberar scroll) */
      const t = Math.max(0, Math.min(1, (progress - 0.25) / 0.35));
      stack.style.setProperty('--progress', t.toFixed(3));
      stack.classList.toggle('flipped', t > 0.5);
    });
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => { update(); raf = 0; });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();
})();

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

  const btnDefaultHTML = 'Enviar para Anna <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
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

      showFeedback('success', 'Recebido! A Anna vai entrar em contato em até 24h.');
      form.reset();
    } catch (err) {
      console.error('[bmai-form] Falha no envio:', err);
      showFeedback('error', 'Não conseguimos enviar agora. Tente novamente em instantes ou chame a Anna no WhatsApp.');
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

/* ============================================
   CURSOR TRAIL — ring com lerp
   ============================================ */
(function() {
  if (LOW_MOTION || IS_TOUCH || IS_MOBILE) return;
  const trail = document.getElementById('cur-trail');
  if (!trail) return;

  let tx = innerWidth / 2, ty = innerHeight / 2;
  let rx = tx, ry = ty;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
  }, { passive: true });

  (function lerp() {
    rx += (tx - rx) * 0.12;
    ry += (ty - ry) * 0.12;
    trail.style.left = rx + 'px';
    trail.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  document.addEventListener('mousedown', () => {
    document.body.classList.add('ct-click');
    setTimeout(() => document.body.classList.remove('ct-click'), 300);
  });

  const hoverSel = 'a, button, .aria-node, .ac-card, .sd, .nav-cta, .nav-links a, .team-card-wrap, .faq-q, .book-wrap';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ct-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ct-hover'));
  });

  document.querySelectorAll('p, h1, h2, h3, li, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ct-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ct-text'));
  });

  document.addEventListener('mouseleave', () => trail.style.opacity = '0');
  document.addEventListener('mouseenter', () => trail.style.opacity = '1');
})();

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
