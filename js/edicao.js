/* ============================================================
   edicao.js — a peça diária do blog, assinada pela BMAi
   ------------------------------------------------------------
   O blog tinha seis artigos escritos à mão e uma seção de
   notícias que virava todo dia. Esta página é o que faz o BLOG
   se atualizar diariamente: uma edição por dia, com a leitura
   da casa sobre o que apareceu.

   O TEXTO NÃO É GERADO AQUI NEM POR MODELO NENHUM. O agente de
   notícias já escreve, por matéria, "O que é" e "Por que
   importa"; a API organiza isso em edição e esta página desenha.
   Custo zero por dia, e nada que possa inventar um fato.

   QUEM ASSINA O QUÊ. A BMAi assina a ANÁLISE, que é dela. O
   FATO continua creditado a quem apurou, em cada item e num
   bloco de créditos no fim. Assinar a análise é verdade; dizer
   que a BMAi apurou reportagem de terceiro não seria.

   O item não manda o leitor pra fora: aponta pra leitura dele
   no próprio site (`/radar?n=<id>`), que é a mesma decisão já
   tomada no radar-leitura.js.

   `noindex` pelo mesmo motivo da página do radar: o conteúdo
   troca todo dia numa URL só. Quem o Google lê é o blog.
   ============================================================ */
