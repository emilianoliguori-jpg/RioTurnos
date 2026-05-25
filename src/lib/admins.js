// Lista blanca de administradores de Río Tech.
// Solo los UIDs acá pueden entrar a /admin.
// Cuando sumes a alguien, agregalo a este array.

export const ADMINS_UIDS = [
  'V3fmWq47WxYNeEvnjSbTbsLlhXE2', // Emiliano
]

export function esAdmin(uid) {
  return !!uid && ADMINS_UIDS.includes(uid)
}

// Alias de pago de Río Tech (usado en la página de planes para que los nuevos
// clientes transfieran la suscripción mensual). Configurable.
export const ALIAS_RIOTECH = 'riotech.suscripciones'
