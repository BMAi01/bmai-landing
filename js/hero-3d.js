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

  /* A folha. `foto` é a capa já carregada da matéria principal, ou null. */
  function folha(materia, foto) {
    var W = 1500, H = 2010;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    papel(g, W, H);

    var M = 88, CW = W - M * 2;

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
    var ph = 420, pw = CW * 0.52;
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
    g.fillStyle = 'rgba(20,18,15,0.55)'; g.fillRect(M, y + ph - 34, pw, 34);
    g.fillStyle = 'rgba(233,228,217,0.92)'; g.font = SANS('400', 17);
    g.fillText(foto ? 'Imagem: ' + (materia.source || 'veículo') : 'Radar BMAi', M + 14, y + ph - 12);

    // Corpo: as outras matérias da edição, justificadas em colunas
    var vao = 44;
    var colW = (CW - vao) / 2;
    g.font = SER('400', 21); g.fillStyle = INK;
    var resto = materia.corpo;
    var r1 = paragrafo(g, resto, M + pw + vao, y + 20, CW - pw - vao, 30, y + ph + 240);
    resto = r1.resto;
    var topo = y + ph + 34;
    for (var col = 0; col < 2; col++) {
      var cx = M + col * (colW + vao);
      var rr = paragrafo(g, resto, cx, topo, colW, 30, H - 120);
      resto = rr.resto;
    }
    g.strokeStyle = 'rgba(35,33,30,0.35)'; g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(M + colW + vao / 2, topo - 20);
    g.lineTo(M + colW + vao / 2, H - 130);
    g.stroke();

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

    return c;
  }

  function rolo(trecho) {
    var W = 2048, H = 512;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    papel(g, W, H);
    g.font = SER('400', 15); g.fillStyle = 'rgba(35,33,30,0.75)';
    for (var x = 40; x < W - 40; x += 168) {
      var resto = trecho + ' ' + trecho;
      for (var i = 0; i < 22; i++) {
        var r = paragrafo(g, resto, x, 40 + i * 20, 132, 20, 10000);
        resto = r.resto || trecho;
      }
    }
    g.fillStyle = PAPEL; g.fillRect(520, 168, 620, 168);
    g.fillStyle = INK; g.font = SER('700', 62); g.textAlign = 'center';
    g.fillText('BMAi News', 830, 250);
    g.font = SANS('400', 20); g.fillStyle = 'rgba(35,33,30,0.7)';
    g.fillText('EDIÇÃO DO DIA', 830, 292);
    g.textAlign = 'left';
    g.fillStyle = INK; g.fillRect(600, 310, 460, 3);

    var sh = g.createLinearGradient(0, 0, 0, H);
    sh.addColorStop(0, 'rgba(20,18,15,0.62)');
    sh.addColorStop(0.16, 'rgba(20,18,15,0.16)');
    sh.addColorStop(0.4, 'rgba(255,255,255,0.3)');
    sh.addColorStop(0.62, 'rgba(20,18,15,0.14)');
    sh.addColorStop(0.88, 'rgba(20,18,15,0.5)');
    sh.addColorStop(1, 'rgba(20,18,15,0.7)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(20,18,15,0.4)'; g.fillRect(0, H * 0.9, W, 4);
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(0, H * 0.9 + 4, W, 2);
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
     movimento, pra tela estreita e pra quem não tem WebGL. */
  function desenhar2d(canvas, pagina) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    var r = Math.min((w * 0.72) / pagina.width, (h * 0.86) / pagina.height);
    var dw = pagina.width * r, dh = pagina.height * r;
    var x = (w - dw) / 2, y = (h - dh) / 2;
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.55)';
    g.shadowBlur = 40; g.shadowOffsetY = 18;
    g.drawImage(pagina, x, y, dw, dh);
    g.restore();
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
    // numa caixa de ~440px ao lado do texto, então a câmera vem pra frente:
    // a 9.4 a folha ficava do tamanho de um selo no meio de muito vazio.
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.6);

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
        side: THREE.DoubleSide, bumpMap: mapa, bumpScale: 0.006,
      }));
    }

    var texPagina = new THREE.CanvasTexture(pagina);
    texPagina.anisotropy = 16;
    var folhaMalha = lamina(3.0, 4.02, texPagina);
    folhaMalha.castShadow = true; folhaMalha.receiveShadow = true;
    por(folhaMalha, [-0.1, 0.05, 0.4], [-0.05, -0.18, -0.05], 1.0);

    // Uma textura de rolo só, reaproveitada como mapa e como relevo nos dois
    // rolos. O comp gerava quatro canvas de 2048x512 pra isso.
    var texRolo = new THREE.CanvasTexture(rolo(trecho));
    texRolo.anisotropy = 16;
    var texTopo = new THREE.CanvasTexture(espiral());
    var lado = new THREE.MeshStandardMaterial({ map: texRolo, roughness: 0.92, bumpMap: texRolo, bumpScale: 0.004 });
    var tampa = new THREE.MeshStandardMaterial({ map: texTopo, roughness: 0.95 });
    function cilindro(len, rad) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.97, len, 64, 1, false), [lado, tampa, tampa]);
      m.rotation.z = Math.PI / 2;
      m.castShadow = true;
      return m;
    }
    por(cilindro(3.3, 0.29), [-2.9, -1.9, 0.7], [0.08, 0.18, 0.36], 1.0);
    por(cilindro(2.9, 0.25), [3.0, 1.7, -0.5], [-0.08, -0.2, -0.52], 0.96);

    var chave = new THREE.DirectionalLight(0xfff1e2, 2.0);
    chave.position.set(4, 7, 8); chave.castShadow = true;
    chave.shadow.mapSize.set(1024, 1024);
    chave.shadow.camera.left = -8; chave.shadow.camera.right = 8;
    chave.shadow.camera.top = 8; chave.shadow.camera.bottom = -8;
    cena.add(chave);
    var recorte = new THREE.PointLight(0xff6a12, 1.1, 30);   // o laranja da marca
    recorte.position.set(-6, -3, 3); cena.add(recorte);
    var rebote = new THREE.PointLight(0x8fb6e6, 0.55, 30);
    rebote.position.set(-3, 4, -5); cena.add(rebote);
    cena.add(new THREE.HemisphereLight(0x9fb4c9, 0x1a2a3c, 0.75));

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
      var materia = {
        title: topo.title || '',
        deck: topo.summary || '',
        source: topo.source || '',
        eixo: topo.eixo || '',
        // O corpo são os resumos das OUTRAS matérias do dia. Texto real,
        // da mesma edição que a página mostra abaixo.
        corpo: lista.slice(1).map(function (i) { return i.summary || ''; })
                    .filter(Boolean).join('  '),
      };
      if (!materia.title) throw new Error('sem manchete');

      return carregarFoto(topo.image ? API + topo.image : null).then(function (foto) {
        var pagina = folha(materia, foto);
        var trecho = (materia.deck || materia.title).toLowerCase() + ' ';

        if (REDUZIR || ESTREITO) { desenhar2d(canvas, pagina); return; }
        return carregarThree()
          .then(function () {
            if (!montar3d(canvas, pagina, trecho)) desenhar2d(canvas, pagina);
          })
          .catch(function () { desenhar2d(canvas, pagina); });
      });
    })
    .catch(function () {
      // Sem edição não se desenha jornal: seria manchete inventada na
      // abertura de um blog que promete o contrário.
      marcaSozinha(canvas);
    });
})();
