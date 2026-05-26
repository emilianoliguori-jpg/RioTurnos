// Cloud Function: trigger onCreate sobre negocios/{slug}/turnos/{turnoId}.
// Manda un email al cliente cuando se crea un turno nuevo (público o manual).
//
// Reglas de comportamiento:
//   - Si el cliente no dejó email → no hace nada (silencioso, no es error).
//   - Si el estado es 'pendiente_pago' → copy distinto al de 'confirmado'.
//   - Si el envío falla → loguea pero NO re-lanza. El turno ya existe.

import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { getFirestore } from 'firebase-admin/firestore'

import { getResend, RESEND_API_KEY } from './resend.js'
import { plantillaConfirmacionTurno } from './plantillas.js'
import { EMAIL_FROM, EMAIL_REPLY_TO } from './config.js'

export const enviarConfirmacionTurno = onDocumentCreated(
  {
    document: 'negocios/{slug}/turnos/{turnoId}',
    region: 'southamerica-east1',
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const { slug, turnoId } = event.params

    try {
      const turno = event.data?.data()
      if (!turno) {
        logger.warn(`[email] sin data en el evento (turno ${turnoId})`)
        return
      }

      const email = turno.datosCliente?.email?.trim()
      if (!email) {
        // Cliente no dejó email. Salida silenciosa.
        return
      }

      // Necesitamos nombre + dirección del negocio para el cuerpo del mail.
      const negocioSnap = await getFirestore().doc(`negocios/${slug}`).get()
      if (!negocioSnap.exists) {
        logger.warn(`[email] negocio ${slug} no existe — turno ${turnoId} sin envío`)
        return
      }
      const negocio = negocioSnap.data()

      const { subject, html, text } = plantillaConfirmacionTurno({ negocio, turno })

      const resend = getResend()
      const resultado = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        reply_to: EMAIL_REPLY_TO,
        subject,
        html,
        text,
      })

      if (resultado.error) {
        // El SDK de Resend devuelve { data, error } en vez de tirar excepción.
        logger.error(
          `[email] Resend rechazó el envío para ${email} (turno ${turnoId})`,
          resultado.error
        )
        return
      }

      logger.info(
        `[email] enviado a ${email} para turno ${turnoId} de ${slug} (id Resend ${resultado.data?.id})`
      )
    } catch (err) {
      // Catch global: cualquier excepción se loguea pero no rompe.
      // El turno ya está creado; el email es secundario.
      logger.error(`[email] falló envío de confirmación (turno ${turnoId})`, err)
    }
  }
)
