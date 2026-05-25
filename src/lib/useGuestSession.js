// Hook: garantiza que haya una sesión anónima activa.
// Solo arranca login anónimo si NO hay sesión previa — nunca pisa la sesión
// Google de un admin/dueño que esté navegando flujos públicos.
//
// Usado por ReservaPage y PlanesPage (flujos públicos sin login).
// Las páginas privadas (login, panel, admin) NO deben usarlo.

import { useEffect } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { auth } from './firebase'
import { useAuth } from './AuthContext'

export function useGuestSession() {
  const { usuario, cargando } = useAuth()

  useEffect(() => {
    if (cargando) return         // esperar a que Firebase resuelva sesión existente
    if (usuario) return          // ya hay sesión (Google o anónima previa)

    signInAnonymously(auth).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[guest] signInAnonymously falló:', err)
    })
  }, [cargando, usuario])
}
