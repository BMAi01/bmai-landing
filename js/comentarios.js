/* ============================================================
   comentarios.js — a linha de comentários de cada postagem
   ------------------------------------------------------------
   Um espaço POR POSTAGEM, não um mural único do blog: o
   endereço é o `data-comentarios` do elemento, que é o hash da
   matéria no radar e o slug no artigo. Duas postagens nunca
   dividem a mesma conversa.

   Monta em qualquer elemento com `data-comentarios="<id>"`, então
   a mesma peça serve a página de leitura do radar e as páginas
   de artigo, sem cada uma reimplementar a sua.

   TRÊS DECISÕES QUE NÃO SÃO ÓBVIAS:

   1. A CAIXA NASCE FECHADA, como uma aba. Comentário raramente é
      o que a pessoa veio ler; abrir a lista inteira empurraria o
      texto pra baixo em toda visita. O contador no botão diz se
      vale abrir.

   2. NADA É ESCRITO COM innerHTML A PARTIR DA RESPOSTA. Comentário
      é texto de estranho; montar HTML com ele é como se abre um
      XSS. Tudo entra por textContent.

   3. SE A API ESTIVER FORA, A SEÇÃO SOME. Caixa de comentário que
      aceita texto e perde no envio é pior que caixa nenhuma.
   ============================================================ */
(function () {
  'use strict';

  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = LOCAL ? 'http://localhost:3099' : 'https://api.bmai.com.br';

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function quando(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
  }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;      // nunca innerHTML
    return n;
  }

  function montar(caixa) {
    var id = caixa.getAttribute('data-comentarios');
    if (!id) return;

    var aberto = false;
    var lista = [];

    var botao = el('button', 'bl-com__aba');
    botao.type = 'button';
    botao.setAttribute('aria-expanded', 'false');
    var rotulo = el('span', 'bl-com__aba-txt', 'Comentários');
    var conta = el('span', 'bl-com__conta', '0');
    botao.appendChild(rotulo);
    botao.appendChild(conta);

    var painel = el('div', 'bl-com__painel');
    painel.hidden = true;

    var vazio = el('p', 'bl-com__vazio', 'Nenhum comentário ainda. Comece a conversa.');
    var ul = el('ul', 'bl-com__lista');
    painel.appendChild(vazio);
    painel.appendChild(ul);

    /* ---------- Formulário ---------- */
    var form = el('form', 'bl-com__form');
    form.noValidate = true;

    var nome = el('input', 'bl-com__campo');
    nome.type = 'text'; nome.name = 'nome'; nome.maxLength = 40;
    nome.placeholder = 'Como você quer ser chamado';
    nome.setAttribute('aria-label', 'Seu nome');
    nome.autocomplete = 'nickname';

    var texto = el('textarea', 'bl-com__campo bl-com__campo--texto');
    texto.name = 'texto'; texto.rows = 3; texto.maxLength = 1200;
    texto.placeholder = 'O que você achou? Sem link, por favor.';
    texto.setAttribute('aria-label', 'Seu comentário');

    // Armadilha pra robô: fora da tela e fora da ordem de tabulação, então
    // ninguém preenche sem querer. O servidor descarta o envio se vier algo.
    var isca = el('input', 'bl-com__isca');
    isca.type = 'text'; isca.name = 'assunto'; isca.tabIndex = -1;
    isca.setAttribute('aria-hidden', 'true');
    isca.autocomplete = 'off';

    var enviar = el('button', 'btn btn--primary bl-com__enviar', 'Comentar');
    enviar.type = 'submit';
    var aviso = el('p', 'bl-com__aviso');
    aviso.setAttribute('role', 'status');

    form.appendChild(nome);
    form.appendChild(texto);
    form.appendChild(isca);
    form.appendChild(enviar);
    form.appendChild(aviso);
    painel.appendChild(form);

    caixa.appendChild(botao);
    caixa.appendChild(painel);

    function desenhar() {
      ul.textContent = '';
      vazio.hidden = lista.length > 0;
      lista.forEach(function (c) {
        var li = el('li', 'bl-com__item');
        var cab = el('p', 'bl-com__meta');
        cab.appendChild(el('span', 'bl-com__nome', c.nome));
        var d = quando(c.em);
        if (d) cab.appendChild(el('span', 'bl-com__data', d));
        li.appendChild(cab);
        li.appendChild(el('p', 'bl-com__texto', c.texto));
        ul.appendChild(li);
      });
      conta.textContent = String(lista.length);
    }

    botao.addEventListener('click', function () {
      aberto = !aberto;
      painel.hidden = !aberto;
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      aviso.textContent = '';
      aviso.removeAttribute('data-erro');
      if (!nome.value.trim() || !texto.value.trim()) {
        aviso.textContent = 'Preencha o nome e o comentário.';
        aviso.setAttribute('data-erro', 'true');
        return;
      }
      enviar.disabled = true;
      enviar.textContent = 'Enviando...';

      fetch(API + '/blog/comentarios/' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.value, texto: texto.value, assunto: isca.value,
        }),
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j && res.j.error ? res.j.error : 'falhou');
          if (res.j.comentario) lista.push(res.j.comentario);
          desenhar();
          nome.value = ''; texto.value = '';
          aviso.textContent = 'Comentário publicado.';
        })
        .catch(function (err) {
          aviso.textContent = err.message || 'Não foi possível enviar agora.';
          aviso.setAttribute('data-erro', 'true');
        })
        .then(function () {
          enviar.disabled = false;
          enviar.textContent = 'Comentar';
        });
    });

    fetch(API + '/blog/comentarios/' + encodeURIComponent(id), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('comentarios ' + r.status); return r.json(); })
      .then(function (d) {
        lista = Array.isArray(d.comentarios) ? d.comentarios : [];
        desenhar();
        caixa.hidden = false;
      })
      .catch(function () {
        // API fora: a seção some inteira em vez de aceitar texto que se perde.
        caixa.hidden = true;
      });
  }

  /* A página de leitura do radar monta o conteúdo DEPOIS do fetch, então a
     seção de comentários ainda não existe quando este script roda. Por isso
     o `montar` fica exposto: quem cria a seção depois chama a mão. O
     `montadas` evita montar duas vezes o mesmo elemento se as duas rotas
     (varredura inicial e chamada manual) se cruzarem. */
  var montadas = typeof WeakSet === 'function' ? new WeakSet() : null;
  function montarUmaVez(caixa) {
    if (!caixa) return;
    if (montadas) {
      if (montadas.has(caixa)) return;
      montadas.add(caixa);
    } else if (caixa.getAttribute('data-montado')) {
      return;
    } else {
      caixa.setAttribute('data-montado', '1');
    }
    montar(caixa);
  }

  window.BMAiComentarios = {
    montar: montarUmaVez,
    varrer: function (raiz) {
      [].forEach.call((raiz || document).querySelectorAll('[data-comentarios]'), montarUmaVez);
    },
  };

  window.BMAiComentarios.varrer();
})();
