// Envuelve una ruta del panel. Si no hay sesión, redirige al login.
// Las sesiones ANÓNIMAS (creadas por useGuestSession en /planes o /:slug)
// no cuentan como "estar logueado" para acceder al panel — el panel exige
// una cuenta Google real.

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

  if (!usuario || usuario.isAnonymous) {
    return <Navigate to="/panel/login" replace />
  }

  return children
}
