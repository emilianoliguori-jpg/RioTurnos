// Cloud Function callable: solicitarCae
//
// La app (frontend) la invoca cuando emite un comprobante en modo AFIP real.
// Hace WSAA (login) + WSFEv1 (numero + CAE) y devuelve el CAE.
//
// Configuracion (se cargan al desplegar — ver DEPLOY.md):
//   Secretos:   AFIP_CERT  (certificado .crt/.pem)
//               AFIP_KEY   (clave privada .key)
//   Parametros: AFIP_CUIT  (CUIT emisor, ej. 30656586539)
//               AFIP_MODO  ('homologacion' | 'produccion')

const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret, defineString } = require('firebase-functions/params')
const { getToken } = require('./lib/wsaa')
const { solicitarCAE } = require('./lib/wsfe')

const AFIP_CERT = defineSecret('AFIP_CERT')
const AFIP_KEY = defineSecret('AFIP_KEY')
const AFIP_CUIT = defineString('AFIP_CUIT')
const AFIP_MODO = defineString('AFIP_MODO', { default: 'homologacion' })

exports.solicitarCae = onCall(
  { secrets: [AFIP_CERT, AFIP_KEY], region: 'us-central1', cors: true },
  async (req) => {
    // Requiere usuario logueado (Firebase Auth).
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Tenés que iniciar sesión.')
    }

    const comprobante = req.data?.comprobante
    if (!comprobante) {
      throw new HttpsError('invalid-argument', 'Falta el comprobante.')
    }

    const modo = AFIP_MODO.value() || 'homologacion'
    const cuit = AFIP_CUIT.value()
    if (!cuit) {
      throw new HttpsError('failed-precondition', 'Falta configurar AFIP_CUIT.')
    }

    const certPem = AFIP_CERT.value()
    const keyPem = AFIP_KEY.value()
    if (!certPem || !keyPem) {
      throw new HttpsError('failed-precondition', 'Falta el certificado/clave de AFIP.')
    }

    try {
      const auth = await getToken({ servicio: 'wsfe', modo, certPem, keyPem })
      auth.cuit = cuit

      const r = await solicitarCAE({
        auth,
        modo,
        ptoVenta: Number(comprobante.puntoVenta),
        cbteTipo: Number(comprobante.tipoId),
        comprobante,
      })

      return {
        numero: r.numero,
        cae: r.cae,
        caeVencimiento: r.caeVencimiento,
        observaciones: r.observaciones,
        modo,
      }
    } catch (e) {
      throw new HttpsError('internal', e.message || 'Error al solicitar el CAE.')
    }
  }
)
