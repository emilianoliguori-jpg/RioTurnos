// Paso 1: elegir servicio.
// Cards estilo editorial — número decorativo italic gigante a la izquierda,
// nombre y duración en columna central, precio italic en cobre/acento a
// la derecha. Stagger reveal al entrar; hover: lift + número se colorea.

import StepHeader from './StepHeader'
import { formatearPrecio } from '../../lib/formato'

export default function Step1Servicio({ pregunta, servicios, onElegir, colorAcento }) {
  return (
    <section>
      <div className="reveal-up"><StepHeader titulo={pregunta} /></div>

      <ul className="space-y-3">
        {servicios.map((s, i) => (
          <li key={s.id} className="reveal-up" style={{ animationDelay: `${0.18 + i * 0.07}s` }}>
            <button
              type="button"
              onClick={() => onElegir(s)}
              className="card-editorial group w-full text-left rounded-3xl bg-white px-5 sm:px-7 py-5 sm:py-6 flex items-center gap-5"
            >
              <span
                className="editorial-num text-[2.75rem] sm:text-5xl text-ink/15 transition-colors duration-300 min-w-[2.2rem] group-hover:text-[var(--accent)]"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-serif text-ink text-lg sm:text-xl leading-tight">
                  {s.nombre}
                </p>
                <p className="font-sans text-ink/45 text-[11px] mt-1.5 tracking-[0.18em] uppercase">
                  {s.duracionMinutos} min
                </p>
              </div>

              <p
                className="font-serif italic text-lg sm:text-xl whitespace-nowrap font-light"
                style={{ color: colorAcento }}
              >
                {formatearPrecio(s.precio)}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
