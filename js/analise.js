/* ============================================================
   analise.js — o desenho da análise da BMAi
   ------------------------------------------------------------
   A mesma análise aparece em dois lugares: na peça do dia
   (/edicao) e na leitura de uma matéria (/radar?n=). Escrever o
   markup duas vezes garantia que um dia os dois iam divergir,
   então mora aqui e as duas páginas chamam.

   QUEM ESCREVE O QUÊ. O fato é do veículo, com crédito e data.
   O texto que este arquivo desenha é da BMAi: contexto, o que
   muda, a leitura pra quem opera, o que observar, e o que a
   matéria deixou em aberto. Nada aqui vem do veículo.

   Nada entra por innerHTML sem escapar. A análise passa por um
   modelo antes de chegar, e texto de modelo é texto de estranho
   pelo mesmo motivo que comentário é: não se confia na origem,
   confia-se no escape.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* O modelo devolve "2 parágrafos" num campo só, separados por linha em
     branco. Sem quebrar aqui, a página mostraria um bloco de nove frases,
     que é exatamente o texto que ninguém lê. */
  function paragrafos(texto) {
    return String(texto || '').split(/\n{2,}|\r\n\r\n/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) { return '<p>' + esc(p) + '</p>'; })
      .join('');
  }

  function titulo(t) {
    return '<h4 class="an__t">' + esc(t) + '</h4>';
  }

  /* Devolve string vazia quando não há análise. É isso que faz a página
     continuar de pé quando o modelo falhou: quem chama concatena o vazio e
     mostra o que já tinha. */
  function html(a) {
    if (!a || (!a.contexto && !a.oQueMuda)) return '';

    var deOlho = (a.deOlho || []).filter(Boolean);

    return '<div class="an">' +
      (a.contexto ? titulo('Contexto') + paragrafos(a.contexto) : '') +
      (a.oQueMuda ? titulo('O que muda') + paragrafos(a.oQueMuda) : '') +
      (a.paraQuemOpera
        ? '<div class="an__opera">' + titulo('Para quem opera um negócio') +
            paragrafos(a.paraQuemOpera) +
          '</div>'
        : '') +
      (deOlho.length
        ? titulo('De olho nas próximas semanas') +
          '<ul class="an__olho">' +
            deOlho.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') +
          '</ul>'
        : '') +
      (a.naoResponde
        ? '<p class="an__aberto"><strong>O que a matéria não responde:</strong> ' +
            esc(a.naoResponde) + '</p>'
        : '') +
    '</div>';
  }

  window.BMAiAnalise = { html: html, paragrafos: paragrafos };
})();
