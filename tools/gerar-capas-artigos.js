/* ============================================================
   gerar-capas-artigos.js — capa de cada artigo do blog
   ------------------------------------------------------------
   POR QUE ISTO EXISTE. Os cards do índice nasceram sem imagem:
   só o gradiente da marca com o símbolo por cima. Ao lado do
   radar, que hoje tem foto em quase toda matéria, aquilo lia
   como imagem que não carregou.

   POR QUE NÃO É FOTO NEM IA GENERATIVA. A BMAi não tem banco de
   foto dos próprios artigos, e foto de banco de imagem sobre
   "clínica" ou "agência" seria cenário inventado apresentado
   como se fosse da casa. Modelo de imagem resolveria, mas cobra
   por peça e não estava disponível quando isto foi feito.

   O QUE ISTO FAZ. Desenha uma capa por artigo, no mesmo campo
   navy/laranja das capas montadas do radar, então a grade inteira
   lê como uma família só. O que muda de uma pra outra é uma
   constelação de nós e ligações SORTEADA A PARTIR DO SLUG: mesma
   semente, mesmo desenho, sempre. Rodar de novo não troca as
   capas que já estão no ar.

   COMO RODAR (uma vez, quando entrar artigo novo):
     node tools/gerar-capas-artigos.js
   Precisa do sharp, que já está no package.json.
   ============================================================ */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const L = 1200, A = 675;
const RAIZ = path.join(__dirname, "..");
const DESTINO = path.join(RAIZ, "assets", "images", "blog");
const SIMBOLO = path.join(RAIZ, "assets", "images", "simbolo-laranja.svg");

/* Os artigos do índice. Mantido aqui, e não lido do posts.json da API, de
   propósito: este repositório é estático e não depende do serviço pra
   gerar asset. Artigo novo entra nesta lista. */
const ARTIGOS = [
  "por-que-implementar-ia-sem-reestruturar-processos-falha",
  "como-escolher-empresa-de-ia-brasilia",
  "g4-os-alternativa-pme",
  "ia-para-clinicas",
  "ia-para-agencias",
  "ia-brasilia",
];

/* ---------- Sorteio preso ao slug ----------
   Sem semente, cada execução geraria capa diferente pro mesmo artigo e o
   git encheria de ruído. */
function semente(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function sorteador(s) {
  let a = s;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function arte(slug) {
  const r = sorteador(semente(slug));

  // O brilho laranja muda de canto conforme o artigo, senão as seis capas
  // ficam com a mesma iluminação.
  const gx = (0.12 + r() * 0.76).toFixed(3);
  const gy = (0.14 + r() * 0.72).toFixed(3);

  // Constelação: nós espalhados e ligações entre os vizinhos próximos. É o
  // que dá identidade a cada capa sem precisar de foto.
  const n = 13 + Math.floor(r() * 7);
  const nos = [];
  for (let i = 0; i < n; i++) {
    nos.push({ x: 90 + r() * (L - 180), y: 80 + r() * (A - 160), rr: 2.5 + r() * 5.5 });
  }
  let ligacoes = "";
  const LIMIAR = 268;
  for (let i = 0; i < nos.length; i++) {
    for (let j = i + 1; j < nos.length; j++) {
      const d = Math.hypot(nos[i].x - nos[j].x, nos[i].y - nos[j].y);
      if (d > LIMIAR) continue;
      const o = (1 - d / LIMIAR) * 0.34;
      ligacoes += `<line x1="${nos[i].x.toFixed(1)}" y1="${nos[i].y.toFixed(1)}" x2="${nos[j].x.toFixed(1)}" y2="${nos[j].y.toFixed(1)}" stroke="#ede7e1" stroke-opacity="${o.toFixed(3)}" stroke-width="1"/>`;
    }
  }
  const pontos = nos.map(function (p) {
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.rr.toFixed(1)}" fill="#ede7e1" fill-opacity="${(0.18 + r() * 0.30).toFixed(3)}"/>`;
  }).join("");

  // Dois arcos largos atravessando a capa, também sorteados.
  const ax = (r() * L).toFixed(0), ay = (r() * A).toFixed(0);
  const arcos = `<g fill="none" stroke="#ede7e1" stroke-opacity="0.10" stroke-width="1">
      <circle cx="${ax}" cy="${ay}" r="${(260 + r() * 200).toFixed(0)}"/>
      <circle cx="${ax}" cy="${ay}" r="${(420 + r() * 240).toFixed(0)}"/>
    </g>`;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#16283d"/>
      <stop offset="0.55" stop-color="#0d1b2a"/>
      <stop offset="1" stop-color="#081320"/>
    </linearGradient>
    <radialGradient id="q" cx="${gx}" cy="${gy}" r="0.78">
      <stop offset="0" stop-color="#db5500" stop-opacity="0.46"/>
      <stop offset="1" stop-color="#db5500" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${L}" height="${A}" fill="url(#f)"/>
  <rect width="${L}" height="${A}" fill="url(#q)"/>
  ${arcos}
  <g>${ligacoes}</g>
  ${pontos}
</svg>`);
}

(async function () {
  fs.mkdirSync(DESTINO, { recursive: true });
  // O símbolo entra por cima, no mesmo lugar em todas: é a assinatura.
  // O `composite` do sharp NÃO tem opção de opacidade (passar `opacity` ali
  // é silenciosamente ignorado, e a marca sai chapada). Pra ela assinar sem
  // dominar, o alfa é rebaixado no pixel antes de compor.
  const cru = await sharp(SIMBOLO).resize(150, 150, { fit: "inside" })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < cru.data.length; i += 4) cru.data[i] = Math.round(cru.data[i] * 0.42);
  const marca = await sharp(cru.data, {
    raw: { width: cru.info.width, height: cru.info.height, channels: 4 },
  }).png().toBuffer();
  const m = cru.info;

  for (const slug of ARTIGOS) {
    const img = await sharp(arte(slug))
      .composite([{
        input: marca,
        left: Math.round((L - m.width) / 2),
        top: Math.round((A - m.height) / 2),
        blend: "over",
      }])
      .jpeg({ quality: 84, progressive: true })
      .toBuffer();
    const arq = path.join(DESTINO, slug + ".jpg");
    fs.writeFileSync(arq, img);
    console.log((img.length / 1024).toFixed(0).padStart(4) + " KB  " + path.relative(RAIZ, arq));
  }
})();
