// Paso 1: elegir servicio.
// Cards en surface (translúcida en oscuro, blanca en claro). Número decorativo
// italic a la izquierda; precio italic en color de acento a la derecha.

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
              className="card-editorial group w-full text-left rounded-3xl t-surface border t-border px-5 sm:px-7 py-5 sm:py-6 flex items-center gap-5"
            >
              <span
                className="editorial-num t-faded text-lg sm:text-xl opacity-50 min-w-[1.5rem] tabular-nums"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-serif t-strong text-lg sm:text-xl leading-tight lowercase first-letter:uppercase">
                  {s.nombre}
                </p>
                <p className="font-sans t-soft text-xs mt-1.5 tracking-[0.18em] uppercase">
                  {s.duracionMinutos} min
                </p>
              </div>

              <p
                className="font-serif italic text-lg sm:text-xl whitespace-nowrap font-medium tracking-tight"
                style={{ color: 'var(--color-copper-light)' }}
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
