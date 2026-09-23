/**
 * Métricas de retenção/evasão da landing page — anônimas, sem PII.
 *
 * Observa cada <section id> e mede: quantas sessões ALCANÇAM a seção (evento
 * "enter") e quanto tempo ficam (evento "leave" com o dwell). O app bmai.services
 * (/api/ingest/landing) agrega por seção e deriva o funil (evasão entre seções).
 *
 * Não grava nada que identifique a pessoa: o session_id é um id aleatório de
 * sessão (sessionStorage), não um login. Envio por sendBeacon pra não segurar
 * o unload. Degrada em silêncio se não houver IntersectionObserver/sendBeacon.
 */
(function () {
  "use strict";
  if (!("IntersectionObserver" in window) || !navigator.sendBeacon) return;

  var ENDPOINT = "https://bmai.services/api/ingest/landing";
  var THRESHOLD = 0.15; // fração visível pra contar como "alcançou"

  // ── id de sessão (aleatório, por aba) ──────────────────────────────────────
  var sid;
  try {
    sid = sessionStorage.getItem("bmai_lp_sid");
    if (!sid) {
      sid = (self.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2);
      sessionStorage.setItem("bmai_lp_sid", sid);
    }
  } catch (e) {
    sid = String(Date.now()) + Math.random().toString(36).slice(2);
  }

  var buffer = [];
  var abertos = {}; // section -> timestamp de entrada
  var ordemDe = {}; // section id -> índice no DOM (ordem da página)

  function scrollPct() {
    var h = document.documentElement;
    var max = (document.body.scrollHeight || h.scrollHeight) - window.innerHeight;
    if (max <= 0) return 0;
    var p = Math.round((window.scrollY / max) * 100);
    return p < 0 ? 0 : p > 100 ? 100 : p;
  }

  function push(section, tipo, dwell, ordem) {
    buffer.push({
      section: section,
      event_type: tipo,
      dwell_ms: dwell || 0,
      scroll_pct: scrollPct(),
      ordem: ordem || 0,
    });
    if (buffer.length >= 20) flush();
  }

  function flush() {
    if (buffer.length === 0) return;
    var lote = buffer.slice(0, 50);
    buffer = buffer.slice(50);
    var payload = JSON.stringify({
      session_id: sid,
      path: location.pathname || "/",
      referrer: document.referrer || null,
      events: lote,
    });
    try {
      // Blob text/plain: sendBeacon não deixa setar header, e o endpoint
      // tolera text/plain de propósito (é o que o beacon manda).
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "text/plain" }));
    } catch (e) {
      /* nunca quebra a página por causa de métrica */
    }
  }

  var io = new IntersectionObserver(
    function (entries) {
      var agora = Date.now();
      entries.forEach(function (en) {
        var id = en.target.id;
        if (!id) return;
        if (en.isIntersecting) {
          if (!abertos[id]) {
            abertos[id] = agora;
            push(id, "enter", 0, ordemDe[id]);
          }
        } else if (abertos[id]) {
          push(id, "leave", agora - abertos[id], ordemDe[id]);
          delete abertos[id];
        }
      });
    },
    { threshold: THRESHOLD }
  );

  // Fecha as seções abertas (grava o dwell) e manda tudo.
  function fecharEEnviar() {
    var agora = Date.now();
    Object.keys(abertos).forEach(function (id) {
      push(id, "leave", agora - abertos[id], ordemDe[id]);
      delete abertos[id];
    });
    flush();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") fecharEEnviar();
  });
  window.addEventListener("pagehide", fecharEEnviar);

  function start() {
    // querySelectorAll devolve em ordem de documento → o índice É a ordem da página.
    var sections = document.querySelectorAll("section[id]");
    for (var i = 0; i < sections.length; i++) {
      ordemDe[sections[i].id] = i;
      io.observe(sections[i]);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
