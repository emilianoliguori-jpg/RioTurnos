// Header del panel admin: logo Río Tech + nombre del negocio + cerrar sesión.
//
// JERARQUÍA: Río Tech (la plataforma) a la izquierda discreto; el nombre del
// negocio (contexto activo) protagonista grande en serif.

import { logout } from '../../services/auth'
import LogoRiotech from '../comun/LogoRiotech'

export default function HeaderPanel({ nombreNegocio }) {
  async function salir() {
    await logout()
  }

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <LogoRiotech alto={20} className="opacity-70 mb-1.5" />
          <h1 className="font-serif text-ink text-lg sm:text-xl font-light leading-tight truncate">
            {nombreNegocio || 'Panel'}
          </h1>
        </div>

        <button
          type="button"
          onClick={salir}
          className="rounded-full border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:bg-ink/5 transition whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
