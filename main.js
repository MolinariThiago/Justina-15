// =====================================================================
// Justina · Mis 15 — lógica de página
// =====================================================================
(function () {
  "use strict";

  // -------------------------------------------------------------
  // CONFIG — pegá acá la URL del Apps Script una vez publicado.
  // Ver README.md, sección "Publicar el Apps Script".
  // -------------------------------------------------------------
  var SCRIPT_URL = "PEGAR_URL_DEL_APPS_SCRIPT_ACA";

  var WHATSAPP_FALLBACK = "https://ig.me/m/justinamolinarii";

  // Fiesta: 17 de noviembre de 2026, 00:00, hora Argentina (UTC-3, sin horario de verano).
  var PARTY_DATE = new Date("2026-11-17T00:00:00-03:00");

  var STORAGE_KEY = "quince-justina-rsvp";

  // ---------------- reveal on scroll ----------------
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------------- cuenta regresiva ----------------
  function initCountdown() {
    var elD = document.getElementById("c-d");
    var elH = document.getElementById("c-h");
    var elM = document.getElementById("c-m");
    var elS = document.getElementById("c-s");
    var wrap = document.getElementById("count");
    var now = document.getElementById("count-now");

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      var diff = PARTY_DATE.getTime() - Date.now();
      if (diff <= 0) {
        wrap.hidden = true;
        now.hidden = false;
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;

      elD.textContent = d;
      elH.textContent = pad(h);
      elM.textContent = pad(m);
      elS.textContent = pad(s);
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  // ---------------- formulario playlist ----------------
  function initPlaylist() {
    var form = document.getElementById("playlist-form");
    var cancion = document.getElementById("cancion");
    var errCancion = document.getElementById("err-cancion");
    var submitBtn = document.getElementById("playlist-submit");
    var status = document.getElementById("playlist-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errCancion.hidden = true;
      cancion.classList.remove("is-invalid");
      status.textContent = "";

      var val = cancion.value.trim();
      if (val.length < 2) {
        errCancion.textContent = "Escribí un artista o tema.";
        errCancion.hidden = false;
        cancion.classList.add("is-invalid");
        return;
      }

      var payload = { tipo: "playlist", cancion: val, fecha: new Date().toISOString() };

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando…";

      var noScriptConfigured = !SCRIPT_URL || SCRIPT_URL.indexOf("PEGAR_URL") === 0;

      function done(ok) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sugerir";
        if (ok) {
          cancion.value = "";
          status.textContent = "¡Sumada a la lista!";
        } else {
          status.textContent = "No se pudo guardar. Escribile a Justina por Instagram con el tema.";
        }
      }

      if (noScriptConfigured) {
        done(false);
        return;
      }

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      })
        .then(function () { done(true); })
        .catch(function () { done(false); });
    });
  }

  // ---------------- formulario RSVP ----------------
  function initForm() {
    var form = document.getElementById("rsvp-form");
    var nombre = document.getElementById("nombre");
    var errNombre = document.getElementById("err-nombre");
    var errAsiste = document.getElementById("err-asiste");
    var choices = form.querySelectorAll(".choice__btn");
    var submitBtn = document.getElementById("submit");
    var status = document.getElementById("status");
    var fallback = document.getElementById("fallback");
    var doneBox = document.getElementById("done");
    var doneTitle = document.getElementById("done-title");
    var doneText = document.getElementById("done-text");
    var editBtn = document.getElementById("edit");

    var asiste = null; // "si" | "no"

    function clearErrors() {
      errNombre.hidden = true;
      errAsiste.hidden = true;
      nombre.classList.remove("is-invalid");
      choices.forEach(function (b) { b.classList.remove("is-invalid"); });
    }

    choices.forEach(function (btn) {
      btn.addEventListener("click", function () {
        asiste = btn.getAttribute("data-value");
        choices.forEach(function (b) {
          b.setAttribute("aria-checked", b === btn ? "true" : "false");
        });
        errAsiste.hidden = true;
        choices.forEach(function (b) { b.classList.remove("is-invalid"); });
      });
    });

    function showDone(saved) {
      form.hidden = true;
      doneBox.hidden = false;
      if (saved.asiste === "si") {
        doneTitle.textContent = "¡Te espero!";
        doneText.textContent = "Gracias por confirmar, " + saved.nombre + ". Nos vemos el 17/11.";
      } else {
        doneTitle.textContent = "Qué lástima";
        doneText.textContent = "Gracias por avisar, " + saved.nombre + ". Te vamos a extrañar.";
      }
    }

    function loadSaved() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    function saveLocal(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) { /* localStorage no disponible: seguimos sin memoria local */ }
    }

    var saved = loadSaved();
    if (saved) showDone(saved);

    editBtn.addEventListener("click", function () {
      doneBox.hidden = true;
      form.hidden = false;
      status.textContent = "";
      fallback.hidden = true;
      if (saved) {
        nombre.value = saved.nombre || "";
        if (saved.asiste) {
          asiste = saved.asiste;
          choices.forEach(function (b) {
            b.setAttribute("aria-checked", b.getAttribute("data-value") === asiste ? "true" : "false");
          });
        }
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();
      fallback.hidden = true;

      var nombreVal = nombre.value.trim();
      var ok = true;

      if (nombreVal.length < 3) {
        errNombre.textContent = "Escribí tu nombre completo.";
        errNombre.hidden = false;
        nombre.classList.add("is-invalid");
        ok = false;
      }
      if (!asiste) {
        errAsiste.textContent = "Elegí una opción.";
        errAsiste.hidden = false;
        choices.forEach(function (b) { b.classList.add("is-invalid"); });
        ok = false;
      }
      if (!ok) return;

      var payload = { nombre: nombreVal, asiste: asiste, fecha: new Date().toISOString() };

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando…";
      status.textContent = "";

      var noScriptConfigured = !SCRIPT_URL || SCRIPT_URL.indexOf("PEGAR_URL") === 0;

      if (noScriptConfigured) {
        // Todavía no se configuró el Apps Script: guardamos local y avisamos por WhatsApp/IG.
        saveLocal(payload);
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar";
        showFallback();
        return;
      }

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script Web Apps no siempre devuelven CORS; asumimos éxito si no tira excepción.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      })
        .then(function () {
          saveLocal(payload);
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar";
          showDone(payload);
          saved = payload;
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar";
          showFallback();
        });

      function showFallback() {
        status.textContent = "";
        fallback.hidden = false;
        fallback.querySelector("a").href = WHATSAPP_FALLBACK;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initCountdown();
    initPlaylist();
    initForm();
  });
})();
