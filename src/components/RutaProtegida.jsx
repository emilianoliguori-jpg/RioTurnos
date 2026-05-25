// Envuelve una ruta del panel. Si no hay sesión, redirige al login.
// Mientras Firebase confirma si hay sesión existente, muestra un loader.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <p className="font-sans text-ink/50 text-sm">Cargando…</p>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/panel/login" replace />
  }

  return children
}
