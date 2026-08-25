# Mis 15 · Justina — página de invitación

Página de una sola pantalla (scroll), pensada para abrirse desde el celu vía WhatsApp.
HTML + CSS + JS puro, sin frameworks ni build. Se publica gratis en Vercel.

## Estructura del proyecto

```
index.html          página completa (portada, cuenta regresiva, fiesta, instagram, confirmación)
styles.css           estilos
main.js               cuenta regresiva, animaciones al scrollear, lógica del formulario
assets/
  frame.jpg           marco floral (portada)
  side.jpg             floral lateral (decoración de secciones)
apps-script/
  Code.gs              script que guarda las confirmaciones en una Google Sheet
```

## 1. Publicar el Apps Script (guarda las confirmaciones)

Esto crea la planilla donde vas a ver quién confirmó.

1. Entrá a [sheets.google.com](https://sheets.google.com) con **thiagomolinari731@gmail.com** y creá una hoja nueva. Nombrala, por ejemplo, "RSVP Quince Justina".
2. Arriba, andá a **Extensiones → Apps Script**.
3. Borrá el código de ejemplo que aparece y pegá el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
4. Guardá (ícono de disco o `Ctrl+S`).
5. Arriba a la derecha, botón **Implementar → Nueva implementación**.
6. En "Seleccionar tipo", elegí **Aplicación web** (ícono de engranaje si no aparece la lista).
7. Configurá:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
8. Botón **Implementar**. Te va a pedir autorizar permisos — aceptá (es tu propio script, es seguro).
9. Copiá la **URL de la aplicación web** que te muestra (termina en `/exec`).

### Probar que funciona

En el editor de Apps Script, seleccioná la función `testDoPost` en el desplegable de arriba y tocá **Ejecutar** (▶). Volvé a la planilla: debería aparecer una fila con "Prueba Test". Si aparece, anda bien. Borrá esa fila de prueba antes de compartir la página.

### Conectar la página con el script

Abrí [`main.js`](main.js) y en la primera línea de configuración pegá la URL:

```js
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Guardá el archivo. Sin este paso, la página igual funciona: guarda la respuesta en el celu del invitado y le ofrece el link de Instagram como respaldo, pero no queda registrada en la planilla.

## 2. Publicar la página (Vercel, sin dominio propio)

Necesitás tener instalado [Node.js](https://nodejs.org) una sola vez. Después:

```bash
npx vercel --prod
```

Ejecutalo desde esta carpeta. La primera vez te va a pedir:
- Iniciar sesión (con GitHub, GitLab o email — es gratis).
- "Set up and deploy?" → sí.
- Nombre del proyecto → por ejemplo `mis-15-justina`.
- Directorio → `./` (el actual).
- Sin framework detectado → confirmá "Other" / seguir.

Al terminar te da una URL tipo `https://mis-15-justina.vercel.app`. Esa es la que compartís por WhatsApp.

Cada vez que cambies algo (texto, fecha, etc.), volvés a correr `npx vercel --prod` para actualizar.

## 3. Antes de mandar el link — chequeá

- [ ] Pegaste la URL del Apps Script en `main.js` y probaste una confirmación real (mirá que aparezca en la planilla).
- [ ] Borraste la fila "Prueba Test" de la planilla.
- [ ] Confirmá con Justina si el **17 de noviembre de 2026 es el día correcto** — cae martes, no miércoles. Si la fecha cambia, editá `PARTY_DATE` en `main.js` (línea cerca del inicio, formato `"2026-11-17T00:00:00-03:00"`) y `index.html` (secciones "La fiesta" y footer).
- [ ] Probá la página en tu celu (no solo en la compu): abrí la URL de Vercel desde WhatsApp.

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Fecha/hora de la fiesta | `main.js` → `PARTY_DATE`. `index.html` → sección `#fiesta`. |
| Dirección del salón | `index.html` → sección `#fiesta` (texto y el link de `href` con la búsqueda de Google Maps). |
| Usuario de Instagram | `index.html` → sección `#instagram`, dos lugares (texto visible y `href`). |
| Colores | `styles.css` → variables al principio (`--cream`, `--rose`, `--olive`, `--gold`). |
| Link de WhatsApp/Instagram de respaldo del form | `main.js` → `WHATSAPP_FALLBACK`. |

## Cómo ver las confirmaciones

Abrí la Google Sheet que creaste en el paso 1. Cada confirmación agrega una fila: fecha y hora, nombre, si asiste o no. Podés ordenar o filtrar como cualquier planilla.
