/**
 * Apps Script para la Google Sheet de confirmaciones — Mis 15 de Justina.
 *
 * Qué hace: recibe un POST del formulario de la página y agrega una fila
 * en una de dos pestañas de la misma planilla:
 *   - "RSVP"     → confirmaciones de asistencia (nombre, asiste)
 *   - "Playlist" → canciones sugeridas
 *
 * Además, cada confirmación dispara un mail de aviso a AVISO_EMAIL.
 *
 * Cómo instalarlo: ver README.md, sección "Publicar el Apps Script".
 */

// Dirección que recibe el aviso por cada confirmación.
var AVISO_EMAIL = "thiagomolinga@gmail.com";

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
  notificarRsvp(nombre, asiste, fecha, sheet);
}

/**
 * Manda un mail de aviso por cada confirmación recibida.
 * Si el envío falla (por ejemplo, cuota diaria agotada) lo registra en el log
 * pero no corta la ejecución: la fila ya quedó guardada en la planilla.
 */
function notificarRsvp(nombre, asiste, fecha, sheet) {
  if (!AVISO_EMAIL) return;

  var vienen = contarAsistentes(sheet);
  var asunto = (asiste === "Sí" ? "✅ Confirmó: " : "❌ No viene: ") + nombre + " — 15 de Justina";
  var cuerpo = [
    nombre + (asiste === "Sí" ? " confirmó que viene." : " avisó que no puede ir."),
    "",
    "Nombre:  " + nombre,
    "Viene:   " + asiste,
    "Fecha:   " + Utilities.formatDate(fecha, "America/Argentina/Buenos_Aires", "dd/MM/yyyy HH:mm"),
    "",
    "Total que confirmaron que vienen: " + vienen,
    "",
    "Planilla completa: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join("\n");

  try {
    MailApp.sendEmail(AVISO_EMAIL, asunto, cuerpo);
  } catch (err) {
    Logger.log("No se pudo enviar el aviso por mail: " + err);
  }
}

function contarAsistentes(sheet) {
  var ultima = sheet.getLastRow();
  if (ultima < 2) return 0;
  var valores = sheet.getRange(2, 3, ultima - 1, 1).getValues();
  var total = 0;
  for (var i = 0; i < valores.length; i++) {
    if (valores[i][0] === "Sí") total++;
  }
  return total;
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
