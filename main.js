// =====================================================================
// Justina · Mis 15 — lógica de página
// =====================================================================
(function () {
  "use strict";

  // -------------------------------------------------------------
  // CONFIG — pegá acá la URL del Apps Script una vez publicado.
  // Ver README.md, sección "Publicar el Apps Script".
  // -------------------------------------------------------------
  var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPd5ZnhcFVQgIVymXALlHTuWnxh86SKnYaCIf-2ganP2a2rO8sOclWf58iKQGv1mc3Bw/exec";

  var IG_FALLBACK = "https://www.instagram.com/justinamolinarii/";

  // Fiesta: 17 de noviembre de 2026, 21:30, hora Argentina (UTC-3, sin horario de verano).
  var PARTY_DATE = new Date("2026-11-17T21:30:00-03:00");

  var STORAGE_KEY = "quince-justina-rsvp";

  // ---- música de fondo ----
  // Video de YouTube que suena al entrar (solo se usa el audio).
  var MUSIC_VIDEO_ID = "p4kVWCSzfK4";
  var MUSIC_VOLUME = 30;              // 0 a 100
  var MUSIC_KEY = "quince-justina-musica";

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
        fallback.querySelector("a").href = IG_FALLBACK;
      }
    });
  }

  // ---------------- copiar alias de transferencia ----------------
  function initAlias() {
    var btn = document.getElementById("alias-copy");
    var label = document.getElementById("alias-copy-text");
    var status = document.getElementById("alias-status");
    if (!btn) return;

    var alias = btn.getAttribute("data-alias") || "";
    var resetTimer = null;

    function feedback(msg, ok) {
      status.textContent = msg;
      if (ok) {
        btn.classList.add("is-copied");
        label.textContent = "Copiado";
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        btn.classList.remove("is-copied");
        label.textContent = "Copiar alias";
        status.textContent = "";
      }, 2600);
    }

    // Respaldo para navegadores sin Clipboard API o sin contexto seguro.
    function copyLegacy() {
      var ta = document.createElement("textarea");
      ta.value = alias;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    btn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(alias)
          .then(function () { feedback("Alias copiado al portapapeles.", true); })
          .catch(function () {
            feedback(copyLegacy() ? "Alias copiado al portapapeles." : "Copialo a mano: " + alias, true);
          });
        return;
      }
      feedback(copyLegacy() ? "Alias copiado al portapapeles." : "Copialo a mano: " + alias, true);
    });
  }

  // ---------------- música de fondo (YouTube) ----------------
  //
  // Los navegadores no dejan que una página arranque sonido sola: hace falta
  // que la persona toque algo primero. Entonces intentamos reproducir al
  // cargar y, si el navegador lo bloquea, dejamos armado un disparador que
  // arranca la música con la primera interacción (toque, click, scroll o
  // tecla). El botón del parlante permite apagarla y prenderla en cualquier
  // momento, y la preferencia queda guardada para la próxima visita.
  function initMusic() {
    var btn = document.getElementById("music-btn");
    var txt = document.getElementById("music-btn-txt");
    var host = document.querySelector(".yt-host");
    if (!btn || !host) return;

    var player = null;       // instancia del reproductor de YouTube
    var ready = false;       // el reproductor ya se puede comandar
    var quiere = true;       // lo que la persona quiere: música sí o no
    var armado = false;      // hay listeners esperando el primer gesto

    try {
      quiere = localStorage.getItem(MUSIC_KEY) !== "off";
    } catch (e) { /* sin localStorage: arrancamos con música */ }

    function pintar(estado) {
      // estado: "on" | "off" | "pending"
      btn.classList.toggle("is-on", estado === "on");
      btn.classList.toggle("is-pending", estado === "pending");
      btn.setAttribute("aria-pressed", estado === "on" ? "true" : "false");
      if (estado === "on") {
        btn.setAttribute("aria-label", "Silenciar la música");
        txt.textContent = "Música";
      } else if (estado === "pending") {
        btn.setAttribute("aria-label", "Tocá para escuchar la música");
        txt.textContent = "Tocá acá";
      } else {
        btn.setAttribute("aria-label", "Activar la música");
        txt.textContent = "Música";
      }
    }

    function recordar(valor) {
      try { localStorage.setItem(MUSIC_KEY, valor); } catch (e) { /* no pasa nada */ }
    }

    function sonando() {
      if (!ready || !player || !player.getPlayerState) return false;
      var st = player.getPlayerState();
      return st === 1 || st === 3; // PLAYING o BUFFERING
    }

    function reproducir() {
      if (!ready || !player) return;
      try {
        player.unMute();
        player.setVolume(MUSIC_VOLUME);
        player.playVideo();
      } catch (e) { /* el reproductor todavía no responde */ }
    }

    // Si el navegador bloqueó el audio, esperamos el primer gesto de la persona.
    function armarGesto() {
      if (armado) return;
      armado = true;
      pintar("pending");

      var eventos = ["pointerdown", "touchstart", "keydown", "scroll"];

      function arrancar() {
        desarmar();
        if (!quiere) return;
        reproducir();
        pintar("on");
      }

      function desarmar() {
        armado = false;
        eventos.forEach(function (ev) {
          document.removeEventListener(ev, arrancar, true);
        });
      }

      eventos.forEach(function (ev) {
        document.addEventListener(ev, arrancar, { capture: true, once: true, passive: true });
      });
    }

    function onPlayerReady() {
      ready = true;
      try { player.setVolume(MUSIC_VOLUME); } catch (e) { /* ignorar */ }

      if (!quiere) {
        pintar("off");
        return;
      }

      reproducir();
      // Damos un momento para ver si el navegador dejó arrancar el audio.
      setTimeout(function () {
        if (sonando()) pintar("on");
        else armarGesto();
      }, 1400);
    }

    function onPlayerStateChange(e) {
      if (e.data === 0) {          // ENDED → repetir
        reproducir();
      } else if (e.data === 1) {   // PLAYING
        if (quiere) pintar("on");
      } else if (e.data === 2) {   // PAUSED
        if (quiere && !armado) pintar("off");
      }
    }

    // Video no embebible, borrado o restringido: escondemos el botón.
    function onPlayerError() {
      btn.hidden = true;
      host.hidden = true;
    }

    function crearPlayer() {
      player = new window.YT.Player("yt-player", {
        videoId: MUSIC_VIDEO_ID,
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          loop: 1,
          playlist: MUSIC_VIDEO_ID // loop:1 necesita playlist para un solo video
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
    }

    // La API de YouTube llama a esta función global cuando terminó de cargar.
    function cargarApi() {
      if (window.YT && window.YT.Player) {
        crearPlayer();
        return;
      }
      var anterior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof anterior === "function") anterior();
        crearPlayer();
      };
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }

    btn.addEventListener("click", function () {
      quiere = !quiere;
      recordar(quiere ? "on" : "off");

      if (!quiere) {
        if (ready && player) { try { player.pauseVideo(); } catch (e) { /* ignorar */ } }
        pintar("off");
        return;
      }

      // Este click ya es un gesto válido, así que el audio puede arrancar.
      reproducir();
      pintar("on");
    });

    pintar("off"); // hasta que suene de verdad, el botón arranca apagado
    cargarApi();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initCountdown();
    initPlaylist();
    initAlias();
    initForm();
    initMusic();
  });
})();
