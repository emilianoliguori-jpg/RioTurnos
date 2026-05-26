// Cloud Function: trigger onCreate sobre solicitudes/{id}.
// Manda al dueño que mandó la solicitud un email "la recibimos, está en
// revisión, en menos de 24hs te activamos".
//
// Reglas de comportamiento:
//   - Si la solicitud no tiene email → no hace nada (silencioso).
//   - Si Resend rechaza el envío → loguea pero no re-lanza.
//   - Cualquier excepción → loguea y termina OK.

import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'

import { getResend, RESEND_API_KEY } from './resend.js'
import { plantillaSolicitudRecibida } from './plantillas.js'
import { EMAIL_FROM_RIOTECH, EMAIL_REPLY_TO_RIOTECH } from './config.js'

export const enviarSolicitudRecibida = onDocumentCreated(
  {
    document: 'solicitudes/{id}',
    region: 'southamerica-east1',
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const { id } = event.params

    try {
      const solicitud = event.data?.data()
      if (!solicitud) {
        logger.warn(`[email solicitud] sin data en el evento (id ${id})`)
        return
      }

      const email = solicitud.email?.trim()
      if (!email) {
        // Sin email no podemos avisar. No es error.
        return
      }

      const { subject, html, text } = plantillaSolicitudRecibida({ solicitud })

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
          `[email solicitud] Resend rechazó el envío para ${email} (id ${id})`,
          resultado.error
        )
        return
      }

      logger.info(
        `[email solicitud] enviado a ${email} (solicitud ${id}, resend ${resultado.data?.id})`
      )
    } catch (err) {
      logger.error(`[email solicitud] falló envío (id ${id})`, err)
    }
  }
)
