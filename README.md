# Mis 15 · Justina — página de invitación

Página de una sola pantalla (scroll), pensada para abrirse desde el celu vía WhatsApp.
HTML + CSS + JS puro, sin frameworks ni build. Se publica gratis en Vercel.

## Estructura del proyecto

```
index.html          página completa (portada, cuenta regresiva, fiesta, instagram, playlist, regalo, confirmación)
styles.css           estilos
main.js               cuenta regresiva, animaciones al scrollear, lógica de los formularios
assets/
  frame.jpg           marco floral (portada)
  side.jpg             floral lateral (decoración de secciones)
apps-script/
  Code.gs              guarda confirmaciones y canciones sugeridas en una Google Sheet,
                       y manda un mail de aviso por cada confirmación
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

El script crea dos pestañas en la planilla: **RSVP** (confirmaciones) y **Playlist** (canciones sugeridas), cada una la primera vez que reciba un dato de ese tipo.

En el editor de Apps Script, seleccioná `testDoPostRsvp` en el desplegable de arriba y tocá **Ejecutar** (▶). Repetí con `testDoPostPlaylist`. Volvé a la planilla: deberían aparecer las dos pestañas, cada una con una fila de prueba. Si aparecen, anda bien. Borrá esas filas de prueba antes de compartir la página.

### Conectar la página con el script

Abrí [`main.js`](main.js) y en la primera línea de configuración pegá la URL:

```js
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

Guardá el archivo. Sin este paso, la página igual funciona: guarda la respuesta en el celu del invitado y le ofrece el link de Instagram como respaldo, pero no queda registrada en la planilla.

### La playlist de Spotify

La sección Playlist tiene un botón que abre la playlist colaborativa "Mis xv":

```
https://open.spotify.com/playlist/1NlDhIEXqkhkSVStP8xsGc?pt=8c5abceeab34783efa9cf8d82aa973ec
```

Los invitados agregan sus temas ellos mismos desde Spotify — no hay nada que configurar del lado del código.

**El `?pt=...` no es opcional.** Es el token de invitación que suma a la persona como colaboradora de la playlist. Sin esa parte, el link abre la playlist pero en modo lectura: la ven, no pueden agregar nada. Sale de la app de Spotify: playlist → los tres puntos (⋯) → **Invitar colaboradores** → copiar link. Del link que da Spotify se conserva `pt`; el resto (`si`, `utm_source`, `pi`) es tracking y se descarta.

Dos cosas para tener en cuenta:

- **Cualquiera con el link puede editar**, no solo agregar: también puede borrar temas de otros. Como el link está en una página pública, conviene que Justina le eche un ojo a la playlist cada tanto.
- Si Spotify regenera el link de invitación (pasa si alguien toca "restablecer link" en la app), el `pt` viejo deja de andar y hay que actualizar el `href` en `index.html`.

Para quien no tenga Spotify, la sección tiene un "No tengo Spotify" plegable con un campo de texto: esas sugerencias caen en la pestaña **Playlist** de la Google Sheet y las cargás a mano cuando quieras.

Si cambiás de playlist, actualizá el link en [`index.html`](index.html) → sección `#playlist` (el `href` del botón "Sumá tu tema").

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
- [ ] **Alguien que no seas vos** abrió el botón "Sumá tu tema" desde su celu y logró agregar una canción. Es la única forma de saber que el token de colaborador anda — probándolo desde otra cuenta, no desde la tuya (vos ya sos la dueña de la playlist, a vos te va a funcionar igual).

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Fecha/hora de la fiesta | `main.js` → `PARTY_DATE`. `index.html` → sección `#fiesta`. |
| Dirección del salón | `index.html` → sección `#fiesta` (texto y el link de `href` con la búsqueda de Google Maps). |
| Usuario de Instagram | `index.html` → sección `#instagram`, dos lugares (texto visible y `href`). |
| Colores | `styles.css` → variables al principio (`--cream`, `--rose`, `--olive`, `--gold`). |
| Link de WhatsApp/Instagram de respaldo del form | `main.js` → `WHATSAPP_FALLBACK`. |
| Playlist de Spotify | `index.html` → sección `#playlist`, `href` del botón "Sumá tu tema". |

## Cómo ver las confirmaciones y la playlist

Abrí la Google Sheet que creaste en el paso 1. Pestaña **RSVP**: fecha, nombre, si asiste o no. Pestaña **Playlist**: fecha y canción sugerida. Podés ordenar o filtrar como cualquier planilla.


## Aviso por mail de cada confirmación

Cada vez que alguien confirma, el Apps Script manda un mail a la dirección que
está en la constante `AVISO_EMAIL`, arriba de todo en `apps-script/Code.gs`:

```js
var AVISO_EMAIL = "thiagomolinga@gmail.com";
```

El mail dice quién confirmó, si viene o no, la fecha y cuánta gente confirmó
que viene hasta ese momento.

Detalles a tener en cuenta:

- El mail lo manda la **cuenta de Google que publicó el Apps Script**, no la que
  lo recibe. La primera vez que se implementa, Google pide autorizar el permiso
  de enviar mails — hay que aceptarlo.
- Si ya habías implementado el script antes de este cambio, hay que **volver a
  implementar** (Implementar → Administrar implementaciones → editar → Nueva
  versión) para que tome el código nuevo y vuelva a pedir el permiso de mail.
- Cuenta de Gmail común: hasta 100 mails por día. De sobra para unos 15.
- Si el envío del mail falla, la fila igual queda guardada en la planilla: el
  error se registra en el log de Apps Script y no corta nada.
- Para dejar de recibir avisos, poné `var AVISO_EMAIL = "";` y volvé a implementar.

## Alias para transferencias

El alias que aparece en la sección "Tu regalo" está en dos lugares de
`index.html` y tienen que coincidir:

```html
<span class="alias__value" id="alias-value">Justinamolinari.mp</span>
<button ... data-alias="Justinamolinari.mp">
```

El `data-alias` es el que se copia al portapapeles al tocar el botón.


## Música de fondo

La página reproduce un video de YouTube (solo el audio: el reproductor está
oculto) y muestra un botón de parlante fijo arriba a la derecha para prenderla
y apagarla. La configuración está arriba de todo en `main.js`:

```js
var MUSIC_VIDEO_ID = "p4kVWCSzfK4";
var MUSIC_VOLUME = 30;   // 0 a 100
```

Para cambiar la canción, reemplazá `MUSIC_VIDEO_ID` por el ID del video nuevo
— es lo que va después de `v=` en el link de YouTube. En
`https://www.youtube.com/watch?v=p4kVWCSzfK4&list=...` el ID es `p4kVWCSzfK4`
(lo que sigue al `&` no importa).

### Sobre el arranque automático

**Ningún navegador deja que una página arranque sonido sola.** Chrome, Safari y
Firefox lo bloquean hasta que la persona interactúa con la página. Esto no se
puede evitar desde el código; es una regla del navegador.

La página lo resuelve así:

1. Intenta reproducir apenas carga. En algunos casos el navegador lo permite
   (por ejemplo si la persona ya visitó la página varias veces).
2. Si lo bloquea, el botón del parlante late suavemente y la música arranca
   sola con el primer toque, click, scroll o tecla.
3. En cualquier momento se puede apagar o prender con el botón. La preferencia
   queda guardada en el navegador para la próxima visita.

### Si el video no se puede embeber

Algunos videos tienen la reproducción en otros sitios desactivada por el dueño
del canal. Si pasa eso, el botón del parlante se esconde solo y la página
funciona normal, sin música. Para probar otro video, cambiá `MUSIC_VIDEO_ID`.
