// Plantillas HTML + plain-text de los emails que mandamos.
// Cada plantilla es una función pura: recibe los datos, devuelve
// { subject, html, text }.
//
// Reglas de email HTML:
//   - Layout en TABLAS (clientes legacy tipo Outlook/Gmail Web aún las requieren)
//   - Estilos INLINE (muchos clientes strippean <style> bloques)
//   - Fonts del sistema con fallback serif/sans (webfonts inconfiables)
//   - Max-width 600px (legibilidad en desktop) + responsive width: 100%
//   - Incluir versión texto plano (accesibilidad + spam score)

import { nombrePlan } from './planes.js'
import { URL_LOGO_RIOTECH, URL_PANEL } from './config.js'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// "2026-05-26" → "26 de mayo"
function fechaLarga(fechaStr) {
  if (!fechaStr || typeof fechaStr !== 'string') return fechaStr || ''
  const [y, m, d] = fechaStr.split('-').map(Number)
  if (!y || !m || !d) return fechaStr
  return `${d} de ${MESES[m - 1]}`
}

// Escapado mínimo para datos que vienen del cliente y se interpolan en HTML.
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function plantillaConfirmacionTurno({ negocio, turno }) {
  const esPendientePago = turno.estado === 'pendiente_pago'
  const fechaFmt = fechaLarga(turno.fecha)

  const titulo = esPendientePago
    ? 'Tu reserva está tomada'
    : '¡Tu turno está confirmado!'

  const subject = esPendientePago
    ? `Reserva tomada en ${negocio.nombre} · ${fechaFmt} ${turno.hora}`
    : `Turno confirmado en ${negocio.nombre} · ${fechaFmt} ${turno.hora}`

  const mensaje = esPendientePago
    ? `Tomamos tu reserva en ${esc(negocio.nombre)}. Estamos verificando tu pago — en cuanto lo confirmemos te avisamos.`
    : `Te esperamos en ${esc(negocio.nombre)}. Acá van los detalles para que no te los olvides.`

  const html = renderHtml({
    nombreNegocio: esc(negocio.nombre),
    titulo,
    mensaje,
    servicio: esc(turno.servicioNombre),
    profesional: esc(turno.profesionalNombre) || 'A asignar',
    fecha: esc(fechaFmt),
    hora: esc(turno.hora),
    direccion: negocio.direccion ? esc(negocio.direccion) : null,
    cierre: esPendientePago
      ? 'Si todavía no nos mandaste el comprobante, hacelo por WhatsApp así verificamos rápido.'
      : 'Si necesitás cancelar o reprogramar, contactá directo al negocio.',
  })

  const text = renderText({
    nombreNegocio: negocio.nombre,
    titulo,
    mensaje: mensaje.replace(/&#39;/g, "'"),
    servicio: turno.servicioNombre,
    profesional: turno.profesionalNombre || 'A asignar',
    fecha: fechaFmt,
    hora: turno.hora,
    direccion: negocio.direccion || null,
  })

  return { subject, html, text }
}

// HTML editorial simple, una columna, tabla-based.
function renderHtml({ nombreNegocio, titulo, mensaje, servicio, profesional, fecha, hora, direccion, cierre }) {
  const filaDireccion = direccion
    ? `<tr><td style="padding:14px 18px;">
         <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;text-transform:uppercase;letter-spacing:1px;">Dónde</p>
         <p style="margin:6px 0 0;font:15px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419;">${direccion}</p>
       </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#F5F1EA;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F5F1EA;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
        <tr>
          <td style="padding-bottom:16px;">
            <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;text-transform:uppercase;letter-spacing:1.5px;">${nombreNegocio}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-radius:16px;padding:32px 28px;">
            <h1 style="margin:0 0 16px;font:300 28px/1.2 Georgia,'Times New Roman',serif;color:#0F1419;letter-spacing:-0.5px;">
              ${titulo}
            </h1>
            <p style="margin:0 0 24px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419CC;">
              ${mensaje}
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #0F141919;border-radius:12px;">
              <tr><td style="padding:14px 18px;border-bottom:1px solid #0F141919;">
                <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;text-transform:uppercase;letter-spacing:1px;">Servicio</p>
                <p style="margin:6px 0 0;font:15px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419;">${servicio}</p>
              </td></tr>
              <tr><td style="padding:14px 18px;border-bottom:1px solid #0F141919;">
                <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;text-transform:uppercase;letter-spacing:1px;">Atiende</p>
                <p style="margin:6px 0 0;font:15px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419;">${profesional}</p>
              </td></tr>
              <tr><td style="padding:14px 18px;border-bottom:1px solid #0F141919;">
                <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;text-transform:uppercase;letter-spacing:1px;">Día</p>
                <p style="margin:6px 0 0;font:15px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419;">${fecha}</p>
              </td></tr>
              <tr><td style="padding:14px 18px;${filaDireccion ? 'border-bottom:1px solid #0F141919;' : ''}">
                <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;text-transform:uppercase;letter-spacing:1px;">Hora</p>
                <p style="margin:6px 0 0;font:300 22px/1 Georgia,'Times New Roman',serif;color:#0B6E6E;">${hora}</p>
              </td></tr>
              ${filaDireccion}
            </table>

            <p style="margin:24px 0 0;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;">
              ${cierre}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 0 0;">
            <p style="margin:0;font:11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141966;">
              con tecnología de Río Turnos
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function renderText({ nombreNegocio, titulo, mensaje, servicio, profesional, fecha, hora, direccion }) {
  const lineas = [
    nombreNegocio,
    '',
    titulo,
    '',
    mensaje,
    '',
    `Servicio: ${servicio}`,
    `Atiende: ${profesional}`,
    `Día: ${fecha}`,
    `Hora: ${hora}`,
  ]
  if (direccion) lineas.push(`Dónde: ${direccion}`)
  lineas.push('', '---', 'con tecnología de Río Turnos')
  return lineas.join('\n')
}

// ════════════════════════════════════════════════════════════════════════
// EMAILS DE RÍO TECH AL DUEÑO (solicitud recibida, suscripción aprobada).
// Distinta identidad visual: logo Río Tech arriba, footer con datos de la
// empresa. Tono: Río Tech le habla al dueño.
// ════════════════════════════════════════════════════════════════════════

// Chrome compartido (header con logo + body card + footer con info de empresa).
function chromeRioTech({ titulo, contenidoHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#F5F1EA;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F5F1EA;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">

        <!-- Header con logo Río Tech -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <img src="${URL_LOGO_RIOTECH}" alt="Río Tech" height="32" style="display:block;height:32px;width:auto;border:0;outline:none;text-decoration:none;" />
          </td>
        </tr>

        <!-- Body card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;padding:32px 28px;">
            ${contenidoHtml}
          </td>
        </tr>

        <!-- Footer institucional -->
        <tr>
          <td align="center" style="padding:24px 0 0;">
            <p style="margin:0;font:11px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141966;">
              Río Tech · Soluciones digitales · Rosario, Argentina<br/>
              <a href="https://riotech.ar" style="color:#0B6E6E;text-decoration:none;">riotech.ar</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

// ─── Solicitud recibida ───────────────────────────────────────────────

export function plantillaSolicitudRecibida({ solicitud }) {
  const nombre = solicitud.nombreDueno || ''
  const plan = nombrePlan(solicitud.planKey)
  const saludo = nombre ? `Hola ${esc(nombre)},` : 'Hola,'

  const contenidoHtml = `
    <h1 style="margin:0 0 16px;font:300 28px/1.2 Georgia,'Times New Roman',serif;color:#0F1419;letter-spacing:-0.5px;">
      Recibimos tu solicitud
    </h1>
    <p style="margin:0 0 14px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419CC;">
      ${saludo}
    </p>
    <p style="margin:0 0 14px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419CC;">
      Recibimos tu solicitud para el plan
      <strong style="color:#0F1419;">${esc(plan)}</strong>.
      Está en revisión — estamos verificando tu pago.
    </p>
    <p style="margin:0 0 14px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419CC;">
      En menos de <strong style="color:#0F1419;">24 hs hábiles</strong> te activamos
      la cuenta y te avisamos por este mismo medio para que entres a tu panel.
    </p>
    <p style="margin:24px 0 0;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;">
      Si tenés alguna duda mientras tanto, respondé a este mail.
    </p>
  `

  const subject = 'Recibimos tu solicitud — Río Tech'
  const html = chromeRioTech({ titulo: subject, contenidoHtml })

  const text = [
    'Río Tech',
    '',
    'Recibimos tu solicitud',
    '',
    saludo.replace(/&#39;/g, "'"),
    '',
    `Recibimos tu solicitud para el plan ${plan}. Está en revisión — estamos`,
    'verificando tu pago.',
    '',
    'En menos de 24 hs hábiles te activamos la cuenta y te avisamos por este',
    'mismo medio para que entres a tu panel.',
    '',
    'Si tenés alguna duda mientras tanto, respondé a este mail.',
    '',
    '---',
    'Río Tech · Soluciones digitales · Rosario · riotech.ar',
  ].join('\n')

  return { subject, html, text }
}

// ─── Suscripción aprobada ──────────────────────────────────────────────

export function plantillaSuscripcionAprobada({ solicitud }) {
  const nombre = solicitud.nombreDueno || ''
  const negocio = solicitud.nombreNegocio || ''
  const plan = nombrePlan(solicitud.planKey)
  const email = solicitud.email || ''
  const saludo = nombre ? `Hola ${esc(nombre)},` : 'Hola,'

  const contenidoHtml = `
    <h1 style="margin:0 0 16px;font:300 28px/1.2 Georgia,'Times New Roman',serif;color:#0F1419;letter-spacing:-0.5px;">
      ¡Tu cuenta está activa!
    </h1>
    <p style="margin:0 0 14px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419CC;">
      ${saludo}
    </p>
    <p style="margin:0 0 24px;font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F1419CC;">
      Aprobamos tu plan <strong style="color:#0F1419;">${esc(plan)}</strong>
      para <strong style="color:#0F1419;">${esc(negocio)}</strong>.
      Ya podés entrar al panel y empezar a cargar tus servicios, profesionales y horarios.
    </p>

    <!-- CTA button (bulletproof email button pattern) -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" bgcolor="#0B6E6E" style="border-radius:100px;background:#0B6E6E;">
          <a href="${URL_PANEL}"
             style="display:inline-block;padding:14px 32px;font:500 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#F5F1EA;text-decoration:none;border-radius:100px;">
            Entrar al panel →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font:13px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;">
      Logueate con <strong style="color:#0F1419;">${esc(email)}</strong> usando tu cuenta de Google.
      Tu negocio queda vinculado automáticamente.
    </p>
    <p style="margin:8px 0 0;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F141999;">
      Si tenés cualquier consulta, respondé a este mail.
    </p>
  `

  const subject = '¡Tu cuenta de Río Turnos está activa!'
  const html = chromeRioTech({ titulo: subject, contenidoHtml })

  const text = [
    'Río Tech',
    '',
    '¡Tu cuenta está activa!',
    '',
    saludo.replace(/&#39;/g, "'"),
    '',
    `Aprobamos tu plan ${plan} para ${negocio}. Ya podés entrar al panel y`,
    'empezar a cargar tus servicios, profesionales y horarios.',
    '',
    `Entrar al panel: ${URL_PANEL}`,
    '',
    `Logueate con ${email} usando tu cuenta de Google. Tu negocio queda`,
    'vinculado automáticamente.',
    '',
    'Si tenés cualquier consulta, respondé a este mail.',
    '',
    '---',
    'Río Tech · Soluciones digitales · Rosario · riotech.ar',
  ].join('\n')

  return { subject, html, text }
}
