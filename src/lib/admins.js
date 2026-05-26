// Lista blanca de administradores de Río Tech.
// Solo los UIDs acá pueden entrar a /admin.
// Cuando sumes a alguien, agregalo a este array.

export const ADMINS_UIDS = [
  'MeNAiyeN2lgOZMFmQyJYx2PxEWw2', // Río Tech · hola@riotech.ar
  'V3fmWq47WxYNeEvnjSbTbsLlhXE2', // Emiliano · emilianoliguori@gmail.com
]

export function esAdmin(uid) {
  return !!uid && ADMINS_UIDS.includes(uid)
}

// Alias de pago de Río Tech (usado en la página de planes para que los nuevos
// clientes transfieran la suscripción mensual). Configurable.
export const ALIAS_RIOTECH = 'riotech.suscripciones'

// WhatsApp de Río Tech (para que el dueño avise pagos y consultas).
// Formato wa.me: solo dígitos, con código país (54), 9 para móvil Argentina.
export const WHATSAPP_RIOTECH = '5493413220502'

// Email de contacto / soporte de Río Tech (usado en mailto: del panel).
export const EMAIL_RIOTECH = 'hola@riotech.ar'
