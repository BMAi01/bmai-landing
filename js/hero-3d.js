/* ============================================================
   hero-3d.js — a abertura do blog: a edição do dia em 3D
   ------------------------------------------------------------
   Uma folha de jornal "BMAi News" com dois rolos de papel,
   flutuando sobre o navy da marca, com parallax de mouse.

   TRÊS COISAS QUE VALE SABER ANTES DE MEXER:

   1. O CONTEÚDO DA FOLHA É REAL. A manchete, o olho, o crédito e
      as colunas saem da edição do radar em api.bmai.com.br, a
      mesma que a página mostra mais abaixo. O comp original vinha
      com uma matéria inventada sobre o AI Act e um "ANO IV — Nº
      182"; nada disso entrou. Se a API não responder, a peça NÃO
      desenha jornal nenhum: fica só a marca sobre o navy. Jornal
      com texto inventado na abertura do blog é o oposto do que a
      página promete.

   2. O THREE.JS É CARREGADO SOB DEMANDA. São 600 KB, e nem todo
      mundo vai ver a cena: quem pediu menos movimento no sistema,
      quem está em tela estreita e quem não tem WebGL recebem a
      MESMA folha desenhada em 2D, que é o próprio canvas da
      textura. O 2D não é consolo: é a mesma arte, sem a mesa 3D.

   3. A TEXTURA É UM CANVAS COMUM. Tudo que aparece na folha é
      desenhado em 2D e vira textura. Por isso a foto da matéria
      precisa de crossOrigin: sem ele o canvas fica contaminado e
      o WebGL recusa a textura com SecurityError.

   Portado de "Hero 3D Blog.dc.html" (Claude Design). Lá o
   componente roda sobre React e a classe DCLogic; aqui não há
   framework nenhum, então virou função.
   ============================================================ */
