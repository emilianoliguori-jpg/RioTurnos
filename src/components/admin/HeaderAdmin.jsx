// Header del admin de Río Tech. Diferenciado del header del panel del dueño.

import { logout } from '../../services/auth'

export default function HeaderAdmin() {
  async function salir() {
    await logout()
  }

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-copper text-[10px] uppercase tracking-widest">
            Río Tech · Admin
          </p>
          <h1 className="font-serif text-ink text-lg sm:text-xl font-light leading-tight">
            Administración
          </h1>
        </div>

        <button
          type="button"
          onClick={salir}
          className="rounded-full border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:bg-ink/5 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
