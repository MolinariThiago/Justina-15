# Mis 15 · Justina — página de invitación

Página de una sola pantalla (scroll), pensada para abrirse desde el celu vía WhatsApp.
HTML + CSS + JS puro, sin frameworks ni build. Se publica gratis en Vercel.

## Estructura del proyecto

```
index.html          página completa (portada, cuenta regresiva, fiesta, instagram, playlist, confirmación)
styles.css           estilos
main.js               cuenta regresiva, animaciones al scrollear, lógica de los formularios
assets/
  frame.jpg           marco floral (portada)
  side.jpg             floral lateral (decoración de secciones)
apps-script/
  Code.gs              guarda confirmaciones y canciones sugeridas en una Google Sheet
  Spotify.gs           (opcional) agrega las canciones sugeridas a una playlist de Spotify
```

## 1. Publicar el Apps Script (guarda las confirmaciones)

Esto crea la planilla donde vas a ver quién confirmó.

1. Entrá a [sheets.google.com](https://sheets.google.com) con **thiagomolinari731@gmail.com** y creá una hoja nueva. Nombrala, por ejemplo, "RSVP Quince Justina".
2. Arriba, andá a **Extensiones → Apps Script**.
3. Borrá el código de ejemplo que aparece y pegá el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
4. Con el signo **+** junto a "Archivos" (izquierda), creá un archivo de script nuevo llamado `Spotify`, borrá lo que trae y pegá el contenido de [`apps-script/Spotify.gs`](apps-script/Spotify.gs). Esto sirve incluso si todavía no vas a conectar Spotify — no molesta si no lo configurás (ver más abajo).
5. Guardá (ícono de disco o `Ctrl+S`).
6. Arriba a la derecha, botón **Implementar → Nueva implementación**.
7. En "Seleccionar tipo", elegí **Aplicación web** (ícono de engranaje si no aparece la lista).
8. Configurá:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
9. Botón **Implementar**. Te va a pedir autorizar permisos — aceptá (es tu propio script, es seguro).
10. Copiá la **URL de la aplicación web** que te muestra (termina en `/exec`).

### Probar que funciona

El script crea dos pestañas en la planilla: **RSVP** (confirmaciones) y **Playlist** (canciones sugeridas), cada una la primera vez que reciba un dato de ese tipo.

En el editor de Apps Script, seleccioná `testDoPostRsvp` en el desplegable de arriba y tocá **Ejecutar** (▶). Repetí con `testDoPostPlaylist`. Volvé a la planilla: deberían aparecer las dos pestañas, cada una con una fila de prueba. Si aparecen, anda bien. Borrá esas filas de prueba antes de compartir la página.

### Conectar la página con el script

Abrí [`main.js`](main.js) y en la primera línea de configuración pegá la URL:

```js
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Guardá el archivo. Sin este paso, la página igual funciona: guarda la respuesta en el celu del invitado y le ofrece el link de Instagram como respaldo, pero no queda registrada en la planilla.

### Conectar Spotify (opcional)

Cada canción sugerida en la sección Playlist se busca sola en Spotify y se agrega a una playlist tuya. Es opcional — si no hacés esto, las canciones igual quedan anotadas en la pestaña "Playlist" de la Sheet, simplemente no se agregan solas a Spotify. Es un setup de una sola vez, todo con tu propia cuenta (yo no toco tus claves ni tu login):

1. **Creá la playlist** en Spotify (o usá una que ya tengas). Abrí "Compartir → Copiar link del álbum/playlist" y guardá esa URL — la vas a necesitar en el paso 6.
2. Entrá a [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) con tu cuenta de Spotify (la dueña de la playlist) y logueate.
3. **Create app**. Nombre y descripción cualquiera. En **Redirect URI** pegá:
   ```
   https://script.google.com/macros/d/TU_SCRIPT_ID/usercallback
   ```
   Para obtener `TU_SCRIPT_ID`: en el editor de Apps Script, ícono de tuerca ⚙️ **Configuración del proyecto** → copiá el **"ID del proyecto de Apps Script"**.
   Marcá la casilla de acuerdo a los términos → **Save**.
4. Dentro de la app creada, **Settings** → copiá **Client ID** y **Client secret** (botón "View client secret").
5. En el editor de Apps Script: ícono de tuerca ⚙️ **Configuración del proyecto** → sección **Propiedades del script** → **Agregar propiedad del script**. Cargá vos mismo, a mano:
   - `SPOTIFY_CLIENT_ID` = el Client ID del paso 4
   - `SPOTIFY_CLIENT_SECRET` = el Client secret del paso 4
   - `SPOTIFY_PLAYLIST_ID` = la parte del link del paso 1 entre `/playlist/` y el `?`. Ej: en `open.spotify.com/playlist/37i9dQZF1E8`, el ID es `37i9dQZF1E8`.
6. Con el ícono **+** junto a "Servicios" (panel izquierdo) → **Bibliotecas** → pegá este ID de script y **Buscar**:
   ```
   1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
   ```
   Elegí la versión más nueva, nombre `OAuth2` → **Agregar**.
7. Guardá el proyecto. En el desplegable de funciones (arriba, al lado de ▶) elegí `showSpotifyAuthUrl` → **Ejecutar**.
8. Andá a **Ver → Registros** (o `Ctrl+Enter`). Copiá la URL que aparece ahí y abrila en el navegador. Iniciá sesión con la cuenta de Spotify dueña de la playlist y autorizá.
9. Listo. Probá sugiriendo una canción desde la página (o corriendo `testDoPostPlaylist` de nuevo) y fijate que aparezca en la playlist de Spotify a los pocos segundos.

Si en algún momento deja de funcionar, corré `showSpotifyAuthUrl` de nuevo — el mensaje en los Registros te dice si ya está autorizado o si hace falta repetir el login.

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
- [ ] Confirmá con Justina si el **17 de noviembre de 2026 es el día correcto** — cae martes, no miércoles. Si la fecha o el horario cambian, editá `PARTY_DATE` en `main.js` (formato `"2026-11-17T21:30:00-03:00"`) y `index.html` (sección "La fiesta": `.date__side`, `.date__range`, y los `<meta>` del `<head>`).
- [ ] Probá la página en tu celu (no solo en la compu): abrí la URL de Vercel desde WhatsApp.

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Fecha/hora de la fiesta | `main.js` → `PARTY_DATE`. `index.html` → sección `#fiesta`. |
| Dirección del salón | `index.html` → sección `#fiesta` (texto y el link de `href` con la búsqueda de Google Maps). |
| Usuario de Instagram | `index.html` → sección `#instagram`, dos lugares (texto visible y `href`). |
| Colores | `styles.css` → variables al principio (`--cream`, `--rose`, `--olive`, `--gold`). |
| Link de WhatsApp/Instagram de respaldo del form | `main.js` → `WHATSAPP_FALLBACK`. |

## Cómo ver las confirmaciones y la playlist

Abrí la Google Sheet que creaste en el paso 1. Pestaña **RSVP**: fecha, nombre, si asiste o no. Pestaña **Playlist**: fecha y canción sugerida. Podés ordenar o filtrar como cualquier planilla.
