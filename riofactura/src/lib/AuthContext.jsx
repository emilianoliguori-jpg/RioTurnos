// Contexto de autenticacion. Cada usuario logueado administra UNA empresa
// emisora, cuyos datos viven en empresas/{uid}. Soporta Google y email/clave.

import { createContext, useContext, useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u)
      setCargando(false)
    })
  }, [])

  const valor = {
    usuario,
    cargando,
    loginGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
    loginEmail: (email, pass) => signInWithEmailAndPassword(auth, email, pass),
    registrarEmail: (email, pass) =>
      createUserWithEmailAndPassword(auth, email, pass),
    logout: () => signOut(auth),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
