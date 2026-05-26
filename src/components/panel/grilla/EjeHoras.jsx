// Columna izquierda de la grilla: marcas de hora cada 30 min.
// Sticky a la izquierda mientras scrolleás horizontalmente entre profesionales.

import { minutosAHora } from '../../../lib/fechas'

export default function EjeHoras({ minVisible, maxVisible, pxPorMin }) {
  const STEP = 30
  const marcas = []
  // Arrancamos en el primer múltiplo de 30 >= minVisible.
  const inicio = Math.ceil(minVisible / STEP) * STEP
  for (let t = inicio; t <= maxVisible; t += STEP) {
    marcas.push(t)
  }
  const totalMin = maxVisible - minVisible

  return (
    <div
      className="relative w-14 flex-shrink-0 bg-paper border-r border-ink/10 sticky left-0 z-10"
      style={{ height: `${totalMin * pxPorMin + 1}px` }}
    >
      {marcas.map((t) => (
        <div
          key={t}
          className="absolute right-2 -translate-y-1/2 font-sans text-[10px] text-ink/50"
          style={{ top: `${(t - minVisible) * pxPorMin}px` }}
        >
          {minutosAHora(t)}
        </div>
      ))}
    </div>
  )
}
