// Card de un plan en la página pública /planes.
// El destacado lleva borde teal, badge "Más elegido", y en desktop sube un
// poco para crear jerarquía visual.

import { formatearPrecio } from '../../lib/formato'

export default function TarjetaPlan({ plan, destacado = false, onSuscribirse }) {
  return (
    <article
      className={`relative rounded-3xl border bg-white p-7 sm:p-8 transition flex flex-col ${
        destacado
          ? 'border-teal sm:shadow-xl sm:-translate-y-2'
          : 'border-ink/10'
      }`}
    >
      {destacado && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-copper text-paper px-3 py-1 text-[10px] uppercase tracking-widest font-sans whitespace-nowrap">
          Más elegido
        </span>
      )}

      <header>
        <h3 className="font-serif text-2xl text-ink font-light">{plan.nombre}</h3>
        <p className="font-sans text-ink/60 text-sm mt-1">{plan.bajada}</p>
      </header>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-serif text-4xl text-ink font-light">
          {formatearPrecio(plan.precio)}
        </span>
        <span className="font-sans text-base text-ink/50">/mes</span>
      </div>

      <ul className="mt-6 space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 font-sans text-sm text-ink">
            <Tilde />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSuscribirse}
        className={`mt-8 rounded-full px-6 py-3 font-sans text-sm font-medium transition ${
          destacado
            ? 'bg-teal text-paper hover:opacity-90'
            : 'bg-ink text-paper hover:opacity-90'
        }`}
      >
        Suscribirme
      </button>
    </article>
  )
}

function Tilde() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B6E6E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
