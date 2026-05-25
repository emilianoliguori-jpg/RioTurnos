// Envoltorio de rutas /admin/*.
// Va ANIDADO dentro de RutaProtegida — asume que ya hay usuario logueado y
// chequea si su UID está en la lista blanca de admins (src/lib/admins.js).
// Si no, muestra "No autorizado" en vez de redirigir, para feedback claro.

import { useAuth } from '../lib/AuthContext'
import { esAdmin } from '../lib/admins'

export default function RutaAdmin({ children }) {
  const { usuario } = useAuth()

  if (!usuario || !esAdmin(usuario.uid)) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-sans text-ink/50 text-xs uppercase tracking-widest">
            Río Tech · Admin
          </p>
          <h1 className="font-serif text-3xl text-ink font-light mt-3">
            No autorizado.
          </h1>
          <p className="font-sans text-ink/60 text-sm mt-3">
            Esta sección es solo para administradores de Río Tech.
          </p>
        </div>
      </main>
    )
  }

  return children
}