(function () {
  'use strict';

  var palco = document.getElementById('blHero');
  if (!palco) return;

  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = LOCAL ? 'http://localhost:3099' : 'https://api.bmai.com.br';
  var THREE_SRC = 'js/vendor/three.min.js';

  var REDUZIR = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ESTREITO = window.matchMedia && window.matchMedia('(max-width: 860px)').matches;

  var DIAS = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
  var MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
               'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  var EIXO = { negocio: 'NEGÓCIO', tecnologia: 'TECNOLOGIA', processo: 'PROCESSO', regulacao: 'REGULAÇÃO' };

  var INK = '#23211e', INK2 = 'rgba(35,33,30,0.72)', PAPEL = '#e9e4d9';
  var SER = function (p, s) { return p + ' ' + s + 'px Georgia, "Times New Roman", serif'; };
  var SANS = function (p, s) { return p + ' ' + s + 'px "Helvetica Neue", Arial, sans-serif'; };

  /* ---------- Data da edição, no fuso de Brasília ---------- */
  function dataDaEdicao() {
    var agora = new Date();
    // O leitor pode estar em qualquer fuso; a edição é sempre a de Brasília.
    var brt = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return DIAS[brt.getDay()] + ', ' + brt.getDate() + ' DE ' + MESES[brt.getMonth()] + ' DE ' + brt.getFullYear();
  }

  /* ==================== DESENHO DA FOLHA ==================== */

  // Textura de papel: fibra e manchas de tom. A contagem de pontos é
  // proporcional à área, senão a folha grande fica lisa e a pequena, suja.
  function papel(g, W, H) {
    g.fillStyle = PAPEL;
    g.fillRect(0, 0, W, H);
    var pontos = Math.round(W * H * 0.0086);
    for (var i = 0; i < pontos; i++) {
      g.fillStyle = Math.random() > 0.5
        ? 'rgba(120,110,95,' + (Math.random() * 0.10) + ')'
        : 'rgba(255,255,255,' + (Math.random() * 0.16) + ')';
      g.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
    }
    for (var j = 0; j < 26; j++) {
      var x = Math.random() * W, y = Math.random() * H, r = 120 + Math.random() * 320;
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(150,138,118,' + (0.02 + Math.random() * 0.03) + ')');
      gr.addColorStop(1, 'rgba(150,138,118,0)');
      g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
  }

  // Parágrafo justificado de verdade: distribui a sobra entre as palavras.
  // Devolve onde parou e o que não coube, pra próxima coluna continuar.
  function paragrafo(g, texto, x, y, colW, lh, maxY) {
    var palavras = String(texto || '').split(' ');
    var i = 0;
    while (i < palavras.length && y < maxY) {
      var linha = [], w = 0;
      while (i < palavras.length) {
        var ww = g.measureText(palavras[i]).width;
        var sp = linha.length ? g.measureText(' ').width : 0;
        if (w + sp + ww > colW && linha.length) break;
        linha.push(palavras[i]); w += sp + ww; i++;
      }
      var ultima = i >= palavras.length;
      if (!ultima && linha.length > 1) {
        var textoW = 0;
        for (var k = 0; k < linha.length; k++) textoW += g.measureText(linha[k]).width;
        var vao = (colW - textoW) / (linha.length - 1);
        var cx = x;
        for (var n = 0; n < linha.length; n++) {
          g.fillText(linha[n], cx, y);
          cx += g.measureText(linha[n]).width + vao;
        }
      } else {
        g.fillText(linha.join(' '), x, y);
      }
      y += lh;
    }
    return { y: y, resto: palavras.slice(i).join(' ') };
  }

  /* ---------- A folha perde a própria aresta ----------
     Tirar borda, raio, fundo e sombra do CSS não resolveu "o motion está
     com borda", e a máscara no canvas também não: o retângulo que o olho
     vê é o PAPEL. Papel claro com quatro arestas retas dentro de um quadro
     escuro é lido como moldura, sempre, por mais limpo que esteja o CSS em
     volta.

     Então a folha deixa de ter aresta. Duas camadas, as duas apagando alfa
     (`destination-out`), aplicadas depois de todo o desenho:

       1. RASGO — uma faixa irregular colada em cada lado, com amplitude
          vinda de senos somados. É o que tira a linha reta. Determinístico
          de propósito: a folha é redesenhada em toda visita e uma borda
          sorteada faria a peça "piscar" diferente a cada carregamento.
       2. DESVANECER — rampa suave por cima do rasgo, e mais forte nos
          quatro cantos, porque canto é o que o olho usa pra fechar o
          retângulo mentalmente. Sem essa parte o rasgo vira serrilha.

     Com alfa na textura, o material precisa de `transparent: true`, e a
     folha para de projetar sombra (sombra segue a malha, não o alfa: ela
     devolveria o retângulo que acabamos de tirar). */
  function dissolver(g, W, H) {
    var onda = function (t, a, b, c) {
      // Três senos primos entre si: repete tarde o suficiente pra a borda
      // não parecer padronizada em nenhum dos quatro lados.
      return (Math.sin(t * a) * 0.5 + Math.sin(t * b + 1.7) * 0.33 + Math.sin(t * c + 4.1) * 0.17);
    };
    // Duas escalas: uma longa, que dá o desalinhamento geral da aresta, e
    // uma curta, que dá a fibra. Só a longa deixava uma onda regular demais
    // — lia como fita recortada, não como papel rasgado.
    var rasgado = function (t) {
      return onda(t / 78, 1, 0.37, 2.3) * 0.68 + onda(t / 13, 1.1, 0.53, 3.1) * 0.32;
    };
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = '#000';

    // 1. Rasgo
    var ampX = W * 0.022, ampY = H * 0.016, passo = 9;
    function lado(eixoX, inicio) {
      var lim = eixoX ? W : H;
      g.beginPath();
      if (eixoX) g.moveTo(-2, inicio ? -2 : H + 2); else g.moveTo(inicio ? -2 : W + 2, -2);
      var p;
      for (p = 0; p <= lim; p += passo) {
        var d = (rasgado(p + (eixoX ? (inicio ? 0 : 611) : (inicio ? 1303 : 2017))) * 0.5 + 0.5)
              * (eixoX ? ampY : ampX);
        if (eixoX) g.lineTo(p, inicio ? d : H - d);
        else g.lineTo(inicio ? d : W - d, p);
      }
      if (eixoX) { g.lineTo(W + 2, inicio ? -2 : H + 2); }
      else { g.lineTo(inicio ? -2 : W + 2, H + 2); }
      g.closePath();
      g.fill();
    }
    lado(true, true); lado(true, false); lado(false, true); lado(false, false);

    // 2. Desvanecer
    function rampa(x, y, w, h, x2, y2) {
      var gr = g.createLinearGradient(x, y, x2, y2);
      gr.addColorStop(0, 'rgba(0,0,0,1)');
      gr.addColorStop(.34, 'rgba(0,0,0,.62)');
      gr.addColorStop(.68, 'rgba(0,0,0,.18)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x, y, w, h);
    }
    var fx = W * 0.075, fy = H * 0.055;
    rampa(0, 0, fx, H, 0, 0, fx, 0);
    rampa(W - fx, 0, fx, H, W, 0, W - fx, 0);
    rampa(0, 0, W, fy, 0, 0, 0, fy);
    rampa(0, H - fy, W, fy, 0, H, 0, H - fy);

    // Cantos: o que o olho usa pra fechar o retângulo
    var raio = Math.max(W, H) * 0.19;
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (c) {
      var gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], raio);
      gr.addColorStop(0, 'rgba(0,0,0,.92)');
      gr.addColorStop(.55, 'rgba(0,0,0,.34)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.beginPath(); g.arc(c[0], c[1], raio, 0, 7); g.fill();
    });
    g.restore();
  }

  function quebrar(g, texto, x, y, maxW, lh) {
    var palavras = String(texto || '').split(' ');
    var linha = '', ly = y;
    for (var i = 0; i < palavras.length; i++) {
      var teste = linha ? linha + ' ' + palavras[i] : palavras[i];
      if (g.measureText(teste).width > maxW && linha) {
        g.fillText(linha, x, ly); ly += lh; linha = palavras[i];
      } else { linha = teste; }
    }
    if (linha) { g.fillText(linha, x, ly); ly += lh; }
    return ly;
  }

  /* A folha. `foto` é a capa já carregada da matéria principal, ou null.

     A segunda versão do comp trouxe duas mudanças que valem: uma SEGUNDA
     matéria em três colunas embaixo, e um preenchedor que RECICLA o texto
     quando a coluna chega ao fim. O segundo ponto é o que garante que
     nenhuma coluna termine no meio com papel em branco embaixo, que é
     exatamente o defeito que aparece num jornal de mentira. */
  function folha(materia, foto) {
    var W = 1500, H = 2010;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    papel(g, W, H);

    var M = 88, CW = W - M * 2;

    // Poço de texto: os resumos das outras matérias do dia, em fila. Quando
    // acaba, recomeça, pra a coluna nunca morrer antes da régua de baixo.
    var poco = materia.corpo;
    function encher(x, y, colW, lh, maxY) {
      var yy = y, guarda = 0;
      while (yy < maxY && guarda++ < 40) {
        var r = paragrafo(g, poco, x, yy, colW, lh, maxY);
        yy = r.y;
        poco = r.resto || materia.corpo;
      }
      return yy;
    }

    // Cabeçalho
    g.fillStyle = INK; g.font = SER('700', 92); g.textAlign = 'center';
    g.fillText('BMAi News', W / 2, 122);
    g.font = SANS('400', 21); g.fillStyle = INK2;
    g.fillText('R A D A R   D I Á R I O   D E   I N T E L I G Ê N C I A   A R T I F I C I A L', W / 2, 164);
    g.textAlign = 'left';
    g.fillStyle = INK; g.fillRect(M, 190, CW, 4);
    g.font = SANS('400', 19); g.fillStyle = INK2;
    g.fillText('EDIÇÃO DE HOJE', M, 224);
    g.textAlign = 'center'; g.fillText(dataDaEdicao(), W / 2, 224);
    g.textAlign = 'right'; g.fillText('bmai.com.br/blog', W - M, 224);
    g.textAlign = 'left';
    g.fillStyle = 'rgba(35,33,30,0.55)'; g.fillRect(M, 240, CW, 1.5);

    // Chapéu: eixo do assunto e veículo que publicou
    var chapeu = [EIXO[materia.eixo] || 'RADAR', (materia.source || '').toUpperCase()]
      .filter(Boolean).join(' · ');
    g.font = SANS('700', 20); g.fillStyle = '#b04600';
    g.fillText(chapeu, M, 300);

    // Manchete
    g.fillStyle = INK; g.font = SER('700', 78);
    var y = quebrar(g, materia.title, M, 384, CW, 84);

    // Olho
    y += 14;
    g.font = SER('400', 34); g.fillStyle = INK2;
    y = quebrar(g, materia.deck, M, y, CW - 60, 46);

    // Crédito. É "apurado por", nunca "redação BMAi": a reportagem é do
    // veículo, e assinar por cima disso seria se apropriar do trabalho dele.
    y += 18;
    g.font = SANS('700', 17); g.fillStyle = 'rgba(35,33,30,0.6)';
    g.fillText('APURADO POR ' + (materia.source || 'VEÍCULO').toUpperCase() + '  ·  LEITURA DA BMAi', M, y);
    y += 26;
    g.fillStyle = 'rgba(35,33,30,0.5)'; g.fillRect(M, y, CW, 1.5);
    y += 44;

    // Foto
    var ph = 400, pw = CW * 0.5;
    if (foto) {
      // "cover" na mão: o canvas não tem object-fit.
      var r = Math.max(pw / foto.width, ph / foto.height);
      var dw = foto.width * r, dh = foto.height * r;
      g.save();
      g.beginPath(); g.rect(M, y, pw, ph); g.clip();
      g.drawImage(foto, M + (pw - dw) / 2, y + (ph - dh) / 2, dw, dh);
      // Meio-tom de jornal por cima, pra a foto pertencer ao papel.
      g.globalCompositeOperation = 'overlay';
      g.fillStyle = 'rgba(233,228,217,0.30)'; g.fillRect(M, y, pw, ph);
      g.globalCompositeOperation = 'source-over';
      g.restore();
    } else {
      g.fillStyle = '#2b2926'; g.fillRect(M, y, pw, ph);
      for (var i = 0; i < 9000; i++) {
        g.fillStyle = 'rgba(233,228,217,' + (Math.random() * 0.5) + ')';
        var px = M + Math.random() * pw, py = y + Math.random() * ph;
        var d = 1 - Math.abs((py - y) / ph - 0.35);
        if (Math.random() < d * 0.7) g.fillRect(px, py, 2.2, 2.2);
      }
    }
    // Legenda: só o crédito da imagem. O comp trazia "A sede da Comissão
    // Europeia, em Bruxelas", que descrevia uma foto que não existe.
    g.fillStyle = 'rgba(35,33,30,0.62)'; g.font = SANS('400', 17);
    g.fillText(foto ? 'Imagem: ' + (materia.source || 'veículo') : 'Radar BMAi',
               M + 6, y + ph + 27);

    // Coluna ao lado da foto
    var vao = 42;
    g.font = SER('400', 21); g.fillStyle = INK;
    encher(M + pw + vao, y + 20, CW - pw - vao, 30, y + ph + 40);

    /* Segunda matéria do dia, em três colunas até a régua de baixo. O comp
       chumbava um título sobre a equipa Qwen; aqui vem a manchete real do
       item seguinte da edição. Sem um segundo item, a área simplesmente não
       é desenhada, em vez de receber título de mentira. */
    var by = y + ph + 84;
    if (materia.head2) {
      g.fillStyle = 'rgba(35,33,30,0.5)'; g.fillRect(M, by - 34, CW, 1.5);
      g.fillStyle = INK; g.font = SER('700', 46);
      by = quebrar(g, materia.head2, M, by, CW * 0.72, 52) + 16;
    }
    var colW = (CW - vao * 2) / 3;
    g.font = SER('400', 21); g.fillStyle = INK;
    for (var col = 0; col < 3; col++) {
      encher(M + col * (colW + vao), by, colW, 30, H - 108);
    }
    g.fillStyle = 'rgba(35,33,30,0.28)';
    for (var cl = 1; cl < 3; cl++) {
      g.fillRect(M + cl * (colW + vao) - vao / 2, by - 24, 1.5, H - 108 - by + 24);
    }

    // Vinco da dobra
    var fy = H * 0.5;
    var fg = g.createLinearGradient(0, fy - 46, 0, fy + 46);
    fg.addColorStop(0, 'rgba(35,33,30,0)');
    fg.addColorStop(0.42, 'rgba(35,33,30,0.14)');
    fg.addColorStop(0.5, 'rgba(35,33,30,0.24)');
    fg.addColorStop(0.58, 'rgba(255,255,255,0.22)');
    fg.addColorStop(1, 'rgba(35,33,30,0)');
    g.fillStyle = fg; g.fillRect(0, fy - 46, W, 92);

    // Desgaste das bordas
    var ev = g.createLinearGradient(0, 0, W, 0);
    ev.addColorStop(0, 'rgba(35,33,30,0.14)');
    ev.addColorStop(0.06, 'rgba(35,33,30,0)');
    ev.addColorStop(0.94, 'rgba(35,33,30,0)');
    ev.addColorStop(1, 'rgba(35,33,30,0.14)');
    g.fillStyle = ev; g.fillRect(0, 0, W, H);

    // Por último, sempre: a aresta some. Ver `dissolver`.
    dissolver(g, W, H);

    return c;
  }

  /* O rolo. A textura envolve o cilindro: X dá a volta na circunferência
     (o sentido da leitura) e Y corre ao longo do rolo.

     A primeira versão desenhava colunas minúsculas de 15px que viravam
     borrão cinza no tamanho em que a peça aparece. Esta redesenha em
     2048x1024 e em corpo grande, e repete o cabeçalho TRÊS vezes ao redor
     da circunferência, pra sempre ter um "BMAi News" virado pra câmera,
     independente de como o rolo parou. */
  function rolo(manchete, corpo) {
    var W = 2048, H = 1024;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    papel(g, W, H);

    g.textAlign = 'center';
    for (var k = 0; k < 3; k++) {
      var cx = W / 6 + k * (W / 3);
      g.fillStyle = INK; g.font = SER('700', 104);
      g.fillText('BMAi News', cx, 150);
      g.font = SANS('400', 30); g.fillStyle = 'rgba(35,33,30,0.7)';
      g.fillText('EDIÇÃO DO DIA', cx, 200);
    }
    g.textAlign = 'left';
    g.fillStyle = INK; g.fillRect(0, 226, W, 5);

    g.fillStyle = INK; g.font = SER('700', 76);
    var y = quebrar(g, manchete, 60, 330, W - 120, 84) + 20;
    g.font = SER('400', 38); g.fillStyle = 'rgba(35,33,30,0.8)';
    var poco = corpo, guarda = 0;
    while (y < H - 70 && guarda++ < 20) {
      var r = paragrafo(g, poco, 60, y, W - 120, 50, H - 70);
      y = r.y;
      poco = r.resto || corpo;
    }

    // A sombra da curvatura corre na circunferência (X), não na altura.
    var sh = g.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, 'rgba(20,18,15,0.55)');
    sh.addColorStop(0.2, 'rgba(20,18,15,0.1)');
    sh.addColorStop(0.42, 'rgba(255,255,255,0.26)');
    sh.addColorStop(0.66, 'rgba(20,18,15,0.14)');
    sh.addColorStop(0.9, 'rgba(20,18,15,0.5)');
    sh.addColorStop(1, 'rgba(20,18,15,0.62)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    // A ponta solta da folha enrolada
    g.fillStyle = 'rgba(20,18,15,0.45)'; g.fillRect(W * 0.78, 0, 7, H);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(W * 0.78 + 7, 0, 4, H);
    return c;
  }

  function espiral() {
    var S = 256;
    var c = document.createElement('canvas');
    c.width = c.height = S;
    var g = c.getContext('2d');
    g.fillStyle = '#ddd6c9'; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(35,33,30,0.4)'; g.lineWidth = 1.6;
    g.beginPath();
    for (var a = 0; a < Math.PI * 14; a += 0.06) {
      var r = 5 + a * 2.7;
      var x = S / 2 + Math.cos(a) * r, y = S / 2 + Math.sin(a) * r;
      if (a) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.stroke();
    var vg = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    vg.addColorStop(0.7, 'rgba(20,18,15,0)');
    vg.addColorStop(1, 'rgba(20,18,15,0.45)');
    g.fillStyle = vg; g.fillRect(0, 0, S, S);
    return c;
  }

  /* ==================== SAÍDA 2D ====================
     Mesma folha, sem mesa 3D. É o que aparece pra quem pediu menos
     movimento, pra tela estreita e pra quem não tem WebGL — ou seja, é o
     que a MAIORIA vê, já que a maioria abre no celular.

     Ela ficou muito tempo sendo o pior enquadramento do site: a folha
     desenhada pequena no meio da caixa, com `shadowBlur` e `shadowOffsetY`
     duros. Sombra dura em cima de um retângulo é exatamente o desenho de
     um card — era a "borda do motion" na tela onde ela mais aparece.

     Agora: a folha ocupa a caixa e sangra por baixo, inclina de leve como
     papel largado na mesa, e o que a separa do fundo é um halo quente da
     marca, não uma aresta. A borda do papel já vem dissolvida da textura,
     então a sombra segue o alfa e nunca desenha um retângulo. */
  function desenhar2d(canvas, pagina) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);

    // A folha cabe INTEIRA no quadro, de propósito. A primeira tentativa
    // sangrava pra fora pra "não fechar o retângulo", e o preço foi o
    // cabeçalho "BMAi News" cortado no topo e a régua da máscara aparecendo
    // como linha reta no pé — dois defeitos piores que o que resolvia.
    // Não precisa mais sangrar: quem tira o retângulo é a borda dissolvida
    // da própria textura, então a folha pode aparecer por completo.
    var r = Math.min((w * 0.98) / pagina.width, (h * 0.98) / pagina.height);
    var dw = pagina.width * r, dh = pagina.height * r;
    var x = (w - dw) / 2, y = (h - dh) / 2;

    // Halo quente: o que destaca a folha do navy. Substitui a sombra dura.
    var halo = g.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, Math.max(w, h) * 0.62);
    halo.addColorStop(0, 'rgba(219,85,0,.16)');
    halo.addColorStop(.5, 'rgba(219,85,0,.05)');
    halo.addColorStop(1, 'rgba(219,85,0,0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, w, h);

    g.save();
    // Inclinação de papel largado, não de captura de tela.
    g.translate(w / 2, h / 2);
    g.rotate(-0.028);
    g.translate(-w / 2, -h / 2);
    // A sombra segue o alfa da textura, então sai difusa em vez de recortar
    // um retângulo. Fica atrás do papel e quase não aparece: é profundidade,
    // não contorno.
    g.shadowColor = 'rgba(8,14,22,.5)';
    g.shadowBlur = 56;
    g.shadowOffsetY = 22;
    g.drawImage(pagina, x, y, dw, dh);
    g.restore();
  }

  /* A folha 2D é estática por natureza — canvas desenhado uma vez. O
     movimento vem do CSS (`.is-2d` faz a peça respirar e o scroll a
     desloca), que roda no compositor e não custa quadro de CPU no celular.
     Quem pediu menos movimento não recebe a classe. */
  function animar2d(palco, canvas) {
    if (REDUZIR) return;
    palco.classList.add('is-2d');
    if (!window.IntersectionObserver) return;
    var alvo = 0, atual = 0, rodando = false;
    function passo() {
      atual += (alvo - atual) * 0.08;
      canvas.style.setProperty('--par', atual.toFixed(2) + 'px');
      if (Math.abs(alvo - atual) > 0.4) requestAnimationFrame(passo);
      else rodando = false;
    }
    var visivel = false;
    new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }).observe(palco);
    window.addEventListener('scroll', function () {
      if (!visivel) return;
      var c = palco.getBoundingClientRect();
      // -1 a 1 conforme a peça cruza a tela; 26px de curso é o suficiente
      // pra ler como profundidade sem virar efeito.
      alvo = ((c.top + c.height / 2) / window.innerHeight - 0.5) * -26;
      if (!rodando) { rodando = true; requestAnimationFrame(passo); }
    }, { passive: true });
  }

  /* ==================== SAÍDA 3D ==================== */
  function montar3d(canvas, pagina, trecho) {
    var THREE = window.THREE;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) {
      return false;                       // sem WebGL: quem chamou cai no 2D
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var cena = new THREE.Scene();
    // O comp foi feito pra ocupar a tela inteira (100vh). Aqui a cena mora
    // numa caixa ao lado do texto, então a câmera vem pra frente: a 9.4 a
    // folha ficava do tamanho de um selo no meio de muito vazio.
    //
    // Ficou em 6.5 enquanto a ideia era "a folha encosta nas bordas do
    // quadro", quando encostar era o melhor disponível. Com a borda do
    // papel dissolvida na textura, encostar virou defeito: o pé da folha
    // batia na régua da máscara e voltava a desenhar uma linha reta. Em
    // 7.3 a folha inteira cabe no quadro com a borda desvanecendo no navy,
    // e os rolos seguem entrando cortados pelos cantos — que é o que dá
    // profundidade sem moldura.
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.3);

    var grupo = new THREE.Group();
    cena.add(grupo);
    var pecas = [];
    function por(malha, pos, rot, s) {
      var suporte = new THREE.Group();
      suporte.position.set(pos[0], pos[1], pos[2]);
      suporte.rotation.set(rot[0], rot[1], rot[2]);
      suporte.scale.setScalar(s || 1);
      suporte.add(malha);
      grupo.add(suporte);
      pecas.push({ suporte: suporte, base: { pos: pos.slice(), rot: rot.slice() } });
    }

    // A folha não é um plano chato: curva no eixo horizontal e ondula de leve.
    function lamina(w, h, mapa) {
      var geo = new THREE.PlaneGeometry(w, h, 60, 80);
      var p = geo.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), yy = p.getY(i);
        var u = x / w, v = yy / h;
        var z = -0.42 * u * u * 1.6;
        z += Math.sin(v * Math.PI * 2.0) * 0.05;
        z += Math.cos(u * Math.PI * 3.0 + v * 2.0) * 0.022;
        z += -Math.exp(-Math.pow(v * 9, 2)) * 0.05;
        p.setZ(i, z);
      }
      geo.computeVertexNormals();
      return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        map: mapa, roughness: 0.94, metalness: 0.0,
        // A textura agora tem alfa (ver `dissolver`), então o material
        // precisa ser transparente pra a borda sumir de verdade em vez de
        // virar recorte duro.
        transparent: true,
        // FrontSide, não DoubleSide: com transparência, as duas faces se
        // somam e a borda desvanecida fica DUAS vezes mais densa — voltava
        // a desenhar um contorno. A folha curva pouco (z vai de 0 a -0.17)
        // e nunca vira de costas, então a face de trás não faz falta.
        side: THREE.FrontSide,
        bumpMap: mapa, bumpScale: 0.006,
        depthWrite: false,
      }));
    }

    var texPagina = new THREE.CanvasTexture(pagina);
    texPagina.anisotropy = 16;
    var folhaMalha = lamina(3.0, 4.02, texPagina);
    folhaMalha.castShadow = true; folhaMalha.receiveShadow = true;
    /* A sombra padrão segue a MALHA, não o alfa: com a borda dissolvida na
       textura, a folha projetava de volta exatamente o retângulo que o
       `dissolver()` tinha acabado de tirar.

       Desligar `castShadow` resolvia isso e criava outro problema: some
       junto o auto-sombreamento da curvatura, que é o que modela a folha.
       Sem ele o papel fica chapado e claro demais — testado, e a peça
       perdeu o volume inteiro.

       A saída é um material de profundidade próprio: o three usa ESTE pra
       desenhar o mapa de sombra, e com `alphaTest` ele recorta pelo alfa da
       textura. Resultado: a sombra sai no formato do papel dissolvido, e o
       render continua com a borda suave (alphaTest no material principal
       cortaria o desvanecer numa aresta dura). */
    folhaMalha.customDepthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: texPagina,
      alphaTest: 0.5,
    });
    por(folhaMalha, [-0.1, 0.05, 0.4], [-0.05, -0.18, -0.05], 1.0);

    // Uma textura de rolo só, reaproveitada como mapa e como relevo nos dois
    // rolos. O comp gera um canvas novo a cada chamada, quatro no total.
    var texRolo = new THREE.CanvasTexture(rolo(trecho.manchete, trecho.corpo));
    texRolo.anisotropy = 16;
    var texTopo = new THREE.CanvasTexture(espiral());
    var lado = new THREE.MeshStandardMaterial({ map: texRolo, roughness: 0.92, bumpMap: texRolo, bumpScale: 0.004 });
    var tampa = new THREE.MeshStandardMaterial({ map: texTopo, roughness: 0.95 });
    var elastico = new THREE.MeshStandardMaterial({ color: '#7d5a3c', roughness: 0.6 });

    function cilindro(len, rad) {
      var grupo = new THREE.Group();
      var corpo = new THREE.Mesh(
        new THREE.CylinderGeometry(rad, rad * 0.93, len, 64, 1, false), [lado, tampa, tampa]);
      corpo.castShadow = true;
      grupo.add(corpo);
      // O elástico segurando o rolo: detalhe pequeno que é o que faz a peça
      // ler como jornal enrolado e não como um tubo de papel.
      var faixa = new THREE.Mesh(new THREE.TorusGeometry(rad * 1.01, rad * 0.06, 10, 48), elastico);
      faixa.rotation.x = Math.PI / 2;
      faixa.position.y = -len * 0.22;
      faixa.castShadow = true;
      grupo.add(faixa);
      grupo.rotation.z = Math.PI / 2;
      return grupo;
    }
    por(cilindro(3.3, 0.29), [-2.9, -1.9, 0.7], [0.08, 0.18, 0.36], 1.0);
    por(cilindro(2.9, 0.25), [3.0, 1.7, -0.5], [-0.08, -0.2, -0.52], 0.96);

    /* Luz calibrada em cima da peça renderizada, não herdada do comp.
       O comp era uma cena de tela cheia sobre fundo escuro, onde estourar
       o papel de branco funcionava como efeito. Aqui a folha é o conteúdo:
       ela carrega manchete, olho e colunas de texto real, e com a chave em
       2.0 o papel (#e9e4d9, já claro) saturava em branco e a tinta sumia
       dentro dele — o jornal virava um retângulo de luz.

       Chave em 1.15 e hemisférica em 0.42: o papel volta a ser papel, a
       tinta volta a ser legível, e as dobras da folha continuam com o
       volume que a curvatura desenha. */
    var chave = new THREE.DirectionalLight(0xfff1e2, 1.15);
    chave.position.set(4, 7, 8); chave.castShadow = true;
    chave.shadow.mapSize.set(1024, 1024);
    chave.shadow.camera.left = -8; chave.shadow.camera.right = 8;
    chave.shadow.camera.top = 8; chave.shadow.camera.bottom = -8;
    // Sem bias a sombra do próprio papel se auto-recorta em faixas (a folha
    // é curva e quase paralela à luz nas pontas).
    chave.shadow.bias = -0.0012;
    cena.add(chave);
    var recorte = new THREE.PointLight(0xff6a12, 0.9, 30);   // o laranja da marca
    recorte.position.set(-6, -3, 3); cena.add(recorte);
    var rebote = new THREE.PointLight(0x8fb6e6, 0.34, 30);
    rebote.position.set(-3, 4, -5); cena.add(rebote);
    cena.add(new THREE.HemisphereLight(0x9fb4c9, 0x1a2a3c, 0.42));

    function medir() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    medir();
    window.addEventListener('resize', medir);

    var rato = { x: 0, y: 0, ax: 0, ay: 0 };
    window.addEventListener('mousemove', function (e) {
      rato.ax = (e.clientX / window.innerWidth - 0.5);
      rato.ay = (e.clientY / window.innerHeight - 0.5);
    });

    // Só anima com a peça na tela. Fora dela, a aba para de gastar GPU.
    var visivel = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; })
        .observe(canvas);
    }

    var relogio = new THREE.Clock();
    (function quadro() {
      requestAnimationFrame(quadro);
      if (!visivel) return;
      var t = relogio.getElapsedTime();
      grupo.rotation.y = Math.sin(t * 0.24) * 0.1;
      grupo.rotation.x = Math.cos(t * 0.2) * 0.035;
      for (var i = 0; i < pecas.length; i++) {
        var B = pecas[i].base, s = pecas[i].suporte;
        s.position.y = B.pos[1] + Math.sin(t * 0.45 + i * 1.6) * 0.09;
        s.rotation.z = B.rot[2] + Math.sin(t * 0.34 + i * 1.1) * 0.022;
        s.rotation.y = B.rot[1] + Math.sin(t * 0.29 + i * 0.8) * 0.045;
      }
      rato.x += (rato.ax - rato.x) * 0.05;
      rato.y += (rato.ay - rato.y) * 0.05;
      camera.position.x = rato.x * 1.6;
      camera.position.y = -rato.y * 1.1;
      camera.lookAt(0, 0, 0);
      renderer.render(cena, camera);
    })();
    return true;
  }

  /* ==================== MONTAGEM ==================== */

  function carregarThree() {
    return new Promise(function (ok, erro) {
      if (window.THREE) return ok();
      var s = document.createElement('script');
      s.src = THREE_SRC;
      s.onload = function () { window.THREE ? ok() : erro(new Error('three vazio')); };
      s.onerror = function () { erro(new Error('three 404')); };
      document.head.appendChild(s);
    });
  }

  // A foto entra na textura, então precisa de crossOrigin: sem ele o canvas
  // fica contaminado e o WebGL recusa a textura. A API manda o cabeçalho.
  function carregarFoto(src) {
    return new Promise(function (ok) {
      if (!src) return ok(null);
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { ok(im); };
      im.onerror = function () { ok(null); };     // sem foto, o bloco vira meio-tom
      im.src = src;
    });
  }

  function marcaSozinha(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    var g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    g.textAlign = 'center';
    g.fillStyle = 'rgba(237,231,225,0.92)';
    g.font = SER('700', Math.round(w * 0.13));
    g.fillText('BMAi News', w / 2, h / 2);
    g.font = SANS('400', Math.round(w * 0.032));
    g.fillStyle = 'rgba(237,231,225,0.5)';
    g.fillText('RADAR DIÁRIO DE INTELIGÊNCIA ARTIFICIAL', w / 2, h / 2 + w * 0.075);
  }

  var canvas = palco.querySelector('canvas');
  if (!canvas) return;

  fetch(API + '/blog/radar', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('radar ' + r.status); return r.json(); })
    .then(function (lista) {
      if (!Array.isArray(lista) || !lista.length) throw new Error('edição vazia');

      var topo = lista[0];
      var segunda = lista[1] || null;
      var materia = {
        title: topo.title || '',
        deck: topo.summary || '',
        source: topo.source || '',
        eixo: topo.eixo || '',
        // Manchete da segunda matéria da edição, pro bloco de três colunas.
        // Sem segundo item, fica vazio em vez de receber título inventado.
        head2: segunda ? (segunda.title || '') : '',
        // O corpo são os resumos das OUTRAS matérias do dia. Texto real,
        // da mesma edição que a página mostra abaixo. Com 60 na edição, o
        // poço é fundo o suficiente pra encher a folha sem se repetir.
        corpo: lista.slice(1).map(function (i) { return i.summary || ''; })
                    .filter(Boolean).join('  '),
      };
      if (!materia.title) throw new Error('sem manchete');

      return carregarFoto(topo.image ? API + topo.image : null).then(function (foto) {
        var pagina = folha(materia, foto);
        // O rolo tem o seu próprio poço, montado da lista inteira: a folha
        // gasta o dela ao desenhar as colunas.
        var trecho = {
          manchete: materia.title,
          corpo: lista.map(function (i) { return i.summary || ''; })
                      .filter(Boolean).join('  '),
        };

        // A saída 2D precisa redesenhar quando a caixa muda de tamanho: o
        // canvas tem resolução própria e girar o celular deixava a folha
        // esticada. O 3D já tem o seu `medir()`.
        function saida2d() {
          desenhar2d(canvas, pagina);
          animar2d(palco, canvas);
          var t;
          window.addEventListener('resize', function () {
            clearTimeout(t);
            t = setTimeout(function () { desenhar2d(canvas, pagina); }, 160);
          });
        }

        if (REDUZIR || ESTREITO) { saida2d(); return; }
        return carregarThree()
          .then(function () {
            if (!montar3d(canvas, pagina, trecho)) saida2d();
          })
          .catch(function () { saida2d(); });
      });
    })
    .catch(function () {
      // Sem edição não se desenha jornal: seria manchete inventada na
      // abertura de um blog que promete o contrário.
      marcaSozinha(canvas);
    });
})();
