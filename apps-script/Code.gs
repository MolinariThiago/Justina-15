/**
 * Apps Script para la Google Sheet de confirmaciones — Mis 15 de Justina.
 *
 * Qué hace: recibe un POST del formulario de la página con { nombre, asiste, fecha }
 * y agrega una fila a la hoja activa.
 *
 * Cómo instalarlo: ver README.md, sección "Publicar el Apps Script".
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Si la hoja está vacía, agrega encabezados.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Fecha", "Nombre", "Asiste"]);
  }

  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter || {};
  }

  var nombre = (data.nombre || "").toString().trim();
  var asiste = data.asiste === "si" ? "Sí" : "No";
  var fecha = data.fecha ? new Date(data.fecha) : new Date();

  sheet.appendRow([fecha, nombre, asiste]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función de prueba: ejecutar desde el editor de Apps Script para
// verificar que escribe en la hoja sin depender de la página web.
function testDoPost() {
  var fake = {
    postData: {
      contents: JSON.stringify({ nombre: "Prueba Test", asiste: "si", fecha: new Date().toISOString() })
    }
  };
  doPost(fake);
}
