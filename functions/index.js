// Entry point de las Cloud Functions de Río Turnos.
// Firebase Functions lee los `export` de este archivo para saber qué deployar.
//
// Estructura:
//   admin.js                            inicializa firebase-admin (side effect)
//   email/                              todo lo relacionado a envío de emails
//     enviarConfirmacionTurno.js        trigger onCreate sobre turnos
//
// Para sumar una función nueva, creala en su carpeta temática y re-exportala
// acá. No hace falta tocar nada más.

import './admin.js'

export { enviarConfirmacionTurno } from './email/enviarConfirmacionTurno.js'
