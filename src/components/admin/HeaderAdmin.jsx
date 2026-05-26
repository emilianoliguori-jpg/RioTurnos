// Header del admin de Río Tech. Diferenciado del header del panel del dueño
// por el badge "Admin" en cobre — esta superficie es solo para nosotros.

import { logout } from '../../services/auth'
import LogoRiotech from '../comun/LogoRiotech'

export default function HeaderAdmin() {
  async function salir() {
    await logout()
  }

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <LogoRiotech alto={28} />
          <span className="inline-flex items-center rounded-full bg-copper/15 text-copper px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-sans">
            Admin
          </span>
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
