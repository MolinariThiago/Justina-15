/**
 * Integración con Spotify — agrega automáticamente las canciones
 * sugeridas en la página a una playlist de Spotify.
 *
 * Opcional: si no se configura, el resto del sitio (RSVP + Playlist en
 * la Sheet) sigue funcionando igual. Setup completo en README.md,
 * sección "Conectar Spotify (opcional)".
 *
 * Requiere la librería "OAuth2 for Apps Script":
 *   Editor > Bibliotecas (ícono +) > ID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
 */

function getSpotifyService_() {
  var props = PropertiesService.getScriptProperties();
  var clientId = props.getProperty("SPOTIFY_CLIENT_ID");
  var clientSecret = props.getProperty("SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;

  return OAuth2.createService("spotify")
    .setAuthorizationBaseUrl("https://accounts.spotify.com/authorize")
    .setTokenUrl("https://accounts.spotify.com/api/token")
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setCallbackFunction("authCallback")
    .setPropertyStore(props)
    .setScope("playlist-modify-public playlist-modify-private")
    .setParam("show_dialog", "true");
}

/**
 * Ejecutar UNA VEZ a mano desde el editor (elegir esta función en el
 * desplegable de arriba y tocar ▶). Después ir a Ver > Registros:
 * ahí aparece la URL para autorizar. Abrirla, iniciar sesión con la
 * cuenta de Spotify dueña de la playlist, y autorizar.
 */
function showSpotifyAuthUrl() {
  var service = getSpotifyService_();
  if (!service) {
    Logger.log("Faltan SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET en Script Properties.");
    return;
  }
  if (service.hasAccess()) {
    Logger.log("Ya autorizado.");
  } else {
    Logger.log("Abrí esta URL para autorizar Spotify: " + service.getAuthorizationUrl());
  }
}

// Llamada automáticamente por la librería OAuth2 cuando Spotify redirige
// de vuelta después de autorizar. No se llama a mano.
function authCallback(request) {
  var service = getSpotifyService_();
  var authorized = service.handleCallback(request);
  return HtmlService.createHtmlOutput(
    authorized ? "Spotify autorizado. Ya podés cerrar esta pestaña." : "No se pudo autorizar. Reintentá desde showSpotifyAuthUrl."
  );
}

/**
 * Busca `query` en Spotify y agrega el primer resultado a la playlist
 * configurada en SPOTIFY_PLAYLIST_ID. Silencioso: si Spotify no está
 * configurado o algo falla, no interrumpe el guardado en la Sheet.
 */
function addToSpotifyPlaylist_(query) {
  try {
    var props = PropertiesService.getScriptProperties();
    var playlistId = props.getProperty("SPOTIFY_PLAYLIST_ID");
    if (!playlistId) return;

    var service = getSpotifyService_();
    if (!service || !service.hasAccess()) return;

    var token = service.getAccessToken();

    var searchUrl = "https://api.spotify.com/v1/search?type=track&limit=1&q=" + encodeURIComponent(query);
    var searchRes = UrlFetchApp.fetch(searchUrl, {
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true
    });
    var body = JSON.parse(searchRes.getContentText());
    var track = body.tracks && body.tracks.items && body.tracks.items[0];
    if (!track) {
      Logger.log("Spotify: sin resultados para \"" + query + "\"");
      return;
    }

    var addRes = UrlFetchApp.fetch("https://api.spotify.com/v1/playlists/" + playlistId + "/tracks", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify({ uris: [track.uri] }),
      muteHttpExceptions: true
    });
    if (addRes.getResponseCode() >= 300) {
      Logger.log("Spotify add error: " + addRes.getContentText());
    }
  } catch (err) {
    Logger.log("Spotify error: " + err);
  }
}
