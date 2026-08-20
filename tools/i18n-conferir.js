/* ============================================================
   Confere a tradução das subpáginas (blog, artigo, SEO, jurídicas).

   Por que existe: nas subpáginas a CHAVE do dicionário é o próprio texto em
   português. Isso evita cirurgia de `data-i18n` em HTML já indexado, mas cria
   uma armadilha: **mexeu no texto em português, a chave muda e a tradução para
   de casar em silêncio** — a página simplesmente volta a aparecer em português
   naquele trecho, sem erro nenhum no console.

   Este script é a rede. Ele abre cada página num navegador de verdade, usa o
   MESMO código do site (`window.I18NSub.coletar()`) e compara com o que está em
   `i18n/<pagina>.json`:

     1. chaves que a página tem e o dicionário não  -> texto que ficará em PT
     2. chaves que o dicionário tem e a página não  -> tradução órfã (texto velho)
     3. texto visível que nenhum seletor alcança    -> bloco fora do i18n

   Como rodar:
       npm start                (ou qualquer servidor estático na porta 3000)
       node tools/i18n-conferir.js [http://localhost:3000]

   Precisa do playwright:  npm i --no-save playwright
   ============================================================ */
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:8000';
const PAGS = ['blog', 'edicao', 'radar', 'privacidade', 'termos',
  'ia-brasilia', 'ia-para-clinicas', 'ia-para-agencias', 'g4-os-alternativa-pme',
  'como-escolher-empresa-de-ia-brasilia', 'por-que-implementar-ia-sem-reestruturar-processos-falha'];

/* Nomes próprios: iguais em todos os idiomas, não precisam de tradução. */
const DISPENSADAS = new Set(['Instagram', 'LinkedIn', 'WhatsApp', 'BMAi', 'FAQ', 'contato@bmai.space']);

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) {
    console.error('playwright não está instalado. Rode: npm i --no-save playwright');
    process.exit(2);
  }

  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  let problemas = 0;

  for (const pag of PAGS) {
    const arq = path.join('i18n', pag + '.json');
    if (!fs.existsSync(arq)) { console.log(`\n${pag}: SEM DICIONÁRIO (${arq})`); problemas++; continue; }
    const dic = JSON.parse(fs.readFileSync(arq, 'utf8'));

    const p = await ctx.newPage();
    await p.goto(`${BASE}/${pag}.html`, { waitUntil: 'load' });
    await p.waitForTimeout(1500);

    const naPagina = await p.evaluate(() => Object.keys(window.I18NSub.coletar()));
    const noDic = Object.keys(dic.en || {});
    /* Estas so entram no DOM quando o visitante age (aviso do formulario, rotulo
       de "ver menos", erro do radar), entao nao estar na pagina parada e normal. */
    const dinamicas = new Set(fs.existsSync('i18n/_dinamicas.json')
      ? JSON.parse(fs.readFileSync('i18n/_dinamicas.json', 'utf8')) : []);

    const semTraducao = naPagina.filter(k => !noDic.includes(k) && !DISPENSADAS.has(k));
    const orfas = noDic.filter(k => !naPagina.includes(k) && !dinamicas.has(k));

    const solto = await p.evaluate(() => {
      const SEL = window.__SEL_I18N;
      const folhas = new Set();
      document.querySelectorAll(SEL).forEach(el => { if (!el.querySelector(SEL)) folhas.add(el); });
      const fora = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.replace(/\s+/g, ' ').trim();
        if (!t || !/[a-zA-ZÀ-ÿ]/.test(t)) continue;
        let el = n.parentElement, ok = false;
        while (el) {
          if (folhas.has(el) || el.id === 'lang-btn' || el.hasAttribute('data-i18n-off') ||
              el.tagName === 'SCRIPT' || el.tagName === 'STYLE') { ok = true; break; }
          el = el.parentElement;
        }
        if (!ok && n.parentElement.offsetParent !== null) fora.push(t.slice(0, 70));
      }
      return fora;
    });
    const soltoReal = solto.filter(t => !DISPENSADAS.has(t));

    const ruim = semTraducao.length + orfas.length + soltoReal.length;
    problemas += ruim;
    console.log(`\n${pag}: ${ruim ? 'ATENÇÃO' : 'ok'}  (${naPagina.length} blocos, ${noDic.length} no dicionário)`);
    semTraducao.forEach(k => console.log(`   sem tradução: "${k.slice(0, 80)}"`));
    orfas.slice(0, 5).forEach(k => console.log(`   órfã no dicionário: "${k.slice(0, 80)}"`));
    soltoReal.forEach(t => console.log(`   fora do alcance do seletor: "${t}"`));
    await p.close();
  }

  await b.close();
  console.log(problemas
    ? `\n${problemas} ponto(s) pra resolver. Texto sem tradução aparece em português pro visitante.`
    : '\nTudo casado: nenhuma página perdeu tradução.');
  process.exit(problemas ? 1 : 0);
})();
