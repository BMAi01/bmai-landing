/* ============================================================
   radar-leitura.js — a página de leitura de uma notícia do radar
   ------------------------------------------------------------
   O card do blog aponta pra cá em vez de mandar o leitor direto
   pro veículo. Aqui a BMAi diz o que entendeu da matéria, e o
   link pro texto original fica em destaque, com o crédito de
   quem apurou.

   Conteúdo semanal, montado no cliente e trocado todo domingo:
   por isso a página é noindex. Quem o Google precisa ler é o
   blog, que aponta pra cá.

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
      // 404 aqui quase sempre significa "edição da semana passada": o link
      // envelheceu junto com a edição, e dizer isso é melhor que "erro".
      if (r.status === 404) throw new Error('velha');
      if (!r.ok) throw new Error('falhou');
      return r.json();
    })
    .then(function (n) {
      var capa = n.image ? safeUrl(/^https?:/i.test(n.image) ? n.image : API + n.image) : '';
      var origem = safeUrl(n.url);
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

          '<h2>A leitura da BMAi</h2>' +
          '<p>' + esc(n.summary) + '</p>' +

          '<div class="article__note">' +
            '<p>A apuração é do veículo. O que a BMAi acrescenta aqui é a leitura: ' +
            'o que a notícia diz e o que muda na prática para quem opera um negócio. ' +
            'A classificação acima é do nosso agente de monitoramento.</p>' +
          '</div>' +

          (origem
            ? '<div class="article__close">' +
                '<h2>Leia a matéria original</h2>' +
                '<p>O texto completo é ' + (fonte ? 'd' + (/^[AEIOU]/i.test(fonte) ? 'a ' : 'o ') + fonte : 'do veículo') + '.</p>' +
                '<a class="btn btn--primary btn--lg" href="' + origem + '" target="_blank" rel="noopener noreferrer">' +
                  'Abrir no veículo' +
                  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>' +
                '</a>' +
              '</div>'
            : '') +
        '</div>';
    })
    .catch(function (err) {
      falhou(err.message === 'velha'
        ? 'Essa leitura saiu do ar: o radar publica uma edição nova todo domingo.'
        : 'Não deu pra carregar a leitura agora.');
    });
})();
