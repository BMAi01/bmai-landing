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
    // O botão já nasce com aria-expanded="false" no HTML. Quem usa leitor de
    // tela só sabe que o menu abriu se esse atributo acompanhar o estado.
    function setNav(open) {
      burger.classList.toggle('active', open);
      nav.classList.toggle('active', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    burger.addEventListener('click', function () {
      setNav(!nav.classList.contains('active'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) setNav(false);
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
  var podeAnimar = !REDUCE && 'IntersectionObserver' in window;
  var io = null;

  if (podeAnimar) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }

  /* Varre um trecho da página e põe os `.rise` dele na fila de entrada.
     Existe como função, e não como um laço solto no load, porque nem todo
     conteúdo da subpágina está no HTML: a página de leitura do radar monta
     o artigo inteiro DEPOIS do fetch, e nessa hora o observador já rodou.
     Sem isto, o único conteúdo do site que não tinha entrada nenhuma era
     justamente o que chega do agente. Mesmo caminho que o
     `BMAiComentarios.varrer()` já usava. */
  function varrer(raiz) {
    var alvos = (raiz || document).querySelectorAll('.rise:not(.is-in)');
    if (!alvos.length) return;
    if (!podeAnimar) {
      // Sem observador ou com menos movimento pedido: nada some, nada anima.
      return;
    }
    // Só esconde depois de confirmar que dá pra revelar. Sem JS, sem suporte
    // ou com reduced-motion, a página nasce visível.
    document.documentElement.classList.add('js-rise');

    alvos.forEach(function (el, i) {
      // Escada curta dentro de cada grupo, não na página inteira
      var step = parseInt(el.getAttribute('data-stagger') || i % 4, 10);
      el.style.setProperty('--d', (step * 0.07) + 's');
      io.observe(el);
    });

    // Rede de segurança: se por qualquer motivo o observador não disparar
    // (aba em background, restauração de scroll, bug de engine), o conteúdo
    // aparece assim mesmo. Texto invisível é pior que texto sem animação.
    setTimeout(function () {
      alvos.forEach(function (el) { el.classList.add('is-in'); });
    }, 4000);
  }

  varrer(document);
  window.BMAiMotion = { varrer: varrer };

  /* ---------- Pista de rolagem horizontal ----------
     Duas coisas da subpágina rolam de lado no celular: a tabela
     comparativa do artigo e a fila de chips do blog. As duas terminavam
     numa aresta reta, igualzinha a "acabou aqui" — e ninguém arrasta o que
     não parece ter continuação. Medido em 320, 360, 390 e 430.

     O que apaga a palavra cortada na borda é máscara, e máscara não sabe
     onde a rolagem está. Então quem sabe é isto aqui: dois números, um por
     lado, escritos como variável de CSS. Zero de um lado = acabou aquele
     lado, e a máscara não faz nada ali. Ver `.rola` no blog.css. */
  var LADO = 38;                                  // px de desvanecer
  [].forEach.call(document.querySelectorAll('.article__table-wrap, .bl-filters'), function (caixa) {
    function medir() {
      var sobra = caixa.scrollWidth - caixa.clientWidth;
      if (sobra <= 2) {                           // cabe inteiro: sem pista
        caixa.classList.remove('rola');
        return;
      }
      caixa.classList.add('rola');
      var x = caixa.scrollLeft;
      caixa.style.setProperty('--rola-esq', (x > 4 ? LADO : 0) + 'px');
      caixa.style.setProperty('--rola-dir', (x < sobra - 4 ? LADO : 0) + 'px');
    }
    caixa.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    // A tabela e as chips mudam de largura quando a fonte carrega e quando
    // o filtro esconde uma chip, não só quando a janela muda.
    if (window.ResizeObserver) new ResizeObserver(medir).observe(caixa);
    medir();
  });

  /* ---------- Números que sobem ----------
     Vale pra qualquer `[data-conta]` da subpágina. O valor final é o que já
     está escrito no HTML: se o JS não rodar, o número correto continua na
     tela — mesmo princípio do `.rise`, que nasce visível.

     Conta uma vez só, quando entra na tela, e nunca em quem pediu menos
     movimento. A curva é a de saída (`easeOutCubic`): o número chega perto
     do valor rápido e assenta devagar, que é como se lê um contador. Uma
     curva linear parece cronômetro. */
  var contadores = document.querySelectorAll('[data-conta]');
  if (contadores.length && !REDUCE && 'IntersectionObserver' in window) {
    var ioNum = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        ioNum.unobserve(entry.target);
        contar(entry.target);
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (el) { ioNum.observe(el); });
  }

  function contar(el) {
    var bruto = el.textContent.trim();
    // Preserva o que vem junto do número (o "+", o "%", o "mil").
    var casa = bruto.match(/-?[\d.,]+/);
    if (!casa) return;
    var alvo = parseFloat(casa[0].replace(/\./g, '').replace(',', '.'));
    if (!isFinite(alvo)) return;
    var antes = bruto.slice(0, casa.index);
    var depois = bruto.slice(casa.index + casa[0].length);
    var decimais = (casa[0].split(',')[1] || '').length;
    var dur = 900, t0 = 0;

    function passo(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var v = alvo * e;
      el.textContent = antes + v.toLocaleString('pt-BR', {
        minimumFractionDigits: decimais, maximumFractionDigits: decimais,
      }) + depois;
      if (p < 1) requestAnimationFrame(passo);
      else el.textContent = bruto;      // fecha exatamente no valor escrito
    }
    requestAnimationFrame(passo);
  }

  /* ---------- Vídeo decorativo e quem pediu menos movimento ----------
     CSS não para vídeo. Quem marcou "reduzir movimento" no sistema fica
     com o poster parado, que é o mesmo quadro: nada de conteúdo se perde. */
  if (REDUCE) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.autoplay = false;
      v.removeAttribute('autoplay');
      v.pause();
    });
  }

  /* ---------- Ano do rodapé ---------- */
  var year = document.getElementById('footerYear');
  if (year) year.textContent = new Date().getFullYear();
})();
