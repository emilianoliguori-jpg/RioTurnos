// Configuración del envío de emails.
// Cambiar acá si querés otros from / URLs. Requiere redeploy de functions.
//
// El dominio del from (riotech.ar) tiene que estar verificado en Resend
// (DNS records SPF + DKIM). Si no, los mails se marcan como spam o son
// rechazados.

// ─────────────────────────────────────────────────────────────────────
// Emails AL CLIENTE FINAL (los que ven los que reservan turno).
// Identidad: producto Río Turnos.
// ─────────────────────────────────────────────────────────────────────
export const EMAIL_FROM = 'Río Turnos <turnos@riotech.ar>'
export const EMAIL_REPLY_TO = 'turnos@riotech.ar'

// ─────────────────────────────────────────────────────────────────────
// Emails AL DUEÑO del negocio (solicitudes, activaciones, recordatorios
// de pago a futuro). Identidad: estudio Río Tech.
// ─────────────────────────────────────────────────────────────────────
export const EMAIL_FROM_RIOTECH = 'Río Tech <hola@riotech.ar>'
export const EMAIL_REPLY_TO_RIOTECH = 'hola@riotech.ar'

// ─────────────────────────────────────────────────────────────────────
// URLs públicas referenciadas en los emails (links + imágenes).
// Si migrás a custom domain, cambialo acá.
// ─────────────────────────────────────────────────────────────────────
export const URL_APP = 'https://rio-turnos.web.app'
export const URL_PANEL = `${URL_APP}/panel`
export const URL_LOGO_RIOTECH = `${URL_APP}/logo-riotech-horizontal.png`
