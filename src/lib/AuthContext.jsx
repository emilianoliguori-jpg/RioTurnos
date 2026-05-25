// Contexto global de autenticación.
// Cualquier componente que necesite saber si hay sesión usa `useAuth()`.
// Mientras Firebase verifica si hay sesión existente (cookie/localStorage),
// `cargando` queda en true. Las páginas protegidas tienen que respetarlo.

import { createContext, useContext, useEffect, useState } from 'react'
import { observarSesion } from '../services/auth'

const AuthContext = createContext({ usuario: null, cargando: true })

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // observarSesion devuelve la función de desuscripción.
    const off = observarSesion((u) => {
      setUsuario(u)
      setCargando(false)
    })
    return off
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
