// Inicializacion de Firebase para RioFactura.
// Las credenciales se leen de variables de entorno (VITE_FIREBASE_*).
// Esta app es independiente de Rio Turnos: aunque puede compartir el mismo
// proyecto Firebase, escribe en colecciones propias (empresas/**).

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (import.meta.env.DEV) {
  const faltantes = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (faltantes.length) {
    console.warn(
      '[firebase] Faltan variables de entorno:',
      faltantes.join(', '),
      '— copia .env.example a .env y completalo.'
    )
  }
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
// us-central1: misma region que la Cloud Function solicitarCae.
export const functions = getFunctions(firebaseApp, 'us-central1')
