/* ============================================================
   blog-index.js — comportamento do índice do blog
   ------------------------------------------------------------
   O site é estático. Os 6 posts JÁ estão escritos no blog.html,
   então o Google e os crawlers de IA leem a página inteira e o
   JSON-LD bate com o que está na tela. Este script cuida do que
   é vivo:

     - busca e filtro por categoria (tudo no cliente)
     - "ver todos", que colapsa a lista longa
     - hidratação a partir de api.bmai.com.br:
         contadores reais, posts publicados depois do último
         deploy do HTML, destaques e o radar
     - inscrição na newsletter

   REGRA: se a API estiver fora do ar, a página não pode piorar.
   Tudo que vem de rede é enfeite por cima de um HTML que já se
   sustenta sozinho. Nada aqui esconde conteúdo que já está lá.
   ============================================================ */
(function () {
  'use strict';

  // Uma origem só. O radar entra por proxy daqui, então o CSP do site
  // precisa liberar apenas este host.
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = LOCAL ? 'http://localhost:3099' : 'https://api.bmai.com.br';

  var MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // esc() não olha o esquema da URL, então um "javascript:" vindo da API
  // sobreviveria até o href. Só http e https entram.
  function safeUrl(u) {
    if (typeof u !== 'string') return '';
    var t = u.trim();
    if (t.charAt(0) === '/' && t.charAt(1) !== '/') return esc(t);  // caminho do próprio site
    return /^https?:\/\//i.test(t) ? esc(t) : '';
  }
  function dataCurta(iso) {
    var p = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!p) return '';
    return Number(p[3]) + ' ' + MESES[Number(p[2]) - 1] + ' ' + p[1];
  }
  function selo(post) {
    var d = dataCurta(post.data);
    var m = post.leituraMin ? post.leituraMin + ' MIN DE LEITURA' : '';
    return [d, m].filter(Boolean).join(' · ');
  }
  /* A edição do radar é pedida por DOIS scripts na mesma página: este, que
     monta a seção de notícias, e o hero-3d.js, que desenha a folha de
     jornal com a matéria de topo. São 129 KB de JSON, e até agora cada um
     baixava a sua cópia — 129 KB jogados fora em toda visita, os mesmos
     129 KB, no celular também.

     Aqui a PROMESSA é que fica guardada, não o resultado: quem chegar
     primeiro dispara o pedido, quem chegar depois pega a mesma promessa,
     independente da ordem em que os dois scripts rodam. `no-store`
     continua, então a edição segue vindo fresca a cada carregamento.

     A chave vive no window porque os dois arquivos são IIFE e não
     compartilham escopo. Mexeu aqui, mexa no hero-3d.js. */
  function edicaoDoRadar() {
    if (!window.__bmaiEdicao) window.__bmaiEdicao = json('/blog/radar');
    return window.__bmaiEdicao;
  }

  function json(rota) {
    return fetch(API + rota, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(rota + ' ' + r.status); return r.json(); });
  }

  /* ==================== BUSCA, FILTRO E "VER TODOS" ==================== */
  var input  = document.getElementById('blSearch');
  var limpar = document.getElementById('blSearchClear');
  var vazio  = document.getElementById('blEmpty');
  var maisBt = document.getElementById('blMore');
  var maisTx = document.getElementById('blMoreLabel');
  var linhas = document.getElementById('blRows');

  var filtro = 'all';
  var expandido = false;

  function itens()  { return [].slice.call(document.querySelectorAll('[data-cat]')); }
  function blocos() { return [].slice.call(document.querySelectorAll('[data-block]')); }

  /* O filtro troca `hidden`, e `hidden` é troca de `display`: transição de
     CSS não roda em cima disso, então a lista inteira PISCAVA de um estado
     pro outro. Quem clica numa chip não vê o que mudou — só vê outra tela.

     Uma animação curta em quem ACABOU de aparecer resolve, com escada de
     45ms pra a fila se montar da esquerda pra direita em vez de tudo de
     uma vez. Some pra quem pediu menos movimento. */
  var MENOS_MOVIMENTO = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function aplicar() {
    var q = (input.value || '').trim().toLowerCase();
    var filtrando = q !== '' || filtro !== 'all';
    var visiveis = 0;
    var entrando = 0;

    itens().forEach(function (el) {
      var okCat = filtro === 'all' || el.getAttribute('data-cat') === filtro;
      var palheiro = (el.getAttribute('data-title') || '') + ' ' + el.textContent.toLowerCase();
      var okQ = !q || palheiro.indexOf(q) > -1;
      // O colapso só vale quando ninguém está procurando nada: buscar e
      // continuar escondendo resultado seria mentir sobre o acervo.
      var colapsado = !filtrando && !expandido && el.hasAttribute('data-extra');
      var mostrar = okCat && okQ && !colapsado;
      var estavaOculto = el.hidden;
      el.hidden = !mostrar;
      if (!MENOS_MOVIMENTO && estavaOculto && mostrar) {
        el.classList.remove('bl-entra');
        void el.offsetWidth;              // reinicia a animação de verdade
        el.style.setProperty('--fd', (Math.min(entrando, 7) * 0.045) + 's');
        el.classList.add('bl-entra');
        entrando++;
      }
      if (okCat && okQ) visiveis++;
    });

    blocos().forEach(function (b) {
      var estavaOculto = b.hidden;
      b.hidden = !b.querySelector('[data-cat]:not([hidden])');
      /* ⚠️ Bloco que volta do filtro traz `.rise` dentro dele — o
         cabeçalho da seção, por exemplo. E `.rise` observado dentro de um
         elemento `display:none` NUNCA dispara o IntersectionObserver: ele
         voltaria com opacidade zero, ou seja, seção vazia.

         (A rede de segurança do subpage.js revelaria tudo em 4s, mas
         ninguém garante que a pessoa demore 4s pra clicar numa chip.)

         Ao reaparecer, o conteúdo é declarado presente na hora. A entrada
         dele fica por conta do `.bl-entra`, que é a animação certa pra
         troca de filtro — quem já estava na página não precisa nascer de
         novo. */
      if (estavaOculto && !b.hidden) {
        [].forEach.call(b.querySelectorAll('.rise:not(.is-in)'), function (el) {
          el.classList.add('is-in');
        });
      }
    });

    vazio.setAttribute('data-show', visiveis === 0 ? 'true' : 'false');
    limpar.disabled = q === '';

    if (maisBt) {
      var extras = document.querySelectorAll('[data-extra]').length;
      maisBt.parentNode.hidden = filtrando || extras === 0;
      maisBt.setAttribute('aria-expanded', expandido ? 'true' : 'false');
      maisTx.textContent = expandido ? 'Ver menos' : 'Ver todos os artigos';
    }
  }

  function definirFiltro(f) {
    var radar = document.getElementById('radar');
    // O radar é seção própria, fora da coluna filtrável: o chip leva até ela
    // em vez de fingir que filtra a lista.
    if (f === 'radar' && radar && !radar.hidden) {
      radar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    filtro = f;
    [].forEach.call(document.querySelectorAll('.bl-pill'), function (p) {
      p.setAttribute('aria-pressed', p.getAttribute('data-filter') === f ? 'true' : 'false');
    });
    aplicar();
  }

  document.addEventListener('click', function (e) {
    var alvo = e.target.closest ? e.target.closest('[data-filter]') : null;
    if (alvo) definirFiltro(alvo.getAttribute('data-filter'));
  });

  input.addEventListener('input', aplicar);
  limpar.addEventListener('click', function () {
    input.value = '';
    input.focus();
    aplicar();
  });
  if (maisBt) {
    maisBt.addEventListener('click', function () {
      expandido = !expandido;
      aplicar();
    });
  }

  // Sem JS, os 6 posts aparecem inteiros. O colapso é uma escolha do script,
  // nunca o estado padrão do documento.
  aplicar();

  /* ==================== HIDRATAÇÃO ==================== */

  // Contadores. Cada assunto soma ARTIGO e NOTÍCIA, porque o filtro alcança
  // os dois: o radar entrega `eixo` com os mesmos quatro slugs das chips.
  // Contar só artigo esconderia "Tecnologia" e "Regulação", que hoje não têm
  // artigo nenhum e têm dezenas de notícias.
  var contagem = { artigos: {}, radar: {} };

  function atualizarContadores() {
    var soma = {};
    ['artigos', 'radar'].forEach(function (fonte) {
      Object.keys(contagem[fonte]).forEach(function (k) {
        soma[k] = (soma[k] || 0) + contagem[fonte][k];
      });
    });

    [].forEach.call(document.querySelectorAll('[data-count-for]'), function (el) {
      var slug = el.getAttribute('data-count-for');
      if (slug === 'radar') return;               // o radar tem vida própria
      var n = soma[slug] || 0;
      el.textContent = n;
      var botao = el.closest('.bl-cat');
      if (botao) botao.hidden = n === 0;
    });

    [].forEach.call(document.querySelectorAll('.bl-pill[data-filter]'), function (p) {
      var slug = p.getAttribute('data-filter');
      if (slug === 'all' || slug === 'radar') return;
      p.hidden = !soma[slug];
    });
  }

  json('/blog/categorias').then(function (d) {
    (d.categorias || []).forEach(function (c) { contagem.artigos[c.slug] = c.total; });
    atualizarContadores();
  }).catch(function () { /* API fora: o HTML já se sustenta */ });

  // Posts publicados no backend depois do último deploy do HTML entram na
  // lista. Os que já estão escritos na página são ignorados, pra não
  // duplicar nem sobrescrever o que o Google já indexou.
  json('/blog/posts?limit=50').then(function (d) {
    if (!linhas) return;
    var jaTem = {};
    [].forEach.call(linhas.querySelectorAll('[data-slug]'), function (el) {
      jaTem[el.getAttribute('data-slug')] = true;
    });

    var novos = (d.posts || []).filter(function (p) { return p.slug && !jaTem[p.slug]; });
    if (!novos.length) return;

    novos.reverse().forEach(function (p) {
      var url = safeUrl(p.url || ('/' + p.slug));
      if (!url) return;
      var a = document.createElement('a');
      a.className = 'bl-row';
      a.href = url;
      a.setAttribute('data-cat', p.categoria || '');
      a.setAttribute('data-slug', p.slug);
      a.setAttribute('data-title', String(p.titulo || '').toLowerCase());
      /* A capa do artigo escrito à mão é do próprio site (caminho relativo).
         A da EDIÇÃO DO DIA não: ela é a foto da matéria de topo, servida
         pela API, e é a MESMA URL que o card do radar e o hero 3D pedem.

         🔴 Por isso o `crossorigin` quando a URL é de outra origem. Sem ele
         a mesma imagem é pedida duas vezes na mesma página, uma sem CORS
         (aqui) e uma com CORS (o card do radar e o hero), e o navegador
         recusa o segundo pedido em cima da entrada cacheada pelo primeiro.
         O efeito visível é a capa do card de topo SUMIR — a rede de
         segurança logo abaixo remove a figura inteira quando a imagem
         falha. Foi o que aconteceu quando a peça diária entrou na lista.

         Só na URL absoluta: `crossorigin` num caminho do próprio site é
         inútil, e num host que não mande cabeçalho de CORS quebraria a
         imagem em vez de consertar. */
      var externa = typeof p.imagem === 'string' && /^https?:\/\//i.test(p.imagem);
      a.innerHTML =
        '<span class="bl-thumb">' +
          (p.imagem
            ? '<img src="' + safeUrl(p.imagem) + '" alt=""' +
              (externa ? ' crossorigin="anonymous"' : '') +
              ' loading="lazy" decoding="async" width="1200" height="675">'
            : '') +
        '</span>' +
        '<span class="bl-row__copy">' +
          '<span class="bl-row__meta">' + esc(selo(p)) + '</span>' +
          '<span class="bl-row__title">' + esc(p.titulo) + '</span>' +
          (p.dek ? '<span class="bl-row__dek">' + esc(p.dek) + '</span>' : '') +
        '</span>' +
        (p.categoriaNome ? '<span class="bl-row__tag">' + esc(p.categoriaNome) + '</span>' : '');
      linhas.insertBefore(a, linhas.firstChild);
    });
    aplicar();
  }).catch(function () { /* API fora: o HTML já se sustenta */ });

  // Radar: a seção nasce oculta e só entra com notícia real.
  edicaoDoRadar().then(function (news) {
    if (!Array.isArray(news) || !news.length) return;
    var secao = document.getElementById('radar');
    var grade = document.querySelector('.bl-radar__grid');
    if (!secao || !grade) return;

    // Sem corte. A edição vem com 36 matérias e o pedido foi volume; cortar
    // em 8 aqui era o que deixava a seção com cara de amostra.
    grade.innerHTML = news.map(function (it) {
      var t = esc(it.title),
          s = esc(it.summary || ''),
          // Quem publicou foi o veiculo, nao a BMAi. A API ja resolve o
          // nome real a partir do dominio da materia.
          fonte = esc(it.source || ''),
          url = safeUrl(it.url),
          // A capa vem servida pela propria API, entao chega como caminho
          // relativo e precisa da origem na frente.
          capa = it.image ? safeUrl(/^https?:/i.test(it.image) ? it.image : API + it.image) : '',
          quando = dataCurta(it.published_at || it.date);

      var resumo = (fonte ? '<span class="bl-radar__src">' + fonte + '.</span> ' : '') + s;

      // Classificacao do agente: o que ele de fato apurou. Sem selo de
      // confianca, porque a verificacao do pipeline confia na fonte sem
      // checar, e um numero ali daria ao leitor a impressao contraria.
      /* `temAnalise` é a única coisa que a API conta sobre a análise no feed
         das 90: o texto inteiro só vai na rota da matéria e na peça do dia,
         senão a lista carregaria doze análises que 78 cards não usam. Aqui
         ele vira a etiqueta que diz ao leitor onde há texto da casa. */
      var temAnalise = !!it.temAnalise;
      var classes = []
        .concat(temAnalise ? ['<span class="bl-radar__tag bl-radar__tag--analise">Análise da BMAi</span>'] : [])
        .concat((it.tags || []).map(function (x) { return '<span class="bl-radar__tag">' + esc(x) + '</span>'; }))
        .concat((it.empresas || []).map(function (x) { return '<span class="bl-radar__tag bl-radar__tag--empresa">' + esc(x) + '</span>'; }))
        .join('');

      // Todo card tem capa. Sem og:image, entra a arte da marca: assim as
      // alturas batem e a grade para de abrir vao entre um card curto e um
      // alto. alt vazio de proposito, porque quem descreve a materia e o
      // titulo logo abaixo.
      var selo = '<span class="bl-radar__stamp">' +
                   '<img src="assets/images/simbolo-laranja.svg" alt="" width="14" height="14">Radar BMAi' +
                 '</span>';
      var figura = capa
        // O crossorigin NÃO é enfeite. O hero desenha a capa da materia de
        // topo dentro de um canvas e por isso pede a MESMA URL com CORS. Se
        // este <img> guardar a imagem no cache sem CORS primeiro, o pedido do
        // hero e recusado em cima da entrada cacheada e a folha do jornal
        // aparece com um retangulo escuro no lugar da foto. Medido.
        ? '<span class="bl-radar__fig">' +
            '<img class="bl-radar__cover" src="' + capa + '" alt="" crossorigin="anonymous" loading="lazy" decoding="async" width="1200" height="675">' +
            selo +
          '</span>'
        : '<span class="bl-radar__fig bl-radar__fig--marca">' +
            '<img src="assets/images/simbolo-laranja.svg" alt="" width="62" height="62">' + selo +
          '</span>';

      // O card leva pra NOSSA leitura, nao direto pro veiculo. O link pra
      // materia original fica dentro da pagina de auditoria, com credito.
      var destino = it.id ? '/radar?n=' + encodeURIComponent(it.id) : url;

      // data-cat e data-title são o que põe a notícia sob a mesma busca e o
      // mesmo filtro dos artigos. O eixo vem da API, não é adivinhado aqui.
      return '<a class="bl-radar__item" href="' + destino + '" target="_blank" rel="noopener"' +
             ' data-cat="' + esc(it.eixo || '') + '"' +
             ' data-title="' + esc((it.title || '').toLowerCase()) + '">' +
               figura +
               '<span class="bl-radar__body">' +
                 (quando ? '<span class="bl-radar__time">' + quando + '</span>' : '') +
                 '<span class="bl-radar__title">' + t + '</span>' +
                 (classes ? '<span class="bl-radar__class">' + classes + '</span>' : '') +
                 (resumo.trim() ? '<span class="bl-radar__sum">' + resumo + '</span>' : '') +
                 '<span class="bl-radar__go">' +
                   (temAnalise ? 'Ler a análise da BMAi' : 'Ler a leitura da BMAi') +
                   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
                 '</span>' +
               '</span>' +
             '</a>';
    }).join('');

    // Rede de segurança: a capa some inteira se falhar, com selo e tudo, em
    // vez de sobrar um retângulo escuro com a marca da BMAi e nenhuma foto.
    [].forEach.call(grade.querySelectorAll('.bl-radar__cover'), function (img) {
      img.addEventListener('error', function () {
        var fig = img.closest('.bl-radar__fig');
        (fig || img).remove();
      });
    });

    secao.hidden = false;
    var chip = document.getElementById('blPillRadar');
    var cat = document.getElementById('blCatRadar');
    if (chip) chip.hidden = false;
    if (cat) {
      cat.hidden = false;
      var n = cat.querySelector('[data-count-for="radar"]');
      if (n) n.textContent = news.length;
    }

    news.forEach(function (it) {
      if (!it.eixo) return;
      contagem.radar[it.eixo] = (contagem.radar[it.eixo] || 0) + 1;
    });
    atualizarContadores();
    // O radar chega depois do primeiro aplicar(). Sem esta chamada, as
    // notícias nasceriam fora do filtro que já estivesse escolhido.
    aplicar();
  }).catch(function () { /* endpoint fora: a seção continua oculta */ });

  /* ==================== NEWSLETTER ==================== */
  var form = document.getElementById('blNewsForm');
  if (form) {
    var campo = document.getElementById('blNewsEmail');
    var botao = document.getElementById('blNewsBtn');
    var msg = document.getElementById('blNewsMsg');

    function aviso(texto, estado) {
      msg.textContent = texto;
      msg.setAttribute('data-estado', estado || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (campo.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        aviso('Confere o e-mail, parece que faltou alguma coisa.', 'erro');
        campo.focus();
        return;
      }

      botao.disabled = true;
      aviso('Enviando...', '');

      fetch(API + '/blog/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(function (r) {
          if (r.status === 429) throw new Error('muitas');
          if (!r.ok) throw new Error('falhou');
          return r.json();
        })
        .then(function () {
          form.reset();
          aviso('Pronto. A gente avisa quando sair conteúdo novo.', 'ok');
        })
        .catch(function (err) {
          aviso(
            err.message === 'muitas'
              ? 'Você já tentou várias vezes agora. Tenta daqui a pouco.'
              : 'Não deu pra assinar agora. Tenta de novo em instantes.',
            'erro'
          );
        })
        .then(function () { botao.disabled = false; });
    });
  }
})();