(function () {
  'use strict';

  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = LOCAL ? 'http://localhost:3099' : 'https://api.bmai.com.br';

  var alvo = document.getElementById('edicao');
  var estado = document.getElementById('estado');
  if (!alvo || !estado) return;

  /* Tudo que vem da rede passa por aqui. Manchete e nome de veículo são
     texto de terceiro: nada entra por innerHTML sem escapar. */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // esc() não olha o esquema, então um "javascript:" vindo da API
  // sobreviveria até o href. Só http, https e caminho do próprio site entram.
  function safeUrl(u) {
    if (typeof u !== 'string') return '';
    var t = u.trim();
    if (t.charAt(0) === '/' && t.charAt(1) !== '/') return esc(t);
    return /^https?:\/\//i.test(t) ? esc(t) : '';
  }
  function falhou(msg) {
    estado.innerHTML = esc(msg) + ' <a href="/blog">Voltar para o blog</a>.';
  }

  /* Um item da edição: manchete, crédito de quem apurou, o fato em um
     parágrafo e a análise da casa embaixo.

     Quando a análise existe, o "Por que importa" de uma linha SAI: ele e o
     "Para quem opera" dizem a mesma coisa, e a versão curta em cima da
     longa faz a página parecer repetida. Item sem análise (modelo fora do
     ar, ou matéria que não passou na régua) continua com as duas linhas
     como sempre foi. */
  function item(it, nivel) {
    var h = nivel === 'abertura' ? 'h2' : 'h3';
    var interno = it.id ? '/radar?n=' + encodeURIComponent(it.id) : '';
    var manchete = esc(it.title || '');
    var analise = (window.BMAiAnalise && it.analise) ? window.BMAiAnalise.html(it.analise) : '';

    return '<article class="ed-item rise">' +
      '<' + h + ' class="ed-item__titulo">' +
        (interno ? '<a href="' + safeUrl(interno) + '">' + manchete + '</a>' : manchete) +
      '</' + h + '>' +
      (it.source ? '<p class="ed-item__credito">Apurado por ' + esc(it.source) + '</p>' : '') +
      (it.oQueE ? '<p>' + esc(it.oQueE) + '</p>' : '') +
      (analise ||
        (it.porQueImporta
          ? '<p class="ed-item__leitura"><strong>Por que importa:</strong> ' + esc(it.porQueImporta) + '</p>'
          : '')) +
    '</article>';
  }

  fetch(API + '/blog/edicao', { cache: 'no-store' })
    .then(function (r) {
      // 204 é o caso honesto de "hoje não fechou edição", não um erro.
      if (r.status === 204) throw new Error('vazia');
      if (!r.ok) throw new Error('falhou');
      return r.json();
    })
    .then(function (p) {
      document.title = 'A leitura da BMAi na edição de ' + (p.diaPorExtenso || '') + ' | BMAi';

      var capa = safeUrl(p.abertura && p.abertura.image);
      /* 🔴 `crossorigin` mesmo esta página não desenhando nada em canvas.
         O cache HTTP é compartilhado ENTRE páginas: se o leitor passar por
         aqui primeiro e a foto entrar no cache sem CORS, o card do radar e
         o hero 3D do /blog pedem a MESMA URL com CORS e são recusados em
         cima dessa entrada — e lá a capa some. Todas as páginas que exibem
         imagem da API pedem com CORS, senão uma envenena a outra. */
      var figura = capa
        ? '<figure class="bl-leitura__fig rise" data-rise="veil">' +
            '<img src="' + capa + '" alt="" crossorigin="anonymous" width="1200" height="675" decoding="async">' +
            '<figcaption>Imagem divulgada por ' +
              esc((p.abertura && p.abertura.source) || 'o veículo') + '.</figcaption>' +
          '</figure>'
        : '';

      var blocos = (p.blocos || []).map(function (b) {
        return '<section class="ed-bloco">' +
          '<h2 class="ed-bloco__nome rise">' + esc(b.nome) + '</h2>' +
          (b.itens || []).map(function (i) { return item(i, 'bloco'); }).join('') +
        '</section>';
      }).join('');

      alvo.innerHTML =
        '<div class="enter">' +
          '<a href="/blog" class="article__back">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>' +
            'Voltar para o blog' +
          '</a>' +
          '<p class="article__eyebrow">Edição do dia</p>' +
          '<h1>' + esc(p.titulo || '') + '</h1>' +
          '<p class="article__meta">' +
            esc(p.diaPorExtenso || '') + ' · Leitura da BMAi · ' +
            esc(String(p.leituraMin || 3)) + ' min' +
          '</p>' +
          (p.dek ? '<p class="bl-hero__lead ed-dek">' + esc(p.dek) + '</p>' : '') +
        '</div>' +

        '<div class="article__body">' +
          figura +

          /* A abertura do dia: o único texto da página que olha a edição
             inteira e diz o que ela significa junta. Vem antes da primeira
             matéria de propósito, porque é ela que dá sentido à ordem das
             outras. Sem ela (modelo fora do ar) a peça começa direto na
             matéria de topo, como começava antes. */
          ((p.editorial && p.editorial.texto && p.editorial.texto.length)
            ? '<section class="ed-abertura rise">' +
                p.editorial.texto.map(function (par) { return '<p>' + esc(par) + '</p>'; }).join('') +
                '<p class="ed-abertura__assina">Análise da BMAi</p>' +
              '</section>'
            : '') +

          (p.abertura ? '<section class="ed-bloco">' + item(p.abertura, 'abertura') + '</section>' : '') +
          blocos +

          /* Crédito em bloco, além do crédito item a item. A peça é análise
             da casa por cima de apuração dos outros, e dizer de quem é a
             apuração é o que separa auditoria de apropriação. */
          ((p.veiculos && p.veiculos.length)
            ? '<section class="ed-creditos rise">' +
                '<h2>Quem apurou</h2>' +
                '<p>Os fatos desta edição foram apurados por ' +
                  esc(p.veiculos.join(', ')) + '. ' +
                  'A leitura sobre o que cada um muda para quem opera um negócio é da BMAi.</p>' +
              '</section>'
            : '') +

          '<p class="ed-assina">BMAi</p>' +

          // Uma conversa por edição, endereçada pelo dia.
          '<section class="bl-com" data-comentarios="' + esc(p.slug || 'edicao') + '" hidden></section>' +

          '<div class="article__close rise" data-rise="scale">' +
            '<h2>Quer isso aplicado ao seu negócio?</h2>' +
            '<p>A gente olha a sua operação antes de falar de ferramenta.</p>' +
            '<a class="btn btn--primary btn--lg" href="https://wa.me/5561982012580?text=Ol%C3%A1%2C%20time%20da%20BMAi%2C%20vim%20pela%20edi%C3%A7%C3%A3o%20do%20dia" target="_blank" rel="noopener">' +
              'Falar com o time da BMAi' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>';

      /* Rede de segurança da capa, a mesma do índice do blog: a figura
         reserva 1200x675, então uma foto que não carrega deixa um vão de
         meia tela de navy no meio da abertura. Some a figura inteira em vez
         de manter o buraco. O teste de `complete` cobre a falha que
         aconteceu antes deste código rodar, que o evento não repete. */
      var foto = alvo.querySelector('.bl-leitura__fig img');
      if (foto) {
        var sumir = function () {
          var fig = foto.closest('.bl-leitura__fig');
          (fig || foto).remove();
        };
        foto.addEventListener('error', sumir);
        if (foto.complete && !foto.naturalWidth) sumir();
      }

      // O conteúdo nasceu depois do fetch, então nem o comentarios.js nem o
      // observador do motion o viram. Mesma religada da leitura do radar.
      if (window.BMAiComentarios) window.BMAiComentarios.varrer(alvo);
      if (window.BMAiMotion) window.BMAiMotion.varrer(alvo);
    })
    .catch(function (err) {
      falhou(err.message === 'vazia'
        ? 'Hoje ainda não fechou edição: o radar publica quando há matéria com leitura da casa.'
        : 'Não deu pra carregar a edição agora.');
    });
})();
