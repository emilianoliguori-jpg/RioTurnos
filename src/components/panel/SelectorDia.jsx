// Selector de día para la agenda: ← anterior, [input date], → siguiente, "Hoy".
// Trabaja con strings "YYYY-MM-DD" para no perder días por zona horaria.

import { parsearFecha, formatearFecha, etiquetaFechaLarga } from '../../lib/fechas'

export default function SelectorDia({ valor, onCambiar }) {
  function moverDias(delta) {
    const d = parsearFecha(valor)
    d.setDate(d.getDate() + delta)
    onCambiar(formatearFecha(d))
  }
  function aHoy() {
    onCambiar(formatearFecha(new Date()))
  }

  const fechaDate = parsearFecha(valor)
  const esHoy = formatearFecha(new Date()) === valor

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => moverDias(-1)}
          aria-label="Día anterior"
          className="rounded-full border border-ink/15 w-9 h-9 text-ink hover:bg-ink/5 inline-flex items-center justify-center"
        >
          ‹
        </button>

        <div className="text-center min-w-0 flex-1">
          <p className="font-serif text-lg sm:text-xl text-ink font-light truncate">
            {etiquetaFechaLarga(fechaDate)}
          </p>
          <input
            type="date"
            value={valor}
            onChange={(e) => e.target.value && onCambiar(e.target.value)}
            className="mt-1 font-sans text-xs text-ink/60 bg-transparent border-0 focus:outline-none cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => moverDias(1)}
          aria-label="Día siguiente"
          className="rounded-full border border-ink/15 w-9 h-9 text-ink hover:bg-ink/5 inline-flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {!esHoy && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={aHoy}
            className="font-sans text-xs text-teal hover:underline"
          >
            Ir a hoy
          </button>
        </div>
      )}
    </div>
  )
}
