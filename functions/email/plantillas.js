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
