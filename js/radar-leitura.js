/* ============================================================
   radar-leitura.js — a página de leitura de uma notícia do radar
   ------------------------------------------------------------
   O card do blog aponta pra cá em vez de mandar o leitor pro
   veículo. A página é 100% leitura da BMAi: não tem link pro
   texto original, e a saída dela é falar com o time.

   O CRÉDITO de quem apurou fica, e não é enfeite: resumir a
   apuração de outro sem dizer de quem ela é deixa de ser
   auditoria e vira apropriação.

   Conteúdo diário, montado no cliente e trocado todo dia: por
   isso a página é noindex. Quem o Google precisa ler é o blog,
   que aponta pra cá.

   O que esta página NÃO faz: dizer que a BMAi verificou o fato.
   A checagem do pipeline hoje confia na fonte, então a promessa
   aqui é a leitura, não a apuração.
   ============================================================ */
(function () {
  'use strict';

  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = LOCAL ? 'http://localhost:3099' : 'https://api.bmai.com.br';

  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
               'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  var alvo = document.getElementById('leitura');
  var estado = document.getElementById('estado');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function safeUrl(u) {
    if (typeof u !== 'string') return '';
    var t = u.trim();
    if (t.charAt(0) === '/' && t.charAt(1) !== '/') return esc(t);
    return /^https?:\/\//i.test(t) ? esc(t) : '';
  }
  function dataLonga(iso) {
    var p = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!p) return '';
    return Number(p[3]) + ' de ' + MESES[Number(p[2]) - 1] + ' de ' + p[1];
  }
  function falhou(msg) {
    estado.innerHTML = esc(msg) + ' <a href="/blog">Voltar para o blog</a>.';
  }

  var id = new URLSearchParams(location.search).get('n');
  if (!id) { falhou('Essa leitura não foi encontrada.'); return; }

  fetch(API + '/blog/radar/noticia/' + encodeURIComponent(id), { cache: 'no-store' })
    .then(function (r) {
      // 404 aqui quase sempre significa "edição de ontem": o link envelheceu
      // junto com a edição, e dizer isso é melhor que um "erro" genérico.
      if (r.status === 404) throw new Error('velha');
      if (!r.ok) throw new Error('falhou');
      return r.json();
    })
    .then(function (n) {
      var capa = n.image ? safeUrl(/^https?:/i.test(n.image) ? n.image : API + n.image) : '';
      var fonte = esc(n.source || '');
      var quando = dataLonga(n.published_at);

      var etiquetas = []
        .concat((n.tags || []).map(function (x) {
          return '<span class="bl-radar__tag">' + esc(x) + '</span>';
        }))
        .concat((n.empresas || []).map(function (x) {
          return '<span class="bl-radar__tag bl-radar__tag--empresa">' + esc(x) + '</span>';
        }))
        .join('');

      var figura = capa
        ? '<figure class="bl-leitura__fig">' +
            '<img src="' + capa + '" alt="" width="1200" height="675" decoding="async">' +
            '<figcaption>Imagem divulgada por ' + (fonte || 'o veículo') + '.</figcaption>' +
          '</figure>'
        : '';

      document.title = (n.title ? n.title + ' | ' : '') + 'Radar da BMAi';

      alvo.innerHTML =
        '<div class="enter">' +
          '<a href="/blog#radar" class="article__back">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>' +
            'Voltar para o radar' +
          '</a>' +
          '<p class="article__eyebrow">Radar de tecnologia</p>' +
          '<h1>' + esc(n.title) + '</h1>' +
          '<p class="article__meta">' +
            (quando ? quando : '') +
            (fonte ? (quando ? ' · ' : '') + 'Apurado por ' + fonte : '') +
          '</p>' +
        '</div>' +

        '<div class="article__body">' +
          figura +
          (etiquetas ? '<div class="bl-radar__class bl-leitura__class">' + etiquetas + '</div>' : '') +

          /* A leitura em duas partes, que é como o agente escreve: o que
             aconteceu e o que isso muda pra quem opera. A segunda metade
             existia no banco desde sempre, no rascunho da comunidade, e a
             página só mostrava a primeira. */
          '<h2>O que aconteceu</h2>' +
          '<p>' + esc((n.leitura && n.leitura.oQueE) || n.summary) + '</p>' +
          (n.leitura && n.leitura.porQueImporta
            ? '<h2>Por que isso importa para quem opera</h2>' +
              '<p>' + esc(n.leitura.porQueImporta) + '</p>'
            : '') +
          (n.empresas && n.empresas.length
            ? '<h2>Quem está envolvido</h2>' +
              '<p>' + esc(n.empresas.join(', ')) + '.</p>'
            : '') +

          // A conversa fica dentro da própria postagem, endereçada pelo id
          // dela: cada matéria tem a sua, nunca um mural único do blog.
          '<section class="bl-com" data-comentarios="' + esc(id) + '" hidden></section>' +

          /* O parágrafo de rodapé que explicava a divisão de trabalho
             ("a apuração é do veículo, a leitura é da BMAi") saiu a pedido:
             lia como ressalva no fim de uma página que deveria soar como
             auditoria da casa.

             O crédito NÃO some com ele. Continua em cima, no "Apurado por
             <veículo>" da linha de meta, onde é informação e não desculpa.
             Resumir a apuração de outro sem dizer de quem ela é deixaria de
             ser auditoria e viraria apropriação, então essa linha fica. */

          '<div class="article__close">' +
            '<h2>Quer isso aplicado ao seu negócio?</h2>' +
            '<p>A gente olha a sua operação antes de falar de ferramenta.</p>' +
            '<a class="btn btn--primary btn--lg" href="https://wa.me/5561982012580?text=Ol%C3%A1%2C%20time%20da%20BMAi%2C%20vim%20pelo%20radar" target="_blank" rel="noopener">' +
              'Falar com o time da BMAi' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>';

      // A seção de comentários nasce agora, depois do fetch, então o
      // comentarios.js já varreu a página e não a viu. Montagem à mão.
      if (window.BMAiComentarios) window.BMAiComentarios.varrer(alvo);
    })
    .catch(function (err) {
      falhou(err.message === 'velha'
        ? 'Essa leitura saiu do ar: o radar publica uma edição nova todo dia.'
        : 'Não deu pra carregar a leitura agora.');
    });
})();
