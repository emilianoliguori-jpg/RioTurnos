// Landing temporal del root "/".

import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-teal text-5xl sm:text-6xl md:text-7xl font-light tracking-tight">
          Río Turnos
        </h1>
        <p className="font-sans text-ink text-base sm:text-lg mt-4">
          Tecnología que fluye con tu negocio
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            to="/planes"
            className="inline-flex items-center justify-center rounded-full bg-teal text-paper px-6 py-3 font-sans text-sm font-medium hover:opacity-90 transition"
          >
            Ver planes
          </Link>
          <Link
            to="/panel/login"
            className="font-sans text-sm text-ink/60 hover:text-ink underline"
          >
            Soy cliente · entrar al panel
          </Link>
        </div>

        <p className="font-sans text-ink/40 text-xs mt-10">
          ¿Sos cliente del negocio? El link de reservas te lo da el local
          (ej: <code className="text-ink/60">/estudio-bilardo</code>).
        </p>
      </div>
    </main>
  )
}
