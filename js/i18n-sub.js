/* ============================================
   I18N das SUBPÁGINAS (blog, artigo, SEO, jurídicas, radar, edição)
   ============================================

   A home tem o `i18n.js`, com dicionário de CHAVE ("hero.title") escrito à mão
   dentro do arquivo. Aqui a conta é outra: são 11 páginas de texto corrido, e
   pôr `data-i18n` em cada parágrafo significaria cirurgia em HTML que já está
   indexado. Então a chave É o texto em português.

   Como funciona:
   1. Varre os blocos de texto FOLHA (parágrafo, título, item de lista, célula
      de tabela...), ou seja, os que não contêm outro bloco dentro. Assim
      `<blockquote><p>` é traduzido uma vez, no `p`, e a tag interna (`<strong>`,
      `<a>`) viaja dentro da própria tradução.
   2. A chave é o innerHTML normalizado em português. O original fica guardado
      no próprio elemento, então dá pra ir de russo pra francês sem recarregar.
   3. O dicionário do idioma escolhido é BAIXADO na hora da troca
      (`i18n/<pagina>.json`). Quem fica em português não baixa nada: a página
      servida já é a versão dele, e o Google continua lendo o HTML em português.

   O que NÃO é traduzido, de propósito: post e notícia que vêm da API
   (`api.bmai.com.br`) chegam em português e não estão neste dicionário. A
   moldura em volta deles é.
   ============================================ */
