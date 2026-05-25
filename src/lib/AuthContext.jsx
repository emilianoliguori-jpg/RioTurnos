// Contexto global de autenticación.
// Cualquier componente que necesite saber si hay sesión usa `useAuth()`.
//
// Tres estados:
//   - cargando: mientras Firebase verifica si hay sesión existente (en boot).
//   - cargandoVinculacion: mientras corre la vinculación automática
//     usuario↔negocio post-login (ver services/usuarios.js → vincularPorEmail).
//     Las pantallas que dependen del doc usuarios/{uid} (ej: PanelPage)
//     tienen que ESPERAR este flag antes de decidir "sin negocio asignado".

import { createContext, useContext, useEffect, useState } from 'react'
import { observarSesion } from '../services/auth'
import { vincularPorEmail } from '../services/usuarios'

const AuthContext = createContext({
  usuario: null,
  cargando: true,
  cargandoVinculacion: false,
})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [cargandoVinculacion, setCargandoVinculacion] = useState(false)

  useEffect(() => {
    const off = observarSesion(async (u) => {
      setUsuario(u)
      setCargando(false)

      if (u?.email) {
        setCargandoVinculacion(true)
        try {
          await vincularPorEmail(u.uid, u.email)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[auth] vincularPorEmail falló:', err)
        } finally {
          setCargandoVinculacion(false)
        }
      }
    })
    return off
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, cargando, cargandoVinculacion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
