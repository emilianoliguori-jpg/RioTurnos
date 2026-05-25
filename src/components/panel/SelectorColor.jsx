// Selector de color de acento del negocio: una grilla de círculos.
// El seleccionado lleva un anillo. Devuelve el hex elegido.

import { COLORES_ACENTO } from '../../lib/coloresAcento'

export default function SelectorColor({ valor, onElegir }) {
  return (
    <div>
      <span className="block font-sans text-ink/60 text-xs uppercase tracking-wider mb-2">
        Color de acento
      </span>
      <ul className="flex flex-wrap gap-3">
        {COLORES_ACENTO.map((c) => {
          const seleccionado = c.hex.toLowerCase() === (valor || '').toLowerCase()
          return (
            <li key={c.hex}>
              <button
                type="button"
                onClick={() => onElegir(c.hex)}
                title={c.nombre}
                aria-label={c.nombre}
                aria-pressed={seleccionado}
                className="relative w-10 h-10 rounded-full transition hover:scale-105"
                style={{
                  backgroundColor: c.hex,
                  boxShadow: seleccionado
                    ? `0 0 0 2px #F5F1EA, 0 0 0 4px ${c.hex}`
                    : 'none',
                }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
