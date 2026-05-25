// Servicio de autenticación.
// Encapsula la API de Firebase Auth para que el resto de la app no la importe
// directamente — si mañana cambiamos de proveedor, solo se toca este archivo.

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const googleProvider = new GoogleAuthProvider()

// Abre el popup de Google y devuelve el usuario logueado.
// Lanza error si el usuario cierra el popup.
export async function loginConGoogle() {
  const resultado = await signInWithPopup(auth, googleProvider)
  return resultado.user
}

// Cierra la sesión actual.
export async function logout() {
  await signOut(auth)
}

// Observa cambios de sesión. Devuelve la función para desuscribirse.
//   const off = observarSesion(u => ...)
//   ...
//   off()
export function observarSesion(callback) {
  return onAuthStateChanged(auth, callback)
}
