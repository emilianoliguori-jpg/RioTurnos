// Cloud Function: trigger onUpdate sobre solicitudes/{id}.
// Detecta la transición de estado a 'aprobada' y manda al dueño un email
// con el link al panel.
//
// Lógica de filtrado (no spam):
//   - Si before.estado === 'aprobada' → ya estaba aprobada, salida (evita
//     re-fire si el admin edita el doc por otra razón).
//   - Si after.estado !== 'aprobada' → no es este caso, salida.
//
// El resto del comportamiento (sin email, Resend rechaza, excepción) es el
// mismo patrón defensivo que el resto de los triggers de email.

import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'

import { getResend, RESEND_API_KEY } from './resend.js'
import { plantillaSuscripcionAprobada } from './plantillas.js'
import { EMAIL_FROM_RIOTECH, EMAIL_REPLY_TO_RIOTECH } from './config.js'

export const enviarSuscripcionAprobada = onDocumentUpdated(
  {
    document: 'solicitudes/{id}',
    region: 'southamerica-east1',
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const { id } = event.params

    try {
      const before = event.data?.before?.data()
      const after = event.data?.after?.data()
      if (!before || !after) {
        logger.warn(`[email aprobada] before/after vacíos (id ${id})`)
        return
      }

      // Sólo nos interesa la transición HACIA 'aprobada'.
      if (before.estado === 'aprobada') return       // ya estaba aprobada
      if (after.estado !== 'aprobada') return        // no se aprobó en este update

      const email = after.email?.trim()
      if (!email) {
        return
      }

      const { subject, html, text } = plantillaSuscripcionAprobada({ solicitud: after })

      const resend = getResend()
      const resultado = await resend.emails.send({
        from: EMAIL_FROM_RIOTECH,
        to: email,
        reply_to: EMAIL_REPLY_TO_RIOTECH,
        subject,
        html,
        text,
      })

      if (resultado.error) {
        logger.error(
          `[email aprobada] Resend rechazó el envío para ${email} (id ${id})`,
          resultado.error
        )
        return
      }

      logger.info(
        `[email aprobada] enviado a ${email} (solicitud ${id}, resend ${resultado.data?.id})`
      )
    } catch (err) {
      logger.error(`[email aprobada] falló envío (id ${id})`, err)
    }
  }
)
