# Invitación web — Mis 15 de Justina

**Fecha:** 2026-08-25
**Referencia visual:** [agendalafecha.com/quince/esmeraldaagosti](https://agendalafecha.com/quince/esmeraldaagosti/) + 4 imágenes de moodboard (marcos florales acuarela, save-the-date botánico dorado).

## Objetivo

Página de una sola pantalla (scroll vertical), mobile-first, para que los invitados de los 15 de Justina Molinari confirmen asistencia. Se comparte por WhatsApp/Instagram, sin dominio propio.

## Alcance

**Incluye:** portada, cuenta regresiva, datos de la fiesta + link a Google Maps, Instagram, formulario de confirmación (nombre + sí/no), footer.

**Explícitamente fuera:** dress code, música de fondo, playlist, foto de portada, sección de regalo/datos bancarios, fecha límite para confirmar.

## Datos reales

| Campo | Valor |
|---|---|
| Nombre | Justina Molinari |
| Fecha/hora | 17 de noviembre de 2026, 00:00 hs (ARG, UTC-3) — **cae martes según el calendario; no confirmado con la familia si el día de semana es correcto** |
| Lugar | San Lorenzo Este 163, Concordia, Entre Ríos (casa particular) |
| Instagram | [@justinamolinarii](https://www.instagram.com/justinamolinarii/) |

## Arquitectura

Sitio estático sin build: `index.html` + `styles.css` + `main.js`. Sin framework, sin dependencias externas (salvo Google Fonts). Publicado en Vercel sin dominio propio (URL tipo `*.vercel.app`).

**Confirmaciones:** el form hace `fetch` (modo `no-cors`) a un Google Apps Script Web App publicado desde la cuenta del usuario, que hace `appendRow` en una Google Sheet. Sin base de datos, sin login para la familia — la planilla de Sheets es el panel de administración.

**Resiliencia del formulario:**
- Si `SCRIPT_URL` no está configurada aún, o el `fetch` falla, se guarda la respuesta en `localStorage` y se muestra un link de respaldo a Instagram para que el invitado avise igual.
- Doble envío evitado vía `localStorage`: si ya confirmó en ese navegador, ve directamente la pantalla de agradecimiento con opción "Corregir mi respuesta".
- Validación inline: nombre ≥ 3 caracteres, debe elegir Sí/No. Sin esas condiciones no se envía.

**Animaciones:** reveal-on-scroll vía `IntersectionObserver` (fade + translateY, con `prefers-reduced-motion` respetado). Cuenta regresiva actualizada cada segundo con `setInterval`, calculando contra `PARTY_DATE` fija en el código.

**Estética:** paleta crema/oliva/rosa-antiguo/dorado. Tipografía `Cormorant Garamond` (serif, cuerpo y títulos en mayúsculas trackeadas) + `Great Vibes` (script, para el nombre). Las dos imágenes de flores acuarela del moodboard se usan como arte de fondo: una como marco completo de portada (`assets/frame.jpg`), otra como decoración lateral en las secciones de fiesta y confirmación (`assets/side.jpg`), enmascarada con gradiente para no tapar texto.

## Componentes / secciones (en orden)

1. **Portada** — "mis 15 años", nombre en script, marco floral de fondo.
2. **Cuenta regresiva** — días/horas/min/seg; al llegar a cero muestra "¡Es hoy!".
3. **La fiesta** — fecha, hora, dirección, botón "Cómo llegar" (Google Maps con la dirección pre-cargada).
4. **Instagram** — pedido de etiquetar fotos, link al perfil.
5. **Confirmación** — nombre + botones Sí/No + enviar; pantalla de agradecimiento distinta según la respuesta.
6. **Footer** — nombre + fecha, cierre visual.

## Testing / verificación manual

No hay test automatizado (sitio estático sin lógica de negocio compleja). Verificación manual antes de compartir el link, documentada en `README.md`:
- Confirmación real de prueba llega a la Google Sheet.
- Página se ve y funciona abierta desde un celular (no solo desde la compu).
- Botón de mapa abre la dirección correcta.
- Revisar con la familia si el día de semana del 17/11/2026 es el correcto (el calendario lo marca martes).

## Decisión pendiente del usuario

El día de la semana del 17 de noviembre de 2026 (martes según calendario) no fue confirmado explícitamente contra "18 de noviembre, 12 de la noche" mencionado originalmente. Se usó 17/11 00:00 por instrucción directa del usuario, pero se dejó marcado en el README para que lo verifique con Justina antes de publicar.
