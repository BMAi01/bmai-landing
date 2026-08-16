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
    // Grão maior e em menor quantidade: a folha aparece reduzida ~6x, e
    // ponto de 1,6px sumia embaixo de um pixel. O que sobrava não era
    // fibra, era chiado. Em 3px o grão continua sendo grão depois da
    // redução, e são menos pontos pra desenhar.
    var pontos = Math.round(W * H * 0.0032);
    for (var i = 0; i < pontos; i++) {
      g.fillStyle = Math.random() > 0.5
        ? 'rgba(120,110,95,' + (Math.random() * 0.09) + ')'
        : 'rgba(255,255,255,' + (Math.random() * 0.14) + ')';
      g.fillRect(Math.random() * W, Math.random() * H, 3, 3);
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

  /* ---------- A folha termina como folha ----------
     Histórico curto, porque este pedaço já foi refeito quatro vezes e a
     próxima pessoa merece não repetir nenhuma delas:

     1. Borda, raio, fundo e sombra no CSS: tirados, e "o motion está com
        borda" continuou. O retângulo que o olho via não era do CSS.
     2. `mask-image` no canvas: também não, pelo mesmo motivo.
     3. Aresta RASGADA — três senos em duas escalas, ~58px de amplitude
        numa folha de 1526. Tirava o retângulo e criava um defeito maior: a
        peça aparece com 250 a 380px de largura, e nessa redução a onda de
        escala curta não lê como papel rasgado, lê como PICOTADO, de
        recorte de tesoura sem jeito. Pior: com 58px de amplitude a onda
        entrava no miolo, comendo a primeira letra da manchete e as últimas
        linhas das colunas. Foi o que o usuário viu e pediu pra tirar.
     4. Esta. Aresta RETA, cantos levemente arredondados, e o desvanecer
        fazendo sozinho o trabalho de não desenhar moldura.

     A máscara é o miolo da folha desenhado num canvas à parte, borrado, e
     aplicado como alfa por `destination-in`. Reta ou ondulada, é o borrão
     que impede a aresta seca; a ondulação nunca foi o que resolvia.

     O recuo é pequeno (1,8% do lado menor) e o miolo de texto começa em
     112px: a transição inteira cabe na margem branca do jornal e não toca
     em conteúdo nenhum. Essa é a diferença que importa em relação à v3.

     Com alfa na textura o material precisa de `transparent: true`, e a
     sombra projetada sai de um `customDepthMaterial` com `alphaTest` —
     sombra normal segue a malha, não o alfa, e devolveria o retângulo.

     ⚠️ Conferir MEDINDO. A régua é a largura da transição de alfa nos
     quatro lados: curta demais volta a borda, longa demais desfoca a
     folha. Hoje: ~9px de transição na tela, nos quatro lados.

     `ctx.filter` não existe em Safari antigo. Sem ele a folha fica com a
     aresta seca — pior que o alvo, e ainda assim uma folha retangular
     normal, que é o que foi pedido. */
  function dissolver(g, W, H) {
    var mask = document.createElement('canvas');
    mask.width = W; mask.height = H;
    var mg = mask.getContext('2d');

    var men = Math.min(W, H);
    var rec = Math.round(men * 0.018);      // recuo da aresta
    var raio = Math.round(men * 0.012);     // canto de papel, não de card
    var borrao = Math.round(men * 0.006);   // o desvanecer

    mg.fillStyle = '#000';
    mg.beginPath();
    if (mg.roundRect) mg.roundRect(rec, rec, W - rec * 2, H - rec * 2, raio);
    else mg.rect(rec, rec, W - rec * 2, H - rec * 2);
    mg.fill();

    g.save();
    g.globalCompositeOperation = 'destination-in';
    if (typeof g.filter === 'string') g.filter = 'blur(' + borrao + 'px)';
    g.drawImage(mask, 0, 0);
    g.filter = 'none';
    g.restore();
  }

  /* `maxL` limita o número de linhas e fecha com reticências.

     Sem esse limite a folha não tem orçamento vertical: manchete de 3
     linhas em vez de 2 empurra foto, segunda matéria e colunas pra baixo
     da régua, e o pé da página sai em branco ou cortado. Isso já
     acontecia; só não aparecia enquanto o corpo era pequeno demais pra
     alguém reparar no que faltava embaixo. */
  function quebrar(g, texto, x, y, maxW, lh, maxL) {
    var palavras = String(texto || '').split(' ');
    var linhas = [], linha = '';
    for (var i = 0; i < palavras.length; i++) {
      var teste = linha ? linha + ' ' + palavras[i] : palavras[i];
      if (g.measureText(teste).width > maxW && linha) {
        linhas.push(linha); linha = palavras[i];
      } else { linha = teste; }
    }
    if (linha) linhas.push(linha);

    if (maxL && linhas.length > maxL) {
      linhas = linhas.slice(0, maxL);
      var ult = linhas[maxL - 1];
      while (ult && g.measureText(ult + '…').width > maxW) {
        ult = ult.replace(/\s*\S+$/, '');
      }
      linhas[maxL - 1] = (ult || linhas[maxL - 1]) + '…';
    }

    var ly = y;
    for (var k = 0; k < linhas.length; k++) { g.fillText(linhas[k], x, ly); ly += lh; }
    return ly;
  }

  /* A folha. `foto` é a capa já carregada da matéria principal, ou null.

     A segunda versão do comp trouxe duas mudanças que valem: uma SEGUNDA
     matéria em três colunas embaixo, e um preenchedor que RECICLA o texto
     quando a coluna chega ao fim. O segundo ponto é o que garante que
     nenhuma coluna termine no meio com papel em branco embaixo, que é
     exatamente o defeito que aparece num jornal de mentira. */
  function folha(materia, foto) {
    /* 1526x2048 (era 1500x2010). Mesma proporção, um pouco mais de texel.

       ⚠️ Não é por causa de potência de dois. Cheguei a escrever aqui que
       o three estaria reamostrando a folha por ela não ser POT — e conferi
       depois: este renderer pega contexto **WebGL 2.0** (`isWebGL2: true`,
       anisotropia máxima 16), e em WebGL2 textura fora de potência de dois
       tem mipmap e repetição normalmente. Não havia reamostragem nenhuma.
       Fica registrado pra ninguém "otimizar" isso de novo pelo motivo
       errado.

       A qualidade ruim vinha de dois lugares, os dois tratados: a cena era
       renderizada em 536x429 num monitor comum (ver o piso de pixelRatio
       em `montar3d`), e o corpo de texto era pequeno demais pra sobreviver
       à redução (ver a escala logo abaixo). */
    var W = 1526, H = 2048;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    papel(g, W, H);

    var M = 112, CW = W - M * 2;

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

    /* ---------- Escala de corpo ----------
       A peça inteira aparece com cerca de 250px de largura. Vindo de uma
       folha de 1526, isso é uma redução de ~6x: o corpo de 21px que o comp
       usava chegava na tela com 3,5px e não era texto, era ruído cinza — a
       outra metade da "qualidade ruim".

       Tudo aqui foi redimensionado pra sobreviver a essa redução: o corpo
       saiu de 21 pra 40 (≈6,5px na tela, que lê como coluna de jornal), o
       bloco de baixo passou de três colunas pra duas, e a manchete e o olho
       cresceram junto pra a hierarquia continuar a mesma. Menos palavras,
       maiores. Jornal de verdade em miniatura também não se lê: o que
       precisa é PARECER jornal, e pra isso a mancha de texto tem que ter
       linha, não granulado. */

    // Cabeçalho
    g.fillStyle = INK; g.font = SER('700', 108); g.textAlign = 'center';
    g.fillText('BMAi News', W / 2, 134);
    g.font = SANS('400', 25); g.fillStyle = INK2;
    g.fillText('R A D A R   D I Á R I O   D E   I A', W / 2, 182);
    g.textAlign = 'left';
    g.fillStyle = INK; g.fillRect(M, 212, CW, 5);
    g.font = SANS('400', 24); g.fillStyle = INK2;
    g.fillText('EDIÇÃO DE HOJE', M, 254);
    g.textAlign = 'center'; g.fillText(dataDaEdicao(), W / 2, 254);
    g.textAlign = 'right'; g.fillText('bmai.com.br/blog', W - M, 254);
    g.textAlign = 'left';
    g.fillStyle = 'rgba(35,33,30,0.55)'; g.fillRect(M, 272, CW, 2);

    // Chapéu: eixo do assunto e veículo que publicou
    var chapeu = [EIXO[materia.eixo] || 'RADAR', (materia.source || '').toUpperCase()]
      .filter(Boolean).join(' · ');
    g.font = SANS('700', 26); g.fillStyle = '#b04600';
    g.fillText(chapeu, M, 336);

    /* Daqui pra baixo o orçamento vertical é fixo, e por isso a folha
       fecha igual com qualquer manchete: 3 linhas de manchete, 3 de olho,
       2 de segunda manchete. O que passar disso é cortado com reticências,
       porque a alternativa é empurrar as colunas de baixo pra fora da
       régua e deixar o pé da página vazio. */
    // Manchete
    g.fillStyle = INK; g.font = SER('700', 84);
    var y = quebrar(g, materia.title, M, 420, CW, 94, 3);

    // Olho
    y += 18;
    g.font = SER('400', 44); g.fillStyle = INK2;
    y = quebrar(g, materia.deck, M, y, CW - 60, 58, 3);

    // Crédito. É "apurado por", nunca "redação BMAi": a reportagem é do
    // veículo, e assinar por cima disso seria se apropriar do trabalho dele.
    y += 22;
    g.font = SANS('700', 23); g.fillStyle = 'rgba(35,33,30,0.6)';
    g.fillText('APURADO POR ' + (materia.source || 'VEÍCULO').toUpperCase() + '  ·  LEITURA DA BMAi', M, y);
    y += 32;
    g.fillStyle = 'rgba(35,33,30,0.5)'; g.fillRect(M, y, CW, 2);
    y += 48;

    // Foto
    var ph = 360, pw = CW * 0.5;
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
    g.fillStyle = 'rgba(35,33,30,0.62)'; g.font = SANS('400', 23);
    g.fillText(foto ? 'Imagem: ' + (materia.source || 'veículo') : 'Radar BMAi',
               M + 6, y + ph + 34);

    // Coluna ao lado da foto
    var vao = 46;
    g.font = SER('400', 40); g.fillStyle = INK;
    encher(M + pw + vao, y + 34, CW - pw - vao, 54, y + ph + 44);

    /* Segunda matéria do dia até a régua de baixo. O comp chumbava um
       título sobre a equipa Qwen; aqui vem a manchete real do item
       seguinte da edição. Sem um segundo item, a área simplesmente não é
       desenhada, em vez de receber título de mentira.

       Eram TRÊS colunas. Com o corpo em 40px, três colunas dariam ~10
       caracteres por linha, o que empilha hífen e vira serrilha na
       redução. Duas colunas mantêm a linha com medida de jornal. */
    var COLS = 2;
    var by = y + ph + 92;
    if (materia.head2) {
      g.fillStyle = 'rgba(35,33,30,0.5)'; g.fillRect(M, by - 42, CW, 2);
      g.fillStyle = INK; g.font = SER('700', 56);
      by = quebrar(g, materia.head2, M, by, CW * 0.78, 64, 2) + 18;
    }
    var colW = (CW - vao * (COLS - 1)) / COLS;
    g.font = SER('400', 40); g.fillStyle = INK;
    for (var col = 0; col < COLS; col++) {
      encher(M + col * (colW + vao), by, colW, 54, H - 118);
    }
    g.fillStyle = 'rgba(35,33,30,0.28)';
    for (var cl = 1; cl < COLS; cl++) {
      g.fillRect(M + cl * (colW + vao) - vao / 2, by - 30, 2, H - 118 - by + 30);
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
    g.fillStyle = INK; g.fillRect(0, 226, W, 6);

    // O rolo aparece com ~120px de largura, vindo de 2048: redução de 17x.
    // Corpo de 38px chegava em 2px, ou seja, nada. Aqui a manchete carrega
    // sozinha e o corpo existe só como mancha de linha.
    g.fillStyle = INK; g.font = SER('700', 96);
    var y = quebrar(g, manchete, 60, 350, W - 120, 108) + 26;
    g.font = SER('400', 62); g.fillStyle = 'rgba(35,33,30,0.8)';
    var poco = corpo, guarda = 0;
    while (y < H - 70 && guarda++ < 20) {
      var r = paragrafo(g, poco, 60, y, W - 120, 80, H - 70);
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
    // Piso 2, teto 3. O teto era 2, e celular de dpr 3 (quase todos) ficava
    // com a folha desenhada em 2x e esticada pra 3x pelo navegador: borrão.
    // Aqui é um `drawImage` só, então subir pra 3 não custa quadro nenhum.
    var dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
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
  function montar3d(canvas, pagina, trecho, aoPrimeiroQuadro) {
    var THREE = window.THREE;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) {
      return false;                       // sem WebGL: quem chamou cai no 2D
    }
    /* Piso de 2, não teto de 2.
       Era `min(devicePixelRatio, 2)`. Num monitor comum (dpr 1) isso
       significava desenhar a cena inteira em 536x429 px — uma folha de
       jornal com dois rolos, num quadro do tamanho de um cartão. Cada
       aresta virava escada e a mancha de texto virava chiado.
       Com piso 2 a cena é renderizada no dobro e o navegador reduz na
       hora de exibir, que é antisserrilhamento de graça. O teto de 2.5
       segura o custo em tela retina. */
    // Teto menor na tela estreita: o celular tem dpr 3 e a caixa é pequena,
    // então 2x já dá mais texel do que a tela mostra, por menos GPU.
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 2), ESTREITO ? 2 : 2.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var cena = new THREE.Scene();
    /* A distância da câmera não é mais um número escolhido a olho.

       Ela já foi 9.4, 8.6, 7.6, 6.5 e 7.3, cada uma resolvendo o defeito
       da anterior e criando o seguinte, porque um número fixo só funciona
       pra UM formato de quadro. A caixa desta peça muda de proporção com a
       largura da janela, então qualquer número fixo corta alguma coisa em
       alguma tela.

       Agora quem decide é a geometria: `enquadrar()` mede a caixa que
       contém a cena inteira (folha e os dois rolos) e recua a câmera até
       ela caber, com folga. Roda no início e a cada `resize`. O pedido que
       levou a isso foi direto: os rolos precisam aparecer inteiros e a
       folha do meio não pode ficar cortada. */
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

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
    /* Os rolos vieram do comp em [-2.9, -1.9] e [3.0, 1.7], com 3.3 e 2.9
       de comprimento. Lá isso funciona: a cena ocupa a tela inteira e há
       espaço de sobra em volta da folha. Aqui, com o enquadramento
       obrigado a mostrar tudo, essas posições viram o fator que define o
       tamanho de TUDO: a cena precisava de 8,65 unidades de largura pra
       uma folha de 3, então a folha ficava com um terço do quadro e o
       resto era navy vazio.

       Encostados na folha e mais curtos, a cena cai pra ~5 unidades. O
       desenho é o mesmo (um rolo em cada canto oposto, cruzando a folha),
       mas agora o jornal é o assunto do quadro em vez de um selo no meio
       dele. */
    por(cilindro(2.45, 0.28), [-1.92, -1.92, 0.7], [0.08, 0.18, 0.36], 1.0);
    por(cilindro(2.15, 0.25), [1.98, 1.78, -0.5], [-0.08, -0.2, -0.52], 0.96);

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

    /* ---------- Enquadramento pela geometria ----------
       Mede a caixa que contém a cena inteira (a folha e os dois rolos),
       centraliza o grupo nela e recua a câmera até a caixa caber nos DOIS
       eixos, com folga. Assim nada fica cortado em nenhuma proporção de
       quadro, que era o que nenhum número fixo de câmera conseguia.

       A folga (`FOLGA`) não é enfeite: a cena balança sozinha (o grupo gira
       ±0.1rad no eixo Y e ±0.035 no X) e a câmera acompanha o ponteiro.
       Sem margem, a peça caberia parada e encostaria na borda em
       movimento, que é o mesmo defeito com passo extra. */
    /* Folga menor na tela estreita. Ela existe pra a cena não encostar na
       borda enquanto balança, e no desktop 1.20 é o certo — lá o quadro é
       5/4 e há movimento de ponteiro. No celular o quadro é 1/1 e a cena é
       quase quadrada, então a mesma folga vira margem morta dos dois lados
       e o jornal aparece como um selo no meio do navy. Com 1.10 a peça
       volta a ocupar o quadro, e o parallax de rolagem (curso menor que o
       de ponteiro) continua cabendo. */
    var FOLGA = ESTREITO ? 1.10 : 1.20;
    var caixaCena = null;

    function medirCena() {
      // Com o grupo na posição neutra: a caixa tem que descrever a cena,
      // não o instante da animação em que ela foi medida.
      var rx = grupo.rotation.x, ry = grupo.rotation.y, px = grupo.position.x, py = grupo.position.y;
      grupo.rotation.set(0, 0, 0);
      grupo.position.set(0, 0, 0);
      grupo.updateMatrixWorld(true);
      var b = new THREE.Box3().setFromObject(grupo);
      grupo.rotation.x = rx; grupo.rotation.y = ry;
      grupo.position.x = px; grupo.position.y = py;
      caixaCena = {
        centro: b.getCenter(new THREE.Vector3()),
        tam: b.getSize(new THREE.Vector3()),
      };
    }

    function medir() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      if (!caixaCena) medirCena();
      // Centraliza a cena no quadro: sem isto a caixa cabe mas fica torta,
      // porque os dois rolos não são simétricos em volta da origem.
      grupo.position.x = -caixaCena.centro.x;
      grupo.position.y = -caixaCena.centro.y;

      var meioFov = (camera.fov * Math.PI / 180) / 2;
      var porAltura  = (caixaCena.tam.y * FOLGA / 2) / Math.tan(meioFov);
      var porLargura = (caixaCena.tam.x * FOLGA / 2) / (Math.tan(meioFov) * camera.aspect);
      // A profundidade importa: o que está mais à frente precisa caber do
      // lugar onde ele está, não do centro da caixa.
      camera.position.z = Math.max(porAltura, porLargura) + caixaCena.tam.z / 2;
      camera.updateProjectionMatrix();
    }
    medir();
    window.addEventListener('resize', medir);

    var rato = { x: 0, y: 0, ax: 0, ay: 0 };
    window.addEventListener('mousemove', function (e) {
      rato.ax = (e.clientX / window.innerWidth - 0.5);
      rato.ay = (e.clientY / window.innerHeight - 0.5);
    });
    /* No celular não existe ponteiro, então o parallax vem da ROLAGEM: a
       cena inclina conforme a peça atravessa a tela. Sem isto o motion no
       celular só respira parado, que é metade do movimento que o desktop
       tem — e a cena no celular foi justamente o que se pediu. */
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
      window.addEventListener('scroll', function () {
        var c = canvas.getBoundingClientRect();
        if (c.bottom < 0 || c.top > window.innerHeight) return;
        rato.ay = ((c.top + c.height / 2) / window.innerHeight - 0.5) * 0.9;
      }, { passive: true });
    }

    // Só anima com a peça na tela. Fora dela, a aba para de gastar GPU.
    var visivel = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; })
        .observe(canvas);
    }

    var relogio = new THREE.Clock();
    var primeiro = true;
    (function quadro() {
      requestAnimationFrame(quadro);
      if (!visivel && !primeiro) return;
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
      // Curso curto (era 1.6 / 1.1). Com a cena enquadrada pra caber
      // inteira, um parallax largo tira os rolos do quadro no meio do
      // movimento — resolveria parado e quebraria andando.
      camera.position.x = rato.x * 0.55;
      camera.position.y = -rato.y * 0.4;
      camera.lookAt(0, 0, 0);
      renderer.render(cena, camera);
      // A troca do 2D pelo 3D acontece AQUI, e não quando o three carrega:
      // só neste ponto existe cena desenhada pra pôr no lugar da folha.
      if (primeiro) {
        primeiro = false;
        if (aoPrimeiroQuadro) aoPrimeiroQuadro();
      }
    })();
    return true;
  }

  /* ==================== MONTAGEM ==================== */

  /* A MESMA edição que o blog-index.js pede pra montar a seção de notícias.
     São 129 KB de JSON e até agora cada script baixava a sua cópia. Aqui
     fica guardada a PROMESSA, não o resultado, então a ordem em que os dois
     scripts rodam não importa. Mexeu aqui, mexa no blog-index.js. */
  function edicaoDoRadar() {
    if (!window.__bmaiEdicao) {
      window.__bmaiEdicao = fetch(API + '/blog/radar', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('radar ' + r.status); return r.json(); });
    }
    return window.__bmaiEdicao;
  }

  /* Aparelho que não deve receber WebGL. Repare que NÃO é "celular":
     celular de hoje roda esta cena bem, e cortar por largura era o que
     tirava o motion justamente de quem mais abre o site. O corte é por
     capacidade declarada — pouca memória ou pouco núcleo. */
  function fraco() {
    var mem = navigator.deviceMemory || 8;
    var nucleos = navigator.hardwareConcurrency || 8;
    return mem <= 2 || nucleos <= 2;
  }

  // O three só entra depois que o navegador respira: a folha 2D já está na
  // tela, então 589 KB não têm pressa nenhuma de competir com o primeiro
  // desenho da página.
  function ocioso(fn) {
    if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 2500 });
    else setTimeout(fn, 500);
  }

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
    // Piso 2, teto 3. O teto era 2, e celular de dpr 3 (quase todos) ficava
    // com a folha desenhada em 2x e esticada pra 3x pelo navegador: borrão.
    // Aqui é um `drawImage` só, então subir pra 3 não custa quadro nenhum.
    var dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
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

  edicaoDoRadar()
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

        /* Monta a cena num canvas NOVO e só troca quando o primeiro quadro
           estiver desenhado.

           Não dá pra reaproveitar o canvas do 2D: um canvas que já entregou
           contexto 2D não devolve contexto WebGL depois. E não dá pra criar
           o canvas 3D já visível: ele nasce transparente e piscaria um
           buraco no lugar da folha até o three terminar de montar. Por isso
           ele entra por cima, invisível, e a troca é no quadro em que a
           cena existe. */
        function trocarPor3d() {
          var novo = document.createElement('canvas');
          novo.className = canvas.className;
          novo.style.cssText = 'position:absolute;inset:0;opacity:0';
          palco.appendChild(novo);

          var ok = montar3d(novo, pagina, trecho, function aoPrimeiroQuadro() {
            palco.classList.remove('is-2d');     // a respiração era do 2D
            novo.style.cssText = '';
            canvas.remove();
            // A caixa mudou de dono; `medir()` do 3D escuta resize.
            try { window.dispatchEvent(new Event('resize')); } catch (e) {}
          });
          if (!ok) novo.remove();                // sem WebGL: fica a folha 2D
        }

        /* A folha 2D entra PRIMEIRO, em toda tela. Ela é o próprio canvas da
           textura, já pronto na memória, então aparece no mesmo quadro em
           que a edição chega — sem esperar os 589 KB do three.js. O 3D vem
           por cima quando estiver pronto.

           Antes: `if (REDUZIR || ESTREITO) 2D e acabou`. O corte por largura
           (≤860px) tirava a cena de quem abre no celular, que é a maioria do
           público, e era o que o usuário via como "o motion não funciona no
           mobile". Quem decide agora é o aparelho, não o tamanho da tela. */
        saida2d();
        if (REDUZIR || fraco()) return;
        ocioso(function () {
          carregarThree().then(trocarPor3d).catch(function () {
            /* three fora do ar: a folha 2D já está na tela e continua lá */
          });
        });
      });
    })
    .catch(function () {
      // Sem edição não se desenha jornal: seria manchete inventada na
      // abertura de um blog que promete o contrário.
      marcaSozinha(canvas);
    });
})();
