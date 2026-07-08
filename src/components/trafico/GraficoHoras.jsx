// Mini gráfico de barras: vehículos por hora a lo largo del día.
// SVG puro, sin dependencias.

import { distribucionHoraria } from '../../lib/trafico'

export default function GraficoHoras({ vehiculosDia }) {
  const datos = distribucionHoraria(vehiculosDia)
  const max = Math.max(...datos.map((d) => d.vehiculos), 1)

  return (
    <div>
      <div className="flex items-end gap-[3px] h-28">
        {datos.map((d) => {
          const alto = (d.vehiculos / max) * 100
          const esPico = d.hora >= 7 && d.hora <= 9 || d.hora >= 17 && d.hora <= 19
          return (
            <div
              key={d.hora}
              className="flex-1 group relative flex items-end"
              style={{ height: '100%' }}
            >
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(alto, 2)}%`,
                  background: esPico
                    ? 'linear-gradient(to top, #C2410C, #FB923C)'
                    : 'linear-gradient(to top, #0B6E6E, #5EEAD4)',
                  opacity: esPico ? 0.95 : 0.7,
                }}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] text-paper z-10">
                {String(d.hora).padStart(2, '0')}:00 · {d.vehiculos.toLocaleString('es-AR')}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] t-faded font-sans">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  )
}
