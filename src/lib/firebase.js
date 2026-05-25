// Inicialización de Firebase para Río Turnos.
// Las credenciales se leen desde variables de entorno (VITE_FIREBASE_*).
// Nunca poner las credenciales reales en este archivo.

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Aviso temprano en dev si faltan variables, para no debugear errores raros despues.
if (import.meta.env.DEV) {
  const faltantes = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (faltantes.length) {
    // eslint-disable-next-line no-console
    console.warn(
      '[firebase] Faltan variables de entorno:',
      faltantes.join(', '),
      '— revisá tu archivo .env (copialo desde .env.example).'
    )
  }
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
