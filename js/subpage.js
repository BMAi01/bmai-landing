/* ============================================================
   subpage.js — comportamento das páginas internas (blog, artigos)
   ------------------------------------------------------------
   O main.js do site espera o DOM da home (hero, Three.js, cases,
   Lenis, i18n). Aqui roda só o que a subpágina precisa, com as
   MESMAS classes do site pra o header se comportar igual:
     - burger abre/fecha o .floatnav
     - barra de progresso de scroll
     - .header.scrolled
     - reveal de entrada (um momento só, e nunca esconde
       conteúdo se o JS falhar ou se o usuário pedir menos motion)
     - ano do rodapé
   ============================================================ */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('active');
      var open = nav.classList.toggle('active');
      document.body.classList.toggle('nav-open', open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        burger.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  }

  /* ---------- Header + progresso de scroll ---------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('scrollProgress');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (header) header.classList.toggle('scrolled', y > 40);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Entrada dos cards ----------
     Classe `.rise`, NÃO `.reveal`: o style.css tem uma `.reveal` global que
     zera a opacidade e espera `.revealed` do main.js. */
  var targets = document.querySelectorAll('.rise');
  if (targets.length && !REDUCE && 'IntersectionObserver' in window) {
    // Só esconde depois de confirmar que o observer existe: sem JS,
    // sem suporte ou com reduced-motion, a página nasce visível.
    document.documentElement.classList.add('js-rise');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el, i) {
      // Escada curta dentro de cada grupo, não na página inteira
      var step = parseInt(el.getAttribute('data-stagger') || i % 4, 10);
      el.style.setProperty('--d', (step * 0.07) + 's');
      io.observe(el);
    });

    // Rede de segurança: se por qualquer motivo o observer não disparar
    // (aba em background, restauração de scroll, bug de engine), o conteúdo
    // aparece assim mesmo. Texto invisível é pior que texto sem animação.
    setTimeout(function () {
      io.disconnect();
      targets.forEach(function (el) { el.classList.add('is-in'); });
    }, 4000);
  }

  /* ---------- Ano do rodapé ---------- */
  var year = document.getElementById('footerYear');
  if (year) year.textContent = new Date().getFullYear();
})();
