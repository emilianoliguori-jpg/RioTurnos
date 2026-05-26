// Configuración del envío de emails de Río Turnos.
// Cambiar acá si querés otro from o reply-to. Requiere redeploy de functions.
//
// IMPORTANTE: el dominio del from (riotech.ar) tiene que estar verificado en
// Resend (DNS records SPF + DKIM). Si no, los mails se marcan como spam o
// son rechazados.

export const EMAIL_FROM = 'Río Turnos <turnos@riotech.ar>'
export const EMAIL_REPLY_TO = 'turnos@riotech.ar'
