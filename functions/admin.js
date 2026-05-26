// Inicializa firebase-admin con credenciales por defecto del runtime de
// Cloud Functions. Una sola vez por instancia.
//
// Importar este módulo por su side-effect en index.js antes de los handlers
// que usan getFirestore() etc.

import { initializeApp, getApps } from 'firebase-admin/app'

if (getApps().length === 0) {
  initializeApp()
}
