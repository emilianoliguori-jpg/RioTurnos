// Estado cuando un usuario logueado todavía no tiene ningún negocio asignado.
// Muestra su uid y email para que se los pase al admin de Río Tech y lo
// vinculen manualmente (mientras no exista alta automática).

import { logout } from '../../services/auth'

export default function SinNegocio({ usuario }) {
  async function copiarUid() {
    try {
      await navigator.clipboard.writeText(usuario.uid)
    } catch {
      // si el navegador no permite, el usuario lo copia a mano.
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12">
      <div className="max-w-md mx-auto text-center">
        <p className="font-sans text-ink/50 text-xs uppercase tracking-widest">
          Río Turnos
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink font-light tracking-tight mt-3">
          Tu cuenta todavía no tiene un negocio asignado.
        </h1>
        <p className="font-sans text-ink/60 text-sm mt-4">
          Contactá a Río Tech para que te vinculen. Pasales este dato:
        </p>

        <dl className="mt-8 rounded-2xl border border-ink/10 bg-white text-left divide-y divide-ink/10">
          <div className="px-5 py-4">
            <dt className="font-sans text-ink/50 text-xs uppercase tracking-wider">
              Email
            </dt>
            <dd className="font-sans text-ink text-sm mt-1 break-all">
              {usuario.email}
            </dd>
          </div>
          <div className="px-5 py-4">
            <dt className="font-sans text-ink/50 text-xs uppercase tracking-wider">
              UID
            </dt>
            <dd className="font-sans text-ink text-sm mt-1 break-all">
              {usuario.uid}
            </dd>
            <button
              type="button"
              onClick={copiarUid}
              className="mt-2 text-xs font-sans text-teal hover:underline"
            >
              Copiar UID
            </button>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => logout()}
          className="mt-8 font-sans text-sm text-ink/60 hover:text-ink underline"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
