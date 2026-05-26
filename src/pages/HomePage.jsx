// Landing temporal del root "/".
// Audiencia mixta (dueños curiosos + clientes que llegaron por accidente).
// Por eso protagonista "Río Turnos" (el producto) y al pie marca Río Tech.

import { Link } from 'react-router-dom'
import LogoRiotech from '../components/comun/LogoRiotech'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center max-w-md flex-1 flex flex-col justify-center">
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

      {/* Footer: marca del estudio. Sutil. */}
      <div className="mt-12 flex flex-col items-center gap-2">
        <p className="font-sans text-[10px] uppercase tracking-widest text-ink/40">
          Un producto de
        </p>
        <a
          href="https://riotech.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-70 hover:opacity-100 transition"
        >
          <LogoRiotech alto={22} />
        </a>
      </div>
    </main>
  )
}
