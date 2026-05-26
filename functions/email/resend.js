// Cliente Resend. La API key vive como Secret de Firebase (cifrada at rest).
// Cualquier función que envíe mails declara `secrets: [RESEND_API_KEY]` en
// sus opciones — sino no tiene permiso de leer la secret en runtime.
//
// Para setear/cambiar la key:
//   firebase functions:secrets:set RESEND_API_KEY
//   firebase deploy --only functions

import { Resend } from 'resend'
import { defineSecret } from 'firebase-functions/params'

export const RESEND_API_KEY = defineSecret('RESEND_API_KEY')

// Cache del cliente por instancia. Cold start crea uno, invocaciones warm
// reusan el mismo. Resend SDK es liviano pero igual evitamos re-instanciar.
let cliente = null

export function getResend() {
  if (!cliente) {
    cliente = new Resend(RESEND_API_KEY.value())
  }
  return cliente
}
