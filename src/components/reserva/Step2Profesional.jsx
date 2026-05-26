// Paso 2: elegir profesional.
// Opción "cualquiera" arriba destacada con asterisco. Cada profesional como
// card con avatar circular en color de acento y nombre en serif.

import StepHeader from './StepHeader'

export default function Step2Profesional({
  pregunta,
  profesionales,
  onElegir,
  colorAcento,
  etiquetaCualquiera,
}) {
  return (
    <section>
      <div className="reveal-up"><StepHeader titulo={pregunta} /></div>

      <ul className="space-y-3">
        {/* "Cualquiera" — destacada con borde dashed */}
        <li className="reveal-up delay-2">
          <button
            type="button"
            onClick={() => onElegir({ id: null, nombre: etiquetaCualquiera })}
            className="card-editorial group w-full text-left rounded-3xl t-surface border-2 border-dashed t-border-s px-5 sm:px-7 py-5 flex items-center gap-5"
          >
            <span
              className="editorial-num t-soft text-4xl sm:text-5xl transition-colors duration-300 group-hover:text-[var(--accent)] min-w-[2.2rem]"
              aria-hidden="true"
            >
              ✦
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-serif t-strong text-lg sm:text-xl leading-tight">
                {etiquetaCualquiera}
              </p>
              <p className="font-sans t-soft text-xs mt-1.5 tracking-[0.15em] uppercase">
                Quien tenga lugar primero
              </p>
            </div>
          </button>
        </li>

        {profesionales.map((p, i) => (
          <li
            key={p.id}
            className="reveal-up"
            style={{ animationDelay: `${0.3 + i * 0.07}s` }}
          >
            <button
              type="button"
              onClick={() => onElegir(p)}
              className="card-editorial group w-full text-left rounded-3xl t-surface border t-border px-5 sm:px-7 py-5 flex items-center gap-5"
            >
              <span
                className="inline-flex items-center justify-center w-14 h-14 rounded-full font-serif text-2xl font-light text-paper flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: colorAcento }}
              >
                {(p.nombre || '?').charAt(0)}
              </span>
              <p className="font-serif t-strong text-xl sm:text-2xl leading-tight">
                {p.nombre}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
