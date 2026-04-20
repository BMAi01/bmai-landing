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
burger.addEventListener('click', () => { burger.classList.toggle('active'); nav.classList.toggle('active'); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('active'); nav.classList.remove('active'); }));

/* ============================================
   HEADER
   ============================================ */
const header = document.getElementById('header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), { passive: true });

/* ============================================
   SCROLL PROGRESS
   ============================================ */
const progress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  if (h > 0) progress.style.width = (scrollY / h * 100) + '%';
}, { passive: true });

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
   COUNTERS
   ============================================ */
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

/* ============================================
   MANIFESTO — staggered reveal
   ============================================ */
const mObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); mObs.unobserve(e.target); } });
}, { threshold: .2 });
document.querySelectorAll('.manifesto__line').forEach((l, i) => {
  l.style.transitionDelay = i * .14 + 's';
  mObs.observe(l);
});

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
   TEAM — flip on hover (touch fallback)
   ============================================ */
(function () {
  if (matchMedia('(pointer:coarse)').matches) {
    document.querySelectorAll('.team-card-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => wrap.classList.toggle('flipped'));
    });
  }
})();

/* ============================================
   ARIA METHOD — interactive flow diagram
   ============================================ */
(function() {
  const ARIA_DATA = [
    {
      num: '01 / 04', letter: 'A', title: 'Análise',
      subtitle: 'Diagnóstico antes de qualquer ferramenta.',
      desc: 'Enxergamos o seu negócio como ele realmente é — único. Mapeamos os entraves, as perdas invisíveis e as oportunidades reais. Nada é configurado antes de entender o contexto completo.',
      bullets: [
        'Mapeamento do processo comercial',
        'Identificação de perdas invisíveis',
        'Entrevistas com time e gestão',
        'Relatório de oportunidades prioritárias',
        'Priorização por impacto e viabilidade'
      ],
      time: '⏱ 1 a 2 semanas',
      tag: 'Sem diagnóstico, não há solução real.',
      result: 'Entregável: documento de diagnóstico completo'
    },
    {
      num: '02 / 04', letter: 'I', title: 'Implementação',
      subtitle: 'IA onde gera resultado, não onde impressiona.',
      desc: 'Construímos e integramos as soluções nos pontos validados. Cada etapa é testada em produção e ajustada com o time antes de ir para escala. É aqui que começam as primeiras mudanças na cultura e no modo de pensar da empresa.',
      bullets: [
        'Construção sob medida dos agentes e fluxos',
        'Integração com as ferramentas que você já usa',
        'Testes em produção antes da escala',
        'Treinamento e onboarding do time',
        'Primeiras mudanças de cultura operacional'
      ],
      time: '⏱ 3 a 6 semanas',
      tag: 'IA integrada ao processo real.',
      result: 'Entregável: sistema funcionando em produção'
    },
    {
      num: '03 / 04', letter: 'R', title: 'Resultado',
      subtitle: 'ROI mais rápido do mercado — porque é análise e personalização, não milagre.',
      desc: 'Definimos os resultados esperados com indicadores concretos. Cada ação tem um número atrelado — sem achismo, sem promessa vazia. É o mapeamento bem feito que permite retorno no primeiro mês.',
      bullets: [
        'Definição de KPIs e metas mensuráveis',
        'Projeção de ROI por frente de atuação',
        'Alinhamento de expectativas com o time',
        'Validação do plano de ação antes de executar',
        'Retorno visível já no primeiro mês'
      ],
      time: '⏱ 1 a 2 semanas',
      tag: 'Sem meta clara, não há resultado real.',
      result: 'Entregável: plano de resultados com KPIs definidos'
    },
    {
      num: '04 / 04', letter: 'A', title: 'Acompanhamento',
      subtitle: 'Não vamos te deixar desamparado. Se construímos, vamos manter.',
      desc: 'Monitoramos indicadores, ajustamos prompt e lógica conforme o negócio evolui e garantimos que o resultado se sustente no longo prazo. Você ainda tem acesso ao nosso SaaS interno de acompanhamento de métricas — fechou com a BMAi, vira parceiro, não só mais um cliente.',
      bullets: [
        'Monitoramento de indicadores mensais',
        'Melhorias contínuas de prompt e lógica',
        'Ajustes conforme o negócio evolui',
        'Suporte contínuo ao time',
        'Acesso ao SaaS interno da BMAi',
        'Expansão gradual das soluções'
      ],
      time: '⏱ Contínuo',
      tag: 'Crescimento de longo prazo.',
      result: 'Entregável: relatório mensal de performance + SaaS de acompanhamento'
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

  function activate(index) {
    if (animating) return;
    if (index === current) {
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

  nodes.forEach((node, i) => {
    node.addEventListener('click', () => activate(i));
  });

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(() => activate(0), 400);
      io.disconnect();
    }
  }, { threshold: 0.4 });
  io.observe(document.getElementById('metodo'));
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
  if (isMobile) {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.getAll().forEach(t => t.kill());
    return;
  }

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

  // 1) Hero — entrada da imagem (slide da esquerda) + parallax
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && !isMobile) {
    gsap.fromTo(heroVisual,
      { xPercent: -130, opacity: 0 },
      {
        xPercent: 0, opacity: 1, duration: 1.6, ease: 'power4.out', delay: .3,
        onComplete: () => heroVisual.classList.add('entered')
      }
    );
  } else if (heroVisual) {
    heroVisual.classList.add('entered');
  }

  // 2) ARIA slides — sem GSAP de entrada (CSS classes controlam tudo, evita jitter no hover)

  // 3) Team flip cards — pin + scrub: cada card vira 180° conforme rola (stagger)
  const teamPin = document.getElementById('team-pin');
  const teamCards = document.querySelectorAll('.team-card');
  if (teamPin && teamCards.length) {
    // Entrada suave dos wraps (fade up) antes do pin
    gsap.fromTo('.team-card-wrap',
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: teamPin, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );

    // Pin + scrub: timeline que gira cada card
    const flipTl = gsap.timeline({
      scrollTrigger: {
        trigger: teamPin,
        start: 'center center',
        end: '+=300%',
        pin: true,
        scrub: 1.5,
        anticipatePin: 1
      }
    });
    teamCards.forEach((card, i) => {
      flipTl.to(card, {
        rotationY: 180,
        ease: 'power2.inOut',
        duration: 1
      }, i * 0.35);
    });
  }

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

/* Partículas flutuantes globais */
(function() {
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

  const N = window.matchMedia('(max-width:768px)').matches ? 15 : 30;
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
  if (window.matchMedia('(pointer:coarse)').matches) return;
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
