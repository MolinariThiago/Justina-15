/**
 * Apps Script para la Google Sheet de confirmaciones — Mis 15 de Justina.
 *
 * Qué hace: recibe un POST del formulario de la página y agrega una fila
 * en una de dos pestañas de la misma planilla:
 *   - "RSVP"     → confirmaciones de asistencia (nombre, asiste)
 *   - "Playlist" → canciones sugeridas
 *
 * Cómo instalarlo: ver README.md, sección "Publicar el Apps Script".
 */

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter || {};
  }

  if (data.tipo === "playlist") {
    appendPlaylist(data);
  } else {
    appendRsvp(data);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function appendRsvp(data) {
  var sheet = getOrCreateSheet("RSVP", ["Fecha", "Nombre", "Asiste"]);
  var nombre = (data.nombre || "").toString().trim();
  var asiste = data.asiste === "si" ? "Sí" : "No";
  var fecha = data.fecha ? new Date(data.fecha) : new Date();
  sheet.appendRow([fecha, nombre, asiste]);
}

function appendPlaylist(data) {
  var sheet = getOrCreateSheet("Playlist", ["Fecha", "Canción"]);
  var cancion = (data.cancion || "").toString().trim();
  var fecha = data.fecha ? new Date(data.fecha) : new Date();
  sheet.appendRow([fecha, cancion]);
}

// Funciones de prueba: ejecutar desde el editor de Apps Script para
// verificar que escriben en la hoja correcta sin depender de la página web.
function testDoPostRsvp() {
  doPost({ postData: { contents: JSON.stringify({ nombre: "Prueba Test", asiste: "si", fecha: new Date().toISOString() }) } });
}

function testDoPostPlaylist() {
  doPost({ postData: { contents: JSON.stringify({ tipo: "playlist", cancion: "Prueba - Test", fecha: new Date().toISOString() }) } });
}