(function () {
  'use strict';

  /* Versao dos dicionarios. O .htaccess serve .json com um mes de cache, entao
     mexeu no conteudo de i18n/*.json, sobe isto E o ?v= deste arquivo no HTML. */
  var VERSAO = '20260820-rev2';

  var CHAVE_LS = 'bmai-lang';
  var IDIOMAS = ['pt', 'en', 'es', 'it', 'fr', 'zh', 'ru'];
  var HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es', it: 'it', fr: 'fr', zh: 'zh-Hans', ru: 'ru' };
  var ROTULO = { pt: 'PT', en: 'EN', es: 'ES', it: 'IT', fr: 'FR', zh: 'ZH', ru: 'RU' };

  /* Blocos de texto. Ordem não importa: o filtro de folha resolve o aninhamento. */
  var SEL = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,th,td,figcaption,blockquote,summary,' +
            '.floatnav__text,.floatnav__cta-text,.btn,.article__back,.bl-seeall,' +
            '.article__eyebrow,.article__meta,.bl-chip,.bl-side__title,button,' +
            /* rodape: o texto mora em span dentro de link, entao o link inteiro
               (com SVG de rede social) viraria chave se parassemos no <li>. */
            '.footer__col h3 span,.footer__links a,.footer__social a span,' +
            '.footer__backtop,.footer__kind,' +
            /* Blocos que carregam um contador escrito por JS ao lado do rotulo:
               traduzir o bloco inteiro devolveria o "0" do HTML por cima da
               contagem real. Aqui a chave e' so o rotulo. */
            '.bl-cat > span:first-child,#blMoreLabel,.bl-com__aba-txt,' +
            /* Cartao do blog: titulo e etiqueta moram em <span> dentro do link,
               entao sem estes seletores a folha seria o link inteiro (com foto). */
            '.bl-tag,.bl-row__tag,.bl-row__title,.bl-hl__title,.bl-card__title,' +
            '.bl-hero__title,.bl-news__title,.bl-widget__title,.bl-radar__title,' +
            /* Encontrados pela auditoria de cobertura: caixa de aviso do
               juridico, numeros de resultado das paginas de SEO e o miolo do
               cartao do blog (data, resumo e chamada). */
            '.article__note,.article__stat-lbl,.article__stat-val,' +
            '.bl-card__meta,.bl-card__excerpt,.bl-card__link,.bl-eyebrow,' +
            '.bl-row__meta,.bl-row__dek,.bl-hl__date,.bl-hl__dek,.bl-news__meta';
  /* Nunca traduzir: marca, código, e o que a API escreveu. */
  var IGNORAR = '[data-i18n-off],.nav-logo,code,pre,script,style,#lang-dropdown,.lang-opt,.lang-trigger';

  var DICTS = {};          // { fr: { 'texto pt': 'texte fr' }, ... }
  var baixando = {};       // promessas em voo, uma por idioma
  var lang = 'pt';
  var observador = null;

  function norm(s) {
    return String(s).replace(/\s+/g, ' ').trim();
  }

  /* Icone dentro de bloco de texto ("Voltar ao topo" + seta, "WhatsApp" + logo)
     nao tem por que ser traduzido nem repetido em 6 idiomas. Sai da chave como
     um marcador e volta ao lugar na hora de escrever. */
  var RE_SVG = /<svg[\s\S]*?<\/svg>/gi;

  function partir(html) {
    var svgs = [];
    var txt = String(html).replace(RE_SVG, function (m) {
      svgs.push(m);
      return '\u27ea' + (svgs.length - 1) + '\u27eb';
    });
    return { txt: norm(txt), svgs: svgs };
  }

  function juntar(txt, svgs) {
    return String(txt).replace(/\u27ea(\d+)\u27eb/g, function (m, i) {
      return svgs[i] != null ? svgs[i] : m;
    });
  }

  function temLetra(s) {
    return /[a-zA-ZÀ-ÿЀ-ӿ一-鿿]/.test(s);
  }

  function blocos(raiz) {
    var todos = raiz.querySelectorAll(SEL);
    var fora = [];
    for (var i = 0; i < todos.length; i++) {
      var el = todos[i];
      if (el.querySelector(SEL)) continue;          // não é folha
      if (el.closest(IGNORAR)) continue;
      var t = norm(el.textContent);
      if (!t || !temLetra(t)) continue;
      fora.push(el);
    }
    return fora;
  }

  /* Atributos que o visitante lê mas não aparecem como texto na página. */
  function atributos(raiz) {
    var fora = [];
    var lista = raiz.querySelectorAll('[aria-label],[placeholder],[data-i18n-title]');
    for (var i = 0; i < lista.length; i++) {
      var el = lista[i];
      if (el.closest('[data-i18n-off]')) continue;
      ['aria-label', 'placeholder'].forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && temLetra(v)) fora.push([el, a, norm(v)]);
      });
    }
    return fora;
  }

  /* Nome do arquivo de dicionário a partir da URL. Em produção as páginas são
     servidas sem extensão (/termos); em teste local elas têm .html. */
  function pagina() {
    var p = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index';
    return p.replace(/\.html$/i, '');
  }

  function baixar(l) {
    if (l === 'pt' || DICTS[l]) return Promise.resolve();
    if (baixando[l]) return baixando[l];
    var url = 'i18n/' + pagina() + '.json?v=' + VERSAO;
    baixando[l] = fetch(url, { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) {
        for (var k in j) if (!DICTS[k]) DICTS[k] = j[k];
        if (!DICTS[l]) DICTS[l] = {};
      })
      .catch(function () { DICTS[l] = {}; });
    return baixando[l];
  }

  function aplicar() {
    var d = DICTS[lang] || {};
    document.documentElement.lang = HTML_LANG[lang] || 'pt-BR';

    blocos(document.body).forEach(function (el) {
      var pt = el.__ptI18n;
      /* Outro script pode ter reescrito este bloco depois de nos ("Ver menos",
         "Enviando...", aviso do formulario). Nesse caso o que esta na tela e'
         portugues de novo, entao a chave e' recalculada a partir dele. */
      var reescrito = pt !== undefined && el.__htmlI18n !== undefined &&
                      el.innerHTML !== el.__htmlI18n;
      if (pt === undefined || reescrito) pt = el.__ptI18n = partir(el.innerHTML);
      else if (el.__langI18n === lang) return;
      var alvo = (lang === 'pt') ? pt.txt : (d[pt.txt] != null ? d[pt.txt] : pt.txt);
      el.innerHTML = juntar(alvo, pt.svgs);
      el.__htmlI18n = el.innerHTML;
      el.__langI18n = lang;
    });

    atributos(document.body).forEach(function (par) {
      var el = par[0], attr = par[1], atual = par[2];
      var mapa = el.__ptAttr || (el.__ptAttr = {});
      if (mapa[attr] === undefined) mapa[attr] = atual;
      var pt = mapa[attr];
      var alvo = (lang === 'pt') ? pt : (d['@' + pt] != null ? d['@' + pt] : pt);
      if (el.getAttribute(attr) !== alvo) el.setAttribute(attr, alvo);
    });

    if (!document.__ptTitulo) document.__ptTitulo = document.title;
    document.title = (lang === 'pt') ? document.__ptTitulo
      : (d['@title:' + document.__ptTitulo] || document.__ptTitulo);

    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      if (!desc.__pt) desc.__pt = desc.getAttribute('content') || '';
      var dv = (lang === 'pt') ? desc.__pt : (d['@desc:' + desc.__pt] || desc.__pt);
      if (desc.getAttribute('content') !== dv) desc.setAttribute('content', dv);
    }

    window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: lang } }));
  }

  /* Conteúdo que chega depois (post e notícia da API) entra no DOM sem passar
     pelo primeiro apply. O observador só liga fora do português, porque em
     português não há nada a fazer. */
  function observar() {
    if (observador || !window.MutationObserver) return;
    var pendente = null;
    observador = new MutationObserver(function () {
      clearTimeout(pendente);
      pendente = setTimeout(function () { if (lang !== 'pt') aplicar(); }, 120);
    });
    observador.observe(document.body, { childList: true, subtree: true });
  }

  var API = {
    get lang() { return lang; },
    idiomas: IDIOMAS,
    dict: DICTS,
    set: function (l) {
      if (IDIOMAS.indexOf(l) < 0 || l === lang) return Promise.resolve();
      lang = l;
      try { localStorage.setItem(CHAVE_LS, l); } catch (e) {}
      return baixar(l).then(function () { aplicar(); if (l !== 'pt') observar(); });
    },
    varrer: aplicar,
    init: function () {
      var salvo = null;
      try { salvo = localStorage.getItem(CHAVE_LS); } catch (e) {}
      var l = (salvo && IDIOMAS.indexOf(salvo) >= 0) ? salvo : 'pt';
      if (l === 'pt') { lang = 'pt'; ligarSeletor(); return; }
      lang = l;
      baixar(l).then(function () { aplicar(); observar(); });
      ligarSeletor();
    },
    /* Usado pelo extrator: devolve o português da página, que é a chave. */
    coletar: function () {
      var fora = {};
      blocos(document.body).forEach(function (el) {
        var pt = el.__ptI18n !== undefined ? el.__ptI18n : partir(el.innerHTML);
        if (pt.txt) fora[pt.txt] = '';
      });
      atributos(document.body).forEach(function (par) {
        var mapa = par[0].__ptAttr || {};
        var pt = mapa[par[1]] !== undefined ? mapa[par[1]] : par[2];
        if (pt) fora['@' + pt] = '';
      });
      fora['@title:' + (document.__ptTitulo || document.title)] = '';
      var desc = document.querySelector('meta[name="description"]');
      if (desc) fora['@desc:' + (desc.__pt || desc.getAttribute('content') || '')] = '';
      return fora;
    }
  };

  /* ---------- seletor de idioma ----------
     Mesmo componente da home. Nas subpáginas o `.lang-btn` mora DENTRO do
     `.floatnav`: no computador ele é `position: fixed` e flutua no canto de
     qualquer jeito, e no celular ele já nasce onde o drawer espera, sem
     precisar de JS movendo elemento de lugar (o que o `main.js` faz na home). */
  /* No celular o seletor vira o ultimo item do menu hamburguer, entao ele
     precisa estar DENTRO do .floatnav enquanto o drawer esta aberto. Fora dele
     ele volta pro header, onde o position:fixed vale em relacao a janela. O
     main.js faz o mesmo na home, la amarrado ao clique do burger; aqui a classe
     do nav e' a fonte da verdade, e nao precisamos tocar no subpage.js. */
  function ligarDrawer(btn) {
    var nav = document.querySelector('.floatnav');
    if (!nav || !window.MutationObserver) return;
    var casa = btn.parentElement;
    new MutationObserver(function () {
      var ativo = nav.classList.contains('active');
      if (ativo && !nav.contains(btn)) nav.appendChild(btn);
      else if (!ativo && !casa.contains(btn)) casa.appendChild(btn);
    }).observe(nav, { attributes: true, attributeFilter: ['class'] });
  }

  function ligarSeletor() {
    var btn = document.getElementById('lang-btn');
    if (!btn) return;
    ligarDrawer(btn);
    var trigger = document.getElementById('lang-trigger');
    var dropdown = document.getElementById('lang-dropdown');
    var atual = document.getElementById('lang-current');
    var opts = document.querySelectorAll('.lang-opt');
    if (!trigger || !dropdown) return;

    function fechar() {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var aberto = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(aberto));
      var drawer = aberto && btn.closest('.floatnav.active');
      if (drawer) {
        setTimeout(function () {
          drawer.scrollTo({ top: drawer.scrollHeight, behavior: 'smooth' });
        }, 380);
      }
    });
    document.addEventListener('click', function (e) { if (!btn.contains(e.target)) fechar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

    Array.prototype.forEach.call(opts, function (o) {
      o.addEventListener('click', function () {
        fechar();
        API.set(o.dataset.lang);
      });
    });

    function pintar() {
      if (atual) atual.textContent = ROTULO[lang] || 'PT';
      trigger.setAttribute('aria-label', 'Language: ' + (ROTULO[lang] || 'PT'));
      Array.prototype.forEach.call(opts, function (o) {
        o.classList.toggle('active', o.dataset.lang === lang);
      });
    }
    pintar();
    window.addEventListener('i18n:change', pintar);
  }

  window.I18NSub = API;
  window.__SEL_I18N = SEL;   /* usado pela auditoria de cobertura */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { API.init(); });
  } else {
    API.init();
  }
})();
