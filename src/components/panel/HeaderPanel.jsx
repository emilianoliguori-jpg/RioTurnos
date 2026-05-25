// Header del panel admin: marca + nombre del negocio + cerrar sesión.

import { logout } from '../../services/auth'

export default function HeaderPanel({ nombreNegocio }) {
  async function salir() {
    await logout()
    // La ruta protegida detecta que ya no hay usuario y redirige solo.
  }

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-ink/50 text-[10px] uppercase tracking-widest">
            Río Turnos
          </p>
          <h1 className="font-serif text-ink text-lg sm:text-xl font-light leading-tight">
            {nombreNegocio || 'Panel'}
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
